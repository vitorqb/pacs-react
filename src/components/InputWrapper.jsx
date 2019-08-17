import React from 'react';
import * as R from 'ramda';

export const propLens = {
  label: R.lensPath(['label']),
  content: R.lensPath(['content']),
  key: R.lensPath(['key']),
};

export default function InputWrapper(props) {
  return (
    <div className="input-wrapper" key={R.view(propLens.key, props)}>
      <div className="input-wrapper__label">
        {R.view(propLens.label, props)}
      </div>
      <div className="input-wrapper__content">
        {R.view(propLens.content, props)}
      </div>
    </div>    
  );
};
