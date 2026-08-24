(function(){try{var e=typeof window<`u`?window:typeof global<`u`?global:typeof globalThis<`u`?globalThis:typeof self<`u`?self:{};e.SENTRY_RELEASE={id:`f99fcf9f0a844cc9bd13fdc8e5782b84`};var t=new e.Error().stack;t&&(e._sentryDebugIds=e._sentryDebugIds||{},e._sentryDebugIds[t]=`a307fe1e-4703-4bb3-9f2e-d2ce85d5c067`,e._sentryDebugIdIdentifier=`sentry-dbid-a307fe1e-4703-4bb3-9f2e-d2ce85d5c067`)}catch{}})();import{$t as e,St as t,Tn as n,Tt as r,bt as i,c as a,d as o,en as s,tn as c,wn as l}from"./F_ixKBiO.js";import"./B1sc9Zdx.js";import"./Bb2deiU3.js";import{t as u}from"./DYSGKh1I.js";import{a as d,o as f}from"./CPby7b1n.js";import{t as p}from"./BILrvr3I.js";import{t as m}from"./B4L_if842.js";import{t as h}from"./DeWGVqas2.js";var g={description:`Securely connect with your private resources from Modal containers`,toc:[{depth:1,value:`Proxies`,id:`proxies`,children:[{depth:2,value:`Creating a Proxy`,id:`creating-a-proxy`},{depth:2,value:`Using a Proxy`,id:`using-a-proxy`},{depth:2,value:`Proxy performance`,id:`proxy-performance`},{depth:2,value:`Adding more IP addresses to a Proxy`,id:`adding-more-ip-addresses-to-a-proxy`},{depth:2,value:`Proxies and Sandboxes`,id:`proxies-and-sandboxes`}]}],rawContent:`# Proxies

<Callout variant="beta" />

You can securely connect with resources in your private network
using a Modal Proxy. Proxies are a secure tunnel between
Apps and exit nodes with static IPs. You can allow-list those static IPs
in your network firewall, making sure that only traffic originating from these
IP addresses is allowed into your network.

Proxies are unique and not shared between workspaces. All traffic
between your Apps and the Proxy server is encrypted using
[WireGuard](https://www.wireguard.com/).

Modal Proxies are built on top of [vprox](https://github.com/modal-labs/vprox),
a Modal open-source project used to create highly available proxy servers
using WireGuard.

## Creating a Proxy

<Callout variant="gated-feature">

Proxies are available on the <a href="/pricing">Team and Enterprise plans</a>. Visit <a href="/settings/plans">workspace settings</a> to upgrade.

</Callout>

You can create Proxies in your workspace [Settings](/settings) page.
Team Plan users can create one Proxy and Enterprise users three Proxies. Each Proxy
can have a maximum of five static IP addresses.

Please reach out to [support@modal.com](mailto:support@modal.com) if you need greater limits.

## Using a Proxy

After a Proxy is online, add it to a Modal Function with the argument
\`proxy=Proxy.from_name("<your-proxy>")\`. For example:

\`\`\`python
import modal
import subprocess

app = modal.App(image=modal.Image.debian_slim().apt_install("curl"))

@app.function(proxy=modal.Proxy.from_name("<your-proxy>"))
def my_ip():
    subprocess.run(["curl", "-s", "ifconfig.me"])

@app.local_entrypoint()
def main():
    my_ip.remote()
\`\`\`

All network traffic from your Function will now use the Proxy as a tunnel.

The program above will always print the same IP address independent
of where it runs in Modal's infrastructure. If that same program
were to run without a Proxy, it would print a different IP
address depending on where it runs.

## Proxy performance

All traffic that goes through a Proxy is encrypted by WireGuard. This adds
latency to your Function's networking. If you are experiencing networking issues
with Proxies related to performance, first add more IP addresses to your
Proxy (see [Adding more IP addresses to a Proxy](#adding-more-ip-addresses-to-a-proxy)).

## Adding more IP addresses to a Proxy

Proxies support up to five static IP addresses. Adding IP addresses improves
throughput linearly.

You can add an IP address to your workspace in [Settings](/settings) > Proxies.
Select the desired Proxy and add a new IP.

If a Proxy has multiple IPs, Modal will randomly pick one when running your Function.

## Proxies and Sandboxes

Proxies can also be used with [Sandboxes](/docs/guide/sandboxes). For example:

\`\`\`python notest
import modal

app = modal.App.lookup("sandbox-proxy", create_if_missing=True)
sb = modal.Sandbox.create(
    app=app,
    image=modal.Image.debian_slim().apt_install("curl"),
    proxy=modal.Proxy.from_name("<your-proxy>"))

process = sb.exec("curl", "-s", "https://ifconfig.me")
stdout = process.stdout.read()
print(stdout)

sb.terminate()
\`\`\`

Similarly to our Function implementation, this Sandbox program will
always print the same IP address.
`,meta:{title:`Proxies`,description:`Securely connect with your private resources from Modal containers`}},{description:_,toc:v,rawContent:y,meta:b}=g,x=t(`<p>Proxies are available on the <a href="/pricing">Team and Enterprise plans</a>. Visit <a href="/settings/plans">workspace settings</a> to upgrade.</p>`),S=t(`<!> <!> <p>You can securely connect with resources in your private network
using a Modal Proxy. Proxies are a secure tunnel between
Apps and exit nodes with static IPs. You can allow-list those static IPs
in your network firewall, making sure that only traffic originating from these
IP addresses is allowed into your network.</p> <p>Proxies are unique and not shared between workspaces. All traffic
between your Apps and the Proxy server is encrypted using <!>.</p> <p>Modal Proxies are built on top of <!>,
a Modal open-source project used to create highly available proxy servers
using WireGuard.</p> <!> <!> <p>You can create Proxies in your workspace <!> page.
Team Plan users can create one Proxy and Enterprise users three Proxies. Each Proxy
can have a maximum of five static IP addresses.</p> <p>Please reach out to <!> if you need greater limits.</p> <!> <p>After a Proxy is online, add it to a Modal Function with the argument <code>proxy=Proxy.from_name("&lt;your-proxy&gt;")</code>. For example:</p> <!> <p>All network traffic from your Function will now use the Proxy as a tunnel.</p> <p>The program above will always print the same IP address independent
of where it runs in Modal’s infrastructure. If that same program
were to run without a Proxy, it would print a different IP
address depending on where it runs.</p> <!> <p>All traffic that goes through a Proxy is encrypted by WireGuard. This adds
latency to your Function’s networking. If you are experiencing networking issues
with Proxies related to performance, first add more IP addresses to your
Proxy (see <!>).</p> <!> <p>Proxies support up to five static IP addresses. Adding IP addresses improves
throughput linearly.</p> <p>You can add an IP address to your workspace in <!> > Proxies.
Select the desired Proxy and add a new IP.</p> <p>If a Proxy has multiple IPs, Modal will randomly pick one when running your Function.</p> <!> <p>Proxies can also be used with <!>. For example:</p> <!> <p>Similarly to our Function implementation, this Sandbox program will
always print the same IP address.</p>`,1);function C(t,_){let v=a(_,[`children`,`$$slots`,`$$events`,`$$legacy`]);m(t,o(()=>v,()=>g,{children:(t,a)=>{var o=S(),m=s(o);f(m,{id:`proxies`,children:(e,t)=>{l(),i(e,r(`Proxies`))},$$slots:{default:!0}});var g=c(m,2);u(g,{variant:`beta`});var _=c(g,4);h(c(e(_)),{href:`https://www.wireguard.com/`,rel:`nofollow`,children:(e,t)=>{l(),i(e,r(`WireGuard`))},$$slots:{default:!0}}),l(),n(_);var v=c(_,2);h(c(e(v)),{href:`https://github.com/modal-labs/vprox`,rel:`nofollow`,children:(e,t)=>{l(),i(e,r(`vprox`))},$$slots:{default:!0}}),l(),n(v);var y=c(v,2);d(y,{id:`creating-a-proxy`,children:(e,t)=>{l(),i(e,r(`Creating a Proxy`))},$$slots:{default:!0}});var b=c(y,2);u(b,{variant:`gated-feature`,children:(e,t)=>{i(e,x())},$$slots:{default:!0}});var C=c(b,2);h(c(e(C)),{href:`/settings`,children:(e,t)=>{l(),i(e,r(`Settings`))},$$slots:{default:!0}}),l(),n(C);var w=c(C,2);h(c(e(w)),{href:`mailto:support@modal.com`,children:(e,t)=>{l(),i(e,r(`support@modal.com`))},$$slots:{default:!0}}),l(),n(w);var T=c(w,2);d(T,{id:`using-a-proxy`,children:(e,t)=>{l(),i(e,r(`Using a Proxy`))},$$slots:{default:!0}});var E=c(T,4);p(E,{code:`import%20modal%0Aimport%20subprocess%0A%0Aapp%20%3D%20modal.App(image%3Dmodal.Image.debian_slim().apt_install(%22curl%22))%0A%0A%40app.function(proxy%3Dmodal.Proxy.from_name(%22%3Cyour-proxy%3E%22))%0Adef%20my_ip()%3A%0A%20%20%20%20subprocess.run(%5B%22curl%22%2C%20%22-s%22%2C%20%22ifconfig.me%22%5D)%0A%0A%40app.local_entrypoint()%0Adef%20main()%3A%0A%20%20%20%20my_ip.remote()`,lang:`python`});var D=c(E,6);d(D,{id:`proxy-performance`,children:(e,t)=>{l(),i(e,r(`Proxy performance`))},$$slots:{default:!0}});var O=c(D,2);h(c(e(O)),{href:`#adding-more-ip-addresses-to-a-proxy`,children:(e,t)=>{l(),i(e,r(`Adding more IP addresses to a Proxy`))},$$slots:{default:!0}}),l(),n(O);var k=c(O,2);d(k,{id:`adding-more-ip-addresses-to-a-proxy`,children:(e,t)=>{l(),i(e,r(`Adding more IP addresses to a Proxy`))},$$slots:{default:!0}});var A=c(k,4);h(c(e(A)),{href:`/settings`,children:(e,t)=>{l(),i(e,r(`Settings`))},$$slots:{default:!0}}),l(),n(A);var j=c(A,4);d(j,{id:`proxies-and-sandboxes`,children:(e,t)=>{l(),i(e,r(`Proxies and Sandboxes`))},$$slots:{default:!0}});var M=c(j,2);h(c(e(M)),{href:`/docs/guide/sandboxes`,children:(e,t)=>{l(),i(e,r(`Sandboxes`))},$$slots:{default:!0}}),l(),n(M),p(c(M,2),{code:`import%20modal%0A%0Aapp%20%3D%20modal.App.lookup(%22sandbox-proxy%22%2C%20create_if_missing%3DTrue)%0Asb%20%3D%20modal.Sandbox.create(%0A%20%20%20%20app%3Dapp%2C%0A%20%20%20%20image%3Dmodal.Image.debian_slim().apt_install(%22curl%22)%2C%0A%20%20%20%20proxy%3Dmodal.Proxy.from_name(%22%3Cyour-proxy%3E%22))%0A%0Aprocess%20%3D%20sb.exec(%22curl%22%2C%20%22-s%22%2C%20%22https%3A%2F%2Fifconfig.me%22)%0Astdout%20%3D%20process.stdout.read()%0Aprint(stdout)%0A%0Asb.terminate()`,lang:`python`}),l(2),i(t,o)},$$slots:{default:!0}}))}export{C as default,g as metadata};
//# sourceMappingURL=BqZracHw2.js.map
