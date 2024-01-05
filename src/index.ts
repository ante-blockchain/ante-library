import { storeHash, verifyHash, retrieveFile } from './hashStorage';
import { verifyHash as verifyHashFromBlockchain } from './hashVerification';
import { retrieveFile as retrieveFileFromStorage } from './fileRetrieval';

export class SolanaJsonStorage {
  constructor() {}

  async storeJsonData(jsonData: any, storageType: 's3' | 'google' | 'azure'): Promise<{transactionId: string, filePath: string}> {
    // Store hash of JSON data on Solana blockchain and raw JSON data in specified remote storage
    const { transactionId, filePath } = await storeHash(jsonData, storageType);
    return { transactionId, filePath };
  }

  async verifyHash(transactionId: string, filePath: string): Promise<boolean> {
    // Verify if the hash of the file equals the hash stored on Solana blockchain
    const isHashValid = await verifyHashFromBlockchain(transactionId, filePath);
    return isHashValid;
  }

  async retrieveFile(filePath: string, storageType: 's3' | 'google' | 'azure'): Promise<any> {
    // Retrieve the contents of a file from specified remote storage
    const fileContents = await retrieveFileFromStorage(filePath, storageType);
    return fileContents;
  }
}
