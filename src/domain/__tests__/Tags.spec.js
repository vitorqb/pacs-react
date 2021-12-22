import * as sut from '../Tags';


const tag1 = {name: "foo", value: "bar"};
const tag2 = {name: "bar", value: "foo"};


describe('Tags', () => {

  it('toUserInput', () => {
    expect(sut.Tags.toUserInput([])).toEqual("");
    expect(sut.Tags.toUserInput([tag1])).toEqual("foo:bar");
    expect(sut.Tags.toUserInput([tag2])).toEqual("bar:foo");
    expect(sut.Tags.toUserInput([tag1, tag2])).toEqual("foo:bar bar:foo");
  });

  it.each([
    [null, null],
    ["", null],
    ["foo:bar", null],
    ["foo:bar bar:baz", null],
    ["foo1:bar2 bar_:baz-", null],
    ["foo", sut.Tags.ErrorMessages.generic],
    ["foo bar", sut.Tags.ErrorMessages.generic],
    ["foo:bar bar", sut.Tags.ErrorMessages.generic],
    ["foo:bar:baz", sut.Tags.ErrorMessages.generic],
    ["foo bar:baz", sut.Tags.ErrorMessages.generic],
  ])('errorMessageFromUserInput: %s', (input, result) => {
    expect(sut.Tags.errorMessageFromUserInput(input)).toEqual(result);
  });

  it.each([
    [null, []],
    ["", []],
    ["foo:bar", [{name: "foo", value: "bar"}]],
    ["foo:bar bar:baz", [{name: "foo", value: "bar"}, {name: "bar", value: "baz"}]],
    ["foo1:bar2 bar_:baz-", [{name: "foo1", value: "bar2"}, {name: "bar_", value: "baz-"}]],
    ["foo", null],
    ["foo bar", null],
    ["foo:bar bar", null],
    ["foo:bar:baz", null],
    ["foo bar:baz", null],
  ])('fromUserInput: %s', (input, result) => {
    expect(sut.Tags.fromUserInput(input)).toEqual(result);
  });

});
