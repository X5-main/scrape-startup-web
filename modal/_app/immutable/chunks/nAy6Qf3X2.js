(function(){try{var e=typeof window<`u`?window:typeof global<`u`?global:typeof globalThis<`u`?globalThis:typeof self<`u`?self:{};e.SENTRY_RELEASE={id:`f99fcf9f0a844cc9bd13fdc8e5782b84`};var t=new e.Error().stack;t&&(e._sentryDebugIds=e._sentryDebugIds||{},e._sentryDebugIds[t]=`55129602-27b9-4e51-af2e-5091dbff597d`,e._sentryDebugIdIdentifier=`sentry-dbid-55129602-27b9-4e51-af2e-5091dbff597d`)}catch{}})();import{$t as e,St as t,Tn as n,Tt as r,bt as i,c as a,d as o,en as s,tn as c,wn as l}from"./F_ixKBiO.js";import"./B1sc9Zdx.js";import"./Bb2deiU3.js";import{n as u}from"./JPsrybyr.js";import{t as d}from"./DeWGVqas2.js";import{t as f}from"./CdZDxCfO2.js";var p={title:`How much is AWS Lambda?`,description:`Learn how AWS Lambda pricing works, including charges for compute time (per GB-second) and number of requests, with examples and cost breakdowns.`,authors:[{name:`Kenny Ning`,jobTitle:`Growth Engineer`,avatarUrl:`https://modal-cdn.com/kenny-ning.jpg`}],date:`2025-05-16T12:00:00.000Z`,length:`2 minute read`,category:`Article`,subcategory:`Serverless`,published:!0,layout:`blog`,toc:[{depth:2,value:`How AWS Lambda pricing works`,id:`how-aws-lambda-pricing-works`,children:[{depth:3,value:`Compute Time`,id:`compute-time`},{depth:3,value:`Requests`,id:`requests`},{depth:3,value:`Additional charges`,id:`additional-charges`}]},{depth:2,value:`Example`,id:`example`},{depth:2,value:`Comparison with Modal`,id:`comparison-with-modal`},{depth:2,value:`Conclusion`,id:`conclusion`}],rawContent:`AWS Lambda is the most well-known serverless product on the market. The way it works is it lets you publish code as a Lambda function that gets triggered by some event (e.g. an object appears in an S3 bucket).

AWS Lambda charges you based on what you use. This can be nice for running bursty, unpredictable workloads especially compared to using EC2 where you may be over / under-provisioned at any given moment.

## How AWS Lambda pricing works

AWS Lambda charges [per GB per second](https://aws.amazon.com/lambda/pricing/) of compute time plus number of requests.

|              | Cost                  | Free per month     |
| ------------ | --------------------- | ------------------ |
| Compute time | $0.0000166667 / GB-s  | 400,000 GB-s       |
| Requests     | $0.20 per 1M requests | 1 million requests |

### Compute Time

AWS Lambda pricing starts at $0.0000166667 per GB per second of runtime (GB-s). This assumes an x86 instance running in us-east-1.

This base rate card decreases as compute goes up. For example, if you exceed 6 billion GB-seconds per month, successive compute gets billed at $0.000015 per GB-second.

Your first 400,000 GB-s per month are free.

### Requests

On top of compute time, AWS Lambda also charges $0.20 per 1 million requests. Your first 1 million requests are free.

### Additional charges

There are other charges you may incur, including ephemeral storage, provisioned concurrency, and data transfer across regions / clouds.

## Example

Let's say you have a Lambda function that process JSON data in a file and gets triggered every time a file appears in an S3 bucket:

- Number of requests per month: 2M
- Average compute time per job: 1 second
- 10GB memory required

Compute seconds = 2M \\* 1 second = 2M

GB-seconds = 2M compute seconds \\* 10 GB = 20M

Compute cost = (20M - 400,000) \\* $0.0000166667 = $326.67

Request cost = (2M - 1M) \\* $0.20 = $0.20

Total cost = **$326.87 per month**

## Comparison with Modal

Modal charges for CPU cores and memory separately as opposed to a single GB-second $ rate. If we know that a 1.8 GB Lambda function is [equal to one vCPU](https://docs.aws.amazon.com/lambda/latest/dg/configuration-memory.html), then we can infer the above example to use 5.6 vCPUs = 2.8 physical CPU cores on Modal.

So the cost of the above example on Modal would look like:

- CPU cost: 2.8 \\* $0.0000131 \\* 2M compute seconds = $73.36
- Memory cost: 10GB \\* $0.00000222 \\* 2M = $44.4
- Total cost = $117.76 - $30 free credits = **$87.76 per month**

Moving the workload above to Modal from Lambda would reduce your cost by 73%. On top of that, Modal does not charge for number of requests.

## Conclusion

AWS Lambda charges per GB per second of compute time plus number of requests.

While AWS Lambda is the de-facto incumbent in the serverless space, its pricing model is unnecessarily complicated and you can probably find better rates on pure serverless providers like Modal.
`,meta:{description:`Learn how AWS Lambda pricing works, including charges for compute time (per GB-second) and number of requests, with examples and cost breakdowns.`}},{title:m,description:h,authors:g,date:_,length:v,category:y,subcategory:b,published:x,layout:S,toc:C,rawContent:w,meta:T}=p,E=t(`<thead><tr><th></th><th>Cost</th><th>Free per month</th></tr></thead> <tbody><tr><td>Compute time</td><td>$0.0000166667 / GB-s</td><td>400,000 GB-s</td></tr><tr><td>Requests</td><td>$0.20 per 1M requests</td><td>1 million requests</td></tr></tbody>`,1),D=t(`<p>AWS Lambda is the most well-known serverless product on the market. The way it works is it lets you publish code as a Lambda function that gets triggered by some event (e.g. an object appears in an S3 bucket).</p> <p>AWS Lambda charges you based on what you use. This can be nice for running bursty, unpredictable workloads especially compared to using EC2 where you may be over / under-provisioned at any given moment.</p> <h2 id="how-aws-lambda-pricing-works">How AWS Lambda pricing works</h2> <p>AWS Lambda charges <!> of compute time plus number of requests.</p> <!> <h3 id="compute-time">Compute Time</h3> <p>AWS Lambda pricing starts at $0.0000166667 per GB per second of runtime (GB-s). This assumes an x86 instance running in us-east-1.</p> <p>This base rate card decreases as compute goes up. For example, if you exceed 6 billion GB-seconds per month, successive compute gets billed at $0.000015 per GB-second.</p> <p>Your first 400,000 GB-s per month are free.</p> <h3 id="requests">Requests</h3> <p>On top of compute time, AWS Lambda also charges $0.20 per 1 million requests. Your first 1 million requests are free.</p> <h3 id="additional-charges">Additional charges</h3> <p>There are other charges you may incur, including ephemeral storage, provisioned concurrency, and data transfer across regions / clouds.</p> <h2 id="example">Example</h2> <p>Let’s say you have a Lambda function that process JSON data in a file and gets triggered every time a file appears in an S3 bucket:</p> <ul><li>Number of requests per month: 2M</li> <li>Average compute time per job: 1 second</li> <li>10GB memory required</li></ul> <p>Compute seconds = 2M * 1 second = 2M</p> <p>GB-seconds = 2M compute seconds * 10 GB = 20M</p> <p>Compute cost = (20M - 400,000) * $0.0000166667 = $326.67</p> <p>Request cost = (2M - 1M) * $0.20 = $0.20</p> <p>Total cost = <strong>$326.87 per month</strong></p> <h2 id="comparison-with-modal">Comparison with Modal</h2> <p>Modal charges for CPU cores and memory separately as opposed to a single GB-second $ rate. If we know that a 1.8 GB Lambda function is <!>, then we can infer the above example to use 5.6 vCPUs = 2.8 physical CPU cores on Modal.</p> <p>So the cost of the above example on Modal would look like:</p> <ul><li>CPU cost: 2.8 * $0.0000131 * 2M compute seconds = $73.36</li> <li>Memory cost: 10GB * $0.00000222 * 2M = $44.4</li> <li>Total cost = $117.76 - $30 free credits = <strong>$87.76 per month</strong></li></ul> <p>Moving the workload above to Modal from Lambda would reduce your cost by 73%. On top of that, Modal does not charge for number of requests.</p> <h2 id="conclusion">Conclusion</h2> <p>AWS Lambda charges per GB per second of compute time plus number of requests.</p> <p>While AWS Lambda is the de-facto incumbent in the serverless space, its pricing model is unnecessarily complicated and you can probably find better rates on pure serverless providers like Modal.</p>`,1);function O(t,m){let h=a(m,[`children`,`$$slots`,`$$events`,`$$legacy`]);f(t,o(()=>h,()=>p,{children:(t,a)=>{var o=D(),f=c(s(o),6);d(c(e(f)),{href:`https://aws.amazon.com/lambda/pricing/`,rel:`nofollow`,children:(e,t)=>{l(),i(e,r(`per GB per second`))},$$slots:{default:!0}}),l(),n(f);var p=c(f,2);u(p,{children:(e,t)=>{var n=E();l(2),i(e,n)},$$slots:{default:!0}});var m=c(p,36);d(c(e(m)),{href:`https://docs.aws.amazon.com/lambda/latest/dg/configuration-memory.html`,rel:`nofollow`,children:(e,t)=>{l(),i(e,r(`equal to one vCPU`))},$$slots:{default:!0}}),l(),n(m),l(12),i(t,o)},$$slots:{default:!0}}))}export{O as default,p as metadata};
//# sourceMappingURL=nAy6Qf3X2.js.map
