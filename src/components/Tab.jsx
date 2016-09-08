import * as React from 'react';
// import GalleryContainer from '../containers/GalleryContainer';
// import DropContainer from '../containers/DropContainer';
// import AdminMenu from '../components/AdminMenu';
// import { getGallery } from '../api/galleryApi';
// import { getGalleries } from '../api/galleryApi';

class Tab extends React.Component {

	static propTypes = {
		active: React.PropTypes.bool.isRequired,
		label: React.PropTypes.string.isRequired,
		onClick: React.PropTypes.func.isRequired
	}

	render() {
		let className = 'tab';
		if (this.props.active)
			className += ' active';

		return (
			<div className={className} onClick={ this.props.onClick } >
				{this.props.label}
			</div>
		);
	}

}

class TabBar extends React.Component {

	static propTypes = {
		children: React.PropTypes.any,
		active: React.PropTypes.string
	}

	render() {
		return (
			<div className='tab-bar'>
				{ this.props.children }
			</div>
		);
	}
}

export class TabPanel extends React.Component {

	static propTypes = {
		children: React.PropTypes.any,
		active: React.PropTypes.bool,
		label: React.PropTypes.string.isRequired
	}

	render() {
		let className = 'tab-panel';
		if (this.props.active)
			className += ' active';

		return (
			<div className={className} >
				{ this.props.children }
			</div>
		);
	}

}


export class Tabs extends React.Component {

	constructor(props) {
		super(props);
		this.state = {
			activeTab: this.props.activeTab
		};
		//this.toggle = this.toggle.bind(this);
	}

	static propTypes = {
		children: React.PropTypes.any,
		activeTab: React.PropTypes.string,
		// collapsed: React.PropTypes.bool
	}

	static defaultProps = {
		// header: '',
		// collapsed: false
	}

	// componentDidMount() {
	// 	getGallery(this.props.params.path);
	// 	getGalleries();
	// }

	toggle() {
		this.setState({ collapsed: !this.state.collapsed });
		console.log(this.state);
	}

	handleTabClick(key){
		//console.log(key);
		this.setState({ activeTab:key });
	}

	getTabs(){
		return React.Children.map(this.props.children, (child => (
			<Tab
				key={child.key}
				label={child.props.label}
				active={child.key == this.state.activeTab}
				onClick={() => { this.handleTabClick(child.key); } }
			/>
		)));
	}

	getTabPanels(){
		return React.Children.map(this.props.children, (child => (
			<TabPanel
				key={child.key}
				label={child.props.label}
				active={child.key == this.state.activeTab}
				children={child.props.children}
			/>
		)));
	}

	render() {
		return (
			<div className='tabs'>
				<TabBar>
					{ this.getTabs() }
				</TabBar>
				{ this.getTabPanels() }
			</div>
		);
	}
}
