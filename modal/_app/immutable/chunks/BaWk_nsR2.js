(function(){try{var e=typeof window<`u`?window:typeof global<`u`?global:typeof globalThis<`u`?globalThis:typeof self<`u`?self:{};e.SENTRY_RELEASE={id:`f99fcf9f0a844cc9bd13fdc8e5782b84`};var t=new e.Error().stack;t&&(e._sentryDebugIds=e._sentryDebugIds||{},e._sentryDebugIds[t]=`70fb855d-89c1-40ec-9819-b56258327204`,e._sentryDebugIdIdentifier=`sentry-dbid-70fb855d-89c1-40ec-9819-b56258327204`)}catch{}})();import{St as e,Tt as t,bt as n,c as r,d as i,en as a,tn as o,wn as s}from"./F_ixKBiO.js";import"./B1sc9Zdx.js";import"./Bb2deiU3.js";import{a as c,i as l,o as u}from"./CPby7b1n.js";import{t as d}from"./BILrvr3I.js";import{t as f}from"./B4L_if842.js";import"./B6UiYoTw.js";var p={toc:[{depth:1,value:`io_streams`,id:`io_streams`,children:[{depth:2,value:`StreamReader`,id:`streamreader`,children:[{depth:3,value:`file_descriptor`,id:`file_descriptor`},{depth:3,value:`read`,id:`read`}]},{depth:2,value:`StreamWriter`,id:`streamwriter`,children:[{depth:3,value:`write`,id:`write`},{depth:3,value:`write_eof`,id:`write_eof`},{depth:3,value:`drain`,id:`drain`}]}]}],rawContent:`# io_streams

## StreamReader


\`\`\`python
class StreamReader(typing.Generic)
\`\`\`

Retrieve logs from a stream (\`stdout\` or \`stderr\`).

As an asynchronous iterable, the object supports the \`for\` and \`async for\`
statements. Just loop over the object to read in chunks.


### file_descriptor

\`\`\`python
file_descriptor(self)
\`\`\`
Possible values are \`1\` for stdout and \`2\` for stderr.

### read

\`\`\`python
read(self)
\`\`\`
Fetch the entire contents of the stream until EOF.
## StreamWriter


\`\`\`python
class StreamWriter(object)
\`\`\`

Provides an interface to buffer and write logs to a sandbox or container process stream (\`stdin\`).


### write

\`\`\`python
write(self, data)
\`\`\`
Write data to the stream but does not send it immediately.

This is non-blocking and queues the data to an internal buffer. Must be
used along with the \`drain()\` method, which flushes the buffer.

**Usage**

\`\`\`python fixture:sandbox
proc = sandbox.exec(
    "bash",
    "-c",
    "while read line; do echo $line; done",
)
proc.stdin.write(b"foo\\n")
proc.stdin.write(b"bar\\n")
proc.stdin.write_eof()
proc.stdin.drain()
\`\`\`

### write_eof

\`\`\`python
write_eof(self)
\`\`\`
Close the write end of the stream after the buffered data is drained.

If the process was blocked on input, it will become unblocked after
\`write_eof()\`. This method needs to be used along with the \`drain()\`
method, which flushes the EOF to the process.

### drain

\`\`\`python
drain(self)
\`\`\`
Flush the write buffer and send data to the running process.

This is a flow control method that blocks until data is sent. It returns
when it is appropriate to continue writing data to the stream.

**Usage**

\`\`\`python notest
writer.write(data)
writer.drain()
\`\`\`

Async usage:

\`\`\`python notest
writer.write(data)  # not a blocking operation
await writer.drain.aio()
\`\`\`
`,meta:{title:`io_streams`,description:`Retrieve logs from a stream (stdout or stderr).`}},{toc:m,rawContent:h,meta:g}=p,_=e(`<!> <!> <!> <p>Retrieve logs from a stream (<code>stdout</code> or <code>stderr</code>).</p> <p>As an asynchronous iterable, the object supports the <code>for</code> and <code>async for</code> statements. Just loop over the object to read in chunks.</p> <!> <!> <p>Possible values are <code>1</code> for stdout and <code>2</code> for stderr.</p> <!> <!> <p>Fetch the entire contents of the stream until EOF.</p> <!> <!> <p>Provides an interface to buffer and write logs to a sandbox or container process stream (<code>stdin</code>).</p> <!> <!> <p>Write data to the stream but does not send it immediately.</p> <p>This is non-blocking and queues the data to an internal buffer. Must be
used along with the <code>drain()</code> method, which flushes the buffer.</p> <p><strong>Usage</strong></p> <!> <!> <!> <p>Close the write end of the stream after the buffered data is drained.</p> <p>If the process was blocked on input, it will become unblocked after <code>write_eof()</code>. This method needs to be used along with the <code>drain()</code> method, which flushes the EOF to the process.</p> <!> <!> <p>Flush the write buffer and send data to the running process.</p> <p>This is a flow control method that blocks until data is sent. It returns
when it is appropriate to continue writing data to the stream.</p> <p><strong>Usage</strong></p> <!> <p>Async usage:</p> <!>`,1);function v(e,m){let h=r(m,[`children`,`$$slots`,`$$events`,`$$legacy`]);f(e,i(()=>h,()=>p,{children:(e,r)=>{var i=_(),f=a(i);u(f,{id:`io_streams`,children:(e,r)=>{s(),n(e,t(`io_streams`))},$$slots:{default:!0}});var p=o(f,2);c(p,{id:`streamreader`,children:(e,r)=>{s(),n(e,t(`StreamReader`))},$$slots:{default:!0}});var m=o(p,2);d(m,{code:`class%20StreamReader(typing.Generic)`,lang:`python`});var h=o(m,6);l(h,{id:`file_descriptor`,children:(e,r)=>{s(),n(e,t(`file_descriptor`))},$$slots:{default:!0}});var g=o(h,2);d(g,{code:`file_descriptor(self)`,lang:`python`});var v=o(g,4);l(v,{id:`read`,children:(e,r)=>{s(),n(e,t(`read`))},$$slots:{default:!0}});var y=o(v,2);d(y,{code:`read(self)`,lang:`python`});var b=o(y,4);c(b,{id:`streamwriter`,children:(e,r)=>{s(),n(e,t(`StreamWriter`))},$$slots:{default:!0}});var x=o(b,2);d(x,{code:`class%20StreamWriter(object)`,lang:`python`});var S=o(x,4);l(S,{id:`write`,children:(e,r)=>{s(),n(e,t(`write`))},$$slots:{default:!0}});var C=o(S,2);d(C,{code:`write(self%2C%20data)`,lang:`python`});var w=o(C,8);d(w,{code:`proc%20%3D%20sandbox.exec(%0A%20%20%20%20%22bash%22%2C%0A%20%20%20%20%22-c%22%2C%0A%20%20%20%20%22while%20read%20line%3B%20do%20echo%20%24line%3B%20done%22%2C%0A)%0Aproc.stdin.write(b%22foo%5Cn%22)%0Aproc.stdin.write(b%22bar%5Cn%22)%0Aproc.stdin.write_eof()%0Aproc.stdin.drain()`,lang:`python`});var T=o(w,2);l(T,{id:`write_eof`,children:(e,r)=>{s(),n(e,t(`write_eof`))},$$slots:{default:!0}});var E=o(T,2);d(E,{code:`write_eof(self)`,lang:`python`});var D=o(E,6);l(D,{id:`drain`,children:(e,r)=>{s(),n(e,t(`drain`))},$$slots:{default:!0}});var O=o(D,2);d(O,{code:`drain(self)`,lang:`python`});var k=o(O,8);d(k,{code:`writer.write(data)%0Awriter.drain()`,lang:`python`}),d(o(k,4),{code:`writer.write(data)%20%20%23%20not%20a%20blocking%20operation%0Aawait%20writer.drain.aio()`,lang:`python`}),n(e,i)},$$slots:{default:!0}}))}export{v as default,p as metadata};
//# sourceMappingURL=BaWk_nsR2.js.map
