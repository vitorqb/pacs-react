import React, { createElement } from 'react';
import AccountBalanceEvolutionTable, { makeHeader, makeBody, makeTr, makeTd } from '../AccountBalanceEvolutionTable';
import { mount } from 'enzyme';
import * as R from 'ramda';
import { AccountFactory, CurrencyFactory } from '../../testUtils';
import { newGetter, memoizeSimple, moneysToRepr } from '../../utils';
import sinon from 'sinon';


describe("Testing AccountBalanceEvolutionTable...", () => {
  describe('Integration...', () => {
    it('Mounts with two accounts', () => {
      const monthsLabels = ["Jan", "Feb", "Mar"];
      const currency = CurrencyFactory.build();
      const getCurrency = R.always(currency);
      const accounts = AccountFactory.buildList(2);
      const getAccount = newGetter(R.prop("pk"), accounts);
      const data = [
        {
          account: accounts[0].pk,
          initialBalance: [],
          balanceEvolution: [
            [{ quantity: "0.00000", currency: 1 }],
            [{ quantity: "10.00000", currency: 1 }],
            [{ quantity: "25.00000", currency: 1 }]
          ]
        },
        {
          account: accounts[1].pk,
          initialBalance: [],
          balanceEvolution: [
            [{ quantity: "-10.00000", currency: 1 }],
            [{ quantity: "-50.00000", currency: 1 }],
            [{ quantity: "-100.50000", currency: 1 }]
          ]
        }
      ];
      const table = mount(createElement(
        AccountBalanceEvolutionTable,
        { monthsLabels, data, getCurrency, getAccount }
      ));

      // Expects one table
      expect(table.find("table")).toHaveLength(1);

      // With one header
      expect(table.find("thead")).toHaveLength(1);

      // Expects one th with each label
      for (var i = 0; i < monthsLabels.length; i++) {
        expect(table.find("th").at(i + 1).text()).toContain(monthsLabels[i]);
      }

      // ont tbody
      expect(table.find("tbody")).toHaveLength(1);

      // And three rows (head, 2 accounts)
      expect(table.find("tr")).toHaveLength(3);

      // The second row should be for accounts[0]
      const secondRow = table.find("tr").at(1);
      expect(secondRow.find("td")).toHaveLength(4);
      expect(secondRow.find("td").at(0).text()).toEqual(accounts[0].name);
      expect(secondRow.find("td").at(1).text()).toContain(`0.00 ${currency.name}`);
      expect(secondRow.find("td").at(3).text()).toContain(`25.00 ${currency.name}`);

      // The third row should be for accounts[1]
      const thirdRow = table.find("tr").at(2);
      expect(thirdRow.find("td")).toHaveLength(4);
      expect(thirdRow.find("td").at(0).text()).toContain(accounts[1].name);
      expect(thirdRow.find("td").at(1).text()).toContain(`-10.00 ${currency.name}`);
      expect(thirdRow.find("td").at(3).text()).toContain(`-100.50 ${currency.name}`);
    });
  });
  describe('Renders headers...', () => {
    let inject, props;
    beforeEach(() => {
      inject = { makeHeader: sinon.fake() };
      props = { data: [], monthsLabels: {}, inject };
    });
    it('Calls makeHeader with monthsLabels', () => {
      AccountBalanceEvolutionTable(props);
      expect(inject.makeHeader.callCount).toEqual(1);
      expect(inject.makeHeader.firstCall.args).toEqual([props.monthsLabels]);
    });
    it('Uses result as header', () => {
      inject.makeHeader = () => <thead><tr><th>SomethingWeirdHere</th></tr></thead>;
      const resp = mount(AccountBalanceEvolutionTable(props));
      expect(resp.find("th")).toHaveLength(1);
      expect(resp.find("th").text()).toEqual("SomethingWeirdHere");
    });
  });
});


describe('makeHeader', () => {
  it('base', () => {
    const labels = ["ABC", "DEF"];
    const resp = mount(<table>{makeHeader(labels)}</table>);
    expect(resp.find("thead")).toHaveLength(1);
    expect(resp.find("tr")).toHaveLength(1);
    // Recall first th must be Account
    expect(resp.find("th")).toHaveLength(1 + labels.length);
    expect(resp.find("th").at(0).text()).toContain("Account");
    for (var i = 0; i < labels.length; i++) {
      expect(resp.find("th").at(i + 1).text()).toContain(labels[i]);
    }
  });
});

describe('makeBody', () => {
  const account = AccountFactory.build();
  const currency = CurrencyFactory.build();
  const getAccount = () => account;
  const getCurrency = () => currency;
  it('Uses makeTr on each obj of data', () => {
    const makeTr = sinon.fake();
    const data = [{}, {}];
    makeBody(data, getCurrency, getAccount, {makeTr});
    expect(makeTr.args).toEqual([
      [data[0], 0, getCurrency, getAccount],
      [data[1], 1, getCurrency, getAccount]
    ]);
  });
  it('Returns results for makeTr inside a tbody', () => {
    const makeTr = (x, i) => <tr key={i}><td>Look at me {i}</td></tr>;
    const data = [{}, {}];
    const resp = mount(
      <table>{makeBody(data, getCurrency, getAccount, {makeTr})}</table>
        );
    expect(resp.find("tbody")).toHaveLength(1);
    expect(resp.find("tr")).toHaveLength(data.length);
    for (var i=0; i<data.length; i++) {
      expect(resp.find("tr").at(i).find("td").text()).toContain("Look at me " + i);
    }
  });
});

describe('makeTr', () => {
  const currency = CurrencyFactory.build();
  const getCurrency = () => currency;
  const account = AccountFactory.build();
  const getAccount = () => account;
  const data = {
    account: 1,
    initialBalance: [],
    balanceEvolution: [
      [{currency: 1, quantity: 12.50}],
      [{currency: 2, quantity: 25}]
    ]
  };
  
  it('Calls makeTd', () => {
    const makeTd = sinon.fake();
    makeTr(data, 1, getCurrency, getAccount, { makeTd });
    expect(makeTd.args).toEqual([
      [data.balanceEvolution[0], getCurrency, 0],
      [data.balanceEvolution[1], getCurrency, 1]
    ]);
  });
  it('Uses makeTd result', () => {
    const makeTd = (x, getCurrency, i) => <td key={i}>HelloWorld</td>;
    const resp = mount(
      <table><tbody>{makeTr(data, 1, getCurrency, getAccount, { makeTd })}</tbody></table>
    );
    // first td is the account name, second and third from data
    for (var i=0; i<data.balanceEvolution.length; i++) {
      expect(resp.find("td").at(i+1).key()).toBe(`${i}`);
      expect(resp.find("td").at(i+1).text()).toContain("HelloWorld");
    }
  });
  it('First td has account name', () => {
    const resp = mount(
      <table><tbody>{makeTr(data, 1, getCurrency, getAccount)}</tbody></table>
    );
    expect(resp.find("td").at(0).text()).toContain(getAccount().name);
  });
});


describe('makeTd', () => {
  const getCurrency = memoizeSimple(pk => CurrencyFactory.build({pk}));
  const balance = [{currency: 1, quantity: 12}, {currency: 2, quantity: -12}];
  it('Base', () => {
    const resp = mount(
      <table><tbody><tr>{makeTd(balance, getCurrency, 2)}</tr></tbody></table>
    );
    const expText = moneysToRepr(getCurrency, balance);
    expect(resp.find("td")).toHaveLength(1);
    expect(resp.find("td").text()).toEqual(expText);
  });
});
