import React from 'react';
import { mount } from 'enzyme';
import * as sut from '../HydraMenu.jsx';
import * as Actions from '../../../domain/Actions.js';
import { act } from 'react-dom/test-utils';
import { waitFor } from '../../../testUtils.jsx';
import * as Hydra from '../../../domain/Hydra/Hydra.js';
import sinon from 'sinon';
import styles from '../HydraMenu.module.scss';

describe('handleInputChange', () => {

  const newEvent = (value) => ({target: {value}});

  const defaultOpts = (opts={}) => ({
    currentHydraNodes: [
      Hydra.newLeafNode({shortcut: 'a', description: 'Foo', actionFn: sinon.spy()})
    ],
    hideFn: sinon.spy(),
    inputValueState: [false, sinon.spy()],
    ...opts,
  });

  const newBranchNode = (opts={}) => {
    const defaultOpts = {shortcut: "a", description: "", children: []};
    return Hydra.newBranchNode({...defaultOpts, ...opts});
  };

  const call = (opts={}) => (event=null) => {
    const finalEvent = event || newEvent('');
    const finalOpts = {...defaultOpts(), ...opts};
    return sut.handleInputChange(finalOpts)(finalEvent);
  };

  it('Do not fail if input is blank', () => {
    expect(call()()).toEqual(undefined);
    expect(call()(newEvent(undefined))).toEqual(undefined);
    expect(call()(newEvent(""))).toEqual(undefined);
  });

  it('Set value on blank input', () => {
    const opts = defaultOpts();
    call(opts)();
    expect(opts.inputValueState[1].args).toEqual([['']]);
  });

  it('Do not fail if node not found', () => {
    expect(call()(newEvent("b"))).toEqual(undefined);
  });

  it('Does not set value if no node to select', () => {
    const opts = defaultOpts();    
    call(opts)(newEvent('b'));
    expect(opts.inputValueState[1].called).toBe(false);
  });

  it('Runs action if input contains shortcut for leaf', () => {
    const actionFn = sinon.spy();
    const currentHydraNodes = [Hydra.newLeafNode({shortcut: 'a', description: 'Foo', actionFn})];
    call({currentHydraNodes})(newEvent('a'));
    expect(actionFn.args).toEqual([[]]);
  });

  it('Calls hideFn if leaf node is selected', () => {
    const opts = defaultOpts();
    call(opts)(newEvent('a'));
    expect(opts.hideFn.callCount).toEqual(1);
  });

  it('Does not change visibility if no node selected', () => {
    const opts = defaultOpts();
    call(opts)(newEvent('c'));
    expect(opts.hideFn.callCount).toEqual(0);
  });

  it('Does not change visibility if branch node is selected', () => {
    const currentHydraNodes = [newBranchNode()];
    const opts = defaultOpts({currentHydraNodes});
    call(opts)(newEvent('a'));
    expect(opts.hideFn.callCount).toEqual(0);
  });

  it('Set value if branch node is selected', () => {
    const currentHydraNodes = [newBranchNode()];
    const opts = defaultOpts({currentHydraNodes});
    call(opts)(newEvent('a'));
    expect(opts.inputValueState[1].args).toEqual([['a']]);
  });

  it('Set value if user has erased an input', () => {
    const inputValueState = ['abc', sinon.spy()];
    call({inputValueState})(newEvent('a'));
    expect(inputValueState[1].args).toEqual([['a']]);
  });
  
});

describe('getCurrentHydraNodes', () => {

  const defaultOpts = (opts={}) => ({
    rootHydraNodes: [
      Hydra.newLeafNode({shortcut: 'a', description: 'Foo', actionFn: sinon.spy()})
    ],
    currentInputValue: 'a',
    ...opts,
  });

  const call = (opts={}) => sut.getCurrentHydraNodes(defaultOpts(opts));

  it.each(
    [[''], [null], [undefined]]
  )('Root nodes if no input: %s', (currentInputValue) => {
    const opts = defaultOpts({currentInputValue});
    expect(call(opts)).toEqual(opts.rootHydraNodes);
  });

  it('Returns nested branch node matching shortcut', () => {
    const leafHydraNode = (
      Hydra.newLeafNode({shortcut: 'c', description: 'Foo', actionFn: () => {}})
    );
    const nestedBranchNode = (
      Hydra.newBranchNode({shortcut: "b", description: "", children: [leafHydraNode]})
    );
    const rootBranchNode = (
      Hydra.newBranchNode({shortcut: "a", description: "", children: [nestedBranchNode]})
    );
    const opts = defaultOpts({rootHydraNodes: [rootBranchNode], currentInputValue: 'ab'});
    expect(call(opts)).toEqual([leafHydraNode]);
  });

});

