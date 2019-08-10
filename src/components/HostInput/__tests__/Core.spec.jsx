import { mount } from 'enzyme';
import React from 'react';
import * as R from 'ramda';
import sinon from 'sinon';
import * as sut from '../Core';
import HostInput from '../Core';

const mountHostInput = props => {
  const finalProps = R.clone(props);
  finalProps.value = props.value || {};
  finalProps.onChange = props.onChange || sinon.fake();
  return mount(<HostInput {...finalProps} />);
};

const findInput = c => c.find('input');
const simulateUserInput = (c, v) => findInput(c).props().onChange({target: {value: v}});

describe('HostInput', () => {
  it('OnChange', () => {
    const component = mountHostInput({});
    simulateUserInput(component, "127.0.0.1");
    expect(component.props().onChange.args).toEqual([
      [R.set(sut.valueLens.host, "127.0.0.1", {})]
    ]);
  });
});
