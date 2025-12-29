#!/usr/bin/env node
/* eslint-disable */

/**
 * Logbase Website - Container Registry 이미지 정리 스크립트
 * 
 * 사용법:
 * npm run cleanup
 * 
 * 기능:
 * - 30일 이상 된 Container Registry 이미지 삭제
 * - Next.js 빌드 이미지 크기 최적화
 * - 배포 후 이전 이미지 정리
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// 프로젝트 설정
const PROJECT_ID = 'logbase-blog-83db6';
const REGISTRY_URL = `gcr.io/${PROJECT_ID}`;
const IMAGE_NAME = 'functions/nextjsFunc';

// 30일 전 날짜 계산 (YYYY-MM-DD 형식)
const getDate30DaysAgo = () => {
  const date = new Date();
  date.setDate(date.getDate() - 30);
  return date.toISOString().split('T')[0];
};

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

// 오래된 이미지 목록 조회
const getOldImages = () => {
  const cutoffDate = getDate30DaysAgo();
  const command = `gcloud container images list-tags ${REGISTRY_URL}/${IMAGE_NAME} --filter="timestamp.datetime<${cutoffDate}" --format="value(digest)"`;
  
  try {
    const result = execSync(command, { encoding: 'utf8' });
    return result.trim().split('\n').filter(digest => digest.length > 0);
  } catch (error) {
    log('오래된 이미지 조회 실패', 'error');
    return [];
  }
};

// 이미지 삭제
const deleteImage = (digest) => {
  const command = `gcloud container images delete ${REGISTRY_URL}/${IMAGE_NAME}@${digest} --quiet`;
  return runCommand(command, `이미지 삭제: ${digest.substring(0, 12)}...`);
};

// 이미지 크기 조회
const getImageSize = () => {
  const command = `gcloud container images list-tags ${REGISTRY_URL}/${IMAGE_NAME} --format="table(timestamp,digest,size)"`;
  return runCommand(command, '이미지 크기 조회');
};

// 메인 정리 함수
const cleanupImages = () => {
  log('Container Registry 이미지 정리 시작');
  
  // 1. 현재 이미지 크기 확인
  log('현재 이미지 상태 확인 중...');
  const currentSize = getImageSize();
  if (currentSize) {
    console.log('\n현재 이미지 목록:');
    console.log(currentSize);
  }
  
  // 2. 오래된 이미지 조회
  log('오래된 이미지 조회 중...');
  const oldImages = getOldImages();
  
  if (oldImages.length === 0) {
    log('삭제할 오래된 이미지가 없습니다.');
    return;
  }
  
  log(`삭제할 이미지 수: ${oldImages.length}개`);
  
  // 3. 오래된 이미지 삭제
  let deletedCount = 0;
  oldImages.forEach((digest, index) => {
    log(`삭제 중 (${index + 1}/${oldImages.length}): ${digest.substring(0, 12)}...`);
    if (deleteImage(digest)) {
      deletedCount++;
    }
  });
  
  // 4. 정리 결과 출력
  log(`정리 완료: ${deletedCount}/${oldImages.length}개 이미지 삭제됨`);
  
  // 5. 정리 후 이미지 크기 확인
  log('정리 후 이미지 상태 확인 중...');
  const finalSize = getImageSize();
  if (finalSize) {
    console.log('\n정리 후 이미지 목록:');
    console.log(finalSize);
  }
};

// 스크립트 실행
if (require.main === module) {
  try {
    cleanupImages();
    log('이미지 정리 작업 완료');
  } catch (error) {
    log(`정리 작업 중 오류 발생: ${error.message}`, 'error');
    process.exit(1);
  }
}

module.exports = { cleanupImages, getOldImages, deleteImage }; 