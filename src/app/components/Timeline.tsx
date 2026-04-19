'use client';

import React, { useRef, useEffect, useState } from 'react';
import Image from 'next/image';
import styles from './Timeline.module.css';

type Entry = {
  id: string;
  period: string;
  title: string;
  authors?: string[];
  org?: string;
  location?: string;
  paperTitle?: string;
  repo?: string;
  description: string;
  details?: string;
  icon?: string; // filename inside public/img, e.g. 'jgi.webp'
  citations?: number;
  impactScore?: number;
  hasStudy?: boolean;
};

const numberFormatter = new Intl.NumberFormat('en-US');

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

function ExpandableAuthors({ authors }: { authors: string[] }) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isWrapping, setIsWrapping] = useState(false);
  const textRef = useRef<HTMLSpanElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const authorsText = authors.join(', ');

  useEffect(() => {
    const checkWrapping = () => {
      if (!textRef.current || !containerRef.current) {
        return;
      }

      const textEl = textRef.current;
      const containerWidth = containerRef.current.clientWidth - 30; // account for button space

      // Temporarily disable wrapping to measure the natural width of the text
      const previousWhiteSpace = textEl.style.whiteSpace;
      const previousDisplay = textEl.style.display;
      textEl.style.whiteSpace = 'nowrap';
      textEl.style.display = 'inline';

      // Force reflow before measuring
      const textWidth = textEl.scrollWidth;

      // Revert temporary overrides
      textEl.style.whiteSpace = previousWhiteSpace;
      textEl.style.display = previousDisplay;

      if (textWidth === 0) {
        return;
      }

      setIsWrapping(textWidth > containerWidth);
    };

    // Check multiple times to account for layout timing and hydration
    // Immediate check
    requestAnimationFrame(() => {
      checkWrapping();
    });

    // Check after a short delay (for hydration)
    const timeout1 = setTimeout(checkWrapping, 50);

    // Check again after hydration should be complete
    const timeout2 = setTimeout(checkWrapping, 100);

    // Additional check for stubborn cases
    const timeout3 = setTimeout(checkWrapping, 200);

    window.addEventListener('resize', checkWrapping);

    return () => {
      clearTimeout(timeout1);
      clearTimeout(timeout2);
      clearTimeout(timeout3);
      window.removeEventListener('resize', checkWrapping);
    };
  }, [authorsText]);

  if (!authorsText) {
    return null;
  }

  if (!isWrapping) {
    return (
      <div ref={containerRef} className="text-sm text-gray-600 dark:text-gray-400 mt-1">
        <span ref={textRef}>{authorsText}</span>
      </div>
    );
  }

  return (
    <div ref={containerRef} className="text-sm text-gray-600 dark:text-gray-400 mt-1">
      <div className="flex items-start gap-2">
        <span
          ref={textRef}
          style={{
            flex: 1,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: isExpanded ? 'normal' : 'nowrap',
            display: isExpanded ? 'block' : 'block'
          }}
        >
          {authorsText}
        </span>
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="flex-shrink-0 text-sky-600 dark:text-sky-400 hover:text-sky-700 dark:hover:text-sky-300 transition-transform duration-200"
          aria-label={isExpanded ? 'Show fewer authors' : 'Show all authors'}
          style={{
            transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)',
            fontSize: '12px'
          }}
        >
          ▼
        </button>
      </div>
    </div>
  );
}

