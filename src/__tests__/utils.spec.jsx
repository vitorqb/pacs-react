import React from 'react';
import { createTitle } from '../utils';


describe('createTitle()', () => {
  it('base', () => {
    const title = "hola";
    const exp = <span className="titleSpan">{title}</span>;
    const res = createTitle(title);
    expect(exp).toEqual(res)
  })
})
