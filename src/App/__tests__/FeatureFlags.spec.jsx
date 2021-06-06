import React from 'react';
import * as sut from '../FeatureFlags.jsx';
import { mount } from 'enzyme';

describe('FeatureFlagsSvc', () => {

  var flags;

  const initialFlags = {fTrue: true, fFalse: false};

  const setFlags = x => {
    switch (typeof x) {
    case "function":
      flags = x(flags);
      ;;
    default:
      flags = x;
      ;;
    };
  };

  const mkFeatureFlagsSvc = () => new sut.FeatureFlagsSvc(flags, setFlags);

  beforeEach(() => {
    setFlags(initialFlags);
  });

  it('returns true for a feature in initial flags', () => {
    expect(mkFeatureFlagsSvc().isActive("fTrue")).toEqual(true);
  });

  it('returns false for a feature on initial flags ', () => {
    expect(mkFeatureFlagsSvc().isActive("fFalse")).toEqual(false);
  });

  it('returns false for an unknown feature ', () => {
    expect(mkFeatureFlagsSvc().isActive("fUnknown")).toEqual(false);    
  });

  it('returns true for a feature after adding it', () => {
    mkFeatureFlagsSvc().setActive("fFalse");
    expect(mkFeatureFlagsSvc().isActive("fFalse")).toEqual(true);
  });

  it('returns false for a feature after setting to inactive', () => {
    mkFeatureFlagsSvc().setInactive("fTrue");
    expect(mkFeatureFlagsSvc().isActive("fTrue")).toEqual(false);    
  });

});

describe('FeatureFlagsProvider', () => {

  const defaultFlags = {FOO: true};
  const Child = ({featureFlagsSvc}) => <div>CHILD</div>;

  it('renders children with a feature flags svc', () => {
    const component = mount(
      <sut.FeatureFlagsProvider defaultFlags={defaultFlags}>
        {featureFlagsSvc =>
          <Child featureFlagsSvc={featureFlagsSvc}/>
        }
      </sut.FeatureFlagsProvider>
    );
    expect(component.html()).toEqual("<div>CHILD</div>");
    expect(component.find(Child).props().featureFlagsSvc.isActive("FOO")).toEqual(true);
  });

});
