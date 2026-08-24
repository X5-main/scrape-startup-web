(function(){try{var e=typeof window<`u`?window:typeof global<`u`?global:typeof globalThis<`u`?globalThis:typeof self<`u`?self:{};e.SENTRY_RELEASE={id:`f99fcf9f0a844cc9bd13fdc8e5782b84`};var t=new e.Error().stack;t&&(e._sentryDebugIds=e._sentryDebugIds||{},e._sentryDebugIds[t]=`780e34c7-dfa5-45a9-8e65-b03ab4f71d52`,e._sentryDebugIdIdentifier=`sentry-dbid-780e34c7-dfa5-45a9-8e65-b03ab4f71d52`)}catch{}})();import{$t as e,St as t,Tn as n,Tt as r,bt as i,c as a,d as o,en as s,tn as c,wn as l}from"./F_ixKBiO.js";import"./B1sc9Zdx.js";import"./Bb2deiU3.js";import{a as u,o as d}from"./CPby7b1n.js";import{t as f}from"./JPsrybyr.js";import{t as p}from"./BILrvr3I.js";import{t as m}from"./B4L_if842.js";import{t as h}from"./DeWGVqas2.js";var g={description:`Enable low-latency, high-bandwidth (50+ Gbps) private networking between Modal containers for distributed workloads.`,toc:[{depth:1,value:`Cluster networking`,id:`cluster-networking`,children:[{depth:2,value:`Private networking`,id:`private-networking`},{depth:2,value:`Region boundaries`,id:`region-boundaries`},{depth:2,value:`Public network access to cluster networking`,id:`public-network-access-to-cluster-networking`}]}],rawContent:`# Cluster networking

i6pn (IPv6 private networking) is Modal's private container-to-container networking solution. It allows users to create clusters of Modal containers which can send network traffic to each other with low latency and high bandwidth (≥ 50Gbps).

Normally, \`modal.Function\` containers can initiate outbound network connections to the internet but they are not directly addressable by other containers. i6pn-enabled containers, on the other hand, can be directly connected to by other i6pn-enabled containers and this is a key enabler of Modal's Beta \`@modal.experimental.clustered\` functionality.

You can enable i6pn on any \`modal.Function\`:

\`\`\`python
@app.function(i6pn=True)
def hello_private_network():
    import socket

    i6pn_addr = socket.getaddrinfo("i6pn.modal.local", None, socket.AF_INET6)[0][4][0]
    print(i6pn_addr) # fdaa:5137:3ebf:a70:1b9d:3a11:71f2:5f0f
\`\`\`

In this snippet we see that the i6pn-enabled container is able to retrieve its own IPv6 address by
resolving \`i6pn.modal.local\`. For this Function container to discover the addresses of _other_ containers,
address sharing must be implemented using an auxiliary data structure, such as a shared \`modal.Dict\` or \`modal.Queue\`.

## Private networking

All i6pn network traffic is _Workspace private_.

![i6pn-diagram](https://modal-cdn.com/cdnbot/i6pn-1eksk4vuy_c4c4a0df.webp)

In the image above, Workspace A has subnet \`fdaa:1::/48\`, while Workspace B has subnet \`fdaa:2::/48\`.

You'll notice they share the first 16 bits. This is because the \`fdaa::/16\` prefix contains all of our private network IPv6 addresses, while each workspace is assigned a random 32-bit identifier when it is created. Together, these form the 48-bit subnet.

The upshot of this is that only containers in the same Workspace can see each other and send each other network packets. i6pn networking is secure by default.

## Region boundaries

Modal operates a [global fleet](/docs/guide/region-selection) and allows containers to run on multiple cloud providers and in many regions. i6pn networking is however region-scoped functionality, meaning that only i6pn-enabled containers in the same region can perform network communication.

Modal's i6pn-enabled primitives such as \`@modal.experimental.clustered\` automatically restrict container geographic placement and cloud placement to ensure inter-container connectivity.

## Public network access to cluster networking

For cluster networked containers that need to be publicly accessible, you need to expose ports with [modal.Tunnel](/docs/guide/tunnels) because i6pn addresses are not publicly exposed.

Consider having a container setup a Tunnel and act as the gateway to the private cluster networking.
`,meta:{title:`Cluster networking`,description:`Enable low-latency, high-bandwidth (50+ Gbps) private networking between Modal containers for distributed workloads.`}},{description:_,toc:v,rawContent:y,meta:b}=g,x=t(`<!> <p>i6pn (IPv6 private networking) is Modal’s private container-to-container networking solution. It allows users to create clusters of Modal containers which can send network traffic to each other with low latency and high bandwidth (≥ 50Gbps).</p> <p>Normally, <code>modal.Function</code> containers can initiate outbound network connections to the internet but they are not directly addressable by other containers. i6pn-enabled containers, on the other hand, can be directly connected to by other i6pn-enabled containers and this is a key enabler of Modal’s Beta <code>@modal.experimental.clustered</code> functionality.</p> <p>You can enable i6pn on any <code>modal.Function</code>:</p> <!> <p>In this snippet we see that the i6pn-enabled container is able to retrieve its own IPv6 address by
resolving <code>i6pn.modal.local</code>. For this Function container to discover the addresses of <em>other</em> containers,
address sharing must be implemented using an auxiliary data structure, such as a shared <code>modal.Dict</code> or <code>modal.Queue</code>.</p> <!> <p>All i6pn network traffic is <em>Workspace private</em>.</p> <p><!></p> <p>In the image above, Workspace A has subnet <code>fdaa:1::/48</code>, while Workspace B has subnet <code>fdaa:2::/48</code>.</p> <p>You’ll notice they share the first 16 bits. This is because the <code>fdaa::/16</code> prefix contains all of our private network IPv6 addresses, while each workspace is assigned a random 32-bit identifier when it is created. Together, these form the 48-bit subnet.</p> <p>The upshot of this is that only containers in the same Workspace can see each other and send each other network packets. i6pn networking is secure by default.</p> <!> <p>Modal operates a <!> and allows containers to run on multiple cloud providers and in many regions. i6pn networking is however region-scoped functionality, meaning that only i6pn-enabled containers in the same region can perform network communication.</p> <p>Modal’s i6pn-enabled primitives such as <code>@modal.experimental.clustered</code> automatically restrict container geographic placement and cloud placement to ensure inter-container connectivity.</p> <!> <p>For cluster networked containers that need to be publicly accessible, you need to expose ports with <!> because i6pn addresses are not publicly exposed.</p> <p>Consider having a container setup a Tunnel and act as the gateway to the private cluster networking.</p>`,1);function S(t,_){let v=a(_,[`children`,`$$slots`,`$$events`,`$$legacy`]);m(t,o(()=>v,()=>g,{children:(t,a)=>{var o=x(),m=s(o);d(m,{id:`cluster-networking`,children:(e,t)=>{l(),i(e,r(`Cluster networking`))},$$slots:{default:!0}});var g=c(m,8);p(g,{code:`%40app.function(i6pn%3DTrue)%0Adef%20hello_private_network()%3A%0A%20%20%20%20import%20socket%0A%0A%20%20%20%20i6pn_addr%20%3D%20socket.getaddrinfo(%22i6pn.modal.local%22%2C%20None%2C%20socket.AF_INET6)%5B0%5D%5B4%5D%5B0%5D%0A%20%20%20%20print(i6pn_addr)%20%23%20fdaa%3A5137%3A3ebf%3Aa70%3A1b9d%3A3a11%3A71f2%3A5f0f`,lang:`python`});var _=c(g,4);u(_,{id:`private-networking`,children:(e,t)=>{l(),i(e,r(`Private networking`))},$$slots:{default:!0}});var v=c(_,4);f(e(v),{src:`https://modal-cdn.com/cdnbot/i6pn-1eksk4vuy_c4c4a0df.webp`,alt:`i6pn-diagram`}),n(v);var y=c(v,8);u(y,{id:`region-boundaries`,children:(e,t)=>{l(),i(e,r(`Region boundaries`))},$$slots:{default:!0}});var b=c(y,2);h(c(e(b)),{href:`/docs/guide/region-selection`,children:(e,t)=>{l(),i(e,r(`global fleet`))},$$slots:{default:!0}}),l(),n(b);var S=c(b,4);u(S,{id:`public-network-access-to-cluster-networking`,children:(e,t)=>{l(),i(e,r(`Public network access to cluster networking`))},$$slots:{default:!0}});var C=c(S,2);h(c(e(C)),{href:`/docs/guide/tunnels`,children:(e,t)=>{l(),i(e,r(`modal.Tunnel`))},$$slots:{default:!0}}),l(),n(C),l(2),i(t,o)},$$slots:{default:!0}}))}export{S as default,g as metadata};
//# sourceMappingURL=BM4vNOY6.js.map
