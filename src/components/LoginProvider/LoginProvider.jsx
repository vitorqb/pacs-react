import React, { useEffect, useState } from 'react';
import styles from './LoginProvider.module.scss';

export const LoginProvider = ({ loginSvc, renderLoginPage, children }) => {

  const [isLoading, setIsLoading] = useState(true);
  const [tokenValue, setTokenValue] = useState(null);

  useEffect(() => {
    loginSvc
      .recoverTokenFromCookies()
      .then(x => {
        setTokenValue(x);
      }).catch(x => {
        
      }).finally(_ => {
        setIsLoading(false);
      });
  }, [loginSvc]);

  if (isLoading) {
    return <div className={`${styles.loading}`}/>;
  }

  if (!tokenValue) {
    return renderLoginPage({ onTokenReceived: tokenValue => setTokenValue(tokenValue) }); 
  }

  return children(tokenValue);
};
