import * as R from "ramda";
import React, { Component } from 'react';
import { createTitle, createInput } from '../utils';
import MovementInputs from './MovementInputs';
import ErrorMessage from './ErrorMessage';
import SuccessMessage from './SuccessMessage';
import DateInput from './DateInput.jsx';

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
   * @param {Account[]} props.accounts - An array with all accounts.
   * @param {Currency[]} props.currencies - An array with all currencies.
   * @param {TransactionSpec} [props.value] - The value.
   */
  constructor(props) {
    super(props);
    this.state = { errorMessage: "", successMessage: "" }
  }

  /**
   * @function
   * @returns {TransactionSpec}
   */
  getValue = () => {
    const defaultValue = {
      movements: [{}, {}]
    };
    return R.mergeDeepRight(defaultValue, this.props.value || {})
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
    this.setState({errorMessage: x})
  }

  setSuccessMessage = x => {
    this.setState({successMessage: x});
  }

  handleSubmit = (e) => {
    e.preventDefault()

    const self = this;
    const { onSubmit=(() => {}) } = this.props;
    const transactionSpec = this.getValue()
    function onSuccess(data) {
      self.setErrorMessage("")
      self.setSuccessMessage(data)
    }
    function onFailure(e) {
      self.setSuccessMessage("")
      self.setErrorMessage(e)
    }

    return onSubmit(transactionSpec).then(onSuccess).catch(onFailure)
  }

  render() {
    const { title="" } = this.props;
    const { description="", date="" } = this.getValue();

    const descriptionInput = createInput({
      type: "text",
      name: "description",
      onChange: this.handleUpdate(
        R.lensProp("description"),
        R.path(["target", "value"])
      ),
      value: description
    });

    const dateInput = (
      <DateInput
        key="date"
        value={date}
        onChange={this.handleUpdate(R.lensProp("date"), R.identity)} />
    );

    const movementInputs = this.renderMovementsInputs();

    const addMovementButton = this.renderAddMovementButton();

    return (
      <div className="form-div">
        <form onSubmit={this.handleSubmit}>
          {createTitle(title)}
          {descriptionInput}
          date: {dateInput}
          {movementInputs}
          <div>{addMovementButton}</div>
          <input type="submit" value="Submit" />
        </form>
        <ErrorMessage value={this.state.errorMessage} />
        <SuccessMessage value={this.state.successMessage} />
      </div>
    )
  }

  /**
   * Renders the MovementInputs for this form.
   */
  renderMovementsInputs() {
    const self = this;
    const { accounts, currencies } = this.props;

    /**
     * Renders a single MovementInput from an MovementSpec
     */
    function renderOne(movementSpec, index){
      // If index > 1, the movement spec is optional and can be removed.
      return (
        <div key={index}>
          <MovementInputs
            key={index}
            title={`movements[${index}]`}
            accounts={accounts}
            currencies={currencies}
            value={movementSpec}
            onChange={self.handleUpdate(R.lensPath(["movements", index]), R.identity)}/>
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
            self.handleMovementSpecRemoval(index)
          }}>Remove</button>
      );
    }

    return this.getValue().movements.map(renderOne);
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
