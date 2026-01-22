<script lang="ts">
	import { onMount } from 'svelte';
	import { page } from '$app/stores';
	import { goto } from '$app/navigation';
	import { authReady, authUser } from '$lib/stores/auth';
	import { createClaim } from '$lib/api/claims';
	import { getItem, type Item } from '$lib/api/items';

	let item: Item | null = null;
	let shippingAddress = '';
	let shippingConfirmed = false;
	let error = '';
	let isBusy = false;

	onMount(async () => {
		if ($authReady && !$authUser) {
			await goto('/login');
			return;
		}
		item = await getItem($page.params.id);
	});

	$: if ($authReady && !$authUser) {
		goto('/login');
	}

	const handleSubmit = async () => {
		if (!$authUser || !item) return;
		if (item.handoffMethod === 'ship' && !shippingAddress) {
			error = '配送先住所を入力してください。';
			return;
		}
		if (item.handoffMethod === 'ship' && !shippingConfirmed) {
			error = '送料負担の確認が必要です。';
			return;
		}

		error = '';
		isBusy = true;
		try {
			await createClaim({
				itemId: item.id,
				claimerId: $authUser.uid,
				shippingAddress: item.handoffMethod === 'ship' ? shippingAddress : '',
				shippingConfirmed: item.handoffMethod === 'ship' ? shippingConfirmed : false
			});
			await goto(`/items/${item.id}`);
		} catch (err) {
			error = err instanceof Error ? err.message : '受取希望の送信に失敗しました。';
		} finally {
			isBusy = false;
		}
	};
</script>

{#if !item}
	<p>読み込み中...</p>
{:else}
	<section class="form">
		<h1>受取希望</h1>
		<p>対象: {item.title}</p>

		<form on:submit|preventDefault={handleSubmit}>
			{#if item.handoffMethod === 'ship'}
				<label>
					配送先住所
					<textarea bind:value={shippingAddress} rows="4"></textarea>
				</label>
				<label class="checkbox">
					<input type="checkbox" bind:checked={shippingConfirmed} />
					送料は受取側負担であることに同意します
				</label>
			{:else}
				<p>手渡し希望のため、住所入力は不要です。</p>
			{/if}

			{#if error}
				<p class="error">{error}</p>
			{/if}

			<button type="submit" disabled={isBusy}>
				{isBusy ? '送信中...' : '受取希望を送る'}
			</button>
		</form>
	</section>
{/if}

<style>
	.form {
		max-width: 560px;
		margin: 0 auto;
		background: white;
		padding: 2rem;
		border-radius: 12px;
	}

	form {
		display: grid;
		gap: 1rem;
		margin-top: 1rem;
	}

	label {
		display: grid;
		gap: 0.4rem;
		font-weight: 600;
	}

	textarea {
		padding: 0.5rem;
		border: 1px solid #ccc;
		border-radius: 6px;
	}

	.checkbox {
		font-weight: 500;
		display: flex;
		align-items: center;
		gap: 0.6rem;
	}

	.error {
		color: #b00020;
	}
</style>
