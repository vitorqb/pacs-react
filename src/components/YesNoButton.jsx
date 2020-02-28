import React from 'react';
import * as R from 'ramda';


/**
 * Lenses for the state of the YesNoButton.
 */
export const StateLens = {
  value: R.lensPath(['value'])
};


/**
 * A button for a boolean toggle (yes/no).
 * @param props.state - The state (see StateLens).
 * @param props.onChange - Callback to change the state.
 */
export function YesNoButton(props) {
  return (
    <button
      className={_classNameForValue(R.view(StateLens.value, props.state))}
      onClick={_ => _handleUserClickFromProps(props)}>
      {_textForValue(R.view(StateLens.value, props.state))}
    </button>
  );
}


/**
 * The classname for a given value.
 */
export function _classNameForValue(value) {
  return "yes-no-button " + (value === true ? "yes-no-button--yes" : "yes-no-button--no");
}


/**
 * The text to render for a given value.
 */
export function _textForValue(value) { return value === true ? "yes" : "no"; }


/**
 * Handles an user click.
 * @param props -
 */
export function _handleUserClickFromProps({ state, onChange }) {
  return onChange(R.over(StateLens.value, x => !x, state));
}

export default YesNoButton;
