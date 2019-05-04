import React, { Component } from 'react';
import AccountForm from './AccountForm.jsx';
import * as R from 'ramda';

/**
 * A wrapper around AccountForm to create an Account.
 */
export default class CreateAccountComponent extends Component {

  /**
   * @param {object} props
   * @param {Account[]} accounts
   * @param {fn(AccountSpec): promise} createAcc
   */
  constructor(props) {
    super(props);
    this.state = {
      accountSpec: {}
    };
  }

  getAccountSpec = x => {
    return R.clone(this.state.accountSpec);
  }
  setAccountSpec = x => {
    this.setState({accountSpec: x});
  }

  handleSubmit = () => {
    return this.props.createAcc(this.getAccountSpec());
  }

  render() {
    return (
      <div>
        <AccountForm
          accounts={this.props.accounts}
          onChange={this.setAccountSpec}
          value={this.getAccountSpec()}
          onSubmit={this.handleSubmit} />
      </div>
    );
  }
  
}
