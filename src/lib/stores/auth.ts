import type { User } from 'firebase/auth';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc, serverTimestamp, setDoc } from 'firebase/firestore';
import { writable } from 'svelte/store';

import { auth, db } from '$lib/firebase';

export const authUser = writable<User | null>(null);
export const authReady = writable(false);

let unsubscribe: (() => void) | undefined;

export const initAuth = () => {
	if (unsubscribe) return;

	unsubscribe = onAuthStateChanged(auth, async (user) => {
		authUser.set(user);
		authReady.set(true);

		if (!user) return;

		const userRef = doc(db, 'users', user.uid);
		const snapshot = await getDoc(userRef);

		if (!snapshot.exists()) {
			await setDoc(userRef, {
				email: user.email ?? '',
				displayName: user.displayName ?? '',
				createdAt: serverTimestamp()
			});
		}
	});
};
