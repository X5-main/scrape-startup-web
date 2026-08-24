(function(){try{var e=typeof window<`u`?window:typeof global<`u`?global:typeof globalThis<`u`?globalThis:typeof self<`u`?self:{};e.SENTRY_RELEASE={id:`f99fcf9f0a844cc9bd13fdc8e5782b84`};var t=new e.Error().stack;t&&(e._sentryDebugIds=e._sentryDebugIds||{},e._sentryDebugIds[t]=`ca479e9c-c855-4f51-a864-23ae0cb7b71e`,e._sentryDebugIdIdentifier=`sentry-dbid-ca479e9c-c855-4f51-a864-23ae0cb7b71e`)}catch{}})();import{$t as e,St as t,Tn as n,Tt as r,bt as i,c as ee,d as a,en as te,tn as o,wn as s}from"./F_ixKBiO.js";import"./B1sc9Zdx.js";import"./Bb2deiU3.js";import{a as c,i as l,o as ne}from"./CPby7b1n.js";import{t as u}from"./BILrvr3I.js";import{t as d}from"./B4L_if842.js";import{t as f}from"./DeWGVqas2.js";import{t as p}from"./B6UiYoTw.js";var m={toc:[{depth:1,value:`App`,id:`app`,children:[{depth:2,value:`name`,id:`name`},{depth:2,value:`app_id`,id:`app_id`},{depth:2,value:`description`,id:`description`},{depth:2,value:`lookup`,id:`lookup`},{depth:2,value:`get_dashboard_url`,id:`get_dashboard_url`},{depth:2,value:`run`,id:`run`},{depth:2,value:`deploy`,id:`deploy`},{depth:2,value:`local_entrypoint`,id:`local_entrypoint`},{depth:2,value:`function`,id:`function`},{depth:2,value:`cls`,id:`cls`},{depth:2,value:`server`,id:`server`},{depth:2,value:`include`,id:`include`},{depth:2,value:`set_tags`,id:`set_tags`},{depth:2,value:`get_tags`,id:`get_tags`},{depth:2,value:`logs`,id:`logs`,children:[{depth:3,value:`logs.fetch`,id:`logsfetch`},{depth:3,value:`logs.tail`,id:`logstail`},{depth:3,value:`logs.stream`,id:`logsstream`}]}]}],rawContent:`# App


\`\`\`python
class App(object)
\`\`\`

A Modal App is a group of functions and classes that are deployed together.

The app serves at least three purposes:

* A unit of deployment for functions and classes.
* Syncing of identities of (primarily) functions and classes across processes
  (your local Python interpreter and every Modal container active in your application).
* Manage log collection for everything that happens inside your code.

**Registering functions with an app**

The most common way to explicitly register an Object with an app is through the
\`@app.function()\` decorator. It both registers the annotated function itself and
other passed objects, like schedules and secrets, with the app:

\`\`\`python
import modal

app = modal.App()

@app.function(
    secrets=[modal.Secret.from_name("some_secret")],
    schedule=modal.Period(days=1),
)
def foo():
    pass
\`\`\`

In this example, the secret and schedule are registered with the app.

\`\`\`python
__init__(self, name=None, *, tags=None, image=None, secrets=[], volumes={},
    include_source=True)
\`\`\`
Construct a new app, optionally with default image, mounts, secrets, or volumes.

**Parameters**

<Parameter name="name" type="str | None" defaultValue="None" description="Optional app name used for registration and lookup." />
<Parameter name="tags" type="dict[str, str] | None" defaultValue="None" description="Additional metadata to set on the App." />
<Parameter name="image" type="_Image | None" defaultValue="None" description="Default image for the App (otherwise defaults to \`modal.Image.debian_slim()\`)." />
<Parameter name="secrets" type="Sequence[_Secret]" defaultValue="[]" description="Secrets to add for all Functions in the App." />
<Parameter name="volumes" type="dict[str | PurePosixPath, _Volume]" defaultValue="&#123;&#125;" description="Volume mounts to use for all Functions." />
<Parameter name="include_source" type="bool" defaultValue="True" description="Default for whether Function source files are added to the Modal container (per-function override possible)." />

**Usage**

\`\`\`python notest
image = modal.Image.debian_slim().pip_install(...)
secret = modal.Secret.from_name("my-secret")
volume = modal.Volume.from_name("my-data")
app = modal.App(image=image, secrets=[secret], volumes={"/mnt/data": volume})
\`\`\`

## name

\`\`\`python
name(self)
\`\`\`
The user-provided name of the App.

**Returns**

The configured app name, if any.

## app_id

\`\`\`python
app_id(self)
\`\`\`
Return the app_id of a running or stopped app.

**Returns**

The app ID when the app has been deployed or run, otherwise None.

## description

\`\`\`python
description(self)
\`\`\`
The App's \`name\`, if available, or a fallback descriptive identifier.

**Returns**

Human-readable description string for the app.

## lookup

\`\`\`python
lookup(name, *, client=None, environment_name=None, create_if_missing=False)
\`\`\`
Look up an App with a given name, creating a new App if necessary.

Note that Apps created through this method will be in a deployed state,
but they will not have any associated Functions or Classes. This method
is mainly useful for creating an App to associate with a Sandbox.

**Parameters**

<Parameter name="name" type="str" description="App name to resolve or create." />
<Parameter name="client" type="_Client | None" defaultValue="None" description="Modal client to use; defaults to \`Client.from_env()\` when omitted." />
<Parameter name="environment_name" type="str | None" defaultValue="None" description="Optional environment name; defaults to the configured environment." />
<Parameter name="create_if_missing" type="bool" defaultValue="False" description="If True, create the app when it does not already exist." />

**Returns**

An \`App\` handle tied to the deployed app record.

**Usage**

\`\`\`python
app = modal.App.lookup("my-app", create_if_missing=True)
modal.Sandbox.create("echo", "hi", app=app)
\`\`\`

## get_dashboard_url

\`\`\`python
get_dashboard_url(self)
\`\`\`
Get the dashboard URL for the App.

**Returns**

The dashboard URL for the App.

**Usage**

\`\`\`python
app = modal.App.lookup("my-app")
print(app.get_dashboard_url())
\`\`\`

## run

\`\`\`python
run(self, *, name=None, client=None, detach=False, interactive=False,
    environment_name=None)
\`\`\`
Context manager that runs an ephemeral app on Modal.

Use this as the main entry point for your Modal application. All calls
to Modal Functions should be made within the scope of this context
manager, and they will correspond to the current App.

Note that you should not invoke this in global scope of a file where you have
Modal Functions or Classes defined, since that would run the block when the Function
or Cls is imported in your containers as well. If you want to run it as your entrypoint,
consider protecting it with \`\`if __name__ == "__main__"\`\`.

**Parameters**

<Parameter name="client" type="_Client | None" defaultValue="None" description="Modal client to use for the run session." />
<Parameter name="detach" type="bool" defaultValue="False" description="Whether to detach after starting the app." />
<Parameter name="interactive" type="bool" defaultValue="False" description="Whether to run in interactive mode." />
<Parameter name="environment_name" type="str | None" defaultValue="None" description="Optional environment name; defaults to the configured environment." />

**Returns**

Async context manager yielding this \`App\` while it is running.

**Usage**

\`\`\`python notest
with app.run():
    some_modal_function.remote()
\`\`\`

To enable output printing (i.e., to see App logs), use \`modal.enable_output()\`:

\`\`\`python notest
with modal.enable_output():
    with app.run():
        some_modal_function.remote()
\`\`\`

Note that you should not invoke this in global scope of a file where you have Modal
Functions or Classes defined, since that would run the block when the Function or Cls
is imported in your containers as well. If you want to run it as your entrypoint,
consider protecting it:

\`\`\`python
if __name__ == "__main__":
    with app.run():
        some_modal_function.remote()
\`\`\`

You can then run your script with:

\`\`\`shell
python app_module.py
\`\`\`

## deploy

\`\`\`python
deploy(self, *, name=None, environment_name=None, tag="", client=None,
    strategy="rolling")
\`\`\`
Deploy the App so that it is available persistently.

Deployed Apps will be available for lookup or web-based invocations until they are stopped.
Unlike with \`App.run\`, this method will return as soon as the deployment completes.

This method is a programmatic alternative to the \`modal deploy\` CLI command.

Unlike with \`App.run\`, Function logs will not stream back to the local client after the
App is deployed.

Note that you should not invoke this method in global scope, as that would redeploy
the App every time the file is imported. If you want to write a programmatic deployment
script, protect this call so that it only runs when the file is executed directly.

**Parameters**

<Parameter name="name" type="str | None" defaultValue="None" description="Name for the deployment, overriding any set on the App." />
<Parameter name="environment_name" type="str | None" defaultValue="None" description="Environment to deploy the App in." />
<Parameter name="tag" type="str" defaultValue="&quot;&quot;" description="Optional metadata that is specific to this deployment." />
<Parameter name="client" type="_Client | None" defaultValue="None" description="Alternate client to use for communication with the server." />
<Parameter name="strategy" type="str" defaultValue="&quot;rolling&quot;" description="Deployment strategy. \`\`rolling\`\` (default) shifts traffic gradually to new containers while old ones drain. \`\`recreate\`\` terminates all running containers as part of the deployment before new work starts." />

**Returns**

This app instance after deployment completes.

**Usage**

\`\`\`python notest
app = App("my-app")
app.deploy()
\`\`\`

To enable output printing (i.e., to see build logs), use \`modal.enable_output()\`:

\`\`\`python notest
app = App("my-app")
with modal.enable_output():
    app.deploy()
\`\`\`

Unlike with \`App.run\`, Function logs will not stream back to the local client after the App is deployed.

Note that you should not invoke this method in global scope, as that would redeploy the App every time
the file is imported. If you want to write a programmatic deployment script, protect this call so that it
only runs when the file is executed directly. You can then run your script with:

\`\`\`python notest
if __name__ == "__main__":
    with modal.enable_output():
        app.deploy()
\`\`\`

Then you can deploy your app with:

\`\`\`shell
python app_module.py
\`\`\`

## local_entrypoint

\`\`\`python
local_entrypoint(self, _warn_parentheses_missing=None, *, name=None)
\`\`\`
Decorate a function to be used as a CLI entrypoint for a Modal App.

These functions can be used to define code that runs locally to set up the app,
and act as an entrypoint to start Modal functions from. Note that regular
Modal functions can also be used as CLI entrypoints, but unlike \`local_entrypoint\`,
those functions are executed remotely directly.

Note that an explicit [\`app.run()\`](https://modal.com/docs/sdk/py/latest/App#run) is not needed, as an
[app](https://modal.com/docs/guide/apps) is automatically created for you.

**Parameters**

<Parameter name="name" type="str | None" defaultValue="None" description="Optional name for the entrypoint; defaults to the function&#x27;s qualified name." />

**Returns**

A decorator that registers the wrapped callable as a local CLI entrypoint.

**Usage**

\`\`\`python
@app.local_entrypoint()
def main():
    some_modal_function.remote()
\`\`\`

You can call the function using \`modal run\` directly from the CLI:

\`\`\`shell
modal run app_module.py
\`\`\`

Note that an explicit \`app.run()\` is not needed, as an app is automatically created for you.

**Multiple entrypoints**

If you have multiple \`local_entrypoint\` functions, qualify the name:

\`\`\`shell
modal run app_module.py::app.some_other_function
\`\`\`

**Parsing arguments**

If your entrypoint function take arguments with primitive types, \`modal run\` automatically
parses them as CLI options. For example, the following function can be called with
\`modal run app_module.py --foo 1 --bar "hello"\`:

\`\`\`python
@app.local_entrypoint()
def main(foo: int, bar: str):
    some_modal_function.call(foo, bar)
\`\`\`

Currently, \`str\`, \`int\`, \`float\`, \`bool\`, and \`datetime.datetime\` are supported.
Use \`modal run app_module.py --help\` for more information on usage.

## function

\`\`\`python
function(self, *, image=None, schedule=None, env=None, secrets=None, gpu=None,
    serialized=False, network_file_systems={}, volumes={}, cpu=None,
    memory=None, ephemeral_disk=None, min_containers=None, max_containers=None,
    buffer_containers=None, scaledown_window=None, proxy=None, retries=None,
    timeout=300, startup_timeout=None, name=None, is_generator=None, cloud=None,
    region=None, routing_region=None, nonpreemptible=False,
    enable_memory_snapshot=False, block_network=False,
    restrict_modal_access=False, single_use_containers=False, i6pn=None,
    include_source=None, experimental_options=None,
    _experimental_restrict_output=False, max_inputs=None)
\`\`\`
Decorator to register a new Modal Function with this App.

**Parameters**

<Parameter name="image" type="_Image | None" defaultValue="None" description="The image to run as the container for the function." />
<Parameter name="schedule" type="Schedule | None" defaultValue="None" description="An optional Modal Schedule for the function." />
<Parameter name="env" type="dict[str, str | None] | None" defaultValue="None" description="Environment variables to set in the container." />
<Parameter name="secrets" type="Collection[_Secret] | None" defaultValue="None" description="Secrets to inject into the container as environment variables." />
<Parameter name="gpu" type="str | list[str] | None" defaultValue="None" description="GPU request; either a single GPU type or a list of types." />
<Parameter name="serialized" type="bool" defaultValue="False" description="Whether to send the function over using cloudpickle." />
<Parameter name="network_file_systems" type="dict[str | PurePosixPath, _NetworkFileSystem]" defaultValue="&#123;&#125;" description="Mountpoints for Modal NetworkFileSystems." />
<Parameter name="volumes" type="dict[str | PurePosixPath, _Volume | _CloudBucketMount]" defaultValue="&#123;&#125;" description="Mount points for Modal Volumes &amp; CloudBucketMounts." />
<Parameter name="cpu" type="float | tuple[float, float] | None" defaultValue="None" description="Specify, in fractional CPU cores, how many CPU cores to request. Or, pass (request, limit) to additionally specify a hard limit in fractional CPU cores. CPU throttling will prevent a container from exceeding its specified limit." />
<Parameter name="memory" type="int | tuple[int, int] | None" defaultValue="None" description="Specify, in MiB, a memory request which is the minimum memory required. Or, pass (request, limit) to additionally specify a hard limit in MiB." />
<Parameter name="ephemeral_disk" type="int | None" defaultValue="None" description="Specify, in MiB, the ephemeral disk size for the Function." />
<Parameter name="min_containers" type="int | None" defaultValue="None" description="Minimum number of containers to keep warm, even when Function is idle." />
<Parameter name="max_containers" type="int | None" defaultValue="None" description="Limit on the number of containers that can be concurrently running." />
<Parameter name="buffer_containers" type="int | None" defaultValue="None" description="Number of additional idle containers to maintain under active load." />
<Parameter name="scaledown_window" type="int | None" defaultValue="None" description="Max time (in seconds) a container can remain idle while scaling down." />
<Parameter name="proxy" type="_Proxy | None" defaultValue="None" description="Reference to a Modal Proxy to use in front of this function." />
<Parameter name="retries" type="int | Retries | None" defaultValue="None" description="Number of times to retry each input in case of failure." />
<Parameter name="timeout" type="int" defaultValue="300" description="Maximum execution time for inputs and startup time in seconds." />
<Parameter name="startup_timeout" type="int | None" defaultValue="None" description="Maximum startup time in seconds with higher precedence than \`timeout\`." />
<Parameter name="name" type="str | None" defaultValue="None" description="Sets the Modal name of the function within the app." />
<Parameter name="is_generator" type="None | bool" defaultValue="None" description="Set this to True if it&#x27;s a non-generator function returning a sync or async generator object." />
<Parameter name="cloud" type="str | None" defaultValue="None" description="Cloud provider to run the function on. Possible values are aws, gcp, oci, auto." />
<Parameter name="region" type="str | Sequence[str] | None" defaultValue="None" description="Region or regions to run the function on." />
<Parameter name="routing_region" type="str | None" defaultValue="None" description="Region to route inputs to the function through." />
<Parameter name="nonpreemptible" type="bool" defaultValue="False" description="Whether to run the function on a nonpreemptible instance." />
<Parameter name="enable_memory_snapshot" type="bool" defaultValue="False" description="Enable memory checkpointing for faster cold starts." />
<Parameter name="block_network" type="bool" defaultValue="False" description="Whether to block network access." />
<Parameter name="restrict_modal_access" type="bool" defaultValue="False" description="Whether to allow this function access to other Modal resources." />
<Parameter name="single_use_containers" type="bool" defaultValue="False" description="When True, containers will shut down after handling a single input." />
<Parameter name="i6pn" type="bool | None" defaultValue="None" description="Whether to enable IPv6 container networking within the region." />
<Parameter name="include_source" type="bool | None" defaultValue="None" description="Whether the file or directory containing the Function&#x27;s source should automatically be included in the container. When unset, falls back to the App-level configuration, or is otherwise True by default." />
<Parameter name="experimental_options" type="dict[str, Any] | None" defaultValue="None" description="Experimental options for the function." />
<Parameter name="_experimental_restrict_output" type="bool" defaultValue="False" description="Experimental; do not use pickle for return values." />
<Parameter name="max_inputs" type="int | None" defaultValue="None" description="Deprecated; replaced with \`single_use_containers\`." />

**Returns**

A decorator that registers the wrapped callable or partial as a Modal \`Function\`.

## cls

\`\`\`python
cls(self, *, image=None, env=None, secrets=None, gpu=None, serialized=False,
    network_file_systems={}, volumes={}, cpu=None, memory=None,
    ephemeral_disk=None, min_containers=None, max_containers=None,
    buffer_containers=None, scaledown_window=None, proxy=None, retries=None,
    timeout=300, startup_timeout=None, cloud=None, region=None,
    routing_region=None, nonpreemptible=False, enable_memory_snapshot=False,
    block_network=False, restrict_modal_access=False,
    single_use_containers=False, i6pn=None, include_source=None,
    experimental_options=None, _experimental_restrict_output=False,
    max_inputs=None)
\`\`\`
Decorator to register a new Modal [Cls](https://modal.com/docs/sdk/py/latest/Cls) with this App.

**Parameters**

<Parameter name="image" type="_Image | None" defaultValue="None" description="The image to run as the container for the class service." />
<Parameter name="env" type="dict[str, str | None] | None" defaultValue="None" description="Environment variables to set in the container." />
<Parameter name="secrets" type="Collection[_Secret] | None" defaultValue="None" description="Secrets to inject into the container as environment variables." />
<Parameter name="gpu" type="str | list[str] | None" defaultValue="None" description="GPU request; either a single GPU type or a list of types." />
<Parameter name="serialized" type="bool" defaultValue="False" description="Whether to send the class over using cloudpickle." />
<Parameter name="network_file_systems" type="dict[str | PurePosixPath, _NetworkFileSystem]" defaultValue="&#123;&#125;" description="Mountpoints for Modal NetworkFileSystems." />
<Parameter name="volumes" type="dict[str | PurePosixPath, _Volume | _CloudBucketMount]" defaultValue="&#123;&#125;" description="Mount points for Modal Volumes &amp; CloudBucketMounts." />
<Parameter name="cpu" type="float | tuple[float, float] | None" defaultValue="None" description="Specify, in fractional CPU cores, how many CPU cores to request. Or, pass (request, limit) to additionally specify a hard limit in fractional CPU cores. CPU throttling will prevent a container from exceeding its specified limit." />
<Parameter name="memory" type="int | tuple[int, int] | None" defaultValue="None" description="Specify, in MiB, a memory request which is the minimum memory required. Or, pass (request, limit) to additionally specify a hard limit in MiB." />
<Parameter name="ephemeral_disk" type="int | None" defaultValue="None" description="Specify, in MiB, the ephemeral disk size for the Function." />
<Parameter name="min_containers" type="int | None" defaultValue="None" description="Minimum number of containers to keep warm, even when Function is idle." />
<Parameter name="max_containers" type="int | None" defaultValue="None" description="Limit on the number of containers that can be concurrently running." />
<Parameter name="buffer_containers" type="int | None" defaultValue="None" description="Number of additional idle containers to maintain under active load." />
<Parameter name="scaledown_window" type="int | None" defaultValue="None" description="Max time (in seconds) a container can remain idle while scaling down." />
<Parameter name="proxy" type="_Proxy | None" defaultValue="None" description="Reference to a Modal Proxy to use in front of this function." />
<Parameter name="retries" type="int | Retries | None" defaultValue="None" description="Number of times to retry each input in case of failure." />
<Parameter name="timeout" type="int" defaultValue="300" description="Maximum execution time for inputs and startup time in seconds." />
<Parameter name="startup_timeout" type="int | None" defaultValue="None" description="Maximum startup time in seconds with higher precedence than \`timeout\`." />
<Parameter name="cloud" type="str | None" defaultValue="None" description="Cloud provider to run the function on. Possible values are aws, gcp, oci, auto." />
<Parameter name="region" type="str | Sequence[str] | None" defaultValue="None" description="Region or regions to run the function on." />
<Parameter name="routing_region" type="str | None" defaultValue="None" description="Region to route inputs to the function through." />
<Parameter name="nonpreemptible" type="bool" defaultValue="False" description="Whether to run the function on a non-preemptible instance." />
<Parameter name="enable_memory_snapshot" type="bool" defaultValue="False" description="Enable memory checkpointing for faster cold starts." />
<Parameter name="block_network" type="bool" defaultValue="False" description="Whether to block network access." />
<Parameter name="restrict_modal_access" type="bool" defaultValue="False" description="Whether to allow this class access to other Modal resources." />
<Parameter name="single_use_containers" type="bool" defaultValue="False" description="When True, containers will shut down after handling a single input." />
<Parameter name="i6pn" type="bool | None" defaultValue="None" description="Whether to enable IPv6 container networking within the region." />
<Parameter name="include_source" type="bool | None" defaultValue="None" description="When \`\`False\`\`, don&#x27;t automatically add the App source to the container." />
<Parameter name="experimental_options" type="dict[str, Any] | None" defaultValue="None" description="Experimental options for the class service." />
<Parameter name="_experimental_restrict_output" type="bool" defaultValue="False" description="Experimental; do not use pickle for return values." />
<Parameter name="max_inputs" type="int | None" defaultValue="None" description="Deprecated; replaced with \`single_use_containers\`." />

**Returns**

A decorator that registers the wrapped class or partial as a Modal \`Cls\`.

## server

\`\`\`python
server(self, *, image=None, env=None, secrets=None, gpu=None, serialized=False,
    volumes={}, cpu=None, memory=None, ephemeral_disk=None,
    target_concurrency=None, min_containers=None, max_containers=None,
    buffer_containers=None, scaleup_window=None, scaledown_window=None,
    startup_timeout=30, name=None, port=8000, unauthenticated=False,
    h2_enabled=False, exit_grace_period=0, routing_region="us-east",
    compute_region=None, cloud=None, nonpreemptible=False, proxy=None,
    i6pn=None, enable_memory_snapshot=False, include_source=None,
    experimental_options=None)
\`\`\`
Decorator to register a new Modal Server with this App.

Servers run HTTP servers that are started in a \`@modal.enter()\` method.
Unlike \`@app.cls()\`, servers only expose HTTP endpoints and do not
support \`.remote()\` method calls.

See the [guide](https://modal.com/docs/guide/servers) for more information.

**Parameters**

<Parameter name="image" type="_Image | None" defaultValue="None" description="The image to run as the container for the server." />
<Parameter name="env" type="dict[str, str | None] | None" defaultValue="None" description="Environment variables to set in the container." />
<Parameter name="secrets" type="Collection[_Secret] | None" defaultValue="None" description="Secrets to inject into the container as environment variables." />
<Parameter name="gpu" type="str | list[str] | None" defaultValue="None" description="GPU request; either a single GPU type or a list of types." />
<Parameter name="serialized" type="bool" defaultValue="False" description="Whether to send the server class over using cloudpickle." />
<Parameter name="volumes" type="dict[
        str | PurePosixPath, _Volume | _CloudBucketMount
    ]" defaultValue="&#123;&#125;" description="Mount points for Modal Volumes &amp; CloudBucketMounts." />
<Parameter name="cpu" type="float | tuple[float, float] | None" defaultValue="None" description="Specify, in fractional CPU cores, how many CPU cores to request. Or, pass (request, limit) to additionally specify a hard limit in fractional CPU cores. CPU throttling will prevent a container from exceeding its specified limit." />
<Parameter name="memory" type="int | tuple[int, int] | None" defaultValue="None" description="Specify, in MiB, a memory request which is the minimum memory required. Or, pass (request, limit) to additionally specify a hard limit in MiB." />
<Parameter name="ephemeral_disk" type="int | None" defaultValue="None" description="Specify, in MiB, the ephemeral disk size for the server." />
<Parameter name="target_concurrency" type="float | None" defaultValue="None" description="Target number of concurrent requests per container; 0 disables autoscaling. May be fractional, e.g. 1.5 to target three concurrent requests per two containers." />
<Parameter name="min_containers" type="int | None" defaultValue="None" description="Minimum number of containers to keep running regardless of demand." />
<Parameter name="max_containers" type="int | None" defaultValue="None" description="Limit on the number of containers that can be concurrently running." />
<Parameter name="buffer_containers" type="int | None" defaultValue="None" description="Extra containers to scale up beyond current demand." />
<Parameter name="scaleup_window" type="int | None" defaultValue="None" description="Seconds of sustained demand required before scaling up new containers." />
<Parameter name="scaledown_window" type="int | None" defaultValue="None" description="Maximum duration (in seconds) idle containers wait before scaling down." />
<Parameter name="startup_timeout" type="int" defaultValue="30" description="Maximum container startup time in seconds." />
<Parameter name="name" type="str | None" defaultValue="None" description="Sets the Modal name of the function within the app, defaults to class name." />
<Parameter name="port" type="int" defaultValue="8000" description="Port the HTTP server listens on." />
<Parameter name="unauthenticated" type="bool" defaultValue="False" description="Whether the endpoint requires proxy authentication; required by default." />
<Parameter name="h2_enabled" type="bool" defaultValue="False" description="Enable HTTP/2." />
<Parameter name="exit_grace_period" type="int" defaultValue="0" description="Grace period for in-flight requests on shutdown." />
<Parameter name="routing_region" type="str" defaultValue="&quot;us-east&quot;" description="Region to route Server requests through." />
<Parameter name="compute_region" type="str | Sequence[str] | None" defaultValue="None" description="Region(s) where containers can be scheduled." />
<Parameter name="cloud" type="str | None" defaultValue="None" description="Cloud provider (aws, gcp, oci, auto)." />
<Parameter name="nonpreemptible" type="bool" defaultValue="False" description="Whether to use non-preemptible instances." />
<Parameter name="proxy" type="_Proxy | None" defaultValue="None" description="Modal Proxy to use in front of this server." />
<Parameter name="i6pn" type="bool | None" defaultValue="None" description="Enable IPv6 container networking." />
<Parameter name="enable_memory_snapshot" type="bool" defaultValue="False" description="Enable memory checkpointing." />
<Parameter name="include_source" type="bool | None" defaultValue="None" description="Whether to add source to container." />
<Parameter name="experimental_options" type="dict[str, Any] | None" defaultValue="None" description="Experimental options." />

**Usage**

\`\`\`python
@app.server(port=8000, routing_region="us-east")
class MyServer:
    @modal.enter()
    def start(self):
        self.proc = subprocess.Popen(["python3", "-m", "http.server", "8000"])

    @modal.exit()
    def stop(self):
        self.proc.terminate()
\`\`\`

## include

\`\`\`python
include(self, /, other_app, inherit_tags=True)
\`\`\`
Include another App's objects in this one.

Useful for splitting up Modal Apps across different self-contained files.

When \`inherit_tags=True\` any tags set on the other App will be inherited by this App
(with this App's tags taking precedence in the case of conflicts).

**Parameters**

<Parameter name="other_app" type="&quot;_App&quot;" description="App whose registered functions and classes are merged into this app." />
<Parameter name="inherit_tags" type="bool" defaultValue="True" description="If True, merge tags from \`other_app\` into this app (this app wins on conflicts)." />

**Returns**

This app instance for chaining.

**Usage**

\`\`\`python
app_a = modal.App("a")
@app_a.function()
def foo():
    ...

app_b = modal.App("b")
@app_b.function()
def bar():
    ...

app_a.include(app_b)

@app_a.local_entrypoint()
def main():
    # use function declared on the included app
    bar.remote()
\`\`\`

## set_tags

\`\`\`python
set_tags(self, tags, *, client=None)
\`\`\`
Attach key-value metadata to the App.

Tag metadata can be used to add organization-specific context to the App and can be
included in billing reports and other informational APIs. Tags can also be set in
the App constructor.

Any tags set on the App before calling this method will be removed if they are not
included in the argument (i.e., this method does not have \`.update()\` semantics).

**Parameters**

<Parameter name="tags" type="Mapping[str, str]" description="Complete tag set to store on the app (replaces previous tags)." />
<Parameter name="client" type="_Client | None" defaultValue="None" description="Modal client to use for the RPC." />

## get_tags

\`\`\`python
get_tags(self, *, client=None)
\`\`\`
Get the tags that are currently attached to the App.

**Parameters**

<Parameter name="client" type="_Client | None" defaultValue="None" description="Modal client to use for the RPC." />

**Returns**

Tags as a map from key to value.

## logs


\`\`\`python
logs: AppLogsManager
\`\`\`

Access logs for an \`App\`.

Use [\`fetch()\`](#logsfetch)
to read logs from a UTC time range, [\`tail()\`](#logstail)
to read the most recent logs, and [\`stream()\`](#logsstream)
to follow new logs as they arrive.

**See Also**

- [\`modal app logs\`](https://modal.com/docs/cli/latest/app#modal-app-logs):
    CLI access to logs for an App.


### logs.fetch

\`\`\`python
fetch(self, *, since, until=None, source=None, search_text="")
\`\`\`
Fetch App logs corresponding to the date range and filters.

**Parameters**

<Parameter name="since" type="datetime" description="Start date to fetch logs from. Must be in UTC or timezone-naive, which is interpreted as local time." />
<Parameter name="until" type="datetime | None" defaultValue="None" description="Defaults to current date if None. Must be in UTC or timezone-naive, which is interpreted as local time." />
<Parameter name="source" type="LogSource | None" defaultValue="None" description="Filter by source: &#x27;stdout&#x27;, &#x27;stderr&#x27;, or &#x27;system&#x27;." />
<Parameter name="search_text" type="str" defaultValue="&quot;&quot;" description="Filter by search text." />

**Yields**

\`LogEntry\` objects in chronological order.

**Usage**

\`\`\`python notest
app = modal.App.lookup("my-app")

for entry in app.logs.fetch(
    since=datetime.now() - timedelta(hours=4),
    source="stdout",
):
    print(entry.message, end="")
\`\`\`

### logs.tail

\`\`\`python
tail(self, entries=100, *, source=None)
\`\`\`
Fetch the most recent App logs.

**Parameters**

<Parameter name="entries" type="int" defaultValue="100" description="The number of log entries to return." />
<Parameter name="source" type="LogSource | None" defaultValue="None" description="Filter by source: &#x27;stdout&#x27;, &#x27;stderr&#x27;, or &#x27;system&#x27;." />

**Yields**

\`LogEntry\` objects in chronological order.

**Usage**

\`\`\`python notest
app = modal.App.lookup("my-app")

for entry in app.logs.tail(20):
    print(entry.message, end="")
\`\`\`

### logs.stream

\`\`\`python
stream(self, timeout=None)
\`\`\`
Stream new App logs until the timeout is reached.

**Parameters**

<Parameter name="timeout" type="float | None" defaultValue="None" description="Number of seconds to wait between log entries before terminating the stream. By default, this will block until it is interrupted." />

**Yields**

\`LogEntry\` objects as they arrive.

**Usage**

\`\`\`python notest
app = modal.App.lookup("my-app")

for entry in app.logs.stream(timeout=60):
    print(entry.message, end="")
\`\`\`
`,meta:{title:`App`,description:`A Modal App is a group of functions and classes that are deployed together.`}},{toc:h,rawContent:g,meta:re}=m,ie=t(`<code>app.run()</code>`),ae=t(`<code>fetch()</code>`),oe=t(`<code>tail()</code>`),se=t(`<code>stream()</code>`),ce=t(`<code>modal app logs</code>`),le=t(`<!> <!> <p>A Modal App is a group of functions and classes that are deployed together.</p> <p>The app serves at least three purposes:</p> <ul><li>A unit of deployment for functions and classes.</li> <li>Syncing of identities of (primarily) functions and classes across processes
(your local Python interpreter and every Modal container active in your application).</li> <li>Manage log collection for everything that happens inside your code.</li></ul> <p><strong>Registering functions with an app</strong></p> <p>The most common way to explicitly register an Object with an app is through the <code>@app.function()</code> decorator. It both registers the annotated function itself and
other passed objects, like schedules and secrets, with the app:</p> <!> <p>In this example, the secret and schedule are registered with the app.</p> <!> <p>Construct a new app, optionally with default image, mounts, secrets, or volumes.</p> <p><strong>Parameters</strong></p> <!> <!> <!> <!> <!> <!> <p><strong>Usage</strong></p> <!> <!> <!> <p>The user-provided name of the App.</p> <p><strong>Returns</strong></p> <p>The configured app name, if any.</p> <!> <!> <p>Return the app_id of a running or stopped app.</p> <p><strong>Returns</strong></p> <p>The app ID when the app has been deployed or run, otherwise None.</p> <!> <!> <p>The App’s <code>name</code>, if available, or a fallback descriptive identifier.</p> <p><strong>Returns</strong></p> <p>Human-readable description string for the app.</p> <!> <!> <p>Look up an App with a given name, creating a new App if necessary.</p> <p>Note that Apps created through this method will be in a deployed state,
but they will not have any associated Functions or Classes. This method
is mainly useful for creating an App to associate with a Sandbox.</p> <p><strong>Parameters</strong></p> <!> <!> <!> <!> <p><strong>Returns</strong></p> <p>An <code>App</code> handle tied to the deployed app record.</p> <p><strong>Usage</strong></p> <!> <!> <!> <p>Get the dashboard URL for the App.</p> <p><strong>Returns</strong></p> <p>The dashboard URL for the App.</p> <p><strong>Usage</strong></p> <!> <!> <!> <p>Context manager that runs an ephemeral app on Modal.</p> <p>Use this as the main entry point for your Modal application. All calls
to Modal Functions should be made within the scope of this context
manager, and they will correspond to the current App.</p> <p>Note that you should not invoke this in global scope of a file where you have
Modal Functions or Classes defined, since that would run the block when the Function
or Cls is imported in your containers as well. If you want to run it as your entrypoint,
consider protecting it with <code>if __name__ == "__main__"</code>.</p> <p><strong>Parameters</strong></p> <!> <!> <!> <!> <p><strong>Returns</strong></p> <p>Async context manager yielding this <code>App</code> while it is running.</p> <p><strong>Usage</strong></p> <!> <p>To enable output printing (i.e., to see App logs), use <code>modal.enable_output()</code>:</p> <!> <p>Note that you should not invoke this in global scope of a file where you have Modal
Functions or Classes defined, since that would run the block when the Function or Cls
is imported in your containers as well. If you want to run it as your entrypoint,
consider protecting it:</p> <!> <p>You can then run your script with:</p> <!> <!> <!> <p>Deploy the App so that it is available persistently.</p> <p>Deployed Apps will be available for lookup or web-based invocations until they are stopped.
Unlike with <code>App.run</code>, this method will return as soon as the deployment completes.</p> <p>This method is a programmatic alternative to the <code>modal deploy</code> CLI command.</p> <p>Unlike with <code>App.run</code>, Function logs will not stream back to the local client after the
App is deployed.</p> <p>Note that you should not invoke this method in global scope, as that would redeploy
the App every time the file is imported. If you want to write a programmatic deployment
script, protect this call so that it only runs when the file is executed directly.</p> <p><strong>Parameters</strong></p> <!> <!> <!> <!> <!> <p><strong>Returns</strong></p> <p>This app instance after deployment completes.</p> <p><strong>Usage</strong></p> <!> <p>To enable output printing (i.e., to see build logs), use <code>modal.enable_output()</code>:</p> <!> <p>Unlike with <code>App.run</code>, Function logs will not stream back to the local client after the App is deployed.</p> <p>Note that you should not invoke this method in global scope, as that would redeploy the App every time
the file is imported. If you want to write a programmatic deployment script, protect this call so that it
only runs when the file is executed directly. You can then run your script with:</p> <!> <p>Then you can deploy your app with:</p> <!> <!> <!> <p>Decorate a function to be used as a CLI entrypoint for a Modal App.</p> <p>These functions can be used to define code that runs locally to set up the app,
and act as an entrypoint to start Modal functions from. Note that regular
Modal functions can also be used as CLI entrypoints, but unlike <code>local_entrypoint</code>,
those functions are executed remotely directly.</p> <p>Note that an explicit <!> is not needed, as an <!> is automatically created for you.</p> <p><strong>Parameters</strong></p> <!> <p><strong>Returns</strong></p> <p>A decorator that registers the wrapped callable as a local CLI entrypoint.</p> <p><strong>Usage</strong></p> <!> <p>You can call the function using <code>modal run</code> directly from the CLI:</p> <!> <p>Note that an explicit <code>app.run()</code> is not needed, as an app is automatically created for you.</p> <p><strong>Multiple entrypoints</strong></p> <p>If you have multiple <code>local_entrypoint</code> functions, qualify the name:</p> <!> <p><strong>Parsing arguments</strong></p> <p>If your entrypoint function take arguments with primitive types, <code>modal run</code> automatically
parses them as CLI options. For example, the following function can be called with <code>modal run app_module.py --foo 1 --bar "hello"</code>:</p> <!> <p>Currently, <code>str</code>, <code>int</code>, <code>float</code>, <code>bool</code>, and <code>datetime.datetime</code> are supported.
Use <code>modal run app_module.py --help</code> for more information on usage.</p> <!> <!> <p>Decorator to register a new Modal Function with this App.</p> <p><strong>Parameters</strong></p> <!> <!> <!> <!> <!> <!> <!> <!> <!> <!> <!> <!> <!> <!> <!> <!> <!> <!> <!> <!> <!> <!> <!> <!> <!> <!> <!> <!> <!> <!> <!> <!> <!> <!> <p><strong>Returns</strong></p> <p>A decorator that registers the wrapped callable or partial as a Modal <code>Function</code>.</p> <!> <!> <p>Decorator to register a new Modal <!> with this App.</p> <p><strong>Parameters</strong></p> <!> <!> <!> <!> <!> <!> <!> <!> <!> <!> <!> <!> <!> <!> <!> <!> <!> <!> <!> <!> <!> <!> <!> <!> <!> <!> <!> <!> <!> <!> <!> <p><strong>Returns</strong></p> <p>A decorator that registers the wrapped class or partial as a Modal <code>Cls</code>.</p> <!> <!> <p>Decorator to register a new Modal Server with this App.</p> <p>Servers run HTTP servers that are started in a <code>@modal.enter()</code> method.
Unlike <code>@app.cls()</code>, servers only expose HTTP endpoints and do not
support <code>.remote()</code> method calls.</p> <p>See the <!> for more information.</p> <p><strong>Parameters</strong></p> <!> <!> <!> <!> <!> <!> <!> <!> <!> <!> <!> <!> <!> <!> <!> <!> <!> <!> <!> <!> <!> <!> <!> <!> <!> <!> <!> <!> <!> <!> <p><strong>Usage</strong></p> <!> <!> <!> <p>Include another App’s objects in this one.</p> <p>Useful for splitting up Modal Apps across different self-contained files.</p> <p>When <code>inherit_tags=True</code> any tags set on the other App will be inherited by this App
(with this App’s tags taking precedence in the case of conflicts).</p> <p><strong>Parameters</strong></p> <!> <!> <p><strong>Returns</strong></p> <p>This app instance for chaining.</p> <p><strong>Usage</strong></p> <!> <!> <!> <p>Attach key-value metadata to the App.</p> <p>Tag metadata can be used to add organization-specific context to the App and can be
included in billing reports and other informational APIs. Tags can also be set in
the App constructor.</p> <p>Any tags set on the App before calling this method will be removed if they are not
included in the argument (i.e., this method does not have <code>.update()</code> semantics).</p> <p><strong>Parameters</strong></p> <!> <!> <!> <!> <p>Get the tags that are currently attached to the App.</p> <p><strong>Parameters</strong></p> <!> <p><strong>Returns</strong></p> <p>Tags as a map from key to value.</p> <!> <!> <p>Access logs for an <code>App</code>.</p> <p>Use <!> to read logs from a UTC time range, <!> to read the most recent logs, and <!> to follow new logs as they arrive.</p> <p><strong>See Also</strong></p> <ul><li><!>:
CLI access to logs for an App.</li></ul> <!> <!> <p>Fetch App logs corresponding to the date range and filters.</p> <p><strong>Parameters</strong></p> <!> <!> <!> <!> <p><strong>Yields</strong></p> <p><code>LogEntry</code> objects in chronological order.</p> <p><strong>Usage</strong></p> <!> <!> <!> <p>Fetch the most recent App logs.</p> <p><strong>Parameters</strong></p> <!> <!> <p><strong>Yields</strong></p> <p><code>LogEntry</code> objects in chronological order.</p> <p><strong>Usage</strong></p> <!> <!> <!> <p>Stream new App logs until the timeout is reached.</p> <p><strong>Parameters</strong></p> <!> <p><strong>Yields</strong></p> <p><code>LogEntry</code> objects as they arrive.</p> <p><strong>Usage</strong></p> <!>`,1);function _(t,h){let g=ee(h,[`children`,`$$slots`,`$$events`,`$$legacy`]);d(t,a(()=>g,()=>m,{children:(t,ee)=>{var a=le(),d=te(a);ne(d,{id:`app`,children:(e,t)=>{s(),i(e,r(`App`))},$$slots:{default:!0}});var m=o(d,2);u(m,{code:`class%20App(object)`,lang:`python`});var h=o(m,12);u(h,{code:`import%20modal%0A%0Aapp%20%3D%20modal.App()%0A%0A%40app.function(%0A%20%20%20%20secrets%3D%5Bmodal.Secret.from_name(%22some_secret%22)%5D%2C%0A%20%20%20%20schedule%3Dmodal.Period(days%3D1)%2C%0A)%0Adef%20foo()%3A%0A%20%20%20%20pass`,lang:`python`});var g=o(h,4);u(g,{code:`__init__(self%2C%20name%3DNone%2C%20*%2C%20tags%3DNone%2C%20image%3DNone%2C%20secrets%3D%5B%5D%2C%20volumes%3D%7B%7D%2C%0A%20%20%20%20include_source%3DTrue)`,lang:`python`});var re=o(g,6);p(re,{name:`name`,type:`str | None`,defaultValue:`None`,description:`Optional app name used for registration and lookup.`});var _=o(re,2);p(_,{name:`tags`,type:`dict[str, str] | None`,defaultValue:`None`,description:`Additional metadata to set on the App.`});var v=o(_,2);p(v,{name:`image`,type:`_Image | None`,defaultValue:`None`,description:"Default image for the App (otherwise defaults to `modal.Image.debian_slim()`)."});var y=o(v,2);p(y,{name:`secrets`,type:`Sequence[_Secret]`,defaultValue:`[]`,description:`Secrets to add for all Functions in the App.`});var b=o(y,2);p(b,{name:`volumes`,type:`dict[str | PurePosixPath, _Volume]`,defaultValue:`{}`,description:`Volume mounts to use for all Functions.`});var x=o(b,2);p(x,{name:`include_source`,type:`bool`,defaultValue:`True`,description:`Default for whether Function source files are added to the Modal container (per-function override possible).`});var S=o(x,4);u(S,{code:`image%20%3D%20modal.Image.debian_slim().pip_install(...)%0Asecret%20%3D%20modal.Secret.from_name(%22my-secret%22)%0Avolume%20%3D%20modal.Volume.from_name(%22my-data%22)%0Aapp%20%3D%20modal.App(image%3Dimage%2C%20secrets%3D%5Bsecret%5D%2C%20volumes%3D%7B%22%2Fmnt%2Fdata%22%3A%20volume%7D)`,lang:`python`});var C=o(S,2);c(C,{id:`name`,children:(e,t)=>{s(),i(e,r(`name`))},$$slots:{default:!0}});var w=o(C,2);u(w,{code:`name(self)`,lang:`python`});var T=o(w,8);c(T,{id:`app_id`,children:(e,t)=>{s(),i(e,r(`app_id`))},$$slots:{default:!0}});var E=o(T,2);u(E,{code:`app_id(self)`,lang:`python`});var D=o(E,8);c(D,{id:`description`,children:(e,t)=>{s(),i(e,r(`description`))},$$slots:{default:!0}});var O=o(D,2);u(O,{code:`description(self)`,lang:`python`});var k=o(O,8);c(k,{id:`lookup`,children:(e,t)=>{s(),i(e,r(`lookup`))},$$slots:{default:!0}});var A=o(k,2);u(A,{code:`lookup(name%2C%20*%2C%20client%3DNone%2C%20environment_name%3DNone%2C%20create_if_missing%3DFalse)`,lang:`python`});var j=o(A,8);p(j,{name:`name`,type:`str`,description:`App name to resolve or create.`});var M=o(j,2);p(M,{name:`client`,type:`_Client | None`,defaultValue:`None`,description:"Modal client to use; defaults to `Client.from_env()` when omitted."});var N=o(M,2);p(N,{name:`environment_name`,type:`str | None`,defaultValue:`None`,description:`Optional environment name; defaults to the configured environment.`});var P=o(N,2);p(P,{name:`create_if_missing`,type:`bool`,defaultValue:`False`,description:`If True, create the app when it does not already exist.`});var F=o(P,8);u(F,{code:`app%20%3D%20modal.App.lookup(%22my-app%22%2C%20create_if_missing%3DTrue)%0Amodal.Sandbox.create(%22echo%22%2C%20%22hi%22%2C%20app%3Dapp)`,lang:`python`});var I=o(F,2);c(I,{id:`get_dashboard_url`,children:(e,t)=>{s(),i(e,r(`get_dashboard_url`))},$$slots:{default:!0}});var L=o(I,2);u(L,{code:`get_dashboard_url(self)`,lang:`python`});var R=o(L,10);u(R,{code:`app%20%3D%20modal.App.lookup(%22my-app%22)%0Aprint(app.get_dashboard_url())`,lang:`python`});var z=o(R,2);c(z,{id:`run`,children:(e,t)=>{s(),i(e,r(`run`))},$$slots:{default:!0}});var B=o(z,2);u(B,{code:`run(self%2C%20*%2C%20name%3DNone%2C%20client%3DNone%2C%20detach%3DFalse%2C%20interactive%3DFalse%2C%0A%20%20%20%20environment_name%3DNone)`,lang:`python`});var V=o(B,10);p(V,{name:`client`,type:`_Client | None`,defaultValue:`None`,description:`Modal client to use for the run session.`});var H=o(V,2);p(H,{name:`detach`,type:`bool`,defaultValue:`False`,description:`Whether to detach after starting the app.`});var U=o(H,2);p(U,{name:`interactive`,type:`bool`,defaultValue:`False`,description:`Whether to run in interactive mode.`});var W=o(U,2);p(W,{name:`environment_name`,type:`str | None`,defaultValue:`None`,description:`Optional environment name; defaults to the configured environment.`});var G=o(W,8);u(G,{code:`with%20app.run()%3A%0A%20%20%20%20some_modal_function.remote()`,lang:`python`});var K=o(G,4);u(K,{code:`with%20modal.enable_output()%3A%0A%20%20%20%20with%20app.run()%3A%0A%20%20%20%20%20%20%20%20some_modal_function.remote()`,lang:`python`});var ue=o(K,4);u(ue,{code:`if%20__name__%20%3D%3D%20%22__main__%22%3A%0A%20%20%20%20with%20app.run()%3A%0A%20%20%20%20%20%20%20%20some_modal_function.remote()`,lang:`python`});var de=o(ue,4);u(de,{code:`python%20app_module.py`,lang:`shell`});var fe=o(de,2);c(fe,{id:`deploy`,children:(e,t)=>{s(),i(e,r(`deploy`))},$$slots:{default:!0}});var pe=o(fe,2);u(pe,{code:`deploy(self%2C%20*%2C%20name%3DNone%2C%20environment_name%3DNone%2C%20tag%3D%22%22%2C%20client%3DNone%2C%0A%20%20%20%20strategy%3D%22rolling%22)`,lang:`python`});var me=o(pe,14);p(me,{name:`name`,type:`str | None`,defaultValue:`None`,description:`Name for the deployment, overriding any set on the App.`});var he=o(me,2);p(he,{name:`environment_name`,type:`str | None`,defaultValue:`None`,description:`Environment to deploy the App in.`});var ge=o(he,2);p(ge,{name:`tag`,type:`str`,defaultValue:`""`,description:`Optional metadata that is specific to this deployment.`});var _e=o(ge,2);p(_e,{name:`client`,type:`_Client | None`,defaultValue:`None`,description:`Alternate client to use for communication with the server.`});var ve=o(_e,2);p(ve,{name:`strategy`,type:`str`,defaultValue:`"rolling"`,description:"Deployment strategy. ``rolling`` (default) shifts traffic gradually to new containers while old ones drain. ``recreate`` terminates all running containers as part of the deployment before new work starts."});var ye=o(ve,8);u(ye,{code:`app%20%3D%20App(%22my-app%22)%0Aapp.deploy()`,lang:`python`});var be=o(ye,4);u(be,{code:`app%20%3D%20App(%22my-app%22)%0Awith%20modal.enable_output()%3A%0A%20%20%20%20app.deploy()`,lang:`python`});var xe=o(be,6);u(xe,{code:`if%20__name__%20%3D%3D%20%22__main__%22%3A%0A%20%20%20%20with%20modal.enable_output()%3A%0A%20%20%20%20%20%20%20%20app.deploy()`,lang:`python`});var Se=o(xe,4);u(Se,{code:`python%20app_module.py`,lang:`shell`});var Ce=o(Se,2);c(Ce,{id:`local_entrypoint`,children:(e,t)=>{s(),i(e,r(`local_entrypoint`))},$$slots:{default:!0}});var we=o(Ce,2);u(we,{code:`local_entrypoint(self%2C%20_warn_parentheses_missing%3DNone%2C%20*%2C%20name%3DNone)`,lang:`python`});var q=o(we,6),Te=o(e(q));f(Te,{href:`https://modal.com/docs/sdk/py/latest/App#run`,rel:`nofollow`,children:(e,t)=>{i(e,ie())},$$slots:{default:!0}}),f(o(Te,2),{href:`https://modal.com/docs/guide/apps`,rel:`nofollow`,children:(e,t)=>{s(),i(e,r(`app`))},$$slots:{default:!0}}),s(),n(q);var Ee=o(q,4);p(Ee,{name:`name`,type:`str | None`,defaultValue:`None`,description:`Optional name for the entrypoint; defaults to the function's qualified name.`});var De=o(Ee,8);u(De,{code:`%40app.local_entrypoint()%0Adef%20main()%3A%0A%20%20%20%20some_modal_function.remote()`,lang:`python`});var Oe=o(De,4);u(Oe,{code:`modal%20run%20app_module.py`,lang:`shell`});var ke=o(Oe,8);u(ke,{code:`modal%20run%20app_module.py%3A%3Aapp.some_other_function`,lang:`shell`});var Ae=o(ke,6);u(Ae,{code:`%40app.local_entrypoint()%0Adef%20main(foo%3A%20int%2C%20bar%3A%20str)%3A%0A%20%20%20%20some_modal_function.call(foo%2C%20bar)`,lang:`python`});var je=o(Ae,4);c(je,{id:`function`,children:(e,t)=>{s(),i(e,r(`function`))},$$slots:{default:!0}});var Me=o(je,2);u(Me,{code:`function(self%2C%20*%2C%20image%3DNone%2C%20schedule%3DNone%2C%20env%3DNone%2C%20secrets%3DNone%2C%20gpu%3DNone%2C%0A%20%20%20%20serialized%3DFalse%2C%20network_file_systems%3D%7B%7D%2C%20volumes%3D%7B%7D%2C%20cpu%3DNone%2C%0A%20%20%20%20memory%3DNone%2C%20ephemeral_disk%3DNone%2C%20min_containers%3DNone%2C%20max_containers%3DNone%2C%0A%20%20%20%20buffer_containers%3DNone%2C%20scaledown_window%3DNone%2C%20proxy%3DNone%2C%20retries%3DNone%2C%0A%20%20%20%20timeout%3D300%2C%20startup_timeout%3DNone%2C%20name%3DNone%2C%20is_generator%3DNone%2C%20cloud%3DNone%2C%0A%20%20%20%20region%3DNone%2C%20routing_region%3DNone%2C%20nonpreemptible%3DFalse%2C%0A%20%20%20%20enable_memory_snapshot%3DFalse%2C%20block_network%3DFalse%2C%0A%20%20%20%20restrict_modal_access%3DFalse%2C%20single_use_containers%3DFalse%2C%20i6pn%3DNone%2C%0A%20%20%20%20include_source%3DNone%2C%20experimental_options%3DNone%2C%0A%20%20%20%20_experimental_restrict_output%3DFalse%2C%20max_inputs%3DNone)`,lang:`python`});var Ne=o(Me,6);p(Ne,{name:`image`,type:`_Image | None`,defaultValue:`None`,description:`The image to run as the container for the function.`});var Pe=o(Ne,2);p(Pe,{name:`schedule`,type:`Schedule | None`,defaultValue:`None`,description:`An optional Modal Schedule for the function.`});var Fe=o(Pe,2);p(Fe,{name:`env`,type:`dict[str, str | None] | None`,defaultValue:`None`,description:`Environment variables to set in the container.`});var Ie=o(Fe,2);p(Ie,{name:`secrets`,type:`Collection[_Secret] | None`,defaultValue:`None`,description:`Secrets to inject into the container as environment variables.`});var Le=o(Ie,2);p(Le,{name:`gpu`,type:`str | list[str] | None`,defaultValue:`None`,description:`GPU request; either a single GPU type or a list of types.`});var Re=o(Le,2);p(Re,{name:`serialized`,type:`bool`,defaultValue:`False`,description:`Whether to send the function over using cloudpickle.`});var ze=o(Re,2);p(ze,{name:`network_file_systems`,type:`dict[str | PurePosixPath, _NetworkFileSystem]`,defaultValue:`{}`,description:`Mountpoints for Modal NetworkFileSystems.`});var Be=o(ze,2);p(Be,{name:`volumes`,type:`dict[str | PurePosixPath, _Volume | _CloudBucketMount]`,defaultValue:`{}`,description:`Mount points for Modal Volumes & CloudBucketMounts.`});var Ve=o(Be,2);p(Ve,{name:`cpu`,type:`float | tuple[float, float] | None`,defaultValue:`None`,description:`Specify, in fractional CPU cores, how many CPU cores to request. Or, pass (request, limit) to additionally specify a hard limit in fractional CPU cores. CPU throttling will prevent a container from exceeding its specified limit.`});var He=o(Ve,2);p(He,{name:`memory`,type:`int | tuple[int, int] | None`,defaultValue:`None`,description:`Specify, in MiB, a memory request which is the minimum memory required. Or, pass (request, limit) to additionally specify a hard limit in MiB.`});var Ue=o(He,2);p(Ue,{name:`ephemeral_disk`,type:`int | None`,defaultValue:`None`,description:`Specify, in MiB, the ephemeral disk size for the Function.`});var We=o(Ue,2);p(We,{name:`min_containers`,type:`int | None`,defaultValue:`None`,description:`Minimum number of containers to keep warm, even when Function is idle.`});var Ge=o(We,2);p(Ge,{name:`max_containers`,type:`int | None`,defaultValue:`None`,description:`Limit on the number of containers that can be concurrently running.`});var Ke=o(Ge,2);p(Ke,{name:`buffer_containers`,type:`int | None`,defaultValue:`None`,description:`Number of additional idle containers to maintain under active load.`});var qe=o(Ke,2);p(qe,{name:`scaledown_window`,type:`int | None`,defaultValue:`None`,description:`Max time (in seconds) a container can remain idle while scaling down.`});var Je=o(qe,2);p(Je,{name:`proxy`,type:`_Proxy | None`,defaultValue:`None`,description:`Reference to a Modal Proxy to use in front of this function.`});var Ye=o(Je,2);p(Ye,{name:`retries`,type:`int | Retries | None`,defaultValue:`None`,description:`Number of times to retry each input in case of failure.`});var Xe=o(Ye,2);p(Xe,{name:`timeout`,type:`int`,defaultValue:`300`,description:`Maximum execution time for inputs and startup time in seconds.`});var Ze=o(Xe,2);p(Ze,{name:`startup_timeout`,type:`int | None`,defaultValue:`None`,description:"Maximum startup time in seconds with higher precedence than `timeout`."});var Qe=o(Ze,2);p(Qe,{name:`name`,type:`str | None`,defaultValue:`None`,description:`Sets the Modal name of the function within the app.`});var $e=o(Qe,2);p($e,{name:`is_generator`,type:`None | bool`,defaultValue:`None`,description:`Set this to True if it's a non-generator function returning a sync or async generator object.`});var et=o($e,2);p(et,{name:`cloud`,type:`str | None`,defaultValue:`None`,description:`Cloud provider to run the function on. Possible values are aws, gcp, oci, auto.`});var tt=o(et,2);p(tt,{name:`region`,type:`str | Sequence[str] | None`,defaultValue:`None`,description:`Region or regions to run the function on.`});var nt=o(tt,2);p(nt,{name:`routing_region`,type:`str | None`,defaultValue:`None`,description:`Region to route inputs to the function through.`});var rt=o(nt,2);p(rt,{name:`nonpreemptible`,type:`bool`,defaultValue:`False`,description:`Whether to run the function on a nonpreemptible instance.`});var it=o(rt,2);p(it,{name:`enable_memory_snapshot`,type:`bool`,defaultValue:`False`,description:`Enable memory checkpointing for faster cold starts.`});var at=o(it,2);p(at,{name:`block_network`,type:`bool`,defaultValue:`False`,description:`Whether to block network access.`});var ot=o(at,2);p(ot,{name:`restrict_modal_access`,type:`bool`,defaultValue:`False`,description:`Whether to allow this function access to other Modal resources.`});var st=o(ot,2);p(st,{name:`single_use_containers`,type:`bool`,defaultValue:`False`,description:`When True, containers will shut down after handling a single input.`});var ct=o(st,2);p(ct,{name:`i6pn`,type:`bool | None`,defaultValue:`None`,description:`Whether to enable IPv6 container networking within the region.`});var lt=o(ct,2);p(lt,{name:`include_source`,type:`bool | None`,defaultValue:`None`,description:`Whether the file or directory containing the Function's source should automatically be included in the container. When unset, falls back to the App-level configuration, or is otherwise True by default.`});var ut=o(lt,2);p(ut,{name:`experimental_options`,type:`dict[str, Any] | None`,defaultValue:`None`,description:`Experimental options for the function.`});var dt=o(ut,2);p(dt,{name:`_experimental_restrict_output`,type:`bool`,defaultValue:`False`,description:`Experimental; do not use pickle for return values.`});var ft=o(dt,2);p(ft,{name:`max_inputs`,type:`int | None`,defaultValue:`None`,description:"Deprecated; replaced with `single_use_containers`."});var pt=o(ft,6);c(pt,{id:`cls`,children:(e,t)=>{s(),i(e,r(`cls`))},$$slots:{default:!0}});var mt=o(pt,2);u(mt,{code:`cls(self%2C%20*%2C%20image%3DNone%2C%20env%3DNone%2C%20secrets%3DNone%2C%20gpu%3DNone%2C%20serialized%3DFalse%2C%0A%20%20%20%20network_file_systems%3D%7B%7D%2C%20volumes%3D%7B%7D%2C%20cpu%3DNone%2C%20memory%3DNone%2C%0A%20%20%20%20ephemeral_disk%3DNone%2C%20min_containers%3DNone%2C%20max_containers%3DNone%2C%0A%20%20%20%20buffer_containers%3DNone%2C%20scaledown_window%3DNone%2C%20proxy%3DNone%2C%20retries%3DNone%2C%0A%20%20%20%20timeout%3D300%2C%20startup_timeout%3DNone%2C%20cloud%3DNone%2C%20region%3DNone%2C%0A%20%20%20%20routing_region%3DNone%2C%20nonpreemptible%3DFalse%2C%20enable_memory_snapshot%3DFalse%2C%0A%20%20%20%20block_network%3DFalse%2C%20restrict_modal_access%3DFalse%2C%0A%20%20%20%20single_use_containers%3DFalse%2C%20i6pn%3DNone%2C%20include_source%3DNone%2C%0A%20%20%20%20experimental_options%3DNone%2C%20_experimental_restrict_output%3DFalse%2C%0A%20%20%20%20max_inputs%3DNone)`,lang:`python`});var J=o(mt,2);f(o(e(J)),{href:`https://modal.com/docs/sdk/py/latest/Cls`,rel:`nofollow`,children:(e,t)=>{s(),i(e,r(`Cls`))},$$slots:{default:!0}}),s(),n(J);var ht=o(J,4);p(ht,{name:`image`,type:`_Image | None`,defaultValue:`None`,description:`The image to run as the container for the class service.`});var gt=o(ht,2);p(gt,{name:`env`,type:`dict[str, str | None] | None`,defaultValue:`None`,description:`Environment variables to set in the container.`});var Y=o(gt,2);p(Y,{name:`secrets`,type:`Collection[_Secret] | None`,defaultValue:`None`,description:`Secrets to inject into the container as environment variables.`});var _t=o(Y,2);p(_t,{name:`gpu`,type:`str | list[str] | None`,defaultValue:`None`,description:`GPU request; either a single GPU type or a list of types.`});var vt=o(_t,2);p(vt,{name:`serialized`,type:`bool`,defaultValue:`False`,description:`Whether to send the class over using cloudpickle.`});var yt=o(vt,2);p(yt,{name:`network_file_systems`,type:`dict[str | PurePosixPath, _NetworkFileSystem]`,defaultValue:`{}`,description:`Mountpoints for Modal NetworkFileSystems.`});var bt=o(yt,2);p(bt,{name:`volumes`,type:`dict[str | PurePosixPath, _Volume | _CloudBucketMount]`,defaultValue:`{}`,description:`Mount points for Modal Volumes & CloudBucketMounts.`});var xt=o(bt,2);p(xt,{name:`cpu`,type:`float | tuple[float, float] | None`,defaultValue:`None`,description:`Specify, in fractional CPU cores, how many CPU cores to request. Or, pass (request, limit) to additionally specify a hard limit in fractional CPU cores. CPU throttling will prevent a container from exceeding its specified limit.`});var St=o(xt,2);p(St,{name:`memory`,type:`int | tuple[int, int] | None`,defaultValue:`None`,description:`Specify, in MiB, a memory request which is the minimum memory required. Or, pass (request, limit) to additionally specify a hard limit in MiB.`});var Ct=o(St,2);p(Ct,{name:`ephemeral_disk`,type:`int | None`,defaultValue:`None`,description:`Specify, in MiB, the ephemeral disk size for the Function.`});var wt=o(Ct,2);p(wt,{name:`min_containers`,type:`int | None`,defaultValue:`None`,description:`Minimum number of containers to keep warm, even when Function is idle.`});var Tt=o(wt,2);p(Tt,{name:`max_containers`,type:`int | None`,defaultValue:`None`,description:`Limit on the number of containers that can be concurrently running.`});var Et=o(Tt,2);p(Et,{name:`buffer_containers`,type:`int | None`,defaultValue:`None`,description:`Number of additional idle containers to maintain under active load.`});var Dt=o(Et,2);p(Dt,{name:`scaledown_window`,type:`int | None`,defaultValue:`None`,description:`Max time (in seconds) a container can remain idle while scaling down.`});var Ot=o(Dt,2);p(Ot,{name:`proxy`,type:`_Proxy | None`,defaultValue:`None`,description:`Reference to a Modal Proxy to use in front of this function.`});var kt=o(Ot,2);p(kt,{name:`retries`,type:`int | Retries | None`,defaultValue:`None`,description:`Number of times to retry each input in case of failure.`});var At=o(kt,2);p(At,{name:`timeout`,type:`int`,defaultValue:`300`,description:`Maximum execution time for inputs and startup time in seconds.`});var jt=o(At,2);p(jt,{name:`startup_timeout`,type:`int | None`,defaultValue:`None`,description:"Maximum startup time in seconds with higher precedence than `timeout`."});var Mt=o(jt,2);p(Mt,{name:`cloud`,type:`str | None`,defaultValue:`None`,description:`Cloud provider to run the function on. Possible values are aws, gcp, oci, auto.`});var Nt=o(Mt,2);p(Nt,{name:`region`,type:`str | Sequence[str] | None`,defaultValue:`None`,description:`Region or regions to run the function on.`});var Pt=o(Nt,2);p(Pt,{name:`routing_region`,type:`str | None`,defaultValue:`None`,description:`Region to route inputs to the function through.`});var Ft=o(Pt,2);p(Ft,{name:`nonpreemptible`,type:`bool`,defaultValue:`False`,description:`Whether to run the function on a non-preemptible instance.`});var It=o(Ft,2);p(It,{name:`enable_memory_snapshot`,type:`bool`,defaultValue:`False`,description:`Enable memory checkpointing for faster cold starts.`});var Lt=o(It,2);p(Lt,{name:`block_network`,type:`bool`,defaultValue:`False`,description:`Whether to block network access.`});var Rt=o(Lt,2);p(Rt,{name:`restrict_modal_access`,type:`bool`,defaultValue:`False`,description:`Whether to allow this class access to other Modal resources.`});var zt=o(Rt,2);p(zt,{name:`single_use_containers`,type:`bool`,defaultValue:`False`,description:`When True, containers will shut down after handling a single input.`});var Bt=o(zt,2);p(Bt,{name:`i6pn`,type:`bool | None`,defaultValue:`None`,description:`Whether to enable IPv6 container networking within the region.`});var Vt=o(Bt,2);p(Vt,{name:`include_source`,type:`bool | None`,defaultValue:`None`,description:"When ``False``, don't automatically add the App source to the container."});var Ht=o(Vt,2);p(Ht,{name:`experimental_options`,type:`dict[str, Any] | None`,defaultValue:`None`,description:`Experimental options for the class service.`});var Ut=o(Ht,2);p(Ut,{name:`_experimental_restrict_output`,type:`bool`,defaultValue:`False`,description:`Experimental; do not use pickle for return values.`});var Wt=o(Ut,2);p(Wt,{name:`max_inputs`,type:`int | None`,defaultValue:`None`,description:"Deprecated; replaced with `single_use_containers`."});var Gt=o(Wt,6);c(Gt,{id:`server`,children:(e,t)=>{s(),i(e,r(`server`))},$$slots:{default:!0}});var Kt=o(Gt,2);u(Kt,{code:`server(self%2C%20*%2C%20image%3DNone%2C%20env%3DNone%2C%20secrets%3DNone%2C%20gpu%3DNone%2C%20serialized%3DFalse%2C%0A%20%20%20%20volumes%3D%7B%7D%2C%20cpu%3DNone%2C%20memory%3DNone%2C%20ephemeral_disk%3DNone%2C%0A%20%20%20%20target_concurrency%3DNone%2C%20min_containers%3DNone%2C%20max_containers%3DNone%2C%0A%20%20%20%20buffer_containers%3DNone%2C%20scaleup_window%3DNone%2C%20scaledown_window%3DNone%2C%0A%20%20%20%20startup_timeout%3D30%2C%20name%3DNone%2C%20port%3D8000%2C%20unauthenticated%3DFalse%2C%0A%20%20%20%20h2_enabled%3DFalse%2C%20exit_grace_period%3D0%2C%20routing_region%3D%22us-east%22%2C%0A%20%20%20%20compute_region%3DNone%2C%20cloud%3DNone%2C%20nonpreemptible%3DFalse%2C%20proxy%3DNone%2C%0A%20%20%20%20i6pn%3DNone%2C%20enable_memory_snapshot%3DFalse%2C%20include_source%3DNone%2C%0A%20%20%20%20experimental_options%3DNone)`,lang:`python`});var X=o(Kt,6);f(o(e(X)),{href:`https://modal.com/docs/guide/servers`,rel:`nofollow`,children:(e,t)=>{s(),i(e,r(`guide`))},$$slots:{default:!0}}),s(),n(X);var qt=o(X,4);p(qt,{name:`image`,type:`_Image | None`,defaultValue:`None`,description:`The image to run as the container for the server.`});var Jt=o(qt,2);p(Jt,{name:`env`,type:`dict[str, str | None] | None`,defaultValue:`None`,description:`Environment variables to set in the container.`});var Yt=o(Jt,2);p(Yt,{name:`secrets`,type:`Collection[_Secret] | None`,defaultValue:`None`,description:`Secrets to inject into the container as environment variables.`});var Xt=o(Yt,2);p(Xt,{name:`gpu`,type:`str | list[str] | None`,defaultValue:`None`,description:`GPU request; either a single GPU type or a list of types.`});var Zt=o(Xt,2);p(Zt,{name:`serialized`,type:`bool`,defaultValue:`False`,description:`Whether to send the server class over using cloudpickle.`});var Qt=o(Zt,2);p(Qt,{name:`volumes`,type:`dict[
        str | PurePosixPath, _Volume | _CloudBucketMount
    ]`,defaultValue:`{}`,description:`Mount points for Modal Volumes & CloudBucketMounts.`});var $t=o(Qt,2);p($t,{name:`cpu`,type:`float | tuple[float, float] | None`,defaultValue:`None`,description:`Specify, in fractional CPU cores, how many CPU cores to request. Or, pass (request, limit) to additionally specify a hard limit in fractional CPU cores. CPU throttling will prevent a container from exceeding its specified limit.`});var en=o($t,2);p(en,{name:`memory`,type:`int | tuple[int, int] | None`,defaultValue:`None`,description:`Specify, in MiB, a memory request which is the minimum memory required. Or, pass (request, limit) to additionally specify a hard limit in MiB.`});var tn=o(en,2);p(tn,{name:`ephemeral_disk`,type:`int | None`,defaultValue:`None`,description:`Specify, in MiB, the ephemeral disk size for the server.`});var nn=o(tn,2);p(nn,{name:`target_concurrency`,type:`float | None`,defaultValue:`None`,description:`Target number of concurrent requests per container; 0 disables autoscaling. May be fractional, e.g. 1.5 to target three concurrent requests per two containers.`});var rn=o(nn,2);p(rn,{name:`min_containers`,type:`int | None`,defaultValue:`None`,description:`Minimum number of containers to keep running regardless of demand.`});var an=o(rn,2);p(an,{name:`max_containers`,type:`int | None`,defaultValue:`None`,description:`Limit on the number of containers that can be concurrently running.`});var on=o(an,2);p(on,{name:`buffer_containers`,type:`int | None`,defaultValue:`None`,description:`Extra containers to scale up beyond current demand.`});var sn=o(on,2);p(sn,{name:`scaleup_window`,type:`int | None`,defaultValue:`None`,description:`Seconds of sustained demand required before scaling up new containers.`});var cn=o(sn,2);p(cn,{name:`scaledown_window`,type:`int | None`,defaultValue:`None`,description:`Maximum duration (in seconds) idle containers wait before scaling down.`});var ln=o(cn,2);p(ln,{name:`startup_timeout`,type:`int`,defaultValue:`30`,description:`Maximum container startup time in seconds.`});var un=o(ln,2);p(un,{name:`name`,type:`str | None`,defaultValue:`None`,description:`Sets the Modal name of the function within the app, defaults to class name.`});var dn=o(un,2);p(dn,{name:`port`,type:`int`,defaultValue:`8000`,description:`Port the HTTP server listens on.`});var fn=o(dn,2);p(fn,{name:`unauthenticated`,type:`bool`,defaultValue:`False`,description:`Whether the endpoint requires proxy authentication; required by default.`});var pn=o(fn,2);p(pn,{name:`h2_enabled`,type:`bool`,defaultValue:`False`,description:`Enable HTTP/2.`});var mn=o(pn,2);p(mn,{name:`exit_grace_period`,type:`int`,defaultValue:`0`,description:`Grace period for in-flight requests on shutdown.`});var hn=o(mn,2);p(hn,{name:`routing_region`,type:`str`,defaultValue:`"us-east"`,description:`Region to route Server requests through.`});var gn=o(hn,2);p(gn,{name:`compute_region`,type:`str | Sequence[str] | None`,defaultValue:`None`,description:`Region(s) where containers can be scheduled.`});var _n=o(gn,2);p(_n,{name:`cloud`,type:`str | None`,defaultValue:`None`,description:`Cloud provider (aws, gcp, oci, auto).`});var vn=o(_n,2);p(vn,{name:`nonpreemptible`,type:`bool`,defaultValue:`False`,description:`Whether to use non-preemptible instances.`});var yn=o(vn,2);p(yn,{name:`proxy`,type:`_Proxy | None`,defaultValue:`None`,description:`Modal Proxy to use in front of this server.`});var bn=o(yn,2);p(bn,{name:`i6pn`,type:`bool | None`,defaultValue:`None`,description:`Enable IPv6 container networking.`});var xn=o(bn,2);p(xn,{name:`enable_memory_snapshot`,type:`bool`,defaultValue:`False`,description:`Enable memory checkpointing.`});var Sn=o(xn,2);p(Sn,{name:`include_source`,type:`bool | None`,defaultValue:`None`,description:`Whether to add source to container.`});var Cn=o(Sn,2);p(Cn,{name:`experimental_options`,type:`dict[str, Any] | None`,defaultValue:`None`,description:`Experimental options.`});var wn=o(Cn,4);u(wn,{code:`%40app.server(port%3D8000%2C%20routing_region%3D%22us-east%22)%0Aclass%20MyServer%3A%0A%20%20%20%20%40modal.enter()%0A%20%20%20%20def%20start(self)%3A%0A%20%20%20%20%20%20%20%20self.proc%20%3D%20subprocess.Popen(%5B%22python3%22%2C%20%22-m%22%2C%20%22http.server%22%2C%20%228000%22%5D)%0A%0A%20%20%20%20%40modal.exit()%0A%20%20%20%20def%20stop(self)%3A%0A%20%20%20%20%20%20%20%20self.proc.terminate()`,lang:`python`});var Tn=o(wn,2);c(Tn,{id:`include`,children:(e,t)=>{s(),i(e,r(`include`))},$$slots:{default:!0}});var En=o(Tn,2);u(En,{code:`include(self%2C%20%2F%2C%20other_app%2C%20inherit_tags%3DTrue)`,lang:`python`});var Dn=o(En,10);p(Dn,{name:`other_app`,type:`"_App"`,description:`App whose registered functions and classes are merged into this app.`});var On=o(Dn,2);p(On,{name:`inherit_tags`,type:`bool`,defaultValue:`True`,description:"If True, merge tags from `other_app` into this app (this app wins on conflicts)."});var kn=o(On,8);u(kn,{code:`app_a%20%3D%20modal.App(%22a%22)%0A%40app_a.function()%0Adef%20foo()%3A%0A%20%20%20%20...%0A%0Aapp_b%20%3D%20modal.App(%22b%22)%0A%40app_b.function()%0Adef%20bar()%3A%0A%20%20%20%20...%0A%0Aapp_a.include(app_b)%0A%0A%40app_a.local_entrypoint()%0Adef%20main()%3A%0A%20%20%20%20%23%20use%20function%20declared%20on%20the%20included%20app%0A%20%20%20%20bar.remote()`,lang:`python`});var An=o(kn,2);c(An,{id:`set_tags`,children:(e,t)=>{s(),i(e,r(`set_tags`))},$$slots:{default:!0}});var jn=o(An,2);u(jn,{code:`set_tags(self%2C%20tags%2C%20*%2C%20client%3DNone)`,lang:`python`});var Mn=o(jn,10);p(Mn,{name:`tags`,type:`Mapping[str, str]`,description:`Complete tag set to store on the app (replaces previous tags).`});var Nn=o(Mn,2);p(Nn,{name:`client`,type:`_Client | None`,defaultValue:`None`,description:`Modal client to use for the RPC.`});var Pn=o(Nn,2);c(Pn,{id:`get_tags`,children:(e,t)=>{s(),i(e,r(`get_tags`))},$$slots:{default:!0}});var Fn=o(Pn,2);u(Fn,{code:`get_tags(self%2C%20*%2C%20client%3DNone)`,lang:`python`});var In=o(Fn,6);p(In,{name:`client`,type:`_Client | None`,defaultValue:`None`,description:`Modal client to use for the RPC.`});var Ln=o(In,6);c(Ln,{id:`logs`,children:(e,t)=>{s(),i(e,r(`logs`))},$$slots:{default:!0}});var Rn=o(Ln,2);u(Rn,{code:`logs%3A%20AppLogsManager`,lang:`python`});var Z=o(Rn,4),zn=o(e(Z));f(zn,{href:`#logsfetch`,children:(e,t)=>{i(e,ae())},$$slots:{default:!0}});var Bn=o(zn,2);f(Bn,{href:`#logstail`,children:(e,t)=>{i(e,oe())},$$slots:{default:!0}}),f(o(Bn,2),{href:`#logsstream`,children:(e,t)=>{i(e,se())},$$slots:{default:!0}}),s(),n(Z);var Q=o(Z,4),Vn=e(Q);f(e(Vn),{href:`https://modal.com/docs/cli/latest/app#modal-app-logs`,rel:`nofollow`,children:(e,t)=>{i(e,ce())},$$slots:{default:!0}}),s(),n(Vn),n(Q);var Hn=o(Q,2);l(Hn,{id:`logsfetch`,children:(e,t)=>{s(),i(e,r(`logs.fetch`))},$$slots:{default:!0}});var Un=o(Hn,2);u(Un,{code:`fetch(self%2C%20*%2C%20since%2C%20until%3DNone%2C%20source%3DNone%2C%20search_text%3D%22%22)`,lang:`python`});var Wn=o(Un,6);p(Wn,{name:`since`,type:`datetime`,description:`Start date to fetch logs from. Must be in UTC or timezone-naive, which is interpreted as local time.`});var Gn=o(Wn,2);p(Gn,{name:`until`,type:`datetime | None`,defaultValue:`None`,description:`Defaults to current date if None. Must be in UTC or timezone-naive, which is interpreted as local time.`});var Kn=o(Gn,2);p(Kn,{name:`source`,type:`LogSource | None`,defaultValue:`None`,description:`Filter by source: 'stdout', 'stderr', or 'system'.`});var qn=o(Kn,2);p(qn,{name:`search_text`,type:`str`,defaultValue:`""`,description:`Filter by search text.`});var Jn=o(qn,8);u(Jn,{code:`app%20%3D%20modal.App.lookup(%22my-app%22)%0A%0Afor%20entry%20in%20app.logs.fetch(%0A%20%20%20%20since%3Ddatetime.now()%20-%20timedelta(hours%3D4)%2C%0A%20%20%20%20source%3D%22stdout%22%2C%0A)%3A%0A%20%20%20%20print(entry.message%2C%20end%3D%22%22)`,lang:`python`});var Yn=o(Jn,2);l(Yn,{id:`logstail`,children:(e,t)=>{s(),i(e,r(`logs.tail`))},$$slots:{default:!0}});var Xn=o(Yn,2);u(Xn,{code:`tail(self%2C%20entries%3D100%2C%20*%2C%20source%3DNone)`,lang:`python`});var Zn=o(Xn,6);p(Zn,{name:`entries`,type:`int`,defaultValue:`100`,description:`The number of log entries to return.`});var Qn=o(Zn,2);p(Qn,{name:`source`,type:`LogSource | None`,defaultValue:`None`,description:`Filter by source: 'stdout', 'stderr', or 'system'.`});var $n=o(Qn,8);u($n,{code:`app%20%3D%20modal.App.lookup(%22my-app%22)%0A%0Afor%20entry%20in%20app.logs.tail(20)%3A%0A%20%20%20%20print(entry.message%2C%20end%3D%22%22)`,lang:`python`});var er=o($n,2);l(er,{id:`logsstream`,children:(e,t)=>{s(),i(e,r(`logs.stream`))},$$slots:{default:!0}});var tr=o(er,2);u(tr,{code:`stream(self%2C%20timeout%3DNone)`,lang:`python`});var $=o(tr,6);p($,{name:`timeout`,type:`float | None`,defaultValue:`None`,description:`Number of seconds to wait between log entries before terminating the stream. By default, this will block until it is interrupted.`}),u(o($,8),{code:`app%20%3D%20modal.App.lookup(%22my-app%22)%0A%0Afor%20entry%20in%20app.logs.stream(timeout%3D60)%3A%0A%20%20%20%20print(entry.message%2C%20end%3D%22%22)`,lang:`python`}),i(t,a)},$$slots:{default:!0}}))}export{_ as default,m as metadata};
//# sourceMappingURL=TTKHqMms.js.map
