// @flow


import * as React from 'react';
import * as ReactDOM from 'react-dom';
import LazyImage from './LazyImage';

// import Lightbox from 'react-images';

export type GalleryImage = {
	key: string;
	src: string;
	width: number;
	height: number;
	hidden: boolean;
}

const LINES = 'lines';
const SQUARES = 'squares';

const DeleteIcon = ({onClick}) => (
	<div className='delete' onClick={onClick}>
		<i className="fa fa-times" aria-hidden="true"></i>
	</div>
)

const GalleryItem = ({width, height, src, selected, onClick, onDoubleClick, onDeleteIconClick, opacity, alt, showDeleteIcon, square=false}) => {
	let deleteIcon;
	if (showDeleteIcon)
		deleteIcon = <DeleteIcon onClick={onDeleteIconClick}/>
	return (
		<div
			style={{ width, height }}
			className={(selected) ? 'selected' : '' }
			onClick={onClick}
			onDoubleClick={onDoubleClick}
		>
			<LazyImage
				style={{ opacity }}
				className={(square) ? 'square' : '' }
				src={src}
				alt={alt}
			/>
			{deleteIcon}
		</div>
	)
};

export class Gallery extends React.Component {

	state: { containerWidth: number; }
	handleResize: () => void;
	handleClick: () => void;
	handleDoubleClick: () => void;
	handleDeleteIconClick: () => void;

	static defaultProps = {
		// lightboxShowImageCount: false,
		// backdropClosesModal: true,
		// disableLightbox: false,
		showDeleteIcons: false,
		reorder: false,
		rowHeight: 180,
		layout: LINES,
		images: [],
		selection: null,
		onImageClick: null,
		onImageDoubleClick: null,
		onImageDeleteIconClick: null
	}

	// public static propTypes = {
	//   reorder: React.PropTypes.bool,
	//   rowHeight: React.PropTypes.number,
	//   layout: React.PropTypes.oneOf([LINES, SQUARES]),
	//   images: React.PropTypes.array
	// };

	constructor() {
		super();
		this.state = {
			containerWidth: 0,
		};

		this.handleResize = this.handleResize.bind(this);
		// this.closeLightbox = this.closeLightbox.bind(this);
		// this.gotoNext = this.gotoNext.bind(this);
		// this.gotoPrevious = this.gotoPrevious.bind(this);
		// this.openLightbox = this.openLightbox.bind(this);
		this.handleClick = this.handleClick.bind(this);
		this.handleDoubleClick = this.handleDoubleClick.bind(this);
		this.handleDeleteIconClick= this.handleDeleteIconClick.bind(this);
	}
	componentDidMount() {
		this.setState({ containerWidth: Math.floor(ReactDOM.findDOMNode(this).clientWidth) });
		window.addEventListener('resize', this.handleResize);
	}
	componentDidUpdate() {
		if (ReactDOM.findDOMNode(this).clientWidth !== this.state.containerWidth) {
			this.setState({ containerWidth: Math.floor(ReactDOM.findDOMNode(this).clientWidth) });
		}
	}
	componentWillUnmount() {
		window.removeEventListener('resize', this.handleResize, false);
	}
	handleResize() {
		this.setState({ containerWidth: Math.floor(ReactDOM.findDOMNode(this).clientWidth) });
	}
	// openLightbox(index, event) {
	//	 event.preventDefault();
	//	 this.setState({
	//		 currentImage: index,
	//		 lightboxIsOpen: true
	//	 });
	// }
	// closeLightbox() {
	//	 this.setState({
	//		 currentImage: 0,
	//		 lightboxIsOpen: false,
	//	 });
	// }
	// gotoPrevious() {
	//	 this.setState({
	//		 currentImage: this.state.currentImage - 1,
	//	 });
	// }
	// gotoNext() {
	//	 this.setState({
	//		 currentImage: this.state.currentImage + 1,
	//	 });
	// }

	handleClick(image: GalleryImage, e: SyntheticEvent){
		e.stopPropagation();
		if (this.props.onImageClick)
			this.props.onImageClick((image) ? image.key : null);
	}

