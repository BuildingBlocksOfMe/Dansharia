import { getDownloadURL, ref, uploadBytes } from 'firebase/storage';

import { storage } from '$lib/firebase';

export const uploadItemImages = async (files: File[], ownerId: string) => {
	if (!files.length) return [];

	const uploads = files.map(async (file) => {
		const storageRef = ref(storage, `items/${ownerId}/${crypto.randomUUID()}-${file.name}`);
		await uploadBytes(storageRef, file);
		return await getDownloadURL(storageRef);
	});

	return Promise.all(uploads);
};
