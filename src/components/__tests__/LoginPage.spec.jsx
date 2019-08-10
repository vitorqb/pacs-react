import { mount } from 'enzyme';
import React from 'react';
import * as R from 'ramda';
import sinon from 'sinon';
import LoginPage from '../LoginPage';
import * as sut from '../LoginPage';

const mountLoginPage = props => {
  const finalProps = R.clone(props);
  if (finalProps.value === undefined) { finalProps.value = {}; };
  if (finalProps.onChange === undefined) { finalProps.onChange = sinon.fake(); };
  if (finalProps.onSubmit === undefined) { finalProps.onSubmit = sinon.fake(); };
  return mount(<LoginPage {...finalProps} />);
};

const findHostInput = c => c.find('HostInput');
const simulateHostInputChange = (c, v) => findHostInput(c).props().onChange(v);
const findTokenInput = c => c.find('TokenInput');
const simulateTokenInputChange = (c, v) => findTokenInput(c).props().onChange(v);

describe('LoginPage', () => {

  describe('Change on host value', () => {

    it('base', () => {
      const component = mountLoginPage({});
      simulateHostInputChange(component, "foo");
      expect(component.props().onChange.args).toEqual([
        [R.set(sut.valueLens.hostValue, "foo", {})]
      ]);
    });
    
  });

  describe('Change on token value', () => {

    it('base', () => {
      const component = mountLoginPage({});
      simulateTokenInputChange(component, "foo");
      expect(component.props().onChange.args).toEqual([
        [R.set(sut.valueLens.tokenValue, "foo", {})]
      ]);
    });
    
  });

});
