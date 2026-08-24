(function(){try{var e=typeof window<`u`?window:typeof global<`u`?global:typeof globalThis<`u`?globalThis:typeof self<`u`?self:{};e.SENTRY_RELEASE={id:`f99fcf9f0a844cc9bd13fdc8e5782b84`};var t=new e.Error().stack;t&&(e._sentryDebugIds=e._sentryDebugIds||{},e._sentryDebugIds[t]=`0cd4b64d-67b7-42b1-a498-1ec68c991759`,e._sentryDebugIdIdentifier=`sentry-dbid-0cd4b64d-67b7-42b1-a498-1ec68c991759`)}catch{}})();import{$t as e,D as t,Ft as n,Gt as r,Kt as i,L as a,Nt as o,Ot as s,St as c,Tn as l,V as u,X as d,_n as f,bt as p,cn as m,fn as h,in as g,l as _,on as v,qt as y,tn as b,vn as x,wn as S}from"./F_ixKBiO.js";import"./B1sc9Zdx.js";import"./Bb2deiU3.js";import{t as C}from"./D50tZgPS.js";var w=c(`<div class="h-full w-full rounded-xl bg-cover bg-center p-4 sm:p-7"><form class="bg-light-green/60 backdrop-blur-xs flex h-10 w-full rounded-full"><input type="text" placeholder="Type an image prompt (e.g. blue tulips)" class="bg-transparent! placeholder:text-black/50! focus:ring-0! h-full w-full min-w-0 grow border-none pl-6 pr-2 text-sm text-black"/> <div class="p-0.5"><button type="submit" class="text-light-green focus:outline-hidden h-full rounded-full bg-black px-6 text-sm transition-colors transition-transform hover:bg-gray-800 active:scale-[97%]">Generate</button></div></form></div>`);function T(c,m){x(m,!1);let h=_(m,`prompt`,12,``),b=g(`https://modal-cdn.com/landing-image-generation-default-tulips.webp`),C=0,T=1;async function E(e){let t=T++,n=await(await fetch(`https://modal-labs--flux-schnell-flash-model.us-east.modal.direct/?prompt=${encodeURIComponent(e)}`,{method:`GET`})).blob();t>C&&(v(b,URL.createObjectURL(n)),C=t)}let D=0,O=0;async function k(e){D++,O=Date.now();try{await E(e)}finally{D--}}let A;function j(e){clearTimeout(A);let t=Date.now(),n=100*2**D;if(O+n<=t)k(e);else{let r=O+n-t;A=setTimeout(()=>{k(e)},r)}}let M=g(!0);r(()=>(n(M),o(h())),()=>{n(M)?v(M,!1):j(h())}),i();var N=w(),P=e(N),F=e(P);u(F),S(2),l(P),l(N),y(()=>d(N,`background-image: url(${n(b)??``})`)),a(F,h),s(`submit`,P,t(()=>j(h()))),p(c,N),f()}var E=c(`<div class="flex flex-col items-center gap-y-4 md:gap-y-8 lg:flex-row lg:items-stretch lg:gap-x-8 xl:gap-x-12"><div class="h-80 w-full max-w-[600px] lg:h-auto lg:flex-1"><!></div> <div class="w-full rounded-full lg:flex-1"><!></div></div>`);function D(t){let r=m(``),i=h(()=>n(r).length>52?n(r).slice(0,49)+`...`:n(r)),a=h(()=>`import modal

MODEL_NAME = "black-forest-labs/FLUX.1-schnell"
image = (
    modal.Image.from_registry("nvidia/cuda:12.4.0-devel-ubuntu22.04")
    .pip_install("torch", "transformers", "diffusers", ...)
)
volume = modal.Volume.from_name("flux-lora-models")

@app.cls(gpu="H100", image=image, volumes={"/loras": volume})
class FluxWithLoRA:
    @modal.enter()
    def setup(self):
        self.pipeline = FluxPipeline.from_pretrained(MODEL_NAME).to("cuda")
        self.pipeline.load_and_fuse_lora()

    @modal.method()
    def generate_image(self, prompt: str):
        return self.pipeline(prompt).images[0]

flux = FluxWithLoRA()
flux.generate_image.remote("${n(i)}")`);var o=E(),s=e(o);T(e(s),{get prompt(){return n(r)},set prompt(e){v(r,e,!0)}}),l(s);var c=b(s,2),u=e(c);{let e=h(()=>n(a).split(`
`));C(u,{get source(){return n(e)},lang:`python`})}l(c),l(o),p(t,o)}export{D as t};
//# sourceMappingURL=DtUgWlUE2.js.map
