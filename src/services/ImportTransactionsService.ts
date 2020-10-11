import csvParser from 'csv-parser';
import fs from 'fs';

import Transaction from '../models/Transaction';

import TransactionsRepository from '../repositories/TransactionsRepository';
import { getCustomRepository, getRepository, In } from 'typeorm';
import { resolveConfig } from 'prettier';
import Category from '../models/Category';

interface CSVTransaction {
  title: string;
  value: number;
  type: 'income' | 'outcome';
  category: string;
}

class ImportTransactionsService {
  async execute(filePath: string): Promise<Transaction[]> {
    let transactions: CSVTransaction[] = [];
    let categories: string[] = [];

    const transactionRepo = getCustomRepository(TransactionsRepository);
    const categoriesRepository = getRepository(Category);

    const parseCSV = fs
      .createReadStream(filePath)
      .pipe(
        csvParser({
          mapHeaders: ({ header, index }) => header.trim(),
          mapValues: ({ header, index, value }) => value.trim(),
        }),
      );

    parseCSV.on('data', async (transaction: CSVTransaction) => {
      const { title, type, value, category } = transaction;
      if (!title || !type || !value) return;

      categories.push(category);
      transactions.push({ title, type, value, category });
    });

    await new Promise(resolve => {
      parseCSV.on('end', resolve);
    });

    const existentCategories = await categoriesRepository.find({
      where: {
        title: In(categories),
      },
    });

    const existentCategoriesTitle = existentCategories.map(
      (category: Category) => category.title,
    );

    console.log(existentCategoriesTitle);

    const addCategoryTitles = categories
      .filter(category => !existentCategoriesTitle.includes(category))
      .filter((value, index, self) => self.indexOf(value) == index);

    const newCategories = categoriesRepository.create(
      addCategoryTitles.map(title => ({
        title,
      })),
    );

    const createdCategories = await categoriesRepository.save(newCategories);

    const finalCategories = [...createdCategories, ...existentCategories];

    const createdTransactions = transactionRepo.create(
      transactions.map(t => ({
        title: t.title,
        type: t.type,
        value: t.value,
        category: finalCategories.find(
          category => category.title == t.category,
        ),
      })),
    );

    console.log(transactions);
    console.log(categories);
    console.log(addCategoryTitles);

    await fs.promises.unlink(filePath);

    return await transactionRepo.save(createdTransactions);
  }
}

export default ImportTransactionsService;
