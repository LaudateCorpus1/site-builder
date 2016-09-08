import * as React from 'react';

const EditArea = ({label, value, onChange}) =>  {
	let input;
	return (
		<div>
			<label>{label}</label>
			<textarea
				ref={node => { input = node; }}
				value={value || ''}
				onChange={ () => onChange(input.value) }
			/>
		</div>
	);
};

EditArea.propTypes = {
	label: React.PropTypes.string,
	value: React.PropTypes.string,
	onChange: React.PropTypes.func
};

export default EditArea;
