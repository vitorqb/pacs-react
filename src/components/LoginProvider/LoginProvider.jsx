import React, { useEffect, useState } from 'react';
import styles from './LoginProvider.module.scss';

export const LoginProvider = ({ loginSvc, renderLoginPage, children }) => {

  const [isLoading, setIsLoading] = useState(true);
  const [tokenValue, setTokenValue] = useState(null);

  const onGetToken = admintToken => loginSvc.getToken(admintToken).then(setTokenValue);

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
    return renderLoginPage({ onGetToken }); 
  }

  return children(tokenValue);
};
