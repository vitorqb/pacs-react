import React from 'react';
import { lens as AppLens } from '../Lens';
import * as R from 'ramda';
import AccountTree from '../../components/AccountTree';

export default function AccountTreeInstance({state}) {
  const accounts = R.view(AppLens.accounts, state);
  if (R.isNil(accounts)) {
    return <p>Loading...</p>;
  }
  return <AccountTree accounts={accounts} />;
};
