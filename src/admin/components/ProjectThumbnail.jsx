// @flow

import * as React from 'react';
import { DropTarget } from 'react-dnd';
import LazyImage from '../../components/LazyImage';

const DeleteIcon = ({onClick}) => (
	<div className='delete' onClick={onClick}>
		<i className="fa fa-times" aria-hidden="true"></i>
	</div>
)

const projectThumbnailTarget = {
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

class ProjectThumbnail extends React.Component {

	state: {
		x: number,
		y: number,
		scale: number
	}

	handleMouseMove: (e: any) => void;
	handleMouseDown: (e: any) => void;
	handleMouseUp: (e: any) => void;
	_main: any;
	_originX: number;
	_originY: number;
	_oldState: any;

	constructor(props) {
		super(props);

		this._originX = 0;
		this._originY = 0;
		this.state = { x:0, y:0, scale:1 }
		this.handleMouseDown = this.handleMouseDown.bind(this);
		this.handleMouseMove = this.handleMouseMove.bind(this);
		this.handleMouseUp = this.handleMouseUp.bind(this);
	}

	validateTransform(x, y, scale, width, height) {
		let ratio = height / width;

		scale = Math.min(10, Math.max(scale, Math.max(1, 1 / ratio)));

		let minX = 1 - scale;
		let minY = 1 - scale * ratio;

		return {
			scale: scale,
			x: Math.min(0, Math.max(x, minX)),
			y: Math.min(0, Math.max(y, minY))
		}
	}

	componentWillReceiveProps(nextProps: any) {
		//console.log(nextProps);
		this.setState(this.validateTransform(
			nextProps.x, nextProps.y, nextProps.scale, nextProps.width, nextProps.height)
		);
	}

	handleMouseDown(e) {
		if (e.buttons == 1 || e.buttons == 2) {
			//let r = this._main.getBoundingClientRect();
			this._originX = e.clientX;
			this._originY = e.clientY;
			this._oldState = Object.assign({}, this.state);
			//this.setState({ x: e.clientX - r.left, y: e.clientY - r.top});
			//e.persist();
			//console.log(e);
		}
		e.preventDefault();
	}

	handleMouseMove(e) {
		if (e.buttons == 1 && this._oldState) {
			let r = this._main.getBoundingClientRect();
			let w = r.right - r.left;
			let h = r.bottom - r.top;

			let scale = this.state.scale;
			let x = this._oldState.x;
			let y =	this._oldState.y;

			if (e.shiftKey) {
				scale = this._oldState.scale - (e.clientY - this._originY) / 100;
				x = this._oldState.x - (scale - this._oldState.scale ) / 2;
				y =	this._oldState.y - (scale - this._oldState.scale ) / 2;
			}
			else {
				x = this._oldState.x + (e.clientX - this._originX) / w;
				y =	this._oldState.y + (e.clientY - this._originY) / h;
			}

			this.setState(this.validateTransform(x, y, scale, this.props.width, this.props.height));
		}
		e.preventDefault();
	}

	handleMouseUp(e) {
		this._oldState = null;
		this.props.onThumbTransform(this.state);
		e.preventDefault();
	}

	render() {
		let {fullUrl, width, height, onImageDrop, connectDropTarget, isOver, canDrop} = this.props;

		let className = "project-thumbnail";
		if (isOver && canDrop)
		className += ' over';

		if (!fullUrl || !width || !height) {
			return connectDropTarget(
				<div className={className}>
					<div className="empty">Drag image here to set project thumbnail.</div>
				</div>
			)
		}

		let ratio = height / width;

		let imgStyle = {
			marginLeft: (this.state.x * 100) + '%',
			marginTop: (this.state.y * 100) + '%',
			width: (this.state.scale * 100) + '%',
			height: (this.state.scale * 100 * ratio) + '%',
		}

		return connectDropTarget(
			<div
				ref={(c) => this._main = c}
				className={className}
				onMouseDown={this.handleMouseDown}
				onMouseMove={this.handleMouseMove}
				onMouseUp={this.handleMouseUp}
			>
				<LazyImage
					style={imgStyle}
					src={fullUrl}
					alt='Drag image here to set project thumbnail.'
				/>
				<DeleteIcon
					onClick={() => this.props.onImageDrop({
						path: null, url: null
					})}
				/>
			</div>
		)
	}
}

export default DropTarget('imageItem', projectThumbnailTarget, collect)(ProjectThumbnail);
