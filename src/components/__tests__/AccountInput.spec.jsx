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
      const exp = <Select options={options} onChange={onChange} value={value} />;
      const res = mount(
        <AccountInput accounts={accounts} onChange={onChange} selectedAcc={value} />
      );
      expect(res.contains(exp)).toBe(true);
    })
    it('renders with the selectedAccount selected...', () => {
      const accounts = AccountFactory.buildList(3);
      const selectedAcc = accounts[1];
      const accInput = mount(<AccountInput
                             accounts={accounts}
                             selectedAcc={selectedAcc}
                             onChange={()=>{}} />);
      expect(accInput.find(Select).props().value).toEqual(selectedAcc);
    })
  })
  describe('onChange handler......', () => {
    it('Calls onChange if input is changed...', () => {
      const accounts = AccountFactory.buildList(2);
      const selectedAcc = accounts[0];
      const onChange = sinon.fake();
      const accInput = mount(
        <AccountInput accounts={accounts} onChange={onChange} />
      );

      // Calls onChange handler for underlying 
      accInput.find(Select).props().onChange(selectedAcc);

      expect(onChange.calledWith(selectedAcc)).toBe(true);
    })
  })
})
