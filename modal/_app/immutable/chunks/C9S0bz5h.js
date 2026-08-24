(function(){try{var e=typeof window<`u`?window:typeof global<`u`?global:typeof globalThis<`u`?globalThis:typeof self<`u`?self:{};e.SENTRY_RELEASE={id:`f99fcf9f0a844cc9bd13fdc8e5782b84`};var t=new e.Error().stack;t&&(e._sentryDebugIds=e._sentryDebugIds||{},e._sentryDebugIds[t]=`7a8198fd-e75d-4af4-9fbf-2893e0f272f7`,e._sentryDebugIdIdentifier=`sentry-dbid-7a8198fd-e75d-4af4-9fbf-2893e0f272f7`)}catch{}})();var e=`import subprocess

import modal

image = (
    # 1) Use an officially supported CUDA image
    modal.Image.from_registry("nvidia/cuda:12.4.0-devel-ubuntu22.04", add_python="3.11")
    # 2) Install cupy, a CUDA replacement for numpy
    .pip_install("cupy-cuda12x")
)

app = modal.App("example-gpu", image=image)


# 3) Attach a GPU to your function
@app.function(gpu="A10G")
def square(x=2):
    import cupy as cp

    subprocess.run(["nvidia-smi"])
    print(f"The square of {x} is {cp.square(x)}")
`;export{e as default};
//# sourceMappingURL=C9S0bz5h.js.map
