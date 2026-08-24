(function(){try{var e=typeof window<`u`?window:typeof global<`u`?global:typeof globalThis<`u`?globalThis:typeof self<`u`?self:{};e.SENTRY_RELEASE={id:`f99fcf9f0a844cc9bd13fdc8e5782b84`};var t=new e.Error().stack;t&&(e._sentryDebugIds=e._sentryDebugIds||{},e._sentryDebugIds[t]=`71c0791b-319d-4daa-91d4-8e40041b0a29`,e._sentryDebugIdIdentifier=`sentry-dbid-71c0791b-319d-4daa-91d4-8e40041b0a29`)}catch{}})();import{$t as e,St as t,Tn as n,Tt as r,bt as i,c as a,d as o,en as s,tn as c,wn as l}from"./F_ixKBiO.js";import"./B1sc9Zdx.js";import"./Bb2deiU3.js";import{t as u}from"./DeWGVqas2.js";import{t as d}from"./CdZDxCfO2.js";var f={title:`Google Cloud Run vs. Cloud Run Functions: understanding Google's serverless offerings`,description:`Explore the relationship between Google Cloud Run and Cloud Run Functions, their key differences, and how to choose the right serverless option for your needs.`,authors:[{name:`Yiren Lu`,avatarUrl:`https://modal-cdn.com/ren-lu.jpg`,jobTitle:`Solutions Engineer`,twitterHandle:`YirenLu`}],date:`2024-09-25T12:00:00.000Z`,length:`12 minute read`,category:`Article`,subcategory:`Serverless`,published:!0,layout:`blog`,toc:[{depth:2,value:`Introduction`,id:`introduction`},{depth:2,value:`The evolution of Google’s serverless platform`,id:`the-evolution-of-googles-serverless-platform`},{depth:2,value:`Cloud Run: Container-based serverless computing`,id:`cloud-run-container-based-serverless-computing`,children:[{depth:3,value:`Key features of Cloud Run`,id:`key-features-of-cloud-run`}]},{depth:2,value:`Cloud Run Functions: Simplified function-as-a-service`,id:`cloud-run-functions-simplified-function-as-a-service`,children:[{depth:3,value:`Key features of Cloud Run Functions`,id:`key-features-of-cloud-run-functions`}]},{depth:2,value:`Key differences between Cloud Run and Cloud Run Functions`,id:`key-differences-between-cloud-run-and-cloud-run-functions`},{depth:2,value:`Choosing between Cloud Run and Cloud Run Functions`,id:`choosing-between-cloud-run-and-cloud-run-functions`,children:[{depth:3,value:`Use Cloud Run when:`,id:`use-cloud-run-when`},{depth:3,value:`Use Cloud Run Functions when:`,id:`use-cloud-run-functions-when`}]},{depth:2,value:`Conclusion`,id:`conclusion`}],rawContent:`## Introduction

Google Cloud offers two primary serverless computing options: [Cloud Run](https://cloud.google.com/run) and [Cloud Run Functions](https://cloud.google.com/functions). While their names are similar, these services cater to different use cases and offer distinct features. This article aims to clarify the differences between these two offerings and help you choose the right one for your project.

## The evolution of Google's serverless platform

To understand the current landscape, it's helpful to look at the evolution of Google's serverless offerings:

1. **Cloud Functions (1st gen)**: Introduced in February 2016, this was Google's initial serverless offering for simple, event-driven functions.

2. **Cloud Run**: Launched later as a more flexible, container-based serverless platform.

3. **Cloud Functions (2nd gen)**: Released in August 2022, bringing significant improvements over the first generation.

4. **Cloud Run Functions**: On August 21, 2024, Google rebranded Cloud Functions as Cloud Run Functions, merging the infrastructure with Cloud Run.

This evolution reflects Google's effort to unify its serverless offerings while maintaining distinct services for different use cases.

## Cloud Run: Container-based serverless computing

[Cloud Run](https://cloud.google.com/run/docs/overview/what-is-cloud-run) is a fully managed serverless platform that allows developers to run stateless containers. It's designed for deploying and scaling containerized applications with minimal infrastructure management.

### Key features of Cloud Run

1. **Container-based**: Supports any language, library, or binary that can be containerized.
2. **Flexible scaling**: Automatically scales based on incoming requests, including scaling to zero.
3. **Fine-grained billing**: Pay only for the exact resources used, billed to the nearest 100 milliseconds.
4. **HTTP/2 and HTTPS support**: Automatic SSL certificate provisioning and HTTP/2 support.
5. **Custom domains**: Ability to map custom domains to services.
6. **Concurrency**: Supports handling multiple requests within a single container instance.
7. **GPU support**: Access to GPUs for compute-intensive workloads like ML inference.
8. **VPC connectivity**: Secure access to resources in Virtual Private Cloud networks.
9. **Event-driven capabilities**: Integration with Eventarc for various event types.

## Cloud Run Functions: Simplified function-as-a-service

[Cloud Run Functions](https://cloud.google.com/functions/docs/concepts/overview), formerly known as Cloud Functions, is a serverless execution environment focused on single-purpose functions that respond to events or HTTP requests.

### Key features of Cloud Run Functions

1. **Function-centric**: Deploy individual functions written in supported languages.
2. **Event-driven**: Primarily designed for event-driven architectures.
3. **Automatic scaling**: Scales based on incoming events or requests.
4. **Simplified development**: Focus solely on writing function code without container management.

It's worth noting that Cloud Run Functions inherits many capabilities from Cloud Run, including GPU access which is currently in preview. This inheritance allows developers to leverage powerful Cloud Run features within a more focused, function-based environment.

## Key differences between Cloud Run and Cloud Run Functions

While both services are part of Google's serverless ecosystem, they have distinct characteristics:

1. **Deployment model**:
   - Cloud Run: Deploy entire containerized applications.
   - Cloud Run Functions: Deploy individual functions in [supported languages](https://cloud.google.com/functions/docs/concepts/exec#runtimes).

2. **Abstraction level**:
   - Cloud Run: Lower level, offering more control over the runtime environment.
   - Cloud Run Functions: Higher level of abstraction, focusing on single-purpose functions.

3. **Container management**:
   - Cloud Run: Requires building and managing your own containers.
   - Cloud Run Functions: Handles container management automatically.

4. **Use cases**:
   - Cloud Run: Suitable for longer-running services, web applications, and more complex architectures.
   - Cloud Run Functions: Ideal for short-lived, event-based actions and simple API endpoints.

5. **Development experience**:
   - Cloud Run: More flexible, allowing use of any runtime or library that can be containerized.
   - Cloud Run Functions: Simpler for developers who want to focus solely on function code.

6. **Pricing model**:
   - Cloud Run: Billed based on container instance time and resource allocation.
   - Cloud Run Functions: Billed based on function execution time and memory usage.

## Choosing between Cloud Run and Cloud Run Functions

### Use Cloud Run when:

- You need more control over the runtime environment or custom libraries.
- You're deploying existing containerized applications.
- You require longer-running services or complex web applications.
- You want the flexibility to use any programming language or framework.

### Use Cloud Run Functions when:

- You need to quickly implement simple, event-driven code.
- Your team prefers focusing on code without managing infrastructure details.
- You're working with short-lived, event-based actions triggered by cloud services.
- You want a higher level of abstraction and simplified deployment process.

## Conclusion

To get started with either service or to explore which option is best for your use case, visit the [official Google Cloud documentation](https://cloud.google.com/run/docs/overview/what-is-cloud-run) for Cloud Run and [Cloud Run Functions](https://cloud.google.com/functions/docs/concepts/overview).
`,meta:{description:`Explore the relationship between Google Cloud Run and Cloud Run Functions, their key differences, and how to choose the right serverless option for your needs.`}},{title:p,description:m,authors:h,date:g,length:_,category:v,subcategory:y,published:b,layout:x,toc:S,rawContent:C,meta:w}=f,T=t(`<h2 id="introduction">Introduction</h2> <p>Google Cloud offers two primary serverless computing options: <!> and <!>. While their names are similar, these services cater to different use cases and offer distinct features. This article aims to clarify the differences between these two offerings and help you choose the right one for your project.</p> <h2 id="the-evolution-of-googles-serverless-platform">The evolution of Google’s serverless platform</h2> <p>To understand the current landscape, it’s helpful to look at the evolution of Google’s serverless offerings:</p> <ol><li><p><strong>Cloud Functions (1st gen)</strong>: Introduced in February 2016, this was Google’s initial serverless offering for simple, event-driven functions.</p></li> <li><p><strong>Cloud Run</strong>: Launched later as a more flexible, container-based serverless platform.</p></li> <li><p><strong>Cloud Functions (2nd gen)</strong>: Released in August 2022, bringing significant improvements over the first generation.</p></li> <li><p><strong>Cloud Run Functions</strong>: On August 21, 2024, Google rebranded Cloud Functions as Cloud Run Functions, merging the infrastructure with Cloud Run.</p></li></ol> <p>This evolution reflects Google’s effort to unify its serverless offerings while maintaining distinct services for different use cases.</p> <h2 id="cloud-run-container-based-serverless-computing">Cloud Run: Container-based serverless computing</h2> <p><!> is a fully managed serverless platform that allows developers to run stateless containers. It’s designed for deploying and scaling containerized applications with minimal infrastructure management.</p> <h3 id="key-features-of-cloud-run">Key features of Cloud Run</h3> <ol><li><strong>Container-based</strong>: Supports any language, library, or binary that can be containerized.</li> <li><strong>Flexible scaling</strong>: Automatically scales based on incoming requests, including scaling to zero.</li> <li><strong>Fine-grained billing</strong>: Pay only for the exact resources used, billed to the nearest 100 milliseconds.</li> <li><strong>HTTP/2 and HTTPS support</strong>: Automatic SSL certificate provisioning and HTTP/2 support.</li> <li><strong>Custom domains</strong>: Ability to map custom domains to services.</li> <li><strong>Concurrency</strong>: Supports handling multiple requests within a single container instance.</li> <li><strong>GPU support</strong>: Access to GPUs for compute-intensive workloads like ML inference.</li> <li><strong>VPC connectivity</strong>: Secure access to resources in Virtual Private Cloud networks.</li> <li><strong>Event-driven capabilities</strong>: Integration with Eventarc for various event types.</li></ol> <h2 id="cloud-run-functions-simplified-function-as-a-service">Cloud Run Functions: Simplified function-as-a-service</h2> <p><!>, formerly known as Cloud Functions, is a serverless execution environment focused on single-purpose functions that respond to events or HTTP requests.</p> <h3 id="key-features-of-cloud-run-functions">Key features of Cloud Run Functions</h3> <ol><li><strong>Function-centric</strong>: Deploy individual functions written in supported languages.</li> <li><strong>Event-driven</strong>: Primarily designed for event-driven architectures.</li> <li><strong>Automatic scaling</strong>: Scales based on incoming events or requests.</li> <li><strong>Simplified development</strong>: Focus solely on writing function code without container management.</li></ol> <p>It’s worth noting that Cloud Run Functions inherits many capabilities from Cloud Run, including GPU access which is currently in preview. This inheritance allows developers to leverage powerful Cloud Run features within a more focused, function-based environment.</p> <h2 id="key-differences-between-cloud-run-and-cloud-run-functions">Key differences between Cloud Run and Cloud Run Functions</h2> <p>While both services are part of Google’s serverless ecosystem, they have distinct characteristics:</p> <ol><li><p><strong>Deployment model</strong>:</p> <ul><li>Cloud Run: Deploy entire containerized applications.</li> <li>Cloud Run Functions: Deploy individual functions in <!>.</li></ul></li> <li><p><strong>Abstraction level</strong>:</p> <ul><li>Cloud Run: Lower level, offering more control over the runtime environment.</li> <li>Cloud Run Functions: Higher level of abstraction, focusing on single-purpose functions.</li></ul></li> <li><p><strong>Container management</strong>:</p> <ul><li>Cloud Run: Requires building and managing your own containers.</li> <li>Cloud Run Functions: Handles container management automatically.</li></ul></li> <li><p><strong>Use cases</strong>:</p> <ul><li>Cloud Run: Suitable for longer-running services, web applications, and more complex architectures.</li> <li>Cloud Run Functions: Ideal for short-lived, event-based actions and simple API endpoints.</li></ul></li> <li><p><strong>Development experience</strong>:</p> <ul><li>Cloud Run: More flexible, allowing use of any runtime or library that can be containerized.</li> <li>Cloud Run Functions: Simpler for developers who want to focus solely on function code.</li></ul></li> <li><p><strong>Pricing model</strong>:</p> <ul><li>Cloud Run: Billed based on container instance time and resource allocation.</li> <li>Cloud Run Functions: Billed based on function execution time and memory usage.</li></ul></li></ol> <h2 id="choosing-between-cloud-run-and-cloud-run-functions">Choosing between Cloud Run and Cloud Run Functions</h2> <h3 id="use-cloud-run-when">Use Cloud Run when:</h3> <ul><li>You need more control over the runtime environment or custom libraries.</li> <li>You’re deploying existing containerized applications.</li> <li>You require longer-running services or complex web applications.</li> <li>You want the flexibility to use any programming language or framework.</li></ul> <h3 id="use-cloud-run-functions-when">Use Cloud Run Functions when:</h3> <ul><li>You need to quickly implement simple, event-driven code.</li> <li>Your team prefers focusing on code without managing infrastructure details.</li> <li>You’re working with short-lived, event-based actions triggered by cloud services.</li> <li>You want a higher level of abstraction and simplified deployment process.</li></ul> <h2 id="conclusion">Conclusion</h2> <p>To get started with either service or to explore which option is best for your use case, visit the <!> for Cloud Run and <!>.</p>`,1);function E(t,p){let m=a(p,[`children`,`$$slots`,`$$events`,`$$legacy`]);d(t,o(()=>m,()=>f,{children:(t,a)=>{var o=T(),d=c(s(o),2),f=c(e(d));u(f,{href:`https://cloud.google.com/run`,rel:`nofollow`,children:(e,t)=>{l(),i(e,r(`Cloud Run`))},$$slots:{default:!0}}),u(c(f,2),{href:`https://cloud.google.com/functions`,rel:`nofollow`,children:(e,t)=>{l(),i(e,r(`Cloud Run Functions`))},$$slots:{default:!0}}),l(),n(d);var p=c(d,12);u(e(p),{href:`https://cloud.google.com/run/docs/overview/what-is-cloud-run`,rel:`nofollow`,children:(e,t)=>{l(),i(e,r(`Cloud Run`))},$$slots:{default:!0}}),l(),n(p);var m=c(p,8);u(e(m),{href:`https://cloud.google.com/functions/docs/concepts/overview`,rel:`nofollow`,children:(e,t)=>{l(),i(e,r(`Cloud Run Functions`))},$$slots:{default:!0}}),l(),n(m);var h=c(m,12),g=e(h),_=c(e(g),2),v=c(e(_),2);u(c(e(v)),{href:`https://cloud.google.com/functions/docs/concepts/exec#runtimes`,rel:`nofollow`,children:(e,t)=>{l(),i(e,r(`supported languages`))},$$slots:{default:!0}}),l(),n(v),n(_),n(g),l(10),n(h);var y=c(h,14),b=c(e(y));u(b,{href:`https://cloud.google.com/run/docs/overview/what-is-cloud-run`,rel:`nofollow`,children:(e,t)=>{l(),i(e,r(`official Google Cloud documentation`))},$$slots:{default:!0}}),u(c(b,2),{href:`https://cloud.google.com/functions/docs/concepts/overview`,rel:`nofollow`,children:(e,t)=>{l(),i(e,r(`Cloud Run Functions`))},$$slots:{default:!0}}),l(),n(y),i(t,o)},$$slots:{default:!0}}))}export{E as default,f as metadata};
//# sourceMappingURL=Bsj0c3-w.js.map
