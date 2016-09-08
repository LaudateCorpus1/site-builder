import {
	createStore
} from 'redux';
import reducers from './reducers';
import {
	postGallery
} from './api/galleryApi';

const store = createStore(reducers);

store.isLoading = false;

store.subscribe(() => {
	//console.log('post!', store.getState());
	let state = store.getState();
	if (store.isLoading)
		store.isLoading = false;
	else
		postGallery(state);
});

export default store;
