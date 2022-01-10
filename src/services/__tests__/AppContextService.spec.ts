import * as sut from '../AppContextService';

describe('AppContextService', () => {

  it('Set and get active component instance', () => {
    const appContextService = new sut.AppContextService();
    const activeComponentInstance = {name: "Foo"};
    appContextService.pushActiveComponentInstance(activeComponentInstance);
    expect(appContextService.getTopActiveComponentInstance()).toBe(activeComponentInstance);
    appContextService.filterOutActiveComponentInstance(activeComponentInstance);
    expect(appContextService.getTopActiveComponentInstance()).toBe(undefined);
  })

})
