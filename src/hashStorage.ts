import { Connection, PublicKey, TransactionInstruction } from '@solana/web3.js';
import crypto from 'crypto';
import AWS from 'aws-sdk';
import { Storage, Bucket } from '@google-cloud/storage';
import { BlobServiceClient } from '@azure/storage-blob';

const SOLANA_NETWORK = 'https://api.mainnet-beta.solana.com';

export async function storeHash(jsonData: any, storageType: 's3' | 'google' | 'azure'): Promise<{transactionId: string, filePath: string}> {
  const hash = crypto.createHash('sha256').update(JSON.stringify(jsonData)).digest('hex');
  const connection = new Connection(SOLANA_NETWORK);
  const transaction = new TransactionInstruction({
    keys: [],
    programId: new PublicKey('11111111111111111111111111111111'),
    data: Buffer.from(hash),
  });

  const transactionId = await connection.sendTransaction(transaction);

  let filePath: string;
  switch (storageType) {
    case 's3':
      const s3 = new AWS.S3();
      filePath = `s3://${process.env.AWS_BUCKET_NAME}/${transactionId}`;
      await s3.putObject({
        Bucket: process.env.AWS_BUCKET_NAME,
        Key: transactionId,
        Body: JSON.stringify(jsonData),
      }).promise();
      break;
    case 'google':
      const storage = new Storage();
      const bucket: Bucket = storage.bucket(process.env.GCLOUD_STORAGE_BUCKET);
      filePath = `gs://${process.env.GCLOUD_STORAGE_BUCKET}/${transactionId}`;
      const file = bucket.file(transactionId);
      await file.save(JSON.stringify(jsonData));
      break;
    case 'azure':
      const blobServiceClient = BlobServiceClient.fromConnectionString(process.env.AZURE_STORAGE_CONNECTION_STRING);
      const containerClient = blobServiceClient.getContainerClient(process.env.AZURE_STORAGE_CONTAINER_NAME);
      filePath = `https://${process.env.AZURE_STORAGE_ACCOUNT_NAME}.blob.core.windows.net/${process.env.AZURE_STORAGE_CONTAINER_NAME}/${transactionId}`;
      const blockBlobClient = containerClient.getBlockBlobClient(transactionId);
      await blockBlobClient.upload(JSON.stringify(jsonData), Buffer.byteLength(JSON.stringify(jsonData)));
      break;
  }

  return { transactionId, filePath };
}
