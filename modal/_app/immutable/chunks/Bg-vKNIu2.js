(function(){try{var e=typeof window<`u`?window:typeof global<`u`?global:typeof globalThis<`u`?globalThis:typeof self<`u`?self:{};e.SENTRY_RELEASE={id:`f99fcf9f0a844cc9bd13fdc8e5782b84`};var t=new e.Error().stack;t&&(e._sentryDebugIds=e._sentryDebugIds||{},e._sentryDebugIds[t]=`252e82df-1799-46ea-a493-08ea2bb567d0`,e._sentryDebugIdIdentifier=`sentry-dbid-252e82df-1799-46ea-a493-08ea2bb567d0`)}catch{}})();import{St as e,Tt as t,bt as n,c as r,d as i,en as a,tn as o,wn as s}from"./F_ixKBiO.js";import"./B1sc9Zdx.js";import"./Bb2deiU3.js";import{o as c}from"./CPby7b1n.js";import{t as l}from"./BILrvr3I.js";import{t as u}from"./B4L_if842.js";var d={toc:[{depth:1,value:`Example (qdrant.py)`,id:`example-qdrantpy`}],rawContent:`# Example (qdrant.py)

This is the source code for **06_gpu_and_ml.embeddings.qdrant**.
\`\`\`python
from typing import Optional

import modal

app = modal.App("example-qdrant")

image = modal.Image.debian_slim(python_version="3.11").uv_pip_install(
    "qdrant-client[fastembed-gpu]==1.13.3"
)


@app.function(image=image, gpu="any")
def query(inpt):
    from qdrant_client import QdrantClient

    client = QdrantClient(":memory:")

    docs = [
        "Qdrant has Langchain integrations",
        "Qdrant also has Llama Index integrations",
    ]

    print("querying documents:", *docs, sep="\\n\\t")

    client.add(collection_name="demo_collection", documents=docs)

    print("query:", inpt, sep="\\n\\t")

    search_results = client.query(
        collection_name="demo_collection",
        query_text=inpt,
        limit=1,
    )

    print("result:", search_results[0], sep="\\n\\t")

    return search_results[0].document


@app.local_entrypoint()
def main(inpt: Optional[str] = None):
    if not inpt:
        inpt = "alpaca"

    print(query.remote(inpt))

\`\`\`
`,meta:{title:`Example (qdrant.py)`,description:`This is the source code for 06_gpu_and_ml.embeddings.qdrant.`}},{toc:f,rawContent:p,meta:m}=d,h=e(`<!> <p>This is the source code for <strong>06_gpu_and_ml.embeddings.qdrant</strong>.</p> <!>`,1);function g(e,f){let p=r(f,[`children`,`$$slots`,`$$events`,`$$legacy`]);u(e,i(()=>p,()=>d,{children:(e,r)=>{var i=h(),u=a(i);c(u,{id:`example-qdrantpy`,children:(e,r)=>{s(),n(e,t(`Example (qdrant.py)`))},$$slots:{default:!0}}),l(o(u,4),{code:`from%20typing%20import%20Optional%0A%0Aimport%20modal%0A%0Aapp%20%3D%20modal.App(%22example-qdrant%22)%0A%0Aimage%20%3D%20modal.Image.debian_slim(python_version%3D%223.11%22).uv_pip_install(%0A%20%20%20%20%22qdrant-client%5Bfastembed-gpu%5D%3D%3D1.13.3%22%0A)%0A%0A%0A%40app.function(image%3Dimage%2C%20gpu%3D%22any%22)%0Adef%20query(inpt)%3A%0A%20%20%20%20from%20qdrant_client%20import%20QdrantClient%0A%0A%20%20%20%20client%20%3D%20QdrantClient(%22%3Amemory%3A%22)%0A%0A%20%20%20%20docs%20%3D%20%5B%0A%20%20%20%20%20%20%20%20%22Qdrant%20has%20Langchain%20integrations%22%2C%0A%20%20%20%20%20%20%20%20%22Qdrant%20also%20has%20Llama%20Index%20integrations%22%2C%0A%20%20%20%20%5D%0A%0A%20%20%20%20print(%22querying%20documents%3A%22%2C%20*docs%2C%20sep%3D%22%5Cn%5Ct%22)%0A%0A%20%20%20%20client.add(collection_name%3D%22demo_collection%22%2C%20documents%3Ddocs)%0A%0A%20%20%20%20print(%22query%3A%22%2C%20inpt%2C%20sep%3D%22%5Cn%5Ct%22)%0A%0A%20%20%20%20search_results%20%3D%20client.query(%0A%20%20%20%20%20%20%20%20collection_name%3D%22demo_collection%22%2C%0A%20%20%20%20%20%20%20%20query_text%3Dinpt%2C%0A%20%20%20%20%20%20%20%20limit%3D1%2C%0A%20%20%20%20)%0A%0A%20%20%20%20print(%22result%3A%22%2C%20search_results%5B0%5D%2C%20sep%3D%22%5Cn%5Ct%22)%0A%0A%20%20%20%20return%20search_results%5B0%5D.document%0A%0A%0A%40app.local_entrypoint()%0Adef%20main(inpt%3A%20Optional%5Bstr%5D%20%3D%20None)%3A%0A%20%20%20%20if%20not%20inpt%3A%0A%20%20%20%20%20%20%20%20inpt%20%3D%20%22alpaca%22%0A%0A%20%20%20%20print(query.remote(inpt))%0A`,lang:`python`}),n(e,i)},$$slots:{default:!0}}))}export{g as default,d as metadata};
//# sourceMappingURL=Bg-vKNIu2.js.map
