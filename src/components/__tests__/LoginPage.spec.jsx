import { mount } from 'enzyme';
import React from 'react';
import * as R from 'ramda';
import sinon from 'sinon';
import LoginPage from '../LoginPage';
import * as sut from '../LoginPage';
import * as RU from '../../ramda-utils';
import { LocalStorageUtil, CryptoUtil } from '../../utils';
import { Either } from 'monet';

const mountLoginPage = props => {
  const finalProps = R.clone(props);
  if (finalProps.value === undefined) { finalProps.value = {}; };
  if (finalProps.onChange === undefined) { finalProps.onChange = sinon.fake(); };
  if (finalProps.onSubmit === undefined) { finalProps.onSubmit = sinon.fake(); };
  return mount(<LoginPage {...finalProps} />);
};

const findHostInput = c => c.find('HostInput');
const simulateHostInputChange = (c, v) => findHostInput(c).props().onChange(v);
const findTokenInput = c => c.find('TokenInput').at(0);
const simulateTokenInputChange = (c, v) => findTokenInput(c).props().onChange(v);

describe('LoginPage', () => {

  describe('Change on host value', () => {

    it('base', () => {
      const component = mountLoginPage({});
      simulateHostInputChange(component, "foo");
      expect(component.props().onChange.args).toEqual([
        [R.set(sut.valueLens.hostValue, "foo", {})]
      ]);
    });
    
  });

  describe('Change on token value', () => {

    it('base', () => {
      const component = mountLoginPage({});
      simulateTokenInputChange(component, "foo");
      expect(component.props().onChange.args).toEqual([
        [R.set(sut.valueLens.tokenValue, "foo", {})]
      ]);
    });
    
  });

});

describe('LocalStorageToken', () => {

  afterEach(() => {
    sinon.restore();
  });


  describe('getAndDecryptFromProps', () => {
    it('Calls getAndDecrypt', () => {
      let getAndDecrypt = sinon.stub(sut.LocalStorageToken, 'getAndDecrypt').returns("TOKEN");

      let props = {
        value: RU.objFromPairs(
          sut.valueLens.loadFromCachePassword, "FOO"
        )
      };

      expect(sut.LocalStorageToken.getAndDecryptFromProps(props)).toEqual("TOKEN");
      expect(getAndDecrypt.args).toHaveLength(1);
      expect(getAndDecrypt.args[0]).toEqual(["FOO"]);
    });
  });

  describe('getAndDecrypt', () => {

    it('Local storage not abailable -> error', () => {
      sinon.stub(LocalStorageUtil, 'storageAvailable').returns(false);
      expect(sut.LocalStorageToken.getAndDecrypt("FOO"))
        .toBe(sut.LocalStorageToken.LOCAL_STORAGE_NOT_AVAILABLE);
    });

    it('Empty password -> error', () => {
      sinon.stub(LocalStorageUtil, 'storageAvailable').returns(true);
      expect(sut.LocalStorageToken.getAndDecrypt("")).toBe(sut.LocalStorageToken.EMPTY_PASSWORD);
    });

    it('Token not found -> error', () => {
      sinon.stub(LocalStorageUtil, 'storageAvailable').returns(true);
      sinon.stub(LocalStorageUtil, 'get').returns(null);
      expect(sut.LocalStorageToken.getAndDecrypt("FOO"))
        .toBe(sut.LocalStorageToken.TOKEN_NOT_FOUND);
    });

    it('Working example', () => {
      let encrypted = CryptoUtil.encrypt("TOKEN", "SECRET");
      sinon.stub(LocalStorageUtil, 'storageAvailable').returns(true);
      sinon.stub(LocalStorageUtil, 'get').returns(encrypted);
      expect(sut.LocalStorageToken.getAndDecrypt("SECRET"))
        .toEqual(Either.left("TOKEN"));
    });
  });
  
});
