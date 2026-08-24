(function(){try{var e=typeof window<`u`?window:typeof global<`u`?global:typeof globalThis<`u`?globalThis:typeof self<`u`?self:{};e.SENTRY_RELEASE={id:`f99fcf9f0a844cc9bd13fdc8e5782b84`};var t=new e.Error().stack;t&&(e._sentryDebugIds=e._sentryDebugIds||{},e._sentryDebugIds[t]=`e5c2e19d-723b-4351-9349-6173355b481c`,e._sentryDebugIdIdentifier=`sentry-dbid-e5c2e19d-723b-4351-9349-6173355b481c`)}catch{}})();import{$t as e,St as t,Tn as n,Tt as r,bt as i,c as a,d as o,en as s,tn as c,wn as l}from"./F_ixKBiO.js";import"./B1sc9Zdx.js";import"./Bb2deiU3.js";import{o as u}from"./CPby7b1n.js";import{t as d}from"./BILrvr3I.js";import{t as f}from"./B4L_if842.js";import{t as p}from"./DeWGVqas2.js";var m={toc:[{depth:1,value:`Deploy FastAPI app with Modal`,id:`deploy-fastapi-app-with-modal`}],rawContent:`# Deploy FastAPI app with Modal

This example shows how you can deploy a [FastAPI](https://fastapi.tiangolo.com/) app with Modal.
You can serve any app written in an ASGI-compatible web framework (like FastAPI) using this pattern or you can server WSGI-compatible frameworks like Flask with [\`wsgi_app\`](https://modal.com/docs/guide/webhooks#wsgi).

\`\`\`python
from typing import Optional

import modal
from fastapi import FastAPI, Header
from pydantic import BaseModel

image = modal.Image.debian_slim().uv_pip_install("fastapi[standard]", "pydantic")
app = modal.App("example-fastapi-app", image=image)
web_app = FastAPI()


class Item(BaseModel):
    name: str


@web_app.get("/")
async def handle_root(user_agent: Optional[str] = Header(None)):
    print(f"GET /     - received user_agent={user_agent}")
    return "Hello World"


@web_app.post("/foo")
async def handle_foo(item: Item, user_agent: Optional[str] = Header(None)):
    print(f"POST /foo - received user_agent={user_agent}, item.name={item.name}")
    return item


@app.function()
@modal.asgi_app()
def fastapi_app():
    return web_app


@app.function()
@modal.fastapi_endpoint(method="POST")
def f(item: Item):
    return "Hello " + item.name


if __name__ == "__main__":
    app.deploy("webapp")

\`\`\`
`,meta:{title:`Deploy FastAPI app with Modal`,description:`This example shows how you can deploy a FastAPI app with Modal. You can serve any app written in an ASGI-compatible web framework (like FastAPI) using this pattern or you can server WSGI-compatible frameworks like Flask with wsgi_app.`}},{toc:h,rawContent:g,meta:_}=m,v=t(`<code>wsgi_app</code>`),y=t(`<!> <p>This example shows how you can deploy a <!> app with Modal.
You can serve any app written in an ASGI-compatible web framework (like FastAPI) using this pattern or you can server WSGI-compatible frameworks like Flask with <!>.</p> <!>`,1);function b(t,h){let g=a(h,[`children`,`$$slots`,`$$events`,`$$legacy`]);f(t,o(()=>g,()=>m,{children:(t,a)=>{var o=y(),f=s(o);u(f,{id:`deploy-fastapi-app-with-modal`,children:(e,t)=>{l(),i(e,r(`Deploy FastAPI app with Modal`))},$$slots:{default:!0}});var m=c(f,2),h=c(e(m));p(h,{href:`https://fastapi.tiangolo.com/`,rel:`nofollow`,children:(e,t)=>{l(),i(e,r(`FastAPI`))},$$slots:{default:!0}}),p(c(h,2),{href:`https://modal.com/docs/guide/webhooks#wsgi`,rel:`nofollow`,children:(e,t)=>{i(e,v())},$$slots:{default:!0}}),l(),n(m),d(c(m,2),{code:`from%20typing%20import%20Optional%0A%0Aimport%20modal%0Afrom%20fastapi%20import%20FastAPI%2C%20Header%0Afrom%20pydantic%20import%20BaseModel%0A%0Aimage%20%3D%20modal.Image.debian_slim().uv_pip_install(%22fastapi%5Bstandard%5D%22%2C%20%22pydantic%22)%0Aapp%20%3D%20modal.App(%22example-fastapi-app%22%2C%20image%3Dimage)%0Aweb_app%20%3D%20FastAPI()%0A%0A%0Aclass%20Item(BaseModel)%3A%0A%20%20%20%20name%3A%20str%0A%0A%0A%40web_app.get(%22%2F%22)%0Aasync%20def%20handle_root(user_agent%3A%20Optional%5Bstr%5D%20%3D%20Header(None))%3A%0A%20%20%20%20print(f%22GET%20%2F%20%20%20%20%20-%20received%20user_agent%3D%7Buser_agent%7D%22)%0A%20%20%20%20return%20%22Hello%20World%22%0A%0A%0A%40web_app.post(%22%2Ffoo%22)%0Aasync%20def%20handle_foo(item%3A%20Item%2C%20user_agent%3A%20Optional%5Bstr%5D%20%3D%20Header(None))%3A%0A%20%20%20%20print(f%22POST%20%2Ffoo%20-%20received%20user_agent%3D%7Buser_agent%7D%2C%20item.name%3D%7Bitem.name%7D%22)%0A%20%20%20%20return%20item%0A%0A%0A%40app.function()%0A%40modal.asgi_app()%0Adef%20fastapi_app()%3A%0A%20%20%20%20return%20web_app%0A%0A%0A%40app.function()%0A%40modal.fastapi_endpoint(method%3D%22POST%22)%0Adef%20f(item%3A%20Item)%3A%0A%20%20%20%20return%20%22Hello%20%22%20%2B%20item.name%0A%0A%0Aif%20__name__%20%3D%3D%20%22__main__%22%3A%0A%20%20%20%20app.deploy(%22webapp%22)%0A`,lang:`python`}),i(t,o)},$$slots:{default:!0}}))}export{b as default,m as metadata};
//# sourceMappingURL=CLE6E6KZ2.js.map
