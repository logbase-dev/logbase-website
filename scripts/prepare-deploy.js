const fs = require('fs-extra');
const path = require('path');

const projectRoot = path.resolve(__dirname, '..');
const functionsDir = path.join(projectRoot, 'functions');

async function prepareDeploy() {
  console.log('🚀 배포 준비를 시작합니다...');

  try {
    const sourcesToCopy = [
      // 환경 변수 파일 (먼저 복사)
      { from: path.join(projectRoot, '.env.local'), to: path.join(functionsDir, '.env.local') },
      // .next 폴더 (standalone 빌드 결과물 포함)
      { from: path.join(projectRoot, '.next'), to: path.join(functionsDir, '.next') },
      // src 폴더 (소스코드) - 배포시중요사항.md에 명시됨
      { from: path.join(projectRoot, 'src'), to: path.join(functionsDir, 'src') },
      // public 폴더 (정적 에셋)
      { from: path.join(projectRoot, 'public'), to: path.join(functionsDir, 'public') },
      // 설정 파일
      { from: path.join(projectRoot, 'next.config.js'), to: path.join(functionsDir, 'next.config.js') },
      { from: path.join(projectRoot, 'tsconfig.json'), to: path.join(functionsDir, 'tsconfig.json') },
    ];

    for (const { from, to } of sourcesToCopy) {
      console.log(`- ${path.relative(projectRoot, from)} 복사 중...`);
      await fs.copy(from, to, {
        // node_modules 와 같은 불필요한 파일 제외
        filter: (src) => !src.includes('node_modules'),
        overwrite: true,
        errorOnExist: false,
        recursive: true,
      });
    }

    console.log('✅ 파일 복사가 완료되었습니다.');
    console.log('📦 functions 디렉토리에서 Next.js 의존성을 설치합니다...');
    // functions/package.json 에 next가 포함되어 있어야 합니다.

    console.log('✨ 배포 준비가 완료되었습니다.');
  } catch (error) {
    console.error('❌ 배포 준비 중 오류가 발생했습니다:', error);
    process.exit(1);
  }
}

prepareDeploy();