// @flow

import * as React from 'react';
//import * as ReactDOM from 'react-dom';
import DropContainer from '../components/DropContainer';
import ProjectsContainer from '../components/ProjectsContainer';
import ProjectContainer from '../components/ProjectContainer';
import { Tabs, TabPanel } from '../../components/Tab';
import CheckBox from '../../components/CheckBox';
import Edit from '../../components/Edit';
import ProjectThumbnail from '../components/ProjectThumbnail';
import EditArea from '../../components/EditArea';
import DropDown from '../../components/DropDown';
import HTML5Backend from 'react-dnd-html5-backend';
import { DragDropContext } from 'react-dnd';

var update = require('react-addons-update');
// var PSD = require('psd');

var resizeCanvas;
var resizeContext;

const auth = btoa('Andreas:whoisit');

function handleErrors(response) {
    if (!response.ok) {
        throw Error(response.statusText);
    }
    return response;
}

function bytesToSize(bytes) {
	if (bytes == null) return 'n/a';
	var sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
	var posttxt = 0;
	if (bytes == 0) return '0';
	if (bytes < 1024) {
			return Number(bytes) + " " + sizes[posttxt];
	}
	while( bytes >= 1024 ) {
			posttxt++;
			bytes = bytes / 1024;
	}
	return bytes.toFixed(1) + " " + sizes[posttxt];
}

function formatDate(date) {
	if (!date) return null;
	let m = date.getMonth() + 1;
	let d = date.getDate();
	let y = date.getFullYear();
	m = m > 9 ? m : '0' + m;
	d = d > 9 ? d : '0' + d;
	return '' + y + '-' + m + '-' + d;
}

function logout() {
	console.log('logging out...');
	window.location = window.location.protocol + '//log:out@' + window.location.host + window.location.pathname;
}

class AdminPage extends React.Component {

	// static propTypes = {
	// 	params: React.PropTypes.object
	// }

	state: {
		projects: Array<any>;
		selectedProject: ?string;
		selectedImages: Array<string>;
	}

	handleCreateProjectClick: () => void;
	handleProjectDeleteClick: (path: string) => void;
	handleImageDeleteClick: (url: string) => void;
	handleProjectImageDrop: (e: string[]) => void;
	handleDropFile: (file: File) => void;

	constructor(props: any) {
		super(props);
		this.state = {
			projects:[],
			selectedProject: null,
			selectedImages: []
		};
		this.handleCreateProjectClick = this.handleCreateProjectClick.bind(this);
		this.handleProjectDeleteClick = this.handleProjectDeleteClick.bind(this);
		this.handleImageDeleteClick = this.handleImageDeleteClick.bind(this);
		this.handleProjectImageDrop = this.handleProjectImageDrop.bind(this);
		this.handleDropFile = this.handleDropFile.bind(this);
	}

	componentDidMount() {
		this.getProjects()
		.then(() => {
			if (this.state.selectedProject == null) {
				let selection = (this.state.projects.length > 0) ? this.state.projects[0].path : null;
				this.setState({ selectedProject: selection });
			}
		});
	}

	getProjects() {
		return fetch('admin/get_projects.php', {
			cache: 'reload',
			headers: {
				'Authorization': 'Basic ' + auth,
			}
		})
		.then(response => response.json())
		.then(data => this.setState({ projects: data }))
		.catch(error => console.log(error));
	}

	saveProjects(){
		fetch('admin/save_projects.php', {
			method: 'POST',
			headers: {
				'Accept': 'application/json',
				'Content-Type': 'application/json',
				'Authorization': 'Basic ' + auth,
			},
			body: JSON.stringify(this.state.projects, null, '\t')
		})
		.catch(error => console.log(error));
	}

	createProject(path: string, title: ?string){
		console.log('create project', path);
		fetch('admin/create_project.php', {
			method: 'POST',
			headers: {
				'Accept': 'application/json',
				'Content-Type': 'application/json',
				'Authorization': 'Basic ' + auth,
			},
			body: JSON.stringify({ path: path })
		})
		.then(handleErrors)
		.then(response => {
			let newProject = {
				path: path,
				images: [],
				title: title
			}
			let newProjects = update(this.state.projects, { $push: [newProject]});
			this.setState({projects: newProjects, selectedProject: path }, this.saveProjects);
		})
		.catch(error => console.log(error));
	}

