import { ShortcutService } from '../../services/ShortcutService';
import hotkeys from 'hotkeys-js';

export default function() {
  const shortcutService = new ShortcutService({aDocument: window.document, aHotkeys: hotkeys});;

  // shortcutService.register('shift+alt+j', () => alert('Foo'));

  shortcutService.init();

  return shortcutService;
}
