import * as R from 'ramda';

/**
  * Given a mapping of {name: lens}, read all lenses from obj and returns an
  * obj of {name: value}.
  */
export const mapLenses = R.curry((lensesMap, obj) => R.pipe(
  R.toPairs,
  R.map(([k, l]) => [k, R.view(l, obj)]),
  R.fromPairs,
)(lensesMap));

/**
  * Given a bunch of [lenses, value] pairs, set's them to obj.
  */
export const setLenses = R.curry((lensValuePairs, obj) => R.reduce(
  (accObj, [lens, value]) => R.set(lens, value, accObj),
  obj,
  lensValuePairs,
));

export const callWithoutArgs = f => f();
export const viewAndCallWithoutArgs = l => R.pipe(R.view(l), callWithoutArgs);
