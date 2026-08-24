(function(){try{var e=typeof window<`u`?window:typeof global<`u`?global:typeof globalThis<`u`?globalThis:typeof self<`u`?self:{};e.SENTRY_RELEASE={id:`f99fcf9f0a844cc9bd13fdc8e5782b84`};var t=new e.Error().stack;t&&(e._sentryDebugIds=e._sentryDebugIds||{},e._sentryDebugIds[t]=`bcb60063-97f6-4bec-8d9a-2ab6cbf62c28`,e._sentryDebugIdIdentifier=`sentry-dbid-bcb60063-97f6-4bec-8d9a-2ab6cbf62c28`)}catch{}})();import{St as e,Tt as t,bt as n,c as r,d as i,en as a,tn as o,wn as s}from"./F_ixKBiO.js";import"./B1sc9Zdx.js";import"./Bb2deiU3.js";import{a as c,o as l}from"./CPby7b1n.js";import{t as u}from"./BILrvr3I.js";import{t as d}from"./B4L_if842.js";var f={toc:[{depth:1,value:`Hyperparameter search`,id:`hyperparameter-search`,children:[{depth:2,value:`Defining the image`,id:`defining-the-image`},{depth:2,value:`The Modal function`,id:`the-modal-function`},{depth:2,value:`Parallel search`,id:`parallel-search`}]}],rawContent:`# Hyperparameter search

This example showcases a simple grid search in one dimension, where we try different
parameters for a model and pick the one with the best results on a holdout set.

## Defining the image

First, let's build a custom image and install scikit-learn in it.

\`\`\`python
import modal

app = modal.App(
    "example-basic-grid-search",
    image=modal.Image.debian_slim().uv_pip_install("scikit-learn~=1.5.0"),
)

\`\`\`

## The Modal function

Next, define the function. Note that we use the custom image with scikit-learn in it.
We also take the hyperparameter \`k\`, which is how many nearest neighbors we use.

\`\`\`python
@app.function()
def fit_knn(k):
    from sklearn.datasets import load_digits
    from sklearn.model_selection import train_test_split
    from sklearn.neighbors import KNeighborsClassifier

    X, y = load_digits(return_X_y=True)
    X_train, X_test, y_train, y_test = train_test_split(X, y, random_state=42)

    clf = KNeighborsClassifier(k)
    clf.fit(X_train, y_train)
    score = float(clf.score(X_test, y_test))
    print("k = %3d, score = %.4f" % (k, score))
    return score, k


\`\`\`

## Parallel search

To do a hyperparameter search, let's map over this function with different values
for \`k\`, and then select for the best score on the holdout set:

\`\`\`python
@app.local_entrypoint()
def main():
    # Do a basic hyperparameter search
    best_score, best_k = max(fit_knn.map(range(1, 100)))
    print("Best k = %3d, score = %.4f" % (best_k, best_score))

\`\`\`
`,meta:{title:`Hyperparameter search`,description:`This example showcases a simple grid search in one dimension, where we try different parameters for a model and pick the one with the best results on a holdout set.`}},{toc:p,rawContent:m,meta:h}=f,g=e(`<!> <p>This example showcases a simple grid search in one dimension, where we try different
parameters for a model and pick the one with the best results on a holdout set.</p> <!> <p>First, let’s build a custom image and install scikit-learn in it.</p> <!> <!> <p>Next, define the function. Note that we use the custom image with scikit-learn in it.
We also take the hyperparameter <code>k</code>, which is how many nearest neighbors we use.</p> <!> <!> <p>To do a hyperparameter search, let’s map over this function with different values
for <code>k</code>, and then select for the best score on the holdout set:</p> <!>`,1);function _(e,p){let m=r(p,[`children`,`$$slots`,`$$events`,`$$legacy`]);d(e,i(()=>m,()=>f,{children:(e,r)=>{var i=g(),d=a(i);l(d,{id:`hyperparameter-search`,children:(e,r)=>{s(),n(e,t(`Hyperparameter search`))},$$slots:{default:!0}});var f=o(d,4);c(f,{id:`defining-the-image`,children:(e,r)=>{s(),n(e,t(`Defining the image`))},$$slots:{default:!0}});var p=o(f,4);u(p,{code:`import%20modal%0A%0Aapp%20%3D%20modal.App(%0A%20%20%20%20%22example-basic-grid-search%22%2C%0A%20%20%20%20image%3Dmodal.Image.debian_slim().uv_pip_install(%22scikit-learn~%3D1.5.0%22)%2C%0A)%0A`,lang:`python`});var m=o(p,2);c(m,{id:`the-modal-function`,children:(e,r)=>{s(),n(e,t(`The Modal function`))},$$slots:{default:!0}});var h=o(m,4);u(h,{code:`%40app.function()%0Adef%20fit_knn(k)%3A%0A%20%20%20%20from%20sklearn.datasets%20import%20load_digits%0A%20%20%20%20from%20sklearn.model_selection%20import%20train_test_split%0A%20%20%20%20from%20sklearn.neighbors%20import%20KNeighborsClassifier%0A%0A%20%20%20%20X%2C%20y%20%3D%20load_digits(return_X_y%3DTrue)%0A%20%20%20%20X_train%2C%20X_test%2C%20y_train%2C%20y_test%20%3D%20train_test_split(X%2C%20y%2C%20random_state%3D42)%0A%0A%20%20%20%20clf%20%3D%20KNeighborsClassifier(k)%0A%20%20%20%20clf.fit(X_train%2C%20y_train)%0A%20%20%20%20score%20%3D%20float(clf.score(X_test%2C%20y_test))%0A%20%20%20%20print(%22k%20%3D%20%253d%2C%20score%20%3D%20%25.4f%22%20%25%20(k%2C%20score))%0A%20%20%20%20return%20score%2C%20k%0A%0A`,lang:`python`});var _=o(h,2);c(_,{id:`parallel-search`,children:(e,r)=>{s(),n(e,t(`Parallel search`))},$$slots:{default:!0}}),u(o(_,4),{code:`%40app.local_entrypoint()%0Adef%20main()%3A%0A%20%20%20%20%23%20Do%20a%20basic%20hyperparameter%20search%0A%20%20%20%20best_score%2C%20best_k%20%3D%20max(fit_knn.map(range(1%2C%20100)))%0A%20%20%20%20print(%22Best%20k%20%3D%20%253d%2C%20score%20%3D%20%25.4f%22%20%25%20(best_k%2C%20best_score))%0A`,lang:`python`}),n(e,i)},$$slots:{default:!0}}))}export{_ as default,f as metadata};
//# sourceMappingURL=Hp6G6b0J.js.map
