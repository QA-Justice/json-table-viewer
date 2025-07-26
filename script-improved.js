/**
 * JSON Table Viewer - Improved Version
 * 핵심 기능에 집중한 개선된 버전 (엑셀 다운로드 기능 포함)
 */

class JSONTableConverter {
    constructor() {
      this.initializeEventListeners();
    }
  
    initializeEventListeners() {
      const convertBtn = document.getElementById('convertBtn');
      const jsonInput = document.getElementById('jsonInput');
  
      if (convertBtn) {
        convertBtn.addEventListener('click', () => this.handleConvert());
      }
  
      if (jsonInput) {
        jsonInput.addEventListener('keydown', (e) => {
          if (e.ctrlKey && e.key === 'Enter') {
            this.handleConvert();
          }
        });
      }
  
      document.addEventListener('click', (e) => {
        if (e.target.id === 'downloadExcelBtn') {
          this.downloadExcel();
        }
      });
    }
  
    handleConvert() {
      const input = document.getElementById('jsonInput').value.trim();
  
      if (!input) {
        this.showError('JSON 데이터를 입력해주세요.');
        return;
      }
  
      try {
        const flattened = this.parseAndFlatten(input);
        this.currentData = flattened;
        this.renderTable(flattened);
        this.showSuccess(`테이블 변환이 완료되었습니다! (총 ${flattened.length}개 행)`);
      } catch (err) {
        this.showError(`JSON 파싱 오류: ${err.message}`);
      }
    }
  
    flattenObject(obj, prefix = '', result = {}) {
      if (obj === null || obj === undefined) {
        result[prefix] = obj;
        return result;
      }
  
      if (Array.isArray(obj)) {
        if (obj.length === 0) {
          result[prefix] = '[]';
        } else {
          obj.forEach((item, index) => {
            this.flattenObject(item, `${prefix}[${index}]`, result);
          });
        }
      } else if (typeof obj === 'object') {
        const keys = Object.keys(obj);
        if (keys.length === 0) {
          result[prefix] = '{}';
        } else {
          keys.forEach(key => {
            const newPrefix = prefix ? `${prefix}.${key}` : key;
            this.flattenObject(obj[key], newPrefix, result);
          });
        }
      } else {
        result[prefix] = obj;
      }
  
      return result;
    }
  
    parseAndFlatten(jsonText) {
      const data = JSON.parse(jsonText);
  
      if (!Array.isArray(data)) {
        return [this.flattenObject(data)];
      }
  
      return data.map(item => this.flattenObject(item));
    }
  
    renderTable(dataArray) {
      const container = document.getElementById('tableContainer');
  
      if (!container) {
        console.error('tableContainer 요소를 찾을 수 없습니다.');
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
  
    createTable(dataArray) {
      const allKeys = this.getAllKeys(dataArray);
      const table = document.createElement('table');
      table.className = 'json-table';
  
      const thead = this.createTableHeader(allKeys);
      table.appendChild(thead);
  
      const tbody = this.createTableBody(dataArray, allKeys);
      table.appendChild(tbody);
  
      return table;
    }
  
    getAllKeys(dataArray) {
      const keySet = new Set();
      dataArray.forEach(obj => {
        Object.keys(obj).forEach(key => keySet.add(key));
      });
      return Array.from(keySet).sort();
    }
  
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
  
    formatCellValue(value) {
      if (value === null) return 'null';
      if (value === undefined) return '';
      if (typeof value === 'boolean') return value ? 'true' : 'false';
      if (typeof value === 'object') return JSON.stringify(value);
      return String(value);
    }
  
    getCellClassName(value) {
      if (value === null || value === undefined) return 'cell-null';
      if (typeof value === 'boolean') return 'cell-boolean';
      if (typeof value === 'number') return 'cell-number';
      if (typeof value === 'string') return 'cell-string';
      return 'cell-object';
    }
  
    showNoDataMessage(container) {
      const message = document.createElement('div');
      message.className = 'no-data-message';
      message.innerHTML = `
        <p>📭 변환할 데이터가 없습니다.</p>
        <p>JSON 데이터를 입력해주세요.</p>
      `;
      container.appendChild(message);
    }
  
    showSuccess(message) {
      this.showNotification(message, 'success');
    }
  
    showError(message) {
      this.showNotification(message, 'error');
    }
  
    /**
     * 엑셀 다운로드 기능 (.xlsx)
     */
    downloadExcel() {
      if (!this.currentData || this.currentData.length === 0) {
        this.showError('다운로드할 데이터가 없습니다. 먼저 JSON을 변환해주세요.');
        return;
      }
  
      try {
        const worksheet = XLSX.utils.json_to_sheet(this.currentData);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, 'JSON Table');
  
        const wbout = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
        const blob = new Blob([wbout], { type: 'application/octet-stream' });
  
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = `json-table-${new Date().toISOString().slice(0, 10)}.xlsx`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
  
        this.showSuccess('📥 엑셀 파일이 다운로드되었습니다!');
      } catch (error) {
        this.showError('Excel 다운로드 중 오류가 발생했습니다: ' + error.message);
      }
    }
  
    showNotification(message, type) {
      const existingNotification = document.querySelector('.notification');
      if (existingNotification) {
        existingNotification.remove();
      }
  
      const notification = document.createElement('div');
      notification.className = `notification notification-${type}`;
      notification.textContent = message;
  
      document.body.appendChild(notification);
  
      setTimeout(() => {
        if (notification.parentNode) {
          notification.remove();
        }
      }, 3000);
    }
  }
  
  // 초기화
  document.addEventListener('DOMContentLoaded', () => {
    new JSONTableConverter();
  });
  