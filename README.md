# 怎麼自己架設?
## 音源下載
https://drive.google.com/file/d/1Qy5EIdMFpG4gBO5RdV2QRRvgRbVFVyA-/edit

### 0. 請確保你的託管商支援
- ffmpeg
- nodejs 建議最新LTS

### 1. 準備資料夾,聲音庫
請將    `XJP音源 v1.0-1.3` 資寮夾移出來並重新命名`"voicebank"`

建立 `temp` 資料夾用於串流生成完的音頻

### 2. 啟動
```
node index.js
```
### 使用的庫
- express (後端接口)
- chinese-to-pinyin (中文轉拼音)
- wav-concat (用於合併音頻)