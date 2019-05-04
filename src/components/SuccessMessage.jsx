import React from 'react';

export default function({ value }) {
  if (!value) {
    return <div />;
  }
  const formattedValue = JSON.stringify(value, undefined, 2);
  return (
    <div className="success-message">
      <pre id="json">
        {formattedValue}
      </pre>
    </div>
  );
}
