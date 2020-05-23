import React from 'react';
import {mount} from 'enzyme';
import TransactionPicker from '../TransactionPicker.jsx';
import sinon from 'sinon';
import { TransactionFactory } from '../../testUtils';

describe('TransactionPicker', () => {

  describe('Rendering...', () => {
    const titleStr = "Edit Transaction!";
    const picker = mount(<TransactionPicker title={titleStr} />);;
    it('Renders input for pk', () => {
      const inp = picker.find('input[name="pk"]');
      expect(inp).toHaveLength(1);
      expect(inp.props().type).toEqual("number");
    });
    it('Renders submit button', () => {
      const inp = picker.find("form").find('input[type="submit"]');
      expect(inp).toHaveLength(1);
    });
  });

  describe('Submiting...', () => {

    let picker, onPicked, transaction, transactionPromise, getTransaction;

    beforeEach(() => {
      transaction = TransactionFactory.build();
      transactionPromise = Promise.resolve(transaction);
      onPicked = sinon.fake();
      getTransaction = sinon.fake.returns(transactionPromise);
      picker = mount(
        <TransactionPicker getTransaction={getTransaction} onPicked={onPicked} />
      );;
    });

    it('Calls getTransaction with pk on submit', () => {
      picker
        .find('input[name="pk"]')
        .simulate('change', {target: {value: 12}});
      picker.find("form").simulate("submit");
      picker.update();
      expect(getTransaction.calledWith(12)).toBe(true);
    });
    it('Calls callback onPicked with gotten transaction on submit', async () => {
      picker
        .find('input[type="submit"]')
        .simulate('change', {target: {value: 12}});
      picker.update();
      picker.instance().forceUpdate();
      picker.find("form").simulate("submit");
      await transactionPromise.then().then();
      expect(onPicked.calledWith(transaction)).toBe(true);
    });
  });
});
