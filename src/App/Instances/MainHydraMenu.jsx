import React from 'react';
import HydraMenu from '../../components/HydraMenu/HydraMenu.jsx';
import * as Hydra from '../../domain/Hydra/Hydra.js';
import * as R from 'ramda';
import * as AppContext from '../AppContext.jsx';
import { PATHS } from '../Routes.jsx';

// !!!! TODO
export const rootHydraNodes = (navigationService) => {
  return [
    Hydra.newLeafNode({
      shortcut: 'a',
      description: 'Alert',
      actionFn: () => navigationService.navigateTo(PATHS.ACCOUNT_BALANCE_EVOLUTION_REPORT)
    }),
  ];
};

export const MainHydraMenu = (props) => {
  const {appContext} = props;
  const actionDispatcher = R.view(AppContext.lens.actionDispatcher, appContext);
  const navigationService = R.view(AppContext.lens.navigationService, appContext);
  if (!actionDispatcher) {
    return <div/>;
  };
  return (
    <HydraMenu
      title={"Main Menu"}
      actionDispatcher={actionDispatcher}
      rootHydraNodes={rootHydraNodes(navigationService)}
    />
  );
};

export default MainHydraMenu;
