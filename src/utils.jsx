import React from 'react';
import * as R from 'ramda';
import numeral from 'numeral';
import moment from 'moment';


/**
 * @typedef Currency
 * @type {object}
 * @property {number} pk
 * @property {string} name
 */

/**
  * @typedef Money
  * @type {object}
  * @property {number} currency
  * @property {number} quantity
  */

/**
 * @typedef Balance
 * @type {Money[]}
 */

/**
 * @typedef Movement
 * @type {object}
 * @property {Money} money
 * @property {number} account
 */

/**
 * A specification of how a movement should be.
 * @typedef {Object} MovementSpec
 * @property {number} [account]
 * @property {Money} money
 */

/**
 * A specification of how a transaction should be.
 * @typedef {Object} TransactionSpec
 * @property {string} [description]
 * @property {moment} [date]
 * @property {MovementSpec[]} [movements]
 */

/**
 * A specification of how an account should be.
 * @typedef {Object} AccountSpec
 * @property {string} [name]
 * @property {string} [accType]
 * @property {number} [parent]
 */

/**
 * An account.
 * @typedef {Object} Account
 * @property {string} name
 * @property {string} accType
 * @property {number} parent
 */

/**
 * A specification for a journal data
 * @typedef {Object} JournalData
 * @property {number} account
 * @property {Balance} initialBalance
 * @property {Transaction[]} transactions
 * @property {Balance[]} balances
 */

/**
 * A specification for a paginated journal data
 * @typedef {Object} PaginatedJournalData
 * @property {number} itemCount - Total number of items.
 * @property {number} pageCount - Total number of pages.
 * @property {string} previous - Link to previous page
 * @property {string} next - Link to next page
 * @property {JournalData} data - The data.
 */


/**
 * @function
 * Maps a Transaction to a TransactionSpec.
 */
export const getSpecFromTransaction = R.pick(["description", "date", "movements"]);

/**
 * @function
 * Maps an Account into an AccountSpec.
 */
export const getSpecFromAccount = R.pick(["name", "accType", "parent"]);

/**
 * Returns a clone of the object with keys remapped according to keysmapping.
 */
export const remapKeys = R.curry(function(keysMapping, obj) {
  const updateKey = oldKey => keysMapping[oldKey] || oldKey;
  const updatePair = ([key, value]) => [updateKey(key), value];
  return R.pipe(R.toPairs, R.map(updatePair), R.fromPairs)(obj)
})

/**
 * omit indexes from an array.
 * source https://github.com/ramda/ramda/wiki/Cookbook#omitindexes
 */
export const rejectIndexed = R.addIndex(R.reject);
export const containsIndex = R.curry(
  (indexes, val, index) => R.contains(index, indexes)
);
export const omitIndexes = R.curry(
  (indexes, list) => rejectIndexed(containsIndex(indexes), list)
);


/**
  * Creates a span with a title.
  * @param {string} title - The title.
  */
export function createTitle(title) {
  return <span className="titleSpan">{title}</span>
}


/**
 * Creates an input html tag.
 * @param {Object} opts - The options.
 * @param {string} opts.type - The type of the input.
 * @param {string} opts.name - The name of the input.
 * @param {Function} opts.onChange - A callback for change event.
 * @param {?} opts.value - A value to parse to the input.
 */
export function createInput({ type, name, onChange, value }) {
  return (
    <div className="inputDiv" key={name}>
      {name}: 
      <input type={type} name={name} value={value} onChange={onChange} />
    </div>
  );
}

/**
 * Returns all Money objects from a list of movements for a given account,
 * considering all it's descendants.
 * @function
 * @param {fn(number) -> Account} getAccount - A function that returns an account
 *   from it's pk.
 * @param {fn(Account, Account) -> bool} isDescendant - A function that receives 
 *   two accounts and returns whether the first is a descendant of the second.
 * @param {Account} account
 * @param {Movement[]} movements
 * @return {Money[]} A list of Money objects.
 */
export const extractMoneysForAccount = R.curry(
  function(getAccount, isDescendant, account, movements) {
    const isDescendatOfAccount = R.partialRight(isDescendant, [account]);
    const isAccount = R.propEq('pk', account.pk);
    const moneyInvolvesAccount = R.pipe(          // Movement ->
      R.prop('account'),                          // -> number
      getAccount,                                 // -> Account
      R.either(isAccount, isDescendatOfAccount),  // -> bool
    );

    return R.pipe(
      R.filter(moneyInvolvesAccount),
      R.map(R.prop('money'))
    )(movements)
  }
)

