import React, { Fragment } from 'react';


export function LoadingWrapper({ isLoading, children }) {
  if (! isLoading) {
    return children;
  }
  return (
    <Fragment>
      <div className="loading-wrapper--active">
        <span className="loading-wrapper__label">
          {"Loading..."}
        </span>
      </div>
      {children}
    </Fragment>
  );
}

export default LoadingWrapper;
