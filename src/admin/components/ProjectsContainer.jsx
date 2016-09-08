// @flow

import * as React from 'react';
import ProjectItem from './ProjectItem';

const IconButton = ({icon, onClick}) => {
	return (
		<button className="icon-button">
			<i className={ 'fa ' + icon } onClick={onClick} aria-hidden="true" />
		</button>
	)
}

class ProjectsContainer extends React.Component{

	static propTypes = {
		title: React.PropTypes.string,
		selection: React.PropTypes.string,
		images: React.PropTypes.array,
		onProjectImageDrop: React.PropTypes.func,
		onProjectDeleteClick: React.PropTypes.func,
	}

	render() {
		let items = this.props.projects.map(p => (<ProjectItem
			key={p.path}
			path={p.path}
			title={p.title || p.path}
			visible={p.visible}
			locked={p.locked}
			selected={p.path == this.props.selection}
			onClick={(e) => {
				e.stopPropagation();
				this.props.onProjectClick(p.path);
			}}
			onDeleteIconClick={(e) => {
				e.stopPropagation();
				this.props.onProjectDeleteClick(p.path);
			}}
			onImageDrop={(e) => {
				e.sourcePath = e.path;
				e.destPath = p.path;
				this.props.onProjectImageDrop(e);
			}}
		/>));

		items.sort((a, b): number => {
			//console.log(a)
			if (a.props.path == '_vault') return -1;
			if (b.props.path == '_vault') return 1;
			return a.props.title > b.props.title ? 1 : -1;
		});

		// if (this.props.editMode === true)
		// 	items.unshift(<NewProjectItem key="+" onClick={() => {window.location='/projects/new';}}/>);

		return (
			<div className="projects-container">
				Projects <IconButton icon="fa-plus" onClick={this.props.onCreateProjectClick} />
				{items}
			</div>
		);
	}
}

export default ProjectsContainer;
