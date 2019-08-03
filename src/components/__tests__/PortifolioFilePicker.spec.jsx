import React from 'react';
import sinon from 'sinon';
import * as R from 'ramda';
import PortifolioFilePicker, { valueLens, reducers } from '../PortifolioFilePicker';
import { mount } from 'enzyme';


const mountPortifolioFilePicker = ({value, onChange}) => {
  return mount(<PortifolioFilePicker value={value} onChange={onChange} />);
};

const findFilePicker = c => c.find("FilePicker");

describe('PortifolioFilePicker', () => {

  let sandbox;
  beforeEach(() => { sandbox = sinon.createSandbox(); });
  afterEach(() => { sandbox.restore(); });
  
  it('Stores value changes from FilePicker', () => {
    const value = {foo: "bar"};
    let onChange = sinon.fake();
    let component = mountPortifolioFilePicker({onChange, value});
    let filePicker = findFilePicker(component);

    // Simulates a FilePicker change
    const payload = {file: {name: "foo.txt"}};
    filePicker.props().onChange(payload);

    // The higher onChange must have been called with a reducer that, when called,
    // stores the changes on the lens.
    expect(onChange.args.length).toEqual(1);
    expect(onChange.args[0].length).toEqual(1);
    const reducer = onChange.args[0][0];
    const reducedValue = R.pipe(reducer, R.view(valueLens.filePickerValue))(value);
    expect(reducedValue).toEqual(payload);
  });

  describe('reducers', () => {

    describe('updateContents', () => {

      it('Success', () => {
        const value = R.set(valueLens.contents, "[1, 2]", {});
        const result = reducers.updateContents(value);

        expect(R.view(valueLens.error, result)).toEqual(null);
        expect(R.view(valueLens.portifolio, result)).toEqual([1, 2]);
      });

      it('Error', () => {
        const value = R.set(valueLens.contents, "foo", {});
        const result = reducers.updateContents(value);

        expect(R.view(valueLens.error, result)).toEqual("Invalid json!");
        expect(R.view(valueLens.portifolio, result)).toEqual(null);
      });

      it('Empty', () => {
        const value = R.pipe(
          R.set(valueLens.contents, null),
          R.set(valueLens.error, "foo"),
          R.set(valueLens.portifolio, "bar"),
        )({});
        const result = reducers.updateContents(value);

        expect(R.view(valueLens.error, result)).toEqual(null);
        expect(R.view(valueLens.portifolio, result)).toEqual(null);
      });
      
    });
    
  });
  
});
