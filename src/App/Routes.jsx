

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
  fetchCurrencyExchangeRateDataComponent
}) => [
  {
    text: "Transaction",
    listOfLinkData: [
      {
        path: "/create-transaction/",
        text: "Create",
        component: () => createTransactionForm,
      },
      {
        path: "/edit-transaction/",
        text: "Edit",
        component: () => editTransactionComponent,
      },
      {
        path: "/transaction-table/",
        text: "Table",
        component: () => transactionTable
      }
    ]
  },
  {
    text: "Account",
    listOfLinkData: [
      {
        path: "/create-account/",
        text: "Create",
        component: () => createAccForm
      },
      {
        path: "/edit-account/",
        text: "Edit",
        component: () => editAccountComponent
      },
      {
        path: "/delete-account/",
        text: "Delete",
        component: () => DeleteAccountComponent
      },
      {
        path: "/account-tree/",
        text: "Tree",
        component: () => accountTree
      },
      {
        path: "/account-journal/",
        text: "Journal",
        component: () => journalComponent
      },
    ]
  },
  {
    text: "Reports",
    listOfLinkData: [
      {
        path: "/account-balance-evolution-report/",
        text: "Balance Evolution Report",
        component: () => accountBalanceEvolutionComponent,
      },
      {
        path: "/account-flow-evolution-report/",
        text: "Flow Evolution Report",
        component: () => accountFlowEvolutionReportComponent
      }
    ]
  },
  {
    text: "Currency",
    listOfLinkData: [
      {
        path: "/currency-table/",
        text: "Table",
        component: () => currencyTable
      },
      {
        path: "/exchange-rate-data/fetch/",
        text: "Exchange Rate Data Fetcher",
        component: () => fetchCurrencyExchangeRateDataComponent
      }
    ]
  }
];
