import React from 'react';
import { mount } from 'enzyme';
import TransactionTable, { extractQuantityMoved, extractAccountsRepr } from '../TransactionTable';
import * as sut from '../TransactionTable';
import { MovementFactory, TransactionFactory, CurrencyFactory, AccountFactory } from '../../testUtils';
import * as R from 'ramda';
import * as RU from '../../ramda-utils';
import { getSourceAccsPks, getTargetAccsPks, newGetter, memoizeSimple } from '../../utils';
import sinon from 'sinon';
import ReactTable from 'react-table';
import moment from 'moment';

describe('Testing TransactionTable', () => {

  let mountTransactionTable = (transactions, getCurrency, getAccount) => {
    getCurrency = getCurrency || (() => CurrencyFactory.build());
    getAccount = getAccount || (() => AccountFactory.build());
    return mount(
      <TransactionTable
        transactions_={transactions}
        getCurrency={getCurrency}
        getAccount={getAccount} />
    );
  };

  beforeEach(() => {
    sinon.restore();
  });

  afterEach(() => {
    sinon.restore();
  });

  it('Renders a ReactTable with props from ReactTableProps', () => {
    let fakeGen = ({getCurrency, getAccount}, transactions) => { return {columns: []}; };
    sinon.stub(sut.ReactTableProps, 'gen').callsFake(fakeGen);

    let component = mountTransactionTable();
    
    expect(component.find(ReactTable).props().data).toEqual([]);
    expect(component.find(ReactTable).props().columns).toEqual([]);
  });

  describe('extractQuantityMoved', () => {
    it('Base', () => {
      const movements = MovementFactory.buildBalancedPair();
      const quantity = Math.abs(movements[0].money.quantity);
      const currencyName = "Euro";
      const getCurrency = () => ({name: currencyName});
      const exp = `${quantity} ${currencyName}`;
      const res = extractQuantityMoved(getCurrency, movements);
      expect(res).toEqual(exp);
    });
    it('Multiple currencies', () => {
      const movements = MovementFactory.buildList(5);
      const exp = "(Multiple Currencies)";
      const res = extractQuantityMoved(() => {}, movements);
      expect(exp).toEqual(res);
    });
  });

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
      expect(exp).toEqual(resp);
    });
    it('Two sources, two targets', () => {
      const quantities = [-1, -1, 1, 1];
      const accounts = AccountFactory.buildList(4);
      const getAccount = newGetter(R.prop("pk"), accounts);
      function createMovement([quantity, account]) {
        const mov = MovementFactory.build({account: account.pk});
        mov.money.quantity = quantity;
        return mov;
      };
      const movements = R.map(createMovement, R.zip(quantities, accounts));
      var exp = "";
      exp += `(${accounts[0].name}, ${accounts[1].name})`;
      exp += " -> ";
      exp += `(${accounts[2].name}, ${accounts[3].name})`;
      const resp = extractAccountsRepr(getAccount, movements);
      expect(resp).toEqual(exp);
    });
  });
});

describe('Testing ReactTableProps', () => {

  /**
   * Helpers that selects the column with a specific id from the props.
   */
  const selectColumnById = (id, props) => RU.findFirst(x => x.id == id, props.columns);

  describe('.gen()', () => {

    it('id column', () => {
      const idCol = selectColumnById("pk", sut.ReactTableProps.gen({}, []));
      expect(idCol.id).toEqual("pk");
      expect(idCol.Header).toEqual("Pk");
      expect(idCol.accessor({"pk": 222})).toEqual(222);
      expect(idCol.width).toEqual(sut.WIDTHS.smaller);
    });

    it('description column', () => {
      const col = selectColumnById("description", sut.ReactTableProps.gen({}, []));
      expect(col.id).toEqual("description");
      expect(col.Header).toEqual("Description");
      expect(col.accessor({description: "FOO"})).toEqual("FOO");
    });

    it('date column', () => {
      const col = selectColumnById("date", sut.ReactTableProps.gen({}, []));
      expect(col.id).toEqual("date");
      expect(col.Header).toEqual("Date");
      expect(col.accessor({date: moment("2019-01-01")})).toEqual("2019-01-01");
      expect(col.width).toEqual(sut.WIDTHS.small);
    });

    it('quantity column', () => {
      const getCurrency = () => CurrencyFactory.build();
      const movements = MovementFactory.buildList(2);
      const col = selectColumnById("quantity", sut.ReactTableProps.gen({getCurrency}, []));

      expect(col.id).toEqual("quantity");
      expect(col.Header).toEqual("Quantity");
      expect(col.accessor({movements})).toEqual(sut.extractQuantityMoved(getCurrency, movements));
      expect(col.width).toEqual(sut.WIDTHS.small);
    });

    it('account column', () => {
      const movements = MovementFactory.buildList(2);
      const account = AccountFactory.build();
      const getAccount = () => account;
      const col = selectColumnById("accounts", sut.ReactTableProps.gen({getAccount}, []));

      expect(col.id).toEqual("accounts");
      expect(col.Header).toEqual("Accounts");
      expect(col.accessor({movements})).toEqual(sut.extractAccountsRepr(getAccount, movements));
    });

    it('Reads pages from paginatedTransactions', () => {
      const result = sut.ReactTableProps.gen({}, {pageCount: 10});
      expect(result.pages).toEqual(10);
    });

    it('Defaults pages to -1', () => {
      const result = sut.ReactTableProps.gen({}, {});
      expect(result.pages).toEqual(-1);
    });

    it('Reads data from paginatedTransactions', () => {
      const result = sut.ReactTableProps.gen({}, {items: [{id: 1}]});
      expect(result.data).toEqual([{id: 1}]);
    });

    it('Defaults data to empty array', () => {
      const result = sut.ReactTableProps.gen({}, {});
      expect(result.data).toEqual([]);
    });
  });
  
});

describe('TransactionFetcher', () => {

  beforeEach(() => { sinon.restore(); });
  afterEach(() => { sinon.restore(); });

  describe('fetch', () => {

    it('getPaginatedTransactions and returns', () => {
      const opts = {page: 1, pageSize: 2};
      const getPaginatedTransactions = R.identity;
      const result = sut.TransactionFetcher.fetch({getPaginatedTransactions})(opts);
      expect(result).toEqual(opts);
    });
    
  });

  describe('fetchFromReactTableState', () => {

    it('Calls fetch with page and pageSize', () => {
      const fetchStub = sinon.stub(sut.TransactionFetcher, 'fetch').callsFake(() => "FOO");
      const getPaginatedTransactions = R.identity;
      const reactTableState = {page: 1, pageSize: 2};

      const result = sut.TransactionFetcher.fetchFromReactTableState(
        {getPaginatedTransactions},
        reactTableState
      );
      
      expect(result).toEqual("FOO");
      expect(fetchStub.args).toHaveLength(1);
      expect(fetchStub.args[0]).toEqual([{getPaginatedTransactions}, {page: 1, pageSize: 2}]);
    });
    
  });
  
});
