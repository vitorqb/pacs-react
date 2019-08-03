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
