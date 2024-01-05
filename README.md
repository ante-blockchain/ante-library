# Ante Library

A Node.js / TypeScript library for storing JSON data blobs on Solana blockchain and remote file storage services.

## Description

This library provides functions to:

1. Store a hash of a JSON data blob on the Solana blockchain and the raw JSON data blob in a remote file storage facility such as Amazon S3, Google Cloud Storage, or Azure Blob Storage.
2. Verify if the hash of a file in remote storage equals the hash that is stored on the Solana blockchain.
3. Retrieve the contents of a file from remote storage.

## Installation

```bash
npm install --save solana-json-storage
```

## Usage

```typescript
import { SolanaJsonStorage } from 'solana-json-storage';

const solanaJsonStorage = new SolanaJsonStorage();

// Store JSON data
const jsonData = { key: 'value' };
const storageType = 's3'; // or 'google' or 'azure'
const { transactionId, filePath } = await solanaJsonStorage.storeJsonData(jsonData, storageType);

// Verify hash
const isHashValid = await solanaJsonStorage.verifyHash(transactionId, filePath);

// Retrieve file
const fileContents = await solanaJsonStorage.retrieveFile(filePath, storageType);
```

## Environment Variables

The library requires the following environment variables:

- `AWS_BUCKET_NAME` for Amazon S3
- `GCLOUD_STORAGE_BUCKET` for Google Cloud Storage
- `AZURE_STORAGE_CONNECTION_STRING`, `AZURE_STORAGE_ACCOUNT_NAME`, `AZURE_STORAGE_CONTAINER_NAME` for Azure Blob Storage

## Contributing

Pull requests are welcome. For major changes, please open an issue first to discuss what you would like to change.

## License

[ISC](https://choosealicense.com/licenses/isc/)
