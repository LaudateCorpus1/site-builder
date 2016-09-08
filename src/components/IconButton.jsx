// @flow weak

import * as React from 'react';

const IconButton = ({icon, onClick}) => {
	return (
		<button className="icon-button">
			<i className={ 'fa ' + icon } onClick={onClick} aria-hidden="true" />
		</button>
	)
}

IconButton.propTypes = {
	icon: React.PropTypes.string.isRequired,
	onClick: React.PropTypes.func.isRequired
};

export default IconButton;
