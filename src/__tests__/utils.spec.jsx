import React from 'react';
import { createTitle, remapKeys } from '../utils';

describe('createTitle()', () => {
  it('base', () => {
    const title = "hola";
    const exp = <span className="titleSpan">{title}</span>;
    const res = createTitle(title);
    expect(exp).toEqual(res)
  })
})

describe('remapKeys()', () => {
  it('base', () => {
    const obj = {aaa: 1, b: 2, ccc: 3};
    const keysMapping = {aaa: "e", ccc: "c", d: "d"};
    expect(remapKeys(keysMapping, obj)).toEqual({e: 1, b: 2, c: 3})
  })
})
