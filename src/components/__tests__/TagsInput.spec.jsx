import React from 'react';
import {mount} from 'enzyme';
import * as sut from '../TagsInput';
import sinon from 'sinon';
import * as testUtils from '../../testUtils.jsx';

const tag1 = {name: "foo", value: "bar"};
const value1 = {userInput: "foo:bar", pickedTags: [tag1]};
const tag2 = {name: "bar", value: "foo"};
const value2 = {userInput: "bar:foo", pickedTags: [tag2]};

describe('TagsInput', () => {

  const defaultProps = () => ({
    value: value1,
    onChange: () => {},
  });

  const render = (props={}) => {
    return mount(<sut.TagsInput {...{...defaultProps(), ...props}} />);
  };

  it('Passes value to input', () => {
    expect(render().find('input').props().value).toEqual("foo:bar");
  });

  it('Calls onChange with new user input', async () => {
    const onChange = sinon.spy();
    const component = render({onChange});
    component.find("input").simulate("change", {target: {value: "bar:foo"}});
    component.update();
    await testUtils.waitFor(() => onChange.args.length > 0);
    expect(onChange.args).toEqual([[value2]]);
  });

  describe('handleChange', () => {

    const callback = sinon.spy();

    beforeEach(() => {
      callback.resetHistory();
    });

    it('calls callback for correct tags', () => {
      sut.handleChange(callback, {target: {value: "foo:bar bar:foo"}});
      expect(callback.args).toEqual([[{userInput: "foo:bar bar:foo", pickedTags: [tag1, tag2]}]]);
    });

    it('calls callback for incorrect tags', () => {
      sut.handleChange(callback, {target: {value: "bar foo"}});
      expect(callback.args).toEqual([[{userInput: "bar foo", pickedTags: null}]]);
    });

  });

});
