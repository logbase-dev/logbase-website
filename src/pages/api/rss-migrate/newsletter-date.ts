import { NextApiRequest, NextApiResponse } from 'next';
import { collection, query, where, getDocs, updateDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  console.log('📅 Newsletter Date API 호출됨:', { method: req.method, body: req.body });
  
  if (req.method !== 'POST') {
    console.log('❌ Method not allowed:', req.method);
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const { guid, news_letter_sent_date } = req.body;
    console.log('📝 받은 데이터:', { guid, news_letter_sent_date });

    if (!guid) {
      console.log('❌ GUID가 없음');
      return res.status(400).json({
        success: false,
        message: 'GUID는 필수 항목입니다.'
      });
    }

    if (!news_letter_sent_date) {
      console.log('❌ 뉴스레터 발송일이 없음');
      return res.status(400).json({
        success: false,
        message: '뉴스레터 발송일은 필수 항목입니다.'
      });
    }

    console.log(`📅 뉴스레터 발송일 업데이트 요청: ${guid} -> ${news_letter_sent_date}`);

    // GUID로 문서를 찾아서 업데이트
    const rssCollection = collection(db, 'rss_items');
    const q = query(rssCollection, where('guid', '==', guid));
    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
      return res.status(404).json({
        success: false,
        message: '해당 RSS 아이템을 찾을 수 없습니다.'
      });
    }

    // 문서 업데이트
    for (const docSnapshot of querySnapshot.docs) {
      await updateDoc(docSnapshot.ref, {
        news_letter_sent_date: news_letter_sent_date,
        updated_at: new Date().toISOString()
      });
    }

    console.log(`✅ 뉴스레터 발송일 업데이트 완료: ${guid} -> ${news_letter_sent_date}`);

    return res.status(200).json({
      success: true,
      message: '뉴스레터 발송일이 업데이트되었습니다.',
      data: {
        guid,
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