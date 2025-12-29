import { NextApiRequest, NextApiResponse } from 'next';
// import { collection, query, where, getDocs, updateDoc } from 'firebase/firestore';
// import { db } from '@/lib/firebase';
import { adminDb } from '@/lib/firebase-admin';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  console.log('📅 Newsletter Date API 호출됨:', { method: req.method, body: req.body });
  
  if (req.method !== 'POST') {
    console.log('❌ Method not allowed:', req.method);
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const { guid, news_letter_sent_date } = req.body;
    console.log('📝 받은 데이터:', { guid, news_letter_sent_date });

    // GUID 유효성 검사
    if (!guid || typeof guid !== 'string') {
      console.log('❌ GUID가 없거나 잘못된 형식:', guid);
      return res.status(400).json({
        success: false,
        message: 'GUID는 필수 항목이며 문자열이어야 합니다.'
      });
    }

    // GUID 정제
    const trimmedGuid = guid.trim();
    if (!trimmedGuid) {
      console.log('❌ GUID가 빈 문자열입니다.');
      return res.status(400).json({
        success: false,
        message: 'GUID는 빈 문자열일 수 없습니다.'
      });
    }

    // GUID 유효성 검사는 생략 (URL과 Firestore ID 모두 허용)
    // Base64 인코딩을 통해 Firestore 호환 문서 ID 생성

    if (!news_letter_sent_date) {
      console.log('❌ 뉴스레터 발송일이 없음');
      return res.status(400).json({
        success: false,
        message: '뉴스레터 발송일은 필수 항목입니다.'
      });
    }

    console.log(`📅 뉴스레터 발송일 업데이트 요청: ${trimmedGuid} -> ${news_letter_sent_date}`);

    // 1. 인코딩된 GUID로 시도
    const encodedGuid = Buffer.from(trimmedGuid).toString('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
    console.log(`🔍 인코딩된 GUID: ${encodedGuid}`);
    
    let docRef = adminDb.collection('rss_items').doc(encodedGuid);
    let doc = await docRef.get();

    // 2. 원본 GUID로 시도 (수동 작성 글) - URL 형태가 아닌 경우에만
    if (!doc.exists && !trimmedGuid.includes('/')) {
      console.log(`- 인코딩된 GUID(${encodedGuid})로 문서를 찾지 못했습니다. 원본 GUID로 재시도합니다.`);
      docRef = adminDb.collection('rss_items').doc(trimmedGuid);
      doc = await docRef.get();
    } else if (!doc.exists) {
      console.log(`- 인코딩된 GUID(${encodedGuid})로 문서를 찾지 못했습니다. URL 형태 GUID는 직접 doc() 호출을 건너뜁니다.`);
    }

    // 3. guid 필드로 검색 (마지막 시도)
    if (!doc.exists) {
      console.log(`- 원본 GUID(${trimmedGuid})로도 문서를 찾지 못했습니다. guid 필드로 검색 시도...`);
      const snapshot = await adminDb.collection('rss_items')
        .where('guid', '==', trimmedGuid)
        .limit(1)
        .get();
      
      if (snapshot.empty) {
        console.log(`❌ guid 필드로도 문서를 찾을 수 없습니다: ${trimmedGuid}`);
        return res.status(404).json({
          success: false,
          message: '해당 RSS 아이템을 찾을 수 없습니다.'
        });
      }
      
      // guid 필드로 찾은 문서 사용
      const foundDoc = snapshot.docs[0];
      docRef = foundDoc.ref;
      console.log(`✅ guid 필드로 문서 발견: ${foundDoc.id}`);
    }

    // 문서 업데이트
    await docRef.update({
      news_letter_sent_date: news_letter_sent_date,
      updatedAt: new Date()
    });

    console.log(`✅ 뉴스레터 발송일 업데이트 완료: ${docRef.id} (guid: ${trimmedGuid}) -> ${news_letter_sent_date}`);

    return res.status(200).json({
      success: true,
      message: '뉴스레터 발송일이 업데이트되었습니다.',
      data: {
        guid: trimmedGuid,
        news_letter_sent_date
      }
    });

  } catch (error) {
    console.error('❌ 뉴스레터 발송일 업데이트 오류:', error);
    console.error('❌ 오류 스택:', error instanceof Error ? error.stack : error);
    return res.status(500).json({
      success: false,
      message: '뉴스레터 발송일 업데이트 중 오류가 발생했습니다.',
      error: error instanceof Error ? error.message : '알 수 없는 오류'
    });
  }
} 