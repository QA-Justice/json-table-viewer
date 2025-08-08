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
    CONVERSION_SUCCESS: '✅ Conversion successful!',
    CLIPBOARD_SUCCESS: '📋 Data copied to clipboard successfully!',
    CLIPBOARD_ERROR: 'Failed to copy to clipboard. Please try manually selecting and copying.'
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
    this.pivotedData = null;
    this.isPivoted = false;
    this.initializeEventListeners();
  }

  // 이벤트 리스너 초기화
  initializeEventListeners() {
    this.setSampleJSON(); // 샘플 JSON 설정
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
    // 기존 이벤트 리스너 제거 (중복 방지)
    document.removeEventListener(CONSTANTS.EVENTS.CLICK, this.handleGlobalClick);
    document.removeEventListener('click', this.handleOutsideClick);
    
    // 새로운 이벤트 리스너 등록
    this.handleGlobalClick = (e) => {
      if (e.target.matches(CONSTANTS.SELECTORS.DOWNLOAD_BTN)) {
        this.downloadCSV();
      }
      if (e.target.matches('#copyToClipboardBtn')) {
        this.toggleCopyOptions();
      }
             if (e.target.matches('.dropdown-item')) {
         const format = e.target.dataset.format;
         this.copyToClipboard(format);
         this.hideCopyOptions();
       }
      if (e.target.matches('#pivotBtn')) {
        this.togglePivot();
      }
      if (e.target.matches('#resetBtn')) {
        this.resetToSample();
      }
    };

    this.handleOutsideClick = (e) => {
      if (!e.target.closest('.dropdown-container')) {
        this.hideCopyOptions();
      }
    };

    document.addEventListener(CONSTANTS.EVENTS.CLICK, this.handleGlobalClick);
    document.addEventListener('click', this.handleOutsideClick);
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
      this.pivotedData = null;
      this.isPivoted = false;
      this.renderTable(flattened);
      this.updatePivotButton();
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

  // 샘플 JSON 설정
  setSampleJSON() {
    const jsonInput = document.querySelector(CONSTANTS.SELECTORS.JSON_INPUT);
    if (jsonInput && !jsonInput.value.trim()) {
      jsonInput.value = this.getSampleJSON();
    }
  }

  // 샘플 JSON 반환
  getSampleJSON() {
    return `[
  {
    "name": "John Doe",
    "age": 30,
    "email": "john@example.com",
    "active": true,
    "scores": [85, 92, 78],
    "address": {
      "street": "123 Main St",
      "city": "New York",
      "zip": "10001"
    }
  },
  {
    "name": "Jane Smith",
    "age": 25,
    "email": "jane@example.com",
    "active": false,
    "scores": [90, 88, 95],
    "address": {
      "street": "456 Oak Ave",
      "city": "Los Angeles",
      "zip": "90210"
    }
  },
  {
    "name": "Bob Johnson",
    "age": 35,
    "email": "bob@example.com",
    "active": true,
    "scores": [75, 82, 88],
    "address": {
      "street": "789 Pine Rd",
      "city": "Chicago",
      "zip": "60601"
    }
  }
]`;
  }

  // 샘플 JSON으로 초기화
  resetToSample() {
    const jsonInput = document.querySelector(CONSTANTS.SELECTORS.JSON_INPUT);
    if (jsonInput) {
      jsonInput.value = this.getSampleJSON();
      this.currentData = null;
      this.pivotedData = null;
      this.isPivoted = false;
      this.renderTable([]);
      this.updatePivotButton();
    }
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
    const keys = Reflect.ownKeys(obj);
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
    
    // Pivot 상태에 따라 컨테이너 클래스 추가/제거
    if (this.isPivoted) {
      container.classList.add('pivoted');
    } else {
      container.classList.remove('pivoted');
    }
  }

  // 테이블 생성
  createTable(dataArray) {
    // Pivot 테이블인 경우 순서대로 키 생성
    let allKeys;
    if (this.isPivoted) {
      // Pivot 테이블의 경우 Field + Row 1, Row 2, Row 3... 순서로 키 생성
      // 원본 데이터의 행 개수를 사용하여 Row 키 생성
      const originalRowCount = this.currentData ? this.currentData.length : 0;
      allKeys = ['Field'];
      for (let i = 1; i <= originalRowCount; i++) {
        allKeys.push(`Row ${i}`);
      }
    } else {
      allKeys = this.getAllKeys(dataArray);
    }
    
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
      Reflect.ownKeys(obj).forEach(key => keySet.add(key));
    });
    
    const keys = Array.from(keySet);
    return keys; // 원본 순서 그대로 반환
  }

  // 키를 자연수 순서로 정렬 (숫자 키는 숫자 순서, 문자열 키는 사전순)
  sortKeysNaturally(keys) {
    return keys.sort((a, b) => {
      // 숫자 키인지 확인 (예: [0], [1], [10] 등)
      const aIsNumber = /^\[\d+\]$/.test(a);
      const bIsNumber = /^\[\d+\]$/.test(b);
      
      if (aIsNumber && bIsNumber) {
        // 둘 다 숫자 키인 경우 숫자 순서로 정렬
        const aNum = parseInt(a.match(/\d+/)[0]);
        const bNum = parseInt(b.match(/\d+/)[0]);
        return aNum - bNum;
      } else if (aIsNumber) {
        // a만 숫자 키인 경우 a를 앞으로
        return -1;
      } else if (bIsNumber) {
        // b만 숫자 키인 경우 b를 앞으로
        return 1;
      } else {
        // 둘 다 문자열 키인 경우 사전순 정렬
        return a.localeCompare(b);
      }
    });
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
    const dataToExport = this.isPivoted ? this.pivotedData : this.currentData;
    
    if (!dataToExport || dataToExport.length === 0) {
      this.showError(CONSTANTS.MESSAGES.CSV_DOWNLOAD_ERROR);
      return;
    }

    try {
      const csvContent = this.convertToCSV(dataToExport);
      const fileName = `json-table-${new Date().toISOString().slice(0, 10)}.csv`;
      
      const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = fileName;
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
    
    // Pivot 테이블인 경우 순서대로 키 생성
    let allKeys;
    if (this.isPivoted) {
      // 원본 데이터의 행 개수를 사용하여 Row 키 생성
      const originalRowCount = this.currentData ? this.currentData.length : 0;
      allKeys = ['Field'];
      for (let i = 1; i <= originalRowCount; i++) {
        allKeys.push(`Row ${i}`);
      }
    } else {
      allKeys = this.getAllKeys(dataArray);
    }
    
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

  // Copy 옵션 토글
  toggleCopyOptions() {
    const copyOptions = document.getElementById('copyOptions');
    const isVisible = copyOptions.classList.contains('show');
    
    if (isVisible) {
      this.hideCopyOptions();
    } else {
      this.showCopyOptions();
    }
  }

  // Copy 옵션 보이기
  showCopyOptions() {
    const copyOptions = document.getElementById('copyOptions');
    copyOptions.classList.add('show');
    this.updateCopyButtonArrow();
  }

  // Copy 옵션 숨기기
  hideCopyOptions() {
    const copyOptions = document.getElementById('copyOptions');
    copyOptions.classList.remove('show');
    this.updateCopyButtonArrow();
  }

  // 클립보드에 복사
  async copyToClipboard(format = 'markdown') {
    const dataToCopy = this.isPivoted ? this.pivotedData : this.currentData;
    
    if (!dataToCopy || dataToCopy.length === 0) {
      this.showError('No data to copy. Please convert JSON first.');
      return;
    }

    try {
      let content;
      if (format === 'markdown') {
        content = this.convertToMarkdown(dataToCopy);
      } else {
        content = this.convertToText(dataToCopy);
      }
      
      if (navigator.clipboard && window.isSecureContext) {
        // 모던 브라우저 (HTTPS 환경)
        await navigator.clipboard.writeText(content);
        this.showSuccess(`${CONSTANTS.MESSAGES.CLIPBOARD_SUCCESS} (${format})`);
      } else {
        // 구형 브라우저 fallback
        this.fallbackCopyToClipboard(content);
      }
    } catch (error) {
      this.showError(`Failed to copy to clipboard: ${error.message}`);
    }
  }

  // 구형 브라우저용 클립보드 복사 fallback
  fallbackCopyToClipboard(text) {
    const textArea = document.createElement('textarea');
    textArea.value = text;
    textArea.style.position = 'fixed';
    textArea.style.left = '-999999px';
    textArea.style.top = '-999999px';
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    
    try {
      const successful = document.execCommand('copy');
      if (successful) {
        this.showSuccess(CONSTANTS.MESSAGES.CLIPBOARD_SUCCESS);
      } else {
        this.showError(CONSTANTS.MESSAGES.CLIPBOARD_ERROR);
      }
    } catch (err) {
      this.showError(CONSTANTS.MESSAGES.CLIPBOARD_ERROR);
    }
    
    document.body.removeChild(textArea);
  }

  // Markdown 테이블 변환
  convertToMarkdown(dataArray) {
    if (!dataArray || dataArray.length === 0) {
      return '';
    }
    
    // Pivot 테이블인 경우 순서대로 키 생성
    let allKeys;
    if (this.isPivoted) {
      // 원본 데이터의 행 개수를 사용하여 Row 키 생성
      const originalRowCount = this.currentData ? this.currentData.length : 0;
      allKeys = ['Field'];
      for (let i = 1; i <= originalRowCount; i++) {
        allKeys.push(`Row ${i}`);
      }
    } else {
      allKeys = this.getAllKeys(dataArray);
    }
    
    // 헤더 행
    const headers = allKeys.map(key => `| ${key} `).join('') + '|';
    
    // 구분선 행
    const separator = allKeys.map(() => '| --- ').join('') + '|';
    
    // 데이터 행들
    const rows = dataArray.map(row => {
      return allKeys.map(key => {
        const value = row[key] ?? '';
        const formattedValue = this.formatCellValue(value);
        // Markdown에서 파이프 문자 이스케이프
        const escapedValue = formattedValue.replace(/\|/g, '\\|');
        return `| ${escapedValue} `;
      }).join('') + '|';
    });
    
    return [headers, separator, ...rows].join('\n');
  }

  // Text 테이블 변환 (탭으로 구분)
  convertToText(dataArray) {
    if (!dataArray || dataArray.length === 0) {
      return '';
    }
    
    // Pivot 테이블인 경우 순서대로 키 생성
    let allKeys;
    if (this.isPivoted) {
      // 원본 데이터의 행 개수를 사용하여 Row 키 생성
      const originalRowCount = this.currentData ? this.currentData.length : 0;
      allKeys = ['Field'];
      for (let i = 1; i <= originalRowCount; i++) {
        allKeys.push(`Row ${i}`);
      }
    } else {
      allKeys = this.getAllKeys(dataArray);
    }
    
    const headers = allKeys.join('\t');
    const rows = dataArray.map(row => {
      return allKeys.map(key => {
        const value = row[key] ?? '';
        return this.formatCellValue(value);
      }).join('\t');
    });
    
    return [headers, ...rows].join('\n');
  }

  // Pivot 토글
  togglePivot() {
    if (!this.currentData || this.currentData.length === 0) {
      this.showError('No data to pivot. Please convert JSON first.');
      return;
    }

    if (this.isPivoted) {
      // 원래 테이블로 되돌리기
      this.isPivoted = false;
      this.pivotedData = null;
      this.renderTable(this.currentData);
      this.updatePivotButton();
    } else {
      // Pivot 테이블로 변환
      this.isPivoted = true;
      this.pivotedData = this.createPivotTable(this.currentData);
      this.renderTable(this.pivotedData);
      this.updatePivotButton();
    }
  }

  // Pivot 테이블 생성
  createPivotTable(dataArray) {
    if (!dataArray || dataArray.length === 0) return [];

    // 모든 키 수집
    const allKeys = this.getAllKeys(dataArray);
    
    // 첫 번째 행을 헤더로 사용
    const pivotData = [];
    
    // 각 키를 행으로 변환
    allKeys.forEach(key => {
      const row = {
        Field: key
      };
      
      // 각 데이터 행의 값을 컬럼으로 변환
      for (let i = 0; i < dataArray.length; i++) {
        const value = dataArray[i][key] ?? '';
        row[`Row ${i + 1}`] = value;
      }
      
      pivotData.push(row);
    });

    return pivotData;
  }



  // Pivot 버튼 텍스트 업데이트
  updatePivotButton() {
    const pivotBtn = document.querySelector('#pivotBtn');
    if (pivotBtn) {
      pivotBtn.textContent = this.isPivoted ? '🔄 Restore' : '🔄 Pivot';
    }
  }

  // Copy 버튼 화살표 업데이트
  updateCopyButtonArrow() {
    const copyBtn = document.querySelector('#copyToClipboardBtn');
    if (copyBtn) {
      const copyOptions = document.getElementById('copyOptions');
      const isVisible = copyOptions.classList.contains('show');
      copyBtn.innerHTML = isVisible ? '📋 Copy ▲' : '📋 Copy ▼';
    }
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
  