describe('HydraMenuCore', () => {

  const defaultProps = () => ({
    title: "Title",
    isVisible: true,
    hideFn: () => {},
    inputValueState: ['', () => {}],
    rootHydraNodes: [
      Hydra.newLeafNode({shortcut: 'a', description: 'Foo', actionFn: sinon.spy()}),
      Hydra.newLeafNode({shortcut: 'b', description: 'Bar', actionFn: sinon.spy()}),      
    ],
  });

  const render = (props) => {
    return mount(<sut.HydraMenuCore {...defaultProps()} {...props}/>);
  };

  const findTitle = x => x.find(`.${styles.hydraMenuTitle}`);

  describe('Sets visibility based on isVisible', () => {

    it('...true', () => {
      const component = render({isVisible: true});
      expect(component.html()).toContain('Foo');
    });
    
    it('...false', () => {
      const component = render({isVisible: false});
      expect(component.html()).toEqual(null);
    });

  });

  it('Renders a menu for each node', () => {
    const component = render();
    expect(component.find(`.${styles.hydraMenuNodeDescription}`).at(0).text()).toEqual("Foo");
    expect(component.find(`.${styles.hydraMenuNodeDescription}`).at(1).text()).toEqual("Bar");
  });

  it('Renders title', () => {
    expect(findTitle(render()).text()).toEqual("Title");
  });

  it.each([[""], [null], [undefined]])("Skipts title if equals %s", title => {
    expect(findTitle(render({title}))).toHaveLength(0);
  });

});


describe('HydraMenu', () => {

  let actionDispatcher;

  beforeEach(() => {
    actionDispatcher = new Actions.ActionDispatcher();
  });

  const defaultProps = () => ({
    actionDispatcher,
    rootHydraNodes: [
      Hydra.newLeafNode({shortcut: 'a', description: 'Foo', actionFn: sinon.spy()}),
      Hydra.newLeafNode({shortcut: 'b', description: 'Bar', actionFn: sinon.spy()}),      
    ],
    onHide: () => {},
    onDisplay: () => {},
  });

  const render = (props) => {
    return mount(<sut.HydraMenu {...defaultProps()} {...props}/>);
  };

  const toggleVisibilityAction = Actions.newAction(sut.ACTIONS.TOGGLE_VISIBILITY);

  const getIsVisible = component => component.find(sut.HydraMenuCore).props().isVisible;

  const ensureVisible = async (component) => act(async () => {
    actionDispatcher.dispatch(toggleVisibilityAction);
    await waitFor(() => {
      component.update();
      return getIsVisible(component) === true;
    });
  });

  const close = async (component) => act(async () => {
    actionDispatcher.dispatch(toggleVisibilityAction);
    await waitFor(() => {
      component.update();
      return ! getIsVisible(component);
    });
  });

  const simulateInputChange = component => value => {
    component.find('input').simulate('change', {target: {value}});
    component.update();
  };

  const getInputValue = component => component.find('input').props().value;

  it('Hides on ToggleVisibility action', async () => {
    const component = render({actionDispatcher});
    expect(getIsVisible(component)).toBe(false);

    await act( async () => {
      actionDispatcher.dispatch(toggleVisibilityAction);
      await waitFor(() => {
        component.update();
        return getIsVisible(component) === true;
      });
      expect(getIsVisible(component)).toBe(true);

      actionDispatcher.dispatch(toggleVisibilityAction);
      await waitFor(() => {
        component.update();
        return getIsVisible(component) === false;
      });
      expect(getIsVisible(component)).toBe(false);
    });
  });

  it('Runs action of leaf node', async () => {
    const actionFn = sinon.spy();
    const rootHydraNodes = [Hydra.newLeafNode({shortcut: 'a', description: 'Foo', actionFn})];
    const component = render({rootHydraNodes});

    await ensureVisible(component);

    simulateInputChange(component)('a');
    
    await waitFor(() => actionFn.called);
    expect(actionFn.args).toEqual([[]]);
  });

  it('Runs an action on a nested node', async () => {
    const actionFn = sinon.spy();
    const leafNode = Hydra.newLeafNode({shortcut: 'a', description: 'Foo', actionFn});
    const branchNode = Hydra.newBranchNode({shortcut: 'b', description: '', children: [leafNode]});
    const rootHydraNodes = [branchNode];
    const component = render({rootHydraNodes});

    await ensureVisible(component);

    simulateInputChange(component)('b');

    await waitFor(() => {
      component.update();
      return component.html().includes('Foo');
    });

    simulateInputChange(component)('ba');

    await waitFor(() => actionFn.called);
    expect(actionFn.args).toEqual([[]]);    
  });

  it('Quits on "q"', async () => {
    const component = render();

    await ensureVisible(component);

    simulateInputChange(component)('q');

    await waitFor(() => ! getIsVisible(component));

    expect(getIsVisible(component)).toBe(false);
  });

  it('Cleans up current user input on open', async () => {
    const rootHydraNodes = [Hydra.newBranchNode({shortcut: 'a', description: 'A', children: []})];
    const component = render({rootHydraNodes});
    await ensureVisible(component);
    simulateInputChange(component)('a');
    await act( async () => await waitFor(() => {
      component.update();
      return getInputValue(component) === "a";
    }));
    await close(component);
    await ensureVisible(component);
    expect(getInputValue(component)).toEqual("");
  });

  it('Calls onDisplay and onhide when displayed and hidden', async () => {
    const onDisplay = sinon.spy();
    const onHide = sinon.spy();
    const component = render({onDisplay, onHide});
    expect(onDisplay.callCount).toEqual(0);
    expect(onHide.callCount).toEqual(0);
    await ensureVisible(component);
    expect(onDisplay.callCount).toEqual(1);
    expect(onHide.callCount).toEqual(0);
    await close(component);
    expect(onDisplay.callCount).toEqual(1);
    expect(onHide.callCount).toEqual(1);
    await ensureVisible(component);
    expect(onDisplay.callCount).toEqual(2);
    expect(onHide.callCount).toEqual(1);
    await close(component);
    expect(onDisplay.callCount).toEqual(2);
    expect(onHide.callCount).toEqual(2);
  });

});
