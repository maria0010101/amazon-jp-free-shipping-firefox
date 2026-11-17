# 來源與授權範圍

- 指定來源：Amazon Japan Free Shipping Filter，SpeakingApple，Chrome 擴充功能 ID `pakgkmibfflbeegabolaobfgnldglmbn`。
- 網址：https://chromewebstore.google.com/detail/amazon-japan-free-shippin/pakgkmibfflbeegabolaobfgnldglmbn
- 基準：2026-11-17 從本機 Chromium 已安裝 1.0 版唯讀擷取 `manifest.json`、`content.js`；沒有上游 Git commit；原檔僅保留於本機私人工作目錄，不隨本儲存庫散布。
- 原檔與商店未提供明示開源授權，不將第三方程式宣稱為 MIT 或其他開源授權。上游原檔不納入本儲存庫或 XPI；這裡公開的是獨立實作與參考出處。
- 使用者指定此來源，因此保留其免運關鍵字標色的功能意圖。商店另有 FISH 等相似選項，但不是本次指定來源。
- `extension/` 是重新實作的 Firefox MV3 版本，使用通用 DOM API 與獨立 CSS；無遠端程式碼、背景程序、追蹤、廣告或付費服務。
- 原版只上綠底、不隱藏商品；原版亦會只因「以上の注文」便上色。此版要求同時存在免運文字，避免把普通滿額付費運送當成免運。
- 新增繁體中文、NFKC／空白正規化、常見否定文字排除、標題排除、移除失效標色、160ms 合併動態更新；實際免運仍以 Amazon 結帳及配送地址為準。
- 本機 Chromium 安裝內容完全未更動。
