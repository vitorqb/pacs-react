import React, { Component } from 'react';
import AccountForm from './AccountForm.jsx';
import * as R from 'ramda';
import AccountInput from './AccountInput.jsx';
import { getSpecFromAccount } from '../utils.jsx';

/**
 * A component to edit an account.
 */
export default class EditAccountComponent extends Component {

  /**
   * @param {object} props 
   * @param {Account[]} props.accounts
   * @param {fn(Account, AccountSpec): Promise} props.editAccount - A function
   *   that performs the update of the account.
   */
  constructor(props) {
    super(props);
    this.state = {
      account: null,
      accountSpec: null
    };
  }

  getAccountSpec = () => {
    return R.clone(this.state.accountSpec);
  }

  setAccountSpec = x => {
    this.setState({accountSpec: x});
  }

  handleInputtedAccount = account => {
    this.setState({account});
    this.setAccountSpec(getSpecFromAccount(account));
  }

  handleSubmit = _ => {
    const account = this.state.account;
    const accountSpec = this.getAccountSpec();
    return this.props.editAccount(account, accountSpec);
  }

  render() {
    const accForm = this.renderAccountForm();
    const accInput = this.renderAccountInput();
    return (<div>{accInput}{accForm}</div>);
  }

  renderAccountForm = () => {
    if (this.getAccountSpec() == null) {
      return <div />;
    }
    return (
      <AccountForm
        accounts={this.props.accounts}
        onChange={this.setAccountSpec}
        value={this.getAccountSpec()}
        onSubmit={this.handleSubmit} />
    );
  }

  renderAccountInput = () => {
    const { accounts } = this.props;
    const { account } = this.state;
    return (
      <AccountInput
        value={account}
        accounts={accounts}
        onChange={this.handleInputtedAccount} />
    );
  }
  
};
