import React from 'react';
import { mount } from 'enzyme';
import * as sut from './LoginProvider';
import sinon from 'sinon';
import styles from './LoginProvider.module.scss';
import { act } from 'react-dom/test-utils';

const TOKEN_VALUE = "123";

const defaultProps = {
  loginSvc: {recoverTokenFromCookies: () => Promise.resolve(TOKEN_VALUE)}
};

const defaultChildren = tokenValue => <div>{tokenValue}</div>;

const renderComponent = (props={}, children) => {
  return mount(
    <sut.LoginProvider {...defaultProps} {...props} >
      {children || defaultChildren}
    </sut.LoginProvider>
  );
};

describe('LoginProvider', () => {

  it('Is loading while token not fetched', async () => {
    var component;
    await act(async () => {
      component = renderComponent();
      expect(component.find(`div.${styles.loading}`)).toHaveLength(1);
    });
  });

  it('Provides token to children', async () => {
    var component;
    await act(async () => {
      component = renderComponent();
      await new Promise(setImmediate);
      component.update();
      expect(component.html()).toEqual(`<div>${TOKEN_VALUE}</div>`);
      expect(component.find(`div.${styles.loading}`)).toHaveLength(0);
    });
  });

});
