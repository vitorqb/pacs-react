import React from 'react';
import * as R from 'ramda';
import HostInput, { valueLens as HostInputLens } from './HostInput/Core';
import TokenInput, { valueLens as TokenInputLens } from './TokenInput/Core';
import { LocalStorageUtil, CryptoUtil, StrUtil } from '../utils';
import { Either } from 'monet';
import YesNoButton, { StateLens as YesNoButtonStateLens } from './YesNoButton';

const tokenValueLens = R.lensPath(['tokenValue']);
const hostValueLens = R.lensPath(['hostValue']);
const loadFromCacheValueLens = R.lensPath(['loadFromCacheValue']);
const saveToCacheYesNoButtonStateLens = R.lensPath(['saveToCacheYesNoButtonStateLens']);
const saveToCacheValueLens = R.lensPath(['saveToCacheValueLens']);

export const valueLens = {

  tokenValue: tokenValueLens,
  token: R.compose(tokenValueLens, TokenInputLens.token),

  hostValue: hostValueLens,
  host: R.compose(hostValueLens, HostInputLens.host),

  loadFromCacheValue: loadFromCacheValueLens,
  loadFromCachePassword: R.compose(loadFromCacheValueLens, TokenInputLens.token),

  saveToCacheValue: saveToCacheValueLens,
  saveToCachePassword: R.compose(saveToCacheValueLens, TokenInputLens.token),

  saveToCacheYesNoButtonState: saveToCacheYesNoButtonStateLens,
  saveToCacheYesNoButtonValue: R.compose(saveToCacheYesNoButtonStateLens,
                                         YesNoButtonStateLens.value),
  
};

const propsForLens = R.curry((lens, { onChange, value }) => {
  return {
    value: R.view(lens, value),
    onChange: newLensVal => onChange(R.set(lens, newLensVal, value))
  };
});

const LoginPage = props => {

  const onSubmitClick = R.pipe(
    e => e.preventDefault(),
    _ => LocalStorageToken.encryptAndSetFromProps(props),
    R.map(props.onSubmit),
    x => x.leftMap(alert),
  );

  const onLoadFromLocalStorage = () => {
    return LocalStorageToken.getAndDecryptFromProps(props).cata(
      alert,
      token => props.onChange(R.set(valueLens.token, token, props.value)),
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
        <SaveToCachePasswordInput {...props} />
        <div className="login-page__btn">
          <button type="submit" onClick={onSubmitClick}> Submit </button>
        </div>
      </form>
      <div className="login-page__options">
        <span className="login-page__label login-page__label--small">
          Save to cache? 
        </span>
        <span>
          <YesNoButton
            state={R.view(valueLens.saveToCacheYesNoButtonState, props.value)}
            onChange={x => {
              props.onChange(R.set(valueLens.saveToCacheYesNoButtonState, x, props.value));
            }}
          />
        </span>
      </div>
      <div className="login-page__load_from_cache">
        <div className="login-page__input">
          <span className="login-page__label">
            Password:
          </span>
          <TokenInput {...propsForLens(valueLens.loadFromCacheValue, props)} />
        </div>
        <div className="login-page__btn login-page__btn--secondary">
          <button onClick={onLoadFromLocalStorage}>Load Token From Cache</button>
        </div>
      </div>
    </div>
  );
};

/**
 * A helper component for displaying the password used to save from cache.
 */
export function SaveToCachePasswordInput(props) {
  let shouldSaveFromCache = R.view(valueLens.saveToCacheYesNoButtonValue, props.value);
  if (! shouldSaveFromCache) { return <></>; }
  return (
    <div className="login-page__input">
      <span className="login-page__label">
        Password:
      </span>
      <TokenInput {...propsForLens(valueLens.saveToCacheValue, props)} />
    </div>
  );
}

/**
 * A small service providing a token get/set from Local Storage.
 */
export const LocalStorageToken = {

  LOCAL_STORAGE_KEY: "LoginPage__LocalStorageToken",
  LOCAL_STORAGE_NOT_AVAILABLE: Either.left("Local storage is not available"),
  EMPTY_PASSWORD: Either.left("Empty password"),
  INVALID_PASSWORD: Either.left("Invalid password - use only common letters, numbers and symbols"),
  TOKEN_NOT_FOUND: Either.left("Token not found on local storage"),
  TOKEN_DECRYPTION_FAILED: Either.left("Token decryption failed."),

  /**
   * Helper method that gets and decrypts using the LoginPage props.
   * @param props - The props for LoginPage.
   * @returns - A Either[RIGHT=String, LEFT=Error] with either the token ot an error msg.
   */
  getAndDecryptFromProps({ value }) {
    return LocalStorageToken.getAndDecrypt(R.view(valueLens.loadFromCachePassword, value));
  },

  /**
   * Gets the token from the LocalStorage (if any), descrypts and returns.
   * @returns - A Either[RIGHT=String, LEFT=Error] with either the token ot an error msg.
   */
  getAndDecrypt(password) {
    if (! LocalStorageUtil.storageAvailable()) { return this.LOCAL_STORAGE_NOT_AVAILABLE; };
    if (R.isNil(password) || password === "") { return this.EMPTY_PASSWORD; };

    let encryptedToken = LocalStorageUtil.get(LocalStorageToken.LOCAL_STORAGE_KEY);
    if (R.isNil(encryptedToken)) { return this.TOKEN_NOT_FOUND; };

    let decryptedToken = CryptoUtil.decrypt(encryptedToken, password);
    return R.isNil(decryptedToken)
      ? LocalStorageToken.TOKEN_DECRYPTION_FAILED
      : Either.right(decryptedToken);
  },

  /**
   * Encrypts a password and saves it in the local storage.
   * @param token - The token to store.
   * @param password - The password to use.
   * @returns - An Either[LEFT=String, RIGHT=null], with an error message or null.
   */
  encryptAndSet(token, password) {
    if (! LocalStorageUtil.storageAvailable()) { return this.LOCAL_STORAGE_NOT_AVAILABLE; };
    if (R.isNil(password) || password === "") { return this.EMPTY_PASSWORD; };
    if (! StrUtil.isASCII(password)) { return this.INVALID_PASSWORD; };

    LocalStorageUtil.set(LocalStorageToken.LOCAL_STORAGE_KEY, CryptoUtil.encrypt(token, password));
    return Either.right(null);
  },
  
  /**
   * Set's a token in the local storage reading from LoginPage props.
   * @param props -
   * @returns - An Either[LEFT=String, RIGHT=null], with an error message or null.
   */
  encryptAndSetFromProps({ value }) {
    if (! R.view(valueLens.saveToCacheYesNoButtonValue, value)) {
      return Either.right(null);
    };
    return LocalStorageToken.encryptAndSet(R.view(valueLens.token, value),
                                           R.view(valueLens.saveToCachePassword, value));
      
  },
};

export default LoginPage;
