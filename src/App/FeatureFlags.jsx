import * as R from 'ramda';
import React, { useState, useEffect } from 'react';

export const TOKEN_IN_EXCHANGE_FETCHER = 'TOKEN_IN_EXCHANGE_FETCHER';

export const DEFAULT_FLAGS = {
  TOKEN_IN_EXCHANGE_FETCHER: false,
};

export class FeatureFlagsSvc {

  constructor(flags, setFlags) {
    this._flags = flags;
    this._setFlags = setFlags;
  }

  isActive = x => R.pathOr(false, [x], this._flags);
  setActive = x => this._setFlags(R.assocPath([x], true, this._flags));
  setInactive = x => this._setFlags(R.assocPath([x], false));

};

export const FeatureFlagsProvider = ({ children, defaultFlags=DEFAULT_FLAGS }) => {
  const [flags, setFlags] = useState(defaultFlags);
  const [featureFlagsSvc, setFeatureFlagsSvc] = useState(new FeatureFlagsSvc(flags, setFlags));
  useEffect(() => {
    setFeatureFlagsSvc(new FeatureFlagsSvc(flags, setFlags));
  }, [flags, setFlags]);
  return children(featureFlagsSvc);
};
