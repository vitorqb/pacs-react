import React from 'react';
import { lens as AppContextLens } from '../AppContext';
import * as R from 'ramda';
import AccountTree from '../../components/AccountTree';

export default function AccountTreeInstance({appContext}) {
  const accounts = R.view(AppContextLens.accounts, appContext);
  if (R.isNil(accounts)) {
    return <p>Loading...</p>;
  }
  return <AccountTree accounts={accounts} />;
};
