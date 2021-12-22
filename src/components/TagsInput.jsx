import React from 'react';
import styles from './TagsInput.module.scss';
import * as R from 'ramda';
import ErrorMessage from './ErrorMessage.jsx';
import Tags from '../domain/Tags.js';


export const handleChange = R.curry((callback, event) => R.pipe(
  R.path(['target', 'value']),
  x => ({
    userInput: x,
    pickedTags: Tags.fromUserInput(x),
  }),
  R.tap(callback),
)(event));

export const TagsInput = (props) => {
  const {onChange} = props;
  const userInput = R.pathOr("", ['value', 'userInput'], props);
  const errorMessage = Tags.errorMessageFromUserInput(userInput);
  return (
    <div className="tags-input">
      <input type="text" value={userInput} onChange={handleChange(onChange)} />
      <ErrorMessage value={errorMessage}/>
    </div>
  );
};


export default TagsInput;
