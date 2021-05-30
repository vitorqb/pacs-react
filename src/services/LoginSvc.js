const URL = "auth/token";

export class LoginSvc {

  constructor({axios, url=URL}) {
    this._axios = axios;
    this._url = url;
  }

  recoverTokenFromCookies = () => {
    const request = {url: this._url, method: "GET"};
    return this._axios(request).then(x => x.data["token_value"]).catch(x => null);
  };

  getToken = (adminToken) => {
    const request = {url: this._url, method: "POST", data: {"admin_token": adminToken}};
    return this._axios(request).then(x => x.data["token_value"]);
  }

}
