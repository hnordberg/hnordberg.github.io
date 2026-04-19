import Link from 'next/link';

const BookIcon = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
  </svg>
);

const DocumentIcon = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
  </svg>
);

const NetworkIcon = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
  </svg>
);

const SparklesIcon = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
  </svg>
)

const BulbIcon = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
  </svg>
)

const MLPage = () => {

  return (
    <main className="page-with-contents">
      
      <div className="flex-1 w-full min-w-0 mt-4 xl:mt-0">
        <header className="mb-10 space-y-3 px-2">
          <h1 className="text-4xl md:text-5xl font-serif font-bold text-gray-900 dark:text-gray-100 tracking-tight text-left mb-2 border-b-0 pb-0">
            Machine Learning
          </h1>
          <p className="text-lg md:text-xl text-gray-600 dark:text-gray-400 font-light max-w-2xl leading-relaxed">
            Resources, notes, and research covering the theoretical and practical aspects of modern artificial intelligence.
          </p>
        </header>

        <section className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-12 border-b-0">
          <div className="group relative bg-white dark:bg-[#1a1a1a] rounded-xl p-8 border border-neutral-200 dark:border-neutral-800 shadow-sm hover:shadow-md transition-all duration-300 transform hover:-translate-y-1" id="wiki">
            <div className="absolute inset-0 bg-gradient-to-br from-indigo-50/50 dark:from-indigo-900/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity rounded-xl pointer-events-none"></div>
            <div className="relative z-10 h-full flex flex-col">
              <div className="flex items-center space-x-4 mb-4">
                <div className="p-2 bg-indigo-50 dark:bg-indigo-950/50 text-indigo-700 dark:text-indigo-400 rounded-lg">
                  <BookIcon />
                </div>
                <h2 className="text-2xl font-serif font-semibold text-gray-900 dark:text-gray-100 m-0 border-none pb-0">ML Wiki</h2>
              </div>
              <div className="space-y-4 flex-grow">
                <p className="text-gray-600 dark:text-gray-400 leading-relaxed text-base">
                  Theory-first mini-wiki with topics, tags, equations, figures, and
                  learning paths (see the wiki home for how it ties to your study deck).
                </p>
              </div>
              <div className="pt-6 mt-auto">
                <Link href="/ml/wiki" className="inline-flex items-center font-medium text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 transition-colors">
                  Open the wiki 
                  <span className="ml-1 text-lg group-hover:translate-x-1 transition-transform inline-block">→</span>
                </Link>
              </div>
            </div>
          </div>

          <div className="group relative bg-white dark:bg-[#1a1a1a] rounded-xl p-8 border border-neutral-200 dark:border-neutral-800 shadow-sm hover:shadow-md transition-all duration-300 transform hover:-translate-y-1" id="llm">
             <div className="absolute inset-0 bg-gradient-to-br from-blue-50/50 dark:from-blue-900/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity rounded-xl pointer-events-none"></div>
             <div className="relative z-10 h-full flex flex-col">
              <div className="flex items-center space-x-4 mb-4">
                <div className="p-2 bg-blue-50 dark:bg-blue-950/50 text-blue-700 dark:text-blue-400 rounded-lg">
                  <DocumentIcon />
                </div>
                <h2 className="text-2xl font-serif font-semibold text-gray-900 dark:text-gray-100 m-0 border-none pb-0">LLM Papers</h2>
              </div>
              <div className="space-y-4 flex-grow">
                <p className="text-gray-600 dark:text-gray-400 leading-relaxed text-base">
                  <span className="font-medium text-gray-900 dark:text-gray-200">History of Machine Learning & LLMs</span> — citation-ranked timeline with impact filter.
                </p>
              </div>
              <div className="pt-6 mt-auto">
                <Link href="/ml/llm" className="inline-flex items-center font-medium text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 transition-colors">
                  View timeline
                  <span className="ml-1 text-lg group-hover:translate-x-1 transition-transform inline-block">→</span>
                </Link>
              </div>
            </div>
          </div>

          <div className="group relative bg-white dark:bg-[#1a1a1a] rounded-xl p-8 border border-neutral-200 dark:border-neutral-800 shadow-sm hover:shadow-md transition-all duration-300 transform hover:-translate-y-1" id="interesting">
            <div className="absolute inset-0 bg-gradient-to-br from-emerald-50/50 dark:from-emerald-900/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity rounded-xl pointer-events-none"></div>
            <div className="relative z-10 h-full flex flex-col">
              <div className="flex items-center space-x-4 mb-4">
                <div className="p-2 bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-400 rounded-lg">
                  <SparklesIcon />
                </div>
                <h2 className="text-2xl font-serif font-semibold text-gray-900 dark:text-gray-100 m-0 border-none pb-0">Interesting Papers</h2>
              </div>
              <div className="space-y-4 flex-grow">
                <p className="text-gray-600 dark:text-gray-400 leading-relaxed text-base">
                  Curated highlights of specific papers, notes, and implementations.
                </p>
              </div>
              <div className="pt-6 mt-auto">
                <Link href="/ml/interesting" className="inline-flex items-center font-medium text-emerald-600 dark:text-emerald-400 hover:text-emerald-800 dark:hover:text-emerald-300 transition-colors">
                  Read highlights
                  <span className="ml-1 text-lg group-hover:translate-x-1 transition-transform inline-block">→</span>
                </Link>
              </div>
            </div>
          </div>

          <div className="group relative bg-white dark:bg-[#1a1a1a] rounded-xl p-8 border border-neutral-200 dark:border-neutral-800 shadow-sm hover:shadow-md transition-all duration-300 transform hover:-translate-y-1" id="transformer">
             <div className="absolute inset-0 bg-gradient-to-br from-amber-50/50 dark:from-amber-900/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity rounded-xl pointer-events-none"></div>
             <div className="relative z-10 h-full flex flex-col">
              <div className="flex items-center space-x-4 mb-4">
                <div className="p-2 bg-amber-50 dark:bg-amber-950/50 text-amber-700 dark:text-amber-400 rounded-lg">
                  <NetworkIcon />
                </div>
                <h2 className="text-2xl font-serif font-semibold text-gray-900 dark:text-gray-100 m-0 border-none pb-0">Transformer</h2>
              </div>
              <div className="space-y-4 flex-grow">
                <p className="text-gray-600 dark:text-gray-400 leading-relaxed text-base">
                  Overview of the Transformer architecture: parallel compute, attention, masking, and more.
                </p>
              </div>
              <div className="pt-6 mt-auto">
                <Link href="/ml/transformer" className="inline-flex items-center font-medium text-amber-600 dark:text-amber-400 hover:text-amber-800 dark:hover:text-amber-300 transition-colors">
                  Read more 
                  <span className="ml-1 text-lg group-hover:translate-x-1 transition-transform inline-block">→</span>
                </Link>
              </div>
            </div>
          </div>

          <div className="group relative bg-white dark:bg-[#1a1a1a] rounded-xl p-8 border border-neutral-200 dark:border-neutral-800 shadow-sm hover:shadow-md transition-all duration-300 transform hover:-translate-y-1 md:col-span-2" id="suggest-topic">
            <div className="absolute inset-0 bg-gradient-to-br from-violet-50/50 dark:from-violet-900/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity rounded-xl pointer-events-none"></div>
            <div className="relative z-10 h-full flex flex-col md:flex-row md:items-center md:gap-10">
              <div className="flex-1">
                <div className="flex items-center space-x-4 mb-4">
                  <div className="p-2 bg-violet-50 dark:bg-violet-950/50 text-violet-700 dark:text-violet-400 rounded-lg">
                    <BulbIcon />
                  </div>
                  <h2 className="text-2xl font-serif font-semibold text-gray-900 dark:text-gray-100 m-0 border-none pb-0">Suggest a wiki topic</h2>
                </div>
                <div className="space-y-4">
                  <p className="text-gray-600 dark:text-gray-400 leading-relaxed text-base">
                    Request a new ML Wiki topic or gap to cover. Submissions use Cloudflare Turnstile before they reach the suggestion endpoint.
                  </p>
                </div>
              </div>
              <div className="pt-6 md:pt-0 md:flex-shrink-0">
                <Link href="/ml/suggest-topic" className="inline-flex items-center font-medium text-violet-600 dark:text-violet-400 hover:text-violet-800 dark:hover:text-violet-300 transition-colors">
                  Open the form
                  <span className="ml-1 text-lg group-hover:translate-x-1 transition-transform inline-block">→</span>
                </Link>
              </div>
            </div>
          </div>

        </section>
      </div>
    </main>
  )
}

export default MLPage;
