import React from 'react';
import CurrencyExchangeRateDataFetcherComponentInstance from '../CurrencyExchangeRateDataFetcherComponent';
import * as R from 'ramda';
import * as RU from '../../../ramda-utils';
import * as AppContext from '../../AppContext.jsx';
import { mount } from 'enzyme';
import { lens as AjaxInjectionsLens } from '../../Ajax';


describe('CurrencyExchangeRateDataFetcherComponentInstance', () => {

  describe('With FETCH_EXCHANGERATE_ENDPOINT_V2', () => {

    it('Uses v2 of fetch exchange rates endpoint', () => {
      const endpointV1 = async () => {};
      const endpointV2 = async () => {};
      const ajaxInjections = RU.objFromPairs(
        AjaxInjectionsLens.fetchCurrencyExchangeRateData, endpointV1,
        AjaxInjectionsLens.fetchCurrencyExchangeRateDataV2, endpointV2,
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
        endpointV2
      );
    });

  });

});
