import React from 'react';
import HydraMenu from '../../components/HydraMenu/HydraMenu.jsx';
import * as Hydra from '../../domain/Hydra/Hydra.js';
import * as R from 'ramda';
import * as AppContext from '../AppContext.jsx';

// !!!! TODO
export const hydraNodes = () => {
  return [
    Hydra.newLeafNode({shortcut: 'a', description: 'Alert', actionFn: () => alert("A!")})
  ];
};

export const MainHydraMenu = (props) => {
  const {appContext} = props;
  const actionDispatcher = R.view(AppContext.lens.actionDispatcher, appContext);
  if (!actionDispatcher) {
    return <div/>;
  };
  return (
    <HydraMenu
      actionDispatcher={actionDispatcher}
      hydraNodes={hydraNodes()}
    />
  );
};

export default MainHydraMenu;
