# Hash Table：鏈結法（Separate Chaining）

這是一個資料結構作業範例，使用 C++ 自行實作雜湊表與單向鏈結串列。

專案同時提供純 HTML / CSS / JavaScript 的互動網頁版，可部署到 GitHub Pages，直接在瀏覽器輸入數字、逐步執行並觀察碰撞與鏈結結果。

**線上操作：<https://stxrduzz404.github.io/HashTableChaining13/>**

## 題目要求

- 雜湊函式：`h(key) = key % 13`
- 碰撞處理：鏈結法（Separate Chaining）
- 輸入資料：15 個整數
- 桶的索引：0～12

程式也能處理負數；例如 `-1` 會被放入第 12 桶，而不是使用負索引。

## 專案內容

- `main.cpp`：完整程式碼
- `index.html`、`styles.css`、`script.js`：互動網頁版
- `.vscode/tasks.json`：VS Code 的 MSVC 與 g++ 編譯工作
- `.gitignore`：忽略編譯產生的檔案

## 操作網頁版

開啟上方的 GitHub Pages 網址即可直接操作。網頁支援：

- 一次建立完整雜湊表
- 逐筆加入與自動播放
- 碰撞次數、載入因子與處理進度
- 查找指定整數並高亮所在的桶與節點
- 電腦與手機版響應式介面

## 在 VS Code 執行

1. 用 VS Code 開啟此資料夾。
2. 按 `Ctrl + Shift + B`。
3. 選擇可用的編譯器：
   - `Build (MSVC)`：Windows 已安裝 Visual Studio C++ 工具時使用。
   - `Build (g++)`：已安裝 MinGW-w64 / g++ 時使用。
4. 在 VS Code 終端機執行：

```powershell
.\hash_table.exe
```

## 測試資料

依序輸入：

```text
18 41 22 44 59 32 31 73 46 66 87 100 115 28 65
```

由於每個新節點都插在鏈結串列的前端，最後應看到：

```text
[0] 65 -> NULL
[1] 66 -> NULL
[2] 28 -> 41 -> NULL
[3] EMPTY
[4] EMPTY
[5] 31 -> 44 -> 18 -> NULL
[6] 32 -> NULL
[7] 46 -> 59 -> NULL
[8] 73 -> NULL
[9] 100 -> 87 -> 22 -> NULL
[10] EMPTY
[11] 115 -> NULL
[12] EMPTY
```

## 演算法說明

插入每個數字時先計算 `key % 13`。如果該桶已有數字，就新增一個節點並接到該桶鏈結串列的最前端。因此，同一個餘數的數字會留在同一條鏈上，不會互相覆蓋。

- 平均插入時間：`O(1)`
- 平均查找時間：`O(1)`（資料分布均勻時）
- 最壞查找時間：`O(n)`（所有數字都落在同一桶時）
- 空間複雜度：`O(n + 13)`，可簡寫為 `O(n)`

## 上傳 GitHub

建立空白 GitHub repository 後，在本資料夾執行：

```powershell
git init
git add .
git commit -m "Add hash table with separate chaining"
git branch -M main
git remote add origin https://github.com/你的帳號/你的repository.git
git push -u origin main
```
