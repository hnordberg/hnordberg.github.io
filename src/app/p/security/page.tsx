const OWASPPage = () => {
  return (
    <main className="full-bleed">
      <div className="content-container">
        <h1>Dealing with Security Vulnerabilities</h1>
        <section id="best-practices">
          <h2>Best Practices for Mitigation</h2>
          <p>
            Don't <i>just</i> try to reason about what a hacker might do. The way to protect yourself is to look up how to mitigate for each vulnerability.
            As an example, let's say you want to protect against path traversal vulnerabilities. You know you shouldn't allow '../' in paths.
            So you write code to remove '../' from paths. This is not enough as the hacker could pass '.../...//', which would yield '../' after
            removing '../'. Read more on the <a href="https://cwe.mitre.org/data/definitions/22.html">CWE-22</a> page. It is always
            safest to follow standard ways when implementing security.
          </p>
        </section>
        <section id="web-standards">
          <h1>Web Standards</h1>
          <h2>Content Security Policy (CSP)</h2>
          <p>
            Content Security Policy (CSP) allows whitelisting of sources of content that are allowed to be loaded. Helps prevent XSS attacks.
            CSP supersedes <code>X-Frame-Options</code>.
          </p>
          <h2>Cross-Origin Resource Sharing (CORS)</h2>
          <p>
            Cross-Origin Resource Sharing (CORS) allows whitelisting of origins (i.e., web sites) that are allowed to access a resource. By 
            default the browser prevents scripts on the page from accessing resources on other domains. CORS allows you to configure
            what other domains are allowed to access the resource. This is done by setting the Access-Control-Allow-Origin header. 
            The flow looks like this:
          </p>
          <ol>
            <li>The browser sends a request with <code>Origin: https://example.com</code> to the server.</li>
            <li>The server looks at the <code>Origin</code> header and checks its CORS policy. If it approves, the 
            server sets the <code>Access-Control-Allow-Origin: https://example.com</code> header in the response.</li>
            <li>The browser looks at the <code>Access-Control-Allow-Origin</code> header and allows the request to proceed,
            if its value matches its origin.</li>
          </ol>
          <p>
            For requests using methods other than GET, POST, or HEAD, or POSTs with a Content-Type other than application/x-www-form-urlencoded,
            multipart/form-data, or text/plain, or if the request has a custom header, the browser will send a <i>preflight request</i> to the server. 
            The preflight request will be an OPTIONS request with the following headers: Origin, Access-Control-Request-Method, 
            Access-Control-Request-Headers. If the server approves, it responds with 200 OK.
          </p>
          <h2>HTTP Strict Transport Security (HSTS)</h2>
          <p>
            HTTP Strict Transport Security (HSTS) is a security header that tells the browser to only connect to the server using HTTPS.
          </p>
          <h2>Subresource Integrity (SRI)</h2>
          <p>
            Subresource Integrity (SRI) is a parameter a developer can add to a script tag to ensure that the script has not been tampered with.
            This is commonly used when loading scripts from a CDN.
          </p>
        </section>

        <h1>The OWASP Top 10</h1>
        <p className="intro">The <a href="https://owasp.org/Top10/2025/0x00_2025-Introduction/">OWASP Top 10</a> is a list of
         the most common security vulnerabilities affecting web applications. For each category, OWASP lists the most common vulnerabilities,
         which they number using the Common Weakness Enumeration (CWE). Examples are XSS, SQL injection, and CSRF.
        </p>

        <section id="a01-broken-access-control">
          <h2>A01:2025 - Broken Access Control</h2>
          <p>
          </p>
        </section>

        <section id="a02-security-misconfiguration">
          <h2>A02:2025 - Security Misconfiguration</h2>
          <p>
          </p>
        </section>

        <section id="a03-software-supply-chain">
          <h2>A03:2025 - Software Supply Chain Failures</h2>
          <p>
          </p>
        </section>

        <section id="a04-cryptographic-failures">
          <h2>A04:2025 - Cryptographic Failures</h2>
          <p>
          </p>
        </section>

        <section id="a05-injection">
          <h2>A05:2025 - Injection</h2>
          <p>
          <ul className="list">
              <li>SQL injection</li>
              <li>Cross-site scripting (XSS). This is where the attacker injects code into the web page.
                Commonly exploited features include URL parameters, search fields, and forms.
              </li>
              <li>Cross-site request forgery (CSRF). </li>
              <li>Directory traversal</li>
              <li>File inclusion</li>
              <li>Command injection</li>
            </ul>
          </p>
        </section>

        <section id="a06-insecure-design">
          <h2>A06:2025 - Insecure Design</h2>
          <p>
          </p>
        </section>

        <section id="a07-authentication-failures">
          <h2>A07:2025 - Authentication Failures</h2>
          <p>
          </p>
        </section>

        <section id="a08-integrity-failures">
          <h2>A08:2025 - Software or Data Integrity Failures</h2>
          <p>
          </p>
        </section>

        <section id="a09-logging-alerting">
          <h2>A09:2025 - Logging & Alerting Failures</h2>
          <p>
          </p>
        </section>

        <section id="a10-exceptional-conditions">
          <h2>A10:2025 - Mishandling of Exceptional Conditions</h2>
          <p>
          </p>
        </section>
      </div>
    </main>
  )
}

export default OWASPPage;