	handleCreateProjectClick(){
		let title = window.prompt('Enter project title');
		if (title) {
			let path = title.toLowerCase().replace(/\s+/g, '');
			this.createProject(path, title);
		}
	}

	handleProjectDeleteClick(path: string){
		console.log('delete project', path);
		fetch('admin/delete_project.php', {
			method: 'POST',
			headers: {
				'Accept': 'application/json',
				'Content-Type': 'application/json',
				'Authorization': 'Basic ' + auth,
			},
			body: JSON.stringify({ path: path })
		})
		.then(handleErrors)
		.then(response =>
			this.setState({ projects: this.state.projects.filter(p => p.path != path)})
		)
		.catch(error => console.log(error));
	}

	handleImageDeleteClick(){
		let path = this.state.selectedProject;

		let images = this.state.selectedImages;
		for (let url of images) {
			console.log('delete image', path, url);
			fetch('admin/delete_image.php', {
				method: 'POST',
				headers: {
					'Accept': 'application/json',
					'Content-Type': 'application/json',
					'Authorization': 'Basic ' + auth,
				},
				body: JSON.stringify({
					path: path,
					url: url
				})
			})
			.then(handleErrors)
			.then(response => {
				let projectIndex = this.getSelectedProjectIndex();
				let project = this.state.projects[projectIndex];
				let imageIndex = project.images.findIndex(i => i.url == url);
				let projects = update(this.state.projects, {[projectIndex]: { images: { $splice: [[imageIndex, 1]]} }});
				this.setState({ projects: projects }, this.saveProjects);
			})
			.catch(error => console.log(error));
		}
		this.setState({ selectedImages: [] });
	}

	handleProjectImageDrop(e){
		let urls = this.state.selectedImages;
		let sourcePath = e.sourcePath;
		let destPath = e.destPath;

		for (let url of urls) {
			console.log('move image', sourcePath, url, destPath);
			fetch('admin/move_image.php', {
				method: 'POST',
				headers: {
					'Accept': 'application/json',
					'Content-Type': 'application/json',
					'Authorization': 'Basic ' + auth,
				},
				body: JSON.stringify({
					sourcePath: sourcePath,
					destPath: destPath,
					url: url
				})
			})
			.then(handleErrors)
			.then(response => {
				let sourceProjectIndex = this.getSelectedProjectIndex();
				let sourceProject = this.state.projects[sourceProjectIndex];

				let destProjectIndex = this.getProjectIndex(destPath);
				let destProject = this.state.projects[destProjectIndex];

				let imageIndex = sourceProject.images.findIndex(i => i.url == url);
				let image = sourceProject.images[imageIndex];
				let projects = update(this.state.projects, {[sourceProjectIndex]: { images: { $splice: [[imageIndex, 1]]} }});
				projects = update(projects, { [destProjectIndex]: { images: { $push: [image]}}});

				this.setState({ projects: projects }, this.saveProjects);
			})
			.catch(error => console.log(error));
		}
		this.setState({ selectedImages: [] });
	}

	resizeDroppedImage(file: File, action: any){
		console.log('resizing ', file.name);
		var img = document.createElement("img");
		img.onload = (e) => {
			if (!resizeCanvas || !resizeContext) {
				resizeCanvas = document.createElement('canvas');
				var resizeContext = resizeCanvas.getContext("2d");
			}

			if (resizeContext) {

				var MAX_WIDTH = 1920;
				var MAX_HEIGHT = 1080;
				var width = img.width;
				var height = img.height;

				if (width > height) {
				  if (width > MAX_WIDTH) {
				    height *= MAX_WIDTH / width;
				    width = MAX_WIDTH;
				  }
				} else {
				  if (height > MAX_HEIGHT) {
				    width *= MAX_HEIGHT / height;
				    height = MAX_HEIGHT;
				  }
				}
				resizeCanvas.width = width;
				resizeCanvas.height = height;
				resizeContext.drawImage(img, 0, 0, width, height);
				resizeCanvas.toBlob(action, file.type, 0.95);
			}
		}

		var reader = new FileReader();
		reader.onload = (e) => {img.src = e.target.result}
		reader.readAsDataURL(file);
	}

