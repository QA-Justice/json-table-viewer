# 🧩 JSON → 📊 Table Viewer

JSON 데이터를 자동으로 테이블로 변환해주는 간단하고 효율적인 웹 애플리케이션입니다.

## ✨ 주요 기능

- **JSON 평탄화**: 중첩된 객체와 배열을 자동으로 1차원 구조로 변환
- **구조 보존**: JSON 구조를 그대로 반영한 컬럼명 (`address.city`, `hobbies[0]` 등)
- **실시간 변환**: JSON 입력 후 즉시 테이블 생성
- **데이터 타입 구분**: null, boolean, number, string, object 타입별 색상 구분
- **키보드 단축키**: Ctrl+Enter로 빠른 변환

## 🚀 사용법

1. `index-improved.html` 파일을 브라우저에서 열기
2. JSON 데이터를 텍스트 영역에 붙여넣기
3. "테이블로 변환" 버튼 클릭 또는 Ctrl+Enter
4. 자동으로 생성된 테이블 확인

## 📋 예시

### 입력 JSON
```json
[
  {
    "name": "김철수",
    "age": 25,
    "address": {
      "city": "서울",
      "district": "강남구"
    },
    "hobbies": ["독서", "운동"]
  },
  {
    "name": "이영희",
    "age": 30,
    "address": {
      "city": "부산",
      "district": "해운대구"
    },
    "hobbies": ["영화감상", "요리"]
  }
]
```

### 출력 테이블
| name | age | address.city | address.district | hobbies[0] | hobbies[1] |
|------|-----|--------------|------------------|------------|------------|
| 김철수 | 25 | 서울 | 강남구 | 독서 | 운동 |
| 이영희 | 30 | 부산 | 해운대구 | 영화감상 | 요리 |

## 📁 프로젝트 구조

```
json-table-viewer/
├── index-improved.html      # 메인 HTML 파일
├── script-improved.js       # 핵심 JavaScript 로직
├── style-improved.css       # 스타일시트
├── index.html              # 기존 버전 (참고용)
├── script.js               # 기존 버전 (참고용)
├── style.css               # 기존 버전 (참고용)
└── manifest.json           # 크롬 확장앱 설정
```

## 🔧 기술 스택

- **HTML5**: 구조 및 마크업
- **CSS3**: 스타일링 및 반응형 디자인
- **Vanilla JavaScript**: JSON 처리 및 DOM 조작
- **Chrome Extension API**: 브라우저 확장앱 지원

## 🎯 핵심 로직

### JSON 평탄화 알고리즘
```javascript
// 중첩된 객체를 평탄화
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

### 컬럼명 생성 규칙
- **단순 키**: `name`, `age`
- **중첩 객체**: `address.city`, `address.district`
- **배열 요소**: `hobbies[0]`, `hobbies[1]`
- **복합 구조**: `user.profile.settings[0].value`

## 🎨 UI/UX 특징

- **깔끔한 디자인**: 모던하고 직관적인 인터페이스
- **반응형 레이아웃**: 모바일/데스크톱 모두 지원
- **데이터 타입별 색상**: 시각적 구분을 위한 색상 코딩
- **호버 효과**: 행과 버튼에 인터랙티브 효과
- **알림 시스템**: 성공/오류 메시지 표시

## 🔍 데이터 타입 지원

| 타입 | 표시 | 색상 |
|------|------|------|
| null | `null` | 회색 (기울임체) |
| boolean | `true`/`false` | 초록색 (굵게) |
| number | `123` | 파란색 |
| string | `"text"` | 보라색 |
| object | `{"key":"value"}` | 주황색 (모노스페이스) |

## 🛠️ 개발 환경 설정

1. 프로젝트 클론
```bash
git clone https://github.com/your-username/json-table-viewer.git
cd json-table-viewer
```

2. 로컬에서 실행
```bash
# Python 3
python -m http.server 8000

# 또는 Node.js
npx http-server
```

3. 브라우저에서 `http://localhost:8000/index-improved.html` 접속

## 📱 크롬 확장앱 사용법

1. Chrome에서 `chrome://extensions/` 접속
2. "개발자 모드" 활성화
3. "압축해제된 확장 프로그램을 로드합니다" 클릭
4. 프로젝트 폴더 선택
5. 브라우저 툴바에서 확장앱 아이콘 클릭

## 🔧 커스터마이징

### 스타일 수정
```css
/* 테이블 헤더 색상 변경 */
.json-table th {
  background: linear-gradient(135deg, #your-color 0%, #your-color2 100%);
}

/* 셀 타입별 색상 변경 */
.cell-number {
  color: #your-number-color;
}
```

### 기능 확장
```javascript
// 새로운 데이터 타입 처리 추가
getCellClassName(value) {
  if (typeof value === 'date') return 'cell-date';
  // ... 기존 로직
}
```

## 🐛 문제 해결

### JSON 파싱 오류
- JSON 문법 확인 (쉼표, 따옴표, 괄호)
- 브라우저 콘솔에서 오류 메시지 확인

### 테이블이 표시되지 않는 경우
- 데이터가 비어있는지 확인
- JavaScript 오류 확인 (F12 → Console)

### 성능 이슈
- 대용량 데이터 (10,000개 이상)는 브라우저 성능에 영향
- 필요시 데이터를 청크로 나누어 처리

## 🤝 기여하기

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 라이선스

이 프로젝트는 MIT 라이선스 하에 배포됩니다.

## 📞 문의

프로젝트에 대한 질문이나 제안사항이 있으시면 이슈를 생성해 주세요.

---

⭐ 이 프로젝트가 도움이 되었다면 스타를 눌러주세요! 