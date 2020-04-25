import React from 'react';


/**
 * A component responsible for rendering a group of routes.
 * @param text - The text describing this component.
 * @param children - The children Link objects.
 */
export function Group(props) {
  return (
    <div className="router-group">
      <span className="router-group__label">
        {props.text}
      </span>
      <div className="router-group__children">
        {props.children}
      </div>
    </div>
  );
}

export default Group;
