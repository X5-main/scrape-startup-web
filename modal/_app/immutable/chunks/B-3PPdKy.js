(function(){try{var e=typeof window<`u`?window:typeof global<`u`?global:typeof globalThis<`u`?globalThis:typeof self<`u`?self:{};e.SENTRY_RELEASE={id:`f99fcf9f0a844cc9bd13fdc8e5782b84`};var t=new e.Error().stack;t&&(e._sentryDebugIds=e._sentryDebugIds||{},e._sentryDebugIds[t]=`762aaeb8-cdda-4202-ac40-863da1542955`,e._sentryDebugIdIdentifier=`sentry-dbid-762aaeb8-cdda-4202-ac40-863da1542955`)}catch{}})();import{$t as e,St as t,Tn as n,Tt as r,bt as i,c as a,d as o,en as s,tn as c,wn as l}from"./F_ixKBiO.js";import"./B1sc9Zdx.js";import"./Bb2deiU3.js";import{t as u}from"./BILrvr3I.js";import{t as d}from"./DeWGVqas2.js";import{t as f}from"./CdZDxCfO2.js";var p={title:`The easiest way to run a Docker image in the cloud`,description:`Have a Docker image? Run it in the cloud with Modal.`,authors:[{name:`Yiren Lu`,avatarUrl:`https://modal-cdn.com/ren-lu.jpg`,jobTitle:`Solutions Engineer`,twitterHandle:`YirenLu`}],date:`2025-02-24T12:00:00.000Z`,length:`5 minute read`,category:`Article`,subcategory:`Frameworks and Tools`,published:!0,layout:`blog`,toc:[{depth:2,value:`Why use Modal to run Docker images?`,id:`why-use-modal-to-run-docker-images`,children:[{depth:3,value:`✅ No infrastructure management`,id:`-no-infrastructure-management`},{depth:3,value:`✅ Automatic scaling`,id:`-automatic-scaling`},{depth:3,value:`✅ Simple API integration`,id:`-simple-api-integration`},{depth:3,value:`✅ Cost efficiency`,id:`-cost-efficiency`}]},{depth:2,value:`Prerequisites`,id:`prerequisites`},{depth:2,value:`Running an arbitrary public image`,id:`running-an-arbitrary-public-image`},{depth:2,value:`Running a private registry image`,id:`running-a-private-registry-image`},{depth:2,value:`Running a custom Docker image from a Dockerfile`,id:`running-a-custom-docker-image-from-a-dockerfile`},{depth:2,value:`Conclusion`,id:`conclusion`}],rawContent:`Docker has revolutionized the way developers build, package, and distribute
applications. By containerizing an application, you ensure that it runs
consistently across different environments, reducing the "works on my machine"
problem. But while running a Docker image locally is straightforward (you can
use [Docker Desktop](https://www.docker.com/products/docker-desktop/) or [Docker Engine](https://docs.docker.com/engine/)), deploying and managing it in the cloud introduces
complexities — networking, scaling, and infrastructure overhead, to name a few.

This is where [Modal](https://modal.com) comes in.

[Modal](https://modal.com) is a Python library that lets you run code in
containers in the cloud - and it's the easiest way to run a Docker image in the
cloud.

Modal allows you to specify custom images for those containers, including images
from public registries like Docker Hub as well as [private images](https://modal.com/docs/guide/existing-images) from AWS ECR
and GCP Artifact Registry.

In this guide, we'll cover how you can run both public and private images, as
well as images defined in a
Dockerfile, on Modal, in less than
five minutes.

## Why use Modal to run Docker images?

Modal provides the **fastest, easiest, and most developer-friendly** way to run Docker containers in the cloud. Here's why it stands out:

### ✅ **No infrastructure management**

With Modal, you don't need to provision VMs, manage Kubernetes clusters, or worry about networking. Just define your container, and Modal handles the rest.

### ✅ **Automatic scaling**

Modal seamlessly scales your workloads up or down based on demand, eliminating the need for manual tuning or auto-scaling configurations.

### ✅ **Simple API integration**

Unlike traditional cloud providers that require complex CLI tools and configurations, Modal lets you run Docker images using a simple Python-based API.

### ✅ **Cost efficiency**

Modal only charges for compute time, so your containers shut down when they're
not in use—perfect for intermittent workloads like batch jobs or model
inference.

## Prerequisites

To run a Docker image on Modal, you will need to:

- Create an account at [modal.com](https://modal.com)
- Run \`pip install modal\` to install the modal Python package
- Run \`modal setup\` to authenticate (if this doesn't work, try \`python -m modal setup\`)
- Copy the code below into a file called \`app.py\`
- Run \`modal deploy app.py\` to deploy your function

## Running an arbitrary public image

Public registries like [Docker Hub](https://hub.docker.com/) have many pre-built
container images for common software packages. You can specify public images for your Modal function using [\`Image.from_registry\`](/docs/guide/existing-images).

In the example below, we run an official CUDA image from Docker Hub that is a
requirement for running \`cupy\`, a CUDA replacement for \`numpy\`.

\`\`\`python
import modal

# 1) use officially supported CUDA image
# 2) pip install cupy, a CUDA replacement for numpy
image = modal.Image.from_registry("nvidia/cuda:12.4.0-devel-ubuntu22.04", add_python="3.11").pip_install("cupy-cuda12x")

app = modal.App("example-gpu", image=image)


@app.function(gpu="A10G")  # 3) attach a GPU to your function
def square(x=2):
    import cupy as cp

    print(f"The square of {x} is {cp.square(x)}")

\`\`\`

## Running a private registry image

Private Docker Hub, AWS ECR, and GCP Artifact Registry images are [also supported](/docs/guide/existing-images).

## Running a custom Docker image from a Dockerfile

Sometimes, you might be working in a setting where the environment is already defined as a container image in the form of a Dockerfile. Modal supports defining a container image directly from a Dockerfile via the [\`Image.from_dockerfile\`](/docs/reference/modal.Image#from_dockerfile) function. It takes a path to an existing Dockerfile.

For instance, we might write a Dockerfile based on the official Python image and add \`scikit-learn\`:

\`\`\`dockerfile
FROM python:3.11

RUN pip install sklearn
\`\`\`

We can then define a Modal image from this Dockerfile:

\`\`\`python
import modal

dockerfile_image = modal.Image.from_dockerfile("Dockerfile")

@app.function(image=dockerfile_image)
def fit():
    import sklearn
    ...
\`\`\`

## Conclusion

Running a Docker image in the cloud doesn't have to be complicated. With Modal, you can go from a local containerized app to a fully managed cloud deployment in just a few lines of Python code.

Whether you're deploying web applications, machine learning models, or batch
processing workloads, Modal offers the easiest and most scalable way to run
Docker images and more in the cloud.

Try [Modal](https://modal.com) today and simplify your cloud container deployments!
`,meta:{description:`Have a Docker image? Run it in the cloud with Modal.`}},{title:m,description:h,authors:g,date:_,length:v,category:y,subcategory:b,published:x,layout:S,toc:C,rawContent:w,meta:T}=p,E=t(`<code>Image.from_registry</code>`),D=t(`<code>Image.from_dockerfile</code>`),O=t(`<p>Docker has revolutionized the way developers build, package, and distribute
applications. By containerizing an application, you ensure that it runs
consistently across different environments, reducing the “works on my machine”
problem. But while running a Docker image locally is straightforward (you can
use <!> or <!>), deploying and managing it in the cloud introduces
complexities — networking, scaling, and infrastructure overhead, to name a few.</p> <p>This is where <!> comes in.</p> <p><!> is a Python library that lets you run code in
containers in the cloud - and it’s the easiest way to run a Docker image in the
cloud.</p> <p>Modal allows you to specify custom images for those containers, including images
from public registries like Docker Hub as well as <!> from AWS ECR
and GCP Artifact Registry.</p> <p>In this guide, we’ll cover how you can run both public and private images, as
well as images defined in a
Dockerfile, on Modal, in less than
five minutes.</p> <h2 id="why-use-modal-to-run-docker-images">Why use Modal to run Docker images?</h2> <p>Modal provides the <strong>fastest, easiest, and most developer-friendly</strong> way to run Docker containers in the cloud. Here’s why it stands out:</p> <h3 id="-no-infrastructure-management">✅ <strong>No infrastructure management</strong></h3> <p>With Modal, you don’t need to provision VMs, manage Kubernetes clusters, or worry about networking. Just define your container, and Modal handles the rest.</p> <h3 id="-automatic-scaling">✅ <strong>Automatic scaling</strong></h3> <p>Modal seamlessly scales your workloads up or down based on demand, eliminating the need for manual tuning or auto-scaling configurations.</p> <h3 id="-simple-api-integration">✅ <strong>Simple API integration</strong></h3> <p>Unlike traditional cloud providers that require complex CLI tools and configurations, Modal lets you run Docker images using a simple Python-based API.</p> <h3 id="-cost-efficiency">✅ <strong>Cost efficiency</strong></h3> <p>Modal only charges for compute time, so your containers shut down when they’re
not in use—perfect for intermittent workloads like batch jobs or model
inference.</p> <h2 id="prerequisites">Prerequisites</h2> <p>To run a Docker image on Modal, you will need to:</p> <ul><li>Create an account at <!></li> <li>Run <code>pip install modal</code> to install the modal Python package</li> <li>Run <code>modal setup</code> to authenticate (if this doesn’t work, try <code>python -m modal setup</code>)</li> <li>Copy the code below into a file called <code>app.py</code></li> <li>Run <code>modal deploy app.py</code> to deploy your function</li></ul> <h2 id="running-an-arbitrary-public-image">Running an arbitrary public image</h2> <p>Public registries like <!> have many pre-built
container images for common software packages. You can specify public images for your Modal function using <!>.</p> <p>In the example below, we run an official CUDA image from Docker Hub that is a
requirement for running <code>cupy</code>, a CUDA replacement for <code>numpy</code>.</p> <!> <h2 id="running-a-private-registry-image">Running a private registry image</h2> <p>Private Docker Hub, AWS ECR, and GCP Artifact Registry images are <!>.</p> <h2 id="running-a-custom-docker-image-from-a-dockerfile">Running a custom Docker image from a Dockerfile</h2> <p>Sometimes, you might be working in a setting where the environment is already defined as a container image in the form of a Dockerfile. Modal supports defining a container image directly from a Dockerfile via the <!> function. It takes a path to an existing Dockerfile.</p> <p>For instance, we might write a Dockerfile based on the official Python image and add <code>scikit-learn</code>:</p> <!> <p>We can then define a Modal image from this Dockerfile:</p> <!> <h2 id="conclusion">Conclusion</h2> <p>Running a Docker image in the cloud doesn’t have to be complicated. With Modal, you can go from a local containerized app to a fully managed cloud deployment in just a few lines of Python code.</p> <p>Whether you’re deploying web applications, machine learning models, or batch
processing workloads, Modal offers the easiest and most scalable way to run
Docker images and more in the cloud.</p> <p>Try <!> today and simplify your cloud container deployments!</p>`,1);function k(t,m){let h=a(m,[`children`,`$$slots`,`$$events`,`$$legacy`]);f(t,o(()=>h,()=>p,{children:(t,a)=>{var o=O(),f=s(o),p=c(e(f));d(p,{href:`https://www.docker.com/products/docker-desktop/`,rel:`nofollow`,children:(e,t)=>{l(),i(e,r(`Docker Desktop`))},$$slots:{default:!0}}),d(c(p,2),{href:`https://docs.docker.com/engine/`,rel:`nofollow`,children:(e,t)=>{l(),i(e,r(`Docker Engine`))},$$slots:{default:!0}}),l(),n(f);var m=c(f,2);d(c(e(m)),{href:`https://modal.com`,rel:`nofollow`,children:(e,t)=>{l(),i(e,r(`Modal`))},$$slots:{default:!0}}),l(),n(m);var h=c(m,2);d(e(h),{href:`https://modal.com`,rel:`nofollow`,children:(e,t)=>{l(),i(e,r(`Modal`))},$$slots:{default:!0}}),l(),n(h);var g=c(h,2);d(c(e(g)),{href:`https://modal.com/docs/guide/existing-images`,rel:`nofollow`,children:(e,t)=>{l(),i(e,r(`private images`))},$$slots:{default:!0}}),l(),n(g);var _=c(g,28),v=e(_);d(c(e(v)),{href:`https://modal.com`,rel:`nofollow`,children:(e,t)=>{l(),i(e,r(`modal.com`))},$$slots:{default:!0}}),n(v),l(8),n(_);var y=c(_,4),b=c(e(y));d(b,{href:`https://hub.docker.com/`,rel:`nofollow`,children:(e,t)=>{l(),i(e,r(`Docker Hub`))},$$slots:{default:!0}}),d(c(b,2),{href:`/docs/guide/existing-images`,children:(e,t)=>{i(e,E())},$$slots:{default:!0}}),l(),n(y);var x=c(y,4);u(x,{code:`import%20modal%0A%0A%23%201)%20use%20officially%20supported%20CUDA%20image%0A%23%202)%20pip%20install%20cupy%2C%20a%20CUDA%20replacement%20for%20numpy%0Aimage%20%3D%20modal.Image.from_registry(%22nvidia%2Fcuda%3A12.4.0-devel-ubuntu22.04%22%2C%20add_python%3D%223.11%22).pip_install(%22cupy-cuda12x%22)%0A%0Aapp%20%3D%20modal.App(%22example-gpu%22%2C%20image%3Dimage)%0A%0A%0A%40app.function(gpu%3D%22A10G%22)%20%20%23%203)%20attach%20a%20GPU%20to%20your%20function%0Adef%20square(x%3D2)%3A%0A%20%20%20%20import%20cupy%20as%20cp%0A%0A%20%20%20%20print(f%22The%20square%20of%20%7Bx%7D%20is%20%7Bcp.square(x)%7D%22)%0A`,lang:`python`});var S=c(x,4);d(c(e(S)),{href:`/docs/guide/existing-images`,children:(e,t)=>{l(),i(e,r(`also supported`))},$$slots:{default:!0}}),l(),n(S);var C=c(S,4);d(c(e(C)),{href:`/docs/reference/modal.Image#from_dockerfile`,children:(e,t)=>{i(e,D())},$$slots:{default:!0}}),l(),n(C);var w=c(C,4);u(w,{code:`FROM%20python%3A3.11%0A%0ARUN%20pip%20install%20sklearn`,lang:`dockerfile`});var T=c(w,4);u(T,{code:`import%20modal%0A%0Adockerfile_image%20%3D%20modal.Image.from_dockerfile(%22Dockerfile%22)%0A%0A%40app.function(image%3Ddockerfile_image)%0Adef%20fit()%3A%0A%20%20%20%20import%20sklearn%0A%20%20%20%20...`,lang:`python`});var k=c(T,8);d(c(e(k)),{href:`https://modal.com`,rel:`nofollow`,children:(e,t)=>{l(),i(e,r(`Modal`))},$$slots:{default:!0}}),l(),n(k),i(t,o)},$$slots:{default:!0}}))}export{k as default,p as metadata};
//# sourceMappingURL=B-3PPdKy.js.map
