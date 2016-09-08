import * as React from 'react';

const DateEdit = ({label, value, onChange}) =>  {
	let input;
	return (
		<div>
			<label>{label}</label>
			<input
				type="date"
				ref={node => { input = node; }}
				value={value || new Date().toISOString().substring(0, 10)}
				onChange={ () => onChange(input.value) }
			/>
		</div>
	);
};


DateEdit.propTypes = {
	label: React.PropTypes.string,
	value: React.PropTypes.string,
	onChange: React.PropTypes.func
};

export default DateEdit;
