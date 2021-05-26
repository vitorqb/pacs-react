import React, { useEffect, useState } from 'react';
import styles from './LoginProvider.module.scss';

export const LoginProvider = ({ loginSvc, renderLoginPage, children, onLoggedIn }) => {

  const [isLoading, setIsLoading] = useState(true);
  const [tokenValue, setTokenValue] = useState(null);

  const handleTokenReceived = token => {
    setTokenValue(token);
    if (onLoggedIn) {
      onLoggedIn(token);
    };
  };
  const onGetToken = admintToken => loginSvc.getToken(admintToken).then(handleTokenReceived);

  useEffect(() => {
    loginSvc
      .recoverTokenFromCookies()
      .then(handleTokenReceived)
      .catch(x => {})
      .finally(_ => setIsLoading(false));
  }, [loginSvc]);

  if (isLoading) {
    return <div className={`${styles.loading}`}/>;
  }

  if (!tokenValue) {
    return renderLoginPage({ onGetToken }); 
  }

  return children(tokenValue);
};
