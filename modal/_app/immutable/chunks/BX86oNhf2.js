(function(){try{var e=typeof window<`u`?window:typeof global<`u`?global:typeof globalThis<`u`?globalThis:typeof self<`u`?self:{};e.SENTRY_RELEASE={id:`f99fcf9f0a844cc9bd13fdc8e5782b84`};var t=new e.Error().stack;t&&(e._sentryDebugIds=e._sentryDebugIds||{},e._sentryDebugIds[t]=`eda72ba9-7c79-4934-af14-94060477f969`,e._sentryDebugIdIdentifier=`sentry-dbid-eda72ba9-7c79-4934-af14-94060477f969`)}catch{}})();import{$t as e,St as t,Tn as n,Tt as r,bt as i,c as ee,d as a,en as te,tn as o,wn as s}from"./F_ixKBiO.js";import"./B1sc9Zdx.js";import"./Bb2deiU3.js";import{a as c,i as l,o as ne}from"./CPby7b1n.js";import{t as u}from"./BILrvr3I.js";import{t as d}from"./B4L_if842.js";import{t as f}from"./DeWGVqas2.js";import{t as p}from"./B6UiYoTw.js";var m={toc:[{depth:1,value:`Secret`,id:`secret`,children:[{depth:2,value:`hydrate`,id:`hydrate`},{depth:2,value:`objects`,id:`objects`,children:[{depth:3,value:`objects.create`,id:`objectscreate`},{depth:3,value:`objects.list`,id:`objectslist`},{depth:3,value:`objects.delete`,id:`objectsdelete`}]},{depth:2,value:`name`,id:`name`},{depth:2,value:`from_dict`,id:`from_dict`},{depth:2,value:`from_local_environ`,id:`from_local_environ`},{depth:2,value:`from_dotenv`,id:`from_dotenv`},{depth:2,value:`from_name`,id:`from_name`},{depth:2,value:`info`,id:`info`},{depth:2,value:`update`,id:`update`}]}],rawContent:`# Secret


\`\`\`python
class Secret(modal.object.Object)
\`\`\`

Secrets provide a dictionary of environment variables for images.

Secrets are a secure way to add credentials and other sensitive information
to the containers your functions run in. You can create and edit secrets on
[the dashboard](https://modal.com/secrets), or programmatically from Python code.

See [the secrets guide page](https://modal.com/docs/guide/secrets) for more information.


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
objects: SecretManager
\`\`\`

Namespace with methods for managing named Secret objects.


### objects.create

\`\`\`python
create(self, name, env_dict, *, allow_existing=False, environment_name=None,
    client=None)
\`\`\`
Create a new named Secret in the workspace environment.

This does not return a local handle; use \`modal.Secret.from_name\` to look up the Secret after creation.

Added in v1.1.2.

**Parameters**

<Parameter name="name" type="str" description="Name for the new Secret." />
<Parameter name="env_dict" type="dict[str, str]" description="Environment variable keys and values stored in the Secret." />
<Parameter name="allow_existing" type="bool" defaultValue="False" description="If True, do nothing when a Secret with this name already exists (existing values are kept)." />
<Parameter name="environment_name" type="str | None" defaultValue="None" description="Environment to create in; defaults to the active environment." />
<Parameter name="client" type="_Client | None" defaultValue="None" description="Modal client to use; defaults to \`Client.from_env()\` when omitted." />

**Usage**

\`\`\`python notest
contents = {"MY_KEY": "my-value", "MY_OTHER_KEY": "my-other-value"}
modal.Secret.objects.create("my-secret", contents)
\`\`\`

Secrets will be created in the active environment, or another one can be specified:

\`\`\`python notest
modal.Secret.objects.create("my-secret", contents, environment_name="dev")
\`\`\`

By default, an error will be raised if the Secret already exists, but passing
\`allow_existing=True\` will make the creation attempt a no-op in this case.
If the \`env_dict\` data differs from the existing Secret, it will be ignored.

\`\`\`python notest
modal.Secret.objects.create("my-secret", contents, allow_existing=True)
\`\`\`

Note that this method does not return a local instance of the Secret. You can use
\`modal.Secret.from_name\` to perform a lookup after creation.

### objects.list

\`\`\`python
list(self, *, max_objects=None, created_before=None, environment_name="",
    client=None)
\`\`\`
List named Secrets in the workspace environment as hydrated handles.

Results are ordered newest to oldest. By default, all matching Secrets are returned.

Added in v1.1.2.

**Parameters**

<Parameter name="max_objects" type="int | None" defaultValue="None" description="Maximum number of Secrets to return." />
<Parameter name="created_before" type="datetime | str | None" defaultValue="None" description="Only include Secrets created before this time (datetime or ISO date string)." />
<Parameter name="environment_name" type="str" defaultValue="&quot;&quot;" description="Environment to list from; defaults to the active environment." />
<Parameter name="client" type="_Client | None" defaultValue="None" description="Modal client to use; defaults to \`Client.from_env()\` when omitted." />

**Returns**

Hydrated \`Secret\` objects for each named Secret in the listing.

**Usage**

\`\`\`python
secrets = modal.Secret.objects.list()
print([s.name for s in secrets])
\`\`\`

Secrets will be retrieved from the active environment, or another one can be specified:

\`\`\`python notest
dev_secrets = modal.Secret.objects.list(environment_name="dev")
\`\`\`

By default, all named Secrets are returned, newest to oldest. It's also possible to limit the
number of results and to filter by creation date:

\`\`\`python
secrets = modal.Secret.objects.list(max_objects=10, created_before="2025-01-01")
\`\`\`

### objects.delete

\`\`\`python
delete(self, name, *, allow_missing=False, environment_name=None, client=None)
\`\`\`
Delete a named Secret entirely.

Deletion is irreversible and affects any Apps using this Secret.

Added in v1.1.2.

**Parameters**

<Parameter name="name" type="str" description="Name of the Secret to delete." />
<Parameter name="allow_missing" type="bool" defaultValue="False" description="If True, do nothing when the Secret does not exist." />
<Parameter name="environment_name" type="str | None" defaultValue="None" description="Environment to delete from; defaults to the active environment." />
<Parameter name="client" type="_Client | None" defaultValue="None" description="Modal client to use; defaults to \`Client.from_env()\` when omitted." />

**Usage**

\`\`\`python notest
await modal.Secret.objects.delete("my-secret")
\`\`\`

Secrets will be deleted from the active environment, or another one can be specified:

\`\`\`python notest
await modal.Secret.objects.delete("my-secret", environment_name="dev")
\`\`\`

## name

\`\`\`python
name(self)
\`\`\`


## from_dict

\`\`\`python
from_dict(env_dict={})
\`\`\`
Create a Secret from a dictionary of environment variable names to string values.

Values may be \`\`None\`\`; those keys are omitted from the Secret.

**Parameters**

<Parameter name="env_dict" type="dict[str, str | None]" defaultValue="&#123;&#125;" description="Mapping of variable names to values (or \`\`None\`\` to skip a key)." />

**Returns**

A lazy \`Secret\` handle backed by the given key-value pairs.

**Usage**

\`\`\`python
@app.function(secrets=[modal.Secret.from_dict({"FOO": "bar"})])
def run():
    print(os.environ["FOO"])
\`\`\`

## from_local_environ

\`\`\`python
from_local_environ(env_keys)
\`\`\`
Build a Secret from the current process environment (local runs only).

In remote execution, returns an empty Secret.

**Parameters**

<Parameter name="env_keys" type="list[str]" description="Names of environment variables to copy into the Secret." />

**Returns**

A \`Secret\` containing the resolved variables (or empty when not local).

## from_dotenv

\`\`\`python
from_dotenv(path=None, *, filename=".env", client=None)
\`\`\`
Load environment variables from a \`.env\` file into a Secret.

With no \`path\`, searches from the current working directory (not the caller's file path).
With \`path\` set, walks upward from that file or directory to find \`filename\`.

**Parameters**

<Parameter name="path" type="" defaultValue="None" description="File or directory to search from; omit to search from the process cwd." />
<Parameter name="filename" type="" defaultValue="&quot;.env&quot;" description="Name of the env file to find (default \`\`.env\`\`)." />
<Parameter name="client" type="_Client | None" defaultValue="None" description="Modal client used when hydrating the Secret." />

**Returns**

A lazy \`Secret\` handle whose values are loaded from the resolved \`.env\` file.

**Usage**

\`\`\`python
@app.function(secrets=[modal.Secret.from_dotenv(__file__)])
def run():
    print(os.environ["USERNAME"])  # Assumes USERNAME is defined in your .env file
\`\`\`

\`\`\`python
@app.function(secrets=[modal.Secret.from_dotenv(filename=".env-dev")])
def run():
    ...
\`\`\`

## from_name

\`\`\`python
from_name(name, *, environment_name=None, required_keys=[], client=None)
\`\`\`
Reference a deployed Secret by name.

Hydration is lazy until the Secret is used.

**Parameters**

<Parameter name="name" type="str" description="Deployment name of the Secret." />
<Parameter name="environment_name" type="str | None" defaultValue="None" description="Environment to resolve the name in; defaults to the active environment." />
<Parameter name="required_keys" type="list[str]" defaultValue="[]" description="If non-empty, the server asserts these keys exist on the Secret." />
<Parameter name="client" type="_Client | None" defaultValue="None" description="Modal client to use for loading; defaults to \`Client.from_env()\` when omitted." />

**Returns**

A \`Secret\` handle (possibly not yet hydrated).

**Usage**

\`\`\`python
secret = modal.Secret.from_name("my-secret")

@app.function(secrets=[secret])
def run():
    ...
\`\`\`

## info

\`\`\`python
info(self)
\`\`\`
Return information about the Secret object.

## update

\`\`\`python
update(self, env_dict)
\`\`\`
Update this Secret, adding or overwriting key-value pairs.

Like dict.update(), this merges \`env_dict\` into the existing Secret.
Keys not mentioned in \`env_dict\` are left unchanged.
`,meta:{title:`Secret`,description:`Secrets provide a dictionary of environment variables for images.`}},{toc:h,rawContent:g,meta:_}=m,re=t(`<!> <!> <p>Secrets provide a dictionary of environment variables for images.</p> <p>Secrets are a secure way to add credentials and other sensitive information
to the containers your functions run in. You can create and edit secrets on <!>, or programmatically from Python code.</p> <p>See <!> for more information.</p> <!> <!> <p>Synchronize the local object with its identity on the Modal server.</p> <p>It is rarely necessary to call this method explicitly, as most operations
will lazily hydrate when needed. The main use case is when you need to
access object metadata, such as its ID.</p> <p><em>Added in v0.72.39</em>: This method replaces the deprecated <code>.resolve()</code> method.</p> <!> <!> <p>Namespace with methods for managing named Secret objects.</p> <!> <!> <p>Create a new named Secret in the workspace environment.</p> <p>This does not return a local handle; use <code>modal.Secret.from_name</code> to look up the Secret after creation.</p> <p>Added in v1.1.2.</p> <p><strong>Parameters</strong></p> <!> <!> <!> <!> <!> <p><strong>Usage</strong></p> <!> <p>Secrets will be created in the active environment, or another one can be specified:</p> <!> <p>By default, an error will be raised if the Secret already exists, but passing <code>allow_existing=True</code> will make the creation attempt a no-op in this case.
If the <code>env_dict</code> data differs from the existing Secret, it will be ignored.</p> <!> <p>Note that this method does not return a local instance of the Secret. You can use <code>modal.Secret.from_name</code> to perform a lookup after creation.</p> <!> <!> <p>List named Secrets in the workspace environment as hydrated handles.</p> <p>Results are ordered newest to oldest. By default, all matching Secrets are returned.</p> <p>Added in v1.1.2.</p> <p><strong>Parameters</strong></p> <!> <!> <!> <!> <p><strong>Returns</strong></p> <p>Hydrated <code>Secret</code> objects for each named Secret in the listing.</p> <p><strong>Usage</strong></p> <!> <p>Secrets will be retrieved from the active environment, or another one can be specified:</p> <!> <p>By default, all named Secrets are returned, newest to oldest. It’s also possible to limit the
number of results and to filter by creation date:</p> <!> <!> <!> <p>Delete a named Secret entirely.</p> <p>Deletion is irreversible and affects any Apps using this Secret.</p> <p>Added in v1.1.2.</p> <p><strong>Parameters</strong></p> <!> <!> <!> <!> <p><strong>Usage</strong></p> <!> <p>Secrets will be deleted from the active environment, or another one can be specified:</p> <!> <!> <!> <!> <!> <p>Create a Secret from a dictionary of environment variable names to string values.</p> <p>Values may be <code>None</code>; those keys are omitted from the Secret.</p> <p><strong>Parameters</strong></p> <!> <p><strong>Returns</strong></p> <p>A lazy <code>Secret</code> handle backed by the given key-value pairs.</p> <p><strong>Usage</strong></p> <!> <!> <!> <p>Build a Secret from the current process environment (local runs only).</p> <p>In remote execution, returns an empty Secret.</p> <p><strong>Parameters</strong></p> <!> <p><strong>Returns</strong></p> <p>A <code>Secret</code> containing the resolved variables (or empty when not local).</p> <!> <!> <p>Load environment variables from a <code>.env</code> file into a Secret.</p> <p>With no <code>path</code>, searches from the current working directory (not the caller’s file path).
With <code>path</code> set, walks upward from that file or directory to find <code>filename</code>.</p> <p><strong>Parameters</strong></p> <!> <!> <!> <p><strong>Returns</strong></p> <p>A lazy <code>Secret</code> handle whose values are loaded from the resolved <code>.env</code> file.</p> <p><strong>Usage</strong></p> <!> <!> <!> <!> <p>Reference a deployed Secret by name.</p> <p>Hydration is lazy until the Secret is used.</p> <p><strong>Parameters</strong></p> <!> <!> <!> <!> <p><strong>Returns</strong></p> <p>A <code>Secret</code> handle (possibly not yet hydrated).</p> <p><strong>Usage</strong></p> <!> <!> <!> <p>Return information about the Secret object.</p> <!> <!> <p>Update this Secret, adding or overwriting key-value pairs.</p> <p>Like dict.update(), this merges <code>env_dict</code> into the existing Secret.
Keys not mentioned in <code>env_dict</code> are left unchanged.</p>`,1);function v(t,h){let g=ee(h,[`children`,`$$slots`,`$$events`,`$$legacy`]);d(t,a(()=>g,()=>m,{children:(t,ee)=>{var a=re(),d=te(a);ne(d,{id:`secret`,children:(e,t)=>{s(),i(e,r(`Secret`))},$$slots:{default:!0}});var m=o(d,2);u(m,{code:`class%20Secret(modal.object.Object)`,lang:`python`});var h=o(m,4);f(o(e(h)),{href:`https://modal.com/secrets`,rel:`nofollow`,children:(e,t)=>{s(),i(e,r(`the dashboard`))},$$slots:{default:!0}}),s(),n(h);var g=o(h,2);f(o(e(g)),{href:`https://modal.com/docs/guide/secrets`,rel:`nofollow`,children:(e,t)=>{s(),i(e,r(`the secrets guide page`))},$$slots:{default:!0}}),s(),n(g);var _=o(g,2);c(_,{id:`hydrate`,children:(e,t)=>{s(),i(e,r(`hydrate`))},$$slots:{default:!0}});var v=o(_,2);u(v,{code:`hydrate(self%2C%20client%3DNone)`,lang:`python`});var y=o(v,8);c(y,{id:`objects`,children:(e,t)=>{s(),i(e,r(`objects`))},$$slots:{default:!0}});var b=o(y,2);u(b,{code:`objects%3A%20SecretManager`,lang:`python`});var x=o(b,4);l(x,{id:`objectscreate`,children:(e,t)=>{s(),i(e,r(`objects.create`))},$$slots:{default:!0}});var S=o(x,2);u(S,{code:`create(self%2C%20name%2C%20env_dict%2C%20*%2C%20allow_existing%3DFalse%2C%20environment_name%3DNone%2C%0A%20%20%20%20client%3DNone)`,lang:`python`});var C=o(S,10);p(C,{name:`name`,type:`str`,description:`Name for the new Secret.`});var w=o(C,2);p(w,{name:`env_dict`,type:`dict[str, str]`,description:`Environment variable keys and values stored in the Secret.`});var T=o(w,2);p(T,{name:`allow_existing`,type:`bool`,defaultValue:`False`,description:`If True, do nothing when a Secret with this name already exists (existing values are kept).`});var E=o(T,2);p(E,{name:`environment_name`,type:`str | None`,defaultValue:`None`,description:`Environment to create in; defaults to the active environment.`});var D=o(E,2);p(D,{name:`client`,type:`_Client | None`,defaultValue:`None`,description:"Modal client to use; defaults to `Client.from_env()` when omitted."});var O=o(D,4);u(O,{code:`contents%20%3D%20%7B%22MY_KEY%22%3A%20%22my-value%22%2C%20%22MY_OTHER_KEY%22%3A%20%22my-other-value%22%7D%0Amodal.Secret.objects.create(%22my-secret%22%2C%20contents)`,lang:`python`});var k=o(O,4);u(k,{code:`modal.Secret.objects.create(%22my-secret%22%2C%20contents%2C%20environment_name%3D%22dev%22)`,lang:`python`});var A=o(k,4);u(A,{code:`modal.Secret.objects.create(%22my-secret%22%2C%20contents%2C%20allow_existing%3DTrue)`,lang:`python`});var j=o(A,4);l(j,{id:`objectslist`,children:(e,t)=>{s(),i(e,r(`objects.list`))},$$slots:{default:!0}});var M=o(j,2);u(M,{code:`list(self%2C%20*%2C%20max_objects%3DNone%2C%20created_before%3DNone%2C%20environment_name%3D%22%22%2C%0A%20%20%20%20client%3DNone)`,lang:`python`});var N=o(M,10);p(N,{name:`max_objects`,type:`int | None`,defaultValue:`None`,description:`Maximum number of Secrets to return.`});var P=o(N,2);p(P,{name:`created_before`,type:`datetime | str | None`,defaultValue:`None`,description:`Only include Secrets created before this time (datetime or ISO date string).`});var F=o(P,2);p(F,{name:`environment_name`,type:`str`,defaultValue:`""`,description:`Environment to list from; defaults to the active environment.`});var I=o(F,2);p(I,{name:`client`,type:`_Client | None`,defaultValue:`None`,description:"Modal client to use; defaults to `Client.from_env()` when omitted."});var L=o(I,8);u(L,{code:`secrets%20%3D%20modal.Secret.objects.list()%0Aprint(%5Bs.name%20for%20s%20in%20secrets%5D)`,lang:`python`});var R=o(L,4);u(R,{code:`dev_secrets%20%3D%20modal.Secret.objects.list(environment_name%3D%22dev%22)`,lang:`python`});var z=o(R,4);u(z,{code:`secrets%20%3D%20modal.Secret.objects.list(max_objects%3D10%2C%20created_before%3D%222025-01-01%22)`,lang:`python`});var B=o(z,2);l(B,{id:`objectsdelete`,children:(e,t)=>{s(),i(e,r(`objects.delete`))},$$slots:{default:!0}});var ie=o(B,2);u(ie,{code:`delete(self%2C%20name%2C%20*%2C%20allow_missing%3DFalse%2C%20environment_name%3DNone%2C%20client%3DNone)`,lang:`python`});var V=o(ie,10);p(V,{name:`name`,type:`str`,description:`Name of the Secret to delete.`});var H=o(V,2);p(H,{name:`allow_missing`,type:`bool`,defaultValue:`False`,description:`If True, do nothing when the Secret does not exist.`});var U=o(H,2);p(U,{name:`environment_name`,type:`str | None`,defaultValue:`None`,description:`Environment to delete from; defaults to the active environment.`});var W=o(U,2);p(W,{name:`client`,type:`_Client | None`,defaultValue:`None`,description:"Modal client to use; defaults to `Client.from_env()` when omitted."});var G=o(W,4);u(G,{code:`await%20modal.Secret.objects.delete(%22my-secret%22)`,lang:`python`});var K=o(G,4);u(K,{code:`await%20modal.Secret.objects.delete(%22my-secret%22%2C%20environment_name%3D%22dev%22)`,lang:`python`});var q=o(K,2);c(q,{id:`name`,children:(e,t)=>{s(),i(e,r(`name`))},$$slots:{default:!0}});var J=o(q,2);u(J,{code:`name(self)`,lang:`python`});var Y=o(J,2);c(Y,{id:`from_dict`,children:(e,t)=>{s(),i(e,r(`from_dict`))},$$slots:{default:!0}});var X=o(Y,2);u(X,{code:`from_dict(env_dict%3D%7B%7D)`,lang:`python`});var Z=o(X,8);p(Z,{name:`env_dict`,type:`dict[str, str | None]`,defaultValue:`{}`,description:"Mapping of variable names to values (or ``None`` to skip a key)."});var Q=o(Z,8);u(Q,{code:`%40app.function(secrets%3D%5Bmodal.Secret.from_dict(%7B%22FOO%22%3A%20%22bar%22%7D)%5D)%0Adef%20run()%3A%0A%20%20%20%20print(os.environ%5B%22FOO%22%5D)`,lang:`python`});var ae=o(Q,2);c(ae,{id:`from_local_environ`,children:(e,t)=>{s(),i(e,r(`from_local_environ`))},$$slots:{default:!0}});var oe=o(ae,2);u(oe,{code:`from_local_environ(env_keys)`,lang:`python`});var se=o(oe,8);p(se,{name:`env_keys`,type:`list[str]`,description:`Names of environment variables to copy into the Secret.`});var ce=o(se,6);c(ce,{id:`from_dotenv`,children:(e,t)=>{s(),i(e,r(`from_dotenv`))},$$slots:{default:!0}});var le=o(ce,2);u(le,{code:`from_dotenv(path%3DNone%2C%20*%2C%20filename%3D%22.env%22%2C%20client%3DNone)`,lang:`python`});var ue=o(le,8);p(ue,{name:`path`,type:``,defaultValue:`None`,description:`File or directory to search from; omit to search from the process cwd.`});var de=o(ue,2);p(de,{name:`filename`,type:``,defaultValue:`".env"`,description:"Name of the env file to find (default ``.env``)."});var fe=o(de,2);p(fe,{name:`client`,type:`_Client | None`,defaultValue:`None`,description:`Modal client used when hydrating the Secret.`});var pe=o(fe,8);u(pe,{code:`%40app.function(secrets%3D%5Bmodal.Secret.from_dotenv(__file__)%5D)%0Adef%20run()%3A%0A%20%20%20%20print(os.environ%5B%22USERNAME%22%5D)%20%20%23%20Assumes%20USERNAME%20is%20defined%20in%20your%20.env%20file`,lang:`python`});var $=o(pe,2);u($,{code:`%40app.function(secrets%3D%5Bmodal.Secret.from_dotenv(filename%3D%22.env-dev%22)%5D)%0Adef%20run()%3A%0A%20%20%20%20...`,lang:`python`});var me=o($,2);c(me,{id:`from_name`,children:(e,t)=>{s(),i(e,r(`from_name`))},$$slots:{default:!0}});var he=o(me,2);u(he,{code:`from_name(name%2C%20*%2C%20environment_name%3DNone%2C%20required_keys%3D%5B%5D%2C%20client%3DNone)`,lang:`python`});var ge=o(he,8);p(ge,{name:`name`,type:`str`,description:`Deployment name of the Secret.`});var _e=o(ge,2);p(_e,{name:`environment_name`,type:`str | None`,defaultValue:`None`,description:`Environment to resolve the name in; defaults to the active environment.`});var ve=o(_e,2);p(ve,{name:`required_keys`,type:`list[str]`,defaultValue:`[]`,description:`If non-empty, the server asserts these keys exist on the Secret.`});var ye=o(ve,2);p(ye,{name:`client`,type:`_Client | None`,defaultValue:`None`,description:"Modal client to use for loading; defaults to `Client.from_env()` when omitted."});var be=o(ye,8);u(be,{code:`secret%20%3D%20modal.Secret.from_name(%22my-secret%22)%0A%0A%40app.function(secrets%3D%5Bsecret%5D)%0Adef%20run()%3A%0A%20%20%20%20...`,lang:`python`});var xe=o(be,2);c(xe,{id:`info`,children:(e,t)=>{s(),i(e,r(`info`))},$$slots:{default:!0}});var Se=o(xe,2);u(Se,{code:`info(self)`,lang:`python`});var Ce=o(Se,4);c(Ce,{id:`update`,children:(e,t)=>{s(),i(e,r(`update`))},$$slots:{default:!0}}),u(o(Ce,2),{code:`update(self%2C%20env_dict)`,lang:`python`}),s(4),i(t,a)},$$slots:{default:!0}}))}export{v as default,m as metadata};
//# sourceMappingURL=BX86oNhf2.js.map
