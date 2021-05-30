/**
 * Contains the lens for the main application.
 */
import * as R from 'ramda';

/**
 * Main lenses for the App.
 */
export const lens = {

  // Remote data
  accounts: R.lensPath(['accounts']),
  currencies: R.lensPath(['currencies']),

  // Secrets
  secrets: R.lensPath(['secrets']),

  // Value for the delete account component
  deleteAccountComponentInstanceValue: R.lensPath(['deleteAccountComponentInstanceValue']),

};

export default lens;
