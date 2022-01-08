// Integration tests for pacs-react
import React from 'react';
import { BrowserRouter as Router, Link, Route } from 'react-router-dom';
import { mount } from 'enzyme';
import { makeLink, makeRoute, makeRouter } from '../App/Router';

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
      const element = (<h1>Hola</h1>);

      const exp = (<Route key={path} path={path} element={element} />);

      expect(makeRoute({path, element})).toEqual(exp);
    });
  });

  describe('makeRouter()', () => {
    it('base', () => {
      const text = "A";
      const routes = [];
      const listOfGroups = [{text, routes}];

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
          <div className="router__routes">
            <div></div>
          </div>
        </Router>
      );

      const router = mount(<Router>{makeRouter(listOfGroups)}</Router>);
      expect(router.html()).toEqual(exp.html());
    });
  });
});
