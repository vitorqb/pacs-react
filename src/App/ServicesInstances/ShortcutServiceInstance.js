import { ShortcutService } from '../../services/ShortcutService';
import hotkeys from 'hotkeys-js';
import * as Actions from '../../domain/Actions';
import * as HydraMenu from '../../components/HydraMenu/HydraMenu';

export const _ShortcutServiceInstance = ({aWindow, aHotkeys}) => ({actionDispatcher}) => {
  const shortcutService = new ShortcutService({aDocument: aWindow.document, aHotkeys});;

  shortcutService.register('shift+alt+j', () => {
    const action = Actions.newAction(HydraMenu.ACTIONS.TOGGLE_VISIBILITY);
    actionDispatcher.dispatch(action);
  });

  shortcutService.init();

  return shortcutService;
};

export default _ShortcutServiceInstance({aWindow: window, aHotkeys: hotkeys});
