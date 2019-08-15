import React from 'react';
import { lens as AppLens } from '../Lens';
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
export const handleSubmitDelete = R.curry((renderArgs, account) => {
  const { ajaxInjections, events } = renderArgs;
  
  if (! window.confirm(confirmDeletionMsg(account))) { return null; };
  
  const deleteAcc = R.view(AjaxInjectionsLens.deleteAcc, ajaxInjections);
  const overState = R.view(EventsLens.overState, events);
  const refetchState = R.view(EventsLens.refetchState, events);

  return deleteAcc(account)
    .then(_ => overState(
      AppLens.deleteAccountComponentInstanceValue,
      reduceOnSuccess(account)
    ))
    .then(_ => refetchState())
    .catch(x => overState(
      AppLens.deleteAccountComponentInstanceValue,
      reduceOnError(x)
    ));
});

/**
 * A provider for DeleteAccountComponent.
 */
export default function DeleteAccountComponentInstance(renderArgs) {
  const { state, events } = renderArgs;
  const accounts = R.view(AppLens.accounts, state);
  if (R.isNil(accounts)) {
    return null;
  }
  const overState = R.view(EventsLens.overState, events);
  const props = RU.setLenses(
    [
      [propsLens.onChange, overState(AppLens.deleteAccountComponentInstanceValue)],
      [propsLens.accounts, accounts],
      [propsLens.onSubmitDelete, handleSubmitDelete(renderArgs)],
      [propsLens.value, R.view(AppLens.deleteAccountComponentInstanceValue, state)],
    ],
    {}
  );
  return <DeleteAccountComponent {...props} />;
};
