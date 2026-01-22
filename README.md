# 断捨離手放しサイト

Firebaseを使って不要品を無償で譲渡するSvelteKitアプリです。配送の場合は受取側が送料を負担します。

## セットアップ

1. Firebaseコンソールでプロジェクトを作成
2. Auth（メール/パスワード）、Firestore、Storage、Hostingを有効化
3. `.env` にFirebase設定値を追加

```env
VITE_FIREBASE_API_KEY=...
VITE_FIREBASE_AUTH_DOMAIN=...
VITE_FIREBASE_PROJECT_ID=...
VITE_FIREBASE_STORAGE_BUCKET=...
VITE_FIREBASE_MESSAGING_SENDER_ID=...
VITE_FIREBASE_APP_ID=...
```

## 動作確認（ローカル）

```sh
npm run dev -- --open
```

- 新規登録でアカウント作成
- 出品を1件作成
- 別アカウントで受取希望を送信
- 出品者で承認 → チャット開始

## Firebase初期化とデプロイ手順

1. Firebase CLIを用意（未導入なら）

```sh
npm i -g firebase-tools
```

2. プロジェクトの初期化

```sh
firebase login
firebase init
```

- Firestore/Storage/Hosting を選択
- Hosting の public は `build`
- SPAの場合は `index.html` へリライト（`firebase.json` 済）

3. ルール反映とデプロイ

```sh
firebase deploy
```

もしくは:

```sh
npm run deploy
```

## 開発

```sh
npm run dev -- --open
```

## ビルド

```sh
npm run build
npm run preview
```

## Firebase設定

Firestore/Storageルールは `firestore.rules` / `storage.rules` を参照してください。Hostingは `firebase.json` に合わせて `build` を配信します。
