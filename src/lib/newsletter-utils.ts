import crypto from 'crypto';

// 구독 취소 토큰 생성 함수
export function generateUnsubscribeToken(email: string): string {
  const secret = process.env.UNSUBSCRIBE_SECRET || 'default-secret-key';
  return crypto.createHmac('sha256', secret).update(email).digest('hex').substring(0, 16);
}

// 구독 취소 URL 생성 함수
export function generateUnsubscribeUrl(email: string): string {
  const token = generateUnsubscribeToken(email);
  
  // 런타임에 실제 배포 URL 감지
  let baseUrl = 'https://logbase.kr'; // 기본값
  
  if (process.env.FIREBASE_CONFIG || process.env.FUNCTION_TARGET) {
    // Firebase Functions 환경
    const functionUrl = process.env.FIREBASE_FUNCTION_URL || process.env.VERCEL_URL;
    
    if (functionUrl && functionUrl.includes('logbase.kr')) {
      baseUrl = 'https://logbase.kr';
    } else if (functionUrl && functionUrl.includes('localhost')) {
      baseUrl = 'http://localhost:3000';
    } else {
      baseUrl = 'https://logbase.kr';
    }
  } else {
    // 로컬 환경
    baseUrl = 'http://localhost:3000';
  }
  
  return `${baseUrl}/unsubscribe?email=${encodeURIComponent(email)}&token=${token}`;
} 