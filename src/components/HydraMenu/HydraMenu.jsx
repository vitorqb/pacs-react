import React, { useState, useEffect, useRef} from 'react';
import ReactDOM from 'react-dom';
import classnames from 'classnames';
import styles from './HydraMenu.module.scss';
import * as R from 'ramda';
import { KeyPressUtils, StringUtils } from '../../utils';

export const ACTIONS = {
  TOGGLE_VISIBILITY: "TOGGLE_VISIBILITY"
};

export const handleInputChange = ({hydraNodes, isVisibleState}) => (e) => {
  const value = e.target.value;
  if (R.isEmpty(value) || R.isNil(value)) {
    return;
  }
  const key = value[0];
  const node = R.find(node => node.shortcut == key)(hydraNodes);
  if (! node) {
    return;
  }
  node.actionFn();
};

export const HydraNode = (props) => {
  const {hydraNode} = props;
  return (
    <div className={styles.hydraMenuNode}>
      <span className={styles.hydraMenuNodeDescription}>
        {hydraNode.description}
      </span>
    </div>
  );
};

export const HydraMenuCore = (props) => {
  const {isVisibleState, hydraNodes} = props;
  const className = classnames({
    [styles.hydraMenu]: true,
    hide: !isVisibleState[0],
  });
  if (! isVisibleState[0]) {
    return <></>;
  }
  return (
    <div className={className}>
      <div className={styles.hydraMenuModal}>
        {R.map(hydraNode => {
          return <HydraNode key={hydraNode.shortcut} hydraNode={hydraNode} />;
        })(hydraNodes)}
        <input onChange={handleInputChange({hydraNodes, isVisibleState})} autoFocus />
      </div>
    </div>
  );
};

export const HydraMenu = (props) => {
  const {actionDispatcher, hydraNodes} = props;
  const isVisibleState = useState(false);
  const [, setIsVisible] = isVisibleState;

  useEffect(() => {
    actionDispatcher.register(ACTIONS.TOGGLE_VISIBILITY, () => setIsVisible(R.not));
    return () => actionDispatcher.unregister(ACTIONS.TOGGLE_VISIBILITY);
  });

  return <HydraMenuCore
           isVisibleState={isVisibleState}
           hydraNodes={hydraNodes}
         />;
};

export default HydraMenu;
