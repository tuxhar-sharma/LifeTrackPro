import { useEffect } from 'react';

const BRAND_NAME = 'LifeTrack Pro';

/**
 * Dynamically updates the browser tab / document title.
 * Formats as "LifeTrack Pro | Page Title" or "LifeTrack Pro" if no title is provided.
 *
 * @param title The specific page title (e.g. "Dashboard", "Financial Ledger", "Discipline & Habits")
 * @param preserveOnUnmount Whether to retain the title when the component unmounts (defaults to false)
 */
export function useDocumentTitle(title?: string, preserveOnUnmount: boolean = false): void {
  useEffect(() => {
    const previousTitle = document.title;
    const formattedTitle = title && title.trim().length > 0 
      ? `${BRAND_NAME} | ${title.trim()}`
      : BRAND_NAME;

    document.title = formattedTitle;

    return () => {
      if (!preserveOnUnmount) {
        document.title = previousTitle;
      }
    };
  }, [title, preserveOnUnmount]);
}

export default useDocumentTitle;
