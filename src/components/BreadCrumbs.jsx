

import * as React from 'react';
import { browserHistory, Router, Route, Link } from 'react-router'

const BreadCrumbs = ({routes}) => {
	const depth = routes.length;
	return (
		<ul className="breadcrumbs">
			{routes.map((item, index) =>
				<li key={index}>
					<Link
						onlyActiveOnIndex={true}
						activeClassName="breadcrumb-active"
						to={item.path || ''}>
						{'ble'}
					</Link>
					{(index + 1) < depth && '\u2192'}
				</li>
			)}
        </ul>	)
}

export default BreadCrumbs;
