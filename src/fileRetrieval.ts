import AWS from 'aws-sdk';
import { Storage } from '@google-cloud/storage';
import { BlobServiceClient } from '@azure/storage-blob';

export async function retrieveFileFromStorage(filePath: string, storageType: 's3' | 'google' | 'azure'): Promise<any> {
  let fileContents: any;
  switch (storageType) {
    case 's3':
      const s3 = new AWS.S3();
      const s3Params = {
        Bucket: filePath.split('/')[2],
        Key: filePath.split('/').slice(3).join('/'),
      };
      fileContents = await s3.getObject(s3Params).promise();
      break;
    case 'google':
      const storage = new Storage();
      const bucketName = filePath.split('/')[2];
      const fileName = filePath.split('/').slice(3).join('/');
      const file = storage.bucket(bucketName).file(fileName);
      fileContents = await file.download();
      break;
    case 'azure':
      const blobServiceClient = BlobServiceClient.fromConnectionString(process.env.AZURE_STORAGE_CONNECTION_STRING);
      const blobName = filePath.split('/').pop() || '';
      const containerName = filePath.split('/')[3];
      const blockBlobClient = blobServiceClient.getContainerClient(containerName).getBlockBlobClient(blobName);
      fileContents = await blockBlobClient.downloadToBuffer();
      break;
  }
  return fileContents;
}
