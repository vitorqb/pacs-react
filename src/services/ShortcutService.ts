import * as R from 'ramda';

/**
 * Represents a key that can be pressed by the user, trigering a shortcut.
 */
export interface IKey {
  key: string,
  shift: boolean,
  ctrl: boolean,
  alt: boolean,
  caseSensitive: boolean,
}

/**
 * Represents a shortcut to be assigned to some key.
 */
export interface IShortcut {
  key: IKey,
  handler: () => void,
}

/**
 * Service responsible for calling shortcuts from user key presses.
 */
export interface IShortcutService {
  init: () => void,
  register: (shortcut: IShortcut) => void,
}

export function newKey(
  key: string,
  opts?: {shift?: boolean, ctrl?: boolean, alt?: boolean, caseSensitive?: boolean}
): IKey {
  const shift: boolean =  R.propOr(false, 'shift', opts)
  const ctrl: boolean = R.propOr(false, 'ctrl', opts)
  const alt: boolean = R.propOr(false, 'alt', opts)
  const caseSensitive: boolean = R.propOr(true, 'caseSensitive', opts)  
  return {key, shift, ctrl, alt, caseSensitive};
}

export class ShortcutService implements IShortcutService {

  _document: Document
  _shortcuts: IShortcut[];

  constructor({aDocument}) {
    this._document = aDocument;
    this._shortcuts = [];
  }

  /**
   * Initializes the service by listening to the shortcuts.
   */
  async init() {
    this._document.addEventListener('keydown', (e) => {
      const pressedKey = e.key;
      const shift = e.shiftKey;
      const ctrl = e.ctrlKey;
      const alt = e.altKey;
      this._shortcuts.forEach(shortcut => {
        const keysAreEqual = shortcut.key.caseSensitive
          ? shortcut.key.key == pressedKey
          : shortcut.key.key.toLowerCase() == pressedKey.toLowerCase();
        if (
          keysAreEqual
          && shortcut.key.shift == shift
          && shortcut.key.ctrl == ctrl
          && shortcut.key.alt == alt
        ) {
          shortcut.handler();
        }
      });
    });
  }

  register(shortcut: IShortcut): void {
    this._shortcuts.push(shortcut);
  }  

}


