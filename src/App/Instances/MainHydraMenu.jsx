import React from 'react';
import HydraMenu from '../../components/HydraMenu/HydraMenu.jsx';
import * as Hydra from '../../domain/Hydra/Hydra.js';
import * as R from 'ramda';
import * as AppContext from '../AppContext.jsx';

export const getRootHydraNodes = (navigationService, routesData) => {
  return [
    Hydra.newBranchNode({
      shortcut: 'n',
      description: 'Navigate',
      children: R.map(Hydra.branchNodeFromGroupOfRoutes(navigationService.navigateTo))(routesData),
    }),
  ];
};

export const _COMPONENT_INSTANCE = {name: "MainHydraMenu"};

export const MainHydraMenu = (props) => {
  const {appContext, routesData} = props;
  const actionDispatcher = R.view(AppContext.lens.actionDispatcher, appContext);
  const navigationService = R.view(AppContext.lens.navigationService, appContext);
  const appContextService = R.view(AppContext.lens.appContextService, appContext);
  if (!actionDispatcher) {
    return <div/>;
  };
  return (
    <HydraMenu
      title={"Main Menu"}
      actionDispatcher={actionDispatcher}
      rootHydraNodes={getRootHydraNodes(navigationService, routesData)}
      onDisplay={() => appContextService.pushActiveComponentInstance(_COMPONENT_INSTANCE)}
      onHide={() => appContextService.filterOutActiveComponentInstance(_COMPONENT_INSTANCE)}
    />
  );
};

export default MainHydraMenu;
