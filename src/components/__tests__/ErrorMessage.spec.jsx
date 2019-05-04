import React from 'react';
import { mount } from 'enzyme';
import ErrorMessage from '../ErrorMessage';


describe('ErrorMessage', () => {
  describe('hasError()', () => {
    it('True', () => {
      const errMsg = mount(<ErrorMessage value="SomeError" />);
      expect(errMsg.instance().hasError()).toBe(true);
    });
    it('False (empty string)', () => {
      const errMsg = mount(<ErrorMessage value="" />);
      expect(errMsg.instance().hasError()).toBe(false);
    });
    it('False (not parsed)', () => {
      const errMsg = mount(<ErrorMessage />);
      expect(errMsg.instance().hasError()).toBe(false);
    });
    it('False (empty Object)', () => {
      const errMsg = mount(<ErrorMessage valye={{}} />);
      expect(errMsg.instance().hasError()).toBe(false);
    });
  });
  describe('Do not show if hasError', () => {
    it('True', () => {
      const errMsg = mount(<ErrorMessage value="SomeError" />);
      expect(errMsg.find("div.error-message")).toHaveLength(1);
    });
    it('False', () => {
      const errMsg = mount(<ErrorMessage />);
      expect(errMsg.find("div.error-message")).toHaveLength(0);      
    });
  });
  describe('Displays the error', () => {
    it('Displays error msg', () => {
      const err = {a: "aaa", b: "ccc"};
      const errMsg = mount(<ErrorMessage value={err} />);
      const formattedErrors = ErrorMessage.formatError(err);
      for (var i=0; i<formattedErrors.length; i++) {
        const escapedErrMsg = formattedErrors[i].replace(/>/g, "&gt;");
        expect(errMsg.html()).toContain(escapedErrMsg);
      }
    });
  });
  describe('formatError()', () => {
    const errorMsgsTable = [
      ["Simple text"],
      [{some: "large", obj: "of strings"}],
      [["a", "b", "c"]]
    ];
    it.each(errorMsgsTable)(".forObj(%s)", (err) => {
      const exp = JSON.stringify(err, undefined, 2);
      const res = ErrorMessage.formatError(err);
      expect(res).toEqual(exp);
    });
  });
});
