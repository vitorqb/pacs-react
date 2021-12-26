import React from 'react';
import { mount } from 'enzyme';
import * as sut from '../DeleteTransactionComponent';
import { AccountFactory, CurrencyFactory, TransactionFactory } from '../../testUtils.jsx';
import { waitFor } from '../../testUtils.jsx';


describe('DeleteTransactionComponent', () => {

  const defaultProps = () => ({
    getTransaction: () => TransactionFactory.build(),
    getAccount: () => AccountFactory.build(),
    getCurrency: () => CurrencyFactory.build(),
  });

  const render = (props) => {
    return mount(<sut.DeleteTransactionComponent {...defaultProps()} {...props}/>);
  };

  const findDeleteButton = c => c.find('[data-testid="delete-button"]');
  const findTransactionDisplayer = c => c.find('TransactionDisplayer');
  const findTransactionPicker = c => c.find('TransactionPicker');
  const findErrorMessage = c => c.find('ErrorMessage');

  it('Displays the transaction once its selected', async () => {
    const component = render();
    const transaction = TransactionFactory.build();

    expect(findTransactionDisplayer(component)).toHaveLength(0);
    findTransactionPicker(component).invoke('onPicked')(transaction);
    await waitFor(() => {
      component.update();
      return findTransactionDisplayer(component).length > 0;
    });
    expect(findTransactionDisplayer(component).props().transaction).toEqual(transaction);
  });

  it('Renders TransactionDisplayer with proper props', async () => {
    const props = defaultProps();
    const component = render(props);
    const transaction = TransactionFactory.build();

    findTransactionPicker(component).invoke('onPicked')(transaction);
    await waitFor(() => {
      component.update();
      return findTransactionDisplayer(component).length > 0;
    });

    const expectedProps = {
      getAccount: props.getAccount,
      getCurrency: props.getCurrency,
      transaction,
    };
    expect(findTransactionDisplayer(component).props()).toEqual(expectedProps);
  });

  it('Displays the delete button once an transaction is selected', async () => {
    const component = render();
    const transaction = TransactionFactory.build();

    expect(findDeleteButton(component)).toHaveLength(0);
    findTransactionPicker(component).invoke('onPicked')(transaction);
    await waitFor(() => {
      component.update();
      return findDeleteButton(component).length > 0;
    });
    expect(findDeleteButton(component)).toHaveLength(1);
  });

  it('Displays error if something goes wrong', () => {
    const component = render();
    expect(findErrorMessage(component).props().value).toEqual(null);
    findTransactionPicker(component).invoke('onGetTransactionFailure')('Foo');
    waitFor(() => {
      component.update();
      return findErrorMessage(component).props().value == "Foo";
    });
    expect(findErrorMessage(component).props().value).toEqual("Foo");
  });

  it('Cleans up error msg on new submit', async () => {
    const component = render();
    const transaction = TransactionFactory.build();

    findTransactionPicker(component).invoke('onGetTransactionFailure')("Foo");
    await waitFor(() => {
      component.update();
      return findErrorMessage(component).props().value == "Foo";
    });

    findTransactionPicker(component).invoke('onPicked')(transaction);
    await waitFor(() => {
      component.update();
      return findErrorMessage(component).props().value == null;
    });

    expect(findErrorMessage(component).props().value).toEqual(null);
  });

  it('Cleans up picked transaction on error', async () => {
    const component = render();
    const transaction = TransactionFactory.build();

    findTransactionPicker(component).invoke('onPicked')(transaction);
    await waitFor(() => {
      component.update();
      return findTransactionDisplayer(component).length == 1;
    });

    findTransactionPicker(component).invoke('onGetTransactionFailure')("Foo");
    await waitFor(() => {
      component.update();
      return findTransactionDisplayer(component).length == 0;
    });
    
    expect(findTransactionDisplayer(component)).toHaveLength(0);
    
  });

});
