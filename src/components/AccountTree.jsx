import React from 'react';
import * as R from 'ramda';
import TreeView from 'react-treeview';
require('react-treeview/react-treeview.css');

export const MISSING_ROOT_MSG = "Missing root account."
export const MULTIPLE_ROOTS_MSG = "Multiple root accounts.";

/**
 * A component to show a list of accounts as an hierarchy, from the root
 * account to it's children.
 * @prop {Account[]} props.accounts - An array of accounts. MUST contain a
 *   single `root` account and the entire accounts families.
 */
export default function AccountTree({ accounts }) {
  const root = findRootAcc(accounts);
  const tree = getTree(root, accounts);
  const treeView = makeTreeView(tree, accounts);
  return treeView
}


/**
 * Given an array of accounts, finds the root account.
 */
function findRootAcc(accounts) {
  const root = R.filter(R.propEq("accType", "Root"), accounts);
  if (root.length === 0) {
    throw new Error(MISSING_ROOT_MSG);
  } else if (root.length > 1) {
    throw new Error(MULTIPLE_ROOTS_MSG);
  }
  return root[0]
}

/**
 * Given a parent account and an array with all accounts, mounts the accounts
 * in a tree structure. Each node is an object 
 * {acc: Account, children: node[]}
 */
function getTree(parent, accounts) {
  const children = getChildren(parent, accounts);
  const childrenNodes = children.map(c => getTree(c, accounts));
  return {acc: parent, children: childrenNodes}
}

/**
 * Transforms a tree structure of Account and children into a TreeView.
 */
function makeTreeView({acc, children}) {
  const accRepr = makeAccRepr(acc);
  const hasChildren = children.length > 0;
  if (hasChildren) {
    const childrenDomElements = children.map(makeTreeView);
    return (
      <TreeView key={acc.pk} nodeLabel={accRepr} defaultCollapsed={false}>
        {childrenDomElements}
      </TreeView>
    )
  } else {
    return <div key={acc.name}>{accRepr}</div>
  }
}

/**
 * Finds all childrens of a parent account in an array of accounts.
 */
function getChildren(parent, accounts) {
  const isChild = R.propEq("parent", parent.pk);
  return R.filter(isChild, accounts);
}

/**
 * Makes a string representation of an account.
 */
export const makeAccRepr = a => `(${a.pk}) ${a.name} [${a.accType[0]}]`
