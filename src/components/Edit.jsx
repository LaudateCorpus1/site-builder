import * as React from 'react';

const Edit = (props) =>  {
	let input;

	let {label, value, onChange, ...other} = props;
	let labelElement = label ? <label>{label}</label> : null;

	return (
		<div className="edit">
			{labelElement}
			<input
				{...other}
				ref={node => { input = node; }}
				value={value || ''}
				onChange={ () => onChange(input.value) }
			/>
		</div>
	);
};

Edit.propTypes = {
	label: React.PropTypes.string,
	value: React.PropTypes.string,
	onChange: React.PropTypes.func
};

export default Edit;
