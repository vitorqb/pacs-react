import React, { Component } from 'react';
import JournalTable from './JournalTable.jsx';
import AccountInput from './AccountInput.jsx';
import { newGetter } from '../utils.jsx';
import * as R from 'ramda';

/**
 * Allows the user to pick and account and see it's journal.
 * Wraps AccountInput and JournalTable.
 */
export default class JournalComponent extends Component {

  /**
   * @param {object} props
   * @param {List<Account>} props.accounts
   * @param {fn(Account, Account): bool} props.isDescendant - Must return True
   *   if the first account is a descendant of the second.
   * @param {fn(number): Currency} props.getCurrency
   * @param {List<fn(object): Column>} props.columnMakers - Check JournalTable.jsx.
   * @param {fn(Account): Promise<PaginatedJournalData>} props.getPaginatedJournalDataForAccount -
   *   Retrieves a PaginatedJournalData for an account.
   */
  constructor(props) {
    super(props);
    this.state = {
      account: null,
      paginatedJournalData: null
    };
  }

  setAccount = account => {
    this.setState({account});
  }

  setPaginatedJournalData = paginatedJournalData => {
    this.setState({paginatedJournalData});
  }

  onFetchDataHandler = (paginationRequestOpts) => {
    const { account } = this.state;
    return this
      .props
      .getPaginatedJournalDataForAccount(account, paginationRequestOpts)
      .then(this.setPaginatedJournalData);
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
    );
  }

  renderJournalTable = () => {
    if (this.state.account == null) {
      return <div />;
    }
    const {isDescendant, getCurrency, columnMakers} = this.props;
    const getAccount = newGetter(R.prop('pk'), this.props.accounts);
    const {account, paginatedJournalData} = this.state;
    return (
      <JournalTable
        key={account.name}
        account={account}
        getAccount={getAccount}
        isDescendant={isDescendant}
        getCurrency={getCurrency}
        columnMakers={columnMakers}
        paginatedJournalData={paginatedJournalData}
        onFetchData={this.onFetchDataHandler}/>
    );
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
    );
  }
};
