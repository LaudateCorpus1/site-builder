// @flow

import * as React from 'react';
// import SideBar from '../components/SideBar';
// import ProjectsContainer from '../components/ProjectsContainer';
// import Edit from '../../components/Edit';

const Dir = ({path, url, icon}) => {
	icon = icon || 'folder';
	return (
		<a href={url}>
			<li>
				<i className={"fa fa-" + icon} aria-hidden="true" />{ ' ' + path}
			</li>
		</a>
	)
}

const File = ({path, url}) => {
	let ext = path.split('.').pop();
	let icon;
	switch (ext) {
		case 'jpg':
		case 'gif':
		case 'png':
			icon = 'file-image-o';
			break;
		case 'js':
		case 'html':
			icon = 'file-code';
			break;
		case 'txt':
		case 'json':
			icon = 'file-text';
			break;
		default:
			icon = 'file';
	}
	return (
		<a href={url}>
			<li>
				<i className={"fa fa-" + icon} aria-hidden="true" /> {' ' + path}
			</li>
		</a>
	)
}

const DefaultView = ({path, dirs, files}) => {
	if (path)
		path += '/';
	let _dirs = dirs.map(d => <Dir path={d.title || d.name} url={path + d.name} icon={d.icon}/>);
	let _files = files.map(d => <File path={d.title || d.name} url={'content/' + path + d.name}/>);
	let _back = (path) ? <Dir path='..' url={path + '..'} /> : null;
	return (
		<ul className="defaultView">
			{_back}
			{_dirs}
			{_files}
		</ul>
	)
}

export default DefaultView;
