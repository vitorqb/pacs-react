import React from 'react';
import { mount } from 'enzyme';
import * as sut from '../DeleteTransactionComponent';
import TransactionPicker from '../TransactionPicker.jsx';
import { TransactionFactory } from '../../testUtils.jsx';
import { act } from 'react-dom/test-utils';
import { waitFor } from '../../testUtils.jsx';


describe('DeleteTransactionComponent', () => {

  const defaultProps = {};

  const render = (props) => {
    const finalProps = {...defaultProps, ...props};
    return mount(<sut.DeleteTransactionComponent {...props}/>);
  };

  const findDeleteButton = c => c.find('[data-testid="delete-button"]');
  const findTransactionDisplayer = c => c.find('TransactionDisplayer');

  it('Displays the transaction once its selected', async () => {
    const component = render();
    const transaction = TransactionFactory.build();

    expect(findTransactionDisplayer(component)).toHaveLength(0);
    act(() => {
      component.find(TransactionPicker).props().onPicked(transaction);
    });
    await waitFor(() => {
      component.update();
      return findTransactionDisplayer(component).length > 0;
    });
    expect(findTransactionDisplayer(component).props().transaction).toEqual(transaction);
  });

  it('Displays the delete button once an transaction is selected', async () => {
    const component = render();
    const transaction = TransactionFactory.build();

    expect(findDeleteButton(component)).toHaveLength(0);
    act(() => {
      component.find(TransactionPicker).props().onPicked(transaction);
    });
    await waitFor(() => {
      component.update();
      return findDeleteButton(component).length > 0;
    });
    expect(findDeleteButton(component)).toHaveLength(1);
  });

});
