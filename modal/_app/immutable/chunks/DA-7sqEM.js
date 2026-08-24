(function(){try{var e=typeof window<`u`?window:typeof global<`u`?global:typeof globalThis<`u`?globalThis:typeof self<`u`?self:{};e.SENTRY_RELEASE={id:`f99fcf9f0a844cc9bd13fdc8e5782b84`};var t=new e.Error().stack;t&&(e._sentryDebugIds=e._sentryDebugIds||{},e._sentryDebugIds[t]=`b8bcb255-0426-4d48-9f15-56e42e4e051c`,e._sentryDebugIdIdentifier=`sentry-dbid-b8bcb255-0426-4d48-9f15-56e42e4e051c`)}catch{}})();import{$t as e,St as t,Tn as n,Tt as r,bt as i,c as ee,d as a,en as te,tn as o,wn as s}from"./F_ixKBiO.js";import"./B1sc9Zdx.js";import"./Bb2deiU3.js";import{a as c,i as l,o as ne}from"./CPby7b1n.js";import{t as u}from"./BILrvr3I.js";import{t as d}from"./B4L_if842.js";import{t as f}from"./DeWGVqas2.js";var p={description:`Authenticate Modal Functions with AWS, GCP, and other services using OIDC tokens instead of storing long-lived credentials.`,toc:[{depth:1,value:`Using OIDC to authenticate with external services`,id:`using-oidc-to-authenticate-with-external-services`,children:[{depth:2,value:`How it works`,id:`how-it-works`,children:[{depth:3,value:`App name format`,id:`app-name-format`}]},{depth:2,value:`Demo usage with AWS S3`,id:`demo-usage-with-aws-s3`,children:[{depth:3,value:`Step 0: Understand your OIDC claims`,id:`step-0-understand-your-oidc-claims`},{depth:3,value:`Step 1: Configure AWS to trust Modal’s OIDC provider`,id:`step-1-configure-aws-to-trust-modals-oidc-provider`},{depth:3,value:`Step 2: Create an IAM policy that can be used by Modal Functions`,id:`step-2-create-an-iam-policy-that-can-be-used-by-modal-functions`},{depth:3,value:`Step 3: Create an IAM role that can be assumed by Modal Functions`,id:`step-3-create-an-iam-role-that-can-be-assumed-by-modal-functions`},{depth:3,value:`Step 4: Use the OIDC token in your Function`,id:`step-4-use-the-oidc-token-in-your-function`}]},{depth:2,value:`Demo usage with AWS Elastic Container Registry (ECR)`,id:`demo-usage-with-aws-elastic-container-registry-ecr`,children:[{depth:3,value:`Prerequisites`,id:`prerequisites`},{depth:3,value:`Test with a sample image`,id:`test-with-a-sample-image`}]},{depth:2,value:`Next steps`,id:`next-steps`}]}],rawContent:`# Using OIDC to authenticate with external services

Your Functions in Modal may need to access external resources like S3 buckets.
Traditionally, you would need to store long-lived credentials in Modal Secrets
and reference those Secrets in your function code. With the Modal OIDC
integration, you can instead use automatically-generated identity
tokens to authenticate to external services.

## How it works

[OIDC](https://auth0.com/docs/authenticate/protocols/openid-connect-protocol) is
a standard protocol for authenticating users between systems. In Modal, we use
OIDC to generate short-lived tokens that external services can use to verify
that your function is authenticated.

The OIDC integration has two components: the discovery document and the generated
tokens.

The [OIDC discovery document](https://swagger.io/docs/specification/v3_0/authentication/openid-connect-discovery/)
describes how our OIDC server is configured. It primarily includes the supported
[claims](https://developer.okta.com/blog/2017/07/25/oidc-primer-part-1) and the [keys](https://auth0.com/docs/secure/tokens/json-web-tokens/json-web-key-sets)
we use to sign tokens. Discovery documents are always hosted at \`/.well-known/openid-configuration\`, and
you can view ours at <https://oidc.modal.com/.well-known/openid-configuration>.

The generated tokens are [JWTs](https://jwt.io/) signed by Modal using the keys described in the
discovery document. These tokens contain the full identity of the Function
in the \`sub\` claim, and they use custom claims to make this information more
easily accessible. See our [discovery document](https://oidc.modal.com/.well-known/openid-configuration)
for a full list of claims.

Generated tokens are injected into your Function's containers via the \`MODAL_IDENTITY_TOKEN\`
environment variable. Below is an example of what claims might be included in a token:

\`\`\`json
{
  "sub": "modal:workspace_id:ac-12345abcd:environment_name:modal-examples:app_name:oidc-token-test:function_name:jwt_return_func:container_id:ta-12345abcd",
  "aud": "oidc.modal.com",
  "exp": 1732137751,
  "iat": 1731964951,
  "iss": "https://oidc.modal.com",
  "jti": "31f92dca-e847-4bc9-8d15-9f234567a123",
  "workspace_id": "ac-12345abcd",
  "environment_id": "en-12345abcd",
  "environment_name": "modal-examples",
  "app_id": "ap-12345abcd",
  "app_name": "oidc-token-test",
  "function_id": "fu-12345abcd",
  "function_name": "jwt_return_func",
  "container_id": "ta-12345abcd"
}
\`\`\`

### App name format

By default, Modal Apps can be created with arbitrary names. However, when using
OIDC, the App name has a stricter character set. Specifically, it must be 64
characters or less and can only include alphanumeric characters, dashes, periods,
and underscores. If these constraints are violated, the OIDC token will not be
injected into the container.

Note that these are the same constraints that are applied to [Deployed Apps](/docs/guide/managing-deployments).
This means that if an App is deployable, it will also be compatible with OIDC.

## Demo usage with AWS S3

To see how OIDC tokens can be used, we'll demo a simple Function that lists
objects in an S3 bucket.

### Step 0: Understand your OIDC claims

Before we can configure OIDC policies, we need to know what claims we can match
against. We can run a Function and inspect its claims to find out.

\`\`\`python notest
app = modal.App("oidc-token-test")

jwt_image = modal.Image.debian_slim().pip_install("pyjwt")

@app.function(image=jwt_image)
def jwt_return_func():
    import jwt

    token = os.environ["MODAL_IDENTITY_TOKEN"]
    claims = jwt.decode(token, options={"verify_signature": False})
    print(json.dumps(claims, indent=2))

@app.local_entrypoint()
def main():
    jwt_return_func.remote()
\`\`\`

Run the function locally to see its claims:

\`\`\`bash
$ modal run oidc-token-test.py
{
  "sub": "modal:workspace_id:ac-12345abcd:environment_name:modal-examples:app_name:oidc-token-test:function_name:jwt_return_func:container_id:ta-12345abcd",
  "aud": "oidc.modal.com",
  "exp": 1732137751,
  "iat": 1731964951,
  "iss": "https://oidc.modal.com",
  "jti": "31f92dca-e847-4bc9-8d15-9f234567a123",
  "workspace_id": "ac-12345abcd",
  "environment_id": "en-12345abcd",
  "environment_name": "modal-examples",
  "app_id": "ap-12345abcd",
  "app_name": "oidc-token-test",
  "function_id": "fu-12345abcd",
  "function_name": "jwt_return_func",
  "container_id": "ta-12345abcd"
}
\`\`\`

Now we can match off these claims to configure our OIDC policies.

### Step 1: Configure AWS to trust Modal's OIDC provider

We need to make AWS accept Modal identity tokens. To do this, we need to add
Modal's OIDC provider as a trusted entity in our AWS account.

\`\`\`bash
aws iam create-open-id-connect-provider \\
    --url https://oidc.modal.com \\
    --client-id-list oidc.modal.com
\`\`\`

This will trigger AWS to pull down our [JSON Web Key Set (JWKS)](https://auth0.com/docs/secure/tokens/json-web-tokens/json-web-key-sets)
and use it to verify the signatures of any tokens signed by Modal.

### Step 2: Create an IAM policy that can be used by Modal Functions

Let's create a simple IAM policy that allows listing objects in an S3 bucket.
Take the policy below and replace the bucket name with your own.

\`\`\`json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": ["s3:PutObject", "s3:GetObject", "s3:ListBucket"],
      "Resource": ["arn:aws:s3:::fun-bucket", "arn:aws:s3:::fun-bucket/*"]
    }
  ]
}
\`\`\`

### Step 3: Create an IAM role that can be assumed by Modal Functions

Now, we can create an IAM role that uses this policy. Visit the IAM console
to create this role. If you add this policy using the CLI, update the
OIDC provider ARN to match the one created in [Step 1](#step-1-configure-aws-to-trust-modals-oidc-provider).
Be sure to replace the Workspace ID placeholder with your own. You can find your Workspace ID
at https://modal.com/settings/workspaces or through the \`modal token info\` CLI.

\`\`\`json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Principal": {
        "Federated": "arn:aws:iam::123456789abcd:oidc-provider/oidc.modal.com"
      },
      "Action": "sts:AssumeRoleWithWebIdentity",
      "Condition": {
        "StringEquals": {
          "oidc.modal.com:aud": "oidc.modal.com"
        },
        "StringLike": {
          "oidc.modal.com:sub": "modal:workspace_id:ac-12345abcd:*"
        }
      }
    }
  ]
}
\`\`\`

Note how we use \`workspace_id\` to limit the scope of the role. This means that
the IAM role can only be assumed by Functions in your Workspace. You can further
limit this by specifying an Environment, App, or Function name.

Ideally, we would use the custom claims for role limiting. Unfortunately, AWS
does not support [matching on custom claims](https://docs.aws.amazon.com/IAM/latest/UserGuide/reference_policies_iam-condition-keys.html#condition-keys-wif),
so we use the \`sub\` claim instead.

### Step 4: Use the OIDC token in your Function

The AWS SDKs have built-in support for OIDC tokens, so you can use them as
follows:

\`\`\`python notest
import boto3

app = modal.App("oidc-token-test")

boto3_image = modal.Image.debian_slim().pip_install("boto3")

# Trade a Modal OIDC token for AWS credentials
def get_s3_client(role_arn):
    sts_client = boto3.client("sts")

    # Assume role with Web Identity
    credential_response = sts_client.assume_role_with_web_identity(
        RoleArn=role_arn, RoleSessionName="OIDCSession", WebIdentityToken=os.environ["MODAL_IDENTITY_TOKEN"]
    )

    # Extract credentials
    credentials = credential_response["Credentials"]
    return boto3.client(
        "s3",
        aws_access_key_id=credentials["AccessKeyId"],
        aws_secret_access_key=credentials["SecretAccessKey"],
        aws_session_token=credentials["SessionToken"],
    )

# List the contents of an S3 bucket
@app.function(image=boto3_image)
def list_bucket_contents(bucket_name, role_arn):
    s3_client = get_s3_client(role_arn)
    response = s3_client.list_objects_v2(Bucket=bucket_name)
    for obj in response["Contents"]:
        print(f"- {obj['Key']} (Size: {obj['Size']} bytes)")

@app.local_entrypoint()
def main():
    # Replace with the role ARN and bucket name from step 2
    list_bucket_contents.remote("fun-bucket", "arn:aws:iam::123456789abcd:role/oidc_test_role")
\`\`\`

Run the function locally to see the contents of the bucket:

\`\`\`bash
$ modal run oidc-token-test.py
- test-file.txt (Size: 10 bytes)
\`\`\`

## Demo usage with AWS Elastic Container Registry (ECR)

You can also use OIDC to authenticate [Private Registries](/docs/guide/existing-images) on AWS.

### Prerequisites

1. Configure AWS to trust Modal's OIDC provider ([Step 1 above](#step-1-configure-aws-to-trust-modals-oidc-provider))

2. [Create an AWS Policy with read-only ECR access](/docs/guide/existing-images#elastic-container-registry-ecr)

3. Create an IAM role that uses this policy ([Step 3 above](#step-3-create-an-iam-role-that-can-be-assumed-by-modal-functions))

### Test with a sample image

Create sample Dockerfile:

\`\`\`dockerfile
FROM python:3.11-slim
WORKDIR /app
CMD ["python3"]
\`\`\`

Build and push the image to ECR:

\`\`\`bash
# Login with the AWS CLI
aws ecr get-login-password --region [ECR_REGION] | docker login --username AWS --password-stdin [ECR_REPO_ARN]

# Build the Docker Image
docker build -t modal-oidc-test-image .

# Push the image to ECR
docker tag modal-oidc-test-image:latest [ECR_REPO_ARN]:latest
docker push [ECR_REPO_ARN]:latest
\`\`\`

Test pulling the image from ECR:

\`\`\`python
import modal

app = modal.App("image-from-ecr-test")
sample_image = modal.Image.from_aws_ecr(
    "[ECR_IMAGE_URI]", #eg. "12345678.dkr.ecr.us-east-1.amazonaws.com/repository:latest"
    secret=modal.Secret.from_dict(
        {
            "AWS_ROLE_ARN": "[IAM_ROLE_ARN]", # eg. "arn:aws:iam::123456789abcd:role/oidc_test_role"
            "AWS_REGION": "[ECR_REGION]", # eg. "us-east-1"
        }
    ),
)

@app.function(image=sample_image)
def hello():
    print("Hello, World!")
\`\`\`

## Next steps

The OIDC integration can be used for much more than just AWS. With this same pattern,
you can configure automatic access to [Vault](https://developer.hashicorp.com/vault/docs/auth/jwt),
[GCP](https://cloud.google.com/identity-platform/docs/web/oidc), [Azure](https://learn.microsoft.com/en-us/entra/identity-platform/v2-protocols-oidc), and more.
At this time, OIDC-authenticated container image pulling is only support with AWS ECR.
`,meta:{title:`Using OIDC to authenticate with external services`,description:`Authenticate Modal Functions with AWS, GCP, and other services using OIDC tokens instead of storing long-lived credentials.`}},{description:m,toc:h,rawContent:g,meta:_}=p,re=t(`<!> <p>Your Functions in Modal may need to access external resources like S3 buckets.
Traditionally, you would need to store long-lived credentials in Modal Secrets
and reference those Secrets in your function code. With the Modal OIDC
integration, you can instead use automatically-generated identity
tokens to authenticate to external services.</p> <!> <p><!> is
a standard protocol for authenticating users between systems. In Modal, we use
OIDC to generate short-lived tokens that external services can use to verify
that your function is authenticated.</p> <p>The OIDC integration has two components: the discovery document and the generated
tokens.</p> <p>The <!> describes how our OIDC server is configured. It primarily includes the supported <!> and the <!> we use to sign tokens. Discovery documents are always hosted at <code>/.well-known/openid-configuration</code>, and
you can view ours at <!>.</p> <p>The generated tokens are <!> signed by Modal using the keys described in the
discovery document. These tokens contain the full identity of the Function
in the <code>sub</code> claim, and they use custom claims to make this information more
easily accessible. See our <!> for a full list of claims.</p> <p>Generated tokens are injected into your Function’s containers via the <code>MODAL_IDENTITY_TOKEN</code> environment variable. Below is an example of what claims might be included in a token:</p> <!> <!> <p>By default, Modal Apps can be created with arbitrary names. However, when using
OIDC, the App name has a stricter character set. Specifically, it must be 64
characters or less and can only include alphanumeric characters, dashes, periods,
and underscores. If these constraints are violated, the OIDC token will not be
injected into the container.</p> <p>Note that these are the same constraints that are applied to <!>.
This means that if an App is deployable, it will also be compatible with OIDC.</p> <!> <p>To see how OIDC tokens can be used, we’ll demo a simple Function that lists
objects in an S3 bucket.</p> <!> <p>Before we can configure OIDC policies, we need to know what claims we can match
against. We can run a Function and inspect its claims to find out.</p> <!> <p>Run the function locally to see its claims:</p> <!> <p>Now we can match off these claims to configure our OIDC policies.</p> <!> <p>We need to make AWS accept Modal identity tokens. To do this, we need to add
Modal’s OIDC provider as a trusted entity in our AWS account.</p> <!> <p>This will trigger AWS to pull down our <!> and use it to verify the signatures of any tokens signed by Modal.</p> <!> <p>Let’s create a simple IAM policy that allows listing objects in an S3 bucket.
Take the policy below and replace the bucket name with your own.</p> <!> <!> <p>Now, we can create an IAM role that uses this policy. Visit the IAM console
to create this role. If you add this policy using the CLI, update the
OIDC provider ARN to match the one created in <!>.
Be sure to replace the Workspace ID placeholder with your own. You can find your Workspace ID
at <!> or through the <code>modal token info</code> CLI.</p> <!> <p>Note how we use <code>workspace_id</code> to limit the scope of the role. This means that
the IAM role can only be assumed by Functions in your Workspace. You can further
limit this by specifying an Environment, App, or Function name.</p> <p>Ideally, we would use the custom claims for role limiting. Unfortunately, AWS
does not support <!>,
so we use the <code>sub</code> claim instead.</p> <!> <p>The AWS SDKs have built-in support for OIDC tokens, so you can use them as
follows:</p> <!> <p>Run the function locally to see the contents of the bucket:</p> <!> <!> <p>You can also use OIDC to authenticate <!> on AWS.</p> <!> <ol><li><p>Configure AWS to trust Modal’s OIDC provider (<!>)</p></li> <li><p><!></p></li> <li><p>Create an IAM role that uses this policy (<!>)</p></li></ol> <!> <p>Create sample Dockerfile:</p> <!> <p>Build and push the image to ECR:</p> <!> <p>Test pulling the image from ECR:</p> <!> <!> <p>The OIDC integration can be used for much more than just AWS. With this same pattern,
you can configure automatic access to <!>, <!>, <!>, and more.
At this time, OIDC-authenticated container image pulling is only support with AWS ECR.</p>`,1);function v(t,m){let h=ee(m,[`children`,`$$slots`,`$$events`,`$$legacy`]);d(t,a(()=>h,()=>p,{children:(t,ee)=>{var a=re(),d=te(a);ne(d,{id:`using-oidc-to-authenticate-with-external-services`,children:(e,t)=>{s(),i(e,r(`Using OIDC to authenticate with external services`))},$$slots:{default:!0}});var p=o(d,4);c(p,{id:`how-it-works`,children:(e,t)=>{s(),i(e,r(`How it works`))},$$slots:{default:!0}});var m=o(p,2);f(e(m),{href:`https://auth0.com/docs/authenticate/protocols/openid-connect-protocol`,rel:`nofollow`,children:(e,t)=>{s(),i(e,r(`OIDC`))},$$slots:{default:!0}}),s(),n(m);var h=o(m,4),g=o(e(h));f(g,{href:`https://swagger.io/docs/specification/v3_0/authentication/openid-connect-discovery/`,rel:`nofollow`,children:(e,t)=>{s(),i(e,r(`OIDC discovery document`))},$$slots:{default:!0}});var _=o(g,2);f(_,{href:`https://developer.okta.com/blog/2017/07/25/oidc-primer-part-1`,rel:`nofollow`,children:(e,t)=>{s(),i(e,r(`claims`))},$$slots:{default:!0}});var v=o(_,2);f(v,{href:`https://auth0.com/docs/secure/tokens/json-web-tokens/json-web-key-sets`,rel:`nofollow`,children:(e,t)=>{s(),i(e,r(`keys`))},$$slots:{default:!0}}),f(o(v,4),{href:`https://oidc.modal.com/.well-known/openid-configuration`,rel:`nofollow`,children:(e,t)=>{s(),i(e,r(`https://oidc.modal.com/.well-known/openid-configuration`))},$$slots:{default:!0}}),s(),n(h);var y=o(h,2),b=o(e(y));f(b,{href:`https://jwt.io/`,rel:`nofollow`,children:(e,t)=>{s(),i(e,r(`JWTs`))},$$slots:{default:!0}}),f(o(b,4),{href:`https://oidc.modal.com/.well-known/openid-configuration`,rel:`nofollow`,children:(e,t)=>{s(),i(e,r(`discovery document`))},$$slots:{default:!0}}),s(),n(y);var x=o(y,4);u(x,{code:`%7B%0A%20%20%22sub%22%3A%20%22modal%3Aworkspace_id%3Aac-12345abcd%3Aenvironment_name%3Amodal-examples%3Aapp_name%3Aoidc-token-test%3Afunction_name%3Ajwt_return_func%3Acontainer_id%3Ata-12345abcd%22%2C%0A%20%20%22aud%22%3A%20%22oidc.modal.com%22%2C%0A%20%20%22exp%22%3A%201732137751%2C%0A%20%20%22iat%22%3A%201731964951%2C%0A%20%20%22iss%22%3A%20%22https%3A%2F%2Foidc.modal.com%22%2C%0A%20%20%22jti%22%3A%20%2231f92dca-e847-4bc9-8d15-9f234567a123%22%2C%0A%20%20%22workspace_id%22%3A%20%22ac-12345abcd%22%2C%0A%20%20%22environment_id%22%3A%20%22en-12345abcd%22%2C%0A%20%20%22environment_name%22%3A%20%22modal-examples%22%2C%0A%20%20%22app_id%22%3A%20%22ap-12345abcd%22%2C%0A%20%20%22app_name%22%3A%20%22oidc-token-test%22%2C%0A%20%20%22function_id%22%3A%20%22fu-12345abcd%22%2C%0A%20%20%22function_name%22%3A%20%22jwt_return_func%22%2C%0A%20%20%22container_id%22%3A%20%22ta-12345abcd%22%0A%7D`,lang:`json`});var S=o(x,2);l(S,{id:`app-name-format`,children:(e,t)=>{s(),i(e,r(`App name format`))},$$slots:{default:!0}});var C=o(S,4);f(o(e(C)),{href:`/docs/guide/managing-deployments`,children:(e,t)=>{s(),i(e,r(`Deployed Apps`))},$$slots:{default:!0}}),s(),n(C);var w=o(C,2);c(w,{id:`demo-usage-with-aws-s3`,children:(e,t)=>{s(),i(e,r(`Demo usage with AWS S3`))},$$slots:{default:!0}});var T=o(w,4);l(T,{id:`step-0-understand-your-oidc-claims`,children:(e,t)=>{s(),i(e,r(`Step 0: Understand your OIDC claims`))},$$slots:{default:!0}});var E=o(T,4);u(E,{code:`app%20%3D%20modal.App(%22oidc-token-test%22)%0A%0Ajwt_image%20%3D%20modal.Image.debian_slim().pip_install(%22pyjwt%22)%0A%0A%40app.function(image%3Djwt_image)%0Adef%20jwt_return_func()%3A%0A%20%20%20%20import%20jwt%0A%0A%20%20%20%20token%20%3D%20os.environ%5B%22MODAL_IDENTITY_TOKEN%22%5D%0A%20%20%20%20claims%20%3D%20jwt.decode(token%2C%20options%3D%7B%22verify_signature%22%3A%20False%7D)%0A%20%20%20%20print(json.dumps(claims%2C%20indent%3D2))%0A%0A%40app.local_entrypoint()%0Adef%20main()%3A%0A%20%20%20%20jwt_return_func.remote()`,lang:`python`});var D=o(E,4);u(D,{code:`%24%20modal%20run%20oidc-token-test.py%0A%7B%0A%20%20%22sub%22%3A%20%22modal%3Aworkspace_id%3Aac-12345abcd%3Aenvironment_name%3Amodal-examples%3Aapp_name%3Aoidc-token-test%3Afunction_name%3Ajwt_return_func%3Acontainer_id%3Ata-12345abcd%22%2C%0A%20%20%22aud%22%3A%20%22oidc.modal.com%22%2C%0A%20%20%22exp%22%3A%201732137751%2C%0A%20%20%22iat%22%3A%201731964951%2C%0A%20%20%22iss%22%3A%20%22https%3A%2F%2Foidc.modal.com%22%2C%0A%20%20%22jti%22%3A%20%2231f92dca-e847-4bc9-8d15-9f234567a123%22%2C%0A%20%20%22workspace_id%22%3A%20%22ac-12345abcd%22%2C%0A%20%20%22environment_id%22%3A%20%22en-12345abcd%22%2C%0A%20%20%22environment_name%22%3A%20%22modal-examples%22%2C%0A%20%20%22app_id%22%3A%20%22ap-12345abcd%22%2C%0A%20%20%22app_name%22%3A%20%22oidc-token-test%22%2C%0A%20%20%22function_id%22%3A%20%22fu-12345abcd%22%2C%0A%20%20%22function_name%22%3A%20%22jwt_return_func%22%2C%0A%20%20%22container_id%22%3A%20%22ta-12345abcd%22%0A%7D`,lang:`bash`});var O=o(D,4);l(O,{id:`step-1-configure-aws-to-trust-modals-oidc-provider`,children:(e,t)=>{s(),i(e,r(`Step 1: Configure AWS to trust Modal’s OIDC provider`))},$$slots:{default:!0}});var k=o(O,4);u(k,{code:`aws%20iam%20create-open-id-connect-provider%20%5C%0A%20%20%20%20--url%20https%3A%2F%2Foidc.modal.com%20%5C%0A%20%20%20%20--client-id-list%20oidc.modal.com`,lang:`bash`});var A=o(k,2);f(o(e(A)),{href:`https://auth0.com/docs/secure/tokens/json-web-tokens/json-web-key-sets`,rel:`nofollow`,children:(e,t)=>{s(),i(e,r(`JSON Web Key Set (JWKS)`))},$$slots:{default:!0}}),s(),n(A);var j=o(A,2);l(j,{id:`step-2-create-an-iam-policy-that-can-be-used-by-modal-functions`,children:(e,t)=>{s(),i(e,r(`Step 2: Create an IAM policy that can be used by Modal Functions`))},$$slots:{default:!0}});var M=o(j,4);u(M,{code:`%7B%0A%20%20%22Version%22%3A%20%222012-10-17%22%2C%0A%20%20%22Statement%22%3A%20%5B%0A%20%20%20%20%7B%0A%20%20%20%20%20%20%22Effect%22%3A%20%22Allow%22%2C%0A%20%20%20%20%20%20%22Action%22%3A%20%5B%22s3%3APutObject%22%2C%20%22s3%3AGetObject%22%2C%20%22s3%3AListBucket%22%5D%2C%0A%20%20%20%20%20%20%22Resource%22%3A%20%5B%22arn%3Aaws%3As3%3A%3A%3Afun-bucket%22%2C%20%22arn%3Aaws%3As3%3A%3A%3Afun-bucket%2F*%22%5D%0A%20%20%20%20%7D%0A%20%20%5D%0A%7D`,lang:`json`});var N=o(M,2);l(N,{id:`step-3-create-an-iam-role-that-can-be-assumed-by-modal-functions`,children:(e,t)=>{s(),i(e,r(`Step 3: Create an IAM role that can be assumed by Modal Functions`))},$$slots:{default:!0}});var P=o(N,2),F=o(e(P));f(F,{href:`#step-1-configure-aws-to-trust-modals-oidc-provider`,children:(e,t)=>{s(),i(e,r(`Step 1`))},$$slots:{default:!0}}),f(o(F,2),{href:`https://modal.com/settings/workspaces`,rel:`nofollow`,children:(e,t)=>{s(),i(e,r(`https://modal.com/settings/workspaces`))},$$slots:{default:!0}}),s(3),n(P);var I=o(P,2);u(I,{code:`%7B%0A%20%20%22Version%22%3A%20%222012-10-17%22%2C%0A%20%20%22Statement%22%3A%20%5B%0A%20%20%20%20%7B%0A%20%20%20%20%20%20%22Effect%22%3A%20%22Allow%22%2C%0A%20%20%20%20%20%20%22Principal%22%3A%20%7B%0A%20%20%20%20%20%20%20%20%22Federated%22%3A%20%22arn%3Aaws%3Aiam%3A%3A123456789abcd%3Aoidc-provider%2Foidc.modal.com%22%0A%20%20%20%20%20%20%7D%2C%0A%20%20%20%20%20%20%22Action%22%3A%20%22sts%3AAssumeRoleWithWebIdentity%22%2C%0A%20%20%20%20%20%20%22Condition%22%3A%20%7B%0A%20%20%20%20%20%20%20%20%22StringEquals%22%3A%20%7B%0A%20%20%20%20%20%20%20%20%20%20%22oidc.modal.com%3Aaud%22%3A%20%22oidc.modal.com%22%0A%20%20%20%20%20%20%20%20%7D%2C%0A%20%20%20%20%20%20%20%20%22StringLike%22%3A%20%7B%0A%20%20%20%20%20%20%20%20%20%20%22oidc.modal.com%3Asub%22%3A%20%22modal%3Aworkspace_id%3Aac-12345abcd%3A*%22%0A%20%20%20%20%20%20%20%20%7D%0A%20%20%20%20%20%20%7D%0A%20%20%20%20%7D%0A%20%20%5D%0A%7D`,lang:`json`});var L=o(I,4);f(o(e(L)),{href:`https://docs.aws.amazon.com/IAM/latest/UserGuide/reference_policies_iam-condition-keys.html#condition-keys-wif`,rel:`nofollow`,children:(e,t)=>{s(),i(e,r(`matching on custom claims`))},$$slots:{default:!0}}),s(3),n(L);var R=o(L,2);l(R,{id:`step-4-use-the-oidc-token-in-your-function`,children:(e,t)=>{s(),i(e,r(`Step 4: Use the OIDC token in your Function`))},$$slots:{default:!0}});var ie=o(R,4);u(ie,{code:`import%20boto3%0A%0Aapp%20%3D%20modal.App(%22oidc-token-test%22)%0A%0Aboto3_image%20%3D%20modal.Image.debian_slim().pip_install(%22boto3%22)%0A%0A%23%20Trade%20a%20Modal%20OIDC%20token%20for%20AWS%20credentials%0Adef%20get_s3_client(role_arn)%3A%0A%20%20%20%20sts_client%20%3D%20boto3.client(%22sts%22)%0A%0A%20%20%20%20%23%20Assume%20role%20with%20Web%20Identity%0A%20%20%20%20credential_response%20%3D%20sts_client.assume_role_with_web_identity(%0A%20%20%20%20%20%20%20%20RoleArn%3Drole_arn%2C%20RoleSessionName%3D%22OIDCSession%22%2C%20WebIdentityToken%3Dos.environ%5B%22MODAL_IDENTITY_TOKEN%22%5D%0A%20%20%20%20)%0A%0A%20%20%20%20%23%20Extract%20credentials%0A%20%20%20%20credentials%20%3D%20credential_response%5B%22Credentials%22%5D%0A%20%20%20%20return%20boto3.client(%0A%20%20%20%20%20%20%20%20%22s3%22%2C%0A%20%20%20%20%20%20%20%20aws_access_key_id%3Dcredentials%5B%22AccessKeyId%22%5D%2C%0A%20%20%20%20%20%20%20%20aws_secret_access_key%3Dcredentials%5B%22SecretAccessKey%22%5D%2C%0A%20%20%20%20%20%20%20%20aws_session_token%3Dcredentials%5B%22SessionToken%22%5D%2C%0A%20%20%20%20)%0A%0A%23%20List%20the%20contents%20of%20an%20S3%20bucket%0A%40app.function(image%3Dboto3_image)%0Adef%20list_bucket_contents(bucket_name%2C%20role_arn)%3A%0A%20%20%20%20s3_client%20%3D%20get_s3_client(role_arn)%0A%20%20%20%20response%20%3D%20s3_client.list_objects_v2(Bucket%3Dbucket_name)%0A%20%20%20%20for%20obj%20in%20response%5B%22Contents%22%5D%3A%0A%20%20%20%20%20%20%20%20print(f%22-%20%7Bobj%5B'Key'%5D%7D%20(Size%3A%20%7Bobj%5B'Size'%5D%7D%20bytes)%22)%0A%0A%40app.local_entrypoint()%0Adef%20main()%3A%0A%20%20%20%20%23%20Replace%20with%20the%20role%20ARN%20and%20bucket%20name%20from%20step%202%0A%20%20%20%20list_bucket_contents.remote(%22fun-bucket%22%2C%20%22arn%3Aaws%3Aiam%3A%3A123456789abcd%3Arole%2Foidc_test_role%22)`,lang:`python`});var z=o(ie,4);u(z,{code:`%24%20modal%20run%20oidc-token-test.py%0A-%20test-file.txt%20(Size%3A%2010%20bytes)`,lang:`bash`});var B=o(z,2);c(B,{id:`demo-usage-with-aws-elastic-container-registry-ecr`,children:(e,t)=>{s(),i(e,r(`Demo usage with AWS Elastic Container Registry (ECR)`))},$$slots:{default:!0}});var V=o(B,2);f(o(e(V)),{href:`/docs/guide/existing-images`,children:(e,t)=>{s(),i(e,r(`Private Registries`))},$$slots:{default:!0}}),s(),n(V);var H=o(V,2);l(H,{id:`prerequisites`,children:(e,t)=>{s(),i(e,r(`Prerequisites`))},$$slots:{default:!0}});var U=o(H,2),W=e(U),G=e(W);f(o(e(G)),{href:`#step-1-configure-aws-to-trust-modals-oidc-provider`,children:(e,t)=>{s(),i(e,r(`Step 1 above`))},$$slots:{default:!0}}),s(),n(G),n(W);var K=o(W,2),q=e(K);f(e(q),{href:`/docs/guide/existing-images#elastic-container-registry-ecr`,children:(e,t)=>{s(),i(e,r(`Create an AWS Policy with read-only ECR access`))},$$slots:{default:!0}}),n(q),n(K);var J=o(K,2),Y=e(J);f(o(e(Y)),{href:`#step-3-create-an-iam-role-that-can-be-assumed-by-modal-functions`,children:(e,t)=>{s(),i(e,r(`Step 3 above`))},$$slots:{default:!0}}),s(),n(Y),n(J),n(U);var X=o(U,2);l(X,{id:`test-with-a-sample-image`,children:(e,t)=>{s(),i(e,r(`Test with a sample image`))},$$slots:{default:!0}});var Z=o(X,4);u(Z,{code:`FROM%20python%3A3.11-slim%0AWORKDIR%20%2Fapp%0ACMD%20%5B%22python3%22%5D`,lang:`dockerfile`});var Q=o(Z,4);u(Q,{code:`%23%20Login%20with%20the%20AWS%20CLI%0Aaws%20ecr%20get-login-password%20--region%20%5BECR_REGION%5D%20%7C%20docker%20login%20--username%20AWS%20--password-stdin%20%5BECR_REPO_ARN%5D%0A%0A%23%20Build%20the%20Docker%20Image%0Adocker%20build%20-t%20modal-oidc-test-image%20.%0A%0A%23%20Push%20the%20image%20to%20ECR%0Adocker%20tag%20modal-oidc-test-image%3Alatest%20%5BECR_REPO_ARN%5D%3Alatest%0Adocker%20push%20%5BECR_REPO_ARN%5D%3Alatest`,lang:`bash`});var $=o(Q,4);u($,{code:`import%20modal%0A%0Aapp%20%3D%20modal.App(%22image-from-ecr-test%22)%0Asample_image%20%3D%20modal.Image.from_aws_ecr(%0A%20%20%20%20%22%5BECR_IMAGE_URI%5D%22%2C%20%23eg.%20%2212345678.dkr.ecr.us-east-1.amazonaws.com%2Frepository%3Alatest%22%0A%20%20%20%20secret%3Dmodal.Secret.from_dict(%0A%20%20%20%20%20%20%20%20%7B%0A%20%20%20%20%20%20%20%20%20%20%20%20%22AWS_ROLE_ARN%22%3A%20%22%5BIAM_ROLE_ARN%5D%22%2C%20%23%20eg.%20%22arn%3Aaws%3Aiam%3A%3A123456789abcd%3Arole%2Foidc_test_role%22%0A%20%20%20%20%20%20%20%20%20%20%20%20%22AWS_REGION%22%3A%20%22%5BECR_REGION%5D%22%2C%20%23%20eg.%20%22us-east-1%22%0A%20%20%20%20%20%20%20%20%7D%0A%20%20%20%20)%2C%0A)%0A%0A%40app.function(image%3Dsample_image)%0Adef%20hello()%3A%0A%20%20%20%20print(%22Hello%2C%20World!%22)`,lang:`python`});var ae=o($,2);c(ae,{id:`next-steps`,children:(e,t)=>{s(),i(e,r(`Next steps`))},$$slots:{default:!0}});var oe=o(ae,2),se=o(e(oe));f(se,{href:`https://developer.hashicorp.com/vault/docs/auth/jwt`,rel:`nofollow`,children:(e,t)=>{s(),i(e,r(`Vault`))},$$slots:{default:!0}});var ce=o(se,2);f(ce,{href:`https://cloud.google.com/identity-platform/docs/web/oidc`,rel:`nofollow`,children:(e,t)=>{s(),i(e,r(`GCP`))},$$slots:{default:!0}}),f(o(ce,2),{href:`https://learn.microsoft.com/en-us/entra/identity-platform/v2-protocols-oidc`,rel:`nofollow`,children:(e,t)=>{s(),i(e,r(`Azure`))},$$slots:{default:!0}}),s(),n(oe),i(t,a)},$$slots:{default:!0}}))}export{v as default,p as metadata};
//# sourceMappingURL=DA-7sqEM.js.map
