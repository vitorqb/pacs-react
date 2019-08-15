import React from 'react';
import * as R from 'ramda';
import SuccessMessage from './SuccessMessage';


const SuccessMessageDisplayerWrapper = R.curry((viewMsg, Component, props) => {
  return (
  <div className="success-message-displayer-wrapper">
    <SuccessMessage value={viewMsg(props)} />
    <Component {...props} />
  </div>
  );
});

export default SuccessMessageDisplayerWrapper;
