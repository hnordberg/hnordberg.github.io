import Contents from '../../components/Contents'

const OWASPPage = () => {
  const articles = [
    { id: 'best-practices', title: 'Dealing with Security Vulnerabilities' },
    { id: 'web-standards', title: 'Web Standards' },
    { id: 'three-acronyms', title: 'XSS, CSRF, and SSRF' },
    { id: 'owasp-top-10', title: 'The OWASP Top 10' }
  ]

  return (
    <main className="page-with-contents">
      <Contents articles={articles} />
      <div className="content-container">
        <h1>Security for the Web</h1>
        <section id="best-practices">
          <p>
            On this page I will cover web security specifically. 
          </p>
        </section>
        <h1>Dealing with Security Vulnerabilities</h1>
        <section id="best-practices">
          <h2>Best Practices for Mitigation</h2>
          <p>
            Don't <i>just</i> try to reason about what a hacker might do. The way to protect yourself is to look up how to mitigate each vulnerability.
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
            Content Security Policy (CSP) allows whitelisting sources of content that are allowed to be loaded. Helps prevent XSS attacks.
            CSP supersedes <code>X-Frame-Options</code>.
          </p>
          <h2>Cross-Origin Resource Sharing (CORS)</h2>
          <p>
            Cross-Origin Resource Sharing (CORS) can allowlist websites (origins) that are allowed to access a resource. By
            default, the browser prevents scripts on the page from accessing resources on other domains. CORS allows you to configure
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
            For requests using methods other than GET, POST, or HEAD, or POST requests with a Content-Type other than application/x-www-form-urlencoded,
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

        <section id="three-acronyms">
          <h1>XSS, CSRF, and SSRF</h1>
          <h2>Comparison</h2>
          <p>
            XSS and CSRF are both client-side attacks, while SSRF is a server-side attack. XSS attacks are executed by injecting malicious
            code into a web page of another user. It can be used to extract information from the browser's context (e.g., cookies, DOM).
            With CSRF, the attacker crafts a malicious request (e.g., an HTML image tag, an auto-submitting form, or a link) and tricks an authenticated user into
            loading it. Since the user is logged into the target application, their browser automatically includes their session cookies with the forged
            request, which the trusted site then executes as a legitimate user action. SSRF attacks are executed by manipulating a request
            such that, when executed, it causes the server to make a request to an unintended site.
          </p>
          <h2>XSS -- Cross-Site Scripting</h2>
          <p>
            XSS -- inject code into a web page of another user. Extract information from the browser's context (e.g., cookies, DOM).
          </p>
          <h2>CSRF -- Cross-Site Request Forgery</h2>
          <p>
            CSRF -- forge a request to a trusted site on behalf of an authenticated user. Cause authenticated actions to occur.
          </p>
          <h2>SSRF -- Server-Side Request Forgery</h2>
          <p>
            SSRF -- forge a request to an unintended site on behalf of an authenticated user.
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
            Common weaknesses include:
          </p>
          <ul>
            <li><a href="https://cwe.mitre.org/data/definitions/352.html">CWE-352 Cross-Site Request Forgery (CSRF)</a></li>
            <li><a href="https://cwe.mitre.org/data/definitions/22.html">CWE-22 Path Traversal</a></li>
            <li><a href="https://cwe.mitre.org/data/definitions/276.html">CWE-276 Incorrect Default Permissions</a></li>
          </ul>
          See <a href="https://owasp.org/Top10/2025/A01_2025-Broken_Access_Control/#list-of-mapped-cwes">full list of CWEs</a> for broken access control.
        </section>

        <section id="a02-security-misconfiguration">
          <h2>A02:2025 - Security Misconfiguration</h2>
          <p>
            Common weaknesses include:
          </p>
          <ul>
            <li><a href="https://cwe.mitre.org/data/definitions/260.html">CWE-260 Password in Configuration File</a></li>
            <li><a href="https://cwe.mitre.org/data/definitions/489.html">CWE-489 Active Debug Code</a></li>
            <li><a href="https://cwe.mitre.org/data/definitions/526.html">CWE-526 Exposure of Sensitive Information Through Environmental Variables</a></li>
          </ul>
          See <a href="https://owasp.org/Top10/2025/A02_2025-Security_Misconfiguration/#list-of-mapped-cwes">full list of CWEs</a> for security misconfiguration.
        </section>

        <section id="a03-software-supply-chain">
          <h2>A03:2025 - Software Supply Chain Failures</h2>
          <p>
            Common weaknesses include:
          </p>
          <ul>
            <li><a href="https://cwe.mitre.org/data/definitions/1035.html">CWE-1035 Using Components with Known Vulnerabilities</a></li>
            <li><a href="https://cwe.mitre.org/data/definitions/1104.html">CWE-1104 Use of Unmaintained Third Party Components</a></li>
            <li><a href="https://cwe.mitre.org/data/definitions/1395.html">CWE-1395 Dependency on Vulnerable Third-Party Component</a></li>
          </ul>
          See <a href="https://owasp.org/Top10/2025/A03_2025-Software_Supply_Chain_Failures/#list-of-mapped-cwes">full list of CWEs</a> for software supply chain failures.
        </section>

        <section id="a04-cryptographic-failures">
          <h2>A04:2025 - Cryptographic Failures</h2>
          <p>
            Common weaknesses include:
          </p>
          <ul>
            <li><a href="https://cwe.mitre.org/data/definitions/326.html">CWE-326 Inadequate Encryption Strength</a></li>
            <li><a href="https://cwe.mitre.org/data/definitions/332.html">CWE-332 Insufficient Entropy in PRNG</a></li>
            <li><a href="https://cwe.mitre.org/data/definitions/759.html">CWE-759 Use of a One-Way Hash without a Salt</a></li>
          </ul>
          See <a href="https://owasp.org/Top10/2025/A04_2025-Cryptographic_Failures/#list-of-mapped-cwes">full list of CWEs</a> for cryptographic failures.
        </section>

        <section id="a05-injection">
          <h2>A05:2025 - Injection</h2>
          <p>
            Common weaknesses include:
          </p>
          <ul>
            <li><a href="https://cwe.mitre.org/data/definitions/89.html">CWE-89 SQL Injection</a></li>
            <li><a href="https://cwe.mitre.org/data/definitions/78.html">CWE-78 OS Command Injection</a></li>
            <li><a href="https://cwe.mitre.org/data/definitions/94.html">CWE-94 Improper Control of Generation of Code ('Code Injection', includes XSS)</a></li>
          </ul>
          See <a href="https://owasp.org/Top10/2025/A05_2025-Injection/#list-of-mapped-cwes">full list of CWEs</a> for injection.
        </section>

        <section id="a06-insecure-design">
          <h2>A06:2025 - Insecure Design</h2>
          <p>
            Common weaknesses include:
          </p>
          <ul>
            <li><a href="https://cwe.mitre.org/data/definitions/311.html">CWE-311 Missing Encryption of Sensitive Data</a></li>
            <li><a href="https://cwe.mitre.org/data/definitions/444.html">CWE-444 Inconsistent Interpretation of HTTP Requests ('HTTP Request Smuggling')</a></li>
            <li><a href="https://cwe.mitre.org/data/definitions/602.html">CWE-602 Client-Side Enforcement of Server-Side Security</a></li>
          </ul>
          See <a href="https://owasp.org/Top10/2025/A06_2025-Insecure_Design/#list-of-mapped-cwes">full list of CWEs</a> for insecure design.
        </section>

        <section id="a07-authentication-failures">
          <h2>A07:2025 - Authentication Failures</h2>
          <p>
            Common weaknesses include:
          </p>
          <ul>
            <li><a href="https://cwe.mitre.org/data/definitions/259.html">CWE-259 Use of Hard-coded Password</a></li>
            <li><a href="https://cwe.mitre.org/data/definitions/295.html">CWE-295 Improper Certificate Validation</a></li>
            <li><a href="https://cwe.mitre.org/data/definitions/1392.html">CWE-1392 Use of Default Credentials</a></li>
          </ul>
          See <a href="https://owasp.org/Top10/2025/A07_2025-Authentication_Failures/#list-of-mapped-cwes">full list of CWEs</a> for authentication failures.
        </section>

        <section id="a08-integrity-failures">
          <h2>A08:2025 - Software or Data Integrity Failures</h2>
          <p>
            Common weaknesses include:
          </p>
          <ul>
            <li><a href="https://cwe.mitre.org/data/definitions/506.html">CWE-506 Embedded Malicious Code</a></li>
            <li><a href="https://cwe.mitre.org/data/definitions/427.html">CWE-427 Uncontrolled Search Path Element</a></li>
            <li><a href="https://cwe.mitre.org/data/definitions/565.html">CWE-565 Reliance on Cookies without Validation and Integrity Checking</a></li>
          </ul>
          See <a href="https://owasp.org/Top10/2025/A08_2025-Software_or_Data_Integrity_Failures/#list-of-mapped-cwes">full list of CWEs</a> for software or data integrity failures.
        </section>

        <section id="a09-logging-alerting">
          <h2>A09:2025 - Logging & Alerting Failures</h2>
          <p>
            Common weaknesses include:
          </p>
          <ul>
            <li><a href="https://cwe.mitre.org/data/definitions/117.html">CWE-117 Improper Output Neutralization for Logs</a></li>
            <li><a href="https://cwe.mitre.org/data/definitions/532.html">CWE-532 Insertion of Sensitive Information into Log File</a></li>
            <li><a href="https://cwe.mitre.org/data/definitions/778.html">CWE-778 Insufficient Logging</a></li>
          </ul>
          See <a href="https://owasp.org/Top10/2025/A09_2025-Logging_and_Alerting_Failures/#list-of-mapped-cwes">full list of CWEs</a> for logging & alerting failures.
        </section>

        <section id="a10-exceptional-conditions">
          <h2>A10:2025 - Mishandling of Exceptional Conditions</h2>
          <p>
            Common weaknesses include:
          </p>
          <ul>
            <li><a href="https://cwe.mitre.org/data/definitions/209.html">CWE-209 Generation of Error Message Containing Sensitive Information</a></li>
            <li><a href="https://cwe.mitre.org/data/definitions/252.html">CWE-252 Unchecked Return Value</a></li>
            <li><a href="https://cwe.mitre.org/data/definitions/280.html">CWE-280 Improper Handling of Insufficient Permissions or Privileges</a></li>
          </ul>
          See <a href="https://owasp.org/Top10/2025/A10_2025-Mishandling_of_Exceptional_Conditions/#list-of-mapped-cwes">full list of CWEs</a> for mishandling of exceptional conditions.
        </section>
      </div>
    </main>
  )
}

export default OWASPPage;

