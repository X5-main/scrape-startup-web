(function(){try{var e=typeof window<`u`?window:typeof global<`u`?global:typeof globalThis<`u`?globalThis:typeof self<`u`?self:{};e.SENTRY_RELEASE={id:`f99fcf9f0a844cc9bd13fdc8e5782b84`};var t=new e.Error().stack;t&&(e._sentryDebugIds=e._sentryDebugIds||{},e._sentryDebugIds[t]=`c3213034-1746-4823-8057-90c732007eba`,e._sentryDebugIdIdentifier=`sentry-dbid-c3213034-1746-4823-8057-90c732007eba`)}catch{}})();import{St as e,Tt as t,bt as n,c as r,d as i,en as a,tn as o,wn as s}from"./F_ixKBiO.js";import"./B1sc9Zdx.js";import"./Bb2deiU3.js";import{o as c}from"./CPby7b1n.js";import{t as l}from"./BILrvr3I.js";import{t as u}from"./B4L_if842.js";var d={toc:[{depth:1,value:`Install scikit-learn in a custom image`,id:`install-scikit-learn-in-a-custom-image`}],rawContent:`# Install scikit-learn in a custom image

This builds a custom image which installs the sklearn (scikit-learn) Python package in it.
It's an example of how you can use packages, even if you don't have them installed locally.

First, the imports

\`\`\`python
import time

import modal

\`\`\`

Next, define an app, with a custom image that installs \`sklearn\`.

\`\`\`python
app = modal.App(
    "example-import-sklearn",
    image=modal.Image.debian_slim()
    .apt_install("libgomp1")
    .uv_pip_install("scikit-learn"),
)

\`\`\`

The \`app.image.imports()\` lets us conditionally import in the global scope.
This is needed because we might not have sklearn and numpy installed locally,
but we know they are installed inside the custom image.

\`\`\`python
with app.image.imports():
    import numpy as np
    from sklearn import datasets, linear_model

\`\`\`

Now, let's define a function that uses one of scikit-learn's built-in datasets
and fits a very simple model (linear regression) to it

\`\`\`python
@app.function()
def fit():
    print("Inside run!")
    t0 = time.time()
    diabetes_X, diabetes_y = datasets.load_diabetes(return_X_y=True)
    diabetes_X = diabetes_X[:, np.newaxis, 2]
    regr = linear_model.LinearRegression()
    regr.fit(diabetes_X, diabetes_y)
    return time.time() - t0


\`\`\`

Finally, let's trigger the run locally. We also time this. Note that the first time we run this,
it will build the image. This might take 1-2 min. When we run this subsequent times, the image
is already build, and it will run much much faster.

\`\`\`python
if __name__ == "__main__":
    t0 = time.time()
    with app.run():
        t = fit.remote()
        print("Function time spent:", t)
    print("Full time spent:", time.time() - t0)

\`\`\`
`,meta:{title:`Install scikit-learn in a custom image`,description:`This builds a custom image which installs the sklearn (scikit-learn) Python package in it. It’s an example of how you can use packages, even if you don’t have them installed locally.`}},{toc:f,rawContent:p,meta:m}=d,h=e(`<!> <p>This builds a custom image which installs the sklearn (scikit-learn) Python package in it.
It’s an example of how you can use packages, even if you don’t have them installed locally.</p> <p>First, the imports</p> <!> <p>Next, define an app, with a custom image that installs <code>sklearn</code>.</p> <!> <p>The <code>app.image.imports()</code> lets us conditionally import in the global scope.
This is needed because we might not have sklearn and numpy installed locally,
but we know they are installed inside the custom image.</p> <!> <p>Now, let’s define a function that uses one of scikit-learn’s built-in datasets
and fits a very simple model (linear regression) to it</p> <!> <p>Finally, let’s trigger the run locally. We also time this. Note that the first time we run this,
it will build the image. This might take 1-2 min. When we run this subsequent times, the image
is already build, and it will run much much faster.</p> <!>`,1);function g(e,f){let p=r(f,[`children`,`$$slots`,`$$events`,`$$legacy`]);u(e,i(()=>p,()=>d,{children:(e,r)=>{var i=h(),u=a(i);c(u,{id:`install-scikit-learn-in-a-custom-image`,children:(e,r)=>{s(),n(e,t(`Install scikit-learn in a custom image`))},$$slots:{default:!0}});var d=o(u,6);l(d,{code:`import%20time%0A%0Aimport%20modal%0A`,lang:`python`});var f=o(d,4);l(f,{code:`app%20%3D%20modal.App(%0A%20%20%20%20%22example-import-sklearn%22%2C%0A%20%20%20%20image%3Dmodal.Image.debian_slim()%0A%20%20%20%20.apt_install(%22libgomp1%22)%0A%20%20%20%20.uv_pip_install(%22scikit-learn%22)%2C%0A)%0A`,lang:`python`});var p=o(f,4);l(p,{code:`with%20app.image.imports()%3A%0A%20%20%20%20import%20numpy%20as%20np%0A%20%20%20%20from%20sklearn%20import%20datasets%2C%20linear_model%0A`,lang:`python`});var m=o(p,4);l(m,{code:`%40app.function()%0Adef%20fit()%3A%0A%20%20%20%20print(%22Inside%20run!%22)%0A%20%20%20%20t0%20%3D%20time.time()%0A%20%20%20%20diabetes_X%2C%20diabetes_y%20%3D%20datasets.load_diabetes(return_X_y%3DTrue)%0A%20%20%20%20diabetes_X%20%3D%20diabetes_X%5B%3A%2C%20np.newaxis%2C%202%5D%0A%20%20%20%20regr%20%3D%20linear_model.LinearRegression()%0A%20%20%20%20regr.fit(diabetes_X%2C%20diabetes_y)%0A%20%20%20%20return%20time.time()%20-%20t0%0A%0A`,lang:`python`}),l(o(m,4),{code:`if%20__name__%20%3D%3D%20%22__main__%22%3A%0A%20%20%20%20t0%20%3D%20time.time()%0A%20%20%20%20with%20app.run()%3A%0A%20%20%20%20%20%20%20%20t%20%3D%20fit.remote()%0A%20%20%20%20%20%20%20%20print(%22Function%20time%20spent%3A%22%2C%20t)%0A%20%20%20%20print(%22Full%20time%20spent%3A%22%2C%20time.time()%20-%20t0)%0A`,lang:`python`}),n(e,i)},$$slots:{default:!0}}))}export{g as default,d as metadata};
//# sourceMappingURL=DtaU3bK6.js.map
