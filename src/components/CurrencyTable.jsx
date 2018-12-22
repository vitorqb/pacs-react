import React from 'react';
import { createTitle } from '../utils';

/**
 * A Component representing a table of currencies
 * @param {string} props.title - The title.
 * @param {Currency[]} props.currencies - The currencies to render.
 */
export default function CurrencyTable({title="", currencies=[]}) {
  const rows = currencies.map(makeCurrencyTr);
  return (
    <div>
      {createTitle(title)}
      <table><tbody>{rows}</tbody></table>
    </div>
  )
}

/**
 * Prepares a <tr> for a currency
 */
export const makeCurrencyTr =
  (cur) => (
    <tr key={cur.pk}>
      <td>{cur.pk}</td>
      <td>{cur.name}</td>
      <td>{cur.imutable ? "Imutable" : ""}</td>
    </tr>
  )
