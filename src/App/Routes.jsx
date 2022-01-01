

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
        path: "/create-transaction/",
        text: "Create",
        element: createTransactionForm,
      },
      {
        path: "/edit-transaction/",
        text: "Edit",
        element: editTransactionComponent,
      },
      {
        path: "/transaction-table/",
        text: "Table",
        element: transactionTable
      },
      {
        path: "/delete-transaction",
        text: "Delete",
        element: deleteTransactionComponent
      }
    ]
  },
  {
    text: "Account",
    listOfLinkData: [
      {
        path: "/create-account/",
        text: "Create",
        element: createAccForm
      },
      {
        path: "/edit-account/",
        text: "Edit",
        element: editAccountComponent
      },
      {
        path: "/delete-account/",
        text: "Delete",
        element: DeleteAccountComponent
      },
      {
        path: "/account-tree/",
        text: "Tree",
        element: accountTree
      },
      {
        path: "/account-journal/",
        text: "Journal",
        element: journalComponent
      },
    ]
  },
  {
    text: "Reports",
    listOfLinkData: [
      {
        path: "/account-balance-evolution-report/",
        text: "Balance Evolution Report",
        element: accountBalanceEvolutionComponent,
      },
      {
        path: "/account-flow-evolution-report/",
        text: "Flow Evolution Report",
        element: accountFlowEvolutionReportComponent
      }
    ]
  },
  {
    text: "Currency",
    listOfLinkData: [
      {
        path: "/currency-table/",
        text: "Table",
        element: currencyTable
      },
      {
        path: "/exchange-rate-data/fetch/",
        text: "Exchange Rate Data Fetcher",
        element: fetchCurrencyExchangeRateDataComponent
      }
    ]
  }
];
