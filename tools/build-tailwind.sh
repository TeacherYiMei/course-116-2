#!/usr/bin/env bash
# 單元一（11601/digital）的 Tailwind 樣式：改頁面上的 class 之後重跑一次，產生固定的 tailwind.css
# 需要 Node.js；第一次會自動下載 tailwindcss v3（和原本的 cdn.tailwindcss.com 同一版）
set -e
cd "$(dirname "$0")/.."
printf '@tailwind base;\n@tailwind components;\n@tailwind utilities;\n' > /tmp/tw-in.css
cat tools/tailwind-extra.css >> /tmp/tw-in.css   # 投影可讀性：淡色加深（要接在 utilities 後面）
npx -y tailwindcss@3 -c tools/tailwind.config.js -i /tmp/tw-in.css -o 11601/digital/tailwind.css --minify
echo "✔ 11601/digital/tailwind.css"
