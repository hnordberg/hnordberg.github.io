'use client';

import { useState, useRef } from 'react';
import { WikiSectionBody } from '../../../wiki/components/WikiSectionBody';
import { useMathJax } from '../../../../components/MathJax';
import Link from 'next/link';

type Section = {
  kind: 'prose' | 'equation' | 'pitfall' | 'example' | 'code';
  title?: string;
  body?: string;
  equation?: string;
};

type Page = {
  pageIndex: number;
  pageTitle: string;
  sections: Section[];
};

type Quiz = {
  prompt: string;
  answer: string;
};

type StudyContent = {
  id: string;
  title: string;
  shortTitle: string;
  pages: Page[];
  quiz: Quiz[];
};

export default function StudyClient({ studyContent }: { studyContent: StudyContent }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const { MathJaxScript } = useMathJax(containerRef);
  
  // Total pages = normal pages + 1 (quiz page)
  const totalPages = studyContent.pages.length + 1;
  const isQuizPage = currentIndex === studyContent.pages.length;

  const handleNext = () => {
    if (currentIndex < totalPages - 1) setCurrentIndex(prev => prev + 1);
  };

  const handlePrev = () => {
    if (currentIndex > 0) setCurrentIndex(prev => prev - 1);
  };

  // State to toggle show/hide answer on quiz flashcards
  const [revealedAnswers, setRevealedAnswers] = useState<Record<number, boolean>>({});

  const toggleAnswer = (idx: number) => {
    setRevealedAnswers(prev => ({ ...prev, [idx]: !prev[idx] }));
  };

  return (
    <div ref={containerRef} className="bg-white dark:bg-slate-900 rounded-lg shadow-md border border-gray-200 dark:border-slate-800 p-6 md:p-8 relative">
      <MathJaxScript />
      <div className="mb-4">
        <Link href="/ml/llm" className="text-sm text-sky-600 dark:text-sky-400 hover:underline">
          &larr; Back to LLM Papers
        </Link>
      </div>

      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl md:text-3xl font-bold">{studyContent.shortTitle}</h1>
        <div className="text-sm text-gray-500 font-medium">
          Step {currentIndex + 1} of {totalPages}
        </div>
      </div>

      <div className="w-full bg-gray-200 dark:bg-slate-800 rounded-full h-1.5 mb-8">
        <div
          className="bg-sky-500 h-1.5 rounded-full transition-all duration-300"
          style={{ width: `${((currentIndex + 1) / totalPages) * 100}%` }}
        ></div>
      </div>

      <div className="min-h-[400px]">
        {!isQuizPage && (
          <div>
            <h2 className="text-xl font-semibold mb-6 pb-2 border-b border-gray-200 dark:border-slate-700">
              {studyContent.pages[currentIndex].pageTitle}
            </h2>
            <div className="flex flex-col gap-6">
              {studyContent.pages[currentIndex].sections.map((section, idx) => (
                <div key={idx}>
                  {section.title && <h3 className="font-medium text-lg mb-2">{section.title}</h3>}
                  {section.kind === 'equation' ? (
                    <div className="py-4 my-2 overflow-x-auto">
                      <WikiSectionBody html={`\\[ ${section.equation} \\]`} />
                    </div>
                  ) : section.kind === 'pitfall' ? (
                    <div className="bg-red-50 dark:bg-red-900/20 border-l-4 border-red-500 p-4 rounded text-sm">
                      {section.body && <WikiSectionBody html={section.body} />}
                    </div>
                  ) : (
                    <div>
                      {section.body && <WikiSectionBody html={section.body} />}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {isQuizPage && (
          <div>
            <h2 className="text-xl font-semibold mb-6 pb-2 border-b border-gray-200 dark:border-slate-700">
              Check Your Understanding
            </h2>
            <div className="flex flex-col gap-4">
              {studyContent.quiz.map((q, idx) => (
                <div key={idx} className="border border-gray-200 dark:border-slate-700 rounded-lg overflow-hidden">
                  <button
                    className="w-full text-left p-4 bg-gray-50 dark:bg-slate-800/50 font-medium flex justify-between items-center hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors"
                    onClick={() => toggleAnswer(idx)}
                  >
                    <span>{q.prompt}</span>
                    <span className="text-gray-400 shrink-0 ml-4">{revealedAnswers[idx] ? '▼' : '▶'}</span>
                  </button>
                  {revealedAnswers[idx] && (
                    <div className="p-4 border-t border-gray-200 dark:border-slate-700 text-sm">
                      <WikiSectionBody html={q.answer} />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="mt-12 flex justify-between items-center pt-6 border-t border-gray-200 dark:border-slate-800">
        <button
          onClick={handlePrev}
          disabled={currentIndex === 0}
          className="px-4 py-2 font-medium rounded text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          &larr; Previous
        </button>
        
        {currentIndex < totalPages - 1 ? (
          <button
            onClick={handleNext}
            className="px-6 py-2 font-medium rounded text-white bg-sky-600 hover:bg-sky-700 transition-colors"
          >
            Next &rarr;
          </button>
        ) : (
          <Link
            href="/ml/llm"
            className="px-6 py-2 font-medium rounded !text-white bg-green-600 hover:bg-green-700 transition-colors"
          >
            Finish Study
          </Link>
        )}
      </div>
    </div>
  );
}
