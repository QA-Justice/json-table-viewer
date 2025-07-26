
class JSONTableConverter {
  constructor() {
    this.initializeEventListeners();
    this.initializeFileUploadButton();
  }

  initializeFileUploadButton() {
    const fileBtn = document.getElementById('fileUploadBtn');
    const fileInput = document.getElementById('jsonFileInput');
    if (fileBtn && fileInput) {
      fileBtn.addEventListener('click', function(e) {
        e.preventDefault();
        fileInput.click();
      });
    }
  }

  initializeEventListeners() {
    const convertBtn = document.getElementById('convertBtn');
    const jsonInput = document.getElementById('jsonInput');
    const fileInput = document.getElementById('jsonFileInput');

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

    if (fileInput) {
      fileInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (event) => {
          try {
            const text = event.target.result;
            document.getElementById('jsonInput').value = text;
            this.handleConvert();
          } catch (err) {
            this.showError('An error occurred while reading the file: ' + err.message);
          }
        };
        reader.onerror = () => {
          this.showError('An error occurred while reading the file.');
        };
        reader.readAsText(file, 'utf-8');
      });
    }

    document.addEventListener('click', (e) => {
      if (e.target.id === 'downloadExcelBtn') {
        this.downloadCSV();
      }
    });
  }

  handleConvert() {
    const input = document.getElementById('jsonInput').value.trim();
    
    if (!input) {
      this.showError('Please enter JSON data.');
      return;
    }

    try {
      const flattened = this.parseAndFlatten(input);
      this.currentData = flattened;
      this.renderTable(flattened);
      this.showSuccess(`✅ Conversion successful! (${flattened.length} rows)`);
    } catch (err) {
      this.showError(`⚠️ JSON parse error: ${err.message}`);
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
      <p>📭 No data to display.</p>
      <p>Please paste JSON into the input area above.</p>
    `;
    container.appendChild(message);
  }

  showSuccess(message) {
    this.showNotification(message, 'success');
  }

  showError(message) {
    this.showNotification(message, 'error');
  }


  downloadCSV() {
    if (!this.currentData || this.currentData.length === 0) {
      this.showError('No data to download. Please convert JSON first.');
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
      this.showSuccess('📥 CSV file downloaded successfully!');
    } catch (error) {
      this.showError('An error occurred while downloading CSV: ' + error.message);
    }
  }

  /**
   * 데이터를 CSV 형식으로 변환
   */
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

  escapeCSVField(field) {
    if (field === null || field === undefined) {
      return '';
    }
    const stringField = String(field);
    if (stringField.includes(',') || stringField.includes('"') || stringField.includes('\n') || stringField.includes('\r')) {
      const escapedField = stringField.replace(/"/g, '""');
      return `"${escapedField}"`;
    }
    return stringField;
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

document.addEventListener('DOMContentLoaded', () => {
  new JSONTableConverter();
});
  