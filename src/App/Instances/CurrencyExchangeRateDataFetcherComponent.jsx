import React, { useState } from 'react';
import CurrencyExchangeRateDataFetcherComponent from '../../components/CurrencyExchangeRateDataFetcherComponent.jsx';
import { lens as AjaxInjectionsLens } from '../Ajax';
import * as R from 'ramda';

export default function CurrencyExchangeRateDataFetcherComponentInstance(renderArgs) {
  const { ajaxInjections } = renderArgs;
  const [ state, setState ] = useState({});
  const fetchCurrencyExchangeRateData =
        R.view(AjaxInjectionsLens.fetchCurrencyExchangeRateData, ajaxInjections);
  return (
    <CurrencyExchangeRateDataFetcherComponent
      onChange={setState}
      value={state}
      fetchCurrencyExchangeRateData={fetchCurrencyExchangeRateData} />
  );
}
