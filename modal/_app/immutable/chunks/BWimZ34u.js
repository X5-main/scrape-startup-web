(function(){try{var e=typeof window<`u`?window:typeof global<`u`?global:typeof globalThis<`u`?globalThis:typeof self<`u`?self:{};e.SENTRY_RELEASE={id:`f99fcf9f0a844cc9bd13fdc8e5782b84`};var t=new e.Error().stack;t&&(e._sentryDebugIds=e._sentryDebugIds||{},e._sentryDebugIds[t]=`d74f0f01-2c0a-4f78-8dbf-2566d34cf401`,e._sentryDebugIdIdentifier=`sentry-dbid-d74f0f01-2c0a-4f78-8dbf-2566d34cf401`)}catch{}})();import{$t as e,St as t,Tn as n,Tt as r,bt as i,c as ee,d as a,en as te,tn as o,wn as s}from"./F_ixKBiO.js";import"./B1sc9Zdx.js";import"./Bb2deiU3.js";import{a as c,i as l,o as ne}from"./CPby7b1n.js";import{t as u}from"./BILrvr3I.js";import{t as d}from"./B4L_if842.js";import{t as f}from"./DeWGVqas2.js";var p={crossLinks:[{text:`Define an Image for LLM inference`,href:`/docs/examples/llm_inference`},{text:`Build Images that use CUDA`,href:`/docs/examples/install_cuda`}],toc:[{depth:1,value:`Images`,id:`images`,children:[{depth:2,value:`What are Images?`,id:`what-are-images`},{depth:2,value:`Add Python packages`,id:`add-python-packages`},{depth:2,value:`Add local files with add_local_dir and add_local_file`,id:`add-local-files-with-add_local_dir-and-add_local_file`,children:[{depth:3,value:`Add local Python code with add_local_python_source`,id:`add-local-python-code-with-add_local_python_source`},{depth:3,value:`What if I have different Python packages locally and remotely?`,id:`what-if-i-have-different-python-packages-locally-and-remotely`}]},{depth:2,value:`Install system packages with .apt_install`,id:`install-system-packages-with-apt_install`},{depth:2,value:`Set environment variables with .env`,id:`set-environment-variables-with-env`},{depth:2,value:`Run shell commands with .run_commands`,id:`run-shell-commands-with-run_commands`},{depth:2,value:`Run a Python function during your build with .run_function`,id:`run-a-python-function-during-your-build-with-run_function`},{depth:2,value:`Attach GPUs during setup`,id:`attach-gpus-during-setup`},{depth:2,value:`Use mamba instead of pip with micromamba_install`,id:`use-mamba-instead-of-pip-with-micromamba_install`},{depth:2,value:`Image caching and rebuilds`,id:`image-caching-and-rebuilds`},{depth:2,value:`Image builder updates`,id:`image-builder-updates`}]}],rawContent:`# Images

This guide walks you through how to define a Modal Image, the environment your Modal code runs in.

The typical flow for defining an Image in Modal is
[method chaining](https://jugad2.blogspot.com/2016/02/examples-of-method-chaining-in-python.html)
starting from a base Image, like this:

\`\`\`python
image = (
    modal.Image.debian_slim(python_version="3.13")
    .apt_install("git")
    .uv_pip_install("torch<3")
    .env({"HALT_AND_CATCH_FIRE": "0"})
    .run_commands("git clone https://github.com/modal-labs/agi && echo 'ready to go!'")
)
\`\`\`

If you have your own container image definitions, like a Dockerfile or a registry link, you can use those too!
See [this guide](/docs/guide/existing-images).

This page is a high-level guide to using Modal Images.
For reference documentation on the \`modal.Image\` object, see
[this page](/docs/sdk/py/latest/Image).

## What are Images?

Your code on Modal runs in _containers_. Containers are like light-weight
virtual machines -- container engines use
[operating system tricks](https://earthly.dev/blog/chroot/) to isolate programs
from each other ("containing" them), making them work as though they were
running on their own hardware with their own filesystem. This makes execution
environments more reproducible, for example by preventing accidental
cross-contamination of environments on the same machine. For added security,
Modal runs containers using the sandboxed
[gVisor container runtime](https://cloud.google.com/blog/products/identity-security/open-sourcing-gvisor-a-sandboxed-container-runtime).

Containers are started up from a stored "snapshot" of their filesystem state
called an _image_. Producing the image for a container is called _building_ the
image.

By default, Modal Functions and Sandboxes run in a
[Debian Linux](https://en.wikipedia.org/wiki/Debian) container with a basic
Python installation of the same minor version \`v3.x\` as your local Python
interpreter.

To make your Apps and Functions useful, you will probably need some third party system packages
or Python libraries. Modal provides a number of options to customize your container images at
different levels of abstraction and granularity, from high-level convenience
methods like \`pip_install\` through wrappers of core container image build
features like \`RUN\` and \`ENV\`. We'll cover each of these in this guide,
along with tips and tricks for building Images effectively when using each tool.

## Add Python packages

The simplest and most common Image modification is to add a third party
Python package, like [\`pandas\`](https://pandas.pydata.org/).

You can add Python packages to the environment by passing all the packages you
need to the [\`Image.uv_pip_install\`](/docs/sdk/py/latest/Image#uv_pip_install) method,
which installs packages with [\`uv\`](https://docs.astral.sh/uv/):

\`\`\`python
import modal

datascience_image = (
    modal.Image.debian_slim()
    .uv_pip_install("pandas==2.2.0", "numpy")
)


@app.function(image=datascience_image)
def my_function():
    import pandas as pd
    import numpy as np

    df = pd.DataFrame()
    ...
\`\`\`

You can include
[Python dependency version specifiers](https://peps.python.org/pep-0508/),
like \`"torch<3"\`, in the arguments. But we recommend pinning dependencies
tightly, like \`"torch==2.8.0"\`, to improve the reproducibility and robustness
of your builds.

If you run into any issues with
[\`Image.uv_pip_install\`](/docs/sdk/py/latest/Image#uv_pip_install), then
you can fallback to [\`Image.pip_install\`](/docs/sdk/py/latest/Image#pip_install) which
uses standard [\`pip\`](https://pip.pypa.io/en/stable/user_guide/):

\`\`\`python
datascience_image = (
    modal.Image.debian_slim(python_version="3.13")
    .pip_install("pandas==2.2.0", "numpy")
)
\`\`\`

Note that because you can define a different environment for each and every
function if you so choose, you don't need to worry about virtual
environment management. Containers make for much better separation of concerns!

If you want to run a specific version of Python remotely rather than just
matching the one you're running locally, provide the \`python_version\` as a
string when constructing the base image, like we did above.

## Add local files with \`add_local_dir\` and \`add_local_file\`

Sometimes your containers need a dependency that's not available on the Internet,
like configuration files or code on your laptop.

To forward files from your local system use the
\`image.add_local_dir\` and \`image.add_local_file\` Image methods.

\`\`\`python
image = modal.Image.debian_slim().add_local_dir("/user/erikbern/.aws", remote_path="/root/.aws")
\`\`\`

By default, these files are added to your container as it starts up rather than introducing
a new Image layer. This means that the redeployment after making changes is really quick, but
also means you can't run additional build steps after. You can specify a \`copy=True\` argument
to the \`add_local_\` methods to instead force the files to be included in the built Image.

### Add local Python code with \`add_local_python_source\`

You can add Python code that's importable locally to your container
by providing the module name to
[\`Image.add_local_python_source\`](/docs/sdk/py/latest/Image#add_local_python_source).

\`\`\`python
image_with_module = modal.Image.debian_slim().add_local_python_source("local_module")

@app.function(image=image_with_module)
def f():
    import local_module

    local_module.do_stuff()
\`\`\`

The difference from \`add_local_dir\` is that \`add_local_python_source\` takes module names as arguments
instead of a file system path and looks up the local package's or module's location via Python's importing
mechanism. The files are then added to directories that make them importable in containers in the
same way as they are locally.

This is intended for pure Python auxiliary modules that are part of your project and that your code imports.
Third party packages should be installed via
[\`Image.uv_pip_install\`](/docs/sdk/py/latest/Image#uv_pip_install) or similar.

### What if I have different Python packages locally and remotely?

You might want to use packages inside your Modal code that you don't have on
your local computer. In the example above, we build a container that uses
\`pandas\`. But if we don't have \`pandas\` locally, on the computer building the
Modal App, we can't put \`import pandas\` at the top of the script, since it would
cause an \`ImportError\`.

The easiest solution to this is to put \`import pandas\` in the function body
instead, as you can see above. This means that \`pandas\` is only imported when
running inside the remote Modal container, which has \`pandas\` installed.

Be careful about what you return from Modal Functions that have different
packages installed than the ones you have locally! Modal Functions return Python
objects, like \`pandas.DataFrame\`s, and if your local machine doesn't have
\`pandas\` installed, it won't be able to handle a \`pandas\` object (the error
message you see will mention
[serialization](https://hazelcast.com/glossary/serialization/)/[deserialization](https://hazelcast.com/glossary/deserialization/)).

If you have a lot of Functions and a lot of Python packages, you might want to
keep the imports in the global scope so that every function can use the same
imports. In that case, you can use the
[\`Image.imports\`](/docs/sdk/py/latest/Image#imports) context manager:

\`\`\`python
pandas_image = modal.Image.debian_slim().pip_install("pandas", "numpy")


with pandas_image.imports():
    import pandas as pd
    import numpy as np


@app.function(image=pandas_image)
def my_function():
    df = pd.DataFrame()
    ...
\`\`\`

Because these imports happen before a new container processes its first input,
you can combine this context manager with [Memory Snapshots](/docs/guide/memory-snapshots)
to improve [cold start performance](/docs/guide/cold-start#share-initialization-work-across-cold-starts-with-memory-snapshots)
for Functions that frequently scale up.

## Install system packages with \`.apt_install\`

You can install Linux packages with the [\`apt\` package manager](https://www.debian.org/doc/manuals/apt-guide/index.en.html)
using [\`Image.apt_install\`](/docs/sdk/py/latest/Image#apt_install):

\`\`\`python
image = modal.Image.debian_slim().apt_install("git", "curl")
\`\`\`

## Set environment variables with \`.env\`

You can change the environment variables that your code sees
(in, e.g., [\`os.environ\`](https://docs.python.org/3/library/os.html#os.environ))
by passing a dictionary to [\`Image.env\`](/docs/sdk/py/latest/Image#env):

\`\`\`python
image = modal.Image.debian_slim().env({"PORT": "6443"})
\`\`\`

Environment variable names and values must be strings.

## Run shell commands with \`.run_commands\`

You can supply shell commands that should be executed when building the
Image to [\`Image.run_commands\`](/docs/sdk/py/latest/Image#run_commands):

\`\`\`python
image_with_repo = (
    modal.Image.debian_slim().apt_install("git").run_commands(
        "git clone https://github.com/modal-labs/gpu-glossary"
    )
)
\`\`\`

## Run a Python function during your build with \`.run_function\`

You can run Python code as a build step using the
[\`Image.run_function\`](/docs/sdk/py/latest/Image#run_function) method.

For example, you can use this to download model parameters from Hugging Face into
your Image:

\`\`\`python
import os

def download_models() -> None:
    import diffusers

    model_name = "segmind/small-sd"
    pipe = diffusers.StableDiffusionPipeline.from_pretrained(
        model_name, use_auth_token=os.environ["HF_TOKEN"]
    )

hf_cache = modal.Volume.from_name("hf-cache")

image = (
    modal.Image.debian_slim()
        .pip_install("diffusers[torch]", "transformers", "ftfy", "accelerate")
        .run_function(
            download_models,
            secrets=[modal.Secret.from_name("huggingface-secret")],
            volumes={"/root/.cache/huggingface": hf_cache},
        )
)
\`\`\`

For details on storing model weights on Modal, see
[this guide](/docs/guide/model-weights).

Essentially, this is equivalent to running a Modal Function and snapshotting the
resulting filesystem as a new Image. Any kwargs accepted by [\`@app.function\`](/docs/sdk/py/latest/App#function)
([\`Volume\`s](/docs/guide/volumes), [\`Secret\`s](/docs/guide/secrets), specifications of
resources like [GPUs](/docs/guide/gpu)) can be supplied here.

Whenever you change other features of your Image, like the base Image or the
version of a Python package, the Image will automatically be rebuilt the next
time it is used. This is a bit more complicated when changing the contents of
functions. See the
[reference documentation](/docs/sdk/py/latest/Image#run_function) for details.

## Attach GPUs during setup

If a step in the setup of your Image should be run on an instance with
a GPU (e.g., so that a package can query the GPU to set compilation flags), pass the
desired GPU type when defining that step:

\`\`\`python
image = (
    modal.Image.debian_slim()
    .pip_install("bitsandbytes", gpu="H100")
)
\`\`\`

## Use \`mamba\` instead of \`pip\` with \`micromamba_install\`

\`pip\` installs Python packages, but some Python workloads require the
coordinated installation of system packages as well. The \`mamba\` package manager
can install both. Modal provides a pre-built
[Micromamba](https://mamba.readthedocs.io/en/latest/user_guide/micromamba.html)
base image that makes it easy to work with \`micromamba\`:

\`\`\`python
app = modal.App("bayes-pgm")

numpyro_pymc_image = (
    modal.Image.micromamba()
    .micromamba_install("pymc==5.10.4", "numpyro==0.13.2", channels=["conda-forge"])
)


@app.function(image=numpyro_pymc_image)
def sample():
    import pymc as pm
    import numpyro as np

    print(f"Running on PyMC v{pm.__version__} with JAX/numpyro v{np.__version__} backend")
    ...
\`\`\`

## Image caching and rebuilds

Modal uses the definition of an Image to determine whether it needs to be
rebuilt. If the definition hasn't changed since the last time you ran or
deployed your App, the previous version will be pulled from the cache.

Images are cached per layer (i.e., per \`Image\` method call), and breaking
the cache on a single layer will cause cascading rebuilds for all subsequent
layers. You can shorten iteration cycles by defining frequently-changing
layers last so that the cached version of all other layers can be used.

In some cases, you may want to force an Image to rebuild, even if the
definition hasn't changed. You can do this by adding the \`force_build=True\`
argument to any of the Image building methods.

\`\`\`python
image = (
    modal.Image.debian_slim()
    .apt_install("git")
    .pip_install("slack-sdk", force_build=True)
    .run_commands("echo hi")
)
\`\`\`

As in other cases where a layer's definition changes, both the \`pip_install\` and
\`run_commands\` layers will rebuild, but the \`apt_install\` will not. Remember to
remove \`force_build=True\` after you've rebuilt the Image, or it will
rebuild every time you run your code.

Alternatively, you can set the \`MODAL_FORCE_BUILD\` environment variable (e.g.
\`MODAL_FORCE_BUILD=1 modal run ...\`) to rebuild all images attached to your App.
But note that when you rebuild a base layer, the cache will be invalidated for _all_
Images that depend on it, and they will rebuild the next time you run or deploy
any App that uses that base. If you're debugging an issue with your Image, a better
option might be using \`MODAL_IGNORE_CACHE=1\`. This will rebuild the Image from the
top without breaking the Image cache or affecting subsequent builds.

## Image builder updates

Because changes to base images will cause cascading rebuilds, Modal is
conservative about updating the base definitions that we provide. But many
things are baked into these definitions, like the specific versions of the Image
OS, the included Python, and the Modal client dependencies.

We provide a separate mechanism for keeping base images up-to-date without
causing unpredictable rebuilds: the "Image Builder Version". This is a workspace
level-configuration that will be used for every Image built in your workspace.
We release a new Image Builder Version every few months but allow you to update
your workspace's configuration when convenient. After updating, your next
deployment will take longer, because your Images will rebuild. You may also
encounter problems, especially if your Image definition does not pin the version
of the third-party libraries that it installs (as your new Image will get the
latest version of these libraries, which may contain breaking changes).

You can set the Image Builder Version for your workspace by going to your
[workspace settings](/settings/image-builder-version). This page also documents the
important updates in each version.
`,meta:{title:`Images`,description:`This guide walks you through how to define a Modal Image, the environment your Modal code runs in.`}},{crossLinks:m,toc:h,rawContent:g,meta:_}=p,re=t(`<code>pandas</code>`),ie=t(`<code>Image.uv_pip_install</code>`),ae=t(`<code>uv</code>`),oe=t(`<code>Image.uv_pip_install</code>`),se=t(`<code>Image.pip_install</code>`),ce=t(`<code>pip</code>`),le=t(`Add local files with <code>add_local_dir</code> and <code>add_local_file</code>`,1),ue=t(`Add local Python code with <code>add_local_python_source</code>`,1),de=t(`<code>Image.add_local_python_source</code>`),fe=t(`<code>Image.uv_pip_install</code>`),pe=t(`<code>Image.imports</code>`),me=t(`Install system packages with <code>.apt_install</code>`,1),he=t(`<code>apt</code> package manager`,1),ge=t(`<code>Image.apt_install</code>`),_e=t(`Set environment variables with <code>.env</code>`,1),ve=t(`<code>os.environ</code>`),ye=t(`<code>Image.env</code>`),be=t(`Run shell commands with <code>.run_commands</code>`,1),xe=t(`<code>Image.run_commands</code>`),Se=t(`Run a Python function during your build with <code>.run_function</code>`,1),Ce=t(`<code>Image.run_function</code>`),we=t(`<code>@app.function</code>`),Te=t(`<code>Volume</code>s`,1),Ee=t(`<code>Secret</code>s`,1),De=t(`Use <code>mamba</code> instead of <code>pip</code> with <code>micromamba_install</code>`,1),Oe=t(`<!> <p>This guide walks you through how to define a Modal Image, the environment your Modal code runs in.</p> <p>The typical flow for defining an Image in Modal is <!> starting from a base Image, like this:</p> <!> <p>If you have your own container image definitions, like a Dockerfile or a registry link, you can use those too!
See <!>.</p> <p>This page is a high-level guide to using Modal Images.
For reference documentation on the <code>modal.Image</code> object, see <!>.</p> <!> <p>Your code on Modal runs in <em>containers</em>. Containers are like light-weight
virtual machines — container engines use <!> to isolate programs
from each other (“containing” them), making them work as though they were
running on their own hardware with their own filesystem. This makes execution
environments more reproducible, for example by preventing accidental
cross-contamination of environments on the same machine. For added security,
Modal runs containers using the sandboxed <!>.</p> <p>Containers are started up from a stored “snapshot” of their filesystem state
called an <em>image</em>. Producing the image for a container is called <em>building</em> the
image.</p> <p>By default, Modal Functions and Sandboxes run in a <!> container with a basic
Python installation of the same minor version <code>v3.x</code> as your local Python
interpreter.</p> <p>To make your Apps and Functions useful, you will probably need some third party system packages
or Python libraries. Modal provides a number of options to customize your container images at
different levels of abstraction and granularity, from high-level convenience
methods like <code>pip_install</code> through wrappers of core container image build
features like <code>RUN</code> and <code>ENV</code>. We’ll cover each of these in this guide,
along with tips and tricks for building Images effectively when using each tool.</p> <!> <p>The simplest and most common Image modification is to add a third party
Python package, like <!>.</p> <p>You can add Python packages to the environment by passing all the packages you
need to the <!> method,
which installs packages with <!>:</p> <!> <p>You can include <!>,
like <code>"torch&lt;3"</code>, in the arguments. But we recommend pinning dependencies
tightly, like <code>"torch==2.8.0"</code>, to improve the reproducibility and robustness
of your builds.</p> <p>If you run into any issues with <!>, then
you can fallback to <!> which
uses standard <!>:</p> <!> <p>Note that because you can define a different environment for each and every
function if you so choose, you don’t need to worry about virtual
environment management. Containers make for much better separation of concerns!</p> <p>If you want to run a specific version of Python remotely rather than just
matching the one you’re running locally, provide the <code>python_version</code> as a
string when constructing the base image, like we did above.</p> <!> <p>Sometimes your containers need a dependency that’s not available on the Internet,
like configuration files or code on your laptop.</p> <p>To forward files from your local system use the <code>image.add_local_dir</code> and <code>image.add_local_file</code> Image methods.</p> <!> <p>By default, these files are added to your container as it starts up rather than introducing
a new Image layer. This means that the redeployment after making changes is really quick, but
also means you can’t run additional build steps after. You can specify a <code>copy=True</code> argument
to the <code>add_local_</code> methods to instead force the files to be included in the built Image.</p> <!> <p>You can add Python code that’s importable locally to your container
by providing the module name to <!>.</p> <!> <p>The difference from <code>add_local_dir</code> is that <code>add_local_python_source</code> takes module names as arguments
instead of a file system path and looks up the local package’s or module’s location via Python’s importing
mechanism. The files are then added to directories that make them importable in containers in the
same way as they are locally.</p> <p>This is intended for pure Python auxiliary modules that are part of your project and that your code imports.
Third party packages should be installed via <!> or similar.</p> <!> <p>You might want to use packages inside your Modal code that you don’t have on
your local computer. In the example above, we build a container that uses <code>pandas</code>. But if we don’t have <code>pandas</code> locally, on the computer building the
Modal App, we can’t put <code>import pandas</code> at the top of the script, since it would
cause an <code>ImportError</code>.</p> <p>The easiest solution to this is to put <code>import pandas</code> in the function body
instead, as you can see above. This means that <code>pandas</code> is only imported when
running inside the remote Modal container, which has <code>pandas</code> installed.</p> <p>Be careful about what you return from Modal Functions that have different
packages installed than the ones you have locally! Modal Functions return Python
objects, like <code>pandas.DataFrame</code>s, and if your local machine doesn’t have <code>pandas</code> installed, it won’t be able to handle a <code>pandas</code> object (the error
message you see will mention <!>/<!>).</p> <p>If you have a lot of Functions and a lot of Python packages, you might want to
keep the imports in the global scope so that every function can use the same
imports. In that case, you can use the <!> context manager:</p> <!> <p>Because these imports happen before a new container processes its first input,
you can combine this context manager with <!> to improve <!> for Functions that frequently scale up.</p> <!> <p>You can install Linux packages with the <!> using <!>:</p> <!> <!> <p>You can change the environment variables that your code sees
(in, e.g., <!>)
by passing a dictionary to <!>:</p> <!> <p>Environment variable names and values must be strings.</p> <!> <p>You can supply shell commands that should be executed when building the
Image to <!>:</p> <!> <!> <p>You can run Python code as a build step using the <!> method.</p> <p>For example, you can use this to download model parameters from Hugging Face into
your Image:</p> <!> <p>For details on storing model weights on Modal, see <!>.</p> <p>Essentially, this is equivalent to running a Modal Function and snapshotting the
resulting filesystem as a new Image. Any kwargs accepted by <!> (<!>, <!>, specifications of
resources like <!>) can be supplied here.</p> <p>Whenever you change other features of your Image, like the base Image or the
version of a Python package, the Image will automatically be rebuilt the next
time it is used. This is a bit more complicated when changing the contents of
functions. See the <!> for details.</p> <!> <p>If a step in the setup of your Image should be run on an instance with
a GPU (e.g., so that a package can query the GPU to set compilation flags), pass the
desired GPU type when defining that step:</p> <!> <!> <p><code>pip</code> installs Python packages, but some Python workloads require the
coordinated installation of system packages as well. The <code>mamba</code> package manager
can install both. Modal provides a pre-built <!> base image that makes it easy to work with <code>micromamba</code>:</p> <!> <!> <p>Modal uses the definition of an Image to determine whether it needs to be
rebuilt. If the definition hasn’t changed since the last time you ran or
deployed your App, the previous version will be pulled from the cache.</p> <p>Images are cached per layer (i.e., per <code>Image</code> method call), and breaking
the cache on a single layer will cause cascading rebuilds for all subsequent
layers. You can shorten iteration cycles by defining frequently-changing
layers last so that the cached version of all other layers can be used.</p> <p>In some cases, you may want to force an Image to rebuild, even if the
definition hasn’t changed. You can do this by adding the <code>force_build=True</code> argument to any of the Image building methods.</p> <!> <p>As in other cases where a layer’s definition changes, both the <code>pip_install</code> and <code>run_commands</code> layers will rebuild, but the <code>apt_install</code> will not. Remember to
remove <code>force_build=True</code> after you’ve rebuilt the Image, or it will
rebuild every time you run your code.</p> <p>Alternatively, you can set the <code>MODAL_FORCE_BUILD</code> environment variable (e.g. <code>MODAL_FORCE_BUILD=1 modal run ...</code>) to rebuild all images attached to your App.
But note that when you rebuild a base layer, the cache will be invalidated for <em>all</em> Images that depend on it, and they will rebuild the next time you run or deploy
any App that uses that base. If you’re debugging an issue with your Image, a better
option might be using <code>MODAL_IGNORE_CACHE=1</code>. This will rebuild the Image from the
top without breaking the Image cache or affecting subsequent builds.</p> <!> <p>Because changes to base images will cause cascading rebuilds, Modal is
conservative about updating the base definitions that we provide. But many
things are baked into these definitions, like the specific versions of the Image
OS, the included Python, and the Modal client dependencies.</p> <p>We provide a separate mechanism for keeping base images up-to-date without
causing unpredictable rebuilds: the “Image Builder Version”. This is a workspace
level-configuration that will be used for every Image built in your workspace.
We release a new Image Builder Version every few months but allow you to update
your workspace’s configuration when convenient. After updating, your next
deployment will take longer, because your Images will rebuild. You may also
encounter problems, especially if your Image definition does not pin the version
of the third-party libraries that it installs (as your new Image will get the
latest version of these libraries, which may contain breaking changes).</p> <p>You can set the Image Builder Version for your workspace by going to your <!>. This page also documents the
important updates in each version.</p>`,1);function v(t,m){let h=ee(m,[`children`,`$$slots`,`$$events`,`$$legacy`]);d(t,a(()=>h,()=>p,{children:(t,ee)=>{var a=Oe(),d=te(a);ne(d,{id:`images`,children:(e,t)=>{s(),i(e,r(`Images`))},$$slots:{default:!0}});var p=o(d,4);f(o(e(p)),{href:`https://jugad2.blogspot.com/2016/02/examples-of-method-chaining-in-python.html`,rel:`nofollow`,children:(e,t)=>{s(),i(e,r(`method chaining`))},$$slots:{default:!0}}),s(),n(p);var m=o(p,2);u(m,{code:`image%20%3D%20(%0A%20%20%20%20modal.Image.debian_slim(python_version%3D%223.13%22)%0A%20%20%20%20.apt_install(%22git%22)%0A%20%20%20%20.uv_pip_install(%22torch%3C3%22)%0A%20%20%20%20.env(%7B%22HALT_AND_CATCH_FIRE%22%3A%20%220%22%7D)%0A%20%20%20%20.run_commands(%22git%20clone%20https%3A%2F%2Fgithub.com%2Fmodal-labs%2Fagi%20%26%26%20echo%20'ready%20to%20go!'%22)%0A)`,lang:`python`});var h=o(m,2);f(o(e(h)),{href:`/docs/guide/existing-images`,children:(e,t)=>{s(),i(e,r(`this guide`))},$$slots:{default:!0}}),s(),n(h);var g=o(h,2);f(o(e(g),3),{href:`/docs/sdk/py/latest/Image`,children:(e,t)=>{s(),i(e,r(`this page`))},$$slots:{default:!0}}),s(),n(g);var _=o(g,2);c(_,{id:`what-are-images`,children:(e,t)=>{s(),i(e,r(`What are Images?`))},$$slots:{default:!0}});var v=o(_,2),y=o(e(v),3);f(y,{href:`https://earthly.dev/blog/chroot/`,rel:`nofollow`,children:(e,t)=>{s(),i(e,r(`operating system tricks`))},$$slots:{default:!0}}),f(o(y,2),{href:`https://cloud.google.com/blog/products/identity-security/open-sourcing-gvisor-a-sandboxed-container-runtime`,rel:`nofollow`,children:(e,t)=>{s(),i(e,r(`gVisor container runtime`))},$$slots:{default:!0}}),s(),n(v);var b=o(v,4);f(o(e(b)),{href:`https://en.wikipedia.org/wiki/Debian`,rel:`nofollow`,children:(e,t)=>{s(),i(e,r(`Debian Linux`))},$$slots:{default:!0}}),s(3),n(b);var x=o(b,4);c(x,{id:`add-python-packages`,children:(e,t)=>{s(),i(e,r(`Add Python packages`))},$$slots:{default:!0}});var S=o(x,2);f(o(e(S)),{href:`https://pandas.pydata.org/`,rel:`nofollow`,children:(e,t)=>{i(e,re())},$$slots:{default:!0}}),s(),n(S);var C=o(S,2),w=o(e(C));f(w,{href:`/docs/sdk/py/latest/Image#uv_pip_install`,children:(e,t)=>{i(e,ie())},$$slots:{default:!0}}),f(o(w,2),{href:`https://docs.astral.sh/uv/`,rel:`nofollow`,children:(e,t)=>{i(e,ae())},$$slots:{default:!0}}),s(),n(C);var T=o(C,2);u(T,{code:`import%20modal%0A%0Adatascience_image%20%3D%20(%0A%20%20%20%20modal.Image.debian_slim()%0A%20%20%20%20.uv_pip_install(%22pandas%3D%3D2.2.0%22%2C%20%22numpy%22)%0A)%0A%0A%0A%40app.function(image%3Ddatascience_image)%0Adef%20my_function()%3A%0A%20%20%20%20import%20pandas%20as%20pd%0A%20%20%20%20import%20numpy%20as%20np%0A%0A%20%20%20%20df%20%3D%20pd.DataFrame()%0A%20%20%20%20...`,lang:`python`});var E=o(T,2);f(o(e(E)),{href:`https://peps.python.org/pep-0508/`,rel:`nofollow`,children:(e,t)=>{s(),i(e,r(`Python dependency version specifiers`))},$$slots:{default:!0}}),s(5),n(E);var D=o(E,2),O=o(e(D));f(O,{href:`/docs/sdk/py/latest/Image#uv_pip_install`,children:(e,t)=>{i(e,oe())},$$slots:{default:!0}});var k=o(O,2);f(k,{href:`/docs/sdk/py/latest/Image#pip_install`,children:(e,t)=>{i(e,se())},$$slots:{default:!0}}),f(o(k,2),{href:`https://pip.pypa.io/en/stable/user_guide/`,rel:`nofollow`,children:(e,t)=>{i(e,ce())},$$slots:{default:!0}}),s(),n(D);var A=o(D,2);u(A,{code:`datascience_image%20%3D%20(%0A%20%20%20%20modal.Image.debian_slim(python_version%3D%223.13%22)%0A%20%20%20%20.pip_install(%22pandas%3D%3D2.2.0%22%2C%20%22numpy%22)%0A)`,lang:`python`});var j=o(A,6);c(j,{id:`add-local-files-with-add_local_dir-and-add_local_file`,children:(e,t)=>{s();var n=le();s(3),i(e,n)},$$slots:{default:!0}});var M=o(j,6);u(M,{code:`image%20%3D%20modal.Image.debian_slim().add_local_dir(%22%2Fuser%2Ferikbern%2F.aws%22%2C%20remote_path%3D%22%2Froot%2F.aws%22)`,lang:`python`});var N=o(M,4);l(N,{id:`add-local-python-code-with-add_local_python_source`,children:(e,t)=>{s();var n=ue();s(),i(e,n)},$$slots:{default:!0}});var P=o(N,2);f(o(e(P)),{href:`/docs/sdk/py/latest/Image#add_local_python_source`,children:(e,t)=>{i(e,de())},$$slots:{default:!0}}),s(),n(P);var F=o(P,2);u(F,{code:`image_with_module%20%3D%20modal.Image.debian_slim().add_local_python_source(%22local_module%22)%0A%0A%40app.function(image%3Dimage_with_module)%0Adef%20f()%3A%0A%20%20%20%20import%20local_module%0A%0A%20%20%20%20local_module.do_stuff()`,lang:`python`});var I=o(F,4);f(o(e(I)),{href:`/docs/sdk/py/latest/Image#uv_pip_install`,children:(e,t)=>{i(e,fe())},$$slots:{default:!0}}),s(),n(I);var L=o(I,2);l(L,{id:`what-if-i-have-different-python-packages-locally-and-remotely`,children:(e,t)=>{s(),i(e,r(`What if I have different Python packages locally and remotely?`))},$$slots:{default:!0}});var R=o(L,6),z=o(e(R),7);f(z,{href:`https://hazelcast.com/glossary/serialization/`,rel:`nofollow`,children:(e,t)=>{s(),i(e,r(`serialization`))},$$slots:{default:!0}}),f(o(z,2),{href:`https://hazelcast.com/glossary/deserialization/`,rel:`nofollow`,children:(e,t)=>{s(),i(e,r(`deserialization`))},$$slots:{default:!0}}),s(),n(R);var B=o(R,2);f(o(e(B)),{href:`/docs/sdk/py/latest/Image#imports`,children:(e,t)=>{i(e,pe())},$$slots:{default:!0}}),s(),n(B);var V=o(B,2);u(V,{code:`pandas_image%20%3D%20modal.Image.debian_slim().pip_install(%22pandas%22%2C%20%22numpy%22)%0A%0A%0Awith%20pandas_image.imports()%3A%0A%20%20%20%20import%20pandas%20as%20pd%0A%20%20%20%20import%20numpy%20as%20np%0A%0A%0A%40app.function(image%3Dpandas_image)%0Adef%20my_function()%3A%0A%20%20%20%20df%20%3D%20pd.DataFrame()%0A%20%20%20%20...`,lang:`python`});var H=o(V,2),ke=o(e(H));f(ke,{href:`/docs/guide/memory-snapshots`,children:(e,t)=>{s(),i(e,r(`Memory Snapshots`))},$$slots:{default:!0}}),f(o(ke,2),{href:`/docs/guide/cold-start#share-initialization-work-across-cold-starts-with-memory-snapshots`,children:(e,t)=>{s(),i(e,r(`cold start performance`))},$$slots:{default:!0}}),s(),n(H);var U=o(H,2);c(U,{id:`install-system-packages-with-apt_install`,children:(e,t)=>{s();var n=me();s(),i(e,n)},$$slots:{default:!0}});var W=o(U,2),G=o(e(W));f(G,{href:`https://www.debian.org/doc/manuals/apt-guide/index.en.html`,rel:`nofollow`,children:(e,t)=>{var n=he();s(),i(e,n)},$$slots:{default:!0}}),f(o(G,2),{href:`/docs/sdk/py/latest/Image#apt_install`,children:(e,t)=>{i(e,ge())},$$slots:{default:!0}}),s(),n(W);var Ae=o(W,2);u(Ae,{code:`image%20%3D%20modal.Image.debian_slim().apt_install(%22git%22%2C%20%22curl%22)`,lang:`python`});var je=o(Ae,2);c(je,{id:`set-environment-variables-with-env`,children:(e,t)=>{s();var n=_e();s(),i(e,n)},$$slots:{default:!0}});var K=o(je,2),Me=o(e(K));f(Me,{href:`https://docs.python.org/3/library/os.html#os.environ`,rel:`nofollow`,children:(e,t)=>{i(e,ve())},$$slots:{default:!0}}),f(o(Me,2),{href:`/docs/sdk/py/latest/Image#env`,children:(e,t)=>{i(e,ye())},$$slots:{default:!0}}),s(),n(K);var Ne=o(K,2);u(Ne,{code:`image%20%3D%20modal.Image.debian_slim().env(%7B%22PORT%22%3A%20%226443%22%7D)`,lang:`python`});var Pe=o(Ne,4);c(Pe,{id:`run-shell-commands-with-run_commands`,children:(e,t)=>{s();var n=be();s(),i(e,n)},$$slots:{default:!0}});var q=o(Pe,2);f(o(e(q)),{href:`/docs/sdk/py/latest/Image#run_commands`,children:(e,t)=>{i(e,xe())},$$slots:{default:!0}}),s(),n(q);var Fe=o(q,2);u(Fe,{code:`image_with_repo%20%3D%20(%0A%20%20%20%20modal.Image.debian_slim().apt_install(%22git%22).run_commands(%0A%20%20%20%20%20%20%20%20%22git%20clone%20https%3A%2F%2Fgithub.com%2Fmodal-labs%2Fgpu-glossary%22%0A%20%20%20%20)%0A)`,lang:`python`});var Ie=o(Fe,2);c(Ie,{id:`run-a-python-function-during-your-build-with-run_function`,children:(e,t)=>{s();var n=Se();s(),i(e,n)},$$slots:{default:!0}});var J=o(Ie,2);f(o(e(J)),{href:`/docs/sdk/py/latest/Image#run_function`,children:(e,t)=>{i(e,Ce())},$$slots:{default:!0}}),s(),n(J);var Le=o(J,4);u(Le,{code:`import%20os%0A%0Adef%20download_models()%20-%3E%20None%3A%0A%20%20%20%20import%20diffusers%0A%0A%20%20%20%20model_name%20%3D%20%22segmind%2Fsmall-sd%22%0A%20%20%20%20pipe%20%3D%20diffusers.StableDiffusionPipeline.from_pretrained(%0A%20%20%20%20%20%20%20%20model_name%2C%20use_auth_token%3Dos.environ%5B%22HF_TOKEN%22%5D%0A%20%20%20%20)%0A%0Ahf_cache%20%3D%20modal.Volume.from_name(%22hf-cache%22)%0A%0Aimage%20%3D%20(%0A%20%20%20%20modal.Image.debian_slim()%0A%20%20%20%20%20%20%20%20.pip_install(%22diffusers%5Btorch%5D%22%2C%20%22transformers%22%2C%20%22ftfy%22%2C%20%22accelerate%22)%0A%20%20%20%20%20%20%20%20.run_function(%0A%20%20%20%20%20%20%20%20%20%20%20%20download_models%2C%0A%20%20%20%20%20%20%20%20%20%20%20%20secrets%3D%5Bmodal.Secret.from_name(%22huggingface-secret%22)%5D%2C%0A%20%20%20%20%20%20%20%20%20%20%20%20volumes%3D%7B%22%2Froot%2F.cache%2Fhuggingface%22%3A%20hf_cache%7D%2C%0A%20%20%20%20%20%20%20%20)%0A)`,lang:`python`});var Y=o(Le,2);f(o(e(Y)),{href:`/docs/guide/model-weights`,children:(e,t)=>{s(),i(e,r(`this guide`))},$$slots:{default:!0}}),s(),n(Y);var X=o(Y,2),Re=o(e(X));f(Re,{href:`/docs/sdk/py/latest/App#function`,children:(e,t)=>{i(e,we())},$$slots:{default:!0}});var ze=o(Re,2);f(ze,{href:`/docs/guide/volumes`,children:(e,t)=>{var n=Te();s(),i(e,n)},$$slots:{default:!0}});var Be=o(ze,2);f(Be,{href:`/docs/guide/secrets`,children:(e,t)=>{var n=Ee();s(),i(e,n)},$$slots:{default:!0}}),f(o(Be,2),{href:`/docs/guide/gpu`,children:(e,t)=>{s(),i(e,r(`GPUs`))},$$slots:{default:!0}}),s(),n(X);var Z=o(X,2);f(o(e(Z)),{href:`/docs/sdk/py/latest/Image#run_function`,children:(e,t)=>{s(),i(e,r(`reference documentation`))},$$slots:{default:!0}}),s(),n(Z);var Ve=o(Z,2);c(Ve,{id:`attach-gpus-during-setup`,children:(e,t)=>{s(),i(e,r(`Attach GPUs during setup`))},$$slots:{default:!0}});var He=o(Ve,4);u(He,{code:`image%20%3D%20(%0A%20%20%20%20modal.Image.debian_slim()%0A%20%20%20%20.pip_install(%22bitsandbytes%22%2C%20gpu%3D%22H100%22)%0A)`,lang:`python`});var Ue=o(He,2);c(Ue,{id:`use-mamba-instead-of-pip-with-micromamba_install`,children:(e,t)=>{s();var n=De();s(5),i(e,n)},$$slots:{default:!0}});var Q=o(Ue,2);f(o(e(Q),4),{href:`https://mamba.readthedocs.io/en/latest/user_guide/micromamba.html`,rel:`nofollow`,children:(e,t)=>{s(),i(e,r(`Micromamba`))},$$slots:{default:!0}}),s(3),n(Q);var We=o(Q,2);u(We,{code:`app%20%3D%20modal.App(%22bayes-pgm%22)%0A%0Anumpyro_pymc_image%20%3D%20(%0A%20%20%20%20modal.Image.micromamba()%0A%20%20%20%20.micromamba_install(%22pymc%3D%3D5.10.4%22%2C%20%22numpyro%3D%3D0.13.2%22%2C%20channels%3D%5B%22conda-forge%22%5D)%0A)%0A%0A%0A%40app.function(image%3Dnumpyro_pymc_image)%0Adef%20sample()%3A%0A%20%20%20%20import%20pymc%20as%20pm%0A%20%20%20%20import%20numpyro%20as%20np%0A%0A%20%20%20%20print(f%22Running%20on%20PyMC%20v%7Bpm.__version__%7D%20with%20JAX%2Fnumpyro%20v%7Bnp.__version__%7D%20backend%22)%0A%20%20%20%20...`,lang:`python`});var Ge=o(We,2);c(Ge,{id:`image-caching-and-rebuilds`,children:(e,t)=>{s(),i(e,r(`Image caching and rebuilds`))},$$slots:{default:!0}});var Ke=o(Ge,8);u(Ke,{code:`image%20%3D%20(%0A%20%20%20%20modal.Image.debian_slim()%0A%20%20%20%20.apt_install(%22git%22)%0A%20%20%20%20.pip_install(%22slack-sdk%22%2C%20force_build%3DTrue)%0A%20%20%20%20.run_commands(%22echo%20hi%22)%0A)`,lang:`python`});var qe=o(Ke,6);c(qe,{id:`image-builder-updates`,children:(e,t)=>{s(),i(e,r(`Image builder updates`))},$$slots:{default:!0}});var $=o(qe,6);f(o(e($)),{href:`/settings/image-builder-version`,children:(e,t)=>{s(),i(e,r(`workspace settings`))},$$slots:{default:!0}}),s(),n($),i(t,a)},$$slots:{default:!0}}))}export{v as default,p as metadata};
//# sourceMappingURL=BWimZ34u.js.map
