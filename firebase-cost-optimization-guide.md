# Logbase Website - Firebase Container Registry 비용 절감 가이드

## 📋 프로젝트 개요

**프로젝트명**: Logbase Website  
**기술 스택**: Next.js + Firebase Functions + Firestore  
**배포 환경**: Firebase Hosting + Functions (asia-northeast3)  
**주요 기능**: RSS 피드 수집, 뉴스레터, 문의 폼

## 🚨 즉시 조치 (비용 중단)

### 1. GCP Console에서 Vulnerability Scanning 비활성화

**단계별 조치:**

1. **GCP Console 접속**

   - https://console.cloud.google.com 접속
   - `logbase-website` 프로젝트 선택

2. **Container Registry 설정 접근**

   - 왼쪽 메뉴에서 "Container Registry" 선택
   - "Settings" 탭 클릭

3. **Vulnerability Scanning 비활성화**
   - "Vulnerability scanning" 옵션 체크 해제
   - "Save" 버튼 클릭

### 2. Container Registry 이미지 정리

**현재 프로젝트 관련 이미지 확인:**

- `gcr.io/logbase-website/*` 이미지들 검토
- 사용하지 않는 Next.js 빌드 이미지 삭제
- 오래된 배포 이미지 정리

## 🔧 Logbase Website 특화 최적화

### 1. Firebase Functions 최적화

**현재 설정 분석:**

```json
// firebase.json (현재)
{
  "functions": [
    {
      "source": "functions",
      "codebase": "default",
      "runtime": "nodejs20"
    }
  ]
}
```

**최적화된 설정:**

```json
{
  "functions": [
    {
      "source": "functions",
      "codebase": "default",
      "runtime": "nodejs20",
      "memory": "512MB",
      "timeoutSeconds": 300,
      "maxInstances": 5,
      "ignore": [
        "node_modules",
        ".git",
        "firebase-debug.log",
        "firebase-debug.*.log",
        "*.local",
        ".next",
        "src",
        "test-*.js"
      ]
    }
  ]
}
```

### 2. Next.js 빌드 최적화

**functions/next.config.js 최적화:**

```javascript
const nextConfig = {
  output: "standalone",
  eslint: { ignoreDuringBuilds: true },
  typescript: { ignoreBuildErrors: true },
  experimental: {
    // 빌드 크기 최적화
    optimizeCss: true,
    optimizePackageImports: ["@google-cloud/secret-manager"],
  },
  // 불필요한 파일 제외
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.fallback = {
        fs: false,
        net: false,
        tls: false,
      };
    }
    return config;
  },
};
```

### 3. 배포 스크립트 최적화

**현재 배포 프로세스 개선:**

```bash
# package.json 스크립트 최적화
{
  "scripts": {
    "deploy:optimized": "npm run build:functions && npm run build:standalone && npm run cleanup && firebase deploy --only functions,hosting",
    "cleanup": "node scripts/cleanup-images.js",
    "build:standalone": "next build && npm run copy-standalone && npm run cleanup-build"
  }
}
```

**cleanup-images.js 스크립트 생성:**

```javascript
// scripts/cleanup-images.js
const { execSync } = require("child_process");

// 30일 이상 된 이미지 삭제
const cleanupOldImages = () => {
  try {
    execSync(
      'gcloud container images list-tags gcr.io/logbase-website/nextjs --filter="timestamp.datetime<2024-01-01" --format="value(digest)" | xargs -I {} gcloud container images delete gcr.io/logbase-website/nextjs@{} --quiet'
    );
    console.log("✅ 오래된 이미지 정리 완료");
  } catch (error) {
    console.log("⚠️ 이미지 정리 중 오류:", error.message);
  }
};

cleanupOldImages();
```

## 💰 비용 모니터링 설정

### 1. GCP Billing Alert 설정

**Logbase Website 전용 예산 설정:**

```
1. GCP Console → Billing
2. logbase-website 프로젝트 선택
3. Budgets & alerts → Create budget
4. 예산 금액: 월 $30 (현재 사용량 기준)
5. Alert 임계값: 50%, 80%, 100%
6. 알림 대상: 개발팀 이메일
```

### 2. Container Registry 사용량 모니터링

**정기 점검 항목 (월 1회):**

