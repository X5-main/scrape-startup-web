(function(){try{var e=typeof window<`u`?window:typeof global<`u`?global:typeof globalThis<`u`?globalThis:typeof self<`u`?self:{};e.SENTRY_RELEASE={id:`f99fcf9f0a844cc9bd13fdc8e5782b84`};var t=new e.Error().stack;t&&(e._sentryDebugIds=e._sentryDebugIds||{},e._sentryDebugIds[t]=`3eaff956-2bb3-4b03-b9d6-4fde77a70f3f`,e._sentryDebugIdIdentifier=`sentry-dbid-3eaff956-2bb3-4b03-b9d6-4fde77a70f3f`)}catch{}})();import{$t as e,St as t,Tn as n,Tt as r,bt as i,c as a,d as o,en as s,tn as c,wn as l}from"./F_ixKBiO.js";import"./B1sc9Zdx.js";import"./Bb2deiU3.js";import{a as u,o as d}from"./CPby7b1n.js";import{t as f}from"./B4L_if842.js";import{t as p}from"./DeWGVqas2.js";var m={toc:[{depth:1,value:`S3 Gateway endpoints`,id:`s3-gateway-endpoints`,children:[{depth:2,value:`Endpoint configuration`,id:`endpoint-configuration`},{depth:2,value:`Inter-region costs`,id:`inter-region-costs`}]}],rawContent:`# S3 Gateway endpoints

When running workloads in AWS, our system automatically uses a corresponding
[S3 Gateway endpoint](https://docs.aws.amazon.com/vpc/latest/privatelink/vpc-endpoints-s3.html)
to ensure low costs, optimal performance, and network reliability between Modal and S3.

Workloads running on Modal should not incur egress or ingress fees associated
with S3 operations. No configuration is needed in order for your app to use S3 Gateway endpoints.
S3 Gateway endpoints are automatically used when your app runs on AWS.

## Endpoint configuration

Only use the region-specific endpoint (\`s3.<region>.amazonaws.com\`) or the
global AWS endpoint (\`s3.amazonaws.com\`). Using an S3 endpoint from one region
in another **will not use the S3 Gateway Endpoint incurring networking costs**.

Avoid specifying regional endpoints manually, as this can lead to unexpected cost
or performance degradation.

## Inter-region costs

S3 Gateway endpoints guarantee no costs for network traffic within the same AWS region.
However, if your Modal Function runs in one region but your bucket resides in a
different region you will be billed for inter-region traffic.

You can prevent this by scheduling your Modal App in the same region of your
S3 bucket with [Region selection](https://modal.com/docs/guide/region-selection#region-selection).
`,meta:{title:`S3 Gateway endpoints`,description:`When running workloads in AWS, our system automatically uses a corresponding S3 Gateway endpoint to ensure low costs, optimal performance, and network reliability between Modal and S3.`}},{toc:h,rawContent:g,meta:_}=m,v=t(`<!> <p>When running workloads in AWS, our system automatically uses a corresponding <!> to ensure low costs, optimal performance, and network reliability between Modal and S3.</p> <p>Workloads running on Modal should not incur egress or ingress fees associated
with S3 operations. No configuration is needed in order for your app to use S3 Gateway endpoints.
S3 Gateway endpoints are automatically used when your app runs on AWS.</p> <!> <p>Only use the region-specific endpoint (<code>s3.&lt;region&gt;.amazonaws.com</code>) or the
global AWS endpoint (<code>s3.amazonaws.com</code>). Using an S3 endpoint from one region
in another <strong>will not use the S3 Gateway Endpoint incurring networking costs</strong>.</p> <p>Avoid specifying regional endpoints manually, as this can lead to unexpected cost
or performance degradation.</p> <!> <p>S3 Gateway endpoints guarantee no costs for network traffic within the same AWS region.
However, if your Modal Function runs in one region but your bucket resides in a
different region you will be billed for inter-region traffic.</p> <p>You can prevent this by scheduling your Modal App in the same region of your
S3 bucket with <!>.</p>`,1);function y(t,h){let g=a(h,[`children`,`$$slots`,`$$events`,`$$legacy`]);f(t,o(()=>g,()=>m,{children:(t,a)=>{var o=v(),f=s(o);d(f,{id:`s3-gateway-endpoints`,children:(e,t)=>{l(),i(e,r(`S3 Gateway endpoints`))},$$slots:{default:!0}});var m=c(f,2);p(c(e(m)),{href:`https://docs.aws.amazon.com/vpc/latest/privatelink/vpc-endpoints-s3.html`,rel:`nofollow`,children:(e,t)=>{l(),i(e,r(`S3 Gateway endpoint`))},$$slots:{default:!0}}),l(),n(m);var h=c(m,4);u(h,{id:`endpoint-configuration`,children:(e,t)=>{l(),i(e,r(`Endpoint configuration`))},$$slots:{default:!0}});var g=c(h,6);u(g,{id:`inter-region-costs`,children:(e,t)=>{l(),i(e,r(`Inter-region costs`))},$$slots:{default:!0}});var _=c(g,4);p(c(e(_)),{href:`https://modal.com/docs/guide/region-selection#region-selection`,rel:`nofollow`,children:(e,t)=>{l(),i(e,r(`Region selection`))},$$slots:{default:!0}}),l(),n(_),i(t,o)},$$slots:{default:!0}}))}export{y as default,m as metadata};
//# sourceMappingURL=BETSmPpo2.js.map
