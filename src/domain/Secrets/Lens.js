import * as R from 'ramda';

export const secretsLens = {
  
  token: R.lensPath(['token']),
  host: R.lensPath(['host']),
  
};

export default secretsLens;
