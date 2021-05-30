import React, { Fragment } from 'react';


export function LoadingWrapper({ isLoading, children }) {
  return (
    <Fragment>
      {isLoading && (
      <div className="loading-wrapper--active">
        <span className="loading-wrapper__label">
          {"Loading..."}
        </span>
      </div>
      )}
      {children}
    </Fragment>
  );
}

export default LoadingWrapper;
