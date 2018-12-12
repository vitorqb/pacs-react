import React from 'react';
import moment from 'moment';
import { mount } from 'enzyme';
import TransactionTable from '../TransactionTable';


describe('Testing TransactionTable', () => {
  let mountTransactionTable = (title, transactions) => {
    return mount(<TransactionTable title={title} transactions={transactions} />)
  }
  it('Renders with correct prop title', () => {
    const title = "My Title"
    const list = mountTransactionTable(title)
    expect(list.props().title).toEqual(title)
  })
  it('Renders with correct title in dom', () => {
    const title = "Another Title"
    const list = mountTransactionTable(title)
    expect(list.find('span.titleSpan').html()).toContain(title)
  })
  it('Mounts with a table', () => {
    const list = mountTransactionTable()
    expect(list.find("table")).toHaveLength(1)
  })
  it('Mounts with correct list of transactions', () => {
    const transactions = [{}];
    const list = mountTransactionTable("", transactions)
    expect(list.props().transactions).toEqual(transactions)
  })
  it('Renders the transactions in the dom', () => {
    const transactions = [
      {id: 1, description: "Supermarket", date: moment("1994-11-14")},
      {id: 2, description: "Salary", date: moment("1994-11-23")}
    ];
    const list = mountTransactionTable("", transactions)
    const trs = list.find("tr")
   
    expect(trs).toHaveLength(transactions.length)
    const tds = trs.find("td")
    expect(tds.contains(<td>{transactions[0].pk}</td>)).toBe(true)
    expect(tds.contains(<td>{transactions[0].description}</td>)).toBe(true)
    expect(tds.contains(<td>{transactions[0].date.format("YYYY-MM-DD")}</td>))
      .toBe(true)
    expect(tds.contains(<td>{transactions[1].pk}</td>)).toBe(true)
    expect(tds.contains(<td>{transactions[1].description}</td>)).toBe(true)
    expect(tds.contains(<td>{transactions[1].date.format("YYYY-MM-DD")}</td>))
      .toBe(true)
  })
})
