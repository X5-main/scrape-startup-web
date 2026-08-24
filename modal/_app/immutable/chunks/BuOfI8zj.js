(function(){try{var e=typeof window<`u`?window:typeof global<`u`?global:typeof globalThis<`u`?globalThis:typeof self<`u`?self:{};e.SENTRY_RELEASE={id:`f99fcf9f0a844cc9bd13fdc8e5782b84`};var t=new e.Error().stack;t&&(e._sentryDebugIds=e._sentryDebugIds||{},e._sentryDebugIds[t]=`e57a07fe-5ea5-4d29-a4d8-974232dde600`,e._sentryDebugIdIdentifier=`sentry-dbid-e57a07fe-5ea5-4d29-a4d8-974232dde600`)}catch{}})();import{$t as e,St as t,Tn as n,Tt as r,bt as i,c as a,d as o,en as s,tn as c,wn as l}from"./F_ixKBiO.js";import"./B1sc9Zdx.js";import"./Bb2deiU3.js";import{n as u,t as d}from"./JPsrybyr.js";import{t as f}from"./BILrvr3I.js";import{t as p}from"./DeWGVqas2.js";import{t as m}from"./CdZDxCfO2.js";var h={title:`Modal's serverless KV store gets its limit raised to infinity`,description:`We've supercharged our Dicts to support new caching and locking workflows—oh, and unlimited items.`,authors:[{name:`Daniel Shaar`,avatarUrl:`https://modal-cdn.com/blog/images/dshaar-modal.webp`,jobTitle:`Member of Technical Staff`,twitterHandle:`dshaar_`}],date:`2025-05-20T12:00:00.000Z`,length:`10 minute read`,category:`News`,published:!0,layout:`blog`,toc:[{depth:2,value:`🧑‍🚀 A few small changes to Dict, a giant leap for Dict use`,id:`-a-few-small-changes-to-dict-a-giant-leap-for-dict-use`},{depth:2,value:`🧱 Building a request cache, Dict by Dict`,id:`-building-a-request-cache-dict-by-dict`},{depth:2,value:`🔒 Deduping requests—pop it, lock it`,id:`-deduping-requestspop-it-lock-it`},{depth:2,value:`💸 Shut up and give me my Dicts`,id:`-shut-up-and-give-me-my-dicts`}],rawContent:`Modal's [Dict](/docs/guide/dicts) primitive provides users with a simple TTL’ed (time-to-live) key-value store that can be accessed from any container within the same workspace environment. Dicts are well-suited for things like caching the results of function calls and communicating state changes among a fleet of containers.

Today, we’re excited to announce some major improvements to Dicts, including smarter caching, a new locking feature, and data durability!

## 🧑‍🚀 A few small changes to Dict, a giant leap for Dict use

Here's what we've changed:

|                    | Legacy Dicts             | New Dicts                                     |
| ------------------ | ------------------------ | --------------------------------------------- |
| Storage limit      | 10GiB                    | Unlimited                                     |
| Item expiry policy | 30 days since last write | 7 days since last write **OR read**           |
| Locking primitive  | N/A                      | \`.put()\` now supports a \`skip_if_exists\` flag |
| Durability         | ❌                       | ✅                                            |

These changes will apply to all **newly** created Dicts. Some cool things we think these features enable:

- LRU-like caching: now that reading extends an item’s TTL, hot cache entries will stick around for as long as they’re needed. And with unlimited items, there’s no need to worry about evicting useful data.
- Distributed locking: in the event that many containers try to perform a redundant operation or state change, you can guarantee “exactly once” semantics using \`skip_if_exists\`.

With these new properties, let’s see how we can better tackle a common use case for Dicts: reducing backend load by caching function call results.

## 🧱 Building a request cache, Dict by Dict

Let's look at a common app structure **without Dicts** that we may want to build and optimize on Modal. In this example, we have an "expensive" function that takes a while to run, along with a high concurrency Web Function as a gateway:

\`\`\`python
@app.function()
def expensive_function(x: int) -> int:
    time.sleep(30)
    return x ** 2

@app.function(image=modal.Image.debian_slim().pip_install("fastapi[standard]"))
@modal.concurrent(max_inputs=100)
@modal.fastapi_endpoint()
def expensive_function_endpoint(x: int) -> int:
    expensive_function_modal = modal.Function.from_name(APP_NAME, "expensive_function")
    return expensive_function_modal.remote(x)
\`\`\`

After running this app in production for a while, we discover that users are issuing the same few requests to the Web Function—who knew that figuring out 13 squared is 169 is all the rage. Not only that, but our app typically sees bursts of traffic for these hot requests.

As was commonly done by Modal users with the previous version of Dicts, we can define some sort of request caching class to wrap our function calls. A sample interface could look like:

\`\`\`python
class RequestCacher():
    """Utility class using \`modal.Dict\` to issue deduped requests and cache the results."""

    def __init__(self, function: modal.Function):
        self.function = function.hydrate()
        self.cache = modal.Dict.from_name(f"{function.object_id}-cache", create_if_missing=True)

    def _fetch_cached_result(self, request_id: bytes) -> Any:
        pass  # Used by \`.call()\`.

    def call(self, request_id: bytes, *args, **kwargs) -> Any:
        pass
\`\`\`

We go ahead and implement some straightforward caching logic—check the cache, if the entry isn’t there, then make the call ourselves and add it to the cache when we’re done. Problem solved!

Or so we thought... turns out those bursts of traffic contain many requests that come in all at once, so we still end up making a bunch of expensive requests to our backend code before the cache is populated. We could work hard to narrow down that race condition window and handle the edge cases. But really, wouldn’t it be great if we could guarantee that we only make the one call to our expensive function?

With Dicts, we can make something quite snazzy to do just this!

## 🔒 Deduping requests—pop it, lock it

![Diagram of request cacher](https://modal-cdn.com/blog/images/request-cacher-flow-2.webp)

Glossing over how a production version of this (that we hope to release in our client 👀) would handle various failure modes, the request handling logic now looks like:

- Try to "acquire a lock" by putting a \`pending\` entry in the Dict if it doesn't already exist.
- If someone else is / was working on the request, we read the Dict entry and poll for / fetch the result.
- Otherwise, assuming we successfully wrote the \`pending\` entry:
  - We [\`.spawn()\`](https://modal.com/docs/guide/job-queue#creating-jobs-with-spawn) a function call and insert its handle as an \`in_progress\` Dict entry.
  - Once the function call is complete, we insert the result as a \`completed\` Dict entry.

Here’s a sample implementation:

\`\`\`python
    def call(self, request_id: bytes, *args, **kwargs) -> Any:
        pending = _CacheEntry(_RequestState.PENDING, time.time())
        if not self.cache.put(request_id, pending, skip_if_exists=True):
            # This request is already being worked on or done.
            return self._fetch_cached_result(request_id)

        # Issue the request and populate the cache with the function call handle.
        function_call = self.function.spawn(*args, **kwargs)
        in_progress = _CacheEntry(_RequestState.IN_PROGRESS, function_call)
        self.cache.put(request_id, in_progress)

        # Once the function call completes, populate the cache with the result.
        result = function_call.get()
        completed = _CacheEntry(_RequestState.COMPLETED, result)
        self.cache.put(request_id, completed)
        return result
\`\`\`

The proof is in the dashboard, so here I've issued 3 identical requests to our Web Function. The second request was deduped against the first, and the third request just got the result from cache:

![Screenshot of not-so-expensive-function-endpoint dashboard](https://modal-cdn.com/blog/images/not-so-expensive-function-endpoint-dash.webp)

This not only speeds up our customer experience significantly, but we also ended up calling the expensive function only once—success!

![Screenshot of expensive-function dashboard](https://modal-cdn.com/blog/images/expensive-function-dash.webp)

## 💸 Shut up and give me my Dicts

Whether it's caching, locking, or some other state management, just create a new Dict to get started! For more details, check out our [docs](/docs/guide/dicts). Caveat: to use the \`skip_if_exists\` flag, you may need to upgrade your client version.

Got questions? Come hang out in our [community Slack](/slack)—we’d love to hear what you’re building.
`,meta:{description:`We've supercharged our Dicts to support new caching and locking workflows—oh, and unlimited items.`}},{title:g,description:_,authors:v,date:y,length:b,category:x,published:S,layout:C,toc:w,rawContent:T,meta:E}=h,D=t(`<thead><tr><th></th><th>Legacy Dicts</th><th>New Dicts</th></tr></thead> <tbody><tr><td>Storage limit</td><td>10GiB</td><td>Unlimited</td></tr><tr><td>Item expiry policy</td><td>30 days since last write</td><td>7 days since last write <strong>OR read</strong></td></tr><tr><td>Locking primitive</td><td>N/A</td><td><code>.put()</code> now supports a <code>skip_if_exists</code> flag</td></tr><tr><td>Durability</td><td>❌</td><td>✅</td></tr></tbody>`,1),O=t(`<code>.spawn()</code>`),k=t(`<p>Modal’s <!> primitive provides users with a simple TTL’ed (time-to-live) key-value store that can be accessed from any container within the same workspace environment. Dicts are well-suited for things like caching the results of function calls and communicating state changes among a fleet of containers.</p> <p>Today, we’re excited to announce some major improvements to Dicts, including smarter caching, a new locking feature, and data durability!</p> <h2 id="-a-few-small-changes-to-dict-a-giant-leap-for-dict-use">🧑‍🚀 A few small changes to Dict, a giant leap for Dict use</h2> <p>Here’s what we’ve changed:</p> <!> <p>These changes will apply to all <strong>newly</strong> created Dicts. Some cool things we think these features enable:</p> <ul><li>LRU-like caching: now that reading extends an item’s TTL, hot cache entries will stick around for as long as they’re needed. And with unlimited items, there’s no need to worry about evicting useful data.</li> <li>Distributed locking: in the event that many containers try to perform a redundant operation or state change, you can guarantee “exactly once” semantics using <code>skip_if_exists</code>.</li></ul> <p>With these new properties, let’s see how we can better tackle a common use case for Dicts: reducing backend load by caching function call results.</p> <h2 id="-building-a-request-cache-dict-by-dict">🧱 Building a request cache, Dict by Dict</h2> <p>Let’s look at a common app structure <strong>without Dicts</strong> that we may want to build and optimize on Modal. In this example, we have an “expensive” function that takes a while to run, along with a high concurrency Web Function as a gateway:</p> <!> <p>After running this app in production for a while, we discover that users are issuing the same few requests to the Web Function—who knew that figuring out 13 squared is 169 is all the rage. Not only that, but our app typically sees bursts of traffic for these hot requests.</p> <p>As was commonly done by Modal users with the previous version of Dicts, we can define some sort of request caching class to wrap our function calls. A sample interface could look like:</p> <!> <p>We go ahead and implement some straightforward caching logic—check the cache, if the entry isn’t there, then make the call ourselves and add it to the cache when we’re done. Problem solved!</p> <p>Or so we thought… turns out those bursts of traffic contain many requests that come in all at once, so we still end up making a bunch of expensive requests to our backend code before the cache is populated. We could work hard to narrow down that race condition window and handle the edge cases. But really, wouldn’t it be great if we could guarantee that we only make the one call to our expensive function?</p> <p>With Dicts, we can make something quite snazzy to do just this!</p> <h2 id="-deduping-requestspop-it-lock-it">🔒 Deduping requests—pop it, lock it</h2> <p><!></p> <p>Glossing over how a production version of this (that we hope to release in our client 👀) would handle various failure modes, the request handling logic now looks like:</p> <ul><li>Try to “acquire a lock” by putting a <code>pending</code> entry in the Dict if it doesn’t already exist.</li> <li>If someone else is / was working on the request, we read the Dict entry and poll for / fetch the result.</li> <li>Otherwise, assuming we successfully wrote the <code>pending</code> entry: <ul><li>We <!> a function call and insert its handle as an <code>in_progress</code> Dict entry.</li> <li>Once the function call is complete, we insert the result as a <code>completed</code> Dict entry.</li></ul></li></ul> <p>Here’s a sample implementation:</p> <!> <p>The proof is in the dashboard, so here I’ve issued 3 identical requests to our Web Function. The second request was deduped against the first, and the third request just got the result from cache:</p> <p><!></p> <p>This not only speeds up our customer experience significantly, but we also ended up calling the expensive function only once—success!</p> <p><!></p> <h2 id="-shut-up-and-give-me-my-dicts">💸 Shut up and give me my Dicts</h2> <p>Whether it’s caching, locking, or some other state management, just create a new Dict to get started! For more details, check out our <!>. Caveat: to use the <code>skip_if_exists</code> flag, you may need to upgrade your client version.</p> <p>Got questions? Come hang out in our <!>—we’d love to hear what you’re building.</p>`,1);function A(t,g){let _=a(g,[`children`,`$$slots`,`$$events`,`$$legacy`]);m(t,o(()=>_,()=>h,{children:(t,a)=>{var o=k(),m=s(o);p(c(e(m)),{href:`/docs/guide/dicts`,children:(e,t)=>{l(),i(e,r(`Dict`))},$$slots:{default:!0}}),l(),n(m);var h=c(m,8);u(h,{children:(e,t)=>{var n=D();l(2),i(e,n)},$$slots:{default:!0}});var g=c(h,12);f(g,{code:`%40app.function()%0Adef%20expensive_function(x%3A%20int)%20-%3E%20int%3A%0A%20%20%20%20time.sleep(30)%0A%20%20%20%20return%20x%20**%202%0A%0A%40app.function(image%3Dmodal.Image.debian_slim().pip_install(%22fastapi%5Bstandard%5D%22))%0A%40modal.concurrent(max_inputs%3D100)%0A%40modal.fastapi_endpoint()%0Adef%20expensive_function_endpoint(x%3A%20int)%20-%3E%20int%3A%0A%20%20%20%20expensive_function_modal%20%3D%20modal.Function.from_name(APP_NAME%2C%20%22expensive_function%22)%0A%20%20%20%20return%20expensive_function_modal.remote(x)`,lang:`python`});var _=c(g,6);f(_,{code:`class%20RequestCacher()%3A%0A%20%20%20%20%22%22%22Utility%20class%20using%20%60modal.Dict%60%20to%20issue%20deduped%20requests%20and%20cache%20the%20results.%22%22%22%0A%0A%20%20%20%20def%20__init__(self%2C%20function%3A%20modal.Function)%3A%0A%20%20%20%20%20%20%20%20self.function%20%3D%20function.hydrate()%0A%20%20%20%20%20%20%20%20self.cache%20%3D%20modal.Dict.from_name(f%22%7Bfunction.object_id%7D-cache%22%2C%20create_if_missing%3DTrue)%0A%0A%20%20%20%20def%20_fetch_cached_result(self%2C%20request_id%3A%20bytes)%20-%3E%20Any%3A%0A%20%20%20%20%20%20%20%20pass%20%20%23%20Used%20by%20%60.call()%60.%0A%0A%20%20%20%20def%20call(self%2C%20request_id%3A%20bytes%2C%20*args%2C%20**kwargs)%20-%3E%20Any%3A%0A%20%20%20%20%20%20%20%20pass`,lang:`python`});var v=c(_,10);d(e(v),{src:`https://modal-cdn.com/blog/images/request-cacher-flow-2.webp`,alt:`Diagram of request cacher`}),n(v);var y=c(v,4),b=c(e(y),4),x=c(e(b),3),S=e(x);p(c(e(S)),{href:`https://modal.com/docs/guide/job-queue#creating-jobs-with-spawn`,rel:`nofollow`,children:(e,t)=>{i(e,O())},$$slots:{default:!0}}),l(3),n(S),l(2),n(x),n(b),n(y);var C=c(y,4);f(C,{code:`%20%20%20%20def%20call(self%2C%20request_id%3A%20bytes%2C%20*args%2C%20**kwargs)%20-%3E%20Any%3A%0A%20%20%20%20%20%20%20%20pending%20%3D%20_CacheEntry(_RequestState.PENDING%2C%20time.time())%0A%20%20%20%20%20%20%20%20if%20not%20self.cache.put(request_id%2C%20pending%2C%20skip_if_exists%3DTrue)%3A%0A%20%20%20%20%20%20%20%20%20%20%20%20%23%20This%20request%20is%20already%20being%20worked%20on%20or%20done.%0A%20%20%20%20%20%20%20%20%20%20%20%20return%20self._fetch_cached_result(request_id)%0A%0A%20%20%20%20%20%20%20%20%23%20Issue%20the%20request%20and%20populate%20the%20cache%20with%20the%20function%20call%20handle.%0A%20%20%20%20%20%20%20%20function_call%20%3D%20self.function.spawn(*args%2C%20**kwargs)%0A%20%20%20%20%20%20%20%20in_progress%20%3D%20_CacheEntry(_RequestState.IN_PROGRESS%2C%20function_call)%0A%20%20%20%20%20%20%20%20self.cache.put(request_id%2C%20in_progress)%0A%0A%20%20%20%20%20%20%20%20%23%20Once%20the%20function%20call%20completes%2C%20populate%20the%20cache%20with%20the%20result.%0A%20%20%20%20%20%20%20%20result%20%3D%20function_call.get()%0A%20%20%20%20%20%20%20%20completed%20%3D%20_CacheEntry(_RequestState.COMPLETED%2C%20result)%0A%20%20%20%20%20%20%20%20self.cache.put(request_id%2C%20completed)%0A%20%20%20%20%20%20%20%20return%20result`,lang:`python`});var w=c(C,4);d(e(w),{src:`https://modal-cdn.com/blog/images/not-so-expensive-function-endpoint-dash.webp`,alt:`Screenshot of not-so-expensive-function-endpoint dashboard`}),n(w);var T=c(w,4);d(e(T),{src:`https://modal-cdn.com/blog/images/expensive-function-dash.webp`,alt:`Screenshot of expensive-function dashboard`}),n(T);var E=c(T,4);p(c(e(E)),{href:`/docs/guide/dicts`,children:(e,t)=>{l(),i(e,r(`docs`))},$$slots:{default:!0}}),l(3),n(E);var A=c(E,2);p(c(e(A)),{href:`/slack`,children:(e,t)=>{l(),i(e,r(`community Slack`))},$$slots:{default:!0}}),l(),n(A),i(t,o)},$$slots:{default:!0}}))}export{A as default,h as metadata};
//# sourceMappingURL=BuOfI8zj.js.map
