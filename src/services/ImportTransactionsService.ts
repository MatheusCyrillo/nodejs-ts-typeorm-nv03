import csvParser from 'csv-parser';
import fs from 'fs';

import Transaction from '../models/Transaction';

import TransactionsRepository from '../repositories/TransactionsRepository';
import { getCustomRepository } from 'typeorm';
import { resolveConfig } from 'prettier';

class ImportTransactionsService {
  async execute(filePath: string): Promise<Transaction[]> {
    let transactions: Transaction[] = [];

    const transactionRepo = getCustomRepository(TransactionsRepository);

    return new Promise((resolve) => {
      fs.createReadStream(filePath)
        .pipe(csvParser())
        .on('data', async (transaction: Transaction) =>
          transactions.push(transaction),
        )
        .on('end', async () => {
          transactions = transactionRepo.create(transactions);
          resolve(await transactionRepo.save(transactions));
        });
    });
  }
}

export default ImportTransactionsService;
