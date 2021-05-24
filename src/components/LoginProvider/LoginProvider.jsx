import React, { useEffect, useState } from 'react';
import styles from './LoginProvider.module.scss';

export const LoginProvider = ({ loginSvc, children }) => {

  const [isLoading, setIsLoading] = useState(true);
  const [tokenValue, setTokenValue] = useState(null);

  useEffect(() => {
    loginSvc
      .recoverTokenFromCookies()
      .then(x => {
        setTokenValue(x);
        setIsLoading(false);
      });
  }, [loginSvc]);

  return isLoading ? <div className={`${styles.loading}`}/> : children(tokenValue);
};
