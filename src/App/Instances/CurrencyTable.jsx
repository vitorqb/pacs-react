import React from 'react';
import { lens as AppLens } from '../Lens';
import * as R from 'ramda';
import CurrencyTable from '../../components/CurrencyTable';


export default function CurrencyTableInstance({appContext}) {
  const currencies = R.view(AppLens.currencies, appContext);
  if (currencies !== [] && !currencies) {
    return <p>Loading...</p>;
  }
  return <CurrencyTable currencies={currencies} title="Currencies" />;  
};
