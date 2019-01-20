import React, { Component } from 'react';
import JournalTable from './JournalTable.jsx';
import AccountInput from './AccountInput.jsx';
import { newGetter } from '../utils.jsx';
import * as R from 'ramda';

export default class JournalComponent extends Component {

  /**
   * @param {object} props
   * @param {List<Account>} props.accounts
   * @param {fn(Account, Account): bool} props.isDescendant - Must return True
   *   if the first account is a descendant of the second.
   * @param {fn(number): Currency} props.getCurrency
   * @param {List<fn(object): Column>} props.columnMakers - Check JournalTable.jsx.
   * @param {fn(Account): Promise<Journal>} props.getJournalForAccount -
   *   Retrieves a Journal for a given account (in a promise).
   */
  constructor(props) {
    super(props);
    this.state = {
      account: null,
      journal: null
    };
  }

  setAccount = account => {
    this.setState({account});
    return this
      .props
      .getJournalForAccount(account)
      .then(this.setJournal);
  }

  setJournal = journal => {
    this.setState({journal});
  }

  render() {
    // Renders children
    const journalTable = this.renderJournalTable();
    const accountInput = this.renderAccountInput();
    return (
      <div>
        {accountInput}
        {journalTable}
      </div>
    )
  }

  renderJournalTable = () => {
    if (this.state.journal == null || this.state.journal === undefined) {
      return <div />
    }
    const {isDescendant, getCurrency, columnMakers} = this.props;
    const getAccount = newGetter(R.prop('pk'), this.props.accounts);
    const {account, journal} = this.state;
    return (
      <JournalTable
        account={account}
        getAccount={getAccount}
        isDescendant={isDescendant}
        getCurrency={getCurrency}
        columnMakers={columnMakers}
        data={journal}
        />
    )
  }

  renderAccountInput = () => {
    const { accounts } = this.props;
    const { account } = this.state;
    return (
      <AccountInput
        value={account}
        accounts={accounts}
        onChange={this.setAccount}
        />
    )
  }
};
