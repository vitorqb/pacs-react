/**
 * Contains the lens for the main application.
 */
import * as R from 'ramda';

/**
 * Main lenses for the App.
 */
export const lens = {

  // Secrets
  secrets: R.lensPath(['secrets']),

};

export default lens;
