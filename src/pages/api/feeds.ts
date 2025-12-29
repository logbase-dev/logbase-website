// src/pages/api/feeds.ts

import type { NextApiRequest, NextApiResponse } from 'next';
import fs from 'fs/promises';
import path from 'path';
import { readJsonFromStorage, writeJsonToStorage } from '@/lib/storage';

// 환경 변수를 통해 프로덕션(배포) 환경인지 확인
const isProduction = process.env.NODE_ENV === 'production';

// 파일 경로 정의
const localFilePath = path.join(process.cwd(), 'public', 'feeds.json');
const storageFilePath = 'feeds/feeds.json';

// --- 데이터 소스 추상화 함수 ---

/**
 * 환경에 따라 피드 목록을 읽어옵니다.
 */
async function readFeeds(): Promise<any[]> {
  if (isProduction) {
    console.log('[API/feeds] Production: Reading from Firebase Storage.');
    return readJsonFromStorage<any[]>(storageFilePath);
  } else {
    console.log('[API/feeds] Development: Reading from local filesystem.');
    const fileData = await fs.readFile(localFilePath, 'utf-8');
    return JSON.parse(fileData);
  }
}

/**
 * 환경에 따라 피드 목록을 저장합니다.
 */
async function writeFeeds(data: any[]): Promise<void> {
  if (isProduction) {
    console.log('[API/feeds] Production: Writing to Firebase Storage.');
    await writeJsonToStorage(storageFilePath, data);
  } else {
    console.log('[API/feeds] Development: Writing to local filesystem.');
    const jsonString = JSON.stringify(data, null, 2);
    await fs.writeFile(localFilePath, jsonString, 'utf-8');
  }
}

// --- API 핸들러 ---

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // CORS 헤더 설정 (기존 로직과 동일하게 유지)
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    switch (req.method) {
      case 'GET': {
        const feeds = await readFeeds();
        return res.status(200).json({ success: true, feeds });
      }

      case 'POST': {
        const { name, url, type, status } = req.body;
        if (!name || !url) {
          return res.status(400).json({ success: false, error: '피드 이름과 URL은 필수입니다.' });
        }
        const feeds = await readFeeds();
        if (feeds.some(feed => feed.name === name)) {
          return res.status(400).json({ success: false, error: '이미 존재하는 피드 이름입니다.' });
        }
        const newFeeds = [...feeds, { name, url, type, status }];
        await writeFeeds(newFeeds);
        return res.status(200).json({ success: true, message: 'RSS 피드가 추가되었습니다.', feeds: newFeeds });
      }

      case 'PUT': {
        const { oldName, name, url, type, status } = req.body;
        if (!oldName || !name || !url) {
          return res.status(400).json({ success: false, error: '모든 필드를 입력해주세요.' });
        }
        let feeds = await readFeeds();
        const feedIndex = feeds.findIndex(feed => feed.name === oldName);
        if (feedIndex === -1) {
          return res.status(404).json({ success: false, error: '수정할 피드를 찾을 수 없습니다.' });
        }
        feeds[feedIndex] = { name, url, type, status };
        await writeFeeds(feeds);
        return res.status(200).json({ success: true, message: 'RSS 피드가 수정되었습니다.', feeds });
      }

      case 'DELETE': {
        const { name } = req.body;
        if (!name) {
          return res.status(400).json({ success: false, error: '삭제할 피드 이름이 필요합니다.' });
        }
        let feeds = await readFeeds();
        const newFeeds = feeds.filter(feed => feed.name !== name);
        if (feeds.length === newFeeds.length) {
          return res.status(404).json({ success: false, error: '삭제할 피드를 찾을 수 없습니다.' });
        }
        await writeFeeds(newFeeds);
        return res.status(200).json({ success: true, message: 'RSS 피드가 삭제되었습니다.', feeds: newFeeds });
      }

      default:
        res.setHeader('Allow', ['GET', 'POST', 'PUT', 'DELETE']);
        return res.status(405).end(`Method ${req.method} Not Allowed`);
    }
  } catch (error: any) {
    console.error(`[API/feeds] Error on ${req.method}:`, error);
    return res.status(500).json({ success: false, error: error.message || '서버 오류가 발생했습니다.' });
  }
}
