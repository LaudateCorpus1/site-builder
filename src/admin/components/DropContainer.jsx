// @flow

import * as React from 'react';

class DropContainer extends React.Component {

	static propTypes = {
		children: React.PropTypes.any,
		onDropFile: React.PropTypes.func.isRequired
	}

	handleDragEnter: () => void;
	handleDragStart: () => void;
	handleDragOver: () => void;
	handleDragLeave: () => void;
	handleDrop: () => void;

	constructor(props: any){
		super(props);
		this.handleDragEnter = this.handleDragEnter.bind(this);
		this.handleDragStart = this.handleDragStart.bind(this);
		this.handleDragOver = this.handleDragOver.bind(this);
		this.handleDragLeave = this.handleDragLeave.bind(this);
		this.handleDrop = this.handleDrop.bind(this);
	}

	handleDragEnter(e: SyntheticEvent){
		e.preventDefault();
	}

	handleDragStart(){
	}

	handleDragOver(e: SyntheticEvent){
		e.preventDefault();
		e.stopPropagation();
		return false;
	}

	handleDragLeave(e: SyntheticEvent){
		e.preventDefault();
	}

	handleDrop(e: SyntheticEvent) {
		e.preventDefault();
		const droppedFiles = e.dataTransfer ? e.dataTransfer.files : (e.target:any).files;

		for (var i = 0; i < droppedFiles.length; i++)
			this.props.onDropFile(droppedFiles[i]);
	}

	render() {
		return (
			<div className="drop-container"
				onDragEnter={this.handleDragEnter}
				onDragStart={this.handleDragStart}
				onDragOver={this.handleDragOver}
				onDragLeave={this.handleDragLeave}
				onDrop={this.handleDrop}
			>
				{this.props.children}
			</div>
		);
	}
}

export default DropContainer;
