import React, { useState } from 'react';
import CurrencyExchangeRateDataFetcherComponent from '../../components/CurrencyExchangeRateDataFetcherComponent.jsx';
import { lens as AjaxInjectionsLens } from '../Ajax';
import * as R from 'ramda';
import * as AppContext from '../AppContext.jsx';

export default function CurrencyExchangeRateDataFetcherComponentInstance(renderArgs) {
  const { ajaxInjections, appContext } = renderArgs;
  const [ state, setState ] = useState({});
  const featureFlagsSvc = R.view(AppContext.lens.featureFlagsSvc, appContext);

  if (!featureFlagsSvc) return;

  const fetchCurrencyExchangeRateData =
        R.view(AjaxInjectionsLens.fetchCurrencyExchangeRateData, ajaxInjections);

  return (
    <CurrencyExchangeRateDataFetcherComponent
      onChange={setState}
      value={state}
      fetchCurrencyExchangeRateData={fetchCurrencyExchangeRateData}
    />
  );
}
