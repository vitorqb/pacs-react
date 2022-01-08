import * as R from 'ramda';

const NODE_TYPES = {
  BRANCH: 'BRANCH',
  LEAF: 'LEAF',
};

/**
 * Returns a new leaf node.
 * @param {object} opts
 * @param {string} opts.shortcut - The shortcut to use (see hotkeys-js).
 * @param {string} opts.description - A description to be show to the users.
 * @param {function} opts.actionFn - A callback for when this node is selected.
 */
export const newLeafNode = ({shortcut, description, actionFn}) => {
  return {shortcut, description, actionFn, _node_type: NODE_TYPES.LEAF};
};

export const newBranchNode = ({shortcut, description, children}) => {
  return {shortcut, description, children, _node_type: NODE_TYPES.BRANCH};
};

export const leafNodeFromRoute = goToPathFn => route => newLeafNode({
  shortcut: route.shortcut,
  description: route.text,
  actionFn: () => goToPathFn(route.path),
});

export const branchNodeFromGroupOfRoutes = goToPathFn => groupOfRoutes => newBranchNode({
  shortcut: groupOfRoutes.shortcut,
  description: groupOfRoutes.text,
  children: R.map(leafNodeFromRoute(goToPathFn))(groupOfRoutes.routes),
});

export const isLeafNode = node => node._node_type == NODE_TYPES.LEAF;
export const isBranchNode = node => node._node_type == NODE_TYPES.BRANCH;
