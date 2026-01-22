<script lang="ts">
	import { onMount } from 'svelte';
	import { listItems, type Item } from '$lib/api/items';

	let items: Item[] = [];
	let search = '';
	let category = '';
	let isLoading = true;

	const loadItems = async () => {
		isLoading = true;
		items = await listItems({ category: category || undefined });
		isLoading = false;
	};

	onMount(loadItems);

	$: filtered = items.filter((item) => {
		if (!search) return true;
		const target = `${item.title} ${item.description}`.toLowerCase();
		return target.includes(search.toLowerCase());
	});
</script>

<section class="items">
	<header>
		<h1>出品一覧</h1>
		<div class="filters">
			<input placeholder="キーワード検索" bind:value={search} />
			<select bind:value={category} on:change={loadItems}>
				<option value="">全カテゴリ</option>
				<option value="日用品">日用品</option>
				<option value="家電">家電</option>
				<option value="本">本</option>
				<option value="衣類">衣類</option>
				<option value="その他">その他</option>
			</select>
		</div>
	</header>

	{#if isLoading}
		<p>読み込み中...</p>
	{:else if filtered.length === 0}
		<p>該当する出品がありません。</p>
	{:else}
		<div class="grid">
			{#each filtered as item}
				<a class="card" href={`/items/${item.id}`}>
					{#if item.images?.[0]}
						<img src={item.images[0]} alt={item.title} />
					{/if}
					<div class="card-body">
						<h2>{item.title}</h2>
						<p>{item.description}</p>
						<span class="meta">
							{item.handoffMethod === 'ship' ? '配送' : '手渡し'} / {item.status}
						</span>
					</div>
				</a>
			{/each}
		</div>
	{/if}
</section>

<style>
	.items {
		display: grid;
		gap: 1.5rem;
	}

	header {
		display: flex;
		justify-content: space-between;
		align-items: center;
	}

	.filters {
		display: flex;
		gap: 0.8rem;
	}

	.grid {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
		gap: 1.5rem;
	}

	.card {
		display: grid;
		gap: 0.8rem;
		background: white;
		border-radius: 12px;
		overflow: hidden;
		color: inherit;
		text-decoration: none;
		box-shadow: 0 6px 16px rgba(0, 0, 0, 0.08);
	}

	img {
		width: 100%;
		height: 180px;
		object-fit: cover;
	}

	.card-body {
		padding: 1rem;
	}

	.meta {
		font-size: 0.85rem;
		color: #666;
	}
</style>
