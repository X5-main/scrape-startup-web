(function(){try{var e=typeof window<`u`?window:typeof global<`u`?global:typeof globalThis<`u`?globalThis:typeof self<`u`?self:{};e.SENTRY_RELEASE={id:`f99fcf9f0a844cc9bd13fdc8e5782b84`};var t=new e.Error().stack;t&&(e._sentryDebugIds=e._sentryDebugIds||{},e._sentryDebugIds[t]=`a9428638-5ad9-4c5f-a542-255e2949ac91`,e._sentryDebugIdIdentifier=`sentry-dbid-a9428638-5ad9-4c5f-a542-255e2949ac91`)}catch{}})();import{$t as e,St as t,Tn as n,Tt as r,bt as i,c as a,d as o,en as s,tn as c,wn as l}from"./F_ixKBiO.js";import"./B1sc9Zdx.js";import"./Bb2deiU3.js";import{t as u}from"./DeWGVqas2.js";import{t as d}from"./CdZDxCfO2.js";var f={title:`Google Cloud Run functions pricing: understanding costs and optimization`,description:`A comprehensive guide to the pricing model for Google Cloud Run functions, including differences between 1st and 2nd gen, CPU and memory allocation, and key pricing metrics. Learn how to optimize your serverless costs.`,authors:[{name:`Yiren Lu`,avatarUrl:`https://modal-cdn.com/ren-lu.jpg`,jobTitle:`Solutions Engineer`,twitterHandle:`YirenLu`}],date:`2024-09-25T12:00:00.000Z`,length:`10 minute read`,category:`Article`,subcategory:`Serverless`,published:!0,layout:`blog`,toc:[{depth:2,value:`First gen vs. second gen functions`,id:`first-gen-vs-second-gen-functions`},{depth:2,value:`First gen functions pricing`,id:`first-gen-functions-pricing`,children:[{depth:3,value:`Understanding GHz-seconds and GB-seconds`,id:`understanding-ghz-seconds-and-gb-seconds`},{depth:3,value:`Pricing example`,id:`pricing-example`}]},{depth:2,value:`Second gen functions pricing`,id:`second-gen-functions-pricing`,children:[{depth:3,value:`Free tier`,id:`free-tier`},{depth:3,value:`Resource allocation`,id:`resource-allocation`},{depth:3,value:`Understanding vCPU-seconds`,id:`understanding-vcpu-seconds`},{depth:3,value:`Pricing example`,id:`pricing-example-1`}]}],rawContent:`[Google Cloud Run functions](https://cloud.google.com/functions) offer a flexible and cost-effective serverless solution for running your code in the cloud. This guide breaks down the pricing model for both first and second generation functions, helping you understand and optimize your costs.

## First gen vs. second gen functions

Google Cloud Run functions come in two generations, each with its own pricing structure:

1. **First gen functions**: The original offering, priced based on invocations, compute time, and networking.
2. **Second gen functions**: Built on Cloud Run, offering more flexibility and features, with pricing based on vCPU, memory, and request count.

While Google recommends using second gen functions for new projects, both generations remain viable options. For a detailed comparison, see the [Cloud Functions version comparison](https://cloud.google.com/functions/docs/concepts/version-comparison) documentation.

## First gen functions pricing

First gen functions are priced based on the following components:

1. **Compute Time**: $0.0000100 per GHz-second
2. **Memory**: $0.0000025 per GB-second
3. **Invocations**: $0.40 per million
4. **Networking**: $0.12 per GB of Internet data transfer out

The cost of the individual components are added together to get the total cost.

Google Cloud offers a generous free tier for first gen functions. For details on the free tier limits, refer to the [official free tier documentation](https://cloud.google.com/functions/pricing-1stgen#free_tier).

For more details, refer to the [official first gen pricing documentation](https://cloud.google.com/functions/pricing-1stgen).

### Understanding GHz-seconds and GB-seconds

For first gen functions, compute time is measured in GHz-seconds, while memory usage is measured in GB-seconds.

- GHz-seconds: The product of the CPU clock speed (in GHz) and the execution time (in seconds).
- GB-seconds: The product of the allocated memory (in GB) and the execution time (in seconds).

Examples:

- A 2.0 GHz CPU used for 1 second = 2 GHz-seconds
- A 2.4 GHz CPU used for 30 seconds = 72 GHz-seconds
- 256 MB (0.25 GB) of memory used for 1 second = 0.25 GB-seconds
- 1 GB of memory used for 30 seconds = 30 GB-seconds

### Pricing example

Let's say your first gen function runs for 200ms on a 2.4 GHz CPU with 256 MB (0.25 GB) of allocated memory:

1. Compute Time: (2.4 GHz x 0.2 seconds) x ($0.0000100 / GHz-second) = $0.0000048
2. Memory: (0.25 GB x 0.2 seconds) x ($0.0000025 / GB-second) = $0.000000125
3. If this is the 2,000,001st invocation of the month, you'd also pay $0.0000004 for the invocation

## Second gen functions pricing

Second gen functions are priced based on:

1. **vCPU usage**: $0.00002400 per vCPU-second
2. **Memory usage**: $0.0000025 per GB-second
3. **Invocations**: $0.40 per million
4. **Networking**: $0.12 per GB

### Free tier

Google Cloud offers a generous free tier for second gen functions. For details on the free tier limits, refer to the [official free tier documentation](https://cloud.google.com/free/docs/free-cloud-features#cloud-functions).

For more details, refer to the [official second gen pricing documentation](https://cloud.google.com/functions/pricing#gen2).

### Resource allocation

With second gen functions, you can specify both CPU and memory:

- **vCPU**: Choose from 0.08 to 8 vCPUs
- **Memory**: Allocate from 128MB to 32GB

This granular control allows you to optimize performance and cost for your specific workloads.

### Understanding vCPU-seconds

**vCPU-second**:

A vCPU (virtual CPU) is a unit of computing power in cloud environments. In Google Cloud Run functions, a vCPU typically represents a hardware hyper-thread, which is approximately equivalent to half of a physical CPU core. This means that 2 vCPUs would roughly correspond to one full physical CPU core. The exact performance can vary depending on the underlying hardware and workload characteristics. vCPUs allow for flexible resource allocation and can be easily scaled up or down based on workload requirements, with Cloud Run functions offering options from 0.08 to 8 vCPUs per instance.

A vCPU-second measures the amount of virtual CPU time consumed by your function. It's calculated by multiplying the number of vCPUs allocated to your function by the execution time.

Examples:

- 1 vCPU used for 1 second = 1 vCPU-second
- 2 vCPUs used for 30 seconds = 60 vCPU-seconds

### Pricing example

Let's say your second gen function uses 1 vCPU and 2 GB of memory, and runs for 500ms:

1. vCPU cost: 1 vCPU x 0.5 seconds x $0.00002400 per vCPU-second = $0.000012
2. Memory cost: 2 GB x 0.5 seconds x $0.0000025 per GB-second = $0.0000025
3. Invocation cost: $0.40 / 1,000,000 = $0.0000004

Total cost for this execution: $0.0000149

Note: Prices may vary by region. Always check the [official Google Cloud pricing page](https://cloud.google.com/functions/pricing) for the most up-to-date information.
`,meta:{description:`A comprehensive guide to the pricing model for Google Cloud Run functions, including differences between 1st and 2nd gen, CPU and memory allocation, and key pricing metrics. Learn how to optimize your serverless costs.`}},{title:p,description:m,authors:h,date:g,length:_,category:v,subcategory:y,published:b,layout:x,toc:S,rawContent:C,meta:w}=f,T=t(`<p><!> offer a flexible and cost-effective serverless solution for running your code in the cloud. This guide breaks down the pricing model for both first and second generation functions, helping you understand and optimize your costs.</p> <h2 id="first-gen-vs-second-gen-functions">First gen vs. second gen functions</h2> <p>Google Cloud Run functions come in two generations, each with its own pricing structure:</p> <ol><li><strong>First gen functions</strong>: The original offering, priced based on invocations, compute time, and networking.</li> <li><strong>Second gen functions</strong>: Built on Cloud Run, offering more flexibility and features, with pricing based on vCPU, memory, and request count.</li></ol> <p>While Google recommends using second gen functions for new projects, both generations remain viable options. For a detailed comparison, see the <!> documentation.</p> <h2 id="first-gen-functions-pricing">First gen functions pricing</h2> <p>First gen functions are priced based on the following components:</p> <ol><li><strong>Compute Time</strong>: $0.0000100 per GHz-second</li> <li><strong>Memory</strong>: $0.0000025 per GB-second</li> <li><strong>Invocations</strong>: $0.40 per million</li> <li><strong>Networking</strong>: $0.12 per GB of Internet data transfer out</li></ol> <p>The cost of the individual components are added together to get the total cost.</p> <p>Google Cloud offers a generous free tier for first gen functions. For details on the free tier limits, refer to the <!>.</p> <p>For more details, refer to the <!>.</p> <h3 id="understanding-ghz-seconds-and-gb-seconds">Understanding GHz-seconds and GB-seconds</h3> <p>For first gen functions, compute time is measured in GHz-seconds, while memory usage is measured in GB-seconds.</p> <ul><li>GHz-seconds: The product of the CPU clock speed (in GHz) and the execution time (in seconds).</li> <li>GB-seconds: The product of the allocated memory (in GB) and the execution time (in seconds).</li></ul> <p>Examples:</p> <ul><li>A 2.0 GHz CPU used for 1 second = 2 GHz-seconds</li> <li>A 2.4 GHz CPU used for 30 seconds = 72 GHz-seconds</li> <li>256 MB (0.25 GB) of memory used for 1 second = 0.25 GB-seconds</li> <li>1 GB of memory used for 30 seconds = 30 GB-seconds</li></ul> <h3 id="pricing-example">Pricing example</h3> <p>Let’s say your first gen function runs for 200ms on a 2.4 GHz CPU with 256 MB (0.25 GB) of allocated memory:</p> <ol><li>Compute Time: (2.4 GHz x 0.2 seconds) x ($0.0000100 / GHz-second) = $0.0000048</li> <li>Memory: (0.25 GB x 0.2 seconds) x ($0.0000025 / GB-second) = $0.000000125</li> <li>If this is the 2,000,001st invocation of the month, you’d also pay $0.0000004 for the invocation</li></ol> <h2 id="second-gen-functions-pricing">Second gen functions pricing</h2> <p>Second gen functions are priced based on:</p> <ol><li><strong>vCPU usage</strong>: $0.00002400 per vCPU-second</li> <li><strong>Memory usage</strong>: $0.0000025 per GB-second</li> <li><strong>Invocations</strong>: $0.40 per million</li> <li><strong>Networking</strong>: $0.12 per GB</li></ol> <h3 id="free-tier">Free tier</h3> <p>Google Cloud offers a generous free tier for second gen functions. For details on the free tier limits, refer to the <!>.</p> <p>For more details, refer to the <!>.</p> <h3 id="resource-allocation">Resource allocation</h3> <p>With second gen functions, you can specify both CPU and memory:</p> <ul><li><strong>vCPU</strong>: Choose from 0.08 to 8 vCPUs</li> <li><strong>Memory</strong>: Allocate from 128MB to 32GB</li></ul> <p>This granular control allows you to optimize performance and cost for your specific workloads.</p> <h3 id="understanding-vcpu-seconds">Understanding vCPU-seconds</h3> <p><strong>vCPU-second</strong>:</p> <p>A vCPU (virtual CPU) is a unit of computing power in cloud environments. In Google Cloud Run functions, a vCPU typically represents a hardware hyper-thread, which is approximately equivalent to half of a physical CPU core. This means that 2 vCPUs would roughly correspond to one full physical CPU core. The exact performance can vary depending on the underlying hardware and workload characteristics. vCPUs allow for flexible resource allocation and can be easily scaled up or down based on workload requirements, with Cloud Run functions offering options from 0.08 to 8 vCPUs per instance.</p> <p>A vCPU-second measures the amount of virtual CPU time consumed by your function. It’s calculated by multiplying the number of vCPUs allocated to your function by the execution time.</p> <p>Examples:</p> <ul><li>1 vCPU used for 1 second = 1 vCPU-second</li> <li>2 vCPUs used for 30 seconds = 60 vCPU-seconds</li></ul> <h3 id="pricing-example-1">Pricing example</h3> <p>Let’s say your second gen function uses 1 vCPU and 2 GB of memory, and runs for 500ms:</p> <ol><li>vCPU cost: 1 vCPU x 0.5 seconds x $0.00002400 per vCPU-second = $0.000012</li> <li>Memory cost: 2 GB x 0.5 seconds x $0.0000025 per GB-second = $0.0000025</li> <li>Invocation cost: $0.40 / 1,000,000 = $0.0000004</li></ol> <p>Total cost for this execution: $0.0000149</p> <p>Note: Prices may vary by region. Always check the <!> for the most up-to-date information.</p>`,1);function E(t,p){let m=a(p,[`children`,`$$slots`,`$$events`,`$$legacy`]);d(t,o(()=>m,()=>f,{children:(t,a)=>{var o=T(),d=s(o);u(e(d),{href:`https://cloud.google.com/functions`,rel:`nofollow`,children:(e,t)=>{l(),i(e,r(`Google Cloud Run functions`))},$$slots:{default:!0}}),l(),n(d);var f=c(d,8);u(c(e(f)),{href:`https://cloud.google.com/functions/docs/concepts/version-comparison`,rel:`nofollow`,children:(e,t)=>{l(),i(e,r(`Cloud Functions version comparison`))},$$slots:{default:!0}}),l(),n(f);var p=c(f,10);u(c(e(p)),{href:`https://cloud.google.com/functions/pricing-1stgen#free_tier`,rel:`nofollow`,children:(e,t)=>{l(),i(e,r(`official free tier documentation`))},$$slots:{default:!0}}),l(),n(p);var m=c(p,2);u(c(e(m)),{href:`https://cloud.google.com/functions/pricing-1stgen`,rel:`nofollow`,children:(e,t)=>{l(),i(e,r(`official first gen pricing documentation`))},$$slots:{default:!0}}),l(),n(m);var h=c(m,26);u(c(e(h)),{href:`https://cloud.google.com/free/docs/free-cloud-features#cloud-functions`,rel:`nofollow`,children:(e,t)=>{l(),i(e,r(`official free tier documentation`))},$$slots:{default:!0}}),l(),n(h);var g=c(h,2);u(c(e(g)),{href:`https://cloud.google.com/functions/pricing#gen2`,rel:`nofollow`,children:(e,t)=>{l(),i(e,r(`official second gen pricing documentation`))},$$slots:{default:!0}}),l(),n(g);var _=c(g,30);u(c(e(_)),{href:`https://cloud.google.com/functions/pricing`,rel:`nofollow`,children:(e,t)=>{l(),i(e,r(`official Google Cloud pricing page`))},$$slots:{default:!0}}),l(),n(_),i(t,o)},$$slots:{default:!0}}))}export{E as default,f as metadata};
//# sourceMappingURL=B9bIzikC.js.map
