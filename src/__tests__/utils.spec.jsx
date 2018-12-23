import React from 'react';
import { createTitle, remapKeys, getSourceAccsPks, getTargetAccsPks, newGetter } from '../utils';
import * as R from 'ramda'

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


describe('getSourceAccsPks() and getTargetAccsPks()', () => {
  const movements = [
    {
      account: 1,
      money: {currency: 1, quantity: 1}
    },
    {
      account: 2,
      money: {currency: 1, quantity: -2}
    },
    {
      account: 3,
      money: {currency: 1, quantity: 1}
    }
  ];
  it('Source', () => {
    const exp = [2];
    const res = getSourceAccsPks(movements);
    expect(exp).toEqual(res);
  })
  it('Target', () => {
    const exp = [1, 3];
    const res = getTargetAccsPks(movements);
    expect(exp).toEqual(res);
  })
})

describe('newGetter()', () => {
  it('Simple', () => {
    const getter = newGetter(R.identity, [1, 2, 3]);
    [1, 2, 3].forEach(x => expect(getter(x)).toBe(x))
  })
  it('Complex extractValue', () => {
    const getter = newGetter(R.prop("a"), [{a: 1}, {a: 2, b: 3}, {a: 3}]);
    expect(getter(1)).toEqual({a: 1});
    expect(getter(2)).toEqual({a: 2, b: 3});
  })
})
