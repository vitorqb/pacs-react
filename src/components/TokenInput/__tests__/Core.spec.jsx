import { mount } from 'enzyme';
import React from 'react';
import * as R from 'ramda';
import sinon from 'sinon';
import * as sut from '../Core';

const mountTokenInput = props => {
  const finalProps = R.clone(props);
  finalProps.value = props.value;
  finalProps.onChange = props.onChange || sinon.fake();
  return mount(<sut.TokenInput {...finalProps} />);
};

const findInput = c => c.find('input');
const simulateInputChange = (c, v) => findInput(c).props().onChange({target: {value: v}});
const getOnChange = c => c.props().onChange;

describe('TokenInput', () => {
  it('Changes value', () => {
    const component = mountTokenInput({});
    simulateInputChange(component, "FOO");
    expect(getOnChange(component).args)
      .toEqual([[R.set(sut.valueLens.token, "FOO", {})]]);
  });
});
