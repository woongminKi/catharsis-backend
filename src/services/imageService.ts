import {
  PutObjectCommand,
  ListObjectsV2Command,
  DeleteObjectCommand,
} from '@aws-sdk/client-s3';
import { randomBytes } from 'crypto';
import path from 'path';
import { s3Client, S3_BUCKET, getS3Url } from '../config/s3';

export interface ImageInfo {
  key: string;
  url: string;
  size?: number;
  lastModified?: Date;
}

const MIME_EXTENSIONS: Record<string, string> = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/gif': 'gif',
  'image/webp': 'webp',
};

// 원본 파일명은 공백·한글(깨짐) 때문에 URL을 망가뜨리므로 키에 쓰지 않고 확장자만 남긴다.
const getExtension = (file: Express.Multer.File): string => {
  const fromMime = MIME_EXTENSIONS[file.mimetype];
  if (fromMime) return fromMime;
  const fromName = path.extname(file.originalname).slice(1).toLowerCase();
  return /^[a-z0-9]+$/.test(fromName) ? fromName : 'bin';
};

export const uploadImage = async (
  file: Express.Multer.File,
  folder: string = 'images'
): Promise<ImageInfo> => {
  const key = `${folder}/${Date.now()}-${randomBytes(4).toString('hex')}.${getExtension(file)}`;

  const command = new PutObjectCommand({
    Bucket: S3_BUCKET,
    Key: key,
    Body: file.buffer,
    ContentType: file.mimetype,
  });

  await s3Client.send(command);

  return {
    key,
    url: getS3Url(key),
  };
};

export const listImages = async (
  folder: string = 'images',
  maxKeys: number = 100
): Promise<ImageInfo[]> => {
  const command = new ListObjectsV2Command({
    Bucket: S3_BUCKET,
    Prefix: folder,
    MaxKeys: maxKeys,
  });

  const response = await s3Client.send(command);

  if (!response.Contents) {
    return [];
  }

  return response.Contents
    .filter((item) => item.Key && !item.Key.endsWith('/'))
    .map((item) => ({
      key: item.Key!,
      url: getS3Url(item.Key!),
      size: item.Size,
      lastModified: item.LastModified,
    }));
};

export const deleteImage = async (key: string): Promise<void> => {
  const command = new DeleteObjectCommand({
    Bucket: S3_BUCKET,
    Key: key,
  });

  await s3Client.send(command);
};
