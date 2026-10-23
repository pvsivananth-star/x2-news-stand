import { useCallback, useRef, useState } from 'react';
import { fetchArticleDetails } from '@/src/services/articleDetails';
import type { ArticleDetails } from '@/src/services/articleDetails';

export type ArticleDetailsState =
  | { status: 'loading' }
  | { status: 'error'; message: string }
  | { status: 'success'; details: ArticleDetails };

export function useArticleDetails() {
  const [detailsByArticleId, setDetailsByArticleId] = useState<
    Record<string, ArticleDetailsState>
  >({});
  const loadingIds = useRef(new Set<string>());

  const loadArticleDetails = useCallback(
    async (articleId: string, articleUrl: string | undefined): Promise<void> => {
      if (detailsByArticleId[articleId]?.status === 'success' || loadingIds.current.has(articleId)) {
        return;
      }

      if (!articleUrl) {
        setDetailsByArticleId((current) => ({
          ...current,
          [articleId]: { status: 'error', message: 'No original article link is available.' },
        }));
        return;
      }

      loadingIds.current.add(articleId);
      setDetailsByArticleId((current) => ({
        ...current,
        [articleId]: { status: 'loading' },
      }));

      try {
        const details = await fetchArticleDetails(articleUrl);
        setDetailsByArticleId((current) => ({
          ...current,
          [articleId]: { status: 'success', details },
        }));
      } catch (error) {
        setDetailsByArticleId((current) => ({
          ...current,
          [articleId]: {
            status: 'error',
            message: error instanceof Error ? error.message : 'Could not load article details.',
          },
        }));
      } finally {
        loadingIds.current.delete(articleId);
      }
    },
    [detailsByArticleId],
  );

  return { detailsByArticleId, loadArticleDetails };
}
