(function(){try{var e=typeof window<`u`?window:typeof global<`u`?global:typeof globalThis<`u`?globalThis:typeof self<`u`?self:{};e.SENTRY_RELEASE={id:`f99fcf9f0a844cc9bd13fdc8e5782b84`};var t=new e.Error().stack;t&&(e._sentryDebugIds=e._sentryDebugIds||{},e._sentryDebugIds[t]=`f3674340-4f02-4a00-b6fa-6e1ea2500aff`,e._sentryDebugIdIdentifier=`sentry-dbid-f3674340-4f02-4a00-b6fa-6e1ea2500aff`)}catch{}})();var e=`import modal

# 1) Define a Modal Image that includes NumPy
image = modal.Image.debian_slim().pip_install("numpy")

# 2) Attach the image
app = modal.App("example-custom-container", image=image)


@app.function()
def square(x=2):
    # 3) Inside the container, import and use the library
    import numpy as np

    print(f"The square of {x} is {np.square(x)}")
`;export{e as default};
//# sourceMappingURL=UqB9phq_.js.map
