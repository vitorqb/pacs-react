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

describe('viewEquals', () => {

  it('true', () => {
    const lens = R.lensPath(['x']);
    const obj = sut.objFromPairs(lens, 1);
    expect(sut.viewEquals(lens, obj, 1)).toBe(true);
  });

  it('false', () => {
    const lens = R.lensPath(['x']);
    const obj = sut.objFromPairs(lens, 1);
    expect(sut.viewEquals(lens, obj, 2)).toBe(false);
    expect(sut.viewEquals(R.lensPath(['y']), obj, 1)).toBe(false);
  });

});

describe('permutations', () => {

  it('empty', () => {
    expect(sut.permutations([], [])).toEqual([]);
    expect(sut.permutations([1], [])).toEqual([]);
    expect(sut.permutations([], [1])).toEqual([]);
  });

  it('Base', () => {
    expect(sut.permutations([1], ['a', 'b'])).toEqual([[1, 'a'], [1, 'b']]);
  });

  it('Long', () => {
    expect(sut.permutations([1, 2, 3], ['a', 'b', 4])).toEqual([
      [1, 'a'], [1, 'b'], [1, 4],
      [2, 'a'], [2, 'b'], [2, 4],
      [3, 'a'], [3, 'b'], [3, 4],
    ]);
  });
  
});

describe('findFirst', () => {

  it('base', () => {
    const col = [1, 2, 3];
    const pred = R.equals(1);
    expect(sut.findFirst(pred)(col)).toEqual(1);
  });

  it('not found', () => {
    const pred = R.equals(1);
    expect(sut.findFirst(pred)([])).toEqual(null);
    expect(sut.findFirst(pred)([2])).toEqual(null);    
  });
});
