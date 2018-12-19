import React from 'react';
import { mount } from 'enzyme';
import { AccountFactory, expectRenderError } from '../../testUtils';
import AccountTree, { MISSING_ROOT_MSG, MULTIPLE_ROOTS_MSG, makeAccRepr } from '../AccountTree';
import TreeView from 'react-treeview';

describe('AccountTree component', () => {
  it('Raises error if root is missing...', () => {
    const accounts = [
      AccountFactory.build({accType: "Leaf"}),
      AccountFactory.build({accType: "Branch"})
    ];
    expectRenderError(<AccountTree accounts={accounts} />, MISSING_ROOT_MSG);
  })
  it('Raises error if more than one root...', () => {
    const accounts = [
      AccountFactory.build({accType: "Root"}),
      AccountFactory.build({accType: "Root"}),
    ];
    expectRenderError(<AccountTree accounts={accounts} />, MULTIPLE_ROOTS_MSG);
  })
  it('Mounts with root only...', () => {
    const accounts = [AccountFactory.build({accType: "Root"})];
    const exp = (<div>{makeAccRepr(accounts[0])}</div>);
    const res = mount(<AccountTree accounts={accounts} />);
    expect(res.contains(exp)).toBe(true);
  })
  it('Mounts with one family only...', () => {
    const root = AccountFactory.build({accType: "Root"});
    const leaves = AccountFactory.buildList(2, {accType: "Leaf", parent: root.pk});
    const exp = (
      <TreeView key={root.pk} nodeLabel={makeAccRepr(root)} defaultCollapsed={false}>
        <div>{makeAccRepr(leaves[0])}</div>
        <div>{makeAccRepr(leaves[1])}</div>
      </TreeView>
    )
    const res = mount(<AccountTree accounts={[root].concat(leaves)} />);
    expect(res.contains(exp)).toBe(true);
  })
  it('Mounts with two families...', () => {
    const root = AccountFactory.build({accType: "Root"});
    const branches = AccountFactory.buildList(
      2,
      {
        accType: "Branch",
        parent: root.pk
      }
    );
    const leaves = branches.map(parent => {
      return AccountFactory.build({accType: "Leaf", parent: parent.pk})
    })
    const accounts = [root].concat(branches, leaves);
    const exp = (
      <TreeView key={root.pk} nodeLabel={makeAccRepr(root)} defaultCollapsed={false}>
        <TreeView
          key={branches[0].pk}
          nodeLabel={makeAccRepr(branches[0])}
          defaultCollapsed={false}>

          <div>{makeAccRepr(leaves[0])}</div>
        </TreeView>
        <TreeView
          key={branches[1].pk}
          nodeLabel={makeAccRepr(branches[1])}
          defaultCollapsed={false}>

          <div>{makeAccRepr(leaves[1])}</div>
        </TreeView>
      </TreeView>
    );
    const res = mount(<AccountTree accounts={accounts} />);
    expect(res.contains(exp)).toBe(true);
  })
})