	uploadImage(file, path, url) {
		if (file.size > window.FILE_UPLOAD_MAX_SIZE) {
			console.log(file.name, ' is too large to upload.');
			return false;
		}

		//console.log(blob);
		let newImage = {
			url: url,
			loading: true
		}
		let projectIndex = this.getSelectedProjectIndex();
		let newProjects = update(this.state.projects, { [projectIndex]: { images: { $push: [newImage]}}});
		this.setState({projects: newProjects});

		let data = new FormData();
		data.append('file', file);
		data.append('path', path );
		data.append('filename', url );

		console.log('Uploading to', path, url, file);

		fetch('admin/upload-image.php', {
			method: 'POST',
			body: data,
			headers: { 'Authorization': 'Basic ' + auth }
		})
		.then(handleErrors)
		.then(response => {
			console.log('Successfully uploaded:', file.name);

			let projectIndex = this.getSelectedProjectIndex();
			let project = this.state.projects[projectIndex];
			let imageIndex = project.images.findIndex(i => i.url == url);
			//console.log('update loaded image:', projectIndex, imageIndex, path, url);
			let newProjects = update(this.state.projects, { [projectIndex]: { images: { [imageIndex]: {
				loading: {$set: false },
				fileSize: {$set: file.size},
				date: {$set: formatDate(file.lastModifiedDate)}
			}}}});
			this.setState({projects: newProjects}, this.saveProjects);
		})
		.catch(error => {
			console.log('Failed uploading:', file.name, error);
			// remove loading image:
			let projectIndex = this.getSelectedProjectIndex();
			let project = this.state.projects[projectIndex];
			let imageIndex = project.images.findIndex(i => i.url == url);
			let projects = update(this.state.projects, {[projectIndex]: { images: { $splice: [[imageIndex, 1]]} }});
			this.setState({ projects: projects }, this.saveProjects);
		});
	}


	handleDropFile(file: File){
		const ACCEPTED_FILE_TYPES = ['image/jpeg', 'image/png', 'image/gif'];
		let resize = false;
		console.log('Dropped File', file);

		let path = this.state.selectedProject;
		if (!path) {
			console.log('No project selected. Cannot upload file.');
			return false;
		}

		if (ACCEPTED_FILE_TYPES.includes(file.type) == false) {
			console.log('File type "' + file.type + '" is not accepted.');
			return false;
		}

		if (file.size > window.FILE_UPLOAD_MAX_SIZE)
			resize = true;

		let url = file.name.toLowerCase();
		let projectIndex = this.getSelectedProjectIndex();
		let project = this.state.projects[projectIndex];
		let imageIndex = project.images.findIndex(i => i.url == url);
		if (imageIndex > -1) {
			if (window.confirm('File ' + url + ' already exists. Overwrite?') == false)
				return false;
			else {
				let projects = update(this.state.projects, {[projectIndex]: { images: { $splice: [[imageIndex, 1]]} }});
				this.setState({ projects: projects });
			}
		}

		window.setTimeout(() => {
			if (resize)
				this.resizeDroppedImage(file, blob => this.uploadImage(blob, path, url));
			else
				this.uploadImage(file, path, url);
		}, 100);
	}

	createProjectThumbnail(path, url, scale, thumbX, thumbY) {
		console.log('creating project thumbnail', path, url);
		fetch('admin/create_project_thumbnail.php', {
			method: 'POST',
			headers: {
				'Accept': 'application/json',
				'Content-Type': 'application/json',
				'Authorization': 'Basic ' + auth,
			},
			body: JSON.stringify({
				path: path,
				url: url,
				scale: scale || 1,
				thumbX: thumbX || 0,
				thumbY: thumbY || 0
			})
		})
		.then(handleErrors)
		.catch(error => console.log(error));
	}

	getProjectIndex(path: ?string) {
		if (path) {
			return this.state.projects.findIndex(p => p.path == path);
		}
		return -1;
	}

	getSelectedProjectIndex() {
		return this.getProjectIndex(this.state.selectedProject);
	}

	getSelectedProject() {
		let index = this.getSelectedProjectIndex();
		if (index >= 0)
			return this.state.projects[index];
		else
			return null;
	}

