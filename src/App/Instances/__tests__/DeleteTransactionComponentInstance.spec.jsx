import React from 'react';
import { mount } from 'enzyme';
import * as sut from '../DeleteTransactionComponentInstance.jsx';
import * as RU from '../../../ramda-utils.js';
import * as Ajax from '../../Ajax.jsx';
import * as AppContext from '../../AppContext.jsx';
import { AccountFactory, CurrencyFactory, TransactionFactory } from '../../../testUtils.jsx';


describe('DeleteTransactionComponentInstance', () => {

  const defaultProps = () => ({
    getTransaction: () => TransactionFactory.build(),
    getAccount: () => AccountFactory.build(),
    getCurrency: () => CurrencyFactory.build(),
  });

  const render = (props) => {
    const finalProps = {...defaultProps, ...props};
    return mount(<sut.DeleteTransactionComponentInstance {...finalProps}/>);
  };

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
