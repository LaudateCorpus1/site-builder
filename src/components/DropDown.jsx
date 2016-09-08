import * as React from 'react';

const DropDown = ({label, value, values, onChange}) => {
	let select;
	const options = values.map((v, i) => (
		<option
			key={i}
			value={Array.isArray(v) ? v[1] : v}>
			{Array.isArray(v) ? v[0] : v}
		</option>
	));

	return (
		<div>
			<label>{label}</label>
			<span className="plain-select">
				<select
					ref={node => { select = node; }}
					value={value}
					onChange={ () => onChange(select.value) }
				>
					{options}
				</select>
			</span>
		</div>
	);
};

DropDown.propTypes = {
	label: React.PropTypes.string,
	value: React.PropTypes.any,
	values: React.PropTypes.array,
	onChange: React.PropTypes.func
};

export default DropDown;
