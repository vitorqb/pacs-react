import * as R from 'ramda';
import * as sut from '../ramda-utils';

describe('mapLenses', () => {
  it('base', () => {
    const lenses = {x: R.lensProp('x'), y: R.lensProp('y')};
    const obj = {x: 1, y: 2};
    expect(sut.mapLenses(lenses, obj)).toEqual({x: 1, y: 2});
  });
});
