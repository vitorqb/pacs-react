// Integration tests for pacs-react
import React from 'react';
import { BrowserRouter as Router, Link, Route } from 'react-router-dom';
import * as R from 'ramda';
import { mount } from 'enzyme';
import * as sut from '../App';
import App from '../App';
import { makeLink, makeRoute, makeRouter } from '../App/Router';
import * as Lens from '../App/Lens';
import TransactionTable from '../components/TransactionTable';
import CurrencyTable from '../components/CurrencyTable';
import AccountTree from '../components/AccountTree';
import { AccountFactory, CurrencyFactory, TransactionFactory } from '../testUtils';
import TransactionForm from '../components/TransactionForm';
import AccountForm from '../components/AccountForm';
import EditTransactionComponent from '../components/EditTransactionComponent';
import SecretsLens from '../domain/Secrets/Lens';
import * as RU from '../ramda-utils';
import sinon from 'sinon';

describe('App.test.jsx', () => {

  describe('initialStateFromProps', () => {

    it('No secrets', () => {
      const props = {};
      const exp = R.set(
        Lens.lens.remoteFetchingStatus,
        Lens.RemoteFetchingStatusEnum.uninitialized,
        {}
      );
      const res = sut.initialStateFromProps(props);
      expect(exp).toEqual(res);
    });
    
    it('With secrets', () => {
      const props = {secrets: RU.setLenses(
        [[SecretsLens.token, 'foo'], [SecretsLens.host, 'bar']],
        {}
      )};
      const exp = RU.setLenses(
        [[Lens.lens.remoteFetchingStatus, Lens.RemoteFetchingStatusEnum.uninitialized],
         [Lens.lens.host, 'bar'],
         [Lens.lens.token, 'foo'],
         [Lens.lens.isLoggedIn, true]],
        {}
      );
      const res = sut.initialStateFromProps(props);
      expect(exp).toEqual(res);
    });

  });

  describe('makeLink()', () => {
    it('base', () => {
      const path = "/some/path";
      const text = "Some Text";
      const routeData = {path, text};

      const exp = (<li key={path}><Link to={path}>{text}</Link></li>);

      expect(makeLink(routeData)).toEqual(exp);
    });
  });

  describe('makeRoute()', () => {
    it('base', () => {
      const path = "/a/b";
      const component = () => (<h1>Hola</h1>);

      const exp = (<Route key={path} path={path} render={component} />);

      expect(makeRoute({path, component})).toEqual(exp);
    });
  });

  describe('makeRouter()', () => {
    it('base', () => {
      const path = "/c/d/";
      const text = "A";
      const component = () => (<h1>Hola</h1>);
      const data = { path, text, component };
      const link = makeLink(data);
      const route = makeRoute(data);

      const exp = mount(
        <Router>
          <div>
            <ul>
              {link}
            </ul>
            {route}
          </div>
        </Router>
      );

      const router = mount(makeRouter([data]));
      expect(router.find(Route).equals(route)).toBe(true);
      expect(router.html()).toEqual(exp.html());
    });
  });

});
