// Integration tests for pacs-react
import React from 'react';
import { mount } from 'enzyme';
import App from '../src/App';


describe('User first interaction', () => {
  it('List of last Transactions is rendered', () => {
    // The app is rendered
    const app = mount(<App />)
    const transactionList = app.find('transactionList')
    expect(transactionList).toHaveLength(1)
    fail("Finish tests!")
  })
})
