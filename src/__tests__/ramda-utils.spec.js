import * as R from 'ramda';
import * as sut from '../ramda-utils';

describe('mapLenses', () => {
  it('base', () => {
    const lenses = {x: R.lensProp('x'), y: R.lensProp('y')};
    const obj = {x: 1, y: 2};
    expect(sut.mapLenses(lenses, obj)).toEqual({x: 1, y: 2});
  });
});

describe('setLenses', () => {
  it('base', () => {
    const lensValues = [
      [R.lensPath(['x', 'y']), 2],
      [R.lensPath(['z']), 1]
    ];
    const obj = {w: 3};
    expect(sut.setLenses(lensValues, obj)).toEqual({
      x: {y: 2},
      z: 1,
      w: 3,
    });
  });
});
