

/**
 * Returns a new leaf node.
 * @param {object} opts
 * @param {string} opts.shortcut - The shortcut to use (see hotkeys-js).
 * @param {string} opts.description - A description to be show to the users.
 * @param {function} opts.actionFn - A callback for when this node is selected.
 */
export const newLeafNode = ({shortcut, description, actionFn}) => {
  return {shortcut, description, actionFn};
};

export const newBranchNode = ({shortcut, description, children}) => {
  return {shortcut, description, children};
};


