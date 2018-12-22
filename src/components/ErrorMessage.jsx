import React, { Component } from 'react';
import * as R from "ramda";

/**
 * A simple implementation of a component that displays an error message
 */
export default class ErrorMessage extends Component {

  render() {
    if (this.hasError()) {
      const errorMessages = ErrorMessage.formatError(this.props.value);
      return (
        <div className="error-message">
          <pre id="json">
            {errorMessages}
            </pre>
        </div>
      )
    } else {
      return (<div></div>)
    }
  }

  /**
   * Returns TRUE if self.props.value indicates an error.
   */
  hasError = () => {
    return this.props.value ? true : false
  }

  /**
   * Formats x into an array of strings to display. X can be an objects,
   * an array or an string.
   */
  static formatError = R.partialRight(JSON.stringify, [undefined, 2])
}
