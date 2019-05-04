import { createElement } from 'react';
import sinon from 'sinon';
import { mount } from 'enzyme';
import JournalComponent from '../JournalComponent.jsx';
import JournalTable from '../JournalTable.jsx';
import { AccountFactory, TransactionFactory } from '../../testUtils.jsx';


// Example of empty data from server for a journal
const emptyData = {transactions: [], balances: []};
const emptyPaginatedData = {
  itemCount: 0,
  pageCount: 0,
  previous: null,
  next: null,
  data: emptyData
};


/**
 * Mounts a JournalComponent for test with some smart defaults.
 */
function mountJournalComponent({
  accounts=[],
  isDescendant=(() => false),
  getCurrency=(() => Promise.resolve({})),
  columnMakers=[],
  getPaginatedJournalDataForAccount=sinon.fake.resolves(emptyPaginatedData),
} = {}) {
  return mount(createElement(
    JournalComponent,
    { accounts, isDescendant, getCurrency, columnMakers,
      getPaginatedJournalDataForAccount }
  ));
}

function clickRefreshButton(c) {
  c.find("#refresh-button").props().onClick();
}

describe('JournalComponent', () => {
  describe('Mounting with account', () => {
    const opts = {
      account: {},
      accounts: [],
      isDescendant: () => true,
      getCurrency: () => {},
      paginatedJournalData: emptyPaginatedData,
      columnMakers: [],
    };
    const journalComponent = mountJournalComponent(opts);
    journalComponent.setState({
      account: opts.account,
      paginatedJournalData: opts.paginatedJournalData
    });
    journalComponent.update();
    const findTable = () => journalComponent.find(JournalTable);
    it('Parses account as prop', () => {
      expect(findTable().props().account).toBe(opts.account);
    });
    it('Parses isDescendant as prop', () => {
      expect(findTable().props().isDescendant).toBe(opts.isDescendant);
    });
    it('Parses getCurrency as prop', () => {
      expect(findTable().props().getCurrency).toBe(opts.getCurrency);
    });
    it('Parses paginatedJournalData as prop', () => {
      expect(findTable().props().paginatedJournalData)
        .toBe(opts.paginatedJournalData);
    });
    it('Parses columnMakers as prop', () => {
      expect(findTable().props().columnMakers).toBe(opts.columnMakers);
    });
  });
  describe('Retrieving account', () => {
    it('Sets account from AccountInput onChange', () => {
      const component = mountJournalComponent();
      const account = {};
      expect(component.state().account).toBe(null);
      component.find('AccountInput').props().onChange(account);
      expect(component.state().account).toBe(account);
    });
  });
  describe('Fetching data', () => {
    let sandbox;
    beforeEach(() => { sandbox = sinon.createSandbox(); });
    afterEach(() => { sandbox.restore(); });
    it('Does not shows table if no account', () => {
      const component = mountJournalComponent();
      expect(component.find(JournalTable)).toHaveLength(0);
    });
    it('Shows table if account', () => {
      const component = mountJournalComponent();
      component.instance().setAccount(AccountFactory.build());
      component.update();
      expect(component.find(JournalTable)).toHaveLength(1);
      // Table should be rendered with data = null
      expect(component.find(JournalTable).props().paginatedJournalData).toBe(null);
    });
    it('Stores paginationRequestOpts at onFetchDataHandler', () => {
      // onFetchData should call setLastPaginationRequestOpts
      const component = mountJournalComponent();
      const setLastPaginationRequestsOpts = (
        sandbox.stub(component.instance(), "setLastPaginationRequestsOpts")
      );
      component.instance().onFetchDataHandler({foo: "bar"});
      expect(setLastPaginationRequestsOpts.args).toEqual([[{foo: "bar"}]]);
    });
    it('Fetches data at onFetchData for JournalTable', () => {
      const paginatedJournalData = {
        itemCount: 2,
        pageCount: 1,
        previous: null,
        next: null,
        data: {
          transactions: TransactionFactory.buildList(2),
          balances: [[], []]
        }
      };
      const getPaginatedJournalDataForAccount =
            sinon.fake.resolves(paginatedJournalData);
      const account = AccountFactory.build();
      const component = mountJournalComponent({ getPaginatedJournalDataForAccount });
      component.instance().setAccount(account);
      component.update();

      // How many asserts expected (because of async)
      expect.assertions(5);
      // Initial paginatedJournalData must be null
      expect(component.state().paginatedJournalData).toBe(null);
      // Simulates call to onFetchData
      const paginationRequestOpts = { page: 2, pageSize: 25 };
      return component
        .find(JournalTable)
        .props()
        .onFetchData(paginationRequestOpts)
        .then(() => {
          // getPaginatedJournaldataforaccount should have been called
          expect(getPaginatedJournalDataForAccount.callCount).toBe(2);
          expect(getPaginatedJournalDataForAccount.lastCall.args[0])
            .toEqual(component.state().account);
          expect(getPaginatedJournalDataForAccount.lastCall.args[1])
            .toEqual(paginationRequestOpts);
          // And the data should have been set
          expect(component.state().paginatedJournalData).toBe(paginatedJournalData);
        });
    });
    it('Refresh button click calls onFetchDataHandler', () => {
      const component = mountJournalComponent();
      const onFetchDataHandler = (
        sandbox.stub(component.instance(), "onFetchDataHandler")
      );
      // Set's the lastPaginationRequestsOpts so we can check later
      component.setState({lastPaginationRequestsOpts: {foo: "bar"}});
      clickRefreshButton(component);
      expect(onFetchDataHandler.args).toEqual([[{foo: "bar"}]]);
    });
    it('Refresh button click before rendering is ignored.', () => {
      const component = mountJournalComponent();
      const onFetchDataHandler = (
        sandbox.stub(component.instance(), "onFetchDataHandler")
      );
      expect(component.state().lastPaginationRequestsOpts).toBe(undefined);
      clickRefreshButton(component);
      // Should not have been called
      expect(onFetchDataHandler.args).toEqual([]);
    });
  });
});
