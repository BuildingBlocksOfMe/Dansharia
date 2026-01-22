<script lang="ts">
	import { onMount } from 'svelte';
	import { page } from '$app/stores';
	import { goto } from '$app/navigation';
	import { authReady, authUser } from '$lib/stores/auth';
	import { deleteItem, getItem, type Item } from '$lib/api/items';
	import {
		approveClaim,
		findClaimForUser,
		listClaimsForItem,
		rejectClaim,
		type Claim
	} from '$lib/api/claims';
	import { findThreadByClaim } from '$lib/api/threads';

	let item: Item | null = null;
	let claims: Claim[] = [];
	let myClaim: Claim | null = null;
	let threadId = '';
	let isLoading = true;
	let isOwner = false;
	let error = '';
	let initialized = false;

	const loadItem = async () => {
		isLoading = true;
		error = '';
		const id = $page.params.id;
		item = await getItem(id);
		if (!item) {
			error = '出品が見つかりません。';
			isLoading = false;
			return;
		}
		isOwner = !!$authUser && item.ownerId === $authUser.uid;
		if (isOwner) {
			claims = await listClaimsForItem(item.id);
		} else if ($authUser) {
			myClaim = await findClaimForUser(item.id, $authUser.uid);
			if (myClaim?.status === 'approved') {
				const thread = await findThreadByClaim(myClaim.id);
				threadId = thread?.id ?? '';
			}
		}
		isLoading = false;
	};

	onMount(loadItem);

	$: if ($authReady && !initialized) {
		initialized = true;
		loadItem();
	}

	const handleApprove = async (claim: Claim) => {
		if (!item || !$authUser) return;
		await approveClaim(claim.id, item.id, $authUser.uid, claim.claimerId);
		await loadItem();
	};

	const handleReject = async (claimId: string) => {
		await rejectClaim(claimId);
		await loadItem();
	};

	const handleDelete = async () => {
		if (!item) return;
		const confirmed = confirm('この出品を削除しますか？');
		if (!confirmed) return;
		await deleteItem(item.id);
		await goto('/items');
	};
</script>

{#if isLoading}
	<p>読み込み中...</p>
{:else if error}
	<p>{error}</p>
{:else if item}
	<section class="detail">
		<div class="images">
			{#if item.images?.length}
				{#each item.images as img}
					<img src={img} alt={item.title} />
				{/each}
			{:else}
				<div class="placeholder">画像なし</div>
			{/if}
		</div>

		<div class="info">
			<h1>{item.title}</h1>
			<p>{item.description}</p>
			<ul>
				<li>カテゴリ: {item.category}</li>
				<li>状態: {item.condition}</li>
				<li>受け渡し: {item.handoffMethod === 'ship' ? '配送' : '手渡し'}</li>
				<li>送料: 受取側負担</li>
				<li>ステータス: {item.status}</li>
			</ul>

			{#if isOwner}
				<div class="owner-actions">
					<a href={`/items/${item.id}/edit`}>編集</a>
					<button type="button" on:click={handleDelete}>削除</button>
				</div>
				<h2>受取希望</h2>
				{#if claims.length === 0}
					<p>まだ受取希望はありません。</p>
				{:else}
					{#each claims as claim}
						<div class="claim">
							<p>希望者: {claim.claimerId}</p>
							<p>配送先: {claim.shippingAddress || '手渡し希望'}</p>
							<p>ステータス: {claim.status}</p>
							{#if claim.status === 'pending'}
								<div class="actions">
									<button type="button" on:click={() => handleApprove(claim)}>承認</button>
									<button type="button" on:click={() => handleReject(claim.id)}>却下</button>
								</div>
							{/if}
						</div>
					{/each}
				{/if}
			{:else}
				{#if $authUser}
					{#if myClaim}
						<p>あなたの受取希望: {myClaim.status}</p>
						{#if threadId}
							<button type="button" on:click={() => goto(`/threads/${threadId}`)}>
								チャットへ
							</button>
						{/if}
					{:else}
						<a class="primary" href={`/items/${item.id}/claim`}>受取希望を送る</a>
					{/if}
				{:else}
					<a class="primary" href="/login">ログインして受取希望</a>
				{/if}
			{/if}
		</div>
	</section>
{/if}

<style>
	.detail {
		display: grid;
		grid-template-columns: 1.1fr 1fr;
		gap: 2rem;
	}

	.images {
		display: grid;
		gap: 0.8rem;
	}

	img {
		width: 100%;
		border-radius: 12px;
		object-fit: cover;
	}

	.placeholder {
		background: #f0f0f0;
		padding: 2rem;
		border-radius: 12px;
		text-align: center;
	}

	.claim {
		background: #f7f7f7;
		padding: 1rem;
		border-radius: 8px;
		margin-top: 0.6rem;
	}

	.owner-actions {
		display: flex;
		gap: 0.6rem;
		margin: 1rem 0;
	}

	.owner-actions a,
	.owner-actions button {
		padding: 0.4rem 0.8rem;
		border-radius: 6px;
		border: 1px solid #ccc;
		background: white;
	}

	.actions {
		display: flex;
		gap: 0.5rem;
		margin-top: 0.5rem;
	}

	.primary {
		display: inline-block;
		padding: 0.6rem 1.2rem;
		background: #1b1b1b;
		color: white;
		border-radius: 6px;
	}

	@media (max-width: 900px) {
		.detail {
			grid-template-columns: 1fr;
		}
	}
</style>
