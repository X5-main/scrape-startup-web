(function(){try{var e=typeof window<`u`?window:typeof global<`u`?global:typeof globalThis<`u`?globalThis:typeof self<`u`?self:{};e.SENTRY_RELEASE={id:`f99fcf9f0a844cc9bd13fdc8e5782b84`};var t=new e.Error().stack;t&&(e._sentryDebugIds=e._sentryDebugIds||{},e._sentryDebugIds[t]=`3bd7c857-658a-48f2-af40-8fc66afe6f4f`,e._sentryDebugIdIdentifier=`sentry-dbid-3bd7c857-658a-48f2-af40-8fc66afe6f4f`)}catch{}})();import{$t as e,St as t,Tn as n,Tt as r,bt as i,c as a,d as o,en as s,tn as c,wn as l}from"./F_ixKBiO.js";import"./B1sc9Zdx.js";import"./Bb2deiU3.js";import{t as u}from"./BILrvr3I.js";import{t as d}from"./DeWGVqas2.js";import{t as f}from"./CdZDxCfO2.js";var p={title:`How to get GPUs with a Jupyter notebook on Modal`,description:`Learn how to launch a Jupyter notebook backed by Modal GPUs with this step-by-step guide.`,authors:[{name:`Yiren Lu`,avatarUrl:`https://modal-cdn.com/ren-lu.jpg`,jobTitle:`Solutions Engineer`,twitterHandle:`YirenLu`}],date:`2024-09-15T12:00:00.000Z`,length:`5 minute read`,category:`Article`,subcategory:`Frameworks and Tools`,published:!0,layout:`blog`,toc:[{depth:2,value:`Enter Modal: On-Demand GPU-Powered Jupyter Notebooks`,id:`enter-modal-on-demand-gpu-powered-jupyter-notebooks`,children:[{depth:3,value:`Prerequisites`,id:`prerequisites`},{depth:3,value:`Instant GPU-Backed Notebooks`,id:`instant-gpu-backed-notebooks`}]}],rawContent:`Over the years, [Jupyter notebooks](https://jupyter.org/) have evolved from simple coding environments to powerful platforms for complex data analysis, machine learning, and AI development. These applications often require significant computational power, making GPU acceleration a necessity.

However, the traditional approach of having dedicated GPU workstations or clusters comes with its own challenges:

1. High upfront costs
2. Underutilization during off-peak times
3. Difficulty in scaling resources up or down based on project needs
4. Maintenance and upgrade headaches

This is where the ability to spin up and down GPU resources on-demand becomes a game-changer.

In this guide, we show you how you can equip your Jupyter notebooks with flexible GPU resources provided by Modal's serverless platform.

## Enter Modal: On-Demand GPU-Powered Jupyter Notebooks

### Prerequisites

Before we begin, make sure you have the following:

1. An account at [modal.com](https://modal.com)
2. The Modal Python package installed (\`pip install modal\`)
3. Authenticated with Modal (run \`modal setup\` or \`python -m modal setup\` if the former doesn't work)

### Instant GPU-Backed Notebooks

Launch a Jupyter notebook backed by Modal GPUs in seconds:

\`\`\`bash
$ modal launch jupyter --gpu a10g
\`\`\`

This single command provides you with a Jupyter instance backed by an NVIDIA A10G GPU, ready for your most demanding computations.

After running this command, you'll see output similar to:

\`\`\`
Jupyter on Modal, opening in browser...
    -> https://your-unique-url.modal.host/?token=your-secret-token
\`\`\`

You can then open this URL in your web browser to access the Jupyter notebook.

For more advanced configurations, including other types of GPUs to attach to the notebook, you can refer to the Modal docs [here](/docs/guide/jupyter-notebooks).
`,meta:{description:`Learn how to launch a Jupyter notebook backed by Modal GPUs with this step-by-step guide.`}},{title:m,description:h,authors:g,date:_,length:v,category:y,subcategory:b,published:x,layout:S,toc:C,rawContent:w,meta:T}=p,E=t(`<p>Over the years, <!> have evolved from simple coding environments to powerful platforms for complex data analysis, machine learning, and AI development. These applications often require significant computational power, making GPU acceleration a necessity.</p> <p>However, the traditional approach of having dedicated GPU workstations or clusters comes with its own challenges:</p> <ol><li>High upfront costs</li> <li>Underutilization during off-peak times</li> <li>Difficulty in scaling resources up or down based on project needs</li> <li>Maintenance and upgrade headaches</li></ol> <p>This is where the ability to spin up and down GPU resources on-demand becomes a game-changer.</p> <p>In this guide, we show you how you can equip your Jupyter notebooks with flexible GPU resources provided by Modal’s serverless platform.</p> <h2 id="enter-modal-on-demand-gpu-powered-jupyter-notebooks">Enter Modal: On-Demand GPU-Powered Jupyter Notebooks</h2> <h3 id="prerequisites">Prerequisites</h3> <p>Before we begin, make sure you have the following:</p> <ol><li>An account at <!></li> <li>The Modal Python package installed (<code>pip install modal</code>)</li> <li>Authenticated with Modal (run <code>modal setup</code> or <code>python -m modal setup</code> if the former doesn’t work)</li></ol> <h3 id="instant-gpu-backed-notebooks">Instant GPU-Backed Notebooks</h3> <p>Launch a Jupyter notebook backed by Modal GPUs in seconds:</p> <!> <p>This single command provides you with a Jupyter instance backed by an NVIDIA A10G GPU, ready for your most demanding computations.</p> <p>After running this command, you’ll see output similar to:</p> <!> <p>You can then open this URL in your web browser to access the Jupyter notebook.</p> <p>For more advanced configurations, including other types of GPUs to attach to the notebook, you can refer to the Modal docs <!>.</p>`,1);function D(t,m){let h=a(m,[`children`,`$$slots`,`$$events`,`$$legacy`]);f(t,o(()=>h,()=>p,{children:(t,a)=>{var o=E(),f=s(o);d(c(e(f)),{href:`https://jupyter.org/`,rel:`nofollow`,children:(e,t)=>{l(),i(e,r(`Jupyter notebooks`))},$$slots:{default:!0}}),l(),n(f);var p=c(f,16),m=e(p);d(c(e(m)),{href:`https://modal.com`,rel:`nofollow`,children:(e,t)=>{l(),i(e,r(`modal.com`))},$$slots:{default:!0}}),n(m),l(4),n(p);var h=c(p,6);u(h,{code:`%24%20modal%20launch%20jupyter%20--gpu%20a10g`,lang:`bash`});var g=c(h,6);u(g,{code:`Jupyter%20on%20Modal%2C%20opening%20in%20browser...%0A%20%20%20%20-%3E%20https%3A%2F%2Fyour-unique-url.modal.host%2F%3Ftoken%3Dyour-secret-token`,lang:`text`});var _=c(g,4);d(c(e(_)),{href:`/docs/guide/jupyter-notebooks`,children:(e,t)=>{l(),i(e,r(`here`))},$$slots:{default:!0}}),l(),n(_),i(t,o)},$$slots:{default:!0}}))}export{D as default,p as metadata};
//# sourceMappingURL=Bj-ZZGgA2.js.map
