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
export const getRoutesData = ({
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
}) => [
  Routing.newGroupOfRoutes({
    text: "Transaction",
    shortcut: "t",
    routes: [
      Routing.newRoute({
        path: PATHS.CREATE_TRANSACTION,
        text: "Create",
        element: createTransactionFormComponent,
        shortcut: "c",
      }),
      Routing.newRoute({
        path: PATHS.EDIT_TRANSACTION,
        text: "Edit",
        element: editTransactionComponent,
        shortcut: "e",
      }),
      Routing.newRoute({
        path: PATHS.TRANSACTION_TABLE,
        text: "Table",
        element: transactionTableComponent,
        shortcut: "t",
      }),
      Routing.newRoute({
        path: PATHS.DELETE_TRANSACTION,
        text: "Delete",
        element: deleteTransactionComponent,
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
        element: createAccFormComponent,
        shortcut: "c",
      }),
      Routing.newRoute({
        path: PATHS.EDIT_ACCOUNT,
        text: "Edit",
        element: editAccountComponent,
        shortcut: "e",
      }),
      Routing.newRoute({
        path: PATHS.DELETE_ACCOUNT,
        text: "Delete",
        element: DeleteAccountComponent,
        shortcut: "d",
      }),
      Routing.newRoute({
        path: PATHS.ACCOUNT_TREE,
        text: "Tree",
        element: accountTreeComponent,
        shortcut: "t",
      }),
      Routing.newRoute({
        path: PATHS.ACCOUNT_JOURNAL,
        text: "Journal",
        element: journalComponent,
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
        element: accountBalanceEvolutionComponent,
        shortcut: "b",
      }),
      Routing.newRoute({
        path: PATHS.ACCOUNT_FLOW_EVOLUTION_REPORT,
        text: "Flow Evolution Report",
        element: accountFlowEvolutionReportComponent,
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
        element: currencyTableComponent,
        shortcut: "t",
      }),
      Routing.newRoute({
        path: PATHS.EXCHANGE_RATE_DATA_FETCHER,
        text: "Exchange Rate Data Fetcher",
        element: fetchCurrencyExchangeRateDataComponent,
        shortcut: "f",
      })
    ]
  })
];
