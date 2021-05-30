import React from 'react';
import { mount } from 'enzyme';
import sinon from 'sinon';
import * as R from 'ramda';
import * as RU from '../../../ramda-utils';
import { lens as AjaxInjectionsLens } from '../../Ajax';
import { lens as EventsLens } from '../../Events';
import { AccountFactory } from '../../../testUtils';
import * as sut from '../DeleteAccountComponent';
import DeleteAccountComponent, { propsLens, valueLens } from '../../../components/DeleteAccountComponent';
import { lens as AppLens } from '../../Lens';
import * as testUtils from '../../../testUtils.jsx';

describe('reduceOnSuccess', () => {

  it('Base', () => {
    const account = AccountFactory.build();
    const value = R.set(valueLens.selectedAccount, account, {});
    expect(sut.reduceOnSuccess(account, value)).toEqual(RU.objFromPairs(
      valueLens.errorMsg, "",
      valueLens.successMsg, sut.successMsg(account),
      valueLens.selectedAccount, null,
    ));
  });
  
});

describe('reduceOnError', () => {

  it('Base', () => {
    const errMsg = "Failed!";
    expect(sut.reduceOnError(errMsg, {})).toEqual(RU.objFromPairs(
      valueLens.errorMsg, errMsg,
      valueLens.successMsg, "",
    ));
  });
  
});

describe('handleSubmitDelete', () => {

  let sandbox, state, refetchState, deleteAcc, props;
  const account = AccountFactory.build();

  beforeEach(() => {
    state = {};
    sandbox = sinon.createSandbox();
    sandbox.stub(window, 'confirm');
    refetchState = sinon.fake.resolves();
    deleteAcc = sinon.fake.resolves();
    const events = RU.objFromPairs(EventsLens.refetchState, refetchState);
    const ajaxInjections = RU.objFromPairs(AjaxInjectionsLens.deleteAcc, deleteAcc);
    props = { ajaxInjections, events };
  });

  afterEach(() => { sandbox.restore(); });

  const setState = R.curry(f => {
    state = f(state);
  });
  
  it('Calls window confirmation and deleteAcc', async () => {
    window.confirm.returns(true);
    await sut.handleSubmitDelete(props, setState, account);
    expect(window.confirm.args).toEqual([[sut.confirmDeletionMsg(account)]]);
    expect(deleteAcc.args).toEqual([[account]]);
  });

  it('Calls refetchState on success', async () => {
    window.confirm.returns(true);
    await sut.handleSubmitDelete(props, setState, account);
    expect(refetchState.args).toEqual([[]]);
  });

  it('Does not call deleteAcc if window confirm is false', async () => {
    window.confirm.returns(false);
    await sut.handleSubmitDelete(props, setState, account);
    expect(deleteAcc.args).toEqual([]);;
  });

});

describe('DeleteAccountComponentInstance', () => {

  const account = testUtils.AccountFactory.build();

  const defaultProps = {
    state: RU.objFromPairs(
      AppLens.accounts, [account],
    ),
  };

  const renderComponent = (props) => mount(
    <sut.DeleteAccountComponentInstance {...defaultProps} {...props}/>
  );

  it('Updates state when calls onChange', () => {
    const component = renderComponent();
    const initialValue = R.view(propsLens.value, component.find(DeleteAccountComponent).props());
    expect(initialValue).toEqual({});
    const onChange = R.view(propsLens.onChange, component.find(DeleteAccountComponent).props());
    onChange(() => ({foo: "bar"}));
    component.update();
    const value = R.view(propsLens.value, component.find(DeleteAccountComponent).props());
    expect(value).toEqual({foo: "bar"});
  });

});
