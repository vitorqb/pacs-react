import { mount } from 'enzyme';
import React from 'react';
import CurrencyTable, { makeCurrencyTr } from '../CurrencyTable';
import * as R from 'ramda';
import { CurrencyFactory } from '../../testUtils';

describe('CurrencyTable', () => {
  describe('Rendering...', () => {
    it('Renders with title', () => {
      const table = mount(<CurrencyTable title="A" />);
      expect(table.find("span.titleSpan")).toHaveLength(1);
      expect(table.find("span.titleSpan").text()).toEqual("A");
    });
    it('Renders with table tags', () => {
      const currencies = CurrencyFactory.buildList(2);
      const table = mount(<CurrencyTable currencies={currencies} />);
      expect(table.find("table")).toHaveLength(1);
      expect(table.find("tbody")).toHaveLength(1);
      expect(table.find("tr")).toHaveLength(currencies.length);
    });
    it('Renders with TransactionRows', () => {
      const currencies = CurrencyFactory.buildList(3);
      const table = mount(<CurrencyTable currencies={currencies} />);
      const expRows = R.map(makeCurrencyTr, currencies);
      for (var i=0; i<expRows.length; i++) {
        const expRow = expRows[i];
        expect(table.contains(expRow)).toBe(true);
      }
    });
  });
});

describe('makeCurrencyTr', () => {
  it('base', () => {
    const cur = CurrencyFactory.build();
    const exp = (
      <table>
        <tbody>
          <tr key={cur.pk}>
            <td>{cur.pk}</td>
            <td>{cur.name}</td>
            <td>{cur.imutable ? "Imutable" : ""}</td>
          </tr>
        </tbody>
      </table>
    );
    const res = mount(
      <table><tbody>{makeCurrencyTr(cur)}</tbody></table>
    );
    expect(res.equals(exp)).toBe(true);
  });
});
