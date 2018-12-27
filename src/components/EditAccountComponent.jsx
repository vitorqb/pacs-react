import React, { Component } from 'react';
import AccountForm from './AccountForm.jsx';
import * as R from 'ramda';
import AccountPicker from './AccountPicker.jsx';
import { getSpecFromAccount, newGetter } from '../utils.jsx';

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
    super(props)
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

  handlePickedAccount = account => {
    this.setState({account});
    this.setAccountSpec(getSpecFromAccount(account));
  }

  handleSubmit = _ => {
    const account = this.state.account;
    const accountSpec = this.getAccountSpec();
    return this.props.editAccount(account, accountSpec)
  }

  render() {
    const accForm = this.renderAccountForm();
    const accPicker = this.renderAccountPicker();
    return (<div>{accPicker}{accForm}</div>);
  }

  renderAccountForm = () => {
    if (this.getAccountSpec() == null) {
      return <div />
    }
    return (
      <AccountForm
        accounts={this.props.accounts}
        onChange={this.setAccountSpec}
        value={this.getAccountSpec()}
        onSubmit={this.handleSubmit} />
    )
  }

  renderAccountPicker = () => {
    const { accounts } = this.props;
    const getAccount = newGetter(R.prop("pk"), accounts);
    const getAccountPromise = (pk) => Promise.resolve(getAccount(pk));
    return (
      <AccountPicker
        getAccount={getAccountPromise}
        onPicked={this.handlePickedAccount} />
    )
  }
  
};
