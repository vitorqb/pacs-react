import * as R from 'ramda';
import * as sut from '../AppContext.jsx';

describe('_fetch', () => {

  it('Two long', async () => {
    expect.assertions(1);
    const state = {a: 1};
    const specs = [
      [x => Promise.resolve(x.two), R.lensProp('b')],
      [x => Promise.resolve(x.three), R.lensProp('c')],
    ];
    const ajaxInjections = {two: 2, three: 3};
    const reducer = await sut._fetch(specs, ajaxInjections);
    expect(reducer(state)).toEqual({a: 1, b: 2, c: 3});
  });

});
