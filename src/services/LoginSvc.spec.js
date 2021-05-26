import * as sut from './LoginSvc.js';
import sinon from 'sinon';

const TOKEN_VALUE = "123";
const URL = "www.goo.boo";
const ADMINT_TOKEN = "ADMIN_TOKEN";
const defaultOpts = {axios: () => Promise.resolve({"token_value": TOKEN_VALUE}), url: URL};
const mkLoginSvc = (opts) => new sut.LoginSvc({...defaultOpts, ...opts});

describe('LoginSvc', () => {

  describe('recoverTokenFromCookies', () => {

    it('Returns the token', async () => {
      const axios = sinon.fake.resolves({data: {"token_value": TOKEN_VALUE}});
      const response = await mkLoginSvc({axios}).recoverTokenFromCookies();
      expect(response).toEqual(TOKEN_VALUE);
      expect(axios.args).toEqual([[{url: URL, method: "GET"}]]);
    });

    it('Returns null if recover fails', async () => {
      const axios = sinon.fake.rejects();
      const response = await mkLoginSvc({axios}).recoverTokenFromCookies();
      expect(response).toBe(null);
    });

  });

  describe('getToken', () => {

    it('Returns the token', async () => {
      const axios = sinon.fake.resolves({data: {"token_value": TOKEN_VALUE}});
      const response = await mkLoginSvc({axios}).getToken(ADMINT_TOKEN);
      expect(response).toEqual(TOKEN_VALUE);
      expect(axios.args).toEqual([[{url: URL, method: "POST", data: {"admin_token": ADMINT_TOKEN}}]]);
    });

  });

});
