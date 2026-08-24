(function(){try{var e=typeof window<`u`?window:typeof global<`u`?global:typeof globalThis<`u`?globalThis:typeof self<`u`?self:{};e.SENTRY_RELEASE={id:`f99fcf9f0a844cc9bd13fdc8e5782b84`};var t=new e.Error().stack;t&&(e._sentryDebugIds=e._sentryDebugIds||{},e._sentryDebugIds[t]=`ad7b5552-47dd-4021-9055-3a40422da743`,e._sentryDebugIdIdentifier=`sentry-dbid-ad7b5552-47dd-4021-9055-3a40422da743`)}catch{}})();import{$t as e,St as t,Tn as n,Tt as r,bt as i,c as a,d as o,en as s,tn as c,wn as l}from"./F_ixKBiO.js";import"./B1sc9Zdx.js";import"./Bb2deiU3.js";import{a as u,o as d}from"./CPby7b1n.js";import{t as f}from"./BILrvr3I.js";import{t as p}from"./B4L_if842.js";import{t as m}from"./DeWGVqas2.js";var h={toc:[{depth:1,value:`Container lifecycle hooks`,id:`container-lifecycle-hooks`,children:[{depth:2,value:`@modal.enter`,id:`modalenter`},{depth:2,value:`@modal.exit`,id:`modalexit`},{depth:2,value:`Lifecycle hooks for Web Functions`,id:`lifecycle-hooks-for-web-functions`}]}],rawContent:`# Container lifecycle hooks

Since Modal will reuse the same container for multiple inputs, sometimes you
might want to run some code exactly once when the container starts or exits.

To accomplish this, you need to use Modal's class syntax and the
[\`@app.cls\`](/docs/sdk/py/latest/App#cls) decorator. Specifically, you'll
need to:

1. Convert your function to a method by making it a member of a class.
2. Decorate the class with \`@app.cls(...)\` with same arguments you previously
   had for \`@app.function(...)\`.
3. Instead of the \`@app.function\` decorator on the original method, use
   \`@modal.method\` or the appropriate decorator for a
   [Web Function](#lifecycle-hooks-for-web-functions).
4. Add the correct method "hooks" to your class based on your need:
   - \`@modal.enter\` for one-time initialization (remote)
   - \`@modal.exit\` for one-time cleanup (remote)

## \`@modal.enter\`

The container entry handler is called when a new container is started. This is
useful for doing one-time initialization, such as loading model weights or
importing packages that are only present in that image.

To use, make your function a member of a class, and apply the \`@modal.enter()\`
decorator to one or more class methods:

\`\`\`python
import modal

app = modal.App()

@app.cls(cpu=8)
class Model:
    @modal.enter()
    def run_this_on_container_startup(self):
        import pickle
        self.model = pickle.load(open("model.pickle"))

    @modal.method()
    def predict(self, x):
        return self.model.predict(x)


@app.local_entrypoint()
def main():
    Model().predict.remote(x=123)
\`\`\`

When working with an [asynchronous Modal](/docs/guide/async) app, you may use an
async method instead:

\`\`\`python
import modal

app = modal.App()

@app.cls(memory=1024)
class Processor:
    @modal.enter()
    async def my_enter_method(self):
        self.cache = await load_cache()

    @modal.method()
    async def run(self, x):
        return await do_some_async_stuff(x, self.cache)


@app.local_entrypoint()
async def main():
    await Processor().run.remote(x=123)
\`\`\`

Note: The \`@modal.enter()\` decorator replaces the earlier \`__enter__\` syntax, which
has been deprecated.

## \`@modal.exit\`

The container exit handler is called when a container is about to exit. It is
useful for doing one-time cleanup, such as closing a database connection or
saving intermediate results. To use, make your function a member of a class, and
apply the \`@modal.exit()\` decorator:

\`\`\`python
import modal

app = modal.App()

@app.cls()
class ETLPipeline:
    @modal.enter()
    def open_connection(self):
        import psycopg2
        self.connection = psycopg2.connect(os.environ["DATABASE_URI"])

    @modal.method()
    def run(self):
        # Run some queries
        pass

    @modal.exit()
    def close_connection(self):
        self.connection.close()


@app.local_entrypoint()
def main():
    ETLPipeline().run.remote()
\`\`\`

Exit handlers are also called when a container is [preempted](/docs/guide/preemption).
The exit handler is given a grace period of 30 seconds to finish, and it will be
killed if it takes longer than that to complete.

## Lifecycle hooks for Web Functions

Modal [Web Functions](/docs/guide/webhooks) can be converted to the class syntax
as well. Instead of \`@modal.method\`, simply use whichever Web Function
decorator (\`@modal.fastapi_endpoint\`, \`@modal.asgi_app\` or \`@modal.wsgi_app\`)
you were using before.

\`\`\`python
from fastapi import Request

import modal

image = modal.Image.debian_slim().pip_install("fastapi")
app = modal.App("web-function-cls", image=image)

@app.cls()
class Model:
    @modal.enter()
    def run_this_on_container_startup(self):
        self.model = pickle.load(open("model.pickle"))

    @modal.fastapi_endpoint()
    def predict(self, request: Request):
        ...
\`\`\`
`,meta:{title:`Container lifecycle hooks`,description:`Since Modal will reuse the same container for multiple inputs, sometimes you might want to run some code exactly once when the container starts or exits.`}},{toc:g,rawContent:_,meta:v}=h,y=t(`<code>@app.cls</code>`),b=t(`<code>@modal.enter</code>`),x=t(`<code>@modal.exit</code>`),S=t(`<!> <p>Since Modal will reuse the same container for multiple inputs, sometimes you
might want to run some code exactly once when the container starts or exits.</p> <p>To accomplish this, you need to use Modal’s class syntax and the <!> decorator. Specifically, you’ll
need to:</p> <ol><li>Convert your function to a method by making it a member of a class.</li> <li>Decorate the class with <code>@app.cls(...)</code> with same arguments you previously
had for <code>@app.function(...)</code>.</li> <li>Instead of the <code>@app.function</code> decorator on the original method, use <code>@modal.method</code> or the appropriate decorator for a <!>.</li> <li>Add the correct method “hooks” to your class based on your need: <ul><li><code>@modal.enter</code> for one-time initialization (remote)</li> <li><code>@modal.exit</code> for one-time cleanup (remote)</li></ul></li></ol> <!> <p>The container entry handler is called when a new container is started. This is
useful for doing one-time initialization, such as loading model weights or
importing packages that are only present in that image.</p> <p>To use, make your function a member of a class, and apply the <code>@modal.enter()</code> decorator to one or more class methods:</p> <!> <p>When working with an <!> app, you may use an
async method instead:</p> <!> <p>Note: The <code>@modal.enter()</code> decorator replaces the earlier <code>__enter__</code> syntax, which
has been deprecated.</p> <!> <p>The container exit handler is called when a container is about to exit. It is
useful for doing one-time cleanup, such as closing a database connection or
saving intermediate results. To use, make your function a member of a class, and
apply the <code>@modal.exit()</code> decorator:</p> <!> <p>Exit handlers are also called when a container is <!>.
The exit handler is given a grace period of 30 seconds to finish, and it will be
killed if it takes longer than that to complete.</p> <!> <p>Modal <!> can be converted to the class syntax
as well. Instead of <code>@modal.method</code>, simply use whichever Web Function
decorator (<code>@modal.fastapi_endpoint</code>, <code>@modal.asgi_app</code> or <code>@modal.wsgi_app</code>)
you were using before.</p> <!>`,1);function C(t,g){let _=a(g,[`children`,`$$slots`,`$$events`,`$$legacy`]);p(t,o(()=>_,()=>h,{children:(t,a)=>{var o=S(),p=s(o);d(p,{id:`container-lifecycle-hooks`,children:(e,t)=>{l(),i(e,r(`Container lifecycle hooks`))},$$slots:{default:!0}});var h=c(p,4);m(c(e(h)),{href:`/docs/sdk/py/latest/App#cls`,children:(e,t)=>{i(e,y())},$$slots:{default:!0}}),l(),n(h);var g=c(h,2),_=c(e(g),4);m(c(e(_),5),{href:`#lifecycle-hooks-for-web-functions`,children:(e,t)=>{l(),i(e,r(`Web Function`))},$$slots:{default:!0}}),l(),n(_),l(2),n(g);var v=c(g,2);u(v,{id:`modalenter`,children:(e,t)=>{i(e,b())},$$slots:{default:!0}});var C=c(v,6);f(C,{code:`import%20modal%0A%0Aapp%20%3D%20modal.App()%0A%0A%40app.cls(cpu%3D8)%0Aclass%20Model%3A%0A%20%20%20%20%40modal.enter()%0A%20%20%20%20def%20run_this_on_container_startup(self)%3A%0A%20%20%20%20%20%20%20%20import%20pickle%0A%20%20%20%20%20%20%20%20self.model%20%3D%20pickle.load(open(%22model.pickle%22))%0A%0A%20%20%20%20%40modal.method()%0A%20%20%20%20def%20predict(self%2C%20x)%3A%0A%20%20%20%20%20%20%20%20return%20self.model.predict(x)%0A%0A%0A%40app.local_entrypoint()%0Adef%20main()%3A%0A%20%20%20%20Model().predict.remote(x%3D123)`,lang:`python`});var w=c(C,2);m(c(e(w)),{href:`/docs/guide/async`,children:(e,t)=>{l(),i(e,r(`asynchronous Modal`))},$$slots:{default:!0}}),l(),n(w);var T=c(w,2);f(T,{code:`import%20modal%0A%0Aapp%20%3D%20modal.App()%0A%0A%40app.cls(memory%3D1024)%0Aclass%20Processor%3A%0A%20%20%20%20%40modal.enter()%0A%20%20%20%20async%20def%20my_enter_method(self)%3A%0A%20%20%20%20%20%20%20%20self.cache%20%3D%20await%20load_cache()%0A%0A%20%20%20%20%40modal.method()%0A%20%20%20%20async%20def%20run(self%2C%20x)%3A%0A%20%20%20%20%20%20%20%20return%20await%20do_some_async_stuff(x%2C%20self.cache)%0A%0A%0A%40app.local_entrypoint()%0Aasync%20def%20main()%3A%0A%20%20%20%20await%20Processor().run.remote(x%3D123)`,lang:`python`});var E=c(T,4);u(E,{id:`modalexit`,children:(e,t)=>{i(e,x())},$$slots:{default:!0}});var D=c(E,4);f(D,{code:`import%20modal%0A%0Aapp%20%3D%20modal.App()%0A%0A%40app.cls()%0Aclass%20ETLPipeline%3A%0A%20%20%20%20%40modal.enter()%0A%20%20%20%20def%20open_connection(self)%3A%0A%20%20%20%20%20%20%20%20import%20psycopg2%0A%20%20%20%20%20%20%20%20self.connection%20%3D%20psycopg2.connect(os.environ%5B%22DATABASE_URI%22%5D)%0A%0A%20%20%20%20%40modal.method()%0A%20%20%20%20def%20run(self)%3A%0A%20%20%20%20%20%20%20%20%23%20Run%20some%20queries%0A%20%20%20%20%20%20%20%20pass%0A%0A%20%20%20%20%40modal.exit()%0A%20%20%20%20def%20close_connection(self)%3A%0A%20%20%20%20%20%20%20%20self.connection.close()%0A%0A%0A%40app.local_entrypoint()%0Adef%20main()%3A%0A%20%20%20%20ETLPipeline().run.remote()`,lang:`python`});var O=c(D,2);m(c(e(O)),{href:`/docs/guide/preemption`,children:(e,t)=>{l(),i(e,r(`preempted`))},$$slots:{default:!0}}),l(),n(O);var k=c(O,2);u(k,{id:`lifecycle-hooks-for-web-functions`,children:(e,t)=>{l(),i(e,r(`Lifecycle hooks for Web Functions`))},$$slots:{default:!0}});var A=c(k,2);m(c(e(A)),{href:`/docs/guide/webhooks`,children:(e,t)=>{l(),i(e,r(`Web Functions`))},$$slots:{default:!0}}),l(9),n(A),f(c(A,2),{code:`from%20fastapi%20import%20Request%0A%0Aimport%20modal%0A%0Aimage%20%3D%20modal.Image.debian_slim().pip_install(%22fastapi%22)%0Aapp%20%3D%20modal.App(%22web-function-cls%22%2C%20image%3Dimage)%0A%0A%40app.cls()%0Aclass%20Model%3A%0A%20%20%20%20%40modal.enter()%0A%20%20%20%20def%20run_this_on_container_startup(self)%3A%0A%20%20%20%20%20%20%20%20self.model%20%3D%20pickle.load(open(%22model.pickle%22))%0A%0A%20%20%20%20%40modal.fastapi_endpoint()%0A%20%20%20%20def%20predict(self%2C%20request%3A%20Request)%3A%0A%20%20%20%20%20%20%20%20...`,lang:`python`}),i(t,o)},$$slots:{default:!0}}))}export{C as default,h as metadata};
//# sourceMappingURL=Dn2KVwbS.js.map
