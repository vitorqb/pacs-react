import React from 'react';
import { mount } from 'enzyme';
import * as sut from "./LoginPageV2";
import sinon from 'sinon';

const defaultProps = {
  onSubmit: () => {},
};


const render = (props={}) => {
  return mount(<sut.LoginPage {...defaultProps} {...props}/>);
};


describe('LoginPage', () => {
  it('Set token and submit fires callback', () => {
    const onSubmit = sinon.spy();
    const component = render({onSubmit});
    component.find("input").simulate("change", {target: {value: "123"}});
    component.find('button[type="submit"]').simulate("click");
    expect(onSubmit.args).toEqual([["123"]]);
  });
});
