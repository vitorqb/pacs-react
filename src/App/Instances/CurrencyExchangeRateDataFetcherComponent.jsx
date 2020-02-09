import React from 'react';
import CurrencyExchangeRateDataFetcherComponent from '../../components/CurrencyExchangeRateDataFetcherComponent.jsx';
import { lens as AjaxInjectionsLens } from '../Ajax';
import * as R from 'ramda';
import { lens as EventsLens } from '../Events';

export default function CurrencyExchangeRateDataFetcherComponentInstance(renderArgs) {
  const { state, events, ajaxInjections } = renderArgs;
  const lens = R.lensPath(["CurrencyExchangeRateDataFetcherComponentInstance"]);
  const onChange = R.view(EventsLens.setState, events);
  const value = R.view(lens, state);
  const fetchCurrencyExchangeRateData = R.view(AjaxInjectionsLens.fetchCurrencyExchangeRateData,
                                               ajaxInjections);

  return (
    <CurrencyExchangeRateDataFetcherComponent
      onChange={onChange(lens)}
      value={value}
      fetchCurrencyExchangeRateData={fetchCurrencyExchangeRateData} />
  );
}
