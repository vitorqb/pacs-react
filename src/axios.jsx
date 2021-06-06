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
 * Returns a new axios wrapper with custom optiosn
 */
export const mkAxiosWrapper = ({baseUrl, token}) => {
  const axiosOpts = {};
  if (baseUrl) {
    axiosOpts.baseURL = baseUrl;
  }
  if (token) {
    axiosOpts.headers = {Authorization: `Token ${token}`};
  }
  return axios.create(axiosOpts);
};


/**
 * A provider component for an axios
 */
export const AxiosProvider = ({baseUrl, token, children}) => {
  const [axios, setAxios] = useState(null);
  useEffect(() => {
    setAxios(() => mkAxiosWrapper({baseUrl, token}));
  }, [baseUrl, token]);
  return axios ? children(axios) : <div/>;
};
