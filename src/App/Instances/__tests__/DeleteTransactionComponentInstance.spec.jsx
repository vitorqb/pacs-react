import React from 'react';
import { mount } from 'enzyme';
import * as sut from '../DeleteTransactionComponentInstance.jsx';
import * as RU from '../../../ramda-utils.js';
import * as Ajax from '../../Ajax.jsx';
import * as R from 'ramda';


describe('DeleteTransactionComponentInstance', () => {

  const defaultProps = {};

  const render = (props) => {
    const finalProps = {...defaultProps, ...props};
    return mount(<sut.DeleteTransactionComponentInstance {...finalProps}/>);
  };

  it('Mounts component with correct props', () => {
    const getTransaction = () => {};
    const ajaxInjections = RU.objFromPairs(Ajax.lens.getTransaction, getTransaction);
    const renderArgs = { ajaxInjections };

    const component = render(renderArgs);

    const expectedProps = {getTransaction};
    expect(component.find('DeleteTransactionComponent').props()).toEqual(expectedProps);
  });

});
