<script lang="ts">
	import { onMount } from 'svelte';
	import { page } from '$app/stores';
	import { goto } from '$app/navigation';
	import { authReady, authUser } from '$lib/stores/auth';
	import { getItem, updateItem, type Item } from '$lib/api/items';
	import { uploadItemImages } from '$lib/api/storage';

	let item: Item | null = null;
	let title = '';
	let description = '';
	let category = '日用品';
	let condition = '良い';
	let handoffMethod: 'ship' | 'meet' = 'ship';
	let files: File[] = [];
	let isBusy = false;
	let error = '';

	const loadItem = async () => {
		item = await getItem($page.params.id);
		if (!item) {
			error = '出品が見つかりません。';
			return;
		}
		if (!$authUser || item.ownerId !== $authUser.uid) {
			await goto('/items');
			return;
		}
		title = item.title;
		description = item.description;
		category = item.category;
		condition = item.condition;
		handoffMethod = item.handoffMethod;
	};

	onMount(loadItem);

	$: if ($authReady && !$authUser) {
		goto('/login');
	}

	const handleFiles = (event: Event) => {
		const target = event.target as HTMLInputElement;
		files = target.files ? Array.from(target.files) : [];
	};

	const handleSubmit = async () => {
		if (!item || !$authUser) return;
		isBusy = true;
		error = '';
		try {
			const images = files.length ? await uploadItemImages(files, $authUser.uid) : item.images;
			await updateItem(item.id, {
				title,
				description,
				category,
				condition,
				handoffMethod,
				images
			});
			await goto(`/items/${item.id}`);
		} catch (err) {
			error = err instanceof Error ? err.message : '更新に失敗しました。';
		} finally {
			isBusy = false;
		}
	};
</script>

{#if !item && !error}
	<p>読み込み中...</p>
{:else if error}
	<p>{error}</p>
{:else}
	<section class="form">
		<h1>出品を編集</h1>
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
				写真（差し替え）
				<input type="file" accept="image/*" multiple on:change={handleFiles} />
			</label>

			{#if item?.images?.length}
				<div class="preview">
					{#each item.images as img}
						<img src={img} alt={item.title} />
					{/each}
				</div>
			{/if}

			{#if error}
				<p class="error">{error}</p>
			{/if}

			<button type="submit" disabled={isBusy}>
				{isBusy ? '更新中...' : '更新する'}
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

	.preview {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
		gap: 0.6rem;
	}

	.preview img {
		width: 100%;
		border-radius: 8px;
	}

	.error {
		color: #b00020;
	}
</style>
