import sinon from 'sinon';
import { ajaxGetRecentTransactions, ajaxCreateAcc } from '../ajax';


describe('Test ajax', () => {

  describe('Test ajaxGetRecentTransactions', () => {
    const url = "/transactions/";

    function getAxiosMock(opts) {
      // Returns an Axios mock for get transactions
      const { transactions = [] } = opts || {}
      const respMock = { data: transactions }
      return { get: sinon.fake.resolves(respMock) }
    }

    function assertCalledWithUrl(axiosMock) {
      // Asserts an axios mock was called with `url`
      expect(axiosMock.get.calledWith(url)).toBe(true)
    }

    it('Get empty array', () => {
      const axiosMock = getAxiosMock()
      const result = ajaxGetRecentTransactions(axiosMock)

      assertCalledWithUrl(axiosMock)    
      return result.then(x => {
        expect(x).toEqual([])
      })
    })

    it('Get one long', () => {
      const transactions = [{id: 1, description: "A"}]
      const axiosMock = getAxiosMock({ transactions })
      const result = ajaxGetRecentTransactions(axiosMock)

      assertCalledWithUrl(axiosMock)
      return result.then(x => {
        expect(x).toEqual(transactions)
      })
    })
  })

  describe('Test ajaxCreateAcc', () => {
    const url = "/accounts/"

    it('Posts to url with received arguments', () => {
      const axiosMock = { post: sinon.fake.resolves({data: ""}) };
      const params = {a: 1, b: 2};
      const result = ajaxCreateAcc(axiosMock, params);

      expect(axiosMock.post.calledWith(url, params)).toBe(true)
    })

    it('Corrects accType -> acc_type', () => {
      const axiosMock = { post: sinon.fake.resolves({data: ""}) };
      const params = {accType: 1};
      const result = ajaxCreateAcc(axiosMock, params);

      expect(axiosMock.post.calledWith(url, {acc_type: 1})).toBe(true)
    })
  })
})
