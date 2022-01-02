

export class NavigationService {

  constructor({navigateFn}) {
    this._navigateFn = navigateFn;
  }

  navigateTo(path) {
    this._navigateFn(path);
  }

}
