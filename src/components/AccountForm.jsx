import React, { Component } from 'react';
import { createTitle } from '../utils';
import SuccessMessage from './SuccessMessage';
import ErrorMessage from './ErrorMessage';
import AccountInput from './AccountInput';
import * as R from 'ramda';
import * as RU from '../ramda-utils';
import InputWrapper, { propLens as InputWrapperLens }  from './InputWrapper';

const extractEventValue = R.path(["target", "value"]);

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
    };
  }

  /**
   * @function
   * @returns {AccountSpec}
   */
  getAccountSpec = () => R.clone(this.props.value);

  /**
   * Set's the responseMsg state, that contains a response message when
   * the account creation succeeds.
   */
  setResponseMsg = x => {
    this.setState({responseMsg: x || ""});
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
    event.preventDefault();
    this.setResponseMsg("");
    this.setErrMsg("");
    return this.props
      .onSubmit(this.getAccountSpec())
      .then(this.setResponseMsg)
      .catch(this.setErrMsg);
  }

  /**
   * Renders an input for the name.
   */
  renderNameInput() {
    const name = this.getAccountSpec().name || "";
    const onChange = this.handleUpdate(R.lensProp("name"), extractEventValue);
    const input = (
      <input className="input--bigger"
             type="text"
             name="name"
             onChange={onChange}
             value={name} />
    );
    return InputWrapper(RU.setLenses(
      [[InputWrapperLens.label, "Name"], [InputWrapperLens.content, input]],
      {}
    ));
  }

  /**
   * Renders an input for the account type.
   */
  renderAccTypeInput() {
    const accType = this.getAccountSpec().accType || "";
    const onChange = this.handleUpdate(R.lensProp("accType"), extractEventValue);
    const input = (
      <input type="text" name="accType" onChange={onChange} value={accType} />
    );
    return InputWrapper(RU.setLenses(
      [[InputWrapperLens.label, "Account Type"], [InputWrapperLens.content, input]],
      {}
    ));    
  }

  render() {
    const title = createTitle(this.props.title);
    const nameInput = this.renderNameInput();
    const accTypeInput = this.renderAccTypeInput();
    const parentInput = this.makeParentInput();
    return (
      <div>
        {title}
        <form onSubmit={this.handleSubmit}>
          {nameInput}
          {accTypeInput}
          {parentInput}
          <input type="submit" value="Submit" />
        </form>
        <SuccessMessage value={this.state.responseMsg} />
        <ErrorMessage value={this.state.errMsg} />
      </div>
    );
  }

  makeParentInput = () => {
    const { accounts=[] } = this.props;
    const { parent } = this.getAccountSpec();
    const value = parent ? R.find(R.propEq("pk", parent), accounts) : null;
    const onChange = this.handleUpdate(R.lensProp("parent"), R.prop("pk"));
    const input = <AccountInput onChange={onChange} accounts={accounts} value={value} />;
    return InputWrapper(RU.setLenses(
      [[InputWrapperLens.label, "Parent"], [InputWrapperLens.content, input]],
      {}
    ));
  }
}
