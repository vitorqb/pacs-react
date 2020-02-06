import React from 'react';
import { mount } from 'enzyme';
import * as sut from '../CurrencyExchangeRateDataFetcherComponent';
import * as R from 'ramda';
import DateInput from '../../components/DateInput';
import * as RU from '../../ramda-utils';
import moment from 'moment';

describe('CurrencyExchangeRateDataFetcherComponent', () => {

  describe('Simple mounting...', () => {

    const component = mount(<sut.CurrencyExchangeRateDataFetcherComponent />);

    it('Renders a date picker for start at...', () => {
      const found = component.find(sut._DatePicker).findWhere(labelInPropsEqual("Start at"));
      expect(found).toHaveLength(1);
    });

    it('Renders a date picker for end at...', () => {
      const found = component.find(sut._DatePicker).findWhere(labelInPropsEqual("End at"));
      expect(found).toHaveLength(1);
    });

    it('Renders a currency code picker...', () => {
      const found = component.find(sut._CurrencyCodesPicker);
      expect(found).toHaveLength(1);
    });
    
  });
  
});

describe('_CurrencyCodesPicker', () => {

  describe('Base', () => {
    const value = {};
    const onChange = x => x;
    const x = {value: ["FOO"]};
    const result = sut._handleCurrencyCodeNewValue(value, onChange, x);

    it('Sets currency codes raw value', () => {
      expect(R.view(sut.valueLens._currencyCodesRawValue, result)).toEqual(x);
    });
    
    it('Sets currency codes value', () => {
      expect(R.view(sut.valueLens.currencyCodes, result)).toEqual(x.value);
    });
  });
  
});

describe('_DatePicker', () => {

  it('Renders span with label', () => {
    const label = "foo";
    const value = moment("2019-01-01");
    const onChange = x => x;
    const component = mount(<sut._DatePicker value={value} onChange={onChange} label={label} />);
    expect(component.find("span").html()).toEqual("<span>foo</span>");
  });

  describe('Renders a DateInput...', () => {
    const label = "foo";
    const value = moment("2019-01-01");
    const onChange = x => x;
    const component = mount(<sut._DatePicker value={value} onChange={onChange} label={label} />);

    it('Only one', () => {
      expect(component.find(DateInput)).toHaveLength(1);
    });

    it('With correct value', () => {
      expect(component.find(DateInput).props().value).toEqual(value);
    });

    it('onChange calls reducer', () => {
      const onChangeProp = component.find(DateInput).props().onChange;
      const newInput = moment("1993-11-23");
      const newValue = onChangeProp(newInput);
      expect(newValue).toEqual(newInput);
    });
  });
  
});


/**
 * Check if an element has the label props equal to `x`.
 */
const labelInPropsEqual = R.curry((x, element) => element.props().label == x);
  
