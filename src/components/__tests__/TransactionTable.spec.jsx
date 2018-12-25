import React from 'react';
import moment from 'moment';
import { mount } from 'enzyme';
import TransactionTable, { formatTransaction, extractQuantityMoved, extractAccountsRepr } from '../TransactionTable';
import { MovementFactory, TransactionFactory, CurrencyFactory, AccountFactory } from '../../testUtils';
import * as R from 'ramda';
import { getSourceAccsPks, getTargetAccsPks, newGetter, memoizeSimple } from '../../utils';

describe('Testing TransactionTable', () => {
  let mountTransactionTable = (title, transactions, getCurrency, getAccount) => {
    getCurrency = getCurrency || (() => CurrencyFactory.build())
    getAccount = getAccount || (() => AccountFactory.build())
    return mount(
      <TransactionTable
        title={title}
        transactions={transactions}
        getCurrency={getCurrency}
        getAccount={getAccount} />
    )
  }
  it('Renders with correct prop title', () => {
    const title = "My Title"
    const list = mountTransactionTable(title)
    expect(list.props().title).toEqual(title)
  })
  it('Renders with correct title in dom', () => {
    const title = "Another Title"
    const list = mountTransactionTable(title)
    expect(list.find('span.titleSpan').html()).toContain(title)
  })
  it('Mounts with a table', () => {
    const list = mountTransactionTable()
    expect(list.find("table")).toHaveLength(1)
  })
  it('Mounts with correct list of transactions', () => {
    const transactions = TransactionFactory.buildList(3);
    const list = mountTransactionTable("", transactions)
    expect(list.props().transactions).toEqual(transactions)
  })
  it('Renders the transactions in the dom', () => {
    const transactions = TransactionFactory.buildList(10);
    const getCurrency = R.memoizeWith(
      R.identity,
      (pk) => CurrencyFactory.build({pk})
    );
    const table = mountTransactionTable("", transactions, getCurrency)
    expect.assertions(transactions.length);
    for (var i=0; i<transactions.length; i++) {
      const formattedTransaction = formatTransaction(getCurrency, transactions[i]);
      expect(table.contains(formattedTransaction)).toBe(true)
    }
  })
  describe('formatTransaction()', () => {

    describe('Construct correct elements...', () => {
      const movements = MovementFactory.buildBalancedPair();
      const transaction = TransactionFactory.build({movements});
      const getCurrency = memoizeSimple((pk) => CurrencyFactory.build({pk}));
      const getAccount = memoizeSimple((pk) => AccountFactory.build({pk}));
      const resp = mount(
        <table><tbody>
            {formatTransaction(getCurrency, getAccount, transaction)}
        </tbody></table>
      )
      
      it('pk', () => {
        expect(resp).toContainReact(<td>{transaction.pk}</td>);
      })
      it('description', () => {
        expect(resp).toContainReact(<td>{transaction.description}</td>);
      })
      it('date', () => {
        expect(resp).toContainReact(<td>{transaction.date.format("YYYY-MM-DD")}</td>);
      })
      it('quantityMoved', () => {
        const quantityMoved = extractQuantityMoved(getCurrency, movements);
        expect(resp).toContainReact(<td>{quantityMoved}</td>);
      })
      it('accountsRepr', () => {
        const accountsRepr = extractAccountsRepr(getAccount, movements);
        expect(resp).toContainReact(<td>{accountsRepr}</td>);
      })
    })
    it('Multiple currencies dont print quantity moved...', () => {
      const transaction = TransactionFactory.build();
      const getCurrency = memoizeSimple(pk => CurrencyFactory.build({pk}));
      const getAccount = memoizeSimple(pk => AccountFactory.build({pk}));
      // Ensures different currencies
      transaction.movements[0].currency =
        transaction.movements[1].currency + 1
      const exp = <td>(Multiple Currencies)</td>;
      const res = mount(
        <table><tbody>
            {formatTransaction(getCurrency, getAccount, transaction)}
        </tbody></table>
      );
      expect(res).toContainReact(exp)
    })
  })

  describe('extractQuantityMoved', () => {
    it('Base', () => {
      const movements = MovementFactory.buildBalancedPair();
      const quantity = Math.abs(movements[0].money.quantity);
      const currencyPk = movements[0].money.currency;
      const currencyName = "Euro";
      const getCurrency = () => ({name: currencyName});
      const exp = `${quantity} ${currencyName}`;
      const res = extractQuantityMoved(getCurrency, movements);
      expect(res).toEqual(exp)
    })
    it('Multiple currencies', () => {
      const movements = MovementFactory.buildList(5);
      const exp = "(Multiple Currencies)";
      const res = extractQuantityMoved(() => {}, movements);
      expect(exp).toEqual(res);
    })
  })

  describe('extractAccountsRepr()', () => {
    it('Two account', () => {
      const movements = MovementFactory.buildBalancedPair();
      const accounts = R.map(R.pipe(
        R.prop("account"),
        accPk => AccountFactory.build({pk: accPk})
      ))(movements);
      const getAccount = newGetter(R.prop("pk"), accounts);
      const sourceAcc = getAccount(getSourceAccsPks(movements)[0]);
      const targetAcc = getAccount(getTargetAccsPks(movements)[0]);
      const exp = `${sourceAcc.name} -> ${targetAcc.name}`;
      const resp = extractAccountsRepr(getAccount, movements);
      expect(exp).toEqual(resp)
    })
    it('Two sources, two targets', () => {
      const quantities = [-1, -1, 1, 1];
      const accounts = AccountFactory.buildList(4);
      const getAccount = newGetter(R.prop("pk"), accounts);
      function createMovement([quantity, account]) {
        const mov = MovementFactory.build({account: account.pk})
        mov.money.quantity = quantity
        return mov
      };
      const movements = R.map(createMovement, R.zip(quantities, accounts));
      var exp = "";
      exp += `(${accounts[0].name}, ${accounts[1].name})`;
      exp += " -> "
      exp += `(${accounts[2].name}, ${accounts[3].name})`;
      const resp = extractAccountsRepr(getAccount, movements);
      expect(resp).toEqual(exp)
    })
  })
})
