import type { Article, CategoryId } from '@/src/domain/types';

export interface INewsService {
  refresh(category: CategoryId): Promise<Article[]>;
  getCached(category: CategoryId): Promise<Article[]>;
}