/**
 * Makes a nice representation out of a list of moneys.
 * @function
 * @param {(n: number) => Currency} getCurrency
 * @param {Money[]} moneys
 * @returns {string}
 */
export const moneysToRepr = R.curry(function(getCurrency, moneys) {
  const quantityToRepr = m => numeral(m.quantity).format('+0.00');
  const currencyToRepr = m => getCurrency(m.currency).name;
  return R.pipe(
    R.map(m => `${quantityToRepr(m)} ${currencyToRepr(m)}`),
    R.join("; ")
  )(moneys);
})

/**
 * Considering all accounts in an array, returns True if the first account
 * is a descendant of the second.
 * @function
 * @param {Account[]} accounts
 * @param {Account} first
 * @param {Account} second
 * @returns bool
 */
export const isDescendant = R.curry(function(accounts, first, second) {
  // Is second the parent?
  if (first.parent === second.pk) {
    return true
  } else {
    // Is any of the sons of second an ancestor?
    const sonsOfSecond = R.filter(R.propEq('parent', second.pk), accounts);
    return R.any(isDescendant(accounts, first), sonsOfSecond)
  }
})



/**
 * Extracts source or target accounts from an array of movements.
 * @function
 * @param {string} type - One of "source" or "target"
 * @param {Movement[]} movements
 * @return {number[]}
 */
export const getSourceOrTargetAccsPks = R.curry(function(type, movements) {
  let filterFunction;
  const getAccountPkAndQuantity = (m => [m.account, m.money.quantity]);
  const accountPkQuantityPairs = R.map(getAccountPkAndQuantity, movements);

  if (type === "source") {
    filterFunction = ([_, q]) => q <= 0;
  } else if (type === "target") {
    filterFunction = ([_, q]) => q > 0;
  } else {
    throw new Error("Invalid type")
  }

  return R.pipe(R.filter(filterFunction), R.map(R.prop(0)))(accountPkQuantityPairs);  
})

/**
 * Extracts from an array of movements the pk of all accounts that are
 * source (negative quantity).
 * @param {Movement[]} movements
 * @return {number[]}
 */
export const getSourceAccsPks = getSourceOrTargetAccsPks("source");

/**
 * Extracts from an array of movements the pk of all accounts that are
 * targets (positive quantity).
 * @param {Movement[]} movements
 * @return {number[]}
 */
export const getTargetAccsPks = getSourceOrTargetAccsPks("target");


/**
 * Returns a function that retrieves the first element of an array for which
 * filter function matches.
 * @param {Function} extractValue - A function that is applied to each element
 *   in elements to calculate the value that will be matched.
 * @param {Object[]} elements - The element that will be selected by the 
 *   returning function.
 * @return {Function} A function that accepts `value` and selects the element
 *   from elements for which extractValue(element) == `value`.
 */
export function newGetter(extractValue, elements) {
  return function(value) {
    const elementValueMatches = e => extractValue(e) === value;
    return R.find(elementValueMatches, elements)
  }
}


/**
 * Memoizes a function with a single argument.
 * @function
 */
export const memoizeSimple = R.memoizeWith(R.identity)


// Misc utils related to month
export const MonthUtil = {
  MONTHS: [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December"
  ],
  getMonthIndex: m => R.findIndex(R.equals(m.month), MonthUtil.MONTHS),
  getMonthAsNumber: m => Number(`${m.year}`) * 100 + MonthUtil.getMonthIndex(m) + 1,
  monthToPeriod: (m) => {
    const monthStr = `${MonthUtil.getMonthAsNumber(m)}`;
    const date = moment(monthStr + "01");
    return [
      date.startOf("month").format("YYYY-MM-DD"),
      date.endOf("month").format("YYYY-MM-DD"),
    ];
  },
  toLabel: (m) => `${m.month}/${m.year}`,
  monthsBetween: (start, end) => {
    const { getMonthAsNumber } = MonthUtil;
    var out = [start];
    var current = start;
    while (getMonthAsNumber(current) < getMonthAsNumber(end)) {
      const date = moment(`${getMonthAsNumber(current)}01`).add(1,'month');
      current = {month: date.format("MMMM"), year: Number(date.format("YYYY"))};
      out = [...out, current];
    }
    return out;
  }
};
