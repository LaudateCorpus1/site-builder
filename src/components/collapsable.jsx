import * as React from 'react';
import GalleryContainer from '../containers/GalleryContainer';
import DropContainer from '../containers/DropContainer';
import AdminMenu from '../components/AdminMenu';
import { getGallery } from '../api/galleryApi';
import { getGalleries } from '../api/galleryApi';

class AdminPage extends React.Component {
	static propTypes = {
		params: React.PropTypes.object
	}

	componentDidMount() {
		getGallery(this.props.params.path);
		getGalleries();
	}

	render() {
		return (
			<div className="admin-page">
				<DropContainer>
					<GalleryContainer layout="lines" rowHeight={100} />
					<AdminMenu/>
				</DropContainer>
			</div>
		);
	}
}

export default AdminPage;
