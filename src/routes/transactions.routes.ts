import e, { Router } from 'express';

import TransactionsRepository from '../repositories/TransactionsRepository';
import CreateTransactionService from '../services/CreateTransactionService';
import { getCustomRepository } from 'typeorm';
import DeleteTransactionService from '../services/DeleteTransactionService';
// import ImportTransactionsService from '../services/ImportTransactionsService';

const transactionsRouter = Router();

transactionsRouter.get('/', async (request, response) => {
  const transactionsRepo = getCustomRepository(TransactionsRepository);

  const transactions = await transactionsRepo.find();

  const balanceOfTransactions = await transactionsRepo.getBalance();

  return response.json({ transactions, balance: balanceOfTransactions });
});

transactionsRouter.post('/', async (request, response) => {
  const { title, value, type, category } = request.body;

  const transactionCreated = await new CreateTransactionService().execute({
    title,
    value,
    type,
    category_title: category,
  });

  return response.json(transactionCreated);
});

transactionsRouter.delete('/:id', async (request, response) => {
  const { id } = request.params;

  await new DeleteTransactionService().execute(id);

  return response.status(204).send();
});

transactionsRouter.post('/import', async (request, response) => {
  // TODO
});

export default transactionsRouter;
