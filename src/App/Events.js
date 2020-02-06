import * as R from 'ramda';

export const lens = {
  refetchState: R.lensPath(['refetchState']),
  overState: R.lensPath(['overState']),
  setState: R.lensPath(['setState']),
};
