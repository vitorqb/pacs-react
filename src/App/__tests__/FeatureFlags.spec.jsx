import React from 'react';
import * as sut from '../FeatureFlags.jsx';
import { mount } from 'enzyme';
import { MockLocalStorage } from '../../testUtils.jsx';

describe('FeatureFlagsSvc', () => {

  var localStorage;

  const initialFlags = {fTrue: true, fFalse: false};

  const mkFeatureFlagsSvc = () => new sut.FeatureFlagsSvc(initialFlags, localStorage);

  beforeEach(() => {
    localStorage = new MockLocalStorage();
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

  it('sets from url params', () => {
    let featureFlagsSvc = mkFeatureFlagsSvc();
    featureFlagsSvc.setFromUrlParams('?feature_foo=true&feature_bar=false&feature_fTrue=false');
    expect(featureFlagsSvc.isActive('foo')).toBe(true);
    expect(featureFlagsSvc.isActive('bar')).toBe(false);
    expect(featureFlagsSvc.isActive('fTrue')).toBe(false);
  });

});

describe('readFeaturesFromParams', () => {

  it('empty', () => {
    const params = "?";
    expect(sut.readFeaturesFromParams(params)).toEqual([]);
  });

  it('only unrelated params', () => {
    const params = "?foo=1";
    expect(sut.readFeaturesFromParams(params)).toEqual([]);
  });

  it('only related params (case insensitive)', () => {
    const params = "?feature_foo=true&feature_bar=TRUE&feature_baz=false";
    expect(sut.readFeaturesFromParams(params)).toEqual([["foo", true], ["bar", true], ["baz", false]]);
  });

  it('mixed related and unrelated params', () => {
    const params = "?bar=1&feature_foo=true";
    expect(sut.readFeaturesFromParams(params)).toEqual([["foo", true]]);
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
