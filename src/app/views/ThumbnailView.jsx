// @flow

import * as React from 'react';
import * as settings from '../settings.js';

// import SideBar from '../components/SideBar';
// import ProjectsContainer from '../components/ProjectsContainer';
// import Edit from '../../components/Edit';

import LazyImage from '../../components/LazyImage';


const Thumbnail = ({path, url, title, thumb, icon}) => {

	// let ratio = height / width;
	//
	// let imgStyle = {
	// 	marginLeft: (thumbX * 100) + '%',
	// 	marginTop: (thumbY * 100) + '%',
	// 	width: (thumbScale * 100) + '%',
	// 	height: (thumbScale * 100 * ratio) + '%',
	// }
	if (!path.endsWith('/'))
		path = path + '/';

	let _thumb = <i className={"fa fa-" + icon + " fa-3x"} aria-hidden="true" />;

	if (thumb)
		_thumb = <LazyImage src={'content' + settings.CONTENT_ROOT + '/'
		+ path + thumb} />

	return (
		<a href={url}>
			<div className="thumbnail">
				{_thumb}
				<div className="overlay">
					<div className="title">
						{title}
					</div>
				</div>
			</div>
		</a>
	)
}

type ThumbnailArgs = {path: string, dirs:any[], files:any[]}
const ThumbnailView = ({path, dirs, files}: ThumbnailArgs) => {
	if (path)
		path += '/';
	let _dirs = dirs.map(d => <Thumbnail
		path={path + d.name}
		url={path + d.name}
		title={d.title || d.name}
		thumb={d.thumb}
		icon={d.icon || 'folder'}
	/>);
	let _files = files.map(d => <Thumbnail
		path={path}
		url={'content/' + path + d.name}
		title={d.title || d.name}
		thumb={d.thumb}
		icon={d.icon || 'file'}
	/>);
	let _back = (path) ? <Thumbnail title='..' path={path} url={path + '..'} icon='level-up'/> : null;
	return (
		<div className="thumbnail-view">
			{_back}
			{_dirs}
			{_files}
		</div>
	)
}

export default ThumbnailView;
