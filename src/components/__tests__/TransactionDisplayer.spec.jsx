import React from 'react';
import { mount } from 'enzyme';
import { AccountFactory, CurrencyFactory, MovementFactory, TransactionFactory } from '../../testUtils.jsx';
import * as sut from '../TransactionDisplayer.jsx';
import { DateUtil, moneyToRepr } from '../../utils.jsx';
import * as R from 'ramda';


describe('TransactionDisplayer', () => {

  const defaultProps = () => ({
    transaction: TransactionFactory.build(),
    getAccount: () => AccountFactory.build(),
    getCurrency: () => CurrencyFactory.build(),
  });

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


describe('MovementDisplayer', () => {

  const defaultProps = () => ({
    movement: MovementFactory.build(),
    getAccount: () => AccountFactory.build(),
    getCurrency: () => CurrencyFactory.build(),
  });

  const render = (props) => mount(<sut.MovementDisplayer {...defaultProps()} {...props}/>);

  it('Renders account', () => {
    const account = AccountFactory.build();
    const getAccount = () => account;
    const component = render({getAccount});
    expect(component.html()).toContain(`<span>${account.name}</span>`);
  });

  it('Renders money', () => {
    const movement = MovementFactory.build();
    const money = R.prop('money', movement);
    const currency = CurrencyFactory.build();
    const getCurrency = () => currency;
    const component = render({movement, getCurrency});
    const expMoneyRepr = moneyToRepr(getCurrency)(money);
    expect(component.html()).toContain(`<span>${expMoneyRepr}</span>`);
  });

});
