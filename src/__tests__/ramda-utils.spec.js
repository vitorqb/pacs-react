import * as R from 'ramda';
import * as sut from '../ramda-utils';

describe('splitSublists', () => {

  it('empty', () => {
    expect(sut.splitSublists(2, [])).toEqual([]);
  });

  it('One', () => {
    expect(sut.splitSublists(1, [1, 2, 3])).toEqual([[1], [2], [3]]);
  });

  it('Two', () => {
    expect(sut.splitSublists(2, [1, 2, 3, 4])).toEqual([[1, 2], [3, 4]]);
  });

});

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

describe('objFromPairs', () => {

  it('Empty', () => {
    expect(sut.objFromPairs()).toEqual({});
  });

  it('Two long', () => {
    expect(sut.objFromPairs(
      R.lensPath(['a']), 1,
      R.lensPath(['b']), 2,
    )).toEqual({a: 1, b: 2});
  });

  it('Error if offs', () => {
    expect(() => sut.objFromPairs('a')).toThrow('Expected an even number of args');
  });
  
});
