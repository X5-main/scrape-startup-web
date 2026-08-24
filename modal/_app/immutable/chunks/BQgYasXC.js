(function(){try{var e=typeof window<`u`?window:typeof global<`u`?global:typeof globalThis<`u`?globalThis:typeof self<`u`?self:{};e.SENTRY_RELEASE={id:`f99fcf9f0a844cc9bd13fdc8e5782b84`};var t=new e.Error().stack;t&&(e._sentryDebugIds=e._sentryDebugIds||{},e._sentryDebugIds[t]=`70f26e16-b866-4e25-b266-eae7d9cb40ad`,e._sentryDebugIdIdentifier=`sentry-dbid-70f26e16-b866-4e25-b266-eae7d9cb40ad`)}catch{}})();import{St as e,Tt as t,bt as n,c as r,d as i,en as a,tn as o,wn as s}from"./F_ixKBiO.js";import"./B1sc9Zdx.js";import"./Bb2deiU3.js";import{o as c}from"./CPby7b1n.js";import{t as l}from"./BILrvr3I.js";import{t as u}from"./B4L_if842.js";var d={toc:[{depth:1,value:`Polling for a delayed result on Modal`,id:`polling-for-a-delayed-result-on-modal`}],rawContent:`# Polling for a delayed result on Modal

This example shows how you can poll for a delayed result on Modal.

The function \`factor_number\` takes a number as input and returns the prime factors of the number. The function could take a long time to run, so we don't want to wait for the result in the web server.
Instead, we return a URL that the client can poll to get the result.

\`\`\`python
import fastapi
import modal
from modal.functions import FunctionCall
from starlette.responses import HTMLResponse, RedirectResponse

app = modal.App("example-poll-delayed-result")

web_app = fastapi.FastAPI()


@app.function(image=modal.Image.debian_slim().uv_pip_install("primefac"))
def factor_number(number):
    import primefac

    return list(primefac.primefac(number))  # could take a long time


@web_app.get("/")
async def index():
    return HTMLResponse(
        """
    <form method="get" action="/factors">
        Enter a number: <input name="number" />
        <input type="submit" value="Factorize!"/>
    </form>
    """
    )


@web_app.get("/factors")
async def web_submit(request: fastapi.Request, number: int):
    call = factor_number.spawn(
        number
    )  # returns a FunctionCall without waiting for result
    polling_url = request.url.replace(
        path="/result", query=f"function_id={call.object_id}"
    )
    return RedirectResponse(polling_url)


@web_app.get("/result")
async def web_poll(function_id: str):
    function_call = FunctionCall.from_id(function_id)
    try:
        result = function_call.get(timeout=0)
    except TimeoutError:
        result = "not ready"

    return result


@app.function()
@modal.asgi_app()
def fastapi_app():
    return web_app

\`\`\`
`,meta:{title:`Polling for a delayed result on Modal`,description:`This example shows how you can poll for a delayed result on Modal.`}},{toc:f,rawContent:p,meta:m}=d,h=e(`<!> <p>This example shows how you can poll for a delayed result on Modal.</p> <p>The function <code>factor_number</code> takes a number as input and returns the prime factors of the number. The function could take a long time to run, so we don’t want to wait for the result in the web server.
Instead, we return a URL that the client can poll to get the result.</p> <!>`,1);function g(e,f){let p=r(f,[`children`,`$$slots`,`$$events`,`$$legacy`]);u(e,i(()=>p,()=>d,{children:(e,r)=>{var i=h(),u=a(i);c(u,{id:`polling-for-a-delayed-result-on-modal`,children:(e,r)=>{s(),n(e,t(`Polling for a delayed result on Modal`))},$$slots:{default:!0}}),l(o(u,6),{code:`import%20fastapi%0Aimport%20modal%0Afrom%20modal.functions%20import%20FunctionCall%0Afrom%20starlette.responses%20import%20HTMLResponse%2C%20RedirectResponse%0A%0Aapp%20%3D%20modal.App(%22example-poll-delayed-result%22)%0A%0Aweb_app%20%3D%20fastapi.FastAPI()%0A%0A%0A%40app.function(image%3Dmodal.Image.debian_slim().uv_pip_install(%22primefac%22))%0Adef%20factor_number(number)%3A%0A%20%20%20%20import%20primefac%0A%0A%20%20%20%20return%20list(primefac.primefac(number))%20%20%23%20could%20take%20a%20long%20time%0A%0A%0A%40web_app.get(%22%2F%22)%0Aasync%20def%20index()%3A%0A%20%20%20%20return%20HTMLResponse(%0A%20%20%20%20%20%20%20%20%22%22%22%0A%20%20%20%20%3Cform%20method%3D%22get%22%20action%3D%22%2Ffactors%22%3E%0A%20%20%20%20%20%20%20%20Enter%20a%20number%3A%20%3Cinput%20name%3D%22number%22%20%2F%3E%0A%20%20%20%20%20%20%20%20%3Cinput%20type%3D%22submit%22%20value%3D%22Factorize!%22%2F%3E%0A%20%20%20%20%3C%2Fform%3E%0A%20%20%20%20%22%22%22%0A%20%20%20%20)%0A%0A%0A%40web_app.get(%22%2Ffactors%22)%0Aasync%20def%20web_submit(request%3A%20fastapi.Request%2C%20number%3A%20int)%3A%0A%20%20%20%20call%20%3D%20factor_number.spawn(%0A%20%20%20%20%20%20%20%20number%0A%20%20%20%20)%20%20%23%20returns%20a%20FunctionCall%20without%20waiting%20for%20result%0A%20%20%20%20polling_url%20%3D%20request.url.replace(%0A%20%20%20%20%20%20%20%20path%3D%22%2Fresult%22%2C%20query%3Df%22function_id%3D%7Bcall.object_id%7D%22%0A%20%20%20%20)%0A%20%20%20%20return%20RedirectResponse(polling_url)%0A%0A%0A%40web_app.get(%22%2Fresult%22)%0Aasync%20def%20web_poll(function_id%3A%20str)%3A%0A%20%20%20%20function_call%20%3D%20FunctionCall.from_id(function_id)%0A%20%20%20%20try%3A%0A%20%20%20%20%20%20%20%20result%20%3D%20function_call.get(timeout%3D0)%0A%20%20%20%20except%20TimeoutError%3A%0A%20%20%20%20%20%20%20%20result%20%3D%20%22not%20ready%22%0A%0A%20%20%20%20return%20result%0A%0A%0A%40app.function()%0A%40modal.asgi_app()%0Adef%20fastapi_app()%3A%0A%20%20%20%20return%20web_app%0A`,lang:`python`}),n(e,i)},$$slots:{default:!0}}))}export{g as default,d as metadata};
//# sourceMappingURL=BQgYasXC.js.map
