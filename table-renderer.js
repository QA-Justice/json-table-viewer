import { DOMUtils, DataUtils } from './utils.js';

export class TableRenderer {
  constructor(dataProcessor) {
    this.dataProcessor = dataProcessor;
  }

  // 테이블 렌더링
  renderTable(dataArray) {
    DOMUtils.safeDOMOperation('#tableContainer', (container) => {
      container.innerHTML = '';

      if (!DataUtils.isValidData(dataArray)) {
        this.showNoDataMessage(container);
        return;
      }

      const table = this.createTable(dataArray);
      container.appendChild(table);
      
      // Pivot 상태에 따라 컨테이너 클래스 추가/제거
      if (this.dataProcessor.isPivoted) {
        container.classList.add('pivoted');
      } else {
        container.classList.remove('pivoted');
      }
    });
  }

  // 테이블 생성
  createTable(dataArray) {
    const allKeys = this.dataProcessor.generateKeys(dataArray);
    
    const table = DOMUtils.createElement('table', 'json-table', 'json-table');
    const thead = this.createTableHeader(allKeys);
    const tbody = this.createTableBody(dataArray, allKeys);

    table.appendChild(thead);
    table.appendChild(tbody);

    return table;
  }

  // 테이블 헤더 생성
  createTableHeader(keys) {
    const thead = DOMUtils.createElement('thead');
    const headerRow = DOMUtils.createElement('tr');
    
    keys.forEach(key => {
      const th = DOMUtils.createElement('th');
      th.textContent = key;
      headerRow.appendChild(th);
    });
    
    thead.appendChild(headerRow);
    return thead;
  }

  // 테이블 바디 생성
  createTableBody(dataArray, keys) {
    const tbody = DOMUtils.createElement('tbody');
    
    dataArray.forEach(row => {
      const tr = DOMUtils.createElement('tr');
      
      keys.forEach(key => {
        const td = DOMUtils.createElement('td');
        const value = row[key] ?? '';
        td.textContent = DataUtils.formatCellValue(value);
        td.title = td.textContent;
        td.className = DataUtils.getCellClassName(value);
        tr.appendChild(td);
      });
      
      tbody.appendChild(tr);
    });
    
    return tbody;
  }

  // 데이터 없음 메시지 표시
  showNoDataMessage(container) {
    const messageDiv = DOMUtils.createElement('div', 'no-data-message');
    messageDiv.innerHTML = `
      <p>📭 No data to display.</p>
      <p>Please paste JSON into the input area above.</p>
    `;
    container.appendChild(messageDiv);
  }

  // 테이블을 초기 상태로 리셋
  resetTableToInitialState() {
    DOMUtils.safeDOMOperation('#tableContainer', (container) => {
      container.innerHTML = '';
      container.classList.remove('pivoted');
      this.showNoDataMessage(container);
    });
  }
}
