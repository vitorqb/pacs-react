import React from 'react';
import { mount } from 'enzyme';
import Select from 'react-select';
import AccountInput from '../AccountInput';
import { AccountFactory } from '../../testUtils';
import sinon from "sinon";

describe('AccountInput', () => {
  describe('Rendering...', () => {
    it('Renders a Select with options', () => {
      const accounts = AccountFactory.buildList(3);
      const value = accounts[0];
      const onChange = () => {}
      const options = accounts.map(acc => {
        return {value: acc, label: acc.name}
      });
      const exp = (
        <Select
          options={options}
          onChange={onChange}
          value={{value, label: value.name}} />
      );
      const res = mount(
        <AccountInput accounts={accounts} onChange={onChange} value={value} />
      );
      expect(res).toContainReact(exp);
    })
    it('renders with the value selected...', () => {
      const accounts = AccountFactory.buildList(3);
      const value = accounts[1];
      const accInput = mount(<AccountInput
                             accounts={accounts}
                             value={value}
                             onChange={()=>{}} />);
      expect(accInput.find(Select).props().value).toEqual({value, label: value.name});
    })
  })
  describe('onChange handler......', () => {
    it('Calls onChange if input is changed...', () => {
      const accounts = AccountFactory.buildList(2);
      const value = accounts[0];
      const onChange = sinon.fake();
      const accInput = mount(
        <AccountInput accounts={accounts} onChange={onChange} />
      );

      // Calls onChange handler for underlying 
      accInput.find(Select).props().onChange(value);

      expect(onChange.calledWith(value)).toBe(true);
    })
  })
})
