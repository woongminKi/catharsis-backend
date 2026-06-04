import { S3Client } from '@aws-sdk/client-s3';

// S3_ENDPOINT 설정 시 Cloudflare R2 / 호환 스토리지로 동작, 미설정 시 AWS S3
const S3_ENDPOINT = process.env.S3_ENDPOINT;

export const s3Client = new S3Client({
  region: process.env.AWS_REGION || 'ap-northeast-2',
  ...(S3_ENDPOINT
    ? { endpoint: S3_ENDPOINT, forcePathStyle: true }
    : {}),
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || '',
  },
});

export const S3_BUCKET = process.env.AWS_S3_BUCKET || 'catharsis-image';
export const S3_REGION = process.env.AWS_REGION || 'ap-northeast-2';

// 업로드된 이미지의 공개 URL 생성.
// R2(S3_PUBLIC_URL 설정) → custom domain or r2.dev 사용.
// 미설정 시 AWS S3 가상호스팅 URL.
export const getS3Url = (key: string): string => {
  const publicBase = process.env.S3_PUBLIC_URL;
  if (publicBase) {
    return `${publicBase.replace(/\/$/, '')}/${key}`;
  }
  return `https://${S3_BUCKET}.s3.${S3_REGION}.amazonaws.com/${key}`;
};
