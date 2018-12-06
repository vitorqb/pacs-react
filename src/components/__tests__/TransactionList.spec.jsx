import React from 'react';
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
    expect(list.find('span.title').html()).toContain(title)
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
      {id: 1, description: "Supermarket"},
      {id: 2, description: "Salary"}
    ];
    const list = mountTransactionTable("", transactions)
    const trs = list.find("tr")
   
    expect(trs).toHaveLength(transactions.length)
    const tds = trs.map(x => x.find("td"))
    expect(list.contains(<td>{transactions[0].id}</td>)).toBe(true)
    expect(list.contains(<td>{transactions[0].description}</td>)).toBe(true)
    expect(list.contains(<td>{transactions[1].id}</td>)).toBe(true)
    expect(list.contains(<td>{transactions[1].description}</td>)).toBe(true)
  })
})
