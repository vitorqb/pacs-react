import React from 'react';
import * as R from 'ramda';
import { Balance, Currency, Account, moneysToRepr } from '../utils';

/**
 * @typedef AccountBalanceEvolutionData
 * @type {object}
 * @property {number} account
 * @property {Balance} initialBalance
 * @property {Balance[]} balanceEvolution
 */


/**
 * @function
 * @param {object} props
 * @param {string[]} props.monthsLabels - The labels representing the months.
 * @param {AccountBalanceEvolutionData[]} props.data - The data for the balance evolution.
 * @param {(id: number) => Currency} props.getCurrency
 * @param {(id: number) => Account} props.getAccount
 * @param {object} props.inject - An object with functions for dependency injection.
 * @param {(labels: string[]) => any} props.inject.makeHeader - How to make the header.
 * @param {(data: AccountBalanceEvolutionData[], getCurrency: ((x: number) => Currency), getAccount: ((x: number) => Account), inject?: any) => any} props.inject.makeBody - How to make the tbody.
 */
export default function AccountBalanceEvolutionTable(props) {
  // Dep inject
  const {
    makeHeader: _makeHeader = makeHeader,
    makeBody: _makeBody = makeBody
  } = props.inject || {};
  const { getCurrency, getAccount } = props;
  const thead = _makeHeader(props.monthsLabels);
  const tbody = _makeBody(props.data, getCurrency, getAccount);
  return <table className="table table-striped">{thead}{tbody}</table>;
};


/**
 * @function
 * Prepares a thead for the AccountBalanceEvolutionTable with the given labels
 * @param {string[]} labels
 */
export function makeHeader(labels) {
  const makeThFromLabel = (l, i) => <th key={i}>{l}</th>;
  const ths = R.addIndex(R.map)(makeThFromLabel, labels);
  return (
    <thead className="thead-dark">
      <tr>
        <th key={-1}>Account</th>
        {ths}
      </tr>
    </thead>
  );
};


/**
 * @function
 * Prepares a tbody for the AccountBalanceEvolutionTable.
 * @param {AccountBalanceEvolutionData[]} data
 * @param {(x: number) => Currency} getCurrency
 * @param {(x: number) => Account} getAccount
 * @param {object} inject?
 * @param {(data: AccountBalanceEvolutionData, key: number, getCurrency: (x: number) => Currency, getAccount: (x: number) => Account) => any} [inject.makeTr]
 */
export function makeBody(data, getCurrency, getAccount, inject={}) {
  // Dep injection
  const { makeTr: _makeTr = makeTr } = inject;
  const rows = R.addIndex(R.map)(
    (x, i) => _makeTr(x, i, getCurrency, getAccount),
    data
  );
  return <tbody>{rows}</tbody>;
};


/**
 * Makes a single tr for the table
 * @param {AccountBalanceEvolutionData} data
 * @param {number} key
 * @param {(x: number) => Currency} getCurrency
 * @param {(x: number) => Account} getAccount
 * @param {any} inject?
 */
export function makeTr(data, key, getCurrency, getAccount, inject={}) {
  const { makeTd: _makeTd = makeTd } = inject;
  const accountName = getAccount(data.account).name;
  const accountNameTd = <td key="accountName">{accountName}</td>;
  const tds = R.addIndex(R.map)(
    (x, i) => _makeTd(x, getCurrency, i),
    data.balanceEvolution
  );
  return <tr key={key}>{accountNameTd}{tds}</tr>;
};


/**
 * Makes a single td with account data for a table
 * @param {Balance} balance
 * @param {(x: number) => Currency} getCurrency
 * @param {number} key
 */
export function makeTd(balance, getCurrency, key) {
  return <td key={key}>{moneysToRepr(getCurrency, balance)}</td>;
};
