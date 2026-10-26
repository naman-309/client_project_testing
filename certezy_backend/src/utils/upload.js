// src/utils/upload.js

import { S3Client, PutObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'
import env from '../config/env.js'

// ─── S3 CLIENT SETUP ─────────────────────────────────────────────────────
const getS3Client = () => {
  return new S3Client({
    region: env.s3.region || 'ap-south-1',
    credentials: {
      accessKeyId: env.s3.accessKey,
      secretAccessKey: env.s3.secretKey,
    },
  })
}

// ── Upload file to S3 ───────────────────────────────────────────────
const uploadFile = async ({ buffer, key, mimeType, isPublic = true }) => {
  if (!env.s3.bucket) {
    throw new Error('AWS S3 is not configured. Please define AWS_BUCKET_NAME, AWS_ACCESS_KEY_ID, and AWS_SECRET_ACCESS_KEY in backend .env')
  }

  const command = new PutObjectCommand({
    Bucket: env.s3.bucket,
    Key: key,
    Body: buffer,
    ContentType: mimeType,
  })

  const s3 = getS3Client()
  await s3.send(command)

  // AWS S3 public URL format
  const url = `https://${env.s3.bucket}.s3.${env.s3.region}.amazonaws.com/${key}`

  return url
}

const deleteFile = async (key) => {
  const s3 = getS3Client()
  const command = new DeleteObjectCommand({
    Bucket: env.s3.bucket,
    Key: key,
  })

  await s3.send(command)
}

// ── Generate Pre-Signed URL for Frontend Upload ────────────────────────────
const generatePresignedUrl = async ({ key, mimeType, isPublic = true, expiresIn = 300 }) => {
  if (!env.s3.bucket) {
    throw new Error('AWS S3 is not configured. Please define AWS_BUCKET_NAME, AWS_ACCESS_KEY_ID, and AWS_SECRET_ACCESS_KEY in backend .env')
  }

  const s3 = getS3Client()
  const command = new PutObjectCommand({
    Bucket: env.s3.bucket,
    Key: key,
    ContentType: mimeType,
  })

  // Generate URL that expires in 5 minutes
  const signedUrl = await getSignedUrl(s3, command, { expiresIn })

  // Public AWS S3 URL where file will be accessible after upload
  const fileUrl = `https://${env.s3.bucket}.s3.${env.s3.region}.amazonaws.com/${key}`

  return { signedUrl, fileUrl }
}

export { uploadFile, deleteFile, generatePresignedUrl }
