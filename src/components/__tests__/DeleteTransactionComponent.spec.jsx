import React from 'react';
import { mount } from 'enzyme';
import * as sut from '../DeleteTransactionComponent';
import { AccountFactory, CurrencyFactory, TransactionFactory } from '../../testUtils.jsx';
import sinon from 'sinon';


describe('DeleteTransactionComponentCore', () => {

  const defaultProps = () => ({
    getTransaction: () => TransactionFactory.build(),
    getAccount: () => AccountFactory.build(),
    getCurrency: () => CurrencyFactory.build(),
    pickedTransactionState: [null, () => {}],
    errorMessageState: [null, () => {}],
    deletionRequestedState: [false, () => {}],
    handleDeletionSubmit: () => Promise.resolve(),
  });

  const render = (props) => {
    return mount(<sut.DeleteTransactionComponentCore {...defaultProps()} {...props}/>);
  };

  const findDeleteButton = c => c.find('DeleteButton');
  const findTransactionDisplayer = c => c.find('TransactionDisplayer');
  const findTransactionPicker = c => c.find('TransactionPicker');
  const findErrorMessage = c => c.find('ErrorMessage');
  const findDeletionConfirmationBox = c => c.find('DeletionConfirmationBox');

  it('TransactionDisplayer is not rendered if no transaction', () => {
    const component = render({pickedTransactionState: [null, () => {}]});
    expect(findTransactionDisplayer(component)).toHaveLength(0);
  });

  it('renders TransactionDisplayer with proper props when has a transaction', async () => {
    const transaction = TransactionFactory.build();
    const pickedTransactionState = [transaction, () => {}];
    const props = {...defaultProps(), pickedTransactionState};
    const component = render(props);
    const expectedProps = {
      getAccount: props.getAccount,
      getCurrency: props.getCurrency,
      transaction,
    };
    expect(findTransactionDisplayer(component).props()).toEqual(expectedProps);
  });
  
  it('DeleteButton is not rendered if a transaction is not selected', () => {
    const component = render({pickedTransactionState: [null, () => {}]});
    expect(findDeleteButton(component)).toHaveLength(0);
  });

  it('DeleteButton is rendered if a transaction is selected', async () => {
    const transaction = TransactionFactory.build();
    const pickedTransactionState = [transaction, () => {}];
    const deletionRequestedState = [false, () => {}];
    const component = render({
      pickedTransactionState,
      deletionRequestedState,
    });
    expect(findDeleteButton(component)).toHaveLength(1);
    const expectedProps = {deletionRequestedState};
    expect(findDeleteButton(component).props()).toEqual(expectedProps);
  });

  it('Displays error message', () => {
    const errorMessageState = ["Foo", () => {}];
    const component = render({errorMessageState});
    expect(findErrorMessage(component).props().value).toEqual("Foo");
  });

  it('Sets error message from onGetTransactionFailure', () => {
    const errorMessageState = ["Foo", sinon.fake()];
    const component = render({errorMessageState});
    findTransactionPicker(component).invoke('onGetTransactionFailure')("Foo");
    expect(errorMessageState[1].args).toEqual([["Foo"]]);
  });

  it('Cleans up error msg on new submit', async () => {
    const errorMessageState = ["Foo", sinon.fake()];
    const transaction = TransactionFactory.build();
    const component = render({errorMessageState});
    findTransactionPicker(component).invoke('onPicked')(transaction);
    expect(errorMessageState[1].args).toEqual([[null]]);
  });

  it('Cleans up picked transaction on error', async () => {
    const pickedTransactionState = [TransactionFactory.build(), sinon.fake()];
    const component = render({pickedTransactionState});
    findTransactionPicker(component).invoke('onGetTransactionFailure')("Foo");
    expect(pickedTransactionState[1].args).toEqual([[null]]);    
  });

  it('Displays DeletionConfirmationBox if deletion requested', () => {
    const deletionRequestedState = [true, () => {}];
    const handleDeletionSubmit = sinon.fake();
    const component = render({deletionRequestedState, handleDeletionSubmit});
    const expectedProps = {onSubmit: handleDeletionSubmit, deletionRequestedState};
    expect(findDeletionConfirmationBox(component).props()).toEqual(expectedProps);
  });

  it('Does not display DeletionConfirmationBox if deletion not requested', () => {
    const deletionRequestedState = [false, () => {}];
    const component = render({deletionRequestedState});
    expect(findDeletionConfirmationBox(component)).toHaveLength(0);
  });

  it('Calls handleDeletionSubmit on deletion submit', () => {
    const handleDeletionSubmit = sinon.fake();
    const deletionRequestedState = [true, sinon.fake()];
    const component = render({handleDeletionSubmit, deletionRequestedState});
    findDeletionConfirmationBox(component).invoke("onSubmit")();
    expect(handleDeletionSubmit.args).toEqual([[]]);
  });

});

