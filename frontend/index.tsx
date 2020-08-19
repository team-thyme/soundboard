import * as React from 'react';
import * as ReactDOM from 'react-dom';
import App from "./components/App";

// Initialize FontAwesome icons
import { library } from '@fortawesome/fontawesome-svg-core';
import { faTimes } from '@fortawesome/free-solid-svg-icons';
library.add(faTimes);

const container = document.getElementById('root');
ReactDOM.render(<App/>, container);
