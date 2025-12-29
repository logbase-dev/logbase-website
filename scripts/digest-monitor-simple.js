#!/usr/bin/env node
/* eslint-disable */

/**
 * Logbase Website - 간단한 Digest 모니터링 스크립트
 * 
 * 사용법:
 * npm run digest:monitor:simple
 * 
 * 기능:
 * - API 없이 기본적인 digest 정보 분석
 * - 로컬 파일 기반 분석
 * - 비용 절감 효과 추정
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// 로그 출력 함수
const log = (message, type = 'info') => {
  const timestamp = new Date().toISOString();
  const prefix = type === 'error' ? '❌' : type === 'warning' ? '⚠️' : '✅';
  console.log(`${prefix} [${timestamp}] ${message}`);
};

// 파일 크기 분석
const analyzeFileSizes = () => {
  const sizes = {};
  
  try {
    // package.json 크기
    const packageJsonPath = path.join(process.cwd(), 'package.json');
    if (fs.existsSync(packageJsonPath)) {
      const stats = fs.statSync(packageJsonPath);
      sizes.packageJson = stats.size;
    }
    
    // package-lock.json 크기
    const packageLockPath = path.join(process.cwd(), 'package-lock.json');
    if (fs.existsSync(packageLockPath)) {
      const stats = fs.statSync(packageLockPath);
      sizes.packageLock = stats.size;
    }
    
    // node_modules 크기 (대략적)
    const nodeModulesPath = path.join(process.cwd(), 'node_modules');
    if (fs.existsSync(nodeModulesPath)) {
      const stats = fs.statSync(nodeModulesPath);
      sizes.nodeModules = stats.size;
    }
    
    // .next 디렉토리 크기
    const nextPath = path.join(process.cwd(), '.next');
    if (fs.existsSync(nextPath)) {
      const stats = fs.statSync(nextPath);
      sizes.next = stats.size;
    }
    
  } catch (error) {
    log(`파일 크기 분석 중 오류: ${error.message}`, 'warning');
  }
  
  return sizes;
};

// 의존성 버전 분석
const analyzeDependencies = () => {
  try {
    const packageJsonPath = path.join(process.cwd(), 'package.json');
    const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
    
    const dependencies = packageJson.dependencies || {};
    const devDependencies = packageJson.devDependencies || {};
    
    // 버전 고정 여부 확인
    const fixedVersions = [];
    const flexibleVersions = [];
    
    [...Object.entries(dependencies), ...Object.entries(devDependencies)].forEach(([name, version]) => {
      if (version.startsWith('^') || version.startsWith('~')) {
        flexibleVersions.push({ name, version });
      } else {
        fixedVersions.push({ name, version });
      }
    });
    
    return {
      fixedVersions,
      flexibleVersions,
      totalDependencies: Object.keys(dependencies).length,
      totalDevDependencies: Object.keys(devDependencies).length
    };
  } catch (error) {
    log(`의존성 분석 중 오류: ${error.message}`, 'warning');
    return { fixedVersions: [], flexibleVersions: [], totalDependencies: 0, totalDevDependencies: 0 };
  }
};

// 빌드 최적화 분석
const analyzeBuildOptimization = () => {
  try {
    const nextConfigPath = path.join(process.cwd(), 'next.config.js');
    const nextConfig = fs.readFileSync(nextConfigPath, 'utf8');
    
    const optimizations = {
      standalone: nextConfig.includes('output: \'standalone\''),
      optimizeCss: nextConfig.includes('optimizeCss: true'),
      optimizePackageImports: nextConfig.includes('optimizePackageImports'),
      webpackOptimization: nextConfig.includes('webpack'),
      eslintIgnore: nextConfig.includes('ignoreDuringBuilds: true'),
      typescriptIgnore: nextConfig.includes('ignoreBuildErrors: true')
    };
    
    return optimizations;
  } catch (error) {
    log(`빌드 최적화 분석 중 오류: ${error.message}`, 'warning');
    return {};
  }
};

// 비용 절감 효과 추정
const estimateCostSavings = (fileSizes, dependencies, optimizations) => {
  const baseCost = 0.026; // $0.026 per GB per month
  
  // 파일 크기 기반 절감
  const totalSizeMB = Object.values(fileSizes).reduce((sum, size) => sum + (size || 0), 0) / (1024 * 1024);
  const sizeSavings = totalSizeMB * baseCost / 1024; // GB 단위로 변환
  
  // 의존성 최적화 기반 절감
  const dependencyOptimization = dependencies.flexibleVersions.length * 0.001; // 버전 고정당 $0.001 절감
  
  // 빌드 최적화 기반 절감
  const buildOptimization = Object.values(optimizations).filter(Boolean).length * 0.002; // 최적화당 $0.002 절감
  
  const totalMonthlySavings = sizeSavings + dependencyOptimization + buildOptimization;
  
  return {
    totalSizeMB: totalSizeMB.toFixed(2),
    sizeSavings: sizeSavings.toFixed(4),
    dependencyOptimization: dependencyOptimization.toFixed(4),
    buildOptimization: buildOptimization.toFixed(4),
    totalMonthlySavings: totalMonthlySavings.toFixed(4),
    yearlySavings: (totalMonthlySavings * 12).toFixed(2)
  };
};

// 메인 분석 함수
const monitorDigestReuseSimple = () => {
  log('간단한 Digest 재사용 모니터링 시작');
  
  // 1. 파일 크기 분석
  log('파일 크기 분석 중...');
  const fileSizes = analyzeFileSizes();
  
  // 2. 의존성 분석
  log('의존성 분석 중...');
  const dependencies = analyzeDependencies();
  
  // 3. 빌드 최적화 분석
  log('빌드 최적화 분석 중...');
  const optimizations = analyzeBuildOptimization();
  
  // 4. 비용 절감 효과 추정
  const costSavings = estimateCostSavings(fileSizes, dependencies, optimizations);
  
  // 5. 결과 출력
  console.log('\n📊 간단한 Digest 재사용 분석 결과');
  console.log('=' .repeat(50));
  
  console.log('\n📁 파일 크기 분석:');
  Object.entries(fileSizes).forEach(([name, size]) => {
    if (size) {
      console.log(`- ${name}: ${(size / (1024 * 1024)).toFixed(2)} MB`);
    }
  });
  
  console.log('\n📦 의존성 분석:');
  console.log(`- 고정 버전: ${dependencies.fixedVersions.length}개`);
  console.log(`- 유연 버전: ${dependencies.flexibleVersions.length}개`);
  console.log(`- 총 의존성: ${dependencies.totalDependencies}개`);
  console.log(`- 개발 의존성: ${dependencies.totalDevDependencies}개`);
  
  if (dependencies.flexibleVersions.length > 0) {
    console.log('\n⚠️ 버전 고정 권장 의존성:');
    dependencies.flexibleVersions.slice(0, 5).forEach(({ name, version }) => {
      console.log(`  - ${name}: ${version}`);
    });
  }
  
  console.log('\n🔧 빌드 최적화 상태:');
  Object.entries(optimizations).forEach(([name, enabled]) => {
    console.log(`- ${name}: ${enabled ? '✅' : '❌'}`);
  });
  
  console.log('\n💰 비용 절감 효과 추정:');
  console.log(`- 총 파일 크기: ${costSavings.totalSizeMB} MB`);
  console.log(`- 크기 기반 절감: $${costSavings.sizeSavings}/월`);
  console.log(`- 의존성 최적화: $${costSavings.dependencyOptimization}/월`);
  console.log(`- 빌드 최적화: $${costSavings.buildOptimization}/월`);
  console.log(`- 총 월 절감: $${costSavings.totalMonthlySavings}`);
  console.log(`- 연 절감: $${costSavings.yearlySavings}`);
  
  console.log('\n🔧 최적화 권장사항:');
  console.log('1. 의존성 버전 고정 (^ 제거)');
  console.log('2. 멀티스테이지 빌드 사용');
  console.log('3. .dockerignore 최적화');
  console.log('4. 정기적인 이미지 정리');
  console.log('5. 레이어 순서 최적화');
  console.log('6. Artifact Registry API 활성화 (완전한 분석을 위해)');
};

// 스크립트 실행
if (require.main === module) {
  try {
    monitorDigestReuseSimple();
    log('간단한 Digest 재사용 모니터링 완료');
  } catch (error) {
    log(`모니터링 중 오류 발생: ${error.message}`, 'error');
    process.exit(1);
  }
}

module.exports = { monitorDigestReuseSimple, estimateCostSavings }; 