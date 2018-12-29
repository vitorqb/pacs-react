import React from 'react';
import { createTitle } from '../utils';
import * as R from 'ramda';
import { getTargetAccsPks, getSourceAccsPks } from '../utils';

const movementCurrencyLens = R.lensPath(["money", "currency"]);
const quantityCurrencyLens = R.lensPath(["money", "quantity"]);


/**
  * A React Component that is a table of transactions
  * @param {string} props.title - The title
  * @param {transaction[]} props.transactions - The transactions to render.
  * @param {Function} props.getCurrency - A function that maps a pk to a Currency.
  */
export default function TransactionTable(
  { transactions=[], title="", getCurrency, getAccount }
) {
  const headerRow = makeHeadersRow();
  const rows = R.map(formatTransaction(getCurrency, getAccount), transactions);
  const titleSpan = createTitle(title);
  return (
    <div>
      {titleSpan}
      <table className="table"><tbody>
          {headerRow}
          {rows}
      </tbody></table>
    </div>
  )
}


/**
 * Returns a tr tag with the headers.
 */
function makeHeadersRow() {
  const titles = ["pk", "description", "date", "quantity", "accounts"];
  const toTd = (title => <td key={title}>{title}</td>);
  const tds = R.map(toTd, titles);
  return <tr>{tds}</tr>
}


/**
 * Formats a transaction as a row.
 * @function
 * @param {Function} getCurrency - A function that receives a PK and returns a
 *   Currency.
 * @param {Transaction} transaction - The transaction.
 * @return {ReactDOM} A tr react dom.
 */
export const formatTransaction = R.curry(
  function(getCurrency, getAccount, transaction) {  
    const { pk, description, date, movements=[] } = transaction;
    const formattedDate = date ? date.format("YYYY-MM-DD") : "";
    const quantityMoved = extractQuantityMoved(getCurrency, movements);
    const accountsRepr = extractAccountsRepr(getAccount, movements);
    
    return (
      <tr key={pk}>
        <td>{pk}</td>
        <td>{description}</td>
        <td>{formattedDate}</td>
        <td>{quantityMoved}</td>
        <td>{accountsRepr}</td>
      </tr>
    )
  }
)

/**
 * Given an array of transactions, extracts a string representing the quantity
 * moved. If more than one currency, returns '(Multiple Currencies)'.
 * @param {Function[]} getCurrency - A function that receives the PK of a 
 *   currency and returns the currency.
 * @param {Movement[]} movements
 * @returns {string}
 */
export function extractQuantityMoved(getCurrency, movements) {
  const currenciesPks = R.map(R.view(movementCurrencyLens), movements);
  const currenciesPksSet = R.uniq(currenciesPks);
  if (currenciesPksSet.length > 1) {
    return '(Multiple Currencies)'
  }
  const currency = getCurrency(currenciesPksSet[0]);
  const quantities = R.map(R.view(quantityCurrencyLens), movements);
  const totalQuantity = R.sum(R.filter(x => x > 0, quantities))
  return `${totalQuantity} ${currency.name}`
}

/**
 * Given an array of movements, extracts a string representing the accounts
 * in that transaction.
 * @param {Function[]} getAccount - A function that maps a pk into an Account.
 * @param {Movement[]} movements
 * @return {string}
 */
export function extractAccountsRepr(getAccount, movements) {

  function buildAccsRepr(accounts) {
    const namesList = R.map(R.prop("name"), accounts);
    const namesRepr = R.join(", ", namesList);
    if (accounts.length === 1) {
      return namesRepr
    }
    return "(" + namesRepr + ")"
  }

  const sourceAccs = R.map(getAccount, getSourceAccsPks(movements));
  const targetAccs = R.map(getAccount, getTargetAccsPks(movements));
  return `${buildAccsRepr(sourceAccs)} -> ${buildAccsRepr(targetAccs)}`
}