	getSelectedImageIndexes() {
		let project = this.getSelectedProject();
		if (!project) return [];

		return this.state.selectedImages.map(url => project.images.findIndex(i => i.url == url));
	}

	getSelectedImages() {
		let project = this.getSelectedProject();
		if (!project) return [];

		return this.state.selectedImages.map(url => project.images.find(i => i.url == url));
	}

	getProjectMenu(){
		let project = this.getSelectedProject();

		if (project != null) {
			let thumbWidth;
			let thumbHeight;

			let thumbUrl = project.thumbUrl;
			let thumbIndex = project.images.findIndex(i => i.url == thumbUrl);
			if (thumbIndex > -1) {
				thumbWidth = project.images[thumbIndex].width;
				thumbHeight = project.images[thumbIndex].height;
			}

			return (
				<TabPanel key="project" label="Project">
					<Edit
						label="Title"
						value={project.title}
						onChange={v => {
							let projectIndex = this.getSelectedProjectIndex();
							let projects = update(this.state.projects, {[projectIndex]: { title: { $set: v} }});
							this.setState({projects: projects}, this.saveProjects);
						}}
					/>
					<EditArea
						label="Description"
						value={project.description}
						onChange={v => {
							let projectIndex = this.getSelectedProjectIndex();
							let projects = update(this.state.projects, {[projectIndex]: { description: { $set: v} }});
							this.setState({projects: projects}, this.saveProjects);
						}}
					/>
					<Edit
						label="Tags"
						value={project.tags}
						onChange={v => {
							let projectIndex = this.getSelectedProjectIndex();
							let projects = update(this.state.projects, {[projectIndex]: { tags: { $set: v} }});
							this.setState({projects: projects}, this.saveProjects);
						}}
					/>
					<CheckBox
						label="Visible"
						checked={project.visible !== false}
						onChange={v => {
							let projectIndex = this.getSelectedProjectIndex();
							let projects = update(this.state.projects, {[projectIndex]: { visible: { $set: v} }});
							this.setState({projects: projects}, this.saveProjects);
						}}
					/>
					<DropDown
						label="Sort by"
						value={project.sortBy || 'MANUAL'}
						onChange={v => {
							let projectIndex = this.getSelectedProjectIndex();
							let projects = update(this.state.projects, {[projectIndex]: { sortBy: { $set: v} }});
							this.setState({projects: projects}, this.saveProjects);
						}}
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
						value={project.sortOrder || 'ASCENDING'}
						onChange={v => {
							let projectIndex = this.getSelectedProjectIndex();
							let projects = update(this.state.projects, {[projectIndex]: { sortOrder: { $set: v} }});
							this.setState({projects: projects}, this.saveProjects);
						}}
						values={[
							['Ascending', 'ASCENDING'],
							['Descending', 'DESCENDING']
						]}
					/>

					<label>Project Thumbnail</label>
					<ProjectThumbnail
						fullUrl={project.thumbUrl ? 'content/projects/' + project.path + '/' + project.thumbUrl : '' }
						width={thumbWidth}
						height={thumbHeight}
						x={project.thumbX || 0}
						y={project.thumbY || 0}
						scale={project.thumbScale || 1}
						onImageDrop={e => {
							let projectIndex = this.getSelectedProjectIndex();
							let projects = update(this.state.projects, {[projectIndex]: { thumbUrl: { $set: e.url} }});
							this.setState({projects: projects}, this.saveProjects);
						}}
						onThumbTransform={e => {
							let projectIndex = this.getSelectedProjectIndex();
							let projects = update(this.state.projects, {[projectIndex]: {
								thumbX: { $set: e.x},
								thumbY: { $set: e.y},
								thumbScale: { $set: e.scale}
							}});
							this.setState({projects: projects}, this.saveProjects);
							this.createProjectThumbnail(
							this.state.selectedProject,
							this.state.projects[projectIndex].thumbUrl,
							e.scale, e.x, e.y
							);
						}}

					/>
				</TabPanel>
			)
		}
		else
			return (
				<TabPanel key="project" label="Project">
					No Project selected.
				</TabPanel>
			)
	}

