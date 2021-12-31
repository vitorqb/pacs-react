import React from 'react';
import { mount } from 'enzyme';
import * as sut from '../HydraMenu.jsx';
import * as Actions from '../../../domain/Actions.js';
import { act } from 'react-dom/test-utils';
import { waitFor } from '../../../testUtils.jsx';

const findHideClass = c => c.find('.hide');

describe('HydraMenuCore', () => {

  const defaultProps = () => ({
    isVisibleState: [true, () => {}],
  });

  const render = (props) => {
    return mount(<sut.HydraMenuCore {...defaultProps()} {...props}/>);
  };

  describe('Sets visibility based on isVisibleState', () => {

    it('...true', () => {
      const component = render({isVisibleState: [true, () => {}]});
      expect(findHideClass(component)).toHaveLength(0);
    });
    
    it('...false', () => {
      const component = render({isVisibleState: [false, () => {}]});
      expect(findHideClass(component)).toHaveLength(1);
    });

  });

});


describe('HydraMenu', () => {

  const defaultProps = () => ({
    actionDispatcher: new Actions.ActionDispatcher(),
  });

  const render = (props) => {
    return mount(<sut.HydraMenu {...defaultProps()} {...props}/>);
  };

  it('Hides on ToggleVisibility action', async () => {
    const actionDispatcher = new Actions.ActionDispatcher();
    const action = Actions.newAction(sut.ACTIONS.TOGGLE_VISIBILITY);
    const component = render({actionDispatcher});

    expect(component.find(sut.HydraMenuCore).props().isVisibleState[0]).toBe(false);

    await act( async () => {
      actionDispatcher.dispatch(action);
      await waitFor(() => {
        component.update();
        return component.find(sut.HydraMenuCore).props().isVisibleState[0] == true;
      });
      expect(component.find(sut.HydraMenuCore).props().isVisibleState[0]).toBe(true);

      actionDispatcher.dispatch(action);
      await waitFor(() => {
        component.update();
        return component.find(sut.HydraMenuCore).props().isVisibleState[0] == false;
      });
      expect(component.find(sut.HydraMenuCore).props().isVisibleState[0]).toBe(false);
    });
  });

});
