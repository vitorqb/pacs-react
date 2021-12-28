import React from 'react';
import { AccountFactory, CurrencyFactory, TransactionFactory } from '../../testUtils.jsx';
import { mount } from 'enzyme';
import CreateTransactionComponent, * as sut from '../CreateTransactionComponent';
import TransactionForm from '../TransactionForm.jsx';
import { getSpecFromTransaction } from '../../utils.jsx';
import sinon from 'sinon';
import InputWrapper, { propLens as InputWrapperLens } from '../InputWrapper';
import * as R from 'ramda';
import moment from 'moment';

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

  const defaultProps = () => ({
    currencies:  CurrencyFactory.buildList(3),
    accounts: AccountFactory.buildList(2),
    createTransaction: () => Promise.resolve({}),
  });

  describe('TransactionForm child', () => {

    it('Passes accounts to TransactionForm', () => {
      const accounts = AccountFactory.buildList(2);
      const component = mountCreateTransactionComponent({accounts});
      expect(component.find(TransactionForm).props().accounts).toBe(accounts);
    });

    it('Passes currencies to TransactionForm', () => {
      const currencies = CurrencyFactory.buildList(2);
      const component = mountCreateTransactionComponent({currencies});
      expect(component.find(TransactionForm).props().currencies).toBe(currencies);
    });

    it('Updates transactionSpec on TransactionForm change', () => {
      const component = mountCreateTransactionComponent({});
      const transactionSpec = getSpecFromTransaction(TransactionFactory.build());
      component.find(TransactionForm).invoke("onChange")(transactionSpec);
      component.update();
      expect(
        component.find('CreateTransactionComponentCore').props().transactionSpecState[0]
      ).toEqual(transactionSpec);
    });

    it('Passes an instance of TemplatePicker to TransactionForm', () => {
      const component = mountCreateTransactionComponent({});
      expect(component.find(TransactionForm).props().templatePicker.type.name)
        .toEqual('TemplatePicker');
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


describe('TemplatePicker', () => {

  let onPicked, component;

  beforeEach(() => {
    onPicked = sinon.fake();
    component = mount(<sut.TemplatePicker onPicked={onPicked} />);
  });

  afterEach(() => {
    sinon.reset();
  });

  it('Renders an InputWrapper with label', () => {
    expect(R.view(InputWrapperLens.label, component.find(InputWrapper).props()))
      .toEqual(sut.TEMPLATE_PICKER_LABEL);
  });

  it('Calls onPicked after transforming to template spec', () => {
    const transaction = {date: moment("2020-01-01")};
    component.find('TransactionPicker').props().onPicked(transaction);
    expect(onPicked.args).toHaveLength(1);
    expect(onPicked.args[0]).toEqual([{}]);
  });
  
});