describe('DeleteButton', () => {

  const defaultProps = () => ({
    deletionRequestedState: [false, () => {}],
  });

  const render = (props) => mount(<sut.DeleteButton {...defaultProps()} {...props}/>);
  
  it('Is disabled if deletionRequested', () => {
    const deletionRequestedState = [true, () => {}];
    const component = render({deletionRequestedState});
    expect(component.find('button').props().disabled).toBe(true);
  });

  it('Sets deletionRequested onClick', () => {
    const deletionRequestedState = [false, sinon.fake()];
    const component = render({deletionRequestedState});
    component.find('button').simulate('click');
    expect(deletionRequestedState[1].args).toEqual([[true]]);
  });

});


describe('DeletionConfirmationBox', () => {
  
  const defaultProps = () => ({
    deletionRequestedState: [false, () => {}],
    onSubmit: () => {},
  });

  const render = (props) => mount(<sut.DeletionConfirmationBox {...defaultProps()} {...props}/>);

  it('Sets deetionRequested to false on click at "no"', () => {
    const deletionRequestedState = [false, sinon.fake()];
    const component = render({deletionRequestedState});
    component.find('button').at(1).simulate("click");
    expect(deletionRequestedState[1].args).toEqual([[false]]);
  });

  it('Calls onSubmit on click on yes', () => {
    const onSubmit = sinon.fake();
    const component = render({onSubmit});
    component.find('button').at(0).simulate('click');
    expect(onSubmit.args).toEqual([[]]);
  });

});

describe('handleDeletionSubmit', () => {

  const defaultOpts = () => ({
    deletionRequestedState: [true, () => {}],
    errorMessageState: [null, () => {}],
    pickedTransactionState: [TransactionFactory.build(), () => {}],
    deleteTransactionFn: async () => {},
  });

  const run = (opts) => sut.handleDeletionSubmit({...defaultOpts(), ...opts});

  it('sets pickedTransaction to null', async () => {
    const pickedTransactionState = [TransactionFactory.build(), sinon.fake()];
    await run({pickedTransactionState});
    expect(pickedTransactionState[1].args).toEqual([[null]]);
  });

  it('sets error message to null', async () => {
    const errorMessageState = ["FOO", sinon.fake()];
    await run({errorMessageState});
    expect(errorMessageState[1].args).toEqual([[null]]);
  });

  it('sets deletion requested to false', async () => {
    const deletionRequestedState = [true, sinon.fake()];
    await run({deletionRequestedState});
    expect(deletionRequestedState[1].args).toEqual([[false]]);
  });

  it('runs call to delete transaction', async () => {
    const deleteTransactionFn = sinon.fake.resolves();
    const pickedTransactionState = [TransactionFactory.build(), () => {}];
    await run({pickedTransactionState, deleteTransactionFn});
    expect(deleteTransactionFn.args).toEqual([[pickedTransactionState[0]]]);
  });

});
