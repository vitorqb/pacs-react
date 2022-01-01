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

  const defaultOpts = () => ({
    hydraNodes: [Hydra.newLeafNode({shortcut: 'a', description: 'Foo', actionFn: sinon.spy()})],
    isVisibleState: [false, sinon.spy()],
  });

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

  it('Do not fail if node not found', () => {
    expect(call()(newEvent("b"))).toEqual(undefined);
  });

  it('Runs action if input contains shortcut for leaf', () => {
    const actionFn = sinon.spy();
    const hydraNodes = [Hydra.newLeafNode({shortcut: 'a', description: 'Foo', actionFn})];
    call({hydraNodes})(newEvent('a'));
    expect(actionFn.args).toEqual([[]]);
  });
  
});

describe('HydraMenuCore', () => {

  const defaultProps = () => ({
    isVisibleState: [true, () => {}],
    hydraNodes: [
      Hydra.newLeafNode({shortcut: 'a', description: 'Foo', actionFn: sinon.spy()}),
      Hydra.newLeafNode({shortcut: 'b', description: 'Bar', actionFn: sinon.spy()}),      
    ],
  });

  const render = (props) => {
    return mount(<sut.HydraMenuCore {...defaultProps()} {...props}/>);
  };

  describe('Sets visibility based on isVisibleState', () => {

    it('...true', () => {
      const component = render({isVisibleState: [true, () => {}]});
      expect(component.html()).toContain('Foo');
    });
    
    it('...false', () => {
      const component = render({isVisibleState: [false, () => {}]});
      expect(component.html()).toEqual(null);
    });

  });

  it('Renders a menu for each node', () => {
    const component = render();
    expect(component.find(`.${styles.hydraMenuNodeDescription}`).at(0).text()).toEqual("Foo");
    expect(component.find(`.${styles.hydraMenuNodeDescription}`).at(1).text()).toEqual("Bar");
  });

});


describe('HydraMenu', () => {

  let actionDispatcher;

  beforeEach(() => {
    actionDispatcher = new Actions.ActionDispatcher();
  });

  const defaultProps = () => ({
    actionDispatcher,
    hydraNodes: [
      Hydra.newLeafNode({shortcut: 'a', description: 'Foo', actionFn: sinon.spy()}),
      Hydra.newLeafNode({shortcut: 'b', description: 'Bar', actionFn: sinon.spy()}),      
    ],    
  });

  const render = (props) => {
    return mount(<sut.HydraMenu {...defaultProps()} {...props}/>);
  };

  const toggleVisibilityAction = Actions.newAction(sut.ACTIONS.TOGGLE_VISIBILITY);

  const getIsVisible = component => component.find(sut.HydraMenuCore).props().isVisibleState[0];

  const waitForVisibility = async (component) => act(async () => {
    actionDispatcher.dispatch(toggleVisibilityAction);
    await waitFor(() => {
      component.update();
      return getIsVisible(component) == true;
    });
  });

  it('Hides on ToggleVisibility action', async () => {
    const component = render({actionDispatcher});
    expect(getIsVisible(component)).toBe(false);

    await act( async () => {
      actionDispatcher.dispatch(toggleVisibilityAction);
      await waitFor(() => {
        component.update();
        return getIsVisible(component) == true;
      });
      expect(getIsVisible(component)).toBe(true);

      actionDispatcher.dispatch(toggleVisibilityAction);
      await waitFor(() => {
        component.update();
        return getIsVisible(component) == false;
      });
      expect(getIsVisible(component)).toBe(false);
    });
  });

  it('Runs action of leaf node', async () => {
    const actionFn = sinon.spy();
    const hydraNodes = [Hydra.newLeafNode({shortcut: 'a', description: 'Foo', actionFn})];
    const component = render({hydraNodes});

    await waitForVisibility(component);
    
    component.find('input').simulate('change', {target: {value: 'a'}});
    await waitFor(() => actionFn.called);
    expect(actionFn.args).toEqual([[]]);
  });

});
