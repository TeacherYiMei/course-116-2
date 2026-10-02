/* 116 課程系統：快速檢核的對錯與提示已移除（在驗證伺服器，來源在 private/11601/digital/review.json） */
window.CourseData = {
  navigation: [
    { href: 'index.html', label: '課程地圖' },
    { href: '1.html', label: '單元一：二進位', unit: '1' },
    { href: '2.html', label: '單元二：文字編碼', unit: '2' },
    { href: '3.html', label: '單元三：數位聲音', unit: '3' },
    { href: '4.html', label: '單元四：數位影像', unit: '4' }
  ],
  units: {
    '1': {
      theme: 'blue',
      card: { code: 'BINARY', title: '二進位原理', description: '從位元開始，理解電腦如何用開與關表示數字。' },
      goals: {
        heading: '完成這一單元，你可以……',
        sequence: '建議順序：概念 → 練習 → 挑戰',
        items: ['用位元的權值讀出二進位數字。', '在十進位與二進位之間轉換。', '用 0 與 1 解釋電腦如何表示資料。']
      },
      review: {
        title: '課後回顧：0 與 1 能做什麼？',
        reflections: ['我能說明：一個位元為什麼只有兩種狀態。', '我能計算：二進位 10110 代表多少。', '我能連結：今天的練習如何對應電腦中的資料。'],
        badge: '🏅 位元觀察員徽章已解鎖！',
        questions: [
          { question: '一個位元可表示幾種狀態？', choices: [{ label: '10 種' }, { label: '2 種' }] },
          { question: '二進位 10110 是多少？', choices: [{ label: '22' }, { label: '18' }] },
          { question: '最右邊位元的權值是？', choices: [{ label: '16' }, { label: '1' }] }
        ]
      },
      discussion: { scenario: '要用 5 個位元表示「一個月有幾天」，你會怎麼做？', choices: ['用 0 與 1 組合出 28～31', '直接記錄十進位數字'] }
    },
    '2': {
      theme: 'indigo',
      card: { code: 'TEXT', title: '文字數位化', description: '解讀文字編碼，親手傳送與破解摩斯電碼。' },
      goals: {
        heading: '完成這一單元，你可以……',
        sequence: '建議順序：訊號 → 編碼 → 轉換',
        items: ['用摩斯電碼理解共同規則的重要。', '說明文字如何對應成數字與位元。', '分辨 ASCII、Big-5 與 Unicode 的用途。']
      },
      review: {
        title: '課後回顧：文字需要一份共同的暗號本。',
        reflections: ['我能解釋：沒有共同編碼時，訊息為何可能被誤解。', '我能舉例：一個字元如何被轉成位元組合。', '我能比較：不同編碼為何需要共存與演進。'],
        badge: '🏅 編碼解讀員徽章已解鎖！',
        questions: [
          { question: '解碼摩斯密碼時，字母間要靠什麼區分？', choices: [{ label: '停頓／空白' }, { label: '點的數量' }] },
          { question: '為什麼雙方需要共同編碼？', choices: [{ label: '讓檔案變大' }, { label: '正確解讀訊息' }] },
          { question: '摩斯密碼的基本符號是？', choices: [{ label: '點與劃' }, { label: '0 與 1' }] }
        ]
      },
      discussion: { scenario: '班上要傳送含有表情符號的新訊息，你會優先選擇哪種做法？', choices: ['採用支援更多字元的共同編碼', '每個人自行約定符號'] }
    },
    '3': {
      theme: 'teal',
      card: { code: 'AUDIO', title: '音訊數位化', description: '看見聲波、取樣與格式如何保存一段聲音。' },
      goals: {
        heading: '完成這一單元，你可以……',
        sequence: '建議順序：波形 → 取樣 → 格式',
        items: ['用振幅、頻率與音色描述聲音。', '說明聲音取樣與量化的步驟。', '比較 WAV、MP3 與 MIDI 的特性。']
      },
      review: {
        title: '課後回顧：把連續聲音變成數位資料。',
        reflections: ['我能區分：響度、音高與音色分別對應什麼特徵。', '我能說明：取樣率與位元深度各影響什麼。', '我能選擇：依情境挑選合適的聲音格式。'],
        badge: '🏅 數位聲音觀察員徽章已解鎖！',
        questions: [
          { question: '聲音的響度主要對應？', choices: [{ label: '振幅大小' }, { label: '波形密度' }] },
          { question: '取樣點變少時，常見結果是？', choices: [{ label: '保留更多細節' }, { label: '失去波形細節' }] },
          { question: '想節省音訊容量可優先選？', choices: [{ label: 'WAV' }, { label: 'MP3' }] }
        ]
      },
      discussion: { scenario: '要把一段訪談上傳到網路，你會優先採用哪種格式？', choices: ['MP3：兼顧容量與聆聽需求', 'WAV：保留更多原始細節'] }
    },
    '4': {
      theme: 'rose',
      card: { code: 'IMAGE', title: '影像數位化', description: '從像素、色彩到壓縮，拆解一張圖片的祕密。' },
      goals: {
        heading: '完成這一單元，你可以……',
        sequence: '建議順序：像素 → 色彩 → 壓縮',
        items: ['用像素與解析度說明影像的細緻程度。', '理解取樣、量化與色彩深度的關係。', '比較圖片格式與壓縮方式的取捨。']
      },
      review: {
        title: '課後回顧：一張圖片如何變成資料？',
        reflections: ['我能區分：解析度、色彩深度與檔案大小並不相同。', '我能說明：降低色彩或尺寸為何能減少檔案容量。', '我能選擇：依透明背景、照片或動畫挑選圖片格式。'],
        badge: '🏅 圖像資料判讀員徽章已解鎖！',
        questions: [
          { question: '透明背景的圖示優先選？', choices: [{ label: 'JPG' }, { label: 'PNG' }] },
          { question: '想讓照片檔案較小可優先選？', choices: [{ label: 'JPG' }, { label: 'PNG' }] },
          { question: '降低解析度通常會？', choices: [{ label: '檔案更大' }, { label: '像素與容量變少' }] }
        ]
      },
      discussion: { scenario: '要製作透明背景的社團 Logo 並放上網站，你會怎麼選？', choices: ['PNG：保留透明背景與清楚邊緣', 'JPG：把照片壓縮得更小'] }
    }
  }
};

// The serialized copy lets the shared core read configuration even when it loads after the page.
document.documentElement.dataset.courseData = JSON.stringify(window.CourseData);
