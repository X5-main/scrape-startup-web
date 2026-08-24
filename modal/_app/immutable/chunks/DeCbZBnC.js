(function(){try{var e=typeof window<`u`?window:typeof global<`u`?global:typeof globalThis<`u`?globalThis:typeof self<`u`?self:{};e.SENTRY_RELEASE={id:`f99fcf9f0a844cc9bd13fdc8e5782b84`};var t=new e.Error().stack;t&&(e._sentryDebugIds=e._sentryDebugIds||{},e._sentryDebugIds[t]=`d966d21a-098f-4748-a8ac-4bd863a77c60`,e._sentryDebugIdIdentifier=`sentry-dbid-d966d21a-098f-4748-a8ac-4bd863a77c60`)}catch{}})();import{$t as e,St as t,Tn as n,Tt as r,bt as i,c as a,d as o,en as s,tn as c,wn as l}from"./F_ixKBiO.js";import"./B1sc9Zdx.js";import"./Bb2deiU3.js";import{a as u,o as d}from"./CPby7b1n.js";import{t as f}from"./BILrvr3I.js";import{t as p}from"./B4L_if842.js";import{t as m}from"./DeWGVqas2.js";var h={toc:[{depth:1,value:`Fast pull from registry`,id:`fast-pull-from-registry`,children:[{depth:2,value:`How to use estargz`,id:`how-to-use-estargz`},{depth:2,value:`Supported registries`,id:`supported-registries`}]}],rawContent:`# Fast pull from registry

The performance of pulling public and private images from registries into Modal
can be significantly improved by adopting the [eStargz](https://github.com/containerd/stargz-snapshotter/blob/main/docs/estargz.md) compression format.

By applying eStargz compression during your image build and push, Modal will be much
more efficient at pulling down your image from the registry.

## How to use estargz

If you have [Buildkit](https://docs.docker.com/build/buildkit/) version greater than \`0.10.0\`, adopting \`estargz\` is as simple as
adding some flags to your \`docker buildx build\` command:

- \`type=registry\` flag will instruct BuildKit to push the image after building.
  - If you do not push the image from immediately after build and instead attempt to push it later with docker push, the image will be converted to a standard gzip image.
- \`compression=estargz\` specifies that we are using the [eStargz](https://github.com/containerd/stargz-snapshotter/blob/main/docs/estargz.md) compression format.
- \`oci-mediatypes=true\` specifies that we are using the OCI media types, which is required for eStargz.
- \`force-compression=true\` will recompress the entire image and convert the base image to eStargz if it is not already.

\`\`\`bash
docker buildx build --tag "<registry>/<namespace>/<repo>:<version>" \\
--output type=registry,compression=estargz,force-compression=true,oci-mediatypes=true \\
.
\`\`\`

Then reference the container image as normal in your Modal code.

\`\`\`python notest
app = modal.App(
    "example-estargz-pull",
    image=modal.Image.from_registry(
        "public.ecr.aws/modal/estargz-example-images:text-generation-v1-esgz"
    )
)
\`\`\`

At build time you should see the eStargz-enabled puller activate:

\`\`\`
Building image im-TinABCTIf12345ydEwTXYZ

=> Step 0: FROM public.ecr.aws/modal/estargz-example-images:text-generation-v1-esgz
Using estargz to speed up image pull (index loaded in 1.86s)...
Progress: 10% complete... (1.11s elapsed)
Progress: 20% complete... (3.10s elapsed)
Progress: 30% complete... (4.18s elapsed)
Progress: 40% complete... (4.76s elapsed)
Progress: 50% complete... (5.51s elapsed)
Progress: 62% complete... (6.17s elapsed)
Progress: 74% complete... (6.99s elapsed)
Progress: 81% complete... (7.23s elapsed)
Progress: 99% complete... (8.90s elapsed)
Progress: 100% complete... (8.90s elapsed)
Copying image...
Copied image in 5.81s
\`\`\`

## Supported registries

Currently, Modal supports fast estargz pulling images with the following registries:

- AWS Elastic Container Registry (ECR)
- Docker Hub (docker.io)
- Google Artifact Registry (gcr.io, pkg.dev)

We are working on adding support for GitHub Container Registry (ghcr.io).
`,meta:{title:`Fast pull from registry`,description:`The performance of pulling public and private images from registries into Modal can be significantly improved by adopting the eStargz compression format.`}},{toc:g,rawContent:_,meta:v}=h,y=t(`<!> <p>The performance of pulling public and private images from registries into Modal
can be significantly improved by adopting the <!> compression format.</p> <p>By applying eStargz compression during your image build and push, Modal will be much
more efficient at pulling down your image from the registry.</p> <!> <p>If you have <!> version greater than <code>0.10.0</code>, adopting <code>estargz</code> is as simple as
adding some flags to your <code>docker buildx build</code> command:</p> <ul><li><code>type=registry</code> flag will instruct BuildKit to push the image after building. <ul><li>If you do not push the image from immediately after build and instead attempt to push it later with docker push, the image will be converted to a standard gzip image.</li></ul></li> <li><code>compression=estargz</code> specifies that we are using the <!> compression format.</li> <li><code>oci-mediatypes=true</code> specifies that we are using the OCI media types, which is required for eStargz.</li> <li><code>force-compression=true</code> will recompress the entire image and convert the base image to eStargz if it is not already.</li></ul> <!> <p>Then reference the container image as normal in your Modal code.</p> <!> <p>At build time you should see the eStargz-enabled puller activate:</p> <!> <!> <p>Currently, Modal supports fast estargz pulling images with the following registries:</p> <ul><li>AWS Elastic Container Registry (ECR)</li> <li>Docker Hub (docker.io)</li> <li>Google Artifact Registry (gcr.io, pkg.dev)</li></ul> <p>We are working on adding support for GitHub Container Registry (ghcr.io).</p>`,1);function b(t,g){let _=a(g,[`children`,`$$slots`,`$$events`,`$$legacy`]);p(t,o(()=>_,()=>h,{children:(t,a)=>{var o=y(),p=s(o);d(p,{id:`fast-pull-from-registry`,children:(e,t)=>{l(),i(e,r(`Fast pull from registry`))},$$slots:{default:!0}});var h=c(p,2);m(c(e(h)),{href:`https://github.com/containerd/stargz-snapshotter/blob/main/docs/estargz.md`,rel:`nofollow`,children:(e,t)=>{l(),i(e,r(`eStargz`))},$$slots:{default:!0}}),l(),n(h);var g=c(h,4);u(g,{id:`how-to-use-estargz`,children:(e,t)=>{l(),i(e,r(`How to use estargz`))},$$slots:{default:!0}});var _=c(g,2);m(c(e(_)),{href:`https://docs.docker.com/build/buildkit/`,rel:`nofollow`,children:(e,t)=>{l(),i(e,r(`Buildkit`))},$$slots:{default:!0}}),l(7),n(_);var v=c(_,2),b=c(e(v),2);m(c(e(b),2),{href:`https://github.com/containerd/stargz-snapshotter/blob/main/docs/estargz.md`,rel:`nofollow`,children:(e,t)=>{l(),i(e,r(`eStargz`))},$$slots:{default:!0}}),l(),n(b),l(4),n(v);var x=c(v,2);f(x,{code:`docker%20buildx%20build%20--tag%20%22%3Cregistry%3E%2F%3Cnamespace%3E%2F%3Crepo%3E%3A%3Cversion%3E%22%20%5C%0A--output%20type%3Dregistry%2Ccompression%3Destargz%2Cforce-compression%3Dtrue%2Coci-mediatypes%3Dtrue%20%5C%0A.`,lang:`bash`});var S=c(x,4);f(S,{code:`app%20%3D%20modal.App(%0A%20%20%20%20%22example-estargz-pull%22%2C%0A%20%20%20%20image%3Dmodal.Image.from_registry(%0A%20%20%20%20%20%20%20%20%22public.ecr.aws%2Fmodal%2Festargz-example-images%3Atext-generation-v1-esgz%22%0A%20%20%20%20)%0A)`,lang:`python`});var C=c(S,4);f(C,{code:`Building%20image%20im-TinABCTIf12345ydEwTXYZ%0A%0A%3D%3E%20Step%200%3A%20FROM%20public.ecr.aws%2Fmodal%2Festargz-example-images%3Atext-generation-v1-esgz%0AUsing%20estargz%20to%20speed%20up%20image%20pull%20(index%20loaded%20in%201.86s)...%0AProgress%3A%2010%25%20complete...%20(1.11s%20elapsed)%0AProgress%3A%2020%25%20complete...%20(3.10s%20elapsed)%0AProgress%3A%2030%25%20complete...%20(4.18s%20elapsed)%0AProgress%3A%2040%25%20complete...%20(4.76s%20elapsed)%0AProgress%3A%2050%25%20complete...%20(5.51s%20elapsed)%0AProgress%3A%2062%25%20complete...%20(6.17s%20elapsed)%0AProgress%3A%2074%25%20complete...%20(6.99s%20elapsed)%0AProgress%3A%2081%25%20complete...%20(7.23s%20elapsed)%0AProgress%3A%2099%25%20complete...%20(8.90s%20elapsed)%0AProgress%3A%20100%25%20complete...%20(8.90s%20elapsed)%0ACopying%20image...%0ACopied%20image%20in%205.81s`,lang:`text`}),u(c(C,2),{id:`supported-registries`,children:(e,t)=>{l(),i(e,r(`Supported registries`))},$$slots:{default:!0}}),l(6),i(t,o)},$$slots:{default:!0}}))}export{b as default,h as metadata};
//# sourceMappingURL=DeCbZBnC.js.map
