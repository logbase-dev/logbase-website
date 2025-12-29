import admin from 'firebase-admin';

function initializeAdminApp() {
  if (admin.apps.length > 0) {
    return admin.app();
  }

  const serviceAccount: admin.ServiceAccount = {
    projectId: process.env.FIREBASE_ADMIN_PROJECT_ID,
    privateKey: process.env.FIREBASE_ADMIN_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    clientEmail: process.env.FIREBASE_ADMIN_CLIENT_EMAIL,
  };

  // Storage Bucket 이름을 환경에 따라 결정
  const storageBucket = process.env.FIREBASE_STORAGE_EMULATOR_HOST
    ? 'logbase-blog-83db6.appspot.com'
    : 'logbase-blog-83db6.firebasestorage.app';

  if (!serviceAccount.privateKey) {
    console.warn('Firebase Admin private key is not set. Using default credentials.');
    return admin.initializeApp({
      projectId: process.env.FIREBASE_ADMIN_PROJECT_ID || 'logbase-blog-83db6',
      storageBucket,
    });
  }

  return admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    storageBucket,
  });
}

const adminApp = initializeAdminApp();
const adminDb = admin.firestore();
const adminStorage = admin.storage();
const adminBucket = adminStorage.bucket();

// 에뮬레이터 연결 확인 (환경 변수를 통해 자동 연결됨)
const firestoreEmulatorHost = process.env.FIRESTORE_EMULATOR_HOST;
const storageEmulatorHost = process.env.FIREBASE_STORAGE_EMULATOR_HOST;

if (firestoreEmulatorHost) {
  console.log(`✅ [Admin SDK] Firestore Emulator 연결: ${firestoreEmulatorHost}`);
  console.log('   환경 변수를 통해 자동 연결되었습니다.');
}

if (storageEmulatorHost) {
  console.log(`✅ [Admin SDK] Storage Emulator 설정: ${storageEmulatorHost}`);
  console.log('   환경 변수를 통해 자동 연결되었습니다.');
}

export { adminApp, adminDb, adminStorage, adminBucket };