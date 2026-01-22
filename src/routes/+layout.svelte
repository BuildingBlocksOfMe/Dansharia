<script lang="ts">
	import favicon from '$lib/assets/favicon.svg';
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import { browser } from '$app/environment';
	import { signOut } from 'firebase/auth';

	import { auth } from '$lib/firebase';
	import { authReady, authUser, initAuth } from '$lib/stores/auth';

	let { children } = $props();

	onMount(() => {
		if (browser) initAuth();
	});

	const handleSignOut = async () => {
		await signOut(auth);
		await goto('/');
	};
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
</svelte:head>

<div class="app">
	<header>
		<div class="logo">
			<a href="/">断捨離手放し</a>
		</div>
		<nav>
			<a href="/items">一覧</a>
			<a href="/items/new">出品</a>
			{#if $authReady && $authUser}
				<button type="button" on:click={handleSignOut}>ログアウト</button>
			{:else}
				<a href="/login">ログイン</a>
			{/if}
		</nav>
	</header>

	<main>
		{@render children()}
	</main>
</div>

<style>
	.app {
		font-family: system-ui, sans-serif;
		min-height: 100vh;
		background: #f8f8f8;
		color: #1b1b1b;
	}

	header {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: 1rem 2rem;
		background: white;
		border-bottom: 1px solid #e3e3e3;
	}

	nav {
		display: flex;
		gap: 1rem;
		align-items: center;
	}

	main {
		padding: 2rem;
		max-width: 1080px;
		margin: 0 auto;
	}

	a {
		color: inherit;
		text-decoration: none;
	}

	button {
		padding: 0.4rem 1rem;
		border: 1px solid #ccc;
		background: #fff;
		border-radius: 4px;
		cursor: pointer;
	}
</style>
