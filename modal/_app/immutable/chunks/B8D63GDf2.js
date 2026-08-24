(function(){try{var e=typeof window<`u`?window:typeof global<`u`?global:typeof globalThis<`u`?globalThis:typeof self<`u`?self:{};e.SENTRY_RELEASE={id:`f99fcf9f0a844cc9bd13fdc8e5782b84`};var t=new e.Error().stack;t&&(e._sentryDebugIds=e._sentryDebugIds||{},e._sentryDebugIds[t]=`cb415dbc-9bf4-486e-abbf-9dbf3a41080b`,e._sentryDebugIdIdentifier=`sentry-dbid-cb415dbc-9bf4-486e-abbf-9dbf3a41080b`)}catch{}})();import{$t as e,St as t,Tn as n,Tt as r,bt as i,c as a,d as o,en as s,tn as c,wn as l}from"./F_ixKBiO.js";import"./B1sc9Zdx.js";import"./Bb2deiU3.js";import{o as u}from"./CPby7b1n.js";import{t as d}from"./BILrvr3I.js";import{t as f}from"./B4L_if842.js";import{t as p}from"./DeWGVqas2.js";var m={toc:[{depth:1,value:`Run Claude Code in a Modal Sandbox`,id:`run-claude-code-in-a-modal-sandbox`}],rawContent:`# Run Claude Code in a Modal Sandbox

This example demonstrates how to run Claude Code in a Modal
[Sandbox](https://modal.com/docs/guide/sandbox) to analyze a GitHub repository.
The Sandbox provides an isolated environment where the agent can safely execute code
and examine files.

You can also run this in a [Modal Notebook](https://modal.com/notebooks/modal-labs/_/nb-30WInxiigR3Wc8kQ3jU7Hr)!

\`\`\`python
import modal
from modal.container_process import ContainerProcess

app = modal.App.lookup("example-sandbox-agent", create_if_missing=True)

\`\`\`

First, we create a custom [Image](https://modal.com/docs/guide/images) that has Claude Code
and git installed.

\`\`\`python
image = (
    modal.Image.debian_slim(python_version="3.12")
    .apt_install("curl", "git")
    .env({"PATH": "/root/.local/bin:$PATH"})  # add claude to path
    .run_commands(
        "curl -fsSL https://claude.ai/install.sh | bash",
    )
)

\`\`\`

Then we create our Sandbox.

\`\`\`python
with modal.enable_output():
    sandbox = modal.Sandbox.create(app=app, image=image)
print(f"Sandbox ID: {sandbox.object_id}")

\`\`\`

Next we'll clone the repository that Claude Code will work on.
We'll use [the Modal examples repo](https://github.com/modal-labs/modal-examples)
that this example is a part of.

We trigger the clone by [\`exec\`](https://modal.com/docs/reference/modal.Sandbox#exec)uting
\`git\` as a process inside the Sandbox. We then \`.wait\` for it to finish.
You can read more about the interface for managing
\`ContainerProcess\`es in Sandboxes [here](https://modal.com/docs/reference/modal.container_process).

\`\`\`python
repo_url = "https://github.com/modal-labs/modal-examples"
git_ps: ContainerProcess = sandbox.exec(
    "git", "clone", "--depth", "1", repo_url, "/repo"
)
git_ps.wait()
print(f"Cloned '{repo_url}' into /repo.")

\`\`\`

Finally we'll use \`exec\` again to run Claude Code to analyze the repository.
Here, we pass the \`pty\` flag to give the process a
[pseudo-terminal](https://unix.stackexchange.com/questions/21147/what-are-pseudo-terminals-pty-tty).

\`\`\`python
claude_cmd = ["claude", "-p", "What is in this repository?"]

print("\\nRunning command:", *claude_cmd)

claude_ps = sandbox.exec(
    *claude_cmd,
    pty=True,  # Adding a PTY is important, since Claude requires it
    secrets=[
        modal.Secret.from_name("anthropic-secret", required_keys=["ANTHROPIC_API_KEY"])
    ],
    workdir="/repo",
)
claude_ps.wait()

\`\`\`

Once the command finishes, we read the \`stdout\` and \`stderr\`.

\`\`\`python
print("\\nAgent stdout:\\n")
print(claude_ps.stdout.read())

stderr = claude_ps.stderr.read()
if stderr != "":
    print("Agent stderr:", stderr)

\`\`\`

Nice, you've got Claude Code running in a Modal Sandbox! What's next?

- Check out [this example](https://modal.com/docs/examples/opencode_server) to see how you might productionize this.
- Want to restore quickly after repo setup / builds? Try [Filesystem Snapshots](https://modal.com/docs/guide/sandbox-snapshots#filesystem-snapshots).
- More complex prompt routing and metadata? You may need a [Dict](https://modal.com/docs/guide/dicts) or a [Queue](https://modal.com/docs/guide/queues).
- Need performant, durable storage? Try out [Modal Volumes](https://modal.com/docs/guide/volumes).
- Hook it up to your custom [MCP Server](https://modal.com/docs/examples/mcp_server_stateless) for passing more external context to your agent.
`,meta:{title:`Run Claude Code in a Modal Sandbox`,description:`This example demonstrates how to run Claude Code in a Modal Sandbox to analyze a GitHub repository. The Sandbox provides an isolated environment where the agent can safely execute code and examine files.`}},{toc:h,rawContent:g,meta:_}=m,v=t(`<code>exec</code>`),y=t(`<!> <p>This example demonstrates how to run Claude Code in a Modal <!> to analyze a GitHub repository.
The Sandbox provides an isolated environment where the agent can safely execute code
and examine files.</p> <p>You can also run this in a <!>!</p> <!> <p>First, we create a custom <!> that has Claude Code
and git installed.</p> <!> <p>Then we create our Sandbox.</p> <!> <p>Next we’ll clone the repository that Claude Code will work on.
We’ll use <!> that this example is a part of.</p> <p>We trigger the clone by <!>uting <code>git</code> as a process inside the Sandbox. We then <code>.wait</code> for it to finish.
You can read more about the interface for managing <code>ContainerProcess</code>es in Sandboxes <!>.</p> <!> <p>Finally we’ll use <code>exec</code> again to run Claude Code to analyze the repository.
Here, we pass the <code>pty</code> flag to give the process a <!>.</p> <!> <p>Once the command finishes, we read the <code>stdout</code> and <code>stderr</code>.</p> <!> <p>Nice, you’ve got Claude Code running in a Modal Sandbox! What’s next?</p> <ul><li>Check out <!> to see how you might productionize this.</li> <li>Want to restore quickly after repo setup / builds? Try <!>.</li> <li>More complex prompt routing and metadata? You may need a <!> or a <!>.</li> <li>Need performant, durable storage? Try out <!>.</li> <li>Hook it up to your custom <!> for passing more external context to your agent.</li></ul>`,1);function b(t,h){let g=a(h,[`children`,`$$slots`,`$$events`,`$$legacy`]);f(t,o(()=>g,()=>m,{children:(t,a)=>{var o=y(),f=s(o);u(f,{id:`run-claude-code-in-a-modal-sandbox`,children:(e,t)=>{l(),i(e,r(`Run Claude Code in a Modal Sandbox`))},$$slots:{default:!0}});var m=c(f,2);p(c(e(m)),{href:`https://modal.com/docs/guide/sandbox`,rel:`nofollow`,children:(e,t)=>{l(),i(e,r(`Sandbox`))},$$slots:{default:!0}}),l(),n(m);var h=c(m,2);p(c(e(h)),{href:`https://modal.com/notebooks/modal-labs/_/nb-30WInxiigR3Wc8kQ3jU7Hr`,rel:`nofollow`,children:(e,t)=>{l(),i(e,r(`Modal Notebook`))},$$slots:{default:!0}}),l(),n(h);var g=c(h,2);d(g,{code:`import%20modal%0Afrom%20modal.container_process%20import%20ContainerProcess%0A%0Aapp%20%3D%20modal.App.lookup(%22example-sandbox-agent%22%2C%20create_if_missing%3DTrue)%0A`,lang:`python`});var _=c(g,2);p(c(e(_)),{href:`https://modal.com/docs/guide/images`,rel:`nofollow`,children:(e,t)=>{l(),i(e,r(`Image`))},$$slots:{default:!0}}),l(),n(_);var b=c(_,2);d(b,{code:`image%20%3D%20(%0A%20%20%20%20modal.Image.debian_slim(python_version%3D%223.12%22)%0A%20%20%20%20.apt_install(%22curl%22%2C%20%22git%22)%0A%20%20%20%20.env(%7B%22PATH%22%3A%20%22%2Froot%2F.local%2Fbin%3A%24PATH%22%7D)%20%20%23%20add%20claude%20to%20path%0A%20%20%20%20.run_commands(%0A%20%20%20%20%20%20%20%20%22curl%20-fsSL%20https%3A%2F%2Fclaude.ai%2Finstall.sh%20%7C%20bash%22%2C%0A%20%20%20%20)%0A)%0A`,lang:`python`});var x=c(b,4);d(x,{code:`with%20modal.enable_output()%3A%0A%20%20%20%20sandbox%20%3D%20modal.Sandbox.create(app%3Dapp%2C%20image%3Dimage)%0Aprint(f%22Sandbox%20ID%3A%20%7Bsandbox.object_id%7D%22)%0A`,lang:`python`});var S=c(x,2);p(c(e(S)),{href:`https://github.com/modal-labs/modal-examples`,rel:`nofollow`,children:(e,t)=>{l(),i(e,r(`the Modal examples repo`))},$$slots:{default:!0}}),l(),n(S);var C=c(S,2),w=c(e(C));p(w,{href:`https://modal.com/docs/reference/modal.Sandbox#exec`,rel:`nofollow`,children:(e,t)=>{i(e,v())},$$slots:{default:!0}}),p(c(w,8),{href:`https://modal.com/docs/reference/modal.container_process`,rel:`nofollow`,children:(e,t)=>{l(),i(e,r(`here`))},$$slots:{default:!0}}),l(),n(C);var T=c(C,2);d(T,{code:`repo_url%20%3D%20%22https%3A%2F%2Fgithub.com%2Fmodal-labs%2Fmodal-examples%22%0Agit_ps%3A%20ContainerProcess%20%3D%20sandbox.exec(%0A%20%20%20%20%22git%22%2C%20%22clone%22%2C%20%22--depth%22%2C%20%221%22%2C%20repo_url%2C%20%22%2Frepo%22%0A)%0Agit_ps.wait()%0Aprint(f%22Cloned%20'%7Brepo_url%7D'%20into%20%2Frepo.%22)%0A`,lang:`python`});var E=c(T,2);p(c(e(E),5),{href:`https://unix.stackexchange.com/questions/21147/what-are-pseudo-terminals-pty-tty`,rel:`nofollow`,children:(e,t)=>{l(),i(e,r(`pseudo-terminal`))},$$slots:{default:!0}}),l(),n(E);var D=c(E,2);d(D,{code:`claude_cmd%20%3D%20%5B%22claude%22%2C%20%22-p%22%2C%20%22What%20is%20in%20this%20repository%3F%22%5D%0A%0Aprint(%22%5CnRunning%20command%3A%22%2C%20*claude_cmd)%0A%0Aclaude_ps%20%3D%20sandbox.exec(%0A%20%20%20%20*claude_cmd%2C%0A%20%20%20%20pty%3DTrue%2C%20%20%23%20Adding%20a%20PTY%20is%20important%2C%20since%20Claude%20requires%20it%0A%20%20%20%20secrets%3D%5B%0A%20%20%20%20%20%20%20%20modal.Secret.from_name(%22anthropic-secret%22%2C%20required_keys%3D%5B%22ANTHROPIC_API_KEY%22%5D)%0A%20%20%20%20%5D%2C%0A%20%20%20%20workdir%3D%22%2Frepo%22%2C%0A)%0Aclaude_ps.wait()%0A`,lang:`python`});var O=c(D,4);d(O,{code:`print(%22%5CnAgent%20stdout%3A%5Cn%22)%0Aprint(claude_ps.stdout.read())%0A%0Astderr%20%3D%20claude_ps.stderr.read()%0Aif%20stderr%20!%3D%20%22%22%3A%0A%20%20%20%20print(%22Agent%20stderr%3A%22%2C%20stderr)%0A`,lang:`python`});var k=c(O,4),A=e(k);p(c(e(A)),{href:`https://modal.com/docs/examples/opencode_server`,rel:`nofollow`,children:(e,t)=>{l(),i(e,r(`this example`))},$$slots:{default:!0}}),l(),n(A);var j=c(A,2);p(c(e(j)),{href:`https://modal.com/docs/guide/sandbox-snapshots#filesystem-snapshots`,rel:`nofollow`,children:(e,t)=>{l(),i(e,r(`Filesystem Snapshots`))},$$slots:{default:!0}}),l(),n(j);var M=c(j,2),N=c(e(M));p(N,{href:`https://modal.com/docs/guide/dicts`,rel:`nofollow`,children:(e,t)=>{l(),i(e,r(`Dict`))},$$slots:{default:!0}}),p(c(N,2),{href:`https://modal.com/docs/guide/queues`,rel:`nofollow`,children:(e,t)=>{l(),i(e,r(`Queue`))},$$slots:{default:!0}}),l(),n(M);var P=c(M,2);p(c(e(P)),{href:`https://modal.com/docs/guide/volumes`,rel:`nofollow`,children:(e,t)=>{l(),i(e,r(`Modal Volumes`))},$$slots:{default:!0}}),l(),n(P);var F=c(P,2);p(c(e(F)),{href:`https://modal.com/docs/examples/mcp_server_stateless`,rel:`nofollow`,children:(e,t)=>{l(),i(e,r(`MCP Server`))},$$slots:{default:!0}}),l(),n(F),n(k),i(t,o)},$$slots:{default:!0}}))}export{b as default,m as metadata};
//# sourceMappingURL=B8D63GDf2.js.map
