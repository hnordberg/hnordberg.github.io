"use client";

import { useRef } from 'react';
import { useMathJax } from '../../../components/MathJax';

const MLTheoryPage = () => {
  const mathRef = useRef<HTMLParagraphElement>(null);
  const { MathJaxScript } = useMathJax(mathRef);

  return (
    <main>
      <MathJaxScript />
      <div className="pt-8 pb-4">
        <h1 className="text-4xl font-bold">Machine Learning Theory</h1>
        <p className="text-lg text-gray-600 dark:text-gray-400">I always felt that it
          is easier to understand a topic when you understand its innovations and
          theory from a historical perspective. This shows how many of the more advanced
          concepts arose naturally, and makes them seem less magical.
        </p>
        <p className="text-lg text-gray-600 dark:text-gray-400" ref={mathRef}>
          Say we have a set of data points <span>{'$\\{(x_i,y_i)\\}_{i=1}^{N}$'}</span>
          where $x_i$ is age and $y_i$ is height. We want to find a function $f$ that
          predicts $y_i$ from $x_i$. We can use a linear function $f(x) = wx + b$ to
          fit the data points.
        </p>
      </div>
    </main>
  );
}

export default MLTheoryPage
