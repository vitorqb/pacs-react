import * as RU from '../../../ramda-utils';
import * as sut from '../Validation';
import Monet, { Success, Fail } from 'monet';
import secretsLens from '../Lens';

describe('validateSecrets', () => {

  it('Valid', () => {
    const secrets = RU.setLenses(
      [[secretsLens.token, "FOOBARBAZ"],
       [secretsLens.host, "http://127.0.0.1"]],
      {},
    );
    expect(sut.validateSecrets(secrets).success()).toEqual(secrets);
  });
  
  it('Missing token', () => {
    const secrets = RU.setLenses(
      [[secretsLens.host, "http://127.0.0.1"]],
      {},
    );
    expect(sut.validateSecrets(secrets).fail()).toEqual(["Missing token"]);    
  });
  
  it('Missing host', () => {
    const secrets = RU.setLenses(
      [[secretsLens.token, "FOOBARBAZ"]],
      {},
    );
    expect(sut.validateSecrets(secrets).fail()).toEqual(["Missing host"]);        
  });
  
});
