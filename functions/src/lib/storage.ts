import { getStorage, ref, uploadString, getDownloadURL, deleteObject } from 'firebase/storage';
import { app } from '@/lib/firebase'; // Firebase 초기화 설정 가져오기

const storage = getStorage(app);

/**
 * Firebase Storage에서 JSON 파일을 읽어옵니다.
 * @param path - Storage 내 파일 경로 (e.g., 'keywords/keywords.json')
 * @returns 파싱된 JSON 객체
 */
export const readJsonFromStorage = async <T>(path: string): Promise<T> => {
  try {
    const fileRef = ref(storage, path);
    const url = await getDownloadURL(fileRef);
    
    // CORS 문제를 피하기 위해 fetch 대신 직접 URL로 요청
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Failed to download file from storage: ${response.statusText}`);
    }
    const data = await response.json();
    console.log(`[Storage] ✅ Successfully read and parsed ${path}`);
    return data as T;
  } catch (error: any) {
    // 파일이 없는 경우 (404) 빈 배열/객체를 반환하도록 처리
    if (error.code === 'storage/object-not-found') {
      console.warn(`[Storage] ⚠️ File not found at ${path}, returning empty array.`);
      return [] as T;
    }
    console.error(`[Storage] ❌ Error reading JSON from ${path}:`, error);
    throw error;
  }
};

/**
 * Firebase Storage에 JSON 파일을 씁니다.
 * @param path - Storage 내 파일 경로 (e.g., 'keywords/keywords.json')
 * @param data - 저장할 JavaScript 객체
 */
export const writeJsonToStorage = async (path: string, data: any): Promise<void> => {
  try {
    const fileRef = ref(storage, path);
    const jsonString = JSON.stringify(data, null, 2);
    await uploadString(fileRef, jsonString, 'raw', {
      contentType: 'application/json',
    });
    console.log(`[Storage] ✅ Successfully wrote to ${path}`);
  } catch (error) {
    console.error(`[Storage] ❌ Error writing JSON to ${path}:`, error);
    throw error;
  }
};

// 참고: 이 프로젝트에서는 파일 삭제 로직이 필요 없지만, 필요시 아래 함수를 사용할 수 있습니다.
export const deleteFileFromStorage = async (path: string): Promise<void> => {
    const fileRef = ref(storage, path);
    await deleteObject(fileRef);
    console.log(`[Storage] ✅ Successfully deleted ${path}`);
};