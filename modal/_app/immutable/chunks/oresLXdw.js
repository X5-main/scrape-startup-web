(function(){try{var e=typeof window<`u`?window:typeof global<`u`?global:typeof globalThis<`u`?globalThis:typeof self<`u`?self:{};e.SENTRY_RELEASE={id:`f99fcf9f0a844cc9bd13fdc8e5782b84`};var t=new e.Error().stack;t&&(e._sentryDebugIds=e._sentryDebugIds||{},e._sentryDebugIds[t]=`e2956036-e7a3-4fd5-a10f-20b3affd4455`,e._sentryDebugIdIdentifier=`sentry-dbid-e2956036-e7a3-4fd5-a10f-20b3affd4455`)}catch{}})();import{$t as e,St as t,Tn as n,Tt as r,bt as i,c as a,d as o,en as s,tn as c,wn as l}from"./F_ixKBiO.js";import"./B1sc9Zdx.js";import"./Bb2deiU3.js";import{a as u,o as d}from"./CPby7b1n.js";import{n as f}from"./JPsrybyr.js";import{t as p}from"./B4L_if842.js";import{t as m}from"./DeWGVqas2.js";var h={description:`How Modal meters and bills network egress from your workloads`,toc:[{depth:1,value:`Network egress billing`,id:`network-egress-billing`,children:[{depth:2,value:`What is egress pricing?`,id:`what-is-egress-pricing`},{depth:2,value:`What is the pricing?`,id:`what-is-the-pricing`},{depth:2,value:`How can I see my egress usage?`,id:`how-can-i-see-my-egress-usage`},{depth:2,value:`Is the allowance applied separately to each Environment?`,id:`is-the-allowance-applied-separately-to-each-environment`},{depth:2,value:`What is the timeline for these changes?`,id:`what-is-the-timeline-for-these-changes`},{depth:2,value:`Do writes to Modal Volumes count as network egress?`,id:`do-writes-to-modal-volumes-count-as-network-egress`},{depth:2,value:`How can I lower my egress usage?`,id:`how-can-i-lower-my-egress-usage`}]}],rawContent:`# Network egress billing

## What is egress pricing?

Starting October 1, 2026, Modal charges for network egress. Network egress is
outbound network traffic measured from your Modal tasks. This includes traffic
sent through a container's network interface, private network traffic sent
directly to other Modal containers, and uploads through
[Cloud Bucket Mounts](/docs/guide/cloud-bucket-mounts). Reads from and writes to
Modal [Volumes](/docs/guide/volumes) do not count as network egress.

## What is the pricing?

| Plan       | Included per billing cycle | Additional egress |
| ---------- | -------------------------- | ----------------- |
| Starter    | 1 TB                       | $0.04 per GB      |
| Team       | 10 TB                      | $0.04 per GB      |
| Enterprise | 100 TB                     | $0.04 per GB      |

Every plan includes an egress allowance each billing cycle before charges apply.
Egress beyond the included amount is billed at $0.04 per GB.

## How can I see my egress usage?

Visit the [Usage & Billing](/settings/usage) page to see your current usage. The
page shows daily egress for the whole Workspace, and lets you break it down by
Environment. Access to egress data through the CLI and SDK is coming soon.

## Is the allowance applied separately to each Environment?

No. The allowance applies once to total egress across the entire Workspace.
Environment filters on the Usage & Billing page show how much usage occurred in
a particular Environment, but they do not provide a separate allowance or an
independent charge estimate. To see the estimated Workspace charge, select all
Environments.

## What is the timeline for these changes?

Starting September 1, 2026, network egress usage appears live on your Usage &
Billing page, including your daily egress amount and estimated charge. You are
not charged for egress in September.

Starting October 1, 2026, egress is charged. Your first bill including egress
arrives on November 1, 2026.

## Do writes to Modal Volumes count as network egress?

No. Reads from and writes to Modal Volumes do not count as network egress.

Transferring that data elsewhere — for example, uploading it from a Modal
Function to an external API or object store — does count as egress. Reusing data
stored in a Volume can avoid repeated external transfers.

## How can I lower my egress usage?

Focus on bytes your workloads send through direct network connections:

- Compress large uploads to external APIs and object storage.
- Remove unnecessary response fields, paginate large results, and avoid
  duplicate uploads or retries.
- Cache models, datasets, or dependencies in Images or Volumes to reduce
  repeated downloads and startup time. Because downloads are ingress, this does
  not by itself reduce metered egress.
- Cloud Bucket Mount uploads count as egress. Downloads are primarily ingress,
  although outbound request and protocol bytes may still be measured.
- Keep producer and consumer logic in the same process or container when
  practical, so intermediate data does not cross a network interface.
- Avoid uploading intermediate artifacts to an external service only for another
  Modal task to download them again.
`,meta:{title:`Network egress billing`,description:`How Modal meters and bills network egress from your workloads`}},{description:g,toc:_,rawContent:v,meta:y}=h,b=t(`<thead><tr><th>Plan</th><th>Included per billing cycle</th><th>Additional egress</th></tr></thead> <tbody><tr><td>Starter</td><td>1 TB</td><td>$0.04 per GB</td></tr><tr><td>Team</td><td>10 TB</td><td>$0.04 per GB</td></tr><tr><td>Enterprise</td><td>100 TB</td><td>$0.04 per GB</td></tr></tbody>`,1),x=t(`<!> <!> <p>Starting October 1, 2026, Modal charges for network egress. Network egress is
outbound network traffic measured from your Modal tasks. This includes traffic
sent through a container’s network interface, private network traffic sent
directly to other Modal containers, and uploads through <!>. Reads from and writes to
Modal <!> do not count as network egress.</p> <!> <!> <p>Every plan includes an egress allowance each billing cycle before charges apply.
Egress beyond the included amount is billed at $0.04 per GB.</p> <!> <p>Visit the <!> page to see your current usage. The
page shows daily egress for the whole Workspace, and lets you break it down by
Environment. Access to egress data through the CLI and SDK is coming soon.</p> <!> <p>No. The allowance applies once to total egress across the entire Workspace.
Environment filters on the Usage & Billing page show how much usage occurred in
a particular Environment, but they do not provide a separate allowance or an
independent charge estimate. To see the estimated Workspace charge, select all
Environments.</p> <!> <p>Starting September 1, 2026, network egress usage appears live on your Usage &
Billing page, including your daily egress amount and estimated charge. You are
not charged for egress in September.</p> <p>Starting October 1, 2026, egress is charged. Your first bill including egress
arrives on November 1, 2026.</p> <!> <p>No. Reads from and writes to Modal Volumes do not count as network egress.</p> <p>Transferring that data elsewhere — for example, uploading it from a Modal
Function to an external API or object store — does count as egress. Reusing data
stored in a Volume can avoid repeated external transfers.</p> <!> <p>Focus on bytes your workloads send through direct network connections:</p> <ul><li>Compress large uploads to external APIs and object storage.</li> <li>Remove unnecessary response fields, paginate large results, and avoid
duplicate uploads or retries.</li> <li>Cache models, datasets, or dependencies in Images or Volumes to reduce
repeated downloads and startup time. Because downloads are ingress, this does
not by itself reduce metered egress.</li> <li>Cloud Bucket Mount uploads count as egress. Downloads are primarily ingress,
although outbound request and protocol bytes may still be measured.</li> <li>Keep producer and consumer logic in the same process or container when
practical, so intermediate data does not cross a network interface.</li> <li>Avoid uploading intermediate artifacts to an external service only for another
Modal task to download them again.</li></ul>`,1);function S(t,g){let _=a(g,[`children`,`$$slots`,`$$events`,`$$legacy`]);p(t,o(()=>_,()=>h,{children:(t,a)=>{var o=x(),p=s(o);d(p,{id:`network-egress-billing`,children:(e,t)=>{l(),i(e,r(`Network egress billing`))},$$slots:{default:!0}});var h=c(p,2);u(h,{id:`what-is-egress-pricing`,children:(e,t)=>{l(),i(e,r(`What is egress pricing?`))},$$slots:{default:!0}});var g=c(h,2),_=c(e(g));m(_,{href:`/docs/guide/cloud-bucket-mounts`,children:(e,t)=>{l(),i(e,r(`Cloud Bucket Mounts`))},$$slots:{default:!0}}),m(c(_,2),{href:`/docs/guide/volumes`,children:(e,t)=>{l(),i(e,r(`Volumes`))},$$slots:{default:!0}}),l(),n(g);var v=c(g,2);u(v,{id:`what-is-the-pricing`,children:(e,t)=>{l(),i(e,r(`What is the pricing?`))},$$slots:{default:!0}});var y=c(v,2);f(y,{children:(e,t)=>{var n=b();l(2),i(e,n)},$$slots:{default:!0}});var S=c(y,4);u(S,{id:`how-can-i-see-my-egress-usage`,children:(e,t)=>{l(),i(e,r(`How can I see my egress usage?`))},$$slots:{default:!0}});var C=c(S,2);m(c(e(C)),{href:`/settings/usage`,children:(e,t)=>{l(),i(e,r(`Usage & Billing`))},$$slots:{default:!0}}),l(),n(C);var w=c(C,2);u(w,{id:`is-the-allowance-applied-separately-to-each-environment`,children:(e,t)=>{l(),i(e,r(`Is the allowance applied separately to each Environment?`))},$$slots:{default:!0}});var T=c(w,4);u(T,{id:`what-is-the-timeline-for-these-changes`,children:(e,t)=>{l(),i(e,r(`What is the timeline for these changes?`))},$$slots:{default:!0}});var E=c(T,6);u(E,{id:`do-writes-to-modal-volumes-count-as-network-egress`,children:(e,t)=>{l(),i(e,r(`Do writes to Modal Volumes count as network egress?`))},$$slots:{default:!0}}),u(c(E,6),{id:`how-can-i-lower-my-egress-usage`,children:(e,t)=>{l(),i(e,r(`How can I lower my egress usage?`))},$$slots:{default:!0}}),l(4),i(t,o)},$$slots:{default:!0}}))}export{S as default,h as metadata};
//# sourceMappingURL=oresLXdw.js.map
