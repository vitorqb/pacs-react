import React from 'react';
import { mount } from 'enzyme';
import * as sut from './LoginProvider';
import sinon from 'sinon';
import styles from './LoginProvider.module.scss';
import { act } from 'react-dom/test-utils';

const TOKEN_VALUE = "123";
const defaultChildren = tokenValue => <div>{tokenValue}</div>;
const FakeLoginPage = () => <div>LoginPage</div>;
const renderFakeLoginPage = ({ onGetToken }) => <FakeLoginPage onGetToken={onGetToken}/>;
const defaultProps = {
  loginSvc: {recoverTokenFromCookies: () => Promise.resolve(TOKEN_VALUE)},
  renderLoginPage: renderFakeLoginPage
};

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

  it("Loads login page if cant recover token", async () => {
    const loginSvc = {recoverTokenFromCookies: () => Promise.reject()};
    await act(async () => {
      const component = renderComponent({ loginSvc });
      await new Promise(setImmediate);
      component.update();
      expect(component.html()).toEqual(`<div>LoginPage</div>`);
    });
  });

  it('Queries for token when onGetToken', async () => {
    const loginSvc = {
      recoverTokenFromCookies: () => Promise.reject(),
      getToken: sinon.fake.resolves("123"),
    };
    await act(async () => {
      const component = renderComponent({ loginSvc });
      await new Promise(setImmediate);
      component.update();
      component.find(FakeLoginPage).props().onGetToken('NEW_TOKEN');
      await new Promise(setImmediate);
      component.update();
      expect(component.html()).toEqual(`<div>123</div>`);
      expect(loginSvc.getToken.args).toEqual([["NEW_TOKEN"]]);
    });
  });

  it('Provides token to children', async () => {
    await act(async () => {
      const component = renderComponent();
      await new Promise(setImmediate);
      component.update();
      expect(component.html()).toEqual(`<div>${TOKEN_VALUE}</div>`);
      expect(component.find(`div.${styles.loading}`)).toHaveLength(0);
    });
  });

});
