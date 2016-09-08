// @flow

import * as React from 'react';

class LazyImage extends React.Component {

	state: { loading: bool }

	constructor(props: any){
		super(props);
		this.state = {loading: true}
	}

	render() {
		let style = {
			transition: "opacity 0.3s",
			...this.props.style
		}
		if (this.state.loading)
			style.opacity = 0;

		return (
			<img {...this.props}
				style={style}
				onLoad={() => this.setState({loading: false})}
			/>
		)
	}
}

export default LazyImage;
