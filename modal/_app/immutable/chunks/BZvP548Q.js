(function(){try{var e=typeof window<`u`?window:typeof global<`u`?global:typeof globalThis<`u`?globalThis:typeof self<`u`?self:{};e.SENTRY_RELEASE={id:`f99fcf9f0a844cc9bd13fdc8e5782b84`};var t=new e.Error().stack;t&&(e._sentryDebugIds=e._sentryDebugIds||{},e._sentryDebugIds[t]=`98caeb0d-ef3b-4171-a26e-c11fb114d124`,e._sentryDebugIdIdentifier=`sentry-dbid-98caeb0d-ef3b-4171-a26e-c11fb114d124`)}catch{}})();import{$t as e,St as t,Tn as n,Tt as r,bt as i,c as a,d as o,en as s,tn as c,wn as l}from"./F_ixKBiO.js";import"./B1sc9Zdx.js";import"./Bb2deiU3.js";import{n as u}from"./JPsrybyr.js";import{t as d}from"./DeWGVqas2.js";import{t as f}from"./CdZDxCfO2.js";var p={title:`What is Flux Dev?`,description:`Learn about the most popular text-to-image diffusion model on the market`,authors:[{name:`Kenny Ning`,avatarUrl:`https://modal-cdn.com/kenny-ning.jpg`,jobTitle:`Growth Engineer`,twitterHandle:`kenny_ning`}],date:`2024-10-17T12:00:00.000Z`,length:`3 minute read`,category:`Article`,subcategory:`Image and Video Models`,published:!0,layout:`blog`,toc:[{depth:2,value:`Is Flux Dev free to use?`,id:`is-flux-dev-free-to-use`},{depth:2,value:`Is Flux Pro free to use?`,id:`is-flux-pro-free-to-use`},{depth:2,value:`Is Flux Schnell free to use?`,id:`is-flux-schnell-free-to-use`},{depth:2,value:`How do you run Flux?`,id:`how-do-you-run-flux`},{depth:2,value:`Conclusion`,id:`conclusion`}],rawContent:`[Flux Dev](https://huggingface.co/black-forest-labs/FLUX.1-dev) is a state-of-the-art 12 billion parameter text-to-image model developed by Black Forest Labs. Released in August 2024, it has rapidly gained momentum in just a few short months as the go-to choice for AI artists and developers seeking high-quality image generation capabilities.

Here are some examples of Flux Dev generated images we created on Modal via ComfyUI:

<div class="flex flex-row gap-5">
  <figure>
    <img src="https://modal-cdn.com/flux-dev/cat.png" alt="cat" class="w-full">
    <figcaption>
      A cat holding a sign that says "FLUX DEV"
    </figcaption>
  </figure>
  <figure>
    <img src="https://modal-cdn.com/flux-dev/city.png" alt="city" class="w-full">
    <figcaption>
      A dystopian cityscape with purplish atmosphere and dilapidated skyscrapers, depicted in a science fiction style
    </figcaption>
  </figure>
  <figure>
    <img src="https://modal-cdn.com/flux-dev/beach.png" alt="beach" class="w-full">
    <figcaption>
      Traditional chinese ink painting of a beautiful beach
    </figcaption>
  </figure>
</div>

Flux Dev is part of a suite of text-to-image models released by Black Forest Labs. This table outlines their core differences:

| Model        | Description                             | Open weights | License required for commercial application |
| ------------ | --------------------------------------- | ------------ | ------------------------------------------- |
| Flux Pro     | Flagship, most detailed model           | No           | Yes                                         |
| Flux Dev     | Balanced model between detail and speed | Yes          | Yes                                         |
| Flux Schnell | Fastest model with less detail          | Yes          | No                                          |

## Is Flux Dev free to use?

Yes, Flux Dev is free to use (inference and fine-tuning) for non-commercial use cases, which includes:

- Research and experimentation, including personal hobby projects
- Non-production use cases at for-profit companies
- Charitable organizations

If you intend to use Flux for revenue-generating, production use cases though, you need to either:

- Access the model through an [approved partner](https://blackforestlabs.ai/)
- Reach out to Black Forest Labs directly for a commercial license, which will be subject to some kind of fee or revenue sharing agreement

You can read the [official license](https://github.com/black-forest-labs/flux/blob/main/model_licenses/LICENSE-FLUX1-dev) on their Github.

## Is Flux Pro free to use?

No, Flux Pro is not free to use and completely closed-source. To access it, you need to [create an account](https://docs.bfl.ml/quick_start/create_account/) with Black Forest Labs directly or use one of their approved partners.

## Is Flux Schnell free to use?

Yes, Flux Schnell is not only free to use but also free to use and fine-tune for commercial purposes under the Apache 2.0 license. You can read the [official license](https://github.com/black-forest-labs/flux/blob/main/model_licenses/LICENSE-FLUX1-schnell) on their Github.

## How do you run Flux?

You can run Flux in the following ways:

- ComfyUI: great for prototyping and those who prefer a more visual interface
- Diffusers: you can directly import \`FluxPipeline\` for convenient inference in your app (see our [Flux Schnell example](/docs/examples/flux))
- Fine-tuning: you can fine-tune Flux for your specific use case (see our [Dreambooth pet art example](/docs/examples/diffusers_lora_finetune))

## Conclusion

Flux Dev has effectively succeeded Stable Diffusion as the best open-weight diffusion model today for AI image generation. It's a great choice for your image generation needs, but if you plan on serving or fine-tuning Flux Dev for revenue-generating, production use cases, you need to make sure to do it via an approved partner or have a direct agreement in place with Black Forest Labs. Alternatively, you can use Flux Schnell which has a very broad and generous license for commercial applications.
`,meta:{description:`Learn about the most popular text-to-image diffusion model on the market`}},{title:m,description:h,authors:g,date:_,length:v,category:y,subcategory:b,published:x,layout:S,toc:C,rawContent:w,meta:T}=p,E=t(`<thead><tr><th>Model</th><th>Description</th><th>Open weights</th><th>License required for commercial application</th></tr></thead> <tbody><tr><td>Flux Pro</td><td>Flagship, most detailed model</td><td>No</td><td>Yes</td></tr><tr><td>Flux Dev</td><td>Balanced model between detail and speed</td><td>Yes</td><td>Yes</td></tr><tr><td>Flux Schnell</td><td>Fastest model with less detail</td><td>Yes</td><td>No</td></tr></tbody>`,1),D=t(`<p><!> is a state-of-the-art 12 billion parameter text-to-image model developed by Black Forest Labs. Released in August 2024, it has rapidly gained momentum in just a few short months as the go-to choice for AI artists and developers seeking high-quality image generation capabilities.</p> <p>Here are some examples of Flux Dev generated images we created on Modal via ComfyUI:</p> <div class="flex flex-row gap-5"><figure><img src="https://modal-cdn.com/flux-dev/cat.png" alt="cat" class="w-full"/> <figcaption>A cat holding a sign that says "FLUX DEV"</figcaption></figure> <figure><img src="https://modal-cdn.com/flux-dev/city.png" alt="city" class="w-full"/> <figcaption>A dystopian cityscape with purplish atmosphere and dilapidated skyscrapers, depicted in a science fiction style</figcaption></figure> <figure><img src="https://modal-cdn.com/flux-dev/beach.png" alt="beach" class="w-full"/> <figcaption>Traditional chinese ink painting of a beautiful beach</figcaption></figure></div> <p>Flux Dev is part of a suite of text-to-image models released by Black Forest Labs. This table outlines their core differences:</p> <!> <h2 id="is-flux-dev-free-to-use">Is Flux Dev free to use?</h2> <p>Yes, Flux Dev is free to use (inference and fine-tuning) for non-commercial use cases, which includes:</p> <ul><li>Research and experimentation, including personal hobby projects</li> <li>Non-production use cases at for-profit companies</li> <li>Charitable organizations</li></ul> <p>If you intend to use Flux for revenue-generating, production use cases though, you need to either:</p> <ul><li>Access the model through an <!></li> <li>Reach out to Black Forest Labs directly for a commercial license, which will be subject to some kind of fee or revenue sharing agreement</li></ul> <p>You can read the <!> on their Github.</p> <h2 id="is-flux-pro-free-to-use">Is Flux Pro free to use?</h2> <p>No, Flux Pro is not free to use and completely closed-source. To access it, you need to <!> with Black Forest Labs directly or use one of their approved partners.</p> <h2 id="is-flux-schnell-free-to-use">Is Flux Schnell free to use?</h2> <p>Yes, Flux Schnell is not only free to use but also free to use and fine-tune for commercial purposes under the Apache 2.0 license. You can read the <!> on their Github.</p> <h2 id="how-do-you-run-flux">How do you run Flux?</h2> <p>You can run Flux in the following ways:</p> <ul><li>ComfyUI: great for prototyping and those who prefer a more visual interface</li> <li>Diffusers: you can directly import <code>FluxPipeline</code> for convenient inference in your app (see our <!>)</li> <li>Fine-tuning: you can fine-tune Flux for your specific use case (see our <!>)</li></ul> <h2 id="conclusion">Conclusion</h2> <p>Flux Dev has effectively succeeded Stable Diffusion as the best open-weight diffusion model today for AI image generation. It’s a great choice for your image generation needs, but if you plan on serving or fine-tuning Flux Dev for revenue-generating, production use cases, you need to make sure to do it via an approved partner or have a direct agreement in place with Black Forest Labs. Alternatively, you can use Flux Schnell which has a very broad and generous license for commercial applications.</p>`,1);function O(t,m){let h=a(m,[`children`,`$$slots`,`$$events`,`$$legacy`]);f(t,o(()=>h,()=>p,{children:(t,a)=>{var o=D(),f=s(o);d(e(f),{href:`https://huggingface.co/black-forest-labs/FLUX.1-dev`,rel:`nofollow`,children:(e,t)=>{l(),i(e,r(`Flux Dev`))},$$slots:{default:!0}}),l(),n(f);var p=c(f,8);u(p,{children:(e,t)=>{var n=E();l(2),i(e,n)},$$slots:{default:!0}});var m=c(p,10),h=e(m);d(c(e(h)),{href:`https://blackforestlabs.ai/`,rel:`nofollow`,children:(e,t)=>{l(),i(e,r(`approved partner`))},$$slots:{default:!0}}),n(h),l(2),n(m);var g=c(m,2);d(c(e(g)),{href:`https://github.com/black-forest-labs/flux/blob/main/model_licenses/LICENSE-FLUX1-dev`,rel:`nofollow`,children:(e,t)=>{l(),i(e,r(`official license`))},$$slots:{default:!0}}),l(),n(g);var _=c(g,4);d(c(e(_)),{href:`https://docs.bfl.ml/quick_start/create_account/`,rel:`nofollow`,children:(e,t)=>{l(),i(e,r(`create an account`))},$$slots:{default:!0}}),l(),n(_);var v=c(_,4);d(c(e(v)),{href:`https://github.com/black-forest-labs/flux/blob/main/model_licenses/LICENSE-FLUX1-schnell`,rel:`nofollow`,children:(e,t)=>{l(),i(e,r(`official license`))},$$slots:{default:!0}}),l(),n(v);var y=c(v,6),b=c(e(y),2);d(c(e(b),3),{href:`/docs/examples/flux`,children:(e,t)=>{l(),i(e,r(`Flux Schnell example`))},$$slots:{default:!0}}),l(),n(b);var x=c(b,2);d(c(e(x)),{href:`/docs/examples/diffusers_lora_finetune`,children:(e,t)=>{l(),i(e,r(`Dreambooth pet art example`))},$$slots:{default:!0}}),l(),n(x),n(y),l(4),i(t,o)},$$slots:{default:!0}}))}export{O as default,p as metadata};
//# sourceMappingURL=BZvP548Q.js.map
