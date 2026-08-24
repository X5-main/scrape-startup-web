(function(){try{var e=typeof window<`u`?window:typeof global<`u`?global:typeof globalThis<`u`?globalThis:typeof self<`u`?self:{};e.SENTRY_RELEASE={id:`f99fcf9f0a844cc9bd13fdc8e5782b84`};var t=new e.Error().stack;t&&(e._sentryDebugIds=e._sentryDebugIds||{},e._sentryDebugIds[t]=`a345ae1a-c116-44dd-b827-7c8b35196d15`,e._sentryDebugIdIdentifier=`sentry-dbid-a345ae1a-c116-44dd-b827-7c8b35196d15`)}catch{}})();import{$t as e,St as t,Tn as n,Tt as r,bt as i,c as a,d as o,en as s,tn as c,wn as l}from"./F_ixKBiO.js";import"./B1sc9Zdx.js";import"./Bb2deiU3.js";import{a as u,o as d}from"./CPby7b1n.js";import{t as f}from"./BILrvr3I.js";import{t as p}from"./B4L_if842.js";import{t as m}from"./DeWGVqas2.js";var h={toc:[{depth:1,value:`Override Modal resource options (GPU, scaling) at runtime with Cls.with_options`,id:`override-modal-resource-options-gpu-scaling-at-runtime-with-clswith_options`,children:[{depth:2,value:`Setup`,id:`setup`},{depth:2,value:`Defining the class`,id:`defining-the-class`},{depth:2,value:`Using with_options to override configuration`,id:`using-with_options-to-override-configuration`}]}],rawContent:`# Override Modal resource options (GPU, scaling) at runtime with \`Cls.with_options\`

[\`Cls.with_options\`](https://modal.com/docs/reference/modal.Cls#with_options)
lets you override the resource configuration of a
Modal [Cls](https://modal.com/docs/guide/lifecycle-functions) at runtime.
This is useful when the same code needs to run
with different resource allocations -- say, with a GPU or with out,
or with a large [warm pool of containers](https://modal.com/docs/guide/cold-start)
-- at different times -- say, when iterating on code and when in production.

Each call to \`with_options\` returns a new class handle that scales
independently from the original.

## Setup

\`\`\`python
import modal

app = modal.App("example-cls-with-options")


\`\`\`

## Defining the class

We define a simple class with a method that performs a
CPU-bound computation. The class is configured with modest defaults.

\`\`\`python
@app.cls(cpu=1, memory=128, timeout=60)
class Worker:
    @modal.method()
    def compute(self, n: int) -> int:
        import subprocess

        # if GPU available, prints details
        subprocess.Popen("nvidia-smi", shell=True)

        return sum(i * i for i in range(n))


\`\`\`

## Using \`with_options\` to override configuration

We can call \`with_options\` on the class to get a new handle
with different resource settings.

\`\`\`python
@app.local_entrypoint()
def main():
    # Use the default configuration for a light workload
    default_worker = Worker()
    result = default_worker.compute.remote(1_000)
    print(f"Default worker result: {result}")

    # Create a GPU-accelerated variant
    GpuWorker = Worker.with_options(gpu="T4", memory=512)
    gpu_worker = GpuWorker()
    result = gpu_worker.compute.remote(10_000_000)
    print(f"GPU worker result:     {result}")

\`\`\`
`,meta:{title:`Override Modal resource options (GPU, scaling) at runtime with Cls.with_options`,description:`Cls.with_options lets you override the resource configuration of a Modal Cls at runtime. This is useful when the same code needs to run with different resource allocations — say, with a GPU or with out, or with a large warm pool of containers — at different times — say, when iterating on code and when in production.`}},{toc:g,rawContent:_,meta:v}=h,y=t(`Override Modal resource options (GPU, scaling) at runtime with <code>Cls.with_options</code>`,1),b=t(`<code>Cls.with_options</code>`),x=t(`Using <code>with_options</code> to override configuration`,1),S=t(`<!> <p><!> lets you override the resource configuration of a
Modal <!> at runtime.
This is useful when the same code needs to run
with different resource allocations — say, with a GPU or with out,
or with a large <!> — at different times — say, when iterating on code and when in production.</p> <p>Each call to <code>with_options</code> returns a new class handle that scales
independently from the original.</p> <!> <!> <!> <p>We define a simple class with a method that performs a
CPU-bound computation. The class is configured with modest defaults.</p> <!> <!> <p>We can call <code>with_options</code> on the class to get a new handle
with different resource settings.</p> <!>`,1);function C(t,g){let _=a(g,[`children`,`$$slots`,`$$events`,`$$legacy`]);p(t,o(()=>_,()=>h,{children:(t,a)=>{var o=S(),p=s(o);d(p,{id:`override-modal-resource-options-gpu-scaling-at-runtime-with-clswith_options`,children:(e,t)=>{l();var n=y();l(),i(e,n)},$$slots:{default:!0}});var h=c(p,2),g=e(h);m(g,{href:`https://modal.com/docs/reference/modal.Cls#with_options`,rel:`nofollow`,children:(e,t)=>{i(e,b())},$$slots:{default:!0}});var _=c(g,2);m(_,{href:`https://modal.com/docs/guide/lifecycle-functions`,rel:`nofollow`,children:(e,t)=>{l(),i(e,r(`Cls`))},$$slots:{default:!0}}),m(c(_,2),{href:`https://modal.com/docs/guide/cold-start`,rel:`nofollow`,children:(e,t)=>{l(),i(e,r(`warm pool of containers`))},$$slots:{default:!0}}),l(),n(h);var v=c(h,4);u(v,{id:`setup`,children:(e,t)=>{l(),i(e,r(`Setup`))},$$slots:{default:!0}});var C=c(v,2);f(C,{code:`import%20modal%0A%0Aapp%20%3D%20modal.App(%22example-cls-with-options%22)%0A%0A`,lang:`python`});var w=c(C,2);u(w,{id:`defining-the-class`,children:(e,t)=>{l(),i(e,r(`Defining the class`))},$$slots:{default:!0}});var T=c(w,4);f(T,{code:`%40app.cls(cpu%3D1%2C%20memory%3D128%2C%20timeout%3D60)%0Aclass%20Worker%3A%0A%20%20%20%20%40modal.method()%0A%20%20%20%20def%20compute(self%2C%20n%3A%20int)%20-%3E%20int%3A%0A%20%20%20%20%20%20%20%20import%20subprocess%0A%0A%20%20%20%20%20%20%20%20%23%20if%20GPU%20available%2C%20prints%20details%0A%20%20%20%20%20%20%20%20subprocess.Popen(%22nvidia-smi%22%2C%20shell%3DTrue)%0A%0A%20%20%20%20%20%20%20%20return%20sum(i%20*%20i%20for%20i%20in%20range(n))%0A%0A`,lang:`python`});var E=c(T,2);u(E,{id:`using-with_options-to-override-configuration`,children:(e,t)=>{l();var n=x();l(2),i(e,n)},$$slots:{default:!0}}),f(c(E,4),{code:`%40app.local_entrypoint()%0Adef%20main()%3A%0A%20%20%20%20%23%20Use%20the%20default%20configuration%20for%20a%20light%20workload%0A%20%20%20%20default_worker%20%3D%20Worker()%0A%20%20%20%20result%20%3D%20default_worker.compute.remote(1_000)%0A%20%20%20%20print(f%22Default%20worker%20result%3A%20%7Bresult%7D%22)%0A%0A%20%20%20%20%23%20Create%20a%20GPU-accelerated%20variant%0A%20%20%20%20GpuWorker%20%3D%20Worker.with_options(gpu%3D%22T4%22%2C%20memory%3D512)%0A%20%20%20%20gpu_worker%20%3D%20GpuWorker()%0A%20%20%20%20result%20%3D%20gpu_worker.compute.remote(10_000_000)%0A%20%20%20%20print(f%22GPU%20worker%20result%3A%20%20%20%20%20%7Bresult%7D%22)%0A`,lang:`python`}),i(t,o)},$$slots:{default:!0}}))}export{C as default,h as metadata};
//# sourceMappingURL=Dl1z8Oi3.js.map
