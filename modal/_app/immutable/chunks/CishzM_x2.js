(function(){try{var e=typeof window<`u`?window:typeof global<`u`?global:typeof globalThis<`u`?globalThis:typeof self<`u`?self:{};e.SENTRY_RELEASE={id:`f99fcf9f0a844cc9bd13fdc8e5782b84`};var t=new e.Error().stack;t&&(e._sentryDebugIds=e._sentryDebugIds||{},e._sentryDebugIds[t]=`dea70bbf-dd75-4e5f-8042-c95dfda884eb`,e._sentryDebugIdIdentifier=`sentry-dbid-dea70bbf-dd75-4e5f-8042-c95dfda884eb`)}catch{}})();import{$t as e,St as t,Tn as n,Tt as r,bt as i,c as a,d as o,en as s,tn as c,wn as l}from"./F_ixKBiO.js";import"./B1sc9Zdx.js";import"./Bb2deiU3.js";import{a as u,o as d}from"./CPby7b1n.js";import{t as f}from"./BILrvr3I.js";import{t as p}from"./B4L_if842.js";import{t as m}from"./DeWGVqas2.js";var h={crossLinks:[{text:`Use Dicts and Queues to coordinate a web scraper`,href:`/docs/examples/dicts_and_queues`}],toc:[{depth:1,value:`Queues`,id:`queues`,children:[{depth:2,value:`Modal Queues are Python queues in the cloud`,id:`modal-queues-are-python-queues-in-the-cloud`},{depth:2,value:`Queues are partitioned by key`,id:`queues-are-partitioned-by-key`},{depth:2,value:`You can access Modal Queues synchronously or asynchronously, blocking or non-blocking`,id:`you-can-access-modal-queues-synchronously-or-asynchronously-blocking-or-non-blocking`},{depth:2,value:`Modal Queues are not exactly Python Queues`,id:`modal-queues-are-not-exactly-python-queues`}]}],rawContent:`# Queues

Modal Queues provide distributed FIFO queues to your Modal Apps.

\`\`\`python runner:ModalRunner retry:2
import modal

app = modal.App()
queue = modal.Queue.from_name("simple-queue", create_if_missing=True)


def producer(x):
    queue.put(x)  # adding a value


@app.function()
def consumer():
    return queue.get()  # retrieving a value


@app.local_entrypoint()
def main(x="some object"):
    # produce and consume tasks from local or remote code
    producer(x)
    print(consumer.remote())
\`\`\`

This page is a high-level guide to using Modal Queues.
For reference documentation on the \`modal.Queue\` object, see
[this page](/docs/sdk/py/latest/Queue).
For reference documentation on the \`modal queue\` CLI command, see
[this page](/docs/cli/latest/queue).

## Modal Queues are Python queues in the cloud

Like [Python \`Queue\`s](https://docs.python.org/3/library/queue.html),
Modal Queues are multi-producer, multi-consumer first-in-first-out (FIFO) queues.

Queues are particularly useful when you want to handle tasks or process
data asynchronously, or when you need to pass messages between different
components of your distributed system.

Queues are cleared 24 hours after the last \`put\` operation and are backed by
a replicated in-memory database, so persistence is likely, but not guaranteed.
As such, \`Queue\`s are best used for communication between active functions and
not relied on for persistent storage.

[Please get in touch](mailto:support@modal.com) if you need durability for Queue objects.

## Queues are partitioned by key

Queues are split into separate FIFO partitions via a string key. By default, one
partition (corresponding to an empty key) is used.

A single \`Queue\` can contain up to 100,000 partitions, each with up to 5,000
items. Each item can be up to 1 MiB. These limits also apply to the default
partition.

Each partition has an independent TTL, by default 24 hours.
Lower TTLs can be specified by the \`partition_ttl\` argument in the \`put\` or
\`put_many\` methods.

\`\`\`python
with modal.Queue.ephemeral() as q:
    q.put("some value")  # first in
    q.put(123)

    assert q.get() == "some value"  # first out
    assert q.get() == 123

    q.put(0)
    q.put(1, partition="foo")
    q.put(2, partition="bar")

    # Default and "foo" partition are ignored by the get operation.
    assert q.get(partition="bar") == 2

    # Set custom 10s expiration time on "foo" partition.
    q.put(3, partition="foo", partition_ttl=10)

    # Iterate through items in place (read immutably)
    q.put(1)
    assert [v for v in q.iterate()] == [0, 1]
\`\`\`

## You can access Modal Queues synchronously or asynchronously, blocking or non-blocking

Queues are synchronous and blocking by default. Consumers will block and wait
on an empty Queue and producers will block and wait on a full Queue,
both with an \`Optional\`, configurable \`timeout\`. If the \`timeout\` is \`None\`,
they will wait indefinitely. If a \`timeout\` is provided, \`get\` methods will raise
[\`queue.Empty\`](https://docs.python.org/3/library/queue.html#queue.Empty)
exceptions and \`put\` methods will raise
[\`queue.Full\`](https://docs.python.org/3/library/queue.html#queue.Full)
exceptions, both from the Python standard library.

The \`get\` and \`put\` methods can be made non-blocking by setting the \`block\` argument to \`False\`.
They raise \`queue\` exceptions without waiting on the \`timeout\`.

Queues are stored in the cloud, so all interactions require communication over the network.
This adds some extra latency to calls, apart from the \`timeout\`, on the order of tens of milliseconds.
To avoid this latency impacting application latency, you can asynchronously interact with Queues
by adding the \`.aio\` function suffix to access methods.

\`\`\`python notest
@app.local_entrypoint()
async def main(value=None):
    await my_queue.put.aio(value or 200)
    assert await my_queue.get.aio() == value
\`\`\`

See the guide to [asynchronous functions](/docs/guide/async) for more
information.

## Modal Queues are not _exactly_ Python Queues

Python Queues can have values of any type.

Modal Queues can store Python objects of any serializable type.

Objects are serialized using [\`cloudpickle\`](https://github.com/cloudpipe/cloudpickle),
so precise support is inherited from that library. \`cloudpickle\` can serialize a surprising variety of objects,
like \`lambda\` functions or even Python modules, but it can't serialize a few things that don't
really make sense to serialize, like live system resources (sockets, writable file descriptors).

Note that you will need to have the library defining the type installed in the environment
where you retrieve the object so that it can be deserialized.
`,meta:{title:`Queues`,description:`Modal Queues provide distributed FIFO queues to your Modal Apps.`}},{crossLinks:g,toc:_,rawContent:v,meta:y}=h,b=t(`Python <code>Queue</code>s`,1),x=t(`<code>queue.Empty</code>`),S=t(`<code>queue.Full</code>`),C=t(`Modal Queues are not <em>exactly</em> Python Queues`,1),w=t(`<code>cloudpickle</code>`),T=t(`<!> <p>Modal Queues provide distributed FIFO queues to your Modal Apps.</p> <!> <p>This page is a high-level guide to using Modal Queues.
For reference documentation on the <code>modal.Queue</code> object, see <!>.
For reference documentation on the <code>modal queue</code> CLI command, see <!>.</p> <!> <p>Like <!>,
Modal Queues are multi-producer, multi-consumer first-in-first-out (FIFO) queues.</p> <p>Queues are particularly useful when you want to handle tasks or process
data asynchronously, or when you need to pass messages between different
components of your distributed system.</p> <p>Queues are cleared 24 hours after the last <code>put</code> operation and are backed by
a replicated in-memory database, so persistence is likely, but not guaranteed.
As such, <code>Queue</code>s are best used for communication between active functions and
not relied on for persistent storage.</p> <p><!> if you need durability for Queue objects.</p> <!> <p>Queues are split into separate FIFO partitions via a string key. By default, one
partition (corresponding to an empty key) is used.</p> <p>A single <code>Queue</code> can contain up to 100,000 partitions, each with up to 5,000
items. Each item can be up to 1 MiB. These limits also apply to the default
partition.</p> <p>Each partition has an independent TTL, by default 24 hours.
Lower TTLs can be specified by the <code>partition_ttl</code> argument in the <code>put</code> or <code>put_many</code> methods.</p> <!> <!> <p>Queues are synchronous and blocking by default. Consumers will block and wait
on an empty Queue and producers will block and wait on a full Queue,
both with an <code>Optional</code>, configurable <code>timeout</code>. If the <code>timeout</code> is <code>None</code>,
they will wait indefinitely. If a <code>timeout</code> is provided, <code>get</code> methods will raise <!> exceptions and <code>put</code> methods will raise <!> exceptions, both from the Python standard library.</p> <p>The <code>get</code> and <code>put</code> methods can be made non-blocking by setting the <code>block</code> argument to <code>False</code>.
They raise <code>queue</code> exceptions without waiting on the <code>timeout</code>.</p> <p>Queues are stored in the cloud, so all interactions require communication over the network.
This adds some extra latency to calls, apart from the <code>timeout</code>, on the order of tens of milliseconds.
To avoid this latency impacting application latency, you can asynchronously interact with Queues
by adding the <code>.aio</code> function suffix to access methods.</p> <!> <p>See the guide to <!> for more
information.</p> <!> <p>Python Queues can have values of any type.</p> <p>Modal Queues can store Python objects of any serializable type.</p> <p>Objects are serialized using <!>,
so precise support is inherited from that library. <code>cloudpickle</code> can serialize a surprising variety of objects,
like <code>lambda</code> functions or even Python modules, but it can’t serialize a few things that don’t
really make sense to serialize, like live system resources (sockets, writable file descriptors).</p> <p>Note that you will need to have the library defining the type installed in the environment
where you retrieve the object so that it can be deserialized.</p>`,1);function E(t,g){let _=a(g,[`children`,`$$slots`,`$$events`,`$$legacy`]);p(t,o(()=>_,()=>h,{children:(t,a)=>{var o=T(),p=s(o);d(p,{id:`queues`,children:(e,t)=>{l(),i(e,r(`Queues`))},$$slots:{default:!0}});var h=c(p,4);f(h,{code:`import%20modal%0A%0Aapp%20%3D%20modal.App()%0Aqueue%20%3D%20modal.Queue.from_name(%22simple-queue%22%2C%20create_if_missing%3DTrue)%0A%0A%0Adef%20producer(x)%3A%0A%20%20%20%20queue.put(x)%20%20%23%20adding%20a%20value%0A%0A%0A%40app.function()%0Adef%20consumer()%3A%0A%20%20%20%20return%20queue.get()%20%20%23%20retrieving%20a%20value%0A%0A%0A%40app.local_entrypoint()%0Adef%20main(x%3D%22some%20object%22)%3A%0A%20%20%20%20%23%20produce%20and%20consume%20tasks%20from%20local%20or%20remote%20code%0A%20%20%20%20producer(x)%0A%20%20%20%20print(consumer.remote())`,lang:`python`});var g=c(h,2),_=c(e(g),3);m(_,{href:`/docs/sdk/py/latest/Queue`,children:(e,t)=>{l(),i(e,r(`this page`))},$$slots:{default:!0}}),m(c(_,4),{href:`/docs/cli/latest/queue`,children:(e,t)=>{l(),i(e,r(`this page`))},$$slots:{default:!0}}),l(),n(g);var v=c(g,2);u(v,{id:`modal-queues-are-python-queues-in-the-cloud`,children:(e,t)=>{l(),i(e,r(`Modal Queues are Python queues in the cloud`))},$$slots:{default:!0}});var y=c(v,2);m(c(e(y)),{href:`https://docs.python.org/3/library/queue.html`,rel:`nofollow`,children:(e,t)=>{l();var n=b();l(2),i(e,n)},$$slots:{default:!0}}),l(),n(y);var E=c(y,6);m(e(E),{href:`mailto:support@modal.com`,children:(e,t)=>{l(),i(e,r(`Please get in touch`))},$$slots:{default:!0}}),l(),n(E);var D=c(E,2);u(D,{id:`queues-are-partitioned-by-key`,children:(e,t)=>{l(),i(e,r(`Queues are partitioned by key`))},$$slots:{default:!0}});var O=c(D,8);f(O,{code:`with%20modal.Queue.ephemeral()%20as%20q%3A%0A%20%20%20%20q.put(%22some%20value%22)%20%20%23%20first%20in%0A%20%20%20%20q.put(123)%0A%0A%20%20%20%20assert%20q.get()%20%3D%3D%20%22some%20value%22%20%20%23%20first%20out%0A%20%20%20%20assert%20q.get()%20%3D%3D%20123%0A%0A%20%20%20%20q.put(0)%0A%20%20%20%20q.put(1%2C%20partition%3D%22foo%22)%0A%20%20%20%20q.put(2%2C%20partition%3D%22bar%22)%0A%0A%20%20%20%20%23%20Default%20and%20%22foo%22%20partition%20are%20ignored%20by%20the%20get%20operation.%0A%20%20%20%20assert%20q.get(partition%3D%22bar%22)%20%3D%3D%202%0A%0A%20%20%20%20%23%20Set%20custom%2010s%20expiration%20time%20on%20%22foo%22%20partition.%0A%20%20%20%20q.put(3%2C%20partition%3D%22foo%22%2C%20partition_ttl%3D10)%0A%0A%20%20%20%20%23%20Iterate%20through%20items%20in%20place%20(read%20immutably)%0A%20%20%20%20q.put(1)%0A%20%20%20%20assert%20%5Bv%20for%20v%20in%20q.iterate()%5D%20%3D%3D%20%5B0%2C%201%5D`,lang:`python`});var k=c(O,2);u(k,{id:`you-can-access-modal-queues-synchronously-or-asynchronously-blocking-or-non-blocking`,children:(e,t)=>{l(),i(e,r(`You can access Modal Queues synchronously or asynchronously, blocking or non-blocking`))},$$slots:{default:!0}});var A=c(k,2),j=c(e(A),13);m(j,{href:`https://docs.python.org/3/library/queue.html#queue.Empty`,rel:`nofollow`,children:(e,t)=>{i(e,x())},$$slots:{default:!0}}),m(c(j,4),{href:`https://docs.python.org/3/library/queue.html#queue.Full`,rel:`nofollow`,children:(e,t)=>{i(e,S())},$$slots:{default:!0}}),l(),n(A);var M=c(A,6);f(M,{code:`%40app.local_entrypoint()%0Aasync%20def%20main(value%3DNone)%3A%0A%20%20%20%20await%20my_queue.put.aio(value%20or%20200)%0A%20%20%20%20assert%20await%20my_queue.get.aio()%20%3D%3D%20value`,lang:`python`});var N=c(M,2);m(c(e(N)),{href:`/docs/guide/async`,children:(e,t)=>{l(),i(e,r(`asynchronous functions`))},$$slots:{default:!0}}),l(),n(N);var P=c(N,2);u(P,{id:`modal-queues-are-not-exactly-python-queues`,children:(e,t)=>{l();var n=C();l(2),i(e,n)},$$slots:{default:!0}});var F=c(P,6);m(c(e(F)),{href:`https://github.com/cloudpipe/cloudpickle`,rel:`nofollow`,children:(e,t)=>{i(e,w())},$$slots:{default:!0}}),l(5),n(F),l(2),i(t,o)},$$slots:{default:!0}}))}export{E as default,h as metadata};
//# sourceMappingURL=CishzM_x2.js.map
