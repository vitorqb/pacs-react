import React from 'react';
import * as R from 'ramda';
import HostInput, { valueLens as HostInputLens } from './HostInput/Core';
import TokenInput, { valueLens as TokenInputLens } from './TokenInput/Core';
import { LocalStorageUtil, CryptoUtil } from '../utils';
import { Either } from 'monet';

const tokenValueLens = R.lensPath(['tokenValue']);
const hostValueLens = R.lensPath(['hostValue']);
const loadFromCacheValueLens = R.lensPath(['loadFromCacheValue']);

export const valueLens = {

  tokenValue: tokenValueLens,
  token: R.compose(tokenValueLens, TokenInputLens.token),

  hostValue: hostValueLens,
  host: R.compose(hostValueLens, HostInputLens.host),

  loadFromCacheValue: loadFromCacheValueLens,
  loadFromCachePassword: R.compose(loadFromCacheValueLens, TokenInputLens.token)
  
};

const propsForLens = R.curry((lens, { onChange, value }) => {
  return {
    value: R.view(lens, value),
    onChange: newLensVal => onChange(R.set(lens, newLensVal, value))
  };
});

const LoginPage = props => {
  const onSubmit = props.onSubmit;
  const onSubmitClick = e => {
    e.preventDefault();
    onSubmit();
  };
  const onLoadFromLocalStorage = () => {
    return LocalStorageToken.getAndDecryptFromProps(props).cata(
      token => props.onChange(R.set(valueLens.token, token, props.value)),
      err => console.log(err)
    );
  };
  
  return (
    <div className="login-page">
      <form>
        <div className="login-page__input">
          <span className="login-page__label">
            Host: 
          </span>
          <HostInput {...propsForLens(valueLens.hostValue, props)} />
        </div>
        <div className="login-page__input">
          <span className="login-page__label">
            Token:
          </span>
          <TokenInput {...propsForLens(valueLens.tokenValue, props)} />
        </div>
        <div className="login-page__btn">
          <button type="submit" onClick={onSubmitClick}> Submit </button>
        </div>
      </form>
      <div className="login-page__load_from_cache">
        <div className="login-page__input">
          <span className="login-page__label">
            Password:
          </span>
          <TokenInput {...propsForLens(valueLens.loadFromCachePassword, props)} />
        </div>
        <div className="login-page__btn login-page__btn--secondary">
          <button onClick={onLoadFromLocalStorage}>Load Token From Cache</button>
        </div>
      </div>
    </div>
  );
};

/**
 * A small service providing a token get/set from Local Storage.
 */
export const LocalStorageToken = {

  LOCAL_STORAGE_KEY: "LoginPage__LocalStorageToken",
  LOCAL_STORAGE_NOT_AVAILABLE: Either.right("Local storage is not available"),
  EMPTY_PASSWORD: Either.right("Empty password"),
  TOKEN_NOT_FOUND: Either.right("Token not found on local storage"),

  /**
   * Helper method that gets and decrypts using the LoginPage props.
   * @param props - The props for LoginPage.
   * @returns - A Either[LEFT=String, RIGHT=Error] with either the token ot an error msg.
   */
  getAndDecryptFromProps({ value }) {
    return LocalStorageToken.getAndDecrypt(R.view(valueLens.loadFromCachePassword, value));
  },

  /**
   * Gets the token from the LocalStorage (if any), descrypts and returns.
   * @returns - A Either[LEFT=String, RIGHT=Error] with either the token ot an error msg.
   */
  getAndDecrypt(password) {
    if (! LocalStorageUtil.storageAvailable()) { return this.LOCAL_STORAGE_NOT_AVAILABLE; };
    if (R.isNil(password) || password === "") { return this.EMPTY_PASSWORD; };

    let encryptedToken = LocalStorageUtil.get(LocalStorageToken.LOCAL_STORAGE_KEY);
    if (R.isNil(encryptedToken)) { return this.TOKEN_NOT_FOUND; };

    return Either.left(CryptoUtil.decrypt(encryptedToken, password));
  },
};

export default LoginPage;
