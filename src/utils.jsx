import React from 'react';
import * as R from 'ramda';

/**
  * @typedef Money
  * @type {object}
  * @property {number} account
  * @property {number} quantity
  */

/**
 * @typedef Movement
 * @type {object}
 * @property {Money} money
 * @property {number} account
 */

/**
 * A specification of how a movement should be.
 * @typedef {Object} MovementSpec
 * @property {number} [account]
 * @property {Money} money
 */

/**
 * A specification of how a transaction should be.
 * @typedef {Object} TransactionSpec
 * @property {string} [description]
 * @property {moment} [date]
 * @property {MovementSpec[]} [movements]
 */

/**
 * @function
 * Maps a Transaction to a TransactionSpec.
 */
export const getSpecFromTransaction = R.pick(["description", "date", "movements"]);

/**
 * Returns a clone of the object with keys remapped according to keysmapping.
 */
export const remapKeys = R.curry(function(keysMapping, obj) {
  const updateKey = oldKey => keysMapping[oldKey] || oldKey;
  const updatePair = ([key, value]) => [updateKey(key), value];
  return R.pipe(R.toPairs, R.map(updatePair), R.fromPairs)(obj)
})


/**
  * Creates a span with a title.
  * @param {string} title - The title.
  */
export function createTitle(title) {
  return <span className="titleSpan">{title}</span>
}


/**
 * Creates an input html tag.
 * @param {Object} opts - The options.
 * @param {string} opts.type - The type of the input.
 * @param {string} opts.name - The name of the input.
 * @param {Function} opts.onChange - A callback for change event.
 * @param {?} opts.value - A value to parse to the input.
 */
export function createInput({ type, name, onChange, value }) {
  return (
    <div className="inputDiv" key={name}>
      {name}: 
      <input type={type} name={name} value={value} onChange={onChange} />
    </div>
  );
}

/**
 * Extracts source or target accounts from an array of movements.
 * @function
 * @param {string} type - One of "source" or "target"
 * @param {Movement[]} movements
 * @return {number[]}
 */
export const getSourceOrTargetAccsPks = R.curry(function(type, movements) {
  let filterFunction;
  const getAccountPkAndQuantity = (m => [m.account, m.money.quantity]);
  const accountPkQuantityPairs = R.map(getAccountPkAndQuantity, movements);

  if (type === "source") {
    filterFunction = ([_, q]) => q <= 0;
  } else if (type === "target") {
    filterFunction = ([_, q]) => q > 0;
  } else {
    throw new Error("Invalid type")
  }

  return R.pipe(R.filter(filterFunction), R.map(R.prop(0)))(accountPkQuantityPairs);  
})

/**
 * Extracts from an array of movements the pk of all accounts that are
 * source (negative quantity).
 * @param {Movement[]} movements
 * @return {number[]}
 */
export const getSourceAccsPks = getSourceOrTargetAccsPks("source");

/**
 * Extracts from an array of movements the pk of all accounts that are
 * targets (positive quantity).
 * @param {Movement[]} movements
 * @return {number[]}
 */
export const getTargetAccsPks = getSourceOrTargetAccsPks("target");


/**
 * Returns a function that retrieves the first element of an array for which
 * filter function matches.
 * @param {Function} extractValue - A function that is applied to each element
 *   in elements to calculate the value that will be matched.
 * @param {Object[]} elements - The element that will be selected by the 
 *   returning function.
 * @return {Function} A function that accepts `value` and selects the element
 *   from elements for which extractValue(element) == `value`.
 */
export function newGetter(extractValue, elements) {
  return function(value) {
    const elementValueMatches = e => extractValue(e) === value;
    return R.find(elementValueMatches, elements)
  }
}


/**
 * Memoizes a function with a single argument.
 * @function
 */
export const memoizeSimple = R.memoizeWith(R.identity)
