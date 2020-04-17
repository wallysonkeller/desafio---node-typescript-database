import { getCustomRepository, getRepository } from 'typeorm';

import AppError from '../errors/AppError';
import Transaction from '../models/Transaction';
import Category from '../models/Category';

import TransactionRepository from '../repositories/TransactionsRepository';

interface Request {
  title: string;
  value: number;
  type: 'income' | 'outcome';
  categoryTitle: string;
}

class CreateTransactionService {
  public async execute({
    title,
    value,
    type,
    categoryTitle,
  }: Request): Promise<Transaction> {
    const transactionRepository = getCustomRepository(TransactionRepository);

    const balance = await transactionRepository.getBalance();
    if (type === 'outcome' && value > balance.total) {
      throw new AppError('Insufficient funds. Operation not performed.');
    }

    const categoryRepositoty = getRepository(Category);
    let category = await categoryRepositoty.findOne({
      where: { title: categoryTitle },
    });

    if (!category) {
      category = await categoryRepositoty.save({
        title: categoryTitle,
      });
    }

    const transaction = transactionRepository.create({
      title,
      value,
      type,
      category_id: category.id,
    });

    await transactionRepository.save(transaction);

    return transaction;
  }
}

export default CreateTransactionService;
