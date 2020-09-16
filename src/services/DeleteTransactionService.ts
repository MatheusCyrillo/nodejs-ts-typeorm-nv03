import AppError from '../errors/AppError';
import { EntityNotFoundError } from 'typeorm/error/EntityNotFoundError';
import TransactionsRepository from '../repositories/TransactionsRepository';
import { getCustomRepository } from 'typeorm';

class DeleteTransactionService {
  public async execute(id: string): Promise<void> {
    try{
    const transactionsRepo = getCustomRepository(TransactionsRepository);

    const transaction = await transactionsRepo.findOneOrFail(id);

    await transactionsRepo.remove(transaction);
    }
    catch(e){
      if(e instanceof EntityNotFoundError){
        throw new AppError(`The Transaction ${id} could not be deleted because it does not exist`);
      }
    }
  }
}

export default DeleteTransactionService;
