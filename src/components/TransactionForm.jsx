import * as R from "ramda";
import * as RU from '../ramda-utils';
import React, { Component } from 'react';
import { createTitle } from '../utils';
import MovementInputs from './MovementInputs';
import ErrorMessage from './ErrorMessage';
import SuccessMessage from './SuccessMessage';
import DateInput from './DateInput.jsx';
import InputWrapper, { propLens as InputWrapperLens } from './InputWrapper';
import { DateUtil } from '../utils';
import DateDistanceVisualizer, { propsLens as DateDistanceVisualizerPropsLens } from './DateDistanceVisualizer';

/**
 * A component that wraps a form to create a Transaction.
 */
export default class TransactionForm extends Component {

  /**
   * @param props
   * @param {function(?): Promise} props.onSubmit - A function that receives
   *   transaction data and performs the action. Must return an
   *   axios-like Promise.
   * @param {string} props.title
   * @param templatePicker - An optional component that is displayed to the user so it can
   *                         select a template. This component is rendered as-is, and any
   *                         logic must be implemented by the parent.
   * @param {Account[]} props.accounts - An array with all accounts.
   * @param {Currency[]} props.currencies - An array with all currencies.
   * @param {TransactionSpec} [props.value] - The value.
   */
  constructor(props) {
    super(props);
    this.state = { errorMessage: "", successMessage: "" };
    // !!!! TODO Remove dateUserInput from state (should be part of TransactionSpec)
    if (this.props.value && this.props.value.date) {
      this.state.dateUserInput = this.props.value.date.format("YYYY-MM-DD");
    }
  }

  /**
   * @function
   * @returns {TransactionSpec}
   */
  getValue = () => {
    const defaultValue = {
      movements: [{}, {}]
    };
    return R.mergeDeepRight(defaultValue, this.props.value || {});
  }

  /**
   * Handlers for onChange event of children.
   */
  handleUpdate = R.curry((lens, eventParser, eventData) => {
    const eventValue = eventParser(eventData);
    this.props.onChange(R.set(lens, eventValue, this.getValue()));
  })

  handleNewMovementSpec = movementSpec => {
    const lens = R.lensProp("movements");
    const value = R.append(movementSpec, this.getValue().movements);
    this.props.onChange(R.set(lens, value, this.getValue()));
  };

  handleMovementSpecRemoval = index => {
    this.props.onChange(
      R.dissocPath(["movements", index], this.getValue())
    );
  }

  setErrorMessage = (x) => {
    this.setState({errorMessage: x});
  }

  setSuccessMessage = x => {
    this.setState({successMessage: x});
  }

  handleSubmit = (e) => {
    e.preventDefault();

    const self = this;
    const { onSubmit=(() => {}) } = this.props;
    const transactionSpec = this.getValue();
    function onSuccess(data) {
      self.setErrorMessage("");
      self.setSuccessMessage(data);
    }
    function onFailure(e) {
      self.setSuccessMessage("");
      self.setErrorMessage(e);
    }

    return onSubmit(transactionSpec).then(onSuccess).catch(onFailure);
  }

  render() {
    const { title="", templatePicker } = this.props;
    return (
      <div className="form-div">
        {createTitle(title)}
        {templatePicker}
        <form onSubmit={this.handleSubmit}>
          {this.renderReferenceInput()}
          {this.renderDescriptionInput()}
          {this.renderDateInput()}
          {this.renderMovementsInputs()}
          <div>{this.renderAddMovementButton()}</div>
          <input type="submit" value="Submit" />
        </form>
        <ErrorMessage value={this.state.errorMessage} />
        <SuccessMessage value={this.state.successMessage} />
      </div>
    );
  }

  /**
   * Renders an input for date.
   */
  renderDateInput() {
    const onChange = ({userInput, pickedDate}) => {
      this.state.dateUserInput = userInput;
      this.handleUpdate(R.lensProp("date"), R.identity, pickedDate);
    };
    const input = (
      <span>
        <DateInput key="date" value={this.state.dateUserInput} onChange={onChange} />
        {this.renderDistanceVisualizer()}
      </span>
    );
    const props = RU.objFromPairs(
      InputWrapperLens.label, "Date",
      InputWrapperLens.content, input,
    );
    return <InputWrapper {...props} />;
  }

  renderDistanceVisualizer() {
    // Don't render if no date
    const date = this.getValue().date;
    if (! date) return null;

    const today = DateUtil.today();
    const props = RU.objFromPairs(
      DateDistanceVisualizerPropsLens.date1, today,
      DateDistanceVisualizerPropsLens.date2, date,      
    );
    return <DateDistanceVisualizer {...props} />;
  }  

  /**
   * Renders an input for description.
   */
  renderDescriptionInput() {
    const { description="" } = this.getValue();
    const onChange = this.handleUpdate(
      R.lensProp("description"),
      R.path(['target', 'value']),
    );
    const input = (
      <input
        className="input--bigger"
        type="text"
        name="description"
        onChange={onChange}
        value={description} />
    );
    const props = RU.objFromPairs(
      InputWrapperLens.label, "Description",
      InputWrapperLens.content, input,
    );
    return <InputWrapper {...props} />;
  }

