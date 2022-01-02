import React, { useEffect, useState } from 'react';
import { useNavigate } from "react-router-dom";
import { NavigationService } from '../../services/Navigation';

export const NavigationServiceProvider = ({children}) => {
  const navigateFn = useNavigate();
  const navigationServiceState = useState(null);
  useEffect(() => {
    navigationServiceState[1](new NavigationService({navigateFn}));
  }, []);
  if (!navigationServiceState[0]) {
    return <></>;
  }
  return children(navigationServiceState[0]);
};
