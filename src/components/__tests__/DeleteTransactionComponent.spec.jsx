import React from 'react';
import { mount } from 'enzyme';
import * as sut from '../DeleteTransactionComponent';
import { AccountFactory, CurrencyFactory, TransactionFactory, useStateMock } from '../../testUtils.jsx';
import { waitFor } from '../../testUtils.jsx';
import sinon from 'sinon';


describe('DeleteTransactionComponentCore', () => {

  const defaultProps = () => ({
    getTransaction: () => TransactionFactory.build(),
    getAccount: () => AccountFactory.build(),
    getCurrency: () => CurrencyFactory.build(),
    transactionState: [null, () => {}],
    errorMessageState: [null, () => {}],
  });

  const render = (props) => {
    return mount(<sut.DeleteTransactionComponentCore {...defaultProps()} {...props}/>);
  };

  const findDeleteButton = c => c.find('[data-testid="delete-button"]');
  const findTransactionDisplayer = c => c.find('TransactionDisplayer');
  const findTransactionPicker = c => c.find('TransactionPicker');
  const findErrorMessage = c => c.find('ErrorMessage');

  describe('...TransactionDisplayer', () => {

    it('is not rendered if no transaction', () => {
      const component = render({transactionState: [null, () => {}]});
      expect(findTransactionDisplayer(component)).toHaveLength(0);
    });

    it('Renders with proper props when has a transaction', async () => {
      const transaction = TransactionFactory.build();
      const transactionState = [transaction, () => {}];
      const props = {...defaultProps(), transactionState};
      const component = render(props);
      const expectedProps = {
        getAccount: props.getAccount,
        getCurrency: props.getCurrency,
        transaction,
      };
      expect(findTransactionDisplayer(component).props()).toEqual(expectedProps);
    });
    
  });

  describe('...DeleteButton', () => {

    it('Is not rendered if a transaction is not selected', () => {
      const component = render({transactionState: [null, () => {}]});
      expect(findDeleteButton(component)).toHaveLength(0);
    });

    it('Is rendered if a transaction is selected', async () => {
      const transaction = TransactionFactory.build();
      const transactionState = [transaction, () => {}];
      const component = render({transactionState});
      expect(findDeleteButton(component)).toHaveLength(1);
    });
  });

  describe('...Error handling', () => {

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
  });


  it('Cleans up picked transaction on error', async () => {
    const transactionState = [TransactionFactory.build(), sinon.fake()];
    const component = render({transactionState});
    findTransactionPicker(component).invoke('onGetTransactionFailure')("Foo");
    expect(transactionState[1].args).toEqual([[null]]);    
  });

});