- [ ] Next.js 빌드 이미지 크기 확인
- [ ] 30일 이상 된 이미지 삭제
- [ ] Functions 배포 후 이전 이미지 정리
- [ ] Storage 사용량 확인

## 📊 Logbase Website 비용 분석

### 1. 현재 비용 발생 원인

**Container Registry 비용 구성:**

- **Storage**: Next.js 빌드 이미지 저장 (약 500MB/배포)
- **Network**: 이미지 다운로드 (Functions 실행 시)
- **Vulnerability Scanning**: 자동 보안 스캔 (가장 큰 비용)

### 2. 프로젝트별 최적화 포인트

**RSS 피드 수집 최적화:**

```javascript
// functions/index.js
exports.rssCollect = onRequest(
  {
    region: "asia-northeast3",
    memory: "256MB", // RSS 수집은 메모리 적게 사용
    timeoutSeconds: 120,
  },
  async (req, res) => {
    // RSS 수집 로직
  }
);
```

**뉴스레터 기능 최적화:**

```javascript
// functions/index.js
exports.newsletterSend = onRequest(
  {
    region: "asia-northeast3",
    memory: "512MB",
    timeoutSeconds: 300,
    maxInstances: 2, // 뉴스레터는 동시 실행 제한
  },
  async (req, res) => {
    // 뉴스레터 발송 로직
  }
);
```

## ✅ Logbase Website 체크리스트

### 즉시 조치 (1일 내)

- [ ] GCP Console에서 Vulnerability Scanning 비활성화
- [ ] 사용하지 않는 Container Registry 이미지 삭제
- [ ] Billing Alert 설정 (월 $30 예산)

### 단기 조치 (1주 내)

- [OK] firebase.json Functions 설정 최적화
- [OK] next.config.js 빌드 최적화
- [OK] cleanup-images.js 스크립트 추가
- [ ] 배포 스크립트 최적화

### 장기 조치 (1개월 내)

- [ ] 월 1회 이미지 정리 스케줄 설정
- [ ] RSS 수집 최적화 (메모리/타임아웃 조정)
- [ ] 뉴스레터 발송 최적화
- [ ] 팀 내 비용 관리 가이드라인 수립

## 🎯 Logbase Website 추천 조치 순서

### 1단계: 비용 중단 (즉시)

1. Vulnerability Scanning 비활성화
2. 불필요한 Next.js 빌드 이미지 삭제

### 2단계: 최적화 (1주 내)

1. firebase.json Functions 설정 최적화
2. next.config.js 빌드 최적화
3. cleanup-images.js 스크립트 추가

### 3단계: 모니터링 (1개월 내)

1. Billing Alert 설정
2. 월 1회 이미지 정리 스케줄 설정
3. RSS/뉴스레터 기능 최적화

## 🔧 Logbase Website 특화 설정

### 1. 환경별 최적화

**개발 환경:**

```bash
# 로컬 개발 시 Container Registry 사용 안함
npm run dev
```

**배포 환경:**

```bash
# 최적화된 배포
npm run deploy:optimized
```

### 2. RSS 데이터 최적화

**Firestore 인덱스 최적화:**

```json
// firestore.indexes.json
{
  "indexes": [
    {
      "collectionGroup": "rss_items",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "blogName", "order": "ASCENDING" },
        { "fieldPath": "collectedDate", "order": "DESCENDING" }
      ]
    }
  ]
}
```

## 📞 Logbase Website 지원

### 프로젝트 관련 지원

- **Firebase Console**: https://console.firebase.google.com/project/logbase-website
- **GCP Console**: https://console.cloud.google.com/project/logbase-website
- **배포 가이드**: `배포시중요사항.md` 참조

### 비용 관련 지원

- **GCP Billing**: GCP Console → Billing → Support
- **Firebase Support**: Firebase Console → Support

## 📝 Logbase Website 참고 사항

- **Container Registry**: Next.js standalone 빌드로 인해 자동 생성됨
- **Functions 리전**: asia-northeast3 (한국) 사용 중
- **배포 빈도**: RSS 수집 및 뉴스레터 발송 시 배포
- **이미지 크기**: Next.js 빌드 이미지 약 500MB/배포
- **정기 정리**: 월 1회 오래된 이미지 삭제 권장

---

**문서 버전**: 1.0  
**최종 업데이트**: 2025년 9월  
**프로젝트**: Logbase Website  
**작성자**: 개발팀
