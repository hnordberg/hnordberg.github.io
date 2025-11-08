import React from 'react';
import Image from 'next/image';
import styles from './Timeline.module.css';

type Entry = {
  id: string;
  period: string;
  title: string;
  org?: string;
  location?: string;
  description: string;
  icon?: string; // filename inside public/img, e.g. 'jgi.webp'
};

// The component is server-rendered and receives items as a prop.
export default function Timeline({ items }: { items: Entry[] }) {

  return (
    <section aria-label="Timeline" className="container mx-auto px-4 py-8">
      <div className="relative">
        {/* vertical line positioned between the year column (w-24) and center column (w-8): left-28 = 7rem */}
        <div aria-hidden="true" className={`${styles.line} z-10`} />
        {items.map((item) => {
          const year = item.period;
          return (
            <div key={item.id} className={`mb-10 ${styles.rowGrid}`}>
              {/* left: year (keep only year part) */}
              <div className="text-right pr-4 text-sm text-gray-500">{year}</div>

              {/* center: circle on the vertical line */}
              <div className={`flex ${styles.circles}`}>
                <div className="flex items-center w-3 h-3 bg-sky-500 rounded-full border-5 border-white z-30" />
              </div>

              {/* right: icon + content */}
              <div className="md:pl-6 w-full flex items-start gap-4">
                <div className="flex-shrink-0">
                  {item.icon ? (
                    <Image src={`/img/${item.icon}`} alt={item.title ?? ''} width={80} height={80} className="object-contain" />
                  ) : (
                    <div className="w-8 h-8 bg-sky-500" />
                  )}
                </div>
                <div className={`relative z-20 text-box rounded-lg shadow w-full ${styles.card}`}>
                  <h3 className="font-semibold text-lg">{item.title}</h3>
                  <p className="mt-2 whitespace-pre-line">{item.description}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
