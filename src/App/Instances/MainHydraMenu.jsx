import React from 'react';
import HydraMenu from '../../components/HydraMenu/HydraMenu.jsx';
import * as R from 'ramda';
import * as AppContext from '../AppContext.jsx';

export const MainHydraMenu = (props) => {
  const {appContext} = props;
  const actionDispatcher = R.view(AppContext.lens.actionDispatcher, appContext);
  if (!actionDispatcher) {
    return <div/>;
  };
  return <HydraMenu actionDispatcher={actionDispatcher} />;
};

export default MainHydraMenu;
