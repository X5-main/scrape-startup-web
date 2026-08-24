(function(){try{var e=typeof window<`u`?window:typeof global<`u`?global:typeof globalThis<`u`?globalThis:typeof self<`u`?self:{};e.SENTRY_RELEASE={id:`f99fcf9f0a844cc9bd13fdc8e5782b84`};var t=new e.Error().stack;t&&(e._sentryDebugIds=e._sentryDebugIds||{},e._sentryDebugIds[t]=`0cc5914b-10cc-4ffa-aa62-448254534456`,e._sentryDebugIdIdentifier=`sentry-dbid-0cc5914b-10cc-4ffa-aa62-448254534456`)}catch{}})();import{$t as e,St as t,Tn as n,Tt as r,bt as i,c as a,d as o,en as s,tn as c,wn as l}from"./F_ixKBiO.js";import"./B1sc9Zdx.js";import"./Bb2deiU3.js";import{t as u}from"./DeWGVqas2.js";import{t as d}from"./CdZDxCfO2.js";var f={title:`How to deploy LiveKit Agents on Modal`,description:`Learn how to deploy LiveKit agents on Modal, a serverless cloud platform that simplifies running containerized workloads.`,date:`2025-02-24T12:00:00.000Z`,length:`5 minute read`,category:`Article`,subcategory:`Frameworks and Tools`,published:!0,layout:`blog`,toc:[{depth:2,value:`LiveKit Agents`,id:`livekit-agents`},{depth:2,value:`LiveKit Agent Lifecycle`,id:`livekit-agent-lifecycle`},{depth:2,value:`Why Deploy LiveKit Agents on Modal?`,id:`why-deploy-livekit-agents-on-modal`,children:[{depth:3,value:`✅ No Infrastructure Management`,id:`-no-infrastructure-management`},{depth:3,value:`✅ Automatic Scaling`,id:`-automatic-scaling`},{depth:3,value:`✅ Optimized GPU Execution`,id:`-optimized-gpu-execution`}]},{depth:2,value:`Conclusion`,id:`conclusion`}],rawContent:`_NOTE: We are currently updating our LiveKit example so it's up to date with the latest release. Check back soon._

If you are looking to build a real-time voice or video application, you can't
just use HTTP. It's too slow. Traditional HTTP is request-response based, creating overhead for
each interaction. Establishing new TCP connections and handshaking also creates
additional latency.

Instead, you should be using technologies like WebRTC. [WebRTC](https://webrtc.org) is purpose-built
for peer-to-peer audio/video streaming and data sharing without requiring
plugins or additional software.

But WebRTC is complex. It's not easy to get right. You often have to write thousands of
lines of boilerplate code to handle connections, signalling, media
capture, peer connections, ICE candidates, STUN/TURN servers etc.

That's why [LiveKit](https://livekit.com) has become so popular. LiveKit is an open-source library that abstracts away
the complexity of working with WebRTC. Rather than having to deal with all the
boilerplate yourself, you just use LiveKit's SDK.

## LiveKit Agents

Recently, LiveKit has launched a framework for building real-time voice
assistants, called [LiveKit Agents](https://docs.livekit.io/agents/).

It allows you to define an AI agent that will join as a participant in a LiveKit
room.

## LiveKit Agent Lifecycle

Here's a high-level overview of the agent lifecycle:

- **Worker registration**: Your agent connects to the LiveKit server, registering as a "worker" via a WebSocket.

- **Agent dispatch**: When a user connects to a room, the LiveKit server selects an available worker, which then instantiates your program and joins the room. A worker can run multiple agent instances in separate processes.

- **Your program**: Here, you utilize the LiveKit Python SDK and can leverage plugins for processing voice and video data.

- **Room close**: The room closes automatically when the last non-agent
  participant leaves, and then disconnects remaining agents.

## Why Deploy LiveKit Agents on Modal?

You can also deploy LiveKit Agents on [Render](https://render.com),
[Kubernetes](https://kubernetes.io), and other cloud providers, but we think
that [Modal](https://modal.com) is the best option. Modal is a serverless cloud
platform and Python library. With Modal, you can write a Python function, add a
Modal decorator, and deploy your application in a container in the cloud in
seconds.

### ✅ **No Infrastructure Management**

Modal removes the complexity of managing Kubernetes clusters or provisioning cloud instances. Your LiveKit agents run in a fully managed environment with zero operational overhead.

### ✅ **Automatic Scaling**

With Modal, you can scale your LiveKit workloads dynamically based on demand. Modal's serverless execution model ensures you only pay for what you use.

### ✅ **Optimized GPU Execution**

If your agent needs to run deep learning models, Modal supports running your workloads on GPUs like **NVIDIA H100s**.

## Conclusion

LiveKit Agents allows developers to build real-time voice assistants with
minimal effort.

And the best way to deploy is with Modal!
`,meta:{description:`Learn how to deploy LiveKit agents on Modal, a serverless cloud platform that simplifies running containerized workloads.`}},{title:p,description:m,date:h,length:g,category:_,subcategory:v,published:y,layout:b,toc:x,rawContent:S,meta:C}=f,w=t(`<p><em>NOTE: We are currently updating our LiveKit example so it’s up to date with the latest release. Check back soon.</em></p> <p>If you are looking to build a real-time voice or video application, you can’t
just use HTTP. It’s too slow. Traditional HTTP is request-response based, creating overhead for
each interaction. Establishing new TCP connections and handshaking also creates
additional latency.</p> <p>Instead, you should be using technologies like WebRTC. <!> is purpose-built
for peer-to-peer audio/video streaming and data sharing without requiring
plugins or additional software.</p> <p>But WebRTC is complex. It’s not easy to get right. You often have to write thousands of
lines of boilerplate code to handle connections, signalling, media
capture, peer connections, ICE candidates, STUN/TURN servers etc.</p> <p>That’s why <!> has become so popular. LiveKit is an open-source library that abstracts away
the complexity of working with WebRTC. Rather than having to deal with all the
boilerplate yourself, you just use LiveKit’s SDK.</p> <h2 id="livekit-agents">LiveKit Agents</h2> <p>Recently, LiveKit has launched a framework for building real-time voice
assistants, called <!>.</p> <p>It allows you to define an AI agent that will join as a participant in a LiveKit
room.</p> <h2 id="livekit-agent-lifecycle">LiveKit Agent Lifecycle</h2> <p>Here’s a high-level overview of the agent lifecycle:</p> <ul><li><p><strong>Worker registration</strong>: Your agent connects to the LiveKit server, registering as a “worker” via a WebSocket.</p></li> <li><p><strong>Agent dispatch</strong>: When a user connects to a room, the LiveKit server selects an available worker, which then instantiates your program and joins the room. A worker can run multiple agent instances in separate processes.</p></li> <li><p><strong>Your program</strong>: Here, you utilize the LiveKit Python SDK and can leverage plugins for processing voice and video data.</p></li> <li><p><strong>Room close</strong>: The room closes automatically when the last non-agent
participant leaves, and then disconnects remaining agents.</p></li></ul> <h2 id="why-deploy-livekit-agents-on-modal">Why Deploy LiveKit Agents on Modal?</h2> <p>You can also deploy LiveKit Agents on <!>, <!>, and other cloud providers, but we think
that <!> is the best option. Modal is a serverless cloud
platform and Python library. With Modal, you can write a Python function, add a
Modal decorator, and deploy your application in a container in the cloud in
seconds.</p> <h3 id="-no-infrastructure-management">✅ <strong>No Infrastructure Management</strong></h3> <p>Modal removes the complexity of managing Kubernetes clusters or provisioning cloud instances. Your LiveKit agents run in a fully managed environment with zero operational overhead.</p> <h3 id="-automatic-scaling">✅ <strong>Automatic Scaling</strong></h3> <p>With Modal, you can scale your LiveKit workloads dynamically based on demand. Modal’s serverless execution model ensures you only pay for what you use.</p> <h3 id="-optimized-gpu-execution">✅ <strong>Optimized GPU Execution</strong></h3> <p>If your agent needs to run deep learning models, Modal supports running your workloads on GPUs like <strong>NVIDIA H100s</strong>.</p> <h2 id="conclusion">Conclusion</h2> <p>LiveKit Agents allows developers to build real-time voice assistants with
minimal effort.</p> <p>And the best way to deploy is with Modal!</p>`,1);function T(t,p){let m=a(p,[`children`,`$$slots`,`$$events`,`$$legacy`]);d(t,o(()=>m,()=>f,{children:(t,a)=>{var o=w(),d=c(s(o),4);u(c(e(d)),{href:`https://webrtc.org`,rel:`nofollow`,children:(e,t)=>{l(),i(e,r(`WebRTC`))},$$slots:{default:!0}}),l(),n(d);var f=c(d,4);u(c(e(f)),{href:`https://livekit.com`,rel:`nofollow`,children:(e,t)=>{l(),i(e,r(`LiveKit`))},$$slots:{default:!0}}),l(),n(f);var p=c(f,4);u(c(e(p)),{href:`https://docs.livekit.io/agents/`,rel:`nofollow`,children:(e,t)=>{l(),i(e,r(`LiveKit Agents`))},$$slots:{default:!0}}),l(),n(p);var m=c(p,12),h=c(e(m));u(h,{href:`https://render.com`,rel:`nofollow`,children:(e,t)=>{l(),i(e,r(`Render`))},$$slots:{default:!0}});var g=c(h,2);u(g,{href:`https://kubernetes.io`,rel:`nofollow`,children:(e,t)=>{l(),i(e,r(`Kubernetes`))},$$slots:{default:!0}}),u(c(g,2),{href:`https://modal.com`,rel:`nofollow`,children:(e,t)=>{l(),i(e,r(`Modal`))},$$slots:{default:!0}}),l(),n(m),l(18),i(t,o)},$$slots:{default:!0}}))}export{T as default,f as metadata};
//# sourceMappingURL=BPAqnfyD.js.map
