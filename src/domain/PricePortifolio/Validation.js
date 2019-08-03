import * as R from 'ramda';
import monet, { Success, Fail } from 'monet';
import * as Validation from '../Validation';

/**
  * Checks if a Currency of valid.
  */
export const validateCurrency = x => R.pipe(
  R.chain(R.pipe(
    Validation.is(String),
    x => x.failMap(_ => [`Currency must be a string`])
  )),
  R.chain(R.pipe(
    Validation.hasLength(3),
    x => x.failMap(_ => [`Currency must be a string of 3 characters`]),
  )),
)(Success(x));

export const validatePortifolioCurrency = x => R.pipe(
  R.prop('currency'),
  validateCurrency,
  R.map(_ => x),
)(x);

export const validatePortifolioPrice = x => {
  const priceValidation = R.pipe(
    Validation.hasProp('price'),
    R.chain(R.pipe(
      R.prop('price'),
      Validation.is(Number),
      y => y.failMap(_ => `Price should be a number.`),
      y => y.map(_ => x)
    ))
  )(x);
  const dateValidation = R.pipe(
    Validation.hasProp('date'),
    R.chain(R.pipe(
      R.prop('date'),
      Validation.isDate,
      R.map(_ => x)
    )),
  )(x);
  return R.pipe(
    R.reduce((acc, v) => v.ap(acc).acc(), Success(x).acc()),
    R.map(_ => x),
  )([priceValidation, dateValidation]);
};

export const validatePortifolioPrices = x => R.pipe(
  R.prop('prices'),
  Validation.is(Array),
  y => y.failMap(_ => Fail(['Prices should be an array'])),
  R.chain(R.reduce(
    (acc, el) => validatePortifolioPrice(el).ap(acc).acc(),
    Success(x).acc()
  )),
  R.map(_ => x),
)(x);

/**
  * Checks if a portifolio item is valid.
  */
export const validatePortifolioItem = x => {
  const currencyValidation = R.pipe(
    Validation.hasProp('currency'),
    R.chain(validatePortifolioCurrency),
  )(x);
  const pricesValidation = R.pipe(
    Validation.hasProp('prices'),
    R.chain(validatePortifolioPrices),
  )(x);
  return R.pipe(
    R.reduce((acc, v) => v.ap(acc).acc(), Success(x).acc()),
    R.map(_ => x),
  )([currencyValidation, pricesValidation]);
};

/**
  * Checks if a portifolio is valid.
  */
export const validatePortifolio = x => R.pipe(
  R.ifElse(R.is(Array), Success, _ => Fail(['Portifolio should be an array'])),
  R.chain(R.reduce(
    (acc, el) => validatePortifolioItem(el).ap(acc).acc(),
    Success(x).acc()
  )),
  R.map(_ => x),
)(x);
