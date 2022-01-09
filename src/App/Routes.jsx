import React from 'react';
import * as Routing from '../domain/Routing/Routing.js';

export const PATHS = {
  CREATE_TRANSACTION: "/create-transaction/",
  EDIT_TRANSACTION: "/edit-transaction/",
  TRANSACTION_TABLE: "/transaction-table/",
  DELETE_TRANSACTION: "/delete-transaction/",
  CREATE_ACCOUNT: "/create-account/",
  EDIT_ACCOUNT: "/edit-account/",
  DELETE_ACCOUNT: "/delete-account/",
  ACCOUNT_TREE: "/account-tree/",
  ACCOUNT_JOURNAL: "/account-journal/",
  ACCOUNT_BALANCE_EVOLUTION_REPORT: "/account-balance-evolution-report/",
  ACCOUNT_FLOW_EVOLUTION_REPORT: "/account-flow-evolution-report/",
  CURRENCY_TABLE: "/currency-table/",
  EXCHANGE_RATE_DATA_FETCHER: "/exchange-rate-data/fetch/",
};

/**
 * Returns the data for the routes of the App.
 */
export const getRoutesData = (
  renderArgs,
  {
    transactionTableComponent,
    createAccFormComponent,
    editAccountComponent,
    createTransactionFormComponent,
    accountTreeComponent,
    currencyTableComponent,
    editTransactionComponent,
    journalComponent,
    accountBalanceEvolutionComponent,
    accountFlowEvolutionReportComponent,
    DeleteAccountComponent,
    fetchCurrencyExchangeRateDataComponent,
    deleteTransactionComponent,
  }
) => [
  Routing.newGroupOfRoutes({
    text: "Transaction",
    shortcut: "t",
    routes: [
      Routing.newRoute({
        path: PATHS.CREATE_TRANSACTION,
        text: "Create",
        element: React.createElement(createTransactionFormComponent, renderArgs),
        shortcut: "c",
      }),
      Routing.newRoute({
        path: PATHS.EDIT_TRANSACTION,
        text: "Edit",
        element: React.createElement(editTransactionComponent, renderArgs),
        shortcut: "e",
      }),
      Routing.newRoute({
        path: PATHS.TRANSACTION_TABLE,
        text: "Table",
        element: React.createElement(transactionTableComponent, renderArgs),
        shortcut: "t",
      }),
      Routing.newRoute({
        path: PATHS.DELETE_TRANSACTION,
        text: "Delete",
        element: React.createElement(deleteTransactionComponent, renderArgs),
        shortcut: "d",
      })
    ]
  }),
  Routing.newGroupOfRoutes({
    shortcut: "a",
    text: "Account",
    routes: [
      Routing.newRoute({
        path: PATHS.CREATE_ACCOUNT,
        text: "Create",
        element: React.createElement(createAccFormComponent, renderArgs),
        shortcut: "c",
      }),
      Routing.newRoute({
        path: PATHS.EDIT_ACCOUNT,
        text: "Edit",
        element: React.createElement(editAccountComponent, renderArgs),
        shortcut: "e",
      }),
      Routing.newRoute({
        path: PATHS.DELETE_ACCOUNT,
        text: "Delete",
        element: React.createElement(DeleteAccountComponent, renderArgs),
        shortcut: "d",
      }),
      Routing.newRoute({
        path: PATHS.ACCOUNT_TREE,
        text: "Tree",
        element: React.createElement(accountTreeComponent, renderArgs),
        shortcut: "t",
      }),
      Routing.newRoute({
        path: PATHS.ACCOUNT_JOURNAL,
        text: "Journal",
        element: React.createElement(journalComponent, renderArgs),
        shortcut: "j",
      }),
    ]
  }),
  Routing.newGroupOfRoutes({
    shortcut: "r",
    text: "Reports",
    routes: [
      Routing.newRoute({
        path: PATHS.ACCOUNT_BALANCE_EVOLUTION_REPORT,
        text: "Balance Evolution Report",
        element: React.createElement(accountBalanceEvolutionComponent, renderArgs),
        shortcut: "b",
      }),
      Routing.newRoute({
        path: PATHS.ACCOUNT_FLOW_EVOLUTION_REPORT,
        text: "Flow Evolution Report",
        element: React.createElement(accountFlowEvolutionReportComponent, renderArgs),
        shortcut: "f",
      })
    ]
  }),
  Routing.newGroupOfRoutes({
    shortcut: "c",
    text: "Currency",
    routes: [
      Routing.newRoute({
        path: PATHS.CURRENCY_TABLE,
        text: "Table",
        element: React.createElement(currencyTableComponent, renderArgs),
        shortcut: "t",
      }),
      Routing.newRoute({
        path: PATHS.EXCHANGE_RATE_DATA_FETCHER,
        text: "Exchange Rate Data Fetcher",
        element: React.createElement(fetchCurrencyExchangeRateDataComponent, renderArgs),
        shortcut: "f",
      })
    ]
  })
];
