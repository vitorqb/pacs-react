import React from 'react';
import * as R from 'ramda';
import * as PricePortifolio from '../domain/PricePortifolio/Core';
import FilePicker, { valueLens as FilePickerValueLens } from './FilePicker';
import PortfolioFilePickerStatus, { propsLens as PortfolioFilePickerStatusLens } from './PortifolioFilePicker/PortifolioFilePickerStatus';
import { Success, Fail } from 'monet';

const filePickerValueLens = R.lensPath(['filePickerValue']);

export const valueLens = {

  contents: R.compose(filePickerValueLens, FilePickerValueLens.contents),
  fileName: R.compose(filePickerValueLens, FilePickerValueLens.fileName),
  status: R.compose(filePickerValueLens, FilePickerValueLens.status),
  filePickerValue: filePickerValueLens,
  error: R.lensPath(['error']),
  portifolio: R.lensPath(['portifolio']),
  portifolioValidation: R.lensPath(['portifolioValidation']),

};

export const reducers = {

  updateContentsFromNull: R.pipe(
    R.set(valueLens.error, null),
    R.set(valueLens.portifolio, null)
  ),

  updateContentsFromPortifolio: R.curry((value, portifolio) => R.pipe(
    R.set(valueLens.error, null),
    R.set(valueLens.portifolio, portifolio),
    R.set(valueLens.portifolioValidation, Success(portifolio)),
  )(value)),

  updateContentsFromError: R.curry((value, error) => R.pipe(
    R.set(valueLens.error, error),
    R.set(valueLens.portifolio, null),
    R.set(valueLens.portifolioValidation, Fail(error)),
  )(value)),

  updateContents: value => {
    const contents = R.view(valueLens.contents, value);
    if (! contents) {
      return reducers.updateContentsFromNull(value);
    }
    return PricePortifolio.parseContents(contents)
      .map(reducers.updateContentsFromPortifolio(value))
      .failMap(reducers.updateContentsFromError(value))
      .cata(x => x, x => x);
  }

};


const PortifolioFilePicker = ({value, onChange}) => {
  const filePickerValue = R.view(valueLens.filePickerValue, value);
  const onFilePickerChange = filePickerReducerFn => onChange(R.pipe(
    R.over(valueLens.filePickerValue, filePickerReducerFn),
    reducers.updateContents,
  ));
  const PortfolioFilePickerStatusProps = R.pipe(
    R.set(
      PortfolioFilePickerStatusLens.fileName,
      R.view(valueLens.fileName, value)
    ),
    R.set(
      PortfolioFilePickerStatusLens.status,
      R.view(valueLens.status, value)
    ),
    R.set(
      PortfolioFilePickerStatusLens.error,
      R.view(valueLens.error, value)
    ),
    R.set(
      PortfolioFilePickerStatusLens.portfolioValidation,
      R.view(valueLens.portifolioValidation, value)
    ),
  )({});
  return (
    <div>
      <FilePicker value={filePickerValue} onChange={onFilePickerChange} />
      <PortfolioFilePickerStatus {...PortfolioFilePickerStatusProps} />
    </div>
  );
};

export default PortifolioFilePicker;
