<script lang="ts">
	import { onMount } from 'svelte';
	import { page } from '$app/stores';
	import { goto } from '$app/navigation';
	import { authUser } from '$lib/stores/auth';
	import { db } from '$lib/firebase';
	import {
		addDoc,
		collection,
		doc,
		getDoc,
		onSnapshot,
		orderBy,
		query,
		serverTimestamp,
		updateDoc
	} from 'firebase/firestore';

	type Message = {
		id: string;
		senderId: string;
		text: string;
		createdAt: unknown;
	};

	let threadTitle = '';
	let messages: Message[] = [];
	let text = '';
	let error = '';

	onMount(async () => {
		if (!$authUser) {
			await goto('/login');
			return;
		}

		const threadRef = doc(db, 'threads', $page.params.id);
		const threadSnap = await getDoc(threadRef);

		if (!threadSnap.exists()) {
			error = 'チャットが見つかりません。';
			return;
		}

		const thread = threadSnap.data() as {
			itemId: string;
			ownerId: string;
			claimerId: string;
		};
		if (![thread.ownerId, thread.claimerId].includes($authUser.uid)) {
			error = '閲覧権限がありません。';
			return;
		}

		threadTitle = `受取希望チャット`;
		const messagesRef = collection(db, 'threads', $page.params.id, 'messages');
		const messagesQuery = query(messagesRef, orderBy('createdAt', 'asc'));
		onSnapshot(messagesQuery, (snapshot) => {
			messages = snapshot.docs.map(
				(docSnap) => ({ id: docSnap.id, ...docSnap.data() }) as Message
			);
		});
	});

	const sendMessage = async () => {
		if (!text.trim() || !$authUser) return;
		const messagesRef = collection(db, 'threads', $page.params.id, 'messages');
		await addDoc(messagesRef, {
			senderId: $authUser.uid,
			text: text.trim(),
			createdAt: serverTimestamp()
		});
		const threadRef = doc(db, 'threads', $page.params.id);
		await updateDoc(threadRef, { lastMessageAt: serverTimestamp() });
		text = '';
	};
</script>

{#if error}
	<p>{error}</p>
{:else}
	<section class="chat">
		<h1>{threadTitle}</h1>
		<div class="messages">
			{#each messages as message}
				<div class:mine={message.senderId === $authUser?.uid} class="bubble">
					<p>{message.text}</p>
				</div>
			{/each}
		</div>
		<form on:submit|preventDefault={sendMessage} class="composer">
			<input bind:value={text} placeholder="メッセージを入力" />
			<button type="submit">送信</button>
		</form>
	</section>
{/if}

<style>
	.chat {
		display: grid;
		gap: 1rem;
	}

	.messages {
		display: grid;
		gap: 0.6rem;
		background: white;
		padding: 1rem;
		border-radius: 12px;
		min-height: 280px;
	}

	.bubble {
		padding: 0.6rem 1rem;
		background: #f1f1f1;
		border-radius: 12px;
		width: fit-content;
		max-width: 70%;
	}

	.mine {
		background: #1b1b1b;
		color: white;
		margin-left: auto;
	}

	.composer {
		display: flex;
		gap: 0.5rem;
	}

	input {
		flex: 1;
		padding: 0.5rem;
		border: 1px solid #ccc;
		border-radius: 6px;
	}
</style>
