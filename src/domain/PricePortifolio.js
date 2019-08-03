import * as R from 'ramda';
import monet from 'monet';

/**
  * Parses a raw string into a Price Portifolio.
  */
export const parseContents = contents => {
  try {
    return monet.Success(JSON.parse(contents));
  } catch(_) {
    return monet.Fail("Invalid json!");
  }
};