  /**
   * Renders an input for reference
   */
  renderReferenceInput() {
    const value = this.getValue().reference || "";
    const onChange = this.handleUpdate(
      R.lensProp("reference"),
      R.path(["target", "value"]),
    );
    const input = (
      <input
        className="input--bigger"
        type="text"
        name="reference"
        onChange={onChange}
        value={value} />
    );
    const props = RU.objFromPairs(
      InputWrapperLens.label, "Reference",
      InputWrapperLens.content, input,
    );
    return <InputWrapper {...props} />;    
  }

  /**
   * Renders the MovementInputs for this form.
   */
  renderMovementsInputs() {
    const self = this;
    const { accounts, currencies } = this.props;
    const movements = this.getValue().movements;

    /**
     * Renders a single MovementInput from an MovementSpec
     */
    function renderOne(movementSpec, index){
      // If index > 1, the movement spec is optional and can be removed.
      const currencyActionButtonsOpts = getCurrencyActionButtonsOpts(
        movementSpec,
        index,
        movements,
        self.handleUpdate(R.lensPath(["movements"]), R.identity)
      );
      const quantityActionButtonsOpts = getQuantityActionButtonsOptions(
        movementSpec,
        index,
        movements,
        self.handleUpdate(R.lensPath(["movements"]), R.identity)
      );
      return (
        <div key={index}>
          <MovementInputs
            key={index}
            title={`Movement[${index}]`}
            accounts={accounts}
            currencies={currencies}
            value={movementSpec}
            onChange={self.handleUpdate(R.lensPath(["movements", index]), R.identity)}
            currencyActionButtonsOpts={currencyActionButtonsOpts}
            quantityActionButtonsOpts={quantityActionButtonsOpts}
            />
          {renderRemovalButton(index)}
        </div>
      );
    };

    /**
     * Renders a remove button for movement inputs with index > 1
     */
    function renderRemovalButton(index) {
      if (index <= 1) {
        return (<div />);
      }
      return (
        <button
          name={`remove-movement-${index}`}
          style={{backgroundColor: "red"}}
          onClick={e => {
            e.preventDefault();
            self.handleMovementSpecRemoval(index);
          }}>Remove</button>
      );
    }

    return movements.map(renderOne);
  }

  renderAddMovementButton() {
    return (
      <button
        name="add-movement"
        style={{backgroundColor: "green"}}
        onClick={e => {
          e.preventDefault();
          this.handleNewMovementSpec({});
        }}>
         Add Movement
      </button>
    );
  }
}


/**
 * Returns the currency action button options for a given movement Spec.
 * `movementSpec` is the current movement spec being rendered.
 * `index` is the index in the list of movement specs.
 * `movements` is the full list of movement specs.
 * `onChange` is the callback when the movements change.
 */
export function getCurrencyActionButtonsOpts(movementSpec, index, movements, onChange) {
  var result = [];

  if (! isLastMovement(index, movements)) {
    const copyCurrencyToNextMovementSpecButtonOpt = {
      label: "->next",
      onClick: () => onChange(copyCurrencyToNextMovementSpec(movementSpec, index, movements))
    };
    result = R.append(copyCurrencyToNextMovementSpecButtonOpt, result);
  }

  return result;
}

export function isLastMovement(index, movements) { return (index + 1) === movements.length; }

/**
 * Copies the Currency from `movementSpec` to the next movement spec in the list.
 */
export function copyCurrencyToNextMovementSpec(movementSpec, index, movements) {
  const newCurrency = R.pathOr(null, ["money", "currency"], movementSpec);
  const result = R.assocPath([index + 1, "money", "currency"], newCurrency, movements);
  return result;
}

/**
 * Returns the quantity action button options for a given movement Spec.
 * `movementSpec` is the current movement spec being rendered.
 * `index` is the index in the list of movement specs.
 * `movements` is the full list of movement specs.
 * `onChange` is the callback when the movements change.
 */
export function getQuantityActionButtonsOptions(movementSpec, index, movements, onChange) {
  var result = [];

  if (! isLastMovement(index, movements)) {
    const copyQuantityToNextMovementSpecButtonOpt = {
      label: "->next",
      onClick: () => onChange(copyQuantityToNextMovementSpec(movementSpec, index, movements))
    };
    result = R.append(copyQuantityToNextMovementSpecButtonOpt, result);
  }

  return result; 
}

/**
 * Copies the quantity from a movementSpec to the next on the array, inverting the sign.
 */
export function copyQuantityToNextMovementSpec(movementSpec, index, movements) {
  const quantity = R.pathOr(null, ["money", "quantity"], movementSpec);
  const newQuantity = R.isNil(quantity) ? null : R.negate(quantity);
  return R.assocPath([index + 1, "money", "quantity"], newQuantity, movements);
}
