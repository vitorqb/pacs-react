

export class NavigationService {

  constructor({navigateFn}) {
    this._navigateFn = navigateFn;
    this.navigateTo = this.navigateTo.bind(this);
  }

  navigateTo(path) {
    this._navigateFn(path);
  }

}
