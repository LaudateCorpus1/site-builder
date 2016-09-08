import * as React from 'react';

const CheckBox = ({label, checked, onChange}) =>  {
	let input;
	return (
		<div>
			<input
				type="checkbox"
				ref={node => { input = node; }}
				checked={checked || false}
				onChange={ () => onChange(input.checked) }
			/>
			<label>{label}</label>
		</div>
	);
};

CheckBox.propTypes = {
	label: React.PropTypes.string,
	checked: React.PropTypes.bool,
	onChange: React.PropTypes.func
};

export default CheckBox;
