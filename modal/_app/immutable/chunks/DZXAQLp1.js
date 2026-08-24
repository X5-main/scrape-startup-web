(function(){try{var e=typeof window<`u`?window:typeof global<`u`?global:typeof globalThis<`u`?globalThis:typeof self<`u`?self:{};e.SENTRY_RELEASE={id:`f99fcf9f0a844cc9bd13fdc8e5782b84`};var t=new e.Error().stack;t&&(e._sentryDebugIds=e._sentryDebugIds||{},e._sentryDebugIds[t]=`8eb74be2-8d67-41ab-b6ee-83f47ef21530`,e._sentryDebugIdIdentifier=`sentry-dbid-8eb74be2-8d67-41ab-b6ee-83f47ef21530`)}catch{}})();import{$t as e,St as t,Tn as n,Tt as r,bt as i,c as a,d as o,en as s,tn as c,wn as l}from"./F_ixKBiO.js";import"./B1sc9Zdx.js";import"./Bb2deiU3.js";import{o as u}from"./CPby7b1n.js";import{t as d}from"./BILrvr3I.js";import{t as f}from"./B4L_if842.js";import{t as p}from"./DeWGVqas2.js";import"./B6UiYoTw.js";var m={toc:[{depth:1,value:`CloudBucketMount`,id:`cloudbucketmount`}],rawContent:`# CloudBucketMount


\`\`\`python
class CloudBucketMount(object)
\`\`\`

Mounts a cloud bucket to your container. Currently supports AWS S3 buckets.

S3 buckets are mounted using [AWS S3 Mountpoint](https://github.com/awslabs/mountpoint-s3).
S3 mounts are optimized for reading large files sequentially. It does not support every file operation; consult
[the AWS S3 Mountpoint documentation](https://github.com/awslabs/mountpoint-s3/blob/main/doc/SEMANTICS.md)
for more information.

**Usage**

S3:

\`\`\`python
import subprocess

app = modal.App()
secret = modal.Secret.from_name(
    "aws-secret",
    required_keys=["AWS_ACCESS_KEY_ID", "AWS_SECRET_ACCESS_KEY"]
    # Note: providing AWS_REGION can help when automatic detection of the bucket region fails.
)

@app.function(
    volumes={
        "/my-mount": modal.CloudBucketMount(
            bucket_name="s3-bucket-name",
            secret=secret,
            read_only=True
        )
    }
)
def f():
    subprocess.run(["ls", "/my-mount"], check=True)
\`\`\`

R2:

Cloudflare R2 is [S3-compatible](https://developers.cloudflare.com/r2/api/s3/api/) so its setup looks
very similar to S3. But additionally the \`bucket_endpoint_url\` argument must be passed.

\`\`\`python
import subprocess

app = modal.App()
secret = modal.Secret.from_name(
    "r2-secret",
    required_keys=["AWS_ACCESS_KEY_ID", "AWS_SECRET_ACCESS_KEY"]
)

@app.function(
    volumes={
        "/my-mount": modal.CloudBucketMount(
            bucket_name="my-r2-bucket",
            bucket_endpoint_url="https://<ACCOUNT ID>.r2.cloudflarestorage.com",
            secret=secret,
            read_only=True
        )
    }
)
def f():
    subprocess.run(["ls", "/my-mount"], check=True)
\`\`\`

GCS:

Google Cloud Storage (GCS) is [S3-compatible](https://cloud.google.com/storage/docs/interoperability).
GCS Buckets also require a secret with Google-specific key names (see below) populated with
a [HMAC key](https://cloud.google.com/storage/docs/authentication/managing-hmackeys#create).

\`\`\`python
import subprocess

app = modal.App()
gcp_hmac_secret = modal.Secret.from_name(
    "gcp-secret",
    required_keys=["GOOGLE_ACCESS_KEY_ID", "GOOGLE_ACCESS_KEY_SECRET"]
)

@app.function(
    volumes={
        "/my-mount": modal.CloudBucketMount(
            bucket_name="my-gcs-bucket",
            bucket_endpoint_url="https://storage.googleapis.com",
            secret=gcp_hmac_secret,
        )
    }
)
def f():
    subprocess.run(["ls", "/my-mount"], check=True)
\`\`\`

\`\`\`python
__init__(self, bucket_name, bucket_endpoint_url=None, key_prefix=None,
    secret=None, oidc_auth_role_arn=None, read_only=False, requester_pays=False,
    force_path_style=False)
\`\`\`
`,meta:{title:`CloudBucketMount`,description:`Mounts a cloud bucket to your container. Currently supports AWS S3 buckets.`}},{toc:h,rawContent:g,meta:_}=m,v=t(`<!> <!> <p>Mounts a cloud bucket to your container. Currently supports AWS S3 buckets.</p> <p>S3 buckets are mounted using <!>.
S3 mounts are optimized for reading large files sequentially. It does not support every file operation; consult <!> for more information.</p> <p><strong>Usage</strong></p> <p>S3:</p> <!> <p>R2:</p> <p>Cloudflare R2 is <!> so its setup looks
very similar to S3. But additionally the <code>bucket_endpoint_url</code> argument must be passed.</p> <!> <p>GCS:</p> <p>Google Cloud Storage (GCS) is <!>.
GCS Buckets also require a secret with Google-specific key names (see below) populated with
a <!>.</p> <!> <!>`,1);function y(t,h){let g=a(h,[`children`,`$$slots`,`$$events`,`$$legacy`]);f(t,o(()=>g,()=>m,{children:(t,a)=>{var o=v(),f=s(o);u(f,{id:`cloudbucketmount`,children:(e,t)=>{l(),i(e,r(`CloudBucketMount`))},$$slots:{default:!0}});var m=c(f,2);d(m,{code:`class%20CloudBucketMount(object)`,lang:`python`});var h=c(m,4),g=c(e(h));p(g,{href:`https://github.com/awslabs/mountpoint-s3`,rel:`nofollow`,children:(e,t)=>{l(),i(e,r(`AWS S3 Mountpoint`))},$$slots:{default:!0}}),p(c(g,2),{href:`https://github.com/awslabs/mountpoint-s3/blob/main/doc/SEMANTICS.md`,rel:`nofollow`,children:(e,t)=>{l(),i(e,r(`the AWS S3 Mountpoint documentation`))},$$slots:{default:!0}}),l(),n(h);var _=c(h,6);d(_,{code:`import%20subprocess%0A%0Aapp%20%3D%20modal.App()%0Asecret%20%3D%20modal.Secret.from_name(%0A%20%20%20%20%22aws-secret%22%2C%0A%20%20%20%20required_keys%3D%5B%22AWS_ACCESS_KEY_ID%22%2C%20%22AWS_SECRET_ACCESS_KEY%22%5D%0A%20%20%20%20%23%20Note%3A%20providing%20AWS_REGION%20can%20help%20when%20automatic%20detection%20of%20the%20bucket%20region%20fails.%0A)%0A%0A%40app.function(%0A%20%20%20%20volumes%3D%7B%0A%20%20%20%20%20%20%20%20%22%2Fmy-mount%22%3A%20modal.CloudBucketMount(%0A%20%20%20%20%20%20%20%20%20%20%20%20bucket_name%3D%22s3-bucket-name%22%2C%0A%20%20%20%20%20%20%20%20%20%20%20%20secret%3Dsecret%2C%0A%20%20%20%20%20%20%20%20%20%20%20%20read_only%3DTrue%0A%20%20%20%20%20%20%20%20)%0A%20%20%20%20%7D%0A)%0Adef%20f()%3A%0A%20%20%20%20subprocess.run(%5B%22ls%22%2C%20%22%2Fmy-mount%22%5D%2C%20check%3DTrue)`,lang:`python`});var y=c(_,4);p(c(e(y)),{href:`https://developers.cloudflare.com/r2/api/s3/api/`,rel:`nofollow`,children:(e,t)=>{l(),i(e,r(`S3-compatible`))},$$slots:{default:!0}}),l(3),n(y);var b=c(y,2);d(b,{code:`import%20subprocess%0A%0Aapp%20%3D%20modal.App()%0Asecret%20%3D%20modal.Secret.from_name(%0A%20%20%20%20%22r2-secret%22%2C%0A%20%20%20%20required_keys%3D%5B%22AWS_ACCESS_KEY_ID%22%2C%20%22AWS_SECRET_ACCESS_KEY%22%5D%0A)%0A%0A%40app.function(%0A%20%20%20%20volumes%3D%7B%0A%20%20%20%20%20%20%20%20%22%2Fmy-mount%22%3A%20modal.CloudBucketMount(%0A%20%20%20%20%20%20%20%20%20%20%20%20bucket_name%3D%22my-r2-bucket%22%2C%0A%20%20%20%20%20%20%20%20%20%20%20%20bucket_endpoint_url%3D%22https%3A%2F%2F%3CACCOUNT%20ID%3E.r2.cloudflarestorage.com%22%2C%0A%20%20%20%20%20%20%20%20%20%20%20%20secret%3Dsecret%2C%0A%20%20%20%20%20%20%20%20%20%20%20%20read_only%3DTrue%0A%20%20%20%20%20%20%20%20)%0A%20%20%20%20%7D%0A)%0Adef%20f()%3A%0A%20%20%20%20subprocess.run(%5B%22ls%22%2C%20%22%2Fmy-mount%22%5D%2C%20check%3DTrue)`,lang:`python`});var x=c(b,4),S=c(e(x));p(S,{href:`https://cloud.google.com/storage/docs/interoperability`,rel:`nofollow`,children:(e,t)=>{l(),i(e,r(`S3-compatible`))},$$slots:{default:!0}}),p(c(S,2),{href:`https://cloud.google.com/storage/docs/authentication/managing-hmackeys#create`,rel:`nofollow`,children:(e,t)=>{l(),i(e,r(`HMAC key`))},$$slots:{default:!0}}),l(),n(x);var C=c(x,2);d(C,{code:`import%20subprocess%0A%0Aapp%20%3D%20modal.App()%0Agcp_hmac_secret%20%3D%20modal.Secret.from_name(%0A%20%20%20%20%22gcp-secret%22%2C%0A%20%20%20%20required_keys%3D%5B%22GOOGLE_ACCESS_KEY_ID%22%2C%20%22GOOGLE_ACCESS_KEY_SECRET%22%5D%0A)%0A%0A%40app.function(%0A%20%20%20%20volumes%3D%7B%0A%20%20%20%20%20%20%20%20%22%2Fmy-mount%22%3A%20modal.CloudBucketMount(%0A%20%20%20%20%20%20%20%20%20%20%20%20bucket_name%3D%22my-gcs-bucket%22%2C%0A%20%20%20%20%20%20%20%20%20%20%20%20bucket_endpoint_url%3D%22https%3A%2F%2Fstorage.googleapis.com%22%2C%0A%20%20%20%20%20%20%20%20%20%20%20%20secret%3Dgcp_hmac_secret%2C%0A%20%20%20%20%20%20%20%20)%0A%20%20%20%20%7D%0A)%0Adef%20f()%3A%0A%20%20%20%20subprocess.run(%5B%22ls%22%2C%20%22%2Fmy-mount%22%5D%2C%20check%3DTrue)`,lang:`python`}),d(c(C,2),{code:`__init__(self%2C%20bucket_name%2C%20bucket_endpoint_url%3DNone%2C%20key_prefix%3DNone%2C%0A%20%20%20%20secret%3DNone%2C%20oidc_auth_role_arn%3DNone%2C%20read_only%3DFalse%2C%20requester_pays%3DFalse%2C%0A%20%20%20%20force_path_style%3DFalse)`,lang:`python`}),i(t,o)},$$slots:{default:!0}}))}export{y as default,m as metadata};
//# sourceMappingURL=DZXAQLp1.js.map
