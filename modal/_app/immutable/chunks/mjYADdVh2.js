(function(){try{var e=typeof window<`u`?window:typeof global<`u`?global:typeof globalThis<`u`?globalThis:typeof self<`u`?self:{};e.SENTRY_RELEASE={id:`f99fcf9f0a844cc9bd13fdc8e5782b84`};var t=new e.Error().stack;t&&(e._sentryDebugIds=e._sentryDebugIds||{},e._sentryDebugIds[t]=`67393ebc-20ed-4a70-87a1-b16dcc95cb0d`,e._sentryDebugIdIdentifier=`sentry-dbid-67393ebc-20ed-4a70-87a1-b16dcc95cb0d`)}catch{}})();import{$t as e,St as t,Tn as n,Tt as r,bt as i,c as ee,d as a,en as te,tn as o,wn as s}from"./F_ixKBiO.js";import"./B1sc9Zdx.js";import"./Bb2deiU3.js";import{a as c,i as l,o as ne}from"./CPby7b1n.js";import{t as u}from"./BILrvr3I.js";import{t as d}from"./B4L_if842.js";import{t as f}from"./DeWGVqas2.js";var p={crossLinks:[{text:`Mount S3 buckets in Modal Apps`,href:`/docs/examples/s3_bucket_mount`}],toc:[{depth:1,value:`Cloud bucket mounts`,id:`cloud-bucket-mounts`,children:[{depth:2,value:`Mounting Cloudflare R2 buckets`,id:`mounting-cloudflare-r2-buckets`},{depth:2,value:`Mounting Google Cloud Storage buckets`,id:`mounting-google-cloud-storage-buckets`},{depth:2,value:`Mounting S3 buckets`,id:`mounting-s3-buckets`,children:[{depth:3,value:`Specifying S3 bucket region`,id:`specifying-s3-bucket-region`},{depth:3,value:`Using AWS temporary security credentials`,id:`using-aws-temporary-security-credentials`},{depth:3,value:`Using OIDC identity tokens`,id:`using-oidc-identity-tokens`},{depth:3,value:`Mounting a path within a bucket`,id:`mounting-a-path-within-a-bucket`},{depth:3,value:`Read-only mode`,id:`read-only-mode`},{depth:3,value:`IAM permissions`,id:`iam-permissions`}]},{depth:2,value:`Limitations and troubleshooting`,id:`limitations-and-troubleshooting`,children:[{depth:3,value:`Writing files in append mode`,id:`writing-files-in-append-mode`},{depth:3,value:`Creating a file without a parent directory`,id:`creating-a-file-without-a-parent-directory`},{depth:3,value:`Using np.savez`,id:`using-npsavez`},{depth:3,value:`Torchtune writing checkpoint files`,id:`torchtune-writing-checkpoint-files`},{depth:3,value:`Using the TensorBoard SummaryWriter`,id:`using-the-tensorboard-summarywriter`}]}]}],rawContent:`# Cloud bucket mounts

The [\`modal.CloudBucketMount\`](/docs/sdk/py/latest/CloudBucketMount) is a
mutable volume that allows for both reading and writing files from a cloud
bucket. It supports AWS S3, Cloudflare R2, and Google Cloud Storage buckets.

Cloud bucket mounts are built on top of AWS'
[\`mountpoint\`](https://github.com/awslabs/mountpoint-s3) technology and inherits
its limitations. See the [Limitations and troubleshooting](#limitations-and-troubleshooting) section for more details.

## Mounting Cloudflare R2 buckets

\`CloudBucketMount\` enables Cloudflare R2 buckets to be mounted as file system
volumes. Because Cloudflare R2 is
[S3-Compatible](https://developers.cloudflare.com/r2/api/s3/api/) the setup is
very similar between R2 and S3. See
[modal.CloudBucketMount](/docs/sdk/py/latest/CloudBucketMount)
for usage instructions.

When creating the R2 API token for use with the mount, you need to have the
ability to read, write, and list objects in the specific buckets you will mount.
You do _not_ need admin permissions, and you should _not_ use "Client IP Address
Filtering".

## Mounting Google Cloud Storage buckets

\`CloudBucketMount\` enables Google Cloud Storage (GCS) buckets to be mounted as file system
volumes. See [modal.CloudBucketMount](/docs/sdk/py/latest/CloudBucketMount)
for GCS setup instructions.

## Mounting S3 buckets

\`CloudBucketMount\` enables S3 buckets to be mounted as file system volumes. To
interact with a bucket, you must have the appropriate IAM permissions configured
(refer to the section on [IAM Permissions](#iam-permissions)).

\`\`\`python
import modal
import subprocess

app = modal.App()

s3_bucket_name = "s3-bucket-name"  # Bucket name not ARN.
s3_access_credentials = modal.Secret.from_dict({
    "AWS_ACCESS_KEY_ID": "...",
    "AWS_SECRET_ACCESS_KEY": "...",
    "AWS_REGION": "..."
})

@app.function(
    volumes={
        "/my-mount": modal.CloudBucketMount(s3_bucket_name, secret=s3_access_credentials)
    }
)
def f():
    subprocess.run(["ls", "/my-mount"])
\`\`\`

### Specifying S3 bucket region

Amazon S3 buckets are associated with a single AWS Region. [\`Mountpoint\`](https://github.com/awslabs/mountpoint-s3) attempts to automatically detect the region for your S3 bucket at startup time and directs all S3 requests to that region. However, in certain scenarios, like if your container is running on an AWS worker in a certain region, while your bucket is in a different region, this automatic detection may fail.

To avoid this issue, you can specify the region of your S3 bucket by adding an \`AWS_REGION\` key to your Modal Secrets, as in the code example above.

### Using AWS temporary security credentials

\`CloudBucketMount\`s also support AWS temporary security credentials by passing
the additional environment variable \`AWS_SESSION_TOKEN\`. Temporary credentials
will expire and will not get renewed automatically. You will need to update
the corresponding Modal Secret in order to prevent failures.

You can get temporary credentials with the [AWS CLI](https://aws.amazon.com/cli/) with:

\`\`\`shell
$ aws configure export-credentials --format env
export AWS_ACCESS_KEY_ID=XXX
export AWS_SECRET_ACCESS_KEY=XXX
export AWS_SESSION_TOKEN=XXX...
\`\`\`

All these values are required.

### Using OIDC identity tokens

Modal provides [OIDC integration](/docs/guide/oidc-integration) and will automatically generate identity tokens to authenticate to AWS.
OIDC eliminates the need for manual token passing through Modal Secrets and is based on short-lived tokens, which limits the window of exposure if a token is compromised.
To use this feature, you must [configure AWS to trust Modal's OIDC provider](/docs/guide/oidc-integration#step-1-configure-aws-to-trust-modals-oidc-provider)
and [create an IAM role that can be assumed by Modal Functions](/docs/guide/oidc-integration#step-2-create-an-iam-role-that-can-be-assumed-by-modal-functions).

Then, you specify the IAM role that your Modal Function should assume to access the S3 bucket.

\`\`\`python
import modal

app = modal.App()

s3_bucket_name = "s3-bucket-name"
role_arn = "arn:aws:iam::123456789abcd:role/s3mount-role"

@app.function(
    volumes={
        "/my-mount": modal.CloudBucketMount(
            bucket_name=s3_bucket_name,
            oidc_auth_role_arn=role_arn
        )
    }
)
def f():
    subprocess.run(["ls", "/my-mount"])
\`\`\`

### Mounting a path within a bucket

To mount only the files under a specific subdirectory, you can specify a path prefix using \`key_prefix\`.
Since this prefix specifies a directory, it must end in a \`/\`.
The entire bucket is mounted when no prefix is supplied.

\`\`\`python
import modal
import subprocess

app = modal.App()

s3_bucket_name = "s3-bucket-name"
prefix = 'path/to/dir/'

s3_access_credentials = modal.Secret.from_dict({
    "AWS_ACCESS_KEY_ID": "...",
    "AWS_SECRET_ACCESS_KEY": "...",
})

@app.function(
    volumes={
        "/my-mount": modal.CloudBucketMount(
            bucket_name=s3_bucket_name,
            key_prefix=prefix,
            secret=s3_access_credentials
        )
    }
)
def f():
    subprocess.run(["ls", "/my-mount"])
\`\`\`

This will only mount the files in the bucket \`s3-bucket-name\` that are prefixed by \`path/to/dir/\`.

### Read-only mode

To mount a bucket in read-only mode, set \`read_only=True\` as an argument.

\`\`\`python
import modal
import subprocess

app = modal.App()

s3_bucket_name = "s3-bucket-name"  # Bucket name not ARN.
s3_access_credentials = modal.Secret.from_dict({
    "AWS_ACCESS_KEY_ID": "...",
    "AWS_SECRET_ACCESS_KEY": "...",
})

@app.function(
    volumes={
        "/my-mount": modal.CloudBucketMount(s3_bucket_name, secret=s3_access_credentials, read_only=True)
    }
)
def f():
    subprocess.run(["ls", "/my-mount"])
\`\`\`

While S3 mounts support both write and read operations, they are optimized for
reading large files sequentially. Certain file operations, such as renaming
files, are not supported. For a comprehensive list of supported operations,
consult the
[Mountpoint documentation](https://github.com/awslabs/mountpoint-s3/blob/main/doc/SEMANTICS.md).

### IAM permissions

To utilize \`CloudBucketMount\` for reading and writing files from S3 buckets,
your IAM policy must include permissions for \`s3:PutObject\`,
\`s3:AbortMultipartUpload\`, and \`s3:DeleteObject\`. These permissions are not
required for mounts configured with \`read_only=True\`.

\`\`\`json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "ModalListBucketAccess",
      "Effect": "Allow",
      "Action": ["s3:ListBucket"],
      "Resource": ["arn:aws:s3:::<MY-S3-BUCKET>"]
    },
    {
      "Sid": "ModalBucketAccess",
      "Effect": "Allow",
      "Action": [
        "s3:GetObject",
        "s3:PutObject",
        "s3:AbortMultipartUpload",
        "s3:DeleteObject"
      ],
      "Resource": ["arn:aws:s3:::<MY-S3-BUCKET>/*"]
    }
  ]
}
\`\`\`

## Limitations and troubleshooting

Cloud Bucket Mounts have certain limitations that do not apply to [Volumes](/docs/guide/volumes).
These limitations are primarily around the way that files can be opened and edited in Cloud Bucket Mounts. For
a comprehensive list of limitations, see the [Mountpoint troubleshooting documentation](https://github.com/awslabs/mountpoint-s3/blob/a6179c72bfc237a1fdd06eb4a0863ca537f8d8a7/doc/TROUBLESHOOTING.md)
and the [Mountpoint semantics documentation](https://github.com/awslabs/mountpoint-s3/blob/main/doc/SEMANTICS.md).

The most common issues that users encounter are:

- Files cannot be opened in append mode.
- Files cannot be written to at arbitrary offsets i.e. \`seek\` and write are not supported together.
- To write to a file, you must open it in \`truncate\` mode.

These operations typically result in a \`PermissionError: [Errno 1] Operation not permitted\` error.

If you need these features, give [Volumes](/docs/guide/volumes) a try! If you need these features in S3
and are willing to pay extra for your bucket, you may be able to use [S3 Express](https://aws.amazon.com/s3/storage-classes/express-one-zone/).
Contact us [in our Slack](https://modal.com/slack) if you're interested in using S3 Express.

### Writing files in append mode

If you're using a library which must open a file in append mode, it's best to write to a temporary file
and then move it to your bucket's mount path. A similar approach can be used to write to a file at an arbitrary offset.

\`\`\`python notest
import tempfile
import shutil

@app.function(
    volumes={"/bucket": modal.CloudBucketMount("my-bucket", secret=s3_credentials)}
)
def append_to_log():
    # Write to a temporary file that supports append mode
    with tempfile.NamedTemporaryFile(mode='a', delete=False) as temp_file:
        temp_file.write("Log entry 1\\n")
        temp_file.write("Log entry 2\\n")
        temp_path = temp_file.name

    # Move the completed file to the bucket mount
    shutil.move(temp_path, "/bucket/logfile.txt")
\`\`\`

### Creating a file without a parent directory

If you try to create a file in a directory that doesn't exist, you'll get a \`Operation not permitted\` error.
To fix this, create the parent directory first with \`Path(dst).parent.mkdir(exist_ok=True, parents=True)\`.

### Using \`np.savez\`

\`np.savez\` seeks to random offsets in a file, making it unsafe for Cloud Bucket Mounts. If your file is large,
you can write it to a temporary file and then move it to your bucket's mount path. If it's small, however,
you can solve this with an in-memory buffer:

\`\`\`python notest
import io
import numpy as np
import shutil

data = np.random.rand(1000, 512)

# 1. Build the archive entirely in memory
tmp = io.BytesIO()
np.savez_compressed(tmp, array=data)

# 2. Copy it once, sequentially, to the mount point
dest = "/bucket/data.npz"
with open(dest, "wb") as f:
    shutil.copyfileobj(tmp, f)
\`\`\`

### Torchtune writing checkpoint files

Old versions of [Torchtune](https://github.com/pytorch/torchtune) are incompatible with Cloud Bucket Mounts.
Upgrade to a version greater than or equal to \`0.6.1\` to ensure checkpoints can be written to the bucket.

### Using the TensorBoard \`SummaryWriter\`

The TensorBoard \`SummaryWriter\` opens log files in append mode. These files are quite small, though,
so we recommend writing to a temporary directory and using the [Watchdog](https://github.com/gorakhargosh/watchdog)
Python library to copy the files to the bucket mount path as they come in.

This is a case where it may be worth it to use [Volumes](/docs/guide/volumes) instead - in particular,
training logs are sometimes not subject to the same compliance requirements that force something like checkpoints
or model weights to be stored in a secure location. We even have an example of
[how to use TensorBoard on Volumes](/docs/examples/torch_profiling#serving-tensorboard-on-modal-to-view-pytorch-profiles-and-traces).
`,meta:{title:`Cloud bucket mounts`,description:`The modal.CloudBucketMount is a mutable volume that allows for both reading and writing files from a cloud bucket. It supports AWS S3, Cloudflare R2, and Google Cloud Storage buckets.`}},{crossLinks:m,toc:h,rawContent:re,meta:g}=p,ie=t(`<code>modal.CloudBucketMount</code>`),ae=t(`<code>mountpoint</code>`),oe=t(`<code>Mountpoint</code>`),se=t(`Using <code>np.savez</code>`,1),ce=t(`Using the TensorBoard <code>SummaryWriter</code>`,1),le=t(`<!> <p>The <!> is a
mutable volume that allows for both reading and writing files from a cloud
bucket. It supports AWS S3, Cloudflare R2, and Google Cloud Storage buckets.</p> <p>Cloud bucket mounts are built on top of AWS’ <!> technology and inherits
its limitations. See the <!> section for more details.</p> <!> <p><code>CloudBucketMount</code> enables Cloudflare R2 buckets to be mounted as file system
volumes. Because Cloudflare R2 is <!> the setup is
very similar between R2 and S3. See <!> for usage instructions.</p> <p>When creating the R2 API token for use with the mount, you need to have the
ability to read, write, and list objects in the specific buckets you will mount.
You do <em>not</em> need admin permissions, and you should <em>not</em> use “Client IP Address
Filtering”.</p> <!> <p><code>CloudBucketMount</code> enables Google Cloud Storage (GCS) buckets to be mounted as file system
volumes. See <!> for GCS setup instructions.</p> <!> <p><code>CloudBucketMount</code> enables S3 buckets to be mounted as file system volumes. To
interact with a bucket, you must have the appropriate IAM permissions configured
(refer to the section on <!>).</p> <!> <!> <p>Amazon S3 buckets are associated with a single AWS Region. <!> attempts to automatically detect the region for your S3 bucket at startup time and directs all S3 requests to that region. However, in certain scenarios, like if your container is running on an AWS worker in a certain region, while your bucket is in a different region, this automatic detection may fail.</p> <p>To avoid this issue, you can specify the region of your S3 bucket by adding an <code>AWS_REGION</code> key to your Modal Secrets, as in the code example above.</p> <!> <p><code>CloudBucketMount</code>s also support AWS temporary security credentials by passing
the additional environment variable <code>AWS_SESSION_TOKEN</code>. Temporary credentials
will expire and will not get renewed automatically. You will need to update
the corresponding Modal Secret in order to prevent failures.</p> <p>You can get temporary credentials with the <!> with:</p> <!> <p>All these values are required.</p> <!> <p>Modal provides <!> and will automatically generate identity tokens to authenticate to AWS.
OIDC eliminates the need for manual token passing through Modal Secrets and is based on short-lived tokens, which limits the window of exposure if a token is compromised.
To use this feature, you must <!> and <!>.</p> <p>Then, you specify the IAM role that your Modal Function should assume to access the S3 bucket.</p> <!> <!> <p>To mount only the files under a specific subdirectory, you can specify a path prefix using <code>key_prefix</code>.
Since this prefix specifies a directory, it must end in a <code>/</code>.
The entire bucket is mounted when no prefix is supplied.</p> <!> <p>This will only mount the files in the bucket <code>s3-bucket-name</code> that are prefixed by <code>path/to/dir/</code>.</p> <!> <p>To mount a bucket in read-only mode, set <code>read_only=True</code> as an argument.</p> <!> <p>While S3 mounts support both write and read operations, they are optimized for
reading large files sequentially. Certain file operations, such as renaming
files, are not supported. For a comprehensive list of supported operations,
consult the <!>.</p> <!> <p>To utilize <code>CloudBucketMount</code> for reading and writing files from S3 buckets,
your IAM policy must include permissions for <code>s3:PutObject</code>, <code>s3:AbortMultipartUpload</code>, and <code>s3:DeleteObject</code>. These permissions are not
required for mounts configured with <code>read_only=True</code>.</p> <!> <!> <p>Cloud Bucket Mounts have certain limitations that do not apply to <!>.
These limitations are primarily around the way that files can be opened and edited in Cloud Bucket Mounts. For
a comprehensive list of limitations, see the <!> and the <!>.</p> <p>The most common issues that users encounter are:</p> <ul><li>Files cannot be opened in append mode.</li> <li>Files cannot be written to at arbitrary offsets i.e. <code>seek</code> and write are not supported together.</li> <li>To write to a file, you must open it in <code>truncate</code> mode.</li></ul> <p>These operations typically result in a <code>PermissionError: [Errno 1] Operation not permitted</code> error.</p> <p>If you need these features, give <!> a try! If you need these features in S3
and are willing to pay extra for your bucket, you may be able to use <!>.
Contact us <!> if you’re interested in using S3 Express.</p> <!> <p>If you’re using a library which must open a file in append mode, it’s best to write to a temporary file
and then move it to your bucket’s mount path. A similar approach can be used to write to a file at an arbitrary offset.</p> <!> <!> <p>If you try to create a file in a directory that doesn’t exist, you’ll get a <code>Operation not permitted</code> error.
To fix this, create the parent directory first with <code>Path(dst).parent.mkdir(exist_ok=True, parents=True)</code>.</p> <!> <p><code>np.savez</code> seeks to random offsets in a file, making it unsafe for Cloud Bucket Mounts. If your file is large,
you can write it to a temporary file and then move it to your bucket’s mount path. If it’s small, however,
you can solve this with an in-memory buffer:</p> <!> <!> <p>Old versions of <!> are incompatible with Cloud Bucket Mounts.
Upgrade to a version greater than or equal to <code>0.6.1</code> to ensure checkpoints can be written to the bucket.</p> <!> <p>The TensorBoard <code>SummaryWriter</code> opens log files in append mode. These files are quite small, though,
so we recommend writing to a temporary directory and using the <!> Python library to copy the files to the bucket mount path as they come in.</p> <p>This is a case where it may be worth it to use <!> instead - in particular,
training logs are sometimes not subject to the same compliance requirements that force something like checkpoints
or model weights to be stored in a secure location. We even have an example of <!>.</p>`,1);function _(t,m){let h=ee(m,[`children`,`$$slots`,`$$events`,`$$legacy`]);d(t,a(()=>h,()=>p,{children:(t,ee)=>{var a=le(),d=te(a);ne(d,{id:`cloud-bucket-mounts`,children:(e,t)=>{s(),i(e,r(`Cloud bucket mounts`))},$$slots:{default:!0}});var p=o(d,2);f(o(e(p)),{href:`/docs/sdk/py/latest/CloudBucketMount`,children:(e,t)=>{i(e,ie())},$$slots:{default:!0}}),s(),n(p);var m=o(p,2),h=o(e(m));f(h,{href:`https://github.com/awslabs/mountpoint-s3`,rel:`nofollow`,children:(e,t)=>{i(e,ae())},$$slots:{default:!0}}),f(o(h,2),{href:`#limitations-and-troubleshooting`,children:(e,t)=>{s(),i(e,r(`Limitations and troubleshooting`))},$$slots:{default:!0}}),s(),n(m);var re=o(m,2);c(re,{id:`mounting-cloudflare-r2-buckets`,children:(e,t)=>{s(),i(e,r(`Mounting Cloudflare R2 buckets`))},$$slots:{default:!0}});var g=o(re,2),_=o(e(g),2);f(_,{href:`https://developers.cloudflare.com/r2/api/s3/api/`,rel:`nofollow`,children:(e,t)=>{s(),i(e,r(`S3-Compatible`))},$$slots:{default:!0}}),f(o(_,2),{href:`/docs/sdk/py/latest/CloudBucketMount`,children:(e,t)=>{s(),i(e,r(`modal.CloudBucketMount`))},$$slots:{default:!0}}),s(),n(g);var v=o(g,4);c(v,{id:`mounting-google-cloud-storage-buckets`,children:(e,t)=>{s(),i(e,r(`Mounting Google Cloud Storage buckets`))},$$slots:{default:!0}});var y=o(v,2);f(o(e(y),2),{href:`/docs/sdk/py/latest/CloudBucketMount`,children:(e,t)=>{s(),i(e,r(`modal.CloudBucketMount`))},$$slots:{default:!0}}),s(),n(y);var b=o(y,2);c(b,{id:`mounting-s3-buckets`,children:(e,t)=>{s(),i(e,r(`Mounting S3 buckets`))},$$slots:{default:!0}});var x=o(b,2);f(o(e(x),2),{href:`#iam-permissions`,children:(e,t)=>{s(),i(e,r(`IAM Permissions`))},$$slots:{default:!0}}),s(),n(x);var S=o(x,2);u(S,{code:`import%20modal%0Aimport%20subprocess%0A%0Aapp%20%3D%20modal.App()%0A%0As3_bucket_name%20%3D%20%22s3-bucket-name%22%20%20%23%20Bucket%20name%20not%20ARN.%0As3_access_credentials%20%3D%20modal.Secret.from_dict(%7B%0A%20%20%20%20%22AWS_ACCESS_KEY_ID%22%3A%20%22...%22%2C%0A%20%20%20%20%22AWS_SECRET_ACCESS_KEY%22%3A%20%22...%22%2C%0A%20%20%20%20%22AWS_REGION%22%3A%20%22...%22%0A%7D)%0A%0A%40app.function(%0A%20%20%20%20volumes%3D%7B%0A%20%20%20%20%20%20%20%20%22%2Fmy-mount%22%3A%20modal.CloudBucketMount(s3_bucket_name%2C%20secret%3Ds3_access_credentials)%0A%20%20%20%20%7D%0A)%0Adef%20f()%3A%0A%20%20%20%20subprocess.run(%5B%22ls%22%2C%20%22%2Fmy-mount%22%5D)`,lang:`python`});var C=o(S,2);l(C,{id:`specifying-s3-bucket-region`,children:(e,t)=>{s(),i(e,r(`Specifying S3 bucket region`))},$$slots:{default:!0}});var w=o(C,2);f(o(e(w)),{href:`https://github.com/awslabs/mountpoint-s3`,rel:`nofollow`,children:(e,t)=>{i(e,oe())},$$slots:{default:!0}}),s(),n(w);var T=o(w,4);l(T,{id:`using-aws-temporary-security-credentials`,children:(e,t)=>{s(),i(e,r(`Using AWS temporary security credentials`))},$$slots:{default:!0}});var E=o(T,4);f(o(e(E)),{href:`https://aws.amazon.com/cli/`,rel:`nofollow`,children:(e,t)=>{s(),i(e,r(`AWS CLI`))},$$slots:{default:!0}}),s(),n(E);var D=o(E,2);u(D,{code:`%24%20aws%20configure%20export-credentials%20--format%20env%0Aexport%20AWS_ACCESS_KEY_ID%3DXXX%0Aexport%20AWS_SECRET_ACCESS_KEY%3DXXX%0Aexport%20AWS_SESSION_TOKEN%3DXXX...`,lang:`shell`});var O=o(D,4);l(O,{id:`using-oidc-identity-tokens`,children:(e,t)=>{s(),i(e,r(`Using OIDC identity tokens`))},$$slots:{default:!0}});var k=o(O,2),A=o(e(k));f(A,{href:`/docs/guide/oidc-integration`,children:(e,t)=>{s(),i(e,r(`OIDC integration`))},$$slots:{default:!0}});var j=o(A,2);f(j,{href:`/docs/guide/oidc-integration#step-1-configure-aws-to-trust-modals-oidc-provider`,children:(e,t)=>{s(),i(e,r(`configure AWS to trust Modal’s OIDC provider`))},$$slots:{default:!0}}),f(o(j,2),{href:`/docs/guide/oidc-integration#step-2-create-an-iam-role-that-can-be-assumed-by-modal-functions`,children:(e,t)=>{s(),i(e,r(`create an IAM role that can be assumed by Modal Functions`))},$$slots:{default:!0}}),s(),n(k);var M=o(k,4);u(M,{code:`import%20modal%0A%0Aapp%20%3D%20modal.App()%0A%0As3_bucket_name%20%3D%20%22s3-bucket-name%22%0Arole_arn%20%3D%20%22arn%3Aaws%3Aiam%3A%3A123456789abcd%3Arole%2Fs3mount-role%22%0A%0A%40app.function(%0A%20%20%20%20volumes%3D%7B%0A%20%20%20%20%20%20%20%20%22%2Fmy-mount%22%3A%20modal.CloudBucketMount(%0A%20%20%20%20%20%20%20%20%20%20%20%20bucket_name%3Ds3_bucket_name%2C%0A%20%20%20%20%20%20%20%20%20%20%20%20oidc_auth_role_arn%3Drole_arn%0A%20%20%20%20%20%20%20%20)%0A%20%20%20%20%7D%0A)%0Adef%20f()%3A%0A%20%20%20%20subprocess.run(%5B%22ls%22%2C%20%22%2Fmy-mount%22%5D)`,lang:`python`});var N=o(M,2);l(N,{id:`mounting-a-path-within-a-bucket`,children:(e,t)=>{s(),i(e,r(`Mounting a path within a bucket`))},$$slots:{default:!0}});var P=o(N,4);u(P,{code:`import%20modal%0Aimport%20subprocess%0A%0Aapp%20%3D%20modal.App()%0A%0As3_bucket_name%20%3D%20%22s3-bucket-name%22%0Aprefix%20%3D%20'path%2Fto%2Fdir%2F'%0A%0As3_access_credentials%20%3D%20modal.Secret.from_dict(%7B%0A%20%20%20%20%22AWS_ACCESS_KEY_ID%22%3A%20%22...%22%2C%0A%20%20%20%20%22AWS_SECRET_ACCESS_KEY%22%3A%20%22...%22%2C%0A%7D)%0A%0A%40app.function(%0A%20%20%20%20volumes%3D%7B%0A%20%20%20%20%20%20%20%20%22%2Fmy-mount%22%3A%20modal.CloudBucketMount(%0A%20%20%20%20%20%20%20%20%20%20%20%20bucket_name%3Ds3_bucket_name%2C%0A%20%20%20%20%20%20%20%20%20%20%20%20key_prefix%3Dprefix%2C%0A%20%20%20%20%20%20%20%20%20%20%20%20secret%3Ds3_access_credentials%0A%20%20%20%20%20%20%20%20)%0A%20%20%20%20%7D%0A)%0Adef%20f()%3A%0A%20%20%20%20subprocess.run(%5B%22ls%22%2C%20%22%2Fmy-mount%22%5D)`,lang:`python`});var ue=o(P,4);l(ue,{id:`read-only-mode`,children:(e,t)=>{s(),i(e,r(`Read-only mode`))},$$slots:{default:!0}});var F=o(ue,4);u(F,{code:`import%20modal%0Aimport%20subprocess%0A%0Aapp%20%3D%20modal.App()%0A%0As3_bucket_name%20%3D%20%22s3-bucket-name%22%20%20%23%20Bucket%20name%20not%20ARN.%0As3_access_credentials%20%3D%20modal.Secret.from_dict(%7B%0A%20%20%20%20%22AWS_ACCESS_KEY_ID%22%3A%20%22...%22%2C%0A%20%20%20%20%22AWS_SECRET_ACCESS_KEY%22%3A%20%22...%22%2C%0A%7D)%0A%0A%40app.function(%0A%20%20%20%20volumes%3D%7B%0A%20%20%20%20%20%20%20%20%22%2Fmy-mount%22%3A%20modal.CloudBucketMount(s3_bucket_name%2C%20secret%3Ds3_access_credentials%2C%20read_only%3DTrue)%0A%20%20%20%20%7D%0A)%0Adef%20f()%3A%0A%20%20%20%20subprocess.run(%5B%22ls%22%2C%20%22%2Fmy-mount%22%5D)`,lang:`python`});var I=o(F,2);f(o(e(I)),{href:`https://github.com/awslabs/mountpoint-s3/blob/main/doc/SEMANTICS.md`,rel:`nofollow`,children:(e,t)=>{s(),i(e,r(`Mountpoint documentation`))},$$slots:{default:!0}}),s(),n(I);var L=o(I,2);l(L,{id:`iam-permissions`,children:(e,t)=>{s(),i(e,r(`IAM permissions`))},$$slots:{default:!0}});var R=o(L,4);u(R,{code:`%7B%0A%20%20%22Version%22%3A%20%222012-10-17%22%2C%0A%20%20%22Statement%22%3A%20%5B%0A%20%20%20%20%7B%0A%20%20%20%20%20%20%22Sid%22%3A%20%22ModalListBucketAccess%22%2C%0A%20%20%20%20%20%20%22Effect%22%3A%20%22Allow%22%2C%0A%20%20%20%20%20%20%22Action%22%3A%20%5B%22s3%3AListBucket%22%5D%2C%0A%20%20%20%20%20%20%22Resource%22%3A%20%5B%22arn%3Aaws%3As3%3A%3A%3A%3CMY-S3-BUCKET%3E%22%5D%0A%20%20%20%20%7D%2C%0A%20%20%20%20%7B%0A%20%20%20%20%20%20%22Sid%22%3A%20%22ModalBucketAccess%22%2C%0A%20%20%20%20%20%20%22Effect%22%3A%20%22Allow%22%2C%0A%20%20%20%20%20%20%22Action%22%3A%20%5B%0A%20%20%20%20%20%20%20%20%22s3%3AGetObject%22%2C%0A%20%20%20%20%20%20%20%20%22s3%3APutObject%22%2C%0A%20%20%20%20%20%20%20%20%22s3%3AAbortMultipartUpload%22%2C%0A%20%20%20%20%20%20%20%20%22s3%3ADeleteObject%22%0A%20%20%20%20%20%20%5D%2C%0A%20%20%20%20%20%20%22Resource%22%3A%20%5B%22arn%3Aaws%3As3%3A%3A%3A%3CMY-S3-BUCKET%3E%2F*%22%5D%0A%20%20%20%20%7D%0A%20%20%5D%0A%7D`,lang:`json`});var z=o(R,2);c(z,{id:`limitations-and-troubleshooting`,children:(e,t)=>{s(),i(e,r(`Limitations and troubleshooting`))},$$slots:{default:!0}});var B=o(z,2),V=o(e(B));f(V,{href:`/docs/guide/volumes`,children:(e,t)=>{s(),i(e,r(`Volumes`))},$$slots:{default:!0}});var H=o(V,2);f(H,{href:`https://github.com/awslabs/mountpoint-s3/blob/a6179c72bfc237a1fdd06eb4a0863ca537f8d8a7/doc/TROUBLESHOOTING.md`,rel:`nofollow`,children:(e,t)=>{s(),i(e,r(`Mountpoint troubleshooting documentation`))},$$slots:{default:!0}}),f(o(H,2),{href:`https://github.com/awslabs/mountpoint-s3/blob/main/doc/SEMANTICS.md`,rel:`nofollow`,children:(e,t)=>{s(),i(e,r(`Mountpoint semantics documentation`))},$$slots:{default:!0}}),s(),n(B);var U=o(B,8),W=o(e(U));f(W,{href:`/docs/guide/volumes`,children:(e,t)=>{s(),i(e,r(`Volumes`))},$$slots:{default:!0}});var G=o(W,2);f(G,{href:`https://aws.amazon.com/s3/storage-classes/express-one-zone/`,rel:`nofollow`,children:(e,t)=>{s(),i(e,r(`S3 Express`))},$$slots:{default:!0}}),f(o(G,2),{href:`https://modal.com/slack`,rel:`nofollow`,children:(e,t)=>{s(),i(e,r(`in our Slack`))},$$slots:{default:!0}}),s(),n(U);var K=o(U,2);l(K,{id:`writing-files-in-append-mode`,children:(e,t)=>{s(),i(e,r(`Writing files in append mode`))},$$slots:{default:!0}});var q=o(K,4);u(q,{code:`import%20tempfile%0Aimport%20shutil%0A%0A%40app.function(%0A%20%20%20%20volumes%3D%7B%22%2Fbucket%22%3A%20modal.CloudBucketMount(%22my-bucket%22%2C%20secret%3Ds3_credentials)%7D%0A)%0Adef%20append_to_log()%3A%0A%20%20%20%20%23%20Write%20to%20a%20temporary%20file%20that%20supports%20append%20mode%0A%20%20%20%20with%20tempfile.NamedTemporaryFile(mode%3D'a'%2C%20delete%3DFalse)%20as%20temp_file%3A%0A%20%20%20%20%20%20%20%20temp_file.write(%22Log%20entry%201%5Cn%22)%0A%20%20%20%20%20%20%20%20temp_file.write(%22Log%20entry%202%5Cn%22)%0A%20%20%20%20%20%20%20%20temp_path%20%3D%20temp_file.name%0A%0A%20%20%20%20%23%20Move%20the%20completed%20file%20to%20the%20bucket%20mount%0A%20%20%20%20shutil.move(temp_path%2C%20%22%2Fbucket%2Flogfile.txt%22)`,lang:`python`});var J=o(q,2);l(J,{id:`creating-a-file-without-a-parent-directory`,children:(e,t)=>{s(),i(e,r(`Creating a file without a parent directory`))},$$slots:{default:!0}});var Y=o(J,4);l(Y,{id:`using-npsavez`,children:(e,t)=>{s();var n=se();s(),i(e,n)},$$slots:{default:!0}});var X=o(Y,4);u(X,{code:`import%20io%0Aimport%20numpy%20as%20np%0Aimport%20shutil%0A%0Adata%20%3D%20np.random.rand(1000%2C%20512)%0A%0A%23%201.%20Build%20the%20archive%20entirely%20in%20memory%0Atmp%20%3D%20io.BytesIO()%0Anp.savez_compressed(tmp%2C%20array%3Ddata)%0A%0A%23%202.%20Copy%20it%20once%2C%20sequentially%2C%20to%20the%20mount%20point%0Adest%20%3D%20%22%2Fbucket%2Fdata.npz%22%0Awith%20open(dest%2C%20%22wb%22)%20as%20f%3A%0A%20%20%20%20shutil.copyfileobj(tmp%2C%20f)`,lang:`python`});var Z=o(X,2);l(Z,{id:`torchtune-writing-checkpoint-files`,children:(e,t)=>{s(),i(e,r(`Torchtune writing checkpoint files`))},$$slots:{default:!0}});var Q=o(Z,2);f(o(e(Q)),{href:`https://github.com/pytorch/torchtune`,rel:`nofollow`,children:(e,t)=>{s(),i(e,r(`Torchtune`))},$$slots:{default:!0}}),s(3),n(Q);var de=o(Q,2);l(de,{id:`using-the-tensorboard-summarywriter`,children:(e,t)=>{s();var n=ce();s(),i(e,n)},$$slots:{default:!0}});var $=o(de,2);f(o(e($),3),{href:`https://github.com/gorakhargosh/watchdog`,rel:`nofollow`,children:(e,t)=>{s(),i(e,r(`Watchdog`))},$$slots:{default:!0}}),s(),n($);var fe=o($,2),pe=o(e(fe));f(pe,{href:`/docs/guide/volumes`,children:(e,t)=>{s(),i(e,r(`Volumes`))},$$slots:{default:!0}}),f(o(pe,2),{href:`/docs/examples/torch_profiling#serving-tensorboard-on-modal-to-view-pytorch-profiles-and-traces`,children:(e,t)=>{s(),i(e,r(`how to use TensorBoard on Volumes`))},$$slots:{default:!0}}),s(),n(fe),i(t,a)},$$slots:{default:!0}}))}export{_ as default,p as metadata};
//# sourceMappingURL=mjYADdVh2.js.map
