import React, { Component } from 'react';
import JournalTable from './JournalTable.jsx';
import AccountPicker from './AccountPicker.jsx';
import * as R from 'ramda';

export default class JournalComponent extends Component {

  /**
   * @param {object} props
   * @param {fn(number): Account} props.getAccount
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
    const accountPicker = this.renderAccountPicker();
    return (
      <div>
        {accountPicker}
        {journalTable}
      </div>
    )
  }

  renderJournalTable = () => {
    if (this.state.journal == null || this.state.journal === undefined) {
      return <div />
    }
    const {getAccount, isDescendant, getCurrency, columnMakers} = this.props;
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

  renderAccountPicker = () => {
    const { getAccount } = this.props;
    return (
      <AccountPicker
        getAccount={pk => Promise.resolve(getAccount(pk))}
        onPicked={this.setAccount}
        />
    )
  }
};
