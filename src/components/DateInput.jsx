import React, { Component, useEffect, useState } from 'react';
import moment from 'moment';


/**
 * Input for a date.
 * @param {object} props
 * @param {string} props.value - A string with the current value for the input.
 * @param {fn(moment): ?} props.onChange - A callback. Receives either an object with 
 *   `userInput` and `parsedDate` every time the user enters a new value.
 */
export default class DateInput extends Component {

  /**
   * Handles an text input from the user.
   */
  handleChange = e => {
    const value = e.target.value;
    const date = moment.utc(value, "YYYY-MM-DD", true);
    this.props.onChange({userInput: value, pickedDate: date.isValid() ? date : null});
  }

  render() {
    return (
      <input
        name="date"
        onChange={this.handleChange}
        value={this.props.value} />
    );
  }

}


/**
 * A State Handler for a DateInput, which simplifies clients that don't care about
 * storing/setting the value for the `userInput` and `pickedDate`, and instead only care
 * about having a `pickedDate` sent on `onChange` event.
 */
export const DateInputStateHandler = ({children, value, onDatePicked}) => {
  const [userInput, setUserInput] = useState("");

  const syncUserInput = () => {
    if (value && value.isValid()) {
      const formatedValue = value.format("YYYY-MM-DD");
      if (formatedValue != userInput) {
        console.log({value, userInput, formatedValue});
        setUserInput(formatedValue);
      }
    }
  };

  useEffect(syncUserInput, [value]);

  return children({
    value: userInput,
    onChange: ({userInput, pickedDate}) => {
      setUserInput(userInput);
      onDatePicked(pickedDate);
    }
  });
};
