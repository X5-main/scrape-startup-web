(function(){try{var e=typeof window<`u`?window:typeof global<`u`?global:typeof globalThis<`u`?globalThis:typeof self<`u`?self:{};e.SENTRY_RELEASE={id:`f99fcf9f0a844cc9bd13fdc8e5782b84`};var t=new e.Error().stack;t&&(e._sentryDebugIds=e._sentryDebugIds||{},e._sentryDebugIds[t]=`4e786a22-56f2-4a75-9fbb-1ffd7f052fa9`,e._sentryDebugIdIdentifier=`sentry-dbid-4e786a22-56f2-4a75-9fbb-1ffd7f052fa9`)}catch{}})();import{$t as e,St as t,Tn as n,Tt as r,bt as i,c as a,d as o,en as s,tn as c,wn as l}from"./F_ixKBiO.js";import"./B1sc9Zdx.js";import"./Bb2deiU3.js";import{t as u}from"./BWkHjgsf.js";import{t as d}from"./JPsrybyr.js";import"./Dz6DfB4R.js";import{t as f}from"./DeWGVqas2.js";import{t as p}from"./CdZDxCfO2.js";var m={title:`How Ramp automated receipt processing with fine-tuned LLMs`,description:`Find out how Ramp uses Modal to customize open source LLMs to automate receipt processing.`,authors:[{name:`The Modal team`}],date:`2024-03-26T12:00:00.000Z`,length:`3 minute read`,category:`Customer Stories`,published:!0,layout:`blog`,toc:[{depth:1,value:`About Ramp`,id:`about-ramp`,children:[{depth:2,value:`The problem: Fine-tuning with custom code is a pain`,id:`the-problem-fine-tuning-with-custom-code-is-a-pain`},{depth:2,value:`The solution: Improve model accuracy while saving cost`,id:`the-solution-improve-model-accuracy-while-saving-cost`},{depth:2,value:`Bonus: Speeding up LLM batch processing`,id:`bonus-speeding-up-llm-batch-processing`}]}],rawContent:`![Ramp logo](https://modal-cdn.com/cdnbot/rampqk0qx0or_29b0f860.webp)

[Ramp](https://ramp.com/) uses Modal to fine-tune their LLMs and scale batch
processing. With Modal, Ramp was able to accelerate development of their
text-to-structured-JSON model for receipt management, driving down receipts
requiring manual intervention by 34%.

# About Ramp

Ramp is rebuilding the CFO suite. It combines corporate cards and expense
management, vendor management and price intelligence, procurement, bill
payments, and accounting integrations into a unified platform designed to save
time and money with every click. Businesses use Ramp as their primary spend
management solution to fully automate non-payroll spend and streamline their
financial operations. Time consuming tasks for finance teams like uploading
receipts, paying vendors, and tracking spend are managed seamlessly in Ramp’s
user-friendly interface.

## The problem: Fine-tuning with custom code is a pain

One of Ramp’s flagship products is its intelligent receipt submissions flow,
which uses an LLM to transform OCR data to structured JSON.

Ramp initially tried LLM providers like OpenAI but were not able to get the
customizability they wanted and were also concerned about cost, reliability, and
security. They then considered using a fine-tuning API provider on open-source
models, but quickly realized this black box approach lacked customizability.

<Quote authorName="Rahul Sengottuvelu" authorTitle="Head of Applied AI at Ramp">
    <span>
        Finetuning on Modal allows us to implement custom logic and preprocessing. Additionally, being able to train hundreds of models in parallel helps us accelerate our training iteration and tuning.
    </span>
</Quote>

Ramp realized they needed a platform that would grant them the flexibility to
control each step of their fine-tuning workflow.

## The solution: Improve model accuracy while saving cost

By adopting Modal, Ramp was able to quickly and confidently drive down receipts
requiring manual intervention by 34% on infrastructure that was an estimated 79%
cheaper than other major LLM providers like OpenAI.

![Diagram of Ramp's receipt processing workflow](https://modal-cdn.com/cdnbot/ramp-processing-diagramwtc95g7f_af06c6a3.webp)

As a generalized platform for running Python functions in the cloud, Modal gave
Ramp the flexibility needed to create a custom experimentation framework. They
set up Modal functions to:

- Train many candidate models in parallel
- Persist the weights from different fine-tuning runs into
  [Modal volumes](https://modal.com/docs/reference/modal.Volume)
- Serve an inference [endpoint](https://modal.com/docs/guide/webhooks) that
  could spin up the different models as needed based on a parametrized input

These critical use cases allowed the team to quickly evaluate performance across
multiple model designs.

Modal was able to support this workflow by:

- **Easily orchestrating infrastructure**: Modal automatically handles scaling
  up and down GPUs, which traditionally would be a huge pain with major cloud
  providers
- **Standardizing experiment environments**: Modal allows users to easily define
  a [containerized environment](https://modal.com/docs/guide/images)
  that can be attached to any Modal function

## Bonus: Speeding up LLM batch processing

Outside of fine-tuning, the Ramp team also opportunistically found other use
cases for Modal.

<Quote authorName="Chris Nguyen" authorTitle="Software Engineer at Ramp">
    <span>
        Just use Modal. You can get an application up in 5 minutes.
    </span>
</Quote>

For instance, one engineer was faced with the daunting task of using an LLM to
strip out PII on 25,000 invoices. A script that would’ve taken 3 days to
complete the task locally was ported to a Modal function and parallelized on 256
cloud workers, which allowed the task to be completed in a mere 20 minutes at a
cost of $100.

Companies are quickly recognizing that using ergonomic infrastructure for
data-intensive applications can double developer productivity. With Modal’s
serverless platform as a critical part of their data processing stack, Ramp is
well-equipped to ship their AI features faster than ever before.

<Quote authorName="Gennady Korotkevich" authorTitle="Software Engineer at Ramp">
    <span>
        It’s a good feedback loop. It’s pretty easy with Modal.
    </span>
</Quote>
`,meta:{title:`About Ramp`,description:`Find out how Ramp uses Modal to customize open source LLMs to automate receipt processing.`}},{title:h,description:g,authors:_,date:v,length:y,category:b,published:x,layout:S,toc:C,rawContent:w,meta:T}=m,E=t(`<span>Finetuning on Modal allows us to implement custom logic and preprocessing. Additionally, being able to train hundreds of models in parallel helps us accelerate our training iteration and tuning.</span>`),D=t(`<span>Just use Modal. You can get an application up in 5 minutes.</span>`),O=t(`<span>It’s a good feedback loop. It’s pretty easy with Modal.</span>`),k=t(`<p><!></p> <p><!> uses Modal to fine-tune their LLMs and scale batch
processing. With Modal, Ramp was able to accelerate development of their
text-to-structured-JSON model for receipt management, driving down receipts
requiring manual intervention by 34%.</p> <h1 id="about-ramp">About Ramp</h1> <p>Ramp is rebuilding the CFO suite. It combines corporate cards and expense
management, vendor management and price intelligence, procurement, bill
payments, and accounting integrations into a unified platform designed to save
time and money with every click. Businesses use Ramp as their primary spend
management solution to fully automate non-payroll spend and streamline their
financial operations. Time consuming tasks for finance teams like uploading
receipts, paying vendors, and tracking spend are managed seamlessly in Ramp’s
user-friendly interface.</p> <h2 id="the-problem-fine-tuning-with-custom-code-is-a-pain">The problem: Fine-tuning with custom code is a pain</h2> <p>One of Ramp’s flagship products is its intelligent receipt submissions flow,
which uses an LLM to transform OCR data to structured JSON.</p> <p>Ramp initially tried LLM providers like OpenAI but were not able to get the
customizability they wanted and were also concerned about cost, reliability, and
security. They then considered using a fine-tuning API provider on open-source
models, but quickly realized this black box approach lacked customizability.</p> <!> <p>Ramp realized they needed a platform that would grant them the flexibility to
control each step of their fine-tuning workflow.</p> <h2 id="the-solution-improve-model-accuracy-while-saving-cost">The solution: Improve model accuracy while saving cost</h2> <p>By adopting Modal, Ramp was able to quickly and confidently drive down receipts
requiring manual intervention by 34% on infrastructure that was an estimated 79%
cheaper than other major LLM providers like OpenAI.</p> <p><!></p> <p>As a generalized platform for running Python functions in the cloud, Modal gave
Ramp the flexibility needed to create a custom experimentation framework. They
set up Modal functions to:</p> <ul><li>Train many candidate models in parallel</li> <li>Persist the weights from different fine-tuning runs into <!></li> <li>Serve an inference <!> that
could spin up the different models as needed based on a parametrized input</li></ul> <p>These critical use cases allowed the team to quickly evaluate performance across
multiple model designs.</p> <p>Modal was able to support this workflow by:</p> <ul><li><strong>Easily orchestrating infrastructure</strong>: Modal automatically handles scaling
up and down GPUs, which traditionally would be a huge pain with major cloud
providers</li> <li><strong>Standardizing experiment environments</strong>: Modal allows users to easily define
a <!> that can be attached to any Modal function</li></ul> <h2 id="bonus-speeding-up-llm-batch-processing">Bonus: Speeding up LLM batch processing</h2> <p>Outside of fine-tuning, the Ramp team also opportunistically found other use
cases for Modal.</p> <!> <p>For instance, one engineer was faced with the daunting task of using an LLM to
strip out PII on 25,000 invoices. A script that would’ve taken 3 days to
complete the task locally was ported to a Modal function and parallelized on 256
cloud workers, which allowed the task to be completed in a mere 20 minutes at a
cost of $100.</p> <p>Companies are quickly recognizing that using ergonomic infrastructure for
data-intensive applications can double developer productivity. With Modal’s
serverless platform as a critical part of their data processing stack, Ramp is
well-equipped to ship their AI features faster than ever before.</p> <!>`,1);function A(t,h){let g=a(h,[`children`,`$$slots`,`$$events`,`$$legacy`]);p(t,o(()=>g,()=>m,{children:(t,a)=>{var o=k(),p=s(o);d(e(p),{src:`https://modal-cdn.com/cdnbot/rampqk0qx0or_29b0f860.webp`,alt:`Ramp logo`}),n(p);var m=c(p,2);f(e(m),{href:`https://ramp.com/`,rel:`nofollow`,children:(e,t)=>{l(),i(e,r(`Ramp`))},$$slots:{default:!0}}),l(),n(m);var h=c(m,12);u(h,{authorName:`Rahul Sengottuvelu`,authorTitle:`Head of Applied AI at Ramp`,children:(e,t)=>{i(e,E())},$$slots:{default:!0}});var g=c(h,8);d(e(g),{src:`https://modal-cdn.com/cdnbot/ramp-processing-diagramwtc95g7f_af06c6a3.webp`,alt:`Diagram of Ramp's receipt processing workflow`}),n(g);var _=c(g,4),v=c(e(_),2);f(c(e(v)),{href:`https://modal.com/docs/reference/modal.Volume`,rel:`nofollow`,children:(e,t)=>{l(),i(e,r(`Modal volumes`))},$$slots:{default:!0}}),n(v);var y=c(v,2);f(c(e(y)),{href:`https://modal.com/docs/guide/webhooks`,rel:`nofollow`,children:(e,t)=>{l(),i(e,r(`endpoint`))},$$slots:{default:!0}}),l(),n(y),n(_);var b=c(_,6),x=c(e(b),2);f(c(e(x),2),{href:`https://modal.com/docs/guide/images`,rel:`nofollow`,children:(e,t)=>{l(),i(e,r(`containerized environment`))},$$slots:{default:!0}}),l(),n(x),n(b);var S=c(b,6);u(S,{authorName:`Chris Nguyen`,authorTitle:`Software Engineer at Ramp`,children:(e,t)=>{i(e,D())},$$slots:{default:!0}}),u(c(S,6),{authorName:`Gennady Korotkevich`,authorTitle:`Software Engineer at Ramp`,children:(e,t)=>{i(e,O())},$$slots:{default:!0}}),i(t,o)},$$slots:{default:!0}}))}export{A as default,m as metadata};
//# sourceMappingURL=DC0LTqAy2.js.map
