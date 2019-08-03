import React from 'react';
import * as R from 'ramda';

export const inputMsgFileLens = R.lensPath(['target', 'files', 0]);
export const fileReaderResultLens = R.lensPath(['target', 'result']);

export const parseInputMsg = msg => {
  const file = R.view(inputMsgFileLens, msg);
  return new Promise((resolve, reject) => {
    const fileReader = new FileReader();
    fileReader.onload = R.pipe(R.view(fileReaderResultLens), resolve);
    fileReader.readAsText(file, 'UTF-8');
  });
};

export const valueLens = {

  file: R.lensPath(['file']),
  contents: R.lensPath(['contents']),
  status: R.lensPath(['status']),

};

export const Status = { Loading: 'Loading', Idle: 'Idle' };

export const reducers = {

  onFileChange: R.curry((msg, value) => {
    const file = R.view(inputMsgFileLens, msg);
    return R.pipe(
      R.set(valueLens.file, file),
      R.set(valueLens.contents, null),
      R.set(valueLens.status, file ? Status.Loading : Status.Idle),
    )(value);
  }),

  onParsedInputMsg: R.curry((msg, value) => {
    const contents = msg;
    return R.pipe(
      R.set(valueLens.contents, contents),
      R.set(valueLens.status, Status.Idle),
    )(value);
  }),
  
};

const FilePicker = ({ value, onChange }) => {
  const onInputChange = msg => {
    msg.persist();
    const file = R.view(inputMsgFileLens, msg);
    onChange(reducers.onFileChange(msg));
    if (file) {
      parseInputMsg(msg)
        .then(parsedMsg => onChange(reducers.onParsedInputMsg(parsedMsg)));
    }
  };
  return <input type="file" onChange={onInputChange} />;
};

export default FilePicker;
