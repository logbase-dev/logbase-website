import { initializeApp, getApps } from 'firebase/app';
import { getFirestore, connectFirestoreEmulator } from 'firebase/firestore';
import { getAuth, connectAuthEmulator } from 'firebase/auth';

const firebaseConfig = {
  apiKey: "AIzaSyA6kCmSqaBH5SUPb4PkHU1hwe0l5Ppqw2w",
  authDomain: "logbase-blog-83db6.firebaseapp.com",
  projectId: "logbase-blog-83db6",
  storageBucket: "logbase-blog-83db6.firebasestorage.app",
  messagingSenderId: "938632982963",
  appId: "1:938632982963:web:6159f776e4466bf74bdbc6"
};

// Initialize Firebase
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
const db = getFirestore(app);
const auth = getAuth(app);

// 개발 환경에서 에뮬레이터 연결 (선택사항)
if (process.env.NODE_ENV === 'development' && typeof window !== 'undefined') {
  // 브라우저 환경에서만 에뮬레이터 연결
  // connectFirestoreEmulator(db, 'localhost', 8080);
  // connectAuthEmulator(auth, 'http://localhost:9099');
}

export { app, db, auth }; 