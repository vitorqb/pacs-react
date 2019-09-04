import * as R from 'ramda';
import monet from 'monet';
import * as Validation from './Validation';

/**
  * Parses a raw string into a Price Portifolio.
  */
export const parseContents = contents => {
  let parsed;
  try {
    parsed = JSON.parse(contents);
  } catch(_) {
    return monet.Fail("Invalid json!");
  }
  return Validation.validatePortifolio(parsed);
};

/**
  * Produces statistics of a Price Portifolio. Assumes it is valid portifolio.
  */
export const getStats = portifolio => {
  return {
    numberOfEntires: R.fromPairs(R.map(R.pipe(
      x => [R.prop('currency', x), R.prop('prices', x)],
      ([c, ps]) => [c, R.length(ps)],
    ))(portifolio))
  };
};

/**
 * Normalizes all prices of a portifolio to 5 fixed digits.
 */
export const normalizePortifolioPrices = R.map(
  R.over(R.lensProp('prices'), R.map(R.over(R.lensProp('price'), x => x.toFixed(5))))
);
