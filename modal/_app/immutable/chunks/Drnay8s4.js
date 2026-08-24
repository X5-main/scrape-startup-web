(function(){try{var e=typeof window<`u`?window:typeof global<`u`?global:typeof globalThis<`u`?globalThis:typeof self<`u`?self:{};e.SENTRY_RELEASE={id:`f99fcf9f0a844cc9bd13fdc8e5782b84`};var t=new e.Error().stack;t&&(e._sentryDebugIds=e._sentryDebugIds||{},e._sentryDebugIds[t]=`803ce01e-1de9-448a-b7d3-fba90fcf918c`,e._sentryDebugIdIdentifier=`sentry-dbid-803ce01e-1de9-448a-b7d3-fba90fcf918c`)}catch{}})();import{$t as e,St as t,Tn as n,Tt as r,bt as i,c as a,d as o,en as s,tn as c,wn as l}from"./F_ixKBiO.js";import"./B1sc9Zdx.js";import"./Bb2deiU3.js";import{a as u,o as d}from"./CPby7b1n.js";import{t as f}from"./JPsrybyr.js";import{t as p}from"./BILrvr3I.js";import{t as m}from"./B4L_if842.js";import{t as h}from"./DeWGVqas2.js";var g={toc:[{depth:1,value:`Run OpenCode in a Modal Sandbox`,id:`run-opencode-in-a-modal-sandbox`,children:[{depth:2,value:`Set up OpenCode on Modal`,id:`set-up-opencode-on-modal`},{depth:2,value:`Clone a GitHub repository`,id:`clone-a-github-repository`},{depth:2,value:`Grant Modal credentials`,id:`grant-modal-credentials`},{depth:2,value:`Start the Sandbox`,id:`start-the-sandbox`},{depth:2,value:`Putting it all together`,id:`putting-it-all-together`},{depth:2,value:`Command-line options`,id:`command-line-options`}]}],rawContent:`# Run OpenCode in a Modal Sandbox

This example demonstrates how to run [OpenCode](https://opencode.ai/docs)
remotely and connect to it from your local terminal or browser.

Combine self-hosted OpenCode with [serving a big, smart model](https://modal.com/docs/examples/very_large_models)
on Modal and you've got "coding agents at home"!

Coding agents are most useful when they have context and tools.
By default, this script clones the [Modal examples repo](https://github.com/modal-labs/modal-examples)
and gives the agent access to your Modal credentials,
so it can run and debug examples (including this one!).
Meta.

![A screenshot of the OpenCode Web UI showing this coding agent running its own code](https://modal-cdn.com/examples-opencode-server-webui.png)

## Set up OpenCode on Modal

\`\`\`python
import argparse
import os
from pathlib import Path

import modal

MINUTES = 60
HOURS = 60 * MINUTES
OPENCODE_PORT = 4096
DEFAULT_GITHUB_REPO = "modal-labs/modal-examples"

\`\`\`

First, we define a Modal container [Image](https://modal.com/docs/guide/images)
with OpenCode installed.

\`\`\`python
def define_base_image() -> modal.Image:
    image = (
        modal.Image.debian_slim()
        .apt_install("curl", "git", "gh")
        .run_commands("curl -fsSL https://opencode.ai/install | bash")
        .env({"PATH": "/root/.opencode/bin:\${PATH}"})
    )

    # We also bring the global default OpenCode configuration along for the ride.

    CONFIG_PATH = Path("~/.config/opencode/opencode.json").expanduser()
    if CONFIG_PATH.exists():
        print("🏖️  Including config from", CONFIG_PATH)
        image = image.add_local_file(
            CONFIG_PATH, "/root/.config/opencode/opencode.json", copy=True
        )

    return image


\`\`\`

## Clone a GitHub repository

Next, we clone the code we want the agent to work on.
The repository is cloned into the container image at build time,
so it's available when the Sandbox starts.

\`\`\`python
def clone_github_repo(
    image: modal.Image, repo: str, ref: str, token: str | None = None
) -> modal.Image:
    git_config = "git config --global advice.detachedHead false"

    # For private repositories, pass a GitHub personal access token via \`--github-token\`.
    # For public repositories, no token is needed.

    if token:
        clone_cmd = f"GIT_ASKPASS=echo git clone --quiet --depth 1 --branch {ref} --no-single-branch https://oauth2:{token}@github.com/{repo}.git /root/code"
    else:
        clone_cmd = f"GIT_TERMINAL_PROMPT=0 git clone --quiet --depth 1 --branch {ref} --no-single-branch https://github.com/{repo}.git /root/code"

    print(f"🏖️  Cloning {repo}@{ref} to /root/code")
    return image.run_commands(git_config, clone_cmd, force_build=True)


\`\`\`

## Grant Modal credentials

Since the agent is working with Modal code, we also make it easy to provide Modal access.
Examples in this repo should run with nothing more than \`modal\` installed --
except for a few that use \`fastapi\`.

\`\`\`python
def add_modal_access(image: modal.Image) -> modal.Image:
    image = image.uv_pip_install("modal", "fastapi~=0.128.0")

    # We grant the agent our Modal permissions,
    # either via environment variables or the local credentials file.

    modal_token_id = os.environ.get("MODAL_TOKEN_ID")
    modal_token_secret = os.environ.get("MODAL_TOKEN_SECRET")

    if modal_token_id and modal_token_secret:
        return image.env(
            {"MODAL_TOKEN_ID": modal_token_id, "MODAL_TOKEN_SECRET": modal_token_secret}
        )

    MODAL_PATH = Path("~/.modal.toml").expanduser()
    if MODAL_PATH.exists():
        print("🏖️  Including Modal auth from", MODAL_PATH)
        return image.add_local_file(MODAL_PATH, "/root/.modal.toml", copy=True)

    raise EnvironmentError(
        "No Modal credentials found. "
        "Either set MODAL_TOKEN_ID and MODAL_TOKEN_SECRET environment variables, "
        "or ensure ~/.modal.toml exists."
    )


\`\`\`

## Start the Sandbox

Now, we create a [Modal Sandbox](https://modal.com/docs/guide/sandboxes)
to run our coding agent session.
This Sandbox has our environment Image and a password for authentication.

We open up the \`OPENCODE_PORT\` so that the server can be accessed over the Internet.

\`\`\`python
def create_sandbox(
    image: modal.Image,
    timeout: int,
    app: modal.App,
    secrets: list[modal.Secret],
    working_dir: str | None = None,
) -> modal.Sandbox:
    print("🏖️  Creating sandbox")

    with modal.enable_output():
        return modal.Sandbox.create(
            "opencode",
            "serve",
            "--hostname=0.0.0.0",
            f"--port={OPENCODE_PORT}",
            "--log-level=DEBUG",
            "--print-logs",
            encrypted_ports=[OPENCODE_PORT],
            secrets=secrets,
            timeout=timeout,
            image=image,
            app=app,
            workdir=working_dir,
        )


\`\`\`

OpenCode is truly open -- there are many interfaces to the underlying
coding agent server.
Here we print information for:
- directly accessing the underlying Modal Sandbox for debugging or "pair coding" with the agent
- accessing the Web UI from a local browser (with authentication!)
- accessing the TUI from your local terminal

\`\`\`python
def print_access_info(sandbox: modal.Sandbox, password_secret_name: str):
    print(
        "🏖️  Access the sandbox directly:",
        f"modal shell {sandbox.object_id}",
        sep="\\n\\t",
    )

    tunnel = sandbox.tunnels()[OPENCODE_PORT]
    print(
        "🏖️  Access the WebUI:",
        tunnel.url,
        "Username: opencode",
        sep="\\n\\t",
    )
    print(
        "🏖️  Access the TUI:",
        f"OPENCODE_SERVER_PASSWORD=YOUR_PASSWORD opencode attach {tunnel.url}",
        sep="\\n\\t",
    )
    print(
        "🏖️  Display the password:",
        f"modal shell --secret {password_secret_name} --cmd 'env | grep OPENCODE_SERVER_PASSWORD='",
        sep="\\n\\t",
    )


\`\`\`

The server is secured via a password in a [Modal Secret](https://modal.com/docs/guide/secrets).
You can create one by heading to the [Secrets Dashboard](https://modal.com/secrets)
and creating a new "Custom" Secret. Use \`OPENCODE_SERVER_PASSWORD\` as the key
and the password as the value.

The CLI will also give you a helpful one-liner you can use to recover the password
with your Modal credentials in case you forget it.

## Putting it all together

\`\`\`python
def main(
    timeout: int,
    app_name: str,
    allow_modal_access: bool,
    github_repo: str,
    github_ref: str,
    github_token: str | None,
    password_secret_name: str,
):
    app = modal.App.lookup(app_name, create_if_missing=True)
    image = define_base_image()

    if allow_modal_access:
        image = add_modal_access(image)

    image = clone_github_repo(image, github_repo, github_ref, github_token)

    password_secret = modal.Secret.from_name(password_secret_name)

    sandbox_secrets = [password_secret]
    if github_token:
        sandbox_secrets.append(modal.Secret.from_dict({"GH_TOKEN": github_token}))

    sandbox = create_sandbox(image, timeout, app, sandbox_secrets, "/root/code")
    print_access_info(sandbox, password_secret_name)


\`\`\`

## Command-line options

This script supports configuration via command-line arguments.
Run with \`--help\` to see all options.

To grant the agent the same GitHub permissions you have, you can pass a GitHub personal access token.
If you use the \`gh\` CLI, you can use shell command substitution to pass your current auth:

\`\`\`bash
    python 13_sandboxes/opencode_server.py --github-token $(gh auth token)
\`\`\`

\`\`\`python
def parse_timeout(timeout_str: str) -> int:
    if timeout_str.endswith("h"):
        minutes = int(timeout_str[:-1]) * 60
    elif timeout_str.endswith("m"):
        minutes = int(timeout_str[:-1])
    else:
        minutes = int(timeout_str) * 60

    if minutes < 1:
        raise argparse.ArgumentTypeError("Timeout must be at least 1 minute")
    if minutes > 24 * 60:
        raise argparse.ArgumentTypeError("Timeout cannot exceed 24 hours")

    return minutes * MINUTES


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Launch OpenCode server on Modal")
    parser.add_argument(
        "--timeout",
        type=str,
        default="12",
        help="Server timeout (e.g. 2h, 90m). No suffix -> hours. Default: 12",
    )
    parser.add_argument(
        "--app-name",
        type=str,
        default="example-opencode-server",
        help="Modal app name. Default: example-opencode-server",
    )
    parser.add_argument(
        "--no-modal-access",
        action="store_false",
        dest="allow_modal_access",
        help="Disable Modal credential access",
    )
    parser.add_argument(
        "--password-secret",
        dest="password_secret_name",
        help="Name",
        default="opencode-secret",
    )
    parser.add_argument(
        "--github-repo",
        type=str,
        default=DEFAULT_GITHUB_REPO,
        help=f"GitHub repo in owner/repo format. Default: {DEFAULT_GITHUB_REPO}",
    )
    parser.add_argument(
        "--github-ref",
        type=str,
        default="main",
        help="Git ref to checkout (branch, tag, SHA). Default: main",
    )
    parser.add_argument(
        "--github-token",
        type=str,
        default=None,
        help="GitHub PAT for private repos and gh CLI auth. Tip: use $(gh auth token)",
    )

    args = parser.parse_args()

    main(
        parse_timeout(args.timeout),
        args.app_name,
        args.allow_modal_access,
        args.github_repo,
        args.github_ref,
        args.github_token,
        args.password_secret_name,
    )

\`\`\`
`,meta:{title:`Run OpenCode in a Modal Sandbox`,description:`This example demonstrates how to run OpenCode remotely and connect to it from your local terminal or browser.`}},{toc:_,rawContent:v,meta:y}=g,b=t(`<!> <p>This example demonstrates how to run <!> remotely and connect to it from your local terminal or browser.</p> <p>Combine self-hosted OpenCode with <!> on Modal and you’ve got “coding agents at home”!</p> <p>Coding agents are most useful when they have context and tools.
By default, this script clones the <!> and gives the agent access to your Modal credentials,
so it can run and debug examples (including this one!).
Meta.</p> <p><!></p> <!> <!> <p>First, we define a Modal container <!> with OpenCode installed.</p> <!> <!> <p>Next, we clone the code we want the agent to work on.
The repository is cloned into the container image at build time,
so it’s available when the Sandbox starts.</p> <!> <!> <p>Since the agent is working with Modal code, we also make it easy to provide Modal access.
Examples in this repo should run with nothing more than <code>modal</code> installed —
except for a few that use <code>fastapi</code>.</p> <!> <!> <p>Now, we create a <!> to run our coding agent session.
This Sandbox has our environment Image and a password for authentication.</p> <p>We open up the <code>OPENCODE_PORT</code> so that the server can be accessed over the Internet.</p> <!> <p>OpenCode is truly open — there are many interfaces to the underlying
coding agent server.
Here we print information for:</p> <ul><li>directly accessing the underlying Modal Sandbox for debugging or “pair coding” with the agent</li> <li>accessing the Web UI from a local browser (with authentication!)</li> <li>accessing the TUI from your local terminal</li></ul> <!> <p>The server is secured via a password in a <!>.
You can create one by heading to the <!> and creating a new “Custom” Secret. Use <code>OPENCODE_SERVER_PASSWORD</code> as the key
and the password as the value.</p> <p>The CLI will also give you a helpful one-liner you can use to recover the password
with your Modal credentials in case you forget it.</p> <!> <!> <!> <p>This script supports configuration via command-line arguments.
Run with <code>--help</code> to see all options.</p> <p>To grant the agent the same GitHub permissions you have, you can pass a GitHub personal access token.
If you use the <code>gh</code> CLI, you can use shell command substitution to pass your current auth:</p> <!> <!>`,1);function x(t,_){let v=a(_,[`children`,`$$slots`,`$$events`,`$$legacy`]);m(t,o(()=>v,()=>g,{children:(t,a)=>{var o=b(),m=s(o);d(m,{id:`run-opencode-in-a-modal-sandbox`,children:(e,t)=>{l(),i(e,r(`Run OpenCode in a Modal Sandbox`))},$$slots:{default:!0}});var g=c(m,2);h(c(e(g)),{href:`https://opencode.ai/docs`,rel:`nofollow`,children:(e,t)=>{l(),i(e,r(`OpenCode`))},$$slots:{default:!0}}),l(),n(g);var _=c(g,2);h(c(e(_)),{href:`https://modal.com/docs/examples/very_large_models`,rel:`nofollow`,children:(e,t)=>{l(),i(e,r(`serving a big, smart model`))},$$slots:{default:!0}}),l(),n(_);var v=c(_,2);h(c(e(v)),{href:`https://github.com/modal-labs/modal-examples`,rel:`nofollow`,children:(e,t)=>{l(),i(e,r(`Modal examples repo`))},$$slots:{default:!0}}),l(),n(v);var y=c(v,2);f(e(y),{src:`https://modal-cdn.com/examples-opencode-server-webui.png`,alt:`A screenshot of the OpenCode Web UI showing this coding agent running its own code`}),n(y);var x=c(y,2);u(x,{id:`set-up-opencode-on-modal`,children:(e,t)=>{l(),i(e,r(`Set up OpenCode on Modal`))},$$slots:{default:!0}});var S=c(x,2);p(S,{code:`import%20argparse%0Aimport%20os%0Afrom%20pathlib%20import%20Path%0A%0Aimport%20modal%0A%0AMINUTES%20%3D%2060%0AHOURS%20%3D%2060%20*%20MINUTES%0AOPENCODE_PORT%20%3D%204096%0ADEFAULT_GITHUB_REPO%20%3D%20%22modal-labs%2Fmodal-examples%22%0A`,lang:`python`});var C=c(S,2);h(c(e(C)),{href:`https://modal.com/docs/guide/images`,rel:`nofollow`,children:(e,t)=>{l(),i(e,r(`Image`))},$$slots:{default:!0}}),l(),n(C);var w=c(C,2);p(w,{code:`def%20define_base_image()%20-%3E%20modal.Image%3A%0A%20%20%20%20image%20%3D%20(%0A%20%20%20%20%20%20%20%20modal.Image.debian_slim()%0A%20%20%20%20%20%20%20%20.apt_install(%22curl%22%2C%20%22git%22%2C%20%22gh%22)%0A%20%20%20%20%20%20%20%20.run_commands(%22curl%20-fsSL%20https%3A%2F%2Fopencode.ai%2Finstall%20%7C%20bash%22)%0A%20%20%20%20%20%20%20%20.env(%7B%22PATH%22%3A%20%22%2Froot%2F.opencode%2Fbin%3A%24%7BPATH%7D%22%7D)%0A%20%20%20%20)%0A%0A%20%20%20%20%23%20We%20also%20bring%20the%20global%20default%20OpenCode%20configuration%20along%20for%20the%20ride.%0A%0A%20%20%20%20CONFIG_PATH%20%3D%20Path(%22~%2F.config%2Fopencode%2Fopencode.json%22).expanduser()%0A%20%20%20%20if%20CONFIG_PATH.exists()%3A%0A%20%20%20%20%20%20%20%20print(%22%F0%9F%8F%96%EF%B8%8F%20%20Including%20config%20from%22%2C%20CONFIG_PATH)%0A%20%20%20%20%20%20%20%20image%20%3D%20image.add_local_file(%0A%20%20%20%20%20%20%20%20%20%20%20%20CONFIG_PATH%2C%20%22%2Froot%2F.config%2Fopencode%2Fopencode.json%22%2C%20copy%3DTrue%0A%20%20%20%20%20%20%20%20)%0A%0A%20%20%20%20return%20image%0A%0A`,lang:`python`});var T=c(w,2);u(T,{id:`clone-a-github-repository`,children:(e,t)=>{l(),i(e,r(`Clone a GitHub repository`))},$$slots:{default:!0}});var E=c(T,4);p(E,{code:`def%20clone_github_repo(%0A%20%20%20%20image%3A%20modal.Image%2C%20repo%3A%20str%2C%20ref%3A%20str%2C%20token%3A%20str%20%7C%20None%20%3D%20None%0A)%20-%3E%20modal.Image%3A%0A%20%20%20%20git_config%20%3D%20%22git%20config%20--global%20advice.detachedHead%20false%22%0A%0A%20%20%20%20%23%20For%20private%20repositories%2C%20pass%20a%20GitHub%20personal%20access%20token%20via%20%60--github-token%60.%0A%20%20%20%20%23%20For%20public%20repositories%2C%20no%20token%20is%20needed.%0A%0A%20%20%20%20if%20token%3A%0A%20%20%20%20%20%20%20%20clone_cmd%20%3D%20f%22GIT_ASKPASS%3Decho%20git%20clone%20--quiet%20--depth%201%20--branch%20%7Bref%7D%20--no-single-branch%20https%3A%2F%2Foauth2%3A%7Btoken%7D%40github.com%2F%7Brepo%7D.git%20%2Froot%2Fcode%22%0A%20%20%20%20else%3A%0A%20%20%20%20%20%20%20%20clone_cmd%20%3D%20f%22GIT_TERMINAL_PROMPT%3D0%20git%20clone%20--quiet%20--depth%201%20--branch%20%7Bref%7D%20--no-single-branch%20https%3A%2F%2Fgithub.com%2F%7Brepo%7D.git%20%2Froot%2Fcode%22%0A%0A%20%20%20%20print(f%22%F0%9F%8F%96%EF%B8%8F%20%20Cloning%20%7Brepo%7D%40%7Bref%7D%20to%20%2Froot%2Fcode%22)%0A%20%20%20%20return%20image.run_commands(git_config%2C%20clone_cmd%2C%20force_build%3DTrue)%0A%0A`,lang:`python`});var D=c(E,2);u(D,{id:`grant-modal-credentials`,children:(e,t)=>{l(),i(e,r(`Grant Modal credentials`))},$$slots:{default:!0}});var O=c(D,4);p(O,{code:`def%20add_modal_access(image%3A%20modal.Image)%20-%3E%20modal.Image%3A%0A%20%20%20%20image%20%3D%20image.uv_pip_install(%22modal%22%2C%20%22fastapi~%3D0.128.0%22)%0A%0A%20%20%20%20%23%20We%20grant%20the%20agent%20our%20Modal%20permissions%2C%0A%20%20%20%20%23%20either%20via%20environment%20variables%20or%20the%20local%20credentials%20file.%0A%0A%20%20%20%20modal_token_id%20%3D%20os.environ.get(%22MODAL_TOKEN_ID%22)%0A%20%20%20%20modal_token_secret%20%3D%20os.environ.get(%22MODAL_TOKEN_SECRET%22)%0A%0A%20%20%20%20if%20modal_token_id%20and%20modal_token_secret%3A%0A%20%20%20%20%20%20%20%20return%20image.env(%0A%20%20%20%20%20%20%20%20%20%20%20%20%7B%22MODAL_TOKEN_ID%22%3A%20modal_token_id%2C%20%22MODAL_TOKEN_SECRET%22%3A%20modal_token_secret%7D%0A%20%20%20%20%20%20%20%20)%0A%0A%20%20%20%20MODAL_PATH%20%3D%20Path(%22~%2F.modal.toml%22).expanduser()%0A%20%20%20%20if%20MODAL_PATH.exists()%3A%0A%20%20%20%20%20%20%20%20print(%22%F0%9F%8F%96%EF%B8%8F%20%20Including%20Modal%20auth%20from%22%2C%20MODAL_PATH)%0A%20%20%20%20%20%20%20%20return%20image.add_local_file(MODAL_PATH%2C%20%22%2Froot%2F.modal.toml%22%2C%20copy%3DTrue)%0A%0A%20%20%20%20raise%20EnvironmentError(%0A%20%20%20%20%20%20%20%20%22No%20Modal%20credentials%20found.%20%22%0A%20%20%20%20%20%20%20%20%22Either%20set%20MODAL_TOKEN_ID%20and%20MODAL_TOKEN_SECRET%20environment%20variables%2C%20%22%0A%20%20%20%20%20%20%20%20%22or%20ensure%20~%2F.modal.toml%20exists.%22%0A%20%20%20%20)%0A%0A`,lang:`python`});var k=c(O,2);u(k,{id:`start-the-sandbox`,children:(e,t)=>{l(),i(e,r(`Start the Sandbox`))},$$slots:{default:!0}});var A=c(k,2);h(c(e(A)),{href:`https://modal.com/docs/guide/sandboxes`,rel:`nofollow`,children:(e,t)=>{l(),i(e,r(`Modal Sandbox`))},$$slots:{default:!0}}),l(),n(A);var j=c(A,4);p(j,{code:`def%20create_sandbox(%0A%20%20%20%20image%3A%20modal.Image%2C%0A%20%20%20%20timeout%3A%20int%2C%0A%20%20%20%20app%3A%20modal.App%2C%0A%20%20%20%20secrets%3A%20list%5Bmodal.Secret%5D%2C%0A%20%20%20%20working_dir%3A%20str%20%7C%20None%20%3D%20None%2C%0A)%20-%3E%20modal.Sandbox%3A%0A%20%20%20%20print(%22%F0%9F%8F%96%EF%B8%8F%20%20Creating%20sandbox%22)%0A%0A%20%20%20%20with%20modal.enable_output()%3A%0A%20%20%20%20%20%20%20%20return%20modal.Sandbox.create(%0A%20%20%20%20%20%20%20%20%20%20%20%20%22opencode%22%2C%0A%20%20%20%20%20%20%20%20%20%20%20%20%22serve%22%2C%0A%20%20%20%20%20%20%20%20%20%20%20%20%22--hostname%3D0.0.0.0%22%2C%0A%20%20%20%20%20%20%20%20%20%20%20%20f%22--port%3D%7BOPENCODE_PORT%7D%22%2C%0A%20%20%20%20%20%20%20%20%20%20%20%20%22--log-level%3DDEBUG%22%2C%0A%20%20%20%20%20%20%20%20%20%20%20%20%22--print-logs%22%2C%0A%20%20%20%20%20%20%20%20%20%20%20%20encrypted_ports%3D%5BOPENCODE_PORT%5D%2C%0A%20%20%20%20%20%20%20%20%20%20%20%20secrets%3Dsecrets%2C%0A%20%20%20%20%20%20%20%20%20%20%20%20timeout%3Dtimeout%2C%0A%20%20%20%20%20%20%20%20%20%20%20%20image%3Dimage%2C%0A%20%20%20%20%20%20%20%20%20%20%20%20app%3Dapp%2C%0A%20%20%20%20%20%20%20%20%20%20%20%20workdir%3Dworking_dir%2C%0A%20%20%20%20%20%20%20%20)%0A%0A`,lang:`python`});var M=c(j,6);p(M,{code:`def%20print_access_info(sandbox%3A%20modal.Sandbox%2C%20password_secret_name%3A%20str)%3A%0A%20%20%20%20print(%0A%20%20%20%20%20%20%20%20%22%F0%9F%8F%96%EF%B8%8F%20%20Access%20the%20sandbox%20directly%3A%22%2C%0A%20%20%20%20%20%20%20%20f%22modal%20shell%20%7Bsandbox.object_id%7D%22%2C%0A%20%20%20%20%20%20%20%20sep%3D%22%5Cn%5Ct%22%2C%0A%20%20%20%20)%0A%0A%20%20%20%20tunnel%20%3D%20sandbox.tunnels()%5BOPENCODE_PORT%5D%0A%20%20%20%20print(%0A%20%20%20%20%20%20%20%20%22%F0%9F%8F%96%EF%B8%8F%20%20Access%20the%20WebUI%3A%22%2C%0A%20%20%20%20%20%20%20%20tunnel.url%2C%0A%20%20%20%20%20%20%20%20%22Username%3A%20opencode%22%2C%0A%20%20%20%20%20%20%20%20sep%3D%22%5Cn%5Ct%22%2C%0A%20%20%20%20)%0A%20%20%20%20print(%0A%20%20%20%20%20%20%20%20%22%F0%9F%8F%96%EF%B8%8F%20%20Access%20the%20TUI%3A%22%2C%0A%20%20%20%20%20%20%20%20f%22OPENCODE_SERVER_PASSWORD%3DYOUR_PASSWORD%20opencode%20attach%20%7Btunnel.url%7D%22%2C%0A%20%20%20%20%20%20%20%20sep%3D%22%5Cn%5Ct%22%2C%0A%20%20%20%20)%0A%20%20%20%20print(%0A%20%20%20%20%20%20%20%20%22%F0%9F%8F%96%EF%B8%8F%20%20Display%20the%20password%3A%22%2C%0A%20%20%20%20%20%20%20%20f%22modal%20shell%20--secret%20%7Bpassword_secret_name%7D%20--cmd%20'env%20%7C%20grep%20OPENCODE_SERVER_PASSWORD%3D'%22%2C%0A%20%20%20%20%20%20%20%20sep%3D%22%5Cn%5Ct%22%2C%0A%20%20%20%20)%0A%0A`,lang:`python`});var N=c(M,2),P=c(e(N));h(P,{href:`https://modal.com/docs/guide/secrets`,rel:`nofollow`,children:(e,t)=>{l(),i(e,r(`Modal Secret`))},$$slots:{default:!0}}),h(c(P,2),{href:`https://modal.com/secrets`,rel:`nofollow`,children:(e,t)=>{l(),i(e,r(`Secrets Dashboard`))},$$slots:{default:!0}}),l(3),n(N);var F=c(N,4);u(F,{id:`putting-it-all-together`,children:(e,t)=>{l(),i(e,r(`Putting it all together`))},$$slots:{default:!0}});var I=c(F,2);p(I,{code:`def%20main(%0A%20%20%20%20timeout%3A%20int%2C%0A%20%20%20%20app_name%3A%20str%2C%0A%20%20%20%20allow_modal_access%3A%20bool%2C%0A%20%20%20%20github_repo%3A%20str%2C%0A%20%20%20%20github_ref%3A%20str%2C%0A%20%20%20%20github_token%3A%20str%20%7C%20None%2C%0A%20%20%20%20password_secret_name%3A%20str%2C%0A)%3A%0A%20%20%20%20app%20%3D%20modal.App.lookup(app_name%2C%20create_if_missing%3DTrue)%0A%20%20%20%20image%20%3D%20define_base_image()%0A%0A%20%20%20%20if%20allow_modal_access%3A%0A%20%20%20%20%20%20%20%20image%20%3D%20add_modal_access(image)%0A%0A%20%20%20%20image%20%3D%20clone_github_repo(image%2C%20github_repo%2C%20github_ref%2C%20github_token)%0A%0A%20%20%20%20password_secret%20%3D%20modal.Secret.from_name(password_secret_name)%0A%0A%20%20%20%20sandbox_secrets%20%3D%20%5Bpassword_secret%5D%0A%20%20%20%20if%20github_token%3A%0A%20%20%20%20%20%20%20%20sandbox_secrets.append(modal.Secret.from_dict(%7B%22GH_TOKEN%22%3A%20github_token%7D))%0A%0A%20%20%20%20sandbox%20%3D%20create_sandbox(image%2C%20timeout%2C%20app%2C%20sandbox_secrets%2C%20%22%2Froot%2Fcode%22)%0A%20%20%20%20print_access_info(sandbox%2C%20password_secret_name)%0A%0A`,lang:`python`});var L=c(I,2);u(L,{id:`command-line-options`,children:(e,t)=>{l(),i(e,r(`Command-line options`))},$$slots:{default:!0}});var R=c(L,6);p(R,{code:`%20%20%20%20python%2013_sandboxes%2Fopencode_server.py%20--github-token%20%24(gh%20auth%20token)`,lang:`bash`}),p(c(R,2),{code:`def%20parse_timeout(timeout_str%3A%20str)%20-%3E%20int%3A%0A%20%20%20%20if%20timeout_str.endswith(%22h%22)%3A%0A%20%20%20%20%20%20%20%20minutes%20%3D%20int(timeout_str%5B%3A-1%5D)%20*%2060%0A%20%20%20%20elif%20timeout_str.endswith(%22m%22)%3A%0A%20%20%20%20%20%20%20%20minutes%20%3D%20int(timeout_str%5B%3A-1%5D)%0A%20%20%20%20else%3A%0A%20%20%20%20%20%20%20%20minutes%20%3D%20int(timeout_str)%20*%2060%0A%0A%20%20%20%20if%20minutes%20%3C%201%3A%0A%20%20%20%20%20%20%20%20raise%20argparse.ArgumentTypeError(%22Timeout%20must%20be%20at%20least%201%20minute%22)%0A%20%20%20%20if%20minutes%20%3E%2024%20*%2060%3A%0A%20%20%20%20%20%20%20%20raise%20argparse.ArgumentTypeError(%22Timeout%20cannot%20exceed%2024%20hours%22)%0A%0A%20%20%20%20return%20minutes%20*%20MINUTES%0A%0A%0Aif%20__name__%20%3D%3D%20%22__main__%22%3A%0A%20%20%20%20parser%20%3D%20argparse.ArgumentParser(description%3D%22Launch%20OpenCode%20server%20on%20Modal%22)%0A%20%20%20%20parser.add_argument(%0A%20%20%20%20%20%20%20%20%22--timeout%22%2C%0A%20%20%20%20%20%20%20%20type%3Dstr%2C%0A%20%20%20%20%20%20%20%20default%3D%2212%22%2C%0A%20%20%20%20%20%20%20%20help%3D%22Server%20timeout%20(e.g.%202h%2C%2090m).%20No%20suffix%20-%3E%20hours.%20Default%3A%2012%22%2C%0A%20%20%20%20)%0A%20%20%20%20parser.add_argument(%0A%20%20%20%20%20%20%20%20%22--app-name%22%2C%0A%20%20%20%20%20%20%20%20type%3Dstr%2C%0A%20%20%20%20%20%20%20%20default%3D%22example-opencode-server%22%2C%0A%20%20%20%20%20%20%20%20help%3D%22Modal%20app%20name.%20Default%3A%20example-opencode-server%22%2C%0A%20%20%20%20)%0A%20%20%20%20parser.add_argument(%0A%20%20%20%20%20%20%20%20%22--no-modal-access%22%2C%0A%20%20%20%20%20%20%20%20action%3D%22store_false%22%2C%0A%20%20%20%20%20%20%20%20dest%3D%22allow_modal_access%22%2C%0A%20%20%20%20%20%20%20%20help%3D%22Disable%20Modal%20credential%20access%22%2C%0A%20%20%20%20)%0A%20%20%20%20parser.add_argument(%0A%20%20%20%20%20%20%20%20%22--password-secret%22%2C%0A%20%20%20%20%20%20%20%20dest%3D%22password_secret_name%22%2C%0A%20%20%20%20%20%20%20%20help%3D%22Name%22%2C%0A%20%20%20%20%20%20%20%20default%3D%22opencode-secret%22%2C%0A%20%20%20%20)%0A%20%20%20%20parser.add_argument(%0A%20%20%20%20%20%20%20%20%22--github-repo%22%2C%0A%20%20%20%20%20%20%20%20type%3Dstr%2C%0A%20%20%20%20%20%20%20%20default%3DDEFAULT_GITHUB_REPO%2C%0A%20%20%20%20%20%20%20%20help%3Df%22GitHub%20repo%20in%20owner%2Frepo%20format.%20Default%3A%20%7BDEFAULT_GITHUB_REPO%7D%22%2C%0A%20%20%20%20)%0A%20%20%20%20parser.add_argument(%0A%20%20%20%20%20%20%20%20%22--github-ref%22%2C%0A%20%20%20%20%20%20%20%20type%3Dstr%2C%0A%20%20%20%20%20%20%20%20default%3D%22main%22%2C%0A%20%20%20%20%20%20%20%20help%3D%22Git%20ref%20to%20checkout%20(branch%2C%20tag%2C%20SHA).%20Default%3A%20main%22%2C%0A%20%20%20%20)%0A%20%20%20%20parser.add_argument(%0A%20%20%20%20%20%20%20%20%22--github-token%22%2C%0A%20%20%20%20%20%20%20%20type%3Dstr%2C%0A%20%20%20%20%20%20%20%20default%3DNone%2C%0A%20%20%20%20%20%20%20%20help%3D%22GitHub%20PAT%20for%20private%20repos%20and%20gh%20CLI%20auth.%20Tip%3A%20use%20%24(gh%20auth%20token)%22%2C%0A%20%20%20%20)%0A%0A%20%20%20%20args%20%3D%20parser.parse_args()%0A%0A%20%20%20%20main(%0A%20%20%20%20%20%20%20%20parse_timeout(args.timeout)%2C%0A%20%20%20%20%20%20%20%20args.app_name%2C%0A%20%20%20%20%20%20%20%20args.allow_modal_access%2C%0A%20%20%20%20%20%20%20%20args.github_repo%2C%0A%20%20%20%20%20%20%20%20args.github_ref%2C%0A%20%20%20%20%20%20%20%20args.github_token%2C%0A%20%20%20%20%20%20%20%20args.password_secret_name%2C%0A%20%20%20%20)%0A`,lang:`python`}),i(t,o)},$$slots:{default:!0}}))}export{x as default,g as metadata};
//# sourceMappingURL=Drnay8s4.js.map
