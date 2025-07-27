// 상수 정의
const CONSTANTS = {
  SELECTORS: {
    CONVERT_BTN: '#convertBtn',
    JSON_INPUT: '#jsonInput',
    FILE_INPUT: '#jsonFileInput',
    FILE_UPLOAD_BTN: '#fileUploadBtn',
    DOWNLOAD_BTN: '#downloadExcelBtn',
    TABLE_CONTAINER: '#tableContainer'
  },
  CLASSES: {
    MAIN_BTN: 'main-btn',
    JSON_TABLE: 'json-table',
    NOTIFICATION: 'notification',
    NO_DATA_MESSAGE: 'no-data-message'
  },
  CELL_CLASSES: {
    NULL: 'cell-null',
    BOOLEAN: 'cell-boolean',
    NUMBER: 'cell-number',
    STRING: 'cell-string',
    OBJECT: 'cell-object'
  },
  MESSAGES: {
    NO_DATA: 'Please enter JSON data.',
    NO_DATA_DISPLAY: '📭 No data to display.',
    NO_DATA_HINT: 'Please paste JSON into the input area above.',
    FILE_READ_ERROR: 'An error occurred while reading the file.',
    CSV_DOWNLOAD_ERROR: 'No data to download. Please convert JSON first.',
    CSV_DOWNLOAD_SUCCESS: '📥 CSV file downloaded successfully!',
    CONVERSION_SUCCESS: '✅ Conversion successful!'
  },
  EVENTS: {
    CLICK: 'click',
    KEYDOWN: 'keydown',
    CHANGE: 'change'
  }
};

class JSONTableConverter {
  constructor() {
    this.currentData = null;
    this.initializeEventListeners();
  }

  // 이벤트 리스너 초기화
  initializeEventListeners() {
    this.bindConvertButton();
    this.bindKeyboardShortcut();
    this.bindFileUpload();
    this.bindDownloadButton();
  }

  // 변환 버튼 이벤트 바인딩
  bindConvertButton() {
    const convertBtn = document.querySelector(CONSTANTS.SELECTORS.CONVERT_BTN);
    if (convertBtn) {
      convertBtn.addEventListener(CONSTANTS.EVENTS.CLICK, () => this.handleConvert());
    }
  }

  // 키보드 단축키 바인딩
  bindKeyboardShortcut() {
    const jsonInput = document.querySelector(CONSTANTS.SELECTORS.JSON_INPUT);
    if (jsonInput) {
      jsonInput.addEventListener(CONSTANTS.EVENTS.KEYDOWN, (e) => {
        if (e.ctrlKey && e.key === 'Enter') {
          this.handleConvert();
        }
      });
    }
  }

  // 파일 업로드 이벤트 바인딩
  bindFileUpload() {
    const fileBtn = document.querySelector(CONSTANTS.SELECTORS.FILE_UPLOAD_BTN);
    const fileInput = document.querySelector(CONSTANTS.SELECTORS.FILE_INPUT);
    
    if (fileBtn && fileInput) {
      // 파일 업로드 버튼 클릭
      fileBtn.addEventListener(CONSTANTS.EVENTS.CLICK, (e) => {
        e.preventDefault();
        fileInput.click();
      });

      // 파일 선택
      fileInput.addEventListener(CONSTANTS.EVENTS.CHANGE, (e) => {
        this.handleFileUpload(e);
      });
    }
  }

  // 다운로드 버튼 이벤트 바인딩
  bindDownloadButton() {
    document.addEventListener(CONSTANTS.EVENTS.CLICK, (e) => {
      if (e.target.matches(CONSTANTS.SELECTORS.DOWNLOAD_BTN)) {
        this.downloadCSV();
      }
    });
  }

  // 파일 업로드 처리
  handleFileUpload(event) {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    
    reader.onload = (event) => {
      try {
        const text = event.target.result;
        const jsonInput = document.querySelector(CONSTANTS.SELECTORS.JSON_INPUT);
        if (jsonInput) {
          jsonInput.value = text;
          this.handleConvert();
        }
      } catch (err) {
        this.showError(`${CONSTANTS.MESSAGES.FILE_READ_ERROR} ${err.message}`);
      }
    };

    reader.onerror = () => {
      this.showError(CONSTANTS.MESSAGES.FILE_READ_ERROR);
    };

    reader.readAsText(file, 'utf-8');
  }

