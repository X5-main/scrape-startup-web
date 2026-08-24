(function(){try{var e=typeof window<`u`?window:typeof global<`u`?global:typeof globalThis<`u`?globalThis:typeof self<`u`?self:{};e.SENTRY_RELEASE={id:`f99fcf9f0a844cc9bd13fdc8e5782b84`};var t=new e.Error().stack;t&&(e._sentryDebugIds=e._sentryDebugIds||{},e._sentryDebugIds[t]=`50077412-a2a0-43d5-83a4-0a52fc00b340`,e._sentryDebugIdIdentifier=`sentry-dbid-50077412-a2a0-43d5-83a4-0a52fc00b340`)}catch{}})();import{$t as e,St as t,Tn as ee,Tt as n,bt as r,c as te,d as i,en as ne,tn as a,wn as o}from"./F_ixKBiO.js";import"./B1sc9Zdx.js";import"./Bb2deiU3.js";import{a as s,i as c,o as re}from"./CPby7b1n.js";import{t as l}from"./BILrvr3I.js";import{t as u}from"./B4L_if842.js";import{t as ie}from"./DeWGVqas2.js";import{t as d}from"./B6UiYoTw.js";var f={toc:[{depth:1,value:`Volume`,id:`volume`,children:[{depth:2,value:`hydrate`,id:`hydrate`},{depth:2,value:`objects`,id:`objects`,children:[{depth:3,value:`objects.create`,id:`objectscreate`},{depth:3,value:`objects.list`,id:`objectslist`},{depth:3,value:`objects.delete`,id:`objectsdelete`}]},{depth:2,value:`name`,id:`name`},{depth:2,value:`with_mount_options`,id:`with_mount_options`},{depth:2,value:`from_name`,id:`from_name`},{depth:2,value:`from_id`,id:`from_id`},{depth:2,value:`ephemeral`,id:`ephemeral`},{depth:2,value:`info`,id:`info`},{depth:2,value:`commit`,id:`commit`},{depth:2,value:`reload`,id:`reload`},{depth:2,value:`iterdir`,id:`iterdir`},{depth:2,value:`listdir`,id:`listdir`},{depth:2,value:`read_file`,id:`read_file`},{depth:2,value:`remove_file`,id:`remove_file`},{depth:2,value:`copy_files`,id:`copy_files`},{depth:2,value:`batch_upload`,id:`batch_upload`},{depth:2,value:`rename`,id:`rename`}]}],rawContent:`# Volume


\`\`\`python
class Volume(modal.object.Object)
\`\`\`

A writeable volume that can be used to share files between one or more Modal functions.

The contents of a volume is exposed as a filesystem. You can use it to share data between different functions, or
to persist durable state across several instances of the same function.

Unlike a networked filesystem, you need to explicitly reload the volume to see changes made since it was mounted.
Similarly, you need to explicitly commit any changes you make to the volume for the changes to become visible
outside the current container.

Concurrent modification is supported, but concurrent modifications of the same files should be avoided! Last write
wins in case of concurrent modification of the same file - any data the last writer didn't have when committing
changes will be lost!

As a result, volumes are typically not a good fit for use cases where you need to make concurrent modifications to
the same file (nor is distributed file locking supported).

Volumes can only be reloaded if there are no open files for the volume - attempting to reload with open files
will result in an error.

**Usage**

\`\`\`python
import modal

app = modal.App()
volume = modal.Volume.from_name("my-persisted-volume", create_if_missing=True)

@app.function(volumes={"/root/foo": volume})
def f():
    with open("/root/foo/bar.txt", "w") as f:
        f.write("hello")
    volume.commit()  # Persist changes

@app.function(volumes={"/root/foo": volume})
def g():
    volume.reload()  # Fetch latest changes
    with open("/root/foo/bar.txt", "r") as f:
        print(f.read())
\`\`\`


## hydrate

\`\`\`python
hydrate(self, client=None)
\`\`\`
Synchronize the local object with its identity on the Modal server.

It is rarely necessary to call this method explicitly, as most operations
will lazily hydrate when needed. The main use case is when you need to
access object metadata, such as its ID.

*Added in v0.72.39*: This method replaces the deprecated \`.resolve()\` method.

## objects


\`\`\`python
objects: VolumeManager
\`\`\`

Namespace with methods for managing named Volume objects.


### objects.create

\`\`\`python
create(self, name, *, version=None, allow_existing=False, environment_name=None,
    client=None, experimental_options=None)
\`\`\`
Create a new named Volume in the workspace environment.

This does not return a local handle; use \`modal.Volume.from_name\` to look up the Volume after creation.

Added in v1.1.2.

**Parameters**

<Parameter name="name" type="str" description="Name for the new Volume." />
<Parameter name="version" type="int | None" defaultValue="None" description="Optional VolumeFS backend version (1 or 2); experimental." />
<Parameter name="allow_existing" type="bool" defaultValue="False" description="If True, do nothing when a Volume with this name already exists." />
<Parameter name="environment_name" type="str | None" defaultValue="None" description="Environment to create in; defaults to the active environment." />
<Parameter name="client" type="_Client | None" defaultValue="None" description="Modal client to use; defaults to \`Client.from_env()\` when omitted." />
<Parameter name="experimental_options" type="dict[str, Any] | None" defaultValue="None" description="Experimental options to create Volume with." />

**Usage**

\`\`\`python notest
modal.Volume.objects.create("my-volume")
\`\`\`

Volumes will be created in the active environment, or another one can be specified:

\`\`\`python notest
modal.Volume.objects.create("my-volume", environment_name="dev")
\`\`\`

By default, an error is raised if the Volume already exists; \`allow_existing=True\` makes that case a no-op:

\`\`\`python notest
modal.Volume.objects.create("my-volume", allow_existing=True)
\`\`\`

Note that this method does not return a local instance of the Volume. You can use
\`modal.Volume.from_name\` to perform a lookup after creation.

### objects.list

\`\`\`python
list(self, *, max_objects=None, created_before=None, environment_name="",
    client=None)
\`\`\`
List named Volumes in the workspace environment as hydrated handles.

Results are ordered newest to oldest. By default, all matching Volumes are returned.

Added in v1.1.2.

**Parameters**

<Parameter name="max_objects" type="int | None" defaultValue="None" description="Maximum number of Volumes to return." />
<Parameter name="created_before" type="datetime | str | None" defaultValue="None" description="Only include Volumes created before this time (datetime or ISO date string)." />
<Parameter name="environment_name" type="str" defaultValue="&quot;&quot;" description="Environment to list from; defaults to the active environment." />
<Parameter name="client" type="_Client | None" defaultValue="None" description="Modal client to use; defaults to \`Client.from_env()\` when omitted." />

**Returns**

Hydrated \`Volume\` objects for each named Volume in the listing.

**Usage**

\`\`\`python
volumes = modal.Volume.objects.list()
print([v.name for v in volumes])
\`\`\`

Volumes will be retrieved from the active environment, or another one can be specified:

\`\`\`python notest
dev_volumes = modal.Volume.objects.list(environment_name="dev")
\`\`\`

By default, all named Volumes are returned, newest to oldest. It's also possible to limit the
number of results and to filter by creation date:

\`\`\`python
volumes = modal.Volume.objects.list(max_objects=10, created_before="2025-01-01")
\`\`\`

### objects.delete

\`\`\`python
delete(self, name, *, allow_missing=False, environment_name=None, client=None)
\`\`\`
Delete a named Volume entirely (not individual files).

Deletion is irreversible and affects any Apps using this Volume.

Added in v1.1.2.

**Parameters**

<Parameter name="name" type="str" description="Name of the Volume to delete." />
<Parameter name="allow_missing" type="bool" defaultValue="False" description="If True, do nothing when the Volume does not exist." />
<Parameter name="environment_name" type="str | None" defaultValue="None" description="Environment to delete from; defaults to the active environment." />
<Parameter name="client" type="_Client | None" defaultValue="None" description="Modal client to use; defaults to \`Client.from_env()\` when omitted." />

**Usage**

\`\`\`python notest
await modal.Volume.objects.delete("my-volume")
\`\`\`

Volumes will be deleted from the active environment, or another one can be specified:

\`\`\`python notest
await modal.Volume.objects.delete("my-volume", environment_name="dev")
\`\`\`

## name

\`\`\`python
name(self)
\`\`\`


## with_mount_options

\`\`\`python
with_mount_options(self, *, read_only=None, sub_path=None)
\`\`\`
Configure options used when mounting this Volume.

Note that these options are not properties stored with the Volume itself - they can be individually configured
for each Volume - container association.

**Parameters**

<Parameter name="read_only" type="bool | None" defaultValue="None" description="Set this to True to make the Volume read only from within containers." />
<Parameter name="sub_path" type="str | PurePosixPath | None" defaultValue="None" description="Only mount this sub_path directory from the Volume. If the directory doesn&#x27;t exist in the Volume, it will be created when the container starts up." />

**Returns**

A \`Volume\` handle with the mount options applied.

**Usage**

To mount a volume in read-only mode:

\`\`\`python
import modal

volume = modal.Volume.from_name("my-volume")

@app.function(volumes={"/mnt": volume.with_mount_options(read_only=True)})
def f():
    return os.mkdir("/mnt/foo")  # not possible!
\`\`\`

To mount only part of a Volume using sub_path:

\`\`\`python
import modal

volume = modal.Volume.from_name("my-volume")

@app.function(volumes={"/user_data": volume.with_mount_options(sub_path="/users/my_user")})
def f():
    return os.listdir("/user_data")  # lists data from /users/my_user
\`\`\`

## from_name

\`\`\`python
from_name(name, *, environment_name=None, create_if_missing=False, version=None,
    create_options=None, client=None)
\`\`\`
Reference a Volume by name, optionally creating it on the server first.

Hydration is lazy: metadata is fetched from Modal the first time the handle is used.

**Parameters**

<Parameter name="name" type="str" description="Deployment name of the Volume." />
<Parameter name="environment_name" type="str | None" defaultValue="None" description="Environment to resolve the name in; defaults to the active environment." />
<Parameter name="create_if_missing" type="bool" defaultValue="False" description="If True, create the Volume when it does not already exist." />
<Parameter name="version" type="&quot;modal_proto.api_pb2.VolumeFsVersion.ValueType | None&quot;" defaultValue="None" description="Optional VolumeFS backend version; must match an existing Volume when set." />
<Parameter name="create_options" type="&quot;VolumeCreateOptions | None&quot;" defaultValue="None" description="Applied when creating the Volume. If an existing Volume, validates options are consistent." />
<Parameter name="client" type="_Client | None" defaultValue="None" description="Modal client to use for loading; defaults to \`Client.from_env()\` when omitted." />

**Returns**

A \`Volume\` handle (possibly not yet hydrated).

**Usage**

\`\`\`python
vol = modal.Volume.from_name("my-volume", create_if_missing=True)

app = modal.App()

@app.function(volumes={"/data": vol})
def f():
    pass
\`\`\`

## from_id

\`\`\`python
from_id(volume_id, client=None)
\`\`\`
Construct a Volume from an id and look up the Volume metadata.

This is a lazy method that defers hydrating the local
object with metadata from Modal servers until the first
time it is actually used.

The ID of a Volume object can be accessed using \`.object_id\`.

**Parameters**

<Parameter name="volume_id" type="str" description="Volume object ID to attach to." />
<Parameter name="client" type="_Client | None" defaultValue="None" description="Modal client to use for loading; defaults to \`Client.from_env()\` when omitted." />

**Returns**

A \`Volume\` handle (possibly not yet hydrated).

**Usage**

\`\`\`python notest
@app.function()
def my_worker(volume_id: str):
    vol = modal.Volume.from_id(volume_id)
    for entry in vol.listdir("/"):
        print(entry.path)

with modal.Volume.ephemeral() as vol:
    my_worker.remote(vol.object_id)
\`\`\`

## ephemeral

\`\`\`python
ephemeral(cls, client=None, environment_name=None, version=None,
    create_options=None)
\`\`\`
Create an anonymous Volume that exists for the duration of the context manager.

**Parameters**

<Parameter name="client" type="_Client | None" defaultValue="None" description="Modal client to use; defaults to \`Client.from_env()\` when omitted." />
<Parameter name="environment_name" type="str | None" defaultValue="None" description="Environment for the ephemeral Volume; defaults to the active environment." />
<Parameter name="version" type="&quot;modal_proto.api_pb2.VolumeFsVersion.ValueType | None&quot;" defaultValue="None" description="Optional VolumeFS backend version for the ephemeral Volume." />
<Parameter name="create_options" type="&quot;VolumeCreateOptions | None&quot;" defaultValue="None" description="Options applied when creating the ephemeral Volume." />

**Usage**

\`\`\`python
import modal

with modal.Volume.ephemeral() as vol:
    assert vol.listdir("/") == []
\`\`\`

\`\`\`python notest
async with modal.Volume.ephemeral() as vol:
    assert await vol.listdir("/") == []
\`\`\`

## info

\`\`\`python
info(self)
\`\`\`
Return information about the Volume object.

## commit

\`\`\`python
commit(self)
\`\`\`
Commit changes to a mounted volume.

If successful, the changes made are now persisted in durable storage and available to other containers accessing
the volume.

## reload

\`\`\`python
reload(self)
\`\`\`
Make latest committed state of volume available in the running container.

Any uncommitted changes to the volume, such as new or modified files, may implicitly be committed when
reloading.

Reloading will fail if there are open files for the volume.

## iterdir

\`\`\`python
iterdir(self, path, *, recursive=True)
\`\`\`
Iterate over all files in a directory in the volume.

Passing a directory path lists all files in the directory. For a file path, return only that
file's description. If \`recursive\` is set to True, list all files and folders under the path
recursively.

## listdir

\`\`\`python
listdir(self, path, *, recursive=False)
\`\`\`
List all files under a path prefix in the modal.Volume.

Passing a directory path lists all files in the directory. For a file path, return only that
file's description. If \`recursive\` is set to True, list all files and folders under the path
recursively.

## read_file

\`\`\`python
read_file(self, path)
\`\`\`
Read a file from the modal.Volume.

Note - this function is primarily intended to be used outside of a Modal App.
For more information on downloading files from a Modal Volume, see
[the guide](https://modal.com/docs/guide/volumes).

**Parameters**

<Parameter name="path" type="str" description="Path to the file inside the Volume." />

**Usage**

\`\`\`python notest
vol = modal.Volume.from_name("my-modal-volume")
data = b""
for chunk in vol.read_file("1mb.csv"):
    data += chunk
print(len(data))  # == 1024 * 1024
\`\`\`

## remove_file

\`\`\`python
remove_file(self, path, recursive=False)
\`\`\`
Remove a file or directory from a volume.

## copy_files

\`\`\`python
copy_files(self, src_paths, dst_path, recursive=False)
\`\`\`
Copy files within the volume from src_paths to dst_path.
The semantics of the copy operation follow those of the UNIX cp command.

The \`src_paths\` parameter is a list. If you want to copy a single file, you should pass a list with a
single element.

\`src_paths\` and \`dst_path\` should refer to the desired location *inside* the volume. You do not need to prepend
the volume mount path.

Note that if the volume is already mounted on the Modal function, you should use normal filesystem operations
like \`os.rename()\` and then \`commit()\` the volume. The \`copy_files()\` method is useful when you don't have
the volume mounted as a filesystem, e.g. when running a script on your local computer.

**Parameters**

<Parameter name="src_paths" type="Sequence[str]" description="Source paths inside the Volume (list of one or more paths)." />
<Parameter name="dst_path" type="str" description="Destination path inside the Volume (file or directory, following \`\`cp\`\` semantics)." />
<Parameter name="recursive" type="bool" defaultValue="False" description="Whether to copy directories recursively (V2 volumes only)." />

**Usage**

\`\`\`python notest
vol = modal.Volume.from_name("my-modal-volume")

vol.copy_files(["bar/example.txt"], "bar2")
vol.copy_files(["bar/example.txt"], "bar/example2.txt")
\`\`\`

## batch_upload

\`\`\`python
batch_upload(self, force=False)
\`\`\`
Initiate a batched upload to a volume.

To allow overwriting existing files, set \`force\` to \`True\` (you cannot overwrite existing directories with
uploaded files regardless).

**Parameters**

<Parameter name="force" type="bool" defaultValue="False" description="If True, allow overwriting existing files with uploads (not directories)." />

**Usage**

\`\`\`python notest
vol = modal.Volume.from_name("my-modal-volume")

with vol.batch_upload() as batch:
    batch.put_file("local-path.txt", "/remote-path.txt")
    batch.put_directory("/local/directory/", "/remote/directory")
    batch.put_file(io.BytesIO(b"some data"), "/foobar")
\`\`\`

## rename

\`\`\`python
rename(old_name, new_name, *, client=None, environment_name=None)
\`\`\`
`,meta:{title:`Volume`,description:`A writeable volume that can be used to share files between one or more Modal functions.`}},{toc:p,rawContent:m,meta:h}=f,ae=t(`<!> <!> <p>A writeable volume that can be used to share files between one or more Modal functions.</p> <p>The contents of a volume is exposed as a filesystem. You can use it to share data between different functions, or
to persist durable state across several instances of the same function.</p> <p>Unlike a networked filesystem, you need to explicitly reload the volume to see changes made since it was mounted.
Similarly, you need to explicitly commit any changes you make to the volume for the changes to become visible
outside the current container.</p> <p>Concurrent modification is supported, but concurrent modifications of the same files should be avoided! Last write
wins in case of concurrent modification of the same file - any data the last writer didn’t have when committing
changes will be lost!</p> <p>As a result, volumes are typically not a good fit for use cases where you need to make concurrent modifications to
the same file (nor is distributed file locking supported).</p> <p>Volumes can only be reloaded if there are no open files for the volume - attempting to reload with open files
will result in an error.</p> <p><strong>Usage</strong></p> <!> <!> <!> <p>Synchronize the local object with its identity on the Modal server.</p> <p>It is rarely necessary to call this method explicitly, as most operations
will lazily hydrate when needed. The main use case is when you need to
access object metadata, such as its ID.</p> <p><em>Added in v0.72.39</em>: This method replaces the deprecated <code>.resolve()</code> method.</p> <!> <!> <p>Namespace with methods for managing named Volume objects.</p> <!> <!> <p>Create a new named Volume in the workspace environment.</p> <p>This does not return a local handle; use <code>modal.Volume.from_name</code> to look up the Volume after creation.</p> <p>Added in v1.1.2.</p> <p><strong>Parameters</strong></p> <!> <!> <!> <!> <!> <!> <p><strong>Usage</strong></p> <!> <p>Volumes will be created in the active environment, or another one can be specified:</p> <!> <p>By default, an error is raised if the Volume already exists; <code>allow_existing=True</code> makes that case a no-op:</p> <!> <p>Note that this method does not return a local instance of the Volume. You can use <code>modal.Volume.from_name</code> to perform a lookup after creation.</p> <!> <!> <p>List named Volumes in the workspace environment as hydrated handles.</p> <p>Results are ordered newest to oldest. By default, all matching Volumes are returned.</p> <p>Added in v1.1.2.</p> <p><strong>Parameters</strong></p> <!> <!> <!> <!> <p><strong>Returns</strong></p> <p>Hydrated <code>Volume</code> objects for each named Volume in the listing.</p> <p><strong>Usage</strong></p> <!> <p>Volumes will be retrieved from the active environment, or another one can be specified:</p> <!> <p>By default, all named Volumes are returned, newest to oldest. It’s also possible to limit the
number of results and to filter by creation date:</p> <!> <!> <!> <p>Delete a named Volume entirely (not individual files).</p> <p>Deletion is irreversible and affects any Apps using this Volume.</p> <p>Added in v1.1.2.</p> <p><strong>Parameters</strong></p> <!> <!> <!> <!> <p><strong>Usage</strong></p> <!> <p>Volumes will be deleted from the active environment, or another one can be specified:</p> <!> <!> <!> <!> <!> <p>Configure options used when mounting this Volume.</p> <p>Note that these options are not properties stored with the Volume itself - they can be individually configured
for each Volume - container association.</p> <p><strong>Parameters</strong></p> <!> <!> <p><strong>Returns</strong></p> <p>A <code>Volume</code> handle with the mount options applied.</p> <p><strong>Usage</strong></p> <p>To mount a volume in read-only mode:</p> <!> <p>To mount only part of a Volume using sub_path:</p> <!> <!> <!> <p>Reference a Volume by name, optionally creating it on the server first.</p> <p>Hydration is lazy: metadata is fetched from Modal the first time the handle is used.</p> <p><strong>Parameters</strong></p> <!> <!> <!> <!> <!> <!> <p><strong>Returns</strong></p> <p>A <code>Volume</code> handle (possibly not yet hydrated).</p> <p><strong>Usage</strong></p> <!> <!> <!> <p>Construct a Volume from an id and look up the Volume metadata.</p> <p>This is a lazy method that defers hydrating the local
object with metadata from Modal servers until the first
time it is actually used.</p> <p>The ID of a Volume object can be accessed using <code>.object_id</code>.</p> <p><strong>Parameters</strong></p> <!> <!> <p><strong>Returns</strong></p> <p>A <code>Volume</code> handle (possibly not yet hydrated).</p> <p><strong>Usage</strong></p> <!> <!> <!> <p>Create an anonymous Volume that exists for the duration of the context manager.</p> <p><strong>Parameters</strong></p> <!> <!> <!> <!> <p><strong>Usage</strong></p> <!> <!> <!> <!> <p>Return information about the Volume object.</p> <!> <!> <p>Commit changes to a mounted volume.</p> <p>If successful, the changes made are now persisted in durable storage and available to other containers accessing
the volume.</p> <!> <!> <p>Make latest committed state of volume available in the running container.</p> <p>Any uncommitted changes to the volume, such as new or modified files, may implicitly be committed when
reloading.</p> <p>Reloading will fail if there are open files for the volume.</p> <!> <!> <p>Iterate over all files in a directory in the volume.</p> <p>Passing a directory path lists all files in the directory. For a file path, return only that
file’s description. If <code>recursive</code> is set to True, list all files and folders under the path
recursively.</p> <!> <!> <p>List all files under a path prefix in the modal.Volume.</p> <p>Passing a directory path lists all files in the directory. For a file path, return only that
file’s description. If <code>recursive</code> is set to True, list all files and folders under the path
recursively.</p> <!> <!> <p>Read a file from the modal.Volume.</p> <p>Note - this function is primarily intended to be used outside of a Modal App.
For more information on downloading files from a Modal Volume, see <!>.</p> <p><strong>Parameters</strong></p> <!> <p><strong>Usage</strong></p> <!> <!> <!> <p>Remove a file or directory from a volume.</p> <!> <!> <p>Copy files within the volume from src_paths to dst_path.
The semantics of the copy operation follow those of the UNIX cp command.</p> <p>The <code>src_paths</code> parameter is a list. If you want to copy a single file, you should pass a list with a
single element.</p> <p><code>src_paths</code> and <code>dst_path</code> should refer to the desired location <em>inside</em> the volume. You do not need to prepend
the volume mount path.</p> <p>Note that if the volume is already mounted on the Modal function, you should use normal filesystem operations
like <code>os.rename()</code> and then <code>commit()</code> the volume. The <code>copy_files()</code> method is useful when you don’t have
the volume mounted as a filesystem, e.g. when running a script on your local computer.</p> <p><strong>Parameters</strong></p> <!> <!> <!> <p><strong>Usage</strong></p> <!> <!> <!> <p>Initiate a batched upload to a volume.</p> <p>To allow overwriting existing files, set <code>force</code> to <code>True</code> (you cannot overwrite existing directories with
uploaded files regardless).</p> <p><strong>Parameters</strong></p> <!> <p><strong>Usage</strong></p> <!> <!> <!>`,1);function g(t,p){let m=te(p,[`children`,`$$slots`,`$$events`,`$$legacy`]);u(t,i(()=>m,()=>f,{children:(t,te)=>{var i=ae(),u=ne(i);re(u,{id:`volume`,children:(e,t)=>{o(),r(e,n(`Volume`))},$$slots:{default:!0}});var f=a(u,2);l(f,{code:`class%20Volume(modal.object.Object)`,lang:`python`});var p=a(f,16);l(p,{code:`import%20modal%0A%0Aapp%20%3D%20modal.App()%0Avolume%20%3D%20modal.Volume.from_name(%22my-persisted-volume%22%2C%20create_if_missing%3DTrue)%0A%0A%40app.function(volumes%3D%7B%22%2Froot%2Ffoo%22%3A%20volume%7D)%0Adef%20f()%3A%0A%20%20%20%20with%20open(%22%2Froot%2Ffoo%2Fbar.txt%22%2C%20%22w%22)%20as%20f%3A%0A%20%20%20%20%20%20%20%20f.write(%22hello%22)%0A%20%20%20%20volume.commit()%20%20%23%20Persist%20changes%0A%0A%40app.function(volumes%3D%7B%22%2Froot%2Ffoo%22%3A%20volume%7D)%0Adef%20g()%3A%0A%20%20%20%20volume.reload()%20%20%23%20Fetch%20latest%20changes%0A%20%20%20%20with%20open(%22%2Froot%2Ffoo%2Fbar.txt%22%2C%20%22r%22)%20as%20f%3A%0A%20%20%20%20%20%20%20%20print(f.read())`,lang:`python`});var m=a(p,2);s(m,{id:`hydrate`,children:(e,t)=>{o(),r(e,n(`hydrate`))},$$slots:{default:!0}});var h=a(m,2);l(h,{code:`hydrate(self%2C%20client%3DNone)`,lang:`python`});var g=a(h,8);s(g,{id:`objects`,children:(e,t)=>{o(),r(e,n(`objects`))},$$slots:{default:!0}});var _=a(g,2);l(_,{code:`objects%3A%20VolumeManager`,lang:`python`});var v=a(_,4);c(v,{id:`objectscreate`,children:(e,t)=>{o(),r(e,n(`objects.create`))},$$slots:{default:!0}});var y=a(v,2);l(y,{code:`create(self%2C%20name%2C%20*%2C%20version%3DNone%2C%20allow_existing%3DFalse%2C%20environment_name%3DNone%2C%0A%20%20%20%20client%3DNone%2C%20experimental_options%3DNone)`,lang:`python`});var b=a(y,10);d(b,{name:`name`,type:`str`,description:`Name for the new Volume.`});var x=a(b,2);d(x,{name:`version`,type:`int | None`,defaultValue:`None`,description:`Optional VolumeFS backend version (1 or 2); experimental.`});var S=a(x,2);d(S,{name:`allow_existing`,type:`bool`,defaultValue:`False`,description:`If True, do nothing when a Volume with this name already exists.`});var C=a(S,2);d(C,{name:`environment_name`,type:`str | None`,defaultValue:`None`,description:`Environment to create in; defaults to the active environment.`});var w=a(C,2);d(w,{name:`client`,type:`_Client | None`,defaultValue:`None`,description:"Modal client to use; defaults to `Client.from_env()` when omitted."});var T=a(w,2);d(T,{name:`experimental_options`,type:`dict[str, Any] | None`,defaultValue:`None`,description:`Experimental options to create Volume with.`});var E=a(T,4);l(E,{code:`modal.Volume.objects.create(%22my-volume%22)`,lang:`python`});var D=a(E,4);l(D,{code:`modal.Volume.objects.create(%22my-volume%22%2C%20environment_name%3D%22dev%22)`,lang:`python`});var O=a(D,4);l(O,{code:`modal.Volume.objects.create(%22my-volume%22%2C%20allow_existing%3DTrue)`,lang:`python`});var k=a(O,4);c(k,{id:`objectslist`,children:(e,t)=>{o(),r(e,n(`objects.list`))},$$slots:{default:!0}});var A=a(k,2);l(A,{code:`list(self%2C%20*%2C%20max_objects%3DNone%2C%20created_before%3DNone%2C%20environment_name%3D%22%22%2C%0A%20%20%20%20client%3DNone)`,lang:`python`});var j=a(A,10);d(j,{name:`max_objects`,type:`int | None`,defaultValue:`None`,description:`Maximum number of Volumes to return.`});var M=a(j,2);d(M,{name:`created_before`,type:`datetime | str | None`,defaultValue:`None`,description:`Only include Volumes created before this time (datetime or ISO date string).`});var N=a(M,2);d(N,{name:`environment_name`,type:`str`,defaultValue:`""`,description:`Environment to list from; defaults to the active environment.`});var P=a(N,2);d(P,{name:`client`,type:`_Client | None`,defaultValue:`None`,description:"Modal client to use; defaults to `Client.from_env()` when omitted."});var F=a(P,8);l(F,{code:`volumes%20%3D%20modal.Volume.objects.list()%0Aprint(%5Bv.name%20for%20v%20in%20volumes%5D)`,lang:`python`});var I=a(F,4);l(I,{code:`dev_volumes%20%3D%20modal.Volume.objects.list(environment_name%3D%22dev%22)`,lang:`python`});var L=a(I,4);l(L,{code:`volumes%20%3D%20modal.Volume.objects.list(max_objects%3D10%2C%20created_before%3D%222025-01-01%22)`,lang:`python`});var R=a(L,2);c(R,{id:`objectsdelete`,children:(e,t)=>{o(),r(e,n(`objects.delete`))},$$slots:{default:!0}});var z=a(R,2);l(z,{code:`delete(self%2C%20name%2C%20*%2C%20allow_missing%3DFalse%2C%20environment_name%3DNone%2C%20client%3DNone)`,lang:`python`});var B=a(z,10);d(B,{name:`name`,type:`str`,description:`Name of the Volume to delete.`});var V=a(B,2);d(V,{name:`allow_missing`,type:`bool`,defaultValue:`False`,description:`If True, do nothing when the Volume does not exist.`});var H=a(V,2);d(H,{name:`environment_name`,type:`str | None`,defaultValue:`None`,description:`Environment to delete from; defaults to the active environment.`});var U=a(H,2);d(U,{name:`client`,type:`_Client | None`,defaultValue:`None`,description:"Modal client to use; defaults to `Client.from_env()` when omitted."});var W=a(U,4);l(W,{code:`await%20modal.Volume.objects.delete(%22my-volume%22)`,lang:`python`});var G=a(W,4);l(G,{code:`await%20modal.Volume.objects.delete(%22my-volume%22%2C%20environment_name%3D%22dev%22)`,lang:`python`});var K=a(G,2);s(K,{id:`name`,children:(e,t)=>{o(),r(e,n(`name`))},$$slots:{default:!0}});var q=a(K,2);l(q,{code:`name(self)`,lang:`python`});var J=a(q,2);s(J,{id:`with_mount_options`,children:(e,t)=>{o(),r(e,n(`with_mount_options`))},$$slots:{default:!0}});var Y=a(J,2);l(Y,{code:`with_mount_options(self%2C%20*%2C%20read_only%3DNone%2C%20sub_path%3DNone)`,lang:`python`});var X=a(Y,8);d(X,{name:`read_only`,type:`bool | None`,defaultValue:`None`,description:`Set this to True to make the Volume read only from within containers.`});var oe=a(X,2);d(oe,{name:`sub_path`,type:`str | PurePosixPath | None`,defaultValue:`None`,description:`Only mount this sub_path directory from the Volume. If the directory doesn't exist in the Volume, it will be created when the container starts up.`});var se=a(oe,10);l(se,{code:`import%20modal%0A%0Avolume%20%3D%20modal.Volume.from_name(%22my-volume%22)%0A%0A%40app.function(volumes%3D%7B%22%2Fmnt%22%3A%20volume.with_mount_options(read_only%3DTrue)%7D)%0Adef%20f()%3A%0A%20%20%20%20return%20os.mkdir(%22%2Fmnt%2Ffoo%22)%20%20%23%20not%20possible!`,lang:`python`});var ce=a(se,4);l(ce,{code:`import%20modal%0A%0Avolume%20%3D%20modal.Volume.from_name(%22my-volume%22)%0A%0A%40app.function(volumes%3D%7B%22%2Fuser_data%22%3A%20volume.with_mount_options(sub_path%3D%22%2Fusers%2Fmy_user%22)%7D)%0Adef%20f()%3A%0A%20%20%20%20return%20os.listdir(%22%2Fuser_data%22)%20%20%23%20lists%20data%20from%20%2Fusers%2Fmy_user`,lang:`python`});var le=a(ce,2);s(le,{id:`from_name`,children:(e,t)=>{o(),r(e,n(`from_name`))},$$slots:{default:!0}});var ue=a(le,2);l(ue,{code:`from_name(name%2C%20*%2C%20environment_name%3DNone%2C%20create_if_missing%3DFalse%2C%20version%3DNone%2C%0A%20%20%20%20create_options%3DNone%2C%20client%3DNone)`,lang:`python`});var de=a(ue,8);d(de,{name:`name`,type:`str`,description:`Deployment name of the Volume.`});var fe=a(de,2);d(fe,{name:`environment_name`,type:`str | None`,defaultValue:`None`,description:`Environment to resolve the name in; defaults to the active environment.`});var pe=a(fe,2);d(pe,{name:`create_if_missing`,type:`bool`,defaultValue:`False`,description:`If True, create the Volume when it does not already exist.`});var me=a(pe,2);d(me,{name:`version`,type:`"modal_proto.api_pb2.VolumeFsVersion.ValueType | None"`,defaultValue:`None`,description:`Optional VolumeFS backend version; must match an existing Volume when set.`});var he=a(me,2);d(he,{name:`create_options`,type:`"VolumeCreateOptions | None"`,defaultValue:`None`,description:`Applied when creating the Volume. If an existing Volume, validates options are consistent.`});var ge=a(he,2);d(ge,{name:`client`,type:`_Client | None`,defaultValue:`None`,description:"Modal client to use for loading; defaults to `Client.from_env()` when omitted."});var _e=a(ge,8);l(_e,{code:`vol%20%3D%20modal.Volume.from_name(%22my-volume%22%2C%20create_if_missing%3DTrue)%0A%0Aapp%20%3D%20modal.App()%0A%0A%40app.function(volumes%3D%7B%22%2Fdata%22%3A%20vol%7D)%0Adef%20f()%3A%0A%20%20%20%20pass`,lang:`python`});var ve=a(_e,2);s(ve,{id:`from_id`,children:(e,t)=>{o(),r(e,n(`from_id`))},$$slots:{default:!0}});var ye=a(ve,2);l(ye,{code:`from_id(volume_id%2C%20client%3DNone)`,lang:`python`});var be=a(ye,10);d(be,{name:`volume_id`,type:`str`,description:`Volume object ID to attach to.`});var xe=a(be,2);d(xe,{name:`client`,type:`_Client | None`,defaultValue:`None`,description:"Modal client to use for loading; defaults to `Client.from_env()` when omitted."});var Se=a(xe,8);l(Se,{code:`%40app.function()%0Adef%20my_worker(volume_id%3A%20str)%3A%0A%20%20%20%20vol%20%3D%20modal.Volume.from_id(volume_id)%0A%20%20%20%20for%20entry%20in%20vol.listdir(%22%2F%22)%3A%0A%20%20%20%20%20%20%20%20print(entry.path)%0A%0Awith%20modal.Volume.ephemeral()%20as%20vol%3A%0A%20%20%20%20my_worker.remote(vol.object_id)`,lang:`python`});var Ce=a(Se,2);s(Ce,{id:`ephemeral`,children:(e,t)=>{o(),r(e,n(`ephemeral`))},$$slots:{default:!0}});var we=a(Ce,2);l(we,{code:`ephemeral(cls%2C%20client%3DNone%2C%20environment_name%3DNone%2C%20version%3DNone%2C%0A%20%20%20%20create_options%3DNone)`,lang:`python`});var Te=a(we,6);d(Te,{name:`client`,type:`_Client | None`,defaultValue:`None`,description:"Modal client to use; defaults to `Client.from_env()` when omitted."});var Ee=a(Te,2);d(Ee,{name:`environment_name`,type:`str | None`,defaultValue:`None`,description:`Environment for the ephemeral Volume; defaults to the active environment.`});var De=a(Ee,2);d(De,{name:`version`,type:`"modal_proto.api_pb2.VolumeFsVersion.ValueType | None"`,defaultValue:`None`,description:`Optional VolumeFS backend version for the ephemeral Volume.`});var Oe=a(De,2);d(Oe,{name:`create_options`,type:`"VolumeCreateOptions | None"`,defaultValue:`None`,description:`Options applied when creating the ephemeral Volume.`});var ke=a(Oe,4);l(ke,{code:`import%20modal%0A%0Awith%20modal.Volume.ephemeral()%20as%20vol%3A%0A%20%20%20%20assert%20vol.listdir(%22%2F%22)%20%3D%3D%20%5B%5D`,lang:`python`});var Ae=a(ke,2);l(Ae,{code:`async%20with%20modal.Volume.ephemeral()%20as%20vol%3A%0A%20%20%20%20assert%20await%20vol.listdir(%22%2F%22)%20%3D%3D%20%5B%5D`,lang:`python`});var je=a(Ae,2);s(je,{id:`info`,children:(e,t)=>{o(),r(e,n(`info`))},$$slots:{default:!0}});var Me=a(je,2);l(Me,{code:`info(self)`,lang:`python`});var Ne=a(Me,4);s(Ne,{id:`commit`,children:(e,t)=>{o(),r(e,n(`commit`))},$$slots:{default:!0}});var Pe=a(Ne,2);l(Pe,{code:`commit(self)`,lang:`python`});var Fe=a(Pe,6);s(Fe,{id:`reload`,children:(e,t)=>{o(),r(e,n(`reload`))},$$slots:{default:!0}});var Ie=a(Fe,2);l(Ie,{code:`reload(self)`,lang:`python`});var Le=a(Ie,8);s(Le,{id:`iterdir`,children:(e,t)=>{o(),r(e,n(`iterdir`))},$$slots:{default:!0}});var Re=a(Le,2);l(Re,{code:`iterdir(self%2C%20path%2C%20*%2C%20recursive%3DTrue)`,lang:`python`});var ze=a(Re,6);s(ze,{id:`listdir`,children:(e,t)=>{o(),r(e,n(`listdir`))},$$slots:{default:!0}});var Be=a(ze,2);l(Be,{code:`listdir(self%2C%20path%2C%20*%2C%20recursive%3DFalse)`,lang:`python`});var Ve=a(Be,6);s(Ve,{id:`read_file`,children:(e,t)=>{o(),r(e,n(`read_file`))},$$slots:{default:!0}});var He=a(Ve,2);l(He,{code:`read_file(self%2C%20path)`,lang:`python`});var Z=a(He,4);ie(a(e(Z)),{href:`https://modal.com/docs/guide/volumes`,rel:`nofollow`,children:(e,t)=>{o(),r(e,n(`the guide`))},$$slots:{default:!0}}),o(),ee(Z);var Q=a(Z,4);d(Q,{name:`path`,type:`str`,description:`Path to the file inside the Volume.`});var Ue=a(Q,4);l(Ue,{code:`vol%20%3D%20modal.Volume.from_name(%22my-modal-volume%22)%0Adata%20%3D%20b%22%22%0Afor%20chunk%20in%20vol.read_file(%221mb.csv%22)%3A%0A%20%20%20%20data%20%2B%3D%20chunk%0Aprint(len(data))%20%20%23%20%3D%3D%201024%20*%201024`,lang:`python`});var We=a(Ue,2);s(We,{id:`remove_file`,children:(e,t)=>{o(),r(e,n(`remove_file`))},$$slots:{default:!0}});var Ge=a(We,2);l(Ge,{code:`remove_file(self%2C%20path%2C%20recursive%3DFalse)`,lang:`python`});var Ke=a(Ge,4);s(Ke,{id:`copy_files`,children:(e,t)=>{o(),r(e,n(`copy_files`))},$$slots:{default:!0}});var qe=a(Ke,2);l(qe,{code:`copy_files(self%2C%20src_paths%2C%20dst_path%2C%20recursive%3DFalse)`,lang:`python`});var Je=a(qe,12);d(Je,{name:`src_paths`,type:`Sequence[str]`,description:`Source paths inside the Volume (list of one or more paths).`});var Ye=a(Je,2);d(Ye,{name:`dst_path`,type:`str`,description:"Destination path inside the Volume (file or directory, following ``cp`` semantics)."});var Xe=a(Ye,2);d(Xe,{name:`recursive`,type:`bool`,defaultValue:`False`,description:`Whether to copy directories recursively (V2 volumes only).`});var Ze=a(Xe,4);l(Ze,{code:`vol%20%3D%20modal.Volume.from_name(%22my-modal-volume%22)%0A%0Avol.copy_files(%5B%22bar%2Fexample.txt%22%5D%2C%20%22bar2%22)%0Avol.copy_files(%5B%22bar%2Fexample.txt%22%5D%2C%20%22bar%2Fexample2.txt%22)`,lang:`python`});var Qe=a(Ze,2);s(Qe,{id:`batch_upload`,children:(e,t)=>{o(),r(e,n(`batch_upload`))},$$slots:{default:!0}});var $e=a(Qe,2);l($e,{code:`batch_upload(self%2C%20force%3DFalse)`,lang:`python`});var et=a($e,8);d(et,{name:`force`,type:`bool`,defaultValue:`False`,description:`If True, allow overwriting existing files with uploads (not directories).`});var tt=a(et,4);l(tt,{code:`vol%20%3D%20modal.Volume.from_name(%22my-modal-volume%22)%0A%0Awith%20vol.batch_upload()%20as%20batch%3A%0A%20%20%20%20batch.put_file(%22local-path.txt%22%2C%20%22%2Fremote-path.txt%22)%0A%20%20%20%20batch.put_directory(%22%2Flocal%2Fdirectory%2F%22%2C%20%22%2Fremote%2Fdirectory%22)%0A%20%20%20%20batch.put_file(io.BytesIO(b%22some%20data%22)%2C%20%22%2Ffoobar%22)`,lang:`python`});var $=a(tt,2);s($,{id:`rename`,children:(e,t)=>{o(),r(e,n(`rename`))},$$slots:{default:!0}}),l(a($,2),{code:`rename(old_name%2C%20new_name%2C%20*%2C%20client%3DNone%2C%20environment_name%3DNone)`,lang:`python`}),r(t,i)},$$slots:{default:!0}}))}export{g as default,f as metadata};
//# sourceMappingURL=Bh2rbqoh2.js.map
