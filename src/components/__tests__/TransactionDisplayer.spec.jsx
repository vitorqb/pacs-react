import React from 'react';
import { mount } from 'enzyme';
import { TransactionFactory } from '../../testUtils.jsx';
import * as sut from '../TransactionDisplayer.jsx';
import { DateUtil } from '../../utils.jsx';


describe('TransactionDisplayer', () => {

  const defaultProps = () => {
    transaction: TransactionFactory.build();
  };

  const render = (props) => {
    return mount(<sut.TransactionDisplayer {...defaultProps()} {...props} />);
  };

  it('Renders pk', () => {
    const transaction = TransactionFactory.build();
    expect(render({transaction}).html()).toContain(`<span>${transaction.pk}</span>`);
  });

  it('Renders reference', () => {
    const transaction = TransactionFactory.build();
    expect(render({transaction}).html()).toContain(`<span>${transaction.reference}</span>`);
  });

  it('Renders description', () => {
    const transaction = TransactionFactory.build();
    expect(render({transaction}).html()).toContain(`<span>${transaction.description}</span>`);
  });

  it('Renders date', () => {
    const transaction = TransactionFactory.build();
    const formattedDate = DateUtil.formatFullReadable(transaction.date);
    expect(render({transaction}).html()).toContain(`<span>${formattedDate}</span>`);
  });

  it('Render movements', () => {
    const transaction = TransactionFactory.build();
    const component = render({transaction});;
    expect(component.find(sut.MovementDisplayer)).toHaveLength(transaction.movements.length);
  });

  it('Render tags', () => {
    const transaction = TransactionFactory.build();
    const component = render({transaction});;
    expect(component.find(sut.TagDisplayer)).toHaveLength(transaction.tags.length);    
  });

});
