import React from 'react';
import { mount } from 'enzyme';
import TransactionTable, { extractQuantityMoved, extractAccountsRepr } from '../TransactionTable';
import * as sut from '../TransactionTable';
import { MovementFactory, CurrencyFactory, AccountFactory } from '../../testUtils';
import * as R from 'ramda';
import * as RU from '../../ramda-utils';
import { getSourceAccsPks, getTargetAccsPks, newGetter } from '../../utils';
import sinon from 'sinon';
import ReactTable from 'react-table';
import moment from 'moment';
import ReactTestUtils from 'react-dom/test-utils';

describe('Testing TransactionTable', () => {

  let mountTransactionTable = (transactions, getCurrency, getAccount, getPaginatedTransactions) => {
    getCurrency = getCurrency || (() => CurrencyFactory.build());
    getAccount = getAccount || (() => AccountFactory.build());
    getPaginatedTransactions = getPaginatedTransactions || (() => Promise.resolve({}));
    return mount(
      <TransactionTable
        transactions_={transactions}
        getCurrency={getCurrency}
        getAccount={getAccount}
        getPaginatedTransactions={getPaginatedTransactions}
      />
    );
  };

  beforeEach(() => {
    sinon.restore();
  });

  afterEach(() => {
    sinon.restore();
  });

  it('Renders a ReactTable with props from ReactTableProps', async () => {
    let fakeGen = ({getCurrency, getAccount}, transactions) => { return {columns: []}; };
    sinon.stub(sut.ReactTableProps, 'gen').callsFake(fakeGen);

    await ReactTestUtils.act(async () => {
      let component = mountTransactionTable();
      
      expect(component.find(ReactTable).props().data).toEqual([]);
      expect(component.find(ReactTable).props().columns).toEqual([]);
    });
  });

  it('Passes a header instance to the TableCore', async () => {
    
    await ReactTestUtils.act(async () => {
      const header = mountTransactionTable().find(sut.TransactionTableCore).props().header;
      expect(header.props.className).toEqual('transaction-table-header');
    });
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

describe('TransactionTableCore', () => {

  function mountComponent(props) {
    const parsedProps = {pageState: [0, ()=>{}], pageSizeState: [0, ()=>{}], ...props};
    parsedProps.paginatedTransactions = props.paginatedTransactions || { items: [] }; 
    return mount(<sut.TransactionTableCore {...parsedProps} />);
  }

  it('Mounts header if defined', () => {
    const Header = () => <div>{"Foo"}</div>;
    const header = <Header />;
    const component = mountComponent({header});
    expect(component.find(Header)).toHaveLength(1);
  });

});

describe('Testing ReactTableProps', () => {

  /**
   * Helpers that selects the column with a specific id from the props.
   */
  const selectColumnById = (id, props) => RU.findFirst(x => x.id === id, props.columns);

  describe('.gen()', () => {

    /**
     * Helpers that mounts with smart defaults
     */
    function gen(opts, paginatedTransactions) {
      const optsWithDefault = {pageState: [0, ()=>{}], pageSizeState: [0, ()=>{}], ...opts};
      return sut.ReactTableProps.gen(optsWithDefault, paginatedTransactions);
    }

    it('id column', () => {
      const idCol = selectColumnById("pk", gen({}, []));
      expect(idCol.id).toEqual("pk");
      expect(idCol.Header).toEqual("Pk");
      expect(idCol.accessor({"pk": 222})).toEqual(222);
      expect(idCol.width).toEqual(sut.WIDTHS.smaller);
    });

    it('description column', () => {
      const col = selectColumnById("description", gen({}, []));
      expect(col.id).toEqual("description");
      expect(col.Header).toEqual("Description");
      expect(col.accessor({description: "FOO"})).toEqual("FOO");
    });

    it('date column', () => {
      const col = selectColumnById("date", gen({}, []));
      expect(col.id).toEqual("date");
      expect(col.Header).toEqual("Date");
      expect(col.accessor({date: moment("2019-01-01")})).toEqual("2019-01-01");
      expect(col.width).toEqual(sut.WIDTHS.small);
    });

    it('quantity column', () => {
      const getCurrency = () => CurrencyFactory.build();
      const movements = MovementFactory.buildList(2);
      const col = selectColumnById("quantity", gen({getCurrency}, []));

      expect(col.id).toEqual("quantity");
      expect(col.Header).toEqual("Quantity");
      expect(col.accessor({movements})).toEqual(sut.extractQuantityMoved(getCurrency, movements));
      expect(col.width).toEqual(sut.WIDTHS.small);
    });

    it('account column', () => {
      const movements = MovementFactory.buildList(2);
      const account = AccountFactory.build();
      const getAccount = () => account;
      const col = selectColumnById("accounts", gen({getAccount}, []));

      expect(col.id).toEqual("accounts");
      expect(col.Header).toEqual("Accounts");
      expect(col.accessor({movements})).toEqual(sut.extractAccountsRepr(getAccount, movements));
    });

    it('Reads pages from paginatedTransactions', () => {
      const result = gen({}, {pageCount: 10});
      expect(result.pages).toEqual(10);
    });

    it('Defaults pages to -1', () => {
      const result = gen({}, {});
      expect(result.pages).toEqual(-1);
    });

    it('Reads data from paginatedTransactions', () => {
      const result = gen({}, {items: [{id: 1}]});
      expect(result.data).toEqual([{id: 1}]);
    });

    it('Defaults data to empty array', () => {
      const result = gen({}, {});
      expect(result.data).toEqual([]);
    });

    it('Passes page and callback from pageState', () => {
      const page = 2;
      const setPage = () => {};
      const pageState = [page, setPage];
      const result = gen({pageState}, {});
      expect(result.page).toEqual(2);
      expect(result.onPageChange).toEqual(setPage);
    });

    it('Passes pageSize and callback from pageSizeState', () => {
      const pageSize = 2;
      const setPageSize = () => {};
      const pageSizeState = [pageSize, setPageSize];
      const result = gen({pageSizeState}, {});
      expect(result.pageSize).toEqual(2);
      expect(result.onPageSizeChange).toEqual(setPageSize);
    });
  });
  
});

describe('TransactionFetcher', () => {

  beforeEach(() => { sinon.restore(); });
  afterEach(() => { sinon.restore(); });

  describe('extractArgsFromReactTableState', () => {

    it('Gets page and page size', () => {
      const reactTableState = {page: 1, pageSize: 2, foo: "BAR"};
      const result = sut.TransactionFetcher.extractArgsFromReactTableState(reactTableState);
      expect(result).toEqual({page: 1, pageSize: 2});
    });
    
  });

  describe('withSearchTerm', () => {

    const args = {page: 1, pageSize: 2};
    
    it('When is empty string, does nothing', () => {
      const searchTerm = "";
      const result = sut.TransactionFetcher.withSearchTerm(searchTerm)(args);
      expect(result).toEqual(args);
    });

    it('When is not string, adds it', () => {
      const searchTerm = "Foo";
      const result = sut.TransactionFetcher.withSearchTerm(searchTerm)(args);
      const exp = {...args, description: "Foo"};
      expect(result).toEqual(exp);
    });    

  });
  
});


describe('transactionTableHeader', () => {

  describe('_searchTermChangeHandler', () => {

    let setSearchTerm, newSearchTerm, event;

    beforeEach(() => {
      newSearchTerm = "Foo";
      setSearchTerm = sinon.fake();
      event = {
        preventDefault: sinon.fake(),
        target: {value: newSearchTerm}
      };
      sut.transactionTableHeader._searchTermChangeHandler(setSearchTerm, event);
    });

    afterEach(() => {
      sinon.restore();
    });

    it('Calls event.preventDefault', () => {
      expect(event.preventDefault.calledOnceWith()).toBe(true);
    });

    it('Calls setSearchTerm', () => {
      expect(setSearchTerm.calledOnceWith(newSearchTerm)).toBe(true);
    });
    
  });

  describe('genElement', () => {

    let searchTermState, opts, component, searchTermChangeHandlerMock, curriedSearchTermHandler;

    beforeEach(() => {
      curriedSearchTermHandler = sinon.fake();
      searchTermState = ["Foo", sinon.fake()];
      opts = {searchTermState};
      searchTermChangeHandlerMock = sinon.stub(
        sut.transactionTableHeader,
        '_searchTermChangeHandler'
      ).returns(curriedSearchTermHandler);
      component = mount(sut.transactionTableHeader.genElement(opts));
    });

    afterEach(() => {
      sinon.restore();
    });

    it('Renders a form with onSubmit', () => {
      expect(typeof component.find("form").props().onSubmit).toEqual("function");
    });

    it('Renders a div with correct classname', () => {
      expect(component.find("div.transaction-table-header")).toHaveLength(1);
    });

    it('Renders an input for user to enter text', () => {
      const input = component.find("input.transaction-table-header__input");
      expect(input).toHaveLength(1);
      expect(input.instance().placeholder).toEqual("SearchTerm");
      expect(input.instance().type).toEqual("text");
      expect(input.props().value).toEqual("Foo");
      expect(input.props().onChange).toEqual(curriedSearchTermHandler);
    });

    it('Calls searchTermChangeHandler with setSearchTerm', () => {
      expect(searchTermChangeHandlerMock.calledOnceWith(searchTermState[1])).toBe(true);
    });

    it('Renders a button for the user to submit', () => {
      const button = component.find("button.transaction-table-header__button");
      expect(button).toHaveLength(1);
    });
    
  });
  
});
