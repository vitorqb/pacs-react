import React from 'react';
import sinon from 'sinon';
import { mount } from 'enzyme';
import * as R from 'ramda';
import ReactTable from 'react-table';
import { newGetter, moneysToRepr } from '../../utils.jsx';
import { TransactionFactory, CurrencyFactory } from '../../testUtils';

import JournalTable, { ColumnMakers, makeOnFetchDataHandler } from '../JournalTable';

// Example of empty data from server for a journal
const emptyData = {transactions: [], balances: []};
const emptyPaginatedData = {
  itemCount: 0,
  pageCount: 0,
  previous: null,
  next: null,
  data: emptyData
};

// Mounts a journal using acceptable defaults.
function mountJournalTable(
  { account={},
    getAccount=sinon.fake(),
    isDescendant=sinon.fake(),
    getCurrency=sinon.fake(),
    paginatedJournalData=emptyPaginatedData,
    columnMakers=[],
    onFetchData=sinon.fake() } = {}
) {
  return mount(
    <JournalTable
      paginatedJournalData={paginatedJournalData}
      columnMakers={columnMakers}
      account={account}
      getAccount={getAccount}
      isDescendant={isDescendant}
      getCurrency={getCurrency}
      onFetchData={onFetchData} />
  );
}

describe('JournalTable', () => {

  describe('Mounting...', () => {

    it('Mounts with ReactTable...', () => {
      const journalTable = mountJournalTable();
      expect(journalTable).toContainMatchingElement(ReactTable);
    });

    it('Calls columnMakers with account, getAccount, isDescendant, getCurrency', () => {
      // Mock objects
      const account = {some: "account"};
      const getAccount = {andOther: "function"};
      const isDescendant = {yerAnother: "function"};
      const getCurrency = {andSome: "function"};

      // Put a spy in ColumnMaker so we can check with what it has been called
      const columnMakers = [sinon.fake.returns({})];

      // Mounts
      mountJournalTable({ account, getAccount, isDescendant, getCurrency, columnMakers });

      // assert Spy called with a single argument that had all mocks
      expect(columnMakers[0].calledOnce).toBe(true);
      expect(columnMakers[0].lastCall.args[0]).toEqual(
        {account, getAccount, isDescendant, getCurrency}
      );
    });

    it('Parses data transformed as row as prop...', () => {
      const data = {balances: ['a', 'b'], transactions: [1, 2]};
      const paginatedJournalData = {
        itemCount: 2,
        pageCount: 1,
        previous: null,
        next: null,
        data
      };
      const rows = [{balance: 'a', transaction: 1}, {balance: 'b', transaction: 2}];
      const journalTable = mountJournalTable({paginatedJournalData});
      expect(journalTable.find(ReactTable).props().data).toEqual(rows);
    });

    it('Parses result of columnMakers to columns props...', () => {
      const columns = [{Header: "hola"}, {Header: "aloha"}];
      const columnMakers = R.map(R.always, columns);
      const journalTable = mountJournalTable({ columnMakers });
      const columnsWithPk = columns.map((x, i) => R.assoc('id', `${i}`, x));
      expect(journalTable.find(ReactTable).props().columns).toEqual(columnsWithPk);
    });

    describe('Mouting with paginatedJournalData == null', () => {

      let journalTable;

      beforeEach(() => {
        const paginatedJournalData = null;
        journalTable = mountJournalTable({ paginatedJournalData });
      });

      it('Renders ReactTable with empty data for paginatedJournalData == null', () => {
        expect(journalTable.find(ReactTable).props().data).toEqual([]);
      });

      it('onFetchData is called after render of journalTable with empty data', () => {
        expect(journalTable.props().onFetchData.calledOnce).toBe(true);
        // Default page and pageSize for first data rendering
        expect(journalTable.props().onFetchData.lastArg).toEqual({
          page: 0,
          pageSize: 20
        });
      });
    });    
  });

  describe('ReactTable server side rendering', () => {

    describe('Passes props to ReactTable', () => {

      let journalTable;

      beforeEach(() => {
        journalTable = mountJournalTable();
      });

      it('manual=true', () => {
        expect(journalTable.find(ReactTable).props().manual).toBe(true);
      });

      it('sortable=False', () => {
        expect(journalTable.find(ReactTable).props().sortable).toBe(false);
      });

      it('filterable=False', () => {
        expect(journalTable.find(ReactTable).props().filterable).toBe(false);        
      });

    });

    it('Passes pageCount to ReactTable as pages', () => {
      const paginatedJournalData = R.assoc('pageCount', 8, emptyPaginatedData);
      const journalTable = mountJournalTable({ paginatedJournalData });
      expect(journalTable.find(ReactTable).props().pages)
        .toBe(paginatedJournalData.pageCount);
    });

    describe('Registering for onFetchData wrapping ReactTable', () => {
      it('Emits onFetchData when ReactTable emits onFetchData', () => {
        const journalTable = mountJournalTable({});
        // onFetchData is called during the rendering
        expect(journalTable.props().onFetchData.callCount).toBe(1);
        // Now calls ReactTable onFetchData
        journalTable.find(ReactTable).props().onFetchData({});
        // Which should have called onFetchData
        expect(journalTable.props().onFetchData.callCount).toBe(2);
      });

      it('onFetchData is emitted with page', () => {
        const page = 12;
        const journalTable = mountJournalTable();
        journalTable.find(ReactTable).props().onFetchData({ page });
        expect(journalTable.props().onFetchData.lastArg.page).toEqual(page);
      });

      it('onFetchData is emitted with pageSize', () => {
        const pageSize = 25;
        const journalTable = mountJournalTable();
        journalTable.find(ReactTable).props().onFetchData({ pageSize });
        expect(journalTable.props().onFetchData.lastArg.pageSize).toEqual(pageSize);
      });

    });
  });

  describe('ColumnMakers', () => {

    // An example of a transaction
    const transaction = TransactionFactory.build();

    // An example of a Balance
    const balance = [{currency: 1, quantity: 100}, {currency: 2, quantity: -10}];

    // An example of a row (transaction + balance)
    const row = {transaction, balance};

    it('pk', () => {
      expect(ColumnMakers.pk().accessor(row)).toEqual(transaction.pk);
    });
    it('description', () => {
      expect(ColumnMakers.description().accessor(row)).toEqual(transaction.description);
    });
    it('date', () => {
      expect(ColumnMakers.date().accessor(row))
        .toEqual(transaction.date.format("YYYY-MM-DD"));
    });
    describe('quantity', () => {
      let opts, inject;

      beforeEach(() => {
        // We need options account, getAccount, getCurrency and isDescendant
        opts = {
          account: {},
          getCurrency: sinon.fake(),
          getAccount: sinon.fake(),
          isDescendant: sinon.fake(),
        };
        // We inject spies for extractMoneysForAccount and moneysToRepr
        inject = {
          extractMoneysForAccount_: sinon.fake(),
          moneysToRepr_: sinon.fake(),
        };
      });

      it('calls extractMoneysForAccount_ with correct args', () => {
        ColumnMakers.quantity(opts, inject).accessor(row);
        expect(inject.extractMoneysForAccount_.calledOnce).toBe(true);
        expect(inject.extractMoneysForAccount_.lastCall.args)
          .toEqual([
            opts.getAccount,
            opts.isDescendant,
            opts.account,
            transaction.movements
          ]);
      });
      it('parses result of extratMoneysForAccount_ to moneysToRepr_', () => {
        ColumnMakers.quantity(opts, inject).accessor(row);
        expect(inject.moneysToRepr_.calledOnce).toBe(true);
        expect(inject.moneysToRepr_.lastCall.args)
          .toEqual([
            opts.getCurrency,
            inject.extractMoneysForAccount_.lastCall.returnValue
          ]);
      });
      it('Results of moneysToRepr_ is returned', () => {
        const resp = ColumnMakers.quantity(opts, inject).accessor(row);
        expect(inject.moneysToRepr_.calledOnce).toBe(true);
        expect(resp).toEqual(inject.moneysToRepr_.lastCall.returnValue);
      });
      it('balanceAfter', () => {
        const currencies = [
          CurrencyFactory.build({pk: 1}),
          CurrencyFactory.build({pk: 2})
        ];
        const getCurrency = newGetter(R.prop('pk'), currencies);
        const resp = ColumnMakers.balanceAfter({getCurrency}).accessor(row);
        expect(resp).toBe(moneysToRepr(getCurrency, balance));
      });
    });
  });

  describe('makeOnFetchDataHandler', () => {

    // An example state from ReactTable
    const reactTableState = {page: 12, pageSize: 24};

    let callback, handler;
    beforeEach(() => {
      // fake callback for the handler
      callback = sinon.fake();
      // The handler using the fake callback
      handler = makeOnFetchDataHandler(callback);
      // Calls the handler so we can do the assertions.
      handler(reactTableState);
    });

    it('Calls the given callback with pages', () => {
      expect(callback.lastArg.page).toEqual(reactTableState.page);
    });

    it('Calls the given callback with pageSize', () => {
      expect(callback.lastArg.pageSize).toEqual(reactTableState.pageSize);
    });
  });
});
