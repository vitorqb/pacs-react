import React from 'react';
import * as R from 'ramda';
import * as PricePortifolio from '../domain/PricePortifolio.js';
import FilePicker, { valueLens as FilePickerValueLens } from './FilePicker';

const filePickerValueLens = R.lensPath(['filePickerValue']);

export const valueLens = {

  contents: R.compose(filePickerValueLens, FilePickerValueLens.contents),
  filePickerValue: filePickerValueLens,
  error: R.lensPath(['error']),
  portifolio: R.lensPath(['portifolio']),

};

export const reducers = {

  updateContentsFromNull: R.pipe(
    R.set(valueLens.error, null),
    R.set(valueLens.portifolio, null)
  ),

  updateContentsFromPortifolio: R.curry((value, portifolio) => R.pipe(
    R.set(valueLens.error, null),
    R.set(valueLens.portifolio, portifolio),
  )(value)),

  updateContentsFromError: R.curry((value, error) => R.pipe(
    R.set(valueLens.error, error),
    R.set(valueLens.portifolio, null),
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
  const onFilePickerChange = msg => onChange(R.pipe(
    R.over(valueLens.filePickerValue, msg),
    reducers.updateContents,      
  ));
  return (
    <div>
      <FilePicker value={filePickerValue} onChange={onFilePickerChange} />
    </div>
  );
};

export default PortifolioFilePicker;
