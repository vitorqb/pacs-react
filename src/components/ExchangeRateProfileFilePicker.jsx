import * as R from 'ramda';
import React from 'react';

const extractFileFromEvent = R.path(['target', 'files', 0]);

export function parseProfile(contents) {
  try {
    return {
      value: JSON.parse(contents),
      errors: []
    };
  } catch(err) {
    alert(err);
    return {
      value: null,
      errors: ["INVALID JSON!"]
    };
  }
};

export const parseFile = file => new Promise((resolve, reject) => {
  var reader = new FileReader();
  reader.onload = R.pipe(R.path(['target', 'result']), resolve);
  reader.onerror = () => reject("Something went wrong!");
  reader.readAsText(file, 'UTF_8');
});

const lenses = {

  processingFile: R.lensPath(['processingFile']),
  file: R.lensPath(['file']),
  profile: R.lensPath(['profile']),
  errors: R.lensPath(['errors']),
  
};

const handlers = {

  handleEmptyFileSelected: R.curry(({onChange}) => {
    onChange(R.pipe(
      R.set(lenses.file, null),
      R.set(lenses.profile, null),
      R.set(lenses.errors, null),
    ));
  }),

  handleStartedReadingFile: R.curry(({onChange}, file) => {
    onChange(R.pipe(
      R.set(lenses.errors, null),
      R.set(lenses.file, file),
      R.set(lenses.processingFile, true),
      R.set(lenses.profile, null),
    ));
  }),

  handleFinishedReadingFile: R.curry(({onChange}, contents) => {
    const profile = parseProfile(contents);
    onChange(R.pipe(
      R.set(lenses.processingFile, false),
      R.set(lenses.profile, profile.value),
      R.set(lenses.errors, profile.errors),
    ));
  }),

  handleOnChange: R.curry((props, event) => {
    const file = extractFileFromEvent(event);
    const finishedReadingFileHandler = handlers.handleFinishedReadingFile(props);
    const startedReadingFileHandler = handlers.handleStartedReadingFile(props);
    if (! file) {
      handlers.handleEmptyFileSelected(props, event);
      return Promise.resolve();
    } else {
      startedReadingFileHandler(file);
      return parseFile(file).then(finishedReadingFileHandler);
    }
  }),
  
};

/**
  * A component to pick a file with a Exchange Rate profile.
  */
export default function ExchangeRateProfileFilePicker(props) {
  const onChangeHandler = handlers.handleOnChange(props);
  return (
    <div className="ExchangeRateProfileFilePicker">
      <input type="file" onChange={onChangeHandler} />
    </div>
  );
}