	getImageMenu(){
		let projectIndex = this.getSelectedProjectIndex();
		let project = this.getSelectedProject();

		let imageIndexes = this.getSelectedImageIndexes();
		let imageIndex;
		let image;
		if (project && imageIndexes.length > 0) {
			imageIndex = imageIndexes[0];
			image = project.images[imageIndex];
		}
		if (image)
		return (
			<TabPanel key="image" label="Image">
				<table>
					<tr><td>Url:</td><td>{image.url || 'n/a'}</td></tr>
					<tr><td>Width:</td><td>{image.width ? image.width + 'px' : 'n/a'}</td></tr>
					<tr><td>Height:</td><td>{image.height ? image.height + 'px' : 'n/a'}</td></tr>
					<tr><td>Date:</td><td>{image.date || 'n/a'}</td></tr>
					<tr><td>File size:</td><td>{bytesToSize(image.fileSize)}</td></tr>
					<tr><td>Artist:</td><td>{image.artist}</td></tr>
					<tr><td>Software:</td><td>{image.software}</td></tr>
					<tr><td>Copyright:</td><td>{image.copyright}</td></tr>
				</table>
				<Edit
					label="Title"
					value={image.title}
					onChange={v => {
						//console.log('update', projectIndex, imageIndex);
						let newProjects = update(this.state.projects, { [projectIndex]: { images: { [imageIndex]: { title: {$set: v }}}}});
						this.setState({projects: newProjects}, this.saveProjects);
					}}
				/>
				<CheckBox
					label="Visible"
					checked={image.visible !== false}
					onChange={v => {
						let newProjects = update(this.state.projects, { [projectIndex]: { images: { [imageIndex]: { visible: {$set: v }}}}});
						this.setState({projects: newProjects}, this.saveProjects);
					}}
				/>
			</TabPanel>
			)
		else
			return (
				<TabPanel key="image" label="Image">
					No Image selected.
				</TabPanel>
			)
	}

	getMenu() {
		return (
			<div className="admin-menu">
				{/* <button
					onClick={() => this.saveProjects()}
				>Save</button> */}
				<Tabs activeTab="project">
					{this.getProjectMenu()}
					{this.getImageMenu()}
				</Tabs>
			</div>
		)
	}

	getStatusBar(){
		let project = this.getSelectedProject();
		let imageCount = project ? project.images.length : 0;
		let totalImageCount = this.state.projects.reduce((p, c) => p + c.images.length, 0);
		let projectSize = project ? project.dirSize : 0;
		let totalSize = this.state.projects.reduce((p, c) => p + c.dirSize, 0);
		return (
			<div className="status-bar">
				{ imageCount + ' | ' + totalImageCount + ' images - '}
				{ bytesToSize(projectSize) + ' | ' + bytesToSize(totalSize) }
				<span className='right'>
					<i onClick = {logout} className="fa fa-sign-out" aria-hidden="true" />
				</span>
			</div>
		)
	}

	render() {
		let project = this.getSelectedProject();
		let images = project ? project.images : [];

		return (
			<DropContainer onDropFile={this.handleDropFile}>
				<ProjectsContainer
					projects={this.state.projects}
					selection={this.state.selectedProject}
					onProjectClick={path => this.setState({selectedProject: path})}
					onCreateProjectClick={this.handleCreateProjectClick}
					onProjectDeleteClick={this.handleProjectDeleteClick}
					onProjectImageDrop={this.handleProjectImageDrop}
				/>
				<ProjectContainer
					project={project}
					selection={this.state.selectedImages}
					onImageClick={(url: string, e) => {
						let selection = [];
						if (url) {
							selection = this.state.selectedImages;

							if (e.shiftKey) {

							}
							else if (e.ctrlKey || e.metaKey) {
								if (selection.includes(url)) {
									selection = selection.filter(u => u != url);
								}
								else {
									selection = selection.slice(0);
									selection.push(url);
								}
							}
							else {
								selection = [url];
							}
						}
						this.setState({selectedImages: selection})
					}}
					onImageDeleteClick={this.handleImageDeleteClick}
				/>
				{this.getMenu()}
				{this.getStatusBar()}
			</DropContainer>
		);
	}
}

export default DragDropContext(HTML5Backend)(AdminPage);
