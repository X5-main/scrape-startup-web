(function(){try{var e=typeof window<`u`?window:typeof global<`u`?global:typeof globalThis<`u`?globalThis:typeof self<`u`?self:{};e.SENTRY_RELEASE={id:`f99fcf9f0a844cc9bd13fdc8e5782b84`};var t=new e.Error().stack;t&&(e._sentryDebugIds=e._sentryDebugIds||{},e._sentryDebugIds[t]=`b8e8aa5d-20be-4415-8a8b-8cff47ef7c7d`,e._sentryDebugIdIdentifier=`sentry-dbid-b8e8aa5d-20be-4415-8a8b-8cff47ef7c7d`)}catch{}})();import{$t as e,St as t,Tn as n,Tt as r,bt as i,c as a,d as o,en as s,tn as c,wn as l}from"./F_ixKBiO.js";import"./B1sc9Zdx.js";import"./Bb2deiU3.js";import{a as u,i as d,o as f}from"./CPby7b1n.js";import{t as p}from"./BILrvr3I.js";import{t as m}from"./B4L_if842.js";import{t as h}from"./DeWGVqas2.js";import"./B6UiYoTw.js";var g={toc:[{depth:1,value:`file_io`,id:`file_io`,children:[{depth:2,value:`FileIO`,id:`fileio`,children:[{depth:3,value:`create`,id:`create`},{depth:3,value:`read`,id:`read`},{depth:3,value:`readline`,id:`readline`},{depth:3,value:`readlines`,id:`readlines`},{depth:3,value:`write`,id:`write`},{depth:3,value:`flush`,id:`flush`},{depth:3,value:`seek`,id:`seek`},{depth:3,value:`ls`,id:`ls`},{depth:3,value:`mkdir`,id:`mkdir`},{depth:3,value:`rm`,id:`rm`},{depth:3,value:`watch`,id:`watch`},{depth:3,value:`close`,id:`close`}]},{depth:2,value:`ls`,id:`ls-1`},{depth:2,value:`mkdir`,id:`mkdir-1`},{depth:2,value:`rm`,id:`rm-1`},{depth:2,value:`watch`,id:`watch-1`}]}],rawContent:`# file_io

## FileIO


\`\`\`python
class FileIO(typing.Generic)
\`\`\`

[Alpha] FileIO handle, used in the Sandbox filesystem API.

Deprecated on 2026-03-09. Use the \`Sandbox.filesystem\` APIs instead.

The API is designed to mimic Python's io.FileIO.

Currently this API is in Alpha and is subject to change. File I/O operations
may be limited in size to 100 MiB, and the throughput of requests is
restricted in the current implementation. For our recommendations on large file transfers
see the Sandbox [filesystem access guide](https://modal.com/docs/guide/sandbox-files).

**Usage**

\`\`\`python notest
import modal

app = modal.App.lookup("my-app", create_if_missing=True)

sb = modal.Sandbox.create(app=app)
f = sb.open("/tmp/foo.txt", "w")
f.write("hello")
f.close()
\`\`\`

\`\`\`python
__init__(self, client, task_id)
\`\`\`


### create

\`\`\`python
create(cls, path, mode, client, task_id)
\`\`\`
Create a new FileIO handle.

### read

\`\`\`python
read(self, n=None)
\`\`\`
Read n bytes from the current position, or the entire remaining file if n is None.

### readline

\`\`\`python
readline(self)
\`\`\`
Read a single line from the current position.

### readlines

\`\`\`python
readlines(self)
\`\`\`
Read all lines from the current position.

### write

\`\`\`python
write(self, data)
\`\`\`
Write data to the current position.

Writes may not appear until the entire buffer is flushed, which
can be done manually with \`flush()\` or automatically when the file is
closed.

### flush

\`\`\`python
flush(self)
\`\`\`
Flush the buffer to disk.

### seek

\`\`\`python
seek(self, offset, whence=0)
\`\`\`
Move to a new position in the file.

\`whence\` defaults to 0 (absolute file positioning); other values are 1
(relative to the current position) and 2 (relative to the file's end).

### ls

\`\`\`python
ls(cls, path, client, task_id)
\`\`\`
List the contents of the provided directory.

### mkdir

\`\`\`python
mkdir(cls, path, client, task_id, parents=False)
\`\`\`
Create a new directory.

### rm

\`\`\`python
rm(cls, path, client, task_id, recursive=False)
\`\`\`
Remove a file or directory in the Sandbox.

### watch

\`\`\`python
watch(cls, path, client, task_id, filter=None, recursive=False, timeout=None)
\`\`\`


### close

\`\`\`python
close(self)
\`\`\`
Flush the buffer and close the file.
## ls

\`\`\`python
ls(path, client, task_id)
\`\`\`
List the contents of the provided directory.
## mkdir

\`\`\`python
mkdir(path, client, task_id, parents=False)
\`\`\`
Create a new directory.
## rm

\`\`\`python
rm(path, client, task_id, recursive=False)
\`\`\`
Remove a file or directory in the Sandbox.
## watch

\`\`\`python
watch(path, client, task_id, filter=None, recursive=False, timeout=None)
\`\`\`
Watch a file or directory for changes.
`,meta:{title:`file_io`,description:`Alpha FileIO handle, used in the Sandbox filesystem API.`}},{toc:_,rawContent:v,meta:y}=g,b=t(`<!> <!> <!> <p>[Alpha] FileIO handle, used in the Sandbox filesystem API.</p> <p>Deprecated on 2026-03-09. Use the <code>Sandbox.filesystem</code> APIs instead.</p> <p>The API is designed to mimic Python’s io.FileIO.</p> <p>Currently this API is in Alpha and is subject to change. File I/O operations
may be limited in size to 100 MiB, and the throughput of requests is
restricted in the current implementation. For our recommendations on large file transfers
see the Sandbox <!>.</p> <p><strong>Usage</strong></p> <!> <!> <!> <!> <p>Create a new FileIO handle.</p> <!> <!> <p>Read n bytes from the current position, or the entire remaining file if n is None.</p> <!> <!> <p>Read a single line from the current position.</p> <!> <!> <p>Read all lines from the current position.</p> <!> <!> <p>Write data to the current position.</p> <p>Writes may not appear until the entire buffer is flushed, which
can be done manually with <code>flush()</code> or automatically when the file is
closed.</p> <!> <!> <p>Flush the buffer to disk.</p> <!> <!> <p>Move to a new position in the file.</p> <p><code>whence</code> defaults to 0 (absolute file positioning); other values are 1
(relative to the current position) and 2 (relative to the file’s end).</p> <!> <!> <p>List the contents of the provided directory.</p> <!> <!> <p>Create a new directory.</p> <!> <!> <p>Remove a file or directory in the Sandbox.</p> <!> <!> <!> <!> <p>Flush the buffer and close the file.</p> <!> <!> <p>List the contents of the provided directory.</p> <!> <!> <p>Create a new directory.</p> <!> <!> <p>Remove a file or directory in the Sandbox.</p> <!> <!> <p>Watch a file or directory for changes.</p>`,1);function x(t,_){let v=a(_,[`children`,`$$slots`,`$$events`,`$$legacy`]);m(t,o(()=>v,()=>g,{children:(t,a)=>{var o=b(),m=s(o);f(m,{id:`file_io`,children:(e,t)=>{l(),i(e,r(`file_io`))},$$slots:{default:!0}});var g=c(m,2);u(g,{id:`fileio`,children:(e,t)=>{l(),i(e,r(`FileIO`))},$$slots:{default:!0}});var _=c(g,2);p(_,{code:`class%20FileIO(typing.Generic)`,lang:`python`});var v=c(_,8);h(c(e(v)),{href:`https://modal.com/docs/guide/sandbox-files`,rel:`nofollow`,children:(e,t)=>{l(),i(e,r(`filesystem access guide`))},$$slots:{default:!0}}),l(),n(v);var y=c(v,4);p(y,{code:`import%20modal%0A%0Aapp%20%3D%20modal.App.lookup(%22my-app%22%2C%20create_if_missing%3DTrue)%0A%0Asb%20%3D%20modal.Sandbox.create(app%3Dapp)%0Af%20%3D%20sb.open(%22%2Ftmp%2Ffoo.txt%22%2C%20%22w%22)%0Af.write(%22hello%22)%0Af.close()`,lang:`python`});var x=c(y,2);p(x,{code:`__init__(self%2C%20client%2C%20task_id)`,lang:`python`});var S=c(x,2);d(S,{id:`create`,children:(e,t)=>{l(),i(e,r(`create`))},$$slots:{default:!0}});var C=c(S,2);p(C,{code:`create(cls%2C%20path%2C%20mode%2C%20client%2C%20task_id)`,lang:`python`});var w=c(C,4);d(w,{id:`read`,children:(e,t)=>{l(),i(e,r(`read`))},$$slots:{default:!0}});var T=c(w,2);p(T,{code:`read(self%2C%20n%3DNone)`,lang:`python`});var E=c(T,4);d(E,{id:`readline`,children:(e,t)=>{l(),i(e,r(`readline`))},$$slots:{default:!0}});var D=c(E,2);p(D,{code:`readline(self)`,lang:`python`});var O=c(D,4);d(O,{id:`readlines`,children:(e,t)=>{l(),i(e,r(`readlines`))},$$slots:{default:!0}});var k=c(O,2);p(k,{code:`readlines(self)`,lang:`python`});var A=c(k,4);d(A,{id:`write`,children:(e,t)=>{l(),i(e,r(`write`))},$$slots:{default:!0}});var j=c(A,2);p(j,{code:`write(self%2C%20data)`,lang:`python`});var M=c(j,6);d(M,{id:`flush`,children:(e,t)=>{l(),i(e,r(`flush`))},$$slots:{default:!0}});var N=c(M,2);p(N,{code:`flush(self)`,lang:`python`});var P=c(N,4);d(P,{id:`seek`,children:(e,t)=>{l(),i(e,r(`seek`))},$$slots:{default:!0}});var F=c(P,2);p(F,{code:`seek(self%2C%20offset%2C%20whence%3D0)`,lang:`python`});var I=c(F,6);d(I,{id:`ls`,children:(e,t)=>{l(),i(e,r(`ls`))},$$slots:{default:!0}});var L=c(I,2);p(L,{code:`ls(cls%2C%20path%2C%20client%2C%20task_id)`,lang:`python`});var R=c(L,4);d(R,{id:`mkdir`,children:(e,t)=>{l(),i(e,r(`mkdir`))},$$slots:{default:!0}});var z=c(R,2);p(z,{code:`mkdir(cls%2C%20path%2C%20client%2C%20task_id%2C%20parents%3DFalse)`,lang:`python`});var B=c(z,4);d(B,{id:`rm`,children:(e,t)=>{l(),i(e,r(`rm`))},$$slots:{default:!0}});var V=c(B,2);p(V,{code:`rm(cls%2C%20path%2C%20client%2C%20task_id%2C%20recursive%3DFalse)`,lang:`python`});var H=c(V,4);d(H,{id:`watch`,children:(e,t)=>{l(),i(e,r(`watch`))},$$slots:{default:!0}});var U=c(H,2);p(U,{code:`watch(cls%2C%20path%2C%20client%2C%20task_id%2C%20filter%3DNone%2C%20recursive%3DFalse%2C%20timeout%3DNone)`,lang:`python`});var W=c(U,2);d(W,{id:`close`,children:(e,t)=>{l(),i(e,r(`close`))},$$slots:{default:!0}});var G=c(W,2);p(G,{code:`close(self)`,lang:`python`});var K=c(G,4);u(K,{id:`ls-1`,children:(e,t)=>{l(),i(e,r(`ls`))},$$slots:{default:!0}});var q=c(K,2);p(q,{code:`ls(path%2C%20client%2C%20task_id)`,lang:`python`});var J=c(q,4);u(J,{id:`mkdir-1`,children:(e,t)=>{l(),i(e,r(`mkdir`))},$$slots:{default:!0}});var Y=c(J,2);p(Y,{code:`mkdir(path%2C%20client%2C%20task_id%2C%20parents%3DFalse)`,lang:`python`});var X=c(Y,4);u(X,{id:`rm-1`,children:(e,t)=>{l(),i(e,r(`rm`))},$$slots:{default:!0}});var Z=c(X,2);p(Z,{code:`rm(path%2C%20client%2C%20task_id%2C%20recursive%3DFalse)`,lang:`python`});var Q=c(Z,4);u(Q,{id:`watch-1`,children:(e,t)=>{l(),i(e,r(`watch`))},$$slots:{default:!0}}),p(c(Q,2),{code:`watch(path%2C%20client%2C%20task_id%2C%20filter%3DNone%2C%20recursive%3DFalse%2C%20timeout%3DNone)`,lang:`python`}),l(2),i(t,o)},$$slots:{default:!0}}))}export{x as default,g as metadata};
//# sourceMappingURL=CIDfXYBd2.js.map
