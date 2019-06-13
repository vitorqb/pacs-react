import React, { createElement } from 'react';
import { MonthUtil } from '../utils.jsx';
import * as R from 'ramda';
import { moneysToRepr } from '../utils';

export const tableClassName = "table table-striped";
export const theadClassName = "thead-dark";

export const periodToLabel = R.pipe(MonthUtil.periodToMonth, MonthUtil.toLabel);

export function getMonthLabelFromAccountFlow(accountFlow) {
  let month = MonthUtil.periodToMonth(accountFlow.period);
  return MonthUtil.toLabel(month);
}

export const AccountFlowEvolutionTH = ({label, index}) => {
  const key = `${index}`;
  return <th key={key}>{label}</th>;
};

export function AccountFlowEvolutionTableHead({monthLabels}) {
  const allLabels = ["Account", ...monthLabels];
  const headers = R.addIndex(R.map)((label, index) => {
    return AccountFlowEvolutionTH({label, index});
  })(allLabels);
  return (
    <thead key={"thead"} className={theadClassName}>
      <tr key="0">{headers}</tr>
    </thead>
  );
}

export function AccountFlowEvolutionTableRow(
  {accountFlow, getCurrency, getAccount, index}
) {
  const flows = accountFlow.flows;
  const accountPk = accountFlow.account;
  const accountName = getAccount(accountPk).name;
  const accountNameTableData = <td key="accountName">{accountName}</td>;
  const monthsTableDatas = R.addIndex(R.map)((flow, index) => {
      return <td key={`${index}`}>{moneysToRepr(getCurrency, flow.moneys)}</td>;
  })(flows);
  return <tr key={`${index}`}>{accountNameTableData}{monthsTableDatas}</tr>;
}

export function AccountFlowEvolutionTableBody(
  {accountsFlows, getCurrency, getAccount}
) {
  const tableRows = R.addIndex(R.map)((accountFlow, index) => {
    let props = {accountFlow, getCurrency, getAccount, index};
    return AccountFlowEvolutionTableRow(props);
  })(accountsFlows);
  return createElement('tbody', {key: "0"}, tableRows);
}

export const renderers = {

  tableHead({accountsFlows, periods}) {
    const monthLabels = R.map(periodToLabel, periods);
    const theadProps = { monthLabels };
    return AccountFlowEvolutionTableHead(theadProps);
  },

  tableBody({accountsFlows, getCurrency, getAccount}) {
    const tbodyProps = {accountsFlows, getCurrency, getAccount};
    return AccountFlowEvolutionTableBody(tbodyProps);
  },

  table({thead, tbody}) {
    const props = { className: tableClassName };
    const children = [thead, tbody];
    return createElement("table", props, children);
  },
  
};

export default function AccountFlowEvolutionTable(props) {
  const thead = renderers.tableHead(props);
  const tbody = renderers.tableBody(props);
  const tableProps = {thead, tbody};
  return renderers.table(tableProps);
}
