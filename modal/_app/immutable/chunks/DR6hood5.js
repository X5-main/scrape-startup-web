(function(){try{var e=typeof window<`u`?window:typeof global<`u`?global:typeof globalThis<`u`?globalThis:typeof self<`u`?self:{};e.SENTRY_RELEASE={id:`f99fcf9f0a844cc9bd13fdc8e5782b84`};var t=new e.Error().stack;t&&(e._sentryDebugIds=e._sentryDebugIds||{},e._sentryDebugIds[t]=`0f164a51-8ebb-4894-9566-71fdd52578cc`,e._sentryDebugIdIdentifier=`sentry-dbid-0f164a51-8ebb-4894-9566-71fdd52578cc`)}catch{}})();var e=`from pathlib import Path

import modal

# 1) Define a Modal Image that includes LLM dependencies
app = modal.App("example-inference")
image = modal.Image.debian_slim().uv_pip_install("transformers[torch]")


# 2) Attach a GPU to your Modal Function
@app.function(gpu="h100", image=image)
def chat(prompt: str | None = None) -> list[dict]:
    # 3) Run LLM inference
    from transformers import pipeline

    if prompt is None:
        prompt = f"/no_think Read this code.\\n\\n{Path(__file__).read_text()}\\nIn one paragraph, what does the code do?"

    print(prompt)
    context = [{"role": "user", "content": prompt}]

    chatbot = pipeline(model="Qwen/Qwen3-1.7B", device_map="cuda", max_new_tokens=1024)
    result = chatbot(context)
    print(result[0]["generated_text"][-1]["content"])

    return result
`;export{e as default};
//# sourceMappingURL=DR6hood5.js.map
