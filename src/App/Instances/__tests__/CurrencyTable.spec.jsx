import React from 'react';
import * as R from 'ramda';
import { lens as AppLens } from '../../Lens.js';
import { CurrencyFactory } from '../../../testUtils';
import { mount } from 'enzyme';
import CurrencyTableInstance from '../CurrencyTable.jsx';

describe('CurrencyTableInstance...', () => {

  it('Loading while currencies is null...', () => {
    const table = mount(CurrencyTableInstance({}));
    expect(table.equals(<p>Loading...</p>)).toBe(true);
  });

  it('Rendered when currencies not null...', () => {
    const currencies = CurrencyFactory.buildList(3);
    const state = R.set(AppLens.currencies, currencies, {});
    const table = mount(CurrencyTableInstance({ state }));
    expect(table.find('CurrencyTable')).toHaveLength(1);
    expect(table.find('CurrencyTable').props().currencies).toEqual(currencies);
  });

});
