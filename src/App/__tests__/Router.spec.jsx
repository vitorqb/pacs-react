import React from 'react';
import { mount } from 'enzyme';
import * as sut from '../Router';

describe('makeGroup', () => {

  const data = {text: "Foo", listOfLinkData: []};
  const component = mount(sut.makeGroup(data));

  it('Renders a Group with correct text and children', () => {
    expect(component.find('Group').props().text).toEqual("Foo");
    expect(component.find('Group').props().children).toEqual([]);
  });

  it('Renders a label with the group text', () => {
    const expSpan = "<span class=\"router-group__label\">Foo</span>";
    expect(component.find('.router-group__label').html()).toEqual(expSpan);
  });

  it('Renders a div with the children', () => {
    const expChildren = "<div class=\"router-group__children\"></div>";
    expect(component.find('.router-group__children').html()).toEqual(expChildren);
  });
  
});
