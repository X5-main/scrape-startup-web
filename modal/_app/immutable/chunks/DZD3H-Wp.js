(function(){try{var e=typeof window<`u`?window:typeof global<`u`?global:typeof globalThis<`u`?globalThis:typeof self<`u`?self:{};e.SENTRY_RELEASE={id:`f99fcf9f0a844cc9bd13fdc8e5782b84`};var t=new e.Error().stack;t&&(e._sentryDebugIds=e._sentryDebugIds||{},e._sentryDebugIds[t]=`087cb5f1-2f94-4cbe-98fe-471c4b936c5f`,e._sentryDebugIdIdentifier=`sentry-dbid-087cb5f1-2f94-4cbe-98fe-471c4b936c5f`)}catch{}})();import{$t as e,St as t,Tn as n,Tt as r,bt as i,c as ee,d as a,en as te,tn as o,wn as s}from"./F_ixKBiO.js";import"./B1sc9Zdx.js";import"./Bb2deiU3.js";import{a as c,i as l,o as ne}from"./CPby7b1n.js";import{t as u}from"./BILrvr3I.js";import{t as d}from"./B4L_if842.js";import{t as f}from"./DeWGVqas2.js";import{t as p}from"./B6UiYoTw.js";var m={toc:[{depth:1,value:`Sandbox`,id:`sandbox`,children:[{depth:2,value:`hydrate`,id:`hydrate`},{depth:2,value:`create`,id:`create`},{depth:2,value:`detach`,id:`detach`},{depth:2,value:`from_name`,id:`from_name`},{depth:2,value:`from_id`,id:`from_id`},{depth:2,value:`get_tags`,id:`get_tags`},{depth:2,value:`set_tags`,id:`set_tags`},{depth:2,value:`snapshot_filesystem`,id:`snapshot_filesystem`},{depth:2,value:`mount_image`,id:`mount_image`},{depth:2,value:`unmount_image`,id:`unmount_image`},{depth:2,value:`snapshot_directory`,id:`snapshot_directory`},{depth:2,value:`wait`,id:`wait`},{depth:2,value:`wait_until_ready`,id:`wait_until_ready`},{depth:2,value:`tunnels`,id:`tunnels`},{depth:2,value:`create_connect_token`,id:`create_connect_token`},{depth:2,value:`reload_volumes`,id:`reload_volumes`},{depth:2,value:`terminate`,id:`terminate`},{depth:2,value:`poll`,id:`poll`},{depth:2,value:`exec`,id:`exec`},{depth:2,value:`filesystem`,id:`filesystem`,children:[{depth:3,value:`filesystem.copy_from_local`,id:`filesystemcopy_from_local`},{depth:3,value:`filesystem.copy_to_local`,id:`filesystemcopy_to_local`},{depth:3,value:`filesystem.list_files`,id:`filesystemlist_files`},{depth:3,value:`filesystem.make_directory`,id:`filesystemmake_directory`},{depth:3,value:`filesystem.read_bytes`,id:`filesystemread_bytes`},{depth:3,value:`filesystem.read_text`,id:`filesystemread_text`},{depth:3,value:`filesystem.remove`,id:`filesystemremove`},{depth:3,value:`filesystem.stat`,id:`filesystemstat`},{depth:3,value:`filesystem.watch`,id:`filesystemwatch`},{depth:3,value:`filesystem.write_bytes`,id:`filesystemwrite_bytes`},{depth:3,value:`filesystem.write_text`,id:`filesystemwrite_text`}]},{depth:2,value:`open`,id:`open`},{depth:2,value:`ls`,id:`ls`},{depth:2,value:`mkdir`,id:`mkdir`},{depth:2,value:`rm`,id:`rm`},{depth:2,value:`watch`,id:`watch`},{depth:2,value:`stdout`,id:`stdout`},{depth:2,value:`stderr`,id:`stderr`},{depth:2,value:`stdin`,id:`stdin`},{depth:2,value:`returncode`,id:`returncode`},{depth:2,value:`list`,id:`list`},{depth:2,value:`logs`,id:`logs`,children:[{depth:3,value:`logs.fetch`,id:`logsfetch`},{depth:3,value:`logs.tail`,id:`logstail`}]}]}],rawContent:`# Sandbox


\`\`\`python
class Sandbox(modal.object.Object)
\`\`\`

A \`Sandbox\` object lets you interact with a running sandbox. This API is similar to Python's
[asyncio.subprocess.Process](https://docs.python.org/3/library/asyncio-subprocess.html#asyncio.subprocess.Process).

Refer to the [guide](https://modal.com/docs/guide/sandbox) on how to spawn and use sandboxes.


## hydrate

\`\`\`python
hydrate(self, client=None)
\`\`\`
Synchronize the local object with its identity on the Modal server.

It is rarely necessary to call this method explicitly, as most operations
will lazily hydrate when needed. The main use case is when you need to
access object metadata, such as its ID.

*Added in v0.72.39*: This method replaces the deprecated \`.resolve()\` method.

## create

\`\`\`python
create(*args, app=None, name=None, tags=None, image=None, env=None,
    secrets=None, network_file_systems={}, timeout=300, idle_timeout=None,
    workdir=None, gpu=None, cloud=None, region=None, cpu=None, memory=None,
    block_network=False, outbound_cidr_allowlist=None,
    outbound_domain_allowlist=None, inbound_cidr_allowlist=None, volumes={},
    pty=False, encrypted_ports=[], h2_ports=[], unencrypted_ports=[],
    custom_domain=None, proxy=None, include_oidc_identity_token=False,
    readiness_probe=None, verbose=False, experimental_options=None,
    _experimental_enable_snapshot=False, client=None, environment_name=None,
    pty_info=None, cidr_allowlist=None)
\`\`\`
Create a new Sandbox to run untrusted, arbitrary code.

The Sandbox's corresponding container will be created asynchronously.

**Parameters**

<Parameter name="*args" type="str" description="Set the CMD of the Sandbox, overriding any CMD of the container image." />
<Parameter name="app" type="&quot;modal.app._App | None&quot;" defaultValue="None" description="Associate the sandbox with an app. Required unless creating from a container." />
<Parameter name="name" type="str | None" defaultValue="None" description="Optionally give the sandbox a name. Unique within an app." />
<Parameter name="tags" type="dict[str, str] | None" defaultValue="None" description="Tags to assign to the Sandbox." />
<Parameter name="image" type="_Image | None" defaultValue="None" description="The image to run as the container for the sandbox." />
<Parameter name="env" type="dict[str, str | None] | None" defaultValue="None" description="Environment variables to set in the Sandbox." />
<Parameter name="secrets" type="Collection[_Secret] | None" defaultValue="None" description="Secrets to inject into the Sandbox as environment variables." />
<Parameter name="network_file_systems" type="dict[str | os.PathLike, _NetworkFileSystem]" defaultValue="&#123;&#125;" description="Network file systems to mount into the sandbox." />
<Parameter name="timeout" type="int" defaultValue="300" description="Maximum lifetime of the sandbox in seconds." />
<Parameter name="idle_timeout" type="int | None" defaultValue="None" description="The amount of time in seconds that a sandbox can be idle before being terminated." />
<Parameter name="workdir" type="str | None" defaultValue="None" description="Working directory of the sandbox." />
<Parameter name="gpu" type="str | None" defaultValue="None" description="GPU reservation for the sandbox." />
<Parameter name="cloud" type="str | None" defaultValue="None" description="Cloud provider for the sandbox." />
<Parameter name="region" type="str | Sequence[str] | None" defaultValue="None" description="Region or regions to run the sandbox on." />
<Parameter name="cpu" type="float | tuple[float, float] | None" defaultValue="None" description="Specify, in fractional CPU cores, how many CPU cores to request. Or, pass (request, limit) to additionally specify a hard limit in fractional CPU cores. CPU throttling will prevent a container from exceeding its specified limit." />
<Parameter name="memory" type="int | tuple[int, int] | None" defaultValue="None" description="Specify, in MiB, a memory request which is the minimum memory required. Or, pass (request, limit) to additionally specify a hard limit in MiB." />
<Parameter name="block_network" type="bool" defaultValue="False" description="Whether to block network access." />
<Parameter name="outbound_cidr_allowlist" type="Sequence[str] | None" defaultValue="None" description="List of CIDRs the sandbox is allowed to access. If None, all CIDRs are allowed." />
<Parameter name="outbound_domain_allowlist" type="Sequence[str] | None" defaultValue="None" description="List of domain names the sandbox is allowed to access. Supports wildcard prefixes (\`\`*.\`\`); a bare \`\`&quot;*&quot;\`\` allows all domains. The outbound policy can be replaced later via \`Sandbox._experimental_set_outbound_network_policy\`." />
<Parameter name="inbound_cidr_allowlist" type="Sequence[str] | None" defaultValue="None" description="List of CIDRs allowed to connect inbound to the sandbox (tunnels and connection tokens). If None, all CIDRs are allowed." />
<Parameter name="volumes" type="dict[str | os.PathLike, _Volume | _CloudBucketMount]" defaultValue="&#123;&#125;" description="Mount points for Modal Volumes and CloudBucketMounts." />
<Parameter name="pty" type="bool" defaultValue="False" description="Enable a PTY for the Sandbox entrypoint command. When enabled, all output (stdout and stderr from the process) is multiplexed into stdout, and the stderr stream is effectively empty." />
<Parameter name="encrypted_ports" type="Sequence[int]" defaultValue="[]" description="List of ports to tunnel into the sandbox. Encrypted ports are tunneled with TLS." />
<Parameter name="h2_ports" type="Sequence[int]" defaultValue="[]" description="List of encrypted ports to tunnel into the sandbox, using HTTP/2." />
<Parameter name="unencrypted_ports" type="Sequence[int]" defaultValue="[]" description="List of ports to tunnel into the sandbox without encryption." />
<Parameter name="custom_domain" type="str | None" defaultValue="None" description="Allow connections to the Sandbox via a subdomain of this parent rather than a default Modal domain." />
<Parameter name="proxy" type="_Proxy | None" defaultValue="None" description="Reference to a Modal Proxy to use in front of this Sandbox." />
<Parameter name="include_oidc_identity_token" type="bool" defaultValue="False" description="If True, the sandbox will receive a MODAL_IDENTITY_TOKEN env var for OIDC-based auth." />
<Parameter name="readiness_probe" type="Probe | None" defaultValue="None" description="Probe used to determine when the sandbox has become ready." />
<Parameter name="verbose" type="bool" defaultValue="False" description="Enable verbose logging for sandbox operations." />
<Parameter name="experimental_options" type="dict[str, Any] | None" defaultValue="None" description="Experimental options to pass to the sandbox." />
<Parameter name="_experimental_enable_snapshot" type="bool" defaultValue="False" description="Enable memory snapshots." />
<Parameter name="client" type="_Client | None" defaultValue="None" description="Modal Client to use for the sandbox." />
<Parameter name="environment_name" type="str | None" defaultValue="None" description="*DEPRECATED* Optionally override the default environment" />
<Parameter name="pty_info" type="api_pb2.PTYInfo | None" defaultValue="None" description="*DEPRECATED* Use \`pty\` instead. \`pty\` will override \`pty_info\`." />
<Parameter name="cidr_allowlist" type="Sequence[str] | None" defaultValue="None" description="*DEPRECATED* Use outbound_cidr_allowlist instead." />

**Returns**

A \`Sandbox\` object representing the created sandbox which can be used to interact with the sandbox.

**Raises**

- \`AlreadyExistsError\`: If a sandbox with the same name already exists.

**Usage**

\`\`\`python
app = modal.App.lookup('sandbox-hello-world', create_if_missing=True)
sandbox = modal.Sandbox.create("echo", "hello world", app=app)
print(sandbox.stdout.read())
sandbox.wait()
\`\`\`

## detach

\`\`\`python
detach(self)
\`\`\`
Disconnects your client from the sandbox and cleans up resources assoicated with the connection.

Be sure to only call \`detach\` when you are done interacting with the sandbox. After calling \`detach\`,
any operation using the Sandbox object is not guaranteed to work anymore. If you want to continue interacting
with a running sandbox, use \`Sandbox.from_id\` to get a new Sandbox object.

## from_name

\`\`\`python
from_name(app_name, name, *, environment_name=None, client=None)
\`\`\`
Get a running Sandbox by name from a deployed App.

A Sandbox's name is the \`name\` argument passed to \`Sandbox.create\`.

**Parameters**

<Parameter name="app_name" type="str" description="Name of the deployed app to look up the sandbox under." />
<Parameter name="name" type="str" description="Sandbox name to resolve." />
<Parameter name="environment_name" type="str | None" defaultValue="None" description="Optional environment name for the lookup; defaults to the configured environment." />
<Parameter name="client" type="_Client | None" defaultValue="None" description="Modal client to use for the RPC; defaults to \`Client.from_env()\` when omitted." />

**Returns**

A \`Sandbox\` handle for the running sandbox.

**Raises**

- \`NotFoundError\`: If no running sandbox exists with the given name.

## from_id

\`\`\`python
from_id(sandbox_id, client=None)
\`\`\`
Construct a Sandbox from an id and look up the Sandbox result.

The ID of a Sandbox object can be accessed using \`.object_id\`.

**Parameters**

<Parameter name="sandbox_id" type="str" description="Sandbox object ID to attach to." />
<Parameter name="client" type="_Client | None" defaultValue="None" description="Modal client to use for the lookup; defaults to the environment client when omitted." />

**Returns**

A \`Sandbox\` handle with any available result metadata populated from the server.

## get_tags

\`\`\`python
get_tags(self)
\`\`\`
Fetches any tags (key-value pairs) currently attached to this Sandbox from the server.

**Returns**

Tags as a map from tag name to tag value.

## set_tags

\`\`\`python
set_tags(self, tags, *, client=None)
\`\`\`
Set tags (key-value pairs) on the Sandbox. Tags can be used to filter results in \`Sandbox.list\`.

Setting tags replaces the Sandbox's entire tag set; passing an empty dict clears all tags.

**Parameters**

<Parameter name="tags" type="dict[str, str]" description="Tag names and values to set on this sandbox." />
<Parameter name="client" type="_Client | None" defaultValue="None" description="Deprecated. Prefer setting the client when creating or re-attaching to the sandbox." />

## snapshot_filesystem

\`\`\`python
snapshot_filesystem(self, timeout=55, *, ttl=30 * 24 * 3600)
\`\`\`
Snapshot the filesystem of the Sandbox.

**Parameters**

<Parameter name="timeout" type="int" defaultValue="55" description="Maximum time in seconds to wait for the snapshot operation. If the snapshot does not return within that window, the call is cancelled and \`modal.exception.TimeoutError\` is raised." />
<Parameter name="ttl" type="int | None" defaultValue="30 * 24 * 3600" description="The resulting Image is retained for \`ttl\` seconds (default: 30 days). Pass \`ttl=None\` to retain the image indefinitely." />

**Returns**

An [\`Image\`](https://modal.com/docs/sdk/py/latest/Image) object which can be used to spawn a new
Sandbox with the same filesystem.

## mount_image

\`\`\`python
mount_image(self, path, image, *, _experimental_encryption_key=None)
\`\`\`
Mount an Image at a specified path in a running Sandbox.

\`path\` should be a directory that is **not** the root path (\`/\`). If the path doesn't exist
it will be created. If it exists and contains data, the previous directory will be replaced
by the mount.

The \`image\` argument supports any Image that has an object ID, including:
- Images built using \`image.build()\`
- Images referenced by ID, e.g. \`Image.from_id(...)\`
- Filesystem/directory snapshots, e.g. created by \`.snapshot_directory()\` or \`.snapshot_filesystem()\`
- Empty images created with \`Image.from_scratch()\`

**Parameters**

<Parameter name="path" type="PurePosixPath | str" description="Absolute mount point directory inside the sandbox (not \`/\`)." />
<Parameter name="image" type="_Image" description="Image to mount at \`path\` (must be built, referenced by ID, or snapshot-based as described above)." />

**Usage**

\`\`\`py notest
user_project_snapshot: Image = sandbox_session_1.snapshot_directory("/user_project")

# You can later mount this snapshot to another Sandbox:
sandbox_session_2 = modal.Sandbox.create(...)
sandbox_session_2.mount_image("/user_project", user_project_snapshot)
sandbox_session_2.filesystem.list_files("/user_project")
\`\`\`

## unmount_image

\`\`\`python
unmount_image(self, path)
\`\`\`
Unmount a previously mounted Image from a running Sandbox.

\`path\` must be the exact mount point that was passed to \`.mount_image()\`.
After unmounting, the underlying Sandbox filesystem at that path becomes
visible again.

**Parameters**

<Parameter name="path" type="PurePosixPath | str" description="Absolute mount point directory to unmount." />

## snapshot_directory

\`\`\`python
snapshot_directory(self, path, *, timeout=55, ttl=30 * 24 * 3600,
    _experimental_encryption_key=None)
\`\`\`
Snapshot a directory in a running Sandbox, creating a new Image with its content.

\`timeout\` If the snapshot does not return within that window, the call is cancelled
and \`modal.exception.TimeoutError\` is raised.

\`ttl\` The resulting Image is retained for \`ttl\` seconds (default: 30 days)
Pass \`ttl=None\` to retain the image indefinitely.

**Parameters**

<Parameter name="path" type="PurePosixPath | str" description="Absolute path of the directory inside the sandbox to snapshot." />

**Returns**

An \`Image\` containing the directory contents.

**Usage**

\`\`\`py notest
user_project_snapshot: Image = sandbox_session_1.snapshot_directory("/user_project")

# You can later mount this snapshot to another Sandbox:
sandbox_session_2 = modal.Sandbox.create(...)
sandbox_session_2.mount_image("/user_project", user_project_snapshot)
sandbox_session_2.filesystem.list_files("/user_project")
\`\`\`

## wait

\`\`\`python
wait(self, raise_on_termination=True)
\`\`\`
Wait for the Sandbox to finish running.

**Parameters**

<Parameter name="raise_on_termination" type="bool" defaultValue="True" description="If True, raise when the sandbox is terminated externally." />

## wait_until_ready

\`\`\`python
wait_until_ready(self, *, timeout=300)
\`\`\`
Wait for the Sandbox readiness probe to report that the Sandbox is ready.

The Sandbox must be configured with a \`readiness_probe\` in order to use this method.

**Parameters**

<Parameter name="timeout" type="int" defaultValue="300" description="Maximum time in seconds to wait for readiness." />

**Usage**

\`\`\`py notest
app = modal.App.lookup('sandbox-wait-until-ready', create_if_missing=True)
sandbox = modal.Sandbox.create(
    "python3", "-m", "http.server", "8080",
    readiness_probe=modal.Probe.with_tcp(8080),
    app=app,
)
sandbox.wait_until_ready()
\`\`\`

## tunnels

\`\`\`python
tunnels(self, timeout=50)
\`\`\`
Get Tunnel metadata for the sandbox.

NOTE: Previous to client [v0.64.153](https://modal.com/docs/sdk/py/changelog#064153-2024-09-30), this
returned a list of \`TunnelData\` objects.

**Parameters**

<Parameter name="timeout" type="int" defaultValue="50" description="Maximum time in seconds to wait for tunnel metadata when not already cached." />

**Returns**

A dictionary mapping container port to \`Tunnel\` metadata.

**Raises**

- \`SandboxTimeoutError\`: If the tunnels are not available after the timeout.

## create_connect_token

\`\`\`python
create_connect_token(self, user_metadata=None, port=8080)
\`\`\`
Create a token for making HTTP connections to the Sandbox.

Accepts an optional user_metadata string or dict to associate with the token. This metadata
will be added to the headers by the proxy when forwarding requests to the Sandbox.
Also accepts a port that requests will be routed to.

**Parameters**

<Parameter name="user_metadata" type="str | dict[str, Any] | None" defaultValue="None" description="Optional JSON-serializable metadata or string stored with the connect token." />
<Parameter name="port" type="int" defaultValue="8080" description="Optional container port that requests are routed to when using this token." />

**Returns**

URL and token credentials for connecting to the sandbox over HTTP.

## reload_volumes

\`\`\`python
reload_volumes(self, *, timeout=55)
\`\`\`
Reload all Volumes mounted in the Sandbox.

Added in v1.1.0.

Blocks until the reload completes, or raises \`modal.exception.TimeoutError\` on timeout (the reload
may still complete in the background).

**Parameters**

<Parameter name="timeout" type="int" defaultValue="55" description="Defaults to 55 seconds." />

## terminate

\`\`\`python
terminate(self, *, wait=False)
\`\`\`
Terminate Sandbox execution.

This is a no-op if the Sandbox has already finished running.

**Parameters**

<Parameter name="wait" type="bool" defaultValue="False" description="If True, block until termination completes and return the exit code." />

**Returns**

The sandbox exit code when \`wait\` is True; otherwise None.

## poll

\`\`\`python
poll(self)
\`\`\`
Check if the Sandbox has finished running.

**Returns**

\`None\` if the Sandbox is still running, otherwise the exit code.

## exec

\`\`\`python
exec(self, *args, stdout=StreamType.PIPE, stderr=StreamType.PIPE, timeout=None,
    workdir=None, env=None, secrets=None, text=True, bufsize=-1, pty=False,
    _pty_info=None, pty_info=None)
\`\`\`
Execute a command in the Sandbox and return a ContainerProcess handle.

See the [\`ContainerProcess\`](https://modal.com/docs/sdk/py/latest/container_process#containerprocess)
docs for more information.

**Parameters**

<Parameter name="*args" type="str" description="Command and arguments to run inside the sandbox." />
<Parameter name="stdout" type="StreamType" defaultValue="StreamType.PIPE" description="Where to connect the process stdout stream." />
<Parameter name="stderr" type="StreamType" defaultValue="StreamType.PIPE" description="Where to connect the process stderr stream." />
<Parameter name="timeout" type="int | None" defaultValue="None" description="Optional timeout in seconds for the exec session." />
<Parameter name="workdir" type="str | None" defaultValue="None" description="Working directory for the command; must be absolute if set." />
<Parameter name="env" type="dict[str, str | None] | None" defaultValue="None" description="Environment variables to set during command execution." />
<Parameter name="secrets" type="Collection[_Secret] | None" defaultValue="None" description="Secrets to inject as environment variables during command execution." />
<Parameter name="text" type="bool" defaultValue="True" description="If True, decode streams as text; if False, yield bytes." />
<Parameter name="bufsize" type="Literal[-1, 1]" defaultValue="-1" description="Control line-buffered output. \`\`-1\`\` means unbuffered; \`\`1\`\` means line-buffered (only when \`\`text\`\` is True)." />
<Parameter name="pty" type="bool" defaultValue="False" description="Enable a PTY for the command. When enabled, all output (stdout and stderr from the process) is multiplexed into stdout, and the stderr stream is effectively empty." />
<Parameter name="_pty_info" type="api_pb2.PTYInfo | None" defaultValue="None" description="*DEPRECATED* Use \`pty\` instead. \`pty\` will override \`_pty_info\`." />
<Parameter name="pty_info" type="api_pb2.PTYInfo | None" defaultValue="None" description="*DEPRECATED* Use \`pty\` instead. \`pty\` will override \`pty_info\`." />

**Returns**

A \`ContainerProcess\` handle for the running command (text or bytes depending on \`text\`).

**Usage**

\`\`\`python fixture:sandbox
process = sandbox.exec("bash", "-c", "for i in $(seq 1 3); do echo foo $i; sleep 0.1; done")
for line in process.stdout:
    print(line)
\`\`\`

## filesystem


\`\`\`python
filesystem: SandboxFilesystem
\`\`\`

Namespace for Sandbox filesystem APIs.


### filesystem.copy_from_local

\`\`\`python
copy_from_local(self, local_path, remote_path)
\`\`\`
Copy a local file into the Sandbox.

\`remote_path\` must be an absolute path to a file in the Sandbox.
Parent directories for \`remote_path\` are created if needed.
The remote file is overwritten if it already exists.

**Parameters**

<Parameter name="local_path" type="str | os.PathLike" description="Path to the file on the local machine." />
<Parameter name="remote_path" type="str" description="Absolute path to the file in the Sandbox." />

**Raises**

- \`SandboxFilesystemNotADirectoryError\`: A parent path component of \`\`remote_path\`\` is not a directory.
- \`SandboxFilesystemIsADirectoryError\`: \`\`remote_path\`\` points to a directory.
- \`SandboxFilesystemPermissionError\`: Write permission is denied in the Sandbox.
- \`SandboxFilesystemError\`: The command fails for any other reason.
- \`FileNotFoundError\`: \`\`local_path\`\` does not exist.
- \`IsADirectoryError\`: \`\`local_path\`\` is a directory.
- \`PermissionError\`: Reading \`\`local_path\`\` is not permitted.

**Usage**

\`\`\`python fixture:sandbox fixture:tmpdir
import tempfile
from pathlib import Path

local_path = Path(tempfile.mktemp())
local_path.write_text("Hello, world!\\n")
sandbox.filesystem.copy_from_local(local_path, "/tmp/hello.txt")
\`\`\`

### filesystem.copy_to_local

\`\`\`python
copy_to_local(self, remote_path, local_path)
\`\`\`
Copy a file from the Sandbox to a local path.

\`remote_path\` must be an absolute path to a file in the Sandbox.
Parent directories for \`local_path\` are created if needed.
The local file is overwritten if it already exists.

**Raises**

- \`SandboxFilesystemNotFoundError\`: the remote path does not exist.
- \`SandboxFilesystemIsADirectoryError\`: the remote path points to a directory.
- \`SandboxFilesystemPermissionError\`: read permission is denied in the Sandbox.
- \`SandboxFilesystemError\`: the command fails for any other reason.
- \`IsADirectoryError\`: \`local_path\` points to a directory.
- \`NotADirectoryError\`: a component of the \`local_path\` parent is not a directory.
- \`PermissionError\`: writing \`local_path\` is not permitted.

**Usage**

\`\`\`python fixture:sandbox fixture:tmpdir
sandbox.filesystem.write_text("Hello, world!\\n", "/tmp/hello.txt")
sandbox.filesystem.copy_to_local("/tmp/hello.txt", "/tmp/local-hello.txt")
\`\`\`

### filesystem.list_files

\`\`\`python
list_files(self, remote_path)
\`\`\`
List files and directories in a Sandbox directory.

**Parameters**

<Parameter name="remote_path" type="str" description="Absolute path to the directory in the Sandbox." />

**Returns**

A list of \`FileInfo\` objects describing each entry.

**Raises**

- \`SandboxFilesystemNotFoundError\`: The path does not exist.
- \`SandboxFilesystemNotADirectoryError\`: The path is not a directory.
- \`SandboxFilesystemPermissionError\`: Read permission is denied.
- \`SandboxFilesystemError\`: The command fails for any other reason.

**Usage**

\`\`\`python fixture:sandbox
entries = sandbox.filesystem.list_files("/tmp")
for entry in entries:
    print(entry.name, entry.type, entry.size)
\`\`\`

### filesystem.make_directory

\`\`\`python
make_directory(self, remote_path, *, create_parents=True)
\`\`\`
Create a new directory in the Sandbox.

\`remote_path\` must be an absolute path in the Sandbox.

When \`create_parents\` is \`True\` (the default), any missing parent directories are created and the call is
idempotent (succeeds silently if the directory already exists). When \`create_parents\` is \`False\`, the
immediate parent directory must already exist and the path must not already exist.

**Parameters**

<Parameter name="remote_path" type="str" description="Absolute path of the directory to create in the Sandbox." />
<Parameter name="create_parents" type="bool" defaultValue="True" description="When \`\`True\`\`, create missing parents and succeed if the directory already exists." />

**Raises**

- \`SandboxFilesystemNotFoundError\`: The parent directory does not exist and \`\`create_parents\`\` is false.
- \`SandboxFilesystemPathAlreadyExistsError\`: The path already exists.
- \`SandboxFilesystemNotADirectoryError\`: A path component is not a directory.
- \`SandboxFilesystemPermissionError\`: Creation is not permitted.
- \`InvalidError\`: The operation is not supported by the mount.
- \`SandboxFilesystemError\`: The command fails for any other reason.

**Usage**

\`\`\`python fixture:sandbox
sandbox.filesystem.make_directory("/tmp/a/b/c")
\`\`\`

### filesystem.read_bytes

\`\`\`python
read_bytes(self, remote_path)
\`\`\`
Read a file from the Sandbox and return its contents as bytes.

\`remote_path\` must be an absolute path to a file in the Sandbox.

**Parameters**

<Parameter name="remote_path" type="str" description="Absolute path to the file in the Sandbox." />

**Returns**

Raw bytes read from the file.

**Raises**

- \`SandboxFilesystemNotFoundError\`: The path does not exist.
- \`SandboxFilesystemIsADirectoryError\`: The path points to a directory.
- \`SandboxFilesystemPermissionError\`: Read permission is denied.
- \`SandboxFilesystemError\`: The command fails for any other reason.

**Usage**

\`\`\`python fixture:sandbox
sandbox.filesystem.write_bytes(b"Hello, world!\\n", "/tmp/hello.bin")
contents = sandbox.filesystem.read_bytes("/tmp/hello.bin")
print(contents.decode("utf-8"))
\`\`\`

### filesystem.read_text

\`\`\`python
read_text(self, remote_path)
\`\`\`
Read a file from the Sandbox and return its contents as a UTF-8 string.

\`remote_path\` must be an absolute path to a file in the Sandbox.

**Parameters**

<Parameter name="remote_path" type="str" description="Absolute path to the file in the Sandbox." />

**Returns**

File contents decoded as UTF-8.

**Raises**

- \`SandboxFilesystemNotFoundError\`: The path does not exist.
- \`SandboxFilesystemIsADirectoryError\`: The path points to a directory.
- \`SandboxFilesystemPermissionError\`: Read permission is denied.
- \`SandboxFilesystemError\`: The command fails for any other reason.

**Usage**

\`\`\`python fixture:sandbox
sandbox.filesystem.write_text("Hello, world!\\n", "/tmp/hello.txt")
contents = sandbox.filesystem.read_text("/tmp/hello.txt")
print(contents)
\`\`\`

### filesystem.remove

\`\`\`python
remove(self, remote_path, *, recursive=False)
\`\`\`
Remove a file or directory in the Sandbox.

When \`remote_path\` is a directory and \`recursive\` is \`False\` (the
default), removes it only if it is empty. When \`recursive\` is \`True\`,
removes the directory and all its contents.

Recursive directory removal is not supported on all mounts.
In particular, \`CloudBucketMount\` does not support it. An
\`InvalidError\` is raised in that case.

**Parameters**

<Parameter name="remote_path" type="str" description="Absolute path to the file in the Sandbox." />
<Parameter name="recursive" type="bool" defaultValue="False" description="When \`\`True\`\`, remove the directory and all its contents." />

**Raises**

- \`SandboxFilesystemNotFoundError\`: The remote path does not exist.
- \`SandboxFilesystemDirectoryNotEmptyError\`: \`recursive\` is \`False\` and the directory is not empty.
- \`SandboxFilesystemPermissionError\`: Read permission is denied in the Sandbox.
- \`InvalidError\`: The operation is not supported by the mount.
- \`SandboxFilesystemError\`: The command fails for any other reason.

**Usage**

To remove a file:

\`\`\`python fixture:sandbox
sandbox.filesystem.write_bytes(b"Hello, world!\\n", "/tmp/hello.bin")
sandbox.filesystem.remove("/tmp/hello.bin")
\`\`\`

To remove a directory and all its contents:

\`\`\`python fixture:sandbox
sandbox.filesystem.make_directory("/tmp/mydir/subdir")
sandbox.filesystem.remove("/tmp/mydir", recursive=True)
\`\`\`

### filesystem.stat

\`\`\`python
stat(self, remote_path)
\`\`\`
Return metadata for a single file, directory, or symlink in the Sandbox.

\`remote_path\` must be an absolute path in the Sandbox. If \`remote_path\` is a symlink, the returned
\`FileInfo\` object describes the symlink, not the target it points to.

**Raises**

- \`SandboxFilesystemNotFoundError\`: the path does not exist.
- \`SandboxFilesystemNotADirectoryError\`: a non-leaf component of the path is not a directory.
- \`SandboxFilesystemPermissionError\`: a component of the path is not searchable.
- \`SandboxFilesystemError\`: the command fails for any other reason.

**Usage**

\`\`\`python fixture:sandbox
sandbox.filesystem.write_text("Hello, world!\\n", "/tmp/hello.txt")
info = sandbox.filesystem.stat("/tmp/hello.txt")
print(info.size, info.permissions, info.modified_time)
\`\`\`

### filesystem.watch

\`\`\`python
watch(self, remote_path, *, filter=None, recursive=False, timeout=None)
\`\`\`
Watch a path in the Sandbox for filesystem changes.

\`remote_path\` must be an absolute path in the Sandbox. If it points
to a file, events for that file are reported. If it points to a
directory, events for entries directly inside it are reported. Set
\`recursive=True\` to also receive events for all nested subdirectories.
If \`remote_path\` is a symlink, it is followed and events reference
paths under the resolved target.

Yields \`FileWatchEvent\` objects as changes occur, until either
\`timeout\` seconds elapse, the iterator is closed, or the Sandbox
is terminated.

Optionally restrict the kinds of events emitted to those included
in \`filter\`. The default filter \`None\` permits all event types.

\`timeout\` is in seconds. \`None\` means watch indefinitely. When
\`timeout\` elapses, the iterator stops without raising an exception.

**Raises**

- \`SandboxFilesystemNotFoundError\`: \`remote_path\` does not exist.
- \`SandboxFilesystemPermissionError\`: watch access is denied.
- \`InvalidError\`: the filesystem at \`remote_path\` does not support
  watching.
- \`SandboxFilesystemError\`: the command fails for any other reason.

**Usage**

\`\`\`python notest
for event in sandbox.filesystem.watch(
    "/tmp/foo",
    recursive=True,
    filter=[FileWatchEventType.Create],
    timeout=60,
):
    if any(p.endswith(".done") for p in event.paths):
        break
\`\`\`

### filesystem.write_bytes

\`\`\`python
write_bytes(self, data, remote_path)
\`\`\`
Write binary content to a file in the Sandbox.

\`remote_path\` must be an absolute path to a file in the Sandbox.
Parent directories for \`remote_path\` are created if needed.
The remote file is overwritten if it already exists.

**Parameters**

<Parameter name="data" type="bytes | bytearray | memoryview" description="Bytes to write." />
<Parameter name="remote_path" type="str" description="Absolute path to the file in the Sandbox." />

**Raises**

- \`TypeError\`: \`\`data\`\` is not bytes-like.
- \`SandboxFilesystemNotADirectoryError\`: A parent path component is not a directory.
- \`SandboxFilesystemIsADirectoryError\`: \`\`remote_path\`\` points to a directory.
- \`SandboxFilesystemPermissionError\`: Write permission is denied.
- \`SandboxFilesystemError\`: The command fails for any other reason.

**Usage**

\`\`\`python fixture:sandbox
sandbox.filesystem.write_bytes(b"Hello, world!\\n", "/tmp/hello.bin")
\`\`\`

### filesystem.write_text

\`\`\`python
write_text(self, data, remote_path)
\`\`\`
Write UTF-8 text to a file in the Sandbox.

\`remote_path\` must be an absolute path to a file in the Sandbox.
Parent directories for \`remote_path\` are created if needed.
The remote file is overwritten if it already exists.

**Parameters**

<Parameter name="data" type="str" description="Text to write (encoded as UTF-8)." />
<Parameter name="remote_path" type="str" description="Absolute path to the file in the Sandbox." />

**Raises**

- \`TypeError\`: \`\`data\`\` is not a string.
- \`SandboxFilesystemNotADirectoryError\`: A parent path component is not a directory.
- \`SandboxFilesystemIsADirectoryError\`: \`\`remote_path\`\` points to a directory.
- \`SandboxFilesystemPermissionError\`: Write permission is denied.
- \`SandboxFilesystemError\`: The command fails for any other reason.

**Usage**

\`\`\`python fixture:sandbox
sandbox.filesystem.write_text("Hello, world!\\n", "/tmp/hello.txt")
\`\`\`

## open

\`\`\`python
open(self, path, mode="r")
\`\`\`
[Alpha] Open a file in the Sandbox and return a FileIO handle.

**Deprecated (2026-03-09):** Use the \`Sandbox.filesystem\` APIs instead for improved reliability.

See the [\`FileIO\`](https://modal.com/docs/sdk/py/latest/file_io#fileio)
docs for more information.

**Parameters**

<Parameter name="path" type="str" description="Absolute path of the file inside the sandbox." />
<Parameter name="mode" type="Union[_typeshed.OpenTextMode, _typeshed.OpenBinaryMode]" defaultValue="&quot;r&quot;" description="File open mode (text or binary), following built-in \`\`open\`\` conventions." />

**Returns**

A \`FileIO\` handle for reading or writing the remote file.

**Usage**

\`\`\`python notest
sb = modal.Sandbox.create(app=sb_app)
f = sb.open("/test.txt", "w")
f.write("hello")
f.close()
\`\`\`

## ls

\`\`\`python
ls(self, path)
\`\`\`
[Alpha] List the contents of a directory in the Sandbox.

**Deprecated (2026-04-15):** Use \`Sandbox.filesystem.list_files()\` instead for improved reliability.

**Parameters**

<Parameter name="path" type="str" description="Absolute directory path inside the sandbox." />

**Returns**

Entry names in the directory as a list of strings.

## mkdir

\`\`\`python
mkdir(self, path, parents=False)
\`\`\`
[Alpha] Create a new directory in the Sandbox.

**Deprecated (2026-04-15):** Use \`Sandbox.filesystem.make_directory()\` instead for improved reliability.

## rm

\`\`\`python
rm(self, path, recursive=False)
\`\`\`
[Alpha] Remove a file or directory in the Sandbox.

**Deprecated (2026-04-15):** Use \`Sandbox.filesystem.remove()\` instead for improved reliability.

## watch

\`\`\`python
watch(self, path, filter=None, recursive=None, timeout=None)
\`\`\`
[Alpha] Watch a file or directory in the Sandbox for changes.

**Deprecated (2026-05-08):** Use \`Sandbox.filesystem.watch()\` instead for improved reliability.

**Parameters**

<Parameter name="path" type="str" description="Absolute path to watch." />
<Parameter name="filter" type="builtins.list[FileWatchEventType] | None" defaultValue="None" description="Optional list of event types to include." />
<Parameter name="recursive" type="bool | None" defaultValue="None" description="Whether to watch subdirectories; None uses server defaults." />
<Parameter name="timeout" type="int | None" defaultValue="None" description="Optional timeout for the watch stream." />

**Returns**

An async iterator of \`FileWatchEvent\` values.

## stdout

\`\`\`python
stdout(self)
\`\`\`
[\`StreamReader\`](https://modal.com/docs/sdk/py/latest/io_streams#streamreader)
for the sandbox's stdout stream.

**Returns**

Stream reader for sandbox stdout.

## stderr

\`\`\`python
stderr(self)
\`\`\`
[\`StreamReader\`](https://modal.com/docs/sdk/py/latest/io_streams#streamreader)
for the Sandbox's stderr stream.

**Returns**

Stream reader for sandbox stderr.

## stdin

\`\`\`python
stdin(self)
\`\`\`
[\`StreamWriter\`](https://modal.com/docs/sdk/py/latest/io_streams#streamwriter)
for the Sandbox's stdin stream.

**Returns**

Stream writer for sandbox stdin.

## returncode

\`\`\`python
returncode(self)
\`\`\`
Return code of the Sandbox process if it has finished running, else \`None\`.

**Returns**

Exit code when the sandbox process has completed, otherwise None.

## list

\`\`\`python
list(*, app_id=None, tags=None, client=None)
\`\`\`
List all Sandboxes for the current Environment or App ID (if specified). If tags are specified, only
Sandboxes that have at least those tags are returned.

**Parameters**

<Parameter name="app_id" type="str | None" defaultValue="None" description="If set, restrict results to sandboxes under this app ID." />
<Parameter name="tags" type="dict[str, str] | None" defaultValue="None" description="If set, only sandboxes containing at least these tags are returned." />
<Parameter name="client" type="_Client | None" defaultValue="None" description="Modal client to use for listing; defaults to \`Client.from_env()\` when omitted." />

**Returns**

An async generator yielding \`Sandbox\` objects.

## logs


\`\`\`python
logs: SandboxLogsManager
\`\`\`

Access logs for a \`Sandbox\` entrypoint.

Useful for inspecting logs after a Sandbox terminates.
Use [\`fetch()\`](#logsfetch)
to read logs from a UTC time range, [\`tail()\`](#logstail)
to read the most recent logs.

Note that the logs from executed commands in the sandbox (via \`exec()\`) are not included in the
entrypoint logs.

**See Also**

- [\`modal app logs\`](https://modal.com/docs/cli/latest/app#modal-app-logs):
  CLI access to logs for an App.


### logs.fetch

\`\`\`python
fetch(self, *, since, until=None, source=None, search_text="")
\`\`\`
Fetch Sandbox logs corresponding to the date range and filters.

**Parameters**

<Parameter name="since" type="datetime" description="Start date to fetch logs from. Must be in UTC or timezone-naive, which is interpreted as local time." />
<Parameter name="until" type="datetime | None" defaultValue="None" description="Defaults to current date if None. Must be in UTC or timezone-naive, which is interpreted as local time." />
<Parameter name="source" type="LogSource | None" defaultValue="None" description="Filter by source: &#x27;stdout&#x27;, &#x27;stderr&#x27;, or &#x27;system&#x27;." />
<Parameter name="search_text" type="str" defaultValue="&quot;&quot;" description="Filter by search text." />

**Yields**

\`LogEntry\` objects in chronological order.

**Usage**

\`\`\`python notest
sandbox = modal.Sandbox.from_name("my-app", "sandbox")

for entry in sandbox.logs.fetch(
    since=datetime.now() - timedelta(minutes=25),
    source="stdout",
):
    print(entry.message, end="")
\`\`\`

### logs.tail

\`\`\`python
tail(self, entries=100, *, source=None)
\`\`\`
Fetch the most recent Sandbox logs.

**Parameters**

<Parameter name="entries" type="int" defaultValue="100" description="The number of log entries to return." />
<Parameter name="source" type="LogSource | None" defaultValue="None" description="Filter by source: &#x27;stdout&#x27;, &#x27;stderr&#x27;, or &#x27;system&#x27;." />

**Yields**

\`LogEntry\` objects in chronological order.
`,meta:{title:`Sandbox`,description:`A Sandbox object lets you interact with a running sandbox. This API is similar to Python’s asyncio.subprocess.Process.`}},{toc:h,rawContent:g,meta:re}=m,ie=t(`<code>Image</code>`),ae=t(`<code>ContainerProcess</code>`),oe=t(`<code>FileIO</code>`),se=t(`<code>StreamReader</code>`),ce=t(`<code>StreamReader</code>`),le=t(`<code>StreamWriter</code>`),ue=t(`<code>fetch()</code>`),de=t(`<code>tail()</code>`),fe=t(`<code>modal app logs</code>`),pe=t(`<!> <!> <p>A <code>Sandbox</code> object lets you interact with a running sandbox. This API is similar to Python’s <!>.</p> <p>Refer to the <!> on how to spawn and use sandboxes.</p> <!> <!> <p>Synchronize the local object with its identity on the Modal server.</p> <p>It is rarely necessary to call this method explicitly, as most operations
will lazily hydrate when needed. The main use case is when you need to
access object metadata, such as its ID.</p> <p><em>Added in v0.72.39</em>: This method replaces the deprecated <code>.resolve()</code> method.</p> <!> <!> <p>Create a new Sandbox to run untrusted, arbitrary code.</p> <p>The Sandbox’s corresponding container will be created asynchronously.</p> <p><strong>Parameters</strong></p> <!> <!> <!> <!> <!> <!> <!> <!> <!> <!> <!> <!> <!> <!> <!> <!> <!> <!> <!> <!> <!> <!> <!> <!> <!> <!> <!> <!> <!> <!> <!> <!> <!> <!> <!> <!> <p><strong>Returns</strong></p> <p>A <code>Sandbox</code> object representing the created sandbox which can be used to interact with the sandbox.</p> <p><strong>Raises</strong></p> <ul><li><code>AlreadyExistsError</code>: If a sandbox with the same name already exists.</li></ul> <p><strong>Usage</strong></p> <!> <!> <!> <p>Disconnects your client from the sandbox and cleans up resources assoicated with the connection.</p> <p>Be sure to only call <code>detach</code> when you are done interacting with the sandbox. After calling <code>detach</code>,
any operation using the Sandbox object is not guaranteed to work anymore. If you want to continue interacting
with a running sandbox, use <code>Sandbox.from_id</code> to get a new Sandbox object.</p> <!> <!> <p>Get a running Sandbox by name from a deployed App.</p> <p>A Sandbox’s name is the <code>name</code> argument passed to <code>Sandbox.create</code>.</p> <p><strong>Parameters</strong></p> <!> <!> <!> <!> <p><strong>Returns</strong></p> <p>A <code>Sandbox</code> handle for the running sandbox.</p> <p><strong>Raises</strong></p> <ul><li><code>NotFoundError</code>: If no running sandbox exists with the given name.</li></ul> <!> <!> <p>Construct a Sandbox from an id and look up the Sandbox result.</p> <p>The ID of a Sandbox object can be accessed using <code>.object_id</code>.</p> <p><strong>Parameters</strong></p> <!> <!> <p><strong>Returns</strong></p> <p>A <code>Sandbox</code> handle with any available result metadata populated from the server.</p> <!> <!> <p>Fetches any tags (key-value pairs) currently attached to this Sandbox from the server.</p> <p><strong>Returns</strong></p> <p>Tags as a map from tag name to tag value.</p> <!> <!> <p>Set tags (key-value pairs) on the Sandbox. Tags can be used to filter results in <code>Sandbox.list</code>.</p> <p>Setting tags replaces the Sandbox’s entire tag set; passing an empty dict clears all tags.</p> <p><strong>Parameters</strong></p> <!> <!> <!> <!> <p>Snapshot the filesystem of the Sandbox.</p> <p><strong>Parameters</strong></p> <!> <!> <p><strong>Returns</strong></p> <p>An <!> object which can be used to spawn a new
Sandbox with the same filesystem.</p> <!> <!> <p>Mount an Image at a specified path in a running Sandbox.</p> <p><code>path</code> should be a directory that is <strong>not</strong> the root path (<code>/</code>). If the path doesn’t exist
it will be created. If it exists and contains data, the previous directory will be replaced
by the mount.</p> <p>The <code>image</code> argument supports any Image that has an object ID, including:</p> <ul><li>Images built using <code>image.build()</code></li> <li>Images referenced by ID, e.g. <code>Image.from_id(...)</code></li> <li>Filesystem/directory snapshots, e.g. created by <code>.snapshot_directory()</code> or <code>.snapshot_filesystem()</code></li> <li>Empty images created with <code>Image.from_scratch()</code></li></ul> <p><strong>Parameters</strong></p> <!> <!> <p><strong>Usage</strong></p> <!> <!> <!> <p>Unmount a previously mounted Image from a running Sandbox.</p> <p><code>path</code> must be the exact mount point that was passed to <code>.mount_image()</code>.
After unmounting, the underlying Sandbox filesystem at that path becomes
visible again.</p> <p><strong>Parameters</strong></p> <!> <!> <!> <p>Snapshot a directory in a running Sandbox, creating a new Image with its content.</p> <p><code>timeout</code> If the snapshot does not return within that window, the call is cancelled
and <code>modal.exception.TimeoutError</code> is raised.</p> <p><code>ttl</code> The resulting Image is retained for <code>ttl</code> seconds (default: 30 days)
Pass <code>ttl=None</code> to retain the image indefinitely.</p> <p><strong>Parameters</strong></p> <!> <p><strong>Returns</strong></p> <p>An <code>Image</code> containing the directory contents.</p> <p><strong>Usage</strong></p> <!> <!> <!> <p>Wait for the Sandbox to finish running.</p> <p><strong>Parameters</strong></p> <!> <!> <!> <p>Wait for the Sandbox readiness probe to report that the Sandbox is ready.</p> <p>The Sandbox must be configured with a <code>readiness_probe</code> in order to use this method.</p> <p><strong>Parameters</strong></p> <!> <p><strong>Usage</strong></p> <!> <!> <!> <p>Get Tunnel metadata for the sandbox.</p> <p>NOTE: Previous to client <!>, this
returned a list of <code>TunnelData</code> objects.</p> <p><strong>Parameters</strong></p> <!> <p><strong>Returns</strong></p> <p>A dictionary mapping container port to <code>Tunnel</code> metadata.</p> <p><strong>Raises</strong></p> <ul><li><code>SandboxTimeoutError</code>: If the tunnels are not available after the timeout.</li></ul> <!> <!> <p>Create a token for making HTTP connections to the Sandbox.</p> <p>Accepts an optional user_metadata string or dict to associate with the token. This metadata
will be added to the headers by the proxy when forwarding requests to the Sandbox.
Also accepts a port that requests will be routed to.</p> <p><strong>Parameters</strong></p> <!> <!> <p><strong>Returns</strong></p> <p>URL and token credentials for connecting to the sandbox over HTTP.</p> <!> <!> <p>Reload all Volumes mounted in the Sandbox.</p> <p>Added in v1.1.0.</p> <p>Blocks until the reload completes, or raises <code>modal.exception.TimeoutError</code> on timeout (the reload
may still complete in the background).</p> <p><strong>Parameters</strong></p> <!> <!> <!> <p>Terminate Sandbox execution.</p> <p>This is a no-op if the Sandbox has already finished running.</p> <p><strong>Parameters</strong></p> <!> <p><strong>Returns</strong></p> <p>The sandbox exit code when <code>wait</code> is True; otherwise None.</p> <!> <!> <p>Check if the Sandbox has finished running.</p> <p><strong>Returns</strong></p> <p><code>None</code> if the Sandbox is still running, otherwise the exit code.</p> <!> <!> <p>Execute a command in the Sandbox and return a ContainerProcess handle.</p> <p>See the <!> docs for more information.</p> <p><strong>Parameters</strong></p> <!> <!> <!> <!> <!> <!> <!> <!> <!> <!> <!> <!> <p><strong>Returns</strong></p> <p>A <code>ContainerProcess</code> handle for the running command (text or bytes depending on <code>text</code>).</p> <p><strong>Usage</strong></p> <!> <!> <!> <p>Namespace for Sandbox filesystem APIs.</p> <!> <!> <p>Copy a local file into the Sandbox.</p> <p><code>remote_path</code> must be an absolute path to a file in the Sandbox.
Parent directories for <code>remote_path</code> are created if needed.
The remote file is overwritten if it already exists.</p> <p><strong>Parameters</strong></p> <!> <!> <p><strong>Raises</strong></p> <ul><li><code>SandboxFilesystemNotADirectoryError</code>: A parent path component of <code>remote_path</code> is not a directory.</li> <li><code>SandboxFilesystemIsADirectoryError</code>: <code>remote_path</code> points to a directory.</li> <li><code>SandboxFilesystemPermissionError</code>: Write permission is denied in the Sandbox.</li> <li><code>SandboxFilesystemError</code>: The command fails for any other reason.</li> <li><code>FileNotFoundError</code>: <code>local_path</code> does not exist.</li> <li><code>IsADirectoryError</code>: <code>local_path</code> is a directory.</li> <li><code>PermissionError</code>: Reading <code>local_path</code> is not permitted.</li></ul> <p><strong>Usage</strong></p> <!> <!> <!> <p>Copy a file from the Sandbox to a local path.</p> <p><code>remote_path</code> must be an absolute path to a file in the Sandbox.
Parent directories for <code>local_path</code> are created if needed.
The local file is overwritten if it already exists.</p> <p><strong>Raises</strong></p> <ul><li><code>SandboxFilesystemNotFoundError</code>: the remote path does not exist.</li> <li><code>SandboxFilesystemIsADirectoryError</code>: the remote path points to a directory.</li> <li><code>SandboxFilesystemPermissionError</code>: read permission is denied in the Sandbox.</li> <li><code>SandboxFilesystemError</code>: the command fails for any other reason.</li> <li><code>IsADirectoryError</code>: <code>local_path</code> points to a directory.</li> <li><code>NotADirectoryError</code>: a component of the <code>local_path</code> parent is not a directory.</li> <li><code>PermissionError</code>: writing <code>local_path</code> is not permitted.</li></ul> <p><strong>Usage</strong></p> <!> <!> <!> <p>List files and directories in a Sandbox directory.</p> <p><strong>Parameters</strong></p> <!> <p><strong>Returns</strong></p> <p>A list of <code>FileInfo</code> objects describing each entry.</p> <p><strong>Raises</strong></p> <ul><li><code>SandboxFilesystemNotFoundError</code>: The path does not exist.</li> <li><code>SandboxFilesystemNotADirectoryError</code>: The path is not a directory.</li> <li><code>SandboxFilesystemPermissionError</code>: Read permission is denied.</li> <li><code>SandboxFilesystemError</code>: The command fails for any other reason.</li></ul> <p><strong>Usage</strong></p> <!> <!> <!> <p>Create a new directory in the Sandbox.</p> <p><code>remote_path</code> must be an absolute path in the Sandbox.</p> <p>When <code>create_parents</code> is <code>True</code> (the default), any missing parent directories are created and the call is
idempotent (succeeds silently if the directory already exists). When <code>create_parents</code> is <code>False</code>, the
immediate parent directory must already exist and the path must not already exist.</p> <p><strong>Parameters</strong></p> <!> <!> <p><strong>Raises</strong></p> <ul><li><code>SandboxFilesystemNotFoundError</code>: The parent directory does not exist and <code>create_parents</code> is false.</li> <li><code>SandboxFilesystemPathAlreadyExistsError</code>: The path already exists.</li> <li><code>SandboxFilesystemNotADirectoryError</code>: A path component is not a directory.</li> <li><code>SandboxFilesystemPermissionError</code>: Creation is not permitted.</li> <li><code>InvalidError</code>: The operation is not supported by the mount.</li> <li><code>SandboxFilesystemError</code>: The command fails for any other reason.</li></ul> <p><strong>Usage</strong></p> <!> <!> <!> <p>Read a file from the Sandbox and return its contents as bytes.</p> <p><code>remote_path</code> must be an absolute path to a file in the Sandbox.</p> <p><strong>Parameters</strong></p> <!> <p><strong>Returns</strong></p> <p>Raw bytes read from the file.</p> <p><strong>Raises</strong></p> <ul><li><code>SandboxFilesystemNotFoundError</code>: The path does not exist.</li> <li><code>SandboxFilesystemIsADirectoryError</code>: The path points to a directory.</li> <li><code>SandboxFilesystemPermissionError</code>: Read permission is denied.</li> <li><code>SandboxFilesystemError</code>: The command fails for any other reason.</li></ul> <p><strong>Usage</strong></p> <!> <!> <!> <p>Read a file from the Sandbox and return its contents as a UTF-8 string.</p> <p><code>remote_path</code> must be an absolute path to a file in the Sandbox.</p> <p><strong>Parameters</strong></p> <!> <p><strong>Returns</strong></p> <p>File contents decoded as UTF-8.</p> <p><strong>Raises</strong></p> <ul><li><code>SandboxFilesystemNotFoundError</code>: The path does not exist.</li> <li><code>SandboxFilesystemIsADirectoryError</code>: The path points to a directory.</li> <li><code>SandboxFilesystemPermissionError</code>: Read permission is denied.</li> <li><code>SandboxFilesystemError</code>: The command fails for any other reason.</li></ul> <p><strong>Usage</strong></p> <!> <!> <!> <p>Remove a file or directory in the Sandbox.</p> <p>When <code>remote_path</code> is a directory and <code>recursive</code> is <code>False</code> (the
default), removes it only if it is empty. When <code>recursive</code> is <code>True</code>,
removes the directory and all its contents.</p> <p>Recursive directory removal is not supported on all mounts.
In particular, <code>CloudBucketMount</code> does not support it. An <code>InvalidError</code> is raised in that case.</p> <p><strong>Parameters</strong></p> <!> <!> <p><strong>Raises</strong></p> <ul><li><code>SandboxFilesystemNotFoundError</code>: The remote path does not exist.</li> <li><code>SandboxFilesystemDirectoryNotEmptyError</code>: <code>recursive</code> is <code>False</code> and the directory is not empty.</li> <li><code>SandboxFilesystemPermissionError</code>: Read permission is denied in the Sandbox.</li> <li><code>InvalidError</code>: The operation is not supported by the mount.</li> <li><code>SandboxFilesystemError</code>: The command fails for any other reason.</li></ul> <p><strong>Usage</strong></p> <p>To remove a file:</p> <!> <p>To remove a directory and all its contents:</p> <!> <!> <!> <p>Return metadata for a single file, directory, or symlink in the Sandbox.</p> <p><code>remote_path</code> must be an absolute path in the Sandbox. If <code>remote_path</code> is a symlink, the returned <code>FileInfo</code> object describes the symlink, not the target it points to.</p> <p><strong>Raises</strong></p> <ul><li><code>SandboxFilesystemNotFoundError</code>: the path does not exist.</li> <li><code>SandboxFilesystemNotADirectoryError</code>: a non-leaf component of the path is not a directory.</li> <li><code>SandboxFilesystemPermissionError</code>: a component of the path is not searchable.</li> <li><code>SandboxFilesystemError</code>: the command fails for any other reason.</li></ul> <p><strong>Usage</strong></p> <!> <!> <!> <p>Watch a path in the Sandbox for filesystem changes.</p> <p><code>remote_path</code> must be an absolute path in the Sandbox. If it points
to a file, events for that file are reported. If it points to a
directory, events for entries directly inside it are reported. Set <code>recursive=True</code> to also receive events for all nested subdirectories.
If <code>remote_path</code> is a symlink, it is followed and events reference
paths under the resolved target.</p> <p>Yields <code>FileWatchEvent</code> objects as changes occur, until either <code>timeout</code> seconds elapse, the iterator is closed, or the Sandbox
is terminated.</p> <p>Optionally restrict the kinds of events emitted to those included
in <code>filter</code>. The default filter <code>None</code> permits all event types.</p> <p><code>timeout</code> is in seconds. <code>None</code> means watch indefinitely. When <code>timeout</code> elapses, the iterator stops without raising an exception.</p> <p><strong>Raises</strong></p> <ul><li><code>SandboxFilesystemNotFoundError</code>: <code>remote_path</code> does not exist.</li> <li><code>SandboxFilesystemPermissionError</code>: watch access is denied.</li> <li><code>InvalidError</code>: the filesystem at <code>remote_path</code> does not support
watching.</li> <li><code>SandboxFilesystemError</code>: the command fails for any other reason.</li></ul> <p><strong>Usage</strong></p> <!> <!> <!> <p>Write binary content to a file in the Sandbox.</p> <p><code>remote_path</code> must be an absolute path to a file in the Sandbox.
Parent directories for <code>remote_path</code> are created if needed.
The remote file is overwritten if it already exists.</p> <p><strong>Parameters</strong></p> <!> <!> <p><strong>Raises</strong></p> <ul><li><code>TypeError</code>: <code>data</code> is not bytes-like.</li> <li><code>SandboxFilesystemNotADirectoryError</code>: A parent path component is not a directory.</li> <li><code>SandboxFilesystemIsADirectoryError</code>: <code>remote_path</code> points to a directory.</li> <li><code>SandboxFilesystemPermissionError</code>: Write permission is denied.</li> <li><code>SandboxFilesystemError</code>: The command fails for any other reason.</li></ul> <p><strong>Usage</strong></p> <!> <!> <!> <p>Write UTF-8 text to a file in the Sandbox.</p> <p><code>remote_path</code> must be an absolute path to a file in the Sandbox.
Parent directories for <code>remote_path</code> are created if needed.
The remote file is overwritten if it already exists.</p> <p><strong>Parameters</strong></p> <!> <!> <p><strong>Raises</strong></p> <ul><li><code>TypeError</code>: <code>data</code> is not a string.</li> <li><code>SandboxFilesystemNotADirectoryError</code>: A parent path component is not a directory.</li> <li><code>SandboxFilesystemIsADirectoryError</code>: <code>remote_path</code> points to a directory.</li> <li><code>SandboxFilesystemPermissionError</code>: Write permission is denied.</li> <li><code>SandboxFilesystemError</code>: The command fails for any other reason.</li></ul> <p><strong>Usage</strong></p> <!> <!> <!> <p>[Alpha] Open a file in the Sandbox and return a FileIO handle.</p> <p><strong>Deprecated (2026-03-09):</strong> Use the <code>Sandbox.filesystem</code> APIs instead for improved reliability.</p> <p>See the <!> docs for more information.</p> <p><strong>Parameters</strong></p> <!> <!> <p><strong>Returns</strong></p> <p>A <code>FileIO</code> handle for reading or writing the remote file.</p> <p><strong>Usage</strong></p> <!> <!> <!> <p>[Alpha] List the contents of a directory in the Sandbox.</p> <p><strong>Deprecated (2026-04-15):</strong> Use <code>Sandbox.filesystem.list_files()</code> instead for improved reliability.</p> <p><strong>Parameters</strong></p> <!> <p><strong>Returns</strong></p> <p>Entry names in the directory as a list of strings.</p> <!> <!> <p>[Alpha] Create a new directory in the Sandbox.</p> <p><strong>Deprecated (2026-04-15):</strong> Use <code>Sandbox.filesystem.make_directory()</code> instead for improved reliability.</p> <!> <!> <p>[Alpha] Remove a file or directory in the Sandbox.</p> <p><strong>Deprecated (2026-04-15):</strong> Use <code>Sandbox.filesystem.remove()</code> instead for improved reliability.</p> <!> <!> <p>[Alpha] Watch a file or directory in the Sandbox for changes.</p> <p><strong>Deprecated (2026-05-08):</strong> Use <code>Sandbox.filesystem.watch()</code> instead for improved reliability.</p> <p><strong>Parameters</strong></p> <!> <!> <!> <!> <p><strong>Returns</strong></p> <p>An async iterator of <code>FileWatchEvent</code> values.</p> <!> <!> <p><!> for the sandbox’s stdout stream.</p> <p><strong>Returns</strong></p> <p>Stream reader for sandbox stdout.</p> <!> <!> <p><!> for the Sandbox’s stderr stream.</p> <p><strong>Returns</strong></p> <p>Stream reader for sandbox stderr.</p> <!> <!> <p><!> for the Sandbox’s stdin stream.</p> <p><strong>Returns</strong></p> <p>Stream writer for sandbox stdin.</p> <!> <!> <p>Return code of the Sandbox process if it has finished running, else <code>None</code>.</p> <p><strong>Returns</strong></p> <p>Exit code when the sandbox process has completed, otherwise None.</p> <!> <!> <p>List all Sandboxes for the current Environment or App ID (if specified). If tags are specified, only
Sandboxes that have at least those tags are returned.</p> <p><strong>Parameters</strong></p> <!> <!> <!> <p><strong>Returns</strong></p> <p>An async generator yielding <code>Sandbox</code> objects.</p> <!> <!> <p>Access logs for a <code>Sandbox</code> entrypoint.</p> <p>Useful for inspecting logs after a Sandbox terminates.
Use <!> to read logs from a UTC time range, <!> to read the most recent logs.</p> <p>Note that the logs from executed commands in the sandbox (via <code>exec()</code>) are not included in the
entrypoint logs.</p> <p><strong>See Also</strong></p> <ul><li><!>:
CLI access to logs for an App.</li></ul> <!> <!> <p>Fetch Sandbox logs corresponding to the date range and filters.</p> <p><strong>Parameters</strong></p> <!> <!> <!> <!> <p><strong>Yields</strong></p> <p><code>LogEntry</code> objects in chronological order.</p> <p><strong>Usage</strong></p> <!> <!> <!> <p>Fetch the most recent Sandbox logs.</p> <p><strong>Parameters</strong></p> <!> <!> <p><strong>Yields</strong></p> <p><code>LogEntry</code> objects in chronological order.</p>`,1);function _(t,h){let g=ee(h,[`children`,`$$slots`,`$$events`,`$$legacy`]);d(t,a(()=>g,()=>m,{children:(t,ee)=>{var a=pe(),d=te(a);ne(d,{id:`sandbox`,children:(e,t)=>{s(),i(e,r(`Sandbox`))},$$slots:{default:!0}});var m=o(d,2);u(m,{code:`class%20Sandbox(modal.object.Object)`,lang:`python`});var h=o(m,2);f(o(e(h),3),{href:`https://docs.python.org/3/library/asyncio-subprocess.html#asyncio.subprocess.Process`,rel:`nofollow`,children:(e,t)=>{s(),i(e,r(`asyncio.subprocess.Process`))},$$slots:{default:!0}}),s(),n(h);var g=o(h,2);f(o(e(g)),{href:`https://modal.com/docs/guide/sandbox`,rel:`nofollow`,children:(e,t)=>{s(),i(e,r(`guide`))},$$slots:{default:!0}}),s(),n(g);var re=o(g,2);c(re,{id:`hydrate`,children:(e,t)=>{s(),i(e,r(`hydrate`))},$$slots:{default:!0}});var _=o(re,2);u(_,{code:`hydrate(self%2C%20client%3DNone)`,lang:`python`});var v=o(_,8);c(v,{id:`create`,children:(e,t)=>{s(),i(e,r(`create`))},$$slots:{default:!0}});var y=o(v,2);u(y,{code:`create(*args%2C%20app%3DNone%2C%20name%3DNone%2C%20tags%3DNone%2C%20image%3DNone%2C%20env%3DNone%2C%0A%20%20%20%20secrets%3DNone%2C%20network_file_systems%3D%7B%7D%2C%20timeout%3D300%2C%20idle_timeout%3DNone%2C%0A%20%20%20%20workdir%3DNone%2C%20gpu%3DNone%2C%20cloud%3DNone%2C%20region%3DNone%2C%20cpu%3DNone%2C%20memory%3DNone%2C%0A%20%20%20%20block_network%3DFalse%2C%20outbound_cidr_allowlist%3DNone%2C%0A%20%20%20%20outbound_domain_allowlist%3DNone%2C%20inbound_cidr_allowlist%3DNone%2C%20volumes%3D%7B%7D%2C%0A%20%20%20%20pty%3DFalse%2C%20encrypted_ports%3D%5B%5D%2C%20h2_ports%3D%5B%5D%2C%20unencrypted_ports%3D%5B%5D%2C%0A%20%20%20%20custom_domain%3DNone%2C%20proxy%3DNone%2C%20include_oidc_identity_token%3DFalse%2C%0A%20%20%20%20readiness_probe%3DNone%2C%20verbose%3DFalse%2C%20experimental_options%3DNone%2C%0A%20%20%20%20_experimental_enable_snapshot%3DFalse%2C%20client%3DNone%2C%20environment_name%3DNone%2C%0A%20%20%20%20pty_info%3DNone%2C%20cidr_allowlist%3DNone)`,lang:`python`});var b=o(y,8);p(b,{name:`*args`,type:`str`,description:`Set the CMD of the Sandbox, overriding any CMD of the container image.`});var x=o(b,2);p(x,{name:`app`,type:`"modal.app._App | None"`,defaultValue:`None`,description:`Associate the sandbox with an app. Required unless creating from a container.`});var S=o(x,2);p(S,{name:`name`,type:`str | None`,defaultValue:`None`,description:`Optionally give the sandbox a name. Unique within an app.`});var C=o(S,2);p(C,{name:`tags`,type:`dict[str, str] | None`,defaultValue:`None`,description:`Tags to assign to the Sandbox.`});var w=o(C,2);p(w,{name:`image`,type:`_Image | None`,defaultValue:`None`,description:`The image to run as the container for the sandbox.`});var T=o(w,2);p(T,{name:`env`,type:`dict[str, str | None] | None`,defaultValue:`None`,description:`Environment variables to set in the Sandbox.`});var E=o(T,2);p(E,{name:`secrets`,type:`Collection[_Secret] | None`,defaultValue:`None`,description:`Secrets to inject into the Sandbox as environment variables.`});var D=o(E,2);p(D,{name:`network_file_systems`,type:`dict[str | os.PathLike, _NetworkFileSystem]`,defaultValue:`{}`,description:`Network file systems to mount into the sandbox.`});var O=o(D,2);p(O,{name:`timeout`,type:`int`,defaultValue:`300`,description:`Maximum lifetime of the sandbox in seconds.`});var k=o(O,2);p(k,{name:`idle_timeout`,type:`int | None`,defaultValue:`None`,description:`The amount of time in seconds that a sandbox can be idle before being terminated.`});var A=o(k,2);p(A,{name:`workdir`,type:`str | None`,defaultValue:`None`,description:`Working directory of the sandbox.`});var j=o(A,2);p(j,{name:`gpu`,type:`str | None`,defaultValue:`None`,description:`GPU reservation for the sandbox.`});var M=o(j,2);p(M,{name:`cloud`,type:`str | None`,defaultValue:`None`,description:`Cloud provider for the sandbox.`});var N=o(M,2);p(N,{name:`region`,type:`str | Sequence[str] | None`,defaultValue:`None`,description:`Region or regions to run the sandbox on.`});var P=o(N,2);p(P,{name:`cpu`,type:`float | tuple[float, float] | None`,defaultValue:`None`,description:`Specify, in fractional CPU cores, how many CPU cores to request. Or, pass (request, limit) to additionally specify a hard limit in fractional CPU cores. CPU throttling will prevent a container from exceeding its specified limit.`});var F=o(P,2);p(F,{name:`memory`,type:`int | tuple[int, int] | None`,defaultValue:`None`,description:`Specify, in MiB, a memory request which is the minimum memory required. Or, pass (request, limit) to additionally specify a hard limit in MiB.`});var I=o(F,2);p(I,{name:`block_network`,type:`bool`,defaultValue:`False`,description:`Whether to block network access.`});var L=o(I,2);p(L,{name:`outbound_cidr_allowlist`,type:`Sequence[str] | None`,defaultValue:`None`,description:`List of CIDRs the sandbox is allowed to access. If None, all CIDRs are allowed.`});var R=o(L,2);p(R,{name:`outbound_domain_allowlist`,type:`Sequence[str] | None`,defaultValue:`None`,description:'List of domain names the sandbox is allowed to access. Supports wildcard prefixes (``*.``); a bare ``"*"`` allows all domains. The outbound policy can be replaced later via `Sandbox._experimental_set_outbound_network_policy`.'});var z=o(R,2);p(z,{name:`inbound_cidr_allowlist`,type:`Sequence[str] | None`,defaultValue:`None`,description:`List of CIDRs allowed to connect inbound to the sandbox (tunnels and connection tokens). If None, all CIDRs are allowed.`});var B=o(z,2);p(B,{name:`volumes`,type:`dict[str | os.PathLike, _Volume | _CloudBucketMount]`,defaultValue:`{}`,description:`Mount points for Modal Volumes and CloudBucketMounts.`});var V=o(B,2);p(V,{name:`pty`,type:`bool`,defaultValue:`False`,description:`Enable a PTY for the Sandbox entrypoint command. When enabled, all output (stdout and stderr from the process) is multiplexed into stdout, and the stderr stream is effectively empty.`});var H=o(V,2);p(H,{name:`encrypted_ports`,type:`Sequence[int]`,defaultValue:`[]`,description:`List of ports to tunnel into the sandbox. Encrypted ports are tunneled with TLS.`});var me=o(H,2);p(me,{name:`h2_ports`,type:`Sequence[int]`,defaultValue:`[]`,description:`List of encrypted ports to tunnel into the sandbox, using HTTP/2.`});var he=o(me,2);p(he,{name:`unencrypted_ports`,type:`Sequence[int]`,defaultValue:`[]`,description:`List of ports to tunnel into the sandbox without encryption.`});var ge=o(he,2);p(ge,{name:`custom_domain`,type:`str | None`,defaultValue:`None`,description:`Allow connections to the Sandbox via a subdomain of this parent rather than a default Modal domain.`});var _e=o(ge,2);p(_e,{name:`proxy`,type:`_Proxy | None`,defaultValue:`None`,description:`Reference to a Modal Proxy to use in front of this Sandbox.`});var ve=o(_e,2);p(ve,{name:`include_oidc_identity_token`,type:`bool`,defaultValue:`False`,description:`If True, the sandbox will receive a MODAL_IDENTITY_TOKEN env var for OIDC-based auth.`});var ye=o(ve,2);p(ye,{name:`readiness_probe`,type:`Probe | None`,defaultValue:`None`,description:`Probe used to determine when the sandbox has become ready.`});var be=o(ye,2);p(be,{name:`verbose`,type:`bool`,defaultValue:`False`,description:`Enable verbose logging for sandbox operations.`});var xe=o(be,2);p(xe,{name:`experimental_options`,type:`dict[str, Any] | None`,defaultValue:`None`,description:`Experimental options to pass to the sandbox.`});var Se=o(xe,2);p(Se,{name:`_experimental_enable_snapshot`,type:`bool`,defaultValue:`False`,description:`Enable memory snapshots.`});var Ce=o(Se,2);p(Ce,{name:`client`,type:`_Client | None`,defaultValue:`None`,description:`Modal Client to use for the sandbox.`});var we=o(Ce,2);p(we,{name:`environment_name`,type:`str | None`,defaultValue:`None`,description:`*DEPRECATED* Optionally override the default environment`});var Te=o(we,2);p(Te,{name:`pty_info`,type:`api_pb2.PTYInfo | None`,defaultValue:`None`,description:"*DEPRECATED* Use `pty` instead. `pty` will override `pty_info`."});var Ee=o(Te,2);p(Ee,{name:`cidr_allowlist`,type:`Sequence[str] | None`,defaultValue:`None`,description:`*DEPRECATED* Use outbound_cidr_allowlist instead.`});var De=o(Ee,12);u(De,{code:`app%20%3D%20modal.App.lookup('sandbox-hello-world'%2C%20create_if_missing%3DTrue)%0Asandbox%20%3D%20modal.Sandbox.create(%22echo%22%2C%20%22hello%20world%22%2C%20app%3Dapp)%0Aprint(sandbox.stdout.read())%0Asandbox.wait()`,lang:`python`});var Oe=o(De,2);c(Oe,{id:`detach`,children:(e,t)=>{s(),i(e,r(`detach`))},$$slots:{default:!0}});var ke=o(Oe,2);u(ke,{code:`detach(self)`,lang:`python`});var Ae=o(ke,6);c(Ae,{id:`from_name`,children:(e,t)=>{s(),i(e,r(`from_name`))},$$slots:{default:!0}});var je=o(Ae,2);u(je,{code:`from_name(app_name%2C%20name%2C%20*%2C%20environment_name%3DNone%2C%20client%3DNone)`,lang:`python`});var Me=o(je,8);p(Me,{name:`app_name`,type:`str`,description:`Name of the deployed app to look up the sandbox under.`});var Ne=o(Me,2);p(Ne,{name:`name`,type:`str`,description:`Sandbox name to resolve.`});var Pe=o(Ne,2);p(Pe,{name:`environment_name`,type:`str | None`,defaultValue:`None`,description:`Optional environment name for the lookup; defaults to the configured environment.`});var Fe=o(Pe,2);p(Fe,{name:`client`,type:`_Client | None`,defaultValue:`None`,description:"Modal client to use for the RPC; defaults to `Client.from_env()` when omitted."});var Ie=o(Fe,10);c(Ie,{id:`from_id`,children:(e,t)=>{s(),i(e,r(`from_id`))},$$slots:{default:!0}});var Le=o(Ie,2);u(Le,{code:`from_id(sandbox_id%2C%20client%3DNone)`,lang:`python`});var Re=o(Le,8);p(Re,{name:`sandbox_id`,type:`str`,description:`Sandbox object ID to attach to.`});var ze=o(Re,2);p(ze,{name:`client`,type:`_Client | None`,defaultValue:`None`,description:`Modal client to use for the lookup; defaults to the environment client when omitted.`});var Be=o(ze,6);c(Be,{id:`get_tags`,children:(e,t)=>{s(),i(e,r(`get_tags`))},$$slots:{default:!0}});var Ve=o(Be,2);u(Ve,{code:`get_tags(self)`,lang:`python`});var He=o(Ve,8);c(He,{id:`set_tags`,children:(e,t)=>{s(),i(e,r(`set_tags`))},$$slots:{default:!0}});var Ue=o(He,2);u(Ue,{code:`set_tags(self%2C%20tags%2C%20*%2C%20client%3DNone)`,lang:`python`});var We=o(Ue,8);p(We,{name:`tags`,type:`dict[str, str]`,description:`Tag names and values to set on this sandbox.`});var Ge=o(We,2);p(Ge,{name:`client`,type:`_Client | None`,defaultValue:`None`,description:`Deprecated. Prefer setting the client when creating or re-attaching to the sandbox.`});var Ke=o(Ge,2);c(Ke,{id:`snapshot_filesystem`,children:(e,t)=>{s(),i(e,r(`snapshot_filesystem`))},$$slots:{default:!0}});var qe=o(Ke,2);u(qe,{code:`snapshot_filesystem(self%2C%20timeout%3D55%2C%20*%2C%20ttl%3D30%20*%2024%20*%203600)`,lang:`python`});var Je=o(qe,6);p(Je,{name:`timeout`,type:`int`,defaultValue:`55`,description:"Maximum time in seconds to wait for the snapshot operation. If the snapshot does not return within that window, the call is cancelled and `modal.exception.TimeoutError` is raised."});var Ye=o(Je,2);p(Ye,{name:`ttl`,type:`int | None`,defaultValue:`30 * 24 * 3600`,description:"The resulting Image is retained for `ttl` seconds (default: 30 days). Pass `ttl=None` to retain the image indefinitely."});var U=o(Ye,4);f(o(e(U)),{href:`https://modal.com/docs/sdk/py/latest/Image`,rel:`nofollow`,children:(e,t)=>{i(e,ie())},$$slots:{default:!0}}),s(),n(U);var Xe=o(U,2);c(Xe,{id:`mount_image`,children:(e,t)=>{s(),i(e,r(`mount_image`))},$$slots:{default:!0}});var Ze=o(Xe,2);u(Ze,{code:`mount_image(self%2C%20path%2C%20image%2C%20*%2C%20_experimental_encryption_key%3DNone)`,lang:`python`});var Qe=o(Ze,12);p(Qe,{name:`path`,type:`PurePosixPath | str`,description:"Absolute mount point directory inside the sandbox (not `/`)."});var $e=o(Qe,2);p($e,{name:`image`,type:`_Image`,description:"Image to mount at `path` (must be built, referenced by ID, or snapshot-based as described above)."});var et=o($e,4);u(et,{code:`user_project_snapshot%3A%20Image%20%3D%20sandbox_session_1.snapshot_directory(%22%2Fuser_project%22)%0A%0A%23%20You%20can%20later%20mount%20this%20snapshot%20to%20another%20Sandbox%3A%0Asandbox_session_2%20%3D%20modal.Sandbox.create(...)%0Asandbox_session_2.mount_image(%22%2Fuser_project%22%2C%20user_project_snapshot)%0Asandbox_session_2.filesystem.list_files(%22%2Fuser_project%22)`,lang:`py`});var tt=o(et,2);c(tt,{id:`unmount_image`,children:(e,t)=>{s(),i(e,r(`unmount_image`))},$$slots:{default:!0}});var nt=o(tt,2);u(nt,{code:`unmount_image(self%2C%20path)`,lang:`python`});var rt=o(nt,8);p(rt,{name:`path`,type:`PurePosixPath | str`,description:`Absolute mount point directory to unmount.`});var it=o(rt,2);c(it,{id:`snapshot_directory`,children:(e,t)=>{s(),i(e,r(`snapshot_directory`))},$$slots:{default:!0}});var at=o(it,2);u(at,{code:`snapshot_directory(self%2C%20path%2C%20*%2C%20timeout%3D55%2C%20ttl%3D30%20*%2024%20*%203600%2C%0A%20%20%20%20_experimental_encryption_key%3DNone)`,lang:`python`});var ot=o(at,10);p(ot,{name:`path`,type:`PurePosixPath | str`,description:`Absolute path of the directory inside the sandbox to snapshot.`});var st=o(ot,8);u(st,{code:`user_project_snapshot%3A%20Image%20%3D%20sandbox_session_1.snapshot_directory(%22%2Fuser_project%22)%0A%0A%23%20You%20can%20later%20mount%20this%20snapshot%20to%20another%20Sandbox%3A%0Asandbox_session_2%20%3D%20modal.Sandbox.create(...)%0Asandbox_session_2.mount_image(%22%2Fuser_project%22%2C%20user_project_snapshot)%0Asandbox_session_2.filesystem.list_files(%22%2Fuser_project%22)`,lang:`py`});var ct=o(st,2);c(ct,{id:`wait`,children:(e,t)=>{s(),i(e,r(`wait`))},$$slots:{default:!0}});var lt=o(ct,2);u(lt,{code:`wait(self%2C%20raise_on_termination%3DTrue)`,lang:`python`});var ut=o(lt,6);p(ut,{name:`raise_on_termination`,type:`bool`,defaultValue:`True`,description:`If True, raise when the sandbox is terminated externally.`});var dt=o(ut,2);c(dt,{id:`wait_until_ready`,children:(e,t)=>{s(),i(e,r(`wait_until_ready`))},$$slots:{default:!0}});var ft=o(dt,2);u(ft,{code:`wait_until_ready(self%2C%20*%2C%20timeout%3D300)`,lang:`python`});var pt=o(ft,8);p(pt,{name:`timeout`,type:`int`,defaultValue:`300`,description:`Maximum time in seconds to wait for readiness.`});var mt=o(pt,4);u(mt,{code:`app%20%3D%20modal.App.lookup('sandbox-wait-until-ready'%2C%20create_if_missing%3DTrue)%0Asandbox%20%3D%20modal.Sandbox.create(%0A%20%20%20%20%22python3%22%2C%20%22-m%22%2C%20%22http.server%22%2C%20%228080%22%2C%0A%20%20%20%20readiness_probe%3Dmodal.Probe.with_tcp(8080)%2C%0A%20%20%20%20app%3Dapp%2C%0A)%0Asandbox.wait_until_ready()`,lang:`py`});var ht=o(mt,2);c(ht,{id:`tunnels`,children:(e,t)=>{s(),i(e,r(`tunnels`))},$$slots:{default:!0}});var gt=o(ht,2);u(gt,{code:`tunnels(self%2C%20timeout%3D50)`,lang:`python`});var W=o(gt,4);f(o(e(W)),{href:`https://modal.com/docs/sdk/py/changelog#064153-2024-09-30`,rel:`nofollow`,children:(e,t)=>{s(),i(e,r(`v0.64.153`))},$$slots:{default:!0}}),s(3),n(W);var _t=o(W,4);p(_t,{name:`timeout`,type:`int`,defaultValue:`50`,description:`Maximum time in seconds to wait for tunnel metadata when not already cached.`});var vt=o(_t,10);c(vt,{id:`create_connect_token`,children:(e,t)=>{s(),i(e,r(`create_connect_token`))},$$slots:{default:!0}});var yt=o(vt,2);u(yt,{code:`create_connect_token(self%2C%20user_metadata%3DNone%2C%20port%3D8080)`,lang:`python`});var bt=o(yt,8);p(bt,{name:`user_metadata`,type:`str | dict[str, Any] | None`,defaultValue:`None`,description:`Optional JSON-serializable metadata or string stored with the connect token.`});var xt=o(bt,2);p(xt,{name:`port`,type:`int`,defaultValue:`8080`,description:`Optional container port that requests are routed to when using this token.`});var St=o(xt,6);c(St,{id:`reload_volumes`,children:(e,t)=>{s(),i(e,r(`reload_volumes`))},$$slots:{default:!0}});var Ct=o(St,2);u(Ct,{code:`reload_volumes(self%2C%20*%2C%20timeout%3D55)`,lang:`python`});var wt=o(Ct,10);p(wt,{name:`timeout`,type:`int`,defaultValue:`55`,description:`Defaults to 55 seconds.`});var Tt=o(wt,2);c(Tt,{id:`terminate`,children:(e,t)=>{s(),i(e,r(`terminate`))},$$slots:{default:!0}});var Et=o(Tt,2);u(Et,{code:`terminate(self%2C%20*%2C%20wait%3DFalse)`,lang:`python`});var Dt=o(Et,8);p(Dt,{name:`wait`,type:`bool`,defaultValue:`False`,description:`If True, block until termination completes and return the exit code.`});var Ot=o(Dt,6);c(Ot,{id:`poll`,children:(e,t)=>{s(),i(e,r(`poll`))},$$slots:{default:!0}});var kt=o(Ot,2);u(kt,{code:`poll(self)`,lang:`python`});var At=o(kt,8);c(At,{id:`exec`,children:(e,t)=>{s(),i(e,r(`exec`))},$$slots:{default:!0}});var jt=o(At,2);u(jt,{code:`exec(self%2C%20*args%2C%20stdout%3DStreamType.PIPE%2C%20stderr%3DStreamType.PIPE%2C%20timeout%3DNone%2C%0A%20%20%20%20workdir%3DNone%2C%20env%3DNone%2C%20secrets%3DNone%2C%20text%3DTrue%2C%20bufsize%3D-1%2C%20pty%3DFalse%2C%0A%20%20%20%20_pty_info%3DNone%2C%20pty_info%3DNone)`,lang:`python`});var G=o(jt,4);f(o(e(G)),{href:`https://modal.com/docs/sdk/py/latest/container_process#containerprocess`,rel:`nofollow`,children:(e,t)=>{i(e,ae())},$$slots:{default:!0}}),s(),n(G);var K=o(G,4);p(K,{name:`*args`,type:`str`,description:`Command and arguments to run inside the sandbox.`});var Mt=o(K,2);p(Mt,{name:`stdout`,type:`StreamType`,defaultValue:`StreamType.PIPE`,description:`Where to connect the process stdout stream.`});var Nt=o(Mt,2);p(Nt,{name:`stderr`,type:`StreamType`,defaultValue:`StreamType.PIPE`,description:`Where to connect the process stderr stream.`});var Pt=o(Nt,2);p(Pt,{name:`timeout`,type:`int | None`,defaultValue:`None`,description:`Optional timeout in seconds for the exec session.`});var Ft=o(Pt,2);p(Ft,{name:`workdir`,type:`str | None`,defaultValue:`None`,description:`Working directory for the command; must be absolute if set.`});var It=o(Ft,2);p(It,{name:`env`,type:`dict[str, str | None] | None`,defaultValue:`None`,description:`Environment variables to set during command execution.`});var Lt=o(It,2);p(Lt,{name:`secrets`,type:`Collection[_Secret] | None`,defaultValue:`None`,description:`Secrets to inject as environment variables during command execution.`});var Rt=o(Lt,2);p(Rt,{name:`text`,type:`bool`,defaultValue:`True`,description:`If True, decode streams as text; if False, yield bytes.`});var zt=o(Rt,2);p(zt,{name:`bufsize`,type:`Literal[-1, 1]`,defaultValue:`-1`,description:"Control line-buffered output. ``-1`` means unbuffered; ``1`` means line-buffered (only when ``text`` is True)."});var Bt=o(zt,2);p(Bt,{name:`pty`,type:`bool`,defaultValue:`False`,description:`Enable a PTY for the command. When enabled, all output (stdout and stderr from the process) is multiplexed into stdout, and the stderr stream is effectively empty.`});var Vt=o(Bt,2);p(Vt,{name:`_pty_info`,type:`api_pb2.PTYInfo | None`,defaultValue:`None`,description:"*DEPRECATED* Use `pty` instead. `pty` will override `_pty_info`."});var Ht=o(Vt,2);p(Ht,{name:`pty_info`,type:`api_pb2.PTYInfo | None`,defaultValue:`None`,description:"*DEPRECATED* Use `pty` instead. `pty` will override `pty_info`."});var Ut=o(Ht,8);u(Ut,{code:`process%20%3D%20sandbox.exec(%22bash%22%2C%20%22-c%22%2C%20%22for%20i%20in%20%24(seq%201%203)%3B%20do%20echo%20foo%20%24i%3B%20sleep%200.1%3B%20done%22)%0Afor%20line%20in%20process.stdout%3A%0A%20%20%20%20print(line)`,lang:`python`});var Wt=o(Ut,2);c(Wt,{id:`filesystem`,children:(e,t)=>{s(),i(e,r(`filesystem`))},$$slots:{default:!0}});var Gt=o(Wt,2);u(Gt,{code:`filesystem%3A%20SandboxFilesystem`,lang:`python`});var Kt=o(Gt,4);l(Kt,{id:`filesystemcopy_from_local`,children:(e,t)=>{s(),i(e,r(`filesystem.copy_from_local`))},$$slots:{default:!0}});var qt=o(Kt,2);u(qt,{code:`copy_from_local(self%2C%20local_path%2C%20remote_path)`,lang:`python`});var Jt=o(qt,8);p(Jt,{name:`local_path`,type:`str | os.PathLike`,description:`Path to the file on the local machine.`});var Yt=o(Jt,2);p(Yt,{name:`remote_path`,type:`str`,description:`Absolute path to the file in the Sandbox.`});var Xt=o(Yt,8);u(Xt,{code:`import%20tempfile%0Afrom%20pathlib%20import%20Path%0A%0Alocal_path%20%3D%20Path(tempfile.mktemp())%0Alocal_path.write_text(%22Hello%2C%20world!%5Cn%22)%0Asandbox.filesystem.copy_from_local(local_path%2C%20%22%2Ftmp%2Fhello.txt%22)`,lang:`python`});var Zt=o(Xt,2);l(Zt,{id:`filesystemcopy_to_local`,children:(e,t)=>{s(),i(e,r(`filesystem.copy_to_local`))},$$slots:{default:!0}});var Qt=o(Zt,2);u(Qt,{code:`copy_to_local(self%2C%20remote_path%2C%20local_path)`,lang:`python`});var $t=o(Qt,12);u($t,{code:`sandbox.filesystem.write_text(%22Hello%2C%20world!%5Cn%22%2C%20%22%2Ftmp%2Fhello.txt%22)%0Asandbox.filesystem.copy_to_local(%22%2Ftmp%2Fhello.txt%22%2C%20%22%2Ftmp%2Flocal-hello.txt%22)`,lang:`python`});var en=o($t,2);l(en,{id:`filesystemlist_files`,children:(e,t)=>{s(),i(e,r(`filesystem.list_files`))},$$slots:{default:!0}});var tn=o(en,2);u(tn,{code:`list_files(self%2C%20remote_path)`,lang:`python`});var nn=o(tn,6);p(nn,{name:`remote_path`,type:`str`,description:`Absolute path to the directory in the Sandbox.`});var rn=o(nn,12);u(rn,{code:`entries%20%3D%20sandbox.filesystem.list_files(%22%2Ftmp%22)%0Afor%20entry%20in%20entries%3A%0A%20%20%20%20print(entry.name%2C%20entry.type%2C%20entry.size)`,lang:`python`});var an=o(rn,2);l(an,{id:`filesystemmake_directory`,children:(e,t)=>{s(),i(e,r(`filesystem.make_directory`))},$$slots:{default:!0}});var on=o(an,2);u(on,{code:`make_directory(self%2C%20remote_path%2C%20*%2C%20create_parents%3DTrue)`,lang:`python`});var sn=o(on,10);p(sn,{name:`remote_path`,type:`str`,description:`Absolute path of the directory to create in the Sandbox.`});var cn=o(sn,2);p(cn,{name:`create_parents`,type:`bool`,defaultValue:`True`,description:"When ``True``, create missing parents and succeed if the directory already exists."});var ln=o(cn,8);u(ln,{code:`sandbox.filesystem.make_directory(%22%2Ftmp%2Fa%2Fb%2Fc%22)`,lang:`python`});var un=o(ln,2);l(un,{id:`filesystemread_bytes`,children:(e,t)=>{s(),i(e,r(`filesystem.read_bytes`))},$$slots:{default:!0}});var dn=o(un,2);u(dn,{code:`read_bytes(self%2C%20remote_path)`,lang:`python`});var fn=o(dn,8);p(fn,{name:`remote_path`,type:`str`,description:`Absolute path to the file in the Sandbox.`});var pn=o(fn,12);u(pn,{code:`sandbox.filesystem.write_bytes(b%22Hello%2C%20world!%5Cn%22%2C%20%22%2Ftmp%2Fhello.bin%22)%0Acontents%20%3D%20sandbox.filesystem.read_bytes(%22%2Ftmp%2Fhello.bin%22)%0Aprint(contents.decode(%22utf-8%22))`,lang:`python`});var mn=o(pn,2);l(mn,{id:`filesystemread_text`,children:(e,t)=>{s(),i(e,r(`filesystem.read_text`))},$$slots:{default:!0}});var hn=o(mn,2);u(hn,{code:`read_text(self%2C%20remote_path)`,lang:`python`});var gn=o(hn,8);p(gn,{name:`remote_path`,type:`str`,description:`Absolute path to the file in the Sandbox.`});var _n=o(gn,12);u(_n,{code:`sandbox.filesystem.write_text(%22Hello%2C%20world!%5Cn%22%2C%20%22%2Ftmp%2Fhello.txt%22)%0Acontents%20%3D%20sandbox.filesystem.read_text(%22%2Ftmp%2Fhello.txt%22)%0Aprint(contents)`,lang:`python`});var vn=o(_n,2);l(vn,{id:`filesystemremove`,children:(e,t)=>{s(),i(e,r(`filesystem.remove`))},$$slots:{default:!0}});var yn=o(vn,2);u(yn,{code:`remove(self%2C%20remote_path%2C%20*%2C%20recursive%3DFalse)`,lang:`python`});var bn=o(yn,10);p(bn,{name:`remote_path`,type:`str`,description:`Absolute path to the file in the Sandbox.`});var xn=o(bn,2);p(xn,{name:`recursive`,type:`bool`,defaultValue:`False`,description:"When ``True``, remove the directory and all its contents."});var Sn=o(xn,10);u(Sn,{code:`sandbox.filesystem.write_bytes(b%22Hello%2C%20world!%5Cn%22%2C%20%22%2Ftmp%2Fhello.bin%22)%0Asandbox.filesystem.remove(%22%2Ftmp%2Fhello.bin%22)`,lang:`python`});var Cn=o(Sn,4);u(Cn,{code:`sandbox.filesystem.make_directory(%22%2Ftmp%2Fmydir%2Fsubdir%22)%0Asandbox.filesystem.remove(%22%2Ftmp%2Fmydir%22%2C%20recursive%3DTrue)`,lang:`python`});var wn=o(Cn,2);l(wn,{id:`filesystemstat`,children:(e,t)=>{s(),i(e,r(`filesystem.stat`))},$$slots:{default:!0}});var Tn=o(wn,2);u(Tn,{code:`stat(self%2C%20remote_path)`,lang:`python`});var En=o(Tn,12);u(En,{code:`sandbox.filesystem.write_text(%22Hello%2C%20world!%5Cn%22%2C%20%22%2Ftmp%2Fhello.txt%22)%0Ainfo%20%3D%20sandbox.filesystem.stat(%22%2Ftmp%2Fhello.txt%22)%0Aprint(info.size%2C%20info.permissions%2C%20info.modified_time)`,lang:`python`});var Dn=o(En,2);l(Dn,{id:`filesystemwatch`,children:(e,t)=>{s(),i(e,r(`filesystem.watch`))},$$slots:{default:!0}});var On=o(Dn,2);u(On,{code:`watch(self%2C%20remote_path%2C%20*%2C%20filter%3DNone%2C%20recursive%3DFalse%2C%20timeout%3DNone)`,lang:`python`});var kn=o(On,18);u(kn,{code:`for%20event%20in%20sandbox.filesystem.watch(%0A%20%20%20%20%22%2Ftmp%2Ffoo%22%2C%0A%20%20%20%20recursive%3DTrue%2C%0A%20%20%20%20filter%3D%5BFileWatchEventType.Create%5D%2C%0A%20%20%20%20timeout%3D60%2C%0A)%3A%0A%20%20%20%20if%20any(p.endswith(%22.done%22)%20for%20p%20in%20event.paths)%3A%0A%20%20%20%20%20%20%20%20break`,lang:`python`});var An=o(kn,2);l(An,{id:`filesystemwrite_bytes`,children:(e,t)=>{s(),i(e,r(`filesystem.write_bytes`))},$$slots:{default:!0}});var jn=o(An,2);u(jn,{code:`write_bytes(self%2C%20data%2C%20remote_path)`,lang:`python`});var Mn=o(jn,8);p(Mn,{name:`data`,type:`bytes | bytearray | memoryview`,description:`Bytes to write.`});var Nn=o(Mn,2);p(Nn,{name:`remote_path`,type:`str`,description:`Absolute path to the file in the Sandbox.`});var Pn=o(Nn,8);u(Pn,{code:`sandbox.filesystem.write_bytes(b%22Hello%2C%20world!%5Cn%22%2C%20%22%2Ftmp%2Fhello.bin%22)`,lang:`python`});var Fn=o(Pn,2);l(Fn,{id:`filesystemwrite_text`,children:(e,t)=>{s(),i(e,r(`filesystem.write_text`))},$$slots:{default:!0}});var In=o(Fn,2);u(In,{code:`write_text(self%2C%20data%2C%20remote_path)`,lang:`python`});var Ln=o(In,8);p(Ln,{name:`data`,type:`str`,description:`Text to write (encoded as UTF-8).`});var Rn=o(Ln,2);p(Rn,{name:`remote_path`,type:`str`,description:`Absolute path to the file in the Sandbox.`});var zn=o(Rn,8);u(zn,{code:`sandbox.filesystem.write_text(%22Hello%2C%20world!%5Cn%22%2C%20%22%2Ftmp%2Fhello.txt%22)`,lang:`python`});var Bn=o(zn,2);c(Bn,{id:`open`,children:(e,t)=>{s(),i(e,r(`open`))},$$slots:{default:!0}});var Vn=o(Bn,2);u(Vn,{code:`open(self%2C%20path%2C%20mode%3D%22r%22)`,lang:`python`});var q=o(Vn,6);f(o(e(q)),{href:`https://modal.com/docs/sdk/py/latest/file_io#fileio`,rel:`nofollow`,children:(e,t)=>{i(e,oe())},$$slots:{default:!0}}),s(),n(q);var Hn=o(q,4);p(Hn,{name:`path`,type:`str`,description:`Absolute path of the file inside the sandbox.`});var Un=o(Hn,2);p(Un,{name:`mode`,type:`Union[_typeshed.OpenTextMode, _typeshed.OpenBinaryMode]`,defaultValue:`"r"`,description:"File open mode (text or binary), following built-in ``open`` conventions."});var Wn=o(Un,8);u(Wn,{code:`sb%20%3D%20modal.Sandbox.create(app%3Dsb_app)%0Af%20%3D%20sb.open(%22%2Ftest.txt%22%2C%20%22w%22)%0Af.write(%22hello%22)%0Af.close()`,lang:`python`});var Gn=o(Wn,2);c(Gn,{id:`ls`,children:(e,t)=>{s(),i(e,r(`ls`))},$$slots:{default:!0}});var Kn=o(Gn,2);u(Kn,{code:`ls(self%2C%20path)`,lang:`python`});var qn=o(Kn,8);p(qn,{name:`path`,type:`str`,description:`Absolute directory path inside the sandbox.`});var Jn=o(qn,6);c(Jn,{id:`mkdir`,children:(e,t)=>{s(),i(e,r(`mkdir`))},$$slots:{default:!0}});var Yn=o(Jn,2);u(Yn,{code:`mkdir(self%2C%20path%2C%20parents%3DFalse)`,lang:`python`});var Xn=o(Yn,6);c(Xn,{id:`rm`,children:(e,t)=>{s(),i(e,r(`rm`))},$$slots:{default:!0}});var Zn=o(Xn,2);u(Zn,{code:`rm(self%2C%20path%2C%20recursive%3DFalse)`,lang:`python`});var Qn=o(Zn,6);c(Qn,{id:`watch`,children:(e,t)=>{s(),i(e,r(`watch`))},$$slots:{default:!0}});var $n=o(Qn,2);u($n,{code:`watch(self%2C%20path%2C%20filter%3DNone%2C%20recursive%3DNone%2C%20timeout%3DNone)`,lang:`python`});var er=o($n,8);p(er,{name:`path`,type:`str`,description:`Absolute path to watch.`});var tr=o(er,2);p(tr,{name:`filter`,type:`builtins.list[FileWatchEventType] | None`,defaultValue:`None`,description:`Optional list of event types to include.`});var nr=o(tr,2);p(nr,{name:`recursive`,type:`bool | None`,defaultValue:`None`,description:`Whether to watch subdirectories; None uses server defaults.`});var rr=o(nr,2);p(rr,{name:`timeout`,type:`int | None`,defaultValue:`None`,description:`Optional timeout for the watch stream.`});var ir=o(rr,6);c(ir,{id:`stdout`,children:(e,t)=>{s(),i(e,r(`stdout`))},$$slots:{default:!0}});var ar=o(ir,2);u(ar,{code:`stdout(self)`,lang:`python`});var J=o(ar,2);f(e(J),{href:`https://modal.com/docs/sdk/py/latest/io_streams#streamreader`,rel:`nofollow`,children:(e,t)=>{i(e,se())},$$slots:{default:!0}}),s(),n(J);var or=o(J,6);c(or,{id:`stderr`,children:(e,t)=>{s(),i(e,r(`stderr`))},$$slots:{default:!0}});var sr=o(or,2);u(sr,{code:`stderr(self)`,lang:`python`});var Y=o(sr,2);f(e(Y),{href:`https://modal.com/docs/sdk/py/latest/io_streams#streamreader`,rel:`nofollow`,children:(e,t)=>{i(e,ce())},$$slots:{default:!0}}),s(),n(Y);var cr=o(Y,6);c(cr,{id:`stdin`,children:(e,t)=>{s(),i(e,r(`stdin`))},$$slots:{default:!0}});var lr=o(cr,2);u(lr,{code:`stdin(self)`,lang:`python`});var X=o(lr,2);f(e(X),{href:`https://modal.com/docs/sdk/py/latest/io_streams#streamwriter`,rel:`nofollow`,children:(e,t)=>{i(e,le())},$$slots:{default:!0}}),s(),n(X);var ur=o(X,6);c(ur,{id:`returncode`,children:(e,t)=>{s(),i(e,r(`returncode`))},$$slots:{default:!0}});var dr=o(ur,2);u(dr,{code:`returncode(self)`,lang:`python`});var fr=o(dr,8);c(fr,{id:`list`,children:(e,t)=>{s(),i(e,r(`list`))},$$slots:{default:!0}});var pr=o(fr,2);u(pr,{code:`list(*%2C%20app_id%3DNone%2C%20tags%3DNone%2C%20client%3DNone)`,lang:`python`});var mr=o(pr,6);p(mr,{name:`app_id`,type:`str | None`,defaultValue:`None`,description:`If set, restrict results to sandboxes under this app ID.`});var hr=o(mr,2);p(hr,{name:`tags`,type:`dict[str, str] | None`,defaultValue:`None`,description:`If set, only sandboxes containing at least these tags are returned.`});var gr=o(hr,2);p(gr,{name:`client`,type:`_Client | None`,defaultValue:`None`,description:"Modal client to use for listing; defaults to `Client.from_env()` when omitted."});var _r=o(gr,6);c(_r,{id:`logs`,children:(e,t)=>{s(),i(e,r(`logs`))},$$slots:{default:!0}});var vr=o(_r,2);u(vr,{code:`logs%3A%20SandboxLogsManager`,lang:`python`});var Z=o(vr,4),yr=o(e(Z));f(yr,{href:`#logsfetch`,children:(e,t)=>{i(e,ue())},$$slots:{default:!0}}),f(o(yr,2),{href:`#logstail`,children:(e,t)=>{i(e,de())},$$slots:{default:!0}}),s(),n(Z);var Q=o(Z,6),br=e(Q);f(e(br),{href:`https://modal.com/docs/cli/latest/app#modal-app-logs`,rel:`nofollow`,children:(e,t)=>{i(e,fe())},$$slots:{default:!0}}),s(),n(br),n(Q);var xr=o(Q,2);l(xr,{id:`logsfetch`,children:(e,t)=>{s(),i(e,r(`logs.fetch`))},$$slots:{default:!0}});var Sr=o(xr,2);u(Sr,{code:`fetch(self%2C%20*%2C%20since%2C%20until%3DNone%2C%20source%3DNone%2C%20search_text%3D%22%22)`,lang:`python`});var Cr=o(Sr,6);p(Cr,{name:`since`,type:`datetime`,description:`Start date to fetch logs from. Must be in UTC or timezone-naive, which is interpreted as local time.`});var wr=o(Cr,2);p(wr,{name:`until`,type:`datetime | None`,defaultValue:`None`,description:`Defaults to current date if None. Must be in UTC or timezone-naive, which is interpreted as local time.`});var Tr=o(wr,2);p(Tr,{name:`source`,type:`LogSource | None`,defaultValue:`None`,description:`Filter by source: 'stdout', 'stderr', or 'system'.`});var Er=o(Tr,2);p(Er,{name:`search_text`,type:`str`,defaultValue:`""`,description:`Filter by search text.`});var Dr=o(Er,8);u(Dr,{code:`sandbox%20%3D%20modal.Sandbox.from_name(%22my-app%22%2C%20%22sandbox%22)%0A%0Afor%20entry%20in%20sandbox.logs.fetch(%0A%20%20%20%20since%3Ddatetime.now()%20-%20timedelta(minutes%3D25)%2C%0A%20%20%20%20source%3D%22stdout%22%2C%0A)%3A%0A%20%20%20%20print(entry.message%2C%20end%3D%22%22)`,lang:`python`});var Or=o(Dr,2);l(Or,{id:`logstail`,children:(e,t)=>{s(),i(e,r(`logs.tail`))},$$slots:{default:!0}});var kr=o(Or,2);u(kr,{code:`tail(self%2C%20entries%3D100%2C%20*%2C%20source%3DNone)`,lang:`python`});var $=o(kr,6);p($,{name:`entries`,type:`int`,defaultValue:`100`,description:`The number of log entries to return.`}),p(o($,2),{name:`source`,type:`LogSource | None`,defaultValue:`None`,description:`Filter by source: 'stdout', 'stderr', or 'system'.`}),s(4),i(t,a)},$$slots:{default:!0}}))}export{_ as default,m as metadata};
//# sourceMappingURL=DZD3H-Wp.js.map
