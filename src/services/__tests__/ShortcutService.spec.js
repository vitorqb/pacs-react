import jsdom from 'jsdom';
import * as sut from '../ShortcutService.js';
import sinon from 'sinon';
import hotkeys from 'hotkeys-js';
import { waitFor } from '../../testUtils.jsx';

describe('FT ShortcutService', () => {

  let aDocument, aWindow;

  beforeEach(() => {
    aWindow = (new jsdom.JSDOM()).window;
    aDocument = aWindow.document;
  });
  

  it('Registers a shortcut and calls it', async () => {
    const handler = sinon.spy();
    const shortcutService = new sut.ShortcutService({aDocument, hotkeys});
    shortcutService.register('a', handler);
    await shortcutService.init();

    const event = new aWindow.KeyboardEvent("keydown", {key: "a", char: "a", keyCode: 65});
    aDocument.dispatchEvent(event);

    await waitFor(() => handler.called);
    expect(handler.args).toEqual([[]]);
  });

});
