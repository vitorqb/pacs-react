import * as R from "ramda";
import React, { Component } from 'react';
import { createTitle, createInput } from '../utils';
import MovementInputs from './MovementInputs';
import ErrorMessage from './ErrorMessage';
import SuccessMessage from './SuccessMessage';

/**
 * A component that wraps a form to create a Transaction.
 */
export default class CreateTransactionForm extends Component {

  constructor(props) {
    super(props);
    this.state = {
      description: "",
      date: "",
      movements: [0, 0].map(_ => ({account: "", currency: "", quantity: ""})),
      errorMessage: "",
      successMessage: ""
    }
  }

  handleDescriptionUpdate = (e) => {
    this.setState({...this.state, description: e.target.value})
  }

  handleDateUpdate = (e) => {
    this.setState({...this.state, date: e.target.value})
  }

  setErrorMessage = (x) => {
    this.setState({...this.state, errorMessage: x})
  }

  resetErrorMessage = () => {
    this.setErrorMessage("")
  }

  setSuccessMessage = x => {
    this.setState({successMessage: x});
  }

  resetSuccessMessage = () => {
    this.setSuccessMessage("");
  }

  handleSubmit = (e) => {
    e.preventDefault()

    const self = this;
    const { createTransaction=(() => {}) } = this.props || {};
    const transactionData = R.pick(["description", "date", "movements"], this.state);
    function onSuccess(data) {
      self.resetErrorMessage()
      self.setSuccessMessage(data)
    }
    function onFailure(e) {
      self.resetSuccessMessage()
      self.setErrorMessage(e)
    }

    return createTransaction(transactionData).then(onSuccess).catch(onFailure)
  }

  render() {
    const { title="" } = this.props;
    const titleSpan = createTitle(title);
    const inputs = this.renderInputs();
    const movementInputs = this.renderMovementsInputs();
    return (
      <div className="form-div">
        <form onSubmit={this.handleSubmit}>
          {titleSpan}
          {inputs}
          {movementInputs}
          <input type="submit" value="Submit" />
        </form>
        <ErrorMessage value={this.state.errorMessage} />
        <SuccessMessage value={this.state.successMessage} />
      </div>
    )
  }

  /**
   * Renders the input tags for the form.
   */
  renderInputs() {
    const { description, date } = this.state;
    const inputsData = [
      {
        type: "text",
        name: "description",
        onChange: this.handleDescriptionUpdate,
        value: description
      },
      {
        type: "text",
        name: "date",
        onChange: this.handleDateUpdate,
        value: date
      }
    ]
    return inputsData.map(createInput)
  }

  /**
   * Renders the MovementInputs for this form.
   */
  renderMovementsInputs() {
    const self = this;

    /**
     * Renders a single MovementInput from an object containing
     * the needed props.
     */
    function renderOne({ account, quantity, currency }, index){
      return (
        <MovementInputs
          key={index}
          title={`movements[${index}]`}
          account={account}
          quantity={quantity}
          currency={currency}
          onChange={self.handleMovementInputsChange(index)}/>
      )
    }

    return this.state.movements.map(renderOne)
  }

  /**
   * Curried function responsible to update the state of the Inputs
   * at index.
   */
  handleMovementInputsChange = (index) => (newMovementState) => {
    const updateState = R.set(R.lensPath(["movements", index]), newMovementState);
    this.setState(updateState);
  }
}