  // JSON 변환 처리
  handleConvert() {
    const input = this.getJsonInput();
    
    if (!input) {
      this.showError(CONSTANTS.MESSAGES.NO_DATA);
      return;
    }

    try {
      const flattened = this.parseAndFlatten(input);
      this.currentData = flattened;
      this.renderTable(flattened);
      this.showSuccess(`${CONSTANTS.MESSAGES.CONVERSION_SUCCESS} (${flattened.length} rows)`);
    } catch (err) {
      this.showError(`⚠️ JSON parse error: ${err.message}`);
    }
  }

  // JSON 입력값 가져오기
  getJsonInput() {
    const jsonInput = document.querySelector(CONSTANTS.SELECTORS.JSON_INPUT);
    return jsonInput ? jsonInput.value.trim() : '';
  }

  // JSON 객체 평면화
  flattenObject(obj, prefix = '', result = {}) {
    if (obj === null || obj === undefined) {
      result[prefix] = obj;
      return result;
    }

    if (Array.isArray(obj)) {
      this.flattenArray(obj, prefix, result);
    } else if (typeof obj === 'object') {
      this.flattenObjectProperties(obj, prefix, result);
    } else {
      result[prefix] = obj;
    }
    
    return result;
  }

  // 배열 평면화
  flattenArray(arr, prefix, result) {
    if (arr.length === 0) {
      result[prefix] = '[]';
    } else {
      arr.forEach((item, index) => {
        this.flattenObject(item, `${prefix}[${index}]`, result);
      });
    }
  }

  // 객체 속성 평면화
  flattenObjectProperties(obj, prefix, result) {
    const keys = Object.keys(obj);
    if (keys.length === 0) {
      result[prefix] = '{}';
    } else {
      keys.forEach(key => {
        const newPrefix = prefix ? `${prefix}.${key}` : key;
        this.flattenObject(obj[key], newPrefix, result);
      });
    }
  }

  // JSON 파싱 및 평면화
  parseAndFlatten(jsonText) {
    const data = JSON.parse(jsonText);
    
    if (!Array.isArray(data)) {
      return [this.flattenObject(data)];
    }
    
    return data.map(item => this.flattenObject(item));
  }

  // 테이블 렌더링
  renderTable(dataArray) {
    const container = document.querySelector(CONSTANTS.SELECTORS.TABLE_CONTAINER);
    
    if (!container) {
      console.error('tableContainer element not found.');
      return;
    }

    container.innerHTML = '';

    if (!dataArray || dataArray.length === 0) {
      this.showNoDataMessage(container);
      return;
    }

    const table = this.createTable(dataArray);
    container.appendChild(table);
  }

  // 테이블 생성
  createTable(dataArray) {
    const allKeys = this.getAllKeys(dataArray);
    const table = document.createElement('table');
    table.className = CONSTANTS.CLASSES.JSON_TABLE;

    const thead = this.createTableHeader(allKeys);
    const tbody = this.createTableBody(dataArray, allKeys);
    
    table.appendChild(thead);
    table.appendChild(tbody);

    return table;
  }

  // 모든 키 수집
  getAllKeys(dataArray) {
    const keySet = new Set();
    dataArray.forEach(obj => {
      Object.keys(obj).forEach(key => keySet.add(key));
    });
    return Array.from(keySet).sort();
  }

  // 테이블 헤더 생성
  createTableHeader(keys) {
    const thead = document.createElement('thead');
    const headerRow = thead.insertRow();
    
    keys.forEach(key => {
      const th = document.createElement('th');
      th.textContent = key;
      th.title = key;
      headerRow.appendChild(th);
    });

    return thead;
  }

