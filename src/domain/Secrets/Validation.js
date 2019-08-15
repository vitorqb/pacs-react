import * as R from 'ramda';
import { Success, Fail } from 'monet';
import secretsLens from './Lens';

export const validateSecrets = secrets => {
  const hasToken = R.isNil(R.view(secretsLens.token, secrets))
        ? Fail(["Missing token"])
        : Success(secrets);
  const hasHost = R.isNil(R.view(secretsLens.host, secrets))
        ? Fail(["Missing host"])
        : Success(secrets);;
  return R.pipe(
    R.reduce((acc, v) => v.ap(acc).acc(), Success(secrets).acc()),
    R.map(_ => secrets),
  )([hasToken, hasHost]);
};
