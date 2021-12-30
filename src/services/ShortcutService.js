import * as R from 'ramda';


export class ShortcutService {

  /**
   * Constructor
   * @param {object} opts
   * @param {object} opts.aDocument The `window.document` to bind to.
   * @param {function} opts.aHotkeys The `hotkeys` fn from hotkeys-js package.
   */
  constructor({aDocument, aHotkeys}) {
    this._document = aDocument;
    this._hotkeys = aHotkeys;
    this._shortcuts = [];
  }

  /**
   * Initializes the service by listening to the shortcuts.
   */
  async init() {
    const promises = this._shortcuts.map(([shortcut, handler]) => {
      return this._hotkeys(shortcut, {element: this._document}, () => handler());
    });
    return await Promise.all(promises);
    ;
  }

  /**
   * Register a new shortcut.
   * @param {string} shortcut The shortcut (string).
   * @param {Function} handler The 0-arg handler.
   */
  register(shortcut, handler) {
    this._shortcuts = R.append([shortcut, handler])(this._shortcuts);
  }
  

}
