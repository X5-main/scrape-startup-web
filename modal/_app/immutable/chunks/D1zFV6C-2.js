(function(){try{var e=typeof window<`u`?window:typeof global<`u`?global:typeof globalThis<`u`?globalThis:typeof self<`u`?self:{};e.SENTRY_RELEASE={id:`f99fcf9f0a844cc9bd13fdc8e5782b84`};var t=new e.Error().stack;t&&(e._sentryDebugIds=e._sentryDebugIds||{},e._sentryDebugIds[t]=`983d4e7a-66dd-405f-bc23-39f2cc89b52d`,e._sentryDebugIdIdentifier=`sentry-dbid-983d4e7a-66dd-405f-bc23-39f2cc89b52d`)}catch{}})();import{$t as e,St as t,Tn as n,Tt as r,bt as i,c as a,d as o,en as s,tn as c,wn as l}from"./F_ixKBiO.js";import"./B1sc9Zdx.js";import"./Bb2deiU3.js";import{a as u,i as d,o as f}from"./CPby7b1n.js";import{t as p}from"./BILrvr3I.js";import{t as m}from"./B4L_if842.js";import{t as h}from"./DeWGVqas2.js";var g={description:`Request specific CPU cores and memory for Modal containers. Configure resource limits for compute-intensive workloads.`,crossLinks:[{text:`Sandbox pricing and resources`,href:`/docs/guide/sandbox-resources`}],toc:[{depth:1,value:`Configuring CPU, memory, and disk`,id:`configuring-cpu-memory-and-disk`,children:[{depth:2,value:`CPU cores`,id:`cpu-cores`},{depth:2,value:`Memory`,id:`memory`},{depth:2,value:`How much can I request?`,id:`how-much-can-i-request`},{depth:2,value:`Billing`,id:`billing`},{depth:2,value:`Resource limits`,id:`resource-limits`,children:[{depth:3,value:`CPU limits`,id:`cpu-limits`},{depth:3,value:`Memory limits`,id:`memory-limits`},{depth:3,value:`Disk limits`,id:`disk-limits`}]}]}],rawContent:`# Configuring CPU, memory, and disk

Each Modal Function or Sandbox container has a default request of 0.125 CPU cores and 128 MiB of memory.
Containers can exceed this minimum if the worker has available CPU or memory.
You can also guarantee access to more resources by requesting larger values, [similarly to Kubernetes](https://kubernetes.io/docs/concepts/configuration/manage-resources-containers/).

This guide covers resource configuration for both [Functions](/docs/guide/apps#apps-functions-and-entrypoints)
and [Sandboxes](/docs/guide/sandboxes). For Sandbox-specific guidance on pricing and
cost optimization, see [Sandbox pricing and resources](/docs/guide/sandbox-resources).

## CPU cores

If you have code that must run on a larger number of cores, you can
request that using the \`cpu\` argument. This allows you to specify a
floating-point number of CPU cores:

\`\`\`python
import modal

app = modal.App()

@app.function(cpu=8.0)
def my_function():
    # code here will have access to at least 8.0 cores
    ...
\`\`\`

Note that this value corresponds to physical cores, not vCPUs.

Modal also will set several environment variables that control multi-threading
behavior in linear algebra and inference libraries (e.g.,
\`OPENBLAS_NUM_THREADS\`, \`OMP_NUM_THREADS\`, \`MKL_NUM_THREADS\`,
\`ORT_INTRA_OP_NUM_THREADS\`) based on your CPU request.

## Memory

If you have code that needs more guaranteed memory, you can request it using the
\`memory\` argument. This expects an integer number of megabytes:

\`\`\`python
import modal

app = modal.App()

@app.function(memory=32768)
def my_function():
    # code here will have access to at least 32 GiB of RAM
    ...
\`\`\`

## How much can I request?

For both CPU and memory, a maximum is enforced at Function or Sandbox creation time to
ensure your containers can be scheduled for execution. Requests exceeding the
maximum will be rejected with an
[\`InvalidError\`](/docs/sdk/py/latest/exception#invaliderror).

## Billing

For CPU and memory, you'll be charged based on whichever is higher: your request or actual usage.

Disk requests are billed by increasing the memory request at a 20:1 ratio. For example, requesting 500 GiB of disk will increase the memory request to 25 GiB, if it is not already set higher.

## Resource limits

### CPU limits

Modal containers have a default soft CPU limit that is set at 16 physical cores above the CPU request.
Given that the default CPU request is 0.125 cores, the default soft CPU limit is 16.125 cores.
Above this limit, the host will begin to throttle the CPU usage of the container.

You can alternatively set the CPU limit explicitly:

\`\`\`python
cpu_request = 1.0
cpu_limit = 4.0
@app.function(cpu=(cpu_request, cpu_limit))
def f():
    ...
\`\`\`

### Memory limits

Modal containers can have a hard memory limit which will 'Out of Memory' (OOM) kill
containers which attempt to exceed the limit. This functionality is useful when a process
has a serious memory leak. You can set the limit and have the container killed to avoid paying
for the leaked GBs of memory.

Specify this limit using the \`memory\` parameter on [\`@app.function()\`](/docs/sdk/py/latest/App#function) or [\`Sandbox.create()\`](/docs/sdk/py/latest/Sandbox#create):

\`\`\`python
mem_request = 1024
mem_limit = 2048
@app.function(
    memory=(mem_request, mem_limit),
)
def f():
    ...
\`\`\`

### Disk limits

Running Modal containers have access to many GBs of SSD disk, but the amount
of writes is limited by:

1. The size of the underlying worker's SSD disk capacity
2. A per-container disk quota that defaults to 512 GiB.

Hitting either limit will cause the container's disk writes to be rejected, which
typically manifests as an \`OSError\`.

Increased disk sizes can be requested with the \`ephemeral_disk\` parameter on [\`@app.function()\`](/docs/sdk/py/latest/App#function). The maximum
disk size is 3.0 TiB (3,145,728 MiB). Larger disks are intended to be used for [dataset processing](/docs/guide/dataset-ingestion).
`,meta:{title:`Configuring CPU, memory, and disk`,description:`Request specific CPU cores and memory for Modal containers. Configure resource limits for compute-intensive workloads.`}},{description:_,crossLinks:v,toc:y,rawContent:b,meta:x}=g,S=t(`<code>InvalidError</code>`),C=t(`<code>@app.function()</code>`),w=t(`<code>Sandbox.create()</code>`),T=t(`<code>@app.function()</code>`),E=t(`<!> <p>Each Modal Function or Sandbox container has a default request of 0.125 CPU cores and 128 MiB of memory.
Containers can exceed this minimum if the worker has available CPU or memory.
You can also guarantee access to more resources by requesting larger values, <!>.</p> <p>This guide covers resource configuration for both <!> and <!>. For Sandbox-specific guidance on pricing and
cost optimization, see <!>.</p> <!> <p>If you have code that must run on a larger number of cores, you can
request that using the <code>cpu</code> argument. This allows you to specify a
floating-point number of CPU cores:</p> <!> <p>Note that this value corresponds to physical cores, not vCPUs.</p> <p>Modal also will set several environment variables that control multi-threading
behavior in linear algebra and inference libraries (e.g., <code>OPENBLAS_NUM_THREADS</code>, <code>OMP_NUM_THREADS</code>, <code>MKL_NUM_THREADS</code>, <code>ORT_INTRA_OP_NUM_THREADS</code>) based on your CPU request.</p> <!> <p>If you have code that needs more guaranteed memory, you can request it using the <code>memory</code> argument. This expects an integer number of megabytes:</p> <!> <!> <p>For both CPU and memory, a maximum is enforced at Function or Sandbox creation time to
ensure your containers can be scheduled for execution. Requests exceeding the
maximum will be rejected with an <!>.</p> <!> <p>For CPU and memory, you’ll be charged based on whichever is higher: your request or actual usage.</p> <p>Disk requests are billed by increasing the memory request at a 20:1 ratio. For example, requesting 500 GiB of disk will increase the memory request to 25 GiB, if it is not already set higher.</p> <!> <!> <p>Modal containers have a default soft CPU limit that is set at 16 physical cores above the CPU request.
Given that the default CPU request is 0.125 cores, the default soft CPU limit is 16.125 cores.
Above this limit, the host will begin to throttle the CPU usage of the container.</p> <p>You can alternatively set the CPU limit explicitly:</p> <!> <!> <p>Modal containers can have a hard memory limit which will ‘Out of Memory’ (OOM) kill
containers which attempt to exceed the limit. This functionality is useful when a process
has a serious memory leak. You can set the limit and have the container killed to avoid paying
for the leaked GBs of memory.</p> <p>Specify this limit using the <code>memory</code> parameter on <!> or <!>:</p> <!> <!> <p>Running Modal containers have access to many GBs of SSD disk, but the amount
of writes is limited by:</p> <ol><li>The size of the underlying worker’s SSD disk capacity</li> <li>A per-container disk quota that defaults to 512 GiB.</li></ol> <p>Hitting either limit will cause the container’s disk writes to be rejected, which
typically manifests as an <code>OSError</code>.</p> <p>Increased disk sizes can be requested with the <code>ephemeral_disk</code> parameter on <!>. The maximum
disk size is 3.0 TiB (3,145,728 MiB). Larger disks are intended to be used for <!>.</p>`,1);function D(t,_){let v=a(_,[`children`,`$$slots`,`$$events`,`$$legacy`]);m(t,o(()=>v,()=>g,{children:(t,a)=>{var o=E(),m=s(o);f(m,{id:`configuring-cpu-memory-and-disk`,children:(e,t)=>{l(),i(e,r(`Configuring CPU, memory, and disk`))},$$slots:{default:!0}});var g=c(m,2);h(c(e(g)),{href:`https://kubernetes.io/docs/concepts/configuration/manage-resources-containers/`,rel:`nofollow`,children:(e,t)=>{l(),i(e,r(`similarly to Kubernetes`))},$$slots:{default:!0}}),l(),n(g);var _=c(g,2),v=c(e(_));h(v,{href:`/docs/guide/apps#apps-functions-and-entrypoints`,children:(e,t)=>{l(),i(e,r(`Functions`))},$$slots:{default:!0}});var y=c(v,2);h(y,{href:`/docs/guide/sandboxes`,children:(e,t)=>{l(),i(e,r(`Sandboxes`))},$$slots:{default:!0}}),h(c(y,2),{href:`/docs/guide/sandbox-resources`,children:(e,t)=>{l(),i(e,r(`Sandbox pricing and resources`))},$$slots:{default:!0}}),l(),n(_);var b=c(_,2);u(b,{id:`cpu-cores`,children:(e,t)=>{l(),i(e,r(`CPU cores`))},$$slots:{default:!0}});var x=c(b,4);p(x,{code:`import%20modal%0A%0Aapp%20%3D%20modal.App()%0A%0A%40app.function(cpu%3D8.0)%0Adef%20my_function()%3A%0A%20%20%20%20%23%20code%20here%20will%20have%20access%20to%20at%20least%208.0%20cores%0A%20%20%20%20...`,lang:`python`});var D=c(x,6);u(D,{id:`memory`,children:(e,t)=>{l(),i(e,r(`Memory`))},$$slots:{default:!0}});var O=c(D,4);p(O,{code:`import%20modal%0A%0Aapp%20%3D%20modal.App()%0A%0A%40app.function(memory%3D32768)%0Adef%20my_function()%3A%0A%20%20%20%20%23%20code%20here%20will%20have%20access%20to%20at%20least%2032%20GiB%20of%20RAM%0A%20%20%20%20...`,lang:`python`});var k=c(O,2);u(k,{id:`how-much-can-i-request`,children:(e,t)=>{l(),i(e,r(`How much can I request?`))},$$slots:{default:!0}});var A=c(k,2);h(c(e(A)),{href:`/docs/sdk/py/latest/exception#invaliderror`,children:(e,t)=>{i(e,S())},$$slots:{default:!0}}),l(),n(A);var j=c(A,2);u(j,{id:`billing`,children:(e,t)=>{l(),i(e,r(`Billing`))},$$slots:{default:!0}});var M=c(j,6);u(M,{id:`resource-limits`,children:(e,t)=>{l(),i(e,r(`Resource limits`))},$$slots:{default:!0}});var N=c(M,2);d(N,{id:`cpu-limits`,children:(e,t)=>{l(),i(e,r(`CPU limits`))},$$slots:{default:!0}});var P=c(N,6);p(P,{code:`cpu_request%20%3D%201.0%0Acpu_limit%20%3D%204.0%0A%40app.function(cpu%3D(cpu_request%2C%20cpu_limit))%0Adef%20f()%3A%0A%20%20%20%20...`,lang:`python`});var F=c(P,2);d(F,{id:`memory-limits`,children:(e,t)=>{l(),i(e,r(`Memory limits`))},$$slots:{default:!0}});var I=c(F,4),L=c(e(I),3);h(L,{href:`/docs/sdk/py/latest/App#function`,children:(e,t)=>{i(e,C())},$$slots:{default:!0}}),h(c(L,2),{href:`/docs/sdk/py/latest/Sandbox#create`,children:(e,t)=>{i(e,w())},$$slots:{default:!0}}),l(),n(I);var R=c(I,2);p(R,{code:`mem_request%20%3D%201024%0Amem_limit%20%3D%202048%0A%40app.function(%0A%20%20%20%20memory%3D(mem_request%2C%20mem_limit)%2C%0A)%0Adef%20f()%3A%0A%20%20%20%20...`,lang:`python`});var z=c(R,2);d(z,{id:`disk-limits`,children:(e,t)=>{l(),i(e,r(`Disk limits`))},$$slots:{default:!0}});var B=c(z,8),V=c(e(B),3);h(V,{href:`/docs/sdk/py/latest/App#function`,children:(e,t)=>{i(e,T())},$$slots:{default:!0}}),h(c(V,2),{href:`/docs/guide/dataset-ingestion`,children:(e,t)=>{l(),i(e,r(`dataset processing`))},$$slots:{default:!0}}),l(),n(B),i(t,o)},$$slots:{default:!0}}))}export{D as default,g as metadata};
//# sourceMappingURL=D1zFV6C-2.js.map
