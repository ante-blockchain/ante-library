import { Connection, PublicKey } from '@solana/web3.js';
import crypto from 'crypto';
import AWS from 'aws-sdk';
import { Storage } from '@google-cloud/storage';
import { BlobServiceClient } from '@azure/storage-blob';

const SOLANA_NETWORK = 'https://api.mainnet-beta.solana.com';

export async function verifyHash(transactionId: string, filePath: string): Promise<boolean> {
  const connection = new Connection(SOLANA_NETWORK);
  const transactionInfo = await connection.getTransaction(transactionId);
  if (!transactionInfo) {
    throw new Error('Transaction not found');
  }

  const storedHash = transactionInfo.transaction.message.instructions[0].data.toString();

  let fileData: string;
  if (filePath.startsWith('s3://')) {
    const s3 = new AWS.S3();
    const params = {
      Bucket: filePath.split('/')[2],
      Key: filePath.split('/').slice(3).join('/'),
    };
    const data = await s3.getObject(params).promise();
    fileData = data.Body.toString();
  } else if (filePath.startsWith('gs://')) {
    const storage = new Storage();
    const bucket = storage.bucket(filePath.split('/')[2]);
    const file = bucket.file(filePath.split('/').slice(3).join('/'));
    const data = await file.download();
    fileData = data.toString();
  } else if (filePath.startsWith('https://')) {
    const blobServiceClient = BlobServiceClient.fromConnectionString(process.env.AZURE_STORAGE_CONNECTION_STRING);
    const blobClient = blobServiceClient.getBlobClient(filePath);
    const downloadBlockBlobResponse = await blobClient.download(0);
    fileData = (await streamToBuffer(downloadBlockBlobResponse.readableStreamBody)).toString();
  } else {
    throw new Error('Unsupported file path');
  }

  const fileHash = crypto.createHash('sha256').update(fileData).digest('hex');

  return storedHash === fileHash;
}

async function streamToBuffer(readableStream) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    readableStream.on('data', (data) => {
      chunks.push(data instanceof Buffer ? data : Buffer.from(data));
    });
    readableStream.on('end', () => {
      resolve(Buffer.concat(chunks));
    });
    readableStream.on('error', reject);
  });
}
