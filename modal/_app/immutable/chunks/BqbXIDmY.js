(function(){try{var e=typeof window<`u`?window:typeof global<`u`?global:typeof globalThis<`u`?globalThis:typeof self<`u`?self:{};e.SENTRY_RELEASE={id:`f99fcf9f0a844cc9bd13fdc8e5782b84`};var t=new e.Error().stack;t&&(e._sentryDebugIds=e._sentryDebugIds||{},e._sentryDebugIds[t]=`50506e5b-383a-485e-952b-9f0ad7fca95f`,e._sentryDebugIdIdentifier=`sentry-dbid-50506e5b-383a-485e-952b-9f0ad7fca95f`)}catch{}})();import{St as e,Tt as t,bt as n,c as r,d as i,en as a,tn as o,wn as s}from"./F_ixKBiO.js";import"./B1sc9Zdx.js";import"./Bb2deiU3.js";import{o as c}from"./CPby7b1n.js";import{t as l}from"./BILrvr3I.js";import{t as u}from"./B4L_if842.js";var d={toc:[{depth:1,value:`Example (inference_map.py)`,id:`example-inference_mappy`}],rawContent:`# Example (inference_map.py)

This is the source code for **01_getting_started.inference_map**.
\`\`\`python
from pathlib import Path

import modal

app = modal.App("example-inference-map")
image = modal.Image.debian_slim().uv_pip_install("transformers[torch]")


@app.function(gpu="h100", image=image)
def chat(prompt: str | None = None) -> list[dict]:
    from transformers import pipeline

    if prompt is None:
        prompt = f"/no_think Read this code.\\n\\n{Path(__file__).read_text()}\\nIn one paragraph, what does the code do?"

    print(prompt)
    context = [{"role": "user", "content": prompt}]

    chatbot = pipeline(model="Qwen/Qwen3-1.7B", device_map="cuda", max_new_tokens=1024)
    result = chatbot(context)
    print(result[0]["generated_text"][-1]["content"])

    return result


@app.local_entrypoint()
def main():
    import glob

    root_dir, examples = Path(__file__).parent.parent, []
    for path in glob.glob("**/*.py", root_dir=root_dir):
        examples.append(
            f"/no_think Read this code.\\n\\n{(root_dir / path).read_text()}\\nIn one paragraph, what does the code do?"
        )

    chat.for_each(examples[:100], ignore_exceptions=True)

\`\`\`
`,meta:{title:`Example (inference_map.py)`,description:`This is the source code for 01_getting_started.inference_map.`}},{toc:f,rawContent:p,meta:m}=d,h=e(`<!> <p>This is the source code for <strong>01_getting_started.inference_map</strong>.</p> <!>`,1);function g(e,f){let p=r(f,[`children`,`$$slots`,`$$events`,`$$legacy`]);u(e,i(()=>p,()=>d,{children:(e,r)=>{var i=h(),u=a(i);c(u,{id:`example-inference_mappy`,children:(e,r)=>{s(),n(e,t(`Example (inference_map.py)`))},$$slots:{default:!0}}),l(o(u,4),{code:`from%20pathlib%20import%20Path%0A%0Aimport%20modal%0A%0Aapp%20%3D%20modal.App(%22example-inference-map%22)%0Aimage%20%3D%20modal.Image.debian_slim().uv_pip_install(%22transformers%5Btorch%5D%22)%0A%0A%0A%40app.function(gpu%3D%22h100%22%2C%20image%3Dimage)%0Adef%20chat(prompt%3A%20str%20%7C%20None%20%3D%20None)%20-%3E%20list%5Bdict%5D%3A%0A%20%20%20%20from%20transformers%20import%20pipeline%0A%0A%20%20%20%20if%20prompt%20is%20None%3A%0A%20%20%20%20%20%20%20%20prompt%20%3D%20f%22%2Fno_think%20Read%20this%20code.%5Cn%5Cn%7BPath(__file__).read_text()%7D%5CnIn%20one%20paragraph%2C%20what%20does%20the%20code%20do%3F%22%0A%0A%20%20%20%20print(prompt)%0A%20%20%20%20context%20%3D%20%5B%7B%22role%22%3A%20%22user%22%2C%20%22content%22%3A%20prompt%7D%5D%0A%0A%20%20%20%20chatbot%20%3D%20pipeline(model%3D%22Qwen%2FQwen3-1.7B%22%2C%20device_map%3D%22cuda%22%2C%20max_new_tokens%3D1024)%0A%20%20%20%20result%20%3D%20chatbot(context)%0A%20%20%20%20print(result%5B0%5D%5B%22generated_text%22%5D%5B-1%5D%5B%22content%22%5D)%0A%0A%20%20%20%20return%20result%0A%0A%0A%40app.local_entrypoint()%0Adef%20main()%3A%0A%20%20%20%20import%20glob%0A%0A%20%20%20%20root_dir%2C%20examples%20%3D%20Path(__file__).parent.parent%2C%20%5B%5D%0A%20%20%20%20for%20path%20in%20glob.glob(%22**%2F*.py%22%2C%20root_dir%3Droot_dir)%3A%0A%20%20%20%20%20%20%20%20examples.append(%0A%20%20%20%20%20%20%20%20%20%20%20%20f%22%2Fno_think%20Read%20this%20code.%5Cn%5Cn%7B(root_dir%20%2F%20path).read_text()%7D%5CnIn%20one%20paragraph%2C%20what%20does%20the%20code%20do%3F%22%0A%20%20%20%20%20%20%20%20)%0A%0A%20%20%20%20chat.for_each(examples%5B%3A100%5D%2C%20ignore_exceptions%3DTrue)%0A`,lang:`python`}),n(e,i)},$$slots:{default:!0}}))}export{g as default,d as metadata};
//# sourceMappingURL=BqbXIDmY.js.map
