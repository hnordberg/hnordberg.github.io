import type { Metadata } from 'next'
import Link from 'next/link'

import redirectUrls from '../../../../data/ml-redirects.json'

// The ML section moved to its own site. Every old /ml/* URL maps to the same
// path without the /ml prefix, because the section was hoisted to the root
// there: /ml/wiki/kl-divergence -> https://axioml.org/wiki/kl-divergence
const NEW_ORIGIN = 'https://axioml.org'

type PageProps = { params: Promise<{ slug?: string[] }> }

function targetFor(slug?: string[]): string {
  const rest = slug && slug.length > 0 ? `/${slug.join('/')}` : '/'
  return `${NEW_ORIGIN}${rest}`
}

export function generateStaticParams() {
  return (redirectUrls as string[]).map((url) => {
    const rest = url.replace(/^\/ml/, '')
    return { slug: rest.split('/').filter(Boolean) }
  })
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params
  const target = targetFor(slug)
  return {
    title: 'Moved to AxioML',
    description: `This page has moved to ${target}`,
    // The canonical is what actually transfers search ranking to the new site.
    alternates: { canonical: target },
  }
}

export default async function MovedToAxioML({ params }: PageProps) {
  const { slug } = await params
  const target = targetFor(slug)

  return (
    <>
      <meta httpEquiv="refresh" content={`0; url=${target}`} />
      <script
        dangerouslySetInnerHTML={{
          __html: `location.replace(${JSON.stringify(target)});`,
        }}
      />
      <main className="page-with-contents">
        <div className="flex-1 w-full min-w-0 mt-4 xl:mt-0">
          <h1>This page has moved</h1>
          <p>
            The machine learning section now lives at{' '}
            <a href={NEW_ORIGIN}>axioml.org</a>. You should be redirected
            automatically.
          </p>
          <p>
            If not, continue to <a href={target}>{target}</a>.
          </p>
          <p>
            <Link href="/">Back to hnordberg.github.io</Link>
          </p>
        </div>
      </main>
    </>
  )
}
