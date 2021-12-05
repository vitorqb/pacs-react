import React from 'react';
import CurrencyExchangeRateDataFetcherComponentInstance from '../CurrencyExchangeRateDataFetcherComponent';
import * as R from 'ramda';
import * as RU from '../../../ramda-utils';
import * as AppContext from '../../AppContext.jsx';
import { mount } from 'enzyme';
import { lens as AjaxInjectionsLens } from '../../Ajax';


describe('CurrencyExchangeRateDataFetcherComponentInstance', () => {

  it('Uses fetch exchange rates endpoint', () => {
    const endpoint = async () => {};
    const ajaxInjections = RU.objFromPairs(
      AjaxInjectionsLens.fetchCurrencyExchangeRateDataV2, endpoint,
    );
    const featureFlagsSvc = { isActive: () => true };
    const appContext = RU.objFromPairs(AppContext.lens.featureFlagsSvc, featureFlagsSvc);
    const renderArgs = { ajaxInjections, appContext };
    const component = mount(
      <CurrencyExchangeRateDataFetcherComponentInstance {...renderArgs} />
    );
    expect(
      component
        .find('CurrencyExchangeRateDataFetcherComponent')
        .props()
        .fetchCurrencyExchangeRateData
    ).toBe(
      endpoint
    );
  });

});
