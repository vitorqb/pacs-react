// This module contains all functions that performs ajax requests
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import * as R from 'ramda';
import SecretsLens from './domain/Secrets/Lens';


/**
 * Given a secrets (see domains/Secrets), returns an axios wrapper used to
 * make http requests.
 */
export const mkAxiosWrapperFromSecrets = secrets => {
  return mkAxiosWrapper({
    baseUrl: R.view(SecretsLens.host, secrets),
    token: R.view(SecretsLens.token, secrets),
  });
};


/**
 * Serializes a map of FeatureFlags into a string understood by BE
 */
export const serializeFeatureFlags = R.pipe(
  R.toPairs,
  R.map(([x, y]) => y === true ? x : `!${x}`),
  R.join(","),
);


/**
 * Returns a new axios wrapper with custom optiosn
 */
export const mkAxiosWrapper = ({baseUrl, token, featureFlags}) => {
  const axiosOpts = {};
  if (baseUrl) {
    axiosOpts.baseURL = baseUrl;
  }
  axiosOpts.headers = R.pipe(
    R.when(() => token, R.assoc("Authorization", `Token ${token}`)),
    R.when(() => featureFlags, R.assoc("Pacs-Feature-Toggles", serializeFeatureFlags(featureFlags)))
  )({});
  return axios.create(axiosOpts);
};


/**
 * A provider component for an axios
 */
export const AxiosProvider = ({baseUrl, token, children, featureFlags}) => {
  const [axios, setAxios] = useState(null);
  useEffect(() => {
    setAxios(() => mkAxiosWrapper({baseUrl, token, featureFlags}));
  }, [baseUrl, token]);
  return axios ? children(axios) : <div/>;
};
