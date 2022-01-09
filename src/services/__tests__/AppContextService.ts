import * as sut from '../AppContextService';

describe('AppContextService', () => {

  it('Set and get active component instance', () => {
    const appContextService = new sut.AppContextService();
    const activeComponentInstance = {name: "Foo"};
    appContextService.setActiveComponentInstance(activeComponentInstance);
    expect(appContextService.getActiveComponentInstance()).toBe(activeComponentInstance);
  })

})
