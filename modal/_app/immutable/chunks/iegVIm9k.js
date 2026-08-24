(function(){try{var e=typeof window<`u`?window:typeof global<`u`?global:typeof globalThis<`u`?globalThis:typeof self<`u`?self:{};e.SENTRY_RELEASE={id:`f99fcf9f0a844cc9bd13fdc8e5782b84`};var t=new e.Error().stack;t&&(e._sentryDebugIds=e._sentryDebugIds||{},e._sentryDebugIds[t]=`8133d319-33c1-4690-b5d1-b793f7ea903f`,e._sentryDebugIdIdentifier=`sentry-dbid-8133d319-33c1-4690-b5d1-b793f7ea903f`)}catch{}})();var e=`import modal

image = modal.Image.debian_slim().pip_install("numpy")

app = modal.App("example-scaling-out", image=image)


@app.function()
def square(x=2):
    import numpy as np

    print(f"The square of {x} is {np.square(x)}")


# 1) Create a local entrypoint function
@app.local_entrypoint()
def main():
    # 2) Run \`.map\` to process inputs in parallel (wrap with list command to execute)
    list(square.map(range(100)))
`;export{e as default};
//# sourceMappingURL=iegVIm9k.js.map
