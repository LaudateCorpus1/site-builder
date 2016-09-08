// @flow

import * as React from 'react';
import {render} from 'react-dom';
import App from './App';
import {Router, Route, IndexRoute, browserHistory} from 'react-router';
import { createHistory, useBasename } from 'history'

const history = useBasename(createHistory)({
	basename: document.getElementsByTagName('base')[0].getAttribute('href')
})


render(
	<Router history={history}>
		<Route path="*" component={App}/>
	</Router>, document.getElementById('root')
);
