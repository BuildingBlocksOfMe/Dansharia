import {
	addDoc,
	collection,
	doc,
	getDocs,
	query,
	serverTimestamp,
	updateDoc,
	where
} from 'firebase/firestore';

import { db } from '$lib/firebase';
import { createThreadForClaim } from '$lib/api/threads';
import { updateItemStatus } from '$lib/api/items';

export type ClaimStatus = 'pending' | 'approved' | 'rejected' | 'cancelled';

export type ClaimInput = {
	itemId: string;
	claimerId: string;
	shippingAddress: string;
	shippingConfirmed: boolean;
};

export type Claim = ClaimInput & {
	id: string;
	status: ClaimStatus;
	createdAt: unknown;
};

export const createClaim = async (data: ClaimInput) => {
	const claimsRef = collection(db, 'claims');
	const docRef = await addDoc(claimsRef, {
		...data,
		status: 'pending',
		createdAt: serverTimestamp()
	});

	return docRef.id;
};

export const listClaimsForItem = async (itemId: string) => {
	const claimsRef = collection(db, 'claims');
	const claimsQuery = query(claimsRef, where('itemId', '==', itemId));
	const snapshot = await getDocs(claimsQuery);
	return snapshot.docs.map((docSnap) => ({ id: docSnap.id, ...docSnap.data() } as Claim));
};

export const findClaimForUser = async (itemId: string, claimerId: string) => {
	const claimsRef = collection(db, 'claims');
	const claimsQuery = query(
		claimsRef,
		where('itemId', '==', itemId),
		where('claimerId', '==', claimerId)
	);
	const snapshot = await getDocs(claimsQuery);
	return snapshot.docs[0] ? ({ id: snapshot.docs[0].id, ...snapshot.docs[0].data() } as Claim) : null;
};

export const approveClaim = async (
	claimId: string,
	itemId: string,
	ownerId: string,
	claimerId: string
) => {
	const claimRef = doc(db, 'claims', claimId);
	await updateDoc(claimRef, { status: 'approved' });
	await updateItemStatus(itemId, 'reserved');
	await createThreadForClaim({ claimId, itemId, ownerId, claimerId });
};

export const rejectClaim = async (claimId: string) => {
	const claimRef = doc(db, 'claims', claimId);
	await updateDoc(claimRef, { status: 'rejected' });
};
