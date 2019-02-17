import React, { createElement, Component } from 'react';
import { mount } from 'enzyme';
import MonthPicker, { YearPicker, MonthNamePicker } from '../MonthPicker';
import sinon from 'sinon';
import * as R from 'ramda';


/**
 * Returns a very simple wrapper component for test.
 */
function makeWrapperComponent(
  subComponent,
  fnTransformPickedValue=R.identity,
) {
  class Wrapper extends Component {
    constructor(props) {
      super(props);
      this.state = { value: props.value || null };
    }
    handlePicked = value => {
      this.setState({value: fnTransformPickedValue(value)});
    }
    render() {
      return createElement(
        subComponent,
        {value: this.state.value, onPicked: this.handlePicked}
      );
    }
  }
  return Wrapper;
}


describe('MonthPicker', () => {
  describe('Integration', () => {
    it('base', () => {

      // A wrapper we are gonna use
      const Wrapper = makeWrapperComponent(MonthPicker);

      // The component is mounted
      const component = mount(createElement(Wrapper, {}));

      // The user checks that it has no value
      expect(component.state().value).toEqual(null);
      expect(component.find('YearPicker').props().value).toBe(null);
      expect(component.find('MonthNamePicker').props().value).toBe(null);

      // Sets the year and sees it updating, then the month
      component.find("YearPicker").props().onPicked(2017);
      expect(component.state().value).toEqual({year: 2017, month: null});
      component.find("MonthNamePicker").props().onPicked("February");
      expect(component.state().value).toEqual({year: 2017, month: "February"});

      // Corrects the month, then the year
      component.find("MonthNamePicker").props().onPicked("March");
      expect(component.state().value).toEqual({year: 2017, month: "March"});
      component.find("YearPicker").props().onPicked(2000);
      expect(component.state().value).toEqual({year: 2000, month: "March"});

      // He clicks something that puts back a default value
      component.setState({value: { year: 1993, month: "November" } });
      component.update();
      expect(component.state().value).toEqual({ year: 1993, month: "November" });
      expect(component.find("YearPicker").props().value).toEqual(1993);
      expect(component.find("MonthNamePicker").props().value).toEqual("November");

      // And corrects both again
      component.find("MonthNamePicker").props().onPicked("March");
      expect(component.state().value).toEqual({year: 1993, month: "March"});
      component.find("YearPicker").props().onPicked(2000);
      expect(component.state().value).toEqual({year: 2000, month: "March"});
    });
  });
  describe('handlePicked', () => {
    let sandbox;
    beforeEach(() => {
      sandbox = sinon.createSandbox();
    });
    afterEach(() => {
      sandbox.restore();
    });
    it('Calls onPicked', () => {
      const onPicked = sinon.fake();
      const component = mount(createElement(MonthPicker, { onPicked }));
      component.instance().handlePicked("month", "b");
      expect(onPicked.args).toEqual([[{month: "b", year: null}]]);
    });
  });
  describe('Interacting with MonthNamePicker', () => {
    it('Passes value from prop at start', () => {
      const value = { year: 2000, month: "March" };
      const component = mount(createElement(MonthPicker, { value }));
      expect(component.find("MonthNamePicker").props().value).toEqual(value.month);
    });
    it('Passes value from prop at update', () => {
      const valueOne = { year: 2000, month: "March" };
      const valueTwo = { year: 1900, month: "January" };
      const component = mount(createElement(MonthPicker, { value: valueOne }));
      component.setProps({value: valueTwo});
      expect(component.find("MonthNamePicker").props().value).toEqual(valueTwo.month);
    });
  });
  describe('Interacting with YearPicker', () => {
    it('Passes value from prop at start', () => {
      const value = { year: 2000, month: "March" };
      const component = mount(createElement(MonthPicker, { value }));
      expect(component.find("YearPicker").props().value).toEqual(value.year);
    });
    it('Passes value from prop at update', () => {
      const valueOne = { year: 2000, month: "March" };
      const valueTwo = { year: 1900, month: "January" };
      const component = mount(createElement(MonthPicker, { value: valueOne }));
      component.setProps({value: valueTwo});
      expect(component.find("YearPicker").props().value).toEqual(valueTwo.year);
    });
  });
});


describe('YearPicker', () => {
  it('Integration', () => {
    // Wraps a YearPicker
    const Wrapper = makeWrapperComponent(YearPicker);

    // Component is mounted with a default year (no month)
    const defaultValue = 1981;
    const component = mount(createElement(Wrapper, { value: defaultValue }));

    // Which can be seen by the user
    expect(component.find("input").html()).toContain(defaultValue);

    // He then updates it
    const newValue = 1993;
    component.find("input").props().onChange({ target: { value: newValue } });

    // And sees in the html and in the wrapper
    expect(component.find("input").html()).toContain(newValue);
    expect(component.state().value).toBe(newValue);

    // It clicks a default button
    component.setState({value: defaultValue});
    component.update();

    // And sees the default value there
    expect(component.find("input").html()).toContain(defaultValue);
  });
  it('Calls onPicked', () => {
    const onPicked = sinon.fake();
    const component = mount(createElement(YearPicker, { onPicked }));
    const value = {};
    component.find("input").props().onChange({ target: { value } });
    expect(onPicked.args).toHaveLength(1);
    expect(onPicked.args[0]).toHaveLength(1);
    expect(onPicked.args[0][0]).toBe(value);
  });
});


describe('MonthNamePicker', () => {
  it('Integration', () => {
    // Starts with a default month
    const value = "February";
    const onPicked = sinon.fake();
    const component = mount(createElement(MonthNamePicker, { value, onPicked }));

    // Sees the month there
    expect(component.find("Select").props().value).toEqual(
      {value: "February", label: "February"}
    );

    // Selects another
    expect(component.find("Select").props().onChange({value: "March"}));
    expect(onPicked.args).toEqual([["March"]]);
  });
});
