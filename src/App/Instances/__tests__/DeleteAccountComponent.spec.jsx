import sinon from 'sinon';
import * as R from 'ramda';
import * as RU from '../../../ramda-utils';
import { lens as AjaxInjectionsLens } from '../../Ajax';
import { lens as EventsLens } from '../../Events';
import { AccountFactory } from '../../../testUtils';
import * as sut from '../DeleteAccountComponent';
import { valueLens as ComponentValueLens } from '../../../components/DeleteAccountComponent';

describe('reduceOnSuccess', () => {

  it('Base', () => {
    const account = AccountFactory.build();
    const value = R.set(ComponentValueLens.selectedAccount, account, {});
    expect(sut.reduceOnSuccess(account, value)).toEqual(RU.objFromPairs(
      ComponentValueLens.errorMsg, "",
      ComponentValueLens.successMsg, sut.successMsg(account),
      ComponentValueLens.selectedAccount, null,
    ));
  });
  
});

describe('reduceOnError', () => {

  it('Base', () => {
    const errMsg = "Failed!";
    expect(sut.reduceOnError(errMsg, {})).toEqual(RU.objFromPairs(
      ComponentValueLens.errorMsg, errMsg,
      ComponentValueLens.successMsg, "",
    ));
  });
  
});

describe('handleSubmitDelete', () => {

  let sandbox;
  beforeEach(() => {
    sandbox = sinon.createSandbox();
    sandbox.stub(window, 'confirm');
  });
  afterEach(() => { sandbox.restore(); });
  
  it('With confirmation', () => {
    window.confirm.returns(true);
    const account = AccountFactory.build();
    const deleteAcc = sinon.fake.resolves();
    const ajaxInjections = RU.objFromPairs(AjaxInjectionsLens.deleteAcc, deleteAcc);
    const events = RU.objFromPairs(EventsLens.overState, sinon.fake());
    const props = { ajaxInjections, events };

    sut.handleSubmitDelete(props, account);

    expect(window.confirm.args).toEqual([[sut.confirmDeletionMsg(account)]]);
    expect(deleteAcc.args).toEqual([[account]]);
  });
  
});
