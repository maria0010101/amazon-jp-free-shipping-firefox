# Amazon 日本免運標示

Firefox 與 Firefox for Android 的輕量 WebExtension：在 Amazon 日本搜尋結果／商品卡片，替出現免運文字的商品加上淡綠底與左側綠線，含條件式免運。不隱藏其他商品、不增加網路請求、不蒐集或傳送個人資料。

專案網址：https://github.com/maria0010101/amazon-jp-free-shipping-firefox

## 相容性與目前狀態

- 桌面 Firefox 140+、Android Firefox 142+。
- 支援日、英、韓、簡體中文與繁體中文免運文字；商品動態更新後重新辨識。
- Firefox 160 隔離測試的 19 項檢查通過，web-ext lint 無錯誤／警告。
- Android 尚未實機驗證；Amazon 公開實站測試因連線逾時受阻。窄版截圖是桌面 Firefox 人工 fixture，不是 Android 實測。
- 已申請 Mozilla 不公開簽章，尚待審查；這份來源不是已簽章安裝檔。
- 標色只代表頁面出現免運文字，實際免運資格、門檻及可配送地區以配送地址與 Amazon 結帳畫面為準。

## 安裝與開發

```sh
npm ci
npm run lint
npm run build
npm run test:firefox
```

測試還需安裝桌面 Firefox、OpenSSL 與可用的 geckodriver。建置會輸出 `dist/amazon-jp-free-shipping-1.0.0-unsigned.xpi`。

### 桌面暫時試用

Firefox 開啟 `about:debugging#/runtime/this-firefox` →「載入暫時附加元件」→選取 `extension/manifest.json`，再開啟／重新整理 Amazon 日本搜尋頁。重開 Firefox 後暫時安裝會移除。

### Android 與永久安裝

正式版長期安裝需要 Mozilla 簽章；不要把建置輸出的 unsigned XPI 當作已簽章檔。取得已簽章檔後，在支援檔案安裝的 Android Firefox 版本，設定 →「關於 Firefox」→連點標誌啟用開發者選單，再返回設定 →「安裝擴充套件檔案」。實際選項名稱依版本而異；沒有該入口時需使用支援 Android 的 AMO 公開頁面安裝。

本專案未公開上架 AMO；GitHub 儲存庫公開不代表 AMO 簽章已核准。送審與下載工具位於 `scripts/`，API 憑證必須放在儲存庫之外，禁止提交金鑰。

## 原始參考出處

功能與商品卡片辨識方式參考 SpeakingApple 提供的 Chrome 擴充功能 **Amazon Japan Free Shipping Filter 1.0**：

https://chromewebstore.google.com/detail/amazon-japan-free-shippin/pakgkmibfflbeegabolaobfgnldglmbn

這裡公開的是獨立實作的 Firefox／Android 改作，不包含未附明示開源授權的原始擴充功能檔案；不是原作者官方發布或背書的版本。

詳見 [來源說明](docs/SOURCE.md)、[測試報告](docs/TEST-REPORT.md)、[附加元件說明](docs/ADDON-DESCRIPTION.md)。
