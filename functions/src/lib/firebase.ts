import { initializeApp, getApps } from 'firebase/app';
import { getFirestore, connectFirestoreEmulator } from 'firebase/firestore';
import { getAuth, connectAuthEmulator } from 'firebase/auth';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

// 환경 변수가 제대로 설정되었는지 확인
if (!firebaseConfig.apiKey || !firebaseConfig.projectId) {
  throw new Error(
    'Firebase 설정이 올바르지 않습니다. .env.local 파일에 NEXT_PUBLIC_FIREBASE_ 환경 변수를 확인해주세요.'
  );
}

// Initialize Firebase
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
const db = getFirestore(app);
const auth = getAuth(app);

// 개발 환경에서 에뮬레이터 연결
if (process.env.NODE_ENV === 'development' && typeof window !== 'undefined') {
  // 에뮬레이터 중복 연결 방지
  try {
    // Firestore 에뮬레이터 연결
    if (process.env.NEXT_PUBLIC_FIRESTORE_EMULATOR_HOST) {
      const [host, port] = process.env.NEXT_PUBLIC_FIRESTORE_EMULATOR_HOST.split(':');
      connectFirestoreEmulator(db, host || '127.0.0.1', parseInt(port || '8081'));
      console.log(`✅ Firestore Emulator 연결 완료: ${host}:${port}`);
    }
    
    // Auth 에뮬레이터 연결
    if (process.env.NEXT_PUBLIC_AUTH_EMULATOR_HOST) {
      const authHost = process.env.NEXT_PUBLIC_AUTH_EMULATOR_HOST.split(':')[0];
      const authPort = process.env.NEXT_PUBLIC_AUTH_EMULATOR_HOST.split(':')[1] || '9099';
      connectAuthEmulator(auth, `http://${authHost}:${authPort}`);
      console.log(`✅ Auth Emulator 연결 완료: ${authHost}:${authPort}`);
    }
  } catch (error) {
    // 이미 연결된 경우 에러 무시
    console.log('Emulator already connected or error:', error);
  }
}

export { app, db, auth }; 