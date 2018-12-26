import { mount } from 'enzyme';
import React from 'react';
import { CurrencyFactory } from '../../testUtils';
import CurrencyInput from '../CurrencyInput';
import sinon from 'sinon';
import Select from 'react-select';

describe('CurrencyInput', () => {

  let currencies, value, onChange, curInput;

  beforeEach(() => {
    currencies = CurrencyFactory.buildList(3);
    value = currencies[1]
    onChange = sinon.fake()
    curInput = mount(
      <CurrencyInput
        currencies={currencies}
        value={value}
        onChange={onChange} />
    )
  })

  it('Sets value to selectedCur', () => {
    expect(curInput.find(Select).props().value).toEqual({value, label: value.name});
  })
  it('Calls onChange with selected currency', () => {
    curInput.find(Select).props().onChange({value, label: value.name});
    expect(onChange.calledWith(value)).toBe(true);
  })
  it('Parses options to Select', () => {
    const expOptions = currencies.map(x => ({value: x, label: x.name}));
    expect(curInput.find(Select).props().options).toEqual(expOptions);
  })
})
