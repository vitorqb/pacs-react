import React from 'react';
import { mount } from 'enzyme';
import TransactionList from '../TransactionList';


describe('Testing TransactionList', () => {
  let mountTransactionList = (title, transactions) => {
    return mount(<TransactionList title={title} transactions={transactions} />)
  }
  it('Renders with correct prop title', () => {
    const title = "My Title"
    const list = mountTransactionList(title)
    expect(list.props().title).toEqual(title)
  })
  it('Renders with correct title in dom', () => {
    const title = "Another Title"
    const list = mountTransactionList(title)
    expect(list.find('span.title').html()).toContain(title)
  })
  it('Mounts with a table', () => {
    const list = mountTransactionList()
    expect(list.find("table")).toHaveLength(1)
  })
  it('Mounts with correct list of transactions', () => {
    const transactions = [{}];
    const list = mountTransactionList("", transactions)
    expect(list.props().transactions).toEqual(transactions)
  })
  it('Renders the transactions in the dom', () => {
    const transactions = [
      {id: 1, description: "Supermarket"},
      {id: 2, description: "Salary"}
    ];
    const list = mountTransactionList("", transactions)
    const trs = list.find("tr")
   
    expect(trs).toHaveLength(transactions.length)
    const tds = trs.map(x => x.find("td"))
    expect(list.contains(<td>{transactions[0].id}</td>)).toBe(true)
    expect(list.contains(<td>{transactions[0].description}</td>)).toBe(true)
    expect(list.contains(<td>{transactions[1].id}</td>)).toBe(true)
    expect(list.contains(<td>{transactions[1].description}</td>)).toBe(true)
  })
})
