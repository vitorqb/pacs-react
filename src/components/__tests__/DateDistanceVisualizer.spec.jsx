import DateDistanceVisualizer, { getDaysBetween, getColor, propsLens } from '../DateDistanceVisualizer';
import moment from 'moment';
import * as RU from '../../ramda-utils';

describe('getDaysBetween', () => {

  it('Base', () => {
    const date1 = moment('2019-01-01');
    const date2 = moment('2019-01-11');
    const props = RU.objFromPairs(
      propsLens.date1, date1,
      propsLens.date2, date2,
    );
    expect(getDaysBetween(props)).toEqual(-10);
  });

});

describe('getColor', () => {

  it('Positive', () => {
    expect(getColor(10)).toEqual("rgb(110, 145, 0)");
  });

  it('Negative', () => {
    expect(getColor(-10)).toEqual("rgb(110, 145, 0)");
  });

  it('Overflow', () => {
    expect(getColor(1000)).toEqual("rgb(255, 0, 0)");    
  });
  
});
