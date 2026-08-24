(function(){try{var e=typeof window<`u`?window:typeof global<`u`?global:typeof globalThis<`u`?globalThis:typeof self<`u`?self:{};e.SENTRY_RELEASE={id:`f99fcf9f0a844cc9bd13fdc8e5782b84`};var t=new e.Error().stack;t&&(e._sentryDebugIds=e._sentryDebugIds||{},e._sentryDebugIds[t]=`5ecfea40-caf5-4608-ab17-65e5d115eed5`,e._sentryDebugIdIdentifier=`sentry-dbid-5ecfea40-caf5-4608-ab17-65e5d115eed5`)}catch{}})();import{$t as e,St as t,Tn as ee,Tt as n,bt as r,c as te,d as i,en as ne,tn as a,wn as o}from"./F_ixKBiO.js";import"./B1sc9Zdx.js";import"./Bb2deiU3.js";import{a as s,i as c,o as re}from"./CPby7b1n.js";import{t as l}from"./BILrvr3I.js";import{t as u}from"./B4L_if842.js";import{t as ie}from"./DeWGVqas2.js";import{t as d}from"./B6UiYoTw.js";var f={toc:[{depth:1,value:`Queue`,id:`queue`,children:[{depth:2,value:`hydrate`,id:`hydrate`},{depth:2,value:`objects`,id:`objects`,children:[{depth:3,value:`objects.create`,id:`objectscreate`},{depth:3,value:`objects.list`,id:`objectslist`},{depth:3,value:`objects.delete`,id:`objectsdelete`}]},{depth:2,value:`name`,id:`name`},{depth:2,value:`validate_partition_key`,id:`validate_partition_key`},{depth:2,value:`ephemeral`,id:`ephemeral`},{depth:2,value:`from_name`,id:`from_name`},{depth:2,value:`from_id`,id:`from_id`},{depth:2,value:`info`,id:`info`},{depth:2,value:`clear`,id:`clear`},{depth:2,value:`get`,id:`get`},{depth:2,value:`get_many`,id:`get_many`},{depth:2,value:`put`,id:`put`},{depth:2,value:`put_many`,id:`put_many`},{depth:2,value:`len`,id:`len`},{depth:2,value:`iterate`,id:`iterate`}]}],rawContent:`# Queue


\`\`\`python
class Queue(modal.object.Object)
\`\`\`

Distributed, FIFO queue for data flow in Modal apps.

The queue can contain any object serializable by \`cloudpickle\`, including Modal objects.

By default, the \`Queue\` object acts as a single FIFO queue which supports puts and gets (blocking and non-blocking).

**Usage**

\`\`\`python
from modal import Queue

# Create an ephemeral queue which is anonymous and garbage collected
with Queue.ephemeral() as my_queue:
    # Putting values
    my_queue.put("some value")
    my_queue.put(123)

    # Getting values
    assert my_queue.get() == "some value"
    assert my_queue.get() == 123

    # Using partitions
    my_queue.put(0)
    my_queue.put(1, partition="foo")
    my_queue.put(2, partition="bar")

    # Default and "foo" partition are ignored by the get operation.
    assert my_queue.get(partition="bar") == 2

    # Set custom 10s expiration time on "foo" partition.
    my_queue.put(3, partition="foo", partition_ttl=10)

    # Iterate through items in place (read immutably)
    my_queue.put(1)
    assert [v for v in my_queue.iterate()] == [0, 1]

# You can also create persistent queues that can be used across apps
queue = Queue.from_name("my-persisted-queue", create_if_missing=True)
queue.put(42)
assert queue.get() == 42
\`\`\`

For more examples, see the [guide](https://modal.com/docs/guide/dicts-and-queues#modal-queues).

**Queue partitions**

Specifying partition keys gives access to other independent FIFO partitions within the same \`Queue\` object.
Across any two partitions, puts and gets are completely independent.
For example, a put in one partition does not affect a get in any other partition.

When no partition key is specified (by default), puts and gets will operate on a default partition.
This default partition is also isolated from all other partitions.
Please see the Usage section below for an example using partitions.

**Lifetime of a queue and its partitions**

By default, each partition is cleared 24 hours after the last \`put\` operation.
A lower TTL can be specified by the \`partition_ttl\` argument in the \`put\` or \`put_many\` methods.
Each partition's expiry is handled independently.

As such, \`Queue\`s are best used for communication between active functions and not relied on for persistent
storage.

On app completion or after stopping an app any associated \`Queue\` objects are cleaned up.
All its partitions will be cleared.

**Limits**

A single \`Queue\` can contain up to 100,000 partitions, each with up to 5,000 items. Each item can be up to
1 MiB.

Partition keys must be non-empty and must not exceed 64 bytes.


## hydrate

\`\`\`python
hydrate(self, client=None)
\`\`\`
Synchronize the local object with its identity on the Modal server.

It is rarely necessary to call this method explicitly, as most operations
will lazily hydrate when needed. The main use case is when you need to
access object metadata, such as its ID.

*Added in v0.72.39*: This method replaces the deprecated \`.resolve()\` method.

## objects


\`\`\`python
objects: QueueManager
\`\`\`

Namespace with methods for managing named Queue objects.


### objects.create

\`\`\`python
create(self, name, *, allow_existing=False, environment_name=None, client=None)
\`\`\`
Create a new named Queue in the workspace environment.

This does not return a local handle; use \`modal.Queue.from_name\` to look up the Queue after creation.

Added in v1.1.2.

**Parameters**

<Parameter name="name" type="str" description="Name for the new Queue." />
<Parameter name="allow_existing" type="bool" defaultValue="False" description="If True, do nothing when a Queue with this name already exists." />
<Parameter name="environment_name" type="str | None" defaultValue="None" description="Environment to create in; defaults to the active environment." />
<Parameter name="client" type="_Client | None" defaultValue="None" description="Modal client to use; defaults to \`Client.from_env()\` when omitted." />

**Usage**

\`\`\`python notest
modal.Queue.objects.create("my-queue")
\`\`\`

Queues will be created in the active environment, or another one can be specified:

\`\`\`python notest
modal.Queue.objects.create("my-queue", environment_name="dev")
\`\`\`

By default, an error is raised if the Queue already exists; \`allow_existing=True\` makes that case a no-op:

\`\`\`python notest
modal.Queue.objects.create("my-queue", allow_existing=True)
\`\`\`

Note that this method does not return a local instance of the Queue. You can use
\`modal.Queue.from_name\` to perform a lookup after creation.

### objects.list

\`\`\`python
list(self, *, max_objects=None, created_before=None, environment_name="",
    client=None)
\`\`\`
List named Queues in the workspace environment as hydrated handles.

Results are ordered newest to oldest. By default, all matching Queues are returned.

Added in v1.1.2.

**Parameters**

<Parameter name="max_objects" type="int | None" defaultValue="None" description="Maximum number of Queues to return." />
<Parameter name="created_before" type="datetime | str | None" defaultValue="None" description="Only include Queues created before this time (datetime or ISO date string)." />
<Parameter name="environment_name" type="str" defaultValue="&quot;&quot;" description="Environment to list from; defaults to the active environment." />
<Parameter name="client" type="_Client | None" defaultValue="None" description="Modal client to use; defaults to \`Client.from_env()\` when omitted." />

**Returns**

Hydrated \`Queue\` objects for each named Queue in the listing.

**Usage**

\`\`\`python
queues = modal.Queue.objects.list()
print([q.name for q in queues])
\`\`\`

Queues will be retrieved from the active environment, or another one can be specified:

\`\`\`python notest
dev_queues = modal.Queue.objects.list(environment_name="dev")
\`\`\`

By default, all named Queues are returned, newest to oldest. It's also possible to limit the
number of results and to filter by creation date:

\`\`\`python
queues = modal.Queue.objects.list(max_objects=10, created_before="2025-01-01")
\`\`\`

### objects.delete

\`\`\`python
delete(self, name, *, allow_missing=False, environment_name=None, client=None)
\`\`\`
Delete a named Queue entirely (not a single message or partition).

Deletion is irreversible and affects any Apps using this Queue.

Added in v1.1.2.

**Parameters**

<Parameter name="name" type="str" description="Name of the Queue to delete." />
<Parameter name="allow_missing" type="bool" defaultValue="False" description="If True, do nothing when the Queue does not exist." />
<Parameter name="environment_name" type="str | None" defaultValue="None" description="Environment to delete from; defaults to the active environment." />
<Parameter name="client" type="_Client | None" defaultValue="None" description="Modal client to use; defaults to \`Client.from_env()\` when omitted." />

**Usage**

\`\`\`python notest
await modal.Queue.objects.delete("my-queue")
\`\`\`

Queues will be deleted from the active environment, or another one can be specified:

\`\`\`python notest
await modal.Queue.objects.delete("my-queue", environment_name="dev")
\`\`\`

## name

\`\`\`python
name(self)
\`\`\`


## validate_partition_key

\`\`\`python
validate_partition_key(partition)
\`\`\`


## ephemeral

\`\`\`python
ephemeral(cls, client=None, environment_name=None)
\`\`\`
Create an anonymous Queue that exists for the duration of the context manager.

**Parameters**

<Parameter name="client" type="_Client | None" defaultValue="None" description="Modal client to use; defaults to \`Client.from_env()\` when omitted." />
<Parameter name="environment_name" type="str | None" defaultValue="None" description="Environment for the ephemeral Queue; defaults to the active environment." />

**Usage**

\`\`\`python
from modal import Queue

with Queue.ephemeral() as q:
    q.put(123)
\`\`\`

\`\`\`python notest
async with Queue.ephemeral() as q:
    await q.put.aio(123)
\`\`\`

## from_name

\`\`\`python
from_name(name, *, environment_name=None, create_if_missing=False, client=None)
\`\`\`
Reference a named Queue, optionally creating it on the server first.

Hydration is lazy: metadata is fetched from Modal the first time the handle is used.

**Parameters**

<Parameter name="name" type="str" description="Deployment name of the Queue." />
<Parameter name="environment_name" type="str | None" defaultValue="None" description="Environment to resolve the name in; defaults to the active environment." />
<Parameter name="create_if_missing" type="bool" defaultValue="False" description="If True, create the Queue when it does not already exist." />
<Parameter name="client" type="_Client | None" defaultValue="None" description="Modal client to use for loading; defaults to \`Client.from_env()\` when omitted." />

**Returns**

A \`Queue\` handle (possibly not yet hydrated).

**Usage**

\`\`\`python
q = modal.Queue.from_name("my-queue", create_if_missing=True)
q.put(123)
\`\`\`

## from_id

\`\`\`python
from_id(queue_id, client=None)
\`\`\`
Construct a Queue from an id and look up the Queue metadata.

This is a lazy method that defers hydrating the local
object with metadata from Modal servers until the first
time it is actually used.

The ID of a Queue object can be accessed using \`.object_id\`.

**Parameters**

<Parameter name="queue_id" type="str" description="Queue object ID to attach to." />
<Parameter name="client" type="_Client | None" defaultValue="None" description="Modal client to use for loading; defaults to \`Client.from_env()\` when omitted." />

**Returns**

A \`Queue\` handle (possibly not yet hydrated).

**Usage**

\`\`\`python notest
@app.function()
def my_consumer(queue_id: str):
    queue = modal.Queue.from_id(queue_id)
    queue.put("Hello from remote function!")

with modal.Queue.ephemeral() as q:
    my_consumer.remote(q.object_id)
    print(q.get())  # "Hello from remote function!"
\`\`\`

## info

\`\`\`python
info(self)
\`\`\`
Return information about the Queue object.

## clear

\`\`\`python
clear(self, *, partition=None, all=False)
\`\`\`
Clear the contents of a single partition or all partitions.

Warning: this is a destructive operation and will irrevocably delete data.

**Parameters**

<Parameter name="partition" type="str | None" defaultValue="None" description="Partition to clear; omit with \`all=True\` to clear every partition." />
<Parameter name="all" type="bool" defaultValue="False" description="If True, clear all partitions (\`partition\` must not be set)." />

**Usage**

\`\`\`python
q = modal.Queue.from_name("my-queue", create_if_missing=True)
q.clear()
\`\`\`

## get

\`\`\`python
get(self, block=True, timeout=None, *, partition=None)
\`\`\`
Remove and return the next object in the queue.

If \`block\` is \`True\` (the default) and the queue is empty, \`get\` will wait indefinitely for
an object, or until \`timeout\` if specified. Raises a native \`queue.Empty\` exception
if the \`timeout\` is reached.

If \`block\` is \`False\`, \`get\` returns \`None\` immediately if the queue is empty. The \`timeout\` is
ignored in this case.

**Parameters**

<Parameter name="block" type="bool" defaultValue="True" description="If True, wait for an item; if False, return \`\`None\`\` immediately when empty." />
<Parameter name="timeout" type="float | None" defaultValue="None" description="Seconds to wait when blocking; ignored when \`\`block\`\` is False." />
<Parameter name="partition" type="str | None" defaultValue="None" description="FIFO partition to read from; uses the default partition when omitted." />

## get_many

\`\`\`python
get_many(self, n_values, block=True, timeout=None, *, partition=None)
\`\`\`
Remove and return up to \`n_values\` objects from the queue.

If there are fewer than \`n_values\` items in the queue, return all of them.

If \`block\` is \`True\` (the default) and the queue is empty, \`get_many\` waits until at least one
object is present, or until \`timeout\` if specified. Raises the stdlib's \`queue.Empty\` if the
timeout is reached before any item arrives.

If \`block\` is \`False\`, this returns an empty list immediately when the queue is empty. The \`timeout\`
is ignored in that case.

**Parameters**

<Parameter name="n_values" type="int" description="Maximum number of items to remove and return." />
<Parameter name="block" type="bool" defaultValue="True" description="If True, wait until at least one item is available (or until \`timeout\`); if False, return immediately when empty." />
<Parameter name="timeout" type="float | None" defaultValue="None" description="Seconds to wait when blocking; ignored when \`\`block\`\` is False." />
<Parameter name="partition" type="str | None" defaultValue="None" description="FIFO partition to read from; uses the default partition when omitted." />

## put

\`\`\`python
put(self, v, block=True, timeout=None, *, partition=None, partition_ttl=24 *
    3600)
\`\`\`
Add an object to the end of the queue.

If \`block\` is \`True\` and the queue is full, this method will retry indefinitely or
until \`timeout\` if specified. Raises the stdlib's \`queue.Full\` exception if the \`timeout\` is reached.
If blocking it is not recommended to omit the \`timeout\`, as the operation could wait indefinitely.

If \`block\` is \`False\`, this method raises \`queue.Full\` immediately if the queue is full. The \`timeout\` is
ignored in this case.

**Parameters**

<Parameter name="v" type="Any" description="Value to enqueue (must be serializable)." />
<Parameter name="block" type="bool" defaultValue="True" description="If True, wait for capacity; if False, fail immediately when full." />
<Parameter name="timeout" type="float | None" defaultValue="None" description="Max seconds to wait when blocking." />
<Parameter name="partition" type="str | None" defaultValue="None" description="FIFO partition to write to; uses the default partition when omitted." />
<Parameter name="partition_ttl" type="int" defaultValue="24 * 3600" description="Seconds after the last activity before this partition may be cleared (default 24 hours)." />

## put_many

\`\`\`python
put_many(self, vs, block=True, timeout=None, *, partition=None, partition_ttl=24
    * 3600)
\`\`\`
Add several objects to the end of the queue.

If \`block\` is \`True\` and the queue is full, this method will retry indefinitely or
until \`timeout\` if specified. Raises the stdlib's \`queue.Full\` exception if the \`timeout\` is reached.
If blocking it is not recommended to omit the \`timeout\`, as the operation could wait indefinitely.

If \`block\` is \`False\`, this method raises \`queue.Full\` immediately if the queue is full. The \`timeout\` is
ignored in this case.

**Parameters**

<Parameter name="vs" type="list[Any]" description="Values to enqueue (each must be serializable)." />
<Parameter name="block" type="bool" defaultValue="True" description="If True, wait for capacity; if False, fail immediately when full." />
<Parameter name="timeout" type="float | None" defaultValue="None" description="Max seconds to wait when blocking." />
<Parameter name="partition" type="str | None" defaultValue="None" description="FIFO partition to write to; uses the default partition when omitted." />
<Parameter name="partition_ttl" type="int" defaultValue="24 * 3600" description="Seconds after the last activity before this partition may be cleared (default 24 hours)." />

## len

\`\`\`python
len(self, *, partition=None, total=False)
\`\`\`
Return the number of objects in the queue partition.

**Parameters**

<Parameter name="partition" type="str | None" defaultValue="None" description="Partition to measure; omit for the default partition." />
<Parameter name="total" type="bool" defaultValue="False" description="If True, return the combined length of all partitions (do not pass \`partition\`)." />

**Returns**

Item count (capped by the server when very large).

## iterate

\`\`\`python
iterate(self, *, partition=None, item_poll_timeout=0.0)
\`\`\`
Iterate through items in the queue without mutation.

Specify \`item_poll_timeout\` to control how long the iterator should wait for the next time before giving up.

**Parameters**

<Parameter name="partition" type="str | None" defaultValue="None" description="Partition to scan; uses the default partition when omitted." />
<Parameter name="item_poll_timeout" type="float" defaultValue="0.0" description="How long to wait for another item before stopping the iterator." />
`,meta:{title:`Queue`,description:`Distributed, FIFO queue for data flow in Modal apps.`}},{toc:p,rawContent:m,meta:h}=f,ae=t(`<!> <!> <p>Distributed, FIFO queue for data flow in Modal apps.</p> <p>The queue can contain any object serializable by <code>cloudpickle</code>, including Modal objects.</p> <p>By default, the <code>Queue</code> object acts as a single FIFO queue which supports puts and gets (blocking and non-blocking).</p> <p><strong>Usage</strong></p> <!> <p>For more examples, see the <!>.</p> <p><strong>Queue partitions</strong></p> <p>Specifying partition keys gives access to other independent FIFO partitions within the same <code>Queue</code> object.
Across any two partitions, puts and gets are completely independent.
For example, a put in one partition does not affect a get in any other partition.</p> <p>When no partition key is specified (by default), puts and gets will operate on a default partition.
This default partition is also isolated from all other partitions.
Please see the Usage section below for an example using partitions.</p> <p><strong>Lifetime of a queue and its partitions</strong></p> <p>By default, each partition is cleared 24 hours after the last <code>put</code> operation.
A lower TTL can be specified by the <code>partition_ttl</code> argument in the <code>put</code> or <code>put_many</code> methods.
Each partition’s expiry is handled independently.</p> <p>As such, <code>Queue</code>s are best used for communication between active functions and not relied on for persistent
storage.</p> <p>On app completion or after stopping an app any associated <code>Queue</code> objects are cleaned up.
All its partitions will be cleared.</p> <p><strong>Limits</strong></p> <p>A single <code>Queue</code> can contain up to 100,000 partitions, each with up to 5,000 items. Each item can be up to
1 MiB.</p> <p>Partition keys must be non-empty and must not exceed 64 bytes.</p> <!> <!> <p>Synchronize the local object with its identity on the Modal server.</p> <p>It is rarely necessary to call this method explicitly, as most operations
will lazily hydrate when needed. The main use case is when you need to
access object metadata, such as its ID.</p> <p><em>Added in v0.72.39</em>: This method replaces the deprecated <code>.resolve()</code> method.</p> <!> <!> <p>Namespace with methods for managing named Queue objects.</p> <!> <!> <p>Create a new named Queue in the workspace environment.</p> <p>This does not return a local handle; use <code>modal.Queue.from_name</code> to look up the Queue after creation.</p> <p>Added in v1.1.2.</p> <p><strong>Parameters</strong></p> <!> <!> <!> <!> <p><strong>Usage</strong></p> <!> <p>Queues will be created in the active environment, or another one can be specified:</p> <!> <p>By default, an error is raised if the Queue already exists; <code>allow_existing=True</code> makes that case a no-op:</p> <!> <p>Note that this method does not return a local instance of the Queue. You can use <code>modal.Queue.from_name</code> to perform a lookup after creation.</p> <!> <!> <p>List named Queues in the workspace environment as hydrated handles.</p> <p>Results are ordered newest to oldest. By default, all matching Queues are returned.</p> <p>Added in v1.1.2.</p> <p><strong>Parameters</strong></p> <!> <!> <!> <!> <p><strong>Returns</strong></p> <p>Hydrated <code>Queue</code> objects for each named Queue in the listing.</p> <p><strong>Usage</strong></p> <!> <p>Queues will be retrieved from the active environment, or another one can be specified:</p> <!> <p>By default, all named Queues are returned, newest to oldest. It’s also possible to limit the
number of results and to filter by creation date:</p> <!> <!> <!> <p>Delete a named Queue entirely (not a single message or partition).</p> <p>Deletion is irreversible and affects any Apps using this Queue.</p> <p>Added in v1.1.2.</p> <p><strong>Parameters</strong></p> <!> <!> <!> <!> <p><strong>Usage</strong></p> <!> <p>Queues will be deleted from the active environment, or another one can be specified:</p> <!> <!> <!> <!> <!> <!> <!> <p>Create an anonymous Queue that exists for the duration of the context manager.</p> <p><strong>Parameters</strong></p> <!> <!> <p><strong>Usage</strong></p> <!> <!> <!> <!> <p>Reference a named Queue, optionally creating it on the server first.</p> <p>Hydration is lazy: metadata is fetched from Modal the first time the handle is used.</p> <p><strong>Parameters</strong></p> <!> <!> <!> <!> <p><strong>Returns</strong></p> <p>A <code>Queue</code> handle (possibly not yet hydrated).</p> <p><strong>Usage</strong></p> <!> <!> <!> <p>Construct a Queue from an id and look up the Queue metadata.</p> <p>This is a lazy method that defers hydrating the local
object with metadata from Modal servers until the first
time it is actually used.</p> <p>The ID of a Queue object can be accessed using <code>.object_id</code>.</p> <p><strong>Parameters</strong></p> <!> <!> <p><strong>Returns</strong></p> <p>A <code>Queue</code> handle (possibly not yet hydrated).</p> <p><strong>Usage</strong></p> <!> <!> <!> <p>Return information about the Queue object.</p> <!> <!> <p>Clear the contents of a single partition or all partitions.</p> <p>Warning: this is a destructive operation and will irrevocably delete data.</p> <p><strong>Parameters</strong></p> <!> <!> <p><strong>Usage</strong></p> <!> <!> <!> <p>Remove and return the next object in the queue.</p> <p>If <code>block</code> is <code>True</code> (the default) and the queue is empty, <code>get</code> will wait indefinitely for
an object, or until <code>timeout</code> if specified. Raises a native <code>queue.Empty</code> exception
if the <code>timeout</code> is reached.</p> <p>If <code>block</code> is <code>False</code>, <code>get</code> returns <code>None</code> immediately if the queue is empty. The <code>timeout</code> is
ignored in this case.</p> <p><strong>Parameters</strong></p> <!> <!> <!> <!> <!> <p>Remove and return up to <code>n_values</code> objects from the queue.</p> <p>If there are fewer than <code>n_values</code> items in the queue, return all of them.</p> <p>If <code>block</code> is <code>True</code> (the default) and the queue is empty, <code>get_many</code> waits until at least one
object is present, or until <code>timeout</code> if specified. Raises the stdlib’s <code>queue.Empty</code> if the
timeout is reached before any item arrives.</p> <p>If <code>block</code> is <code>False</code>, this returns an empty list immediately when the queue is empty. The <code>timeout</code> is ignored in that case.</p> <p><strong>Parameters</strong></p> <!> <!> <!> <!> <!> <!> <p>Add an object to the end of the queue.</p> <p>If <code>block</code> is <code>True</code> and the queue is full, this method will retry indefinitely or
until <code>timeout</code> if specified. Raises the stdlib’s <code>queue.Full</code> exception if the <code>timeout</code> is reached.
If blocking it is not recommended to omit the <code>timeout</code>, as the operation could wait indefinitely.</p> <p>If <code>block</code> is <code>False</code>, this method raises <code>queue.Full</code> immediately if the queue is full. The <code>timeout</code> is
ignored in this case.</p> <p><strong>Parameters</strong></p> <!> <!> <!> <!> <!> <!> <!> <p>Add several objects to the end of the queue.</p> <p>If <code>block</code> is <code>True</code> and the queue is full, this method will retry indefinitely or
until <code>timeout</code> if specified. Raises the stdlib’s <code>queue.Full</code> exception if the <code>timeout</code> is reached.
If blocking it is not recommended to omit the <code>timeout</code>, as the operation could wait indefinitely.</p> <p>If <code>block</code> is <code>False</code>, this method raises <code>queue.Full</code> immediately if the queue is full. The <code>timeout</code> is
ignored in this case.</p> <p><strong>Parameters</strong></p> <!> <!> <!> <!> <!> <!> <!> <p>Return the number of objects in the queue partition.</p> <p><strong>Parameters</strong></p> <!> <!> <p><strong>Returns</strong></p> <p>Item count (capped by the server when very large).</p> <!> <!> <p>Iterate through items in the queue without mutation.</p> <p>Specify <code>item_poll_timeout</code> to control how long the iterator should wait for the next time before giving up.</p> <p><strong>Parameters</strong></p> <!> <!>`,1);function g(t,p){let m=te(p,[`children`,`$$slots`,`$$events`,`$$legacy`]);u(t,i(()=>m,()=>f,{children:(t,te)=>{var i=ae(),u=ne(i);re(u,{id:`queue`,children:(e,t)=>{o(),r(e,n(`Queue`))},$$slots:{default:!0}});var f=a(u,2);l(f,{code:`class%20Queue(modal.object.Object)`,lang:`python`});var p=a(f,10);l(p,{code:`from%20modal%20import%20Queue%0A%0A%23%20Create%20an%20ephemeral%20queue%20which%20is%20anonymous%20and%20garbage%20collected%0Awith%20Queue.ephemeral()%20as%20my_queue%3A%0A%20%20%20%20%23%20Putting%20values%0A%20%20%20%20my_queue.put(%22some%20value%22)%0A%20%20%20%20my_queue.put(123)%0A%0A%20%20%20%20%23%20Getting%20values%0A%20%20%20%20assert%20my_queue.get()%20%3D%3D%20%22some%20value%22%0A%20%20%20%20assert%20my_queue.get()%20%3D%3D%20123%0A%0A%20%20%20%20%23%20Using%20partitions%0A%20%20%20%20my_queue.put(0)%0A%20%20%20%20my_queue.put(1%2C%20partition%3D%22foo%22)%0A%20%20%20%20my_queue.put(2%2C%20partition%3D%22bar%22)%0A%0A%20%20%20%20%23%20Default%20and%20%22foo%22%20partition%20are%20ignored%20by%20the%20get%20operation.%0A%20%20%20%20assert%20my_queue.get(partition%3D%22bar%22)%20%3D%3D%202%0A%0A%20%20%20%20%23%20Set%20custom%2010s%20expiration%20time%20on%20%22foo%22%20partition.%0A%20%20%20%20my_queue.put(3%2C%20partition%3D%22foo%22%2C%20partition_ttl%3D10)%0A%0A%20%20%20%20%23%20Iterate%20through%20items%20in%20place%20(read%20immutably)%0A%20%20%20%20my_queue.put(1)%0A%20%20%20%20assert%20%5Bv%20for%20v%20in%20my_queue.iterate()%5D%20%3D%3D%20%5B0%2C%201%5D%0A%0A%23%20You%20can%20also%20create%20persistent%20queues%20that%20can%20be%20used%20across%20apps%0Aqueue%20%3D%20Queue.from_name(%22my-persisted-queue%22%2C%20create_if_missing%3DTrue)%0Aqueue.put(42)%0Aassert%20queue.get()%20%3D%3D%2042`,lang:`python`});var m=a(p,2);ie(a(e(m)),{href:`https://modal.com/docs/guide/dicts-and-queues#modal-queues`,rel:`nofollow`,children:(e,t)=>{o(),r(e,n(`guide`))},$$slots:{default:!0}}),o(),ee(m);var h=a(m,22);s(h,{id:`hydrate`,children:(e,t)=>{o(),r(e,n(`hydrate`))},$$slots:{default:!0}});var g=a(h,2);l(g,{code:`hydrate(self%2C%20client%3DNone)`,lang:`python`});var _=a(g,8);s(_,{id:`objects`,children:(e,t)=>{o(),r(e,n(`objects`))},$$slots:{default:!0}});var v=a(_,2);l(v,{code:`objects%3A%20QueueManager`,lang:`python`});var y=a(v,4);c(y,{id:`objectscreate`,children:(e,t)=>{o(),r(e,n(`objects.create`))},$$slots:{default:!0}});var b=a(y,2);l(b,{code:`create(self%2C%20name%2C%20*%2C%20allow_existing%3DFalse%2C%20environment_name%3DNone%2C%20client%3DNone)`,lang:`python`});var x=a(b,10);d(x,{name:`name`,type:`str`,description:`Name for the new Queue.`});var S=a(x,2);d(S,{name:`allow_existing`,type:`bool`,defaultValue:`False`,description:`If True, do nothing when a Queue with this name already exists.`});var C=a(S,2);d(C,{name:`environment_name`,type:`str | None`,defaultValue:`None`,description:`Environment to create in; defaults to the active environment.`});var w=a(C,2);d(w,{name:`client`,type:`_Client | None`,defaultValue:`None`,description:"Modal client to use; defaults to `Client.from_env()` when omitted."});var T=a(w,4);l(T,{code:`modal.Queue.objects.create(%22my-queue%22)`,lang:`python`});var E=a(T,4);l(E,{code:`modal.Queue.objects.create(%22my-queue%22%2C%20environment_name%3D%22dev%22)`,lang:`python`});var D=a(E,4);l(D,{code:`modal.Queue.objects.create(%22my-queue%22%2C%20allow_existing%3DTrue)`,lang:`python`});var O=a(D,4);c(O,{id:`objectslist`,children:(e,t)=>{o(),r(e,n(`objects.list`))},$$slots:{default:!0}});var k=a(O,2);l(k,{code:`list(self%2C%20*%2C%20max_objects%3DNone%2C%20created_before%3DNone%2C%20environment_name%3D%22%22%2C%0A%20%20%20%20client%3DNone)`,lang:`python`});var A=a(k,10);d(A,{name:`max_objects`,type:`int | None`,defaultValue:`None`,description:`Maximum number of Queues to return.`});var j=a(A,2);d(j,{name:`created_before`,type:`datetime | str | None`,defaultValue:`None`,description:`Only include Queues created before this time (datetime or ISO date string).`});var M=a(j,2);d(M,{name:`environment_name`,type:`str`,defaultValue:`""`,description:`Environment to list from; defaults to the active environment.`});var N=a(M,2);d(N,{name:`client`,type:`_Client | None`,defaultValue:`None`,description:"Modal client to use; defaults to `Client.from_env()` when omitted."});var P=a(N,8);l(P,{code:`queues%20%3D%20modal.Queue.objects.list()%0Aprint(%5Bq.name%20for%20q%20in%20queues%5D)`,lang:`python`});var F=a(P,4);l(F,{code:`dev_queues%20%3D%20modal.Queue.objects.list(environment_name%3D%22dev%22)`,lang:`python`});var I=a(F,4);l(I,{code:`queues%20%3D%20modal.Queue.objects.list(max_objects%3D10%2C%20created_before%3D%222025-01-01%22)`,lang:`python`});var L=a(I,2);c(L,{id:`objectsdelete`,children:(e,t)=>{o(),r(e,n(`objects.delete`))},$$slots:{default:!0}});var R=a(L,2);l(R,{code:`delete(self%2C%20name%2C%20*%2C%20allow_missing%3DFalse%2C%20environment_name%3DNone%2C%20client%3DNone)`,lang:`python`});var z=a(R,10);d(z,{name:`name`,type:`str`,description:`Name of the Queue to delete.`});var B=a(z,2);d(B,{name:`allow_missing`,type:`bool`,defaultValue:`False`,description:`If True, do nothing when the Queue does not exist.`});var V=a(B,2);d(V,{name:`environment_name`,type:`str | None`,defaultValue:`None`,description:`Environment to delete from; defaults to the active environment.`});var H=a(V,2);d(H,{name:`client`,type:`_Client | None`,defaultValue:`None`,description:"Modal client to use; defaults to `Client.from_env()` when omitted."});var U=a(H,4);l(U,{code:`await%20modal.Queue.objects.delete(%22my-queue%22)`,lang:`python`});var W=a(U,4);l(W,{code:`await%20modal.Queue.objects.delete(%22my-queue%22%2C%20environment_name%3D%22dev%22)`,lang:`python`});var G=a(W,2);s(G,{id:`name`,children:(e,t)=>{o(),r(e,n(`name`))},$$slots:{default:!0}});var K=a(G,2);l(K,{code:`name(self)`,lang:`python`});var q=a(K,2);s(q,{id:`validate_partition_key`,children:(e,t)=>{o(),r(e,n(`validate_partition_key`))},$$slots:{default:!0}});var J=a(q,2);l(J,{code:`validate_partition_key(partition)`,lang:`python`});var Y=a(J,2);s(Y,{id:`ephemeral`,children:(e,t)=>{o(),r(e,n(`ephemeral`))},$$slots:{default:!0}});var X=a(Y,2);l(X,{code:`ephemeral(cls%2C%20client%3DNone%2C%20environment_name%3DNone)`,lang:`python`});var Z=a(X,6);d(Z,{name:`client`,type:`_Client | None`,defaultValue:`None`,description:"Modal client to use; defaults to `Client.from_env()` when omitted."});var oe=a(Z,2);d(oe,{name:`environment_name`,type:`str | None`,defaultValue:`None`,description:`Environment for the ephemeral Queue; defaults to the active environment.`});var se=a(oe,4);l(se,{code:`from%20modal%20import%20Queue%0A%0Awith%20Queue.ephemeral()%20as%20q%3A%0A%20%20%20%20q.put(123)`,lang:`python`});var ce=a(se,2);l(ce,{code:`async%20with%20Queue.ephemeral()%20as%20q%3A%0A%20%20%20%20await%20q.put.aio(123)`,lang:`python`});var le=a(ce,2);s(le,{id:`from_name`,children:(e,t)=>{o(),r(e,n(`from_name`))},$$slots:{default:!0}});var ue=a(le,2);l(ue,{code:`from_name(name%2C%20*%2C%20environment_name%3DNone%2C%20create_if_missing%3DFalse%2C%20client%3DNone)`,lang:`python`});var de=a(ue,8);d(de,{name:`name`,type:`str`,description:`Deployment name of the Queue.`});var fe=a(de,2);d(fe,{name:`environment_name`,type:`str | None`,defaultValue:`None`,description:`Environment to resolve the name in; defaults to the active environment.`});var pe=a(fe,2);d(pe,{name:`create_if_missing`,type:`bool`,defaultValue:`False`,description:`If True, create the Queue when it does not already exist.`});var me=a(pe,2);d(me,{name:`client`,type:`_Client | None`,defaultValue:`None`,description:"Modal client to use for loading; defaults to `Client.from_env()` when omitted."});var he=a(me,8);l(he,{code:`q%20%3D%20modal.Queue.from_name(%22my-queue%22%2C%20create_if_missing%3DTrue)%0Aq.put(123)`,lang:`python`});var ge=a(he,2);s(ge,{id:`from_id`,children:(e,t)=>{o(),r(e,n(`from_id`))},$$slots:{default:!0}});var _e=a(ge,2);l(_e,{code:`from_id(queue_id%2C%20client%3DNone)`,lang:`python`});var ve=a(_e,10);d(ve,{name:`queue_id`,type:`str`,description:`Queue object ID to attach to.`});var ye=a(ve,2);d(ye,{name:`client`,type:`_Client | None`,defaultValue:`None`,description:"Modal client to use for loading; defaults to `Client.from_env()` when omitted."});var be=a(ye,8);l(be,{code:`%40app.function()%0Adef%20my_consumer(queue_id%3A%20str)%3A%0A%20%20%20%20queue%20%3D%20modal.Queue.from_id(queue_id)%0A%20%20%20%20queue.put(%22Hello%20from%20remote%20function!%22)%0A%0Awith%20modal.Queue.ephemeral()%20as%20q%3A%0A%20%20%20%20my_consumer.remote(q.object_id)%0A%20%20%20%20print(q.get())%20%20%23%20%22Hello%20from%20remote%20function!%22`,lang:`python`});var xe=a(be,2);s(xe,{id:`info`,children:(e,t)=>{o(),r(e,n(`info`))},$$slots:{default:!0}});var Se=a(xe,2);l(Se,{code:`info(self)`,lang:`python`});var Ce=a(Se,4);s(Ce,{id:`clear`,children:(e,t)=>{o(),r(e,n(`clear`))},$$slots:{default:!0}});var we=a(Ce,2);l(we,{code:`clear(self%2C%20*%2C%20partition%3DNone%2C%20all%3DFalse)`,lang:`python`});var Te=a(we,8);d(Te,{name:`partition`,type:`str | None`,defaultValue:`None`,description:"Partition to clear; omit with `all=True` to clear every partition."});var Ee=a(Te,2);d(Ee,{name:`all`,type:`bool`,defaultValue:`False`,description:"If True, clear all partitions (`partition` must not be set)."});var De=a(Ee,4);l(De,{code:`q%20%3D%20modal.Queue.from_name(%22my-queue%22%2C%20create_if_missing%3DTrue)%0Aq.clear()`,lang:`python`});var Oe=a(De,2);s(Oe,{id:`get`,children:(e,t)=>{o(),r(e,n(`get`))},$$slots:{default:!0}});var ke=a(Oe,2);l(ke,{code:`get(self%2C%20block%3DTrue%2C%20timeout%3DNone%2C%20*%2C%20partition%3DNone)`,lang:`python`});var Ae=a(ke,10);d(Ae,{name:`block`,type:`bool`,defaultValue:`True`,description:"If True, wait for an item; if False, return ``None`` immediately when empty."});var je=a(Ae,2);d(je,{name:`timeout`,type:`float | None`,defaultValue:`None`,description:"Seconds to wait when blocking; ignored when ``block`` is False."});var Me=a(je,2);d(Me,{name:`partition`,type:`str | None`,defaultValue:`None`,description:`FIFO partition to read from; uses the default partition when omitted.`});var Ne=a(Me,2);s(Ne,{id:`get_many`,children:(e,t)=>{o(),r(e,n(`get_many`))},$$slots:{default:!0}});var Pe=a(Ne,2);l(Pe,{code:`get_many(self%2C%20n_values%2C%20block%3DTrue%2C%20timeout%3DNone%2C%20*%2C%20partition%3DNone)`,lang:`python`});var Fe=a(Pe,12);d(Fe,{name:`n_values`,type:`int`,description:`Maximum number of items to remove and return.`});var Ie=a(Fe,2);d(Ie,{name:`block`,type:`bool`,defaultValue:`True`,description:"If True, wait until at least one item is available (or until `timeout`); if False, return immediately when empty."});var Le=a(Ie,2);d(Le,{name:`timeout`,type:`float | None`,defaultValue:`None`,description:"Seconds to wait when blocking; ignored when ``block`` is False."});var Re=a(Le,2);d(Re,{name:`partition`,type:`str | None`,defaultValue:`None`,description:`FIFO partition to read from; uses the default partition when omitted.`});var ze=a(Re,2);s(ze,{id:`put`,children:(e,t)=>{o(),r(e,n(`put`))},$$slots:{default:!0}});var Be=a(ze,2);l(Be,{code:`put(self%2C%20v%2C%20block%3DTrue%2C%20timeout%3DNone%2C%20*%2C%20partition%3DNone%2C%20partition_ttl%3D24%20*%0A%20%20%20%203600)`,lang:`python`});var Ve=a(Be,10);d(Ve,{name:`v`,type:`Any`,description:`Value to enqueue (must be serializable).`});var He=a(Ve,2);d(He,{name:`block`,type:`bool`,defaultValue:`True`,description:`If True, wait for capacity; if False, fail immediately when full.`});var Ue=a(He,2);d(Ue,{name:`timeout`,type:`float | None`,defaultValue:`None`,description:`Max seconds to wait when blocking.`});var We=a(Ue,2);d(We,{name:`partition`,type:`str | None`,defaultValue:`None`,description:`FIFO partition to write to; uses the default partition when omitted.`});var Ge=a(We,2);d(Ge,{name:`partition_ttl`,type:`int`,defaultValue:`24 * 3600`,description:`Seconds after the last activity before this partition may be cleared (default 24 hours).`});var Ke=a(Ge,2);s(Ke,{id:`put_many`,children:(e,t)=>{o(),r(e,n(`put_many`))},$$slots:{default:!0}});var qe=a(Ke,2);l(qe,{code:`put_many(self%2C%20vs%2C%20block%3DTrue%2C%20timeout%3DNone%2C%20*%2C%20partition%3DNone%2C%20partition_ttl%3D24%0A%20%20%20%20*%203600)`,lang:`python`});var Je=a(qe,10);d(Je,{name:`vs`,type:`list[Any]`,description:`Values to enqueue (each must be serializable).`});var Ye=a(Je,2);d(Ye,{name:`block`,type:`bool`,defaultValue:`True`,description:`If True, wait for capacity; if False, fail immediately when full.`});var Q=a(Ye,2);d(Q,{name:`timeout`,type:`float | None`,defaultValue:`None`,description:`Max seconds to wait when blocking.`});var Xe=a(Q,2);d(Xe,{name:`partition`,type:`str | None`,defaultValue:`None`,description:`FIFO partition to write to; uses the default partition when omitted.`});var Ze=a(Xe,2);d(Ze,{name:`partition_ttl`,type:`int`,defaultValue:`24 * 3600`,description:`Seconds after the last activity before this partition may be cleared (default 24 hours).`});var Qe=a(Ze,2);s(Qe,{id:`len`,children:(e,t)=>{o(),r(e,n(`len`))},$$slots:{default:!0}});var $e=a(Qe,2);l($e,{code:`len(self%2C%20*%2C%20partition%3DNone%2C%20total%3DFalse)`,lang:`python`});var et=a($e,6);d(et,{name:`partition`,type:`str | None`,defaultValue:`None`,description:`Partition to measure; omit for the default partition.`});var tt=a(et,2);d(tt,{name:`total`,type:`bool`,defaultValue:`False`,description:"If True, return the combined length of all partitions (do not pass `partition`)."});var nt=a(tt,6);s(nt,{id:`iterate`,children:(e,t)=>{o(),r(e,n(`iterate`))},$$slots:{default:!0}});var rt=a(nt,2);l(rt,{code:`iterate(self%2C%20*%2C%20partition%3DNone%2C%20item_poll_timeout%3D0.0)`,lang:`python`});var $=a(rt,8);d($,{name:`partition`,type:`str | None`,defaultValue:`None`,description:`Partition to scan; uses the default partition when omitted.`}),d(a($,2),{name:`item_poll_timeout`,type:`float`,defaultValue:`0.0`,description:`How long to wait for another item before stopping the iterator.`}),r(t,i)},$$slots:{default:!0}}))}export{g as default,f as metadata};
//# sourceMappingURL=4sV4iwTu.js.map
