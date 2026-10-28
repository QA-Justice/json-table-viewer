# Chrome Web Store 등록 자료 — JSON Table Viewer 1.2.2

개발자 대시보드(https://chrome.google.com/webstore/devconsole)의 각 탭에 그대로 복사해서 붙여넣으면 됩니다.
업로드할 패키지: `json-table-viewer-1.2.2-store.zip` (이 폴더는 패키지에 포함되지 않습니다)

---

## 1. 패키지 (Package)

| 항목 | 값 |
| --- | --- |
| 파일 | `json-table-viewer-1.2.2-store.zip` |
| 버전 | 1.2.2 (`manifest.json`) |
| Manifest | V3 |

> 이미 스토어에 게시된 버전과 같거나 낮으면 업로드가 거절됩니다. 그 경우 `manifest.json`의 버전을 올려서 다시 패키징하세요.

---

## 2. 스토어 등록정보 (Store listing)

**이름** (manifest에서 자동으로 들어감)

```
JSON Table Viewer
```

**요약** (manifest `description`에서 자동으로 들어감)

```
Convert JSON to table with CSV export, pivot view, and clipboard copy.
```

**설명** (Description) — 추천: 영어 + 한국어 소개 + 출처

```
Paste JSON and read it as a table — right in Chrome's side panel.

Built for QA engineers and developers who check API responses every day. Nested objects, arrays, and irregular keys become one flat table you can search, pivot, and paste straight into a bug report.

JSON을 붙여넣으면 사이드 패널에서 바로 표로 보여줍니다. 중첩 객체·배열·불규칙한 키도 한 표로 펼치고, 검색, 피벗, 마크다운 복사, CSV 다운로드를 지원합니다. 데이터는 브라우저 밖으로 나가지 않습니다.

━━━━━━━━━━━━━━━━━━━━

✔ CONVERT
• Paste, type, or upload a .json file — Convert or Ctrl + Enter
• Arrays become rows, keys become columns
• Sample JSON and one-click Reset for a quick try

✔ FLATTEN
• Nested objects and arrays → columns: address.city, scores[0]
• Irregular keys across records are merged into one table
• Original key order is kept
• null, boolean, number, and string are styled by type

✔ FIND — Ctrl + F
• Chrome's find bar doesn't work in side panels. This one does.
• Searches column headers and cells, every match highlighted
• Enter / Shift + Enter (or F3) to jump · Esc to close

✔ PIVOT
• Turn fields into rows — wide records fit a narrow panel

✔ COPY & EXPORT
• Copy as a Markdown table → Jira, GitHub, Confluence, Notion
• Copy as tab-separated text → Excel, Google Sheets
• Download CSV

✔ MORE
• Long values stay on one line; hover to see the full value
• Panel zoom: Ctrl + = / - / 0

━━━━━━━━━━━━━━━━━━━━

🔒 PRIVATE
No tracking. No analytics. No network requests.
Everything runs locally — even offline. Your JSON never leaves your computer.

━━━━━━━━━━━━━━━━━━━━

CREDITS
UI design adapted from the StudioBlank Design System by Chef (@chef), licensed under the MIT License and available through DESIGN.md. This extension is independently developed and is not affiliated with or endorsed by the original creator or DESIGN.md.
Fonts: Inter, IBM Plex Mono, Pretendard (SIL Open Font License).
```

| 항목 | 값 |
| --- | --- |
| 카테고리 (Category) | **Developer Tools** |
| 언어 (Language) | **English** |

### 그래픽 저작물 (Graphic assets)

| 칸 | 파일 | 규격 | 필수 |
| --- | --- | --- | --- |
| 스토어 아이콘 | `store-icon-128.png` | 128×128, 투명 여백 16px | ✅ |
| 스크린샷 1 | `screenshot-1-convert-1280x800.png` | 1280×800 | ✅ (최소 1장) |
| 스크린샷 2 | `screenshot-2-flatten-1280x800.png` | 1280×800 | |
| 스크린샷 3 | `screenshot-3-pivot-1280x800.png` | 1280×800 | |
| 스크린샷 4 | `screenshot-4-find-1280x800.png` | 1280×800 | |
| 스크린샷 5 | `screenshot-5-export-1280x800.png` | 1280×800 | |
| 작은 프로모션 타일 | `small-promo-tile-440x280.png` | 440×280 | ✅ |
| 마키 프로모션 타일 | `marquee-promo-tile-1400x560.png` | 1400×560 | 선택 |

스크린샷과 타일은 알파 채널 없는 24비트 PNG입니다. 기존 스토어 이미지를 교체할 때는 대시보드에서 이전 이미지를 지우고 새로 올리세요.

### 추가 입력란

| 항목 | 값 |
| --- | --- |
| 홈페이지 URL | `https://github.com/QA-Justice/json-table-viewer` (공개 저장소) |
| 지원 URL | `https://github.com/QA-Justice/json-table-viewer/issues` |
| 성인용 콘텐츠 | 아니요 |

---

## 3. 개인정보 보호 관행 (Privacy practices)

### 단일 목적 (Single purpose description)

```
JSON Table Viewer has a single purpose: to display JSON that the user pastes or uploads as a readable table in Chrome's side panel. All features — flattening nested objects and arrays into columns, find (Ctrl + F), pivot, copying as Markdown or text, and exporting as CSV — serve only this purpose of viewing and extracting JSON data as a table. All processing happens locally in the browser; no data is collected or transmitted.
```

### 권한 사용 이유 (Permission justification)

**sidePanel**

```
The extension's entire UI lives in Chrome's side panel. The sidePanel permission is used to open the viewer there when the user clicks the toolbar icon, so JSON can be read next to the page being tested.
```

**clipboardRead** (optional permission)

```
Optional. Requested only when the user clicks the "📋 Paste" button, to read the JSON text the user copied and put it into the input box. The clipboard is read only on that click, never in the background, and the text is processed locally and not stored or sent anywhere. Users who prefer can paste with Ctrl+V instead without granting it.
```

**호스트 권한 (Host permissions)**: 없음

### 원격 코드 (Remote code)

```
No, I am not using remote code.
```

### 데이터 사용 (Data usage)

수집하는 사용자 데이터: **모두 체크하지 않음**

> 붙여넣은 JSON은 브라우저 안에서만 처리되고 저장·전송되지 않습니다. `localStorage`에는 패널 확대 배율만 저장합니다. "Buy me a coffee" 링크는 사용자가 클릭할 때만 새 탭으로 열리며, 데이터를 보내지 않습니다.

인증 3개 모두 체크:

- ☑ I do not sell or transfer user data to third parties, outside of the approved use cases
- ☑ I do not use or transfer user data for purposes that are unrelated to my item's single purpose
- ☑ I do not use or transfer user data to determine creditworthiness or for lending purposes

### 개인정보처리방침 URL

수집하는 데이터가 없으므로 필수가 아닙니다. 넣고 싶다면 아래 글을 공개된 곳에 올려 그 URL을 넣으세요.

```
Privacy Policy — JSON Table Viewer

JSON Table Viewer does not collect, store, or transmit any personal or user data.

• All JSON you paste, type, or upload is processed locally in your browser and is never sent to any server.
• The extension makes no network requests. It contains no analytics, tracking, or advertising.
• The optional clipboard permission is used only when you click "Paste", to read the text you copied into the input box. Nothing is stored.
• The only thing saved is your panel zoom level, in your browser's local storage on your device.

Contact: <연락받을 이메일 주소>
```
