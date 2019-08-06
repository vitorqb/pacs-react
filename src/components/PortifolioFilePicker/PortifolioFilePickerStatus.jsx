import React from 'react';
import * as R from 'ramda';
import ErrorMessage from '../ErrorMessage';
import * as PricePortifolio from '../../domain/PricePortifolio/Core';

export const propsLens = {

  fileName: R.lensPath(['fileName']),
  status: R.lensPath(['status']),
  error: R.lensPath(['error']),
  portfolioValidation: R.lensPath(['portfolioValidation']),

};

export const SelectedFileLabel = props => {
  const fileName = R.view(propsLens.fileName, props);
  const label = fileName ? fileName : "(no file selected)";
  return <span className="selected-file-label">File: {label}</span>;
};

export const SelectedFileError = props => {
  const error = R.view(propsLens.error, props);
  return (
    <div className="selected-file-error-wrapper">
      <ErrorMessage value={error} />
    </div>
  );
};

export const SelectedPortfolioStats = props => {
  const portfolioValidation = R.view(propsLens.portfolioValidation, props);
  if (!portfolioValidation) { return null; };
  return R.pipe(
    R.map(PricePortifolio.getStats),
    R.map(x => JSON.stringify(x, undefined, 2)),
    x => x.failMap(PricePortifolio.getStats),
    x => x.failMap(x => JSON.stringify(x, undefined, 2)),
    x => x.cata(
      _ => <span />,
      x => (
        <div className="selected-portfolio-stats">
          <pre id="json">
            {x}
          </pre>
        </div>
      )
    )
  )(portfolioValidation);
};

/**
  * A component that renders the current status for the portfolio file picker.
  */
const PortfolioFilePickerStatus = props => {
  return (
    <div className="portfolio-file-picker-status">
      <SelectedFileLabel {...props} />
      <SelectedFileError {...props} />
      <SelectedPortfolioStats {...props} />
    </div>
  );
};

export default PortfolioFilePickerStatus;
