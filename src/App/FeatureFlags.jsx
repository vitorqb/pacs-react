import * as R from 'ramda';
import React, { useState, useEffect } from 'react';

export const TOKEN_IN_EXCHANGE_FETCHER = 'TOKEN_IN_EXCHANGE_FETCHER';

export const DEFAULT_FLAGS = {
  TOKEN_IN_EXCHANGE_FETCHER: false,
};

export class FeatureFlagsSvc {

  LOCAL_STORAGE_KEY = 'FEATURE_FLAGS'

  constructor(defaultFlags, localStorage) {
    this._getFlags = () => localStorage.getItem(this.LOCAL_STORAGE_KEY);
    this._setFlags = (x) => localStorage.setItem(this.LOCAL_STORAGE_KEY, x);
    this._defaultFlags = defaultFlags;
  }

  isActive = x => R.pathOr(R.pathOr(false, [x], this._defaultFlags), [x], this._getFlags());
  setActive = x => this._setFlags(R.assocPath([x], true, this._getFlags()));
  setInactive = x => this._setFlags(R.assocPath([x], false, this._getFlags()));

};

export const FeatureFlagsProvider = ({ children, defaultFlags=DEFAULT_FLAGS }) => {
  const [featureFlagsSvc, setFeatureFlagsSvc] = useState(new FeatureFlagsSvc(defaultFlags, window.localStorage));
  useEffect(() => {
    setFeatureFlagsSvc(new FeatureFlagsSvc(defaultFlags, window.localStorage));
  }, [defaultFlags]);
  return children(featureFlagsSvc);
};
