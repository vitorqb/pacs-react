import * as R from 'ramda';

export const lens = {
  refetchAppContext: R.lensPath(['refetchAppContext']),
  overState: R.lensPath(['overState']),
  setState: R.lensPath(['setState']),
};
