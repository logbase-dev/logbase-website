/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  // Firebase Functions 환경에서도 standalone 활성화
  output: 'standalone',
  experimental: {
    // 빌드 크기 최적화
    optimizeCss: true,
    optimizePackageImports: ['@google-cloud/secret-manager'],
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
    // @toast-ui/editor 관련 모듈을 서버 빌드에서 제외 (ReferenceError: self is not defined 에러 방지)
    if (isServer) {
      config.externals.push('@toast-ui/editor', '@toast-ui/react-editor');
    }
    return config;
  },
};

module.exports = nextConfig; 