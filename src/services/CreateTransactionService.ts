// import AppError from '../errors/AppError';

import Transaction from '../models/Transaction';
import { getRepository } from 'typeorm';
import Category from '../models/Category';

interface Request {
  title: string;
  value: number;
  type: 'income' | 'outcome';
  category_title: string;
}

class CreateTransactionService {

  public async execute({
    title,
    category_title,
    type,
    value,
  }: Request): Promise<Transaction> {
    const categoryRepository = getRepository(Category);

    let category = await categoryRepository.findOne({
      title: category_title,
    });

    if (!category) {
      category = categoryRepository.create({
        title: category_title,
      });

      await categoryRepository.save(category);
    }

    const transactionRepository = getRepository(Transaction);
    const transaction = transactionRepository.create({
      title,
      type,
      value,
      category_id: category.id,
    });

    return await transactionRepository.save(transaction);
  }
}

export default CreateTransactionService;
