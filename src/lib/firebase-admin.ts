import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getStorage } from 'firebase-admin/storage';

// Firebase Admin SDK 초기화
if (!getApps().length) {
  // 환경 변수에서 서비스 계정 정보 가져오기
  const serviceAccount = {
    type: process.env.FIREBASE_ADMIN_TYPE || 'service_account',
    project_id: process.env.FIREBASE_ADMIN_PROJECT_ID || 'logbase-blog-83db6',
    private_key_id: process.env.FIREBASE_ADMIN_PRIVATE_KEY_ID,
    private_key: process.env.FIREBASE_ADMIN_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    client_email: process.env.FIREBASE_ADMIN_CLIENT_EMAIL,
    client_id: process.env.FIREBASE_ADMIN_CLIENT_ID,
    auth_uri: process.env.FIREBASE_ADMIN_AUTH_URI || 'https://accounts.google.com/o/oauth2/auth',
    token_uri: process.env.FIREBASE_ADMIN_TOKEN_URI || 'https://oauth2.googleapis.com/token',
    auth_provider_x509_cert_url: process.env.FIREBASE_ADMIN_AUTH_PROVIDER_X509_CERT_URL || 'https://www.googleapis.com/oauth2/v1/certs',
    client_x509_cert_url: process.env.FIREBASE_ADMIN_CLIENT_X509_CERT_URL
  };

  initializeApp({
    credential: cert(serviceAccount as any),
    storageBucket: 'logbase-blog-83db6.appspot.com'
  });
}

// Storage 인스턴스 생성
export const adminStorage = getStorage();
export const adminBucket = adminStorage.bucket(); 