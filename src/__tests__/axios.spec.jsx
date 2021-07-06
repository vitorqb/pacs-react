import * as sut from '../axios';

describe('mkAxiosWrapper', () => {

  it('With token and featureToggles', () => {
    const featureFlags = {foo: true, bar: false};
    const axios = sut.mkAxiosWrapper({baseUrl: "/foo", token: "abc", featureFlags});
    expect(axios.defaults.baseURL).toEqual("/foo");
    expect(axios.defaults.headers['Authorization']).toEqual("Token abc");
    expect(axios.defaults.headers["Pacs-Feature-Toggles"]).toEqual("foo,!bar");
  });

});
