// @flow weak

import * as React from 'react';
import PageHeader from '../../components/PageHeader';

const SideBar = ({children}) => {
	return (
		<div className="sidebar">
			<PageHeader />
			{children}
		</div>
	)
}


export default SideBar;
