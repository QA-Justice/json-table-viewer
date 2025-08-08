# JSON → Table Viewer – Chrome Extension

A web application that automatically converts JSON data into a table and enables CSV download.  
Useful for deeply nested, irregular, or array-heavy JSON structures that are hard to inspect manually.  
You can paste your JSON or import a file.

---

중첩된 구조나 배열이 많고 key가 불규칙한 JSON 데이터를 표 형태로 변환해주는 크롬 확장 앱입니다.  
JSON을 복사해서 붙여넣거나 파일로 import해서 표로 변환할 수 있고, 표를 CSV로 저장할 수 있어요.


---

![Version](https://img.shields.io/badge/Version-1.1.1-orange.svg)
![License](https://img.shields.io/badge/License-MIT-green.svg)

## ✨ Features

- **JSON Flattening**: Automatically converts nested objects/arrays into a flat structure.
- **Preserves Original Order**: Maintains the original key order from your JSON input.
- **Live Conversion**: Converts JSON instantly upon input.
- **CSV Download**: Save the converted table as a CSV file.
- **Table Pivot**: Transpose rows and columns for different data perspectives.
- **Clipboard Copy**: Copy table data as Markdown or plain text format.
- **Type Coloring**: Highlights `null`, `boolean`, `number`, `string`, and `object` types.
- **Keyboard Shortcut**: Press Ctrl+Enter to convert.
- **Sample Data**: Pre-loaded sample JSON for quick testing.
- **Reset Function**: One-click reset to sample data.

## 🚀 Installation

1. Go to `chrome://extensions`  
2. Enable **Developer Mode** (top right)  
3. Click **Load unpacked** → select `json-table-viewer/` folder  
4. Click the json-table-viewer icon → side panel opens

## 📋 Example

### Input JSON
```json
[
  {
    "name": "Kim",
    "age": 25,
    "address": { "city": "Seoul", "district": "Gangnam" },
    "hobbies": ["Reading", "Workout"]
  },
  {
    "name": "Lee",
    "age": 30,
    "address": { "city": "Busan", "district": "Haeundae" },
    "hobbies": ["Movies", "Cooking"]
  }
]
```

### Output Table

| name | age | address.city | address.district | hobbies[0] | hobbies[1] |
|------|-----|--------------|------------------|------------|------------|
| Kim  | 25  | Seoul        | Gangnam          | Reading    | Workout    |
| Lee  | 30  | Busan        | Haeundae         | Movies     | Cooking    |

### Pivoted Table View

| Field | Row 1 | Row 2 |
|-------|-------|-------|
| name | Kim | Lee |
| age | 25 | 30 |
| address.city | Seoul | Busan |
| address.district | Gangnam | Haeundae |
| hobbies[0] | Reading | Movies |
| hobbies[1] | Workout | Cooking |

### Copy Options
- **Markdown**: Perfect for documentation and GitHub README files
- **Plain Text**: Tab-separated format for Excel/Google Sheets import

## 📁 Project Structure

```
json-table-viewer/
├── index-improved.html      # Main HTML file
├── script-improved.js       # Core JS logic
├── style-improved.css       # Styling
└── manifest.json            # Chrome extension config
```

## 🔧 Tech Stack

- **HTML5**: Markup structure
- **CSS3**: Styling and responsive layout
- **Vanilla JavaScript**: JSON processing and DOM manipulation
- **Chrome Extension API**: Browser integration

## 🎯 Core Logic

### JSON Flattening Algorithm
```js
flattenObject(obj, prefix = '', result = {}) {
  if (Array.isArray(obj)) {
    obj.forEach((item, index) => {
      flattenObject(item, `${prefix}[${index}]`, result);
    });
  } else if (typeof obj === 'object') {
    Reflect.ownKeys(obj).forEach(key => {  // Preserves original order
      const newPrefix = prefix ? `${prefix}.${key}` : key;
      flattenObject(obj[key], newPrefix, result);
    });
  } else {
    result[prefix] = obj;
  }
  return result;
}
```

### Column Naming Rules

- **Flat key**: `name`, `age`
- **Nested object**: `address.city`, `address.district`
- **Array**: `hobbies[0]`, `hobbies[1]`
- **Mixed**: `user.profile.settings[0].value`

### Key Order Preservation

The application maintains the original key order from your JSON input using `Reflect.ownKeys()` instead of `Object.keys()`, ensuring that the table columns appear in the same order as defined in your JSON structure.


## 🔍 Supported Data Types

| Type    | Display   | Color  |
|---------|-----------|--------|
| null    | `null`    | gray (italic) |
| boolean | true/false | green (bold) |
| number  | 123       | blue   |
| string  | "text"    | purple |
| object  | {"key":"value"} | orange (monospace) |

## 📋 Export Options

- **CSV Download**: Standard comma-separated values format with proper UTF-8 encoding
- **Markdown Copy**: Table format suitable for documentation with proper escaping
- **Plain Text Copy**: Tab-separated values for easy spreadsheet import
- **Clipboard Integration**: Modern clipboard API with fallback for older browsers


## 🐛 Troubleshooting

### JSON Parse Errors
- Check for missing commas, quotes, or brackets.
- Use browser devtools console (F12) to debug.

### Table Not Showing
- Ensure JSON is valid and non-empty.
- Check for JS console errors.

### Pivot Issues
- Pivot functionality works best with consistent data structures.
- Large datasets may experience performance delays during pivot operations.

### Performance Issues
- Large data (10,000+ rows) may cause slowness.
- Consider chunking or lazy rendering.
- Pivot operations on wide tables may require horizontal scrolling.

## 📝 License

Distributed under the MIT License.


---

## ☕ Support

If you find this project useful, you can support me here 😋

<p align="left">
  <a href="https://buymeacoffee.com/justice_tia" target="_blank">
    <img src="https://cdn.buymeacoffee.com/buttons/v2/default-yellow.png" alt="Buy Me a Coffee" width="120" />
  </a>
</p>
