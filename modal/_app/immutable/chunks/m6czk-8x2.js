(function(){try{var e=typeof window<`u`?window:typeof global<`u`?global:typeof globalThis<`u`?globalThis:typeof self<`u`?self:{};e.SENTRY_RELEASE={id:`f99fcf9f0a844cc9bd13fdc8e5782b84`};var t=new e.Error().stack;t&&(e._sentryDebugIds=e._sentryDebugIds||{},e._sentryDebugIds[t]=`c6c2826e-8312-4015-8f92-3ebeacf52042`,e._sentryDebugIdIdentifier=`sentry-dbid-c6c2826e-8312-4015-8f92-3ebeacf52042`)}catch{}})();import{$t as e,An as t,C as n,Dt as r,E as i,Ft as a,H as o,Jt as s,K as c,M as l,Ot as u,St as d,Tn as f,Tt as p,V as m,Z as h,_n as g,a as _,b as v,bt as y,c as b,cn as x,d as S,dt as C,en as w,fn as T,ft as E,h as D,ht as O,in as k,l as A,m as j,on as M,qt as N,tn as P,vn as F,vt as I,wn as L,xt as R,y as z}from"./F_ixKBiO.js";import"./L4AbmW_u.js";import"./B1sc9Zdx.js";import"./Bb2deiU3.js";import{t as B}from"./JPsrybyr.js";import{t as V}from"./BILrvr3I.js";import{t as H}from"./DeWGVqas2.js";import{t as ee}from"./CdZDxCfO2.js";import{t as te}from"./D0Ft4u302.js";var U=n(625),W=n(340),G=n([]),K=n(0),q=n([]);function ne(e){let t=e.trim().split(`
`).slice(1),n=[];for(let e of t){let t=e.split(`,`);if(t.length<2||!t[1].trim())continue;let r=parseFloat(t[1]);isNaN(r)||n.push(Math.round(r))}let r=[];for(let e=0;e<n.length-1;e+=2)r.push(Math.max(n[e],n[e+1]));return r}var J=z(G,e=>e.reduce((e,t)=>e+t,0)),Y=z(G,e=>e.length>0?Math.max(...e):0),re=z([U,J],([e,t])=>e*t*1/60),X=z([W,Y,K],([e,t,n])=>e*n*1*t/60),ie=z([Y,J,K],([e,t,n])=>t>0?e*n/t:1/0),ae=z([re,X],([e,t])=>t>0?1-e/t:1/0),oe=d(`<div class="calculated svelte-1k89qjs"><table class="calc-table svelte-1k89qjs"><tbody><tr class="calc-row svelte-1k89qjs"><td class="calc-label svelte-1k89qjs">Aggregate GPU demand</td><td class="calc-val svelte-1k89qjs"> </td></tr><tr class="calc-row svelte-1k89qjs"><td class="calc-label svelte-1k89qjs">Peak GPU demand</td><td class="calc-val svelte-1k89qjs"> </td></tr><tr class="calc-row svelte-1k89qjs"><td class="calc-label svelte-1k89qjs">Serverless cost <span style="color:#ffffff60">(C<sub>s</sub>)</span></td><td class="calc-val svelte-1k89qjs"> </td></tr><tr class="calc-row svelte-1k89qjs"><td class="calc-label svelte-1k89qjs">Reservation cost <span style="color:#ffffff60">(C<sub>r</sub>)</span></td><td class="calc-val svelte-1k89qjs"> </td></tr><tr class="calc-row svelte-1k89qjs"><td class="calc-label svelte-1k89qjs">Peak-to-average ratio</td><td class="calc-val svelte-1k89qjs"> </td></tr><tr class="calc-row savings-row svelte-1k89qjs"><td class="calc-label svelte-1k89qjs">Serverless savings <span style="color:#ffffff60">(1 &minus; C<sub>s</sub>/C<sub>r</sub>)</span></td><td> </td></tr></tbody></table></div>`);function Z(t,n){F(n,!0);let r=()=>D(J,`$aggregateDemand`,d),i=()=>D(Y,`$peakDemand`,d),o=()=>D(re,`$serverlessCost`,d),c=()=>D(X,`$reservationCost`,d),l=()=>D(ie,`$peakToAverage`,d),u=()=>D(ae,`$serverlessSavings`,d),[d,p]=j(),m=x(0),_=x(0),v=x(0),b=x(0),S=x(0),C=x(0);s(()=>{M(m,r(),!0),M(_,i(),!0),M(v,o(),!0),M(b,c(),!0),M(S,l(),!0),M(C,u(),!0)});function w(e,t=1){return e===void 0||e===1/0||isNaN(e)?`—`:e.toLocaleString(void 0,{maximumFractionDigits:t})}function T(e){return e===void 0||e===1/0||isNaN(e)?`—`:e>=1e6?`$`+(e/1e6).toLocaleString(void 0,{maximumFractionDigits:1})+`M`:e>=1e3?`$`+(e/1e3).toLocaleString(void 0,{maximumFractionDigits:1})+`K`:`$`+e.toLocaleString(void 0,{minimumFractionDigits:2,maximumFractionDigits:2})}var E=oe(),O=e(E),k=e(O),A=e(k),L=P(e(A)),R=e(L);f(L),f(A);var z=P(A),B=P(e(z)),V=e(B);f(B),f(z);var H=P(z),ee=P(e(H)),te=e(ee,!0);f(ee),f(H);var U=P(H),W=P(e(U)),G=e(W,!0);f(W),f(U);var K=P(U),q=P(e(K)),ne=e(q);f(q),f(K);var Z=P(K),Q=P(e(Z));let $;var se=e(Q);f(Q),f(Z),f(k),f(O),f(E),N((e,t,n,r,i,a,o)=>{I(R,`${e??``} GPU·hr`),I(V,`${t??``} GPUs`),I(te,n),I(G,r),I(ne,`${i??``}×`),$=h(Q,1,`calc-val svelte-1k89qjs`,null,$,a),I(se,`${o??``}%`)},[()=>w(a(m)/60),()=>w(a(_)),()=>T(a(v)/100),()=>T(a(b)/100),()=>isFinite(a(S))?a(S).toFixed(2):`—`,()=>({"savings-good":isFinite(a(C))&&a(C)>=0,"savings-bad":isFinite(a(C))&&a(C)<0}),()=>isFinite(a(C))?(a(C)*100).toFixed(0):`—`]),y(t,E),g(),p()}var Q=.92,$=.2;function se(e){let t=e|0;return()=>{t=t+1831565813|0;let e=Math.imul(t^t>>>15,1|t);return e=e+Math.imul(e^e>>>7,61|e)^e,(e>>>0)/4294967296}}function ce(e){let t=e(),n=e();return Math.sqrt(-2*Math.log(t))*Math.cos(2*Math.PI*n)}function le(e,t,n,r){let i=se(r),a=n*Math.sqrt(1-t*t),o=new Float64Array(e),s=0;for(let n=0;n<e;n++)s=s*t+ce(i)*a,o[n]=Math.exp(s);return o}var ue=z([K,q],([e,t])=>{if(e===0)return{};let n={};t.length>0&&(n.real={label:`Real workload (agentic development)`,demand:[...t]});function r(){let t=Math.floor(e/3),n=le(e,Q,$,42),r=[];for(let i=0;i<e;i++){let e=i<t?10:i<2*t?100:10;r.push(Math.round(e*n[i]))}return r}function i(){let t=[],n=e-1||1,r=le(e,Q,$,17);for(let i=0;i<e;i++){let e=225**(i/n);t.push(Math.round(e*r[i]))}return t}return n[`simple-burst`]={label:`Simple burst`,demand:r()},n[`exponential-growth`]={label:`Exponential growth`,demand:i()},n.flat={label:`Perfectly flat`,demand:Array(e).fill(42)},n}),de=d(`<button class="preset-btn svelte-1o1uimq"> </button>`),fe=d(`<div class="presets"><div class="preset-buttons svelte-1o1uimq"></div></div>`);function pe(n,r){F(r,!0);let i=T(()=>v(ue));function o(e){let t=a(i)[e];t&&G.set([...t.demand])}var s=fe(),c=e(s);C(c,21,()=>Object.entries(a(i)),E,(n,r)=>{var i=T(()=>t(a(r),2));let s=()=>a(i)[0],c=()=>a(i)[1];var l=de();l.__click=()=>o(s());var u=e(l,!0);f(l),N(()=>I(u,c().label)),y(n,l)}),f(c),f(s),y(n,s),g()}r([`click`]);var me=d(`<div class="canvas-wrapper svelte-sqihl7"><canvas aria-label="Interactive GPU demand curve" class="demand-canvas svelte-sqihl7"></canvas></div>`);function he(t,n){F(n,!1);let r=k(),s=k(),c=!1,d=null,p=null,m=k(480),h={top:10,right:20,bottom:30,left:50},v=a(m)-h.left-h.right,b=250-h.top-h.bottom,x=[];function S(e){M(m,e),v=a(m)-h.left-h.right,b=250-h.top-h.bottom}function C(){let e=a(r)?.getContext(`2d`);if(!e)return;let t=a(m),n=v,i=b;e.clearRect(0,0,t,250),e.fillStyle=`#000000`,e.fillRect(0,0,t,250);let[o,s]=T(),c=i/s;e.strokeStyle=`#ffffff20`,e.lineWidth=.5;for(let t=0;t<=4;t++){let r=h.top+i-t/4*i,a=Math.round(t/4*s);e.beginPath(),e.moveTo(h.left,r),e.lineTo(h.left+n,r),e.stroke(),e.fillStyle=`#ffffff60`,e.font=`11px monospace`,e.textAlign=`right`,e.fillText(`${a}`,h.left-5,r+4)}e.fillStyle=`#ffffff60`,e.textAlign=`center`;let l=x.length*1;for(let t=1;t<=6;t++){let r=h.left+t/6*n,a=Math.round(t/6*l/1440);e.fillText(`${a}d`,r,h.top+i+18)}e.beginPath(),e.moveTo(h.left,h.top+i);for(let t=0;t<x.length;t++){let r=x[t],a=h.left+t/(x.length-1||1)*n,o=h.top+i-r*c;e.lineTo(a,o)}e.lineTo(h.left+n,h.top+i),e.closePath(),e.fillStyle=`#7fee64`,e.globalAlpha=.35,e.fill(),e.globalAlpha=1,e.beginPath(),e.strokeStyle=`#7fee64`,e.lineWidth=1.5;for(let t=0;t<x.length;t++){let r=x[t];if(r===0&&t>0&&x[t-1]===0&&t<x.length-1&&x[t+1]===0)continue;let a=h.left+t/(x.length-1||1)*n,o=h.top+i-r*c;t===0?e.moveTo(a,o):e.lineTo(a,o)}if(e.stroke(),o>0){let t=o*c,r=h.top+i-t;e.strokeStyle=`#b9dbba`,e.setLineDash([4,4]),e.beginPath(),e.moveTo(h.left,r),e.lineTo(h.left+n,r),e.stroke(),e.setLineDash([])}}function w(e){return Math.floor((e-h.left)/(v||1)*(x.length-1))}function T(){let e=Math.max(...x.filter(Boolean),1);return[e,Math.ceil(e*1.2)]}function E(e){c=!0;let t=w(e.offsetX);if(t<0||t>=x.length)return;let[,n]=T(),r=Math.max(0,Math.round((h.top+b-e.offsetY)/(b/n)));x[t]=r,G.set([...x]),d=t,p=r}function D(e){if(!c)return;let t=w(e.offsetX);if(t<0||t>=x.length)return;let[,n]=T(),r=Math.max(0,Math.round((h.top+b-e.offsetY)/(b/n)));if(d!==null&&p!==null&&t!==d){let e=Math.min(d,t),n=Math.max(d,t);for(let t=e;t<=n;t++){let i=n-e===0?0:(t-e)/(n-e),a=Math.round(p+(r-p)*i);x[t]=Math.max(0,a)}}else x[t]=r;G.set([...x]),d=t,p=r}function O(){c=!1,d=null,p=null}function A(){c=!1,d=null,p=null}function j(e){let t=a(r).getBoundingClientRect();return{x:e.touches[0].clientX-t.left,y:e.touches[0].clientY-t.top}}function P(e){e.preventDefault();let{x:t,y:n}=j(e),r=w(t);if(r<0||r>=x.length)return;let[,i]=T(),a=Math.max(0,Math.round((h.top+b-n)/(b/i)));x[r]=a,G.set([...x]),d=r,p=a,c=!0}function I(e){if(e.preventDefault(),!c)return;let{x:t,y:n}=j(e),r=w(t);if(r<0||r>=x.length)return;let[,i]=T(),a=Math.max(0,Math.round((h.top+b-n)/(b/i)));if(d!==null&&p!==null&&r!==d){let e=Math.min(d,r),t=Math.max(d,r);for(let n=e;n<=t;n++){let r=t-e===0?0:(n-e)/(t-e),i=Math.round(p+(a-p)*r);x[n]=Math.max(0,i)}}else x[r]=a;G.set([...x]),d=r,p=a}function L(){c=!1,d=null,p=null}function R(){c=!1,d=null,p=null}_(()=>{let e=G.subscribe(e=>{x=[...e],C()}),t=new ResizeObserver(e=>{for(let t of e)S(Math.floor(t.contentRect.width));C()});return t.observe(a(s)),S(Math.floor(a(s).clientWidth)),C(),()=>{e(),t.disconnect()}}),i();var z=me(),B=e(z);o(B,`height`,250),l(B,e=>M(r,e),()=>a(r)),f(z),l(z,e=>M(s,e),()=>a(s)),N(()=>o(B,`width`,a(m))),u(`mousedown`,B,E),u(`mousemove`,B,D),u(`mouseup`,B,O),u(`mouseleave`,B,A),u(`touchstart`,B,P),u(`touchmove`,B,I),u(`touchend`,B,L),u(`touchcancel`,B,R),y(t,z),g()}var ge=d(`<div class="rate-inputs svelte-rbig7f"><div class="rate-field svelte-rbig7f"><label for="rs-input" class="svelte-rbig7f"><span class="rate-label svelte-rbig7f">Serverless rate</span> <span class="unit-line svelte-rbig7f"><span>R<sub>s</sub>,</span> <span>¢/GPU·hr</span></span></label> <input id="rs-input" type="number" min="1" max="1000" step="1" class="svelte-rbig7f"/></div> <div class="rate-field svelte-rbig7f"><label for="rr-input" class="svelte-rbig7f"><span class="rate-label svelte-rbig7f">Reservation rate</span> <span class="unit-line svelte-rbig7f"><span>R<sub>r</sub>,</span> <span>¢/GPU·hr</span></span></label> <input id="rr-input" type="number" min="1" max="1000" step="1" class="svelte-rbig7f"/></div></div>`);function _e(t,n){F(n,!0);let r=()=>D(U,`$serverlessRate`,o),i=()=>D(W,`$reservationRate`,o),[o,l]=j(),u=x(625),d=x(340);s(()=>{M(u,r(),!0),M(d,i(),!0)});var p=ge(),h=e(p),_=P(e(h),2);m(_),_.__input=e=>{let t=+e.target.value;!isNaN(t)&&t>=1&&U.set(t)},f(h);var v=P(h,2),b=P(e(v),2);m(b),b.__input=e=>{let t=+e.target.value;!isNaN(t)&&t>=1&&W.set(t)},f(v),f(p),N(()=>{c(_,a(u)),c(b,a(d))}),y(t,p),g(),l()}r([`input`]);var ve=d(`<div class="loading-skeleton svelte-twb9n6"><div class="skeleton-chart svelte-twb9n6"></div> <div class="skeleton-panel svelte-twb9n6"></div></div>`),ye=d(`<span class="insight-highlight svelte-twb9n6">Serverless is cheaper</span> `,1),be=d(`<span class="insight-muted svelte-twb9n6">Reserved is cheaper</span> `,1),xe=d(`<span class="insight-muted svelte-twb9n6">Costs are equal</span>.`,1),Se=d(`<p class="insight-text svelte-twb9n6"><!></p>`),Ce=d(`<p class="insight-text insight-muted svelte-twb9n6">Draw a demand curve to see cost analysis.</p>`),we=d(`<div class="widget-layout svelte-twb9n6"><!> <div class="controls-bar svelte-twb9n6"><!> <!></div> <div class="insight-box svelte-twb9n6"><!></div> <!></div>`),Te=d(`<div class="widget-shell svelte-twb9n6"><!></div>`);function Ee(t,n){F(n,!0);let r=()=>D(ae,`$serverlessSavings`,c),i=()=>D(J,`$aggregateDemand`,c),o=()=>D(X,`$reservationCost`,c),[c,l]=j(),u=A(n,`fetchTarget`,3,`https://modal-cdn.com/blog/data/how-to-price-serverless-gpu-usage.csv`),d=x(!0),p=x(1),m=x(0),h=x(0);s(()=>{M(p,r(),!0),M(m,i(),!0),M(h,o(),!0)});function v(e){let t=Math.floor(e/3),n=le(e,Q,$,42),r=[];for(let i=0;i<e;i++){let e=i<t?10:i<2*t?100:10;r.push(Math.round(e*n[i]))}return r}_(()=>{if(!u()){K.set(43200),G.set(v(43200)),M(d,!1);return}let e=new AbortController,t=!1;return fetch(u(),{signal:e.signal}).then(e=>{if(!e.ok)throw Error(`Failed to load data: ${e.status}`);return e.text()}).then(e=>{if(t)return;let n=ne(e);n.length===0?(K.set(43200),q.set([]),G.set(v(43200))):(K.set(n.length),q.set(n),G.set([...n])),M(d,!1)}).catch(()=>{t||(K.set(43200),q.set([]),G.set(v(43200)),M(d,!1))}),()=>{t=!0,e.abort()}});var b=Te(),S=e(b),C=e=>{y(e,ve())},T=t=>{var n=we(),r=e(n);he(r,{});var i=P(r,2),o=e(i);_e(o,{}),pe(P(o,2),{}),f(i);var s=P(i,2),c=e(s),l=t=>{var n=Se(),r=e(n),i=e=>{var t=ye(),n=P(w(t));N(e=>I(n,` —
              savings of ${e??``}% vs reserved.`),[()=>(a(p)*100).toFixed(0)]),y(e,t)},o=e=>{var t=R(),n=w(t),r=e=>{var t=be(),n=P(w(t));N(e=>I(n,` —
              serverless costs ${e??``}% more.`),[()=>(-a(p)*100).toFixed(0)]),y(e,t)},i=e=>{var t=xe();L(),y(e,t)};O(n,e=>{a(p)<0?e(r):e(i,!1)},!0),y(e,t)};O(r,e=>{a(p)>0?e(i):e(o,!1)}),f(n),y(t,n)},u=e=>{y(e,Ce())};O(c,e=>{a(m)>0&&a(h)>0?e(l):e(u,!1)}),f(s),Z(P(s,2),{}),f(n),y(t,n)};O(S,e=>{a(d)?e(C):e(T,!1)}),f(b),y(t,b),g(),l()}var De={title:`How to price serverless GPUs`,description:`To compare rates for serverless and reserved GPUs, look at your application's peak-to-average ratio.`,date:`2026-07-06T12:00:00.000Z`,length:`5 minute read`,category:`Engineering`,published:!0,authors:[{name:`Charles Frye`,avatarUrl:`https://modal-cdn.com/charles-frye.jpg`,jobTitle:`Member of Technical Staff`,twitterHandle:`charles_irl`},{name:`Matt Zebert`,avatarUrl:`https://modal-cdn.com/blog/authors/matt-zebert.jpg`,jobTitle:`Member of GTM Staff`}],layout:`blog`,toc:[{depth:1,value:`How are serverless GPUs different from reservations?`,id:`how-are-serverless-gpus-different-from-reservations`},{depth:1,value:`How much do serverless GPUs and reserved GPUs cost? How do I know which is better?`,id:`how-much-do-serverless-gpus-and-reserved-gpus-cost-how-do-i-know-which-is-better`},{depth:1,value:`What is missing from this cost model?`,id:`what-is-missing-from-this-cost-model`},{depth:1,value:`What’s next?`,id:`whats-next`}],rawContent:`> The gap between "paying for peak" and "earning on average" is critical to understand how the economics
> of large-scale cloud systems differ from traditional single-tenant systems.
>
> -- Marc Brooker, [Surprising Scalability of Multitenancy](https://brooker.co.za/blog/2023/03/23/economics.html)

GPUs are expensive but critical to operations for artificial intelligence.
So it is no surprise that as engineering teams have embraced development of AI applications,
the cost of GPUs has attracted the attention of finance departments.

This has led to conflicts and misunderstandings between procurement teams,
which want to control costs but don't always have application context,
and application teams, which want to build but don't always have market context.

So we built this interactive tool to help teams estimate costs for serverless and reserved GPUs.

<CostComparisonWidget fetchTarget="https://modal-cdn.com/blog/data/how-to-price-serverless-gpu-usage.csv" />

You can select a preset workload based on our experiences with customers
or draw in your own traffic patterns by clicking/touching and dragging on the chart.
The model defaults to current rates for a B200 GPU serverlessly on Modal and via three-year reservation on hyperscalers.
You can find the rest of our rates [here](/pricing).

We hope this helps financial and engineering teams understand one another, have productive discussions, and make informed decisions
about when to buy serverless GPUs and when to make reservations.

The critical workload parameter in this model is the _peak-to-average ratio_:
how many GPUs you need to satisfy peak demand versus how may GPUs you need "on average".
High peak-to-average demand ratios come from rapid growth, from social media buzz, or just from the whims of users.
With reservations, high peak-to-average ratios lead to
[low GPU allocation utilization](/blog/gpu-utilization-guide),
SLO violations, or both.

According to this model, **when the peak-to-average ratio is larger than discount rate for the reservation,
the total cost of the application is lower for serverless GPUs.**

In our and our customers' experience, reflected in the cases available in the widget above,
workloads like inference, training, and agentic development have peak-to-average ratios in excess of 5:1, even 10:1,
making serverless GPUs on Modal far cheaper than reservations, despite a higher base rate.
Our users also find that they [accelerate development](/blog/suno-case-study), leading to superior product outcomes at reduced engineering cost.

# How are serverless GPUs different from reservations?

Modal makes it easy to run code on GPUs in the cloud.

<CodeTabs>
  {#snippet python()}

\`\`\`python
@app.function(gpu="B200:8")
def go():
    import subprocess
    subprocess.run("nvidia-smi")
\`\`\`

{/snippet}

{#snippet shell()}

\`\`\`shell
uvx modal shell --gpu b200:8
\`\`\`

{/snippet}

{#snippet javascript()}

\`\`\`javascript
const modal = new ModalClient();
const app = await modal.apps.fromName("my-app", {
  createIfMissing: true,
});
const image = modal.images.fromRegistry("python:3.13-slim");
const sb = await modal.sandboxes.create(app, image, { gpu: "B200:8" });
const p = await sb.exec(["nvidia-smi"]);
console.log(await p.stdout.readText());
await sb.terminate();
\`\`\`

{/snippet}

{#snippet go()}

\`\`\`go
ctx := context.Background()
mc, _ := modal.NewClient()
app, _ := mc.Apps.FromName(ctx, "my-app", &modal.AppFromNameParams{
  CreateIfMissing: true,
})
image := mc.Images.FromRegistry("python:3.13-slim", nil)
sb, _ := mc.Sandboxes.Create(ctx, app, image, &modal.SandboxCreateParams{Gpu: "B200:8"})
defer sb.Terminate(ctx, nil)
p, _ := sb.Exec(ctx, []string{"nvidia-smi"}, nil)
stdout, _ := io.ReadAll(p.Stdout)
fmt.Println(string(stdout))
\`\`\`

{/snippet}
</CodeTabs>

We provide GPU access [_serverlessly_](/blog/truly-serverless-gpus):
you only pay for what you use, because you are only allocated what you are using
at any moment, up to some limit (hundreds or thousands of GPUs in Modal's
[Enterprise Tier](/pricing)).
Resource purchase and resource use are tied together.

Modal is able to provide serverless GPUs because we
[developed a variety of technologies that enable fast and efficient allocation of resources](/blog/truly-serverless-gpus),
from [cloud instance management with linear programming](/blog/resource-solver)
and [health-checking across over a dozen providers](/blog/gpu-health)
to [container memory snapshotting](/blog/gpu-mem-snapshots).

The serverless paradigm is quite different from the dominant paradigm for GPU delivery,
which requires _reserved allocations_.
In this paradigm, resource purchase and resource use are separated.
A "block" of GPU "capacity" is "reserved" under a long-term contract (generally, months to years).
That exact quantity of GPUs is available for use — no more, no less.

According to industry surveys, applications [achieve very low utilization](/blog/gpu-utilization-guide)
of these reservations (less than 30% in general, often under 10%)
leading to substantial wasted spend -- and worsening the compute crunch for everyone.

# How much do serverless GPUs and reserved GPUs cost? How do I know which is better?

Let's consider a simple model for the total cost of application delivery for both serverless and reserved GPUs.
We encourage you to take this model and build off of it!

We start with the application's demand for GPUs at any given moment, demand(_t_).
That might look something like the following, derived from Modal usage data from a real application:

![Applicaton GPU demand over two months, showing high variability](https://modal-cdn.com/blog/images/how-to-price-serverless-sample-demand.webp)

Let's assume serverless GPUs are allocated instantly.
Then, the total cost <i>C<sub>s</sub></i> is just the serverless provider's rate <i>R<sub>s</sub></i> times the demand at each point in time.

![Serverless cost: C_s equals the sum over time of R_s times demand at each instant](https://modal-cdn.com/blog/images/how-to-price-serverless-eq-cs-sum.png)

In the reserved model, demand must instead be predicted.
Let's assume that the demand can be perfectly predicted on the timescale of the reservation --
a charitable assumption to match our charitable assumption about serverless GPUs.

To satisfy application demand, we need to allocate for peak demand, throughout the entire reservation.
We'll assume that is the same as the lifetime of the application.

With these assumptions, the total cost <i>C<sub>r</sub></i> is just the reservation provider's rate <i>R<sub>r</sub></i>
times the \`max\`imum demand times the length of the reservation _T_.

![Reserved cost: C_r equals R_r times T times the peak demand over time](https://modal-cdn.com/blog/images/how-to-price-serverless-eq-cr-formula.png)

Which strategy costs more depends, then, on just how "peaky" that peak demand is.

We start by taking the ratio of the two costs:

![Cost ratio: C_r over C_s equals R_r times T times max demand divided by the sum of R_s times demand over time](https://modal-cdn.com/blog/images/how-to-price-serverless-eq-cost-ratio.png)

Then, we move the factor of _T_ to the bottom.

![Cost ratio with T moved to denominator: C_r over C_s equals R_r times max demand divided by R_s times average demand](https://modal-cdn.com/blog/images/how-to-price-serverless-eq-cost-ratio-t-moved.png)

Now, we have the two rates multiplied by two statistics of the demand: the peak value and the average value.

Let's get the equations closer to English:

![Full derivation: C_r over C_s simplifies to reservation discount rate times peak-to-average ratio](https://modal-cdn.com/blog/images/how-to-price-serverless-eq-final-derivation.png)

That is: if reserved GPUs are 10 times cheaper than serverless GPUs,
but the application has a peak-to-average ratio of 10,
the application cost is the same.
We generally observe discounts on the order of 2-5x and peak-to-average ratios of 5-10x,
which makes serverless an obvious win on cost.

And note that that's just raw application service cost!
The superior engineering velocity afforded by the flexibility of the serverless approach also reduces development and maintenance costs.
For instance, Modal's fast cold starts make it easy to develop against the same infrastructure you deploy to production.
That removes one very common source of friction, velocity reduction, and high time-to-repair.

# What is missing from this cost model?

All models are wrong, including this one, but some are useful, including this one.

Let's examine the key assumptions of the model and what happens when they break.

**We assumed that demand could be perfectly predicted.**

Practically, this assumption is really "demand can be predicted up to the requirements of the service-level objective".
This assumption benefits the reservation model.

When our predictions (or educated guesses) are off low, we end up with an underperforming application, increased faults and/or queues, and angry users.
This also leads to repeated rounds of procurement discussions across application builders, internal teams, and external vendors --
generally under time/customer pressure due to violation of SLOs.

When our predictions are off high, there is waste, which again triggers additional rounds of financial discussions, now after money is spent and a contract is signed.

**We assumed that allocation and de-allocation is instant**.

Practically, this assumption is really "service-level objectives can be met with autoscaling serverless capacity".
This assumption benefits the serverless model.

At Modal, we [invest heavily to speed up autoscaling](/blog/truly-serverless-gpus)
so that even complex applications like a vLLM or SGLang inference server can start in seconds.
When this speed is insufficient, users can over-provision with warm pools and buffers.
This increases cost, but generally, buffers become less expensive to operate with scale.

In any case, adjustments occur within the envelope of application development (from engineering's perspective) and an aggregate budget (from finance's perspective),
without triggering more rounds of internal and external negotiation due to artificial contract limits, as happens with a reservation.

**We assumed only "all-or-none" strategies: all serverless or all reservation.**

This is not just a helpful assumption to make math easier --
it also corresponds to reduced operational cost.
One system is cheaper to maintain at a given level of robustness and performance than two, for both financial and engineering teams.

But some organizations pursue a mixed strategy.
Most commonly, they aim to use a reservation to cover "baseline" load (minimum demand) and serverless GPUs to cover "burst" or "excess" load (everything else).
The same peak-to-average ratio math can be used here,
but with the peaks and averages of burst/excess load over the baseline.
We observe very large peak-to-average ratios for bursts -- 10-100x -- which makes serverless deployment particularly compelling.

We're exploring options for bringing the combined reservation/serverless economic model to Modal,
so that finance teams don't need to procure two vendors and engineering teams don't need to integrate two systems.
If you're interested in reserving and bursting into hundreds or thousands of GPUs, [contact us](mailto:sales@modal.com).

**We assumed that GPU cost was the only factor.**

Cost matters, but costs can only be directly compared for substitutable goods.
But serverless GPUs and reserved GPUs are not identical!
And on Modal in particular, we've made substantial investments in [developer (and agent) productivity](/blog/agents-devex).

For instance, the speed of allocation and deallocation of serverless resources on Modal allows for development against the same infrastructure running in production.
Reduced dev/prod skew means faster development at a lower defect rate.

# What's next?

We hope this document is helpful to you in navigating GPU procurement or development, whether you're thinking about cost control, demand satisfaction, or both.
The contents have certainly helped us clarify options and qualify (or disqualify!) customer engagements.

If you're running an application with high peak-to-average GPU demand ratios, like inference, training, or agentic development,
and you think serverless GPUs are right for you, [try Modal right now](/docs/playground).

If you're interested in mixed serverless/reserved models for hundreds or thousands of GPUs, [contact us](mailto:sales@modal.com).
`,meta:{title:`How are serverless GPUs different from reservations?`,description:`To compare rates for serverless and reserved GPUs, look at your application's peak-to-average ratio.`}},{title:Oe,description:ke,date:Ae,length:je,category:Me,published:Ne,authors:Pe,layout:Fe,toc:Ie,rawContent:Le,meta:Re}=De,ze=d(`<em>serverlessly</em>`),Be=d(`<blockquote><p>The gap between “paying for peak” and “earning on average” is critical to understand how the economics
of large-scale cloud systems differ from traditional single-tenant systems.</p> <p>— Marc Brooker, <!></p></blockquote> <p>GPUs are expensive but critical to operations for artificial intelligence.
So it is no surprise that as engineering teams have embraced development of AI applications,
the cost of GPUs has attracted the attention of finance departments.</p> <p>This has led to conflicts and misunderstandings between procurement teams,
which want to control costs but don’t always have application context,
and application teams, which want to build but don’t always have market context.</p> <p>So we built this interactive tool to help teams estimate costs for serverless and reserved GPUs.</p> <!> <p>You can select a preset workload based on our experiences with customers
or draw in your own traffic patterns by clicking/touching and dragging on the chart.
The model defaults to current rates for a B200 GPU serverlessly on Modal and via three-year reservation on hyperscalers.
You can find the rest of our rates <!>.</p> <p>We hope this helps financial and engineering teams understand one another, have productive discussions, and make informed decisions
about when to buy serverless GPUs and when to make reservations.</p> <p>The critical workload parameter in this model is the <em>peak-to-average ratio</em>:
how many GPUs you need to satisfy peak demand versus how may GPUs you need “on average”.
High peak-to-average demand ratios come from rapid growth, from social media buzz, or just from the whims of users.
With reservations, high peak-to-average ratios lead to <!>,
SLO violations, or both.</p> <p>According to this model, <strong>when the peak-to-average ratio is larger than discount rate for the reservation,
the total cost of the application is lower for serverless GPUs.</strong></p> <p>In our and our customers’ experience, reflected in the cases available in the widget above,
workloads like inference, training, and agentic development have peak-to-average ratios in excess of 5:1, even 10:1,
making serverless GPUs on Modal far cheaper than reservations, despite a higher base rate.
Our users also find that they <!>, leading to superior product outcomes at reduced engineering cost.</p> <h1 id="how-are-serverless-gpus-different-from-reservations">How are serverless GPUs different from reservations?</h1> <p>Modal makes it easy to run code on GPUs in the cloud.</p> <!> <p>We provide GPU access <!>:
you only pay for what you use, because you are only allocated what you are using
at any moment, up to some limit (hundreds or thousands of GPUs in Modal’s <!>).
Resource purchase and resource use are tied together.</p> <p>Modal is able to provide serverless GPUs because we <!>,
from <!> and <!> to <!>.</p> <p>The serverless paradigm is quite different from the dominant paradigm for GPU delivery,
which requires <em>reserved allocations</em>.
In this paradigm, resource purchase and resource use are separated.
A “block” of GPU “capacity” is “reserved” under a long-term contract (generally, months to years).
That exact quantity of GPUs is available for use — no more, no less.</p> <p>According to industry surveys, applications <!> of these reservations (less than 30% in general, often under 10%)
leading to substantial wasted spend — and worsening the compute crunch for everyone.</p> <h1 id="how-much-do-serverless-gpus-and-reserved-gpus-cost-how-do-i-know-which-is-better">How much do serverless GPUs and reserved GPUs cost? How do I know which is better?</h1> <p>Let’s consider a simple model for the total cost of application delivery for both serverless and reserved GPUs.
We encourage you to take this model and build off of it!</p> <p>We start with the application’s demand for GPUs at any given moment, demand(<em>t</em>).
That might look something like the following, derived from Modal usage data from a real application:</p> <p><!></p> <p>Let’s assume serverless GPUs are allocated instantly.
Then, the total cost <i>C<sub>s</sub></i> is just the serverless provider’s rate <i>R<sub>s</sub></i> times the demand at each point in time.</p> <p><!></p> <p>In the reserved model, demand must instead be predicted.
Let’s assume that the demand can be perfectly predicted on the timescale of the reservation —
a charitable assumption to match our charitable assumption about serverless GPUs.</p> <p>To satisfy application demand, we need to allocate for peak demand, throughout the entire reservation.
We’ll assume that is the same as the lifetime of the application.</p> <p>With these assumptions, the total cost <i>C<sub>r</sub></i> is just the reservation provider’s rate <i>R<sub>r</sub></i> times the <code>max</code>imum demand times the length of the reservation <em>T</em>.</p> <p><!></p> <p>Which strategy costs more depends, then, on just how “peaky” that peak demand is.</p> <p>We start by taking the ratio of the two costs:</p> <p><!></p> <p>Then, we move the factor of <em>T</em> to the bottom.</p> <p><!></p> <p>Now, we have the two rates multiplied by two statistics of the demand: the peak value and the average value.</p> <p>Let’s get the equations closer to English:</p> <p><!></p> <p>That is: if reserved GPUs are 10 times cheaper than serverless GPUs,
but the application has a peak-to-average ratio of 10,
the application cost is the same.
We generally observe discounts on the order of 2-5x and peak-to-average ratios of 5-10x,
which makes serverless an obvious win on cost.</p> <p>And note that that’s just raw application service cost!
The superior engineering velocity afforded by the flexibility of the serverless approach also reduces development and maintenance costs.
For instance, Modal’s fast cold starts make it easy to develop against the same infrastructure you deploy to production.
That removes one very common source of friction, velocity reduction, and high time-to-repair.</p> <h1 id="what-is-missing-from-this-cost-model">What is missing from this cost model?</h1> <p>All models are wrong, including this one, but some are useful, including this one.</p> <p>Let’s examine the key assumptions of the model and what happens when they break.</p> <p><strong>We assumed that demand could be perfectly predicted.</strong></p> <p>Practically, this assumption is really “demand can be predicted up to the requirements of the service-level objective”.
This assumption benefits the reservation model.</p> <p>When our predictions (or educated guesses) are off low, we end up with an underperforming application, increased faults and/or queues, and angry users.
This also leads to repeated rounds of procurement discussions across application builders, internal teams, and external vendors —
generally under time/customer pressure due to violation of SLOs.</p> <p>When our predictions are off high, there is waste, which again triggers additional rounds of financial discussions, now after money is spent and a contract is signed.</p> <p><strong>We assumed that allocation and de-allocation is instant</strong>.</p> <p>Practically, this assumption is really “service-level objectives can be met with autoscaling serverless capacity”.
This assumption benefits the serverless model.</p> <p>At Modal, we <!> so that even complex applications like a vLLM or SGLang inference server can start in seconds.
When this speed is insufficient, users can over-provision with warm pools and buffers.
This increases cost, but generally, buffers become less expensive to operate with scale.</p> <p>In any case, adjustments occur within the envelope of application development (from engineering’s perspective) and an aggregate budget (from finance’s perspective),
without triggering more rounds of internal and external negotiation due to artificial contract limits, as happens with a reservation.</p> <p><strong>We assumed only “all-or-none” strategies: all serverless or all reservation.</strong></p> <p>This is not just a helpful assumption to make math easier —
it also corresponds to reduced operational cost.
One system is cheaper to maintain at a given level of robustness and performance than two, for both financial and engineering teams.</p> <p>But some organizations pursue a mixed strategy.
Most commonly, they aim to use a reservation to cover “baseline” load (minimum demand) and serverless GPUs to cover “burst” or “excess” load (everything else).
The same peak-to-average ratio math can be used here,
but with the peaks and averages of burst/excess load over the baseline.
We observe very large peak-to-average ratios for bursts — 10-100x — which makes serverless deployment particularly compelling.</p> <p>We’re exploring options for bringing the combined reservation/serverless economic model to Modal,
so that finance teams don’t need to procure two vendors and engineering teams don’t need to integrate two systems.
If you’re interested in reserving and bursting into hundreds or thousands of GPUs, <!>.</p> <p><strong>We assumed that GPU cost was the only factor.</strong></p> <p>Cost matters, but costs can only be directly compared for substitutable goods.
But serverless GPUs and reserved GPUs are not identical!
And on Modal in particular, we’ve made substantial investments in <!>.</p> <p>For instance, the speed of allocation and deallocation of serverless resources on Modal allows for development against the same infrastructure running in production.
Reduced dev/prod skew means faster development at a lower defect rate.</p> <h1 id="whats-next">What’s next?</h1> <p>We hope this document is helpful to you in navigating GPU procurement or development, whether you’re thinking about cost control, demand satisfaction, or both.
The contents have certainly helped us clarify options and qualify (or disqualify!) customer engagements.</p> <p>If you’re running an application with high peak-to-average GPU demand ratios, like inference, training, or agentic development,
and you think serverless GPUs are right for you, <!>.</p> <p>If you’re interested in mixed serverless/reserved models for hundreds or thousands of GPUs, <!>.</p>`,1);function Ve(t,n){let r=b(n,[`children`,`$$slots`,`$$events`,`$$legacy`]);ee(t,S(()=>r,()=>De,{children:(t,n)=>{var r=Be(),i=w(r),a=P(e(i),2);H(P(e(a)),{href:`https://brooker.co.za/blog/2023/03/23/economics.html`,rel:`nofollow`,children:(e,t)=>{L(),y(e,p(`Surprising Scalability of Multitenancy`))},$$slots:{default:!0}}),f(a),f(i);var o=P(i,8);Ee(o,{fetchTarget:`https://modal-cdn.com/blog/data/how-to-price-serverless-gpu-usage.csv`});var s=P(o,2);H(P(e(s)),{href:`/pricing`,children:(e,t)=>{L(),y(e,p(`here`))},$$slots:{default:!0}}),L(),f(s);var c=P(s,4);H(P(e(c),3),{href:`/blog/gpu-utilization-guide`,children:(e,t)=>{L(),y(e,p(`low GPU allocation utilization`))},$$slots:{default:!0}}),L(),f(c);var l=P(c,4);H(P(e(l)),{href:`/blog/suno-case-study`,children:(e,t)=>{L(),y(e,p(`accelerate development`))},$$slots:{default:!0}}),L(),f(l);var u=P(l,6);te(u,{python:e=>{V(e,{code:`%40app.function(gpu%3D%22B200%3A8%22)%0Adef%20go()%3A%0A%20%20%20%20import%20subprocess%0A%20%20%20%20subprocess.run(%22nvidia-smi%22)`,lang:`python`})},shell:e=>{V(e,{code:`uvx%20modal%20shell%20--gpu%20b200%3A8`,lang:`shell`})},javascript:e=>{V(e,{code:`const%20modal%20%3D%20new%20ModalClient()%3B%0Aconst%20app%20%3D%20await%20modal.apps.fromName(%22my-app%22%2C%20%7B%0A%20%20createIfMissing%3A%20true%2C%0A%7D)%3B%0Aconst%20image%20%3D%20modal.images.fromRegistry(%22python%3A3.13-slim%22)%3B%0Aconst%20sb%20%3D%20await%20modal.sandboxes.create(app%2C%20image%2C%20%7B%20gpu%3A%20%22B200%3A8%22%20%7D)%3B%0Aconst%20p%20%3D%20await%20sb.exec(%5B%22nvidia-smi%22%5D)%3B%0Aconsole.log(await%20p.stdout.readText())%3B%0Aawait%20sb.terminate()%3B`,lang:`javascript`})},go:e=>{V(e,{code:`ctx%20%3A%3D%20context.Background()%0Amc%2C%20_%20%3A%3D%20modal.NewClient()%0Aapp%2C%20_%20%3A%3D%20mc.Apps.FromName(ctx%2C%20%22my-app%22%2C%20%26modal.AppFromNameParams%7B%0A%20%20CreateIfMissing%3A%20true%2C%0A%7D)%0Aimage%20%3A%3D%20mc.Images.FromRegistry(%22python%3A3.13-slim%22%2C%20nil)%0Asb%2C%20_%20%3A%3D%20mc.Sandboxes.Create(ctx%2C%20app%2C%20image%2C%20%26modal.SandboxCreateParams%7BGpu%3A%20%22B200%3A8%22%7D)%0Adefer%20sb.Terminate(ctx%2C%20nil)%0Ap%2C%20_%20%3A%3D%20sb.Exec(ctx%2C%20%5B%5Dstring%7B%22nvidia-smi%22%7D%2C%20nil)%0Astdout%2C%20_%20%3A%3D%20io.ReadAll(p.Stdout)%0Afmt.Println(string(stdout))`,lang:`go`})},$$slots:{python:!0,shell:!0,javascript:!0,go:!0}});var d=P(u,2),m=P(e(d));H(m,{href:`/blog/truly-serverless-gpus`,children:(e,t)=>{y(e,ze())},$$slots:{default:!0}}),H(P(m,2),{href:`/pricing`,children:(e,t)=>{L(),y(e,p(`Enterprise Tier`))},$$slots:{default:!0}}),L(),f(d);var h=P(d,2),g=P(e(h));H(g,{href:`/blog/truly-serverless-gpus`,children:(e,t)=>{L(),y(e,p(`developed a variety of technologies that enable fast and efficient allocation of resources`))},$$slots:{default:!0}});var _=P(g,2);H(_,{href:`/blog/resource-solver`,children:(e,t)=>{L(),y(e,p(`cloud instance management with linear programming`))},$$slots:{default:!0}});var v=P(_,2);H(v,{href:`/blog/gpu-health`,children:(e,t)=>{L(),y(e,p(`health-checking across over a dozen providers`))},$$slots:{default:!0}}),H(P(v,2),{href:`/blog/gpu-mem-snapshots`,children:(e,t)=>{L(),y(e,p(`container memory snapshotting`))},$$slots:{default:!0}}),L(),f(h);var b=P(h,4);H(P(e(b)),{href:`/blog/gpu-utilization-guide`,children:(e,t)=>{L(),y(e,p(`achieve very low utilization`))},$$slots:{default:!0}}),L(),f(b);var x=P(b,8);B(e(x),{src:`https://modal-cdn.com/blog/images/how-to-price-serverless-sample-demand.webp`,alt:`Applicaton GPU demand over two months, showing high variability`}),f(x);var S=P(x,4);B(e(S),{src:`https://modal-cdn.com/blog/images/how-to-price-serverless-eq-cs-sum.png`,alt:`Serverless cost: C_s equals the sum over time of R_s times demand at each instant`}),f(S);var C=P(S,8);B(e(C),{src:`https://modal-cdn.com/blog/images/how-to-price-serverless-eq-cr-formula.png`,alt:`Reserved cost: C_r equals R_r times T times the peak demand over time`}),f(C);var T=P(C,6);B(e(T),{src:`https://modal-cdn.com/blog/images/how-to-price-serverless-eq-cost-ratio.png`,alt:`Cost ratio: C_r over C_s equals R_r times T times max demand divided by the sum of R_s times demand over time`}),f(T);var E=P(T,4);B(e(E),{src:`https://modal-cdn.com/blog/images/how-to-price-serverless-eq-cost-ratio-t-moved.png`,alt:`Cost ratio with T moved to denominator: C_r over C_s equals R_r times max demand divided by R_s times average demand`}),f(E);var D=P(E,6);B(e(D),{src:`https://modal-cdn.com/blog/images/how-to-price-serverless-eq-final-derivation.png`,alt:`Full derivation: C_r over C_s simplifies to reservation discount rate times peak-to-average ratio`}),f(D);var O=P(D,24);H(P(e(O)),{href:`/blog/truly-serverless-gpus`,children:(e,t)=>{L(),y(e,p(`invest heavily to speed up autoscaling`))},$$slots:{default:!0}}),L(),f(O);var k=P(O,10);H(P(e(k)),{href:`mailto:sales@modal.com`,children:(e,t)=>{L(),y(e,p(`contact us`))},$$slots:{default:!0}}),L(),f(k);var A=P(k,4);H(P(e(A)),{href:`/blog/agents-devex`,children:(e,t)=>{L(),y(e,p(`developer (and agent) productivity`))},$$slots:{default:!0}}),L(),f(A);var j=P(A,8);H(P(e(j)),{href:`/docs/playground`,children:(e,t)=>{L(),y(e,p(`try Modal right now`))},$$slots:{default:!0}}),L(),f(j);var M=P(j,2);H(P(e(M)),{href:`mailto:sales@modal.com`,children:(e,t)=>{L(),y(e,p(`contact us`))},$$slots:{default:!0}}),L(),f(M),y(t,r)},$$slots:{default:!0}}))}export{Ve as default,De as metadata};
//# sourceMappingURL=m6czk-8x2.js.map
