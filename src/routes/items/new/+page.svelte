<script lang="ts">
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import { authReady, authUser } from '$lib/stores/auth';
	import { createItem } from '$lib/api/items';
	import { uploadItemImages } from '$lib/api/storage';

	let title = '';
	let description = '';
	let category = '日用品';
	let condition = '良い';
	let handoffMethod: 'ship' | 'meet' = 'ship';
	let files: File[] = [];
	let isBusy = false;
	let error = '';

	onMount(() => {
		if ($authReady && !$authUser) goto('/login');
	});

	$: if ($authReady && !$authUser) {
		goto('/login');
	}

	const handleSubmit = async () => {
		if (!$authUser) return;
		isBusy = true;
		error = '';
		try {
			const images = await uploadItemImages(files, $authUser.uid);
			await createItem($authUser.uid, {
				title,
				description,
				category,
				condition,
				images,
				handoffMethod,
				shippingCostPaidBy: 'receiver'
			});
			await goto('/items');
		} catch (err) {
			error = err instanceof Error ? err.message : '出品に失敗しました。';
		} finally {
			isBusy = false;
		}
	};

	const handleFiles = (event: Event) => {
		const target = event.target as HTMLInputElement;
		files = target.files ? Array.from(target.files) : [];
	};
</script>

<section class="form">
	<h1>出品する</h1>
	<form on:submit|preventDefault={handleSubmit}>
		<label>
			タイトル
			<input bind:value={title} required />
		</label>
		<label>
			説明
			<textarea bind:value={description} rows="4" required></textarea>
		</label>
		<label>
			カテゴリ
			<select bind:value={category}>
				<option value="日用品">日用品</option>
				<option value="家電">家電</option>
				<option value="本">本</option>
				<option value="衣類">衣類</option>
				<option value="その他">その他</option>
			</select>
		</label>
		<label>
			状態
			<select bind:value={condition}>
				<option value="新品">新品</option>
				<option value="良い">良い</option>
				<option value="使用感あり">使用感あり</option>
			</select>
		</label>
		<label>
			受け渡し方法
			<select bind:value={handoffMethod}>
				<option value="ship">配送（送料は受取側負担）</option>
				<option value="meet">手渡し</option>
			</select>
		</label>
		<label>
			写真
			<input type="file" accept="image/*" multiple on:change={handleFiles} />
		</label>

		{#if error}
			<p class="error">{error}</p>
		{/if}

		<button type="submit" disabled={isBusy}>
			{isBusy ? '出品中...' : '出品する'}
		</button>
	</form>
</section>

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
	}

	label {
		display: grid;
		gap: 0.4rem;
		font-weight: 600;
	}

	input,
	select,
	textarea {
		padding: 0.5rem;
		border: 1px solid #ccc;
		border-radius: 6px;
	}

	.error {
		color: #b00020;
	}
</style>
