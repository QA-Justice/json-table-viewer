// ===== 커스텀 검색 기능 =====
// 크롬 사이드패널에서는 브라우저 찾기 바(Ctrl+F)가 열리지 않아서, 결과 테이블 안에서 찾는 기능을 직접 제공한다.
class TableSearch {
  constructor() {
    this.searchContainer = null;
    this.searchInput = null;
    this.prevBtn = null;
    this.nextBtn = null;
    this.matchCount = null;
    this.currentMatchIndex = -1;
    this.matches = [];   // 하이라이트된 <mark> 요소들 (문서 순서)
    this.query = '';
    this.isSearchActive = false;

    this.init();
  }

  init() {
    this.createSearchUI();
    this.bindEvents();
    this.observeTable();
  }

  // 검색 UI 생성
  createSearchUI() {
    // 기존 검색창이 있다면 제거
    this.removeSearchUI();

    this.searchContainer = document.createElement('div');
    this.searchContainer.id = 'custom-search-container';
    this.searchContainer.className = 'custom-search-container';
    this.searchContainer.setAttribute('role', 'search');
    this.searchContainer.style.display = 'none';

    this.searchContainer.innerHTML = `
      <div class="search-input-wrapper">
        <input type="text" id="custom-search-input" placeholder="Search columns and rows..." class="search-input" spellcheck="false" aria-label="Search table">
        <div class="search-controls">
          <span id="custom-search-count" class="search-count" aria-live="polite">0/0</span>
          <button id="custom-search-prev" class="search-btn" title="Previous (Shift+Enter)" aria-label="Previous match">▲</button>
          <button id="custom-search-next" class="search-btn" title="Next (Enter)" aria-label="Next match">▼</button>
          <button id="custom-search-close" class="search-close-btn" title="Close (Esc)" aria-label="Close search">✕</button>
        </div>
      </div>
    `;

    document.body.appendChild(this.searchContainer);

    // 요소 참조 저장
    this.searchInput = document.getElementById('custom-search-input');
    this.prevBtn = document.getElementById('custom-search-prev');
    this.nextBtn = document.getElementById('custom-search-next');
    this.matchCount = document.getElementById('custom-search-count');
  }

  // 검색 UI 제거
  removeSearchUI() {
    const existing = document.getElementById('custom-search-container');
    if (existing) {
      existing.remove();
    }
  }

