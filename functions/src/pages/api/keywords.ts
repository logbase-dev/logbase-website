// src/pages/api/keywords.ts

import type { NextApiRequest, NextApiResponse } from 'next';
import fs from 'fs/promises';
import path from 'path';
import { readJsonFromStorage, writeJsonToStorage } from '@/lib/storage';

// 환경 변수를 통해 프로덕션(배포) 환경인지 확인
const isProduction = process.env.NODE_ENV === 'production';

// 파일 경로 정의
const localFilePath = path.join(process.cwd(), 'public', 'keywords.json');
const storageFilePath = 'keywords/keywords.json';

// --- 데이터 소스 추상화 함수 ---

/**
 * 환경에 따라 키워드 목록을 읽어옵니다.
 */
async function readKeywords(): Promise<string[]> {
  if (isProduction) {
    console.log('[API/keywords] Production: Reading from Firebase Storage.');
    return readJsonFromStorage<string[]>(storageFilePath);
  } else {
    console.log('[API/keywords] Development: Reading from local filesystem.');
    const fileData = await fs.readFile(localFilePath, 'utf-8');
    return JSON.parse(fileData);
  }
}

/**
 * 환경에 따라 키워드 목록을 저장합니다.
 */
async function writeKeywords(data: string[]): Promise<void> {
  if (isProduction) {
    console.log('[API/keywords] Production: Writing to Firebase Storage.');
    await writeJsonToStorage(storageFilePath, data);
  } else {
    console.log('[API/keywords] Development: Writing to local filesystem.');
    const jsonString = JSON.stringify(data, null, 2);
    await fs.writeFile(localFilePath, jsonString, 'utf-8');
  }
}

// --- API 핸들러 ---

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // CORS 헤더 설정
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    switch (req.method) {
      case 'GET': {
        const keywords = await readKeywords();
        return res.status(200).json({ success: true, keywords });
      }

      case 'POST': {
        const { keyword } = req.body;
        if (!keyword) {
          return res.status(400).json({ success: false, error: '키워드는 필수입니다.' });
        }
        const keywords = await readKeywords();
        if (keywords.includes(keyword)) {
          return res.status(400).json({ success: false, error: '이미 존재하는 키워드입니다.' });
        }
        const newKeywords = [...keywords, keyword];
        await writeKeywords(newKeywords);
        return res.status(200).json({ success: true, message: '키워드가 추가되었습니다.', keywords: newKeywords });
      }

      case 'PUT': {
        const { oldKeyword, newKeyword } = req.body;
        if (!oldKeyword || !newKeyword) {
          return res.status(400).json({ success: false, error: '이전 키워드와 새 키워드 모두 필요합니다.' });
        }
        let keywords = await readKeywords();
        const index = keywords.indexOf(oldKeyword);
        if (index === -1) {
          return res.status(404).json({ success: false, error: '수정할 키워드를 찾을 수 없습니다.' });
        }
        keywords[index] = newKeyword;
        await writeKeywords(keywords);
        return res.status(200).json({ success: true, message: '키워드가 수정되었습니다.', keywords });
      }

      case 'DELETE': {
        const { keyword } = req.body;
        if (!keyword) {
          return res.status(400).json({ success: false, error: '삭제할 키워드가 필요합니다.' });
        }
        let keywords = await readKeywords();
        const newKeywords = keywords.filter(k => k !== keyword);
        if (keywords.length === newKeywords.length) {
          return res.status(404).json({ success: false, error: '삭제할 키워드를 찾을 수 없습니다.' });
        }
        await writeKeywords(newKeywords);
        return res.status(200).json({ success: true, message: '키워드가 삭제되었습니다.', keywords: newKeywords });
      }

      default:
        res.setHeader('Allow', ['GET', 'POST', 'PUT', 'DELETE']);
        return res.status(405).end(`Method ${req.method} Not Allowed`);
    }
  } catch (error: any) {
    console.error(`[API/keywords] Error on ${req.method}:`, error);
    return res.status(500).json({ success: false, error: error.message || '서버 오류가 발생했습니다.' });
  }
}
