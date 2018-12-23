import { mount } from 'enzyme';
import React from 'react';
import { CurrencyFactory } from '../../testUtils';
import CurrencyInput from '../CurrencyInput';
import sinon from 'sinon';
import Select from 'react-select';

describe('CurrencyInput', () => {

  let currencies, selectedCur, onChange, curInput;

  beforeEach(() => {
    currencies = CurrencyFactory.buildList(3);
    selectedCur = currencies[1]
    onChange = sinon.fake()
    curInput = mount(
      <CurrencyInput
        currencies={currencies}
        selectedCur={selectedCur}
        onChange={onChange} />
    )
  })

  it('Sets value to selectedCur', () => {
    expect(curInput.find(Select).props().value).toBe(selectedCur);
  })
  it('Calls onChange with selected currency', () => {
    curInput.find(Select).props().onChange({
      label: selectedCur.name, value: selectedCur
    });
    expect(onChange.calledWith(selectedCur)).toBe(true);
  })
  it('Parses options to Select', () => {
    const expOptions = currencies.map(x => ({value: x, label: x.name}));
    expect(curInput.find(Select).props().options).toEqual(expOptions);
  })
})
