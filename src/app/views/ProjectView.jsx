// @flow weak

import * as React from 'react';
import * as settings from '../settings.js';
import {Gallery} from '../../components/Gallery';
import { Link, browserHistory } from 'react-router';

const ProjectView = ({path, dirs, files, prev, next}) => {
	if (path)
		path += '/';

	let backLink;
	if (path)
		backLink = <a href={ path + '..' }>
			<div className="nav-icon close">
				<i className="fa fa-times fa-2x" aria-hidden="true" />
			</div>
		</a>;

	let prevLink;
	if (path && prev)
		prevLink = <a href={ prev }>
			<div className="nav-icon prev">
				<i className="fa fa-chevron-left fa-2x" aria-hidden="true" />
			</div>
		</a>;

	let nextLink;
	if (path && next)
		nextLink = <a href={ next }>
			<div className="nav-icon next">
				<i className="fa fa-chevron-right fa-2x" aria-hidden="true" />
			</div>
		</a>;

	let images = files.map(f => ({
		src: 'content' + settings.CONTENT_ROOT + '/' + path + '/' + f.name,
		key: f.name,
		width: f.width || 100,
		height: f.height || 100,
		hidden: false
	}));

	return (
		<div className="project-view">
			<Gallery
				//selection={this.props.selection}
				// onImageClick={this.props.onImageClick}
				// onImageDoubleClick={this.props.onImageDoubleClick}
				layout="lines"
				rowHeight={640}
				title=''
				images={images}
			/>
			{prevLink}
			{nextLink}
			{backLink}
		</div>
	)
}

export default ProjectView;
