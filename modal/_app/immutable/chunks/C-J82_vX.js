(function(){try{var e=typeof window<`u`?window:typeof global<`u`?global:typeof globalThis<`u`?globalThis:typeof self<`u`?self:{};e.SENTRY_RELEASE={id:`f99fcf9f0a844cc9bd13fdc8e5782b84`};var t=new e.Error().stack;t&&(e._sentryDebugIds=e._sentryDebugIds||{},e._sentryDebugIds[t]=`9c4f6d6a-c83d-4d2a-8f5a-727b518252cb`,e._sentryDebugIdIdentifier=`sentry-dbid-9c4f6d6a-c83d-4d2a-8f5a-727b518252cb`)}catch{}})();import{$t as e,St as t,Tn as n,Tt as r,bt as i,c as a,d as o,en as s,tn as c,wn as l}from"./F_ixKBiO.js";import"./B1sc9Zdx.js";import"./Bb2deiU3.js";import{a as u,o as d}from"./CPby7b1n.js";import{t as f}from"./BILrvr3I.js";import{t as p}from"./B4L_if842.js";import{t as m}from"./DeWGVqas2.js";var h={toc:[{depth:1,value:`Job processing`,id:`job-processing`,children:[{depth:2,value:`Creating jobs with .spawn()`,id:`creating-jobs-with-spawn`},{depth:2,value:`Integration with web frameworks`,id:`integration-with-web-frameworks`},{depth:2,value:`Scaling and reliability`,id:`scaling-and-reliability`}]}],rawContent:`# Job processing

Modal can be used as a scalable job queue to handle asynchronous tasks submitted
from a web app or any other Python application. This allows you to offload up to 1 million
long-running or resource-intensive tasks to Modal, while your main application
remains responsive.

## Creating jobs with .spawn()

The basic pattern for using Modal as a job queue involves three key steps:

1. Defining and deploying the job processing function using \`modal deploy\`.
2. Submitting a job using
   [\`modal.Function.spawn()\`](/docs/sdk/py/latest/Function#spawn)
3. Polling for the job's result using
   [\`modal.FunctionCall.get()\`](/docs/sdk/py/latest/FunctionCall#get)

Here's a simple example that you can run with \`modal run my_job_queue.py\`:

\`\`\`python
# my_job_queue.py
import modal

app = modal.App("my-job-queue")

@app.function()
def process_job(data):
    # Perform the job processing here
    return {"result": data}

def submit_job(data):
    # Since the \`process_job\` function is deployed, need to first look it up
    process_job = modal.Function.from_name("my-job-queue", "process_job")
    call = process_job.spawn(data)
    return call.object_id

def get_job_result(call_id):
    function_call = modal.FunctionCall.from_id(call_id)
    try:
        result = function_call.get(timeout=5)
    except modal.exception.OutputExpiredError:
        result = {"result": "expired"}
    except TimeoutError:
        result = {"result": "pending"}
    return result

@app.local_entrypoint()
def main():
    data = "my-data"

    # Submit the job to Modal
    call_id = submit_job(data)
    print(get_job_result(call_id))
\`\`\`

In this example:

- \`process_job\` is the Modal Function that performs the actual job processing.
  To deploy the \`process_job\` Function on Modal, run
  \`modal deploy my_job_queue.py\`.
- \`submit_job\` submits a new job by first looking up the deployed \`process_job\`
  Function, then calling \`.spawn()\` with the job data. It returns the unique ID
  of the spawned Function call.
- \`get_job_result\` attempts to retrieve the result of a previously submitted job
  using [\`FunctionCall.from_id()\`](/docs/sdk/py/latest/FunctionCall#from_id) and
  [\`FunctionCall.get()\`](/docs/sdk/py/latest/FunctionCall#get).
  [\`FunctionCall.get()\`](/docs/sdk/py/latest/FunctionCall#get) waits indefinitely
  by default. It takes an optional timeout argument that specifies the maximum
  number of seconds to wait, which can be set to 0 to poll for an output
  immediately. Here, if the job hasn't completed yet, we return a pending
  response.
- The results of a \`.spawn()\` are accessible via \`FunctionCall.get()\` for up to
  7 days after completion. After this period, we return an expired response.

[Document OCR Web App](/docs/examples/doc_ocr_webapp) is an example that uses
this pattern.

## Integration with web frameworks

You can easily integrate the job queue pattern with web frameworks like FastAPI.
Here's an example, assuming that you have already deployed \`process_job\` on
Modal with \`modal deploy\` as above. This example won't work if you haven't
deployed your app yet.

\`\`\`python
# my_job_queue_endpoint.py
import modal

image = modal.Image.debian_slim().pip_install("fastapi[standard]")
app = modal.App("fastapi-modal", image=image)


@app.function()
@modal.asgi_app()
@modal.concurrent(max_inputs=20)
def fastapi_app():
    from fastapi import FastAPI

    web_app = FastAPI()

    @web_app.post("/submit")
    async def submit_job_endpoint(data):
        process_job = modal.Function.from_name("my-job-queue", "process_job")

        call = await process_job.spawn.aio(data)
        return {"call_id": call.object_id}


    @web_app.get("/result/{call_id}")
    async def get_job_result_endpoint(call_id: str):
        function_call = modal.FunctionCall.from_id(call_id)
        try:
            result = await function_call.get.aio(timeout=0)
        except modal.exception.OutputExpiredError:
            return fastapi.responses.JSONResponse(content="", status_code=404)
        except TimeoutError:
            return fastapi.responses.JSONResponse(content="", status_code=202)

        return result

    return web_app
\`\`\`

In this example:

- The \`/submit\` endpoint accepts job data, submits a new job using
  \`await process_job.spawn.aio()\`, and returns the job's ID to the client.
- The \`/result/{call_id}\` endpoint allows the client to poll for the job's
  result using the job ID. If the job hasn't completed yet, it returns a 202
  status code to indicate that the job is still being processed. If the job
  has expired, it returns a 404 status code to indicate that the job is not found.

You can try this app by serving it with \`modal serve\`:

\`\`\`shell
modal serve my_job_queue_endpoint.py
\`\`\`

Then interact with its endpoints with \`curl\`:

\`\`\`shell
# Make a POST request to your app endpoint with.
$ curl -X POST $YOUR_APP_ENDPOINT/submit?data=data
{"call_id":"fc-XXX"}

# Use the call_id value from above.
$ curl -X GET $YOUR_APP_ENDPOINT/result/fc-XXX
\`\`\`

## Scaling and reliability

Modal automatically scales the job queue based on the workload, spinning up new
instances as needed to process jobs concurrently. It also provides built-in
reliability features like automatic retries and timeout handling.

You can customize the behavior of the job queue by configuring the
\`@app.function()\` decorator with options like
[\`retries\`](/docs/guide/retries#function-retries),
[\`timeout\`](/docs/guide/timeouts#timeouts), and
[\`max_containers\`](/docs/guide/scale#configuring-autoscaling-behavior).
`,meta:{title:`Job processing`,description:`Modal can be used as a scalable job queue to handle asynchronous tasks submitted from a web app or any other Python application. This allows you to offload up to 1 million long-running or resource-intensive tasks to Modal, while your main application remains responsive.`}},{toc:g,rawContent:_,meta:v}=h,y=t(`<code>modal.Function.spawn()</code>`),b=t(`<code>modal.FunctionCall.get()</code>`),x=t(`<code>FunctionCall.from_id()</code>`),S=t(`<code>FunctionCall.get()</code>`),C=t(`<code>FunctionCall.get()</code>`),w=t(`<code>retries</code>`),T=t(`<code>timeout</code>`),E=t(`<code>max_containers</code>`),D=t(`<!> <p>Modal can be used as a scalable job queue to handle asynchronous tasks submitted
from a web app or any other Python application. This allows you to offload up to 1 million
long-running or resource-intensive tasks to Modal, while your main application
remains responsive.</p> <!> <p>The basic pattern for using Modal as a job queue involves three key steps:</p> <ol><li>Defining and deploying the job processing function using <code>modal deploy</code>.</li> <li>Submitting a job using <!></li> <li>Polling for the job’s result using <!></li></ol> <p>Here’s a simple example that you can run with <code>modal run my_job_queue.py</code>:</p> <!> <p>In this example:</p> <ul><li><code>process_job</code> is the Modal Function that performs the actual job processing.
To deploy the <code>process_job</code> Function on Modal, run <code>modal deploy my_job_queue.py</code>.</li> <li><code>submit_job</code> submits a new job by first looking up the deployed <code>process_job</code> Function, then calling <code>.spawn()</code> with the job data. It returns the unique ID
of the spawned Function call.</li> <li><code>get_job_result</code> attempts to retrieve the result of a previously submitted job
using <!> and <!>. <!> waits indefinitely
by default. It takes an optional timeout argument that specifies the maximum
number of seconds to wait, which can be set to 0 to poll for an output
immediately. Here, if the job hasn’t completed yet, we return a pending
response.</li> <li>The results of a <code>.spawn()</code> are accessible via <code>FunctionCall.get()</code> for up to
7 days after completion. After this period, we return an expired response.</li></ul> <p><!> is an example that uses
this pattern.</p> <!> <p>You can easily integrate the job queue pattern with web frameworks like FastAPI.
Here’s an example, assuming that you have already deployed <code>process_job</code> on
Modal with <code>modal deploy</code> as above. This example won’t work if you haven’t
deployed your app yet.</p> <!> <p>In this example:</p> <ul><li>The <code>/submit</code> endpoint accepts job data, submits a new job using <code>await process_job.spawn.aio()</code>, and returns the job’s ID to the client.</li> <li>The <code>/result/&#123;call_id&#125;</code> endpoint allows the client to poll for the job’s
result using the job ID. If the job hasn’t completed yet, it returns a 202
status code to indicate that the job is still being processed. If the job
has expired, it returns a 404 status code to indicate that the job is not found.</li></ul> <p>You can try this app by serving it with <code>modal serve</code>:</p> <!> <p>Then interact with its endpoints with <code>curl</code>:</p> <!> <!> <p>Modal automatically scales the job queue based on the workload, spinning up new
instances as needed to process jobs concurrently. It also provides built-in
reliability features like automatic retries and timeout handling.</p> <p>You can customize the behavior of the job queue by configuring the <code>@app.function()</code> decorator with options like <!>, <!>, and <!>.</p>`,1);function O(t,g){let _=a(g,[`children`,`$$slots`,`$$events`,`$$legacy`]);p(t,o(()=>_,()=>h,{children:(t,a)=>{var o=D(),p=s(o);d(p,{id:`job-processing`,children:(e,t)=>{l(),i(e,r(`Job processing`))},$$slots:{default:!0}});var h=c(p,4);u(h,{id:`creating-jobs-with-spawn`,children:(e,t)=>{l(),i(e,r(`Creating jobs with .spawn()`))},$$slots:{default:!0}});var g=c(h,4),_=c(e(g),2);m(c(e(_)),{href:`/docs/sdk/py/latest/Function#spawn`,children:(e,t)=>{i(e,y())},$$slots:{default:!0}}),n(_);var v=c(_,2);m(c(e(v)),{href:`/docs/sdk/py/latest/FunctionCall#get`,children:(e,t)=>{i(e,b())},$$slots:{default:!0}}),n(v),n(g);var O=c(g,4);f(O,{code:`%23%20my_job_queue.py%0Aimport%20modal%0A%0Aapp%20%3D%20modal.App(%22my-job-queue%22)%0A%0A%40app.function()%0Adef%20process_job(data)%3A%0A%20%20%20%20%23%20Perform%20the%20job%20processing%20here%0A%20%20%20%20return%20%7B%22result%22%3A%20data%7D%0A%0Adef%20submit_job(data)%3A%0A%20%20%20%20%23%20Since%20the%20%60process_job%60%20function%20is%20deployed%2C%20need%20to%20first%20look%20it%20up%0A%20%20%20%20process_job%20%3D%20modal.Function.from_name(%22my-job-queue%22%2C%20%22process_job%22)%0A%20%20%20%20call%20%3D%20process_job.spawn(data)%0A%20%20%20%20return%20call.object_id%0A%0Adef%20get_job_result(call_id)%3A%0A%20%20%20%20function_call%20%3D%20modal.FunctionCall.from_id(call_id)%0A%20%20%20%20try%3A%0A%20%20%20%20%20%20%20%20result%20%3D%20function_call.get(timeout%3D5)%0A%20%20%20%20except%20modal.exception.OutputExpiredError%3A%0A%20%20%20%20%20%20%20%20result%20%3D%20%7B%22result%22%3A%20%22expired%22%7D%0A%20%20%20%20except%20TimeoutError%3A%0A%20%20%20%20%20%20%20%20result%20%3D%20%7B%22result%22%3A%20%22pending%22%7D%0A%20%20%20%20return%20result%0A%0A%40app.local_entrypoint()%0Adef%20main()%3A%0A%20%20%20%20data%20%3D%20%22my-data%22%0A%0A%20%20%20%20%23%20Submit%20the%20job%20to%20Modal%0A%20%20%20%20call_id%20%3D%20submit_job(data)%0A%20%20%20%20print(get_job_result(call_id))`,lang:`python`});var k=c(O,4),A=c(e(k),4),j=c(e(A),2);m(j,{href:`/docs/sdk/py/latest/FunctionCall#from_id`,children:(e,t)=>{i(e,x())},$$slots:{default:!0}});var M=c(j,2);m(M,{href:`/docs/sdk/py/latest/FunctionCall#get`,children:(e,t)=>{i(e,S())},$$slots:{default:!0}}),m(c(M,2),{href:`/docs/sdk/py/latest/FunctionCall#get`,children:(e,t)=>{i(e,C())},$$slots:{default:!0}}),l(),n(A),l(2),n(k);var N=c(k,2);m(e(N),{href:`/docs/examples/doc_ocr_webapp`,children:(e,t)=>{l(),i(e,r(`Document OCR Web App`))},$$slots:{default:!0}}),l(),n(N);var P=c(N,2);u(P,{id:`integration-with-web-frameworks`,children:(e,t)=>{l(),i(e,r(`Integration with web frameworks`))},$$slots:{default:!0}});var F=c(P,4);f(F,{code:`%23%20my_job_queue_endpoint.py%0Aimport%20modal%0A%0Aimage%20%3D%20modal.Image.debian_slim().pip_install(%22fastapi%5Bstandard%5D%22)%0Aapp%20%3D%20modal.App(%22fastapi-modal%22%2C%20image%3Dimage)%0A%0A%0A%40app.function()%0A%40modal.asgi_app()%0A%40modal.concurrent(max_inputs%3D20)%0Adef%20fastapi_app()%3A%0A%20%20%20%20from%20fastapi%20import%20FastAPI%0A%0A%20%20%20%20web_app%20%3D%20FastAPI()%0A%0A%20%20%20%20%40web_app.post(%22%2Fsubmit%22)%0A%20%20%20%20async%20def%20submit_job_endpoint(data)%3A%0A%20%20%20%20%20%20%20%20process_job%20%3D%20modal.Function.from_name(%22my-job-queue%22%2C%20%22process_job%22)%0A%0A%20%20%20%20%20%20%20%20call%20%3D%20await%20process_job.spawn.aio(data)%0A%20%20%20%20%20%20%20%20return%20%7B%22call_id%22%3A%20call.object_id%7D%0A%0A%0A%20%20%20%20%40web_app.get(%22%2Fresult%2F%7Bcall_id%7D%22)%0A%20%20%20%20async%20def%20get_job_result_endpoint(call_id%3A%20str)%3A%0A%20%20%20%20%20%20%20%20function_call%20%3D%20modal.FunctionCall.from_id(call_id)%0A%20%20%20%20%20%20%20%20try%3A%0A%20%20%20%20%20%20%20%20%20%20%20%20result%20%3D%20await%20function_call.get.aio(timeout%3D0)%0A%20%20%20%20%20%20%20%20except%20modal.exception.OutputExpiredError%3A%0A%20%20%20%20%20%20%20%20%20%20%20%20return%20fastapi.responses.JSONResponse(content%3D%22%22%2C%20status_code%3D404)%0A%20%20%20%20%20%20%20%20except%20TimeoutError%3A%0A%20%20%20%20%20%20%20%20%20%20%20%20return%20fastapi.responses.JSONResponse(content%3D%22%22%2C%20status_code%3D202)%0A%0A%20%20%20%20%20%20%20%20return%20result%0A%0A%20%20%20%20return%20web_app`,lang:`python`});var I=c(F,8);f(I,{code:`modal%20serve%20my_job_queue_endpoint.py`,lang:`shell`});var L=c(I,4);f(L,{code:`%23%20Make%20a%20POST%20request%20to%20your%20app%20endpoint%20with.%0A%24%20curl%20-X%20POST%20%24YOUR_APP_ENDPOINT%2Fsubmit%3Fdata%3Ddata%0A%7B%22call_id%22%3A%22fc-XXX%22%7D%0A%0A%23%20Use%20the%20call_id%20value%20from%20above.%0A%24%20curl%20-X%20GET%20%24YOUR_APP_ENDPOINT%2Fresult%2Ffc-XXX`,lang:`shell`});var R=c(L,2);u(R,{id:`scaling-and-reliability`,children:(e,t)=>{l(),i(e,r(`Scaling and reliability`))},$$slots:{default:!0}});var z=c(R,4),B=c(e(z),3);m(B,{href:`/docs/guide/retries#function-retries`,children:(e,t)=>{i(e,w())},$$slots:{default:!0}});var V=c(B,2);m(V,{href:`/docs/guide/timeouts#timeouts`,children:(e,t)=>{i(e,T())},$$slots:{default:!0}}),m(c(V,2),{href:`/docs/guide/scale#configuring-autoscaling-behavior`,children:(e,t)=>{i(e,E())},$$slots:{default:!0}}),l(),n(z),i(t,o)},$$slots:{default:!0}}))}export{O as default,h as metadata};
//# sourceMappingURL=C-J82_vX.js.map
