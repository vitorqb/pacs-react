import React from 'react';
import * as R from 'ramda';

export const valueLens = {

  token: R.lensPath(['token']),

};

export const TokenInput = ({ value, onChange }) => {
  const onInputChange = e => {
    return onChange(R.set(valueLens.token, e.target.value, value));
  };
  const inputValue = R.view(valueLens.token, value);
  return <input type="password" onChange={onInputChange} value={inputValue || ""} />;
};

export default TokenInput;
