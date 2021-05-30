/**
 * Contains the lens for the main application.
 */
import * as R from 'ramda';
import * as RU from '../ramda-utils';
import { valueLens as LoginPageLens } from '../components/LoginPage';
import secretsLens from '../domain/Secrets/Lens';

const loginPageValueLens = R.lensPath(['loginPageValue']);

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

  // Value for the account balance evolution component
  accountBalanceEvolutionInstanceValue: R.lensPath(['accountBalanceEvolutionInstanceValue']),

};

export default lens;
