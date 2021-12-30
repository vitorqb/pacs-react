import { configure } from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';

global.TextEncoder = require("util").TextEncoder;
global.TextDecoder = require("util").TextDecoder;

require("../node_modules/jest-enzyme/lib/index.js");
configure({ adapter: new Adapter() });
