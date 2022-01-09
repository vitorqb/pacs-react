export type TActiveComponentInstance = {
  name: string
}

/**
 * A service responsible for controlling the global application context.
 */
export class AppContextService {

  _active_component_instance: TActiveComponentInstance

  constructor() {
    this._active_component_instance = null;
  }

  setActiveComponentInstance(activeComponentInstance: TActiveComponentInstance) {
    this._active_component_instance = activeComponentInstance;
  }

  getActiveComponentInstance(): TActiveComponentInstance {
    return this._active_component_instance;
  }

}
