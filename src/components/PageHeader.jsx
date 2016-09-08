import * as React from 'react';
import { Link } from 'react-router';

const PageHeader = () => (
	<div className="header">
		<Link to='/'>
			<img src="img/header.png"/>
		</Link>
	</div>
)

export default PageHeader;
