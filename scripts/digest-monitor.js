#!/usr/bin/env node
/* eslint-disable */

/**
 * Logbase Website - Digest 재사용 모니터링 스크립트
 * 
 * 사용법:
 * npm run digest:monitor
 * 
 * 기능:
 * - Container Registry 이미지 digest 분석
 * - 레이어 재사용률 확인
 * - 비용 절감 효과 분석
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// 프로젝트 설정
const PROJECT_ID = 'logbase-website';
const REGISTRY_URL = `gcr.io/${PROJECT_ID}`;
const IMAGE_NAME = 'nextjs';

// 로그 출력 함수
const log = (message, type = 'info') => {
  const timestamp = new Date().toISOString();
  const prefix = type === 'error' ? '❌' : type === 'warning' ? '⚠️' : '✅';
  console.log(`${prefix} [${timestamp}] ${message}`);
};

// gcloud 명령어 실행 함수
const runCommand = (command, description) => {
  try {
    log(`실행 중: ${description}`);
    const result = execSync(command, { encoding: 'utf8' });
    log(`${description} 완료`);
    return result;
  } catch (error) {
    log(`${description} 실패: ${error.message}`, 'error');
    return null;
  }
};

// 이미지 digest 분석
const analyzeImageDigest = () => {
  const command = `gcloud container images describe ${REGISTRY_URL}/${IMAGE_NAME} --format="value(image_summary.digest)"`;
  return runCommand(command, '이미지 digest 분석');
};

// 레이어 정보 조회
const getLayerInfo = () => {
  const command = `gcloud container images describe ${REGISTRY_URL}/${IMAGE_NAME} --format="table(layer.digest,layer.size)"`;
  return runCommand(command, '레이어 정보 조회');
};

// 이미지 크기 분석
const analyzeImageSize = () => {
  const command = `gcloud container images list-tags ${REGISTRY_URL}/${IMAGE_NAME} --format="table(timestamp,digest,size)" --limit=5`;
  return runCommand(command, '이미지 크기 분석');
};

// digest 재사용률 계산
const calculateReuseRate = (currentDigest, previousDigest) => {
  if (!currentDigest || !previousDigest) {
    return 0;
  }
  
  // 간단한 digest 유사도 계산 (실제로는 더 복잡한 알고리즘 필요)
  const currentHash = currentDigest.substring(0, 12);
  const previousHash = previousDigest.substring(0, 12);
  
  return currentHash === previousHash ? 100 : 0;
};

// 비용 절감 효과 분석
const analyzeCostSavings = (reuseRate, imageSize) => {
  const baseCost = 0.026; // $0.026 per GB per month
  const savings = (reuseRate / 100) * baseCost * (imageSize / 1024); // GB 단위
  
  return {
    reuseRate,
    imageSizeGB: imageSize / 1024,
    monthlySavings: savings,
    yearlySavings: savings * 12
  };
};

// 메인 분석 함수
const monitorDigestReuse = () => {
  log('Digest 재사용 모니터링 시작');
  
  // 1. 현재 이미지 digest 분석
  log('현재 이미지 digest 분석 중...');
  const currentDigest = analyzeImageDigest();
  
  // 2. 레이어 정보 조회
  log('레이어 정보 조회 중...');
  const layerInfo = getLayerInfo();
  
  // 3. 이미지 크기 분석
  log('이미지 크기 분석 중...');
  const sizeInfo = analyzeImageSize();
  
  // 4. 결과 출력
  console.log('\n📊 Digest 재사용 분석 결과');
  console.log('=' .repeat(50));
  
  if (currentDigest) {
    console.log(`현재 Digest: ${currentDigest.trim()}`);
  }
  
  if (layerInfo) {
    console.log('\n레이어 정보:');
    console.log(layerInfo);
  }
  
  if (sizeInfo) {
    console.log('\n이미지 크기 정보:');
    console.log(sizeInfo);
  }
  
  // 5. 비용 절감 효과 추정
  const estimatedReuseRate = 30; // 예상 재사용률 30%
  const estimatedImageSize = 500; // 예상 이미지 크기 500MB
  const costAnalysis = analyzeCostSavings(estimatedReuseRate, estimatedImageSize);
  
  console.log('\n💰 비용 절감 효과 추정:');
  console.log(`- 예상 재사용률: ${costAnalysis.reuseRate}%`);
  console.log(`- 이미지 크기: ${costAnalysis.imageSizeGB.toFixed(2)} GB`);
  console.log(`- 월 절감 비용: $${costAnalysis.monthlySavings.toFixed(4)}`);
  console.log(`- 연 절감 비용: $${costAnalysis.yearlySavings.toFixed(2)}`);
  
  // 6. 최적화 권장사항
  console.log('\n🔧 최적화 권장사항:');
  console.log('1. 의존성 버전 고정 (^ 제거)');
  console.log('2. 멀티스테이지 빌드 사용');
  console.log('3. .dockerignore 최적화');
  console.log('4. 정기적인 이미지 정리');
  console.log('5. 레이어 순서 최적화');
};

// 스크립트 실행
if (require.main === module) {
  try {
    monitorDigestReuse();
    log('Digest 재사용 모니터링 완료');
  } catch (error) {
    log(`모니터링 중 오류 발생: ${error.message}`, 'error');
    process.exit(1);
  }
}

module.exports = { monitorDigestReuse, analyzeCostSavings }; 