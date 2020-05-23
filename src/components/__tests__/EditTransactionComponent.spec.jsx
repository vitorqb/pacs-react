import { TransactionFactory, AccountFactory, CurrencyFactory } from '../../testUtils';
import { mount } from 'enzyme';
import React from 'react';
import TransactionForm from '../TransactionForm';
import EditTransactionComponent from '../EditTransactionComponent';
import TransactionPicker from '../TransactionPicker';
import SuccessMessage from '../SuccessMessage';
import ErrorMessage from '../ErrorMessage.jsx';
import sinon from 'sinon';
import { getSpecFromTransaction } from '../../utils.jsx';

/**
 * Mounts an EditTransactionComponent for testing
 * @param {object} options
 * @param {fn(number): Promise<Transaction>} options.getTransaction
 * @param {fn(number): Promise} options.updateTransaction
 * @param {Account[]} options.accounts
 * @param {Currency[]}: options.currencies
 * @return {ReactWrapper}
 */
function mountEditTransactionComponent({
  getTransaction = (() => Promise.resolve(TransactionFactory.build())),
  updateTransaction = (() => Promise.resolve({})),
  accounts=[],
  currencies=[],
  title=""
}) {
  return mount(
    <EditTransactionComponent
      getTransaction={getTransaction}
      updateTransaction={updateTransaction}
      accounts={accounts}
      currencies={currencies}
      title={title} />
  );
}

describe('EditTransactionComponent()', () => {

  let transaction, transactionPromise, getTransaction, editTransactionComponent,
      updateTransaction, accounts, currencies;

  const title = "Title!";

  beforeEach(() => {
    accounts = AccountFactory.buildList(3);
    currencies = CurrencyFactory.buildList(3);
    transaction = TransactionFactory.build();
    transactionPromise = Promise.resolve(transaction);
    getTransaction = () => transactionPromise;
    updateTransaction = sinon.fake.resolves();
    editTransactionComponent = mountEditTransactionComponent(
      { getTransaction, updateTransaction, accounts, currencies, title }
    );
  });

  it('Renders with title', () => {
    const span = editTransactionComponent.find('span.titleSpan');
    expect(span.html()).toContain(title);
  });
  
  describe('TransactionPicker child...', () => {
    it('Pass getTransaction function as prop', () => {
      expect(editTransactionComponent.find(TransactionPicker).props().getTransaction)
        .toBe(getTransaction);
    });
    it('Parses picked transaction to TransactionForm as value', () => {
      expect.assertions(1);
      return editTransactionComponent
        .find(TransactionPicker)
        .instance()
        .handleSubmit({preventDefault: () => {}})
        .then(_ => {

          editTransactionComponent.update();
          editTransactionComponent.instance().forceUpdate();
          editTransactionComponent.find(TransactionForm).update();
          editTransactionComponent.find(TransactionForm).instance().forceUpdate();

          const expTransactionSpec = getSpecFromTransaction(transaction);
          expect(editTransactionComponent.find(TransactionForm).props().value)
            .toEqual(expTransactionSpec);
        });
    });
  });

  describe('TransactionForm child...', () => {
    it('Pass accounts as prop', () => {
      editTransactionComponent.instance().setTransaction(transaction);
      editTransactionComponent.update();
      expect(editTransactionComponent.find(TransactionForm).props().accounts)
        .toBe(accounts);
    });
    it('Pass currencies as prop', () => {
      editTransactionComponent.instance().setTransaction(transaction);
      editTransactionComponent.update();
      expect(editTransactionComponent.find(TransactionForm).props().currencies)
        .toBe(currencies);
    });
    it('Stores transactionSpec on update', () => {
      const transactionSpec = getSpecFromTransaction(TransactionFactory.build());
      editTransactionComponent.instance().setTransaction(transaction);
      editTransactionComponent.update();
      editTransactionComponent
        .find(TransactionForm)
        .props()
        .onChange(transactionSpec);
      editTransactionComponent.update();
      expect(editTransactionComponent.state().transactionSpec)
        .toEqual(transactionSpec);
      expect(editTransactionComponent.find(TransactionForm).props().value)
        .toEqual(transactionSpec);
    });
  });

  describe('Updating transaction...', () => {
    it('Call updateTransaction with transaction and transactionSpec on submit...', () => {
      expect.assertions(1);
      editTransactionComponent.instance().setTransaction(transaction);
      const transSpec = {a: 1, b: 2};
      return editTransactionComponent
        .instance()
        .handleSubmit(transSpec)
        .then(_ => {
          expect(updateTransaction.lastCall.args).toEqual([transaction, transSpec]);
        });
    });
    it('Shows success message after success submit', async () => {
      await editTransactionComponent.instance().handleSubmit();
      editTransactionComponent.update();
      expect(editTransactionComponent.find(SuccessMessage).props().value)
        .toEqual("Success!");
    });
    it('Shows error message after error in submit', async () => {
      updateTransaction = () => Promise.reject("hola");
      editTransactionComponent = mountEditTransactionComponent({
        updateTransaction
      });
      await editTransactionComponent.instance().handleSubmit();
      editTransactionComponent.update();
      expect(editTransactionComponent.find(ErrorMessage).props().value)
        .toEqual("hola");
    });
  });

});
