<script lang="ts">
	import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth';
	import { goto } from '$app/navigation';
	import { auth } from '$lib/firebase';
	import { authReady, authUser } from '$lib/stores/auth';

	let email = '';
	let password = '';
	let mode: 'signup' | 'signin' = 'signin';
	let error = '';
	let isBusy = false;

	const handleSubmit = async () => {
		error = '';
		isBusy = true;
		try {
			if (mode === 'signup') {
				await createUserWithEmailAndPassword(auth, email, password);
			} else {
				await signInWithEmailAndPassword(auth, email, password);
			}
			await goto('/items');
		} catch (err) {
			if (err instanceof Error) error = err.message;
			else error = 'ログインに失敗しました。';
		} finally {
			isBusy = false;
		}
	};
</script>

<section class="login">
	<h1>ログイン / 新規登録</h1>
	{#if $authReady && $authUser}
		<p>ログイン済みです。<a href="/items">一覧へ</a></p>
	{:else}
		<form on:submit|preventDefault={handleSubmit}>
			<label>
				メールアドレス
				<input type="email" bind:value={email} required />
			</label>
			<label>
				パスワード
				<input type="password" bind:value={password} minlength="6" required />
			</label>

			<div class="mode">
				<label>
					<input type="radio" bind:group={mode} value="signin" />
					ログイン
				</label>
				<label>
					<input type="radio" bind:group={mode} value="signup" />
					新規登録
				</label>
			</div>

			{#if error}
				<p class="error">{error}</p>
			{/if}

			<button type="submit" disabled={isBusy}>
				{isBusy ? '処理中...' : mode === 'signup' ? '登録する' : 'ログインする'}
			</button>
		</form>
	{/if}
</section>

<style>
	.login {
		max-width: 420px;
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

	input {
		padding: 0.5rem;
		border: 1px solid #ccc;
		border-radius: 6px;
	}

	.mode {
		display: flex;
		gap: 1rem;
	}

	.error {
		color: #b00020;
	}
</style>
