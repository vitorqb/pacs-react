import moment from 'moment';
import sinon from 'sinon';
import { ajaxGetRecentTransactions, ajaxCreateAcc, ajaxCreateTransaction, makeRequest, extractDataFromAxiosError, REQUEST_ERROR_MSG } from '../ajax';
import * as R from 'ramda';

describe('Test ajax', () => {

  describe('makRequest()', () => {
    it('Calls axios with config...', () => {
      const method = "POST";
      const url = "my/url";
      const data = {my: "data"};
      const response = {data: ""}
      const axiosMock = sinon.fake.resolves(response);
      makeRequest({axios: axiosMock, method, url});
      expect(axiosMock.calledWith({url, method, data}))
    })
    it('Returns parsed promise on success...', () => {
      const responseMock = {data: {a: 1, b: 2}};
      const axiosMock = () => Promise.resolve(responseMock);
      const parseResponseData = R.prop("b");
      expect.assertions(1)
      return makeRequest({
        axios: axiosMock,
        url: "a",
        parseResponseData
      }).then(function(data) {
        expect(data).toEqual(2)
      })
    })
    it('Raises parsed error message on failure...', () => {
      const responseError = {response: {data: "Some error message"}};
      const axiosMock = () => Promise.reject(responseError);
      expect.assertions(1)
      return makeRequest({axios: axiosMock}).catch(errorData => {
        expect(errorData).toEqual(responseError.response.data)
      })
    })
  })

  describe('extractDataFromAxiosError()', () => {
    it('Error with response data', () => {
      const error = {a: 1};
      expect(extractDataFromAxiosError(error)).toEqual(REQUEST_ERROR_MSG);
    })
    it('Error with no response data', () => {
      const responseError = {response: {data: 123}};
      expect(extractDataFromAxiosError(responseError)).toEqual(123);
    })
  })

  describe('Test ajaxGetRecentTransactions', () => {
    const url = "/transactions/";

    function getAxiosMock(opts) {
      // Returns an Axios mock for get transactions
      const { transactions = [] } = opts || {}
      const respMock = { data: transactions }
      return sinon.fake.resolves(respMock)
    }

    function assertCalledWithUrl(axiosMock) {
      // Asserts an axios mock was called with `url`
      expect(axiosMock.lastArg.url).toEqual(url);
    }

    it('Get empty array', () => {
      const axiosMock = getAxiosMock();
      const result = ajaxGetRecentTransactions(axiosMock);

      expect.assertions(2);
      assertCalledWithUrl(axiosMock);
      return result.then(x => {
        expect(x).toEqual([])
      });
    })

    it('Get one long', async () => {
      const strDate = "2018-12-12";
      const rawTransactionsResponse = [{id: 1, description: "A", date: strDate}];
      const transactions = [{id: 1, description: "A", date: moment.utc(strDate)}];
      const axiosMock = getAxiosMock({ transactions: rawTransactionsResponse });
      const result = await ajaxGetRecentTransactions(axiosMock);
      expect(result).toEqual(transactions)
      assertCalledWithUrl(axiosMock)
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

  describe('Test ajaxCreateTransaction', () => {
    // !!!! TODO -> Don't hardcode urls.
    const url = "/transactions/";

    describe('Posting...', () => {
      it('Posts to url after parsing arguments', () => {
        const rawParams = {
          description: "Some Description",
          date: "2018-01-01",
          movements: [
            {account: 1, currency: 2, quantity: 3},
            {account: 4, currency: 5, quantity: 6}
          ]
        }
        const parsedParams = {
          description: rawParams.description,
          date: rawParams.date,
          movements_specs: [
            {account: 1, money: {currency: 2, quantity: 3}},
            {account: 4, money: {currency: 5, quantity: 6}}
          ]
        };
        const axiosMock = { post: sinon.fake.resolves() };
        ajaxCreateTransaction(axiosMock)(rawParams);
        expect(axiosMock.post.calledWith(url, parsedParams)).toBe(true)
      })
      it('Parses response data', () => {
        const response = {data: {a: 1, b: 2}}
        const axiosMock = { post: () => Promise.resolve(response) };
        const responsePromise = ajaxCreateTransaction(axiosMock, {});
        return responsePromise.then(x => expect(x).toEqual(response.data))
      })
    })

    describe('Erroring...', () => {
      it('Rethrows the error with its response data.', () => {
        const axiosError = {response: {data: "Some error!"}};
        const rejectedPromise = Promise.reject(axiosError);
        const axiosMock = { post: () =>  rejectedPromise}

        const respPromise = ajaxCreateTransaction(axiosMock, {})
        return respPromise.catch(e => {
          expect(e).toEqual(axiosError.response.data)
        })
      })
      it('Rethrows the raw error if no response data.', () => {
        const nonAxiosError = {message: "Some raw message!"};
        const rejectedPromise = Promise.reject(nonAxiosError);
        const axiosMock = { post: () => rejectedPromise };

        const respPromise = ajaxCreateTransaction(axiosMock, {});
        return respPromise.catch(e => {
          expect(e).toEqual(nonAxiosError)
        });
      })
    })

  })
})
