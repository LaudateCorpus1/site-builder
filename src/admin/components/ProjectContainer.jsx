// @flow

import * as React from 'react';
import ImageItem from './ImageItem';

const getFilenameBase = (f) => f.substr(0, f.lastIndexOf('.'));
const getFilenameExtension = (f) => f.substr(f.lastIndexOf('.') + 1);


const NewProjectItem = ({onClick}) => (
<div className="new-project" onClick={onClick}>
	<div>
		<i className="fa fa-plus fa-3x" aria-hidden="true" />
		<br />
		New Project
	</div>
</div>
)

class ProjectContainer extends React.Component{

	static propTypes = {
		project: React.PropTypes.object,
		selection: React.PropTypes.string,
		onImageClick: React.PropTypes.func,
		onImageDoubleClick: React.PropTypes.func,
		onImageDeleteIconClick: React.PropTypes.func,
	}

	getSortedImages(){
		if (this.props.project) {
			let images = this.props.project.images.slice(0);
			switch (this.props.project.sortBy) {
				case 'FILENAME':
					images.sort((a, b): number => (a.url > b.url) ? 1 : -1);
					break;
				case 'TYPE':
					images.sort((a, b): number =>
						(getFilenameExtension(a.url) > getFilenameExtension(b.url)) ? 1 : -1
					);
					break;
				case 'TITLE':
					images.sort((a, b): number => (a.title > b.title) ? 1 : -1);
					break;
				case 'DIMENSIONS':
					images.sort((a, b): number => a.width * a.height - b.width * b.height);
					break;
				case 'DATE':
					images.sort((a, b): number => (a.date > b.date) ? 1 : -1);
					break;
			}
			if (this.props.project.sortOrder == 'DESCENDING')
				images.reverse();
			return images;
		}
		else
			return [];
	}

	render() {
		let sortedImages = this.getSortedImages();
		let items = sortedImages.map(p => (<ImageItem
			key={p.url}
			path={this.props.project.path}
			url={p.url}
			fullUrl={'content/projects/' + this.props.project.path + '/thumb/' + p.url}
			title={p.title || p.url}
			visible={p.visible}
			selected={this.props.selection.includes(p.url)}
			loading={p.loading}
			onClick={(e) => {
				e.stopPropagation();
				this.props.onImageClick(p.url, e);
			}}
			onDeleteIconClick={(e) => {
				e.stopPropagation();
				this.props.onImageDeleteClick(p.url);
			}}
		/>));

		// if (this.props.editMode === true)
		// 	items.unshift(<NewProjectItem key="+" onClick={() => {window.location='/projects/new';}}/>);

		return (
			<div className="project-container"
				onClick={(e) => {
					e.stopPropagation();
					this.props.onImageClick(null, e);
				}}
			>
				{items}
			</div>
		);
	}
}

export default ProjectContainer;
