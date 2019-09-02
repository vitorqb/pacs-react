import sinon from 'sinon';
import * as R from 'ramda';
import * as RU from '../../ramda-utils';
import React from 'react';
import { mount } from 'enzyme';
import * as sut from '../SimpleTable';
import SimpleTable from '../SimpleTable';

const exampleDataXLabels = ['col1', 'col2',];
const exampleDatayLabels = ['row1', 'row2',];
const mkExampleData = () => ({
  xLabels: exampleDataXLabels,
  yLabels: exampleDatayLabels,
  data: [
    {xLabel: 'col1', yLabel: 'row1', value: '11'},
    {xLabel: 'col1', yLabel: 'row2', value: '12'},
    {xLabel: 'col2', yLabel: 'row1', value: '21'},
    {xLabel: 'col2', yLabel: 'row2', value: '22'},
  ]
});

function mountSimpleTable(props) {
  const exampleData = mkExampleData();
  const finalProps = R.pipe(
    R.when(
      p => RU.viewIsNil(sut.propsLens.data, p),
      R.set(sut.propsLens.data, exampleData.data)
    ),
    R.when(
      p => RU.viewIsNil(sut.propsLens.xLabels, p),
      R.set(sut.propsLens.xLabels, exampleData.xLabels)
    ),
    R.when(
      p => RU.viewIsNil(sut.propsLens.yLabels, p),
      R.set(sut.propsLens.yLabels, exampleData.yLabels)
    ),
  )(props);
  return mount(<SimpleTable {...finalProps} />);
};

describe('SimpleTable', () => {

  it('Renders all cells', () => {
    const c = mountSimpleTable();
    const tds = c.find('td');
    expect(tds).toHaveLength(4);
  });

  it('Renders all headers', () => {
    const c = mountSimpleTable();
    const ths = c.find('th');
    // 3 headers + 2 rows
    expect(ths).toHaveLength(5);
  });

  it('Renders correct content', () => {
    const c = mountSimpleTable();
    const tds = c.find('td');
    const selected = tds.findWhere(x => x.type() == 'td' && x.text() == '22');
    expect(selected).toHaveLength(1);
  });

});

describe('SimpleTableHeader', () => {

  it('base', () => {
    const props = RU.objFromPairs(sut.propsLens.xLabels, ["foo", "bar"],);
    const c = mountSimpleTable(props);
    const ths = c.find("th");

    expect(ths.findWhere(x => x.type() == 'th' && x.text() === "foo")).toHaveLength(1);
    expect(ths.findWhere(x => x.type() == 'th' && x.text() === "bar")).toHaveLength(1);
  });

});