// The component receives items as a prop.
export default function Timeline({
  items,
  filterBy = '',
  filterLabel,
  defaultFilterCutoff,
}: {
  items: Entry[];
  filterBy?: string;
  filterLabel?: string;
  defaultFilterCutoff?: number;
}) {
  const [activeEntry, setActiveEntry] = useState<Entry | null>(null);
  const numericValues = React.useMemo(() => {
    if (!filterBy) {
      return [];
    }

    return items
      .map((item) => {
        const val = (item as Record<string, unknown>)[filterBy];
        return typeof val === 'number' ? val : undefined;
      })
      .filter((value): value is number => value !== undefined);
  }, [items, filterBy]);

  const minAvailableValue = React.useMemo(() => {
    if (numericValues.length === 0) {
      return 0;
    }
    return Math.floor(Math.min(...numericValues));
  }, [numericValues]);

  const maxAvailableValue = React.useMemo(() => {
    if (numericValues.length === 0) {
      return 0;
    }
    return Math.ceil(Math.max(...numericValues));
  }, [numericValues]);

  const [filterCutoff, setFilterCutoff] = useState(
    defaultFilterCutoff ?? minAvailableValue
  );

  useEffect(() => {
    if (!filterBy) {
      return;
    }

    const nextCutoff = clamp(
      defaultFilterCutoff ?? minAvailableValue,
      minAvailableValue,
      maxAvailableValue
    );
    setFilterCutoff(nextCutoff);
  }, [defaultFilterCutoff, filterBy, maxAvailableValue, minAvailableValue]);

  // Filter items by the filterBy attribute threshold, keeping original chronological order
  const filteredItems = React.useMemo(() => {
    if (!filterBy) return items;

    return items.filter((item) => {
      const val = (item as Record<string, unknown>)[filterBy];
      if (typeof val === 'number') {
        return val >= filterCutoff;
      }
      return false;
    });
  }, [filterBy, filterCutoff, items]);

  const getRepoParts = (repoUrl: string) => {
    try {
      const url = new URL(repoUrl);
      if (url.hostname === 'github.com') {
        const parts = url.pathname.split('/').filter(Boolean);
        const repoName = parts.pop() || 'repository';
        return { prefix: 'GitHub repo:', text: repoName };
      }
      return { prefix: 'Repo:', text: url.hostname };
    } catch {
      return { prefix: 'Repo:', text: repoUrl };
    }
  };

  const handleOpenDetails = (entry: Entry) => {
    if (entry.details) {
      setActiveEntry(entry);
    }
  };

  const handleCloseDetails = () => setActiveEntry(null);

  useEffect(() => {
    if (!activeEntry) {
      return;
    }

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        handleCloseDetails();
      }
    };

    window.addEventListener('keydown', onKeyDown);

    return () => {
      window.removeEventListener('keydown', onKeyDown);
    };
  }, [activeEntry]);

  return (
    <section aria-label="Timeline" className="container mx-auto px-4 py-8">
      {filterBy && (
        <div className="mb-6 p-4 flex items-center gap-4">
          <label htmlFor="timeline-filter-slider" className="text-sm font-medium text-gray-400 dark:text-gray-500 whitespace-nowrap">
            Show {filteredItems.length} of {items.length}
          </label>
          <input
            id="timeline-filter-slider"
            type="range"
            min={minAvailableValue}
            max={maxAvailableValue}
            value={filterCutoff}
            onChange={(e) => setFilterCutoff(Number(e.target.value))}
            className={styles.filterSlider}
          />
          <span className="text-sm text-gray-400 dark:text-gray-500 whitespace-nowrap">
            Min {filterLabel ?? filterBy}: {filterCutoff}
          </span>
        </div>
      )}
      <div className="relative">
        {/* vertical line - left edge on mobile, positioned at 7rem on desktop */}
        <div aria-hidden="true" className={`${styles.line} z-10`} />
        {filteredItems.map((item) => {
          const year = item.period;
          return (
            <div key={item.id} className={`mb-10 ${styles.rowGrid}`}>
              {/* Mobile: year on left (hidden), Desktop: year on left */}
              <div className={`${styles.yearColumn} text-sm`}>{year}</div>

              {/* center: circle on the vertical line */}
              <div className={`flex ${styles.circles}`}>
                <div className="flex items-center w-3 h-3 bg-sky-500 rounded-full border-5 border-white z-30" />
              </div>

              {/* right: icon + content */}
              <div className={`${styles.contentColumn} w-full`}>
                {/* Mobile: year above icon */}
                <div className={`${styles.yearMobile} text-sm mb-2`}>{year}</div>
                <div className="flex items-start gap-4">
                  <div className={`flex-shrink-0 ${styles.logoContainer}`}>
                    {item.icon ? (
                      <Image src={`/img/${item.icon}`} title={`${item.title} at ${item.org}`} alt={`${item.title} at ${item.org}`} width={80} height={80} className={styles.logoImage} />
                    ) : (
                      <div className="w-8 h-8 bg-sky-500" />
                    )}
                  </div>
                  <div className={`relative z-20 text-box rounded-lg shadow w-full ${styles.card}`}>
                    <div className="absolute top-3 right-3 flex gap-2">
                      {item.hasStudy && (
                        <a
                          href={`/ml/llm/study/${item.id}`}
                          className="text-xs font-medium px-2 py-1 rounded transition-colors flex items-center gap-1 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800 hover:bg-indigo-50 dark:hover:bg-indigo-900/30"
                          aria-label={`Study ${item.title}`}
                        >
                          Study Topic <span aria-hidden="true">&rarr;</span>
                        </a>
                      )}
                      <button
                        type="button"
                        onClick={() => handleOpenDetails(item)}
                        className={`text-xs font-medium px-2 py-1 rounded transition-colors ${
                          item.details
                            ? 'text-sky-600 dark:text-sky-400 border border-sky-200 dark:border-sky-800 hover:bg-sky-50 dark:hover:bg-slate-900'
                            : 'text-gray-400 border border-gray-200 cursor-not-allowed hidden'
                        }`}
                        aria-label={item.details ? `View more details for ${item.title}` : `Details not available for ${item.title}`}
                      >
                        Details
                      </button>
                    </div>
                    <h3 className="font-semibold text-lg">{item.title}</h3>
                    {item.org && <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{item.org}</p>}
                    {item.authors && item.authors.length > 0 && <ExpandableAuthors authors={item.authors} />}
                    {(typeof item.impactScore === 'number' || typeof item.citations === 'number') && (
                      <p className="text-xs mt-1 text-gray-500 dark:text-gray-400">
                        {typeof item.impactScore === 'number' && (
                          <span>Impact {item.impactScore}</span>
                        )}
                        {typeof item.impactScore === 'number' && typeof item.citations === 'number' && (
                          <span> · </span>
                        )}
                        {typeof item.citations === 'number' && (
                          <span>{numberFormatter.format(item.citations)} citations</span>
                        )}
                      </p>
                    )}
                    {item.paperTitle && (
                      <p className="text-xs mt-1">
                        Paper: <a href={item.location} target="_blank" rel="noopener noreferrer" className="text-sky-600 dark:text-sky-400 hover:underline">
                          {item.paperTitle}
                        </a>
                      </p>
                    )}
                    {item.repo && (
                      <p className="text-xs mt-1">
                        {(() => {
                          const { prefix, text } = getRepoParts(item.repo as string);
                          return (
                            <>
                              <span>{prefix} </span>
                              <a href={item.repo} target="_blank" rel="noopener noreferrer" className="text-sky-600 dark:text-sky-400 hover:underline">
                                {text}
                              </a>
                            </>
                          );
                        })()}
                      </p>
                    )}
                    <p className="mt-2 whitespace-pre-line">{item.description}</p>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
      {activeEntry && activeEntry.details && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="timeline-details-title"
          onClick={handleCloseDetails}
        >
          <div
            className="bg-white dark:bg-slate-900 rounded-lg shadow-xl max-w-2xl w-full p-6 relative"
            onClick={(event) => event.stopPropagation()}
          >
            <button
              type="button"
              className="absolute top-3 right-3 text-sm text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
              onClick={handleCloseDetails}
              aria-label="Close details dialog"
            >
              ✕
            </button>
            <h4 id="timeline-details-title" className="text-xl font-semibold mb-3">
              {activeEntry.title}
            </h4>
            <p className="text-sm whitespace-pre-line">{activeEntry.details}</p>
          </div>
        </div>
      )}
    </section>
  );
}
