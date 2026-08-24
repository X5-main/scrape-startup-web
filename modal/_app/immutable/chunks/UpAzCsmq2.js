(function(){try{var e=typeof window<`u`?window:typeof global<`u`?global:typeof globalThis<`u`?globalThis:typeof self<`u`?self:{};e.SENTRY_RELEASE={id:`f99fcf9f0a844cc9bd13fdc8e5782b84`};var t=new e.Error().stack;t&&(e._sentryDebugIds=e._sentryDebugIds||{},e._sentryDebugIds[t]=`35ed6e12-9103-46db-a622-684032c2afbb`,e._sentryDebugIdIdentifier=`sentry-dbid-35ed6e12-9103-46db-a622-684032c2afbb`)}catch{}})();import{St as e,bt as t,c as n,d as r,en as i,tn as a,wn as o}from"./F_ixKBiO.js";import"./B1sc9Zdx.js";import"./Bb2deiU3.js";import{o as s}from"./CPby7b1n.js";import{t as c}from"./BILrvr3I.js";import{t as l}from"./B4L_if842.js";var u={toc:[{depth:1,value:`modal curl`,id:`modal-curl`}],rawContent:`# \`modal curl\`

Send an authenticated request to a Modal endpoint.

Experimental: This command may change or be removed in the future.

This command allows you to send authenticated requests without including proxy token
headers. Authentication is managed via your local Modal API credentials. API-based
authentication adds latency to requests, so this utility is recommended only for
experimentation and debugging purposes.

All arguments are passed directly to \`curl\`, which must be installed locally.

Examples:

\`\`\`bash
modal curl https://user--my-app.us-west.modal.direct
modal curl -X GET https://user--my-app.us-west.modal.direct
\`\`\`

**Usage**:

\`\`\`shell
modal curl [OPTIONS] CURL_ARGS...
\`\`\`

**Options**:

* \`--help\`: Show this message and exit.
`,meta:{title:`modal curl`,description:`Send an authenticated request to a Modal endpoint.`}},{toc:d,rawContent:f,meta:p}=u,m=e(`<code>modal curl</code>`),h=e(`<!> <p>Send an authenticated request to a Modal endpoint.</p> <p>Experimental: This command may change or be removed in the future.</p> <p>This command allows you to send authenticated requests without including proxy token
headers. Authentication is managed via your local Modal API credentials. API-based
authentication adds latency to requests, so this utility is recommended only for
experimentation and debugging purposes.</p> <p>All arguments are passed directly to <code>curl</code>, which must be installed locally.</p> <p>Examples:</p> <!> <p><strong>Usage</strong>:</p> <!> <p><strong>Options</strong>:</p> <ul><li><code>--help</code>: Show this message and exit.</li></ul>`,1);function g(e,d){let f=n(d,[`children`,`$$slots`,`$$events`,`$$legacy`]);l(e,r(()=>f,()=>u,{children:(e,n)=>{var r=h(),l=i(r);s(l,{id:`modal-curl`,children:(e,n)=>{t(e,m())},$$slots:{default:!0}});var u=a(l,12);c(u,{code:`modal%20curl%20https%3A%2F%2Fuser--my-app.us-west.modal.direct%0Amodal%20curl%20-X%20GET%20https%3A%2F%2Fuser--my-app.us-west.modal.direct`,lang:`bash`}),c(a(u,4),{code:`modal%20curl%20%5BOPTIONS%5D%20CURL_ARGS...`,lang:`shell`}),o(4),t(e,r)},$$slots:{default:!0}}))}export{g as default,u as metadata};
//# sourceMappingURL=UpAzCsmq2.js.map
