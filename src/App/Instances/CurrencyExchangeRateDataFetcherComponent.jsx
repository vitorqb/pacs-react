import React from 'react';
import CurrencyExchangeRateDataFetcherComponent from '../../components/CurrencyExchangeRateDataFetcherComponent.jsx';
import { lens as AppLens } from '../Lens';
import { lens as AjaxInjectionsLens } from '../Ajax';
import * as R from 'ramda';
import * as RU from '../../ramda-utils';
import { lens as EventsLens } from '../Events';

export default function CurrencyExchangeRateDataFetcherComponentInstance(renderArgs) {
  const { state, events, stateGetters, ajaxInjections } = renderArgs;
  const lens = R.lensPath(["CurrencyExchangeRateDataFetcherComponentInstance"]);
  const onChange = R.view(EventsLens.setState, events);
  const value = R.view(lens, state);

  return (
    <CurrencyExchangeRateDataFetcherComponent
      onChange={onChange(lens)}
      value={value} />
  );
}
