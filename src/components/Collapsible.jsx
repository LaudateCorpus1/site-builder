import * as React from 'react';
// import GalleryContainer from '../containers/GalleryContainer';
// import DropContainer from '../containers/DropContainer';
// import AdminMenu from '../components/AdminMenu';
// import { getGallery } from '../api/galleryApi';
// import { getGalleries } from '../api/galleryApi';

class Collapsible extends React.Component {

	constructor() {
		super();
		this.state = {
			collapsed: false //this.props.collapsed
		};
		this.toggle = this.toggle.bind(this);
	}

	static propTypes = {
		children: React.PropTypes.any,
		header: React.PropTypes.string,
		collapsed: React.PropTypes.bool
	}

	static defaultProps = {
		header: '',
		collapsed: false
	}

	// componentDidMount() {
	// 	getGallery(this.props.params.path);
	// 	getGalleries();
	// }

	toggle() {
		this.setState({ collapsed: !this.state.collapsed });
		console.log(this.state);
	}

	render() {
		let className = 'collapsible';
		if (this.state.collapsed)
			className += ' collapsed';

		return (
			<div className={className}>
				<div className="collapsible-header" onClick={ this.toggle }>
					{this.props.header}
				</div>
				<div className='collapsible-panel'>
					{ this.props.children }
				</div>
			</div>
		);
	}
}

export default Collapsible;
