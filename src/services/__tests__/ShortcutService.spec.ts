import jsdom, { DOMWindow } from 'jsdom';
import * as sut from '../ShortcutService';
import sinon from 'sinon';
import { waitFor } from '../../testUtils.jsx';

describe('newKey', () => {
  it.each([
    [
      'a',
      {},
      {key: "a", shift: false, ctrl: false, alt: false, caseSensitive: true}
    ],
    [
      'A',
      {},
      {key: "A", shift: false, ctrl: false, alt: false, caseSensitive: true}
    ],
    [
      'a',
      {shift: true},
      {key: "a", shift: true, ctrl: false, alt: false, caseSensitive: true}
    ],
    [
      'a',
      {ctrl: true},
      {key: "a", shift: false, ctrl: true, alt: false, caseSensitive: true}
    ],
    [
      'a',
      {alt: true},
      {key: "a", shift: false, ctrl: false, alt: true, caseSensitive: true}
    ],
    [
      'a',
      {caseSensitive: false},
      {key: "a", shift: false, ctrl: false, alt: false, caseSensitive: false}
    ],
    [
      'a',
      {shift: true, ctrl: true, alt: true, caseSensitive: true},
      {key: "a", shift: true, ctrl: true, alt: true, caseSensitive: true},
    ],
  ])('newKey works for %s and %s', (key, opts, expKey) => {
    expect(sut.newKey(key, opts)).toEqual(expKey);
  });
})



describe('ShortcutService', () => {

  let aDocument: Document, aWindow: DOMWindow;

  beforeEach(() => {
    aWindow = (new jsdom.JSDOM()).window;
    aDocument = aWindow.document;
  });

  it('Registers a shortcut and calls it', async () => {
    const handler = sinon.spy();
    const shortcutService = new sut.ShortcutService({aDocument});
    const key = sut.newKey('a');
    shortcutService.register({key, handler});
    await shortcutService.init();
    const event = new aWindow.KeyboardEvent("keydown", {key: "a", keyCode: 65});
    aDocument.dispatchEvent(event);
    await waitFor(() => handler.called);
    expect(handler.args).toEqual([[]]);
  })

  it('Registers a shortcut with shift and crtl and calls it', async () => {
    const handler = sinon.spy();
    const shortcutService = new sut.ShortcutService({aDocument});
    const key = sut.newKey('a', {shift: true, ctrl: true});
    shortcutService.register({key, handler});
    await shortcutService.init();
    const ignoredEvent = new aWindow.KeyboardEvent("keydown", {key: "a", keyCode: 65});
    aDocument.dispatchEvent(ignoredEvent);
    const reactiveEvent = new aWindow.KeyboardEvent("keydown", {
      key: "a",
      keyCode: 65,
      shiftKey: true,
      ctrlKey: true,
    });
    aDocument.dispatchEvent(reactiveEvent);
    await waitFor(() => handler.called);    
    expect(handler.args).toEqual([[]]);
  });

});
