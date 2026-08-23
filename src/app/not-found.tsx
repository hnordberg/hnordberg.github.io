import Link from 'next/link'

// GitHub Pages serves this file for any unmatched path, keeping the requested
// URL in the address bar. Any /ml/* URL that predates the current redirect list
// (an old topic slug still sitting in a search index, say) is forwarded to the
// new site here rather than dead-ending on a 404.
const mlFallback = `
(function(){
  try {
    var p = location.pathname.replace(/\/index\.html$/, '').replace(/\.html$/, '');
    if (p === '/ml' || p.indexOf('/ml/') === 0) {
      location.replace('https://axioml.org' + (p === '/ml' ? '/' : p.slice(3)) + location.search + location.hash);
    }
  } catch (e) {}
})();`

export default function NotFound() {
  return (
    <>
      <script dangerouslySetInnerHTML={{ __html: mlFallback }} />
      <main className="page-with-contents">
        <div className="flex-1 w-full min-w-0 mt-4 xl:mt-0">
          <h1>Page not found</h1>
          <p>
            The machine learning section moved to{' '}
            <a href="https://axioml.org">axioml.org</a>; if you followed an old{' '}
            <code>/ml</code> link you should be redirected there automatically.
          </p>
          <p>
            Otherwise, head <Link href="/">back to the home page</Link>.
          </p>
        </div>
      </main>
    </>
  )
}
