import React, { useState, useEffect, useRef} from 'react';
import classnames from 'classnames';
import styles from './HydraMenu.module.scss';
import * as R from 'ramda';
import * as Hydra from '../../domain/Hydra/Hydra.js';

export const ACTIONS = {
  TOGGLE_VISIBILITY: "TOGGLE_VISIBILITY"
};

export const addQuitNode = isVisibleState => R.append(Hydra.newLeafNode({
  shortcut: 'q',
  description: 'Quit',
  actionFn: () => {
    isVisibleState[1](false);
  }
}));

export const handleInputChange = (opts) => (e) => {
  const {currentHydraNodes, isVisibleState, inputValueState} = opts;
  const newValue = e.target.value;
  const isEmptyNewValue = () => R.isEmpty(newValue) || R.isNil(newValue);
  const newInputIsShorter = () => newValue.length < inputValueState[0].length;

  if (isEmptyNewValue()) {
    inputValueState[1]('');
    return;
  }
  
  if (newInputIsShorter()) {
    inputValueState[1](newValue);
    return;
  }

  const lastKey = R.nth(-1)(newValue);
  const node = R.find(node => node.shortcut == lastKey)(currentHydraNodes);

  if (! node) {
    return;
  }

  if (Hydra.isLeafNode(node)) {
    node.actionFn();
    isVisibleState[1](false);
  }

  if (Hydra.isBranchNode(node)) {
    inputValueState[1](newValue);
  }
};

export const getCurrentHydraNodes = (opts) => {
  const {rootHydraNodes, currentInputValue} = opts;
  if (R.isNil(currentInputValue) || R.isEmpty(currentInputValue)) {
    return rootHydraNodes;
  }
  let resultNodes = rootHydraNodes;
  const stopIterationError = new Error("SOTP!");
  try {
    R.forEach((key) => {
      const nextNode = R.find(node => node.shortcut == key)(resultNodes);
      if (!nextNode || !Hydra.isBranchNode(nextNode)) {
        throw stopIterationError;
      }
      resultNodes = nextNode.children;
    })(currentInputValue);
  } catch(e) {
    if (e != stopIterationError) {
      throw e;
    }
  }
  return resultNodes;
};

export const HydraNode = (props) => {
  const {hydraNode} = props;
  return (
    <div className={styles.hydraMenuNode}>
      <span className={styles.hydraMenuNodeShortcut}>
        {hydraNode.shortcut}
      </span>
      <span className={styles.hydraMenuNodeDescription}>
        {hydraNode.description}
      </span>
    </div>
  );
};

export const HydraMenuCore = (props) => {
  const {isVisibleState, inputValueState, rootHydraNodes, title} = props;
  const [currentInputValue,] = inputValueState;
  const currentHydraNodes = getCurrentHydraNodes({rootHydraNodes, currentInputValue});
  const titleComponent = R.unless(
    R.either(R.isEmpty, R.isNil),
    title => <div className={styles.hydraMenuTitle}>{title}</div>
  )(title);
  if (! isVisibleState[0]) {
    return <></>;
  }
  return (
    <div className={styles.hydraMenu}>
      <div className={styles.hydraMenuModal}>
        {titleComponent}
        <div className={styles.hydraMenuNodesContainer}>
          {R.map(
            hydraNode => <HydraNode key={hydraNode.shortcut} hydraNode={hydraNode} />
          )(currentHydraNodes)}
        </div>
        <input
          onChange={handleInputChange({currentHydraNodes, isVisibleState, inputValueState})}
          value={inputValueState[0]}
          autoFocus
        />
      </div>
    </div>
  );
};

export const HydraMenu = (props) => {
  const {actionDispatcher, title} = props;
  const isVisibleState = useState(false);
  const rootHydraNodes = R.pipe(R.prop('rootHydraNodes'), addQuitNode(isVisibleState))(props);
  const inputValueState = useState('');

  useEffect(() => {
    actionDispatcher.register(ACTIONS.TOGGLE_VISIBILITY, () => isVisibleState[1](R.not));
    return () => actionDispatcher.unregister(ACTIONS.TOGGLE_VISIBILITY);
  });

  return <HydraMenuCore {...{isVisibleState, rootHydraNodes, inputValueState, title}}/>;
};

export default HydraMenu;