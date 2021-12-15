import * as R from 'ramda';

const _toUserInput = R.pipe(
  R.map(({name, value}) => `${name}:${value}`),
  R.reduce((s1, s2) => `${s1} ${s2}`, ""),
  R.when(x => x.startsWith(" "), x => x.substring(1))
);


export const Tags = {
  toUserInput: _toUserInput,
};

export default Tags;
