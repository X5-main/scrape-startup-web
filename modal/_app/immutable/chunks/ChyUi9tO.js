(function(){try{var e=typeof window<`u`?window:typeof global<`u`?global:typeof globalThis<`u`?globalThis:typeof self<`u`?self:{};e.SENTRY_RELEASE={id:`f99fcf9f0a844cc9bd13fdc8e5782b84`};var t=new e.Error().stack;t&&(e._sentryDebugIds=e._sentryDebugIds||{},e._sentryDebugIds[t]=`000f8ec5-bd03-45e4-889a-4797d2c5daa4`,e._sentryDebugIdIdentifier=`sentry-dbid-000f8ec5-bd03-45e4-889a-4797d2c5daa4`)}catch{}})();import{$t as e,St as t,Tn as n,Tt as r,bt as i,c as a,d as o,en as s,tn as c,wn as l}from"./F_ixKBiO.js";import"./B1sc9Zdx.js";import"./Bb2deiU3.js";import{t as u}from"./Dz6DfB4R.js";import{t as d}from"./BILrvr3I.js";import{t as f}from"./DeWGVqas2.js";import{t as p}from"./CdZDxCfO2.js";var m={title:`How Modal speeds up container launches in the cloud`,description:`Optimizations for blazing fast container launches`,authors:[{name:`Yiren Lu`,avatarUrl:`https://modal-cdn.com/ren-lu.jpg`,jobTitle:`Solutions Engineer`,twitterHandle:`YirenLu`}],date:`2024-08-16T12:00:00.000Z`,length:`5 minute read`,category:`Article`,subcategory:`Data Infrastructure`,published:!0,layout:`blog`,toc:[{depth:2,value:`Understanding containers`,id:`understanding-containers`},{depth:2,value:`Shortening image pulls`,id:`shortening-image-pulls`},{depth:2,value:`Reducing image bloat`,id:`reducing-image-bloat`},{depth:2,value:`Avoiding Docker`,id:`avoiding-docker`},{depth:2,value:`Caching frequently accessed files locally`,id:`caching-frequently-accessed-files-locally`},{depth:2,value:`Content-addressed caching`,id:`content-addressed-caching`},{depth:2,value:`Conclusion`,id:`conclusion`}],rawContent:`At Modal, one of our goals is to make running code in the cloud as intuitive and easy as running code locally.

To do this, we've had to architect a system that spins up cloud-based containers (with your code in them) as fast as possible, ideally under 1 second.

In this article, we will cover some of the techniques around how we did this.

## Understanding containers

Let's start with what a container is.

Think of a container as a lightweight, stand-alone, executable package of software that includes everything needed to run it, isolated from the rest of the system. This includes the code, runtime, system tools, libraries, and settings.

At the heart of a container is a Linux root file system that replicates a traditional Linux environment with directories like \`usr\`, \`etc\`, and \`lib\`. Containers also include various features for resource management and security.

Containers ensure resources are isolated, allowing applications to run effectively without affecting one another.

## Shortening image pulls

While containers solve many problems related to software consistency and isolation, running them efficiently in the cloud presents new challenges.

One of the most significant is the time it takes to pull a container image from a remote repository.

Container images can be large, often weighing in at several hundred megabytes or even gigabytes. For example, a standard Docker image might be around 1 GB, and more complex applications that rely on frameworks like CUDA or TensorFlow can easily exceed 10 GB. Pulling such large images from a remote repository can take several minutes.

This slow download time can be a significant bottleneck. The infamous Docker progress bar, slowly filling as the image downloads, is a common sight for anyone who has worked with containers in the cloud.

## Reducing image bloat

One of the primary reasons for the slow download times is that many container images are unnecessarily bloated. A typical container might contain thousands of files, many of which are not even used by the application.

Some developers attempt to address this issue by optimizing their Dockerfiles, which is a good start, but we wanted to go even deeper.

We noticed that when running a Python application, the system might make thousands of file system calls, but only access a small fraction of the files in the container image.

For example, executing the command:

\`\`\`bash
$ python3 -c 'import sklearn'
\`\`\`

results in:

- **3,043 calls to \`stat\`**
- **1,073 calls to \`openat\`**

but only actually accesses 1,000 unique files. This means that a vast majority of the files in the container image are not even being used.

By identifying and focusing on the essential files needed to run an application, it's possible to significantly reduce the size of the container image and, consequently, the time it takes to pull and start the container.

## Avoiding Docker

While Docker itself is a powerful tool for managing containers, it comes with some overhead that can slow down the process of launching containers, especially in the cloud. To streamline the process, it's possible to bypass Docker entirely and use a lightweight container runtime like [**runc**](https://www.docker.com/blog/runc/) or [**gVisor**](https://gvisor.dev/).

These runtimes won't manage images or containers; instead, they simply point to a root filesystem and takes a JSON configuration to execute a container.

This opens up a way for us to start the container without having to pull images at all.

After constructing the image, Modal transfers it to network storage. Following this, when it comes time to run the container, Modal deploys \`gVisor\`, providing it with a root filesystem that's stored on the network.

Rather than wasting time waiting for an image to download, the container can launch almost immediately since necessary files are already on the network share.

(Note: a further reason we use \`gVisor\` and not regular containers is that it is more secure. Regular containers share the host system's kernel. This means that if a vulnerability is discovered in the kernel, it could potentially affect all containers running on that host. Conversely, a malicious container might be able to exploit kernel vulnerabilities to break out of its container and access the host system or other containers. \`gVisor\` works by intercepting application system calls and acts as a guest kernel, limiting the surface area for potential attacks.)

## Caching frequently accessed files locally

Even with optimizations like avoiding Docker and reducing image size, there's still the issue of file system latency. For instance, executing heavy imports leads to a significant number of file operations. Even with NFS latency around 2 milliseconds, if you have around 4,000 file accesses, this can lead to an wait time of approximately 8 seconds.

The solution we landed on is to cache frequently accessed files locally. By storing these files on a local SSD or in memory, it's possible to reduce access times dramatically. Local SSDs have latencies in the range of 100 microseconds. Caching files in the Linux page cache can bring latencies down even further.

Caching is especially effective when running the same container image multiple times, as many of the files accessed will be the same. Even when running different images, there's often a significant overlap in the files they access.

## Content-addressed caching

To effectively cache files, we can deploy a technique called content-addressing. This method involves hashing the contents of each file, then leveraging that hash to define the storage location for each file.

When \`gVisor\` tries to access a file, it first checks the cache to see if the file is already available locally. If it is, the file is returned from the cache, bypassing the need to access the network or disk.

If the file isn't in the cache, it can be fetched from the network and stored locally for future use. This approach ensures that the most frequently accessed files are always available quickly, significantly improving the performance of container workloads.

To do this, we had to set up a simple filesystem in FUSE (Filesystem in Userspace). Contrary to popular belief, building filesystems isn't prohibitively complex. You can even do this in Python!

## Conclusion

By focusing on what's essential for running an application and avoiding unnecessary overhead, we've developed a system that significantly reduces the time it takes to start containers, making it easier for developers to deploy and scale their applications in the cloud. To see this for yourself, you can get started with Modal [here](/docs).

**This article is adapted from Erik Bernhardsson's 2023 talk at Data Council.**

<YoutubeEmbed videoId="3jJ1GhGkLY0" />
`,meta:{description:`Optimizations for blazing fast container launches`}},{title:h,description:g,authors:_,date:v,length:y,category:b,subcategory:x,published:S,layout:C,toc:w,rawContent:T,meta:E}=m,D=t(`<strong>runc</strong>`),O=t(`<strong>gVisor</strong>`),k=t(`<p>At Modal, one of our goals is to make running code in the cloud as intuitive and easy as running code locally.</p> <p>To do this, we’ve had to architect a system that spins up cloud-based containers (with your code in them) as fast as possible, ideally under 1 second.</p> <p>In this article, we will cover some of the techniques around how we did this.</p> <h2 id="understanding-containers">Understanding containers</h2> <p>Let’s start with what a container is.</p> <p>Think of a container as a lightweight, stand-alone, executable package of software that includes everything needed to run it, isolated from the rest of the system. This includes the code, runtime, system tools, libraries, and settings.</p> <p>At the heart of a container is a Linux root file system that replicates a traditional Linux environment with directories like <code>usr</code>, <code>etc</code>, and <code>lib</code>. Containers also include various features for resource management and security.</p> <p>Containers ensure resources are isolated, allowing applications to run effectively without affecting one another.</p> <h2 id="shortening-image-pulls">Shortening image pulls</h2> <p>While containers solve many problems related to software consistency and isolation, running them efficiently in the cloud presents new challenges.</p> <p>One of the most significant is the time it takes to pull a container image from a remote repository.</p> <p>Container images can be large, often weighing in at several hundred megabytes or even gigabytes. For example, a standard Docker image might be around 1 GB, and more complex applications that rely on frameworks like CUDA or TensorFlow can easily exceed 10 GB. Pulling such large images from a remote repository can take several minutes.</p> <p>This slow download time can be a significant bottleneck. The infamous Docker progress bar, slowly filling as the image downloads, is a common sight for anyone who has worked with containers in the cloud.</p> <h2 id="reducing-image-bloat">Reducing image bloat</h2> <p>One of the primary reasons for the slow download times is that many container images are unnecessarily bloated. A typical container might contain thousands of files, many of which are not even used by the application.</p> <p>Some developers attempt to address this issue by optimizing their Dockerfiles, which is a good start, but we wanted to go even deeper.</p> <p>We noticed that when running a Python application, the system might make thousands of file system calls, but only access a small fraction of the files in the container image.</p> <p>For example, executing the command:</p> <!> <p>results in:</p> <ul><li><strong>3,043 calls to <code>stat</code></strong></li> <li><strong>1,073 calls to <code>openat</code></strong></li></ul> <p>but only actually accesses 1,000 unique files. This means that a vast majority of the files in the container image are not even being used.</p> <p>By identifying and focusing on the essential files needed to run an application, it’s possible to significantly reduce the size of the container image and, consequently, the time it takes to pull and start the container.</p> <h2 id="avoiding-docker">Avoiding Docker</h2> <p>While Docker itself is a powerful tool for managing containers, it comes with some overhead that can slow down the process of launching containers, especially in the cloud. To streamline the process, it’s possible to bypass Docker entirely and use a lightweight container runtime like <!> or <!>.</p> <p>These runtimes won’t manage images or containers; instead, they simply point to a root filesystem and takes a JSON configuration to execute a container.</p> <p>This opens up a way for us to start the container without having to pull images at all.</p> <p>After constructing the image, Modal transfers it to network storage. Following this, when it comes time to run the container, Modal deploys <code>gVisor</code>, providing it with a root filesystem that’s stored on the network.</p> <p>Rather than wasting time waiting for an image to download, the container can launch almost immediately since necessary files are already on the network share.</p> <p>(Note: a further reason we use <code>gVisor</code> and not regular containers is that it is more secure. Regular containers share the host system’s kernel. This means that if a vulnerability is discovered in the kernel, it could potentially affect all containers running on that host. Conversely, a malicious container might be able to exploit kernel vulnerabilities to break out of its container and access the host system or other containers. <code>gVisor</code> works by intercepting application system calls and acts as a guest kernel, limiting the surface area for potential attacks.)</p> <h2 id="caching-frequently-accessed-files-locally">Caching frequently accessed files locally</h2> <p>Even with optimizations like avoiding Docker and reducing image size, there’s still the issue of file system latency. For instance, executing heavy imports leads to a significant number of file operations. Even with NFS latency around 2 milliseconds, if you have around 4,000 file accesses, this can lead to an wait time of approximately 8 seconds.</p> <p>The solution we landed on is to cache frequently accessed files locally. By storing these files on a local SSD or in memory, it’s possible to reduce access times dramatically. Local SSDs have latencies in the range of 100 microseconds. Caching files in the Linux page cache can bring latencies down even further.</p> <p>Caching is especially effective when running the same container image multiple times, as many of the files accessed will be the same. Even when running different images, there’s often a significant overlap in the files they access.</p> <h2 id="content-addressed-caching">Content-addressed caching</h2> <p>To effectively cache files, we can deploy a technique called content-addressing. This method involves hashing the contents of each file, then leveraging that hash to define the storage location for each file.</p> <p>When <code>gVisor</code> tries to access a file, it first checks the cache to see if the file is already available locally. If it is, the file is returned from the cache, bypassing the need to access the network or disk.</p> <p>If the file isn’t in the cache, it can be fetched from the network and stored locally for future use. This approach ensures that the most frequently accessed files are always available quickly, significantly improving the performance of container workloads.</p> <p>To do this, we had to set up a simple filesystem in FUSE (Filesystem in Userspace). Contrary to popular belief, building filesystems isn’t prohibitively complex. You can even do this in Python!</p> <h2 id="conclusion">Conclusion</h2> <p>By focusing on what’s essential for running an application and avoiding unnecessary overhead, we’ve developed a system that significantly reduces the time it takes to start containers, making it easier for developers to deploy and scale their applications in the cloud. To see this for yourself, you can get started with Modal <!>.</p> <p><strong>This article is adapted from Erik Bernhardsson’s 2023 talk at Data Council.</strong></p> <!>`,1);function A(t,h){let g=a(h,[`children`,`$$slots`,`$$events`,`$$legacy`]);p(t,o(()=>g,()=>m,{children:(t,a)=>{var o=k(),p=c(s(o),36);d(p,{code:`%24%20python3%20-c%20'import%20sklearn'`,lang:`bash`});var m=c(p,12),h=c(e(m));f(h,{href:`https://www.docker.com/blog/runc/`,rel:`nofollow`,children:(e,t)=>{i(e,D())},$$slots:{default:!0}}),f(c(h,2),{href:`https://gvisor.dev/`,rel:`nofollow`,children:(e,t)=>{i(e,O())},$$slots:{default:!0}}),l(),n(m);var g=c(m,32);f(c(e(g)),{href:`/docs`,children:(e,t)=>{l(),i(e,r(`here`))},$$slots:{default:!0}}),l(),n(g),u(c(g,4),{videoId:`3jJ1GhGkLY0`}),i(t,o)},$$slots:{default:!0}}))}export{A as default,m as metadata};
//# sourceMappingURL=ChyUi9tO.js.map
