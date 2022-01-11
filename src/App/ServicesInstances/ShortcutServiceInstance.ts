import { ShortcutService, newKey } from '../../services/ShortcutService.ts';
import * as Actions from '../../domain/Actions';
import * as HydraMenu from '../../components/HydraMenu/HydraMenu';

export const _ShortcutServiceInstance = ({aWindow}) => ({actionDispatcher}) => {
  const shortcutService = new ShortcutService({aDocument: aWindow.document});;

  shortcutService.register({
    key: newKey('J', {shift: true, alt: true}),
    handler: () => {
      const action = Actions.newAction(HydraMenu.ACTIONS.TOGGLE_VISIBILITY);
      actionDispatcher.dispatch(action);
    }})

  shortcutService.init();

  return shortcutService;
};

export default _ShortcutServiceInstance({aWindow: window});
