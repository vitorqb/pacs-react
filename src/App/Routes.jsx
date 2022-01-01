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
  transactionTable,
  createAccForm,
  editAccountComponent,
  createTransactionForm,
  accountTree,
  currencyTable,
  editTransactionComponent,
  journalComponent,
  accountBalanceEvolutionComponent,
  accountFlowEvolutionReportComponent,
  DeleteAccountComponent,
  fetchCurrencyExchangeRateDataComponent,
  deleteTransactionComponent,
}) => [
  {
    text: "Transaction",
    listOfLinkData: [
      {
        path: PATHS.CREATE_TRANSACTION,
        text: "Create",
        element: createTransactionForm,
      },
      {
        path: PATHS.EDIT_TRANSACTION,
        text: "Edit",
        element: editTransactionComponent,
      },
      {
        path: PATHS.TRANSACTION_TABLE,
        text: "Table",
        element: transactionTable
      },
      {
        path: PATHS.DELETE_TRANSACTION,
        text: "Delete",
        element: deleteTransactionComponent
      }
    ]
  },
  {
    text: "Account",
    listOfLinkData: [
      {
        path: PATHS.CREATE_ACCOUNT,
        text: "Create",
        element: createAccForm
      },
      {
        path: PATHS.EDIT_ACCOUNT,
        text: "Edit",
        element: editAccountComponent
      },
      {
        path: PATHS.DELETE_ACCOUNT,
        text: "Delete",
        element: DeleteAccountComponent
      },
      {
        path: PATHS.ACCOUNT_TREE,
        text: "Tree",
        element: accountTree
      },
      {
        path: PATHS.ACCOUNT_JOURNAL,
        text: "Journal",
        element: journalComponent
      },
    ]
  },
  {
    text: "Reports",
    listOfLinkData: [
      {
        path: PATHS.ACCOUNT_BALANCE_EVOLUTION_REPORT,
        text: "Balance Evolution Report",
        element: accountBalanceEvolutionComponent,
      },
      {
        path: PATHS.ACCOUNT_FLOW_EVOLUTION_REPORT,
        text: "Flow Evolution Report",
        element: accountFlowEvolutionReportComponent
      }
    ]
  },
  {
    text: "Currency",
    listOfLinkData: [
      {
        path: PATHS.CURRENCY_TABLE,
        text: "Table",
        element: currencyTable
      },
      {
        path: PATHS.EXCHANGE_RATE_DATA_FETCHER,
        text: "Exchange Rate Data Fetcher",
        element: fetchCurrencyExchangeRateDataComponent
      }
    ]
  }
];
