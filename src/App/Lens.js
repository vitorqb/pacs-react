/**
 * Contains the lens for the main application.
 */
import * as R from 'ramda';
import * as RU from '../ramda-utils';
import { valueLens as LoginPageLens } from '../components/LoginPage';
import secretsLens from '../domain/Secrets/Lens';

const loginPageValueLens = R.lensPath(['loginPageValue']);

/**
 * View the Secrets from the App state.
 */
const viewSecrets = state => RU.objFromPairs(
  secretsLens.token, R.view(lens.token, state),
  secretsLens.host, R.view(lens.host, state),
);

/**
 * Set the Secrets into a satate.
 */
const setSecrets = R.curry((secrets, s) => RU.setLenses(
  [[lens.token, R.view(secretsLens.token, secrets)],
   [lens.host, R.view(secretsLens.host, secrets)]],
  s,
));

/**
 * An enum for states of fetching remote data.
 */
export const RemoteFetchingStatusEnum = {
  uninitialized: 'UNINITIALIZED',
  loading: 'LOADING',
  finished: 'FINISHED',
};

/**
 * Main lenses for the App.
 */
export const lens = {

  transactions: R.lensPath(['transactions']),
  accounts: R.lensPath(['accounts']),
  currencies: R.lensPath(['currencies']),

  // Is the user logged in?
  isLoggedIn: R.lensPath(['isLoggedIn']),

  // The state for the initial remote fetching of options.
  remoteFetchingStatus: R.lensPath(['remoteFetchingStatus']),

  // Errors from the login page
  loginPageErrors: R.lensPath(['loginPageErrors']),

  // Values from the login page.
  loginPageValue: loginPageValueLens,
  host: R.compose(loginPageValueLens, LoginPageLens.host),
  token: R.compose(loginPageValueLens, LoginPageLens.token),
  secrets: R.lens(viewSecrets, setSecrets),

  // Value for the delete account component
  deleteAccountComponentInstanceValue: R.lensPath(['deleteAccountComponentInstanceValue']),

};

export default lens;
