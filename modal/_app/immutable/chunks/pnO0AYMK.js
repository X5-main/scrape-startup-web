(function(){try{var e=typeof window<`u`?window:typeof global<`u`?global:typeof globalThis<`u`?globalThis:typeof self<`u`?self:{};e.SENTRY_RELEASE={id:`f99fcf9f0a844cc9bd13fdc8e5782b84`};var t=new e.Error().stack;t&&(e._sentryDebugIds=e._sentryDebugIds||{},e._sentryDebugIds[t]=`35b8d21f-9815-41c2-963d-2a3e0ff1dfde`,e._sentryDebugIdIdentifier=`sentry-dbid-35b8d21f-9815-41c2-963d-2a3e0ff1dfde`)}catch{}})();import{$t as e,St as t,Tn as ee,Tt as n,bt as r,c as te,d as i,en as ne,tn as a,wn as o}from"./F_ixKBiO.js";import"./B1sc9Zdx.js";import"./Bb2deiU3.js";import{a as s,i as c,o as re}from"./CPby7b1n.js";import{t as l}from"./BILrvr3I.js";import{t as u}from"./B4L_if842.js";import{t as ie}from"./DeWGVqas2.js";import{t as d}from"./B6UiYoTw.js";var f={toc:[{depth:1,value:`Dict`,id:`dict`,children:[{depth:2,value:`hydrate`,id:`hydrate`},{depth:2,value:`objects`,id:`objects`,children:[{depth:3,value:`objects.create`,id:`objectscreate`},{depth:3,value:`objects.list`,id:`objectslist`},{depth:3,value:`objects.delete`,id:`objectsdelete`}]},{depth:2,value:`name`,id:`name`},{depth:2,value:`ephemeral`,id:`ephemeral`},{depth:2,value:`from_name`,id:`from_name`},{depth:2,value:`from_id`,id:`from_id`},{depth:2,value:`info`,id:`info`},{depth:2,value:`clear`,id:`clear`},{depth:2,value:`get`,id:`get`},{depth:2,value:`contains`,id:`contains`},{depth:2,value:`len`,id:`len`},{depth:2,value:`update`,id:`update`},{depth:2,value:`put`,id:`put`},{depth:2,value:`pop`,id:`pop`},{depth:2,value:`keys`,id:`keys`},{depth:2,value:`values`,id:`values`},{depth:2,value:`items`,id:`items`}]}],rawContent:`# Dict


\`\`\`python
class Dict(modal.object.Object)
\`\`\`

Distributed dictionary for storage in Modal apps.

Dict contents can be essentially any object so long as they can be serialized by
\`cloudpickle\`. This includes other Modal objects. If writing and reading in different
environments (eg., writing locally and reading remotely), it's necessary to have the
library defining the data type installed, with compatible versions, on both sides.
Additionally, cloudpickle serialization is not guaranteed to be deterministic, so it is
generally recommended to use primitive types for keys.

**Lifetime of a Dict and its items**

An individual Dict entry will expire after 7 days of inactivity (no reads or writes). The
Dict entries are written to durable storage.

Legacy Dicts (created before 2025-05-20) will still have entries expire 30 days after being
last added. Additionally, contents are stored in memory on the Modal server and could be lost
due to unexpected server restarts. Eventually, these Dicts will be fully sunset.

**Usage**

\`\`\`python
from modal import Dict

my_dict = Dict.from_name("my-persisted_dict", create_if_missing=True)

my_dict["some key"] = "some value"
my_dict[123] = 456

assert my_dict["some key"] == "some value"
assert my_dict[123] == 456
\`\`\`

The \`Dict\` class offers a few methods for operations that are usually accomplished
in Python with operators, such as \`Dict.put\` and \`Dict.contains\`. The advantage of
these methods is that they can be safely called in an asynchronous context by using
the \`.aio\` suffix on the method, whereas their operator-based analogues will always
run synchronously and block the event loop.

For more examples, see the [guide](https://modal.com/docs/guide/dicts-and-queues#modal-dicts).


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
objects: DictManager
\`\`\`

Namespace with methods for managing named Dict objects.


### objects.create

\`\`\`python
create(self, name, *, allow_existing=False, environment_name=None, client=None)
\`\`\`
Create a new named Dict in the workspace environment.

This does not return a local handle; use \`modal.Dict.from_name\` to look up the Dict after creation.

Added in v1.1.2.

**Parameters**

<Parameter name="name" type="str" description="Name for the new Dict." />
<Parameter name="allow_existing" type="bool" defaultValue="False" description="If True, do nothing when a Dict with this name already exists." />
<Parameter name="environment_name" type="str | None" defaultValue="None" description="Environment to create in; defaults to the active environment." />
<Parameter name="client" type="_Client | None" defaultValue="None" description="Modal client to use; defaults to \`Client.from_env()\` when omitted." />

**Usage**

\`\`\`python notest
modal.Dict.objects.create("my-dict")
\`\`\`

Dicts will be created in the active environment, or another one can be specified:

\`\`\`python notest
modal.Dict.objects.create("my-dict", environment_name="dev")
\`\`\`

By default, an error is raised if the Dict already exists; \`allow_existing=True\` makes that case a no-op:

\`\`\`python notest
modal.Dict.objects.create("my-dict", allow_existing=True)
\`\`\`

Note that this method does not return a local instance of the Dict. You can use
\`modal.Dict.from_name\` to perform a lookup after creation.

### objects.list

\`\`\`python
list(self, *, max_objects=None, created_before=None, environment_name="",
    client=None)
\`\`\`
List named Dicts in the workspace environment as hydrated handles.

Results are ordered newest to oldest. By default, all matching Dicts are returned.

Added in v1.1.2.

**Parameters**

<Parameter name="max_objects" type="int | None" defaultValue="None" description="Maximum number of Dicts to return." />
<Parameter name="created_before" type="datetime | str | None" defaultValue="None" description="Only include Dicts created before this time (datetime or ISO date string)." />
<Parameter name="environment_name" type="str" defaultValue="&quot;&quot;" description="Environment to list from; defaults to the active environment." />
<Parameter name="client" type="_Client | None" defaultValue="None" description="Modal client to use; defaults to \`Client.from_env()\` when omitted." />

**Returns**

Hydrated \`Dict\` objects for each named Dict in the listing.

**Usage**

\`\`\`python
dicts = modal.Dict.objects.list()
print([d.name for d in dicts])
\`\`\`

Dicts will be retrieved from the active environment, or another one can be specified:

\`\`\`python notest
dev_dicts = modal.Dict.objects.list(environment_name="dev")
\`\`\`

By default, all named Dicts are returned, newest to oldest. It's also possible to limit the
number of results and to filter by creation date:

\`\`\`python
dicts = modal.Dict.objects.list(max_objects=10, created_before="2025-01-01")
\`\`\`

### objects.delete

\`\`\`python
delete(self, name, *, allow_missing=False, environment_name=None, client=None)
\`\`\`
Delete a named Dict entirely (not a single key).

Deletion is irreversible and affects any Apps using this Dict.

Added in v1.1.2.

**Parameters**

<Parameter name="name" type="str" description="Name of the Dict to delete." />
<Parameter name="allow_missing" type="bool" defaultValue="False" description="If True, do nothing when the Dict does not exist." />
<Parameter name="environment_name" type="str | None" defaultValue="None" description="Environment to delete from; defaults to the active environment." />
<Parameter name="client" type="_Client | None" defaultValue="None" description="Modal client to use; defaults to \`Client.from_env()\` when omitted." />

**Usage**

\`\`\`python notest
await modal.Dict.objects.delete("my-dict")
\`\`\`

Dicts will be deleted from the active environment, or another one can be specified:

\`\`\`python notest
await modal.Dict.objects.delete("my-dict", environment_name="dev")
\`\`\`

## name

\`\`\`python
name(self)
\`\`\`
Name of the Dict object.

**Usage**

\`\`\`python
d = modal.Dict.from_name("my-dict")
print(d.name)
\`\`\`

## ephemeral

\`\`\`python
ephemeral(cls, *, client=None, environment_name=None)
\`\`\`
Create an anonymous Dict that exists for the duration of the context manager.

**Parameters**

<Parameter name="client" type="_Client | None" defaultValue="None" description="Modal client to use; defaults to \`Client.from_env()\` when omitted." />
<Parameter name="environment_name" type="str | None" defaultValue="None" description="Environment for the ephemeral Dict; defaults to the active environment." />

**Usage**

\`\`\`python
from modal import Dict

with Dict.ephemeral() as d:
    d["foo"] = "bar"
\`\`\`

\`\`\`python notest
async with Dict.ephemeral() as d:
    await d.put.aio("foo", "bar")
\`\`\`

## from_name

\`\`\`python
from_name(name, *, environment_name=None, create_if_missing=False, client=None)
\`\`\`
Reference a named Dict, optionally creating it on the server first.

Hydration is lazy: metadata is fetched from Modal the first time the handle is used.

**Parameters**

<Parameter name="name" type="str" description="Deployment name of the Dict." />
<Parameter name="environment_name" type="str | None" defaultValue="None" description="Environment to resolve the name in; defaults to the active environment." />
<Parameter name="create_if_missing" type="bool" defaultValue="False" description="If True, create the Dict when it does not already exist." />
<Parameter name="client" type="_Client | None" defaultValue="None" description="Modal client to use for loading; defaults to \`Client.from_env()\` when omitted." />

**Returns**

A \`Dict\` handle (possibly not yet hydrated).

**Usage**

\`\`\`python
d = modal.Dict.from_name("my-dict", create_if_missing=True)
d[123] = 456
\`\`\`

## from_id

\`\`\`python
from_id(dict_id, client=None)
\`\`\`
Construct a Dict from an id and look up the Dict metadata.

This is a lazy method that defers hydrating the local
object with metadata from Modal servers until the first
time it is actually used.

The ID of a Dict object can be accessed using \`.object_id\`.

**Parameters**

<Parameter name="dict_id" type="str" description="Dict object ID to attach to." />
<Parameter name="client" type="_Client | None" defaultValue="None" description="Modal client to use for loading; defaults to \`Client.from_env()\` when omitted." />

**Returns**

A \`Dict\` handle (possibly not yet hydrated).

**Usage**

\`\`\`python notest
@app.function()
def my_worker(dict_id: str):
    d = modal.Dict.from_id(dict_id)
    d["key"] = "Hello from remote function!"

with modal.Dict.ephemeral() as d:
    my_worker.remote(d.object_id)
    print(d["key"])  # "Hello from remote function!"
\`\`\`

## info

\`\`\`python
info(self)
\`\`\`
Return information about the Dict object.

## clear

\`\`\`python
clear(self)
\`\`\`
Remove all items from the Dict.

## get

\`\`\`python
get(self, key, default=None)
\`\`\`
Get the value associated with a key.

Returns \`default\` if key does not exist.

## contains

\`\`\`python
contains(self, key)
\`\`\`
Return if a key is present.

## len

\`\`\`python
len(self)
\`\`\`
Return the length of the Dict.

Note: This is an expensive operation and will return at most 100,000.

## update

\`\`\`python
update(self, other=None, **kwargs)
\`\`\`
Update the Dict with additional items.

## put

\`\`\`python
put(self, key, value, *, skip_if_exists=False)
\`\`\`
Add a specific key-value pair to the Dict.

Returns True if the key-value pair was added and False if it wasn't because the key already existed and
\`skip_if_exists\` was set.

## pop

\`\`\`python
pop(self, key, default=_NO_DEFAULT)
\`\`\`
Remove a key from the Dict, returning the value if it exists.

If key is not found, return default if provided, otherwise raise KeyError.

## keys

\`\`\`python
keys(self)
\`\`\`
Return an iterator over the keys in this Dict.

Note that (unlike with Python dicts) the return value is a simple iterator,
and results are unordered.

## values

\`\`\`python
values(self)
\`\`\`
Return an iterator over the values in this Dict.

Note that (unlike with Python dicts) the return value is a simple iterator,
and results are unordered.

## items

\`\`\`python
items(self)
\`\`\`
Return an iterator over the (key, value) tuples in this Dict.

Note that (unlike with Python dicts) the return value is a simple iterator,
and results are unordered.
`,meta:{title:`Dict`,description:`Distributed dictionary for storage in Modal apps.`}},{toc:p,rawContent:m,meta:h}=f,ae=t(`<!> <!> <p>Distributed dictionary for storage in Modal apps.</p> <p>Dict contents can be essentially any object so long as they can be serialized by <code>cloudpickle</code>. This includes other Modal objects. If writing and reading in different
environments (eg., writing locally and reading remotely), it’s necessary to have the
library defining the data type installed, with compatible versions, on both sides.
Additionally, cloudpickle serialization is not guaranteed to be deterministic, so it is
generally recommended to use primitive types for keys.</p> <p><strong>Lifetime of a Dict and its items</strong></p> <p>An individual Dict entry will expire after 7 days of inactivity (no reads or writes). The
Dict entries are written to durable storage.</p> <p>Legacy Dicts (created before 2025-05-20) will still have entries expire 30 days after being
last added. Additionally, contents are stored in memory on the Modal server and could be lost
due to unexpected server restarts. Eventually, these Dicts will be fully sunset.</p> <p><strong>Usage</strong></p> <!> <p>The <code>Dict</code> class offers a few methods for operations that are usually accomplished
in Python with operators, such as <code>Dict.put</code> and <code>Dict.contains</code>. The advantage of
these methods is that they can be safely called in an asynchronous context by using
the <code>.aio</code> suffix on the method, whereas their operator-based analogues will always
run synchronously and block the event loop.</p> <p>For more examples, see the <!>.</p> <!> <!> <p>Synchronize the local object with its identity on the Modal server.</p> <p>It is rarely necessary to call this method explicitly, as most operations
will lazily hydrate when needed. The main use case is when you need to
access object metadata, such as its ID.</p> <p><em>Added in v0.72.39</em>: This method replaces the deprecated <code>.resolve()</code> method.</p> <!> <!> <p>Namespace with methods for managing named Dict objects.</p> <!> <!> <p>Create a new named Dict in the workspace environment.</p> <p>This does not return a local handle; use <code>modal.Dict.from_name</code> to look up the Dict after creation.</p> <p>Added in v1.1.2.</p> <p><strong>Parameters</strong></p> <!> <!> <!> <!> <p><strong>Usage</strong></p> <!> <p>Dicts will be created in the active environment, or another one can be specified:</p> <!> <p>By default, an error is raised if the Dict already exists; <code>allow_existing=True</code> makes that case a no-op:</p> <!> <p>Note that this method does not return a local instance of the Dict. You can use <code>modal.Dict.from_name</code> to perform a lookup after creation.</p> <!> <!> <p>List named Dicts in the workspace environment as hydrated handles.</p> <p>Results are ordered newest to oldest. By default, all matching Dicts are returned.</p> <p>Added in v1.1.2.</p> <p><strong>Parameters</strong></p> <!> <!> <!> <!> <p><strong>Returns</strong></p> <p>Hydrated <code>Dict</code> objects for each named Dict in the listing.</p> <p><strong>Usage</strong></p> <!> <p>Dicts will be retrieved from the active environment, or another one can be specified:</p> <!> <p>By default, all named Dicts are returned, newest to oldest. It’s also possible to limit the
number of results and to filter by creation date:</p> <!> <!> <!> <p>Delete a named Dict entirely (not a single key).</p> <p>Deletion is irreversible and affects any Apps using this Dict.</p> <p>Added in v1.1.2.</p> <p><strong>Parameters</strong></p> <!> <!> <!> <!> <p><strong>Usage</strong></p> <!> <p>Dicts will be deleted from the active environment, or another one can be specified:</p> <!> <!> <!> <p>Name of the Dict object.</p> <p><strong>Usage</strong></p> <!> <!> <!> <p>Create an anonymous Dict that exists for the duration of the context manager.</p> <p><strong>Parameters</strong></p> <!> <!> <p><strong>Usage</strong></p> <!> <!> <!> <!> <p>Reference a named Dict, optionally creating it on the server first.</p> <p>Hydration is lazy: metadata is fetched from Modal the first time the handle is used.</p> <p><strong>Parameters</strong></p> <!> <!> <!> <!> <p><strong>Returns</strong></p> <p>A <code>Dict</code> handle (possibly not yet hydrated).</p> <p><strong>Usage</strong></p> <!> <!> <!> <p>Construct a Dict from an id and look up the Dict metadata.</p> <p>This is a lazy method that defers hydrating the local
object with metadata from Modal servers until the first
time it is actually used.</p> <p>The ID of a Dict object can be accessed using <code>.object_id</code>.</p> <p><strong>Parameters</strong></p> <!> <!> <p><strong>Returns</strong></p> <p>A <code>Dict</code> handle (possibly not yet hydrated).</p> <p><strong>Usage</strong></p> <!> <!> <!> <p>Return information about the Dict object.</p> <!> <!> <p>Remove all items from the Dict.</p> <!> <!> <p>Get the value associated with a key.</p> <p>Returns <code>default</code> if key does not exist.</p> <!> <!> <p>Return if a key is present.</p> <!> <!> <p>Return the length of the Dict.</p> <p>Note: This is an expensive operation and will return at most 100,000.</p> <!> <!> <p>Update the Dict with additional items.</p> <!> <!> <p>Add a specific key-value pair to the Dict.</p> <p>Returns True if the key-value pair was added and False if it wasn’t because the key already existed and <code>skip_if_exists</code> was set.</p> <!> <!> <p>Remove a key from the Dict, returning the value if it exists.</p> <p>If key is not found, return default if provided, otherwise raise KeyError.</p> <!> <!> <p>Return an iterator over the keys in this Dict.</p> <p>Note that (unlike with Python dicts) the return value is a simple iterator,
and results are unordered.</p> <!> <!> <p>Return an iterator over the values in this Dict.</p> <p>Note that (unlike with Python dicts) the return value is a simple iterator,
and results are unordered.</p> <!> <!> <p>Return an iterator over the (key, value) tuples in this Dict.</p> <p>Note that (unlike with Python dicts) the return value is a simple iterator,
and results are unordered.</p>`,1);function g(t,p){let m=te(p,[`children`,`$$slots`,`$$events`,`$$legacy`]);u(t,i(()=>m,()=>f,{children:(t,te)=>{var i=ae(),u=ne(i);re(u,{id:`dict`,children:(e,t)=>{o(),r(e,n(`Dict`))},$$slots:{default:!0}});var f=a(u,2);l(f,{code:`class%20Dict(modal.object.Object)`,lang:`python`});var p=a(f,14);l(p,{code:`from%20modal%20import%20Dict%0A%0Amy_dict%20%3D%20Dict.from_name(%22my-persisted_dict%22%2C%20create_if_missing%3DTrue)%0A%0Amy_dict%5B%22some%20key%22%5D%20%3D%20%22some%20value%22%0Amy_dict%5B123%5D%20%3D%20456%0A%0Aassert%20my_dict%5B%22some%20key%22%5D%20%3D%3D%20%22some%20value%22%0Aassert%20my_dict%5B123%5D%20%3D%3D%20456`,lang:`python`});var m=a(p,4);ie(a(e(m)),{href:`https://modal.com/docs/guide/dicts-and-queues#modal-dicts`,rel:`nofollow`,children:(e,t)=>{o(),r(e,n(`guide`))},$$slots:{default:!0}}),o(),ee(m);var h=a(m,2);s(h,{id:`hydrate`,children:(e,t)=>{o(),r(e,n(`hydrate`))},$$slots:{default:!0}});var g=a(h,2);l(g,{code:`hydrate(self%2C%20client%3DNone)`,lang:`python`});var _=a(g,8);s(_,{id:`objects`,children:(e,t)=>{o(),r(e,n(`objects`))},$$slots:{default:!0}});var v=a(_,2);l(v,{code:`objects%3A%20DictManager`,lang:`python`});var y=a(v,4);c(y,{id:`objectscreate`,children:(e,t)=>{o(),r(e,n(`objects.create`))},$$slots:{default:!0}});var b=a(y,2);l(b,{code:`create(self%2C%20name%2C%20*%2C%20allow_existing%3DFalse%2C%20environment_name%3DNone%2C%20client%3DNone)`,lang:`python`});var x=a(b,10);d(x,{name:`name`,type:`str`,description:`Name for the new Dict.`});var S=a(x,2);d(S,{name:`allow_existing`,type:`bool`,defaultValue:`False`,description:`If True, do nothing when a Dict with this name already exists.`});var C=a(S,2);d(C,{name:`environment_name`,type:`str | None`,defaultValue:`None`,description:`Environment to create in; defaults to the active environment.`});var w=a(C,2);d(w,{name:`client`,type:`_Client | None`,defaultValue:`None`,description:"Modal client to use; defaults to `Client.from_env()` when omitted."});var T=a(w,4);l(T,{code:`modal.Dict.objects.create(%22my-dict%22)`,lang:`python`});var E=a(T,4);l(E,{code:`modal.Dict.objects.create(%22my-dict%22%2C%20environment_name%3D%22dev%22)`,lang:`python`});var D=a(E,4);l(D,{code:`modal.Dict.objects.create(%22my-dict%22%2C%20allow_existing%3DTrue)`,lang:`python`});var O=a(D,4);c(O,{id:`objectslist`,children:(e,t)=>{o(),r(e,n(`objects.list`))},$$slots:{default:!0}});var k=a(O,2);l(k,{code:`list(self%2C%20*%2C%20max_objects%3DNone%2C%20created_before%3DNone%2C%20environment_name%3D%22%22%2C%0A%20%20%20%20client%3DNone)`,lang:`python`});var A=a(k,10);d(A,{name:`max_objects`,type:`int | None`,defaultValue:`None`,description:`Maximum number of Dicts to return.`});var j=a(A,2);d(j,{name:`created_before`,type:`datetime | str | None`,defaultValue:`None`,description:`Only include Dicts created before this time (datetime or ISO date string).`});var M=a(j,2);d(M,{name:`environment_name`,type:`str`,defaultValue:`""`,description:`Environment to list from; defaults to the active environment.`});var N=a(M,2);d(N,{name:`client`,type:`_Client | None`,defaultValue:`None`,description:"Modal client to use; defaults to `Client.from_env()` when omitted."});var P=a(N,8);l(P,{code:`dicts%20%3D%20modal.Dict.objects.list()%0Aprint(%5Bd.name%20for%20d%20in%20dicts%5D)`,lang:`python`});var F=a(P,4);l(F,{code:`dev_dicts%20%3D%20modal.Dict.objects.list(environment_name%3D%22dev%22)`,lang:`python`});var I=a(F,4);l(I,{code:`dicts%20%3D%20modal.Dict.objects.list(max_objects%3D10%2C%20created_before%3D%222025-01-01%22)`,lang:`python`});var L=a(I,2);c(L,{id:`objectsdelete`,children:(e,t)=>{o(),r(e,n(`objects.delete`))},$$slots:{default:!0}});var R=a(L,2);l(R,{code:`delete(self%2C%20name%2C%20*%2C%20allow_missing%3DFalse%2C%20environment_name%3DNone%2C%20client%3DNone)`,lang:`python`});var z=a(R,10);d(z,{name:`name`,type:`str`,description:`Name of the Dict to delete.`});var B=a(z,2);d(B,{name:`allow_missing`,type:`bool`,defaultValue:`False`,description:`If True, do nothing when the Dict does not exist.`});var V=a(B,2);d(V,{name:`environment_name`,type:`str | None`,defaultValue:`None`,description:`Environment to delete from; defaults to the active environment.`});var H=a(V,2);d(H,{name:`client`,type:`_Client | None`,defaultValue:`None`,description:"Modal client to use; defaults to `Client.from_env()` when omitted."});var U=a(H,4);l(U,{code:`await%20modal.Dict.objects.delete(%22my-dict%22)`,lang:`python`});var W=a(U,4);l(W,{code:`await%20modal.Dict.objects.delete(%22my-dict%22%2C%20environment_name%3D%22dev%22)`,lang:`python`});var G=a(W,2);s(G,{id:`name`,children:(e,t)=>{o(),r(e,n(`name`))},$$slots:{default:!0}});var K=a(G,2);l(K,{code:`name(self)`,lang:`python`});var q=a(K,6);l(q,{code:`d%20%3D%20modal.Dict.from_name(%22my-dict%22)%0Aprint(d.name)`,lang:`python`});var J=a(q,2);s(J,{id:`ephemeral`,children:(e,t)=>{o(),r(e,n(`ephemeral`))},$$slots:{default:!0}});var Y=a(J,2);l(Y,{code:`ephemeral(cls%2C%20*%2C%20client%3DNone%2C%20environment_name%3DNone)`,lang:`python`});var X=a(Y,6);d(X,{name:`client`,type:`_Client | None`,defaultValue:`None`,description:"Modal client to use; defaults to `Client.from_env()` when omitted."});var oe=a(X,2);d(oe,{name:`environment_name`,type:`str | None`,defaultValue:`None`,description:`Environment for the ephemeral Dict; defaults to the active environment.`});var Z=a(oe,4);l(Z,{code:`from%20modal%20import%20Dict%0A%0Awith%20Dict.ephemeral()%20as%20d%3A%0A%20%20%20%20d%5B%22foo%22%5D%20%3D%20%22bar%22`,lang:`python`});var se=a(Z,2);l(se,{code:`async%20with%20Dict.ephemeral()%20as%20d%3A%0A%20%20%20%20await%20d.put.aio(%22foo%22%2C%20%22bar%22)`,lang:`python`});var ce=a(se,2);s(ce,{id:`from_name`,children:(e,t)=>{o(),r(e,n(`from_name`))},$$slots:{default:!0}});var le=a(ce,2);l(le,{code:`from_name(name%2C%20*%2C%20environment_name%3DNone%2C%20create_if_missing%3DFalse%2C%20client%3DNone)`,lang:`python`});var ue=a(le,8);d(ue,{name:`name`,type:`str`,description:`Deployment name of the Dict.`});var de=a(ue,2);d(de,{name:`environment_name`,type:`str | None`,defaultValue:`None`,description:`Environment to resolve the name in; defaults to the active environment.`});var fe=a(de,2);d(fe,{name:`create_if_missing`,type:`bool`,defaultValue:`False`,description:`If True, create the Dict when it does not already exist.`});var pe=a(fe,2);d(pe,{name:`client`,type:`_Client | None`,defaultValue:`None`,description:"Modal client to use for loading; defaults to `Client.from_env()` when omitted."});var me=a(pe,8);l(me,{code:`d%20%3D%20modal.Dict.from_name(%22my-dict%22%2C%20create_if_missing%3DTrue)%0Ad%5B123%5D%20%3D%20456`,lang:`python`});var he=a(me,2);s(he,{id:`from_id`,children:(e,t)=>{o(),r(e,n(`from_id`))},$$slots:{default:!0}});var ge=a(he,2);l(ge,{code:`from_id(dict_id%2C%20client%3DNone)`,lang:`python`});var _e=a(ge,10);d(_e,{name:`dict_id`,type:`str`,description:`Dict object ID to attach to.`});var ve=a(_e,2);d(ve,{name:`client`,type:`_Client | None`,defaultValue:`None`,description:"Modal client to use for loading; defaults to `Client.from_env()` when omitted."});var ye=a(ve,8);l(ye,{code:`%40app.function()%0Adef%20my_worker(dict_id%3A%20str)%3A%0A%20%20%20%20d%20%3D%20modal.Dict.from_id(dict_id)%0A%20%20%20%20d%5B%22key%22%5D%20%3D%20%22Hello%20from%20remote%20function!%22%0A%0Awith%20modal.Dict.ephemeral()%20as%20d%3A%0A%20%20%20%20my_worker.remote(d.object_id)%0A%20%20%20%20print(d%5B%22key%22%5D)%20%20%23%20%22Hello%20from%20remote%20function!%22`,lang:`python`});var be=a(ye,2);s(be,{id:`info`,children:(e,t)=>{o(),r(e,n(`info`))},$$slots:{default:!0}});var xe=a(be,2);l(xe,{code:`info(self)`,lang:`python`});var Se=a(xe,4);s(Se,{id:`clear`,children:(e,t)=>{o(),r(e,n(`clear`))},$$slots:{default:!0}});var Ce=a(Se,2);l(Ce,{code:`clear(self)`,lang:`python`});var we=a(Ce,4);s(we,{id:`get`,children:(e,t)=>{o(),r(e,n(`get`))},$$slots:{default:!0}});var Te=a(we,2);l(Te,{code:`get(self%2C%20key%2C%20default%3DNone)`,lang:`python`});var Ee=a(Te,6);s(Ee,{id:`contains`,children:(e,t)=>{o(),r(e,n(`contains`))},$$slots:{default:!0}});var De=a(Ee,2);l(De,{code:`contains(self%2C%20key)`,lang:`python`});var Oe=a(De,4);s(Oe,{id:`len`,children:(e,t)=>{o(),r(e,n(`len`))},$$slots:{default:!0}});var Q=a(Oe,2);l(Q,{code:`len(self)`,lang:`python`});var ke=a(Q,6);s(ke,{id:`update`,children:(e,t)=>{o(),r(e,n(`update`))},$$slots:{default:!0}});var Ae=a(ke,2);l(Ae,{code:`update(self%2C%20other%3DNone%2C%20**kwargs)`,lang:`python`});var je=a(Ae,4);s(je,{id:`put`,children:(e,t)=>{o(),r(e,n(`put`))},$$slots:{default:!0}});var Me=a(je,2);l(Me,{code:`put(self%2C%20key%2C%20value%2C%20*%2C%20skip_if_exists%3DFalse)`,lang:`python`});var Ne=a(Me,6);s(Ne,{id:`pop`,children:(e,t)=>{o(),r(e,n(`pop`))},$$slots:{default:!0}});var Pe=a(Ne,2);l(Pe,{code:`pop(self%2C%20key%2C%20default%3D_NO_DEFAULT)`,lang:`python`});var Fe=a(Pe,6);s(Fe,{id:`keys`,children:(e,t)=>{o(),r(e,n(`keys`))},$$slots:{default:!0}});var Ie=a(Fe,2);l(Ie,{code:`keys(self)`,lang:`python`});var Le=a(Ie,6);s(Le,{id:`values`,children:(e,t)=>{o(),r(e,n(`values`))},$$slots:{default:!0}});var Re=a(Le,2);l(Re,{code:`values(self)`,lang:`python`});var $=a(Re,6);s($,{id:`items`,children:(e,t)=>{o(),r(e,n(`items`))},$$slots:{default:!0}}),l(a($,2),{code:`items(self)`,lang:`python`}),o(4),r(t,i)},$$slots:{default:!0}}))}export{g as default,f as metadata};
//# sourceMappingURL=pnO0AYMK.js.map
