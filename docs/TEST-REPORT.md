# 測試報告（2026-11-17）

| 層級 | 結果 |
|---|---|
| web-ext 10.8.0 lint（warnings-as-errors） | errors 0、notices 0、warnings 0，含 Android 最低版本相容性檢查 |
| 真實 Firefox 160.0、全新 profile | 原始交付 XPI 暫時安裝成功；19 項檢查通過 |
| 多語文字與例外 | 日、英、韓、簡中、繁中；條件免運、付費運送、只有滿額文字、常見否定及標題誤判案例通過 |
| 動態內容 | 文字節點更新移除舊標色、元素文字替換、新增輪播卡片通過 |
| 版面與邊界 | 淡綠背景實際套用；390px 無水平溢出；非 Amazon 網域不注入；商品不被隱藏 |
| 圖片檢視 | 人工 fixture 的桌面與窄版截圖保存在 docs/evidence/；不是 Amazon 實站截圖 |
| Amazon 公開實站 | Obscura 0.2.6 擷取 `https://www.amazon.co.jp/s?k=usb+c`，30 秒連線逾時；實站驗證受阻 |
| Android 實機 | 未驗證；ADB 已連接裝置沒有 org.mozilla.firefox，未替使用者安裝其他 App |
| Mozilla 簽章 | 不公開簽章已核准；Firefox 160 全新 profile 永久安裝成功，20 項檢查通過；signatureRequired=true、signedState=2、isActive=true、appDisabled=false、temporarilyInstalled=false |

fixture 使用商品卡片的代表性結構，不能證明 Amazon 所有手機版型或日後變更均有效。390px 是桌面 Firefox 視窗，不是 Android 引擎實測。否定句與語言辨識是保守啟發式，未涵蓋所有自然語言；此工具不計算配送費。

機器結果：原未簽章測試 `docs/evidence/firefox.json`；已簽章測試 `docs/evidence/firefox-signed.json`（2026-11-17T06:16:17Z）。測試套件沒有加入 localhost 權限或測試專用程式；實際 XPI 的 manifest 完全不變。所有自建 Firefox、loopback HTTPS 伺服器與測試私鑰在完成後關閉／移除。

官方參考：

- https://extensionworkshop.com/documentation/develop/developing-extensions-for-firefox-for-android/
- https://extensionworkshop.com/documentation/develop/manifest-v3-migration-guide/
- https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/Content_scripts
- https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/manifest.json/browser_specific_settings
- https://extensionworkshop.com/documentation/develop/firefox-builtin-data-consent/
- https://extensionworkshop.com/documentation/develop/temporary-installation-in-firefox/
- https://extensionworkshop.com/documentation/publish/signing-and-distribution-overview/

已簽章 XPI 保持下載原樣，包含 Mozilla RSA／COSE 簽章；manifest 僅 JSON 格式被 Mozilla 正規化，完整語意與來源一致，JS/CSS 位元組一致。API 的 file status=public 表示核准狀態，不表示公開上架；channel 仍為 unlisted。
