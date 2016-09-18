import * as React from 'react';
import PageHeader from '../components/PageHeader';
import { Link } from 'react-router';

export const NavBar = (props) =>  {
	return (
		<ul className="nav-bar">
			<PageHeader />
			{props.children}
		</ul>
	);
};

export const NavItem = ({text, url}) =>  {
	return (
		<li className="nav-item">
			<a href={url}>{text}</a>
		</li>
	);
};
