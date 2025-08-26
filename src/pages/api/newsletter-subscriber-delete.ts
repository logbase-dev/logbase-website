import { NextApiRequest, NextApiResponse } from 'next';
import { collection, query, where, getDocs, updateDoc, doc, getDoc, deleteDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { generateUnsubscribeToken } from '@/lib/newsletter-utils';

// 관리자 페이지에서 ID로 구독자 삭제 처리
async function handleAdminDelete(id: string) {
  const subscriberDoc = doc(db, 'newsletter', id);
  const docSnap = await getDoc(subscriberDoc);
  
  if (!docSnap.exists()) {
    throw new Error('구독자를 찾을 수 없습니다.');
  }
  
  // 실제로 데이터베이스에서 삭제
  await deleteDoc(subscriberDoc);

  console.log(`✅ 관리자: 구독자 ${id} 완전 삭제 완료`);
  return { success: true, message: '구독자가 완전히 삭제되었습니다.' };
}

// 뉴스레터 구독취소 처리 (이메일+토큰 기반)
async function handleUnsubscribe(email: string, token: string) {
  // 토큰 검증
  const expectedToken = generateUnsubscribeToken(email);
  
  if (token !== expectedToken) {
    throw new Error('유효하지 않은 토큰입니다.');
  }

  // 이메일로 구독자 검색
  const subscribersCollection = collection(db, 'newsletter');
  const q = query(subscribersCollection, where('email', '==', email));
  const querySnapshot = await getDocs(q);

  if (querySnapshot.empty) {
    throw new Error('구독자를 찾을 수 없습니다.');
  }

  const subscriberDoc = querySnapshot.docs[0];
  await updateDoc(subscriberDoc.ref, {
    status: 'inactive',
    updatedAt: new Date()
  });

  console.log(`✅ 구독취소: ${email} 구독 취소 완료`);
  return { success: true, message: '뉴스레터 구독이 취소되었습니다.' };
}

/**
 * 뉴스레터 구독 취소 API 엔드포인트
 * 
 * 이 API는 이메일과 토큰을 받아서 뉴스레터 구독을 취소합니다.
 * 실제로 데이터를 삭제하지 않고 status를 'inactive'로 변경합니다.
 * 
 * @param req - Next.js API 요청 객체 (email, token 포함)
 * @param res - Next.js API 응답 객체
 * @returns JSON 응답 (성공/실패 상태와 메시지)
 */
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // CORS 헤더 설정 - 클라이언트에서 API 호출 가능하도록
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  // OPTIONS 요청 처리 (CORS preflight 요청)
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  // POST 또는 DELETE 요청 처리
  if (req.method === 'POST' || req.method === 'DELETE') {
    try {
      // 요청 본문에서 파라미터 추출 (id 또는 email+token)
      const { id, email, token } = req.body;

            // 관리자 삭제 (ID 기반) 또는 구독취소 (이메일+토큰 기반) 구분
      let result;
      if (id) {
        // 관리자 페이지에서 ID로 삭제
        result = await handleAdminDelete(id);
      } else if (email && token) {
        // 뉴스레터 구독취소 (이메일+토큰 기반)
        result = await handleUnsubscribe(email, token);
      } else {
        return res.status(400).json({
          success: false,
          error: '구독자 ID 또는 이메일과 토큰이 필요합니다.'
        });
      }

      // 성공 응답 반환
      return res.status(200).json(result);

    } catch (error) {
      // 오류 발생 시 로그 출력 및 에러 응답
      console.error('❌ 구독 취소 오류:', error);
      return res.status(500).json({
        success: false,
        error: '구독 취소 중 오류가 발생했습니다.'
      });
    }
  } else {
    // POST 또는 DELETE가 아닌 다른 HTTP 메서드 요청 시 405 Method Not Allowed
    res.setHeader('Allow', ['POST', 'DELETE']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
} 