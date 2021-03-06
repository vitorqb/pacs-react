/**
 * A simple table component, used to display static data.
 */
import * as R from 'ramda';
import * as RU from '../ramda-utils';
import React from 'react';

export const tableClassName = "table table-striped";
export const theadClassName = "thead-dark";

export const propsLens = {

  // Data is [{xLabel, yLabel, value}]
  data: R.lensPath(['data']),

  // xLabels is [string] with all x labels
  xLabels: R.lensPath(['xLabels']),

  // yLabels is [string] with all y labels
  yLabels: R.lensPath(['yLabels']),

};

export default function SimpleTable(props) {
  return (
    <table className={tableClassName}>
      <thead className={theadClassName}>
        <SimpleTableHeader {...props} />
      </thead>
      <tbody>
        <SimpleTableBody {...props} />
      </tbody>
    </table>
  );
};

export function SimpleTableHeader(props) {
  const xLabels = R.view(propsLens.xLabels, props);
  const thArray = R.map(x => <th key={`${x}-header`}>{x}</th>, xLabels);
  return <tr key={"table-header"}><th key={"first-headeer"}></th>{thArray}</tr>;
};

export function SimpleTableBody(props) {
  const yLabels = R.view(propsLens.yLabels, props);
  const xLabels = R.view(propsLens.xLabels, props);
  const data = R.view(propsLens.data, props);
  return R.pipe(
    // [[xlab, ylab]]
    R.apply(RU.permutations),
    // [[xlab, ylab, cell]]
    R.map(([xlab, ylab]) => [xlab, ylab, RU.findFirst(isDataItemWithLabels(xlab, ylab), data)]),
    // [[xlab, ylab, value]]
    R.map(([xlab, ylab, cell]) => [xlab, ylab, cell ? cell.value : ""]),
    // {xlab: [values]}, a map of list of cells, with the cells for the rows (y-axis).
    R.groupBy(RU.second),
    // [xlab, [values]]
    R.toPairs,
    // [xlab, value1, value2, ...]
    R.map(([xlab, cells]) => [xlab, ...R.map(RU.third, cells)]),
    // [tr, td, td, ...]
    R.addIndex(R.map)(([xlab, ...cells], i) => [
      (<th key={`-1${i}`}>{xlab}</th>),
      R.addIndex(R.map)((x, j) => <td key={`${j}${i}`}>{x}</td>, cells)
    ]),
    // [tr]
    R.addIndex(R.map)((els, i) => <tr key={`${i}`}>{els}</tr>),
  )([xLabels, yLabels]);
};

export const isDataItemWithLabels = R.curry((xlab, ylab, data) => {
  return R.and(
    RU.viewEquals(R.lensPath(['xLabel']), data, xlab),
    RU.viewEquals(R.lensPath(['yLabel']), data, ylab)
  );
});
