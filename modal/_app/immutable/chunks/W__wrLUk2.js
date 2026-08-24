(function(){try{var e=typeof window<`u`?window:typeof global<`u`?global:typeof globalThis<`u`?globalThis:typeof self<`u`?self:{};e.SENTRY_RELEASE={id:`f99fcf9f0a844cc9bd13fdc8e5782b84`};var t=new e.Error().stack;t&&(e._sentryDebugIds=e._sentryDebugIds||{},e._sentryDebugIds[t]=`5f36e877-7483-4910-972c-690c85a75631`,e._sentryDebugIdIdentifier=`sentry-dbid-5f36e877-7483-4910-972c-690c85a75631`)}catch{}})();import{$t as e,St as t,Tn as n,Tt as r,bt as i,c as a,d as o,en as s,tn as c,wn as l}from"./F_ixKBiO.js";import"./B1sc9Zdx.js";import"./Bb2deiU3.js";import{n as u}from"./JPsrybyr.js";import{t as d}from"./DeWGVqas2.js";import{t as f}from"./CdZDxCfO2.js";var p={title:`Azure Functions pricing: Consumption vs. Flex Consumption`,description:`Learn about Azure Functions pricing models - comparing the original Consumption plan with the newer Flex Consumption plan, including detailed pricing breakdowns and examples`,authors:[{name:`Kenny Ning`,jobTitle:`Growth Engineer`,avatarUrl:`https://modal-cdn.com/kenny-ning.jpg`,twitterHandle:`kenny_ning`}],date:`2025-05-22T12:00:00.000Z`,length:`7 minute read`,category:`Article`,subcategory:`Serverless`,published:!0,layout:`blog`,toc:[{depth:2,value:`Consumption vs. Flex Consumption`,id:`consumption-vs-flex-consumption`},{depth:2,value:`Consumption plan pricing`,id:`consumption-plan-pricing`,children:[{depth:3,value:`Pricing example`,id:`pricing-example`}]},{depth:2,value:`Flex Consumption plan pricing`,id:`flex-consumption-plan-pricing`,children:[{depth:3,value:`Resource allocation`,id:`resource-allocation`},{depth:3,value:`Flex Consumption pricing example`,id:`flex-consumption-pricing-example`}]}],rawContent:`[Azure Functions](https://azure.microsoft.com/en-us/products/functions) is a flexible and cost-effective serverless solution for running your code in the cloud. This guide breaks down the differences between the two main plans: Consumption and Flex Consumption.

## Consumption vs. Flex Consumption

Azure Functions comes in two pay as you go plans:

1. **Consumption plan**: The original offering, priced based on function execution time and total number of executions.
2. **Flex Consumption plan**: [Azure's newer offering](https://learn.microsoft.com/en-us/azure/azure-functions/flex-consumption-plan) with more flexibility and features, including "Always Ready" instances, memory configuration, and virtual network integration.

Overall, the Flex Consumption plan is slightly more expensive than the base Consumption Plan but offers more features and better functionality. Azure officially recommends this plan over the original Consumption plan.

## Consumption plan pricing

Consumption plan Azure Functions are [priced](https://azure.microsoft.com/en-us/pricing/details/functions/) based on the following components (East US region):

1. **Execution Time**: $0.000016 per GB-second (first 400,000 GB-s per month free)
2. **Total executions**: $0.20 per million executions (first 1 million executions per month free)

The cost of the individual components are added together to get the total cost.

Instance sizes are non-configurable and limited to 1.5 GB.

Interestingly, this pricing model and rates are identical to [AWS Lambda pricing](/blog/aws-lambda-price-article).

### Pricing example

Let's say your function runs 3 million times per month for 1 second each time:

|                         | Calculation                              | Total          |
| ----------------------- | ---------------------------------------- | -------------- |
| Execution Time          | 3 million executions x 1 second x 1.5 GB | 4,500,000 GB-s |
| Billable Execution Time | 4,500,000 GB-s - 400,000 GB-s            | 4,100,000 GB-s |
| Execution Time Cost     | 4,100,000 GB-s x $0.000016               | **$65.60**     |
| Billable Executions     | 3 million - 1 million                    | 2 million      |
| Executions Cost         | 2 x $0.20                                | **$0.40**      |
| Total Cost              | $65.50 + $0.40                           | **$66.00**     |

## Flex Consumption plan pricing

Like the base Consumption plan, Flex Consumption charges by Execution Time and Total Executions, but at higher base rates.

1. **Execution Time**: $0.000026 per GB-second (first 100,000 GB-s per month free)
2. **Total Executions**: $0.40 per million executions (first 1 million executions per month free)

If you use the Always Ready feature (pre-provisioned instances), the pricing is slightly different:

1. **Baseline**: $0.000004 per GB-second (first 100,000 GB-s per month free)
2. **Execution Time**: $0.000016 per GB-second
3. **Total Executions**: $0.40 per million executions

You will be billed at the "Baseline" rate based on the memory you select, even for idle time.

### Resource allocation

The [default instance size](https://learn.microsoft.com/en-us/azure/azure-functions/flex-consumption-plan#instance-memory) is 2,048 MB (2 GiB). The other options are 512 MB and 4,096 MB.

### Flex Consumption pricing example

Let's say your function runs for 1 second with 2,048 MB of allocated memory 3 million times per month, but with Always Ready enabled. Note that with Always Ready enabled, there is no free grant.

|                     | Calculation                             | Total          |
| ------------------- | --------------------------------------- | -------------- |
| Baseline Time       | 2,592,000 seconds (30 day month) x 2 GB | 5,184,000 GB-s |
| Baseline Cost       | 5,184,000 GB-s x $0.000004              | **$20.74**     |
| Execution Time      | 3 million executions x 1 second x 2 GB  | 6,000,000 GB-s |
| Execution Time Cost | 6,000,000 GB-s x $0.000016              | **$96.00**     |
| Executions Cost     | 3 x $0.40                               | **$1.20**      |
| Total Cost          | $20.74 + $96.00 + $1.20                 | **$117.94**    |
`,meta:{description:`Learn about Azure Functions pricing models - comparing the original Consumption plan with the newer Flex Consumption plan, including detailed pricing breakdowns and examples`}},{title:m,description:h,authors:g,date:_,length:v,category:y,subcategory:b,published:x,layout:S,toc:C,rawContent:w,meta:T}=p,E=t(`<thead><tr><th></th><th>Calculation</th><th>Total</th></tr></thead> <tbody><tr><td>Execution Time</td><td>3 million executions x 1 second x 1.5 GB</td><td>4,500,000 GB-s</td></tr><tr><td>Billable Execution Time</td><td>4,500,000 GB-s - 400,000 GB-s</td><td>4,100,000 GB-s</td></tr><tr><td>Execution Time Cost</td><td>4,100,000 GB-s x $0.000016</td><td><strong>$65.60</strong></td></tr><tr><td>Billable Executions</td><td>3 million - 1 million</td><td>2 million</td></tr><tr><td>Executions Cost</td><td>2 x $0.20</td><td><strong>$0.40</strong></td></tr><tr><td>Total Cost</td><td>$65.50 + $0.40</td><td><strong>$66.00</strong></td></tr></tbody>`,1),D=t(`<thead><tr><th></th><th>Calculation</th><th>Total</th></tr></thead> <tbody><tr><td>Baseline Time</td><td>2,592,000 seconds (30 day month) x 2 GB</td><td>5,184,000 GB-s</td></tr><tr><td>Baseline Cost</td><td>5,184,000 GB-s x $0.000004</td><td><strong>$20.74</strong></td></tr><tr><td>Execution Time</td><td>3 million executions x 1 second x 2 GB</td><td>6,000,000 GB-s</td></tr><tr><td>Execution Time Cost</td><td>6,000,000 GB-s x $0.000016</td><td><strong>$96.00</strong></td></tr><tr><td>Executions Cost</td><td>3 x $0.40</td><td><strong>$1.20</strong></td></tr><tr><td>Total Cost</td><td>$20.74 + $96.00 + $1.20</td><td><strong>$117.94</strong></td></tr></tbody>`,1),O=t(`<p><!> is a flexible and cost-effective serverless solution for running your code in the cloud. This guide breaks down the differences between the two main plans: Consumption and Flex Consumption.</p> <h2 id="consumption-vs-flex-consumption">Consumption vs. Flex Consumption</h2> <p>Azure Functions comes in two pay as you go plans:</p> <ol><li><strong>Consumption plan</strong>: The original offering, priced based on function execution time and total number of executions.</li> <li><strong>Flex Consumption plan</strong>: <!> with more flexibility and features, including “Always Ready” instances, memory configuration, and virtual network integration.</li></ol> <p>Overall, the Flex Consumption plan is slightly more expensive than the base Consumption Plan but offers more features and better functionality. Azure officially recommends this plan over the original Consumption plan.</p> <h2 id="consumption-plan-pricing">Consumption plan pricing</h2> <p>Consumption plan Azure Functions are <!> based on the following components (East US region):</p> <ol><li><strong>Execution Time</strong>: $0.000016 per GB-second (first 400,000 GB-s per month free)</li> <li><strong>Total executions</strong>: $0.20 per million executions (first 1 million executions per month free)</li></ol> <p>The cost of the individual components are added together to get the total cost.</p> <p>Instance sizes are non-configurable and limited to 1.5 GB.</p> <p>Interestingly, this pricing model and rates are identical to <!>.</p> <h3 id="pricing-example">Pricing example</h3> <p>Let’s say your function runs 3 million times per month for 1 second each time:</p> <!> <h2 id="flex-consumption-plan-pricing">Flex Consumption plan pricing</h2> <p>Like the base Consumption plan, Flex Consumption charges by Execution Time and Total Executions, but at higher base rates.</p> <ol><li><strong>Execution Time</strong>: $0.000026 per GB-second (first 100,000 GB-s per month free)</li> <li><strong>Total Executions</strong>: $0.40 per million executions (first 1 million executions per month free)</li></ol> <p>If you use the Always Ready feature (pre-provisioned instances), the pricing is slightly different:</p> <ol><li><strong>Baseline</strong>: $0.000004 per GB-second (first 100,000 GB-s per month free)</li> <li><strong>Execution Time</strong>: $0.000016 per GB-second</li> <li><strong>Total Executions</strong>: $0.40 per million executions</li></ol> <p>You will be billed at the “Baseline” rate based on the memory you select, even for idle time.</p> <h3 id="resource-allocation">Resource allocation</h3> <p>The <!> is 2,048 MB (2 GiB). The other options are 512 MB and 4,096 MB.</p> <h3 id="flex-consumption-pricing-example">Flex Consumption pricing example</h3> <p>Let’s say your function runs for 1 second with 2,048 MB of allocated memory 3 million times per month, but with Always Ready enabled. Note that with Always Ready enabled, there is no free grant.</p> <!>`,1);function k(t,m){let h=a(m,[`children`,`$$slots`,`$$events`,`$$legacy`]);f(t,o(()=>h,()=>p,{children:(t,a)=>{var o=O(),f=s(o);d(e(f),{href:`https://azure.microsoft.com/en-us/products/functions`,rel:`nofollow`,children:(e,t)=>{l(),i(e,r(`Azure Functions`))},$$slots:{default:!0}}),l(),n(f);var p=c(f,6),m=c(e(p),2);d(c(e(m),2),{href:`https://learn.microsoft.com/en-us/azure/azure-functions/flex-consumption-plan`,rel:`nofollow`,children:(e,t)=>{l(),i(e,r(`Azure’s newer offering`))},$$slots:{default:!0}}),l(),n(m),n(p);var h=c(p,6);d(c(e(h)),{href:`https://azure.microsoft.com/en-us/pricing/details/functions/`,rel:`nofollow`,children:(e,t)=>{l(),i(e,r(`priced`))},$$slots:{default:!0}}),l(),n(h);var g=c(h,8);d(c(e(g)),{href:`/blog/aws-lambda-price-article`,children:(e,t)=>{l(),i(e,r(`AWS Lambda pricing`))},$$slots:{default:!0}}),l(),n(g);var _=c(g,6);u(_,{children:(e,t)=>{var n=E();l(2),i(e,n)},$$slots:{default:!0}});var v=c(_,16);d(c(e(v)),{href:`https://learn.microsoft.com/en-us/azure/azure-functions/flex-consumption-plan#instance-memory`,rel:`nofollow`,children:(e,t)=>{l(),i(e,r(`default instance size`))},$$slots:{default:!0}}),l(),n(v),u(c(v,6),{children:(e,t)=>{var n=D();l(2),i(e,n)},$$slots:{default:!0}}),i(t,o)},$$slots:{default:!0}}))}export{k as default,p as metadata};
//# sourceMappingURL=W__wrLUk2.js.map
