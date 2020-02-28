import React from 'react';
import * as sut from '../YesNoButton';
import { mount } from 'enzyme';
import * as RU from '../../ramda-utils';
import * as R from 'ramda';

function mountYesNoButton({ value=true }) {
  const state = RU.objFromPairs(sut.StateLens.value, value);
  return mount(<sut.YesNoButton state={state}/>);
}

describe('YesNoButton', () => {

  it('Renders a button with className', () => {
    let c = mountYesNoButton({ value: true });
    let button = c.find("button");
    expect(button).toHaveLength(1);
    expect(button.props().className).toEqual(sut._classNameForValue(true));
  });
  
});

describe('classNameForValue', () => {

  it('True', () => {
    expect(sut._classNameForValue(true)).toEqual("yes-no-button yes-no-button--yes");
  });

  it('False', () => {
    expect(sut._classNameForValue(false)).toEqual("yes-no-button yes-no-button--no");
  });

});

describe('textForValue', () => {

  it('True', () => {
    expect(sut._textForValue(true)).toEqual("yes");
  });

  it('False', () => {
    expect(sut._textForValue(false)).toEqual("no");
  });

});

describe('handleUserClickFromProps', () => {

  it('Base', () => {
    let state = RU.objFromPairs(sut.StateLens.value, true);
    let newState = sut._handleUserClickFromProps({ state, onChange: x => x });
    expect(newState).toEqual(R.set(sut.StateLens.value, false, state));
  });
  
});
