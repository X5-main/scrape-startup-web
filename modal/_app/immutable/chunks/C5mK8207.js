(function(){try{var e=typeof window<`u`?window:typeof global<`u`?global:typeof globalThis<`u`?globalThis:typeof self<`u`?self:{};e.SENTRY_RELEASE={id:`f99fcf9f0a844cc9bd13fdc8e5782b84`};var t=new e.Error().stack;t&&(e._sentryDebugIds=e._sentryDebugIds||{},e._sentryDebugIds[t]=`7d8f61fd-6e1b-43cb-bcc2-2c9c3428b5d8`,e._sentryDebugIdIdentifier=`sentry-dbid-7d8f61fd-6e1b-43cb-bcc2-2c9c3428b5d8`)}catch{}})();import{$t as e,St as t,Tn as n,Tt as r,bt as i,c as a,d as o,en as s,tn as c,wn as l}from"./F_ixKBiO.js";import"./B1sc9Zdx.js";import"./Bb2deiU3.js";import{o as u}from"./CPby7b1n.js";import{t as d}from"./BILrvr3I.js";import{t as f}from"./B4L_if842.js";import{t as p}from"./DeWGVqas2.js";var m={toc:[{depth:1,value:`Create a web wrapper for job queue, submission, polling, & results`,id:`create-a-web-wrapper-for-job-queue-submission-polling--results`}],rawContent:`# Create a web wrapper for job queue, submission, polling, & results

This simple tutorial shows you how to create an API endpoint that you can use
to poll the status of your request.

Let's first import \`modal\` and define an [\`App\`](https://modal.com/docs/reference/modal.App).

\`\`\`python
import time

import modal

app = modal.App("example-web-job-queue-wrapper")

\`\`\`

Next, we'll create a dummy backend service, in reality you may plug an a LLM or Diffusion model here.
We'll add artificial delays to simulate a cold boot and a long-running tasks.

\`\`\`python
@app.cls()
class BackendService:
    @modal.enter()
    def enter(self):
        print("begin cold booting")
        time.sleep(10)
        print("end cold booting")

    @modal.method()
    def run(self, input_val: str):
        print(f"begin run with {input_val}")
        time.sleep(5)
        print(f"end run with {input_val}")
        return input_val[::-1]  # reverse the string


\`\`\`

Then, we can define a Web Function that will submit a request to the backend service
as well as other API routes for polling or retrieving results.

To submit jobs asynchronously, we can use ['spawn'](https://modal.com/docs/reference/modal.Function#spawn),
which return a [\`FunctionCall\`](https://modal.com/docs/reference/modal.FunctionCall) object that represents
the submitted job.

Then we can poll for the job's status by calling
[\`.get(timeout=0)\`](https://modal.com/docs/reference/modal.FunctionCall#get) on the
\`FunctionCall\`, which returns immediately with the result if it's ready and otherwise
raises a \`TimeoutError\` while the job is still running.

\`\`\`python
@app.function(
    image=modal.Image.debian_slim().uv_pip_install("fastapi[standard]==0.116.0")
)
@modal.asgi_app()
@modal.concurrent(max_inputs=100)
def gateway():
    from fastapi import FastAPI, Request
    from modal.exception import OutputExpiredError

    web_app = FastAPI()

    service = BackendService()

    @web_app.post("/run")
    async def submit(request: Request):
        """Asynchronously submit a request to the backend service."""
        input_val = (await request.json())["input_val"]
        fc = service.run.spawn(input_val)
        return {"request_id": fc.object_id}

    @web_app.get("/requests/{request_id}/status")
    async def status(request_id: str):
        """Get the status of the request by polling for a result without blocking."""
        fc = modal.FunctionCall.from_id(request_id)
        try:
            await fc.get.aio(timeout=0)
            return {"status": "SUCCESS"}
        except OutputExpiredError:
            return {"status": "EXPIRED"}
        except TimeoutError:
            return {"status": "PENDING"}
        except Exception:
            return {"status": "FAILURE"}

    @web_app.get("/requests/{request_id}")
    async def result(request_id: str):
        fc = modal.FunctionCall.from_id(request_id)
        return {"response": await fc.get.aio()}

    return web_app


\`\`\`

To test this you can do:
\`\`\`bash
modal serve web_job_queue_wrapper.py
\`\`\`

Or run the test locally:
\`\`\`bash
modal run web_job_queue_wrapper.py::test_polling
\`\`\`

\`\`\`python
@app.local_entrypoint()
def test_polling():
    """Test the polling job queue by submitting a request and polling for results."""
    import json
    import urllib.parse
    import urllib.request

    # Get the deployed URL
    url = gateway.get_web_url()
    print(f"URL: {url}")

    # Submit request
    print("submitting request")
    data = json.dumps({"input_val": "Hello, world!"}).encode("utf-8")
    headers = {"Content-Type": "application/json"}
    req = urllib.request.Request(
        f"{url}/run", data=data, headers=headers, method="POST"
    )

    try:
        with urllib.request.urlopen(req) as response:
            result = json.loads(response.read().decode("utf-8"))
            request_id = result["request_id"]
            print(f"got request id: {request_id}, polling status")
    except Exception as e:
        print(f"Failed to submit request: {e}")
        return

    # Poll for status
    while True:
        try:
            with urllib.request.urlopen(
                f"{url}/requests/{request_id}/status"
            ) as response:
                data = json.loads(response.read().decode("utf-8"))
                if data["status"] == "SUCCESS":
                    print("request completed successfully")
                    break
                else:
                    print(f"request result is {data['status']}")
        except Exception as e:
            print(f"poll failed: {e}")
        time.sleep(1)

    # Retrieve result
    print("retrieving result")
    try:
        with urllib.request.urlopen(f"{url}/requests/{request_id}") as response:
            result = json.loads(response.read().decode("utf-8"))
            print(f"result is {result}")
            print("done")
    except Exception as e:
        print(f"Failed to retrieve result: {e}")

\`\`\`
`,meta:{title:`Create a web wrapper for job queue, submission, polling, & results`,description:`This simple tutorial shows you how to create an API endpoint that you can use to poll the status of your request.`}},{toc:h,rawContent:g,meta:_}=m,v=t(`<code>App</code>`),y=t(`<code>FunctionCall</code>`),b=t(`<code>.get(timeout=0)</code>`),x=t(`<!> <p>This simple tutorial shows you how to create an API endpoint that you can use
to poll the status of your request.</p> <p>Let’s first import <code>modal</code> and define an <!>.</p> <!> <p>Next, we’ll create a dummy backend service, in reality you may plug an a LLM or Diffusion model here.
We’ll add artificial delays to simulate a cold boot and a long-running tasks.</p> <!> <p>Then, we can define a Web Function that will submit a request to the backend service
as well as other API routes for polling or retrieving results.</p> <p>To submit jobs asynchronously, we can use <!>,
which return a <!> object that represents
the submitted job.</p> <p>Then we can poll for the job’s status by calling <!> on the <code>FunctionCall</code>, which returns immediately with the result if it’s ready and otherwise
raises a <code>TimeoutError</code> while the job is still running.</p> <!> <p>To test this you can do:</p> <!> <p>Or run the test locally:</p> <!> <!>`,1);function S(t,h){let g=a(h,[`children`,`$$slots`,`$$events`,`$$legacy`]);f(t,o(()=>g,()=>m,{children:(t,a)=>{var o=x(),f=s(o);u(f,{id:`create-a-web-wrapper-for-job-queue-submission-polling--results`,children:(e,t)=>{l(),i(e,r(`Create a web wrapper for job queue, submission, polling, & results`))},$$slots:{default:!0}});var m=c(f,4);p(c(e(m),3),{href:`https://modal.com/docs/reference/modal.App`,rel:`nofollow`,children:(e,t)=>{i(e,v())},$$slots:{default:!0}}),l(),n(m);var h=c(m,2);d(h,{code:`import%20time%0A%0Aimport%20modal%0A%0Aapp%20%3D%20modal.App(%22example-web-job-queue-wrapper%22)%0A`,lang:`python`});var g=c(h,4);d(g,{code:`%40app.cls()%0Aclass%20BackendService%3A%0A%20%20%20%20%40modal.enter()%0A%20%20%20%20def%20enter(self)%3A%0A%20%20%20%20%20%20%20%20print(%22begin%20cold%20booting%22)%0A%20%20%20%20%20%20%20%20time.sleep(10)%0A%20%20%20%20%20%20%20%20print(%22end%20cold%20booting%22)%0A%0A%20%20%20%20%40modal.method()%0A%20%20%20%20def%20run(self%2C%20input_val%3A%20str)%3A%0A%20%20%20%20%20%20%20%20print(f%22begin%20run%20with%20%7Binput_val%7D%22)%0A%20%20%20%20%20%20%20%20time.sleep(5)%0A%20%20%20%20%20%20%20%20print(f%22end%20run%20with%20%7Binput_val%7D%22)%0A%20%20%20%20%20%20%20%20return%20input_val%5B%3A%3A-1%5D%20%20%23%20reverse%20the%20string%0A%0A`,lang:`python`});var _=c(g,4),S=c(e(_));p(S,{href:`https://modal.com/docs/reference/modal.Function#spawn`,rel:`nofollow`,children:(e,t)=>{l(),i(e,r(`‘spawn’`))},$$slots:{default:!0}}),p(c(S,2),{href:`https://modal.com/docs/reference/modal.FunctionCall`,rel:`nofollow`,children:(e,t)=>{i(e,y())},$$slots:{default:!0}}),l(),n(_);var C=c(_,2);p(c(e(C)),{href:`https://modal.com/docs/reference/modal.FunctionCall#get`,rel:`nofollow`,children:(e,t)=>{i(e,b())},$$slots:{default:!0}}),l(5),n(C);var w=c(C,2);d(w,{code:`%40app.function(%0A%20%20%20%20image%3Dmodal.Image.debian_slim().uv_pip_install(%22fastapi%5Bstandard%5D%3D%3D0.116.0%22)%0A)%0A%40modal.asgi_app()%0A%40modal.concurrent(max_inputs%3D100)%0Adef%20gateway()%3A%0A%20%20%20%20from%20fastapi%20import%20FastAPI%2C%20Request%0A%20%20%20%20from%20modal.exception%20import%20OutputExpiredError%0A%0A%20%20%20%20web_app%20%3D%20FastAPI()%0A%0A%20%20%20%20service%20%3D%20BackendService()%0A%0A%20%20%20%20%40web_app.post(%22%2Frun%22)%0A%20%20%20%20async%20def%20submit(request%3A%20Request)%3A%0A%20%20%20%20%20%20%20%20%22%22%22Asynchronously%20submit%20a%20request%20to%20the%20backend%20service.%22%22%22%0A%20%20%20%20%20%20%20%20input_val%20%3D%20(await%20request.json())%5B%22input_val%22%5D%0A%20%20%20%20%20%20%20%20fc%20%3D%20service.run.spawn(input_val)%0A%20%20%20%20%20%20%20%20return%20%7B%22request_id%22%3A%20fc.object_id%7D%0A%0A%20%20%20%20%40web_app.get(%22%2Frequests%2F%7Brequest_id%7D%2Fstatus%22)%0A%20%20%20%20async%20def%20status(request_id%3A%20str)%3A%0A%20%20%20%20%20%20%20%20%22%22%22Get%20the%20status%20of%20the%20request%20by%20polling%20for%20a%20result%20without%20blocking.%22%22%22%0A%20%20%20%20%20%20%20%20fc%20%3D%20modal.FunctionCall.from_id(request_id)%0A%20%20%20%20%20%20%20%20try%3A%0A%20%20%20%20%20%20%20%20%20%20%20%20await%20fc.get.aio(timeout%3D0)%0A%20%20%20%20%20%20%20%20%20%20%20%20return%20%7B%22status%22%3A%20%22SUCCESS%22%7D%0A%20%20%20%20%20%20%20%20except%20OutputExpiredError%3A%0A%20%20%20%20%20%20%20%20%20%20%20%20return%20%7B%22status%22%3A%20%22EXPIRED%22%7D%0A%20%20%20%20%20%20%20%20except%20TimeoutError%3A%0A%20%20%20%20%20%20%20%20%20%20%20%20return%20%7B%22status%22%3A%20%22PENDING%22%7D%0A%20%20%20%20%20%20%20%20except%20Exception%3A%0A%20%20%20%20%20%20%20%20%20%20%20%20return%20%7B%22status%22%3A%20%22FAILURE%22%7D%0A%0A%20%20%20%20%40web_app.get(%22%2Frequests%2F%7Brequest_id%7D%22)%0A%20%20%20%20async%20def%20result(request_id%3A%20str)%3A%0A%20%20%20%20%20%20%20%20fc%20%3D%20modal.FunctionCall.from_id(request_id)%0A%20%20%20%20%20%20%20%20return%20%7B%22response%22%3A%20await%20fc.get.aio()%7D%0A%0A%20%20%20%20return%20web_app%0A%0A`,lang:`python`});var T=c(w,4);d(T,{code:`modal%20serve%20web_job_queue_wrapper.py`,lang:`bash`});var E=c(T,4);d(E,{code:`modal%20run%20web_job_queue_wrapper.py%3A%3Atest_polling`,lang:`bash`}),d(c(E,2),{code:`%40app.local_entrypoint()%0Adef%20test_polling()%3A%0A%20%20%20%20%22%22%22Test%20the%20polling%20job%20queue%20by%20submitting%20a%20request%20and%20polling%20for%20results.%22%22%22%0A%20%20%20%20import%20json%0A%20%20%20%20import%20urllib.parse%0A%20%20%20%20import%20urllib.request%0A%0A%20%20%20%20%23%20Get%20the%20deployed%20URL%0A%20%20%20%20url%20%3D%20gateway.get_web_url()%0A%20%20%20%20print(f%22URL%3A%20%7Burl%7D%22)%0A%0A%20%20%20%20%23%20Submit%20request%0A%20%20%20%20print(%22submitting%20request%22)%0A%20%20%20%20data%20%3D%20json.dumps(%7B%22input_val%22%3A%20%22Hello%2C%20world!%22%7D).encode(%22utf-8%22)%0A%20%20%20%20headers%20%3D%20%7B%22Content-Type%22%3A%20%22application%2Fjson%22%7D%0A%20%20%20%20req%20%3D%20urllib.request.Request(%0A%20%20%20%20%20%20%20%20f%22%7Burl%7D%2Frun%22%2C%20data%3Ddata%2C%20headers%3Dheaders%2C%20method%3D%22POST%22%0A%20%20%20%20)%0A%0A%20%20%20%20try%3A%0A%20%20%20%20%20%20%20%20with%20urllib.request.urlopen(req)%20as%20response%3A%0A%20%20%20%20%20%20%20%20%20%20%20%20result%20%3D%20json.loads(response.read().decode(%22utf-8%22))%0A%20%20%20%20%20%20%20%20%20%20%20%20request_id%20%3D%20result%5B%22request_id%22%5D%0A%20%20%20%20%20%20%20%20%20%20%20%20print(f%22got%20request%20id%3A%20%7Brequest_id%7D%2C%20polling%20status%22)%0A%20%20%20%20except%20Exception%20as%20e%3A%0A%20%20%20%20%20%20%20%20print(f%22Failed%20to%20submit%20request%3A%20%7Be%7D%22)%0A%20%20%20%20%20%20%20%20return%0A%0A%20%20%20%20%23%20Poll%20for%20status%0A%20%20%20%20while%20True%3A%0A%20%20%20%20%20%20%20%20try%3A%0A%20%20%20%20%20%20%20%20%20%20%20%20with%20urllib.request.urlopen(%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20f%22%7Burl%7D%2Frequests%2F%7Brequest_id%7D%2Fstatus%22%0A%20%20%20%20%20%20%20%20%20%20%20%20)%20as%20response%3A%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20data%20%3D%20json.loads(response.read().decode(%22utf-8%22))%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20if%20data%5B%22status%22%5D%20%3D%3D%20%22SUCCESS%22%3A%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20print(%22request%20completed%20successfully%22)%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20break%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20else%3A%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20print(f%22request%20result%20is%20%7Bdata%5B'status'%5D%7D%22)%0A%20%20%20%20%20%20%20%20except%20Exception%20as%20e%3A%0A%20%20%20%20%20%20%20%20%20%20%20%20print(f%22poll%20failed%3A%20%7Be%7D%22)%0A%20%20%20%20%20%20%20%20time.sleep(1)%0A%0A%20%20%20%20%23%20Retrieve%20result%0A%20%20%20%20print(%22retrieving%20result%22)%0A%20%20%20%20try%3A%0A%20%20%20%20%20%20%20%20with%20urllib.request.urlopen(f%22%7Burl%7D%2Frequests%2F%7Brequest_id%7D%22)%20as%20response%3A%0A%20%20%20%20%20%20%20%20%20%20%20%20result%20%3D%20json.loads(response.read().decode(%22utf-8%22))%0A%20%20%20%20%20%20%20%20%20%20%20%20print(f%22result%20is%20%7Bresult%7D%22)%0A%20%20%20%20%20%20%20%20%20%20%20%20print(%22done%22)%0A%20%20%20%20except%20Exception%20as%20e%3A%0A%20%20%20%20%20%20%20%20print(f%22Failed%20to%20retrieve%20result%3A%20%7Be%7D%22)%0A`,lang:`python`}),i(t,o)},$$slots:{default:!0}}))}export{S as default,m as metadata};
//# sourceMappingURL=C5mK8207.js.map
