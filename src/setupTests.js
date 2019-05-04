import { configure } from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';

require("../node_modules/jest-enzyme/lib/index.js");
configure({ adapter: new Adapter() });
