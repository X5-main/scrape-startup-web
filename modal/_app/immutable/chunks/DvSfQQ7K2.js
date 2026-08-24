(function(){try{var e=typeof window<`u`?window:typeof global<`u`?global:typeof globalThis<`u`?globalThis:typeof self<`u`?self:{};e.SENTRY_RELEASE={id:`f99fcf9f0a844cc9bd13fdc8e5782b84`};var t=new e.Error().stack;t&&(e._sentryDebugIds=e._sentryDebugIds||{},e._sentryDebugIds[t]=`20ebdfec-8ca8-40a2-8032-33cf8008c95a`,e._sentryDebugIdIdentifier=`sentry-dbid-20ebdfec-8ca8-40a2-8032-33cf8008c95a`)}catch{}})();import{$t as e,St as t,Tn as n,Tt as r,bt as i,c as a,d as o,en as s,tn as c,wn as l}from"./F_ixKBiO.js";import"./B1sc9Zdx.js";import"./Bb2deiU3.js";import{a as u,o as d}from"./CPby7b1n.js";import{t as f}from"./BILrvr3I.js";import{t as p}from"./B4L_if842.js";import{t as m}from"./DeWGVqas2.js";var h={crossLinks:[{text:`Use Dicts and Queues to coordinate a web scraper`,href:`/docs/examples/dicts_and_queues`}],toc:[{depth:1,value:`Dicts`,id:`dicts`,children:[{depth:2,value:`Modal Dicts are Python dicts in the cloud`,id:`modal-dicts-are-python-dicts-in-the-cloud`},{depth:2,value:`You can access Modal Dicts asynchronously`,id:`you-can-access-modal-dicts-asynchronously`},{depth:2,value:`Modal Dicts are not exactly Python dicts`,id:`modal-dicts-are-not-exactly-python-dicts`}]}],rawContent:`# Dicts

Modal Dicts provide distributed key-value storage to your Modal Apps.

\`\`\`python runner:ModalRunner
import modal

app = modal.App()
kv = modal.Dict.from_name("kv", create_if_missing=True)


@app.local_entrypoint()
def main(key="cloud", value="dictionary", put=True):
    if put:
        kv[key] = value
    print(f"{key}: {kv[key]}")
\`\`\`

This page is a high-level guide to using Modal Dicts.
For reference documentation on the \`modal.Dict\` object, see
[this page](/docs/sdk/py/latest/Dict).
For reference documentation on the \`modal dict\` CLI command, see
[this page](/docs/cli/latest/dict).

## Modal Dicts are Python dicts in the cloud

Dicts provide distributed key-value storage to your Modal Apps.
Much like a standard Python dictionary, a Dict lets you store and retrieve
values using keys. However, unlike a regular dictionary, a Dict in Modal is
accessible from anywhere, concurrently and in parallel.

\`\`\`python
# create a remote Dict
dictionary = modal.Dict.from_name("my-dict", create_if_missing=True)


dictionary["key"] = "value"  # set a value from anywhere
value = dictionary["key"]    # get a value from anywhere
\`\`\`

Dicts are persisted, which means that the data in the dictionary is
stored and can be retrieved even after the application is redeployed.

## You can access Modal Dicts asynchronously

Modal Dicts live in the cloud, which means reads and writes
against them go over the network. That has some unavoidable latency overhead,
relative to just reading from memory, of a few dozen ms.
Reads from Dicts via \`["key"]\`-style indexing are synchronous,
which means that latency is often directly felt by the application.

But like all Modal objects, you can also interact with Dicts asynchronously
by putting the \`.aio\` suffix on methods -- in this case, \`put\` and \`get\`,
which are synonyms for bracket-based indexing.
Just add the \`async\` keyword to your \`local_entrypoint\`s or remote Functions
and \`await\` the method calls.

\`\`\`python runner:ModalRunner
import modal

app = modal.App()
dictionary = modal.Dict.from_name("async-dict", create_if_missing=True)


@app.local_entrypoint()
async def main():
    await dictionary.put.aio("key", "value")  # setting a value asynchronously
    assert await dictionary.get.aio("key")   # getting a value asynchronously
\`\`\`

See the guide to [asynchronous functions](/docs/guide/async) for more
information.

## Modal Dicts are not _exactly_ Python dicts

Python dicts can have keys of any hashable type and values of any type.

You can store Python objects of any serializable type within Dicts as keys or values.

Objects are serialized using [\`cloudpickle\`](https://github.com/cloudpipe/cloudpickle),
so precise support is inherited from that library. \`cloudpickle\` can serialize a surprising variety of objects,
like \`lambda\` functions or even Python modules, but it can't serialize a few things that don't
really make sense to serialize, like live system resources (sockets, writable file descriptors).

Note that you will need to have the library defining the type installed in the environment
where you retrieve the object so that it can be deserialized.

Unlike with normal Python dictionaries, updates to mutable value types will not
be reflected in other containers unless the updated object is explicitly put
back into the Dict. As a consequence, patterns like chained updates
(\`my_dict["outer_key"]["inner_key"] = value\`) cannot be used the same way as
they would with a local dictionary.

Currently, the per-object size limit is 100 MiB and the maximum number of entries
per update is 10,000. It's recommended to use Dicts for smaller objects (under 5 MiB).
Each object in the Dict will expire after 7 days of inactivity (no reads or writes).

Dicts also provide a locking primitive. See
[this blog post](/blog/cache-dict-launch) for details.
`,meta:{title:`Dicts`,description:`Modal Dicts provide distributed key-value storage to your Modal Apps.`}},{crossLinks:g,toc:_,rawContent:v,meta:y}=h,b=t(`Modal Dicts are not <em>exactly</em> Python dicts`,1),x=t(`<code>cloudpickle</code>`),S=t(`<!> <p>Modal Dicts provide distributed key-value storage to your Modal Apps.</p> <!> <p>This page is a high-level guide to using Modal Dicts.
For reference documentation on the <code>modal.Dict</code> object, see <!>.
For reference documentation on the <code>modal dict</code> CLI command, see <!>.</p> <!> <p>Dicts provide distributed key-value storage to your Modal Apps.
Much like a standard Python dictionary, a Dict lets you store and retrieve
values using keys. However, unlike a regular dictionary, a Dict in Modal is
accessible from anywhere, concurrently and in parallel.</p> <!> <p>Dicts are persisted, which means that the data in the dictionary is
stored and can be retrieved even after the application is redeployed.</p> <!> <p>Modal Dicts live in the cloud, which means reads and writes
against them go over the network. That has some unavoidable latency overhead,
relative to just reading from memory, of a few dozen ms.
Reads from Dicts via <code>["key"]</code>-style indexing are synchronous,
which means that latency is often directly felt by the application.</p> <p>But like all Modal objects, you can also interact with Dicts asynchronously
by putting the <code>.aio</code> suffix on methods — in this case, <code>put</code> and <code>get</code>,
which are synonyms for bracket-based indexing.
Just add the <code>async</code> keyword to your <code>local_entrypoint</code>s or remote Functions
and <code>await</code> the method calls.</p> <!> <p>See the guide to <!> for more
information.</p> <!> <p>Python dicts can have keys of any hashable type and values of any type.</p> <p>You can store Python objects of any serializable type within Dicts as keys or values.</p> <p>Objects are serialized using <!>,
so precise support is inherited from that library. <code>cloudpickle</code> can serialize a surprising variety of objects,
like <code>lambda</code> functions or even Python modules, but it can’t serialize a few things that don’t
really make sense to serialize, like live system resources (sockets, writable file descriptors).</p> <p>Note that you will need to have the library defining the type installed in the environment
where you retrieve the object so that it can be deserialized.</p> <p>Unlike with normal Python dictionaries, updates to mutable value types will not
be reflected in other containers unless the updated object is explicitly put
back into the Dict. As a consequence, patterns like chained updates
(<code>my_dict["outer_key"]["inner_key"] = value</code>) cannot be used the same way as
they would with a local dictionary.</p> <p>Currently, the per-object size limit is 100 MiB and the maximum number of entries
per update is 10,000. It’s recommended to use Dicts for smaller objects (under 5 MiB).
Each object in the Dict will expire after 7 days of inactivity (no reads or writes).</p> <p>Dicts also provide a locking primitive. See <!> for details.</p>`,1);function C(t,g){let _=a(g,[`children`,`$$slots`,`$$events`,`$$legacy`]);p(t,o(()=>_,()=>h,{children:(t,a)=>{var o=S(),p=s(o);d(p,{id:`dicts`,children:(e,t)=>{l(),i(e,r(`Dicts`))},$$slots:{default:!0}});var h=c(p,4);f(h,{code:`import%20modal%0A%0Aapp%20%3D%20modal.App()%0Akv%20%3D%20modal.Dict.from_name(%22kv%22%2C%20create_if_missing%3DTrue)%0A%0A%0A%40app.local_entrypoint()%0Adef%20main(key%3D%22cloud%22%2C%20value%3D%22dictionary%22%2C%20put%3DTrue)%3A%0A%20%20%20%20if%20put%3A%0A%20%20%20%20%20%20%20%20kv%5Bkey%5D%20%3D%20value%0A%20%20%20%20print(f%22%7Bkey%7D%3A%20%7Bkv%5Bkey%5D%7D%22)`,lang:`python`});var g=c(h,2),_=c(e(g),3);m(_,{href:`/docs/sdk/py/latest/Dict`,children:(e,t)=>{l(),i(e,r(`this page`))},$$slots:{default:!0}}),m(c(_,4),{href:`/docs/cli/latest/dict`,children:(e,t)=>{l(),i(e,r(`this page`))},$$slots:{default:!0}}),l(),n(g);var v=c(g,2);u(v,{id:`modal-dicts-are-python-dicts-in-the-cloud`,children:(e,t)=>{l(),i(e,r(`Modal Dicts are Python dicts in the cloud`))},$$slots:{default:!0}});var y=c(v,4);f(y,{code:`%23%20create%20a%20remote%20Dict%0Adictionary%20%3D%20modal.Dict.from_name(%22my-dict%22%2C%20create_if_missing%3DTrue)%0A%0A%0Adictionary%5B%22key%22%5D%20%3D%20%22value%22%20%20%23%20set%20a%20value%20from%20anywhere%0Avalue%20%3D%20dictionary%5B%22key%22%5D%20%20%20%20%23%20get%20a%20value%20from%20anywhere`,lang:`python`});var C=c(y,4);u(C,{id:`you-can-access-modal-dicts-asynchronously`,children:(e,t)=>{l(),i(e,r(`You can access Modal Dicts asynchronously`))},$$slots:{default:!0}});var w=c(C,6);f(w,{code:`import%20modal%0A%0Aapp%20%3D%20modal.App()%0Adictionary%20%3D%20modal.Dict.from_name(%22async-dict%22%2C%20create_if_missing%3DTrue)%0A%0A%0A%40app.local_entrypoint()%0Aasync%20def%20main()%3A%0A%20%20%20%20await%20dictionary.put.aio(%22key%22%2C%20%22value%22)%20%20%23%20setting%20a%20value%20asynchronously%0A%20%20%20%20assert%20await%20dictionary.get.aio(%22key%22)%20%20%20%23%20getting%20a%20value%20asynchronously`,lang:`python`});var T=c(w,2);m(c(e(T)),{href:`/docs/guide/async`,children:(e,t)=>{l(),i(e,r(`asynchronous functions`))},$$slots:{default:!0}}),l(),n(T);var E=c(T,2);u(E,{id:`modal-dicts-are-not-exactly-python-dicts`,children:(e,t)=>{l();var n=b();l(2),i(e,n)},$$slots:{default:!0}});var D=c(E,6);m(c(e(D)),{href:`https://github.com/cloudpipe/cloudpickle`,rel:`nofollow`,children:(e,t)=>{i(e,x())},$$slots:{default:!0}}),l(5),n(D);var O=c(D,8);m(c(e(O)),{href:`/blog/cache-dict-launch`,children:(e,t)=>{l(),i(e,r(`this blog post`))},$$slots:{default:!0}}),l(),n(O),i(t,o)},$$slots:{default:!0}}))}export{C as default,h as metadata};
//# sourceMappingURL=DvSfQQ7K2.js.map
