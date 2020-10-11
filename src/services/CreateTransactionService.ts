// import AppError from '../errors/AppError';

import Transaction from '../models/Transaction';
import { getCustomRepository, getRepository } from 'typeorm';
import Category from '../models/Category';
import TransactionsRepository from '../repositories/TransactionsRepository';
import AppError from '../errors/AppError';

interface RequestTransaction {
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
  }: RequestTransaction): Promise<Transaction> {

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

    const transactionsRepo = getCustomRepository(TransactionsRepository);

    const { total } = await transactionsRepo.getBalance();

    if(type == "outcome" && value > total){
     throw new AppError('You dont have enough balance!',);
    }

    const transaction = transactionsRepo.create({
      title,
      type,
      value,
      category_id: category.id,
    });

    return await transactionsRepo.save(transaction);
  }
}

export default CreateTransactionService;
