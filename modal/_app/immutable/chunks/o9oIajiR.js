(function(){try{var e=typeof window<`u`?window:typeof global<`u`?global:typeof globalThis<`u`?globalThis:typeof self<`u`?self:{};e.SENTRY_RELEASE={id:`f99fcf9f0a844cc9bd13fdc8e5782b84`};var t=new e.Error().stack;t&&(e._sentryDebugIds=e._sentryDebugIds||{},e._sentryDebugIds[t]=`9936886d-8a68-403a-8aa2-87761521fca9`,e._sentryDebugIdIdentifier=`sentry-dbid-9936886d-8a68-403a-8aa2-87761521fca9`)}catch{}})();import{$t as e,St as t,Tn as n,Tt as r,bt as i,c as a,d as o,en as s,tn as c,wn as l}from"./F_ixKBiO.js";import"./B1sc9Zdx.js";import"./Bb2deiU3.js";import{o as u}from"./CPby7b1n.js";import{t as d}from"./BILrvr3I.js";import{t as f}from"./B4L_if842.js";import{t as p}from"./DeWGVqas2.js";var m={toc:[{depth:1,value:`Deploy LangChain and LangGraph applications with LangServe`,id:`deploy-langchain-and-langgraph-applications-with-langserve`}],rawContent:`# Deploy LangChain and LangGraph applications with LangServe

This code demonstrates how to deploy a
[LangServe](https://python.langchain.com/docs/langserve/) application on Modal.
LangServe makes it easy to wrap LangChain and LangGraph applications in a FastAPI server,
and Modal makes it easy to deploy FastAPI servers.

The LangGraph application that it serves is from our [sandboxed LLM coding agent example](https://modal.com/docs/examples/agent).

You can find the code for the agent and several other code files associated with this example in the
[\`codelangchain\` directory of our examples repo](https://github.com/modal-labs/modal-examples/tree/main/13_sandboxes/codelangchain).

\`\`\`python
import modal

from .agent import construct_graph, create_sandbox
from .src.common import image

app = modal.App("example-codelangchain-langserve")

image = image.uv_pip_install("langserve[all]==0.3.0")


@app.function(
    image=image,
    secrets=[  # see the agent.py file for more information on Secrets
        modal.Secret.from_name("openai-secret", required_keys=["OPENAI_API_KEY"]),
        modal.Secret.from_name("langsmith-secret", required_keys=["LANGCHAIN_API_KEY"]),
    ],
)
@modal.asgi_app()
def serve():
    from fastapi import FastAPI, responses
    from fastapi.middleware.cors import CORSMiddleware
    from langchain_core.runnables import RunnableLambda
    from langserve import add_routes

    # create a FastAPI app
    web_app = FastAPI(
        title="CodeLangChain Server",
        version="1.0",
        description="Writes code and checks if it runs.",
    )

    # set all CORS enabled origins
    web_app.add_middleware(
        CORSMiddleware,
        allow_origins=["*"],
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
        expose_headers=["*"],
    )

    def inp(question: str) -> dict:
        return {"keys": {"question": question, "iterations": 0}}

    def out(state: dict) -> str:
        if "finish" in state:
            return state["finish"]["keys"]["response"]
        elif len(state) > 0 and "finish" in state[-1]:
            return state[-1]["finish"]["keys"]["response"]
        else:
            return str(state)

    graph = construct_graph(create_sandbox(app), debug=False).compile()

    chain = RunnableLambda(inp) | graph | RunnableLambda(out)

    add_routes(
        web_app,
        chain,
        path="/codelangchain",
    )

    # redirect the root to the interactive playground
    @web_app.get("/")
    def redirect():
        return responses.RedirectResponse(url="/codelangchain/playground")

    # return the FastAPI app and Modal will deploy it for us
    return web_app

\`\`\`
`,meta:{title:`Deploy LangChain and LangGraph applications with LangServe`,description:`This code demonstrates how to deploy a LangServe application on Modal. LangServe makes it easy to wrap LangChain and LangGraph applications in a FastAPI server, and Modal makes it easy to deploy FastAPI servers.`}},{toc:h,rawContent:g,meta:_}=m,v=t(`<code>codelangchain</code> directory of our examples repo`,1),y=t(`<!> <p>This code demonstrates how to deploy a <!> application on Modal.
LangServe makes it easy to wrap LangChain and LangGraph applications in a FastAPI server,
and Modal makes it easy to deploy FastAPI servers.</p> <p>The LangGraph application that it serves is from our <!>.</p> <p>You can find the code for the agent and several other code files associated with this example in the <!>.</p> <!>`,1);function b(t,h){let g=a(h,[`children`,`$$slots`,`$$events`,`$$legacy`]);f(t,o(()=>g,()=>m,{children:(t,a)=>{var o=y(),f=s(o);u(f,{id:`deploy-langchain-and-langgraph-applications-with-langserve`,children:(e,t)=>{l(),i(e,r(`Deploy LangChain and LangGraph applications with LangServe`))},$$slots:{default:!0}});var m=c(f,2);p(c(e(m)),{href:`https://python.langchain.com/docs/langserve/`,rel:`nofollow`,children:(e,t)=>{l(),i(e,r(`LangServe`))},$$slots:{default:!0}}),l(),n(m);var h=c(m,2);p(c(e(h)),{href:`https://modal.com/docs/examples/agent`,rel:`nofollow`,children:(e,t)=>{l(),i(e,r(`sandboxed LLM coding agent example`))},$$slots:{default:!0}}),l(),n(h);var g=c(h,2);p(c(e(g)),{href:`https://github.com/modal-labs/modal-examples/tree/main/13_sandboxes/codelangchain`,rel:`nofollow`,children:(e,t)=>{var n=v();l(),i(e,n)},$$slots:{default:!0}}),l(),n(g),d(c(g,2),{code:`import%20modal%0A%0Afrom%20.agent%20import%20construct_graph%2C%20create_sandbox%0Afrom%20.src.common%20import%20image%0A%0Aapp%20%3D%20modal.App(%22example-codelangchain-langserve%22)%0A%0Aimage%20%3D%20image.uv_pip_install(%22langserve%5Ball%5D%3D%3D0.3.0%22)%0A%0A%0A%40app.function(%0A%20%20%20%20image%3Dimage%2C%0A%20%20%20%20secrets%3D%5B%20%20%23%20see%20the%20agent.py%20file%20for%20more%20information%20on%20Secrets%0A%20%20%20%20%20%20%20%20modal.Secret.from_name(%22openai-secret%22%2C%20required_keys%3D%5B%22OPENAI_API_KEY%22%5D)%2C%0A%20%20%20%20%20%20%20%20modal.Secret.from_name(%22langsmith-secret%22%2C%20required_keys%3D%5B%22LANGCHAIN_API_KEY%22%5D)%2C%0A%20%20%20%20%5D%2C%0A)%0A%40modal.asgi_app()%0Adef%20serve()%3A%0A%20%20%20%20from%20fastapi%20import%20FastAPI%2C%20responses%0A%20%20%20%20from%20fastapi.middleware.cors%20import%20CORSMiddleware%0A%20%20%20%20from%20langchain_core.runnables%20import%20RunnableLambda%0A%20%20%20%20from%20langserve%20import%20add_routes%0A%0A%20%20%20%20%23%20create%20a%20FastAPI%20app%0A%20%20%20%20web_app%20%3D%20FastAPI(%0A%20%20%20%20%20%20%20%20title%3D%22CodeLangChain%20Server%22%2C%0A%20%20%20%20%20%20%20%20version%3D%221.0%22%2C%0A%20%20%20%20%20%20%20%20description%3D%22Writes%20code%20and%20checks%20if%20it%20runs.%22%2C%0A%20%20%20%20)%0A%0A%20%20%20%20%23%20set%20all%20CORS%20enabled%20origins%0A%20%20%20%20web_app.add_middleware(%0A%20%20%20%20%20%20%20%20CORSMiddleware%2C%0A%20%20%20%20%20%20%20%20allow_origins%3D%5B%22*%22%5D%2C%0A%20%20%20%20%20%20%20%20allow_credentials%3DTrue%2C%0A%20%20%20%20%20%20%20%20allow_methods%3D%5B%22*%22%5D%2C%0A%20%20%20%20%20%20%20%20allow_headers%3D%5B%22*%22%5D%2C%0A%20%20%20%20%20%20%20%20expose_headers%3D%5B%22*%22%5D%2C%0A%20%20%20%20)%0A%0A%20%20%20%20def%20inp(question%3A%20str)%20-%3E%20dict%3A%0A%20%20%20%20%20%20%20%20return%20%7B%22keys%22%3A%20%7B%22question%22%3A%20question%2C%20%22iterations%22%3A%200%7D%7D%0A%0A%20%20%20%20def%20out(state%3A%20dict)%20-%3E%20str%3A%0A%20%20%20%20%20%20%20%20if%20%22finish%22%20in%20state%3A%0A%20%20%20%20%20%20%20%20%20%20%20%20return%20state%5B%22finish%22%5D%5B%22keys%22%5D%5B%22response%22%5D%0A%20%20%20%20%20%20%20%20elif%20len(state)%20%3E%200%20and%20%22finish%22%20in%20state%5B-1%5D%3A%0A%20%20%20%20%20%20%20%20%20%20%20%20return%20state%5B-1%5D%5B%22finish%22%5D%5B%22keys%22%5D%5B%22response%22%5D%0A%20%20%20%20%20%20%20%20else%3A%0A%20%20%20%20%20%20%20%20%20%20%20%20return%20str(state)%0A%0A%20%20%20%20graph%20%3D%20construct_graph(create_sandbox(app)%2C%20debug%3DFalse).compile()%0A%0A%20%20%20%20chain%20%3D%20RunnableLambda(inp)%20%7C%20graph%20%7C%20RunnableLambda(out)%0A%0A%20%20%20%20add_routes(%0A%20%20%20%20%20%20%20%20web_app%2C%0A%20%20%20%20%20%20%20%20chain%2C%0A%20%20%20%20%20%20%20%20path%3D%22%2Fcodelangchain%22%2C%0A%20%20%20%20)%0A%0A%20%20%20%20%23%20redirect%20the%20root%20to%20the%20interactive%20playground%0A%20%20%20%20%40web_app.get(%22%2F%22)%0A%20%20%20%20def%20redirect()%3A%0A%20%20%20%20%20%20%20%20return%20responses.RedirectResponse(url%3D%22%2Fcodelangchain%2Fplayground%22)%0A%0A%20%20%20%20%23%20return%20the%20FastAPI%20app%20and%20Modal%20will%20deploy%20it%20for%20us%0A%20%20%20%20return%20web_app%0A`,lang:`python`}),i(t,o)},$$slots:{default:!0}}))}export{b as default,m as metadata};
//# sourceMappingURL=o9oIajiR.js.map
