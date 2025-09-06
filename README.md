# LINEBOT定期実行Worker

このプロジェクトは、Cloudflare Workersを使用してLINEボットに定期的にメッセージを送信するためのWorkerアプリケーションです。

## 機能

- LINEボットのWebhook受信
- 定期実行でのメッセージ送信（毎日0:00 JST）
- LINE署名検証
- グループ/ルーム/ユーザーID の自動ログ出力

## 必要な環境変数

以下の環境変数を設定する必要があります：

| 環境変数名 | 説明 |
|-----------|------|
| `LINE_CHANNEL_ACCESS_TOKEN` | LINE Messaging APIのチャネルアクセストークン |
| `LINE_TO_ID` | メッセージ送信先のID（ユーザーID、グループID、ルームID） |
| `LINE_CHANNEL_SECRET` | LINE Messaging APIのチャネルシークレット |

## セットアップ手順

### 1. LINE Developer設定

1. [LINE Developer Console](https://developers.line.biz/console/) にアクセス
2. 新しいプロバイダーまたは既存のプロバイダーを選択
3. 「Messaging API」チャネルを作成
4. チャネル基本設定から以下を取得：
   - チャネルアクセストークン（長期）
   - チャネルシークレット
5. Webhook URLを設定（デプロイ後のWorker URL）

### 2. 送信先IDの取得

**個人ユーザーへの送信の場合：**
- ボットを友達追加後、何かメッセージを送信
- Worker のログからユーザーIDを確認

**グループでの使用の場合：**
- ボットをグループに招待
- グループで何かメッセージを送信
- Worker のログからグループIDを確認

### 3. 環境変数の設定

```bash
# 開発環境用
wrangler secret put LINE_CHANNEL_ACCESS_TOKEN
wrangler secret put LINE_TO_ID
wrangler secret put LINE_CHANNEL_SECRET
```

### 4. デプロイ

```bash
# 開発サーバーの起動
npm run dev

# 本番環境へのデプロイ
npm run deploy
```

## コマンド一覧

```bash
# 開発サーバーの起動
npm run dev
npm start

# 本番環境へのデプロイ
npm run deploy

# テストの実行
npm test
```

## 定期実行の設定

定期実行の時刻は `src/index.js` の以下の部分で変更できます：

```javascript
// 定期実行時刻を設定（0:00 JST）
const SCHEDULED_HOUR = 0;      // 時（0-23）
const SCHEDULED_MINUTE = 0;    // 分（0-59）
```

現在の設定では毎日午前0時（JST）に「お薬はちゃんと飲みましたか？」というメッセージが送信されます。

## トラブルシューティング

### 署名検証エラーが発生する場合
- `LINE_CHANNEL_SECRET` が正しく設定されているか確認
- Webhook URLが正しく設定されているか確認

### メッセージが送信されない場合
- `LINE_CHANNEL_ACCESS_TOKEN` が有効か確認
- `LINE_TO_ID` が正しいか確認
- ボットが対象のユーザー/グループに参加しているか確認

### Cronが動作しない場合
- Cloudflare Workersの無料プランではCron Triggersに制限があります
- Cloudflare Dashboardでスケジュールが正しく設定されているか確認

## 開発者向け情報

- **フレームワーク**: Cloudflare Workers
- **テストフレームワーク**: Vitest with Cloudflare Workers Pool
- **デプロイツール**: Wrangler

## ライセンス

このプロジェクトはプライベートプロジェクトです。