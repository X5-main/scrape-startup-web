(function(){try{var e=typeof window<`u`?window:typeof global<`u`?global:typeof globalThis<`u`?globalThis:typeof self<`u`?self:{};e.SENTRY_RELEASE={id:`f99fcf9f0a844cc9bd13fdc8e5782b84`};var t=new e.Error().stack;t&&(e._sentryDebugIds=e._sentryDebugIds||{},e._sentryDebugIds[t]=`e6e393cd-fff2-4192-a0bf-e398641b9df6`,e._sentryDebugIdIdentifier=`sentry-dbid-e6e393cd-fff2-4192-a0bf-e398641b9df6`)}catch{}})();import{$t as e,St as t,Tn as n,Tt as r,bt as i,c as ee,d as a,en as te,tn as o,wn as s}from"./F_ixKBiO.js";import"./B1sc9Zdx.js";import"./Bb2deiU3.js";import{t as ne}from"./DYSGKh1I.js";import{a as c,i as l,o as re}from"./CPby7b1n.js";import{t as u}from"./BILrvr3I.js";import{t as d}from"./B4L_if842.js";import{t as f}from"./DeWGVqas2.js";var p={crossLinks:[{text:`Fine-tuning and serving custom image generation models`,href:`/docs/examples/diffusers_lora_finetune`},{text:`Folding proteins`,href:`/docs/examples/chai1`},{text:`Serving interactive visualizations for a SQLite database`,href:`/docs/examples/cron_datasette`}],toc:[{depth:1,value:`Volumes`,id:`volumes`,children:[{depth:2,value:`Pricing`,id:`pricing`},{depth:2,value:`Volumes v2`,id:`volumes-v2`},{depth:2,value:`Creating a Volume`,id:`creating-a-volume`},{depth:2,value:`Using a Volume on Modal`,id:`using-a-volume-on-modal`},{depth:2,value:`Mount options`,id:`mount-options`,children:[{depth:3,value:`Read-only mounts`,id:`read-only-mounts`},{depth:3,value:`Mounting a sub-path`,id:`mounting-a-sub-path`}]},{depth:2,value:`Downloading a file from a Volume`,id:`downloading-a-file-from-a-volume`,children:[{depth:3,value:`Creating Volumes lazily from code`,id:`creating-volumes-lazily-from-code`}]},{depth:2,value:`Using a Volume from outside of Modal`,id:`using-a-volume-from-outside-of-modal`,children:[{depth:3,value:`Using a Volume from local code`,id:`using-a-volume-from-local-code`},{depth:3,value:`Using a Volume via the command line`,id:`using-a-volume-via-the-command-line`}]},{depth:2,value:`Volume commits and reloads`,id:`volume-commits-and-reloads`,children:[{depth:3,value:`Background commits`,id:`background-commits`}]},{depth:2,value:`Model serving`,id:`model-serving`},{depth:2,value:`Model checkpointing`,id:`model-checkpointing`,children:[{depth:3,value:`Hugging Face transformers`,id:`hugging-face-transformers`}]},{depth:2,value:`Volume performance`,id:`volume-performance`},{depth:2,value:`Filesystem consistency`,id:`filesystem-consistency`,children:[{depth:3,value:`Concurrent modification`,id:`concurrent-modification`},{depth:3,value:`Busy Volume errors`,id:`busy-volume-errors`},{depth:3,value:`Can’t find file on Volume errors`,id:`cant-find-file-on-volume-errors`}]},{depth:2,value:`Disk usage reporting`,id:`disk-usage-reporting`},{depth:2,value:`Volumes v2 overview`,id:`volumes-v2-overview`,children:[{depth:3,value:`Volumes v2 are still in Beta`,id:`volumes-v2-are-still-in-beta`},{depth:3,value:`Volumes v2 are HIPAA compliant`,id:`volumes-v2-are-hipaa-compliant`},{depth:3,value:`Volumes v2 is more scaleable`,id:`volumes-v2-is-more-scaleable`},{depth:3,value:`In v2, you can store as many files as you want`,id:`in-v2-you-can-store-as-many-files-as-you-want`},{depth:3,value:`In v2, you can write concurrently from hundreds of containers`,id:`in-v2-you-can-write-concurrently-from-hundreds-of-containers`},{depth:3,value:`In v2, random accesses have improved performance`,id:`in-v2-random-accesses-have-improved-performance`},{depth:3,value:`In v2, you can commit using sync`,id:`in-v2-you-can-commit-using-sync`},{depth:3,value:`Volumes v2 has a few limits in place`,id:`volumes-v2-has-a-few-limits-in-place`},{depth:3,value:`Upgrading v1 Volumes`,id:`upgrading-v1-volumes`}]},{depth:2,value:`Further examples`,id:`further-examples`}]}],rawContent:`# Volumes

Volumes are a high-performance distributed file system for Modal applications. They are optimized for write-once, read-many I/O workloads, like creating machine learning model weights and distributing them for inference.

Key benefits:

- Volumes are distributed by default, so you can use them alongside Modal’s global compute pool without needing to manage replicas across regions.
- Volumes have caching and chunking optimizations built-in to maximize throughput.
- Volumes come with a fully-featured filesystem interface for easy integration into your favorite ML tools and frameworks.
- Volumes are backed by multiple underlying cloud providers to guarantee high availability.

This page is a high-level guide to using Modal Volumes.
For reference documentation on the \`modal.Volume\` object, see
[this page](/docs/sdk/py/latest/Volume).
For reference documentation on the \`modal volume\` CLI command, see
[this page](/docs/cli/latest/volume).

## Pricing

Please refer to our [pricing page](/pricing) for up-to-date prices. We calculate usage by snapshotting your total storage once a day. When you delete data, you may still be billed for that storage for up to four days, to reflect our underlying processing costs.

## Volumes v2

<Callout variant="beta">

Instructions specific to v2 Volumes will be annotated with 🌱 below.

</Callout>

Read more about [Volumes v2](#volumes-v2-overview) below.

## Creating a Volume

The easiest way to create a Volume and use it as a part of your App is to use
the [\`modal volume create\`](/docs/cli/latest/volume#modal-volume-create) CLI command. This will create the Volume and output
some sample code:

\`\`\`bash
% modal volume create my-volume
Created volume 'my-volume' in environment 'main'.
\`\`\`

> 🌱 To create a v2 Volume, pass \`--version=2\` in the command above.

## Using a Volume on Modal

To attach an existing Volume to a Modal Function, use [\`Volume.from_name\`](/docs/sdk/py/latest/Volume#from_name):

\`\`\`python
vol = modal.Volume.from_name("my-volume")


@app.function(volumes={"/data": vol})
def run():
    with open("/data/xyz.txt", "w") as f:
        f.write("hello")
    vol.commit()  # Needed to make sure all changes are persisted before exit
\`\`\`

You can also browse and manipulate Volumes from an ad hoc Modal Shell:

\`\`\`bash
% modal shell --volume my-volume --volume another-volume
\`\`\`

Volumes will be mounted under \`/mnt\`.

Volumes are designed to provide up to 2.5 GB/s of bandwidth.
Actual throughput is not guaranteed and may be lower depending on network conditions.

## Mount options

When attaching a Volume to a Function or Sandbox, you can configure mount options using
[\`Volume.with_mount_options\`](/docs/sdk/py/latest/Volume#with_mount_options).
These options are not stored on the Volume itself — they apply per container mount,
so the same Volume can be mounted differently for distinct containers.

### Read-only mounts

To prevent a container from writing to a Volume, mount it in read-only mode:

\`\`\`python notest
import modal

volume = modal.Volume.from_name("my-volume")

sb = modal.Sandbox.create(
    volumes={"/data": volume.with_mount_options(read_only=True)},
    app=app,
)
sb.exec("cat", "/data/config.json").wait()  # ok!
sb.exec("touch", "/data/new-file").wait()  # error!
\`\`\`

### Mounting a sub-path

You can mount a subdirectory of a Volume instead of the entire Volume using the \`sub_path\` mount option.
If the subdirectory doesn't exist yet, it will be created when the container starts.

\`\`\`python notest
import modal

volume = modal.Volume.from_name("my-volume")

sb = modal.Sandbox.create(
    volumes={"/user_data": volume.with_mount_options(sub_path="/users/user_123")},
    app=app,
)
# /user_data inside of the contianer is now referencing /users/user_123 in the Volume
sb.exec("ls", "/user_data").wait()
\`\`\`

Sub-path mounting is especially useful when you want a single Volume to serve
multiple end user sessions, but don't want a session to access or even see
files for other sessions in the Volume.

**Note:** Sub-path is currently restricted to directories - you can not mount an individual file.

## Downloading a file from a Volume

While there’s no file size limit for individual files in a volume, the frontend only supports downloading files up to 16 MB. For larger files, please use the CLI:

\`\`\`bash
% modal volume get my-volume xyz.txt xyz-local.txt
\`\`\`

### Creating Volumes lazily from code

You can also create Volumes lazily from code using:

\`\`\`python
vol = modal.Volume.from_name("my-volume", create_if_missing=True)
\`\`\`

> 🌱 To create a v2 Volume, pass \`version=2\` to the call to \`from_name()\` in the code above.

This will create the Volume if it doesn't exist.

## Using a Volume from outside of Modal

Volumes can also be used outside Modal via the [Python SDK](/docs/sdk/py/latest/Volume) or our [CLI](/docs/cli/latest/volume).

### Using a Volume from local code

You can interact with Volumes from anywhere you like using the \`modal\` Python client library.

\`\`\`python notest
vol = modal.Volume.from_name("my-volume")

with vol.batch_upload() as batch:
    batch.put_file("local-path.txt", "/remote-path.txt")
    batch.put_directory("/local/directory/", "/remote/directory")
    batch.put_file(io.BytesIO(b"some data"), "/foobar")
\`\`\`

For more details, see the [reference documentation](/docs/sdk/py/latest/Volume).

### Using a Volume via the command line

You can also interact with Volumes using the command line interface. You can run
\`modal volume\` to get a full list of its subcommands:

\`\`\`bash
% modal volume
Usage: modal volume [OPTIONS] COMMAND [ARGS]...

 Read and edit modal.Volume volumes.
 Note: users of modal.NetworkFileSystem should use the modal nfs command instead.

╭─ Options ──────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────╮
│ --help          Show this message and exit.                                                                                                                                                            │
╰────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────╯
╭─ File operations ──────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────╮
│ cp       Copy within a modal.Volume. Copy source file to destination file or multiple source files to destination directory.                                                                           │
│ get      Download files from a modal.Volume object.                                                                                                                                                    │
│ ls       List files and directories in a modal.Volume volume.                                                                                                                                          │
│ put      Upload a file or directory to a modal.Volume.                                                                                                                                                 │
│ rm       Delete a file or directory from a modal.Volume.                                                                                                                                               │
╰────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────╯
╭─ Management ───────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────╮
│ create   Create a named, persistent modal.Volume.                                                                                                                                                      │
│ delete   Delete a named, persistent modal.Volume.                                                                                                                                                      │
│ list     List the details of all modal.Volume volumes in an Environment.                                                                                                                               │
╰────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────╯
\`\`\`

For more details, see the [reference documentation](/docs/cli/latest/volume).

## Volume commits and reloads

Unlike a normal filesystem, you need to explicitly reload the Volume to see
changes made since it was first mounted. This reload is handled by invoking the
[\`.reload()\`](/docs/sdk/py/latest/Volume#reload) method on a Volume object.
Similarly, any Volume changes made within a container need to be committed for
those the changes to become visible outside the current container. This is handled
periodically by [background commits](#background-commits) and directly by invoking
the [\`.commit()\`](/docs/sdk/py/latest/Volume#commit)
method on a \`modal.Volume\` object.

At container creation time the latest state of an attached Volume is mounted. If
the Volume is then subsequently modified by a commit operation in another
running container, that Volume modification won't become available until the
original container does a [\`.reload()\`](/docs/sdk/py/latest/Volume#reload).

Consider this example which demonstrates the effect of a reload:

\`\`\`python
import pathlib
import modal

app = modal.App()

volume = modal.Volume.from_name("my-volume")

p = pathlib.Path("/root/foo/bar.txt")


@app.function(volumes={"/root/foo": volume})
def f():
    p.write_text("hello")
    print(f"Created {p=}")
    volume.commit()  # Persist changes
    print(f"Committed {p=}")


@app.function(volumes={"/root/foo": volume})
def g(reload: bool = False):
    if reload:
        volume.reload()  # Fetch latest changes
    if p.exists():
        print(f"{p=} contains '{p.read_text()}'")
    else:
        print(f"{p=} does not exist!")


@app.local_entrypoint()
def main():
    g.remote()  # 1. container for \`g\` starts
    f.remote()  # 2. container for \`f\` starts, commits file
    g.remote(reload=False)  # 3. reuses container for \`g\`, no reload
    g.remote(reload=True)   # 4. reuses container, but reloads to see file.
\`\`\`

The output for this example is this:

\`\`\`
p=PosixPath('/root/foo/bar.txt') does not exist!
Created p=PosixPath('/root/foo/bar.txt')
Committed p=PosixPath('/root/foo/bar.txt')
p=PosixPath('/root/foo/bar.txt') does not exist!
p=PosixPath('/root/foo/bar.txt') contains hello
\`\`\`

This code runs two containers, one for \`f\` and one for \`g\`. Only the last
function invocation reads the file created and committed by \`f\` because it was
configured to reload.

### Background commits

Modal Volumes run background commits:
every few seconds while your Function or Sandbox executes,
the contents of attached Volumes will be committed
without your application code calling \`.commit\`.
A final snapshot and commit is also automatically performed on container shutdown.

Being able to persist changes to Volumes without changing your application code
is especially useful when [training or fine-tuning models using frameworks](#model-checkpointing).

## Model serving

A single ML model can be served by simply baking it into a \`modal.Image\` at
build time using [\`run_function\`](/docs/sdk/py/latest/Image#run_function). But
if you have dozens of models to serve, or otherwise need to decouple image
builds from model storage and serving, use a \`modal.Volume\`.

Volumes can be used to save a large number of ML models and later serve any one
of them at runtime with great performance. This snippet below shows the
basic structure of the solution.

\`\`\`python
import modal

app = modal.App()
volume = modal.Volume.from_name("model-store")
model_store_path = "/vol/models"


@app.function(volumes={model_store_path: volume}, gpu="any")
def run_training():
    model = train(...)
    save(model_store_path, model)
    volume.commit()  # Persist changes


@app.function(volumes={model_store_path: volume})
def inference(model_id: str, request):
    try:
        model = load_model(model_store_path, model_id)
    except NotFound:
        volume.reload()  # Fetch latest changes
        model = load_model(model_store_path, model_id)
    return model.run(request)
\`\`\`

For more details, see our [guide to storing model weights on Modal](/docs/guide/model-weights).

## Model checkpointing

Checkpoints are snapshots of an ML model and can be configured by the callback
functions of ML frameworks. You can use saved checkpoints to restart a training
job from the last saved checkpoint. This is particularly helpful in managing
[preemption](/docs/guide/preemption).

For more, see our [example code for long-running training](/docs/examples/long-training).

### Hugging Face \`transformers\`

To periodically checkpoint into a \`modal.Volume\`, just set the \`Trainer\`'s
[\`output_dir\`](https://huggingface.co/docs/transformers/main/en/main_classes/trainer#transformers.TrainingArguments.output_dir)
to a directory in the Volume.

\`\`\`python
import pathlib

volume = modal.Volume.from_name("my-volume")
VOL_MOUNT_PATH = pathlib.Path("/vol")

@app.function(
    gpu="A10G",
    timeout=2 * 60 * 60,  # run for at most two hours
    volumes={VOL_MOUNT_PATH: volume},
)
def finetune():
    from transformers import Seq2SeqTrainer
    ...

    training_args = Seq2SeqTrainingArguments(
        output_dir=str(VOL_MOUNT_PATH / "model"),
        # ... more args here
    )

    trainer = Seq2SeqTrainer(
        model=model,
        args=training_args,
        train_dataset=tokenized_xsum_train,
        eval_dataset=tokenized_xsum_test,
    )
\`\`\`

## Volume performance

Volumes work best when they contain less than 50,000 files and directories. The
latency to attach or modify a Volume scales linearly with the number of files in
the Volume, and past a few tens of thousands of files the linear component
starts to dominate the fixed overhead.

There is currently a hard limit of 500,000 inodes (files, directories and
symbolic links) per Volume. If you reach this limit, any further attempts to
create new files or directories will error with
[\`ENOSPC\` (No space left on device)](https://pubs.opengroup.org/onlinepubs/9799919799/).

If you need to work with a large number of files, consider using Volumes v2!
It is currently in Beta. See below for more info.

## Filesystem consistency

### Concurrent modification

Concurrent modification from multiple containers is supported, but concurrent
modifications of the same files should be avoided. Last write wins in case of
concurrent modification of the same file — any data the last writer didn't have
when committing changes will be lost!

The number of commits you can run concurrently is limited. If you run too many
concurrent commits each commit will take longer due to contention. If you are
committing small changes, avoid doing more than 5 concurrent commits (the number
of concurrent commits you can make is proportional to the size of the changes
being committed).

As a result, Volumes are typically not a good fit for use cases where you need
to make concurrent modifications to the same file (nor is distributed file
locking supported).

While a reload is in progress the Volume will appear empty to the container that
initiated the reload. That means you cannot read from or write to a Volume in a
container where a reload is ongoing (note that this only applies to the
container where the reload was issued, other containers remain unaffected).

### Busy Volume errors

You can only reload a Volume when there no open files on the Volume. If you have
open files on the Volume the [\`.reload()\`](/docs/sdk/py/latest/Volume#reload)
operation will fail with "volume busy". The following is a simple example of how
a "volume busy" error can occur:

\`\`\`python
volume = modal.Volume.from_name("my-volume")


@app.function(volumes={"/vol": volume})
def reload_with_open_files():
    f = open("/vol/data.txt", "r")
    volume.reload()  # Cannot reload when files in the Volume are open.
\`\`\`

### Can't find file on Volume errors

When accessing files in your Volume, don't forget to pre-pend where your Volume
is mounted in the container.

In the example below, where the Volume has been mounted at \`/data\`, "hello" is
being written to \`/data/xyz.txt\`.

\`\`\`python
import modal

app = modal.App()
vol = modal.Volume.from_name("my-volume")


@app.function(volumes={"/data": vol})
def run():
    with open("/data/xyz.txt", "w") as f:
        f.write("hello")
    vol.commit()
\`\`\`

If you instead write to \`/xyz.txt\`, the file will be saved to the local disk of the Modal Function.
When you dump the contents of the Volume, you will not see the \`xyz.txt\` file.

## Disk usage reporting

Modal Volumes are not block devices and do not have a fixed capacity.
Additionally, used space is not currently reported at the filesystem level.
As a result, tools that query disk usage via the \`statfs\` syscall
(e.g. \`shutil.disk_usage()\`, \`os.statvfs()\`, \`df\`) will return placeholder
values.

If you need to check the size of a Volume, refer to the size shown in the Modal
dashboard, or use \`du\` on the mounted Volume within a container.

## Volumes v2 overview

Volumes v2 generally behave just like Volumes v1, and most of the existing APIs
and CLI commands that you are used to will work the same between versions.
Because the file system implementation is completely different, there will be
some significant performance characteristics that can differ from version 1
Volumes. Below is an outline of the key differences you should be aware of.

### Volumes v2 are still in Beta

<Callout variant="beta">

We cannot yet guarantee that no data will be lost, so we don't recommend using Volumes v2 for mission-critical data at this time.

</Callout>

You can still reap the benefits of v2 for
data that isn't precious, or that is easy to rebuild, such as log files,
regularly updated training data and model weights, caches, and more.

### Volumes v2 are HIPAA compliant

If you delete the volume, the data is guaranteed to be lost according to HIPAA requirements.

### Volumes v2 is more scaleable

Volumes v2 support more files, higher throughput, and more irregular access
patterns. Commits and reloads are also faster.

Additionally, Volumes v2 supports hard-linking of files, where multiple paths
can point to the same inode.

### In v2, you can store as many files as you want

There is no limit on the number of files in Volumes v2.

By contrast, in Volumes v1, there is a limit on the number of files of 500,000,
and we recommend keeping the count to 50,000 or less.

### In v2, you can write concurrently from hundreds of containers

The file system should not experience any performance degradation as more
containers write to distinct files simultaneously.

By contrast, in Volumes v1, we recommend no more than five writers access the
Volume at once.

Note, however, that concurrent access to a particular _file_ in a Volume still
has last-write-wins semantics in many circumstances. These semantics are
unacceptable for most applications, so any particular file should only be
written to by a single container at a time.

### In v2, random accesses have improved performance

In v1, writes to locations inside a file would sometimes incur substantial
overhead, like a rewrite of the entire file.

In v2, this overhead is removed, and only changes are written.

### In v2, you can commit using \`sync\`

For Volumes v2, you can trigger a commit from within a Sandbox or modal shell
by running the \`sync\` command on the mountpoint:

\`\`\`bash
sync /path/to/mountpoint
\`\`\`

This is useful when you don't have access to the Python SDK's
[\`.commit()\`](/docs/sdk/py/latest/Volume#commit) method, such as when running
shell commands in a Sandbox or during an interactive \`modal shell\` session.

Running \`sync\` on the mountpoint will flush any pending writes to the kernel
and then persist all data and metadata changes to the Volume's persistent
storage.

For example, to commit changes in a modal shell session:

\`\`\`bash
% modal shell --volume my-v2-volume
root / → echo "hello" > /mnt/my-v2-volume/test.txt
root / → sync /mnt/my-v2-volume  # Persist changes before exiting
\`\`\`

Or to commit from within a Sandbox:

\`\`\`python notest
sb = modal.Sandbox.create(
    volumes={"/data": modal.Volume.from_name("my-v2-volume")},
    app=my_app,
)
sb.exec("bash", "-c", "echo 'hello' > /data/test.txt").wait()

# Persist changes and check for errors
p = sb.exec("sync", "/data")
p.wait()
if p.returncode != 0:
    raise Exception(f"sync failed with exit code {p.returncode}")
\`\`\`

> ⚠️ This feature is only available for Volumes v2.

### Volumes v2 has a few limits in place

While we work out performance trade-offs and listen to user feedback, we have
put some artificial limits in place.

- Files must be less than 1 TiB.
- At most 262,144 files can be stored in a single directory.
  Directory depth is unbounded, so the total file count is unbounded.
- Traversing the filesystem can be slower in v2 than in v1, due to demand
  loading of the filesystem tree.

### Upgrading v1 Volumes

Currently, there is no automated tool for upgrading v1 Volumes to v2. We are
planning to implement an automated migration path but for now v1 Volumes need
to be manually migrated by creating a new v2 Volume and either copying files
over from the v1 Volume or writing new files.

To reuse the name of an existing v1 Volume for a new v2 Volume, first stop all
Apps that are utilizing the v1 Volume before deleting it. If this is not
feasible, e.g. due to wanting to avoid downtime, use a new name for the v2
Volume.

**Warning:** When deleting an existing Volume, any deployed Apps or running
Functions utilizing that Volume will cease to function, even if a new Volume is
created with the same name. This is because Volumes are identified with opaque
unique IDs that are resolved at application deployment or start time. A newly
created Volume with the same name as a deleted Volume will have a new Volume ID
and any deployed or running Apps will still be referring to the old ID until
these Apps are re-deployed or restarted.

In order to create a new Volume and copy data over from the old Volume, you can
use a tool like \`cp\` if you intend to copy all the data in one go, or \`rsync\`
if you want to incrementally copy the data across a longer time span:

\`\`\`shell
$ modal volume create --version=2 2files2furious
$ modal shell --volume files-and-furious --volume 2files2furious
Welcome to Modal's debug shell!
We've provided a number of utilities for you, like \`curl\` and \`ps\`.
# Option 1: use \`cp\`
root / → cp -rp /mnt/files-and-furious/. /mnt/2files2furious/.
root / → sync /mnt/2files2furious # Ensure changes are persisted before exiting

# Option 2: use \`rsync\`
root / → apt install -y rsync
root / → rsync -a /mnt/files-and-furious/. /mnt/2files2furious/.
root / → sync /mnt/2files2furious # Ensure changes are persisted before exiting
\`\`\`

## Further examples

- [Character LoRA fine-tuning](/docs/examples/diffusers_lora_finetune) with model storage on a Volume
- [Protein folding](/docs/examples/chai1) with model weights and output files stored on Volumes
- [Dataset visualization with Datasette](/docs/examples/cron_datasette) using a SQLite database on a Volume
`,meta:{title:`Volumes`,description:`Volumes are a high-performance distributed file system for Modal applications. They are optimized for write-once, read-many I/O workloads, like creating machine learning model weights and distributing them for inference.`}},{crossLinks:m,toc:h,rawContent:g,meta:_}=p,ie=t(`<p>Instructions specific to v2 Volumes will be annotated with 🌱 below.</p>`),ae=t(`<code>modal volume create</code>`),oe=t(`<code>Volume.from_name</code>`),se=t(`<code>Volume.with_mount_options</code>`),ce=t(`<code>.reload()</code>`),le=t(`<code>.commit()</code>`),ue=t(`<code>.reload()</code>`),de=t(`<code>run_function</code>`),fe=t(`Hugging Face <code>transformers</code>`,1),pe=t(`<code>output_dir</code>`),me=t(`<code>ENOSPC</code> (No space left on device)`,1),he=t(`<code>.reload()</code>`),ge=t(`<p>We cannot yet guarantee that no data will be lost, so we don’t recommend using Volumes v2 for mission-critical data at this time.</p>`),_e=t(`In v2, you can commit using <code>sync</code>`,1),ve=t(`<code>.commit()</code>`),ye=t(`<!> <p>Volumes are a high-performance distributed file system for Modal applications. They are optimized for write-once, read-many I/O workloads, like creating machine learning model weights and distributing them for inference.</p> <p>Key benefits:</p> <ul><li>Volumes are distributed by default, so you can use them alongside Modal’s global compute pool without needing to manage replicas across regions.</li> <li>Volumes have caching and chunking optimizations built-in to maximize throughput.</li> <li>Volumes come with a fully-featured filesystem interface for easy integration into your favorite ML tools and frameworks.</li> <li>Volumes are backed by multiple underlying cloud providers to guarantee high availability.</li></ul> <p>This page is a high-level guide to using Modal Volumes.
For reference documentation on the <code>modal.Volume</code> object, see <!>.
For reference documentation on the <code>modal volume</code> CLI command, see <!>.</p> <!> <p>Please refer to our <!> for up-to-date prices. We calculate usage by snapshotting your total storage once a day. When you delete data, you may still be billed for that storage for up to four days, to reflect our underlying processing costs.</p> <!> <!> <p>Read more about <!> below.</p> <!> <p>The easiest way to create a Volume and use it as a part of your App is to use
the <!> CLI command. This will create the Volume and output
some sample code:</p> <!> <blockquote><p>🌱 To create a v2 Volume, pass <code>--version=2</code> in the command above.</p></blockquote> <!> <p>To attach an existing Volume to a Modal Function, use <!>:</p> <!> <p>You can also browse and manipulate Volumes from an ad hoc Modal Shell:</p> <!> <p>Volumes will be mounted under <code>/mnt</code>.</p> <p>Volumes are designed to provide up to 2.5 GB/s of bandwidth.
Actual throughput is not guaranteed and may be lower depending on network conditions.</p> <!> <p>When attaching a Volume to a Function or Sandbox, you can configure mount options using <!>.
These options are not stored on the Volume itself — they apply per container mount,
so the same Volume can be mounted differently for distinct containers.</p> <!> <p>To prevent a container from writing to a Volume, mount it in read-only mode:</p> <!> <!> <p>You can mount a subdirectory of a Volume instead of the entire Volume using the <code>sub_path</code> mount option.
If the subdirectory doesn’t exist yet, it will be created when the container starts.</p> <!> <p>Sub-path mounting is especially useful when you want a single Volume to serve
multiple end user sessions, but don’t want a session to access or even see
files for other sessions in the Volume.</p> <p><strong>Note:</strong> Sub-path is currently restricted to directories - you can not mount an individual file.</p> <!> <p>While there’s no file size limit for individual files in a volume, the frontend only supports downloading files up to 16 MB. For larger files, please use the CLI:</p> <!> <!> <p>You can also create Volumes lazily from code using:</p> <!> <blockquote><p>🌱 To create a v2 Volume, pass <code>version=2</code> to the call to <code>from_name()</code> in the code above.</p></blockquote> <p>This will create the Volume if it doesn’t exist.</p> <!> <p>Volumes can also be used outside Modal via the <!> or our <!>.</p> <!> <p>You can interact with Volumes from anywhere you like using the <code>modal</code> Python client library.</p> <!> <p>For more details, see the <!>.</p> <!> <p>You can also interact with Volumes using the command line interface. You can run <code>modal volume</code> to get a full list of its subcommands:</p> <!> <p>For more details, see the <!>.</p> <!> <p>Unlike a normal filesystem, you need to explicitly reload the Volume to see
changes made since it was first mounted. This reload is handled by invoking the <!> method on a Volume object.
Similarly, any Volume changes made within a container need to be committed for
those the changes to become visible outside the current container. This is handled
periodically by <!> and directly by invoking
the <!> method on a <code>modal.Volume</code> object.</p> <p>At container creation time the latest state of an attached Volume is mounted. If
the Volume is then subsequently modified by a commit operation in another
running container, that Volume modification won’t become available until the
original container does a <!>.</p> <p>Consider this example which demonstrates the effect of a reload:</p> <!> <p>The output for this example is this:</p> <!> <p>This code runs two containers, one for <code>f</code> and one for <code>g</code>. Only the last
function invocation reads the file created and committed by <code>f</code> because it was
configured to reload.</p> <!> <p>Modal Volumes run background commits:
every few seconds while your Function or Sandbox executes,
the contents of attached Volumes will be committed
without your application code calling <code>.commit</code>.
A final snapshot and commit is also automatically performed on container shutdown.</p> <p>Being able to persist changes to Volumes without changing your application code
is especially useful when <!>.</p> <!> <p>A single ML model can be served by simply baking it into a <code>modal.Image</code> at
build time using <!>. But
if you have dozens of models to serve, or otherwise need to decouple image
builds from model storage and serving, use a <code>modal.Volume</code>.</p> <p>Volumes can be used to save a large number of ML models and later serve any one
of them at runtime with great performance. This snippet below shows the
basic structure of the solution.</p> <!> <p>For more details, see our <!>.</p> <!> <p>Checkpoints are snapshots of an ML model and can be configured by the callback
functions of ML frameworks. You can use saved checkpoints to restart a training
job from the last saved checkpoint. This is particularly helpful in managing <!>.</p> <p>For more, see our <!>.</p> <!> <p>To periodically checkpoint into a <code>modal.Volume</code>, just set the <code>Trainer</code>’s <!> to a directory in the Volume.</p> <!> <!> <p>Volumes work best when they contain less than 50,000 files and directories. The
latency to attach or modify a Volume scales linearly with the number of files in
the Volume, and past a few tens of thousands of files the linear component
starts to dominate the fixed overhead.</p> <p>There is currently a hard limit of 500,000 inodes (files, directories and
symbolic links) per Volume. If you reach this limit, any further attempts to
create new files or directories will error with <!>.</p> <p>If you need to work with a large number of files, consider using Volumes v2!
It is currently in Beta. See below for more info.</p> <!> <!> <p>Concurrent modification from multiple containers is supported, but concurrent
modifications of the same files should be avoided. Last write wins in case of
concurrent modification of the same file — any data the last writer didn’t have
when committing changes will be lost!</p> <p>The number of commits you can run concurrently is limited. If you run too many
concurrent commits each commit will take longer due to contention. If you are
committing small changes, avoid doing more than 5 concurrent commits (the number
of concurrent commits you can make is proportional to the size of the changes
being committed).</p> <p>As a result, Volumes are typically not a good fit for use cases where you need
to make concurrent modifications to the same file (nor is distributed file
locking supported).</p> <p>While a reload is in progress the Volume will appear empty to the container that
initiated the reload. That means you cannot read from or write to a Volume in a
container where a reload is ongoing (note that this only applies to the
container where the reload was issued, other containers remain unaffected).</p> <!> <p>You can only reload a Volume when there no open files on the Volume. If you have
open files on the Volume the <!> operation will fail with “volume busy”. The following is a simple example of how
a “volume busy” error can occur:</p> <!> <!> <p>When accessing files in your Volume, don’t forget to pre-pend where your Volume
is mounted in the container.</p> <p>In the example below, where the Volume has been mounted at <code>/data</code>, “hello” is
being written to <code>/data/xyz.txt</code>.</p> <!> <p>If you instead write to <code>/xyz.txt</code>, the file will be saved to the local disk of the Modal Function.
When you dump the contents of the Volume, you will not see the <code>xyz.txt</code> file.</p> <!> <p>Modal Volumes are not block devices and do not have a fixed capacity.
Additionally, used space is not currently reported at the filesystem level.
As a result, tools that query disk usage via the <code>statfs</code> syscall
(e.g. <code>shutil.disk_usage()</code>, <code>os.statvfs()</code>, <code>df</code>) will return placeholder
values.</p> <p>If you need to check the size of a Volume, refer to the size shown in the Modal
dashboard, or use <code>du</code> on the mounted Volume within a container.</p> <!> <p>Volumes v2 generally behave just like Volumes v1, and most of the existing APIs
and CLI commands that you are used to will work the same between versions.
Because the file system implementation is completely different, there will be
some significant performance characteristics that can differ from version 1
Volumes. Below is an outline of the key differences you should be aware of.</p> <!> <!> <p>You can still reap the benefits of v2 for
data that isn’t precious, or that is easy to rebuild, such as log files,
regularly updated training data and model weights, caches, and more.</p> <!> <p>If you delete the volume, the data is guaranteed to be lost according to HIPAA requirements.</p> <!> <p>Volumes v2 support more files, higher throughput, and more irregular access
patterns. Commits and reloads are also faster.</p> <p>Additionally, Volumes v2 supports hard-linking of files, where multiple paths
can point to the same inode.</p> <!> <p>There is no limit on the number of files in Volumes v2.</p> <p>By contrast, in Volumes v1, there is a limit on the number of files of 500,000,
and we recommend keeping the count to 50,000 or less.</p> <!> <p>The file system should not experience any performance degradation as more
containers write to distinct files simultaneously.</p> <p>By contrast, in Volumes v1, we recommend no more than five writers access the
Volume at once.</p> <p>Note, however, that concurrent access to a particular <em>file</em> in a Volume still
has last-write-wins semantics in many circumstances. These semantics are
unacceptable for most applications, so any particular file should only be
written to by a single container at a time.</p> <!> <p>In v1, writes to locations inside a file would sometimes incur substantial
overhead, like a rewrite of the entire file.</p> <p>In v2, this overhead is removed, and only changes are written.</p> <!> <p>For Volumes v2, you can trigger a commit from within a Sandbox or modal shell
by running the <code>sync</code> command on the mountpoint:</p> <!> <p>This is useful when you don’t have access to the Python SDK’s <!> method, such as when running
shell commands in a Sandbox or during an interactive <code>modal shell</code> session.</p> <p>Running <code>sync</code> on the mountpoint will flush any pending writes to the kernel
and then persist all data and metadata changes to the Volume’s persistent
storage.</p> <p>For example, to commit changes in a modal shell session:</p> <!> <p>Or to commit from within a Sandbox:</p> <!> <blockquote><p>⚠️ This feature is only available for Volumes v2.</p></blockquote> <!> <p>While we work out performance trade-offs and listen to user feedback, we have
put some artificial limits in place.</p> <ul><li>Files must be less than 1 TiB.</li> <li>At most 262,144 files can be stored in a single directory.
Directory depth is unbounded, so the total file count is unbounded.</li> <li>Traversing the filesystem can be slower in v2 than in v1, due to demand
loading of the filesystem tree.</li></ul> <!> <p>Currently, there is no automated tool for upgrading v1 Volumes to v2. We are
planning to implement an automated migration path but for now v1 Volumes need
to be manually migrated by creating a new v2 Volume and either copying files
over from the v1 Volume or writing new files.</p> <p>To reuse the name of an existing v1 Volume for a new v2 Volume, first stop all
Apps that are utilizing the v1 Volume before deleting it. If this is not
feasible, e.g. due to wanting to avoid downtime, use a new name for the v2
Volume.</p> <p><strong>Warning:</strong> When deleting an existing Volume, any deployed Apps or running
Functions utilizing that Volume will cease to function, even if a new Volume is
created with the same name. This is because Volumes are identified with opaque
unique IDs that are resolved at application deployment or start time. A newly
created Volume with the same name as a deleted Volume will have a new Volume ID
and any deployed or running Apps will still be referring to the old ID until
these Apps are re-deployed or restarted.</p> <p>In order to create a new Volume and copy data over from the old Volume, you can
use a tool like <code>cp</code> if you intend to copy all the data in one go, or <code>rsync</code> if you want to incrementally copy the data across a longer time span:</p> <!> <!> <ul><li><!> with model storage on a Volume</li> <li><!> with model weights and output files stored on Volumes</li> <li><!> using a SQLite database on a Volume</li></ul>`,1);function v(t,m){let h=ee(m,[`children`,`$$slots`,`$$events`,`$$legacy`]);d(t,a(()=>h,()=>p,{children:(t,ee)=>{var a=ye(),d=te(a);re(d,{id:`volumes`,children:(e,t)=>{s(),i(e,r(`Volumes`))},$$slots:{default:!0}});var p=o(d,8),m=o(e(p),3);f(m,{href:`/docs/sdk/py/latest/Volume`,children:(e,t)=>{s(),i(e,r(`this page`))},$$slots:{default:!0}}),f(o(m,4),{href:`/docs/cli/latest/volume`,children:(e,t)=>{s(),i(e,r(`this page`))},$$slots:{default:!0}}),s(),n(p);var h=o(p,2);c(h,{id:`pricing`,children:(e,t)=>{s(),i(e,r(`Pricing`))},$$slots:{default:!0}});var g=o(h,2);f(o(e(g)),{href:`/pricing`,children:(e,t)=>{s(),i(e,r(`pricing page`))},$$slots:{default:!0}}),s(),n(g);var _=o(g,2);c(_,{id:`volumes-v2`,children:(e,t)=>{s(),i(e,r(`Volumes v2`))},$$slots:{default:!0}});var v=o(_,2);ne(v,{variant:`beta`,children:(e,t)=>{i(e,ie())},$$slots:{default:!0}});var y=o(v,2);f(o(e(y)),{href:`#volumes-v2-overview`,children:(e,t)=>{s(),i(e,r(`Volumes v2`))},$$slots:{default:!0}}),s(),n(y);var b=o(y,2);c(b,{id:`creating-a-volume`,children:(e,t)=>{s(),i(e,r(`Creating a Volume`))},$$slots:{default:!0}});var x=o(b,2);f(o(e(x)),{href:`/docs/cli/latest/volume#modal-volume-create`,children:(e,t)=>{i(e,ae())},$$slots:{default:!0}}),s(),n(x);var S=o(x,2);u(S,{code:`%25%20modal%20volume%20create%20my-volume%0ACreated%20volume%20'my-volume'%20in%20environment%20'main'.`,lang:`bash`});var C=o(S,4);c(C,{id:`using-a-volume-on-modal`,children:(e,t)=>{s(),i(e,r(`Using a Volume on Modal`))},$$slots:{default:!0}});var w=o(C,2);f(o(e(w)),{href:`/docs/sdk/py/latest/Volume#from_name`,children:(e,t)=>{i(e,oe())},$$slots:{default:!0}}),s(),n(w);var T=o(w,2);u(T,{code:`vol%20%3D%20modal.Volume.from_name(%22my-volume%22)%0A%0A%0A%40app.function(volumes%3D%7B%22%2Fdata%22%3A%20vol%7D)%0Adef%20run()%3A%0A%20%20%20%20with%20open(%22%2Fdata%2Fxyz.txt%22%2C%20%22w%22)%20as%20f%3A%0A%20%20%20%20%20%20%20%20f.write(%22hello%22)%0A%20%20%20%20vol.commit()%20%20%23%20Needed%20to%20make%20sure%20all%20changes%20are%20persisted%20before%20exit`,lang:`python`});var E=o(T,4);u(E,{code:`%25%20modal%20shell%20--volume%20my-volume%20--volume%20another-volume`,lang:`bash`});var D=o(E,6);c(D,{id:`mount-options`,children:(e,t)=>{s(),i(e,r(`Mount options`))},$$slots:{default:!0}});var O=o(D,2);f(o(e(O)),{href:`/docs/sdk/py/latest/Volume#with_mount_options`,children:(e,t)=>{i(e,se())},$$slots:{default:!0}}),s(),n(O);var k=o(O,2);l(k,{id:`read-only-mounts`,children:(e,t)=>{s(),i(e,r(`Read-only mounts`))},$$slots:{default:!0}});var A=o(k,4);u(A,{code:`import%20modal%0A%0Avolume%20%3D%20modal.Volume.from_name(%22my-volume%22)%0A%0Asb%20%3D%20modal.Sandbox.create(%0A%20%20%20%20volumes%3D%7B%22%2Fdata%22%3A%20volume.with_mount_options(read_only%3DTrue)%7D%2C%0A%20%20%20%20app%3Dapp%2C%0A)%0Asb.exec(%22cat%22%2C%20%22%2Fdata%2Fconfig.json%22).wait()%20%20%23%20ok!%0Asb.exec(%22touch%22%2C%20%22%2Fdata%2Fnew-file%22).wait()%20%20%23%20error!`,lang:`python`});var j=o(A,2);l(j,{id:`mounting-a-sub-path`,children:(e,t)=>{s(),i(e,r(`Mounting a sub-path`))},$$slots:{default:!0}});var M=o(j,4);u(M,{code:`import%20modal%0A%0Avolume%20%3D%20modal.Volume.from_name(%22my-volume%22)%0A%0Asb%20%3D%20modal.Sandbox.create(%0A%20%20%20%20volumes%3D%7B%22%2Fuser_data%22%3A%20volume.with_mount_options(sub_path%3D%22%2Fusers%2Fuser_123%22)%7D%2C%0A%20%20%20%20app%3Dapp%2C%0A)%0A%23%20%2Fuser_data%20inside%20of%20the%20contianer%20is%20now%20referencing%20%2Fusers%2Fuser_123%20in%20the%20Volume%0Asb.exec(%22ls%22%2C%20%22%2Fuser_data%22).wait()`,lang:`python`});var N=o(M,6);c(N,{id:`downloading-a-file-from-a-volume`,children:(e,t)=>{s(),i(e,r(`Downloading a file from a Volume`))},$$slots:{default:!0}});var P=o(N,4);u(P,{code:`%25%20modal%20volume%20get%20my-volume%20xyz.txt%20xyz-local.txt`,lang:`bash`});var F=o(P,2);l(F,{id:`creating-volumes-lazily-from-code`,children:(e,t)=>{s(),i(e,r(`Creating Volumes lazily from code`))},$$slots:{default:!0}});var I=o(F,4);u(I,{code:`vol%20%3D%20modal.Volume.from_name(%22my-volume%22%2C%20create_if_missing%3DTrue)`,lang:`python`});var be=o(I,6);c(be,{id:`using-a-volume-from-outside-of-modal`,children:(e,t)=>{s(),i(e,r(`Using a Volume from outside of Modal`))},$$slots:{default:!0}});var L=o(be,2),xe=o(e(L));f(xe,{href:`/docs/sdk/py/latest/Volume`,children:(e,t)=>{s(),i(e,r(`Python SDK`))},$$slots:{default:!0}}),f(o(xe,2),{href:`/docs/cli/latest/volume`,children:(e,t)=>{s(),i(e,r(`CLI`))},$$slots:{default:!0}}),s(),n(L);var Se=o(L,2);l(Se,{id:`using-a-volume-from-local-code`,children:(e,t)=>{s(),i(e,r(`Using a Volume from local code`))},$$slots:{default:!0}});var Ce=o(Se,4);u(Ce,{code:`vol%20%3D%20modal.Volume.from_name(%22my-volume%22)%0A%0Awith%20vol.batch_upload()%20as%20batch%3A%0A%20%20%20%20batch.put_file(%22local-path.txt%22%2C%20%22%2Fremote-path.txt%22)%0A%20%20%20%20batch.put_directory(%22%2Flocal%2Fdirectory%2F%22%2C%20%22%2Fremote%2Fdirectory%22)%0A%20%20%20%20batch.put_file(io.BytesIO(b%22some%20data%22)%2C%20%22%2Ffoobar%22)`,lang:`python`});var R=o(Ce,2);f(o(e(R)),{href:`/docs/sdk/py/latest/Volume`,children:(e,t)=>{s(),i(e,r(`reference documentation`))},$$slots:{default:!0}}),s(),n(R);var we=o(R,2);l(we,{id:`using-a-volume-via-the-command-line`,children:(e,t)=>{s(),i(e,r(`Using a Volume via the command line`))},$$slots:{default:!0}});var Te=o(we,4);u(Te,{code:`%25%20modal%20volume%0AUsage%3A%20modal%20volume%20%5BOPTIONS%5D%20COMMAND%20%5BARGS%5D...%0A%0A%20Read%20and%20edit%20modal.Volume%20volumes.%0A%20Note%3A%20users%20of%20modal.NetworkFileSystem%20should%20use%20the%20modal%20nfs%20command%20instead.%0A%0A%E2%95%AD%E2%94%80%20Options%20%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%95%AE%0A%E2%94%82%20--help%20%20%20%20%20%20%20%20%20%20Show%20this%20message%20and%20exit.%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%E2%94%82%0A%E2%95%B0%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%95%AF%0A%E2%95%AD%E2%94%80%20File%20operations%20%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%95%AE%0A%E2%94%82%20cp%20%20%20%20%20%20%20Copy%20within%20a%20modal.Volume.%20Copy%20source%20file%20to%20destination%20file%20or%20multiple%20source%20files%20to%20destination%20directory.%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%E2%94%82%0A%E2%94%82%20get%20%20%20%20%20%20Download%20files%20from%20a%20modal.Volume%20object.%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%E2%94%82%0A%E2%94%82%20ls%20%20%20%20%20%20%20List%20files%20and%20directories%20in%20a%20modal.Volume%20volume.%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%E2%94%82%0A%E2%94%82%20put%20%20%20%20%20%20Upload%20a%20file%20or%20directory%20to%20a%20modal.Volume.%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%E2%94%82%0A%E2%94%82%20rm%20%20%20%20%20%20%20Delete%20a%20file%20or%20directory%20from%20a%20modal.Volume.%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%E2%94%82%0A%E2%95%B0%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%95%AF%0A%E2%95%AD%E2%94%80%20Management%20%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%95%AE%0A%E2%94%82%20create%20%20%20Create%20a%20named%2C%20persistent%20modal.Volume.%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%E2%94%82%0A%E2%94%82%20delete%20%20%20Delete%20a%20named%2C%20persistent%20modal.Volume.%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%E2%94%82%0A%E2%94%82%20list%20%20%20%20%20List%20the%20details%20of%20all%20modal.Volume%20volumes%20in%20an%20Environment.%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%E2%94%82%0A%E2%95%B0%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%95%AF`,lang:`bash`});var z=o(Te,2);f(o(e(z)),{href:`/docs/cli/latest/volume`,children:(e,t)=>{s(),i(e,r(`reference documentation`))},$$slots:{default:!0}}),s(),n(z);var Ee=o(z,2);c(Ee,{id:`volume-commits-and-reloads`,children:(e,t)=>{s(),i(e,r(`Volume commits and reloads`))},$$slots:{default:!0}});var B=o(Ee,2),De=o(e(B));f(De,{href:`/docs/sdk/py/latest/Volume#reload`,children:(e,t)=>{i(e,ce())},$$slots:{default:!0}});var Oe=o(De,2);f(Oe,{href:`#background-commits`,children:(e,t)=>{s(),i(e,r(`background commits`))},$$slots:{default:!0}}),f(o(Oe,2),{href:`/docs/sdk/py/latest/Volume#commit`,children:(e,t)=>{i(e,le())},$$slots:{default:!0}}),s(3),n(B);var V=o(B,2);f(o(e(V)),{href:`/docs/sdk/py/latest/Volume#reload`,children:(e,t)=>{i(e,ue())},$$slots:{default:!0}}),s(),n(V);var ke=o(V,4);u(ke,{code:`import%20pathlib%0Aimport%20modal%0A%0Aapp%20%3D%20modal.App()%0A%0Avolume%20%3D%20modal.Volume.from_name(%22my-volume%22)%0A%0Ap%20%3D%20pathlib.Path(%22%2Froot%2Ffoo%2Fbar.txt%22)%0A%0A%0A%40app.function(volumes%3D%7B%22%2Froot%2Ffoo%22%3A%20volume%7D)%0Adef%20f()%3A%0A%20%20%20%20p.write_text(%22hello%22)%0A%20%20%20%20print(f%22Created%20%7Bp%3D%7D%22)%0A%20%20%20%20volume.commit()%20%20%23%20Persist%20changes%0A%20%20%20%20print(f%22Committed%20%7Bp%3D%7D%22)%0A%0A%0A%40app.function(volumes%3D%7B%22%2Froot%2Ffoo%22%3A%20volume%7D)%0Adef%20g(reload%3A%20bool%20%3D%20False)%3A%0A%20%20%20%20if%20reload%3A%0A%20%20%20%20%20%20%20%20volume.reload()%20%20%23%20Fetch%20latest%20changes%0A%20%20%20%20if%20p.exists()%3A%0A%20%20%20%20%20%20%20%20print(f%22%7Bp%3D%7D%20contains%20'%7Bp.read_text()%7D'%22)%0A%20%20%20%20else%3A%0A%20%20%20%20%20%20%20%20print(f%22%7Bp%3D%7D%20does%20not%20exist!%22)%0A%0A%0A%40app.local_entrypoint()%0Adef%20main()%3A%0A%20%20%20%20g.remote()%20%20%23%201.%20container%20for%20%60g%60%20starts%0A%20%20%20%20f.remote()%20%20%23%202.%20container%20for%20%60f%60%20starts%2C%20commits%20file%0A%20%20%20%20g.remote(reload%3DFalse)%20%20%23%203.%20reuses%20container%20for%20%60g%60%2C%20no%20reload%0A%20%20%20%20g.remote(reload%3DTrue)%20%20%20%23%204.%20reuses%20container%2C%20but%20reloads%20to%20see%20file.`,lang:`python`});var Ae=o(ke,4);u(Ae,{code:`p%3DPosixPath('%2Froot%2Ffoo%2Fbar.txt')%20does%20not%20exist!%0ACreated%20p%3DPosixPath('%2Froot%2Ffoo%2Fbar.txt')%0ACommitted%20p%3DPosixPath('%2Froot%2Ffoo%2Fbar.txt')%0Ap%3DPosixPath('%2Froot%2Ffoo%2Fbar.txt')%20does%20not%20exist!%0Ap%3DPosixPath('%2Froot%2Ffoo%2Fbar.txt')%20contains%20hello`,lang:`text`});var je=o(Ae,4);l(je,{id:`background-commits`,children:(e,t)=>{s(),i(e,r(`Background commits`))},$$slots:{default:!0}});var H=o(je,4);f(o(e(H)),{href:`#model-checkpointing`,children:(e,t)=>{s(),i(e,r(`training or fine-tuning models using frameworks`))},$$slots:{default:!0}}),s(),n(H);var Me=o(H,2);c(Me,{id:`model-serving`,children:(e,t)=>{s(),i(e,r(`Model serving`))},$$slots:{default:!0}});var U=o(Me,2);f(o(e(U),3),{href:`/docs/sdk/py/latest/Image#run_function`,children:(e,t)=>{i(e,de())},$$slots:{default:!0}}),s(3),n(U);var Ne=o(U,4);u(Ne,{code:`import%20modal%0A%0Aapp%20%3D%20modal.App()%0Avolume%20%3D%20modal.Volume.from_name(%22model-store%22)%0Amodel_store_path%20%3D%20%22%2Fvol%2Fmodels%22%0A%0A%0A%40app.function(volumes%3D%7Bmodel_store_path%3A%20volume%7D%2C%20gpu%3D%22any%22)%0Adef%20run_training()%3A%0A%20%20%20%20model%20%3D%20train(...)%0A%20%20%20%20save(model_store_path%2C%20model)%0A%20%20%20%20volume.commit()%20%20%23%20Persist%20changes%0A%0A%0A%40app.function(volumes%3D%7Bmodel_store_path%3A%20volume%7D)%0Adef%20inference(model_id%3A%20str%2C%20request)%3A%0A%20%20%20%20try%3A%0A%20%20%20%20%20%20%20%20model%20%3D%20load_model(model_store_path%2C%20model_id)%0A%20%20%20%20except%20NotFound%3A%0A%20%20%20%20%20%20%20%20volume.reload()%20%20%23%20Fetch%20latest%20changes%0A%20%20%20%20%20%20%20%20model%20%3D%20load_model(model_store_path%2C%20model_id)%0A%20%20%20%20return%20model.run(request)`,lang:`python`});var W=o(Ne,2);f(o(e(W)),{href:`/docs/guide/model-weights`,children:(e,t)=>{s(),i(e,r(`guide to storing model weights on Modal`))},$$slots:{default:!0}}),s(),n(W);var Pe=o(W,2);c(Pe,{id:`model-checkpointing`,children:(e,t)=>{s(),i(e,r(`Model checkpointing`))},$$slots:{default:!0}});var G=o(Pe,2);f(o(e(G)),{href:`/docs/guide/preemption`,children:(e,t)=>{s(),i(e,r(`preemption`))},$$slots:{default:!0}}),s(),n(G);var K=o(G,2);f(o(e(K)),{href:`/docs/examples/long-training`,children:(e,t)=>{s(),i(e,r(`example code for long-running training`))},$$slots:{default:!0}}),s(),n(K);var Fe=o(K,2);l(Fe,{id:`hugging-face-transformers`,children:(e,t)=>{s();var n=fe();s(),i(e,n)},$$slots:{default:!0}});var q=o(Fe,2);f(o(e(q),5),{href:`https://huggingface.co/docs/transformers/main/en/main_classes/trainer#transformers.TrainingArguments.output_dir`,rel:`nofollow`,children:(e,t)=>{i(e,pe())},$$slots:{default:!0}}),s(),n(q);var Ie=o(q,2);u(Ie,{code:`import%20pathlib%0A%0Avolume%20%3D%20modal.Volume.from_name(%22my-volume%22)%0AVOL_MOUNT_PATH%20%3D%20pathlib.Path(%22%2Fvol%22)%0A%0A%40app.function(%0A%20%20%20%20gpu%3D%22A10G%22%2C%0A%20%20%20%20timeout%3D2%20*%2060%20*%2060%2C%20%20%23%20run%20for%20at%20most%20two%20hours%0A%20%20%20%20volumes%3D%7BVOL_MOUNT_PATH%3A%20volume%7D%2C%0A)%0Adef%20finetune()%3A%0A%20%20%20%20from%20transformers%20import%20Seq2SeqTrainer%0A%20%20%20%20...%0A%0A%20%20%20%20training_args%20%3D%20Seq2SeqTrainingArguments(%0A%20%20%20%20%20%20%20%20output_dir%3Dstr(VOL_MOUNT_PATH%20%2F%20%22model%22)%2C%0A%20%20%20%20%20%20%20%20%23%20...%20more%20args%20here%0A%20%20%20%20)%0A%0A%20%20%20%20trainer%20%3D%20Seq2SeqTrainer(%0A%20%20%20%20%20%20%20%20model%3Dmodel%2C%0A%20%20%20%20%20%20%20%20args%3Dtraining_args%2C%0A%20%20%20%20%20%20%20%20train_dataset%3Dtokenized_xsum_train%2C%0A%20%20%20%20%20%20%20%20eval_dataset%3Dtokenized_xsum_test%2C%0A%20%20%20%20)`,lang:`python`});var Le=o(Ie,2);c(Le,{id:`volume-performance`,children:(e,t)=>{s(),i(e,r(`Volume performance`))},$$slots:{default:!0}});var J=o(Le,4);f(o(e(J)),{href:`https://pubs.opengroup.org/onlinepubs/9799919799/`,rel:`nofollow`,children:(e,t)=>{var n=me();s(),i(e,n)},$$slots:{default:!0}}),s(),n(J);var Re=o(J,4);c(Re,{id:`filesystem-consistency`,children:(e,t)=>{s(),i(e,r(`Filesystem consistency`))},$$slots:{default:!0}});var ze=o(Re,2);l(ze,{id:`concurrent-modification`,children:(e,t)=>{s(),i(e,r(`Concurrent modification`))},$$slots:{default:!0}});var Be=o(ze,10);l(Be,{id:`busy-volume-errors`,children:(e,t)=>{s(),i(e,r(`Busy Volume errors`))},$$slots:{default:!0}});var Y=o(Be,2);f(o(e(Y)),{href:`/docs/sdk/py/latest/Volume#reload`,children:(e,t)=>{i(e,he())},$$slots:{default:!0}}),s(),n(Y);var Ve=o(Y,2);u(Ve,{code:`volume%20%3D%20modal.Volume.from_name(%22my-volume%22)%0A%0A%0A%40app.function(volumes%3D%7B%22%2Fvol%22%3A%20volume%7D)%0Adef%20reload_with_open_files()%3A%0A%20%20%20%20f%20%3D%20open(%22%2Fvol%2Fdata.txt%22%2C%20%22r%22)%0A%20%20%20%20volume.reload()%20%20%23%20Cannot%20reload%20when%20files%20in%20the%20Volume%20are%20open.`,lang:`python`});var He=o(Ve,2);l(He,{id:`cant-find-file-on-volume-errors`,children:(e,t)=>{s(),i(e,r(`Can’t find file on Volume errors`))},$$slots:{default:!0}});var Ue=o(He,6);u(Ue,{code:`import%20modal%0A%0Aapp%20%3D%20modal.App()%0Avol%20%3D%20modal.Volume.from_name(%22my-volume%22)%0A%0A%0A%40app.function(volumes%3D%7B%22%2Fdata%22%3A%20vol%7D)%0Adef%20run()%3A%0A%20%20%20%20with%20open(%22%2Fdata%2Fxyz.txt%22%2C%20%22w%22)%20as%20f%3A%0A%20%20%20%20%20%20%20%20f.write(%22hello%22)%0A%20%20%20%20vol.commit()`,lang:`python`});var We=o(Ue,4);c(We,{id:`disk-usage-reporting`,children:(e,t)=>{s(),i(e,r(`Disk usage reporting`))},$$slots:{default:!0}});var Ge=o(We,6);c(Ge,{id:`volumes-v2-overview`,children:(e,t)=>{s(),i(e,r(`Volumes v2 overview`))},$$slots:{default:!0}});var Ke=o(Ge,4);l(Ke,{id:`volumes-v2-are-still-in-beta`,children:(e,t)=>{s(),i(e,r(`Volumes v2 are still in Beta`))},$$slots:{default:!0}});var qe=o(Ke,2);ne(qe,{variant:`beta`,children:(e,t)=>{i(e,ge())},$$slots:{default:!0}});var Je=o(qe,4);l(Je,{id:`volumes-v2-are-hipaa-compliant`,children:(e,t)=>{s(),i(e,r(`Volumes v2 are HIPAA compliant`))},$$slots:{default:!0}});var Ye=o(Je,4);l(Ye,{id:`volumes-v2-is-more-scaleable`,children:(e,t)=>{s(),i(e,r(`Volumes v2 is more scaleable`))},$$slots:{default:!0}});var Xe=o(Ye,6);l(Xe,{id:`in-v2-you-can-store-as-many-files-as-you-want`,children:(e,t)=>{s(),i(e,r(`In v2, you can store as many files as you want`))},$$slots:{default:!0}});var Ze=o(Xe,6);l(Ze,{id:`in-v2-you-can-write-concurrently-from-hundreds-of-containers`,children:(e,t)=>{s(),i(e,r(`In v2, you can write concurrently from hundreds of containers`))},$$slots:{default:!0}});var X=o(Ze,8);l(X,{id:`in-v2-random-accesses-have-improved-performance`,children:(e,t)=>{s(),i(e,r(`In v2, random accesses have improved performance`))},$$slots:{default:!0}});var Qe=o(X,6);l(Qe,{id:`in-v2-you-can-commit-using-sync`,children:(e,t)=>{s();var n=_e();s(),i(e,n)},$$slots:{default:!0}});var $e=o(Qe,4);u($e,{code:`sync%20%2Fpath%2Fto%2Fmountpoint`,lang:`bash`});var Z=o($e,2);f(o(e(Z)),{href:`/docs/sdk/py/latest/Volume#commit`,children:(e,t)=>{i(e,ve())},$$slots:{default:!0}}),s(3),n(Z);var et=o(Z,6);u(et,{code:`%25%20modal%20shell%20--volume%20my-v2-volume%0Aroot%20%2F%20%E2%86%92%20echo%20%22hello%22%20%3E%20%2Fmnt%2Fmy-v2-volume%2Ftest.txt%0Aroot%20%2F%20%E2%86%92%20sync%20%2Fmnt%2Fmy-v2-volume%20%20%23%20Persist%20changes%20before%20exiting`,lang:`bash`});var tt=o(et,4);u(tt,{code:`sb%20%3D%20modal.Sandbox.create(%0A%20%20%20%20volumes%3D%7B%22%2Fdata%22%3A%20modal.Volume.from_name(%22my-v2-volume%22)%7D%2C%0A%20%20%20%20app%3Dmy_app%2C%0A)%0Asb.exec(%22bash%22%2C%20%22-c%22%2C%20%22echo%20'hello'%20%3E%20%2Fdata%2Ftest.txt%22).wait()%0A%0A%23%20Persist%20changes%20and%20check%20for%20errors%0Ap%20%3D%20sb.exec(%22sync%22%2C%20%22%2Fdata%22)%0Ap.wait()%0Aif%20p.returncode%20!%3D%200%3A%0A%20%20%20%20raise%20Exception(f%22sync%20failed%20with%20exit%20code%20%7Bp.returncode%7D%22)`,lang:`python`});var nt=o(tt,4);l(nt,{id:`volumes-v2-has-a-few-limits-in-place`,children:(e,t)=>{s(),i(e,r(`Volumes v2 has a few limits in place`))},$$slots:{default:!0}});var rt=o(nt,6);l(rt,{id:`upgrading-v1-volumes`,children:(e,t)=>{s(),i(e,r(`Upgrading v1 Volumes`))},$$slots:{default:!0}});var it=o(rt,10);u(it,{code:`%24%20modal%20volume%20create%20--version%3D2%202files2furious%0A%24%20modal%20shell%20--volume%20files-and-furious%20--volume%202files2furious%0AWelcome%20to%20Modal's%20debug%20shell!%0AWe've%20provided%20a%20number%20of%20utilities%20for%20you%2C%20like%20%60curl%60%20and%20%60ps%60.%0A%23%20Option%201%3A%20use%20%60cp%60%0Aroot%20%2F%20%E2%86%92%20cp%20-rp%20%2Fmnt%2Ffiles-and-furious%2F.%20%2Fmnt%2F2files2furious%2F.%0Aroot%20%2F%20%E2%86%92%20sync%20%2Fmnt%2F2files2furious%20%23%20Ensure%20changes%20are%20persisted%20before%20exiting%0A%0A%23%20Option%202%3A%20use%20%60rsync%60%0Aroot%20%2F%20%E2%86%92%20apt%20install%20-y%20rsync%0Aroot%20%2F%20%E2%86%92%20rsync%20-a%20%2Fmnt%2Ffiles-and-furious%2F.%20%2Fmnt%2F2files2furious%2F.%0Aroot%20%2F%20%E2%86%92%20sync%20%2Fmnt%2F2files2furious%20%23%20Ensure%20changes%20are%20persisted%20before%20exiting`,lang:`shell`});var at=o(it,2);c(at,{id:`further-examples`,children:(e,t)=>{s(),i(e,r(`Further examples`))},$$slots:{default:!0}});var ot=o(at,2),Q=e(ot);f(e(Q),{href:`/docs/examples/diffusers_lora_finetune`,children:(e,t)=>{s(),i(e,r(`Character LoRA fine-tuning`))},$$slots:{default:!0}}),s(),n(Q);var $=o(Q,2);f(e($),{href:`/docs/examples/chai1`,children:(e,t)=>{s(),i(e,r(`Protein folding`))},$$slots:{default:!0}}),s(),n($);var st=o($,2);f(e(st),{href:`/docs/examples/cron_datasette`,children:(e,t)=>{s(),i(e,r(`Dataset visualization with Datasette`))},$$slots:{default:!0}}),s(),n(st),n(ot),i(t,a)},$$slots:{default:!0}}))}export{v as default,p as metadata};
//# sourceMappingURL=DZqgGTUX.js.map
