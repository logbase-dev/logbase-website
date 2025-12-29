# Logbase Firestore Database Schema

## 📊 **rss_items Collection**

### **Collection Name**: `rss_items`

**Description**: RSS 피드에서 수집된 블로그 글들과 수동으로 작성된 글들을 저장하는 컬렉션

---

## 🗂️ **Fields (필드)**

| 필드명                    | 타입        | 필수 | 설명                | 예시 값                                                 |
| ------------------------- | ----------- | ---- | ------------------- | ------------------------------------------------------- |
| **title**                 | `string`    | ✅   | 글 제목             | "Next.js 14 새로운 기능 소개"                           |
| **description**           | `string`    | ✅   | 글 설명/요약        | "Next.js 14에서 추가된 새로운 기능들을 살펴보겠습니다." |
| **link**                  | `string`    | ✅   | 원본 글 링크        | "https://example.com/blog/nextjs-14"                    |
| **pubDate**               | `string`    | ✅   | 발행일 (UTC 형식)   | "Mon, 16 Sep 2024 06:00:00 GMT"                         |
| **isoDate**               | `string`    | ✅   | 발행일 (ISO 형식)   | "2024-09-16T06:00:00.000Z"                              |
| **guid**                  | `string`    | ✅   | 고유 식별자         | "blog-1234567890-abc123"                                |
| **blogName**              | `string`    | ✅   | 블로그 이름         | "Logbase", "Tech Blog", "AI News"                       |
| **feedType**              | `string`    | ✅   | 피드 타입           | "competitor", "noncompetitor", "logbase"                |
| **matchedKeywords**       | `array`     | ✅   | 매칭된 키워드       | ["AI", "기술", "블로그"]                                |
| **categories**            | `array`     | ❌   | 카테고리            | ["기술", "AI", "웹개발"]                                |
| **author**                | `string`    | ❌   | 작성자              | "홍길동", "admin@logbase.kr"                            |
| **creator**               | `string`    | ❌   | 생성자              | "홍길동"                                                |
| **dc:creator**            | `string`    | ❌   | Dublin Core 생성자  | "홍길동"                                                |
| **collectedDate**         | `string`    | ✅   | 수집일 (YYYY-MM-DD) | "2024-09-16"                                            |
| **createdAt**             | `timestamp` | ✅   | 생성일시            | `2024-09-16T06:00:00.000Z`                              |
| **updatedAt**             | `timestamp` | ✅   | 수정일시            | `2024-09-16T06:00:00.000Z`                              |
| **news_letter_sent_date** | `string`    | ❌   | 뉴스레터 발송일     | "2024-09-16"                                            |
| **createdBy**             | `string`    | ❌   | 생성 방식           | "manual", "rss-collect"                                 |
| **source**                | `string`    | ❌   | 생성 경로           | "blog-write-page", "rss-collect"                        |

---

## 📝 **Content Fields (내용 필드)**

| 필드명                     | 타입     | 필수 | 설명                    | 비고                                 |
| -------------------------- | -------- | ---- | ----------------------- | ------------------------------------ |
| **content**                | `string` | ❌   | 전체 글 내용 (마크다운) | TOAST UI Editor에서 작성한 전체 내용 |
| **contentSnippet**         | `string` | ❌   | 내용 요약               | description의 처음 200자 + "..."     |
| **content_encoded**        | `string` | ❌   | 인코딩된 내용           | RSS에서 가져온 HTML 내용             |
| **content_encodedSnippet** | `string` | ❌   | 인코딩된 내용 요약      | HTML 내용의 요약                     |

---

## ��️ **feedType 값 설명**

| 값                | 의미     | 설명                                           |
| ----------------- | -------- | ---------------------------------------------- |
| `"competitor"`    | 경쟁사   | 경쟁사 블로그에서 수집된 글                    |
| `"noncompetitor"` | 비경쟁사 | 일반 블로그에서 수집된 글 (키워드 필터링 적용) |
| `"logbase"`       | 우리글   | Logbase에서 직접 작성한 글                     |

---

## �� **데이터 예시**

### **RSS 수집된 글**

```json
{
  "title": "Next.js 14 새로운 기능 소개",
  "description": "Next.js 14에서 추가된 새로운 기능들을 살펴보겠습니다.",
  "link": "https://example.com/blog/nextjs-14",
  "pubDate": "Mon, 16 Sep 2024 06:00:00 GMT",
  "isoDate": "2024-09-16T06:00:00.000Z",
  "guid": "nextjs-14-features-123",
  "blogName": "Tech Blog",
  "feedType": "noncompetitor",
  "matchedKeywords": ["Next.js", "웹개발"],
  "categories": ["기술", "웹개발"],
  "author": "김개발",
  "collectedDate": "2024-09-16",
  "createdAt": "2024-09-16T06:00:00.000Z",
  "updatedAt": "2024-09-16T06:00:00.000Z",
  "news_letter_sent_date": null,
  "createdBy": "rss-collect",
  "source": "rss-collect"
}
```

### **Logbase에서 작성한 글**

```json
{
  "title": "Logbase 블로그 글 작성 기능 출시",
  "description": "이제 Logbase에서 직접 블로그 글을 작성할 수 있습니다.",
  "link": "https://www.logbase.kr/blog/logbase-1234567890-abc123",
  "pubDate": "Mon, 16 Sep 2024 06:00:00 GMT",
  "isoDate": "2024-09-16T06:00:00.000Z",
  "guid": "logbase-1234567890-abc123",
  "blogName": "Logbase",
  "feedType": "logbase",
  "matchedKeywords": [],
  "categories": ["공지", "기능"],
  "author": "admin@logbase.kr",
  "creator": "admin@logbase.kr",
  "dc:creator": "admin@logbase.kr",
  "collectedDate": "2024-09-16",
  "createdAt": "2024-09-16T06:00:00.000Z",
  "updatedAt": "2024-09-16T06:00:00.000Z",
  "news_letter_sent_date": null,
  "createdBy": "manual",
  "source": "blog-write-page",
  "content": "# Logbase 블로그 글 작성 기능 출시\n\n이제 Logbase에서 직접 블로그 글을 작성할 수 있습니다.\n\n## 주요 기능\n- TOAST UI Editor 지원\n- 이미지 업로드\n- 마크다운 지원",
  "contentSnippet": "이제 Logbase에서 직접 블로그 글을 작성할 수 있습니다. TOAST UI Editor를 사용하여..."
}
```

---

## 🔍 **주요 특징**

1. **RSS 수집**: 외부 RSS 피드에서 자동 수집
2. **수동 작성**: Logbase에서 직접 글 작성
3. **키워드 필터링**: 비경쟁사 글은 키워드 매칭 필터링
4. **중복 방지**: 제목+블로그명으로 중복 체크
5. **날짜 필터링**: 어제 작성된 글만 수집
6. **뉴스레터 연동**: 뉴스레터 발송일 관리

---

## ⚠️ **주의사항**

- **content 필드**: 현재 RSS 수집 시에는 저장되지 않음 (수동 작성 시에만 저장)
- **이미지 처리**: Base64 이미지는 Firebase Storage에 업로드 후 URL로 교체
- **날짜 형식**: 모든 날짜는 한국시간(UTC+9) 기준
- **중복 체크**: 제목+블로그명 조합으로 중복 방지
