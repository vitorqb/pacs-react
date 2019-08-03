import React, { createElement } from 'react';
import * as R from 'ramda';
import ErrorMessage from './ErrorMessage';


const ErrorDisplayWrapper = R.curry((viewErrorFn, Component, props) => {
  return (
  <div className="error-displayer-wrapper">
    <ErrorMessage value={viewErrorFn(props)} />
    <Component {...props} />
  </div>
  );
});

export default ErrorDisplayWrapper;
