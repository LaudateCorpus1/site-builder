// @flow

import * as React from 'react';
import * as settings from './settings.js';
import SideBar from './components/SideBar';
// import ProjectsContainer from '../components/ProjectsContainer';
import Edit from '../components/Edit';
import DropDown from '../components/DropDown';
import DefaultView from './views/DefaultView';
import ThumbnailView from './views/ThumbnailView';
import ProjectView from './views/ProjectView';

function handleErrors(response) {
    if (!response.ok) {
		console.log(response);
        throw Error(response.statusText);
		//response.json().then(d => console.log(d))
    }
    return response;
}

const getFilenameBase = (f) => f.substr(0, f.lastIndexOf('.'));
const getFilenameExtension = (f) => f.substr(f.lastIndexOf('.') + 1);

class App extends React.Component {

	// static propTypes = {
	// 	params: React.PropTypes.object
	// }

	state: any;

	constructor(props: any) {
		super(props);
		this.state = {
			meta:[],
			dirs:[],
			files:[],
			sortBy:'MANUAL',
			sortOrder:'ASCENDING'
		};
	}

	componentDidMount(){
		this.getItems(this.props.params.splat);
	}

	componentWillReceiveProps(nextProps: any) {
		this.getItems(nextProps.params.splat);
	}

	getItems(path: string) {
		path = settings.CONTENT_ROOT + '/' + path;
		console.log('loading data for path:', path);

		fetch('./get_items.php', {
			headers: {
				'Accept': 'application/json',
				'Content-Type': 'application/json'
			},
			method: 'POST',
			cache: 'reload',
			body: JSON.stringify({ path: path })
		})
		.then(handleErrors)
		.then(response => response.json())
		.then(data => {
			this.setState(data);
		})
		.catch(error => console.log('Could not load data.', error));
	}

	getSortedItems(items: Array<any>){
		let search = this.state.search ? new RegExp(this.state.search, 'gi') : '';
		items = items.filter(d => d.name.search(search) > -1);
		switch (this.state.sortBy) {
			case 'FILENAME':
				items.sort((a, b): number => (a.name > b.name) ? 1 : -1);
				break;
			case 'TYPE':
				items.sort((a, b): number =>
					(getFilenameExtension(a.name) > getFilenameExtension(b.name)) ? 1 : -1
				);
				break;
			case 'TITLE':
				items.sort((a, b): number => (a.title > b.title) ? 1 : -1);
				break;
			case 'DIMENSIONS':
				items.sort((a, b): number => a.width * a.height - b.width * b.height);
				break;
			case 'DATE':
				items.sort((a, b): number => (a.date > b.date) ? 1 : -1);
				break;
		}
		if (this.state.sortOrder == 'DESCENDING')
			items.reverse();
		return items;
	}

	render() {
		let path = this.props.params.splat;

		let dirs = this.getSortedItems(this.state.dirs);
		let files = this.getSortedItems(this.state.files);

		let view;
		switch(this.state.meta.view) {
			case 'thumbnails':
				view = <ThumbnailView path={path} dirs={dirs} files={files} />;
				break;
			case 'project':
				view = <ProjectView path={path} dirs={dirs} files={files} />;
				break;
			default:
				view = <DefaultView path={path} dirs={dirs} files={files} />;
		}

		return (
			<div className="projects-page">
				{view}
				<SideBar>
					<Edit
						placeholder="&#xF002;"
						style={{fontFamily: 'Arial, FontAwesome'}}
						value={this.state.search}
						onChange={v => {
							this.setState({search: v});
							//console.log(v);
						}}
					/>
					{/* <DropDown
						label="Sort by"
						value={this.state.sortBy || 'MANUAL'}
						onChange={v => this.setState({sortBy: v})}
						values={[
						['Manual', 'MANUAL'],
						['File Name', 'FILENAME'],
						['File Type', 'TYPE'],
						['Title', 'TITLE'],
						['Dimensions', 'DIMENSIONS'],
						['Date', 'DATE']
						]}
						/>

						<DropDown
						label=""
						value={this.state.sortOrder || 'ASCENDING'}
						onChange={v => this.setState({sortOrder: v})}
						values={[
						['Ascending', 'ASCENDING'],
						['Descending', 'DESCENDING']
						]}
					/> */}
					<h1>{this.state.meta.title || this.state.meta.name}</h1>
					<p>{this.state.meta.description}</p>
				</SideBar>
			</div>
		);
	}
}

export default App;
