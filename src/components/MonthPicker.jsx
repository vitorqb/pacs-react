import React, { Component, createElement } from 'react';
import * as R from 'ramda';
import { MonthUtil } from '../utils';
import Select from 'react-select';

export default class MonthPicker extends Component {

  getValue = () => {
    const value = this.props.value || {};
    return {
      month: value.month || null,
      year: value.year || null
    };
  }

  handlePicked = R.curry((which, value) => {
    return this.props.onPicked(R.assoc(which, value, this.getValue()));
  })

  render() {
    const { year, month } = this.getValue();
    const yearPicker = createElement(
      YearPicker,
      { value: year, onPicked: this.handlePicked('year') }
    );
    const monthNamePicker = createElement(
      MonthNamePicker,
      { value: month, onPicked: this.handlePicked('month') }
    );

    return <div>{yearPicker}{monthNamePicker}</div>;
  }
}


export function YearPicker(props) {
  const value = props.value || "";
  const handleChange = e => props.onPicked(e.target.value);
  const input = createElement(
    'input',
    { type: "number", value, onChange: handleChange }
  );
  return (
    <div className="month-picker__year">
      <span className="month-picker__label">Year:</span>
      <div className="month-picker__input">{input}</div>
    </div>
  );
};


export function MonthNamePicker({ value, onPicked }) {
  const fnValueToOption = R.pipe(R.repeat(R.__, 2), R.zipObj(['label', 'value']));
  const fnOptionToValue = R.prop("value");

  const options = R.map(fnValueToOption, MonthUtil.MONTHS);
  const chosenOption = fnValueToOption(value);
  const handleChange = R.pipe(fnOptionToValue, onPicked);

  const select = createElement(
    Select,
    { options, value: chosenOption, onChange: handleChange}
  );
  return (
    <div className="month-picker__month-name">
      <span className="month-picker__label"> Month:</span>
      <div className="month-picker__input">{select}</div>
    </div>
  );
}
