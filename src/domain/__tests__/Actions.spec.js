import sinon from 'sinon';
import * as sut from '../Actions';


describe('ActionDispatcher', () => {

  it('Dispatches a registered action', () => {
    const label = "FOO";
    const params = {foo: 1};
    const handler = sinon.fake.returns("RESULT");
    const actionDispatcher = new sut.ActionDispatcher();

    actionDispatcher.register(label, handler);
    const result = actionDispatcher.dispatch(sut.newAction(label, params));

    expect(handler.args).toEqual([[params]]);
    expect(result).toEqual("RESULT");
  });

  it('Unregisters', () => {
    const label = "FOO";
    const handler = sinon.fake.returns("RESULT");
    const actionDispatcher = new sut.ActionDispatcher();

    actionDispatcher.register(label, handler);
    actionDispatcher.dispatch(sut.newAction(label));
    actionDispatcher.unregister(label);
    expect(() => actionDispatcher.dispatch(sut.newAction(label))).toThrow();
  });

});
