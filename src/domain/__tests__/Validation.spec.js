import * as sut from '../Validation';

describe('hasProp', () => {

  it('Base true', () => {
    const res = sut.hasProp('x')({x: 1});
    expect(res.success()).toEqual({x: 1});
  });

  it('False undefined', () => {
    const res = sut.hasProp('x')({x: undefined});
    expect(res.fail()).toEqual(['Property "x" returned null or undefined.']);
  });

  it('False not present', () => {
    const res = sut.hasProp('x')({y: 1});
    expect(res.fail()).toEqual(['Property "x" returned null or undefined.']);
  });
  
});

describe('propIsArray', () => {

  it('true', () => {
    const res = sut.propIsArray('x', {x: [1]});
    expect(res.success()).toEqual({x: [1]});
  });

  it('false obj', () => {
    const res = sut.propIsArray('x', {x: {}});
    expect(res.fail()).toEqual(['Property "x" should be an array']);    
  });

  it('false string', () => {
    const res = sut.propIsArray('x', {x: "foo"});
    expect(res.fail()).toEqual(['Property "x" should be an array']);    
  });
  
});

describe('isDate', () => {

  it('true', () => {
    const res = sut.isDate('2018-01-01');
    expect(res.success()).toEqual('2018-01-01');
  });

  it('false', () => {
    const res = sut.isDate('2018-1-01');
    expect(res.fail()).toEqual([`Invalid date format: "2018-1-01".`]);
  });
  
});

describe('is', () => {

  it('Success', () => {
    const res = sut.is(String, 'foo');
    expect(res.success()).toEqual('foo');
  });

  it('Fail', () => {
    const res = sut.is(String, 123);
    expect(res.fail()).toEqual('Expected an instance of String');
  });
  
});

describe('hasLength', () => {

  it('Success', () => {
    const res = sut.hasLength(3, 'foo');
    expect(res.success()).toEqual('foo');
  });

  it('Fail', () => {
    const res = sut.hasLength(3, 'fo');
    expect(res.fail()).toEqual('Expected a length of 3, but found 2.');
  });

});
