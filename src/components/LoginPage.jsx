import React from 'react';
import * as R from 'ramda';
import HostInput, { valueLens as HostInputLens } from './HostInput/Core';
import TokenInput, { valueLens as TokenInputLens } from './TokenInput/Core';

const tokenValueLens = R.lensPath(['tokenValue']);
const hostValueLens = R.lensPath(['hostValue']);

export const valueLens = {

  tokenValue: tokenValueLens,
  token: R.compose(tokenValueLens, TokenInputLens.token),
  hostValue: hostValueLens,
  host: R.compose(hostValueLens, HostInputLens.host),
  
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
    </div>
  );
};

export default LoginPage;
