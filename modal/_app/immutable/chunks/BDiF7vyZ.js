(function(){try{var e=typeof window<`u`?window:typeof global<`u`?global:typeof globalThis<`u`?globalThis:typeof self<`u`?self:{};e.SENTRY_RELEASE={id:`f99fcf9f0a844cc9bd13fdc8e5782b84`};var t=new e.Error().stack;t&&(e._sentryDebugIds=e._sentryDebugIds||{},e._sentryDebugIds[t]=`c86f805a-b55e-48fa-878f-c7fa3429b59b`,e._sentryDebugIdIdentifier=`sentry-dbid-c86f805a-b55e-48fa-878f-c7fa3429b59b`)}catch{}})();import{$t as e,St as t,Tn as n,Tt as r,bt as i,c as a,d as o,en as s,tn as c,wn as l}from"./F_ixKBiO.js";import"./B1sc9Zdx.js";import"./Bb2deiU3.js";import{t as u}from"./BWkHjgsf.js";import"./Dz6DfB4R.js";import{t as d}from"./BILrvr3I.js";import{t as f}from"./DeWGVqas2.js";import{t as p}from"./CdZDxCfO2.js";var m={title:`How Contextual AI automated CI with Modal GPUs`,description:`Learn how Contextual AI accelerated their developer iteration speed by using Modal to run tests on GPUs.`,date:`2024-09-18T12:00:00.000Z`,length:`4 minute read`,category:`Customer Stories`,published:!0,layout:`blog`,toc:[{depth:2,value:`About Contextual AI`,id:`about-contextual-ai`},{depth:2,value:`A bottleneck on testing`,id:`a-bottleneck-on-testing`},{depth:2,value:`Parallelizable CI on Modal GPUs`,id:`parallelizable-ci-on-modal-gpus`}],rawContent:`Cutting edge platforms like Contextual AI often find that their software development practices require more flexible resources than legacy providers can offer. With Modal, Contextual AI was able to automate and parallelize their continuous integration (CI) on GPUs.

## About Contextual AI

[Contextual AI](https://contextual.ai/) offers an end-to-end platform for building RAG 2.0 (retrieval-augmented generation) enterprise AI applications. The product integrates the entire RAG pipeline into a single optimized system which can be specialized for customer needs, delivering greater accuracy and transparency for knowledge-intensive tasks. The company is led by CEO Douwe Kiela, who pioneered the industry-standard [RAG technique](https://arxiv.org/abs/2005.11401), and CTO Amanpreet Singh, who was a research engineer at Hugging Face and Meta’s Fundamental AI Research team.

## A bottleneck on testing

CI is a practice where engineers integrate their code changes frequently, and each integration is verified by an automated build and automated tests. Because Contextual AI’s product uses LLMs, they needed a way to run CI using GPUs. There were two scenarios when they ran test suites:

1. Before a pull request (PR) was merged, they would run a large suite of small tests to ensure that the PR didn’t break any plumbing in the product. To optimize for efficiency, they used tiny, several-MB models as stand-ins.
2. Once a day, they would run more in-depth “quality” tests using larger models that customers would actually use, to ensure there were no regressions in model output.

Developers had to run these tests manually on in-house GPU nodes, which was inconvenient and time-consuming. It was easy to forget to run the tests before merging PRs, resulting in broken master code that would slow down the whole team.

<Quote authorName="Stas Bekman" authorTitle="ML Engineer at Contextual AI">
    <span>
        Previously you were just trusting that people would trigger these GPU tests manually before they merged code. I would have to ask, “Well, did you run the tests?” before I approved the PRs. But now we’re 50 people and you can’t rely on that.
    </span>
</Quote>

Another pain point was procuring GPUs on demand. While Contextual AI had a massive quantity of GPUs reserved with GCP, the research team’s training and prototyping needs took priority. It didn’t make sense for CI to divert resources away from them, which is why [Stas Bekman](https://github.com/stas00/), an ML engineer at Contextual AI, wanted to find a reliable external provider.

Stas [searched for CI-on-GPUs options](https://x.com/StasBekman/status/1724271487375569269), but didn’t find a good fit. Their CI required at least two GPUs but neither GitHub nor CircleCI provided more than one GPU per job. Furthermore, the GPUs they had available were old, slow, and expensive.

Back in his time at Hugging Face, Stas used an AWS on-demand GPU instance to solve this problem, but it wasn’t ideal. Updating the machine image was slow and cumbersome, and it could take 5+ minutes just to get an instance running. Often times CI would fail because no instance could be found, even when he tried searching across multiple availability zones. He wanted to avoid repeating the same mistake at Contextual AI.

## Parallelizable CI on Modal GPUs

After making a request on Twitter for suggestions, Stas decided to try Modal because he could access flexible configurations of GPUs on-demand. This is what the CI workflow looked like:

1. PR is submitted on GitHub.
2. A GitHub Action is triggered which calls a Modal Function. The Function has multiple GPUs attached and uses an image with custom requirements and \`pytest\` installed.
3. The Modal Function invokes \`pytest\` as a subprocess to run a suite of tests.
4. The first time the Function runs, Modal builds and caches the custom image. On subsequent runs, no image rebuild is needed, allowing the tests to start running within 30 seconds of job submission.

Simplified pattern of CI using Modal:

\`\`\`python
import modal

image = (
    modal.Image.debian_slim()
    .pip_install("pytest")
    .pip_install_from_requirements("requirements.txt")
)

app = modal.App("ci-testing", image=image)

@app.function(gpu="any", mounts=[tests])
def pytest():
    import subprocess

    subprocess.run(["pytest", "-vs"], check=True, cwd="/root")
\`\`\`

This workflow allowed Contextual AI to fully automate their test suite. As a result, they can maximize their developer iteration speed while maintaining a high quality bar. Other key benefits:

- GitHub Actions can directly trigger Modal, so there's no need to manage self-hosted runners.
- Modal spins up GPUs for each job submission, allowing CI for multiple PRs to run in parallel.
- Modal bills by usage, which keeps costs low. Because image builds are cached, 99% of what’s billed is actual test run-time.

<Quote authorName="Stas Bekman" authorTitle="ML Engineer at Contextual AI">
    <span>
        I was shocked at the amazing support I received from Modal's team. They quickly created a sample repo that catered exactly to our needs and within a few hours we had our CI running. In this day and age it's very difficult to find excellent technical support within seconds of posting a request. It has been an amazing experience for our team collaborating with Modal.
    </span>
</Quote>

All of this has been enabled by Modal's custom infrastructure—including our own file system and scheduler—for running containers in the cloud. Modal can spin up GPU-enabled containers in as little as one second, which helps companies iterate fast and scale up to large production workloads.

Interested in CI on Modal? Check out our [sample repo](https://github.com/modal-labs/ci-on-modal/tree/main).
`,meta:{description:`Learn how Contextual AI accelerated their developer iteration speed by using Modal to run tests on GPUs.`}},{title:h,description:g,date:_,length:v,category:y,published:b,layout:x,toc:S,rawContent:C,meta:w}=m,T=t(`<span>Previously you were just trusting that people would trigger these GPU tests manually before they merged code. I would have to ask, “Well, did you run the tests?” before I approved the PRs. But now we’re 50 people and you can’t rely on that.</span>`),E=t(`<span>I was shocked at the amazing support I received from Modal's team. They quickly created a sample repo that catered exactly to our needs and within a few hours we had our CI running. In this day and age it's very difficult to find excellent technical support within seconds of posting a request. It has been an amazing experience for our team collaborating with Modal.</span>`),D=t(`<p>Cutting edge platforms like Contextual AI often find that their software development practices require more flexible resources than legacy providers can offer. With Modal, Contextual AI was able to automate and parallelize their continuous integration (CI) on GPUs.</p> <h2 id="about-contextual-ai">About Contextual AI</h2> <p><!> offers an end-to-end platform for building RAG 2.0 (retrieval-augmented generation) enterprise AI applications. The product integrates the entire RAG pipeline into a single optimized system which can be specialized for customer needs, delivering greater accuracy and transparency for knowledge-intensive tasks. The company is led by CEO Douwe Kiela, who pioneered the industry-standard <!>, and CTO Amanpreet Singh, who was a research engineer at Hugging Face and Meta’s Fundamental AI Research team.</p> <h2 id="a-bottleneck-on-testing">A bottleneck on testing</h2> <p>CI is a practice where engineers integrate their code changes frequently, and each integration is verified by an automated build and automated tests. Because Contextual AI’s product uses LLMs, they needed a way to run CI using GPUs. There were two scenarios when they ran test suites:</p> <ol><li>Before a pull request (PR) was merged, they would run a large suite of small tests to ensure that the PR didn’t break any plumbing in the product. To optimize for efficiency, they used tiny, several-MB models as stand-ins.</li> <li>Once a day, they would run more in-depth “quality” tests using larger models that customers would actually use, to ensure there were no regressions in model output.</li></ol> <p>Developers had to run these tests manually on in-house GPU nodes, which was inconvenient and time-consuming. It was easy to forget to run the tests before merging PRs, resulting in broken master code that would slow down the whole team.</p> <!> <p>Another pain point was procuring GPUs on demand. While Contextual AI had a massive quantity of GPUs reserved with GCP, the research team’s training and prototyping needs took priority. It didn’t make sense for CI to divert resources away from them, which is why <!>, an ML engineer at Contextual AI, wanted to find a reliable external provider.</p> <p>Stas <!>, but didn’t find a good fit. Their CI required at least two GPUs but neither GitHub nor CircleCI provided more than one GPU per job. Furthermore, the GPUs they had available were old, slow, and expensive.</p> <p>Back in his time at Hugging Face, Stas used an AWS on-demand GPU instance to solve this problem, but it wasn’t ideal. Updating the machine image was slow and cumbersome, and it could take 5+ minutes just to get an instance running. Often times CI would fail because no instance could be found, even when he tried searching across multiple availability zones. He wanted to avoid repeating the same mistake at Contextual AI.</p> <h2 id="parallelizable-ci-on-modal-gpus">Parallelizable CI on Modal GPUs</h2> <p>After making a request on Twitter for suggestions, Stas decided to try Modal because he could access flexible configurations of GPUs on-demand. This is what the CI workflow looked like:</p> <ol><li>PR is submitted on GitHub.</li> <li>A GitHub Action is triggered which calls a Modal Function. The Function has multiple GPUs attached and uses an image with custom requirements and <code>pytest</code> installed.</li> <li>The Modal Function invokes <code>pytest</code> as a subprocess to run a suite of tests.</li> <li>The first time the Function runs, Modal builds and caches the custom image. On subsequent runs, no image rebuild is needed, allowing the tests to start running within 30 seconds of job submission.</li></ol> <p>Simplified pattern of CI using Modal:</p> <!> <p>This workflow allowed Contextual AI to fully automate their test suite. As a result, they can maximize their developer iteration speed while maintaining a high quality bar. Other key benefits:</p> <ul><li>GitHub Actions can directly trigger Modal, so there’s no need to manage self-hosted runners.</li> <li>Modal spins up GPUs for each job submission, allowing CI for multiple PRs to run in parallel.</li> <li>Modal bills by usage, which keeps costs low. Because image builds are cached, 99% of what’s billed is actual test run-time.</li></ul> <!> <p>All of this has been enabled by Modal’s custom infrastructure—including our own file system and scheduler—for running containers in the cloud. Modal can spin up GPU-enabled containers in as little as one second, which helps companies iterate fast and scale up to large production workloads.</p> <p>Interested in CI on Modal? Check out our <!>.</p>`,1);function O(t,h){let g=a(h,[`children`,`$$slots`,`$$events`,`$$legacy`]);p(t,o(()=>g,()=>m,{children:(t,a)=>{var o=D(),p=c(s(o),4),m=e(p);f(m,{href:`https://contextual.ai/`,rel:`nofollow`,children:(e,t)=>{l(),i(e,r(`Contextual AI`))},$$slots:{default:!0}}),f(c(m,2),{href:`https://arxiv.org/abs/2005.11401`,rel:`nofollow`,children:(e,t)=>{l(),i(e,r(`RAG technique`))},$$slots:{default:!0}}),l(),n(p);var h=c(p,10);u(h,{authorName:`Stas Bekman`,authorTitle:`ML Engineer at Contextual AI`,children:(e,t)=>{i(e,T())},$$slots:{default:!0}});var g=c(h,2);f(c(e(g)),{href:`https://github.com/stas00/`,rel:`nofollow`,children:(e,t)=>{l(),i(e,r(`Stas Bekman`))},$$slots:{default:!0}}),l(),n(g);var _=c(g,2);f(c(e(_)),{href:`https://x.com/StasBekman/status/1724271487375569269`,rel:`nofollow`,children:(e,t)=>{l(),i(e,r(`searched for CI-on-GPUs options`))},$$slots:{default:!0}}),l(),n(_);var v=c(_,12);d(v,{code:`import%20modal%0A%0Aimage%20%3D%20(%0A%20%20%20%20modal.Image.debian_slim()%0A%20%20%20%20.pip_install(%22pytest%22)%0A%20%20%20%20.pip_install_from_requirements(%22requirements.txt%22)%0A)%0A%0Aapp%20%3D%20modal.App(%22ci-testing%22%2C%20image%3Dimage)%0A%0A%40app.function(gpu%3D%22any%22%2C%20mounts%3D%5Btests%5D)%0Adef%20pytest()%3A%0A%20%20%20%20import%20subprocess%0A%0A%20%20%20%20subprocess.run(%5B%22pytest%22%2C%20%22-vs%22%5D%2C%20check%3DTrue%2C%20cwd%3D%22%2Froot%22)`,lang:`python`});var y=c(v,6);u(y,{authorName:`Stas Bekman`,authorTitle:`ML Engineer at Contextual AI`,children:(e,t)=>{i(e,E())},$$slots:{default:!0}});var b=c(y,4);f(c(e(b)),{href:`https://github.com/modal-labs/ci-on-modal/tree/main`,rel:`nofollow`,children:(e,t)=>{l(),i(e,r(`sample repo`))},$$slots:{default:!0}}),l(),n(b),i(t,o)},$$slots:{default:!0}}))}export{O as default,m as metadata};
//# sourceMappingURL=BDiF7vyZ.js.map