  // 테이블 본문 생성
  createTableBody(dataArray, keys) {
    const tbody = document.createElement('tbody');
    
    dataArray.forEach((row, rowIndex) => {
      const tr = tbody.insertRow();
      tr.className = rowIndex % 2 === 0 ? 'even-row' : 'odd-row';
      
      keys.forEach(key => {
        const td = tr.insertCell();
        const value = row[key] ?? '';
        td.textContent = this.formatCellValue(value);
        td.className = this.getCellClassName(value);
      });
    });

    return tbody;
  }

  // 셀 값 포맷팅
  formatCellValue(value) {
    if (value === null) return 'null';
    if (value === undefined) return '';
    if (typeof value === 'boolean') return value ? 'true' : 'false';
    if (typeof value === 'object') return JSON.stringify(value);
    return String(value);
  }

  // 셀 클래스명 결정
  getCellClassName(value) {
    if (value === null || value === undefined) return CONSTANTS.CELL_CLASSES.NULL;
    if (typeof value === 'boolean') return CONSTANTS.CELL_CLASSES.BOOLEAN;
    if (typeof value === 'number') return CONSTANTS.CELL_CLASSES.NUMBER;
    if (typeof value === 'string') return CONSTANTS.CELL_CLASSES.STRING;
    return CONSTANTS.CELL_CLASSES.OBJECT;
  }

  // 데이터 없음 메시지 표시
  showNoDataMessage(container) {
    const message = document.createElement('div');
    message.className = CONSTANTS.CLASSES.NO_DATA_MESSAGE;
    message.innerHTML = `
      <p>${CONSTANTS.MESSAGES.NO_DATA_DISPLAY}</p>
      <p>${CONSTANTS.MESSAGES.NO_DATA_HINT}</p>
    `;
    container.appendChild(message);
  }

  // CSV 다운로드
  downloadCSV() {
    if (!this.currentData || this.currentData.length === 0) {
      this.showError(CONSTANTS.MESSAGES.CSV_DOWNLOAD_ERROR);
      return;
    }

    try {
      const csvContent = this.convertToCSV(this.currentData);
      const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = `json-table-${new Date().toISOString().slice(0, 10)}.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      this.showSuccess(CONSTANTS.MESSAGES.CSV_DOWNLOAD_SUCCESS);
    } catch (error) {
      this.showError(`An error occurred while downloading CSV: ${error.message}`);
    }
  }

  // CSV 변환
  convertToCSV(dataArray) {
    if (!dataArray || dataArray.length === 0) {
      return '';
    }
    
    const allKeys = this.getAllKeys(dataArray);
    const headers = allKeys.map(key => this.escapeCSVField(key)).join(',');
    const rows = dataArray.map(row => {
      return allKeys.map(key => {
        const value = row[key] ?? '';
        return this.escapeCSVField(this.formatCellValue(value));
      }).join(',');
    });
    
    return [headers, ...rows].join('\n');
  }

  // CSV 필드 이스케이프
  escapeCSVField(field) {
    if (field === null || field === undefined) {
      return '';
    }
    
    const stringField = String(field);
    const needsQuotes = stringField.includes(',') || 
                       stringField.includes('"') || 
                       stringField.includes('\n') || 
                       stringField.includes('\r');
    
    if (needsQuotes) {
      const escapedField = stringField.replace(/"/g, '""');
      return `"${escapedField}"`;
    }
    
    return stringField;
  }

  // 성공 알림
  showSuccess(message) {
    this.showNotification(message, 'success');
  }

  // 에러 알림
  showError(message) {
    this.showNotification(message, 'error');
  }

  // 알림 표시
  showNotification(message, type) {
    this.removeExistingNotifications();
    
    const notification = document.createElement('div');
    notification.className = `${CONSTANTS.CLASSES.NOTIFICATION} notification-${type}`;
    notification.textContent = message;
    document.body.appendChild(notification);
    
    setTimeout(() => {
      if (notification.parentNode) {
        notification.remove();
      }
    }, 3000);
  }

  // 기존 알림 제거
  removeExistingNotifications() {
    const existingNotification = document.querySelector(`.${CONSTANTS.CLASSES.NOTIFICATION}`);
    if (existingNotification) {
      existingNotification.remove();
    }
  }
}

// DOM 로드 완료 시 초기화
document.addEventListener('DOMContentLoaded', () => {
  new JSONTableConverter();
});
  