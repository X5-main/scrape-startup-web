(function(){try{var e=typeof window<`u`?window:typeof global<`u`?global:typeof globalThis<`u`?globalThis:typeof self<`u`?self:{};e.SENTRY_RELEASE={id:`f99fcf9f0a844cc9bd13fdc8e5782b84`};var t=new e.Error().stack;t&&(e._sentryDebugIds=e._sentryDebugIds||{},e._sentryDebugIds[t]=`e8d9992c-81d8-4ce2-bd90-68ef306de752`,e._sentryDebugIdIdentifier=`sentry-dbid-e8d9992c-81d8-4ce2-bd90-68ef306de752`)}catch{}})();import{$t as e,St as t,Tn as n,Tt as r,bt as i,c as ee,d as a,en as te,tn as o,wn as s}from"./F_ixKBiO.js";import"./B1sc9Zdx.js";import"./Bb2deiU3.js";import{a as c,i as l,o as ne,r as u}from"./CPby7b1n.js";import{t as d}from"./BILrvr3I.js";import{t as f}from"./B4L_if842.js";import{t as p}from"./DeWGVqas2.js";var m={crossLinks:[{text:`Registry image for Algolia indexing`,href:`/docs/examples/algolia_indexer`}],toc:[{depth:1,value:`Using existing images`,id:`using-existing-images`,children:[{depth:2,value:`Load an image from a public registry with .from_registry`,id:`load-an-image-from-a-public-registry-with-from_registry`},{depth:2,value:`Load images from private registries`,id:`load-images-from-private-registries`,children:[{depth:3,value:`Docker Hub (Private)`,id:`docker-hub-private`},{depth:3,value:`Elastic Container Registry (ECR)`,id:`elastic-container-registry-ecr`},{depth:3,value:`Google Artifact Registry and Google Container Registry`,id:`google-artifact-registry-and-google-container-registry`},{depth:3,value:`Azure Container Registry (ACR)`,id:`azure-container-registry-acr`}]},{depth:2,value:`Bring your own image definition with .from_dockerfile`,id:`bring-your-own-image-definition-with-from_dockerfile`,children:[{depth:3,value:`Dockerfile command compatibility`,id:`dockerfile-command-compatibility`,children:[{depth:4,value:`USER`,id:`user`},{depth:4,value:`ENTRYPOINT`,id:`entrypoint`},{depth:4,value:`ENV`,id:`env`},{depth:4,value:`ADD`,id:`add`}]}]}]}],rawContent:`# Using existing images

This guide walks you through how to use an existing container image as a Modal Image.

\`\`\`python notest
sklearn_image = modal.Image.from_registry("huanjason/scikit-learn")
custom_image = modal.Image.from_dockerfile("./src/Dockerfile")
\`\`\`

## Load an image from a public registry with \`.from_registry\`

To load an image from a public registry, just pass the image name, including any tags, to [\`Image.from_registry\`](/docs/sdk/py/latest/Image#from_registry):

\`\`\`python
sklearn_image = modal.Image.from_registry("huanjason/scikit-learn")


@app.function(image=sklearn_image)
def fit_knn():
    from sklearn.neighbors import KNeighborsClassifier
    ...
\`\`\`

The \`from_registry\` method can load images from all public registries, such as
[Nvidia's \`nvcr.io\`](https://catalog.ngc.nvidia.com/containers),
[AWS ECR](https://aws.amazon.com/ecr/), and
[GitHub's \`ghcr.io\`](https://docs.github.com/en/packages/working-with-a-github-packages-registry/working-with-the-container-registry).

You can further modify the image [just like any other Modal Image](/docs/guide/images):

\`\`\`python continuation
data_science_image = sklearn_image.uv_pip_install("polars", "datasette")
\`\`\`

You can use external images so long as

- The image is built for the
  [\`linux/amd64\` platform](https://unix.stackexchange.com/questions/53415/why-are-64-bit-distros-often-called-amd64)
- The image has a [compatible \`ENTRYPOINT\`](#entrypoint)

Additionally, to be used with a Modal Function, the image needs to have \`python\` and \`pip\`
installed and available on the \`$PATH\`.
If an existing image does not have either \`python\` or \`pip\` set up compatibly, you
can still use it. Just provide a version number as the \`add_python\` argument to
install a reproducible
[standalone build](https://github.com/indygreg/python-build-standalone)
of Python:

\`\`\`python
ubuntu_image = modal.Image.from_registry("ubuntu:22.04", add_python="3.11")
valhalla_image = modal.Image.from_registry("gisops/valhalla:latest", add_python="3.12")
\`\`\`

There are some additional restrictions for older versions of the Modal image builder.
Image builder version is set at a workspace level via the settings page [here](/settings/image-builder-version).
See the migration guides on that page for details on any additional restrictions on images.

## Load images from private registries

You can also use images defined in private container registries on Modal.
The exact method depends on the registry you are using.

### Docker Hub (Private)

To pull container images from private Docker Hub repositories,
[create an access token](https://docs.docker.com/security/for-developers/access-tokens/)
with "Read-Only" permissions and use this token value and your Docker Hub
username to create a Modal [Secret](/docs/guide/secrets).

\`\`\`
REGISTRY_USERNAME=my-dockerhub-username
REGISTRY_PASSWORD=dckr_pat_TS012345aaa67890bbbb1234ccc
\`\`\`

Use this Secret with the
[\`modal.Image.from_registry\`](/docs/sdk/py/latest/Image#from_registry) method.

### Elastic Container Registry (ECR)

You can pull images from your AWS ECR account by specifying the full image URI
as follows:

\`\`\`python
import modal

aws_secret = modal.Secret.from_name("my-aws-secret")
image = (
    modal.Image.from_aws_ecr(
        "000000000000.dkr.ecr.us-east-1.amazonaws.com/my-private-registry:latest",
        secret=aws_secret,
    )
    .pip_install("torch", "numpy", "huggingface")
)

app = modal.App(image=image)
\`\`\`

As shown above, you also need to use a [Modal Secret](/docs/guide/secrets)
containing the environment variables \`AWS_ACCESS_KEY_ID\`,
\`AWS_SECRET_ACCESS_KEY\`, and \`AWS_REGION\`. The AWS IAM user account associated
with those keys must have access to the private registry you want to access.

Alternatively, you can use [OIDC token authentication](/docs/guide/oidc-integration#pull-images-from-aws-elastic-container-registry-ecr).

The user needs to have the following read-only policies:

\`\`\`json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Action": ["ecr:GetAuthorizationToken"],
      "Effect": "Allow",
      "Resource": "*"
    },
    {
      "Effect": "Allow",
      "Action": [
        "ecr:BatchCheckLayerAvailability",
        "ecr:GetDownloadUrlForLayer",
        "ecr:GetRepositoryPolicy",
        "ecr:DescribeRepositories",
        "ecr:ListImages",
        "ecr:DescribeImages",
        "ecr:BatchGetImage",
        "ecr:GetLifecyclePolicy",
        "ecr:GetLifecyclePolicyPreview",
        "ecr:ListTagsForResource",
        "ecr:DescribeImageScanFindings"
      ],
      "Resource": "<MY-REGISTRY-ARN>"
    }
  ]
}
\`\`\`

You can use the IAM configuration above as a template for creating an IAM user.
You can then
[generate an access key](https://aws.amazon.com/premiumsupport/knowledge-center/create-access-key/)
and create a Modal Secret using the AWS integration option. Modal will use your
access keys to generate an ephemeral ECR token. That token is only used to pull
image layers at the time a new image is built. We don't store this token but
will cache the image once it has been pulled.

Images on ECR must be private and follow
[image configuration requirements](/docs/sdk/py/latest/Image#from_aws_ecr).

### Google Artifact Registry and Google Container Registry

For further detail on how to pull images from Google's image registries, see
[\`modal.Image.from_gcp_artifact_registry\`](/docs/sdk/py/latest/Image#from_gcp_artifact_registry).

### Azure Container Registry (ACR)

Modal doesn't have native Azure support, but you can pull images from a private ACR using
ACR's [token-based repository permissions](https://learn.microsoft.com/en-us/azure/container-registry/container-registry-token-based-repository-permissions)
to generate long-lived Docker credentials. Those credentials (token and password) can then be stored
as a Modal Secret and used with [\`modal.Image.from_registry\`](/docs/sdk/py/latest/Image#from_registry)
the same way as [Docker Hub private registry](#docker-hub-private) credentials.

## Bring your own image definition with \`.from_dockerfile\`

You can define an Image from an existing Dockerfile by passing its path to
[\`Image.from_dockerfile\`](/docs/sdk/py/latest/Image#from_dockerfile):

\`\`\`python
dockerfile_image = modal.Image.from_dockerfile("Dockerfile")


@app.function(image=dockerfile_image)
def fit():
    import sklearn
    ...
\`\`\`

Note that you can still extend this Image using image builder methods!
See [the guide](/docs/guide/images) for details.

### Dockerfile command compatibility

Since Modal doesn't use Docker to build containers, we have our own
implementation of the
[Dockerfile specification](https://docs.docker.com/engine/reference/builder/).
Most Dockerfiles should work out of the box, but there are some differences to
be aware of.

First, a few minor Dockerfile commands and flags have not been implemented yet.
These include \`EXPOSE\`, \`HEALTHCHECK\`, \`LABEL\`, \`ONBUILD\`, \`STOPSIGNAL\`, and
\`VOLUME\`.
Please reach out to us if your use case requires any of these.

Next, there are some command-specific things that may be useful when porting a
Dockerfile to Modal.

#### \`USER\`

Modal containers always run as root (uid 0). The
[\`USER\`](https://docs.docker.com/engine/reference/builder/#user) instruction is
ignored, whether it appears in your Dockerfile or is inherited from a base image
pulled with [\`Image.from_registry\`](/docs/sdk/py/latest/Image#from_registry).

To [reduce privileges](https://dwheeler.com/secure-programs/Secure-Programs-HOWTO/minimize-privileges.html)
for programs running inside your Modal containers, use OS user management features
like [\`setuid\`](https://man7.org/linux/man-pages/man2/setuid.2.html). For instance,
in Python, you can pass in a \`user\`during [subprocess creation](https://docs.python.org/3/library/subprocess.html).

#### \`ENTRYPOINT\`

While the
[\`ENTRYPOINT\`](https://docs.docker.com/engine/reference/builder/#entrypoint)
command is supported, there is an additional constraint to the entrypoint script
provided: when used with a Modal Function, it must also \`exec\` the arguments passed to it at some point.
This is so the Modal Function runtime's Python entrypoint can run after your own. Most entrypoint
scripts in Docker containers are wrappers over other scripts, so this is likely
already the case.

If you wish to write your own entrypoint script, you can use the following as a
template:

\`\`\`bash
#!/usr/bin/env bash

# Your custom startup commands here.

exec "$@" # Runs the command passed to the entrypoint script.
\`\`\`

If the above file is saved as \`/usr/bin/my_entrypoint.sh\` in your container,
then you can register it as an entrypoint with
\`ENTRYPOINT ["/usr/bin/my_entrypoint.sh"]\` in your Dockerfile, or with
[\`entrypoint\`](/docs/sdk/py/latest/Image#entrypoint) as an
Image build step.

\`\`\`python
import modal

image = (
    modal.Image.debian_slim()
    .pip_install("foo")
    .entrypoint(["/usr/bin/my_entrypoint.sh"])
)
\`\`\`

#### \`ENV\`

We currently don't support default values in
[interpolations](https://docs.docker.com/compose/compose-file/12-interpolation/),
such as \`\${VAR:-default}\`

#### \`ADD\`

\`ADD\` is limited to fetching from single URLs.
Tar extraction, multiple URLs, and copy operations are currently not supported.
`,meta:{title:`Using existing images`,description:`This guide walks you through how to use an existing container image as a Modal Image.`}},{crossLinks:h,toc:g,rawContent:_,meta:v}=m,re=t(`Load an image from a public registry with <code>.from_registry</code>`,1),ie=t(`<code>Image.from_registry</code>`),ae=t(`Nvidia’s <code>nvcr.io</code>`,1),oe=t(`GitHub’s <code>ghcr.io</code>`,1),se=t(`<code>linux/amd64</code> platform`,1),ce=t(`compatible <code>ENTRYPOINT</code>`,1),le=t(`<code>modal.Image.from_registry</code>`),ue=t(`<code>modal.Image.from_gcp_artifact_registry</code>`),de=t(`<code>modal.Image.from_registry</code>`),fe=t(`Bring your own image definition with <code>.from_dockerfile</code>`,1),pe=t(`<code>Image.from_dockerfile</code>`),me=t(`<code>USER</code>`),he=t(`<code>USER</code>`),ge=t(`<code>Image.from_registry</code>`),_e=t(`<code>setuid</code>`),ve=t(`<code>ENTRYPOINT</code>`),ye=t(`<code>ENTRYPOINT</code>`),be=t(`<code>entrypoint</code>`),xe=t(`<code>ENV</code>`),Se=t(`<code>ADD</code>`),Ce=t(`<!> <p>This guide walks you through how to use an existing container image as a Modal Image.</p> <!> <!> <p>To load an image from a public registry, just pass the image name, including any tags, to <!>:</p> <!> <p>The <code>from_registry</code> method can load images from all public registries, such as <!>, <!>, and <!>.</p> <p>You can further modify the image <!>:</p> <!> <p>You can use external images so long as</p> <ul><li>The image is built for the <!></li> <li>The image has a <!></li></ul> <p>Additionally, to be used with a Modal Function, the image needs to have <code>python</code> and <code>pip</code> installed and available on the <code>$PATH</code>.
If an existing image does not have either <code>python</code> or <code>pip</code> set up compatibly, you
can still use it. Just provide a version number as the <code>add_python</code> argument to
install a reproducible <!> of Python:</p> <!> <p>There are some additional restrictions for older versions of the Modal image builder.
Image builder version is set at a workspace level via the settings page <!>.
See the migration guides on that page for details on any additional restrictions on images.</p> <!> <p>You can also use images defined in private container registries on Modal.
The exact method depends on the registry you are using.</p> <!> <p>To pull container images from private Docker Hub repositories, <!> with “Read-Only” permissions and use this token value and your Docker Hub
username to create a Modal <!>.</p> <!> <p>Use this Secret with the <!> method.</p> <!> <p>You can pull images from your AWS ECR account by specifying the full image URI
as follows:</p> <!> <p>As shown above, you also need to use a <!> containing the environment variables <code>AWS_ACCESS_KEY_ID</code>, <code>AWS_SECRET_ACCESS_KEY</code>, and <code>AWS_REGION</code>. The AWS IAM user account associated
with those keys must have access to the private registry you want to access.</p> <p>Alternatively, you can use <!>.</p> <p>The user needs to have the following read-only policies:</p> <!> <p>You can use the IAM configuration above as a template for creating an IAM user.
You can then <!> and create a Modal Secret using the AWS integration option. Modal will use your
access keys to generate an ephemeral ECR token. That token is only used to pull
image layers at the time a new image is built. We don’t store this token but
will cache the image once it has been pulled.</p> <p>Images on ECR must be private and follow <!>.</p> <!> <p>For further detail on how to pull images from Google’s image registries, see <!>.</p> <!> <p>Modal doesn’t have native Azure support, but you can pull images from a private ACR using
ACR’s <!> to generate long-lived Docker credentials. Those credentials (token and password) can then be stored
as a Modal Secret and used with <!> the same way as <!> credentials.</p> <!> <p>You can define an Image from an existing Dockerfile by passing its path to <!>:</p> <!> <p>Note that you can still extend this Image using image builder methods!
See <!> for details.</p> <!> <p>Since Modal doesn’t use Docker to build containers, we have our own
implementation of the <!>.
Most Dockerfiles should work out of the box, but there are some differences to
be aware of.</p> <p>First, a few minor Dockerfile commands and flags have not been implemented yet.
These include <code>EXPOSE</code>, <code>HEALTHCHECK</code>, <code>LABEL</code>, <code>ONBUILD</code>, <code>STOPSIGNAL</code>, and <code>VOLUME</code>.
Please reach out to us if your use case requires any of these.</p> <p>Next, there are some command-specific things that may be useful when porting a
Dockerfile to Modal.</p> <!> <p>Modal containers always run as root (uid 0). The <!> instruction is
ignored, whether it appears in your Dockerfile or is inherited from a base image
pulled with <!>.</p> <p>To <!> for programs running inside your Modal containers, use OS user management features
like <!>. For instance,
in Python, you can pass in a <code>user</code>during <!>.</p> <!> <p>While the <!> command is supported, there is an additional constraint to the entrypoint script
provided: when used with a Modal Function, it must also <code>exec</code> the arguments passed to it at some point.
This is so the Modal Function runtime’s Python entrypoint can run after your own. Most entrypoint
scripts in Docker containers are wrappers over other scripts, so this is likely
already the case.</p> <p>If you wish to write your own entrypoint script, you can use the following as a
template:</p> <!> <p>If the above file is saved as <code>/usr/bin/my_entrypoint.sh</code> in your container,
then you can register it as an entrypoint with <code>ENTRYPOINT ["/usr/bin/my_entrypoint.sh"]</code> in your Dockerfile, or with <!> as an
Image build step.</p> <!> <!> <p>We currently don’t support default values in <!>,
such as <code>$&#123;VAR:-default&#125;</code></p> <!> <p><code>ADD</code> is limited to fetching from single URLs.
Tar extraction, multiple URLs, and copy operations are currently not supported.</p>`,1);function y(t,h){let g=ee(h,[`children`,`$$slots`,`$$events`,`$$legacy`]);f(t,a(()=>g,()=>m,{children:(t,ee)=>{var a=Ce(),f=te(a);ne(f,{id:`using-existing-images`,children:(e,t)=>{s(),i(e,r(`Using existing images`))},$$slots:{default:!0}});var m=o(f,4);d(m,{code:`sklearn_image%20%3D%20modal.Image.from_registry(%22huanjason%2Fscikit-learn%22)%0Acustom_image%20%3D%20modal.Image.from_dockerfile(%22.%2Fsrc%2FDockerfile%22)`,lang:`python`});var h=o(m,2);c(h,{id:`load-an-image-from-a-public-registry-with-from_registry`,children:(e,t)=>{s();var n=re();s(),i(e,n)},$$slots:{default:!0}});var g=o(h,2);p(o(e(g)),{href:`/docs/sdk/py/latest/Image#from_registry`,children:(e,t)=>{i(e,ie())},$$slots:{default:!0}}),s(),n(g);var _=o(g,2);d(_,{code:`sklearn_image%20%3D%20modal.Image.from_registry(%22huanjason%2Fscikit-learn%22)%0A%0A%0A%40app.function(image%3Dsklearn_image)%0Adef%20fit_knn()%3A%0A%20%20%20%20from%20sklearn.neighbors%20import%20KNeighborsClassifier%0A%20%20%20%20...`,lang:`python`});var v=o(_,2),y=o(e(v),3);p(y,{href:`https://catalog.ngc.nvidia.com/containers`,rel:`nofollow`,children:(e,t)=>{s();var n=ae();s(),i(e,n)},$$slots:{default:!0}});var b=o(y,2);p(b,{href:`https://aws.amazon.com/ecr/`,rel:`nofollow`,children:(e,t)=>{s(),i(e,r(`AWS ECR`))},$$slots:{default:!0}}),p(o(b,2),{href:`https://docs.github.com/en/packages/working-with-a-github-packages-registry/working-with-the-container-registry`,rel:`nofollow`,children:(e,t)=>{s();var n=oe();s(),i(e,n)},$$slots:{default:!0}}),s(),n(v);var x=o(v,2);p(o(e(x)),{href:`/docs/guide/images`,children:(e,t)=>{s(),i(e,r(`just like any other Modal Image`))},$$slots:{default:!0}}),s(),n(x);var S=o(x,2);d(S,{code:`data_science_image%20%3D%20sklearn_image.uv_pip_install(%22polars%22%2C%20%22datasette%22)`,lang:`python`});var C=o(S,4),w=e(C);p(o(e(w)),{href:`https://unix.stackexchange.com/questions/53415/why-are-64-bit-distros-often-called-amd64`,rel:`nofollow`,children:(e,t)=>{var n=se();s(),i(e,n)},$$slots:{default:!0}}),n(w);var T=o(w,2);p(o(e(T)),{href:`#entrypoint`,children:(e,t)=>{s();var n=ce();s(),i(e,n)},$$slots:{default:!0}}),n(T),n(C);var E=o(C,2);p(o(e(E),13),{href:`https://github.com/indygreg/python-build-standalone`,rel:`nofollow`,children:(e,t)=>{s(),i(e,r(`standalone build`))},$$slots:{default:!0}}),s(),n(E);var D=o(E,2);d(D,{code:`ubuntu_image%20%3D%20modal.Image.from_registry(%22ubuntu%3A22.04%22%2C%20add_python%3D%223.11%22)%0Avalhalla_image%20%3D%20modal.Image.from_registry(%22gisops%2Fvalhalla%3Alatest%22%2C%20add_python%3D%223.12%22)`,lang:`python`});var O=o(D,2);p(o(e(O)),{href:`/settings/image-builder-version`,children:(e,t)=>{s(),i(e,r(`here`))},$$slots:{default:!0}}),s(),n(O);var k=o(O,2);c(k,{id:`load-images-from-private-registries`,children:(e,t)=>{s(),i(e,r(`Load images from private registries`))},$$slots:{default:!0}});var A=o(k,4);l(A,{id:`docker-hub-private`,children:(e,t)=>{s(),i(e,r(`Docker Hub (Private)`))},$$slots:{default:!0}});var j=o(A,2),M=o(e(j));p(M,{href:`https://docs.docker.com/security/for-developers/access-tokens/`,rel:`nofollow`,children:(e,t)=>{s(),i(e,r(`create an access token`))},$$slots:{default:!0}}),p(o(M,2),{href:`/docs/guide/secrets`,children:(e,t)=>{s(),i(e,r(`Secret`))},$$slots:{default:!0}}),s(),n(j);var N=o(j,2);d(N,{code:`REGISTRY_USERNAME%3Dmy-dockerhub-username%0AREGISTRY_PASSWORD%3Ddckr_pat_TS012345aaa67890bbbb1234ccc`,lang:`text`});var P=o(N,2);p(o(e(P)),{href:`/docs/sdk/py/latest/Image#from_registry`,children:(e,t)=>{i(e,le())},$$slots:{default:!0}}),s(),n(P);var F=o(P,2);l(F,{id:`elastic-container-registry-ecr`,children:(e,t)=>{s(),i(e,r(`Elastic Container Registry (ECR)`))},$$slots:{default:!0}});var I=o(F,4);d(I,{code:`import%20modal%0A%0Aaws_secret%20%3D%20modal.Secret.from_name(%22my-aws-secret%22)%0Aimage%20%3D%20(%0A%20%20%20%20modal.Image.from_aws_ecr(%0A%20%20%20%20%20%20%20%20%22000000000000.dkr.ecr.us-east-1.amazonaws.com%2Fmy-private-registry%3Alatest%22%2C%0A%20%20%20%20%20%20%20%20secret%3Daws_secret%2C%0A%20%20%20%20)%0A%20%20%20%20.pip_install(%22torch%22%2C%20%22numpy%22%2C%20%22huggingface%22)%0A)%0A%0Aapp%20%3D%20modal.App(image%3Dimage)`,lang:`python`});var L=o(I,2);p(o(e(L)),{href:`/docs/guide/secrets`,children:(e,t)=>{s(),i(e,r(`Modal Secret`))},$$slots:{default:!0}}),s(7),n(L);var R=o(L,2);p(o(e(R)),{href:`/docs/guide/oidc-integration#pull-images-from-aws-elastic-container-registry-ecr`,children:(e,t)=>{s(),i(e,r(`OIDC token authentication`))},$$slots:{default:!0}}),s(),n(R);var z=o(R,4);d(z,{code:`%7B%0A%20%20%22Version%22%3A%20%222012-10-17%22%2C%0A%20%20%22Statement%22%3A%20%5B%0A%20%20%20%20%7B%0A%20%20%20%20%20%20%22Action%22%3A%20%5B%22ecr%3AGetAuthorizationToken%22%5D%2C%0A%20%20%20%20%20%20%22Effect%22%3A%20%22Allow%22%2C%0A%20%20%20%20%20%20%22Resource%22%3A%20%22*%22%0A%20%20%20%20%7D%2C%0A%20%20%20%20%7B%0A%20%20%20%20%20%20%22Effect%22%3A%20%22Allow%22%2C%0A%20%20%20%20%20%20%22Action%22%3A%20%5B%0A%20%20%20%20%20%20%20%20%22ecr%3ABatchCheckLayerAvailability%22%2C%0A%20%20%20%20%20%20%20%20%22ecr%3AGetDownloadUrlForLayer%22%2C%0A%20%20%20%20%20%20%20%20%22ecr%3AGetRepositoryPolicy%22%2C%0A%20%20%20%20%20%20%20%20%22ecr%3ADescribeRepositories%22%2C%0A%20%20%20%20%20%20%20%20%22ecr%3AListImages%22%2C%0A%20%20%20%20%20%20%20%20%22ecr%3ADescribeImages%22%2C%0A%20%20%20%20%20%20%20%20%22ecr%3ABatchGetImage%22%2C%0A%20%20%20%20%20%20%20%20%22ecr%3AGetLifecyclePolicy%22%2C%0A%20%20%20%20%20%20%20%20%22ecr%3AGetLifecyclePolicyPreview%22%2C%0A%20%20%20%20%20%20%20%20%22ecr%3AListTagsForResource%22%2C%0A%20%20%20%20%20%20%20%20%22ecr%3ADescribeImageScanFindings%22%0A%20%20%20%20%20%20%5D%2C%0A%20%20%20%20%20%20%22Resource%22%3A%20%22%3CMY-REGISTRY-ARN%3E%22%0A%20%20%20%20%7D%0A%20%20%5D%0A%7D`,lang:`json`});var B=o(z,2);p(o(e(B)),{href:`https://aws.amazon.com/premiumsupport/knowledge-center/create-access-key/`,rel:`nofollow`,children:(e,t)=>{s(),i(e,r(`generate an access key`))},$$slots:{default:!0}}),s(),n(B);var V=o(B,2);p(o(e(V)),{href:`/docs/sdk/py/latest/Image#from_aws_ecr`,children:(e,t)=>{s(),i(e,r(`image configuration requirements`))},$$slots:{default:!0}}),s(),n(V);var we=o(V,2);l(we,{id:`google-artifact-registry-and-google-container-registry`,children:(e,t)=>{s(),i(e,r(`Google Artifact Registry and Google Container Registry`))},$$slots:{default:!0}});var H=o(we,2);p(o(e(H)),{href:`/docs/sdk/py/latest/Image#from_gcp_artifact_registry`,children:(e,t)=>{i(e,ue())},$$slots:{default:!0}}),s(),n(H);var Te=o(H,2);l(Te,{id:`azure-container-registry-acr`,children:(e,t)=>{s(),i(e,r(`Azure Container Registry (ACR)`))},$$slots:{default:!0}});var U=o(Te,2),Ee=o(e(U));p(Ee,{href:`https://learn.microsoft.com/en-us/azure/container-registry/container-registry-token-based-repository-permissions`,rel:`nofollow`,children:(e,t)=>{s(),i(e,r(`token-based repository permissions`))},$$slots:{default:!0}});var De=o(Ee,2);p(De,{href:`/docs/sdk/py/latest/Image#from_registry`,children:(e,t)=>{i(e,de())},$$slots:{default:!0}}),p(o(De,2),{href:`#docker-hub-private`,children:(e,t)=>{s(),i(e,r(`Docker Hub private registry`))},$$slots:{default:!0}}),s(),n(U);var Oe=o(U,2);c(Oe,{id:`bring-your-own-image-definition-with-from_dockerfile`,children:(e,t)=>{s();var n=fe();s(),i(e,n)},$$slots:{default:!0}});var W=o(Oe,2);p(o(e(W)),{href:`/docs/sdk/py/latest/Image#from_dockerfile`,children:(e,t)=>{i(e,pe())},$$slots:{default:!0}}),s(),n(W);var ke=o(W,2);d(ke,{code:`dockerfile_image%20%3D%20modal.Image.from_dockerfile(%22Dockerfile%22)%0A%0A%0A%40app.function(image%3Ddockerfile_image)%0Adef%20fit()%3A%0A%20%20%20%20import%20sklearn%0A%20%20%20%20...`,lang:`python`});var G=o(ke,2);p(o(e(G)),{href:`/docs/guide/images`,children:(e,t)=>{s(),i(e,r(`the guide`))},$$slots:{default:!0}}),s(),n(G);var Ae=o(G,2);l(Ae,{id:`dockerfile-command-compatibility`,children:(e,t)=>{s(),i(e,r(`Dockerfile command compatibility`))},$$slots:{default:!0}});var K=o(Ae,2);p(o(e(K)),{href:`https://docs.docker.com/engine/reference/builder/`,rel:`nofollow`,children:(e,t)=>{s(),i(e,r(`Dockerfile specification`))},$$slots:{default:!0}}),s(),n(K);var je=o(K,6);u(je,{id:`user`,children:(e,t)=>{i(e,me())},$$slots:{default:!0}});var q=o(je,2),Me=o(e(q));p(Me,{href:`https://docs.docker.com/engine/reference/builder/#user`,rel:`nofollow`,children:(e,t)=>{i(e,he())},$$slots:{default:!0}}),p(o(Me,2),{href:`/docs/sdk/py/latest/Image#from_registry`,children:(e,t)=>{i(e,ge())},$$slots:{default:!0}}),s(),n(q);var J=o(q,2),Ne=o(e(J));p(Ne,{href:`https://dwheeler.com/secure-programs/Secure-Programs-HOWTO/minimize-privileges.html`,rel:`nofollow`,children:(e,t)=>{s(),i(e,r(`reduce privileges`))},$$slots:{default:!0}});var Pe=o(Ne,2);p(Pe,{href:`https://man7.org/linux/man-pages/man2/setuid.2.html`,rel:`nofollow`,children:(e,t)=>{i(e,_e())},$$slots:{default:!0}}),p(o(Pe,4),{href:`https://docs.python.org/3/library/subprocess.html`,rel:`nofollow`,children:(e,t)=>{s(),i(e,r(`subprocess creation`))},$$slots:{default:!0}}),s(),n(J);var Y=o(J,2);u(Y,{id:`entrypoint`,children:(e,t)=>{i(e,ve())},$$slots:{default:!0}});var X=o(Y,2);p(o(e(X)),{href:`https://docs.docker.com/engine/reference/builder/#entrypoint`,rel:`nofollow`,children:(e,t)=>{i(e,ye())},$$slots:{default:!0}}),s(3),n(X);var Fe=o(X,4);d(Fe,{code:`%23!%2Fusr%2Fbin%2Fenv%20bash%0A%0A%23%20Your%20custom%20startup%20commands%20here.%0A%0Aexec%20%22%24%40%22%20%23%20Runs%20the%20command%20passed%20to%20the%20entrypoint%20script.`,lang:`bash`});var Z=o(Fe,2);p(o(e(Z),5),{href:`/docs/sdk/py/latest/Image#entrypoint`,children:(e,t)=>{i(e,be())},$$slots:{default:!0}}),s(),n(Z);var Ie=o(Z,2);d(Ie,{code:`import%20modal%0A%0Aimage%20%3D%20(%0A%20%20%20%20modal.Image.debian_slim()%0A%20%20%20%20.pip_install(%22foo%22)%0A%20%20%20%20.entrypoint(%5B%22%2Fusr%2Fbin%2Fmy_entrypoint.sh%22%5D)%0A)`,lang:`python`});var Q=o(Ie,2);u(Q,{id:`env`,children:(e,t)=>{i(e,xe())},$$slots:{default:!0}});var $=o(Q,2);p(o(e($)),{href:`https://docs.docker.com/compose/compose-file/12-interpolation/`,rel:`nofollow`,children:(e,t)=>{s(),i(e,r(`interpolations`))},$$slots:{default:!0}}),s(2),n($),u(o($,2),{id:`add`,children:(e,t)=>{i(e,Se())},$$slots:{default:!0}}),s(2),i(t,a)},$$slots:{default:!0}}))}export{y as default,m as metadata};
//# sourceMappingURL=CD1dhxdy.js.map
