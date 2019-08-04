import * as R from 'ramda';
import Monet, { Success, Fail } from 'monet';

export const hasProp = R.curry((p, obj) => {
  return (R.propSatisfies(R.isNil, p, obj))
    ? Fail([`Property "${p}" returned null or undefined.`])
    : Success(obj);
});

export const propIsArray = R.curry((p, obj) => {
  return (R.propSatisfies(R.is(Array), p, obj))
    ? Success(obj)
    : Fail([`Property "${p}" should be an array`]);
});

export const isDate = x => R.pipe(
  Success,
  R.chain(R.ifElse(
    R.test(/^[0-9]{4}-[0-9]{2}-[0-9]{2}$/),
    Success,
    _ => Fail([`Invalid date format: "${x}".`])
  )),
  R.map(_ => x),
)(x);

export const is = R.curry((t, x) => R.ifElse(
  R.is(t),
  Success,
  _ => Fail(`Expected an instance of ${t.name}`)
)(x));

export const hasLength = R.curry((n, x) => R.ifElse(
  R.pipe(R.length, R.equals(n)),
  Success,
  _ => Fail(`Expected a length of ${n}, but found ${R.length(x)}.`)
)(x));
