import * as R from 'ramda';

const isEven = i => i % 2 === 0;
const mapIndexed = R.addIndex(R.map);

/**
 * Splits a list into sublists of equal number of items.
 */
export const splitSublists = R.curry((n, list) => {
  if (! ((list.length % n) == 0)) {
    throw `Can not split list with length "${list.length}" into groups of ${n}`;
  }
  return R.pipe(
    mapIndexed((x, i) => [x, Math.floor(i / n)]),
    R.groupWith(([_, i], [__, j]) => i === j),
    R.map(R.map(([x, _]) => x)),
  )(list);
});

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

/**
 * Given a bunch of (lens, value) pair, constructs an object.
 */
export const objFromPairs = (...pairs) => {
  if (! isEven(pairs.length)) { throw "Expected an even number of args"; };
  return R.pipe(splitSublists(2), setLenses(R.__, {}))(pairs);
};

export const callWithoutArgs = f => f();
export const viewAndCallWithoutArgs = l => R.pipe(R.view(l), callWithoutArgs);
