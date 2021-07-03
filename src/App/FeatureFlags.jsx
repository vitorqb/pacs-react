import * as R from 'ramda';
import React, { useState, useEffect } from 'react';

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
  
};

export const FeatureFlagsProvider = ({ children, defaultFlags=DEFAULT_FLAGS }) => {
  const [featureFlagsSvc, setFeatureFlagsSvc] = useState(null);

  useEffect(() => {
    let featureFlagsSvc = new FeatureFlagsSvc(defaultFlags, window.localStorage);
    featureFlagsSvc.setFromUrlParams(window.location.search);
    setFeatureFlagsSvc(featureFlagsSvc);
  }, [defaultFlags]);

  if (!featureFlagsSvc) return <div/>;

  return children(featureFlagsSvc);
};
