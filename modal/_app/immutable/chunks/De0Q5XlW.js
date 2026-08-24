(function(){try{var e=typeof window<`u`?window:typeof global<`u`?global:typeof globalThis<`u`?globalThis:typeof self<`u`?self:{};e.SENTRY_RELEASE={id:`f99fcf9f0a844cc9bd13fdc8e5782b84`};var t=new e.Error().stack;t&&(e._sentryDebugIds=e._sentryDebugIds||{},e._sentryDebugIds[t]=`c59fcb37-5f4a-4f4b-90d7-6ddb5cd962cf`,e._sentryDebugIdIdentifier=`sentry-dbid-c59fcb37-5f4a-4f4b-90d7-6ddb5cd962cf`)}catch{}})();import{St as e,Tt as t,bt as n,c as r,d as i,en as a,tn as o,wn as s}from"./F_ixKBiO.js";import"./B1sc9Zdx.js";import"./Bb2deiU3.js";import{a as c,o as l}from"./CPby7b1n.js";import{t as u}from"./BILrvr3I.js";import{t as d}from"./B4L_if842.js";import{t as f}from"./B6UiYoTw.js";var p={toc:[{depth:1,value:`NetworkFileSystem`,id:`networkfilesystem`,children:[{depth:2,value:`hydrate`,id:`hydrate`},{depth:2,value:`from_name`,id:`from_name`},{depth:2,value:`ephemeral`,id:`ephemeral`},{depth:2,value:`delete`,id:`delete`},{depth:2,value:`write_file`,id:`write_file`},{depth:2,value:`read_file`,id:`read_file`},{depth:2,value:`iterdir`,id:`iterdir`},{depth:2,value:`add_local_file`,id:`add_local_file`},{depth:2,value:`add_local_dir`,id:`add_local_dir`},{depth:2,value:`listdir`,id:`listdir`},{depth:2,value:`remove_file`,id:`remove_file`}]}],rawContent:`# NetworkFileSystem


\`\`\`python
class NetworkFileSystem(modal.object.Object)
\`\`\`

A shared, writable file system accessible by one or more Modal functions.

By attaching this file system as a mount to one or more functions, they can
share and persist data with each other.

**Note: \`NetworkFileSystem\` has been deprecated and will be removed.**

**Usage**

\`\`\`python
import modal

nfs = modal.NetworkFileSystem.from_name("my-nfs", create_if_missing=True)
app = modal.App()

@app.function(network_file_systems={"/root/foo": nfs})
def f():
    pass

@app.function(network_file_systems={"/root/goo": nfs})
def g():
    pass
\`\`\`

Also see the CLI methods for accessing network file systems:

\`\`\`
modal nfs --help
\`\`\`

A \`NetworkFileSystem\` can also be useful for some local scripting scenarios, e.g.:

\`\`\`python notest
nfs = modal.NetworkFileSystem.from_name("my-network-file-system")
for chunk in nfs.read_file("my_db_dump.csv"):
    ...
\`\`\`


## hydrate

\`\`\`python
hydrate(self, client=None)
\`\`\`
Synchronize the local object with its identity on the Modal server.

It is rarely necessary to call this method explicitly, as most operations
will lazily hydrate when needed. The main use case is when you need to
access object metadata, such as its ID.

*Added in v0.72.39*: This method replaces the deprecated \`.resolve()\` method.

## from_name

\`\`\`python
from_name(name, *, environment_name=None, create_if_missing=False, client=None)
\`\`\`
Reference a NetworkFileSystem by name, optionally creating it on the server first.

Hydration is lazy: metadata is fetched from Modal the first time the handle is used.

**Parameters**

<Parameter name="name" type="str" description="Deployment name of the network file system." />
<Parameter name="environment_name" type="str | None" defaultValue="None" description="Environment to resolve the name in; defaults to the active environment." />
<Parameter name="create_if_missing" type="bool" defaultValue="False" description="If True, create the object when it does not already exist." />
<Parameter name="client" type="_Client | None" defaultValue="None" description="Modal client to use for loading; defaults to \`Client.from_env()\` when omitted." />

**Returns**

A \`NetworkFileSystem\` handle (possibly not yet hydrated).

**Usage**

\`\`\`python notest
nfs = NetworkFileSystem.from_name("my-nfs", create_if_missing=True)

@app.function(network_file_systems={"/data": nfs})
def f():
    pass
\`\`\`

## ephemeral

\`\`\`python
ephemeral(cls, client=None, environment_name=None)
\`\`\`
Create an anonymous NetworkFileSystem that exists for the duration of the context manager.

**Parameters**

<Parameter name="client" type="_Client | None" defaultValue="None" description="Modal client to use; defaults to \`Client.from_env()\` when omitted." />
<Parameter name="environment_name" type="str | None" defaultValue="None" description="Environment for the ephemeral object; defaults to the active environment." />

**Usage**

\`\`\`python
with modal.NetworkFileSystem.ephemeral() as nfs:
    assert nfs.listdir("/") == []
\`\`\`

\`\`\`python notest
async with modal.NetworkFileSystem.ephemeral() as nfs:
    assert await nfs.listdir("/") == []
\`\`\`

## delete

\`\`\`python
delete(name, client=None, environment_name=None)
\`\`\`


## write_file

\`\`\`python
write_file(self, remote_path, fp, progress_cb=None)
\`\`\`
Write from a file object to a path on the network file system, atomically.

Will create any needed parent directories automatically.

If remote_path ends with \`/\` it's assumed to be a directory and the
file will be uploaded with its current name to that directory.

## read_file

\`\`\`python
read_file(self, path)
\`\`\`
Read a file from the network file system

## iterdir

\`\`\`python
iterdir(self, path)
\`\`\`
Iterate over all files in a directory in the network file system.

* Passing a directory path lists all files in the directory (names are relative to the directory)
* Passing a file path returns a list containing only that file's listing description
* Passing a glob path (including at least one * or ** sequence) returns all files matching
that glob path (using absolute paths)

## add_local_file

\`\`\`python
add_local_file(self, local_path, remote_path=None, progress_cb=None)
\`\`\`


## add_local_dir

\`\`\`python
add_local_dir(self, local_path, remote_path=None, progress_cb=None)
\`\`\`


## listdir

\`\`\`python
listdir(self, path)
\`\`\`
List all files in a directory in the network file system.

* Passing a directory path lists all files in the directory (names are relative to the directory)
* Passing a file path returns a list containing only that file's listing description
* Passing a glob path (including at least one * or ** sequence) returns all files matching
that glob path (using absolute paths)

## remove_file

\`\`\`python
remove_file(self, path, recursive=False)
\`\`\`
Remove a file in a network file system.
`,meta:{title:`NetworkFileSystem`,description:`A shared, writable file system accessible by one or more Modal functions.`}},{toc:m,rawContent:h,meta:g}=p,_=e(`<!> <!> <p>A shared, writable file system accessible by one or more Modal functions.</p> <p>By attaching this file system as a mount to one or more functions, they can
share and persist data with each other.</p> <p><strong>Note: <code>NetworkFileSystem</code> has been deprecated and will be removed.</strong></p> <p><strong>Usage</strong></p> <!> <p>Also see the CLI methods for accessing network file systems:</p> <!> <p>A <code>NetworkFileSystem</code> can also be useful for some local scripting scenarios, e.g.:</p> <!> <!> <!> <p>Synchronize the local object with its identity on the Modal server.</p> <p>It is rarely necessary to call this method explicitly, as most operations
will lazily hydrate when needed. The main use case is when you need to
access object metadata, such as its ID.</p> <p><em>Added in v0.72.39</em>: This method replaces the deprecated <code>.resolve()</code> method.</p> <!> <!> <p>Reference a NetworkFileSystem by name, optionally creating it on the server first.</p> <p>Hydration is lazy: metadata is fetched from Modal the first time the handle is used.</p> <p><strong>Parameters</strong></p> <!> <!> <!> <!> <p><strong>Returns</strong></p> <p>A <code>NetworkFileSystem</code> handle (possibly not yet hydrated).</p> <p><strong>Usage</strong></p> <!> <!> <!> <p>Create an anonymous NetworkFileSystem that exists for the duration of the context manager.</p> <p><strong>Parameters</strong></p> <!> <!> <p><strong>Usage</strong></p> <!> <!> <!> <!> <!> <!> <p>Write from a file object to a path on the network file system, atomically.</p> <p>Will create any needed parent directories automatically.</p> <p>If remote_path ends with <code>/</code> it’s assumed to be a directory and the
file will be uploaded with its current name to that directory.</p> <!> <!> <p>Read a file from the network file system</p> <!> <!> <p>Iterate over all files in a directory in the network file system.</p> <ul><li>Passing a directory path lists all files in the directory (names are relative to the directory)</li> <li>Passing a file path returns a list containing only that file’s listing description</li> <li>Passing a glob path (including at least one * or ** sequence) returns all files matching
that glob path (using absolute paths)</li></ul> <!> <!> <!> <!> <!> <!> <p>List all files in a directory in the network file system.</p> <ul><li>Passing a directory path lists all files in the directory (names are relative to the directory)</li> <li>Passing a file path returns a list containing only that file’s listing description</li> <li>Passing a glob path (including at least one * or ** sequence) returns all files matching
that glob path (using absolute paths)</li></ul> <!> <!> <p>Remove a file in a network file system.</p>`,1);function v(e,m){let h=r(m,[`children`,`$$slots`,`$$events`,`$$legacy`]);d(e,i(()=>h,()=>p,{children:(e,r)=>{var i=_(),d=a(i);l(d,{id:`networkfilesystem`,children:(e,r)=>{s(),n(e,t(`NetworkFileSystem`))},$$slots:{default:!0}});var p=o(d,2);u(p,{code:`class%20NetworkFileSystem(modal.object.Object)`,lang:`python`});var m=o(p,10);u(m,{code:`import%20modal%0A%0Anfs%20%3D%20modal.NetworkFileSystem.from_name(%22my-nfs%22%2C%20create_if_missing%3DTrue)%0Aapp%20%3D%20modal.App()%0A%0A%40app.function(network_file_systems%3D%7B%22%2Froot%2Ffoo%22%3A%20nfs%7D)%0Adef%20f()%3A%0A%20%20%20%20pass%0A%0A%40app.function(network_file_systems%3D%7B%22%2Froot%2Fgoo%22%3A%20nfs%7D)%0Adef%20g()%3A%0A%20%20%20%20pass`,lang:`python`});var h=o(m,4);u(h,{code:`modal%20nfs%20--help`,lang:`text`});var g=o(h,4);u(g,{code:`nfs%20%3D%20modal.NetworkFileSystem.from_name(%22my-network-file-system%22)%0Afor%20chunk%20in%20nfs.read_file(%22my_db_dump.csv%22)%3A%0A%20%20%20%20...`,lang:`python`});var v=o(g,2);c(v,{id:`hydrate`,children:(e,r)=>{s(),n(e,t(`hydrate`))},$$slots:{default:!0}});var y=o(v,2);u(y,{code:`hydrate(self%2C%20client%3DNone)`,lang:`python`});var b=o(y,8);c(b,{id:`from_name`,children:(e,r)=>{s(),n(e,t(`from_name`))},$$slots:{default:!0}});var x=o(b,2);u(x,{code:`from_name(name%2C%20*%2C%20environment_name%3DNone%2C%20create_if_missing%3DFalse%2C%20client%3DNone)`,lang:`python`});var S=o(x,8);f(S,{name:`name`,type:`str`,description:`Deployment name of the network file system.`});var C=o(S,2);f(C,{name:`environment_name`,type:`str | None`,defaultValue:`None`,description:`Environment to resolve the name in; defaults to the active environment.`});var w=o(C,2);f(w,{name:`create_if_missing`,type:`bool`,defaultValue:`False`,description:`If True, create the object when it does not already exist.`});var T=o(w,2);f(T,{name:`client`,type:`_Client | None`,defaultValue:`None`,description:"Modal client to use for loading; defaults to `Client.from_env()` when omitted."});var E=o(T,8);u(E,{code:`nfs%20%3D%20NetworkFileSystem.from_name(%22my-nfs%22%2C%20create_if_missing%3DTrue)%0A%0A%40app.function(network_file_systems%3D%7B%22%2Fdata%22%3A%20nfs%7D)%0Adef%20f()%3A%0A%20%20%20%20pass`,lang:`python`});var D=o(E,2);c(D,{id:`ephemeral`,children:(e,r)=>{s(),n(e,t(`ephemeral`))},$$slots:{default:!0}});var O=o(D,2);u(O,{code:`ephemeral(cls%2C%20client%3DNone%2C%20environment_name%3DNone)`,lang:`python`});var k=o(O,6);f(k,{name:`client`,type:`_Client | None`,defaultValue:`None`,description:"Modal client to use; defaults to `Client.from_env()` when omitted."});var A=o(k,2);f(A,{name:`environment_name`,type:`str | None`,defaultValue:`None`,description:`Environment for the ephemeral object; defaults to the active environment.`});var j=o(A,4);u(j,{code:`with%20modal.NetworkFileSystem.ephemeral()%20as%20nfs%3A%0A%20%20%20%20assert%20nfs.listdir(%22%2F%22)%20%3D%3D%20%5B%5D`,lang:`python`});var M=o(j,2);u(M,{code:`async%20with%20modal.NetworkFileSystem.ephemeral()%20as%20nfs%3A%0A%20%20%20%20assert%20await%20nfs.listdir(%22%2F%22)%20%3D%3D%20%5B%5D`,lang:`python`});var N=o(M,2);c(N,{id:`delete`,children:(e,r)=>{s(),n(e,t(`delete`))},$$slots:{default:!0}});var P=o(N,2);u(P,{code:`delete(name%2C%20client%3DNone%2C%20environment_name%3DNone)`,lang:`python`});var F=o(P,2);c(F,{id:`write_file`,children:(e,r)=>{s(),n(e,t(`write_file`))},$$slots:{default:!0}});var I=o(F,2);u(I,{code:`write_file(self%2C%20remote_path%2C%20fp%2C%20progress_cb%3DNone)`,lang:`python`});var L=o(I,8);c(L,{id:`read_file`,children:(e,r)=>{s(),n(e,t(`read_file`))},$$slots:{default:!0}});var R=o(L,2);u(R,{code:`read_file(self%2C%20path)`,lang:`python`});var z=o(R,4);c(z,{id:`iterdir`,children:(e,r)=>{s(),n(e,t(`iterdir`))},$$slots:{default:!0}});var B=o(z,2);u(B,{code:`iterdir(self%2C%20path)`,lang:`python`});var V=o(B,6);c(V,{id:`add_local_file`,children:(e,r)=>{s(),n(e,t(`add_local_file`))},$$slots:{default:!0}});var H=o(V,2);u(H,{code:`add_local_file(self%2C%20local_path%2C%20remote_path%3DNone%2C%20progress_cb%3DNone)`,lang:`python`});var U=o(H,2);c(U,{id:`add_local_dir`,children:(e,r)=>{s(),n(e,t(`add_local_dir`))},$$slots:{default:!0}});var W=o(U,2);u(W,{code:`add_local_dir(self%2C%20local_path%2C%20remote_path%3DNone%2C%20progress_cb%3DNone)`,lang:`python`});var G=o(W,2);c(G,{id:`listdir`,children:(e,r)=>{s(),n(e,t(`listdir`))},$$slots:{default:!0}});var K=o(G,2);u(K,{code:`listdir(self%2C%20path)`,lang:`python`});var q=o(K,6);c(q,{id:`remove_file`,children:(e,r)=>{s(),n(e,t(`remove_file`))},$$slots:{default:!0}}),u(o(q,2),{code:`remove_file(self%2C%20path%2C%20recursive%3DFalse)`,lang:`python`}),s(2),n(e,i)},$$slots:{default:!0}}))}export{v as default,p as metadata};
//# sourceMappingURL=De0Q5XlW.js.map
