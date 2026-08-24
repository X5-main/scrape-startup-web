(function(){try{var e=typeof window<`u`?window:typeof global<`u`?global:typeof globalThis<`u`?globalThis:typeof self<`u`?self:{};e.SENTRY_RELEASE={id:`f99fcf9f0a844cc9bd13fdc8e5782b84`};var t=new e.Error().stack;t&&(e._sentryDebugIds=e._sentryDebugIds||{},e._sentryDebugIds[t]=`7aa07710-afa3-40bb-b1c8-adea282010b4`,e._sentryDebugIdIdentifier=`sentry-dbid-7aa07710-afa3-40bb-b1c8-adea282010b4`)}catch{}})();import{$t as e,St as t,Tn as n,Tt as r,bt as i,c as a,d as o,en as s,tn as c,wn as l}from"./F_ixKBiO.js";import"./B1sc9Zdx.js";import"./Bb2deiU3.js";import{a as u,i as d,o as f,r as p}from"./CPby7b1n.js";import{n as m}from"./JPsrybyr.js";import{t as h}from"./B4L_if842.js";import{t as g}from"./DeWGVqas2.js";var _={toc:[{depth:1,value:`Security and privacy at Modal`,id:`security-and-privacy-at-modal`,children:[{depth:2,value:`Application security (AppSec)`,id:`application-security-appsec`},{depth:2,value:`Corporate security (CorpSec)`,id:`corporate-security-corpsec`},{depth:2,value:`Network and infrastructure security (InfraSec)`,id:`network-and-infrastructure-security-infrasec`},{depth:2,value:`Vulnerability remediation`,id:`vulnerability-remediation`,children:[{depth:3,value:`Severity timeframes`,id:`severity-timeframes`}]},{depth:2,value:`Shared responsibility model`,id:`shared-responsibility-model`},{depth:2,value:`SOC 2`,id:`soc-2`},{depth:2,value:`HIPAA`,id:`hipaa`},{depth:2,value:`PCI`,id:`pci`},{depth:2,value:`Bug bounty program`,id:`bug-bounty-program`},{depth:2,value:`Data privacy`,id:`data-privacy`,children:[{depth:3,value:`Data retention`,id:`data-retention`,children:[{depth:4,value:`Function inputs and outputs`,id:`function-inputs-and-outputs`},{depth:4,value:`Modal Inference endpoints`,id:`modal-inference-endpoints`}]}]},{depth:2,value:`Questions?`,id:`questions`}]}],rawContent:`# Security and privacy at Modal

The document outlines Modal's security and privacy commitments.

## Application security (AppSec)

AppSec is the practice of building software that is secure by design, secured
during development, secured with testing and review, and deployed securely.

- We build our software using memory-safe programming languages, including Rust
  (for our worker runtime and storage infrastructure) and Python (for our API
  servers and Modal client).
- Software dependencies are audited by Github's Dependabot.
- We make decisions that minimize our attack surface. Most interactions with
  Modal are well-described in a gRPC API, and occur through
  [\`modal\`](https://pypi.org/project/modal), our open-source command-line tool
  and Python client library.
- We have automated synthetic monitoring test applications that continuously
  check for network and application isolation within our runtime.
- We use HTTPS for secure connections. Modal forces HTTPS for all services using
  TLS (SSL), including our public website and the Dashboard to ensure secure
  connections. Modal's [client library](https://pypi.org/project/modal) connects
  to Modal's servers over TLS and verify TLS certificates on each connection.
- All user data is encrypted in transit and at rest.
- All public Modal APIs use
  [TLS 1.3](https://datatracker.ietf.org/doc/html/rfc8446), the latest and
  safest version of the TLS protocol.
- Internal code reviews are performed using a modern, PR-based development
  workflow (Github), and engage external penetration testing firms to assess our
  software security.

## Corporate security (CorpSec)

CorpSec is the practice of making sure Modal employees have secure access to
Modal company infrastructure, and also that exposed channels to Modal are
secured. CorpSec controls are the primary concern of standards such as SOC2.

- Access to our services and applications is gated on a SSO Identity Provider
  (IdP).
- We mandate phishing-resistant multi-factor authentication (MFA) in all
  enrolled IdP accounts.
- We regularly audit access to internal systems.
- Employee laptops are protected by full disk encryption using FileVault2, and
  managed by Secureframe MDM.

## Network and infrastructure security (InfraSec)

InfraSec is the practice of ensuring a hardened, minimal attack surface for
components we deploy on our network.

- Modal uses logging and metrics observability providers, including Datadog and
  Sentry.io.
- Compute jobs at Modal are containerized and virtualized using
  [gVisor](https://github.com/google/gvisor), the sandboxing technology
  developed at Google and used in their _Google Cloud Run_ and _Google
  Kubernetes Engine_ cloud services.
- We conduct annual business continuity and security incident exercises.

## Vulnerability remediation

Security vulnerabilities directly affecting Modal's systems and services will be
patched or otherwise remediated within a timeframe appropriate for the severity
of the vulnerability, subject to the public availability of a patch or other
remediation mechanisms.

If there is a CVSS severity rating accompanying a vulnerability disclosure, we
rely on that as a starting point, but may upgrade or downgrade the severity
using our best judgement.

### Severity timeframes

- **Critical:** 24 hours
- **High:** 1 week
- **Medium:** 1 month
- **Low:** 3 months
- **Informational:** 3 months or longer

## Shared responsibility model

Modal prioritizes the integrity, security, and availability of customer data. Under our shared responsibility model, customers also have certain responsibilities regarding data backup, recovery, and availability.

1. **Data backup**: Customers are responsible for maintaining backups of their data. Performing daily backups is recommended. Customers must routinely verify the integrity of their backups.
2. **Data recovery**: Customers should maintain a comprehensive data recovery plan that includes detailed procedures for data restoration in the event of data loss, corruption, or system failure. Customers must routinely test their recovery process.
3. **Availability**: While Modal is committed to high service availability, customers must implement contingency measures to maintain business continuity during service interruptions. Customers are also responsible for the reliability of their own IT infrastructure.
4. **Security measures**: Customers must implement appropriate security measures, such as encryption and access controls, to protect their data throughout the backup, storage, and recovery processes. These processes must comply with all relevant laws and regulations.

## SOC 2

We have successfully completed a [System and Organization Controls (SOC) 2 Type 2
audit](/blog/soc2type2). Go to our [Security Portal](https://trust.modal.com) to request access to the report.

## HIPAA

HIPAA, which stands for the Health Insurance Portability and Accountability Act, establishes a set of standards that protect health information, including individuals’ medical records and other individually identifiable health information. HIPAA guidelines apply to both covered entities and business associates—of which Modal is the latter if you are processing PHI on Modal.

Modal's services can be used in a HIPAA compliant manner. It is important to note that unlike other security standards, there is no officially recognized certification process for HIPAA compliance. Instead, we demonstrate our compliance with regulations such as HIPAA via the practices outlined in this doc, our technical and operational security measures, and through official audits for standards compliance such as SOC 2 certification.

To use Modal services for HIPAA-compliant workloads, a Business Associate Agreement (BAA) should be established with us prior to submission of any PHI. This is available on our Enterprise plan. Contact us at security@modal.com to get started. At the moment, [Volumes v1](https://modal.com/docs/guide/volumes), [Images](https://modal.com/docs/guide/images) (excluding [Filesystem and Directory Snapshots](/docs/guide/sandbox-snapshots)), [Memory Snapshots](https://modal.com/docs/guide/memory-snapshots), and user code are out of scope of the commitments within our BAA, so PHI should not be used in those areas of the product.

[Volumes v2](https://modal.com/docs/guide/volumes#volumes-v2) are HIPAA compliant.

## PCI

_Payment Card Industry Data Security Standard_ (PCI) is a standard that defines
the security and privacy requirements for payment card processing.

Modal uses [Stripe](https://stripe.com) to securely process transactions and
trusts their commitment to best-in-class security. We do not store personal
credit card information for any of our customers. Stripe is certified as "PCI
Service Provider Level 1", which is the highest level of certification in the
payments industry.

## Bug bounty program

Keeping user data secure is a top priority at Modal. We welcome contributions
from the security community to identify vulnerabilities in our product and
disclose them to us in a responsible manner. We currently run a private bug
bounty program through HackerOne. If you have found a vulnerability and
wish to participate, please send an email to security@modal.com with your
HackerOne username or email and we will invite you to the program.

## Data privacy

Modal will never access or use:

- your source code.
- the inputs (function arguments) or outputs (function return values) to your Modal Functions.
- any data you store in Modal, such as in Images or Volumes.

App logs and metadata are stored on Modal. Modal will not access this data
unless permission is granted by the user to help with troubleshooting.

### Data retention

Different Modal products have different retention policies for the data they
handle. The table below summarizes how long each type of data is retained.

| Data                                  | Product                                                                                                              | Retention                                                                                               |
| ------------------------------------- | -------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------- |
| Inputs and outputs                    | [Functions](/docs/guide) (\`.remote\`, \`.spawn\`, \`.map\`, [Web Functions](/docs/guide/webhooks), Scheduled Functions)   | Up to 7 days, then deleted                                                                              |
| Request and response payloads         | [Server](/docs/guide/servers) and [Auto Endpoints](/docs/guide/endpoints)                                            | Not stored — proxied directly to your container                                                         |
| App and container logs                | [Functions](/docs/guide), [Sandboxes](/docs/guide/sandboxes)                                                         | Plan-dependent: 1 day on Starter, 30 days on Team, configurable on Enterprise (see [pricing](/pricing)) |
| Audit logs                            | Workspace (Enterprise)                                                                                               | Per Enterprise contract (see [Audit logs](/docs/guide/audit-logs))                                      |
| Files                                 | [Volumes](/docs/guide/volumes), [Images](/docs/guide/images)                                                         | Persistent until you delete them                                                                        |
| Memory snapshots                      | [Function memory snapshots](/docs/guide/memory-snapshots), [Sandbox memory snapshots](/docs/guide/sandbox-snapshots) | 7 days after creation                                                                                   |
| Filesystem snapshots                  | [Sandbox filesystem snapshots](/docs/guide/sandbox-snapshots)                                                        | 30 days after creation (configurable; stored as Images)                                                 |
| Directory snapshots                   | [Sandbox directory snapshots](/docs/guide/sandbox-snapshots)                                                         | 30 days after creation (configurable)                                                                   |
| Entries                               | [Dicts](/docs/guide/dicts)                                                                                           | 7 days after last read or write                                                                         |
| Partitions                            | [Queues](/docs/guide/queues)                                                                                         | Configurable per-partition TTL (default 24 hours)                                                       |
| App, Function, and container metadata | All products                                                                                                         | Stored for the lifetime of your account                                                                 |

#### Function inputs and outputs

Function inputs and outputs are stored encrypted at rest. Small payloads
(≤ 2 MiB) are stored inline in our metadata store; larger payloads are stored
in object storage. Both are deleted within a maximum TTL of 7 days.

#### Modal Inference endpoints

Modal Inference endpoints are zero data retention: request and response payloads
are never written to disk and pass through Modal's infrastructure only as
in-flight network traffic. Inference endpoints terminate TLS at Modal's edge
proxy and forward requests directly to your containers over an internal tunnel.

## Questions?

[Email us!](mailto:security@modal.com)
`,meta:{title:`Security and privacy at Modal`,description:`The document outlines Modal’s security and privacy commitments.`}},{toc:v,rawContent:y,meta:b}=_,x=t(`<code>modal</code>`),S=t(`<thead><tr><th>Data</th><th>Product</th><th>Retention</th></tr></thead> <tbody><tr><td>Inputs and outputs</td><td><!> (<code>.remote</code>, <code>.spawn</code>, <code>.map</code>, <!>, Scheduled Functions)</td><td>Up to 7 days, then deleted</td></tr><tr><td>Request and response payloads</td><td><!> and <!></td><td>Not stored — proxied directly to your container</td></tr><tr><td>App and container logs</td><td><!>, <!></td><td>Plan-dependent: 1 day on Starter, 30 days on Team, configurable on Enterprise (see <!>)</td></tr><tr><td>Audit logs</td><td>Workspace (Enterprise)</td><td>Per Enterprise contract (see <!>)</td></tr><tr><td>Files</td><td><!>, <!></td><td>Persistent until you delete them</td></tr><tr><td>Memory snapshots</td><td><!>, <!></td><td>7 days after creation</td></tr><tr><td>Filesystem snapshots</td><td><!></td><td>30 days after creation (configurable; stored as Images)</td></tr><tr><td>Directory snapshots</td><td><!></td><td>30 days after creation (configurable)</td></tr><tr><td>Entries</td><td><!></td><td>7 days after last read or write</td></tr><tr><td>Partitions</td><td><!></td><td>Configurable per-partition TTL (default 24 hours)</td></tr><tr><td>App, Function, and container metadata</td><td>All products</td><td>Stored for the lifetime of your account</td></tr></tbody>`,1),C=t(`<!> <p>The document outlines Modal’s security and privacy commitments.</p> <!> <p>AppSec is the practice of building software that is secure by design, secured
during development, secured with testing and review, and deployed securely.</p> <ul><li>We build our software using memory-safe programming languages, including Rust
(for our worker runtime and storage infrastructure) and Python (for our API
servers and Modal client).</li> <li>Software dependencies are audited by Github’s Dependabot.</li> <li>We make decisions that minimize our attack surface. Most interactions with
Modal are well-described in a gRPC API, and occur through <!>, our open-source command-line tool
and Python client library.</li> <li>We have automated synthetic monitoring test applications that continuously
check for network and application isolation within our runtime.</li> <li>We use HTTPS for secure connections. Modal forces HTTPS for all services using
TLS (SSL), including our public website and the Dashboard to ensure secure
connections. Modal’s <!> connects
to Modal’s servers over TLS and verify TLS certificates on each connection.</li> <li>All user data is encrypted in transit and at rest.</li> <li>All public Modal APIs use <!>, the latest and
safest version of the TLS protocol.</li> <li>Internal code reviews are performed using a modern, PR-based development
workflow (Github), and engage external penetration testing firms to assess our
software security.</li></ul> <!> <p>CorpSec is the practice of making sure Modal employees have secure access to
Modal company infrastructure, and also that exposed channels to Modal are
secured. CorpSec controls are the primary concern of standards such as SOC2.</p> <ul><li>Access to our services and applications is gated on a SSO Identity Provider
(IdP).</li> <li>We mandate phishing-resistant multi-factor authentication (MFA) in all
enrolled IdP accounts.</li> <li>We regularly audit access to internal systems.</li> <li>Employee laptops are protected by full disk encryption using FileVault2, and
managed by Secureframe MDM.</li></ul> <!> <p>InfraSec is the practice of ensuring a hardened, minimal attack surface for
components we deploy on our network.</p> <ul><li>Modal uses logging and metrics observability providers, including Datadog and
Sentry.io.</li> <li>Compute jobs at Modal are containerized and virtualized using <!>, the sandboxing technology
developed at Google and used in their <em>Google Cloud Run</em> and <em>Google
Kubernetes Engine</em> cloud services.</li> <li>We conduct annual business continuity and security incident exercises.</li></ul> <!> <p>Security vulnerabilities directly affecting Modal’s systems and services will be
patched or otherwise remediated within a timeframe appropriate for the severity
of the vulnerability, subject to the public availability of a patch or other
remediation mechanisms.</p> <p>If there is a CVSS severity rating accompanying a vulnerability disclosure, we
rely on that as a starting point, but may upgrade or downgrade the severity
using our best judgement.</p> <!> <ul><li><strong>Critical:</strong> 24 hours</li> <li><strong>High:</strong> 1 week</li> <li><strong>Medium:</strong> 1 month</li> <li><strong>Low:</strong> 3 months</li> <li><strong>Informational:</strong> 3 months or longer</li></ul> <!> <p>Modal prioritizes the integrity, security, and availability of customer data. Under our shared responsibility model, customers also have certain responsibilities regarding data backup, recovery, and availability.</p> <ol><li><strong>Data backup</strong>: Customers are responsible for maintaining backups of their data. Performing daily backups is recommended. Customers must routinely verify the integrity of their backups.</li> <li><strong>Data recovery</strong>: Customers should maintain a comprehensive data recovery plan that includes detailed procedures for data restoration in the event of data loss, corruption, or system failure. Customers must routinely test their recovery process.</li> <li><strong>Availability</strong>: While Modal is committed to high service availability, customers must implement contingency measures to maintain business continuity during service interruptions. Customers are also responsible for the reliability of their own IT infrastructure.</li> <li><strong>Security measures</strong>: Customers must implement appropriate security measures, such as encryption and access controls, to protect their data throughout the backup, storage, and recovery processes. These processes must comply with all relevant laws and regulations.</li></ol> <!> <p>We have successfully completed a <!>. Go to our <!> to request access to the report.</p> <!> <p>HIPAA, which stands for the Health Insurance Portability and Accountability Act, establishes a set of standards that protect health information, including individuals’ medical records and other individually identifiable health information. HIPAA guidelines apply to both covered entities and business associates—of which Modal is the latter if you are processing PHI on Modal.</p> <p>Modal’s services can be used in a HIPAA compliant manner. It is important to note that unlike other security standards, there is no officially recognized certification process for HIPAA compliance. Instead, we demonstrate our compliance with regulations such as HIPAA via the practices outlined in this doc, our technical and operational security measures, and through official audits for standards compliance such as SOC 2 certification.</p> <p>To use Modal services for HIPAA-compliant workloads, a Business Associate Agreement (BAA) should be established with us prior to submission of any PHI. This is available on our Enterprise plan. Contact us at <!> to get started. At the moment, <!>, <!> (excluding <!>), <!>, and user code are out of scope of the commitments within our BAA, so PHI should not be used in those areas of the product.</p> <p><!> are HIPAA compliant.</p> <!> <p><em>Payment Card Industry Data Security Standard</em> (PCI) is a standard that defines
the security and privacy requirements for payment card processing.</p> <p>Modal uses <!> to securely process transactions and
trusts their commitment to best-in-class security. We do not store personal
credit card information for any of our customers. Stripe is certified as “PCI
Service Provider Level 1”, which is the highest level of certification in the
payments industry.</p> <!> <p>Keeping user data secure is a top priority at Modal. We welcome contributions
from the security community to identify vulnerabilities in our product and
disclose them to us in a responsible manner. We currently run a private bug
bounty program through HackerOne. If you have found a vulnerability and
wish to participate, please send an email to <!> with your
HackerOne username or email and we will invite you to the program.</p> <!> <p>Modal will never access or use:</p> <ul><li>your source code.</li> <li>the inputs (function arguments) or outputs (function return values) to your Modal Functions.</li> <li>any data you store in Modal, such as in Images or Volumes.</li></ul> <p>App logs and metadata are stored on Modal. Modal will not access this data
unless permission is granted by the user to help with troubleshooting.</p> <!> <p>Different Modal products have different retention policies for the data they
handle. The table below summarizes how long each type of data is retained.</p> <!> <!> <p>Function inputs and outputs are stored encrypted at rest. Small payloads
(≤ 2 MiB) are stored inline in our metadata store; larger payloads are stored
in object storage. Both are deleted within a maximum TTL of 7 days.</p> <!> <p>Modal Inference endpoints are zero data retention: request and response payloads
are never written to disk and pass through Modal’s infrastructure only as
in-flight network traffic. Inference endpoints terminate TLS at Modal’s edge
proxy and forward requests directly to your containers over an internal tunnel.</p> <!> <p><!></p>`,1);function w(t,v){let y=a(v,[`children`,`$$slots`,`$$events`,`$$legacy`]);h(t,o(()=>y,()=>_,{children:(t,a)=>{var o=C(),h=s(o);f(h,{id:`security-and-privacy-at-modal`,children:(e,t)=>{l(),i(e,r(`Security and privacy at Modal`))},$$slots:{default:!0}});var _=c(h,4);u(_,{id:`application-security-appsec`,children:(e,t)=>{l(),i(e,r(`Application security (AppSec)`))},$$slots:{default:!0}});var v=c(_,4),y=c(e(v),4);g(c(e(y)),{href:`https://pypi.org/project/modal`,rel:`nofollow`,children:(e,t)=>{i(e,x())},$$slots:{default:!0}}),l(),n(y);var b=c(y,4);g(c(e(b)),{href:`https://pypi.org/project/modal`,rel:`nofollow`,children:(e,t)=>{l(),i(e,r(`client library`))},$$slots:{default:!0}}),l(),n(b);var w=c(b,4);g(c(e(w)),{href:`https://datatracker.ietf.org/doc/html/rfc8446`,rel:`nofollow`,children:(e,t)=>{l(),i(e,r(`TLS 1.3`))},$$slots:{default:!0}}),l(),n(w),l(2),n(v);var T=c(v,2);u(T,{id:`corporate-security-corpsec`,children:(e,t)=>{l(),i(e,r(`Corporate security (CorpSec)`))},$$slots:{default:!0}});var E=c(T,6);u(E,{id:`network-and-infrastructure-security-infrasec`,children:(e,t)=>{l(),i(e,r(`Network and infrastructure security (InfraSec)`))},$$slots:{default:!0}});var D=c(E,4),O=c(e(D),2);g(c(e(O)),{href:`https://github.com/google/gvisor`,rel:`nofollow`,children:(e,t)=>{l(),i(e,r(`gVisor`))},$$slots:{default:!0}}),l(5),n(O),l(2),n(D);var k=c(D,2);u(k,{id:`vulnerability-remediation`,children:(e,t)=>{l(),i(e,r(`Vulnerability remediation`))},$$slots:{default:!0}});var A=c(k,6);d(A,{id:`severity-timeframes`,children:(e,t)=>{l(),i(e,r(`Severity timeframes`))},$$slots:{default:!0}});var j=c(A,4);u(j,{id:`shared-responsibility-model`,children:(e,t)=>{l(),i(e,r(`Shared responsibility model`))},$$slots:{default:!0}});var M=c(j,6);u(M,{id:`soc-2`,children:(e,t)=>{l(),i(e,r(`SOC 2`))},$$slots:{default:!0}});var N=c(M,2),P=c(e(N));g(P,{href:`/blog/soc2type2`,children:(e,t)=>{l(),i(e,r(`System and Organization Controls (SOC) 2 Type 2
audit`))},$$slots:{default:!0}}),g(c(P,2),{href:`https://trust.modal.com`,rel:`nofollow`,children:(e,t)=>{l(),i(e,r(`Security Portal`))},$$slots:{default:!0}}),l(),n(N);var F=c(N,2);u(F,{id:`hipaa`,children:(e,t)=>{l(),i(e,r(`HIPAA`))},$$slots:{default:!0}});var I=c(F,6),L=c(e(I));g(L,{href:`mailto:security@modal.com`,children:(e,t)=>{l(),i(e,r(`security@modal.com`))},$$slots:{default:!0}});var R=c(L,2);g(R,{href:`https://modal.com/docs/guide/volumes`,rel:`nofollow`,children:(e,t)=>{l(),i(e,r(`Volumes v1`))},$$slots:{default:!0}});var z=c(R,2);g(z,{href:`https://modal.com/docs/guide/images`,rel:`nofollow`,children:(e,t)=>{l(),i(e,r(`Images`))},$$slots:{default:!0}});var B=c(z,2);g(B,{href:`/docs/guide/sandbox-snapshots`,children:(e,t)=>{l(),i(e,r(`Filesystem and Directory Snapshots`))},$$slots:{default:!0}}),g(c(B,2),{href:`https://modal.com/docs/guide/memory-snapshots`,rel:`nofollow`,children:(e,t)=>{l(),i(e,r(`Memory Snapshots`))},$$slots:{default:!0}}),l(),n(I);var V=c(I,2);g(e(V),{href:`https://modal.com/docs/guide/volumes#volumes-v2`,rel:`nofollow`,children:(e,t)=>{l(),i(e,r(`Volumes v2`))},$$slots:{default:!0}}),l(),n(V);var H=c(V,2);u(H,{id:`pci`,children:(e,t)=>{l(),i(e,r(`PCI`))},$$slots:{default:!0}});var U=c(H,4);g(c(e(U)),{href:`https://stripe.com`,rel:`nofollow`,children:(e,t)=>{l(),i(e,r(`Stripe`))},$$slots:{default:!0}}),l(),n(U);var W=c(U,2);u(W,{id:`bug-bounty-program`,children:(e,t)=>{l(),i(e,r(`Bug bounty program`))},$$slots:{default:!0}});var G=c(W,2);g(c(e(G)),{href:`mailto:security@modal.com`,children:(e,t)=>{l(),i(e,r(`security@modal.com`))},$$slots:{default:!0}}),l(),n(G);var K=c(G,2);u(K,{id:`data-privacy`,children:(e,t)=>{l(),i(e,r(`Data privacy`))},$$slots:{default:!0}});var q=c(K,8);d(q,{id:`data-retention`,children:(e,t)=>{l(),i(e,r(`Data retention`))},$$slots:{default:!0}});var J=c(q,4);m(J,{children:(t,a)=>{var o=S(),u=c(s(o),2),d=e(u),f=c(e(d)),p=e(f);g(p,{href:`/docs/guide`,children:(e,t)=>{l(),i(e,r(`Functions`))},$$slots:{default:!0}}),g(c(p,8),{href:`/docs/guide/webhooks`,children:(e,t)=>{l(),i(e,r(`Web Functions`))},$$slots:{default:!0}}),l(),n(f),l(),n(d);var m=c(d),h=c(e(m)),_=e(h);g(_,{href:`/docs/guide/servers`,children:(e,t)=>{l(),i(e,r(`Server`))},$$slots:{default:!0}}),g(c(_,2),{href:`/docs/guide/endpoints`,children:(e,t)=>{l(),i(e,r(`Auto Endpoints`))},$$slots:{default:!0}}),n(h),l(),n(m);var v=c(m),y=c(e(v)),b=e(y);g(b,{href:`/docs/guide`,children:(e,t)=>{l(),i(e,r(`Functions`))},$$slots:{default:!0}}),g(c(b,2),{href:`/docs/guide/sandboxes`,children:(e,t)=>{l(),i(e,r(`Sandboxes`))},$$slots:{default:!0}}),n(y);var x=c(y);g(c(e(x)),{href:`/pricing`,children:(e,t)=>{l(),i(e,r(`pricing`))},$$slots:{default:!0}}),l(),n(x),n(v);var C=c(v),w=c(e(C),2);g(c(e(w)),{href:`/docs/guide/audit-logs`,children:(e,t)=>{l(),i(e,r(`Audit logs`))},$$slots:{default:!0}}),l(),n(w),n(C);var T=c(C),E=c(e(T)),D=e(E);g(D,{href:`/docs/guide/volumes`,children:(e,t)=>{l(),i(e,r(`Volumes`))},$$slots:{default:!0}}),g(c(D,2),{href:`/docs/guide/images`,children:(e,t)=>{l(),i(e,r(`Images`))},$$slots:{default:!0}}),n(E),l(),n(T);var O=c(T),k=c(e(O)),A=e(k);g(A,{href:`/docs/guide/memory-snapshots`,children:(e,t)=>{l(),i(e,r(`Function memory snapshots`))},$$slots:{default:!0}}),g(c(A,2),{href:`/docs/guide/sandbox-snapshots`,children:(e,t)=>{l(),i(e,r(`Sandbox memory snapshots`))},$$slots:{default:!0}}),n(k),l(),n(O);var j=c(O),M=c(e(j));g(e(M),{href:`/docs/guide/sandbox-snapshots`,children:(e,t)=>{l(),i(e,r(`Sandbox filesystem snapshots`))},$$slots:{default:!0}}),n(M),l(),n(j);var N=c(j),P=c(e(N));g(e(P),{href:`/docs/guide/sandbox-snapshots`,children:(e,t)=>{l(),i(e,r(`Sandbox directory snapshots`))},$$slots:{default:!0}}),n(P),l(),n(N);var F=c(N),I=c(e(F));g(e(I),{href:`/docs/guide/dicts`,children:(e,t)=>{l(),i(e,r(`Dicts`))},$$slots:{default:!0}}),n(I),l(),n(F);var L=c(F),R=c(e(L));g(e(R),{href:`/docs/guide/queues`,children:(e,t)=>{l(),i(e,r(`Queues`))},$$slots:{default:!0}}),n(R),l(),n(L),l(),n(u),i(t,o)},$$slots:{default:!0}});var Y=c(J,2);p(Y,{id:`function-inputs-and-outputs`,children:(e,t)=>{l(),i(e,r(`Function inputs and outputs`))},$$slots:{default:!0}});var X=c(Y,4);p(X,{id:`modal-inference-endpoints`,children:(e,t)=>{l(),i(e,r(`Modal Inference endpoints`))},$$slots:{default:!0}});var Z=c(X,4);u(Z,{id:`questions`,children:(e,t)=>{l(),i(e,r(`Questions?`))},$$slots:{default:!0}});var Q=c(Z,2);g(e(Q),{href:`mailto:security@modal.com`,children:(e,t)=>{l(),i(e,r(`Email us!`))},$$slots:{default:!0}}),n(Q),i(t,o)},$$slots:{default:!0}}))}export{w as default,_ as metadata};
//# sourceMappingURL=gi9bG84c2.js.map