  // 이벤트 바인딩
  bindEvents() {
    document.addEventListener('keydown', (e) => {
      const mod = (e.ctrlKey || e.metaKey) && !e.altKey;
      const key = e.key.toLowerCase();

      // Ctrl+F / Cmd+F — CapsLock·Shift가 켜져 있어도 동작하도록 소문자로 비교
      if (mod && key === 'f') {
        e.preventDefault();
        this.showSearch();
      } else if (e.key === 'F3' || (mod && key === 'g')) {
        // F3 / Ctrl+G — 다음(Shift면 이전) 결과
        e.preventDefault();
        if (!this.isSearchActive) this.showSearch();
        else if (e.shiftKey) this.previousMatch();
        else this.nextMatch();
      } else if (e.key === 'Escape' && this.isSearchActive) {
        e.preventDefault();
        this.hideSearch();
      }
    });

    this.searchInput.addEventListener('input', (e) => {
      this.performSearch(e.target.value);
    });

    this.searchInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        if (e.shiftKey) {
          this.previousMatch();
        } else {
          this.nextMatch();
        }
      }
    });

    this.prevBtn.addEventListener('click', () => this.previousMatch());
    this.nextBtn.addEventListener('click', () => this.nextMatch());
    document.getElementById('custom-search-close').addEventListener('click', () => this.hideSearch());
  }

  // 테이블이 다시 그려지면(Pivot/Restore 등) 하이라이트를 다시 입힌다.
  // renderTable은 #tableContainer의 자식을 통째로 바꾸므로 직계 자식 변화만 보면 된다.
  observeTable() {
    const container = document.getElementById('tableContainer');
    if (!container) return;
    new MutationObserver(() => {
      if (this.isSearchActive && this.query) this.refresh();
    }).observe(container, { childList: true });
  }

  // 검색창 표시
  showSearch() {
    this.searchContainer.style.display = 'block';
    document.body.classList.add('search-open');
    this.isSearchActive = true;

    // 테이블에서 선택한 글자가 있으면 검색어로 가져온다
    const selected = String(window.getSelection() || '').trim();
    if (selected && !selected.includes('\n') && document.activeElement !== document.getElementById('jsonInput')) {
      this.searchInput.value = selected;
    }

    this.searchInput.focus();
    this.searchInput.select();
    this.performSearch(this.searchInput.value);
  }

  // 검색창 숨김
  hideSearch() {
    if (this.searchContainer) {
      this.searchContainer.style.display = 'none';
    }
    document.body.classList.remove('search-open');
    this.isSearchActive = false;
    this.query = '';
    this.clearHighlights();

    // 검색 입력값 초기화
    if (this.searchInput) {
      this.searchInput.value = '';
    }

    // 매치 카운트 초기화
    this.updateMatchCount();
  }

  // 검색 실행 — 첫 번째 결과로 이동
  performSearch(query) {
    this.query = query.trim() ? query : '';
    this.currentMatchIndex = -1;
    this.refresh();
    if (this.matches.length > 0) this.goTo(0);
  }

  // 현재 검색어로 하이라이트를 다시 입힌다 (현재 위치는 가능한 한 유지)
  refresh() {
    const keep = this.currentMatchIndex;
    this.clearHighlights();

    const table = document.querySelector('#json-table') || document.querySelector('.json-table');
    if (!this.query || !table) {
      this.updateMatchCount();
      return;
    }

    this.highlightMatches(table, this.query.toLowerCase());

    if (this.matches.length > 0 && keep !== -1) {
      this.goTo(Math.min(keep, this.matches.length - 1), { scroll: false });
    } else {
      this.updateMatchCount();
    }
  }

  // 헤더(th)와 셀(td)의 텍스트에서 모든 일치를 <mark>로 감싼다 (한 셀 안의 여러 일치 포함)
  highlightMatches(table, searchTerm) {
    const walker = document.createTreeWalker(table, NodeFilter.SHOW_TEXT);
    const nodes = [];
    while (walker.nextNode()) nodes.push(walker.currentNode);

    nodes.forEach((node) => {
      const text = node.nodeValue;
      const lowerText = text.toLowerCase();
      let at = lowerText.indexOf(searchTerm);
      if (at === -1) return;

      const isHeader = !!node.parentElement.closest('th');
      const frag = document.createDocumentFragment();
      let last = 0;
      while (at !== -1) {
        frag.append(text.slice(last, at));
        const mark = document.createElement('mark');
        mark.className = isHeader ? 'search-highlight header-highlight' : 'search-highlight';
        mark.textContent = text.slice(at, at + searchTerm.length);
        frag.append(mark);
        this.matches.push(mark);
        last = at + searchTerm.length;
        at = lowerText.indexOf(searchTerm, last);
      }
      frag.append(text.slice(last));
      node.replaceWith(frag);
    });
  }

  // 하이라이트 제거 — 셀의 다른 내용은 건드리지 않고 <mark>만 텍스트로 되돌린다
  clearHighlights() {
    document.querySelectorAll('mark.search-highlight').forEach((mark) => {
      const parent = mark.parentNode;
      mark.replaceWith(document.createTextNode(mark.textContent));
      if (parent) parent.normalize();
    });
    this.matches = [];
    this.currentMatchIndex = -1;
  }

  // 다음 매치로 이동
  nextMatch() {
    if (this.matches.length === 0) return;
    this.goTo(this.currentMatchIndex + 1);
  }

  // 이전 매치로 이동
  previousMatch() {
    if (this.matches.length === 0) return;
    this.goTo(this.currentMatchIndex - 1);
  }

  // index번째 매치를 현재 매치로 표시하고 그 위치로 스크롤
  goTo(index, { scroll = true } = {}) {
    if (this.matches.length === 0) return;
    const prev = this.matches[this.currentMatchIndex];
    if (prev) prev.classList.remove('current-match');

    this.currentMatchIndex = (index + this.matches.length) % this.matches.length;
    const mark = this.matches[this.currentMatchIndex];
    mark.classList.add('current-match');
    if (scroll) {
      mark.scrollIntoView({ behavior: 'smooth', block: 'center', inline: 'nearest' });
    }
    this.updateMatchCount();
  }

  // 매치 카운트 업데이트
  updateMatchCount() {
    if (!this.matchCount) return;
    const total = this.matches.length;
    const current = this.currentMatchIndex >= 0 ? this.currentMatchIndex + 1 : 0;
    this.matchCount.textContent = total > 0 ? `${current}/${total}` : '0/0';
    this.searchInput.classList.toggle('no-hit', !!this.query && total === 0);
  }

  // 검색 입력값 초기화
  resetSearchInput() {
    if (this.searchInput) {
      this.searchInput.value = '';
    }
    this.query = '';
    this.clearHighlights();
    this.updateMatchCount();
  }
}

// 페이지 로드 시 바로 검색 기능 초기화 — 테이블이 생기기 전에도 Ctrl+F가 열려야 한다
function initTableSearch() {
  if (!window.tableSearch) {
    window.tableSearch = new TableSearch();
  }
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initTableSearch);
} else {
  initTableSearch();
}
