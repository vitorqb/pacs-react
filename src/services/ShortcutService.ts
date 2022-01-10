import * as R from 'ramda';
import { KeyHandler } from 'hotkeys-js';

interface IHotkeysOptions {
  element?: HTMLElement | Document | null;
}

interface IHotkeys {(key: string, options: IHotkeysOptions, method: KeyHandler): void;
}

export class ShortcutService {

  _document: Document
  _hotkeys: IHotkeys;
  _shortcuts: [string, () => void][]

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

  register(shortcut: string, handler: () => void) {
    this._shortcuts = R.append([shortcut, handler])(this._shortcuts);
  }
  

}
