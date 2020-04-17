import csv from 'csvtojson';
import path from 'path';

import uploadConfig from '../config/upload';
import Transaction from '../models/Transaction';

import CreateTransactionsService from './CreateTransactionService';

interface TransactionDTO {
  title: string;
  type: 'income' | 'outcome';
  value: number;
  category: string;
}

class ImportTransactionsService {
  async execute(filename: string): Promise<Transaction[]> {
    const filePath = path.join(uploadConfig.directory, filename);
    const transactionsToImport = (await csv().fromFile(
      filePath,
    )) as TransactionDTO[];

    const createTransaction = new CreateTransactionsService();

    const importedTransactions = [] as Transaction[];
    for (const trs of transactionsToImport) {
      const { title, type, value, category } = trs;

      const transaction = await createTransaction.execute({
        title,
        type,
        value,
        categoryTitle: category,
      });
      importedTransactions.push(transaction);
    }

    return importedTransactions;
  }
}

export default ImportTransactionsService;
