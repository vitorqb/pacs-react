import React from 'react';
import ReactDOM from 'react-dom';
import { Factory } from 'rosie';
import faker from 'faker';

faker.seed(123);

export const AccountFactory = new Factory()
  .attr("pk", faker.random.number)
  .attr("name", faker.lorem.words)
  .attr("accType", "Leaf")
  .attr("parent", faker.random.number)


/**
 * Asserts that mouting element causes an error to be thrown, and that message
 * contains expectedError.
 * source: https://gist.github.com/gaearon/adf9d5500e11a4e7b2c6f7ebf994fe56
 */
export function expectRenderError(element, expectedError) {
  // Noop error boundary for testing.
  class TestBoundary extends React.Component {
    constructor(props) {
      super(props);
      this.state = { didError: false };
    }
    componentDidCatch(err) {
      this.setState({ didError: true });
    }
    render() {
      return this.state.didError ? null : this.props.children;
    }
  }

  // Record all errors.
  let topLevelErrors = [];
  function handleTopLevelError(event) {
    topLevelErrors.push(event.error);
    // Prevent logging
    event.preventDefault();
  }

  const div = document.createElement('div');
  window.addEventListener('error', handleTopLevelError);
  try {
    ReactDOM.render(
      <TestBoundary>
        {element}
      </TestBoundary>,
      div
    );
  } finally {
    window.removeEventListener('error', handleTopLevelError);
  }

  expect(topLevelErrors.length).toBe(1);
  expect(topLevelErrors[0].message).toContain(expectedError);
}
