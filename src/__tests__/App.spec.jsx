// Integration tests for pacs-react
import React from 'react';
import { BrowserRouter as Router, Link, Route } from 'react-router-dom';
import * as R from 'ramda';
import { mount } from 'enzyme';
import * as sut from '../App';
import { makeLink, makeRoute, makeRouter } from '../App/Router';
import * as Lens from '../App/Lens';
import SecretsLens from '../domain/Secrets/Lens';
import * as RU from '../ramda-utils';
import LoginPage, { valueLens as loginPageValueLens } from '../components/LoginPage';

describe('App.test.jsx', () => {

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
      const text = "A";
      const listOfLinkData = [];
      const listOfGroups = [{text, listOfLinkData}];

      const exp = mount(
        <Router>
          <div className="router__groups">
            <div className="router__group">
              <div className="router-group">
                <span className="router-group__label">
                  A
                </span>
                <div className="router-group__children">
                </div>
              </div>              
            </div>
          </div>
          <div className="router__routes"></div>
        </Router>
      );

      const router = mount(makeRouter(listOfGroups));
      expect(router.html()).toEqual(exp.html());
    });
  });
});
