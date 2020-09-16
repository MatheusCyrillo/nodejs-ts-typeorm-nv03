import { EntityNotFoundError } from 'typeorm/error/EntityNotFoundError';
import { getCustomRepository } from 'typeorm';

import AppError from '../errors/AppError';

import TransactionsRepository from '../repositories/TransactionsRepository';


class DeleteTransactionService {
  public async execute(id: string): Promise<void> {
    try {
      const transactionsRepo = getCustomRepository(TransactionsRepository);

      const transaction = await transactionsRepo.findOneOrFail(id);

      await transactionsRepo.remove(transaction);
    } catch (e) {
      if (e instanceof EntityNotFoundError) {
        throw new AppError(
          `The Transaction ${id} could not be deleted because it does not exist`,
        );
      } else throw new AppError(e.message, 500);
    }
  }
}

export default DeleteTransactionService;
