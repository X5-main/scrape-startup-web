(function(){try{var e=typeof window<`u`?window:typeof global<`u`?global:typeof globalThis<`u`?globalThis:typeof self<`u`?self:{};e.SENTRY_RELEASE={id:`f99fcf9f0a844cc9bd13fdc8e5782b84`};var t=new e.Error().stack;t&&(e._sentryDebugIds=e._sentryDebugIds||{},e._sentryDebugIds[t]=`be128ead-413a-4d28-8c82-bfc5f8290965`,e._sentryDebugIdIdentifier=`sentry-dbid-be128ead-413a-4d28-8c82-bfc5f8290965`)}catch{}})();import{$t as e,St as t,Tn as n,Tt as r,bt as i,c as a,d as o,en as s,tn as c,wn as l}from"./F_ixKBiO.js";import"./B1sc9Zdx.js";import"./Bb2deiU3.js";import{t as u}from"./JPsrybyr.js";import{t as d}from"./BILrvr3I.js";import{t as f}from"./DeWGVqas2.js";import"./DBIL8FrF.js";import{t as p}from"./CdZDxCfO2.js";var m={title:`Product updates: L40Ss, proxy auth tokens, and sandbox disk snapshotting`,description:`Welcome to another round of Modal Product Updates! Here's what's new this month.`,date:`2025-01-21T12:00:00.000Z`,published:!0,length:`5 minute read`,category:`News`,layout:`blog`,toc:[{depth:2,value:`🚀 Introducing L40S GPUs`,id:`-introducing-l40s-gpus`},{depth:2,value:`🔒\xA0Proxy Auth Tokens`,id:`proxy-auth-tokens`},{depth:2,value:`📷\xA0File System API and Disk Snapshotting for Sandboxes`,id:`file-system-api-and-disk-snapshotting-for-sandboxes`},{depth:2,value:`👩‍💻 Client Updates`,id:`-client-updates`},{depth:2,value:`🔐 SOC 2 Type 2 Certification`,id:`-soc-2-type-2-certification`},{depth:2,value:`📚 GPU Glossary`,id:`-gpu-glossary`},{depth:2,value:`🧬 New computational bio, OCR, and image diffusion resources`,id:`-new-computational-bio-ocr-and-image-diffusion-resources`},{depth:2,value:`🍭 Fun Tidbits`,id:`-fun-tidbits`}],rawContent:`## 🚀 Introducing L40S GPUs

NVIDIA L40S GPUs are [now available](/blog/introducing-l40s) on Modal at $1.95/hr! With 48GB of DDR6 RAM and impressive CUDA and Tensor Core performance, the L40S offers significant advantages over our popular A10 GPUs:

- 2x more memory for running larger models and longer contexts
- Up to 40% faster for memory-bound tasks
- Over 100% speedup for compute-bound jobs using 16bit Tensor Cores

Try it now by adding this decorator to your function: \`@app.function(gpu="L40S")\`

![https://modal-cdn.com/l40s-benchmark.svg](https://modal-cdn.com/l40s-benchmark.svg)

## 🔒\xA0Proxy Auth Tokens

Modal now supports [Proxy Auth tokens](/docs/guide/webhook-proxy-auth) for authenticating access to web endpoints! This means you can gate access to web endpoints and prevent unwanted usage from incurring charges.

\`\`\`python
@app.function(gpu="h100")
@modal.web_endpoint(requires_proxy_auth=True, docs=False)
def expensive_secret():
    return "I didn't care for 'The Godfather'. It insists upon itself."
\`\`\`

## 📷\xA0File System API and Disk Snapshotting for Sandboxes

The new [Filesystem API](/docs/guide/sandbox-files) makes it seamless to read and write files in your Sandbox, and is especially good for getting files in and out of a Sandbox interactively.

\`\`\`python
sb = modal.Sandbox.create(app=app)

filepath = "/home/foo.bin"
with sb.open(filepath, "wb") as f:
    f.write(b"Hello, World!")

f = sb.open(filepath)
print(f.read())
\`\`\`

We are also introducing [disk](/docs/guide/sandbox-snapshots) capabilities for Sandboxes, expanding on our existing function snapshotting feature. This enables you to:

1. Create snapshots of your Sandbox's entire state
2. Branch off from any snapshot to create new Sandbox instances
3. Eliminate cold-start times by restoring from snapshots

## 👩‍💻 Client Updates

Run \`pip install --upgrade modal\` to get the latest updates. Here are some of the highlights:

- **Images:** When using \`Image.from_dockerfile()\` or \`image.dockerfile_commands()\`, the system will now automatically look for and use a \`.dockerignore\` file.
- **Images:**\`FilePatternMatcher\`\xA0has a [new constructor](/docs/reference/modal.FilePatternMatcher#from_file)\xA0\`from_file\`\xA0which allows you to read file matching patterns from a file instead of having to pass them in directly.
- **Volumes:** Modal Volumes can now be [renamed](/docs/reference/cli/volume#modal-volume-rename) via the CLI (\`modal volume rename\`) or SDK (\`modal.Volume.rename\`).
- **Sandboxes**: Sandboxes now support \`fsnotify-like\` file watching and accept larger write payloads up to 1 GiB
- **Environment:** The\`App.run\` context manager has a new \`environment_name\` [parameter](/docs/reference/modal.App#run).
- **VSCode:** You can now point\xA0\`modal launch vscode\`\xA0at an arbitrary Dockerhub base image:

\`modal launch vscode --image=nvidia/cuda:12.4.0-devel-ubuntu22.04\`

## 🔐 SOC 2 Type 2 Certification

We're pleased to announce [the completion of our SOC 2 Type 2 certification](/blog/soc2type2). If you would like to see the report or have more questions, please email [security@modal.com](mailto:security@modal.com).

## 📚 GPU Glossary

![https://modal-cdn.com/cdnbot/gpu-glossary-streaming-multiprocessor48kg_mtn_a0e1fe04.webp](https://modal-cdn.com/cdnbot/gpu-glossary-streaming-multiprocessor48kg_mtn_a0e1fe04.webp)

We work a lot with GPUs, and if you do too you probably know how hard it can be to find the information you need in the public documentation. So we put together a handy [GPU Glossary](https://modal.com/gpu-glossary) that collects together quick explanations and high-quality resources for everything from Tensor Cores and Warp Schedulers to Compute Capabilities and the CUDA Toolkit.

## 🧬 New computational bio, OCR, and image diffusion resources

![image.png](https://modal-cdn.com/cdnbot/e3m3-predicted-structureihuxe_c3_90f6339f.webp)

- **ESM3**: recent model from Evolutionary Scale that can not only predict protein structures from sequences but also generate new proteins. [Protein folding dashboard example on Modal](/docs/examples/esm3).
- **GOT:** a 580M parameter OCR model that can better handle a variety of content formats. [Example on Modal](/docs/examples/doc_ocr_jobs).
- ICYMI, we hosted a webinar recently covering best practices on productionizing diffusion models. [Here’s the video](https://www.youtube.com/watch?v=iiuFht5VhGg).

## 🍭 Fun Tidbits

- We've been hosting exclusive dinners for biotech founders and engineers! Reach out if you'd like to join our next one.
`,meta:{description:`Welcome to another round of Modal Product Updates! Here's what's new this month.`}},{title:h,description:g,date:_,published:v,length:y,category:b,layout:x,toc:S,rawContent:C,meta:w}=m,T=t(`<h2 id="-introducing-l40s-gpus">🚀 Introducing L40S GPUs</h2> <p>NVIDIA L40S GPUs are <!> on Modal at $1.95/hr! With 48GB of DDR6 RAM and impressive CUDA and Tensor Core performance, the L40S offers significant advantages over our popular A10 GPUs:</p> <ul><li>2x more memory for running larger models and longer contexts</li> <li>Up to 40% faster for memory-bound tasks</li> <li>Over 100% speedup for compute-bound jobs using 16bit Tensor Cores</li></ul> <p>Try it now by adding this decorator to your function: <code>@app.function(gpu="L40S")</code></p> <p><!></p> <h2 id="proxy-auth-tokens">🔒\xA0Proxy Auth Tokens</h2> <p>Modal now supports <!> for authenticating access to web endpoints! This means you can gate access to web endpoints and prevent unwanted usage from incurring charges.</p> <!> <h2 id="file-system-api-and-disk-snapshotting-for-sandboxes">📷\xA0File System API and Disk Snapshotting for Sandboxes</h2> <p>The new <!> makes it seamless to read and write files in your Sandbox, and is especially good for getting files in and out of a Sandbox interactively.</p> <!> <p>We are also introducing <!> capabilities for Sandboxes, expanding on our existing function snapshotting feature. This enables you to:</p> <ol><li>Create snapshots of your Sandbox’s entire state</li> <li>Branch off from any snapshot to create new Sandbox instances</li> <li>Eliminate cold-start times by restoring from snapshots</li></ol> <h2 id="-client-updates">👩‍💻 Client Updates</h2> <p>Run <code>pip install --upgrade modal</code> to get the latest updates. Here are some of the highlights:</p> <ul><li><strong>Images:</strong> When using <code>Image.from_dockerfile()</code> or <code>image.dockerfile_commands()</code>, the system will now automatically look for and use a <code>.dockerignore</code> file.</li> <li><strong>Images:</strong><code>FilePatternMatcher</code>\xA0has a <!>\xA0<code>from_file</code>\xA0which allows you to read file matching patterns from a file instead of having to pass them in directly.</li> <li><strong>Volumes:</strong> Modal Volumes can now be <!> via the CLI (<code>modal volume rename</code>) or SDK (<code>modal.Volume.rename</code>).</li> <li><strong>Sandboxes</strong>: Sandboxes now support <code>fsnotify-like</code> file watching and accept larger write payloads up to 1 GiB</li> <li><strong>Environment:</strong> The<code>App.run</code> context manager has a new <code>environment_name</code> <!>.</li> <li><strong>VSCode:</strong> You can now point\xA0<code>modal launch vscode</code>\xA0at an arbitrary Dockerhub base image:</li></ul> <p><code>modal launch vscode --image=nvidia/cuda:12.4.0-devel-ubuntu22.04</code></p> <h2 id="-soc-2-type-2-certification">🔐 SOC 2 Type 2 Certification</h2> <p>We’re pleased to announce <!>. If you would like to see the report or have more questions, please email <!>.</p> <h2 id="-gpu-glossary">📚 GPU Glossary</h2> <p><!></p> <p>We work a lot with GPUs, and if you do too you probably know how hard it can be to find the information you need in the public documentation. So we put together a handy <!> that collects together quick explanations and high-quality resources for everything from Tensor Cores and Warp Schedulers to Compute Capabilities and the CUDA Toolkit.</p> <h2 id="-new-computational-bio-ocr-and-image-diffusion-resources">🧬 New computational bio, OCR, and image diffusion resources</h2> <p><!></p> <ul><li><strong>ESM3</strong>: recent model from Evolutionary Scale that can not only predict protein structures from sequences but also generate new proteins. <!>.</li> <li><strong>GOT:</strong> a 580M parameter OCR model that can better handle a variety of content formats. <!>.</li> <li>ICYMI, we hosted a webinar recently covering best practices on productionizing diffusion models. <!>.</li></ul> <h2 id="-fun-tidbits">🍭 Fun Tidbits</h2> <ul><li>We’ve been hosting exclusive dinners for biotech founders and engineers! Reach out if you’d like to join our next one.</li></ul>`,1);function E(t,h){let g=a(h,[`children`,`$$slots`,`$$events`,`$$legacy`]);p(t,o(()=>g,()=>m,{children:(t,a)=>{var o=T(),p=c(s(o),2);f(c(e(p)),{href:`/blog/introducing-l40s`,children:(e,t)=>{l(),i(e,r(`now available`))},$$slots:{default:!0}}),l(),n(p);var m=c(p,6);u(e(m),{src:`https://modal-cdn.com/l40s-benchmark.svg`,alt:`https://modal-cdn.com/l40s-benchmark.svg`}),n(m);var h=c(m,4);f(c(e(h)),{href:`/docs/guide/webhook-proxy-auth`,children:(e,t)=>{l(),i(e,r(`Proxy Auth tokens`))},$$slots:{default:!0}}),l(),n(h);var g=c(h,2);d(g,{code:`%40app.function(gpu%3D%22h100%22)%0A%40modal.web_endpoint(requires_proxy_auth%3DTrue%2C%20docs%3DFalse)%0Adef%20expensive_secret()%3A%0A%20%20%20%20return%20%22I%20didn't%20care%20for%20'The%20Godfather'.%20It%20insists%20upon%20itself.%22`,lang:`python`});var _=c(g,4);f(c(e(_)),{href:`/docs/guide/sandbox-files`,children:(e,t)=>{l(),i(e,r(`Filesystem API`))},$$slots:{default:!0}}),l(),n(_);var v=c(_,2);d(v,{code:`sb%20%3D%20modal.Sandbox.create(app%3Dapp)%0A%0Afilepath%20%3D%20%22%2Fhome%2Ffoo.bin%22%0Awith%20sb.open(filepath%2C%20%22wb%22)%20as%20f%3A%0A%20%20%20%20f.write(b%22Hello%2C%20World!%22)%0A%0Af%20%3D%20sb.open(filepath)%0Aprint(f.read())`,lang:`python`});var y=c(v,2);f(c(e(y)),{href:`/docs/guide/sandbox-snapshots`,children:(e,t)=>{l(),i(e,r(`disk`))},$$slots:{default:!0}}),l(),n(y);var b=c(y,8),x=c(e(b),2);f(c(e(x),3),{href:`/docs/reference/modal.FilePatternMatcher#from_file`,children:(e,t)=>{l(),i(e,r(`new constructor`))},$$slots:{default:!0}}),l(3),n(x);var S=c(x,2);f(c(e(S),2),{href:`/docs/reference/cli/volume#modal-volume-rename`,children:(e,t)=>{l(),i(e,r(`renamed`))},$$slots:{default:!0}}),l(5),n(S);var C=c(S,4);f(c(e(C),6),{href:`/docs/reference/modal.App#run`,children:(e,t)=>{l(),i(e,r(`parameter`))},$$slots:{default:!0}}),l(),n(C),l(2),n(b);var w=c(b,6),E=c(e(w));f(E,{href:`/blog/soc2type2`,children:(e,t)=>{l(),i(e,r(`the completion of our SOC 2 Type 2 certification`))},$$slots:{default:!0}}),f(c(E,2),{href:`mailto:security@modal.com`,children:(e,t)=>{l(),i(e,r(`security@modal.com`))},$$slots:{default:!0}}),l(),n(w);var D=c(w,4);u(e(D),{src:`https://modal-cdn.com/cdnbot/gpu-glossary-streaming-multiprocessor48kg_mtn_a0e1fe04.webp`,alt:`https://modal-cdn.com/cdnbot/gpu-glossary-streaming-multiprocessor48kg_mtn_a0e1fe04.webp`}),n(D);var O=c(D,2);f(c(e(O)),{href:`https://modal.com/gpu-glossary`,rel:`nofollow`,children:(e,t)=>{l(),i(e,r(`GPU Glossary`))},$$slots:{default:!0}}),l(),n(O);var k=c(O,4);u(e(k),{src:`https://modal-cdn.com/cdnbot/e3m3-predicted-structureihuxe_c3_90f6339f.webp`,alt:`image.png`}),n(k);var A=c(k,2),j=e(A);f(c(e(j),2),{href:`/docs/examples/esm3`,children:(e,t)=>{l(),i(e,r(`Protein folding dashboard example on Modal`))},$$slots:{default:!0}}),l(),n(j);var M=c(j,2);f(c(e(M),2),{href:`/docs/examples/doc_ocr_jobs`,children:(e,t)=>{l(),i(e,r(`Example on Modal`))},$$slots:{default:!0}}),l(),n(M);var N=c(M,2);f(c(e(N)),{href:`https://www.youtube.com/watch?v=iiuFht5VhGg`,rel:`nofollow`,children:(e,t)=>{l(),i(e,r(`Here’s the video`))},$$slots:{default:!0}}),l(),n(N),n(A),l(4),i(t,o)},$$slots:{default:!0}}))}export{E as default,m as metadata};
//# sourceMappingURL=RHH5zeDy.js.map
