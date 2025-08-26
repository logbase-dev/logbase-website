import { NextApiRequest, NextApiResponse } from 'next';
import { db } from '@/lib/firebase';
import { collection, getDocs, query, where, updateDoc } from 'firebase/firestore';

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
      const rssCollection = collection(db, 'rss_items');
      const querySnapshot = await getDocs(rssCollection);
      
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
      
      if (!guid || !Array.isArray(matchedKeywords)) {
        console.error('❌ 잘못된 파라미터:', { guid, matchedKeywords });
        return res.status(400).json({ success: false, error: 'Invalid parameters' });
      }

      console.log('🔧 Keywords API 호출:', { guid, matchedKeywords });

      // 타임아웃 설정 (25초)
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Database operation timeout')), 25000);
      });

      const rssCollection = collection(db, 'rss_items');
      const q = query(rssCollection, where('guid', '==', guid));
      
      // 쿼리 실행을 타임아웃과 함께
      const querySnapshot = await Promise.race([
        getDocs(q),
        timeoutPromise
      ]) as any;
      
      if (querySnapshot.empty) {
        console.log('❌ RSS 아이템을 찾을 수 없음:', guid);
        return res.status(404).json({ success: false, error: 'RSS item not found' });
      }

      const doc = querySnapshot.docs[0];
      
      // 업데이트 실행을 타임아웃과 함께
      await Promise.race([
        updateDoc(doc.ref, {
          matchedKeywords: matchedKeywords,
          updatedAt: new Date()
        }),
        timeoutPromise
      ]);

      console.log('✅ 키워드 업데이트 성공:', { guid, matchedKeywords });
      res.status(200).json({ success: true, message: 'Keywords updated successfully' });

    } catch (error: any) {
      console.error('❌ Keywords API 에러:', error);
      if (error.message === 'Database operation timeout') {
        res.status(408).json({ success: false, error: 'Database operation timeout' });
      } else {
        res.status(500).json({ success: false, error: 'Internal server error: ' + error.message });
      }
    }
  } else {
    res.setHeader('Allow', ['GET', 'POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
} 