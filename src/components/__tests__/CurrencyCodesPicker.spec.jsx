import React from 'react';
import { mount } from 'enzyme';
import * as sut from '../CurrencyCodesPicker';
import * as RU from '../../ramda-utils';


describe('CurrencyCodesPicker', () => {

  describe('Base mounting...', () => {
    const value = RU.objFromPairs(
      sut.valueLens._inputValue, "FOO, BAR",
      sut.valueLens.value, ["FOO", "BAR"],
    );
    const component = mount(<sut.CurrencyCodesPicker value={value} />);

    it('Renders an input with value.', () => {      
      expect(component.find("input").props().value).toEqual("FOO, BAR");
    });

    it('Reacts to changes', () => {
      const event = {target: {value: "BAR"}, preventDefault: () => null};
      const setValue = x => x;
      const component = mount(<sut.CurrencyCodesPicker value={value} setValue={setValue} />);
      const onChangeProps = component.find("input").props().onChange;
      const expNewValue = RU.objFromPairs(
        sut.valueLens._inputValue, "BAR",
        sut.valueLens.value, ["BAR"],
      );
      expect(onChangeProps(event)).toEqual(expNewValue);
    });
  });
});

describe('_handleChange', () => {

  const setValue = x => ["SETVALUE", x];
  const event = {target: {value: "1"}, preventDefault: () => null};

  describe('Calls setValue wth a new valid value', () => {
    const expNewValue = RU.objFromPairs(
      sut.valueLens._inputValue, "1",
      sut.valueLens.value, ["1"],
    );
    expect(sut._handleChange(setValue, event)).toEqual(setValue(expNewValue));
  });
  
});

describe('inputValueToValue', () => {

  it('Null', () => {
    expect(sut._inputValueToValue(null)).toEqual([]);
  });

  it('Empty String', () => {
    expect(sut._inputValueToValue("")).toEqual([]);
  });

  it('Two long', () => {
    expect(sut._inputValueToValue("FOO,  b")).toEqual(["FOO", "b"]);
  });
  
});
