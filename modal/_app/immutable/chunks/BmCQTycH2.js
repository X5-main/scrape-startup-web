(function(){try{var e=typeof window<`u`?window:typeof global<`u`?global:typeof globalThis<`u`?globalThis:typeof self<`u`?self:{};e.SENTRY_RELEASE={id:`f99fcf9f0a844cc9bd13fdc8e5782b84`};var t=new e.Error().stack;t&&(e._sentryDebugIds=e._sentryDebugIds||{},e._sentryDebugIds[t]=`d8068850-2852-4228-bf5f-31b5d773aaad`,e._sentryDebugIdIdentifier=`sentry-dbid-d8068850-2852-4228-bf5f-31b5d773aaad`)}catch{}})();import{$t as e,St as t,Tn as n,Tt as r,bt as i,c as a,d as o,en as s,tn as c,wn as l}from"./F_ixKBiO.js";import"./B1sc9Zdx.js";import"./Bb2deiU3.js";import{t as u}from"./BILrvr3I.js";import{t as d}from"./DeWGVqas2.js";import{t as f}from"./CdZDxCfO2.js";var p={title:`How to run Nomic Embed V1.5 on Modal`,description:`Example code for running Nomic Embed V1.5`,authors:[{name:`Yiren Lu`,avatarUrl:`https://modal-cdn.com/ren-lu.jpg`,jobTitle:`Solutions Engineer`,twitterHandle:`YirenLu`}],date:`2025-01-21T12:00:00.000Z`,length:`5 minute read`,published:!0,category:`Model Library`,subcategory:`Embedding Models`,layout:`blog`,toc:[{depth:2,value:`What is Nomic Embed V1.5?`,id:`what-is-nomic-embed-v15`},{depth:2,value:`What is Modal?`,id:`what-is-modal`},{depth:2,value:`Performance considerations`,id:`performance-considerations`},{depth:2,value:`Example code for running the Nomic Embed V1.5 embedding model on Modal`,id:`example-code-for-running-the-nomic-embed-v15-embedding-model-on-modal`},{depth:2,value:`Additional resources`,id:`additional-resources`}],rawContent:`## What is Nomic Embed V1.5?

[Nomic Embed V1.5](https://huggingface.co/nomic-ai/nomic-embed-text-v1.5) is a powerful text embedding model that consistently ranks near the top of the [MTEB embedding model leaderboard](/blog/mteb-leaderboard-article). The model excels at converting text into dense vector representations, making it particularly effective for semantic search, document clustering, and retrieval-augmented generation (RAG) applications.

## What is Modal?

[Modal](https://modal.com) is a cloud platform that provides the fastest and easiest way to access
[GPUs](/docs/guide/gpu) for running inference on embedding models like Nomic Embed V1.5. Running
inference on a GPU is essential for embedding models because it significantly
accelerates the processing of large volumes of text, enabling real-time
applications. For more information on how to get started, visit the [Modal documentation](/docs).

## Performance considerations

The model delivers fast inference times on Modal's H100 GPUs, typically processing text in milliseconds. For production deployments, consider implementing a caching layer for frequently embedded text to optimize costs and reduce latency. The model's output vectors are suitable for direct use in vector databases like Pinecone or Weaviate.

## Example code for running the Nomic Embed V1.5 embedding model on Modal

To run the following code, you will need to:

1. Create an account at [modal.com](https://modal.com)
2. Run \`pip install modal\` to install the modal Python package
3. Run \`modal setup\` to authenticate (if this doesn’t work, try \`python -m modal setup\`)
4. Copy the code below into a file called \`app.py\`
5. Run \`modal run app.py\`

\`\`\`python
import modal

MODEL_ID = "nomic-ai/nomic-embed-text-v1.5"
MODEL_REVISION = "d802ae16c9caed4d197895d27c6d529434cd8c6d"

image = modal.Image.debian_slim().pip_install(
    "torch==2.6.0", "sentence-transformers==3.4.1", "einops==0.8.1"
)
app = modal.App("example-base-nomic-embed", image=image)

GPU_CONFIG = "H100"

CACHE_DIR = "/cache"
cache_vol = modal.Volume.from_name("hf-hub-cache", create_if_missing=True)


@app.cls(
    gpu=GPU_CONFIG,
    volumes={CACHE_DIR: cache_vol},
    scaledown_window=60 * 10,
    timeout=60 * 60,
)
@modal.concurrent(max_inputs=15)
class Model:
    @modal.enter()
    def setup(self):
        from sentence_transformers import SentenceTransformer

        self.model = SentenceTransformer(
            MODEL_ID,
            revision=MODEL_REVISION,
            cache_folder=CACHE_DIR,
            trust_remote_code=True,
        )

    @modal.method()
    def embed(self, sentences: list):
        return self.model.encode(sentences)


# ## Run the model
@app.local_entrypoint()
def main():
    sentences = [
        "search_document: TSNE is a dimensionality reduction algorithm created by Laurens van Der Maaten"
    ]

    print(Model().embed.remote(sentences))
\`\`\`

## Additional resources

- [Nomic AI Documentation](https://docs.nomic.ai/) - Official documentation and best practices
- [MTEB Leaderboard](https://huggingface.co/spaces/mteb/leaderboard) - Benchmark comparisons
- [Vector Database Guide](https://www.pinecone.io/learn/vector-database/) - Understanding vector storage
- [RAG Architecture Patterns](https://www.datastax.com/guides/what-is-retrieval-augmented-generation) - Implementation strategies
`,meta:{description:`Example code for running Nomic Embed V1.5`}},{title:m,description:h,authors:g,date:_,length:v,published:y,category:b,subcategory:x,layout:S,toc:C,rawContent:w,meta:T}=p,E=t(`<h2 id="what-is-nomic-embed-v15">What is Nomic Embed V1.5?</h2> <p><!> is a powerful text embedding model that consistently ranks near the top of the <!>. The model excels at converting text into dense vector representations, making it particularly effective for semantic search, document clustering, and retrieval-augmented generation (RAG) applications.</p> <h2 id="what-is-modal">What is Modal?</h2> <p><!> is a cloud platform that provides the fastest and easiest way to access <!> for running inference on embedding models like Nomic Embed V1.5. Running
inference on a GPU is essential for embedding models because it significantly
accelerates the processing of large volumes of text, enabling real-time
applications. For more information on how to get started, visit the <!>.</p> <h2 id="performance-considerations">Performance considerations</h2> <p>The model delivers fast inference times on Modal’s H100 GPUs, typically processing text in milliseconds. For production deployments, consider implementing a caching layer for frequently embedded text to optimize costs and reduce latency. The model’s output vectors are suitable for direct use in vector databases like Pinecone or Weaviate.</p> <h2 id="example-code-for-running-the-nomic-embed-v15-embedding-model-on-modal">Example code for running the Nomic Embed V1.5 embedding model on Modal</h2> <p>To run the following code, you will need to:</p> <ol><li>Create an account at <!></li> <li>Run <code>pip install modal</code> to install the modal Python package</li> <li>Run <code>modal setup</code> to authenticate (if this doesn’t work, try <code>python -m modal setup</code>)</li> <li>Copy the code below into a file called <code>app.py</code></li> <li>Run <code>modal run app.py</code></li></ol> <!> <h2 id="additional-resources">Additional resources</h2> <ul><li><!> - Official documentation and best practices</li> <li><!> - Benchmark comparisons</li> <li><!> - Understanding vector storage</li> <li><!> - Implementation strategies</li></ul>`,1);function D(t,m){let h=a(m,[`children`,`$$slots`,`$$events`,`$$legacy`]);f(t,o(()=>h,()=>p,{children:(t,a)=>{var o=E(),f=c(s(o),2),p=e(f);d(p,{href:`https://huggingface.co/nomic-ai/nomic-embed-text-v1.5`,rel:`nofollow`,children:(e,t)=>{l(),i(e,r(`Nomic Embed V1.5`))},$$slots:{default:!0}}),d(c(p,2),{href:`/blog/mteb-leaderboard-article`,children:(e,t)=>{l(),i(e,r(`MTEB embedding model leaderboard`))},$$slots:{default:!0}}),l(),n(f);var m=c(f,4),h=e(m);d(h,{href:`https://modal.com`,rel:`nofollow`,children:(e,t)=>{l(),i(e,r(`Modal`))},$$slots:{default:!0}});var g=c(h,2);d(g,{href:`/docs/guide/gpu`,children:(e,t)=>{l(),i(e,r(`GPUs`))},$$slots:{default:!0}}),d(c(g,2),{href:`/docs`,children:(e,t)=>{l(),i(e,r(`Modal documentation`))},$$slots:{default:!0}}),l(),n(m);var _=c(m,10),v=e(_);d(c(e(v)),{href:`https://modal.com`,rel:`nofollow`,children:(e,t)=>{l(),i(e,r(`modal.com`))},$$slots:{default:!0}}),n(v),l(8),n(_);var y=c(_,2);u(y,{code:`import%20modal%0A%0AMODEL_ID%20%3D%20%22nomic-ai%2Fnomic-embed-text-v1.5%22%0AMODEL_REVISION%20%3D%20%22d802ae16c9caed4d197895d27c6d529434cd8c6d%22%0A%0Aimage%20%3D%20modal.Image.debian_slim().pip_install(%0A%20%20%20%20%22torch%3D%3D2.6.0%22%2C%20%22sentence-transformers%3D%3D3.4.1%22%2C%20%22einops%3D%3D0.8.1%22%0A)%0Aapp%20%3D%20modal.App(%22example-base-nomic-embed%22%2C%20image%3Dimage)%0A%0AGPU_CONFIG%20%3D%20%22H100%22%0A%0ACACHE_DIR%20%3D%20%22%2Fcache%22%0Acache_vol%20%3D%20modal.Volume.from_name(%22hf-hub-cache%22%2C%20create_if_missing%3DTrue)%0A%0A%0A%40app.cls(%0A%20%20%20%20gpu%3DGPU_CONFIG%2C%0A%20%20%20%20volumes%3D%7BCACHE_DIR%3A%20cache_vol%7D%2C%0A%20%20%20%20scaledown_window%3D60%20*%2010%2C%0A%20%20%20%20timeout%3D60%20*%2060%2C%0A)%0A%40modal.concurrent(max_inputs%3D15)%0Aclass%20Model%3A%0A%20%20%20%20%40modal.enter()%0A%20%20%20%20def%20setup(self)%3A%0A%20%20%20%20%20%20%20%20from%20sentence_transformers%20import%20SentenceTransformer%0A%0A%20%20%20%20%20%20%20%20self.model%20%3D%20SentenceTransformer(%0A%20%20%20%20%20%20%20%20%20%20%20%20MODEL_ID%2C%0A%20%20%20%20%20%20%20%20%20%20%20%20revision%3DMODEL_REVISION%2C%0A%20%20%20%20%20%20%20%20%20%20%20%20cache_folder%3DCACHE_DIR%2C%0A%20%20%20%20%20%20%20%20%20%20%20%20trust_remote_code%3DTrue%2C%0A%20%20%20%20%20%20%20%20)%0A%0A%20%20%20%20%40modal.method()%0A%20%20%20%20def%20embed(self%2C%20sentences%3A%20list)%3A%0A%20%20%20%20%20%20%20%20return%20self.model.encode(sentences)%0A%0A%0A%23%20%23%23%20Run%20the%20model%0A%40app.local_entrypoint()%0Adef%20main()%3A%0A%20%20%20%20sentences%20%3D%20%5B%0A%20%20%20%20%20%20%20%20%22search_document%3A%20TSNE%20is%20a%20dimensionality%20reduction%20algorithm%20created%20by%20Laurens%20van%20Der%20Maaten%22%0A%20%20%20%20%5D%0A%0A%20%20%20%20print(Model().embed.remote(sentences))`,lang:`python`});var b=c(y,4),x=e(b);d(e(x),{href:`https://docs.nomic.ai/`,rel:`nofollow`,children:(e,t)=>{l(),i(e,r(`Nomic AI Documentation`))},$$slots:{default:!0}}),l(),n(x);var S=c(x,2);d(e(S),{href:`https://huggingface.co/spaces/mteb/leaderboard`,rel:`nofollow`,children:(e,t)=>{l(),i(e,r(`MTEB Leaderboard`))},$$slots:{default:!0}}),l(),n(S);var C=c(S,2);d(e(C),{href:`https://www.pinecone.io/learn/vector-database/`,rel:`nofollow`,children:(e,t)=>{l(),i(e,r(`Vector Database Guide`))},$$slots:{default:!0}}),l(),n(C);var w=c(C,2);d(e(w),{href:`https://www.datastax.com/guides/what-is-retrieval-augmented-generation`,rel:`nofollow`,children:(e,t)=>{l(),i(e,r(`RAG Architecture Patterns`))},$$slots:{default:!0}}),l(),n(w),n(b),i(t,o)},$$slots:{default:!0}}))}export{D as default,p as metadata};
//# sourceMappingURL=BmCQTycH2.js.map
