import React from 'react';
import * as R from 'ramda';

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
