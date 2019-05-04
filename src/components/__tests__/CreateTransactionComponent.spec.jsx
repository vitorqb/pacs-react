import React from 'react';
import { AccountFactory, CurrencyFactory, TransactionFactory } from '../../testUtils.jsx';
import { mount } from 'enzyme';
import CreateTransactionComponent from '../CreateTransactionComponent';
import TransactionForm from '../TransactionForm.jsx';
import { getSpecFromTransaction } from '../../utils.jsx';
import sinon from 'sinon';

function mountCreateTransactionComponent(opts) {
  const { accounts=AccountFactory.buildList(3) } = opts;
  const { currencies=CurrencyFactory.buildList(3) } = opts;
  const { createTransaction=(()=>Promise.resolve({})) } = opts;
  return mount(
    <CreateTransactionComponent
      accounts={accounts}
      currencies={currencies}
      createTransaction={createTransaction} />
  );
}

describe('CreateTransactionComponent', () => {

  describe('TransactionForm child', () => {
    let accounts, currencies, component;
    beforeEach(() => {
      currencies = CurrencyFactory.buildList(3);
      accounts = AccountFactory.buildList(2);
      component = mountCreateTransactionComponent({accounts, currencies});      
    });
    it('Passes accounts to TransactionForm', () => {
      expect(component.find(TransactionForm).props().accounts).toBe(accounts);
    });
    it('Passes currencies to TransactionForm', () => {
      expect(component.find(TransactionForm).props().currencies).toBe(currencies);
    });
    it('Updates transactionSpec on TransactionForm change', () => {
      const transactionSpec = getSpecFromTransaction(TransactionFactory.build());
      component.find(TransactionForm).props().onChange(transactionSpec);
      component.update();
      expect(component.state().transactionSpec).toBe(transactionSpec);
    });
  });

  describe('Submitting...', () => {
    it('Calls createTransaction when form is submitted', () => {
      const transactionSpec = getSpecFromTransaction(TransactionFactory.build());
      const createTransaction = sinon.fake.resolves({});
      const component = mountCreateTransactionComponent({createTransaction});

      component.find(TransactionForm).props().onSubmit(transactionSpec);
      component.update();

      expect(createTransaction.calledOnce).toBe(true);
      expect(createTransaction.lastCall.args).toEqual([transactionSpec]);
    });
  });

});
