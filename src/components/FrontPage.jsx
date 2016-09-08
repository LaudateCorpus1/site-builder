import * as React from 'react';
//import * as ReactDOM from 'react-dom';
import GalleriesContainer from '../containers/GalleriesContainer';
//import { getGallery } from '../api/galleryApi';

class FrontPage extends React.Component {

	constructor(props){
		super(props);
		this.handleImageClick = this.handleImageClick.bind(this);
	}

	handleImageClick(path){
		window.location = path;
	}

	render() {
		return (
			<div>
				<h1>Home</h1>
				<GalleriesContainer
					layout="lines"
					rowHeight={260}
					onImageClick={this.handleImageClick}
				/>
			</div>
		);
	}
}

export default FrontPage;
