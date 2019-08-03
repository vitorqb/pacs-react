import * as sut from '../Validation';

describe('validateCurrency', () => {

  it('Valid', () => {
    const res = sut.validateCurrency('EUR');
    expect(res.success()).toEqual('EUR');
  });

  it('Too short', () => {
    const res = sut.validateCurrency('EU');
    expect(res.fail()).toEqual([`Currency must be a string of 3 characters`]);    
  });

  it('Not exist', () => {
    const res = sut.validateCurrency(undefined);
    expect(res.fail()).toEqual([`Currency must be a string`]);    
  });
  
});

describe('validatePortifolioCurrency', () => {

  it('base', () => {
    const res = sut.validatePortifolioCurrency({currency: "EUR"});
    expect(res.success()).toEqual({currency: "EUR"});
  });

  it('failure', () => {
    const res = sut.validatePortifolioCurrency({currency: 123});
    expect(res.fail()).toEqual([`Currency must be a string`]);
  });

});

describe('validatePortifolioPrices', () => {

  it('base', () => {
    const prices = [
      {
        date: "2018-01-01",
        price: 1.5,
      },
      {
        date: "2018-01-02",
        price: 1.3,
      }
    ];
    const res = sut.validatePortifolioPrices({ prices });
    expect(res.success()).toEqual({ prices });
  });

  it('fail', () => {
    const prices = [{date: "foo", price: "bar"}];
    const res = sut.validatePortifolioPrices({ prices });
    expect(res.fail()).toEqual([
      'Invalid date format: "foo".',
      'Price should be a number.'
    ]);
  });
  
});

describe('validatePortifolio', () => {

  it('base', () => {
    const portifolio = [
      {
        currency: 'EUR',
        prices: [
          {
            date: "2019-02-15",
            price: 1.5,
          }
        ]
      }
    ];
    const res = sut.validatePortifolio(portifolio);
    expect(res.success()).toEqual(portifolio);    
  });

  it('Fail with currency', () => {
    const portifolio = [{currency: "E", prices: []}];
    const res = sut.validatePortifolio(portifolio);
    expect(res.fail()).toEqual([`Currency must be a string of 3 characters`]);
  });

  it('Fail with price', () => {
    const portifolio = [
      {
        currency: "BRL",
        prices: [
          {
            date: "foo",
            price: 1.5,
          }
        ]
      }
    ];
    const res = sut.validatePortifolio(portifolio);
    expect(res.fail()).toEqual(['Invalid date format: "foo".']);
  });
  
});
