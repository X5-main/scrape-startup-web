(function(){try{var e=typeof window<`u`?window:typeof global<`u`?global:typeof globalThis<`u`?globalThis:typeof self<`u`?self:{};e.SENTRY_RELEASE={id:`f99fcf9f0a844cc9bd13fdc8e5782b84`};var t=new e.Error().stack;t&&(e._sentryDebugIds=e._sentryDebugIds||{},e._sentryDebugIds[t]=`5e2dbc0b-ea4e-4de1-b762-b73bb399f22f`,e._sentryDebugIdIdentifier=`sentry-dbid-5e2dbc0b-ea4e-4de1-b762-b73bb399f22f`)}catch{}})();import{$t as e,E as t,Ft as n,Rt as r,St as i,Tn as a,Tt as o,_n as s,bt as c,c as l,d as u,dn as d,en as f,in as p,on as m,tn as h,vn as g,wn as _}from"./F_ixKBiO.js";import"./B1sc9Zdx.js";import"./Bb2deiU3.js";import{t as v}from"./BYbVAjq52.js";import{t as y}from"./CQFmr3Xw.js";import"./Byq5z5IS2.js";import{n as b,t as x}from"./JPsrybyr.js";import{t as S}from"./BILrvr3I.js";import{t as C}from"./DeWGVqas2.js";import{t as w}from"./CdZDxCfO2.js";var T={title:`Keeping 20,000 GPUs healthy`,description:`How we do active and passive monitoring on hyperscalers and neoclouds.`,authors:[{name:`Jonathon Belotti`,avatarUrl:`https://modal-cdn.com/jonathon-belotti.png`,jobTitle:`Member of Technical Staff`,twitterHandle:`jonobelotti_IO`},{name:`Amy Chang`,avatarUrl:`https://modal-cdn.com/blog/images/amychang.webp`,jobTitle:`Software Engineer Intern`}],date:`2025-12-28T12:00:00.000Z`,length:`8 minute read`,category:`Engineering`,published:!0,layout:`blog`,toc:[{depth:2,value:`Instance type testing and selection`,id:`instance-type-testing-and-selection`},{depth:2,value:`Machine images`,id:`machine-images`},{depth:2,value:`Instance boot`,id:`instance-boot`},{depth:2,value:`Lifetime management`,id:`lifetime-management`,children:[{depth:3,value:`Passive healthchecking`,id:`passive-healthchecking`},{depth:3,value:`Active healthchecking`,id:`active-healthchecking`},{depth:3,value:`Taking action`,id:`taking-action`}]},{depth:2,value:`Observability`,id:`observability`},{depth:2,value:`Support`,id:`support`},{depth:2,value:`Conclusions`,id:`conclusions`}],rawContent:`Modal runs a globally distributed, autoscaling GPU worker pool by sourcing compute from all cloud giants: AWS, GCP, Azure, OCI. We’ve scaled the worker pool to well over 20,000 concurrent GPUs, and launched over four million cloud instances in the last couple years. At this scale, you see almost every GPU reliability problem there is.

Today, we’re sharing our GPU reliability system as both a demonstration of our commitment to Modal customers and as a guide for fellow travelers renting hyperscaler or neocloud cards. [It's dangerous to go alone!
Take this.](https://en.wikipedia.org/wiki/It%27s_dangerous_to_go_alone!)

This post starts with cloud instance type testing and selection. Perhaps surprisingly, there are significant performance and reliability differences between the cloud hyperscalers. We then discuss machine image preparation and instance boot checks. Next we cover the passive and active GPU healthchecking performed throughout the life of each instance. Finally we discuss observability and support, which become crucial when a GPU reliability issue slips by our automated healthchecking systems.

We’ve chosen not to refer to cloud providers directly, but instead give them anonymized A, B, C, D identifiers. If you want know who’s who, track the clues or buy us a beer sometime.

## Instance type testing and selection

Let’s start with cloud instance type reliability. The hyperscalers are significantly differentiated at the instance type level. To stick specifically to reliability related differences, we’ve observed that:

- Cloud A has the simplest and most reliable instance launch API. If you request a BM or VM and get a HTTP 201 back, 99.6% of the time you’ll get it to boot, and boot relatively quickly (2-3 minutes).
- Cloud A runs H100s which perform 50% worse on StableDiffusion \`text2img\` compared with C and D.
- Cloud C ran their H100s too hot, sometimes reaching over 90ºC, for a few months in 2025. FLOP/s performance degrades starting as low as the mid-70s Celsius.
- Cloud C has 228MiB more \`reserved\` H100 memory than the others. Thus, it has less memory for our customers to use.
- Cloud D A10s have frequent hardware-side clock slowdowns ([\`HW_SLOWDOWN\`](https://docs.nvidia.com/datacenter/dcgm/latest/dcgm-api/dcgm-api-field-constants.html#c.DCGM_CLOCKS_EVENT_REASON_HW_SLOWDOWN) and [\`HW_POWER_BRAKE\`](https://docs.nvidia.com/datacenter/dcgm/latest/dcgm-api/dcgm-api-field-constants.html#c.DCGM_CLOCKS_EVENT_REASON_HW_POWER_BRAKE)).
- The NVIDIA A10s in one of Cloud D's US regions have more frequent uncorrectable ECC errors. Unfortunately, this isn’t something you find out quickly.
- Cloud D has the best price/performance. Its bare metal servers are beasts.

Typically, our provider ranking is capacity and price led, but we additionally maintain internal _adjusted_ prices which account for penalties we impose after discovering problems with specific instance types, regions, etc.

We maintain semi-automated benchmarking (called \`modal-host-bench\`) to let us evaluate the plethora of performance and reliability issues we want to eliminate or at least price-in. Here is some sample benchmarking data highlighting that you really do not want
to rent a PCIe H100 when you can rent an SXM H100 instead.

| **Category**                    | **Cloud D H100 SXM** | **Cloud B H100 NVL (PCIe)** | **% diff** |
| ------------------------------- | -------------------- | --------------------------- | ---------- |
| \`torch_matmul_duration_seconds\` | 1.62                 | 2.72                        | 67.5%      |
| \`torch_matmul_flops\`            | 678 TF/s             | 405 TF/s                    | -40.3%     |
| \`h2d_bw_pageable_1024\`          | 7.68 GiB/s           | 21.0 GiB/s                  | 174%       |
| \`h2d_bw_pinned_1024\`            | 49.1 GiB/s           | 51.2 GiB/s                  | 4.40%      |
| \`d2h_bw_pageable_1024\`          | 14.3 GiB/s           | 20.9 GiB/s                  | 46.0%      |
| \`d2h_bw_pinned_1024\`            | 50.7 GiB/s           | 53.4 GiB/s                  | 5.30%      |

## Machine images

Machine images are what our bare-metal (BM) and virtual machine (VM) servers use to boot. They include a kernel, operating system files, the NVIDIA driver, installed system libraries, configuration, and a bit of Modal’s application software.

We’ve found that the quality of the machine images used has significant implications for reliability and performance. We care a lot about machine image consistency across our multi-cloud compute pool (same kernel, same drivers, etc) as well as freshness. Our images keep up with the latest production NVIDIA driver version ([580.95.05](https://www.nvidia.com/en-us/drivers/details/250991/)) for security, performance, and new features.

In Modal's early days, machine image updates were ad-hoc and manually tested, and mistakes abounded. A couple years ago this became untenable, so we switched to continuous, gradual integration of machine images with automated testing before image promotion occurred.

<figure>
  <img src="https://modal-cdn.com/blog/images/mach-img-rollout.webp" alt="Timeseries graph showing our machine image rollout" />
  <figcaption class="text-s mt-2 mb-0 text-gray-400 w-full">A visualization of machine image version rollouts across a week. Color indicates version, and you can see orange was rolled back.</figcaption>
</figure>

Because the cloud giants are so reliable at loading custom machine images, you can pull a lot of GPU testing into the image build phase. Concretely, at the end of a build we run both system tool tests like [NVIDIA Data Center GPU Manager (DCGM)](https://developer.nvidia.com/dcgm) and custom GPU tests from inside the Modal container runtime before considering the image configuration ready for production. This ensures that both the Worker host and our customer's guest containers will work with the GPU.

\`\`\`hcl
provisioner "shell" {
  script = "./setup/check_nvidia_ctk.sh"
}

provisioner "file" {
  destination = "/tmp/modal/"
  source      = "./.bin/modal-healthcheck"
}
\`\`\`

Solid machine image support is a place where the cloud giants clearly differentiate their platforms from most neocloud upstarts (e.g. Lambda Labs, Nebius). Very few neoclouds support image customization, and they also have worse instance startup performance due to hypervisor and caching inefficiencies. Cloud C is the fastest to boot a new VM with our machine image, averaging just under 2 minutes.
Certain neoclouds struggle to boot even their platform-default machine image in less than 5 minutes.

Although the hyperscalers are not significantly differentiated in their machine image feature and reliability, cloud D has _extremely_ slow regional image replication, taking 3 hours to replicate to 10 regions.

## Instance boot

Instance boot is where our machine images spark alive in the heat and noise of a datacenter, encountering the reality of production. If we’ve booted on a host with bad GPUs, or our cloud-init process has a bug, we need know about it and intervene before any customers land on those GPUs.

There is a significant tradeoff here. Modal runs an autoscaling fleet. Slowing down startup adds to scheduling overhead for our customers. Worse still, added startup latency actually _reduces_ reliability when it delays failover.

The deepest generic check you might do on a new host is \`dcgmi diag --run 4\`. It finds a bunch of long-tail problems, but takes around an hour. Even the shallowest, \`dcgmi diag --run 1\` takes at least a minute.

Testing hardware on boot is likely redundant with healthchecking already performed by the cloud provider. After all, we’re supposedly paying for working GPUs!
Deeply checking every instance put out by an assembly line already running at four nines of reliability would be penny wise and pound foolish. When I buy a coffee at my local shop,
I don't ask to smell the milk.

So at instance boot we typically perform relatively light checks: \`systemctl\` queries, \`nvidia-smi\` queries, and a basic readwrite on a randomly selected GPU (0-7).

Today, we almost never have GPU problems slip through and hit user containers. The one irksome issue we have in production is that Cloud C’s [L4s flake at CUDA initialization](/docs/guide/troubleshooting#cuda-driver-initialization-failed-on-l4-gpu-type) in 0.1% of cases. Application code targeting those cards must use \`cuInit\` retries.

## Lifetime management

At this point we’ve acquired an instance we're happy with, booted it, and started running customer workloads on it. We’re happy in production, but need to stay that way, and that’s where continuous _passive_ and _active_ healthchecking comes into play.

- Passive healthchecking does not run on a GPU and is non-invasive, read-only. Passive data streams include \`dmesg\` and \`dcgmi health\`.
- Active healthchecks take exclusive hold on a GPU device and readwrite to acquire health data. \`dcgmi check\` and [\`nvbandwidth\`](https://github.com/NVIDIA/nvbandwidth) are examples.

### Passive healthchecking

<!-- See https://app.datadoghq.com/dashboard/xci-8en-9hs/gpu-health for data source. -->

<figure class="flex flex-col items-center mb-6">
  <div class="h-50 w-full">
    <StackedTimeseriesChart
      variant={selectedVariant}
      {xDomain}
      formatLabelY={(d) => \`\${d.toFixed(3)}\`}
      {formatTooltip}
      {displayUtc}
      {data}
      {seriesNames}
      {seriesColors}
      {interactive}
      selectIndex={selectedSeries === undefined
        ? undefined
        : seriesNames.findIndex((series) => series == selectedSeries)}
      {hasTooltip}
      labelY="Xid errors / hr / GPU"
      padding={{ top: 8, right: 16, bottom: 24, left: 48 }}
      onChangeDomainX={({ detail: [start, end] }) => {
        const minDuration = 30 * 60 * 1e3; // 30 minutes
        if (end.getTime() - start.getTime() >= minDuration) {
          xDomain = [start, end];
        }
      }}
    />
  </div>
  <figcaption class="text-center text-s mt-2 mb-0 text-gray-400 w-full">
    Critical level <a href="https://modal.com/docs/guide/gpu-health">Xid errors</a> per hour by cloud, normalized by GPU count. Cloud B (blue) has by far the highest critical error rate.
  </figcaption>
</figure>

You get 80% of the passive healthchecking wins from 20% of the work: running \`dcgmi\` periodically and checking \`dmesg\` for the most common issues. More specifically, \`dcgmi\` can tell you about uncorrectable ECC errors on specific GPUs. We can also passively learn of GPU thermal violations, sync boost violations, hardware slowdowns, and excessive temperatures (&gt; 88°C).

As mentioned above, cloud C had a big cooling problem until a few months ago. We’ve seen cloud C GPUs get to 94°C! Performance is crippled at that temperature, around 50% of peak. 🥵

### Active healthchecking

As active healthchecking requires an exclusive lock on GPUs, it is more complicated to schedule. Overuse active healthchecking and we waste valuable GPU time. Underuse it and we risk leaving around degraded GPUs.

Following SemiAnalysis’s [ClusterMAX expectations](https://www.clustermax.ai/health-checks), we ensure that each GPU node gets deep, active checking at least weekly. Though we’ve confirmed our underlying cloud providers perform their own deep active healthchecking, they obviously can’t do their checking while we hold the instances.

A lot of our instance capacity is via short (&lt;24hr) rentals, so we don't encounter this as much as platforms that rent machines for months. However, we do have some longer-lived capacity. Every week we hold an instance, we run the following active checks:

- NVIDIA DCGM \`diag\` level 2.
- GPUBurn/GPU-fryer\xA0- to validate the GPU won't fail under load.
- Local NCCL all-reduce tests to validate NVLink/NVSwitch/NVLink SHARP performance.

If these fail, we are alerted, the instance is not allowed to proceed to accepting tasks, and sometimes we “quarantine” the instance for analysis by ourselves or the underlying provider.

In the near future, we are adding these network-oriented active checks due to increasing interest in fast interconnect for training and inference:

- Local InfiniBand all reduce test for validating InfiniBand performance and links (by force disabling NVLink/p2p/SHM).
- Pairwise CPU and GPU \`ib_write_bw\` and \`ib_write_latency\` bidirectional tests to verify that the network is within specs with reference numbers.

### Taking action

In theory it’s possible to recover from some unhealthy GPU states by isolating and resetting the GPU. In practice, for us, this is overcomplicated and no guarantee of recovery. So instead we automatically mark the entire host unhealthy, drain it, and then either dispose of it or reinstall.

## Observability

![GPU metrics](https://modal-cdn.com/blog/images/gpu-metrics-4.webp)

Our dashboard offers every container a view of its GPU reliability via four metrics:

- memory usage
- utilization
- temperature
- power usage

For lots of detail on how to interpret these, see our [previous high-level guide to GPU utilization](https://modal.com/blog/gpu-utilization-guide).

A caveat is that all of these metrics are currently aggregated at the container level, so they are less effective at spotting a single bad GPU amongst eight.

Going beyond metrics, we also pipe abnormal GPU health events into dashboard container logs. See the informational "gpu-health" lines in the screenshot below (indicated with purple).

<figure>
  <img src="https://modal-cdn.com/blog/images/gpu-health-logs.webp" alt="gpu-health logs" />
  <figcaption class="text-center text-s mt-2 mb-0 text-gray-400 w-full">
    Screenshot of a container's log stream in Modal, showing the detection of multiple Xid 13 errors.
  </figcaption>
</figure>

Our guide documentation maintains [a detailed Xid and sXid dictionary](https://modal.com/docs/guide/gpu-health) for understanding errors. We think it’s the best GPU error resource on the internet.

## Support

<figure class="flex flex-col items-center mb-6">
  <div class="h-50 w-full">
  <MetricChart
    series={metricSeries}
    xDomain={metricXDomain}
    formatLabelY={formatSupportLabelY}
    formatTooltip={formatSupportTooltip}
    {displayUtc}
    {interactive}
    on:changeDomainX={({ detail: [start, end] }) => {
      const minDuration = 30 * 60 * 1e3; // 30 minutes
      if (end - start >= minDuration) {
        metricXDomain = [start, end];
      }
    }}
  />
  </div>
  <figcaption class="text-center text-s mt-2 mb-0 text-gray-400 w-full">
    Our support metrics across all channels, exported from Pylon.
  </figcaption>
</figure>

All the above comfortably gets you four nines of GPU uptime. But there’s always edge-cases and black swans—for those you need support.

For [our Enterprise customers we use a shared private Slack channel](https://modal.com/pricing) with tight SLAs. Slack is connected to Pylon, tracking issues from creation to resolution. Because Modal is built on top of the cloud giants and designed for dynamic compute autoscaling, we can replace bad GPUs pretty fast!

For everyone else we are still responsive in our community channels, and offer credits when we let a GPU go bad without noticing.

## Conclusions

It’s underappreciated how unreliable GPUs are. NVIDIA’s hardware is a marvel, the FLOPs are absurd. But the reliability is a drag. A memorable illustration of how AI/ML development is hampered by reliability comes from [Meta's paper detailing the training process for the LLaMA 3 models](https://arxiv.org/abs/2407.21783): “GPU issues are the largest category, accounting for 58.7% of all unexpected issues.”

Imagine the future we’ll enjoy when GPUs are as reliable as CPUs. The Llama3 team’s CPUs were the problem only 0.5% of the time. In my time at Modal we can’t remember finding a single degraded CPU core.

Until then though, what you’ve read is our commitment to being your GPU reliability team. If you go at it alone, don’t say you weren’t warned.
`,meta:{description:`How we do active and passive monitoring on hyperscalers and neoclouds.`}},{title:E,description:D,authors:O,date:k,length:A,category:j,published:M,layout:N,toc:P,rawContent:F,meta:ee}=T,te=i(`<code>HW_SLOWDOWN</code>`),I=i(`<code>HW_POWER_BRAKE</code>`),L=i(`<thead><tr><th><strong>Category</strong></th><th><strong>Cloud D H100 SXM</strong></th><th><strong>Cloud B H100 NVL (PCIe)</strong></th><th><strong>% diff</strong></th></tr></thead> <tbody><tr><td><code>torch_matmul_duration_seconds</code></td><td>1.62</td><td>2.72</td><td>67.5%</td></tr><tr><td><code>torch_matmul_flops</code></td><td>678 TF/s</td><td>405 TF/s</td><td>-40.3%</td></tr><tr><td><code>h2d_bw_pageable_1024</code></td><td>7.68 GiB/s</td><td>21.0 GiB/s</td><td>174%</td></tr><tr><td><code>h2d_bw_pinned_1024</code></td><td>49.1 GiB/s</td><td>51.2 GiB/s</td><td>4.40%</td></tr><tr><td><code>d2h_bw_pageable_1024</code></td><td>14.3 GiB/s</td><td>20.9 GiB/s</td><td>46.0%</td></tr><tr><td><code>d2h_bw_pinned_1024</code></td><td>50.7 GiB/s</td><td>53.4 GiB/s</td><td>5.30%</td></tr></tbody>`,1),R=i(`<code>nvbandwidth</code>`),z=i(`<p>Modal runs a globally distributed, autoscaling GPU worker pool by sourcing compute from all cloud giants: AWS, GCP, Azure, OCI. We’ve scaled the worker pool to well over 20,000 concurrent GPUs, and launched over four million cloud instances in the last couple years. At this scale, you see almost every GPU reliability problem there is.</p> <p>Today, we’re sharing our GPU reliability system as both a demonstration of our commitment to Modal customers and as a guide for fellow travelers renting hyperscaler or neocloud cards. <!></p> <p>This post starts with cloud instance type testing and selection. Perhaps surprisingly, there are significant performance and reliability differences between the cloud hyperscalers. We then discuss machine image preparation and instance boot checks. Next we cover the passive and active GPU healthchecking performed throughout the life of each instance. Finally we discuss observability and support, which become crucial when a GPU reliability issue slips by our automated healthchecking systems.</p> <p>We’ve chosen not to refer to cloud providers directly, but instead give them anonymized A, B, C, D identifiers. If you want know who’s who, track the clues or buy us a beer sometime.</p> <h2 id="instance-type-testing-and-selection">Instance type testing and selection</h2> <p>Let’s start with cloud instance type reliability. The hyperscalers are significantly differentiated at the instance type level. To stick specifically to reliability related differences, we’ve observed that:</p> <ul><li>Cloud A has the simplest and most reliable instance launch API. If you request a BM or VM and get a HTTP 201 back, 99.6% of the time you’ll get it to boot, and boot relatively quickly (2-3 minutes).</li> <li>Cloud A runs H100s which perform 50% worse on StableDiffusion <code>text2img</code> compared with C and D.</li> <li>Cloud C ran their H100s too hot, sometimes reaching over 90ºC, for a few months in 2025. FLOP/s performance degrades starting as low as the mid-70s Celsius.</li> <li>Cloud C has 228MiB more <code>reserved</code> H100 memory than the others. Thus, it has less memory for our customers to use.</li> <li>Cloud D A10s have frequent hardware-side clock slowdowns (<!> and <!>).</li> <li>The NVIDIA A10s in one of Cloud D’s US regions have more frequent uncorrectable ECC errors. Unfortunately, this isn’t something you find out quickly.</li> <li>Cloud D has the best price/performance. Its bare metal servers are beasts.</li></ul> <p>Typically, our provider ranking is capacity and price led, but we additionally maintain internal <em>adjusted</em> prices which account for penalties we impose after discovering problems with specific instance types, regions, etc.</p> <p>We maintain semi-automated benchmarking (called <code>modal-host-bench</code>) to let us evaluate the plethora of performance and reliability issues we want to eliminate or at least price-in. Here is some sample benchmarking data highlighting that you really do not want
to rent a PCIe H100 when you can rent an SXM H100 instead.</p> <!> <h2 id="machine-images">Machine images</h2> <p>Machine images are what our bare-metal (BM) and virtual machine (VM) servers use to boot. They include a kernel, operating system files, the NVIDIA driver, installed system libraries, configuration, and a bit of Modal’s application software.</p> <p>We’ve found that the quality of the machine images used has significant implications for reliability and performance. We care a lot about machine image consistency across our multi-cloud compute pool (same kernel, same drivers, etc) as well as freshness. Our images keep up with the latest production NVIDIA driver version (<!>) for security, performance, and new features.</p> <p>In Modal’s early days, machine image updates were ad-hoc and manually tested, and mistakes abounded. A couple years ago this became untenable, so we switched to continuous, gradual integration of machine images with automated testing before image promotion occurred.</p> <figure><img src="https://modal-cdn.com/blog/images/mach-img-rollout.webp" alt="Timeseries graph showing our machine image rollout"/> <figcaption class="text-s mt-2 mb-0 text-gray-400 w-full">A visualization of machine image version rollouts across a week. Color indicates version, and you can see orange was rolled back.</figcaption></figure> <p>Because the cloud giants are so reliable at loading custom machine images, you can pull a lot of GPU testing into the image build phase. Concretely, at the end of a build we run both system tool tests like <!> and custom GPU tests from inside the Modal container runtime before considering the image configuration ready for production. This ensures that both the Worker host and our customer’s guest containers will work with the GPU.</p> <!> <p>Solid machine image support is a place where the cloud giants clearly differentiate their platforms from most neocloud upstarts (e.g. Lambda Labs, Nebius). Very few neoclouds support image customization, and they also have worse instance startup performance due to hypervisor and caching inefficiencies. Cloud C is the fastest to boot a new VM with our machine image, averaging just under 2 minutes.
Certain neoclouds struggle to boot even their platform-default machine image in less than 5 minutes.</p> <p>Although the hyperscalers are not significantly differentiated in their machine image feature and reliability, cloud D has <em>extremely</em> slow regional image replication, taking 3 hours to replicate to 10 regions.</p> <h2 id="instance-boot">Instance boot</h2> <p>Instance boot is where our machine images spark alive in the heat and noise of a datacenter, encountering the reality of production. If we’ve booted on a host with bad GPUs, or our cloud-init process has a bug, we need know about it and intervene before any customers land on those GPUs.</p> <p>There is a significant tradeoff here. Modal runs an autoscaling fleet. Slowing down startup adds to scheduling overhead for our customers. Worse still, added startup latency actually <em>reduces</em> reliability when it delays failover.</p> <p>The deepest generic check you might do on a new host is <code>dcgmi diag --run 4</code>. It finds a bunch of long-tail problems, but takes around an hour. Even the shallowest, <code>dcgmi diag --run 1</code> takes at least a minute.</p> <p>Testing hardware on boot is likely redundant with healthchecking already performed by the cloud provider. After all, we’re supposedly paying for working GPUs!
Deeply checking every instance put out by an assembly line already running at four nines of reliability would be penny wise and pound foolish. When I buy a coffee at my local shop,
I don’t ask to smell the milk.</p> <p>So at instance boot we typically perform relatively light checks: <code>systemctl</code> queries, <code>nvidia-smi</code> queries, and a basic readwrite on a randomly selected GPU (0-7).</p> <p>Today, we almost never have GPU problems slip through and hit user containers. The one irksome issue we have in production is that Cloud C’s <!> in 0.1% of cases. Application code targeting those cards must use <code>cuInit</code> retries.</p> <h2 id="lifetime-management">Lifetime management</h2> <p>At this point we’ve acquired an instance we’re happy with, booted it, and started running customer workloads on it. We’re happy in production, but need to stay that way, and that’s where continuous <em>passive</em> and <em>active</em> healthchecking comes into play.</p> <ul><li>Passive healthchecking does not run on a GPU and is non-invasive, read-only. Passive data streams include <code>dmesg</code> and <code>dcgmi health</code>.</li> <li>Active healthchecks take exclusive hold on a GPU device and readwrite to acquire health data. <code>dcgmi check</code> and <!> are examples.</li></ul> <h3 id="passive-healthchecking">Passive healthchecking</h3> <figure class="flex flex-col items-center mb-6"><div class="h-50 w-full"><!></div> <figcaption class="text-center text-s mt-2 mb-0 text-gray-400 w-full">Critical level <a href="https://modal.com/docs/guide/gpu-health">Xid errors</a> per hour by cloud, normalized by GPU count. Cloud B (blue) has by far the highest critical error rate.</figcaption></figure> <p>You get 80% of the passive healthchecking wins from 20% of the work: running <code>dcgmi</code> periodically and checking <code>dmesg</code> for the most common issues. More specifically, <code>dcgmi</code> can tell you about uncorrectable ECC errors on specific GPUs. We can also passively learn of GPU thermal violations, sync boost violations, hardware slowdowns, and excessive temperatures (&gt; 88°C).</p> <p>As mentioned above, cloud C had a big cooling problem until a few months ago. We’ve seen cloud C GPUs get to 94°C! Performance is crippled at that temperature, around 50% of peak. 🥵</p> <h3 id="active-healthchecking">Active healthchecking</h3> <p>As active healthchecking requires an exclusive lock on GPUs, it is more complicated to schedule. Overuse active healthchecking and we waste valuable GPU time. Underuse it and we risk leaving around degraded GPUs.</p> <p>Following SemiAnalysis’s <!>, we ensure that each GPU node gets deep, active checking at least weekly. Though we’ve confirmed our underlying cloud providers perform their own deep active healthchecking, they obviously can’t do their checking while we hold the instances.</p> <p>A lot of our instance capacity is via short (&lt;24hr) rentals, so we don’t encounter this as much as platforms that rent machines for months. However, we do have some longer-lived capacity. Every week we hold an instance, we run the following active checks:</p> <ul><li>NVIDIA DCGM <code>diag</code> level 2.</li> <li>GPUBurn/GPU-fryer\xA0- to validate the GPU won’t fail under load.</li> <li>Local NCCL all-reduce tests to validate NVLink/NVSwitch/NVLink SHARP performance.</li></ul> <p>If these fail, we are alerted, the instance is not allowed to proceed to accepting tasks, and sometimes we “quarantine” the instance for analysis by ourselves or the underlying provider.</p> <p>In the near future, we are adding these network-oriented active checks due to increasing interest in fast interconnect for training and inference:</p> <ul><li>Local InfiniBand all reduce test for validating InfiniBand performance and links (by force disabling NVLink/p2p/SHM).</li> <li>Pairwise CPU and GPU <code>ib_write_bw</code> and <code>ib_write_latency</code> bidirectional tests to verify that the network is within specs with reference numbers.</li></ul> <h3 id="taking-action">Taking action</h3> <p>In theory it’s possible to recover from some unhealthy GPU states by isolating and resetting the GPU. In practice, for us, this is overcomplicated and no guarantee of recovery. So instead we automatically mark the entire host unhealthy, drain it, and then either dispose of it or reinstall.</p> <h2 id="observability">Observability</h2> <p><!></p> <p>Our dashboard offers every container a view of its GPU reliability via four metrics:</p> <ul><li>memory usage</li> <li>utilization</li> <li>temperature</li> <li>power usage</li></ul> <p>For lots of detail on how to interpret these, see our <!>.</p> <p>A caveat is that all of these metrics are currently aggregated at the container level, so they are less effective at spotting a single bad GPU amongst eight.</p> <p>Going beyond metrics, we also pipe abnormal GPU health events into dashboard container logs. See the informational “gpu-health” lines in the screenshot below (indicated with purple).</p> <figure><img src="https://modal-cdn.com/blog/images/gpu-health-logs.webp" alt="gpu-health logs"/> <figcaption class="text-center text-s mt-2 mb-0 text-gray-400 w-full">Screenshot of a container's log stream in Modal, showing the detection of multiple Xid 13 errors.</figcaption></figure> <p>Our guide documentation maintains <!> for understanding errors. We think it’s the best GPU error resource on the internet.</p> <h2 id="support">Support</h2> <figure class="flex flex-col items-center mb-6"><div class="h-50 w-full"><!></div> <figcaption class="text-center text-s mt-2 mb-0 text-gray-400 w-full">Our support metrics across all channels, exported from Pylon.</figcaption></figure> <p>All the above comfortably gets you four nines of GPU uptime. But there’s always edge-cases and black swans—for those you need support.</p> <p>For <!> with tight SLAs. Slack is connected to Pylon, tracking issues from creation to resolution. Because Modal is built on top of the cloud giants and designed for dynamic compute autoscaling, we can replace bad GPUs pretty fast!</p> <p>For everyone else we are still responsive in our community channels, and offer credits when we let a GPU go bad without noticing.</p> <h2 id="conclusions">Conclusions</h2> <p>It’s underappreciated how unreliable GPUs are. NVIDIA’s hardware is a marvel, the FLOPs are absurd. But the reliability is a drag. A memorable illustration of how AI/ML development is hampered by reliability comes from <!>: “GPU issues are the largest category, accounting for 58.7% of all unexpected issues.”</p> <p>Imagine the future we’ll enjoy when GPUs are as reliable as CPUs. The Llama3 team’s CPUs were the problem only 0.5% of the time. In my time at Modal we can’t remember finding a single degraded CPU core.</p> <p>Until then though, what you’ve read is our commitment to being your GPU reliability team. If you go at it alone, don’t say you weren’t warned.</p>`,1);function B(i,E){let D=l(E,[`children`,`$$slots`,`$$events`,`$$legacy`]);g(E,!1);let O=p([new Date(Date.UTC(2025,7,31)),new Date(Date.UTC(2025,10,23))]),k=[{date:new Date(Date.UTC(2025,7,31)),value:.84},{date:new Date(Date.UTC(2025,8,7)),value:1.18},{date:new Date(Date.UTC(2025,8,14)),value:3.17},{date:new Date(Date.UTC(2025,8,21)),value:1.25},{date:new Date(Date.UTC(2025,8,28)),value:.88},{date:new Date(Date.UTC(2025,9,5)),value:.57},{date:new Date(Date.UTC(2025,9,12)),value:.54},{date:new Date(Date.UTC(2025,9,19)),value:1.22},{date:new Date(Date.UTC(2025,9,26)),value:2.22},{date:new Date(Date.UTC(2025,10,2)),value:1.71},{date:new Date(Date.UTC(2025,10,9)),value:1.55},{date:new Date(Date.UTC(2025,10,16)),value:2.54},{date:new Date(Date.UTC(2025,10,23)),value:.2}],A=[{date:new Date(Date.UTC(2025,7,31)),value:.07},{date:new Date(Date.UTC(2025,8,7)),value:.07},{date:new Date(Date.UTC(2025,8,14)),value:.04},{date:new Date(Date.UTC(2025,8,21)),value:.03},{date:new Date(Date.UTC(2025,8,28)),value:.01},{date:new Date(Date.UTC(2025,9,5)),value:.03},{date:new Date(Date.UTC(2025,9,12)),value:.05},{date:new Date(Date.UTC(2025,9,19)),value:.15},{date:new Date(Date.UTC(2025,9,26)),value:.05},{date:new Date(Date.UTC(2025,10,2)),value:.05},{date:new Date(Date.UTC(2025,10,9)),value:.04},{date:new Date(Date.UTC(2025,10,16)),value:.01},{date:new Date(Date.UTC(2025,10,23)),value:0}],j=[{values:k,name:`p50 Time In New Queue`,color:`#319ace`},{values:A,name:`p50 Time Waiting on Modal`,color:`#ff4fa3`}],M=new Date(Date.UTC(2025,10,1,0)),N=new Date(Date.UTC(2025,10,14,12)),P=[{date:new Date(Date.UTC(2025,10,0,14,0,0)),"Cloud A":.009,"Cloud B":.012,"Cloud C":.003,"Cloud D":.002},{date:new Date(Date.UTC(2025,10,0,20,0,0)),"Cloud A":.008,"Cloud B":.011,"Cloud C":.003,"Cloud D":.002},{date:new Date(Date.UTC(2025,10,1,2,0,0)),"Cloud A":.009,"Cloud B":.011,"Cloud C":.003,"Cloud D":.002},{date:new Date(Date.UTC(2025,10,1,8,0,0)),"Cloud A":.008,"Cloud B":.012,"Cloud C":.003,"Cloud D":.002},{date:new Date(Date.UTC(2025,10,2,14,0,0)),"Cloud A":.007,"Cloud B":.01,"Cloud C":.002,"Cloud D":.001},{date:new Date(Date.UTC(2025,10,4,2,0,0)),"Cloud A":.007,"Cloud B":.011,"Cloud C":.002,"Cloud D":.001},{date:new Date(Date.UTC(2025,10,5,14,0,0)),"Cloud A":.012,"Cloud B":.022,"Cloud C":.006,"Cloud D":.006},{date:new Date(Date.UTC(2025,10,6,0,0,0)),"Cloud A":.015,"Cloud B":.028,"Cloud C":.007,"Cloud D":.008},{date:new Date(Date.UTC(2025,10,6,6,0,0)),"Cloud A":.018,"Cloud B":.035,"Cloud C":.008,"Cloud D":.01},{date:new Date(Date.UTC(2025,10,6,12,0,0)),"Cloud A":.02,"Cloud B":.04,"Cloud C":.009,"Cloud D":.011},{date:new Date(Date.UTC(2025,10,8,2,0,0)),"Cloud A":.006,"Cloud B":.018,"Cloud C":.002,"Cloud D":.001},{date:new Date(Date.UTC(2025,10,8,14,0,0)),"Cloud A":.02,"Cloud B":.09,"Cloud C":.01,"Cloud D":.005},{date:new Date(Date.UTC(2025,10,9,0,0,0)),"Cloud A":.015,"Cloud B":.13,"Cloud C":.012,"Cloud D":.006},{date:new Date(Date.UTC(2025,10,9,6,0,0)),"Cloud A":.015,"Cloud B":.17,"Cloud C":.011,"Cloud D":.007},{date:new Date(Date.UTC(2025,10,9,12,0,0)),"Cloud A":.015,"Cloud B":.18,"Cloud C":.016,"Cloud D":.008},{date:new Date(Date.UTC(2025,10,10,14,0,0)),"Cloud A":.005,"Cloud B":.02,"Cloud C":.003,"Cloud D":.002},{date:new Date(Date.UTC(2025,10,12,2,0,0)),"Cloud A":.008,"Cloud B":.045,"Cloud C":.004,"Cloud D":.002},{date:new Date(Date.UTC(2025,10,12,14,0,0)),"Cloud A":.009,"Cloud B":.05,"Cloud C":.004,"Cloud D":.002},{date:new Date(Date.UTC(2025,10,13,2,0,0)),"Cloud A":.004,"Cloud B":.008,"Cloud C":.002,"Cloud D":.002},{date:new Date(Date.UTC(2025,10,13,14,0,0)),"Cloud A":.006,"Cloud B":.01,"Cloud C":.003,"Cloud D":.015},{date:new Date(Date.UTC(2025,10,14,0,0,0)),"Cloud A":.008,"Cloud B":.012,"Cloud C":.004,"Cloud D":.035}];function F(e){return e.toFixed(3)}function ee(e){return e>=1?`${e} hrs`:`${Math.round(e*60)} mins`}function B(e){return e>=1?`${e.toFixed(2)} hrs`:`${Math.round(e*60)} mins`}let V=[`Cloud A`,`Cloud B`,`Cloud C`,`Cloud D`],H=[`#FF0ECA`,`#319ACE`,`#7FEE64`,`#8D324C`],U=p([M,N]);t(),w(i,u(()=>D,()=>T,{children:(t,i)=>{var s=z(),l=h(f(s),2);C(h(e(l)),{href:`https://en.wikipedia.org/wiki/It%27s_dangerous_to_go_alone!`,rel:`nofollow`,children:(e,t)=>{_(),c(e,o(`It’s dangerous to go alone!
Take this.`))},$$slots:{default:!0}}),a(l);var u=h(l,10),p=h(e(u),8),g=h(e(p));C(g,{href:`https://docs.nvidia.com/datacenter/dcgm/latest/dcgm-api/dcgm-api-field-constants.html#c.DCGM_CLOCKS_EVENT_REASON_HW_SLOWDOWN`,rel:`nofollow`,children:(e,t)=>{c(e,te())},$$slots:{default:!0}}),C(h(g,2),{href:`https://docs.nvidia.com/datacenter/dcgm/latest/dcgm-api/dcgm-api-field-constants.html#c.DCGM_CLOCKS_EVENT_REASON_HW_POWER_BRAKE`,rel:`nofollow`,children:(e,t)=>{c(e,I())},$$slots:{default:!0}}),_(),a(p),_(4),a(u);var w=h(u,6);b(w,{children:(e,t)=>{var n=L();_(2),c(e,n)},$$slots:{default:!0}});var T=h(w,6);C(h(e(T)),{href:`https://www.nvidia.com/en-us/drivers/details/250991/`,rel:`nofollow`,children:(e,t)=>{_(),c(e,o(`580.95.05`))},$$slots:{default:!0}}),_(),a(T);var E=h(T,6);C(h(e(E)),{href:`https://developer.nvidia.com/dcgm`,rel:`nofollow`,children:(e,t)=>{_(),c(e,o(`NVIDIA Data Center GPU Manager (DCGM)`))},$$slots:{default:!0}}),_(),a(E);var D=h(E,2);S(D,{code:`provisioner%20%22shell%22%20%7B%0A%20%20script%20%3D%20%22.%2Fsetup%2Fcheck_nvidia_ctk.sh%22%0A%7D%0A%0Aprovisioner%20%22file%22%20%7B%0A%20%20destination%20%3D%20%22%2Ftmp%2Fmodal%2F%22%0A%20%20source%20%20%20%20%20%20%3D%20%22.%2F.bin%2Fmodal-healthcheck%22%0A%7D`,lang:`hcl`});var k=h(D,18);C(h(e(k)),{href:`/docs/guide/troubleshooting#cuda-driver-initialization-failed-on-l4-gpu-type`,children:(e,t)=>{_(),c(e,o(`L4s flake at CUDA initialization`))},$$slots:{default:!0}}),_(3),a(k);var A=h(k,6),M=h(e(A),2);C(h(e(M),3),{href:`https://github.com/NVIDIA/nvbandwidth`,rel:`nofollow`,children:(e,t)=>{c(e,R())},$$slots:{default:!0}}),_(),a(M),a(A);var N=h(A,4),W=e(N),G=e(W);{let e=d(()=>r(()=>void 0));v(G,{variant:`Area`,get xDomain(){return n(U)},formatLabelY:e=>`${e.toFixed(3)}`,formatTooltip:F,displayUtc:!1,get data(){return P},get seriesNames(){return V},get seriesColors(){return H},interactive:!0,get selectIndex(){return n(e)},hasTooltip:!0,labelY:`Xid errors / hr / GPU`,padding:{top:8,right:16,bottom:24,left:48},onChangeDomainX:({detail:[e,t]})=>{t.getTime()-e.getTime()>=1800*1e3&&m(U,[e,t])}})}a(W),_(2),a(N);var K=h(N,10);C(h(e(K)),{href:`https://www.clustermax.ai/health-checks`,rel:`nofollow`,children:(e,t)=>{_(),c(e,o(`ClusterMAX expectations`))},$$slots:{default:!0}}),_(),a(K);var q=h(K,18);x(e(q),{src:`https://modal-cdn.com/blog/images/gpu-metrics-4.webp`,alt:`GPU metrics`}),a(q);var J=h(q,6);C(h(e(J)),{href:`https://modal.com/blog/gpu-utilization-guide`,rel:`nofollow`,children:(e,t)=>{_(),c(e,o(`previous high-level guide to GPU utilization`))},$$slots:{default:!0}}),_(),a(J);var Y=h(J,8);C(h(e(Y)),{href:`https://modal.com/docs/guide/gpu-health`,rel:`nofollow`,children:(e,t)=>{_(),c(e,o(`a detailed Xid and sXid dictionary`))},$$slots:{default:!0}}),_(),a(Y);var X=h(Y,4),Z=e(X);y(e(Z),{get series(){return j},get xDomain(){return n(O)},formatLabelY:ee,formatTooltip:B,displayUtc:!1,interactive:!0,$$events:{changeDomainX:({detail:[e,t]})=>{t-e>=1800*1e3&&m(O,[e,t])}}}),a(Z),_(2),a(X);var Q=h(X,4);C(h(e(Q)),{href:`https://modal.com/pricing`,rel:`nofollow`,children:(e,t)=>{_(),c(e,o(`our Enterprise customers we use a shared private Slack channel`))},$$slots:{default:!0}}),_(),a(Q);var $=h(Q,6);C(h(e($)),{href:`https://arxiv.org/abs/2407.21783`,rel:`nofollow`,children:(e,t)=>{_(),c(e,o(`Meta’s paper detailing the training process for the LLaMA 3 models`))},$$slots:{default:!0}}),_(),a($),_(4),c(t,s)},$$slots:{default:!0}})),s()}export{B as default,T as metadata};
//# sourceMappingURL=B2jpZtWR.js.map
