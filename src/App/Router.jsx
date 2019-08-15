/**
 * Functions responsible for creating the Router object for the App main page.
 */
import React from 'react';
import * as R from 'ramda';
import { BrowserRouter as Router, Link, Route } from 'react-router-dom';


/**
 * Makes a Link for a router.
 * @param {Object} linkData - An object with data for the link.
 * @param {string} linkData.path - The path (url).
 * @param {string} linkData.text - The text to display in the link.
 */
export function makeLink({path, text}) {
  return <li key={path}><Link to={path}>{text}</Link></li>;
}

/**
 * Makes a Route for a router.
 * @param {Object} routeData - An object with data for the route.
 * @param {string} routeData.path - The path (url).
 * @param {Function} routeData.component - a 0-arity function returning a
 *   component to render for this route.
 */
export function makeRoute({path, component}) {
  return (<Route key={path} path={path} render={component} />);
}

/**
 * Makes a Router object given a data.
 * @param {Object[]} routerData - An object with data for the router.
 */
export function makeRouter(routerData) {
  const links = R.map(makeLink, routerData);
  const routes = R.map(makeRoute, routerData);
  return (
    <Router>
      <div>
        <ul>
          {links}
        </ul>
        {routes}
      </div>
    </Router>
  );
}
