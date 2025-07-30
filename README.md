# JSON → Table Viewer – Chrome Extension

A web application that automatically converts JSON data into a table and enables CSV download.  
Especially useful for deeply nested, irregular, or array-heavy JSON structures that are hard to inspect manually.  
You can paste your JSON or import a file.

---

중첩된 구조나 배열이 많고 key가 불규칙한 JSON 데이터를 표 형태로 변환해주는 크롬 확장 앱입니다.  
JSON을 복사해서 붙여넣거나 파일로 import해서 표로 변환할 수 있고, 표를 CSV로 저장할 수 있어요.


---

![Version](https://img.shields.io/badge/Version-1.0.0-orange.svg)  
![License](https://img.shields.io/badge/License-MIT-green.svg)

## ✨ Features

- **JSON Flattening**: Automatically converts nested objects/arrays into a flat structure.
- **Preserves Structure**: Reflects JSON hierarchy in column names (`address.city`, `hobbies[0]`, etc.)
- **Live Conversion**: Converts JSON instantly upon input.
- **CSV Download**: Save the converted table as a CSV file.
- **Type Coloring**: Highlights `null`, `boolean`, `number`, `string`, and `object` types.
- **Keyboard Shortcut**: Press Ctrl+Enter to convert.

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
    Object.keys(obj).forEach(key => {
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


## 🔍 Supported Data Types

| Type    | Display   | Color  |
|---------|-----------|--------|
| null    | `null`    | gray (italic) |
| boolean | true/false | green (bold) |
| number  | 123       | blue   |
| string  | "text"    | purple |
| object  | {"key":"value"} | orange (monospace) |


## 🐛 Troubleshooting

### JSON Parse Errors
- Check for missing commas, quotes, or brackets.
- Use browser devtools console (F12) to debug.

### Table Not Showing
- Ensure JSON is valid and non-empty.
- Check for JS console errors.

### Performance Issues
- Large data (10,000+ rows) may cause slowness.
- Consider chunking or lazy rendering.

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
