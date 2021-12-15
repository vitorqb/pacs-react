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

});
