# course115-1 v7：多教師班級權限設定

v7 新增「不同教師登入，只能看到自己班級」的權限控制。

## 一、教師文件格式

Firestore 的 `teachers` 集合中，每位教師使用自己的 Authentication UID 作為文件 ID。

### 一般教師範例

文件：

`teachers/教師A的UID`

欄位：

- `role`：string → `teacher`
- `displayName`：string → `王老師`
- `classes`：array → `["901", "902"]`

這位教師登入後，只能看到 901、902。

另一位教師：

`teachers/教師B的UID`

欄位：

- `role`：string → `teacher`
- `displayName`：string → `陳老師`
- `classes`：array → `["903", "904"]`

這位教師只會看到 903、904。

## 二、管理者

如果希望某個帳號可以查看全部班級：

- `role`：string → `admin`
- `displayName`：string → `資訊管理者`

`classes` 可以省略。

admin 可以讀取全部學生資料與全部班級。

## 三、Firebase Console 如何加入 classes

Firestore → 資料 → `teachers` → 點選教師 UID 文件。

新增欄位：

- 欄位名稱：`classes`
- 類型：`array`
- 加入元素，例如：
  - string：`901`
  - string：`902`

也可新增：

- `displayName`
- 類型：string
- 值：例如 `王老師`

## 四、Firestore Rules

v7 根目錄中的 `firestore.rules` 已改為：

- 學生只能讀寫自己的學生文件
- 一般教師只能讀 `classes` 中授權班級
- admin 可讀全部班級
- 教師前端無法自行修改自己的 role 或 classes
- 一般教師不能靠手動改網址讀取其他班級資料

請把 v7 的 `firestore.rules` 全部複製到：

Firestore Database → 規則 → 貼上 → 發布

## 五、教師端

網址：

`https://你的GitHub帳號.github.io/course115-1/teacher.html`

一般教師登入後：
- 上方會顯示教師名稱
- 顯示被授權班級
- 班級下拉選單只出現授權班級
- Excel 只能下載授權班級

admin 登入後：
- 可以查看全部班級
- 可以下載任何班級 Excel

## 六、建立第二位教師

1. Firebase Authentication → 使用者 → 新增使用者
2. 建立第二位教師 Email / 密碼
3. 複製 UID
4. Firestore → `teachers` → 新增文件
5. 文件 ID 貼 UID
6. 加入：
   - `role = teacher`
   - `displayName = 教師姓名`
   - `classes = ["903", "904"]`
7. 不需要修改網站程式碼

## 七、學生資料

學生仍只輸入：
- 班級
- 座號
- 姓名

系統依學生的 `className` 決定哪位教師有權限查看。
