import * as R from 'ramda';

const TAGS_REGEX = /^[a-zA-Z0-9\_\-]+\:[a-zA-Z0-9\_\-]+$/;

const _isEmptyUserInput = R.either(R.isNil, R.isEmpty);

const _toUserInput = R.pipe(
  R.map(({name, value}) => `${name}:${value}`),
  R.reduce((s1, s2) => `${s1} ${s2}`, ""),
  R.when(x => x.startsWith(" "), x => x.substring(1))
);

const _ErrorMessages = {
  generic: "Incorrect format for tags! Example - 'foo:bar baz:boz'"
};

const _errorMessageFromUserInput = R.ifElse(
  _isEmptyUserInput,
  () => null,
  R.pipe(
    R.split(" "),
    R.reduceWhile(
      (acc, x) => R.isNil(acc), 
      (acc, x) => TAGS_REGEX.test(x) ? null : _ErrorMessages.generic,
      null,
    )
  )
);

const _isValidUserInput = R.pipe(_errorMessageFromUserInput, R.isNil);

const _fromUserInput = R.ifElse(
  R.complement(_isValidUserInput),
  () => null,
  R.ifElse(
    _isEmptyUserInput,
    () => [],
    R.pipe(
      R.split(" "),
      R.map(R.pipe(
        R.split(":"),
        ([name, value]) => ({name, value})
      ))
    )
  )
);

export const Tags = {
  toUserInput: _toUserInput,
  errorMessageFromUserInput: _errorMessageFromUserInput,
  ErrorMessages: _ErrorMessages,
  fromUserInput: _fromUserInput,
};

export default Tags;
