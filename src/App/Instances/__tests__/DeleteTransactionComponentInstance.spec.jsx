import React from 'react';
import { mount } from 'enzyme';
import * as sut from '../DeleteTransactionComponentInstance.jsx';
import * as R from 'ramda';
import * as RU from '../../../ramda-utils.js';
import * as Ajax from '../../Ajax.jsx';
import * as AppContext from '../../AppContext.jsx';
import { AccountFactory, CurrencyFactory, TransactionFactory } from '../../../testUtils.jsx';
import sinon from 'sinon';
import { waitFor } from '../../../testUtils.jsx';
import { act } from 'react-dom/test-utils';
import TransactionDisplayer from '../../../components/TransactionDisplayer.jsx';


const defaultProps = () => ({
  ajaxInjections: RU.objFromPairs(
    Ajax.lens.getTransaction, () => Promise.resolve(TransactionFactory.build()),
    Ajax.lens.deleteTransaction, () => Promise.resolve(),
  ),
  appContextGetters: RU.objFromPairs(
    AppContext.lens.accounts, () => AccountFactory.build(),
    AppContext.lens.currencies, () => CurrencyFactory.build(),
  ),
});

const render = (props) => {
  const finalProps = {...defaultProps, ...props};
  return mount(<sut.DeleteTransactionComponentInstance {...finalProps}/>);
};

describe('DeleteTransactionComponentInstance', () => {

  it('Mounts component with correct props', () => {
    const getTransaction = () => TransactionFactory.build();
    const getAccount = () => AccountFactory.build();
    const getCurrency = () => CurrencyFactory.build();
    const ajaxInjections = RU.objFromPairs(Ajax.lens.getTransaction, getTransaction);
    const appContextGetters = RU.objFromPairs(
      AppContext.lens.accounts, getAccount,
      AppContext.lens.currencies, getCurrency,
    );
    const renderArgs = { ajaxInjections, appContextGetters };

    const component = render(renderArgs);

    const expectedProps = {getTransaction, getAccount, getCurrency};
    expect(component.find('DeleteTransactionComponent').props()).toEqual(expectedProps);
  });

});

describe('FT - DeleteTransactionComponentInstance', () => {

  it('Sends a delete request after user selects a transaction', async () => {
    const transaction = TransactionFactory.build({pk: 1});
    const getTransaction = () => Promise.resolve(transaction);
    const deleteTransaction = sinon.fake.resolves();
    const props = R.evolve({
      ajaxInjections: R.pipe(
        R.set(Ajax.lens.getTransaction, getTransaction),
        R.set(Ajax.lens.deleteTransaction, deleteTransaction),
      )
    })(defaultProps());
    const component = render(props);

    await act(async () => {
      component
        .find('TransactionPicker')
        .find('input[name="pk"]')
        .simulate('change', { target: { value: '1' } });

      component
        .find('TransactionPicker')
        .find('form')
        .simulate("submit");

      await waitFor(() => {
        component.update();
        return component.find('DeleteButton').length > 0;
      });

      component
        .find('DeleteButton')
        .find('button')
        .simulate('click');

      component
        .find('DeletionConfirmationBox')
        .find('button')
        .at(0)
        .simulate('click');

      expect(deleteTransaction.args).toEqual([[transaction]]);

      await waitFor(() => {
        component.update();
        return component.find(TransactionDisplayer).length == 0;
      });

      expect(component.find(TransactionDisplayer)).toHaveLength(0);
    });
  });

  it('Displays an error message if transaction does not exist', async () => {
    const getTransaction = () => Promise.reject("Some error!");
    const props = R.evolve({
      ajaxInjections: R.set(Ajax.lens.getTransaction, getTransaction)
    })(defaultProps());
    const component = render(props);

    await act(async () => {
      component
        .find('TransactionPicker')
        .find('input[name="pk"]')
        .simulate('change', { target: { value: '1' } });

      component
        .find('TransactionPicker')
        .find('form')
        .simulate("submit");

      await waitFor(() => {
        component.update();
        return component.find('ErrorMessage').find('pre').length > 0;
      });

      expect(component.find('ErrorMessage').find('pre').html()).toContain("Some error!");
    });
  });

});
