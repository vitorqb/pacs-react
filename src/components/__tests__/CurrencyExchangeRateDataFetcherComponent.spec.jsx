import React, { useState } from 'react';
import { mount } from 'enzyme';
import * as sut from '../CurrencyExchangeRateDataFetcherComponent';
import * as R from 'ramda';
import DateInput from '../../components/DateInput';
import {DateInputStateHandler} from '../../components/DateInput';
import * as RU from '../../ramda-utils';
import moment from 'moment';
import sinon from 'sinon';
import { updateComponent, useStateMock } from '../../testUtils';
import { act } from 'react-dom/test-utils';

describe('CurrencyExchangeRateDataFetcherComponent', () => {

  const TestWrapper = (props={}) => {
    const [value, onChange] = useState(props.value || {});
    return (
      <sut.CurrencyExchangeRateDataFetcherComponent
        {...props}
        value={value}
        onChange={onChange}
      />
    );
  };

  const renderComponent = (props={}) => mount(<TestWrapper {...props}/>);
  describe('Simple mounting...', () => {

    it('Renders a date picker for start at...', () => {
      const found = renderComponent().find(sut._DatePicker).findWhere(labelInPropsEqual("Start at"));      expect(found).toHaveLength(1);
    });

    it('Renders a date picker for end at...', () => {
      const found = renderComponent().find(sut._DatePicker).findWhere(labelInPropsEqual("End at"));
      expect(found).toHaveLength(1);
    });

    it('Renders a currency code picker...', () => {
      const found = renderComponent().find(sut._CurrencyCodesPicker);
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
      expect(component.find(DateInput).props().value).toEqual(value.format("YYYY-MM-DD"));
    });
    it('onChange calls reducer', () => {
      const onChangeProp = component.find(DateInputStateHandler).props().onDatePicked;
      const newInput = moment("1993-11-23");
      const newValue = onChangeProp(newInput);
      expect(newValue).toEqual(newInput);
    });
  });
  
});

describe('_submitHandler', () => {

  afterEach(() => {
    sinon.restore();
  });

  describe('handleSubmit', () => {

    const value = {};
    const setValue = () => null;
    const fetchCurrencyExchangeRateDataComponent = () => null;
    const e = {preventDefault: () => null};

    it('Calls _handleValidSubmit if submit is valid', () => {
      const handleValidSubmit = sinon.stub(sut._submitHandler, '_handleValidSubmit');
      sinon.stub(sut._submitHandler, '_isValidStateForSubmission').returns(true);
      sut._submitHandler.handleSubmit(value, setValue, fetchCurrencyExchangeRateDataComponent, e);
      expect(handleValidSubmit.args).toHaveLength(1);
      expect(handleValidSubmit.args[0]).toEqual([value, setValue, fetchCurrencyExchangeRateDataComponent]);
    });
    
  });

  describe('_getErrorMessage', () => {

    it('startAt is nil', () => {
      const value = RU.objFromPairs(
        sut.valueLens.endAt, moment("2019-01-01"),
        sut.valueLens.currencyCodes, ["FOO"],
      );
      const errMsg = sut._submitHandler._errMsgs.invalidStartAt;
      expect(sut._submitHandler._getErrorMessage(value, {})).toEqual(errMsg);
    });
    
    it('endAt is nil', () => {
      const value = RU.objFromPairs(
        sut.valueLens.startAt, moment("2019-01-01"),
        sut.valueLens.currencyCodes, ["FOO"],
      );
      const errMsg = sut._submitHandler._errMsgs.invalidEndAt;
      expect(sut._submitHandler._getErrorMessage(value, {})).toEqual(errMsg);
    });

    it('currencyCodes is empty', () => {
      const value = RU.objFromPairs(
        sut.valueLens.endAt, moment("2019-01-01"),
        sut.valueLens.startAt, moment("2019-01-01"),
        sut.valueLens.currencyCodes, [],
      );
      const errMsg = sut._submitHandler._errMsgs.invalidCurrencyCodes;
      expect(sut._submitHandler._getErrorMessage(value, {})).toEqual(errMsg);
    });

    it('currencyCodes is null', () => {
      const value = RU.objFromPairs(
        sut.valueLens.endAt, moment("2019-01-01"),
        sut.valueLens.startAt, moment("2019-01-01"),
      );
      const errMsg = sut._submitHandler._errMsgs.invalidCurrencyCodes;
      expect(sut._submitHandler._getErrorMessage(value, {})).toEqual(errMsg);
    });

  });

  describe('_handleInvalidSubmit', () => {

    it('Sets error message', () => {
      sinon.stub(sut._submitHandler, '_getErrorMessage').returns("FOO");
      const value = {};
      const newValue = sut._submitHandler._handleInvalidSubmit(value, x => x, {});
      expect(R.view(sut.valueLens._errorMessage, newValue)).toEqual("FOO");
    });
    
  });

  describe('_reduceValueBeforeSubmit', () => {

    const errMsg = "FOO";
    const isLoading = false;
    const value = RU.objFromPairs(
      sut.valueLens.isLoading, isLoading,
      sut.valueLens._errorMessage, errMsg,
    );
    const setValue = x => x;
    const result = sut._submitHandler._reduceValueBeforeSubmit(setValue, value);

    it('Sets loading to true', () => {
      expect(R.view(sut.valueLens.isLoading, result)).toBe(true);
    });

    it('Cleans error message', () => {
      expect(R.view(sut.valueLens._errorMessage, result)).toBe(null);
    });
    
  });

  describe('_failedRequestHandler', () => {
    const value = {};
    const setValue = x => x;
    const error = "ERROR";
    const result = sut._submitHandler._failedRequestHandler(value, setValue, error);

    it('Sets error', () => {
      expect(R.view(sut.valueLens._errorMessage, result)).toEqual(error);
    });

    it('Sets loading to false', () => {
      expect(R.view(sut.valueLens.isLoading, result)).toEqual(false);      
    });
    
  });

  describe('_submit', () => {

    const startAt = moment("2020-01-01");
    const endAt = moment("2020-01-02");
    const currencyCodes = ["FOO", "BAR"];
    const value = RU.objFromPairs(
      sut.valueLens.startAt, startAt,
      sut.valueLens.endAt, endAt,
      sut.valueLens.currencyCodes, currencyCodes,
    );
    const fetch = x => x;

    it('Fetch with values ', () => {
      const result = sut._submitHandler._submit(value, fetch);
      expect(result).toEqual({ startAt, endAt, currencyCodes });
    });
    
  });
  
});


/**
 * Check if an element has the label props equal to `x`.
 */
const labelInPropsEqual = R.curry((x, element) => element.props().label === x);
  
