# JSON → Table Viewer – Chrome Extension

A web application that automatically converts JSON data into a table and enables CSV download.  
Useful for deeply nested, irregular, or array-heavy JSON structures that are hard to inspect manually.  
You can paste your JSON or import a file.

---

중첩된 구조나 배열이 많고 key가 불규칙한 JSON 데이터를 표 형태로 변환해주는 크롬 확장 앱입니다.  
JSON을 복사해서 붙여넣거나 파일로 import해서 표로 변환할 수 있고, 표를 CSV로 저장할 수 있어요.


---

![Version](https://img.shields.io/badge/Version-1.2.2-orange.svg)
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
- **Custom Search**: Press Ctrl+F to search within table data and column headers.
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

### Search Functionality
- **Ctrl+F**: Opens custom search interface
- **Column Headers**: Search within table column names
- **Table Data**: Search within all table cell contents
- **Navigation**: Use Prev/Next buttons to cycle through matches
- **Highlighting**: Matched text is highlighted with color coding
- **Match Counter**: Shows current match position and total matches

## 📁 Project Structure

```
json-table-viewer/
├── index-improved.html      # Main HTML file
├── script-improved.js       # Core JS logic (modularized)
├── utils.js                 # Common utilities (DOM, notifications, file handling)
├── data-processor.js        # JSON processing and data transformation
├── table-renderer.js        # Table rendering logic
├── export-manager.js        # CSV download and clipboard operations
├── ui-manager.js            # UI event handling and user interactions
├── search-content.js        # Custom search functionality
├── style-improved.css       # Styling
└── manifest.json            # Chrome extension config
```

## 🔧 Tech Stack

- **HTML5**: Markup structure
- **CSS3**: Styling and responsive layout
- **Vanilla JavaScript**: JSON processing and DOM manipulation
- **ES6 Modules**: Modular architecture for maintainability
- **Chrome Extension API**: Browser integration

## 🎯 Core Logic

### JSON Flattening Algorithm
```js
// Main flattening function - recursively flattens nested objects and arrays
// 메인 평면화 함수 - 중첩된 객체와 배열을 재귀적으로 평면화
flattenObject(obj, prefix = '', result = {}) {
  if (obj === null || obj === undefined) {
    result[prefix] = obj;
    return result;
  }

  if (Array.isArray(obj)) {
    this.flattenArray(obj, prefix, result);
  } 
  else if (typeof obj === 'object') {
    this.flattenObjectProperties(obj, prefix, result);
  } 
  else {
    result[prefix] = obj;
  }
  
  return result;
}

// Flatten array elements with index notation
// 배열 평면화 - 인덱스 표기법 사용
flattenArray(arr, prefix, result) {
  if (arr.length === 0) {
    result[prefix] = '[]'; 
  } else {
    arr.forEach((item, index) => {
      this.flattenObject(item, `${prefix}[${index}]`, result);
    });
  }
}

// Flatten object properties with dot notation
// 객체 속성 평면화 - 점 표기법 사용
flattenObjectProperties(obj, prefix, result) {
  const keys = Reflect.ownKeys(obj); // Preserves original key order
  if (keys.length === 0) {
    result[prefix] = '{}'; 
  } else {
    keys.forEach(key => {
      const newPrefix = prefix ? `${prefix}.${key}` : key;
      this.flattenObject(obj[key], newPrefix, result);
    });
  }
}
```

### Pivot Table Algorithm
```js
// Transpose table data - convert rows to columns and vice versa
// 테이블 데이터 전치 - 행과 열을 서로 바꿈
createPivotTable(dataArray) {
  if (!dataArray || dataArray.length === 0) return [];

  // Collect all unique keys from the data
  // 데이터에서 모든 고유 키 수집
  const allKeys = this.getAllKeys(dataArray);
  
  // Transform each key into a row
  // 각 키를 행으로 변환
  const pivotData = [];
  allKeys.forEach(key => {
    const row = { Field: key }; // First column is always 'Field'
    
    // Convert each data row's value into a column
    // 각 데이터 행의 값을 컬럼으로 변환
    for (let i = 0; i < dataArray.length; i++) {
      const value = dataArray[i][key] ?? ''; // Use empty string for missing values
      row[`Row ${i + 1}`] = value;
    }
    
    pivotData.push(row);
  });

  return pivotData;
}
```

### Column Naming Rules

- **Flat key**: `name`, `age`
- **Nested object**: `address.city`, `address.district`
- **Array**: `hobbies[0]`, `hobbies[1]`
- **Mixed**: `user.profile.settings[0].value`
- **Empty arrays**: `[]` (빈 배열)
- **Empty objects**: `{}` (빈 객체)

### Key Order Preservation

The application maintains the original key order from your JSON input using `Reflect.ownKeys()` instead of `Object.keys()`, ensuring that the table columns appear in the same order as defined in your JSON structure.

### Data Type Handling

- **null/undefined**: Preserved as-is with special styling
- **Empty arrays**: Displayed as `[]`
- **Empty objects**: Displayed as `{}`
- **Complex objects**: Flattened recursively with dot notation
- **Arrays**: Each element flattened with index notation `[0]`, `[1]`, etc.


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
