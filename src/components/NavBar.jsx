import * as React from 'react';

export const NavBar = (props) =>  {
	return (
		<ul className="nav-bar">
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
