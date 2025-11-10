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
        {/* vertical line - left edge on mobile, positioned at 7rem on desktop */}
        <div aria-hidden="true" className={`${styles.line} z-10`} />
        {items.map((item) => {
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
                    <h3 className="font-semibold text-lg">{item.title}</h3>
                    <p className="mt-2 whitespace-pre-line">{item.description}</p>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
