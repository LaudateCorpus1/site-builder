// @flow

import * as React from 'react';
import { DragSource } from 'react-dnd';
import LazyImage from '../../components/LazyImage';

const imageItemSource = {
  beginDrag(props) {
    return {
		path: props.path,
		url: props.url
	};
  }
};

function collect(connect, monitor) {
  return {
    connectDragSource: connect.dragSource(),
    isDragging: monitor.isDragging()
  }
}


const DeleteIcon = ({onClick}) => (
	<div className='delete' onClick={onClick}>
		<i className="fa fa-times" aria-hidden="true"></i>
	</div>
)

class ImageItem extends React.Component {

	render() {
		let {path, fullUrl, url, title, selected, loading, visible,
			onClick, onDeleteIconClick,
			connectDragSource, isDragging} = this.props;
		let deleteIcon;

		deleteIcon = <DeleteIcon onClick={onDeleteIconClick} />;

		let className = "image-item" + (selected ? ' selected' : '');
		if (isDragging)
			className += ' dragging';
		if (visible == false)
			className += ' hidden';

		let loadingIcon = <div className='loading'>
			<i className="fa fa-circle-o-notch fa-3x fa-spin" aria-hidden="true" />
		</div>

		if (loading)
			return (
				<div className="image-item">
					{loadingIcon}
				</div>
			)
		else
			return connectDragSource(
				<div
					className={className}
					onClick={onClick}
				>
					<LazyImage src={fullUrl} alt={url}/>
					{deleteIcon}
				</div>
			)
	}
}

export default DragSource('imageItem', imageItemSource, collect)(ImageItem);
