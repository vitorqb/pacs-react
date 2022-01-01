/**
 * Functions responsible for creating the Router object for the App main page.
 */
import React from 'react';
import * as R from 'ramda';
import { BrowserRouter as Router, Link, Route, Routes } from 'react-router-dom';
import Group from './Router/Group';

/**
 * Renders a group of links.
 * @param {Object} groupData -
 *     An object with data for the group.
 * @param {string} groupData.text -
 *     An object with the text describing this group.
 * @param groupData.listOfLinkData - 
 *     A list of LinkData with the `path`, `text` and `element` for each link.
 */
export function makeGroup({text, listOfLinkData}) {
  const links = R.map(makeLink, listOfLinkData);
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
 * @param listOfGroups - An array of group objects with `text` and `listOfLinkData`.
 */
export function makeRouter(listOfGroups) {
  const groups = R.map(makeGroup, listOfGroups);
  const routes = R.pipe(R.chain(g => g.listOfLinkData), R.map(makeRoute))(listOfGroups);
  return (
    <Router>
      <div className="router__groups">
        {groups}
      </div>
      <div className="router__routes">
        <Routes>
          {routes}
        </Routes>
      </div>
    </Router>
  );
};
