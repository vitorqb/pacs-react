import React from 'react';
import {mount} from 'enzyme';
import DateInput from '../DateInput.jsx';
import sinon from 'sinon';
import moment from 'moment';
import * as sut from '../DateInput.jsx';
import * as R from 'ramda';
import { act } from 'react-dom/test-utils';

describe('DateInput', () => {

  let dateInput, onChange;

  beforeEach(() => {
    onChange = sinon.fake();
    dateInput = mount(<DateInput onChange={onChange} />);
  });

  function simulateRawInput(dateInput, value) {
    dateInput.find('input[name="date"]').props().onChange({target: {value}});
    dateInput.update();
  }

  describe('Synchronizes value with date input', () => {

    it('Value prop appears on input', () => {
      const value = "2020-01-01";
      dateInput = mount(<DateInput onChange={() => {}} value={value}/>);
      expect(dateInput.find('input[name="date"]').props().value).toBe(value);
    });

  });

  describe('Calls onChange callback', () => {

    it('Calls with a date if valid entry', () => {
      simulateRawInput(dateInput, "2018-01-01");
      expect(onChange.calledOnce).toBe(true);
      expect(onChange.lastCall.args).toEqual(
        [{userInput: "2018-01-01", pickedDate: moment.utc("2018-01-01", "YYYY-MM-DD", true)}]
      );
    });

    it('Calls without a date if not a valid entry', () => {
      simulateRawInput(dateInput, "2018-01-");
      expect(onChange.calledOnce).toBe(true);
      expect(onChange.lastCall.args).toEqual(
        [{userInput: "2018-01-", pickedDate: null}]
      );
    });

  });
  
});

describe('DateInputStateHandler', () => {

  const mountComponent = props => {
    const defaultProps = {onDatePicked: ()=>{}};
    const finalProps = R.mergeDeepRight(defaultProps, props);
    return mount(
      <sut.DateInputStateHandler {...finalProps}>
        {dateInputProps =>
          <DateInput {...dateInputProps}/>
        }
      </sut.DateInputStateHandler>
    );
  };

  it('Renders a DateInput with value', () => {
    const comp = mountComponent({});

    act(() => {
      comp.find(DateInput).props().onChange({userInput: "2020"});
    });
    comp.update();
    
    expect(comp.find(DateInput).props().value).toEqual("2020");
  });

  it('Calls onDatePicked with new date when underlying DateInput changes', () => {
    const onDatePicked = sinon.stub();
    const userInput = "2020-01-01";
    const pickedDate = moment.utc(userInput);
    const onChangeEvent = {userInput, pickedDate};
    const comp = mountComponent({onDatePicked});

    act(() => {
      comp.find(DateInput).props().onChange(onChangeEvent);
    });

    expect(onDatePicked.args).toEqual([[pickedDate]]);
  });

  it('Calls onDatePicked with new date when underlying DateInput changes (null value)', () => {
    const onDatePicked = sinon.stub();
    const userInput = "2020-01-";
    const pickedDate = null;
    const onChangeEvent = {userInput, pickedDate};
    const comp = mountComponent({onDatePicked});

    act(() => {
      comp.find(DateInput).props().onChange(onChangeEvent);
    });

    expect(onDatePicked.args).toEqual([[pickedDate]]);
  });
  
});
