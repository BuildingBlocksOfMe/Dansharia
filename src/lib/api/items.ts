import {
	addDoc,
	collection,
	deleteDoc,
	doc,
	getDoc,
	getDocs,
	limit,
	orderBy,
	query,
	serverTimestamp,
	updateDoc,
	where
} from 'firebase/firestore';

import { db } from '$lib/firebase';

export type ItemStatus = 'open' | 'reserved' | 'given';
export type HandoffMethod = 'ship' | 'meet';

export type ItemInput = {
	title: string;
	description: string;
	category: string;
	condition: string;
	images: string[];
	handoffMethod: HandoffMethod;
	shippingCostPaidBy: 'receiver';
};

export type Item = ItemInput & {
	id: string;
	ownerId: string;
	status: ItemStatus;
	createdAt: unknown;
};

export const createItem = async (ownerId: string, data: ItemInput) => {
	const itemsRef = collection(db, 'items');
	const docRef = await addDoc(itemsRef, {
		...data,
		ownerId,
		status: 'open',
		createdAt: serverTimestamp()
	});

	return docRef.id;
};

export const getItem = async (id: string) => {
	const itemRef = doc(db, 'items', id);
	const snapshot = await getDoc(itemRef);

	if (!snapshot.exists()) return null;
	return { id: snapshot.id, ...snapshot.data() } as Item;
};

export const listItems = async ({
	category,
	ownerId,
	max = 30
}: {
	category?: string;
	ownerId?: string;
	max?: number;
}) => {
	const itemsRef = collection(db, 'items');
	const constraints = [orderBy('createdAt', 'desc'), limit(max)];

	if (category) {
		constraints.push(where('category', '==', category));
	}
	if (ownerId) {
		constraints.push(where('ownerId', '==', ownerId));
	}

	const itemsQuery = query(itemsRef, ...constraints);
	const snapshot = await getDocs(itemsQuery);
	return snapshot.docs.map((docSnap) => ({ id: docSnap.id, ...docSnap.data() } as Item));
};

export const updateItemStatus = async (itemId: string, status: ItemStatus) => {
	const itemRef = doc(db, 'items', itemId);
	await updateDoc(itemRef, { status });
};

export const updateItem = async (itemId: string, data: Partial<ItemInput>) => {
	const itemRef = doc(db, 'items', itemId);
	await updateDoc(itemRef, { ...data });
};

export const deleteItem = async (itemId: string) => {
	const itemRef = doc(db, 'items', itemId);
	await deleteDoc(itemRef);
};
