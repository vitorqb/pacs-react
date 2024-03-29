import 'bootstrap/dist/css/bootstrap.min.css';
import 'react-table/react-table.css';
import 'react-treeview/react-treeview.css';
import './css/App.scss';
import './css/index.css';
import './css/_components.scss';
import React from 'react';
import ReactDOM from 'react-dom';
import App from './App';
import * as serviceWorker from './serviceWorker';

// !!!! TODO => How will this work on prod?
import secrets from "./secrets.json";

ReactDOM.render(<App secrets={secrets} />, document.getElementById('root'));

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: http://bit.ly/CRA-PWA
serviceWorker.unregister();
