import React, { Component } from 'react'
import { createTitle } from '../utils';
import SuccessMessage from './SuccessMessage';
import ErrorMessage from './ErrorMessage';
import AccountInput from './AccountInput';
import * as R from 'ramda';

/** A react component that represents a form to create an account. */
export default class AccountForm extends Component {

  /**
    * Creates the component
    * @param {Object} props The props.
    * @param {string} props.title
    * @param {AccountSpec} props.value - An Account Specification with the current
    *   value for this form.
    * @param {fn(AccountSpec): ?} props.onChange - A callback function called with
    *   an updated AccountSpec at every change.
    * @param {fn(AccountSpec): Promise} props.onSubmit - Callback
    *   called with the AccountSpec on submit events. Must return a promise
    *   with success or error msg.
    */
  constructor(props) {
    super(props);
    this.state = {
      responseMsg: "",
      errMsg: ""
    }
  }

  /**
   * @function
   * @returns {AccountSpec}
   */
  getAccountSpec() {
    return R.clone(this.props.value);
  }

  /**
   * Set's the responseMsg state, that contains a response message when
   * the account creation succeeds.
   */
  setResponseMsg = x => {
    this.setState({responseMsg: x || ""})
  }

  setErrMsg = x => {
    this.setState({errMsg: x || ""});
  }

  handleUpdate = R.curry((lens, eventParser, eventData) => {
    const eventValue = eventParser(eventData);
    const newAccountSpec = R.set(lens, eventValue, this.getAccountSpec());
    this.props.onChange(newAccountSpec);
  })

  handleSubmit = (event) => {
    event.preventDefault()
    this.setResponseMsg("")
    this.setErrMsg("")
    return this.props.onSubmit(this.getAccountSpec())
      .then(this.setResponseMsg)
      .catch(this.setErrMsg)
  }

  render() {
    const { name, accType } = this.getAccountSpec();
    const title = createTitle(this.props.title);

    const nameInput = this.makeInput({
      type: "text",
      name: "name",
      onChange: this.handleUpdate(
        R.lensProp("name"),
        R.path(["target", "value"])
      ),
      value: name
    });
    const accTypeInput = this.makeInput({
      type: "text",
      name: "accType",
      onChange: this.handleUpdate(
        R.lensProp("accType"),
        R.path(["target", "value"])
      ),
      value: accType      
    });
    const parentInput = this.makeParentInput();

    return (
      <div className="form-div">
        {title}
        <form onSubmit={this.handleSubmit}>
          <table style={{width: "100%"}}><tbody>
              {nameInput}
              {accTypeInput}
              {parentInput}
          </tbody></table>
          <input type="submit" value="Submit" />
        </form>
        <SuccessMessage value={this.state.responseMsg} />
        <ErrorMessage value={this.state.errMsg} />
      </div>
    )
  }

  makeParentInput = () => {
    const { accounts=[] } = this.props;
    const { parent } = this.getAccountSpec();
    const value = parent ? R.find(R.propEq("pk", parent), accounts) : null;
    return this.makeTrTag(
      "parent",
      <AccountInput
        onChange={this.handleUpdate(R.lensProp("parent"), R.prop("pk"))}
        accounts={accounts}
        value={value} />
    );
  }

  makeInput = ({type, name, onChange, value}) => {
    return this.makeTrTag(
      name,
      <input type={type} name={name} value={value || ""} onChange={onChange} />
    )
  }

  makeTrTag = (name, component) => {
    return (
      <tr key={name}>
        <td style={{width: "1%"}}>{name}</td>
        <td>{component}</td>
      </tr>
    )
  }
}
