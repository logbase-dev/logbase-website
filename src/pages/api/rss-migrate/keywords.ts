import { NextApiRequest, NextApiResponse } from 'next';
import { adminDb } from '@/lib/firebase-admin';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // CORS 헤더 설정
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  // OPTIONS 요청 처리
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method === 'GET') {
    try {
      const rssCollection = adminDb.collection('rss_items');
      const querySnapshot = await rssCollection.get();
      
      const keywords = new Set<string>(); 
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        if (data.blogName) {
          keywords.add(data.blogName);
        }
      });

      res.status(200).json({
        success: true,
        data: Array.from(keywords).sort()
      });
    } catch (error) {
      console.error('키워드 조회 에러:', error);
      res.status(500).json({
        success: false,
        error: '키워드 조회 중 오류가 발생했습니다.'
      });
    }
  } else if (req.method === 'POST') {
    try {
      const { guid, matchedKeywords } = req.body;
      
      // GUID 유효성 검사
      if (!guid || typeof guid !== 'string' || !Array.isArray(matchedKeywords)) {
        console.error('❌ 잘못된 파라미터:', { guid, matchedKeywords, guidType: typeof guid });
        return res.status(400).json({ 
          success: false, 
          error: 'Invalid parameters: guid must be a string and matchedKeywords must be an array' 
        });
      }

      // GUID 정제
      const trimmedGuid = guid.trim();
      if (!trimmedGuid) {
        console.error('❌ GUID가 빈 문자열입니다.');
        return res.status(400).json({
          success: false,
          error: 'GUID cannot be empty'
        });
      }

      // GUID 유효성 검사는 생략 (URL과 Firestore ID 모두 허용)
      // Base64 인코딩을 통해 Firestore 호환 문서 ID 생성

      console.log('🔧 Keywords API 호출:', { guid: trimmedGuid, matchedKeywords });

      // 타임아웃 설정 (25초)
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Database operation timeout')), 25000);
      });

      // 1. 인코딩된 GUID로 시도
      const encodedGuid = Buffer.from(trimmedGuid).toString('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
      console.log(`🔍 인코딩된 GUID: ${encodedGuid}`);
      
      let docRef = adminDb.collection('rss_items').doc(encodedGuid);
      let docSnapshot = await Promise.race([
        docRef.get(),
        timeoutPromise
      ]) as FirebaseFirestore.DocumentSnapshot;
      
      // 2. 원본 GUID로 시도 (수동 작성 글) - URL 형태가 아닌 경우에만
      if (!docSnapshot.exists && !trimmedGuid.includes('/')) {
        console.log(`- 인코딩된 GUID(${encodedGuid})로 문서를 찾지 못했습니다. 원본 GUID로 재시도합니다.`);
        docRef = adminDb.collection('rss_items').doc(trimmedGuid);
        docSnapshot = await Promise.race([
          docRef.get(),
          timeoutPromise
        ]) as FirebaseFirestore.DocumentSnapshot;
      } else if (!docSnapshot.exists) {
        console.log(`- 인코딩된 GUID(${encodedGuid})로 문서를 찾지 못했습니다. URL 형태 GUID는 직접 doc() 호출을 건너뜁니다.`);
      }

      // 3. guid 필드로 검색 (마지막 시도)
      if (!docSnapshot.exists) {
        console.log(`- 원본 GUID(${trimmedGuid})로도 문서를 찾지 못했습니다. guid 필드로 검색 시도...`);
        const snapshot = await Promise.race([
          adminDb.collection('rss_items').where('guid', '==', trimmedGuid).limit(1).get(),
          timeoutPromise
        ]) as FirebaseFirestore.QuerySnapshot;
        
        if (snapshot.empty) {
          console.log('❌ RSS 아이템을 찾을 수 없음:', trimmedGuid);
          return res.status(404).json({ 
            success: false, 
            error: 'RSS item not found' 
          });
        }
        
        // guid 필드로 찾은 문서 사용
        const foundDoc = snapshot.docs[0];
        docRef = foundDoc.ref;
        console.log(`✅ guid 필드로 문서 발견: ${foundDoc.id}`);
      }
      
      // 업데이트 실행을 타임아웃과 함께
      await Promise.race([
        docRef.update({
          matchedKeywords: matchedKeywords,
          updatedAt: new Date()
        }),
        timeoutPromise
      ]);

      console.log('✅ 키워드 업데이트 성공:', { docId: docRef.id, guid: trimmedGuid, matchedKeywords });
      res.status(200).json({ success: true, message: 'Keywords updated successfully' });

    } catch (error: unknown) {
      console.error('❌ Keywords API 에러:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      if (errorMessage === 'Database operation timeout') {
        res.status(408).json({ success: false, error: 'Database operation timeout' });
      } else {
        res.status(500).json({ success: false, error: 'Internal server error: ' + errorMessage });
      }
    }
  } else {
    res.setHeader('Allow', ['GET', 'POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
} 