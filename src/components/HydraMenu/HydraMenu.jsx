import React, {useState, useEffect} from 'react';
import classnames from 'classnames';
import styles from './HydraMenu.module.scss';
import * as R from 'ramda';

export const ACTIONS = {
  TOGGLE_VISIBILITY: "TOGGLE_VISIBILITY"
};

export const HydraMenuCore = (props) => {
  const {isVisibleState} = props;
  const className = classnames({
    [styles.hydraMenu]: true,
    hide: !isVisibleState[0],
  });
  return (
    <div className={className}>
      <div className={styles.hydraMenuModal}>
        {"HYDRA!"}
      </div>
    </div>
  );
};

export const HydraMenu = (props) => {
  const {actionDispatcher} = props;
  const isVisibleState = useState(false);
  const [isVisible, setIsVisible] = isVisibleState;

  useEffect(() => {
    actionDispatcher.register(ACTIONS.TOGGLE_VISIBILITY, () => setIsVisible(R.not));
    return () => actionDispatcher.unregister(ACTIONS.TOGGLE_VISIBILITY);
  });

  return <HydraMenuCore isVisibleState={isVisibleState} />;
};

export default HydraMenu;
