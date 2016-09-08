// @flow

import * as React from 'react';
import { DropTarget } from 'react-dnd';

const projectItemTarget = {
	canDrop(props, monitor) {
		return monitor.getItem().path != props.path;
	},

	drop(props, monitor) {
		props.onImageDrop(monitor.getItem());
	}
};

function collect(connect, monitor) {
  return {
    connectDropTarget: connect.dropTarget(),
    isOver: monitor.isOver(),
    canDrop: monitor.canDrop()
  };
}

const DeleteIcon = ({onClick}) => (
	<div className='delete' onClick={onClick}>
		<i className="fa fa-times" aria-hidden="true" />
	</div>
)

const ProjectItem = ({path, title, visible, selected, locked, onClick, onDeleteIconClick,
	onImageDrop,
	connectDropTarget, isOver, canDrop}) => {

	let className = "project-item" + (selected ? ' selected' : '');
	if (isOver && canDrop)
		className += ' over';

	let _title = title;
	if (visible == false)
		className += ' hidden';

	let _lock = <i className="fa fa-folder" aria-hidden="true" />;
	if (selected)
		_lock = <i className="fa fa-folder-open" aria-hidden="true" />

	let _delete;
	if (locked){
		_lock = <i className="fa fa-inbox" aria-hidden="true" />
	}
	else
		_delete = <DeleteIcon onClick={onDeleteIconClick} />
	_title = ' ' + title;

	return connectDropTarget(
		<div className={className} onClick={onClick}>
			{_lock}
			{_title}
			{_delete}
		</div>
	)
}

export default DropTarget('imageItem', projectItemTarget, collect)(ProjectItem);
