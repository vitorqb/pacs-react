import { AccountFlowFactory } from '../../testUtils';
import { getMonthLabelFromAccountFlow, AccountFlowEvolutionTH } from '../AccountFlowEvolutionTable';


describe('AccountFlowEvolutionTable', () => {

  describe('getMonthLabelFromAccountFlow', () => {

    it('base', () => {
      let period = ['2018-01-01', '2018-01-31'];
      let accountFlow = AccountFlowFactory.build({ period });
      expect(getMonthLabelFromAccountFlow(accountFlow)).toEqual('January/2018');
    });

    it('invalid period', () => {
      let period = ['2018-01-01', '2018-02-01'];
      let accountFlow = AccountFlowFactory.build({ period });
      expect(() => getMonthLabelFromAccountFlow(accountFlow)).toThrow('Can not convert');
    });

  });

  it('AccountFlowEvolutionTH', () => {
    let label = "FOO";
    let index = 2;
    let props = {label, index};
    let component = AccountFlowEvolutionTH(props);
    expect(component.key).toEqual(`${index}`);
    expect(component.props.children).toEqual('FOO');
  });
  
});
