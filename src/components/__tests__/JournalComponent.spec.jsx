import React from 'react';
import sinon from 'sinon';
import { mount } from 'enzyme';
import JournalComponent from '../JournalComponent.jsx';
import JournalTable from '../JournalTable.jsx';


describe('JournalComponent', () => {
  describe('Mounting with account', () => {
    const opts = {
      account: {},
      accounts: [],
      isDescendant: () => true,
      getCurrency: () => {},
      journal: {transactions: [], balances: []},
      columnMakers: [],
    };
    const journalComponent = mount(
      <JournalComponent
        accounts={opts.accounts}
        isDescendant={opts.isDescendant}
        getCurrency={opts.getCurrency}
        columnMakers={opts.columnMakers}
        />
    );
    journalComponent.setState({account: opts.account, journal: opts.journal});
    journalComponent.update()
    const findTable = () => journalComponent.find(JournalTable);
    it('Parses account as prop', () => {
      expect(findTable().props().account).toBe(opts.account);
    })
    it('Parses isDescendant as prop', () => {
      expect(findTable().props().isDescendant).toBe(opts.isDescendant);
    })
    it('Parses getCurrency as prop', () => {
      expect(findTable().props().getCurrency).toBe(opts.getCurrency);
    })
    it('Parses data as prop', () => {
      expect(findTable().props().data).toBe(opts.journal);
    })
    it('Parses columnMakers as prop', () => {
      expect(findTable().props().columnMakers).toBe(opts.columnMakers);
    })
  })
  describe('Retrieving account', () => {
    it('Sets account from AccountInput onChange', () => {
      const component = mount(
        <JournalComponent
          accounts={[]}
          isDescendant={()=>false}
          getCurrency={()=>{}}
          columnMakers={[]}
          getJournalForAccount={()=>Promise.resolve()} />
      );
      const account = {};
      expect(component.state().account).toBe(null);
      component.find('AccountInput').props().onChange(account);
      expect(component.state().account).toBe(account);
    })
  })
  describe('Fetching data', () => {
    it('Does not shows table if no data', () => {
      const component = mount(
        <JournalComponent
          accounts={[]}
          isDescendant={()=>false}
          getCurrency={()=>{}}
          columnMakers={[]} />
      );
      expect(component.find(JournalTable)).toHaveLength(0);
    })
    it('Fetches data when account is set', () => {
      const getJournalForAccount = sinon.fake.resolves({transactions: [], balances: []});
      const component = mount(
        <JournalComponent
          accounts={[]}
          isDescendant={()=>false}
          getCurrency={()=>{}}
          columnMakers={[]}
          getJournalForAccount={getJournalForAccount} />
      );
      const account = {some: "account"};
      component.instance().setAccount(account);
      expect(getJournalForAccount.calledOnce).toBe(true);
      expect(getJournalForAccount.lastCall.args).toEqual([account]);
    })
    it('Sets fetched journal data on state', () => {
      const journal = {transactions: [], balances: []};
      const journalPromise = Promise.resolve(journal);
      const component = mount(
        <JournalComponent
          accounts={[]}
          isDescendant={()=>false}
          getCurrency={()=>{}}
          columnMakers={[]}
          getJournalForAccount={() => journalPromise} />
      );
      const account = {some: "account"};
      component.instance().setAccount(account);
      expect.assertions(1);
      return journalPromise.then(() => {
        expect(component.state().journal).toBe(journal);
      });
    })
  })
})
