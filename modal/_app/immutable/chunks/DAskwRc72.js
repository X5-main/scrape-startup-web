(function(){try{var e=typeof window<`u`?window:typeof global<`u`?global:typeof globalThis<`u`?globalThis:typeof self<`u`?self:{};e.SENTRY_RELEASE={id:`f99fcf9f0a844cc9bd13fdc8e5782b84`};var t=new e.Error().stack;t&&(e._sentryDebugIds=e._sentryDebugIds||{},e._sentryDebugIds[t]=`92954f91-be76-4474-876c-47645b33c563`,e._sentryDebugIdIdentifier=`sentry-dbid-92954f91-be76-4474-876c-47645b33c563`)}catch{}})();import{$t as e,St as t,Tn as n,Tt as r,bt as i,c as a,d as o,en as s,tn as c,wn as l}from"./F_ixKBiO.js";import"./B1sc9Zdx.js";import"./Bb2deiU3.js";import{a as u,o as d}from"./CPby7b1n.js";import{t as f}from"./BILrvr3I.js";import{t as p}from"./B4L_if842.js";import{t as m}from"./DeWGVqas2.js";var h={crossLinks:[{text:`OpenAI Secret for LangChain RAG`,href:`/docs/examples/potus_speech_qanda`},{text:`Write to Google Sheets`,href:`/docs/examples/db_to_sheet`}],toc:[{depth:1,value:`Secrets`,id:`secrets`,children:[{depth:2,value:`Limits`,id:`limits`},{depth:2,value:`Deploy Secrets from the Modal Dashboard`,id:`deploy-secrets-from-the-modal-dashboard`},{depth:2,value:`Use Secrets in your Modal Apps`,id:`use-secrets-in-your-modal-apps`},{depth:2,value:`Create Secrets programmatically`,id:`create-secrets-programmatically`},{depth:2,value:`Interact with Secrets from the command line`,id:`interact-with-secrets-from-the-command-line`}]}],rawContent:`# Secrets

Securely provide credentials and other sensitive information to your Modal Functions with Secrets.

You can create and edit Secrets via
the [dashboard](/secrets),
the command line interface ([\`modal secret\`](/docs/cli/latest/secret)), and
programmatically from Python code ([\`modal.Secret\`](/docs/sdk/py/latest/Secret)).

To inject Secrets into the container running your Function, add the
\`secrets=[...]\` argument to your \`app.function\` or \`app.cls\` decoration.

## Limits

Each key-value pair in a Secret is subject to the following limits:

- **Key names** can be at most **16,384 characters** long. They must contain only letters, digits, and underscores, and cannot start with a digit.
- **Values** can be at most **32,768 characters** long.

If you need to provide larger values to your containers, consider writing the data to a [Volume](/docs/guide/volumes) and reading it at runtime.

## Deploy Secrets from the Modal Dashboard

The most common way to create a Modal Secret is to use the
[Secrets panel of the Modal dashboard](/secrets),
which also shows any existing Secrets.

When you create a new Secret, you'll be prompted with a number of templates to help you get started.
These templates demonstrate standard formats for credentials for everything from Postgres and MongoDB
to Weights & Biases and Hugging Face.

## Use Secrets in your Modal Apps

You can then use your Secret by constructing it \`from_name\` when defining a Modal App
and then accessing its contents as environment variables.
For example, if you have a Secret called \`secret-keys\` containing the key
\`MY_PASSWORD\`:

\`\`\`python
@app.function(secrets=[modal.Secret.from_name("secret-keys")])
def some_function():
    import os

    secret_key = os.environ["MY_PASSWORD"]
    ...
\`\`\`

Each Secret can contain multiple keys and values but you can also inject
multiple Secrets, allowing you to separate Secrets into smaller reusable units:

\`\`\`python
@app.function(secrets=[
    modal.Secret.from_name("my-secret-name"),
    modal.Secret.from_name("other-secret"),
])
def other_function():
    ...
\`\`\`

The Secrets are applied in order, so key-values from later \`modal.Secret\`
objects in the list will overwrite earlier key-values in the case of a clash.
For example, if both \`modal.Secret\` objects above contained the key \`FOO\`, then
the value from \`"other-secret"\` would always be present in \`os.environ["FOO"]\`.

## Create Secrets programmatically

In addition to defining Secrets on the web dashboard, you can
programmatically create a Secret directly in your script and send it along to
your Function using \`Secret.from_dict(...)\`. This can be useful if you want to
send Secrets from your local development machine to the remote Modal App.

\`\`\`python
import os

if modal.is_local():
    local_secret = modal.Secret.from_dict({"FOO": os.environ["LOCAL_FOO"]})
else:
    local_secret = modal.Secret.from_dict({})


@app.function(secrets=[local_secret])
def some_function():
    import os

    print(os.environ["FOO"])
\`\`\`

If you have [\`python-dotenv\`](https://pypi.org/project/python-dotenv/) installed,
you can also use \`Secret.from_dotenv()\` to create a Secret from the variables in a \`.env\`
file

\`\`\`python
@app.function(secrets=[modal.Secret.from_dotenv()])
def some_other_function():
    print(os.environ["USERNAME"])
\`\`\`

## Interact with Secrets from the command line

You can create, list, and delete your Modal Secrets with the \`modal secret\` command line interface.

View your Secrets and their timestamps with

\`\`\`bash
modal secret list
\`\`\`

Create a new Secret by passing \`{KEY}={VALUE}\` pairs to \`modal secret create\`:

\`\`\`bash
modal secret create database-secret PGHOST=uri PGPORT=5432 PGUSER=admin PGPASSWORD=hunter2
\`\`\`

or using environment variables (assuming below that the \`PGPASSWORD\` environment variable is set
e.g. by your CI system):

\`\`\`bash
modal secret create database-secret PGHOST=uri PGPORT=5432 PGUSER=admin PGPASSWORD="$PGPASSWORD"
\`\`\`

Remove Secrets by passing their name to \`modal secret delete\`:

\`\`\`bash
modal secret delete database-secret
\`\`\`
`,meta:{title:`Secrets`,description:`Securely provide credentials and other sensitive information to your Modal Functions with Secrets.`}},{crossLinks:g,toc:_,rawContent:v,meta:y}=h,b=t(`<code>modal secret</code>`),x=t(`<code>modal.Secret</code>`),S=t(`<code>python-dotenv</code>`),C=t(`<!> <p>Securely provide credentials and other sensitive information to your Modal Functions with Secrets.</p> <p>You can create and edit Secrets via
the <!>,
the command line interface (<!>), and
programmatically from Python code (<!>).</p> <p>To inject Secrets into the container running your Function, add the <code>secrets=[...]</code> argument to your <code>app.function</code> or <code>app.cls</code> decoration.</p> <!> <p>Each key-value pair in a Secret is subject to the following limits:</p> <ul><li><strong>Key names</strong> can be at most <strong>16,384 characters</strong> long. They must contain only letters, digits, and underscores, and cannot start with a digit.</li> <li><strong>Values</strong> can be at most <strong>32,768 characters</strong> long.</li></ul> <p>If you need to provide larger values to your containers, consider writing the data to a <!> and reading it at runtime.</p> <!> <p>The most common way to create a Modal Secret is to use the <!>,
which also shows any existing Secrets.</p> <p>When you create a new Secret, you’ll be prompted with a number of templates to help you get started.
These templates demonstrate standard formats for credentials for everything from Postgres and MongoDB
to Weights & Biases and Hugging Face.</p> <!> <p>You can then use your Secret by constructing it <code>from_name</code> when defining a Modal App
and then accessing its contents as environment variables.
For example, if you have a Secret called <code>secret-keys</code> containing the key <code>MY_PASSWORD</code>:</p> <!> <p>Each Secret can contain multiple keys and values but you can also inject
multiple Secrets, allowing you to separate Secrets into smaller reusable units:</p> <!> <p>The Secrets are applied in order, so key-values from later <code>modal.Secret</code> objects in the list will overwrite earlier key-values in the case of a clash.
For example, if both <code>modal.Secret</code> objects above contained the key <code>FOO</code>, then
the value from <code>"other-secret"</code> would always be present in <code>os.environ["FOO"]</code>.</p> <!> <p>In addition to defining Secrets on the web dashboard, you can
programmatically create a Secret directly in your script and send it along to
your Function using <code>Secret.from_dict(...)</code>. This can be useful if you want to
send Secrets from your local development machine to the remote Modal App.</p> <!> <p>If you have <!> installed,
you can also use <code>Secret.from_dotenv()</code> to create a Secret from the variables in a <code>.env</code> file</p> <!> <!> <p>You can create, list, and delete your Modal Secrets with the <code>modal secret</code> command line interface.</p> <p>View your Secrets and their timestamps with</p> <!> <p>Create a new Secret by passing <code>&#123;KEY&#125;=&#123;VALUE&#125;</code> pairs to <code>modal secret create</code>:</p> <!> <p>or using environment variables (assuming below that the <code>PGPASSWORD</code> environment variable is set
e.g. by your CI system):</p> <!> <p>Remove Secrets by passing their name to <code>modal secret delete</code>:</p> <!>`,1);function w(t,g){let _=a(g,[`children`,`$$slots`,`$$events`,`$$legacy`]);p(t,o(()=>_,()=>h,{children:(t,a)=>{var o=C(),p=s(o);d(p,{id:`secrets`,children:(e,t)=>{l(),i(e,r(`Secrets`))},$$slots:{default:!0}});var h=c(p,4),g=c(e(h));m(g,{href:`/secrets`,children:(e,t)=>{l(),i(e,r(`dashboard`))},$$slots:{default:!0}});var _=c(g,2);m(_,{href:`/docs/cli/latest/secret`,children:(e,t)=>{i(e,b())},$$slots:{default:!0}}),m(c(_,2),{href:`/docs/sdk/py/latest/Secret`,children:(e,t)=>{i(e,x())},$$slots:{default:!0}}),l(),n(h);var v=c(h,4);u(v,{id:`limits`,children:(e,t)=>{l(),i(e,r(`Limits`))},$$slots:{default:!0}});var y=c(v,6);m(c(e(y)),{href:`/docs/guide/volumes`,children:(e,t)=>{l(),i(e,r(`Volume`))},$$slots:{default:!0}}),l(),n(y);var w=c(y,2);u(w,{id:`deploy-secrets-from-the-modal-dashboard`,children:(e,t)=>{l(),i(e,r(`Deploy Secrets from the Modal Dashboard`))},$$slots:{default:!0}});var T=c(w,2);m(c(e(T)),{href:`/secrets`,children:(e,t)=>{l(),i(e,r(`Secrets panel of the Modal dashboard`))},$$slots:{default:!0}}),l(),n(T);var E=c(T,4);u(E,{id:`use-secrets-in-your-modal-apps`,children:(e,t)=>{l(),i(e,r(`Use Secrets in your Modal Apps`))},$$slots:{default:!0}});var D=c(E,4);f(D,{code:`%40app.function(secrets%3D%5Bmodal.Secret.from_name(%22secret-keys%22)%5D)%0Adef%20some_function()%3A%0A%20%20%20%20import%20os%0A%0A%20%20%20%20secret_key%20%3D%20os.environ%5B%22MY_PASSWORD%22%5D%0A%20%20%20%20...`,lang:`python`});var O=c(D,4);f(O,{code:`%40app.function(secrets%3D%5B%0A%20%20%20%20modal.Secret.from_name(%22my-secret-name%22)%2C%0A%20%20%20%20modal.Secret.from_name(%22other-secret%22)%2C%0A%5D)%0Adef%20other_function()%3A%0A%20%20%20%20...`,lang:`python`});var k=c(O,4);u(k,{id:`create-secrets-programmatically`,children:(e,t)=>{l(),i(e,r(`Create Secrets programmatically`))},$$slots:{default:!0}});var A=c(k,4);f(A,{code:`import%20os%0A%0Aif%20modal.is_local()%3A%0A%20%20%20%20local_secret%20%3D%20modal.Secret.from_dict(%7B%22FOO%22%3A%20os.environ%5B%22LOCAL_FOO%22%5D%7D)%0Aelse%3A%0A%20%20%20%20local_secret%20%3D%20modal.Secret.from_dict(%7B%7D)%0A%0A%0A%40app.function(secrets%3D%5Blocal_secret%5D)%0Adef%20some_function()%3A%0A%20%20%20%20import%20os%0A%0A%20%20%20%20print(os.environ%5B%22FOO%22%5D)`,lang:`python`});var j=c(A,2);m(c(e(j)),{href:`https://pypi.org/project/python-dotenv/`,rel:`nofollow`,children:(e,t)=>{i(e,S())},$$slots:{default:!0}}),l(5),n(j);var M=c(j,2);f(M,{code:`%40app.function(secrets%3D%5Bmodal.Secret.from_dotenv()%5D)%0Adef%20some_other_function()%3A%0A%20%20%20%20print(os.environ%5B%22USERNAME%22%5D)`,lang:`python`});var N=c(M,2);u(N,{id:`interact-with-secrets-from-the-command-line`,children:(e,t)=>{l(),i(e,r(`Interact with Secrets from the command line`))},$$slots:{default:!0}});var P=c(N,6);f(P,{code:`modal%20secret%20list`,lang:`bash`});var F=c(P,4);f(F,{code:`modal%20secret%20create%20database-secret%20PGHOST%3Duri%20PGPORT%3D5432%20PGUSER%3Dadmin%20PGPASSWORD%3Dhunter2`,lang:`bash`});var I=c(F,4);f(I,{code:`modal%20secret%20create%20database-secret%20PGHOST%3Duri%20PGPORT%3D5432%20PGUSER%3Dadmin%20PGPASSWORD%3D%22%24PGPASSWORD%22`,lang:`bash`}),f(c(I,4),{code:`modal%20secret%20delete%20database-secret`,lang:`bash`}),i(t,o)},$$slots:{default:!0}}))}export{w as default,h as metadata};
//# sourceMappingURL=DAskwRc72.js.map
