import * as sut from '../Core';

describe('base', () => {
  it('base', () => {
    expect(1).toEqual(1);
  });
});

describe('getStats', () => {
  it('base', () => {
    const portifolio = [
      {
        currency: 'EUR',
        prices: [1,2,3],
      },
      {
        currency: 'BRL',
        prices: [1],
      }
    ];
    const res = sut.getStats(portifolio);
    expect(res).toEqual({
      numberOfEntires: {
        EUR: 3,
        BRL: 1,
      },
    });
  });
});

describe('normalizePortifolioPrices', () => {

  it('base', () => {
    const portifolio = [{prices: [{price: 1}]}];
    const parsed = sut.normalizePortifolioPrices(portifolio);
    expect(parsed).toEqual([{prices: [{price: '1.00000'}]}]);
  });
  
});
