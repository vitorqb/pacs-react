import React from 'react'


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
