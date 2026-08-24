(function(){try{var e=typeof window<`u`?window:typeof global<`u`?global:typeof globalThis<`u`?globalThis:typeof self<`u`?self:{};e.SENTRY_RELEASE={id:`f99fcf9f0a844cc9bd13fdc8e5782b84`};var t=new e.Error().stack;t&&(e._sentryDebugIds=e._sentryDebugIds||{},e._sentryDebugIds[t]=`d9c85803-51f3-4476-b33b-ea6e3f2fb078`,e._sentryDebugIdIdentifier=`sentry-dbid-d9c85803-51f3-4476-b33b-ea6e3f2fb078`)}catch{}})();import{$t as e,St as t,Tn as n,Tt as r,bt as i,c as a,d as o,en as s,tn as c,wn as l}from"./F_ixKBiO.js";import"./B1sc9Zdx.js";import"./Bb2deiU3.js";import{a as u,o as d}from"./CPby7b1n.js";import{t as f}from"./BILrvr3I.js";import{t as p}from"./B4L_if842.js";import{t as m}from"./DeWGVqas2.js";var h={toc:[{depth:1,value:`Modal 1.0 migration guide`,id:`modal-10-migration-guide`,children:[{depth:2,value:`Deprecating Image.copy_* methods`,id:`deprecating-imagecopy_-methods`},{depth:2,value:`Deprecating Mount as part of the public API`,id:`deprecating-mount-as-part-of-the-public-api`},{depth:2,value:`Deprecating the @modal.build decorator`,id:`deprecating-the-modalbuild-decorator`},{depth:2,value:`Requiring explicit inclusion of local Python dependencies`,id:`requiring-explicit-inclusion-of-local-python-dependencies`},{depth:2,value:`Renaming autoscaler parameters`,id:`renaming-autoscaler-parameters`},{depth:2,value:`Renaming modal.web_endpoint to modal.fastapi_endpoint`,id:`renaming-modalweb_endpoint-to-modalfastapi_endpoint`},{depth:2,value:`Replacing allow_concurrent_inputs with @modal.concurrent`,id:`replacing-allow_concurrent_inputs-with-modalconcurrent`},{depth:2,value:`Deprecating the .lookup method on Modal objects`,id:`deprecating-the-lookup-method-on-modal-objects`},{depth:2,value:`Removing support for custom Cls constructors`,id:`removing-support-for-custom-cls-constructors`},{depth:2,value:`Simplifying Cls lookup patterns`,id:`simplifying-cls-lookup-patterns`},{depth:2,value:`Deprecating modal.gpu objects`,id:`deprecating-modalgpu-objects`},{depth:2,value:`Requiring explicit invocation for module mode`,id:`requiring-explicit-invocation-for-module-mode`}]}],rawContent:`# Modal 1.0 migration guide

We released version 1.0 of the Modal Python SDK in May 2025.
This release signifies an increased commitment to API stability and implies
some changes to our development workflow.

Preceding the 1.0 release, we introduced a number of deprecations and changes
based on feedback that we received from early users. These changes were intended
to address pain points and reduce confusion about some aspects of the Modal API.
While adapting to them requires some changes to existing code, we believe that
they’ll make it easier to use Modal going forward.

This page highlights the major changes for 1.0 and provides some advice for how
to migrate your code to the new stable APIs. Most deprecations introduced prior
to the release of v1.0 will not be enforced (actually cause breaking changes)
until a subsequent minor (v1.x) release, but we recommend updating your code so
that you can take advantage of new features and avoid any future issues.

## Deprecating \`Image.copy_*\` methods

_Introduced in: v0.72.11_

We recently introduced new \`Image\` methods — \`Image.add_local_dir\` and
\`Image.add_local_file\` — to replace the existing \`Image.copy_local_dir\` and
\`Image.copy_local_file\`.

The new methods subsume the functionality of the old ones, but their default
behavior is different and more performant. By default, files will be mounted to
the container at runtime rather than copied into a new \`Image\` layer. This can
speed up development substantially when iterating on the contents of the files.

Building a new \`Image\` layer should be necessary only when subsequent build
steps will use the added files. In that case, you can pass \`copy=True\` in
\`Image.add_local_file\` or \`Image.add_local_dir\`.

The \`Image.add_local_dir\` method also has an \`ignore=\` parameter, which you can
use to pass file-matching patterns (using dockerignore rules) or predicate
functions to exclude files.

## Deprecating \`Mount\` as part of the public API

_Introduced in: v0.72.4_ | _Enforced in: v1.0.0_

Currently, local files can be mounted to the container filesystem either by
including them in the \`Image\` definition or by passing a \`modal.Mount\` object
directly to the \`App.function\` or \`App.cls\` decorators. As part of the 1.0
release, we are simplifying the container filesystem configuration to be defined
only by the \`Image\` used for each Function. This implies deprecation of the
following:

- The \`mount=\` parameter of \`App.function\` and \`App.cls\`
- The \`context_mount=\` parameter of several \`modal.Image\` methods
- The \`Image.copy_mount\` method
- The \`Mount\` object

Code that uses the \`mount=\` parameter of \`App.function\` and \`App.cls\` should be
migrated to pass those files / directories to the \`Image\` used by that Function
or Cls, i.e. using the \`Image.add_local_file\`, \`Image.add_local_dir\`, or
\`Image.add_local_python_source\` methods:

\`\`\`python notest
# Mounting local files

# Old way (deprecated)
mount = modal.Mount.from_local_dir("data").add_local_file("config.yaml")
@app.function(image=image, mount=mount)
def f():
    ...

# New way
image = image.add_local_dir("data", "/root/data").add_local_file("config.yaml", "/root/config.yaml")
@app.function(image=image)
def f():
    ...

## Mounting local Python source code

# Old way (deprecated)
mount = modal.Mount.from_local_python_packages("my-lib"))
@app.function(image=image, mount=mount)
def f()
    ...

# New way
image = image.add_local_python_source("my-lib")
@app.function(image=image)
def f(...):
    ...

## Using Image.copy_mount

# Old way (deprecated)
mount = modal.Mount.from_local_dir("data").add_local_file("config.yaml")
image.copy_mount(mount)

# New way
image.add_local_dir("data", "root/data").add_local_file("config.yaml", "/root/config.yaml")
\`\`\`

Code that uses the \`context_mount=\` parameter of \`Image.from_dockerfile\` and
\`Image.dockerfile_commands\` methods can delete that parameter; we now
automatically infer the files that need to be included in the context.

## Deprecating the \`@modal.build\` decorator

_Introduced in: v0.72.17_

As part of consolidating the filesystem configuration API, we are also
deprecating the \`modal.build\` decorator.

For use cases where \`modal.build\` would previously have been the suggested
approach (e.g., downloading model weights or other large assets to the
container filesystem), we now recommend using a \`modal.Volume\` instead. The
main advantage of storing weights in a \`Volume\` instead of an \`Image\` is that
the weights do not need to be re-downloaded every time you change something else
about the \`Image\` definition.

Many frameworks, such as Hugging Face, automatically cache downloaded model
weights. When using these frameworks, you just need to ensure that you mount a
\`modal.Volume\` to the expected location of the framework’s cache:

\`\`\`python notest
cache_vol = modal.Volume.from_name("hf-hub-cache")
@app.cls(
    image=image.env({"HF_HUB_CACHE": "/cache"}),
    volumes={"/cache": cache_vol},
    ...
)
class Model:
    @modal.enter()
    def load_model(self):
        self.model = ModelClass.from_pretrained(...)
\`\`\`

For frameworks that don’t support automatic caching, you could write a separate
function to download the weights and write them directly to the Volume, then
\`modal run\` against this function before you deploy.

In some cases (e.g., if the step runs very quickly), you may wish for the logic
currently decorated with \`@modal.build\` to continue modifying the Image
filesystem. In that case, you can extract the method as a standalone function
and pass it to \`Image.run_function\`:

\`\`\`python notest
def download_weights():
    ...

image = image.run_function(download_weights)
\`\`\`

## Requiring explicit inclusion of local Python dependencies

_Introduced in: 0.73.11_ | _Enforced in: 1.0.0_

Prior to 1.0, Modal will inspect the modules that are imported when running
your App code and automatically include any "local" modules in the remote
container environment. This behavior is referred to as "automounting".

While convenient, this approach has a number of edge cases and surprising
behaviors, such as ignoring modules with imports that are deferred using
\`Image.imports\`. Additionally, it is difficult to configure the automounting
behavior to, e.g., ignore large data files that are stored within your local
Python project directories.

Going forward, it will be necessary to explicitly include the local dependencies
of your Modal App. The easiest way to do this is with
[\`Image.add_local_python_source\`](/docs/sdk/py/latest/Image#add_local_python_source):

\`\`\`python notest
import modal
import helpers

image = modal.Image.debian_slim().add_local_python_source("helpers")
\`\`\`

In the period leading up to the change in default behavior, the Modal client
will issue deprecation warnings when automounted modules are not included
in the Image. Updating the Image definition will remove these warnings.

Note that Modal will continue to automatically include the source module or
package defining the App itself. We're introducing a new App or Function-level
parameter, \`include_source\`, which can be set to \`False\` in cases where this is
not desired (i.e., because your Image definition already includes the App
source).

## Renaming autoscaler parameters

_Introduced in: v0.73.76_

We're renaming several parameters that configure autoscaling behavior:

- \`keep_warm\` is now \`min_containers\`
- \`concurrency_limit\` is now \`max_containers\`
- \`container_idle_timeout\` is now \`scaledown_window\`

The renaming is intended to address some persistent confusion about
the meaning of these parameters. The migration path is a simple
find-and-replace operation.

Additionally, we're promoting a fourth parameter, \`buffer_containers\`,
from experimental status (previously \`_experimental_buffer_containers\`).
Like \`min_containers\`, \`buffer_containers\` can help mitigate cold-start
penalties by overprovisioning containers while the Function is active.

## Renaming \`modal.web_endpoint\` to \`modal.fastapi_endpoint\`

_Introduced in: v0.73.89_

We're renaming the \`modal.web_endpoint\` decorator to \`modal.fastapi_endpoint\`
so that the implicit dependency on FastAPI is more clear. This can be a
simple name substitution in your code as the semantics are otherwise identical.

We may reintroduce a lightweight \`modal.web_endpoint\` without external
dependencies in the future.

## Replacing \`allow_concurrent_inputs\` with \`@modal.concurrent\`

_Introduced in: v0.73.148_

The \`allow_concurrent_inputs\` parameter is being replaced with a new decorator,
\`@modal.concurrent\`. The decorator can be applied either to a Function or a Cls.
We're moving the input concurrency feature out of "Beta" status as part of this
change.

The new decorator exposes two distinct parameters: \`max_inputs\` (the limit
on the number of inputs the Function will concurrently accept) and
\`target_inputs\` (the level of concurrency targeted by the Modal autoscaler).
The simplest migration path is to replace \`allow_concurrent_inputs=N\` with
\`@modal.concurrent(max_inputs=N)\`:

\`\`\`python notest
# Old way, with a function (deprecated)
@app.function(allow_concurrent_inputs=1000)
def f(...):
    ...

# New way, with a function
@app.function()
@modal.concurrent(max_inputs=1000)
def f(...):
    ...

# Old way, with a class (deprecated)
@app.cls(allow_concurrent_inputs=1000)
class MyCls:
    ...

# New way, with a class
@app.cls()
@modal.concurrent(max_inputs=1000)
class MyCls:
    ...
\`\`\`

Setting \`target_inputs\` along with \`max_inputs\` may benefit performance by
reducing latency during periods where the container pool is scaling up. See the
[input concurrency guide](/docs/guide/concurrent-inputs) for more information.

## Deprecating the \`.lookup\` method on Modal objects

_Introduced in: v0.72.56_

Most Modal objects can be instantiated through two distinct methods:
\`.from_name\` and \`.lookup\`. The redundancy between these methods is a persistent
source of confusion.

The \`.from_name\` method is lazy: it operates entirely locally and instantiates
only a shell for the object. The local object won’t be associated with its
identity on the Modal server until you interact with it. In contrast, the
\`.lookup\` method is eager: it triggers a remote call to the Modal server, and it
returns a fully-hydrated object.

Because Modal objects can now be hydrated on-demand, when they are first
used, there is rarely any need to eagerly hydrate. Therefore, we’re deprecating
\`.lookup\` so that there’s only one obvious way to instantiate objects.

In most cases, the migration is a simple find-and-replace of \`.lookup\` →
\`.from_name\`.

One exception is when your code needs to access object metadata, such as its ID,
or a Web Function URL. In that case, you can explicitly force hydration of the
object by calling its \`.hydrate()\` method. There may be other subtle consequences,
such as errors being raised at a different location if no object exists with the
given name.

## Removing support for custom Cls constructors

_Introduced in: v0.74.0_

Classes decorated with \`App.cls\` are no longer allowed to have a custom constructor
(\`__init__\` method). Instead, class parameterization should be exposed using
dataclass-style [\`modal.parameter\`](/docs/sdk/py/latest/parameter) annotations:

\`\`\`python notest
# Old way (deprecated)
@app.cls()
class MyCls:
    def __init__(self, name: str = "Bert"):
        self.name = name

# New way
@app.cls()
class MyCls:
    name: str = modal.parameter(default="Bert")
\`\`\`

Modal will provide a synthetic constructor for classes that use \`modal.parameter\`.
Arguments to the synthetic constructor must be passed using keywords, so you may
need to update your calling code as well:

\`\`\`python notest
obj = MyCls(name="Bert")  # name= is now required
\`\`\`

We're making this change to address some persistent confusion about when
constructors execute for remote calls and what operations are allowed to run in
them. If your custom constructor performs any setup logic beyond storing the
parameter values, you should move it to a method decorated with
\`@modal.enter()\`.

Additionally, we're reducing the types that we support as class parameters to
a small number of primitives (\`str\`, \`int\`, \`bool\`, and \`bytes\`).

Limiting class parameterization to primitive types will also allow us to provide
better observability over parameterized class instances in the web dashboard,
CLI, and other contexts where it is not possible to represent arbitrary Python
objects.

If you need to parameterize classes across more complex types, you can implement
your own serialization logic, e.g. using strings as the wire format:

\`\`\`python notest
@app.cls()
class MyCls:
    param_str: str = modal.parameter()

    @modal.enter()
    def deserialize_parameters(self):
        self.param_obj = SomeComplexType.from_str(self.param_str)
\`\`\`

We recommend adopting interpretable constructor arguments (i.e., prefer
meaningful strings over pickled bytes) so that you will be able to get the most
benefit from future improvements to parameterized class observability.

## Simplifying Cls lookup patterns

_Introduced in: v0.73.26_

Modal previously supported several different patterns for looking up a \`modal.Cls\`
and remotely invoking one of its methods:

\`\`\`python notest
# Documented pattern
MyCls = modal.Cls.from_name("my-app", "MyCls")
obj = MyCls()
obj.some_method.remote(...)

# Alternate pattern: skipping the object instantiation
MyCls = modal.Cls.from_name("my-app", "MyCls")
MyCls.some_method.remote(...)

# Alternate pattern: looking up the method as a Function
f = modal.Function.lookup("my-app", "MyCls.some_method")
f.remote(...)
\`\`\`

While each pattern could successfully trigger a remote function call, there were
a number of subtle differences in behavior between them.

Going forward, we will only support the first pattern. Making remote calls to a
method on a deployed Cls will require you to (a) look up the object using
\`modal.Cls\` and (b) instantiate the object before calling its methods.

## Deprecating \`modal.gpu\` objects

_Introduced in: v0.73.31_

The \`modal.gpu\` objects are being deprecated; going forward, all GPU resource
configuration should be accomplished using strings.

This should be an easy code substitution, e.g. \`gpu=modal.gpu.H100()\` can be
replaced with \`gpu="H100"\`. When using the \`count=\` parameter of the GPU class,
simply append it to the name with a colon (e.g. \`gpu="H100:8"\`). In the case of
the \`modal.gpu.A100(size="80GB")\` variant, the name of the corresponding gpu is
\`"A100-80GB"\`.

Note that string arguments are case-insensitive, so \`"H100"\` and \`"h100"\` are
both accepted.

The main rationale for this change is that it will allow us to introduce new
GPU models in the future without requring users to upgrade their SDK.

## Requiring explicit invocation for module mode

_Introduced in: 0.73.58_

The Modal CLI allows you to reference the source code for your App as either
a file path (e.g. \`src/my_app.py\`) or as a module name (e.g. \`src.my_app\`).

As in Python, the choice has some implications for how relative imports are
resolved. To make this more salient, Modal will mirror Python going forwared
and require that you explicitly invoke module mode by passing \`-m\` on your
command line (e.g., \`modal deploy -m src.my_app\`).
`,meta:{title:`Modal 1.0 migration guide`,description:`We released version 1.0 of the Modal Python SDK in May 2025. This release signifies an increased commitment to API stability and implies some changes to our development workflow.`}},{toc:g,rawContent:_,meta:v}=h,y=t(`Deprecating <code>Image.copy_*</code> methods`,1),b=t(`Deprecating <code>Mount</code> as part of the public API`,1),x=t(`Deprecating the <code>@modal.build</code> decorator`,1),S=t(`<code>Image.add_local_python_source</code>`),C=t(`Renaming <code>modal.web_endpoint</code> to <code>modal.fastapi_endpoint</code>`,1),w=t(`Replacing <code>allow_concurrent_inputs</code> with <code>@modal.concurrent</code>`,1),T=t(`Deprecating the <code>.lookup</code> method on Modal objects`,1),E=t(`<code>modal.parameter</code>`),D=t(`Deprecating <code>modal.gpu</code> objects`,1),O=t(`<!> <p>We released version 1.0 of the Modal Python SDK in May 2025.
This release signifies an increased commitment to API stability and implies
some changes to our development workflow.</p> <p>Preceding the 1.0 release, we introduced a number of deprecations and changes
based on feedback that we received from early users. These changes were intended
to address pain points and reduce confusion about some aspects of the Modal API.
While adapting to them requires some changes to existing code, we believe that
they’ll make it easier to use Modal going forward.</p> <p>This page highlights the major changes for 1.0 and provides some advice for how
to migrate your code to the new stable APIs. Most deprecations introduced prior
to the release of v1.0 will not be enforced (actually cause breaking changes)
until a subsequent minor (v1.x) release, but we recommend updating your code so
that you can take advantage of new features and avoid any future issues.</p> <!> <p><em>Introduced in: v0.72.11</em></p> <p>We recently introduced new <code>Image</code> methods — <code>Image.add_local_dir</code> and <code>Image.add_local_file</code> — to replace the existing <code>Image.copy_local_dir</code> and <code>Image.copy_local_file</code>.</p> <p>The new methods subsume the functionality of the old ones, but their default
behavior is different and more performant. By default, files will be mounted to
the container at runtime rather than copied into a new <code>Image</code> layer. This can
speed up development substantially when iterating on the contents of the files.</p> <p>Building a new <code>Image</code> layer should be necessary only when subsequent build
steps will use the added files. In that case, you can pass <code>copy=True</code> in <code>Image.add_local_file</code> or <code>Image.add_local_dir</code>.</p> <p>The <code>Image.add_local_dir</code> method also has an <code>ignore=</code> parameter, which you can
use to pass file-matching patterns (using dockerignore rules) or predicate
functions to exclude files.</p> <!> <p><em>Introduced in: v0.72.4</em> | <em>Enforced in: v1.0.0</em></p> <p>Currently, local files can be mounted to the container filesystem either by
including them in the <code>Image</code> definition or by passing a <code>modal.Mount</code> object
directly to the <code>App.function</code> or <code>App.cls</code> decorators. As part of the 1.0
release, we are simplifying the container filesystem configuration to be defined
only by the <code>Image</code> used for each Function. This implies deprecation of the
following:</p> <ul><li>The <code>mount=</code> parameter of <code>App.function</code> and <code>App.cls</code></li> <li>The <code>context_mount=</code> parameter of several <code>modal.Image</code> methods</li> <li>The <code>Image.copy_mount</code> method</li> <li>The <code>Mount</code> object</li></ul> <p>Code that uses the <code>mount=</code> parameter of <code>App.function</code> and <code>App.cls</code> should be
migrated to pass those files / directories to the <code>Image</code> used by that Function
or Cls, i.e. using the <code>Image.add_local_file</code>, <code>Image.add_local_dir</code>, or <code>Image.add_local_python_source</code> methods:</p> <!> <p>Code that uses the <code>context_mount=</code> parameter of <code>Image.from_dockerfile</code> and <code>Image.dockerfile_commands</code> methods can delete that parameter; we now
automatically infer the files that need to be included in the context.</p> <!> <p><em>Introduced in: v0.72.17</em></p> <p>As part of consolidating the filesystem configuration API, we are also
deprecating the <code>modal.build</code> decorator.</p> <p>For use cases where <code>modal.build</code> would previously have been the suggested
approach (e.g., downloading model weights or other large assets to the
container filesystem), we now recommend using a <code>modal.Volume</code> instead. The
main advantage of storing weights in a <code>Volume</code> instead of an <code>Image</code> is that
the weights do not need to be re-downloaded every time you change something else
about the <code>Image</code> definition.</p> <p>Many frameworks, such as Hugging Face, automatically cache downloaded model
weights. When using these frameworks, you just need to ensure that you mount a <code>modal.Volume</code> to the expected location of the framework’s cache:</p> <!> <p>For frameworks that don’t support automatic caching, you could write a separate
function to download the weights and write them directly to the Volume, then <code>modal run</code> against this function before you deploy.</p> <p>In some cases (e.g., if the step runs very quickly), you may wish for the logic
currently decorated with <code>@modal.build</code> to continue modifying the Image
filesystem. In that case, you can extract the method as a standalone function
and pass it to <code>Image.run_function</code>:</p> <!> <!> <p><em>Introduced in: 0.73.11</em> | <em>Enforced in: 1.0.0</em></p> <p>Prior to 1.0, Modal will inspect the modules that are imported when running
your App code and automatically include any “local” modules in the remote
container environment. This behavior is referred to as “automounting”.</p> <p>While convenient, this approach has a number of edge cases and surprising
behaviors, such as ignoring modules with imports that are deferred using <code>Image.imports</code>. Additionally, it is difficult to configure the automounting
behavior to, e.g., ignore large data files that are stored within your local
Python project directories.</p> <p>Going forward, it will be necessary to explicitly include the local dependencies
of your Modal App. The easiest way to do this is with <!>:</p> <!> <p>In the period leading up to the change in default behavior, the Modal client
will issue deprecation warnings when automounted modules are not included
in the Image. Updating the Image definition will remove these warnings.</p> <p>Note that Modal will continue to automatically include the source module or
package defining the App itself. We’re introducing a new App or Function-level
parameter, <code>include_source</code>, which can be set to <code>False</code> in cases where this is
not desired (i.e., because your Image definition already includes the App
source).</p> <!> <p><em>Introduced in: v0.73.76</em></p> <p>We’re renaming several parameters that configure autoscaling behavior:</p> <ul><li><code>keep_warm</code> is now <code>min_containers</code></li> <li><code>concurrency_limit</code> is now <code>max_containers</code></li> <li><code>container_idle_timeout</code> is now <code>scaledown_window</code></li></ul> <p>The renaming is intended to address some persistent confusion about
the meaning of these parameters. The migration path is a simple
find-and-replace operation.</p> <p>Additionally, we’re promoting a fourth parameter, <code>buffer_containers</code>,
from experimental status (previously <code>_experimental_buffer_containers</code>).
Like <code>min_containers</code>, <code>buffer_containers</code> can help mitigate cold-start
penalties by overprovisioning containers while the Function is active.</p> <!> <p><em>Introduced in: v0.73.89</em></p> <p>We’re renaming the <code>modal.web_endpoint</code> decorator to <code>modal.fastapi_endpoint</code> so that the implicit dependency on FastAPI is more clear. This can be a
simple name substitution in your code as the semantics are otherwise identical.</p> <p>We may reintroduce a lightweight <code>modal.web_endpoint</code> without external
dependencies in the future.</p> <!> <p><em>Introduced in: v0.73.148</em></p> <p>The <code>allow_concurrent_inputs</code> parameter is being replaced with a new decorator, <code>@modal.concurrent</code>. The decorator can be applied either to a Function or a Cls.
We’re moving the input concurrency feature out of “Beta” status as part of this
change.</p> <p>The new decorator exposes two distinct parameters: <code>max_inputs</code> (the limit
on the number of inputs the Function will concurrently accept) and <code>target_inputs</code> (the level of concurrency targeted by the Modal autoscaler).
The simplest migration path is to replace <code>allow_concurrent_inputs=N</code> with <code>@modal.concurrent(max_inputs=N)</code>:</p> <!> <p>Setting <code>target_inputs</code> along with <code>max_inputs</code> may benefit performance by
reducing latency during periods where the container pool is scaling up. See the <!> for more information.</p> <!> <p><em>Introduced in: v0.72.56</em></p> <p>Most Modal objects can be instantiated through two distinct methods: <code>.from_name</code> and <code>.lookup</code>. The redundancy between these methods is a persistent
source of confusion.</p> <p>The <code>.from_name</code> method is lazy: it operates entirely locally and instantiates
only a shell for the object. The local object won’t be associated with its
identity on the Modal server until you interact with it. In contrast, the <code>.lookup</code> method is eager: it triggers a remote call to the Modal server, and it
returns a fully-hydrated object.</p> <p>Because Modal objects can now be hydrated on-demand, when they are first
used, there is rarely any need to eagerly hydrate. Therefore, we’re deprecating <code>.lookup</code> so that there’s only one obvious way to instantiate objects.</p> <p>In most cases, the migration is a simple find-and-replace of <code>.lookup</code> → <code>.from_name</code>.</p> <p>One exception is when your code needs to access object metadata, such as its ID,
or a Web Function URL. In that case, you can explicitly force hydration of the
object by calling its <code>.hydrate()</code> method. There may be other subtle consequences,
such as errors being raised at a different location if no object exists with the
given name.</p> <!> <p><em>Introduced in: v0.74.0</em></p> <p>Classes decorated with <code>App.cls</code> are no longer allowed to have a custom constructor
(<code>__init__</code> method). Instead, class parameterization should be exposed using
dataclass-style <!> annotations:</p> <!> <p>Modal will provide a synthetic constructor for classes that use <code>modal.parameter</code>.
Arguments to the synthetic constructor must be passed using keywords, so you may
need to update your calling code as well:</p> <!> <p>We’re making this change to address some persistent confusion about when
constructors execute for remote calls and what operations are allowed to run in
them. If your custom constructor performs any setup logic beyond storing the
parameter values, you should move it to a method decorated with <code>@modal.enter()</code>.</p> <p>Additionally, we’re reducing the types that we support as class parameters to
a small number of primitives (<code>str</code>, <code>int</code>, <code>bool</code>, and <code>bytes</code>).</p> <p>Limiting class parameterization to primitive types will also allow us to provide
better observability over parameterized class instances in the web dashboard,
CLI, and other contexts where it is not possible to represent arbitrary Python
objects.</p> <p>If you need to parameterize classes across more complex types, you can implement
your own serialization logic, e.g. using strings as the wire format:</p> <!> <p>We recommend adopting interpretable constructor arguments (i.e., prefer
meaningful strings over pickled bytes) so that you will be able to get the most
benefit from future improvements to parameterized class observability.</p> <!> <p><em>Introduced in: v0.73.26</em></p> <p>Modal previously supported several different patterns for looking up a <code>modal.Cls</code> and remotely invoking one of its methods:</p> <!> <p>While each pattern could successfully trigger a remote function call, there were
a number of subtle differences in behavior between them.</p> <p>Going forward, we will only support the first pattern. Making remote calls to a
method on a deployed Cls will require you to (a) look up the object using <code>modal.Cls</code> and (b) instantiate the object before calling its methods.</p> <!> <p><em>Introduced in: v0.73.31</em></p> <p>The <code>modal.gpu</code> objects are being deprecated; going forward, all GPU resource
configuration should be accomplished using strings.</p> <p>This should be an easy code substitution, e.g. <code>gpu=modal.gpu.H100()</code> can be
replaced with <code>gpu="H100"</code>. When using the <code>count=</code> parameter of the GPU class,
simply append it to the name with a colon (e.g. <code>gpu="H100:8"</code>). In the case of
the <code>modal.gpu.A100(size="80GB")</code> variant, the name of the corresponding gpu is <code>"A100-80GB"</code>.</p> <p>Note that string arguments are case-insensitive, so <code>"H100"</code> and <code>"h100"</code> are
both accepted.</p> <p>The main rationale for this change is that it will allow us to introduce new
GPU models in the future without requring users to upgrade their SDK.</p> <!> <p><em>Introduced in: 0.73.58</em></p> <p>The Modal CLI allows you to reference the source code for your App as either
a file path (e.g. <code>src/my_app.py</code>) or as a module name (e.g. <code>src.my_app</code>).</p> <p>As in Python, the choice has some implications for how relative imports are
resolved. To make this more salient, Modal will mirror Python going forwared
and require that you explicitly invoke module mode by passing <code>-m</code> on your
command line (e.g., <code>modal deploy -m src.my_app</code>).</p>`,1);function k(t,g){let _=a(g,[`children`,`$$slots`,`$$events`,`$$legacy`]);p(t,o(()=>_,()=>h,{children:(t,a)=>{var o=O(),p=s(o);d(p,{id:`modal-10-migration-guide`,children:(e,t)=>{l(),i(e,r(`Modal 1.0 migration guide`))},$$slots:{default:!0}});var h=c(p,8);u(h,{id:`deprecating-imagecopy_-methods`,children:(e,t)=>{l();var n=y();l(2),i(e,n)},$$slots:{default:!0}});var g=c(h,12);u(g,{id:`deprecating-mount-as-part-of-the-public-api`,children:(e,t)=>{l();var n=b();l(2),i(e,n)},$$slots:{default:!0}});var _=c(g,10);f(_,{code:`%23%20Mounting%20local%20files%0A%0A%23%20Old%20way%20(deprecated)%0Amount%20%3D%20modal.Mount.from_local_dir(%22data%22).add_local_file(%22config.yaml%22)%0A%40app.function(image%3Dimage%2C%20mount%3Dmount)%0Adef%20f()%3A%0A%20%20%20%20...%0A%0A%23%20New%20way%0Aimage%20%3D%20image.add_local_dir(%22data%22%2C%20%22%2Froot%2Fdata%22).add_local_file(%22config.yaml%22%2C%20%22%2Froot%2Fconfig.yaml%22)%0A%40app.function(image%3Dimage)%0Adef%20f()%3A%0A%20%20%20%20...%0A%0A%23%23%20Mounting%20local%20Python%20source%20code%0A%0A%23%20Old%20way%20(deprecated)%0Amount%20%3D%20modal.Mount.from_local_python_packages(%22my-lib%22))%0A%40app.function(image%3Dimage%2C%20mount%3Dmount)%0Adef%20f()%0A%20%20%20%20...%0A%0A%23%20New%20way%0Aimage%20%3D%20image.add_local_python_source(%22my-lib%22)%0A%40app.function(image%3Dimage)%0Adef%20f(...)%3A%0A%20%20%20%20...%0A%0A%23%23%20Using%20Image.copy_mount%0A%0A%23%20Old%20way%20(deprecated)%0Amount%20%3D%20modal.Mount.from_local_dir(%22data%22).add_local_file(%22config.yaml%22)%0Aimage.copy_mount(mount)%0A%0A%23%20New%20way%0Aimage.add_local_dir(%22data%22%2C%20%22root%2Fdata%22).add_local_file(%22config.yaml%22%2C%20%22%2Froot%2Fconfig.yaml%22)`,lang:`python`});var v=c(_,4);u(v,{id:`deprecating-the-modalbuild-decorator`,children:(e,t)=>{l();var n=x();l(2),i(e,n)},$$slots:{default:!0}});var k=c(v,10);f(k,{code:`cache_vol%20%3D%20modal.Volume.from_name(%22hf-hub-cache%22)%0A%40app.cls(%0A%20%20%20%20image%3Dimage.env(%7B%22HF_HUB_CACHE%22%3A%20%22%2Fcache%22%7D)%2C%0A%20%20%20%20volumes%3D%7B%22%2Fcache%22%3A%20cache_vol%7D%2C%0A%20%20%20%20...%0A)%0Aclass%20Model%3A%0A%20%20%20%20%40modal.enter()%0A%20%20%20%20def%20load_model(self)%3A%0A%20%20%20%20%20%20%20%20self.model%20%3D%20ModelClass.from_pretrained(...)`,lang:`python`});var A=c(k,6);f(A,{code:`def%20download_weights()%3A%0A%20%20%20%20...%0A%0Aimage%20%3D%20image.run_function(download_weights)`,lang:`python`});var j=c(A,2);u(j,{id:`requiring-explicit-inclusion-of-local-python-dependencies`,children:(e,t)=>{l(),i(e,r(`Requiring explicit inclusion of local Python dependencies`))},$$slots:{default:!0}});var M=c(j,8);m(c(e(M)),{href:`/docs/sdk/py/latest/Image#add_local_python_source`,children:(e,t)=>{i(e,S())},$$slots:{default:!0}}),l(),n(M);var N=c(M,2);f(N,{code:`import%20modal%0Aimport%20helpers%0A%0Aimage%20%3D%20modal.Image.debian_slim().add_local_python_source(%22helpers%22)`,lang:`python`});var P=c(N,6);u(P,{id:`renaming-autoscaler-parameters`,children:(e,t)=>{l(),i(e,r(`Renaming autoscaler parameters`))},$$slots:{default:!0}});var F=c(P,12);u(F,{id:`renaming-modalweb_endpoint-to-modalfastapi_endpoint`,children:(e,t)=>{l();var n=C();l(3),i(e,n)},$$slots:{default:!0}});var I=c(F,8);u(I,{id:`replacing-allow_concurrent_inputs-with-modalconcurrent`,children:(e,t)=>{l();var n=w();l(3),i(e,n)},$$slots:{default:!0}});var L=c(I,8);f(L,{code:`%23%20Old%20way%2C%20with%20a%20function%20(deprecated)%0A%40app.function(allow_concurrent_inputs%3D1000)%0Adef%20f(...)%3A%0A%20%20%20%20...%0A%0A%23%20New%20way%2C%20with%20a%20function%0A%40app.function()%0A%40modal.concurrent(max_inputs%3D1000)%0Adef%20f(...)%3A%0A%20%20%20%20...%0A%0A%23%20Old%20way%2C%20with%20a%20class%20(deprecated)%0A%40app.cls(allow_concurrent_inputs%3D1000)%0Aclass%20MyCls%3A%0A%20%20%20%20...%0A%0A%23%20New%20way%2C%20with%20a%20class%0A%40app.cls()%0A%40modal.concurrent(max_inputs%3D1000)%0Aclass%20MyCls%3A%0A%20%20%20%20...`,lang:`python`});var R=c(L,2);m(c(e(R),5),{href:`/docs/guide/concurrent-inputs`,children:(e,t)=>{l(),i(e,r(`input concurrency guide`))},$$slots:{default:!0}}),l(),n(R);var z=c(R,2);u(z,{id:`deprecating-the-lookup-method-on-modal-objects`,children:(e,t)=>{l();var n=T();l(2),i(e,n)},$$slots:{default:!0}});var B=c(z,14);u(B,{id:`removing-support-for-custom-cls-constructors`,children:(e,t)=>{l(),i(e,r(`Removing support for custom Cls constructors`))},$$slots:{default:!0}});var V=c(B,4);m(c(e(V),5),{href:`/docs/sdk/py/latest/parameter`,children:(e,t)=>{i(e,E())},$$slots:{default:!0}}),l(),n(V);var H=c(V,2);f(H,{code:`%23%20Old%20way%20(deprecated)%0A%40app.cls()%0Aclass%20MyCls%3A%0A%20%20%20%20def%20__init__(self%2C%20name%3A%20str%20%3D%20%22Bert%22)%3A%0A%20%20%20%20%20%20%20%20self.name%20%3D%20name%0A%0A%23%20New%20way%0A%40app.cls()%0Aclass%20MyCls%3A%0A%20%20%20%20name%3A%20str%20%3D%20modal.parameter(default%3D%22Bert%22)`,lang:`python`});var U=c(H,4);f(U,{code:`obj%20%3D%20MyCls(name%3D%22Bert%22)%20%20%23%20name%3D%20is%20now%20required`,lang:`python`});var W=c(U,10);f(W,{code:`%40app.cls()%0Aclass%20MyCls%3A%0A%20%20%20%20param_str%3A%20str%20%3D%20modal.parameter()%0A%0A%20%20%20%20%40modal.enter()%0A%20%20%20%20def%20deserialize_parameters(self)%3A%0A%20%20%20%20%20%20%20%20self.param_obj%20%3D%20SomeComplexType.from_str(self.param_str)`,lang:`python`});var G=c(W,4);u(G,{id:`simplifying-cls-lookup-patterns`,children:(e,t)=>{l(),i(e,r(`Simplifying Cls lookup patterns`))},$$slots:{default:!0}});var K=c(G,6);f(K,{code:`%23%20Documented%20pattern%0AMyCls%20%3D%20modal.Cls.from_name(%22my-app%22%2C%20%22MyCls%22)%0Aobj%20%3D%20MyCls()%0Aobj.some_method.remote(...)%0A%0A%23%20Alternate%20pattern%3A%20skipping%20the%20object%20instantiation%0AMyCls%20%3D%20modal.Cls.from_name(%22my-app%22%2C%20%22MyCls%22)%0AMyCls.some_method.remote(...)%0A%0A%23%20Alternate%20pattern%3A%20looking%20up%20the%20method%20as%20a%20Function%0Af%20%3D%20modal.Function.lookup(%22my-app%22%2C%20%22MyCls.some_method%22)%0Af.remote(...)`,lang:`python`});var q=c(K,6);u(q,{id:`deprecating-modalgpu-objects`,children:(e,t)=>{l();var n=D();l(2),i(e,n)},$$slots:{default:!0}}),u(c(q,12),{id:`requiring-explicit-invocation-for-module-mode`,children:(e,t)=>{l(),i(e,r(`Requiring explicit invocation for module mode`))},$$slots:{default:!0}}),l(6),i(t,o)},$$slots:{default:!0}}))}export{k as default,h as metadata};
//# sourceMappingURL=Dm-9i9Jo.js.map
