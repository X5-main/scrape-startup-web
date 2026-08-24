(function(){try{var e=typeof window<`u`?window:typeof global<`u`?global:typeof globalThis<`u`?globalThis:typeof self<`u`?self:{};e.SENTRY_RELEASE={id:`f99fcf9f0a844cc9bd13fdc8e5782b84`};var t=new e.Error().stack;t&&(e._sentryDebugIds=e._sentryDebugIds||{},e._sentryDebugIds[t]=`5b93fa9b-6f9d-466b-9268-f792c1e9037c`,e._sentryDebugIdIdentifier=`sentry-dbid-5b93fa9b-6f9d-466b-9268-f792c1e9037c`)}catch{}})();import{$t as e,St as t,Tn as n,Tt as r,bt as i,c as a,d as o,en as s,tn as c,wn as l}from"./F_ixKBiO.js";import"./B1sc9Zdx.js";import"./Bb2deiU3.js";import{a as u,o as d}from"./CPby7b1n.js";import{t as f}from"./BILrvr3I.js";import{t as p}from"./B4L_if842.js";import{t as m}from"./DeWGVqas2.js";var h={description:`Deprecated shared storage for Modal Functions. Use modal.Volume instead for better performance across regions.`,toc:[{depth:1,value:`Network file systems (deprecated)`,id:`network-file-systems-deprecated`,children:[{depth:2,value:`Basic example`,id:`basic-example`},{depth:2,value:`Deleting NFS objects`,id:`deleting-nfs-objects`}]}],rawContent:`# Network file systems (deprecated)

Modal lets you create
[writeable volumes](/docs/sdk/py/latest/NetworkFileSystem) that can be
simultaneously attached to multiple Modal Functions. These are helpful for use
cases such as:

1. Storing datasets
2. Keeping a shared cache for expensive computations
3. Leveraging POSIX filesystem APIs for both local and remote data storage

**Note: \`NetworkFileSystem\` has been deprecated and will be removed.**

The \`NetworkFileSystem\` abstraction is limited by the fact that the underlying
storage is located in only one cloud region. Since Modal compute runs in
multiple regions, this causes variable latency and throughput issues when
accessing the file system.

To address this, we have a new distributed storage primitive,
[modal.Volume](/docs/guide/volumes), that offers fast reads and writes across
all regions. \`NetworkFileSystem\`s are still supported and useful in some
circumstances, but we recommend trying out \`Volume\`s first for most new
projects.

## Basic example

New \`modal.NetworkFileSystem\` objects can be created through the modal CLI:

\`\`\`
modal nfs create
\`\`\`

or they can be created on-the-fly when using the
[modal.NetworkFileSystem.from_name](/docs/sdk/py/latest/NetworkFileSystem#from_name)
constructor with \`create_if_missing=True\`.

In your App code, the filesystem can be mounted within a Function by providing a
mapping between mount paths and \`NetworkFileSystem\` objects. For example, to use
a \`NetworkFileSystem\` to initialize a shared
[shelve](https://docs.python.org/3/library/shelve.html) disk cache:

\`\`\`python
import shelve
import modal

volume = modal.NetworkFileSystem.from_name("my-cache", create_if_missing=True)

@app.function(network_file_systems={"/root/cache": volume})
def expensive_computation(key: str):
    with shelve.open("/root/cache/shelve") as cache:
        cached_val = cache.get(key)

    if cached_val is not None:
        return cached_val

    # cache miss; populate value
    ...
\`\`\`

The above implements basic disk caching, but be aware that \`shelve\` does not
[guarantee correctness](https://docs.python.org/3/library/shelve.html#restrictions)
in the event of concurrent read/write operations. To protect against concurrent
write conflicts, the [flufl.lock](https://flufllock.readthedocs.io/en/stable/)
package is useful.

## Deleting NFS objects

You can delete a network filesystem object (along with all of its data) via the
[storage dashboard](https://modal.com/storage), the
\`modal nfs delete\` CLI, or the
[\`modal.NetworkFileSystem.delete\`](/docs/sdk/py/latest/NetworkFileSystem#delete)
method.
`,meta:{title:`Network file systems (deprecated)`,description:`Deprecated shared storage for Modal Functions. Use modal.Volume instead for better performance across regions.`}},{description:g,toc:_,rawContent:v,meta:y}=h,b=t(`<code>modal.NetworkFileSystem.delete</code>`),x=t(`<!> <p>Modal lets you create <!> that can be
simultaneously attached to multiple Modal Functions. These are helpful for use
cases such as:</p> <ol><li>Storing datasets</li> <li>Keeping a shared cache for expensive computations</li> <li>Leveraging POSIX filesystem APIs for both local and remote data storage</li></ol> <p><strong>Note: <code>NetworkFileSystem</code> has been deprecated and will be removed.</strong></p> <p>The <code>NetworkFileSystem</code> abstraction is limited by the fact that the underlying
storage is located in only one cloud region. Since Modal compute runs in
multiple regions, this causes variable latency and throughput issues when
accessing the file system.</p> <p>To address this, we have a new distributed storage primitive, <!>, that offers fast reads and writes across
all regions. <code>NetworkFileSystem</code>s are still supported and useful in some
circumstances, but we recommend trying out <code>Volume</code>s first for most new
projects.</p> <!> <p>New <code>modal.NetworkFileSystem</code> objects can be created through the modal CLI:</p> <!> <p>or they can be created on-the-fly when using the <!> constructor with <code>create_if_missing=True</code>.</p> <p>In your App code, the filesystem can be mounted within a Function by providing a
mapping between mount paths and <code>NetworkFileSystem</code> objects. For example, to use
a <code>NetworkFileSystem</code> to initialize a shared <!> disk cache:</p> <!> <p>The above implements basic disk caching, but be aware that <code>shelve</code> does not <!> in the event of concurrent read/write operations. To protect against concurrent
write conflicts, the <!> package is useful.</p> <!> <p>You can delete a network filesystem object (along with all of its data) via the <!>, the <code>modal nfs delete</code> CLI, or the <!> method.</p>`,1);function S(t,g){let _=a(g,[`children`,`$$slots`,`$$events`,`$$legacy`]);p(t,o(()=>_,()=>h,{children:(t,a)=>{var o=x(),p=s(o);d(p,{id:`network-file-systems-deprecated`,children:(e,t)=>{l(),i(e,r(`Network file systems (deprecated)`))},$$slots:{default:!0}});var h=c(p,2);m(c(e(h)),{href:`/docs/sdk/py/latest/NetworkFileSystem`,children:(e,t)=>{l(),i(e,r(`writeable volumes`))},$$slots:{default:!0}}),l(),n(h);var g=c(h,8);m(c(e(g)),{href:`/docs/guide/volumes`,children:(e,t)=>{l(),i(e,r(`modal.Volume`))},$$slots:{default:!0}}),l(5),n(g);var _=c(g,2);u(_,{id:`basic-example`,children:(e,t)=>{l(),i(e,r(`Basic example`))},$$slots:{default:!0}});var v=c(_,4);f(v,{code:`modal%20nfs%20create`,lang:`text`});var y=c(v,2);m(c(e(y)),{href:`/docs/sdk/py/latest/NetworkFileSystem#from_name`,children:(e,t)=>{l(),i(e,r(`modal.NetworkFileSystem.from_name`))},$$slots:{default:!0}}),l(3),n(y);var S=c(y,2);m(c(e(S),5),{href:`https://docs.python.org/3/library/shelve.html`,rel:`nofollow`,children:(e,t)=>{l(),i(e,r(`shelve`))},$$slots:{default:!0}}),l(),n(S);var C=c(S,2);f(C,{code:`import%20shelve%0Aimport%20modal%0A%0Avolume%20%3D%20modal.NetworkFileSystem.from_name(%22my-cache%22%2C%20create_if_missing%3DTrue)%0A%0A%40app.function(network_file_systems%3D%7B%22%2Froot%2Fcache%22%3A%20volume%7D)%0Adef%20expensive_computation(key%3A%20str)%3A%0A%20%20%20%20with%20shelve.open(%22%2Froot%2Fcache%2Fshelve%22)%20as%20cache%3A%0A%20%20%20%20%20%20%20%20cached_val%20%3D%20cache.get(key)%0A%0A%20%20%20%20if%20cached_val%20is%20not%20None%3A%0A%20%20%20%20%20%20%20%20return%20cached_val%0A%0A%20%20%20%20%23%20cache%20miss%3B%20populate%20value%0A%20%20%20%20...`,lang:`python`});var w=c(C,2),T=c(e(w),3);m(T,{href:`https://docs.python.org/3/library/shelve.html#restrictions`,rel:`nofollow`,children:(e,t)=>{l(),i(e,r(`guarantee correctness`))},$$slots:{default:!0}}),m(c(T,2),{href:`https://flufllock.readthedocs.io/en/stable/`,rel:`nofollow`,children:(e,t)=>{l(),i(e,r(`flufl.lock`))},$$slots:{default:!0}}),l(),n(w);var E=c(w,2);u(E,{id:`deleting-nfs-objects`,children:(e,t)=>{l(),i(e,r(`Deleting NFS objects`))},$$slots:{default:!0}});var D=c(E,2),O=c(e(D));m(O,{href:`https://modal.com/storage`,rel:`nofollow`,children:(e,t)=>{l(),i(e,r(`storage dashboard`))},$$slots:{default:!0}}),m(c(O,4),{href:`/docs/sdk/py/latest/NetworkFileSystem#delete`,children:(e,t)=>{i(e,b())},$$slots:{default:!0}}),l(),n(D),i(t,o)},$$slots:{default:!0}}))}export{S as default,h as metadata};
//# sourceMappingURL=B4RTnRCw.js.map
