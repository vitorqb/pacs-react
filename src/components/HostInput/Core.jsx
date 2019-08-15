import React from 'react';
import * as R from 'ramda';

export const valueLens = {

  host: R.lensPath(['host']),
  
};

const HostInput = ({ value, onChange }) => {
  const onValueChange = e => onChange(R.set(valueLens.host, e.target.value, value));
  const inputValue = R.view(valueLens.host, value);
  return <input onChange={onValueChange} value={inputValue || ""} />;
};

export default HostInput;
