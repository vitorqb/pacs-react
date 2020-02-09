import * as R from 'ramda';
import { parseInputMsg, inputMsgFileLens, reducers, valueLens, Status } from '../FilePicker';
import sinon from 'sinon';

describe('FilePicker', () => {

  let sandbox;
  beforeEach(() => { sandbox = sinon.createSandbox(); });
  afterEach(() => { sandbox.restore(); });

  describe('parseInputMsg', () => {

    it('Success', async () => {
      const msg = R.set(inputMsgFileLens, new File(['[1, 2]'], 'foo.json'), {});
      const result = await parseInputMsg(msg);
      expect(result).toEqual('[1, 2]');
    });

  });

  describe('reducers', () => {

    describe('onFileChange', () => {

      it('base', () => {
        const file = new File(['foo'], 'bar');
        const msg = R.set(inputMsgFileLens, file, {});
        const result = reducers.onFileChange(msg, {});
        expect(result).toEqual(R.pipe(
          R.set(valueLens.status, Status.Loading),
          R.set(valueLens.file, file),
          R.set(valueLens.contents, null),
        )({}));
      });

      it('to null', () => {
        const msg = R.set(inputMsgFileLens, null, {});
        const result = reducers.onFileChange(msg, {});
        expect(result).toEqual(R.pipe(
          R.set(valueLens.status, Status.Idle),
          R.set(valueLens.file, null),
          R.set(valueLens.contents, null),
        )({}));
      });

    });

    describe('onParsedInputMsg', () => {

      it('Base', () => {
        const contents = "contents!";
        const result = reducers.onParsedInputMsg(contents, {});
        expect(result).toEqual(R.pipe(
          R.set(valueLens.status, Status.Idle),
          R.set(valueLens.contents, contents),
        )({}));
      });
      
    });
    
  });
  
});