	handleDoubleClick(image: GalleryImage, e: SyntheticEvent){
		e.stopPropagation();
		if (this.props.onImageDoubleClick)
			this.props.onImageDoubleClick((image) ? image.key : null);
	}

	handleDeleteIconClick(image: GalleryImage, e: SyntheticEvent){
		e.stopPropagation();
		if (this.props.onImageDeleteIconClick)
			this.props.onImageDeleteIconClick((image) ? image.key : null);
	}

	renderLines() {
		var maxWidth: number = this.state.containerWidth - 2;
		var rowWidth: number = 0;
		var rowHeight: number = this.props.rowHeight || 100;
		var items = [];
		var row = [];
		var ratio = 1;
		//var numRows = 0;
		var margin = 8 * 2;

		for (var i = 0; i < this.props.images.length; i++) {
			if (this.props.images[i].hidden)
				continue;

			row.push(this.props.images[i]);
			var nWidth = this.props.images[i].width * (rowHeight / this.props.images[i].height);
			rowWidth += nWidth + margin;

			if (rowWidth >= maxWidth) {
				var marginsInRow = row.length * margin;
				ratio = (maxWidth - marginsInRow) / (rowWidth - marginsInRow);
				var _rowHeight = Math.ceil(rowHeight * ratio);
				var exactWidth = 0;
				for (var x = 0; x < row.length; x++) {
					var image = row[x];
					let nWidth = image.width * (rowHeight / image.height);

					var _width = Math.ceil(nWidth * ratio);
					exactWidth += _width + margin;
					if (exactWidth > maxWidth) _width -= exactWidth - maxWidth;

					items.push(<GalleryItem
						width={_width}
						height={_rowHeight}
						src={image.src}
						key={image.key}
						selected={image.key == this.props.selection}
						onClick={this.handleClick.bind(this, image)}
						onDoubleClick={this.handleDoubleClick.bind(this, image)}
						onDeleteIconClick={this.handleDeleteIconClick.bind(this, image)}
						alt={image.key}
						showDeleteIcon={this.props.showDeleteIcons}
						opacity='1'
					/>);
				}

				// reset for next row
				row = [];
				rowWidth = 0;
				//numRows++;
			}
		}

		for (let x = 0; x < row.length; x++) {
			let image = row[x];
			//console.log(rowHeight, image.height, ratio)
			let nWidth = image.width * (rowHeight / image.height);

			items.push(<GalleryItem
				width={Math.floor(nWidth * ratio)}
				height={Math.floor(rowHeight * ratio)}
				src={image.src}
				key={image.key}
				selected={image.key == this.props.selection}
				onClick={this.handleClick.bind(this, image)}
				onDoubleClick={this.handleDoubleClick.bind(this, image)}
				onDeleteIconClick={this.handleDeleteIconClick.bind(this, image)}
				alt={image.key}
				showDeleteIcon={this.props.showDeleteIcons}
				opacity='1'
			/>);
		}


		return (
			<div className='gallery'>
				{items}
			</div>
		);
	}

	renderSquares() {
		var items = this.props.images.map((image) => (
			<GalleryItem
				width={this.props.rowHeight}
				height={this.props.rowHeight}
				src={image.src}
				key={image.key}
				selected={image.key == this.props.selection}
				onClick={this.handleClick.bind(this, image)}
				onDoubleClick={ this.handleDoubleClick.bind(this, image)}
				onDeleteIconClick={this.handleDeleteIconClick.bind(this, image)}
				opacity={(image.hidden) ? '0.2' : '1'}
				alt={image.key}
				showDeleteIcon={this.props.showDeleteIcons}
				square={true}
			/>)
		);


//					<img src={image.src} style={{ opacity: , width: '100%', height: '100%', objectFit: 'contain' }} alt='' />

		return (
			<div className='gallery'
				onClick={this.handleClick.bind(this, null)}
			>
				{items}
			</div>
		);
	}

	render() {
		switch (this.props.layout) {
		case SQUARES:
			return this.renderSquares();
		default:
			return this.renderLines();
		}
	}
}
