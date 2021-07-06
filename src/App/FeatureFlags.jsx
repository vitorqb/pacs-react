import * as R from 'ramda';
import React, { useState, useEffect } from 'react';
import { makeRequest } from '../ajax';

export const TOKEN_IN_EXCHANGE_FETCHER = 'tokenInExchangeFetcher';

export const DEFAULT_FLAGS = {
  TOKEN_IN_EXCHANGE_FETCHER: false,
};

export const readFeaturesFromParams = (params) => {
  const entries = Array.from(new URLSearchParams(params).entries());
  return R.pipe(
    R.filter(([x, y]) => x.startsWith("feature_")),
    R.map(([x, y]) => [x.substring(8), y.toLowerCase() == 'true'])
  )(entries);
};

export class FeatureFlagsSvc {

  LOCAL_STORAGE_PREFIX = 'FEATURE_FLAGS__'

  constructor(defaultFlags, localStorage) {
    this._getItem = x => localStorage.getItem(this.LOCAL_STORAGE_PREFIX + x);
    this._setItem = (x, y) => localStorage.setItem(this.LOCAL_STORAGE_PREFIX + x, y);
    this._localStorage = localStorage;
    this._defaultFlags = defaultFlags;
  }

  isActive = x => {
    let fromLocalStorage = this._getItem(x);
    if (!R.isNil(fromLocalStorage)) {
      return fromLocalStorage == 'true';
    } else {
      return R.pathOr(false, [x], this._defaultFlags);
    }
  }

  setActive = x => this._setItem(x, 'true');

  setInactive = x => this._setItem(x, 'false');;

  setFromUrlParams = urlParams => {
    readFeaturesFromParams(urlParams).forEach(([key, value]) => {
      if (value == true) {
        this.setActive(key);
      } else {
        this.setInactive(key);
      }
    });
  }

  getAll = () => {
    let out = {...this._defaultFlags};
    for (var i = 0; i < this._localStorage.length; i++){
      let key = this._localStorage.key(i);
      if (key.startsWith(this.LOCAL_STORAGE_PREFIX)) {
        out[key] = this._localStorage.getItem(key);
      }
    }
    return out;
  }
  
};

export const fetchFeatureToggles = async ({axios}) => {
  try {
    return await makeRequest({ axios, url: "/featuretoggles" });
  } catch (e) {
    return {};
  }
};

export const FeatureFlagsProvider = ({ children, axios }) => {
  const [featureFlagsSvc, setFeatureFlagsSvc] = useState(null);

  useEffect(() => {
    (async () => {
      let defaultFlags = await fetchFeatureToggles({axios});
      let featureFlagsSvc = new FeatureFlagsSvc(defaultFlags, window.localStorage);
      featureFlagsSvc.setFromUrlParams(window.location.search);
      setFeatureFlagsSvc(featureFlagsSvc);
    })();
  }, [axios]);

  if (!featureFlagsSvc) return <div/>;

  return children(featureFlagsSvc);
};
