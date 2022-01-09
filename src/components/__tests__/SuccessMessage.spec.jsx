import React from 'react';
import {mount} from 'enzyme';
import SuccessMessage from "../SuccessMessage";

describe('SuccessMessage', () => {
  describe('Displaying value...', () => {
    it('Displays pretified value prop on pre node', () => {
      const value = {a: 123, b: ["one", "two"]};
      const exp = <pre id="json">{JSON.stringify(value, undefined, 2)}</pre>;
      const successMessage = mount(<SuccessMessage value={value} />);
      expect(successMessage.contains(exp)).toBe(true);
    });
    it('Displays empty div if value is falsy', () => {
      const value = ""; 
      const successMessage = mount(<SuccessMessage value={value} />);
      expect(successMessage.find("pre")).toHaveLength(0);
      expect(successMessage.contains(<div></div>)).toBe(true);
    });
  });
});
