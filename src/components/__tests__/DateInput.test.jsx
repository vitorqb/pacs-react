import React from 'react';
import {mount} from 'enzyme';
import DateInput from '../DateInput.jsx';
import sinon from 'sinon';
import moment from 'moment';

describe('DateInput', () => {

  let dateInput, onChange;

  beforeEach(() => {
    onChange = sinon.fake();
    dateInput = mount(<DateInput onChange={onChange} />);
  })

  function simulateRawInput(dateInput, value) {
    dateInput.find('input[name="date"]').props().onChange({target: {value}});
    dateInput.update();
  }

  describe('Synchronizes rawValue with date input', () => {

    it('Input changes => rawValue changes', () => {
      const newRawValue = "2018-01-04";
      simulateRawInput(dateInput, newRawValue);
      expect(dateInput.state().rawValue).toBe(newRawValue);
    })

    it('RawValue chanes => input changes', () => {
      const newRawValue = "1993-11-23";
      dateInput.setState({rawValue: newRawValue})
      dateInput.update()
      expect(dateInput.find('input[name="date"]').props().value).toBe(newRawValue);
    })

    it('Value prop => rawValue changes', () => {
      const value = moment.utc("1997-12-23");
      dateInput = mount(<DateInput onChange={()=>{}} value={value} />)
      expect(dateInput.state().rawValue).toBe(value.format("YYYY-MM-DD"));
    })
  })

  describe('Calling onChange callback', () => {

    it('Calls with null on incorrect date', () => {
      simulateRawInput(dateInput, "not a valid date");
      expect(onChange.calledOnce).toBe(true);
      expect(onChange.lastCall.args).toEqual([null]);
    })

    it('Calls with moment object on correct date', () => {
      simulateRawInput(dateInput, "2018-01-01");
      expect(onChange.calledOnce).toBe(true);
      expect(onChange.lastCall.args).toEqual(
        [moment.utc("2018-01-01", "YYYY-MM-DD", true)]
      );
    })

  })
  
})
