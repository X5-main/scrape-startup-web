(function(){try{var e=typeof window<`u`?window:typeof global<`u`?global:typeof globalThis<`u`?globalThis:typeof self<`u`?self:{};e.SENTRY_RELEASE={id:`f99fcf9f0a844cc9bd13fdc8e5782b84`};var t=new e.Error().stack;t&&(e._sentryDebugIds=e._sentryDebugIds||{},e._sentryDebugIds[t]=`ad1a3fcf-3bac-44ee-86e0-65d86d7921b2`,e._sentryDebugIdIdentifier=`sentry-dbid-ad1a3fcf-3bac-44ee-86e0-65d86d7921b2`)}catch{}})();import{$t as e,St as t,Tn as n,Tt as r,bt as i,c as a,d as o,en as s,tn as c,wn as l}from"./F_ixKBiO.js";import"./B1sc9Zdx.js";import"./Bb2deiU3.js";import{t as u}from"./BILrvr3I.js";import{t as d}from"./DeWGVqas2.js";import{t as f}from"./CdZDxCfO2.js";var p={title:`How to run Ollama`,description:`Learn how to run Ollama on Modal with this step-by-step guide.`,authors:[{name:`Yiren Lu`,avatarUrl:`https://modal-cdn.com/ren-lu.jpg`,jobTitle:`Solutions Engineer`,twitterHandle:`YirenLu`}],date:`2024-09-15T12:00:00.000Z`,length:`5 minute read`,category:`Article`,subcategory:`LLMs`,published:!0,layout:`blog`,toc:[{depth:2,value:`What is Ollama?`,id:`what-is-ollama`},{depth:2,value:`Prerequisites`,id:`prerequisites`},{depth:2,value:`Running Ollama on Modal`,id:`running-ollama-on-modal`},{depth:2,value:`Understanding the code`,id:`understanding-the-code`,children:[{depth:3,value:`Service configuration`,id:`service-configuration`},{depth:3,value:`Main application code`,id:`main-application-code`}]}],rawContent:`## What is Ollama?

Ollama is an open-source project that simplifies the process of running and managing large language models. It has a bunch of nice features:

- install multiple models and switch between them on the fly, without requiring a daemon restart.
- comes with a powerful command-line interface, making it easy to integrate into your workflows. You can run commands like \`ollama run <modelname> "Your request"\` to quickly load a model and process your input.
- provides access to a wide range of pre-configured models. Simply running \`ollama run <modelname>\` will download and run the specified model if it's not already available locally.

This guide will walk you through the process of running Ollama on Modal, a serverless cloud computing platform. This allows you to leverage Modal's serverless GPU resources. The full code for this guide is [here](https://github.com/irfansharif/ollama-modal/tree/master).

## Prerequisites

Before we begin, make sure you have the following:

1. An account at [modal.com](https://modal.com)
2. The Modal Python package installed (\`pip install modal\`)
3. Modal CLI authenticated (run \`modal setup\` or \`python -m modal setup\` if the former doesn't work)

## Running Ollama on Modal

To run Ollama on Modal:

1. Clone [the project directory](https://github.com/irfansharif/ollama-modal/tree/master) containing the code.
2. Open a terminal and navigate to the project directory.
3. Run the following command:

\`\`\`bash
modal run ollama-modal.py --text "Your question here"
\`\`\`

This command will deploy the Ollama service on Modal and run an inference with your specified text.

## Understanding the code

### Service configuration

The \`ollama.service\` file contains a systemd service configuration for Ollama:

\`\`\`ini
[Unit]
Description=Ollama Service
After=network-online.target
[Service]
ExecStart=/usr/bin/ollama serve
User=ollama
Group=ollama
Restart=always
RestartSec=3
[Install]
WantedBy=default.target
\`\`\`

This configuration ensures that Ollama runs as a service, automatically starting after the network is online and restarting if it fails.

### Main application code

The \`ollama-modal.py\` file contains the main application code for running Ollama on Modal. Let's examine its key components:

1. Importing necessary modules:

\`\`\`python
import modal
import os
import subprocess
import time
from modal import build, enter, method
\`\`\`

These imports provide the required functionality for interacting with Modal and managing system processes.

2. Defining the model and pull function:

\`\`\`python
MODEL = os.environ.get("MODEL", "llama3:instruct")

def pull(model: str = MODEL):
    # ... (code for starting Ollama service and pulling the model)
\`\`\`

This section sets up the default model and defines a function to start the Ollama service and pull the specified model.

3. Creating the Modal image:

\`\`\`python
image = (
    modal.Image
    .debian_slim()
    .apt_install("curl", "systemctl")
    .run_commands(
        # ... (commands to install Ollama)
    )
    .copy_local_file("ollama.service", "/etc/systemd/system/ollama.service")
    .pip_install("ollama")
    .run_function(pull)
)
\`\`\`

This code creates a Modal image with Ollama installed and configured.

4. Defining the Ollama class:

\`\`\`python
@app.cls(gpu="a10g", region="us-east", scaledown_window=300)
class Ollama:
    @build()
    def pull(self):
        # ... (build step, currently empty)

    @enter()
    def load(self):
        subprocess.run(["systemctl", "start", "ollama"])

    @method()
    def infer(self, text: str):
        # ... (code for inference using Ollama)
\`\`\`

This class encapsulates the Ollama functionality, including starting the service and performing inference.

5. Main entrypoint:

\`\`\`python
def main(text: str = "Why is the sky blue?", lookup: bool = False):
    if lookup:
        ollama = modal.Cls.from_name("ollama", "Ollama")
    else:
        ollama = Ollama()
    for chunk in ollama.infer.remote_gen(text):
        print(chunk, end='', flush=False)
\`\`\`

This function provides a convenient way to run the Ollama inference from the command line.
`,meta:{description:`Learn how to run Ollama on Modal with this step-by-step guide.`}},{title:m,description:h,authors:g,date:_,length:v,category:y,subcategory:b,published:x,layout:S,toc:C,rawContent:w,meta:T}=p,E=t(`<h2 id="what-is-ollama">What is Ollama?</h2> <p>Ollama is an open-source project that simplifies the process of running and managing large language models. It has a bunch of nice features:</p> <ul><li>install multiple models and switch between them on the fly, without requiring a daemon restart.</li> <li>comes with a powerful command-line interface, making it easy to integrate into your workflows. You can run commands like <code>ollama run &lt;modelname&gt; "Your request"</code> to quickly load a model and process your input.</li> <li>provides access to a wide range of pre-configured models. Simply running <code>ollama run &lt;modelname&gt;</code> will download and run the specified model if it’s not already available locally.</li></ul> <p>This guide will walk you through the process of running Ollama on Modal, a serverless cloud computing platform. This allows you to leverage Modal’s serverless GPU resources. The full code for this guide is <!>.</p> <h2 id="prerequisites">Prerequisites</h2> <p>Before we begin, make sure you have the following:</p> <ol><li>An account at <!></li> <li>The Modal Python package installed (<code>pip install modal</code>)</li> <li>Modal CLI authenticated (run <code>modal setup</code> or <code>python -m modal setup</code> if the former doesn’t work)</li></ol> <h2 id="running-ollama-on-modal">Running Ollama on Modal</h2> <p>To run Ollama on Modal:</p> <ol><li>Clone <!> containing the code.</li> <li>Open a terminal and navigate to the project directory.</li> <li>Run the following command:</li></ol> <!> <p>This command will deploy the Ollama service on Modal and run an inference with your specified text.</p> <h2 id="understanding-the-code">Understanding the code</h2> <h3 id="service-configuration">Service configuration</h3> <p>The <code>ollama.service</code> file contains a systemd service configuration for Ollama:</p> <!> <p>This configuration ensures that Ollama runs as a service, automatically starting after the network is online and restarting if it fails.</p> <h3 id="main-application-code">Main application code</h3> <p>The <code>ollama-modal.py</code> file contains the main application code for running Ollama on Modal. Let’s examine its key components:</p> <ol><li>Importing necessary modules:</li></ol> <!> <p>These imports provide the required functionality for interacting with Modal and managing system processes.</p> <ol start="2"><li>Defining the model and pull function:</li></ol> <!> <p>This section sets up the default model and defines a function to start the Ollama service and pull the specified model.</p> <ol start="3"><li>Creating the Modal image:</li></ol> <!> <p>This code creates a Modal image with Ollama installed and configured.</p> <ol start="4"><li>Defining the Ollama class:</li></ol> <!> <p>This class encapsulates the Ollama functionality, including starting the service and performing inference.</p> <ol start="5"><li>Main entrypoint:</li></ol> <!> <p>This function provides a convenient way to run the Ollama inference from the command line.</p>`,1);function D(t,m){let h=a(m,[`children`,`$$slots`,`$$events`,`$$legacy`]);f(t,o(()=>h,()=>p,{children:(t,a)=>{var o=E(),f=c(s(o),6);d(c(e(f)),{href:`https://github.com/irfansharif/ollama-modal/tree/master`,rel:`nofollow`,children:(e,t)=>{l(),i(e,r(`here`))},$$slots:{default:!0}}),l(),n(f);var p=c(f,6),m=e(p);d(c(e(m)),{href:`https://modal.com`,rel:`nofollow`,children:(e,t)=>{l(),i(e,r(`modal.com`))},$$slots:{default:!0}}),n(m),l(4),n(p);var h=c(p,6),g=e(h);d(c(e(g)),{href:`https://github.com/irfansharif/ollama-modal/tree/master`,rel:`nofollow`,children:(e,t)=>{l(),i(e,r(`the project directory`))},$$slots:{default:!0}}),l(),n(g),l(4),n(h);var _=c(h,2);u(_,{code:`modal%20run%20ollama-modal.py%20--text%20%22Your%20question%20here%22`,lang:`bash`});var v=c(_,10);u(v,{code:`%5BUnit%5D%0ADescription%3DOllama%20Service%0AAfter%3Dnetwork-online.target%0A%5BService%5D%0AExecStart%3D%2Fusr%2Fbin%2Follama%20serve%0AUser%3Dollama%0AGroup%3Dollama%0ARestart%3Dalways%0ARestartSec%3D3%0A%5BInstall%5D%0AWantedBy%3Ddefault.target`,lang:`ini`});var y=c(v,10);u(y,{code:`import%20modal%0Aimport%20os%0Aimport%20subprocess%0Aimport%20time%0Afrom%20modal%20import%20build%2C%20enter%2C%20method`,lang:`python`});var b=c(y,6);u(b,{code:`MODEL%20%3D%20os.environ.get(%22MODEL%22%2C%20%22llama3%3Ainstruct%22)%0A%0Adef%20pull(model%3A%20str%20%3D%20MODEL)%3A%0A%20%20%20%20%23%20...%20(code%20for%20starting%20Ollama%20service%20and%20pulling%20the%20model)`,lang:`python`});var x=c(b,6);u(x,{code:`image%20%3D%20(%0A%20%20%20%20modal.Image%0A%20%20%20%20.debian_slim()%0A%20%20%20%20.apt_install(%22curl%22%2C%20%22systemctl%22)%0A%20%20%20%20.run_commands(%0A%20%20%20%20%20%20%20%20%23%20...%20(commands%20to%20install%20Ollama)%0A%20%20%20%20)%0A%20%20%20%20.copy_local_file(%22ollama.service%22%2C%20%22%2Fetc%2Fsystemd%2Fsystem%2Follama.service%22)%0A%20%20%20%20.pip_install(%22ollama%22)%0A%20%20%20%20.run_function(pull)%0A)`,lang:`python`});var S=c(x,6);u(S,{code:`%40app.cls(gpu%3D%22a10g%22%2C%20region%3D%22us-east%22%2C%20scaledown_window%3D300)%0Aclass%20Ollama%3A%0A%20%20%20%20%40build()%0A%20%20%20%20def%20pull(self)%3A%0A%20%20%20%20%20%20%20%20%23%20...%20(build%20step%2C%20currently%20empty)%0A%0A%20%20%20%20%40enter()%0A%20%20%20%20def%20load(self)%3A%0A%20%20%20%20%20%20%20%20subprocess.run(%5B%22systemctl%22%2C%20%22start%22%2C%20%22ollama%22%5D)%0A%0A%20%20%20%20%40method()%0A%20%20%20%20def%20infer(self%2C%20text%3A%20str)%3A%0A%20%20%20%20%20%20%20%20%23%20...%20(code%20for%20inference%20using%20Ollama)`,lang:`python`}),u(c(S,6),{code:`def%20main(text%3A%20str%20%3D%20%22Why%20is%20the%20sky%20blue%3F%22%2C%20lookup%3A%20bool%20%3D%20False)%3A%0A%20%20%20%20if%20lookup%3A%0A%20%20%20%20%20%20%20%20ollama%20%3D%20modal.Cls.from_name(%22ollama%22%2C%20%22Ollama%22)%0A%20%20%20%20else%3A%0A%20%20%20%20%20%20%20%20ollama%20%3D%20Ollama()%0A%20%20%20%20for%20chunk%20in%20ollama.infer.remote_gen(text)%3A%0A%20%20%20%20%20%20%20%20print(chunk%2C%20end%3D''%2C%20flush%3DFalse)`,lang:`python`}),l(2),i(t,o)},$$slots:{default:!0}}))}export{D as default,p as metadata};
//# sourceMappingURL=BsLH6AuO2.js.map
