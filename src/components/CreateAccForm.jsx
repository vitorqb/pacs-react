import React, { Component } from 'react'
import { createTitle } from '../utils';
import SuccessMessage from './SuccessMessage';
import ErrorMessage from './ErrorMessage';
import AccountInput from './AccountInput';
import * as R from 'ramda';

/** A react component that represents a form to create an account. */
export default class CreateAccForm extends Component {

  /**
    * Creates the component
    * @param {Object} props The props.
    * @param {string} props.title A title for the form.
    * @param {Function} props.createAcc - A function that accepts this.state
    *    and performs the creation of the Account object.
    */
  constructor(props) {
    super(props);
    this.state = {
      name: "",
      accType: "",
      parent: "",
      responseMsg: "",
      errMsg: ""
    }
  }

  /**
   * Set's the responseMsg state, that contains a response message when
   * the account creation succeeds.
   */
  setResponseMsg = x => {
    const newState = x || "";
    this.setState({responseMsg: newState})
  }

  resetResponseMsg = () => {
    this.setResponseMsg("")
  }

  setErrMsg = x => {
    this.setState({errMsg: x || ""});
  }

  resetErrMsg = () => {
    this.setErrMsg("")
  }

  handleNameUpdate = (event) => {
    this.setState({...this.state, name: event.target.value})
  }

  handleAccTypeUpdate = (event) => {
    this.setState({...this.state, accType: event.target.value})
  }

  handleParentUpdate = (event) => {
    // event is {label: ..., value: Account}
    const account = event.value;
    this.setState({parent: account.pk})
  }

  handleSubmit = (event) => {
    const accParams = R.pick(["accType", "name", "parent"], this.state);

    event.preventDefault()
    this.resetResponseMsg()
    this.resetErrMsg()
    return this.props.createAcc(accParams)
      .then(this.setResponseMsg)
      .catch(this.setErrMsg)
  }

  render() {
    const inputs = this.renderInputs();
    const title = createTitle(this.props.title);
    return (
      <div className="form-div">
        {title}
        <form onSubmit={this.handleSubmit}>
          <table style={{width: "100%"}}><tbody>
            {inputs}
          </tbody></table>
          <input type="submit" value="Submit" />
        </form>
        <SuccessMessage value={this.state.responseMsg} />
        <ErrorMessage value={this.state.errMsg} />
      </div>
    )
  }

  /**
    * Renders the `input` tags for the form.
    * @returns - an array of Input tags.
    */
  renderInputs() {
    const { name, accType } = this.state;
    function makeTrTag(name, component) {
      return (
        <tr key={name}>
          <td style={{width: "1%"}}>{name}</td>
          <td>{component}</td>
        </tr>
      )
    }

    // For name and accType
    const inputsData = [
      {
        type: "text",
        name: "name",
        onChange: this.handleNameUpdate,
        value: name
      },
      {
        type: "text",
        name: "accType",
        onChange: this.handleAccTypeUpdate,
        value: accType
      },
    ]
    const inputs = inputsData.map(({type, name, onChange, value}) => makeTrTag(
      name,
      <input type={type} name={name} value={value} onChange={onChange} />
    ))

    // For parent
    const { accounts=[] } = this.props;
    const parentInput = makeTrTag(
      "parent",
      <AccountInput
        key={inputsData.length}
        onChange={this.handleParentUpdate}
        accounts={accounts} />
    );

    return [...inputs, parentInput]
  }
}

