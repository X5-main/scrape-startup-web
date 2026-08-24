(function(){try{var e=typeof window<`u`?window:typeof global<`u`?global:typeof globalThis<`u`?globalThis:typeof self<`u`?self:{};e.SENTRY_RELEASE={id:`f99fcf9f0a844cc9bd13fdc8e5782b84`};var t=new e.Error().stack;t&&(e._sentryDebugIds=e._sentryDebugIds||{},e._sentryDebugIds[t]=`af62d739-e84b-410d-b78a-c61d7ccf5124`,e._sentryDebugIdIdentifier=`sentry-dbid-af62d739-e84b-410d-b78a-c61d7ccf5124`)}catch{}})();import{$t as e,St as t,Tn as n,Tt as r,bt as i,c as ee,d as a,en as te,tn as o,wn as s}from"./F_ixKBiO.js";import"./B1sc9Zdx.js";import"./Bb2deiU3.js";import{t as c}from"./JPsrybyr.js";import{t as l}from"./BILrvr3I.js";import{t as u}from"./DeWGVqas2.js";import{t as d}from"./CdZDxCfO2.js";var f={title:`WireGuard at Modal: Static IPs for serverless containers`,description:`Now your Modal containers around the world can have static outbound IPs. Featuring WireGuard, policy-based routing, and NAT.`,authors:[{name:`Eric Zhang`,avatarUrl:`https://modal-cdn.com/eric-zhang.jpg`,jobTitle:`Founding Engineer`,twitterHandle:`ekzhang1`}],date:`2024-12-02T12:00:00.000Z`,length:`15 minute read`,category:`Engineering`,published:!0,layout:`blog`,toc:[{depth:2,value:`Scenario`,id:`scenario`},{depth:2,value:`Okay but I want to access my database from Modal`,id:`okay-but-i-want-to-access-my-database-from-modal`},{depth:2,value:`Enter WireGuard`,id:`enter-wireguard`},{depth:2,value:`Policy-based routing on container traffic`,id:`policy-based-routing-on-container-traffic`},{depth:2,value:`So you have a proxy server running for every IP?`,id:`so-you-have-a-proxy-server-running-for-every-ip`,children:[{depth:3,value:`Juggling IPs between servers`,id:`juggling-ips-between-servers`},{depth:3,value:`What is rp_filter anyway?`,id:`what-is-rp_filter-anyway`}]},{depth:2,value:`Using vprox`,id:`using-vprox`}],rawContent:`At Modal, we built a high-availability, Go-based VPN proxy called _vprox_.

This is a deployment of [WireGuard](https://www.wireguard.com/), so it operates
on Layer 3 (IP) of the network stack and allows us to funnel outbound traffic
from containers around the world through static IPv4 addresses. In the event of
a single-node failure, its static IPs are associated with other proxy nodes, and
containers reconnect within seconds.

![Map of Modal containers in different places funneling through a static IP proxy with WireGuard tunnels](https://modal-cdn.com/vprox-blog-post/vprox-1.svg)

This blog post is about the guts of our network infrastructure, which powers
[Static IP Proxies](/docs/guide/proxy-ips).

## Scenario

The year is 2024, and you are deciding on a serverless cloud platform. You
stumble upon Modal. Run \`pip install modal\`, write a short Python function, and
\`modal deploy\` it. Amazing, now you’ve got a cron job and API endpoint in the
cloud, within seconds.

\`\`\`python
import modal

app = modal.App()


@app.function(gpu="A100", schedule=modal.Period(days=1))
def my_modal_function():
    print("Hello world!")


@app.function()
@modal.web_endpoint()
def my_web_endpoint():
    return {"some": "json data"}
\`\`\`

Modal functions run on hardware around the world, in
[dozens of regions](/blog/region-selection-launch) across multiple cloud
providers. This is how we optimize the prices on your compute and scale
dynamically to meet demand. It’s all to make developers happy, since now you
don’t have to think about this stuff. (We get it, we’re infrastructure
engineers.)

But now let’s say you want to connect your serverless function to your MongoDB
cloud database, and it requires a specific IP access list. Uh oh…

<center>
<img
src="https://modal-cdn.com/cdnbot/tmpr5_wsi7u_2639b00c.webp"
alt="Edit IP Access List Entry"
width="600">
</center>

Usually, with a traditional provider you’d deploy some VMs and assign them a
static IP address or two, then distribute them across your machines and add
those to your access list. So now your application runs on cloud hosts at some
particular IPs, like \`20.21.20.21\`. Only these machines can access your MongoDB
database, and no one else can around the world.

But if you’re running a serverless computing workload, which can not only run in
any data center around the world, but also scale up and down… you won’t know
what IP address your code is running on! So that access list would have
thousands of entries and will be constantly changing, which really isn’t going
to cut it.

Plus, Modal has an isolated container runtime that lets us share each host’s CPU
and memory between workloads. If a host has one IP, your container and
another customer’s container on that host would have the same IP, so that
bypasses the security of your access list.

## Okay but I want to access my database from Modal

So you need a static outbound IP address. Is that possible? Let’s break it down.
IP addresses act as identifiers for sending and receiving internet data. When
two different containers communicate with a web service like Google, each has a
unique source IP. This allows Google’s server to reply directly to the correct
container.

![Two containers, both sending data to a server, with different IPs](https://modal-cdn.com/vprox-blog-post/vprox-2.svg)

In this standard setup, the outbound IP address is tightly coupled to the
container. How can you decouple static IP addresses from the actual compute
resources? There’s a solution for this: **You use a proxy.**

We started by adding [SOCKS5](https://en.wikipedia.org/wiki/SOCKS) proxies to
Modal. SOCKS5 is an unsung hero of the Internet proxy world; it’s a technology
from 1996 ([RFC 1928](https://datatracker.ietf.org/doc/html/rfc1928)) that lets
you send a request _through_ another computer. SOCKS5 is secretly built into a
lot of software like OpenSSH, if you pass in the obscure \`-D\` flag that enables
the feature. But SOCKS5 doesn’t work out-of-the-box. You need to edit your
application to use an esoteric network shim.

If you wanted containers running your function to use a SOCKS5-based Modal
Proxy, we would define one for your workspace. Once the Proxy object is created,
you can use it like so:

\`\`\`python
import socket

import psycopg2
import socks

@app.function(
    proxy=modal.Proxy.from_name("postgres-prod"),
    secret=modal.Secret.from_name("postgres-prod-credentials"),
)
def get_user_count() -> int:
    # SOCKS5 Proxy object is configured to listen on localhost:13432.
    socks.set_default_proxy(socks.SOCKS5, "localhost", 13432)

    # Patch the standard library socket class with the SOCKS proxy socket.
    socket.socket = socks.socksocket

    connection = psycopg2.connect(
        dbname=os.getenv("DB_NAME"),
        user=os.getenv("DB_USER"),
        password=os.getenv("DB_PASSWORD"),
        host=os.getenv("DB_HOST"),
        port=os.getenv("DB_PORT"),
    )
    cursor = connection.cursor()

    cursor.execute("SELECT COUNT(*) FROM users;")
    user_count: int = cursor.fetchone()[0]
    return user_count
\`\`\`

Now other functions can call \`get_user_count()\` remotely as a serverless
invocation. The proxy is only spun up within the \`get_user_count()\` function.

\`\`\`python
@app.function(schedule=modal.Cron("2 0 * * *"))  # runs at 2 AM
def daily_schedule() -> None:
    num_users = get_user_count.remote()
    print(f"you currently have {num_users} users, posting to Slack...")
    # ...
\`\`\`

Slick! But this is brittle. Replacing the standard library’s \`socket.socket\`
object doesn’t work for libraries that don’t use \`socket\` directly. And many
common libraries don’t, such as asyncpg, datadog, aiohttp, httpx, or grpcio.

The broader issue is that the API is not obvious. It passes on the complexity to
the user, who needs to figure out how to wire up the SOCKS5 proxy to their
libraries. Modal is a cloud provider, and our philosophy on developer experience
is that things “just work” — we should implement features that are correct and
efficient by design.

So we stepped down a layer. Since we own the entire runtime, how can we
configure networking so that _all outbound Internet_ _access_ goes through that
IP? You should be able to just send a simple request to
[ifconfig.me](https://ifconfig.me) and get back your proxy’s IP, for instance.

## Enter WireGuard

At Layer 3, the Internet Protocol, all traffic looks the same—whether it’s
Wikipedia, YouTube, or MongoDB. It’s just MTU-sized packets, usually a few
kilobytes each, traveling through routers to their destinations. To ensure a
consistent source IP address for outbound internet traffic across multiple
containers, we can route all container traffic through a VPN. A VPN not only
encrypts traffic but also can mask its source IP address, achieving the desired
consistency.

WireGuard is a really simple VPN, and it’s included in the mainline Linux
kernel. So we just have to bootstrap a WireGuard network between the proxy
server and Modal workers (machines that run containers), configure traffic
routing, and we’re all set!

![Two containers sending data to a server, with a proxy in the middle](https://modal-cdn.com/vprox-blog-post/vprox-3.svg)

To set up the actual WireGuard network, we start an HTTPS listener on port 443
of the WireGuard server. This binds to the public IP of the proxy node, and it
takes “connect” POST requests to set up connections to the WireGuard network. We
can rely on the security of TLS to handle VPN key distribution.

When a POST request is received with the client’s public key, the server
validates the credentials of the client, then allocates an IP in the subnet and
adds it as a peer at that IP. The server also has a loop that removes idle peers
after a few minutes of not receiving WireGuard handshakes. We use the
[wgctrl](https://github.com/WireGuard/wgctrl-go) library for this, which
provides Go bindings for the WireGuard API, including access to the
\`LastHandshakeTime\` property of each peer.

\`\`\`go
var removePeers []wgtypes.PeerConfig
var removeIps []netip.Addr

for _, peer := range device.Peers {
    var idle bool
    if peer.LastHandshakeTime.IsZero() {
        _, isNew := srv.newPeers[peer.PublicKey]
        idle = !isNew
    } else {
        idle = time.Since(peer.LastHandshakeTime) > PeerIdleTimeout
    }

    if idle {
        if len(peer.AllowedIPs) > 0 {
            ipv4 := peer.AllowedIPs[0].IP.To4()
            if ipv4 != nil {
                log.Printf("[%v] removing idle peer at %v: %v",
                    srv.BindAddr, ipv4, peer.PublicKey)
                removeIps = append(removeIps, netip.AddrFrom4([4]byte(ipv4)))
            }
        }
        removePeers = append(removePeers, wgtypes.PeerConfig{
            PublicKey: peer.PublicKey,
            Remove:    true,
        })
    }
}

if len(removePeers) > 0 {
    err := srv.WgClient.ConfigureDevice(srv.Ifname(), wgtypes.Config{Peers: removePeers})
    if err != nil {
        return err
    }
    for _, ip := range removeIps {
        srv.ipAllocator.Free(ip)
    }
}
\`\`\`

On the client side, we periodically probe the WireGuard VPN connection every few
seconds. This is implemented by the \`CheckConnection\` function below. If the
pings fail, the client assumes that the connection is dead, and it then begins
trying to reconnect to the server and recover by sending a new “connect” POST
request.

\`\`\`go
func (c *Client) CheckConnection(timeout time.Duration, cancelCtx context.Context) bool {
    pinger, err := probing.NewPinger(c.wgCidr.Masked().Addr().Next().String())
    if err != nil {
        log.Printf("error creating pinger: %v", err)
        return false
    }

    pinger.Timeout = timeout
    pinger.Count = 3
    pinger.Interval = 10 * time.Millisecond // Send approximately all at once
    err = pinger.RunWithContext(cancelCtx)  // Blocks until finished.
    if err != nil {
        log.Printf("error running pinger: %v", err)
        return false
    }
    stats := pinger.Statistics()
    if stats.PacketsRecv > 0 && stats.PacketsRecv < stats.PacketsSent {
        log.Printf("warning: %v of %v packets in ping were dropped", stats.PacketsSent-stats.PacketsRecv, stats.PacketsSent)
    }
    return stats.PacketsRecv > 0
}
\`\`\`

This behavior is implemented in our open-source Go package
[vprox](https://github.com/modal-labs/vprox), which we’ll talk about more at the
end of this blog post.

## Policy-based routing on container traffic

There’s still a missing piece to the puzzle: Modal workers are multi-tenant. We
run gVisor sandboxes from multiple functions on the same host, which is what
lets us provide a serverless compute product with [flexible pricing](/pricing).

How does container networking work? Well, very briefly:

- Each worker machine runs multiple containers, and each container gets its own
  _[network namespace](https://man7.org/linux/man-pages/man7/network_namespaces.7.html)_.
- Inside the network namespace, the container has a _veth (virtual Ethernet)
  interface_. This acts as a virtual network card, similar to the WiFi card on
  your laptop.
- Veth’s come in pairs. The other half of the veth lives on a
  [bridge device](https://developers.redhat.com/blog/2018/10/22/introduction-to-linux-interfaces-for-virtual-networking#bridge)
  (like a [switch](https://en.wikipedia.org/wiki/Network_switch)).
- When containers send outbound packets to the Internet, they pass through the
  veth and arrive at the bridge, where the host Linux kernel is configured to
  **[masquerade](https://en.wikipedia.org/wiki/Network_address_translation)
  each packet’s source IP address** before exiting the machine.

If you didn’t get all that, it’s fine! The important part is the last step, IP
masquerade. This is a form of network address translation, or
[SNAT](https://en.wikipedia.org/wiki/Network_address_translation). It’s just
like how your home router uses SNAT to make all devices in your house have the
same public IP address. Each cloud host at Modal uses SNAT so containers running
on that host appear to the outside world to have the host’s public IP.

![Multiple containers on a host behind a network bridge and masquerade rule](https://modal-cdn.com/vprox-blog-post/vprox-4.svg)

This is the classic container networking setup. To introduce WireGuard, we need
to tell traffic from one container to go to a designated WireGuard interface
without affecting its neighbors. This requires an update to the kernel’s
[routing table](https://en.wikipedia.org/wiki/Routing_table). When a container
sends a packet to the outside world, we should inspect the packet’s source IP
and redirect it to the proper VPN interface based on the container’s metadata.

But people familiar with Linux might see a problem here: the
[iproute2](https://en.wikipedia.org/wiki/Iproute2) system in Linux doesn’t
actually let you put down routing table entries by source IP! In Linux, routing
tables are based on
[CIDR blocks](https://en.wikipedia.org/wiki/Classless_Inter-Domain_Routing) of
destination IPs. So you can route packets _to_ \`142.251.40.174\` (google.com)
from all containers, but you can’t tell packets _from_ a specific container to
go through a VPN.

There’s a solution, but it means we need to sin a bit. We’re going to write some
_policy-based routing_ rules. 🫢

\`\`\`bash
# Update routing policy to match packets from 10.11.12.13 to "table 101"
ip rule add from 10.11.12.13 lookup 101

# Add a default route for "table 101"
ip route add default dev wg1 table 101
\`\`\`

Policy-based routing works by switching between multiple routing tables. The
routing tables in Linux are numbered from 1 to 2^31. So we can assign a routing
table to each container that requests a proxy, allocating indices to avoid
repeats, then
[edit the policy database](https://www.man7.org/linux/man-pages/man8/ip-rule.8.html)
so that traffic from that container goes through the routing table.

![Diagram of container traffic through a policy database and route table](https://modal-cdn.com/vprox-blog-post/vprox-5.svg)

We really _didn’t_ want to do this, it’s tricky! For example, what happens if
two containers start up at the same time? They need to synchronize and decide
which one gets the next numbered routing table. And if a container crashes
early, it adds another kernel resource to clean up. Dynamically configuring the
policy database was not our first choice of solution.

(Technical detail: As an alternative approach, we tried doing it in eBPF first
with [\`xdp_redirect()\`](https://docs.kernel.org/bpf/redirect.html) in our packet
filter attached to the container bridge device. But this didn’t work. It was
incompatible with SNAT because eBPF skips the Linux netfilter stack.)

Luckily, our runtime is pretty resilient to unexpected crashes (it’s written in
safe Rust, with testing, monitoring and conscious async-oriented design), and
overall we haven’t run into any reliability issues with our implementation so
far.

That concludes our worker-side implementation of the proxy! Now, back to the
server…

## So you have a proxy server running for every IP?

We did initially! But starting one cloud VM for every proxy server is pretty
expensive, and it’s not very efficient on resource utilization. The entire point
of serverless is shared tenancy, after all. To make this faster and more
reliable, we started assigning multiple IPs to each proxy server, so that one
unit of shared hardware could manage all of these associations.

Each \`vprox server\` node has one or more IPs living on one or more network
interfaces. For example, on AWS, the latest \`c7gn.8xlarge\` instance type ($2.00
/ hr) with 100 Gigabit networking can have up to 8 network interfaces, with 30
IPv4 addresses per interface. This is a pretty good deal — at full packing of
240 IPs, each costs less than $0.01 / hr while also allowing for individual
proxies to burst up to 100 Gbps of shared bandwidth.

To avoid contention and control the bandwidth used by different IP proxies on
the same server, we can use the
[tc traffic shaping system](https://man7.org/linux/man-pages/man8/tc.8.html) in
Linux.

### Juggling IPs between servers

We didn’t just stop there though. We wrote some code that hits the cloud
instance metadata endpoint and detects within a couple seconds if you made any
changes to the IP addresses associated with the instance. If you did, \`vprox\`
automatically reconfigures itself to reallocate blocks of WireGuard IPs, move
around connections, bootstrap WireGuard interfaces, and start accepting
connections from clients to the new IP address.

This may seem like overengineering, but it reduces the amount of configuration
for \`vprox\` and makes the server significantly more flexible. Plus, it’s
fault-tolerant by design!
[Reconciliation loops](https://queue.acm.org/detail.cfm?id=2898444) are the
hidden heroes of distributed systems, as we all know.

When enabled, the network proxy is on the hot path of every request from a
serverless function, so high availability is crucial. You wouldn’t want your API
to start failing because you can’t connect to MongoDB anymore due to the _one_
proxy instance going down! So we implemented another reconciliation loop,
globally, that creates many servers and juggles the IPs around in event of a
termination.

![Failover of one proxy node causing IP reassignment](https://modal-cdn.com/vprox-blog-post/vprox-6.svg)

This can happen if the compute instance becomes unhealthy or needs to be taken
down for maintenance for any reason. The \`vprox\` client is also designed to
detect network partitions by periodically sending pings, and when it detects
that it has disconnected, we can automatically recover the connection to the new
server in under 10 seconds.

Since IP is an inherently unreliable and unordered protocol, you’ll probably
never even notice if your proxy goes down! Even if you’re running an HTTP
request at that exact moment, it will just result in a few dropped packets,
which are automatically retried at the TCP layer. No database errors for you — a
perfect recovery.

### What is rp_filter anyway?

(We’re going to get into [sysctl](https://en.wikipedia.org/wiki/Sysctl) here.
Sysctl is a way to configure attributes of the Linux kernel. Think of it like an
OS-wide configuration file.)

When testing \`vprox\` on different distributions of Linux, we ran into a problem
that we had to debug. Specifically, it was tested to be working on Ubuntu 24.04,
but it didn’t seem to be working on Oracle Linux 9. What happened? WireGuard is
part of the kernel, and iptables / iproute2 are supported by both distributions,
so this should be cross-platform.

The issue turned out to be caused by a feature called _reverse path filtering_.
Basically, the sysctl
[\`net.ipv4.conf.all.rp_filter\`](https://sysctl-explorer.net/net/ipv4/rp_filter/)
controls whether IP packets received on an interface are dropped. If strict
filtering is set, Linux will drop packets whose source address doesn’t appear to
match the path in the routing table that would otherwise be used to send packets
to that destination.

Since we’re sending packets to all kinds of public Internet sources through
these WireGuard interfaces, when they return on the interface, the kernel isn’t
happy about their source IP and drops them. It detects that a more “direct” path
would be to go through the default interface on the host instead. We need to
relax rp_filter.

Curiously, when we disabled the rp_filter setting by setting it to 0, vprox
didn’t work. We had to explicitly set it to 2, which is “loose mode” that checks
the incoming packet against the kernel’s FIB (forwarding information bus).

\`\`\`bash
sysctl -w net.ipv4.conf.all.rp_filter=2
\`\`\`

Honestly, I don’t know why vprox only works when reverse path filtering is in
loose mode and not when it is disabled. But we switched the value of the sysctl,
and now it works reliably across Linux distributions.

## Using vprox

If you’re a developer on Modal, you can get access to our
[static IP proxies](/docs/guide/proxy-ips) feature on the Team plan. Just create
a proxy and voilà, you’ve got an outbound IP. No SOCKS5 required!

\`\`\`python
import modal
import subprocess

app = modal.App()

@app.function(proxy=modal.Proxy.from_name("my-static-ip-proxy"))
def my_proxy_function():
    subprocess.run("curl ifconfig.me", shell=True)  # => "20.21.20.21"
\`\`\`

Right now each Proxy corresponds to a single static IP address, but we’re
planning to extend this to region-specific proxies where your container may
automatically select an IP from the nearest geographic location to minimize
latency.

But this blog post is about the internals, and as mentioned before, we
open-sourced our control plane — how we run WireGuard in production and
integrate it into the Modal serverless function runtime. You can find this in
the [modal-labs/vprox](https://github.com/modal-labs/vprox) repository on
GitHub. With just a couple commands, you can run a VPN server and any number of
clients. All aspects of the networking are configurable.

A nice thing about this implementation is IP discovery. On AWS, we periodically
poll the instance metadata endpoint to find the IPs attached, so you don’t have
to update this manually. Just run \`vprox server --cloud aws\` and watch the magic
happen. (It should be easy to port this code to other cloud providers, but we’ve
only tried deploying on AWS ourselves.)

---

We’re excited to see how you use static IPs at Modal! This project has been fun
for many of us. I’m grateful to my coworker Luis Capelo for deploying vprox
in production, and to our intern Jeffrey Meng for implementing IP discovery and
client reconnection.

If you’re interested in crafting reliable, secure systems at scale for the next
generation of cloud infrastructure, [we’re hiring](/careers) at Modal.
`,meta:{description:`Now your Modal containers around the world can have static outbound IPs. Featuring WireGuard, policy-based routing, and NAT.`}},{title:p,description:m,authors:h,date:g,length:_,category:v,published:y,layout:b,toc:x,rawContent:S,meta:C}=f,ne=t(`<code>xdp_redirect()</code>`),re=t(`<code>net.ipv4.conf.all.rp_filter</code>`),ie=t(`<p>At Modal, we built a high-availability, Go-based VPN proxy called <em>vprox</em>.</p> <p>This is a deployment of <!>, so it operates
on Layer 3 (IP) of the network stack and allows us to funnel outbound traffic
from containers around the world through static IPv4 addresses. In the event of
a single-node failure, its static IPs are associated with other proxy nodes, and
containers reconnect within seconds.</p> <p><!></p> <p>This blog post is about the guts of our network infrastructure, which powers <!>.</p> <h2 id="scenario">Scenario</h2> <p>The year is 2024, and you are deciding on a serverless cloud platform. You
stumble upon Modal. Run <code>pip install modal</code>, write a short Python function, and <code>modal deploy</code> it. Amazing, now you’ve got a cron job and API endpoint in the
cloud, within seconds.</p> <!> <p>Modal functions run on hardware around the world, in <!> across multiple cloud
providers. This is how we optimize the prices on your compute and scale
dynamically to meet demand. It’s all to make developers happy, since now you
don’t have to think about this stuff. (We get it, we’re infrastructure
engineers.)</p> <p>But now let’s say you want to connect your serverless function to your MongoDB
cloud database, and it requires a specific IP access list. Uh oh…</p> <center><img src="https://modal-cdn.com/cdnbot/tmpr5_wsi7u_2639b00c.webp" alt="Edit IP Access List Entry" width="600"/></center> <p>Usually, with a traditional provider you’d deploy some VMs and assign them a
static IP address or two, then distribute them across your machines and add
those to your access list. So now your application runs on cloud hosts at some
particular IPs, like <code>20.21.20.21</code>. Only these machines can access your MongoDB
database, and no one else can around the world.</p> <p>But if you’re running a serverless computing workload, which can not only run in
any data center around the world, but also scale up and down… you won’t know
what IP address your code is running on! So that access list would have
thousands of entries and will be constantly changing, which really isn’t going
to cut it.</p> <p>Plus, Modal has an isolated container runtime that lets us share each host’s CPU
and memory between workloads. If a host has one IP, your container and
another customer’s container on that host would have the same IP, so that
bypasses the security of your access list.</p> <h2 id="okay-but-i-want-to-access-my-database-from-modal">Okay but I want to access my database from Modal</h2> <p>So you need a static outbound IP address. Is that possible? Let’s break it down.
IP addresses act as identifiers for sending and receiving internet data. When
two different containers communicate with a web service like Google, each has a
unique source IP. This allows Google’s server to reply directly to the correct
container.</p> <p><!></p> <p>In this standard setup, the outbound IP address is tightly coupled to the
container. How can you decouple static IP addresses from the actual compute
resources? There’s a solution for this: <strong>You use a proxy.</strong></p> <p>We started by adding <!> proxies to
Modal. SOCKS5 is an unsung hero of the Internet proxy world; it’s a technology
from 1996 (<!>) that lets
you send a request <em>through</em> another computer. SOCKS5 is secretly built into a
lot of software like OpenSSH, if you pass in the obscure <code>-D</code> flag that enables
the feature. But SOCKS5 doesn’t work out-of-the-box. You need to edit your
application to use an esoteric network shim.</p> <p>If you wanted containers running your function to use a SOCKS5-based Modal
Proxy, we would define one for your workspace. Once the Proxy object is created,
you can use it like so:</p> <!> <p>Now other functions can call <code>get_user_count()</code> remotely as a serverless
invocation. The proxy is only spun up within the <code>get_user_count()</code> function.</p> <!> <p>Slick! But this is brittle. Replacing the standard library’s <code>socket.socket</code> object doesn’t work for libraries that don’t use <code>socket</code> directly. And many
common libraries don’t, such as asyncpg, datadog, aiohttp, httpx, or grpcio.</p> <p>The broader issue is that the API is not obvious. It passes on the complexity to
the user, who needs to figure out how to wire up the SOCKS5 proxy to their
libraries. Modal is a cloud provider, and our philosophy on developer experience
is that things “just work” — we should implement features that are correct and
efficient by design.</p> <p>So we stepped down a layer. Since we own the entire runtime, how can we
configure networking so that <em>all outbound Internet</em> <em>access</em> goes through that
IP? You should be able to just send a simple request to <!> and get back your proxy’s IP, for instance.</p> <h2 id="enter-wireguard">Enter WireGuard</h2> <p>At Layer 3, the Internet Protocol, all traffic looks the same—whether it’s
Wikipedia, YouTube, or MongoDB. It’s just MTU-sized packets, usually a few
kilobytes each, traveling through routers to their destinations. To ensure a
consistent source IP address for outbound internet traffic across multiple
containers, we can route all container traffic through a VPN. A VPN not only
encrypts traffic but also can mask its source IP address, achieving the desired
consistency.</p> <p>WireGuard is a really simple VPN, and it’s included in the mainline Linux
kernel. So we just have to bootstrap a WireGuard network between the proxy
server and Modal workers (machines that run containers), configure traffic
routing, and we’re all set!</p> <p><!></p> <p>To set up the actual WireGuard network, we start an HTTPS listener on port 443
of the WireGuard server. This binds to the public IP of the proxy node, and it
takes “connect” POST requests to set up connections to the WireGuard network. We
can rely on the security of TLS to handle VPN key distribution.</p> <p>When a POST request is received with the client’s public key, the server
validates the credentials of the client, then allocates an IP in the subnet and
adds it as a peer at that IP. The server also has a loop that removes idle peers
after a few minutes of not receiving WireGuard handshakes. We use the <!> library for this, which
provides Go bindings for the WireGuard API, including access to the <code>LastHandshakeTime</code> property of each peer.</p> <!> <p>On the client side, we periodically probe the WireGuard VPN connection every few
seconds. This is implemented by the <code>CheckConnection</code> function below. If the
pings fail, the client assumes that the connection is dead, and it then begins
trying to reconnect to the server and recover by sending a new “connect” POST
request.</p> <!> <p>This behavior is implemented in our open-source Go package <!>, which we’ll talk about more at the
end of this blog post.</p> <h2 id="policy-based-routing-on-container-traffic">Policy-based routing on container traffic</h2> <p>There’s still a missing piece to the puzzle: Modal workers are multi-tenant. We
run gVisor sandboxes from multiple functions on the same host, which is what
lets us provide a serverless compute product with <!>.</p> <p>How does container networking work? Well, very briefly:</p> <ul><li>Each worker machine runs multiple containers, and each container gets its own <em><!></em>.</li> <li>Inside the network namespace, the container has a <em>veth (virtual Ethernet)
interface</em>. This acts as a virtual network card, similar to the WiFi card on
your laptop.</li> <li>Veth’s come in pairs. The other half of the veth lives on a <!> (like a <!>).</li> <li>When containers send outbound packets to the Internet, they pass through the
veth and arrive at the bridge, where the host Linux kernel is configured to <strong><!> each packet’s source IP address</strong> before exiting the machine.</li></ul> <p>If you didn’t get all that, it’s fine! The important part is the last step, IP
masquerade. This is a form of network address translation, or <!>. It’s just
like how your home router uses SNAT to make all devices in your house have the
same public IP address. Each cloud host at Modal uses SNAT so containers running
on that host appear to the outside world to have the host’s public IP.</p> <p><!></p> <p>This is the classic container networking setup. To introduce WireGuard, we need
to tell traffic from one container to go to a designated WireGuard interface
without affecting its neighbors. This requires an update to the kernel’s <!>. When a container
sends a packet to the outside world, we should inspect the packet’s source IP
and redirect it to the proper VPN interface based on the container’s metadata.</p> <p>But people familiar with Linux might see a problem here: the <!> system in Linux doesn’t
actually let you put down routing table entries by source IP! In Linux, routing
tables are based on <!> of
destination IPs. So you can route packets <em>to</em> <code>142.251.40.174</code> (google.com)
from all containers, but you can’t tell packets <em>from</em> a specific container to
go through a VPN.</p> <p>There’s a solution, but it means we need to sin a bit. We’re going to write some <em>policy-based routing</em> rules. 🫢</p> <!> <p>Policy-based routing works by switching between multiple routing tables. The
routing tables in Linux are numbered from 1 to 2^31. So we can assign a routing
table to each container that requests a proxy, allocating indices to avoid
repeats, then <!> so that traffic from that container goes through the routing table.</p> <p><!></p> <p>We really <em>didn’t</em> want to do this, it’s tricky! For example, what happens if
two containers start up at the same time? They need to synchronize and decide
which one gets the next numbered routing table. And if a container crashes
early, it adds another kernel resource to clean up. Dynamically configuring the
policy database was not our first choice of solution.</p> <p>(Technical detail: As an alternative approach, we tried doing it in eBPF first
with <!> in our packet
filter attached to the container bridge device. But this didn’t work. It was
incompatible with SNAT because eBPF skips the Linux netfilter stack.)</p> <p>Luckily, our runtime is pretty resilient to unexpected crashes (it’s written in
safe Rust, with testing, monitoring and conscious async-oriented design), and
overall we haven’t run into any reliability issues with our implementation so
far.</p> <p>That concludes our worker-side implementation of the proxy! Now, back to the
server…</p> <h2 id="so-you-have-a-proxy-server-running-for-every-ip">So you have a proxy server running for every IP?</h2> <p>We did initially! But starting one cloud VM for every proxy server is pretty
expensive, and it’s not very efficient on resource utilization. The entire point
of serverless is shared tenancy, after all. To make this faster and more
reliable, we started assigning multiple IPs to each proxy server, so that one
unit of shared hardware could manage all of these associations.</p> <p>Each <code>vprox server</code> node has one or more IPs living on one or more network
interfaces. For example, on AWS, the latest <code>c7gn.8xlarge</code> instance type ($2.00
/ hr) with 100 Gigabit networking can have up to 8 network interfaces, with 30
IPv4 addresses per interface. This is a pretty good deal — at full packing of
240 IPs, each costs less than $0.01 / hr while also allowing for individual
proxies to burst up to 100 Gbps of shared bandwidth.</p> <p>To avoid contention and control the bandwidth used by different IP proxies on
the same server, we can use the <!> in
Linux.</p> <h3 id="juggling-ips-between-servers">Juggling IPs between servers</h3> <p>We didn’t just stop there though. We wrote some code that hits the cloud
instance metadata endpoint and detects within a couple seconds if you made any
changes to the IP addresses associated with the instance. If you did, <code>vprox</code> automatically reconfigures itself to reallocate blocks of WireGuard IPs, move
around connections, bootstrap WireGuard interfaces, and start accepting
connections from clients to the new IP address.</p> <p>This may seem like overengineering, but it reduces the amount of configuration
for <code>vprox</code> and makes the server significantly more flexible. Plus, it’s
fault-tolerant by design! <!> are the
hidden heroes of distributed systems, as we all know.</p> <p>When enabled, the network proxy is on the hot path of every request from a
serverless function, so high availability is crucial. You wouldn’t want your API
to start failing because you can’t connect to MongoDB anymore due to the <em>one</em> proxy instance going down! So we implemented another reconciliation loop,
globally, that creates many servers and juggles the IPs around in event of a
termination.</p> <p><!></p> <p>This can happen if the compute instance becomes unhealthy or needs to be taken
down for maintenance for any reason. The <code>vprox</code> client is also designed to
detect network partitions by periodically sending pings, and when it detects
that it has disconnected, we can automatically recover the connection to the new
server in under 10 seconds.</p> <p>Since IP is an inherently unreliable and unordered protocol, you’ll probably
never even notice if your proxy goes down! Even if you’re running an HTTP
request at that exact moment, it will just result in a few dropped packets,
which are automatically retried at the TCP layer. No database errors for you — a
perfect recovery.</p> <h3 id="what-is-rp_filter-anyway">What is rp_filter anyway?</h3> <p>(We’re going to get into <!> here.
Sysctl is a way to configure attributes of the Linux kernel. Think of it like an
OS-wide configuration file.)</p> <p>When testing <code>vprox</code> on different distributions of Linux, we ran into a problem
that we had to debug. Specifically, it was tested to be working on Ubuntu 24.04,
but it didn’t seem to be working on Oracle Linux 9. What happened? WireGuard is
part of the kernel, and iptables / iproute2 are supported by both distributions,
so this should be cross-platform.</p> <p>The issue turned out to be caused by a feature called <em>reverse path filtering</em>.
Basically, the sysctl <!> controls whether IP packets received on an interface are dropped. If strict
filtering is set, Linux will drop packets whose source address doesn’t appear to
match the path in the routing table that would otherwise be used to send packets
to that destination.</p> <p>Since we’re sending packets to all kinds of public Internet sources through
these WireGuard interfaces, when they return on the interface, the kernel isn’t
happy about their source IP and drops them. It detects that a more “direct” path
would be to go through the default interface on the host instead. We need to
relax rp_filter.</p> <p>Curiously, when we disabled the rp_filter setting by setting it to 0, vprox
didn’t work. We had to explicitly set it to 2, which is “loose mode” that checks
the incoming packet against the kernel’s FIB (forwarding information bus).</p> <!> <p>Honestly, I don’t know why vprox only works when reverse path filtering is in
loose mode and not when it is disabled. But we switched the value of the sysctl,
and now it works reliably across Linux distributions.</p> <h2 id="using-vprox">Using vprox</h2> <p>If you’re a developer on Modal, you can get access to our <!> feature on the Team plan. Just create
a proxy and voilà, you’ve got an outbound IP. No SOCKS5 required!</p> <!> <p>Right now each Proxy corresponds to a single static IP address, but we’re
planning to extend this to region-specific proxies where your container may
automatically select an IP from the nearest geographic location to minimize
latency.</p> <p>But this blog post is about the internals, and as mentioned before, we
open-sourced our control plane — how we run WireGuard in production and
integrate it into the Modal serverless function runtime. You can find this in
the <!> repository on
GitHub. With just a couple commands, you can run a VPN server and any number of
clients. All aspects of the networking are configurable.</p> <p>A nice thing about this implementation is IP discovery. On AWS, we periodically
poll the instance metadata endpoint to find the IPs attached, so you don’t have
to update this manually. Just run <code>vprox server --cloud aws</code> and watch the magic
happen. (It should be easy to port this code to other cloud providers, but we’ve
only tried deploying on AWS ourselves.)</p> <hr/> <p>We’re excited to see how you use static IPs at Modal! This project has been fun
for many of us. I’m grateful to my coworker Luis Capelo for deploying vprox
in production, and to our intern Jeffrey Meng for implementing IP discovery and
client reconnection.</p> <p>If you’re interested in crafting reliable, secure systems at scale for the next
generation of cloud infrastructure, <!> at Modal.</p>`,1);function w(t,p){let m=ee(p,[`children`,`$$slots`,`$$events`,`$$legacy`]);d(t,a(()=>m,()=>f,{children:(t,ee)=>{var a=ie(),d=o(te(a),2);u(o(e(d)),{href:`https://www.wireguard.com/`,rel:`nofollow`,children:(e,t)=>{s(),i(e,r(`WireGuard`))},$$slots:{default:!0}}),s(),n(d);var f=o(d,2);c(e(f),{src:`https://modal-cdn.com/vprox-blog-post/vprox-1.svg`,alt:`Map of Modal containers in different places funneling through a static IP proxy with WireGuard tunnels`}),n(f);var p=o(f,2);u(o(e(p)),{href:`/docs/guide/proxy-ips`,children:(e,t)=>{s(),i(e,r(`Static IP Proxies`))},$$slots:{default:!0}}),s(),n(p);var m=o(p,6);l(m,{code:`import%20modal%0A%0Aapp%20%3D%20modal.App()%0A%0A%0A%40app.function(gpu%3D%22A100%22%2C%20schedule%3Dmodal.Period(days%3D1))%0Adef%20my_modal_function()%3A%0A%20%20%20%20print(%22Hello%20world!%22)%0A%0A%0A%40app.function()%0A%40modal.web_endpoint()%0Adef%20my_web_endpoint()%3A%0A%20%20%20%20return%20%7B%22some%22%3A%20%22json%20data%22%7D`,lang:`python`});var h=o(m,2);u(o(e(h)),{href:`/blog/region-selection-launch`,children:(e,t)=>{s(),i(e,r(`dozens of regions`))},$$slots:{default:!0}}),s(),n(h);var g=o(h,16);c(e(g),{src:`https://modal-cdn.com/vprox-blog-post/vprox-2.svg`,alt:`Two containers, both sending data to a server, with different IPs`}),n(g);var _=o(g,4),v=o(e(_));u(v,{href:`https://en.wikipedia.org/wiki/SOCKS`,rel:`nofollow`,children:(e,t)=>{s(),i(e,r(`SOCKS5`))},$$slots:{default:!0}}),u(o(v,2),{href:`https://datatracker.ietf.org/doc/html/rfc1928`,rel:`nofollow`,children:(e,t)=>{s(),i(e,r(`RFC 1928`))},$$slots:{default:!0}}),s(5),n(_);var y=o(_,4);l(y,{code:`import%20socket%0A%0Aimport%20psycopg2%0Aimport%20socks%0A%0A%40app.function(%0A%20%20%20%20proxy%3Dmodal.Proxy.from_name(%22postgres-prod%22)%2C%0A%20%20%20%20secret%3Dmodal.Secret.from_name(%22postgres-prod-credentials%22)%2C%0A)%0Adef%20get_user_count()%20-%3E%20int%3A%0A%20%20%20%20%23%20SOCKS5%20Proxy%20object%20is%20configured%20to%20listen%20on%20localhost%3A13432.%0A%20%20%20%20socks.set_default_proxy(socks.SOCKS5%2C%20%22localhost%22%2C%2013432)%0A%0A%20%20%20%20%23%20Patch%20the%20standard%20library%20socket%20class%20with%20the%20SOCKS%20proxy%20socket.%0A%20%20%20%20socket.socket%20%3D%20socks.socksocket%0A%0A%20%20%20%20connection%20%3D%20psycopg2.connect(%0A%20%20%20%20%20%20%20%20dbname%3Dos.getenv(%22DB_NAME%22)%2C%0A%20%20%20%20%20%20%20%20user%3Dos.getenv(%22DB_USER%22)%2C%0A%20%20%20%20%20%20%20%20password%3Dos.getenv(%22DB_PASSWORD%22)%2C%0A%20%20%20%20%20%20%20%20host%3Dos.getenv(%22DB_HOST%22)%2C%0A%20%20%20%20%20%20%20%20port%3Dos.getenv(%22DB_PORT%22)%2C%0A%20%20%20%20)%0A%20%20%20%20cursor%20%3D%20connection.cursor()%0A%0A%20%20%20%20cursor.execute(%22SELECT%20COUNT(*)%20FROM%20users%3B%22)%0A%20%20%20%20user_count%3A%20int%20%3D%20cursor.fetchone()%5B0%5D%0A%20%20%20%20return%20user_count`,lang:`python`});var b=o(y,4);l(b,{code:`%40app.function(schedule%3Dmodal.Cron(%222%200%20*%20*%20*%22))%20%20%23%20runs%20at%202%20AM%0Adef%20daily_schedule()%20-%3E%20None%3A%0A%20%20%20%20num_users%20%3D%20get_user_count.remote()%0A%20%20%20%20print(f%22you%20currently%20have%20%7Bnum_users%7D%20users%2C%20posting%20to%20Slack...%22)%0A%20%20%20%20%23%20...`,lang:`python`});var x=o(b,6);u(o(e(x),5),{href:`https://ifconfig.me`,rel:`nofollow`,children:(e,t)=>{s(),i(e,r(`ifconfig.me`))},$$slots:{default:!0}}),s(),n(x);var S=o(x,8);c(e(S),{src:`https://modal-cdn.com/vprox-blog-post/vprox-3.svg`,alt:`Two containers sending data to a server, with a proxy in the middle`}),n(S);var C=o(S,4);u(o(e(C)),{href:`https://github.com/WireGuard/wgctrl-go`,rel:`nofollow`,children:(e,t)=>{s(),i(e,r(`wgctrl`))},$$slots:{default:!0}}),s(3),n(C);var w=o(C,2);l(w,{code:`var%20removePeers%20%5B%5Dwgtypes.PeerConfig%0Avar%20removeIps%20%5B%5Dnetip.Addr%0A%0Afor%20_%2C%20peer%20%3A%3D%20range%20device.Peers%20%7B%0A%20%20%20%20var%20idle%20bool%0A%20%20%20%20if%20peer.LastHandshakeTime.IsZero()%20%7B%0A%20%20%20%20%20%20%20%20_%2C%20isNew%20%3A%3D%20srv.newPeers%5Bpeer.PublicKey%5D%0A%20%20%20%20%20%20%20%20idle%20%3D%20!isNew%0A%20%20%20%20%7D%20else%20%7B%0A%20%20%20%20%20%20%20%20idle%20%3D%20time.Since(peer.LastHandshakeTime)%20%3E%20PeerIdleTimeout%0A%20%20%20%20%7D%0A%0A%20%20%20%20if%20idle%20%7B%0A%20%20%20%20%20%20%20%20if%20len(peer.AllowedIPs)%20%3E%200%20%7B%0A%20%20%20%20%20%20%20%20%20%20%20%20ipv4%20%3A%3D%20peer.AllowedIPs%5B0%5D.IP.To4()%0A%20%20%20%20%20%20%20%20%20%20%20%20if%20ipv4%20!%3D%20nil%20%7B%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20log.Printf(%22%5B%25v%5D%20removing%20idle%20peer%20at%20%25v%3A%20%25v%22%2C%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20srv.BindAddr%2C%20ipv4%2C%20peer.PublicKey)%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20removeIps%20%3D%20append(removeIps%2C%20netip.AddrFrom4(%5B4%5Dbyte(ipv4)))%0A%20%20%20%20%20%20%20%20%20%20%20%20%7D%0A%20%20%20%20%20%20%20%20%7D%0A%20%20%20%20%20%20%20%20removePeers%20%3D%20append(removePeers%2C%20wgtypes.PeerConfig%7B%0A%20%20%20%20%20%20%20%20%20%20%20%20PublicKey%3A%20peer.PublicKey%2C%0A%20%20%20%20%20%20%20%20%20%20%20%20Remove%3A%20%20%20%20true%2C%0A%20%20%20%20%20%20%20%20%7D)%0A%20%20%20%20%7D%0A%7D%0A%0Aif%20len(removePeers)%20%3E%200%20%7B%0A%20%20%20%20err%20%3A%3D%20srv.WgClient.ConfigureDevice(srv.Ifname()%2C%20wgtypes.Config%7BPeers%3A%20removePeers%7D)%0A%20%20%20%20if%20err%20!%3D%20nil%20%7B%0A%20%20%20%20%20%20%20%20return%20err%0A%20%20%20%20%7D%0A%20%20%20%20for%20_%2C%20ip%20%3A%3D%20range%20removeIps%20%7B%0A%20%20%20%20%20%20%20%20srv.ipAllocator.Free(ip)%0A%20%20%20%20%7D%0A%7D`,lang:`go`});var T=o(w,4);l(T,{code:`func%20(c%20*Client)%20CheckConnection(timeout%20time.Duration%2C%20cancelCtx%20context.Context)%20bool%20%7B%0A%20%20%20%20pinger%2C%20err%20%3A%3D%20probing.NewPinger(c.wgCidr.Masked().Addr().Next().String())%0A%20%20%20%20if%20err%20!%3D%20nil%20%7B%0A%20%20%20%20%20%20%20%20log.Printf(%22error%20creating%20pinger%3A%20%25v%22%2C%20err)%0A%20%20%20%20%20%20%20%20return%20false%0A%20%20%20%20%7D%0A%0A%20%20%20%20pinger.Timeout%20%3D%20timeout%0A%20%20%20%20pinger.Count%20%3D%203%0A%20%20%20%20pinger.Interval%20%3D%2010%20*%20time.Millisecond%20%2F%2F%20Send%20approximately%20all%20at%20once%0A%20%20%20%20err%20%3D%20pinger.RunWithContext(cancelCtx)%20%20%2F%2F%20Blocks%20until%20finished.%0A%20%20%20%20if%20err%20!%3D%20nil%20%7B%0A%20%20%20%20%20%20%20%20log.Printf(%22error%20running%20pinger%3A%20%25v%22%2C%20err)%0A%20%20%20%20%20%20%20%20return%20false%0A%20%20%20%20%7D%0A%20%20%20%20stats%20%3A%3D%20pinger.Statistics()%0A%20%20%20%20if%20stats.PacketsRecv%20%3E%200%20%26%26%20stats.PacketsRecv%20%3C%20stats.PacketsSent%20%7B%0A%20%20%20%20%20%20%20%20log.Printf(%22warning%3A%20%25v%20of%20%25v%20packets%20in%20ping%20were%20dropped%22%2C%20stats.PacketsSent-stats.PacketsRecv%2C%20stats.PacketsSent)%0A%20%20%20%20%7D%0A%20%20%20%20return%20stats.PacketsRecv%20%3E%200%0A%7D`,lang:`go`});var E=o(T,2);u(o(e(E)),{href:`https://github.com/modal-labs/vprox`,rel:`nofollow`,children:(e,t)=>{s(),i(e,r(`vprox`))},$$slots:{default:!0}}),s(),n(E);var D=o(E,4);u(o(e(D)),{href:`/pricing`,children:(e,t)=>{s(),i(e,r(`flexible pricing`))},$$slots:{default:!0}}),s(),n(D);var O=o(D,4),k=e(O),A=o(e(k));u(e(A),{href:`https://man7.org/linux/man-pages/man7/network_namespaces.7.html`,rel:`nofollow`,children:(e,t)=>{s(),i(e,r(`network namespace`))},$$slots:{default:!0}}),n(A),s(),n(k);var j=o(k,4),M=o(e(j));u(M,{href:`https://developers.redhat.com/blog/2018/10/22/introduction-to-linux-interfaces-for-virtual-networking#bridge`,rel:`nofollow`,children:(e,t)=>{s(),i(e,r(`bridge device`))},$$slots:{default:!0}}),u(o(M,2),{href:`https://en.wikipedia.org/wiki/Network_switch`,rel:`nofollow`,children:(e,t)=>{s(),i(e,r(`switch`))},$$slots:{default:!0}}),s(),n(j);var N=o(j,2),P=o(e(N));u(e(P),{href:`https://en.wikipedia.org/wiki/Network_address_translation`,rel:`nofollow`,children:(e,t)=>{s(),i(e,r(`masquerade`))},$$slots:{default:!0}}),s(),n(P),s(),n(N),n(O);var F=o(O,2);u(o(e(F)),{href:`https://en.wikipedia.org/wiki/Network_address_translation`,rel:`nofollow`,children:(e,t)=>{s(),i(e,r(`SNAT`))},$$slots:{default:!0}}),s(),n(F);var I=o(F,2);c(e(I),{src:`https://modal-cdn.com/vprox-blog-post/vprox-4.svg`,alt:`Multiple containers on a host behind a network bridge and masquerade rule`}),n(I);var L=o(I,2);u(o(e(L)),{href:`https://en.wikipedia.org/wiki/Routing_table`,rel:`nofollow`,children:(e,t)=>{s(),i(e,r(`routing table`))},$$slots:{default:!0}}),s(),n(L);var R=o(L,2),z=o(e(R));u(z,{href:`https://en.wikipedia.org/wiki/Iproute2`,rel:`nofollow`,children:(e,t)=>{s(),i(e,r(`iproute2`))},$$slots:{default:!0}}),u(o(z,2),{href:`https://en.wikipedia.org/wiki/Classless_Inter-Domain_Routing`,rel:`nofollow`,children:(e,t)=>{s(),i(e,r(`CIDR blocks`))},$$slots:{default:!0}}),s(7),n(R);var B=o(R,4);l(B,{code:`%23%20Update%20routing%20policy%20to%20match%20packets%20from%2010.11.12.13%20to%20%22table%20101%22%0Aip%20rule%20add%20from%2010.11.12.13%20lookup%20101%0A%0A%23%20Add%20a%20default%20route%20for%20%22table%20101%22%0Aip%20route%20add%20default%20dev%20wg1%20table%20101`,lang:`bash`});var V=o(B,2);u(o(e(V)),{href:`https://www.man7.org/linux/man-pages/man8/ip-rule.8.html`,rel:`nofollow`,children:(e,t)=>{s(),i(e,r(`edit the policy database`))},$$slots:{default:!0}}),s(),n(V);var H=o(V,2);c(e(H),{src:`https://modal-cdn.com/vprox-blog-post/vprox-5.svg`,alt:`Diagram of container traffic through a policy database and route table`}),n(H);var U=o(H,4);u(o(e(U)),{href:`https://docs.kernel.org/bpf/redirect.html`,rel:`nofollow`,children:(e,t)=>{i(e,ne())},$$slots:{default:!0}}),s(),n(U);var W=o(U,12);u(o(e(W)),{href:`https://man7.org/linux/man-pages/man8/tc.8.html`,rel:`nofollow`,children:(e,t)=>{s(),i(e,r(`tc traffic shaping system`))},$$slots:{default:!0}}),s(),n(W);var G=o(W,6);u(o(e(G),3),{href:`https://queue.acm.org/detail.cfm?id=2898444`,rel:`nofollow`,children:(e,t)=>{s(),i(e,r(`Reconciliation loops`))},$$slots:{default:!0}}),s(),n(G);var K=o(G,4);c(e(K),{src:`https://modal-cdn.com/vprox-blog-post/vprox-6.svg`,alt:`Failover of one proxy node causing IP reassignment`}),n(K);var q=o(K,8);u(o(e(q)),{href:`https://en.wikipedia.org/wiki/Sysctl`,rel:`nofollow`,children:(e,t)=>{s(),i(e,r(`sysctl`))},$$slots:{default:!0}}),s(),n(q);var J=o(q,4);u(o(e(J),3),{href:`https://sysctl-explorer.net/net/ipv4/rp_filter/`,rel:`nofollow`,children:(e,t)=>{i(e,re())},$$slots:{default:!0}}),s(),n(J);var Y=o(J,6);l(Y,{code:`sysctl%20-w%20net.ipv4.conf.all.rp_filter%3D2`,lang:`bash`});var X=o(Y,6);u(o(e(X)),{href:`/docs/guide/proxy-ips`,children:(e,t)=>{s(),i(e,r(`static IP proxies`))},$$slots:{default:!0}}),s(),n(X);var Z=o(X,2);l(Z,{code:`import%20modal%0Aimport%20subprocess%0A%0Aapp%20%3D%20modal.App()%0A%0A%40app.function(proxy%3Dmodal.Proxy.from_name(%22my-static-ip-proxy%22))%0Adef%20my_proxy_function()%3A%0A%20%20%20%20subprocess.run(%22curl%20ifconfig.me%22%2C%20shell%3DTrue)%20%20%23%20%3D%3E%20%2220.21.20.21%22`,lang:`python`});var Q=o(Z,4);u(o(e(Q)),{href:`https://github.com/modal-labs/vprox`,rel:`nofollow`,children:(e,t)=>{s(),i(e,r(`modal-labs/vprox`))},$$slots:{default:!0}}),s(),n(Q);var $=o(Q,8);u(o(e($)),{href:`/careers`,children:(e,t)=>{s(),i(e,r(`we’re hiring`))},$$slots:{default:!0}}),s(),n($),i(t,a)},$$slots:{default:!0}}))}export{w as default,f as metadata};
//# sourceMappingURL=BsnhcMQy.js.map
