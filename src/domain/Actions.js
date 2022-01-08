

export const newAction = (label, params={}) => ({label, params});

export class ActionDispatcher {

  constructor() {
    this._handlers = {};
  }

  dispatch(action) {
    return this._handlers[action.label](action.params);
  }

  register(label, handler) {
    this._handlers[label] = handler;
  }

  unregister(label) {
    delete this._handlers[label];
  }

}
