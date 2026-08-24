(function(){try{var e=typeof window<`u`?window:typeof global<`u`?global:typeof globalThis<`u`?globalThis:typeof self<`u`?self:{};e.SENTRY_RELEASE={id:`f99fcf9f0a844cc9bd13fdc8e5782b84`};var t=new e.Error().stack;t&&(e._sentryDebugIds=e._sentryDebugIds||{},e._sentryDebugIds[t]=`eddfbbba-589b-4968-abdf-f85179f8c0be`,e._sentryDebugIdIdentifier=`sentry-dbid-eddfbbba-589b-4968-abdf-f85179f8c0be`)}catch{}})();import{St as e,Tt as t,bt as n,c as r,d as i,en as a,tn as o,wn as s}from"./F_ixKBiO.js";import"./B1sc9Zdx.js";import"./Bb2deiU3.js";import{a as c,i as l,o as u}from"./CPby7b1n.js";import{t as d}from"./BILrvr3I.js";import{t as f}from"./B4L_if842.js";import"./B6UiYoTw.js";var p={toc:[{depth:1,value:`container_process`,id:`container_process`,children:[{depth:2,value:`ContainerProcess`,id:`containerprocess`,children:[{depth:3,value:`stdout`,id:`stdout`},{depth:3,value:`stderr`,id:`stderr`},{depth:3,value:`stdin`,id:`stdin`},{depth:3,value:`returncode`,id:`returncode`},{depth:3,value:`poll`,id:`poll`},{depth:3,value:`wait`,id:`wait`}]}]}],rawContent:`# container_process

## ContainerProcess


\`\`\`python
class ContainerProcess(typing.Generic)
\`\`\`

Represents a running process in a container.

Container processes communicate via direct communication with
the Modal worker where the container is running.

\`\`\`python
__init__(self, process_id, task_id, client, command_router_client,
    stdout=StreamType.PIPE, stderr=StreamType.PIPE, exec_deadline=None,
    text=True, by_line=False)
\`\`\`


### stdout

\`\`\`python
stdout(self)
\`\`\`
StreamReader for the container process's stdout stream.

### stderr

\`\`\`python
stderr(self)
\`\`\`
StreamReader for the container process's stderr stream.

### stdin

\`\`\`python
stdin(self)
\`\`\`
StreamWriter for the container process's stdin stream.

### returncode

\`\`\`python
returncode(self)
\`\`\`


### poll

\`\`\`python
poll(self)
\`\`\`
Check if the container process has finished running.

Returns \`None\` if the process is still running, else returns the exit code.

### wait

\`\`\`python
wait(self)
\`\`\`
Wait for the container process to finish running. Returns the exit code.
`,meta:{title:`container_process`,description:`Represents a running process in a container.`}},{toc:m,rawContent:h,meta:g}=p,_=e(`<!> <!> <!> <p>Represents a running process in a container.</p> <p>Container processes communicate via direct communication with
the Modal worker where the container is running.</p> <!> <!> <!> <p>StreamReader for the container process’s stdout stream.</p> <!> <!> <p>StreamReader for the container process’s stderr stream.</p> <!> <!> <p>StreamWriter for the container process’s stdin stream.</p> <!> <!> <!> <!> <p>Check if the container process has finished running.</p> <p>Returns <code>None</code> if the process is still running, else returns the exit code.</p> <!> <!> <p>Wait for the container process to finish running. Returns the exit code.</p>`,1);function v(e,m){let h=r(m,[`children`,`$$slots`,`$$events`,`$$legacy`]);f(e,i(()=>h,()=>p,{children:(e,r)=>{var i=_(),f=a(i);u(f,{id:`container_process`,children:(e,r)=>{s(),n(e,t(`container_process`))},$$slots:{default:!0}});var p=o(f,2);c(p,{id:`containerprocess`,children:(e,r)=>{s(),n(e,t(`ContainerProcess`))},$$slots:{default:!0}});var m=o(p,2);d(m,{code:`class%20ContainerProcess(typing.Generic)`,lang:`python`});var h=o(m,6);d(h,{code:`__init__(self%2C%20process_id%2C%20task_id%2C%20client%2C%20command_router_client%2C%0A%20%20%20%20stdout%3DStreamType.PIPE%2C%20stderr%3DStreamType.PIPE%2C%20exec_deadline%3DNone%2C%0A%20%20%20%20text%3DTrue%2C%20by_line%3DFalse)`,lang:`python`});var g=o(h,2);l(g,{id:`stdout`,children:(e,r)=>{s(),n(e,t(`stdout`))},$$slots:{default:!0}});var v=o(g,2);d(v,{code:`stdout(self)`,lang:`python`});var y=o(v,4);l(y,{id:`stderr`,children:(e,r)=>{s(),n(e,t(`stderr`))},$$slots:{default:!0}});var b=o(y,2);d(b,{code:`stderr(self)`,lang:`python`});var x=o(b,4);l(x,{id:`stdin`,children:(e,r)=>{s(),n(e,t(`stdin`))},$$slots:{default:!0}});var S=o(x,2);d(S,{code:`stdin(self)`,lang:`python`});var C=o(S,4);l(C,{id:`returncode`,children:(e,r)=>{s(),n(e,t(`returncode`))},$$slots:{default:!0}});var w=o(C,2);d(w,{code:`returncode(self)`,lang:`python`});var T=o(w,2);l(T,{id:`poll`,children:(e,r)=>{s(),n(e,t(`poll`))},$$slots:{default:!0}});var E=o(T,2);d(E,{code:`poll(self)`,lang:`python`});var D=o(E,6);l(D,{id:`wait`,children:(e,r)=>{s(),n(e,t(`wait`))},$$slots:{default:!0}}),d(o(D,2),{code:`wait(self)`,lang:`python`}),s(2),n(e,i)},$$slots:{default:!0}}))}export{v as default,p as metadata};
//# sourceMappingURL=CGVAZYo32.js.map
