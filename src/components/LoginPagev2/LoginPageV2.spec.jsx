import React from 'react';
import { mount } from 'enzyme';
import * as sut from "./LoginPageV2";
import sinon from 'sinon';

const defaultProps = {
  onGetToken: () => {},
};


const render = (props={}) => {
  return mount(<sut.LoginPage {...defaultProps} {...props}/>);
};


describe('LoginPage', () => {
  it('Set token and submit fires callback', () => {
    const onGetToken = sinon.spy();
    const component = render({onGetToken});
    component.find("input").simulate("change", {target: {value: "123"}});
    component.find('button[type="submit"]').simulate("click");
    expect(onGetToken.args).toEqual([["123"]]);
  });
});
