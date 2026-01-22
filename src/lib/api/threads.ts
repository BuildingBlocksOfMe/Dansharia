import {
	addDoc,
	collection,
	getDocs,
	query,
	serverTimestamp,
	where
} from 'firebase/firestore';

import { db } from '$lib/firebase';

export type Thread = {
	id: string;
	itemId: string;
	ownerId: string;
	claimerId: string;
	claimId: string;
	createdAt: unknown;
	lastMessageAt: unknown;
};

export const createThreadForClaim = async ({
	claimId,
	itemId,
	ownerId,
	claimerId
}: {
	claimId: string;
	itemId: string;
	ownerId: string;
	claimerId: string;
}) => {
	const threadsRef = collection(db, 'threads');
	const existingQuery = query(threadsRef, where('claimId', '==', claimId));
	const existingSnapshot = await getDocs(existingQuery);

	if (!existingSnapshot.empty) return existingSnapshot.docs[0].id;

	const docRef = await addDoc(threadsRef, {
		claimId,
		itemId,
		ownerId,
		claimerId,
		createdAt: serverTimestamp(),
		lastMessageAt: serverTimestamp()
	});

	return docRef.id;
};

export const findThreadByClaim = async (claimId: string) => {
	const threadsRef = collection(db, 'threads');
	const threadsQuery = query(threadsRef, where('claimId', '==', claimId));
	const snapshot = await getDocs(threadsQuery);
	return snapshot.docs[0]
		? ({ id: snapshot.docs[0].id, ...snapshot.docs[0].data() } as Thread)
		: null;
};
