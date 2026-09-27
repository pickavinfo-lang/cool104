# Expo HAS CHANGED

Read the exact versioned docs at https://docs.expo.dev/versions/v57.0.0/ before writing any code.

## iPhone実機/シミュレータでの確認

`ios/` `android/` は `npx expo prebuild` で自動生成される（どちらも .gitignore 対象で手で編集しない。現在生成済みなのは `ios/` のみ）。ネイティブ設定は `app.json` で行う。

- `npm run ios` — シミュレータで起動（`expo run:ios`）
- 実機確認: iPhoneをケーブル接続し `npx expo run:ios --device`。署名は Xcode（`ios/cool104.xcworkspace`）の Signing & Capabilities で個人の Apple ID チームを選ぶ
- ネイティブ依存を追加/更新したら `cd ios && pod install` を実行してからビルドし直す
- `npm run typecheck` — 型チェック。作業の完了前に必ず通すこと
