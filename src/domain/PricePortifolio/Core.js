import * as R from 'ramda';
import monet, { Success, Fail } from 'monet';
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
