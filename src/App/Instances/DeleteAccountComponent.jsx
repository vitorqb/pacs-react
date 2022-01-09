import React, {useState} from 'react';
import { lens as AppContextLens } from '../AppContext';
import { lens as AjaxInjectionsLens } from '../Ajax';
import { lens as EventsLens } from '../Events';
import * as R from 'ramda';
import * as RU from '../../ramda-utils';
import DeleteAccountComponent, { propsLens, valueLens } from '../../components/DeleteAccountComponent';

/**
 * The message usage for confirming the deletion of an account.
 */
export const confirmDeletionMsg = account => {
  return `Are you sure you want to delete the account "${account.name}"?`;
};

/**
 * The message used after the deletion is success.
 */
export const successMsg = account => `Delete account ${account.name}!`;

/**
 * Reducer for the state on success deletion.
 */
export const reduceOnSuccess = R.curry((account, value) => RU.setLenses(
  [
    [valueLens.selectedAccount, null],
    [valueLens.errorMsg, ""],
    [valueLens.successMsg, successMsg(account)],
  ]
)(value));

/**
 * Reducer for the state on deletion error.
 */
export const reduceOnError = R.curry((errorMsg, value) => RU.setLenses(
  [
    [valueLens.errorMsg, errorMsg],
    [valueLens.successMsg, ""],
  ]
)(value));

/**
 * Handles the submission for deleting an account.
 */
export const handleSubmitDelete = R.curry((renderArgs, setState, account) => {
  const { ajaxInjections, events } = renderArgs;

  if (! window.confirm(confirmDeletionMsg(account))) { return null; };
  const deleteAcc = R.view(AjaxInjectionsLens.deleteAcc, ajaxInjections);
  const refetchAppContext = R.view(EventsLens.refetchAppContext, events);

  return deleteAcc(account)
    .then(_ => setState(reduceOnSuccess(account)))
    .then(_ => refetchAppContext())
    .catch(x => setState(reduceOnError(x)));
});

/**
 * A provider for DeleteAccountComponent.
 */
export function DeleteAccountComponentInstance(renderArgs) {
  const [instanceState, setInstanceState] = useState({});
  const { appContext } = renderArgs;
  const accounts = R.view(AppContextLens.accounts, appContext);
  if (R.isNil(accounts)) {
    return null;
  }
  const props = RU.objFromPairs(
    propsLens.onChange, setInstanceState,
    propsLens.accounts, accounts,
    propsLens.onSubmitDelete, handleSubmitDelete(renderArgs, setInstanceState),
    propsLens.value, instanceState,
  );
  return <DeleteAccountComponent {...props} />;
};

export default DeleteAccountComponentInstance;
