/**
 * Functions responsible for creating the Router object for the App main page.
 */
import React from 'react';
import * as R from 'ramda';
import { BrowserRouter, Link, Route, Routes } from 'react-router-dom';
import Group from './Router/Group';

/**
 * Renders a group of links.
 * @param {Object} groupOfRoutes -
 *     An object with data for the group.
 * @param {string} groupOfRoutes.text -
 *     An object with the text describing this group.
 * @param groupOfRoutes.routes - 
 *     A list of Route with the `path`, `text` and `element` for each link.
 */
export function makeGroup({text, routes}) {
  const links = R.map(makeLink, routes);
  return (
    <div key={text} className="router__group">
      <Group text={text}>{links}</Group>
    </div>
  );
}

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
 * @param {Function} routeData.element - A React element for that route.
 */
export function makeRoute({path, element}) {
  return (<Route key={path} path={path} element={element} />);
}

/**
 * Makes a Router object given a data.
 * @param listOfGroupsOfRoutes - An array of group objects with `text` and `routes`.
 */
export function makeRouter(listOfGroupsOfRoutes) {
  const groups = R.map(makeGroup, listOfGroupsOfRoutes);
  const routes = R.pipe(R.chain(R.prop('routes')), R.map(makeRoute))(listOfGroupsOfRoutes);
  return (
    <>
      <div className="router__groups">
        {groups}
      </div>
      <div className="router__routes">
        <Routes>
          {routes}
          <Route path={"/"} element={<div/>} />
        </Routes>
      </div>
    </>
  );
};

export const Router = BrowserRouter;
