import React from 'react';
import sinon from 'sinon';
import { mount } from 'enzyme';
import * as R from 'ramda';
import ReactTable from 'react-table';
import { newGetter, moneysToRepr } from '../../utils.jsx';
import { TransactionFactory, CurrencyFactory } from '../../testUtils';

import JournalTable, { ColumnMakers } from '../JournalTable';


describe('JournalTable', () => {

  describe('Mounting...', () => {

    const emptyData = {transactions: [], balances: []};

    it('Mounts with ReactTable...', () => {
      const journalTable = mount(
        <JournalTable data={emptyData} columnMakers={[]} />
      );
      expect(journalTable).toContainMatchingElement(ReactTable)
    })

    it('Calls columnMakers with account, getAccount, isDescendant, getCurrency', () => {
      // Mock objects
      const account = {some: "account"};
      const getAccount = {andOther: "function"};
      const isDescendant = {yerAnother: "function"};
      const getCurrency = {andSome: "function"};

      // Put a spy in ColumnMaker so we can check with what it has been called
      const columnMakers = [sinon.fake.returns({})];

      // Mounts
      const journalTable = mount(
        <JournalTable
          account={account}
          getAccount={getAccount}
          isDescendant={isDescendant}
          getCurrency={getCurrency}
          data={emptyData}
          columnMakers={columnMakers}
          />
      );

      // assert Spy called with a single argument that had all mocks
      expect(columnMakers[0].calledOnce).toBe(true);
      expect(columnMakers[0].lastCall.args[0]).toEqual(
        {account, getAccount, isDescendant, getCurrency}
      );
    })

    it('Parses data transformed as row as prop...', () => {
      const data = {balances: ['a', 'b'], transactions: [1, 2]};
      const rows = [{balance: 'a', transaction: 1}, {balance: 'b', transaction: 2}];
      const journalTable = mount(<JournalTable data={data} columnMakers={[]} />);
      expect(journalTable.find(ReactTable).props().data).toEqual(rows);
    })

    it('Parses result of columnMakers to columns props...', () => {
      const columns = [{Header: "hola"}, {Header: "aloha"}];
      const columnMakers = R.map(R.always, columns);
      const journalTable = mount(
        <JournalTable data={emptyData} columnMakers={columnMakers} />
      );
      const columnsWithPk = columns.map((x, i) => R.assoc('id', `${i}`, x));
      expect(journalTable.find(ReactTable).props().columns).toEqual(columnsWithPk);
    })

  })

  describe('ColumnMakers', () => {

    // An example of a transaction
    const transaction = TransactionFactory.build();

    // An example of a Balance
    const balance = [{currency: 1, quantity: 100}, {currency: 2, quantity: -10}];

    // An example of a row (transaction + balance)
    const row = {transaction, balance};

    it('pk', () => {
      expect(ColumnMakers.pk().accessor(row)).toEqual(transaction.pk);
    })
    it('description', () => {
      expect(ColumnMakers.description().accessor(row)).toEqual(transaction.description);
    })
    it('date', () => {
      expect(ColumnMakers.date().accessor(row))
        .toEqual(transaction.date.format("YYYY-MM-DD"));
    })
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
      })

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
      })
      it('parses result of extratMoneysForAccount_ to moneysToRepr_', () => {
        ColumnMakers.quantity(opts, inject).accessor(row);
        expect(inject.moneysToRepr_.calledOnce).toBe(true);
        expect(inject.moneysToRepr_.lastCall.args)
          .toEqual([
            opts.getCurrency,
            inject.extractMoneysForAccount_.lastCall.returnValue
          ]);
      })
      it('Results of moneysToRepr_ is returned', () => {
        const resp = ColumnMakers.quantity(opts, inject).accessor(row);
        expect(inject.moneysToRepr_.calledOnce).toBe(true);
        expect(resp).toEqual(inject.moneysToRepr_.lastCall.returnValue);
      })
      it('balanceAfter', () => {
        const currencies = [
          CurrencyFactory.build({pk: 1}),
          CurrencyFactory.build({pk: 2})
        ];
        const getCurrency = newGetter(R.prop('pk'), currencies);
        const resp = ColumnMakers.balanceAfter({getCurrency}).accessor(row);
        expect(resp).toBe(moneysToRepr(getCurrency, balance));
      })
    })
  })
  it('Sorts by date if date column', () => {
    const otherColumnMaker = () => ({ Header: "A" });
    const dateColumnMaker = () => ({ Header: "Date", accessor: "" });
    const journalTable = mount(
      <JournalTable
        data={{transactions: [], balances: []}}
        columnMakers={[otherColumnMaker, dateColumnMaker]} />
    );
    expect(journalTable.find(ReactTable).props().defaultSorted.length).toBe(1)
    expect(journalTable.find(ReactTable).props().defaultSorted[0].id).toBe('1');
    expect(journalTable.find(ReactTable).props().defaultSorted[0].desc).toBe(true);
  })
})
