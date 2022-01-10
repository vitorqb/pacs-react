import * as R from 'ramda';

export type TActiveComponentInstance = {
  name: string
}

/**
 * A service responsible for controlling the global application context.
 */
export class AppContextService {

  _active_components: TActiveComponentInstance[]

  constructor() {
    this._active_components = [];
  }

  pushActiveComponentInstance(activeComponentInstance: TActiveComponentInstance) {
    this._active_components.push(activeComponentInstance);
  }

  getTopActiveComponentInstance(): TActiveComponentInstance {
    return R.last(this._active_components);
  }

  filterOutActiveComponentInstance(activeComponentInstance: TActiveComponentInstance) {
    this._active_components = R.reject(R.equals(activeComponentInstance), this._active_components);
  }

}
