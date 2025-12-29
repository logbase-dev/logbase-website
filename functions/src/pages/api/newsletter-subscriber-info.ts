import { NextApiRequest, NextApiResponse } from 'next';
import { db } from '@/lib/firebase';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { generateUnsubscribeToken } from '@/lib/newsletter-utils';

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  console.log('🔍 API 호출됨:', req.method, req.url);
  
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
      console.log('🔍 GET 요청 처리 시작');
      const { email, token } = req.query;
      console.log('📧 받은 파라미터:', { email, token });

      if (!email || !token) {
        console.log('❌ 파라미터 누락');
        return res.status(400).json({
          success: false,
          error: '이메일과 토큰이 필요합니다.'
        });
      }

      // 토큰 검증
      console.log('🔐 토큰 검증 시작');
      const expectedToken = generateUnsubscribeToken(email as string);
      console.log('🔑 토큰 비교:', { received: token, expected: expectedToken });
      
      if (token !== expectedToken) {
        console.log('❌ 토큰 불일치');
        return res.status(401).json({
          success: false,
          error: '유효하지 않은 토큰입니다.'
        });
      }
      console.log('✅ 토큰 검증 성공');

      // Firestore에서 구독자 정보 조회
      const subscribersCollection = collection(db, 'newsletter');
      const q = query(subscribersCollection, where('email', '==', email));
      const querySnapshot = await getDocs(q);

      if (querySnapshot.empty) {
        return res.status(404).json({
          success: false,
          error: '구독자를 찾을 수 없습니다.'
        });
      }

      const subscriberDoc = querySnapshot.docs[0];
      const subscriberData = subscriberDoc.data();
      
      console.log('📊 원본 구독자 데이터:', subscriberData);

      // 민감한 정보 제거 및 Timestamp 변환
      const safeSubscriberData = {
        email: subscriberData.email,
        name: subscriberData.name,
        organization: subscriberData.company, // company 컬럼 사용
        status: subscriberData.status,
        createdAt: subscriberData.createdAt?.toDate?.() || subscriberData.createdAt,
        updatedAt: subscriberData.updatedAt?.toDate?.() || subscriberData.updatedAt
      };
      
      console.log('📊 안전한 구독자 데이터:', safeSubscriberData);

      res.status(200).json({
        success: true,
        data: safeSubscriberData
      });

    } catch (error) {
      console.error('구독자 정보 조회 에러:', error);
      res.status(500).json({
        success: false,
        error: '구독자 정보를 조회할 수 없습니다.'
      });
    }
  } else {
    res.setHeader('Allow', ['GET']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
};

export default handler; 