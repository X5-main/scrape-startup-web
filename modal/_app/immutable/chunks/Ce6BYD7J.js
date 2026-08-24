(function(){try{var e=typeof window<`u`?window:typeof global<`u`?global:typeof globalThis<`u`?globalThis:typeof self<`u`?self:{};e.SENTRY_RELEASE={id:`f99fcf9f0a844cc9bd13fdc8e5782b84`};var t=new e.Error().stack;t&&(e._sentryDebugIds=e._sentryDebugIds||{},e._sentryDebugIds[t]=`2dacc6e6-1120-41cb-984b-339cd5d3fefa`,e._sentryDebugIdIdentifier=`sentry-dbid-2dacc6e6-1120-41cb-984b-339cd5d3fefa`)}catch{}})();import{$t as e,St as t,Tn as n,Tt as r,bt as i,c as a,d as o,en as s,tn as c,wn as l}from"./F_ixKBiO.js";import"./B1sc9Zdx.js";import"./Bb2deiU3.js";import{t as u}from"./JPsrybyr.js";import{t as d}from"./Dz6DfB4R.js";import{t as f}from"./BILrvr3I.js";import{t as p}from"./DeWGVqas2.js";import{t as m}from"./CdZDxCfO2.js";var h={title:`Build interactive workflows using Kestra and Modal`,description:`Learn how to create interactive workflows that dynamically adapt to user inputs with Kestra’s open-source orchestration platform and Modal’s serverless infrastructure.`,date:`2024-10-15T12:00:00.000Z`,authors:[{name:`Anna Geller`,avatarUrl:`https://pbs.twimg.com/profile_images/1805968669228310528/cCC6Fy3M_400x400.jpg`,jobTitle:`Product Lead, Kestra`,twitterHandle:`anna__geller`}],length:`15 minute read`,category:`Article`,subcategory:`Frameworks and Tools`,published:!0,layout:`blog`,toc:[{depth:2,value:`What are Kestra and Modal?`,id:`what-are-kestra-and-modal`,children:[{depth:3,value:`Kestra`,id:`kestra`},{depth:3,value:`Modal`,id:`modal`}]},{depth:2,value:`Building a forecasting workflow with Kestra and Modal`,id:`building-a-forecasting-workflow-with-kestra-and-modal`},{depth:2,value:`Run Modal from Kestra`,id:`run-modal-from-kestra`,children:[{depth:3,value:`“Hello World” in Kestra`,id:`hello-world-in-kestra`},{depth:3,value:`“Hello World” in Modal triggered from Kestra`,id:`hello-world-in-modal-triggered-from-kestra`}]},{depth:2,value:`Interactive Workflows`,id:`interactive-workflows`},{depth:2,value:`Adding Secrets`,id:`adding-secrets`},{depth:2,value:`Adding data and a model`,id:`adding-data-and-a-model`},{depth:2,value:`Automate Workflows with Triggers`,id:`automate-workflows-with-triggers`},{depth:2,value:`Next steps`,id:`next-steps`}],rawContent:`If you've ever needed to process a large dataset, you know how important it is to have sufficient compute resources at your disposal. Sometimes, you need more CPUs or a bigger disk, and other times, a GPU makes all the difference. Modal makes it effortless to provision compute resources on demand by defining the infrastructure requirements directly in your Python code.

With [Kestra](https://github.com/kestra-io/kestra), you can easily configure and launch Modal functions directly from the UI, even when dealing with complex, dependent configurations. This allows you to adjust input parameters or resource allocations like GPU, CPU or memory dynamically at runtime, without needing to touch the underlying code.

In this post, we'll create a forecasting workflow using Kestra and Modal:

- [Kestra](https://kestra.io/) for workflow orchestration, handling interactive inputs, conditional logic, managing output artifacts, and scheduling — all from an intuitive UI.
- [Modal](/) for serverless compute and dependency management, allowing you to run your Python code without having to worry about building Docker images or managing cloud servers.

Our workflow will use data stored as Parquet files on Hugging Face to train a predictive model for customer orders. We'll output the model's predictions as a Plotly chart and optionally trigger an alert in Slack.

![architecture diagram of forecasting app on Modal and Kestra](https://modal-cdn.com/article-assets/kestra-modal-forecast-app.png)

## What are Kestra and Modal?

### Kestra

Kestra is an [open-source](https://github.com/kestra-io/kestra) orchestration platform that lets you create workflows from an easy-to-use UI while keeping [everything as code](https://youtu.be/dU3p6Jf5fMw?si=0lO1sh6JLzLRrH6L) under the hood. You can automate scheduled and event-driven data pipelines, infrastructure builds, human-in-the-loop business processes, and internal applications written in any language. You can create those workflows from the UI using an embedded code editor that provides syntax validation, autocompletion, and built-in docs.

What makes Kestra stand out:

- **Powerful UI**: manage workflows across teams with varying levels of engineering expertise — low-code UI forms for business users and a full code editor for developers.
- **Everything as Code**: define any workflow in a simple YAML configuration and deploy it from anywhere using Terraform, CI/CD, CLI, API or the Kestra UI.
- **Git integration**: version control integration and revision history make it easy to track changes and roll back if needed.
- **Highly customizable inputs**: add strongly typed inputs that can conditionally depend on each other — Kestra shows or hides downstream inputs based on what the user has entered previously.
- **Outputs & Artifacts**: store and track workflow artifacts and pass data across multiple tasks and flows.
- **Plugins**: use one of over 500 integrations to avoid writing code from scratch for common tasks such as extracting data from popular source systems, executing SQL queries within a database, reacting to events from external message brokers or triggering external jobs or API calls.

### Modal

Modal is a serverless platform that provides the compute resources needed for your Python apps without the pain of managing dependencies, containerization, or infrastructure. You can dynamically access GPUs or CPUs to run your code, and you only pay for what you use.

What makes Modal stand out:

- **Serverless compute**: spin up cloud resources instantly when you need them.
- **Cost-effective**: pay only for the time your resources are running, down to the second.
- **Pythonic**: add a few Python decorators to your code to offload compute to Modal — no need to maintain CI/CD pipelines, Kubernetes manifests, or Docker images.
- **Dependency management**: no need to worry about Dockerfiles or virtual environments — Modal handles all infrastructure-related processes as long as you define your dependencies directly in your Python code.

Now that you know a bit more about Kestra and Modal, let’s use them to build powerful interactive workflows.

## Building a forecasting workflow with Kestra and Modal

In this example, we’ll build a **time-series forecast** to predict the order volume based on historical data. This is a timely use case just ahead of Black Friday and the holiday season! We’ll use a SARIMA model to forecast the number of orders expected over the next 180 days and visualize the results.

This workflow will be **interactive**, allowing users to adjust parameters such as the dataset URL, S3 bucket path, the number of CPU cores, and memory. [The code that generates the forecast](https://gist.github.com/anna-geller/8c37a868939ea94a6c91f069dc4c215c) will run on Modal.

Here’s a [short video](https://youtu.be/Wucyw4gRNiQ) showing the final result:

<YoutubeEmbed videoId="Wucyw4gRNiQ"/>

## Run Modal from Kestra

Before diving into the full example, we first need to launch Kestra. Follow the [Quickstart Guide](https://kestra.io/docs/getting-started/quickstart#start-kestra) to get Kestra up and running in 60 seconds and execute your first workflow.

### "Hello World" in Kestra

Here's a basic code scaffold to launch a "hello-world" flow in Kestra:

\`\`\`yaml
id: modal_hello_world
namespace: company.team

inputs:
  - id: my_first_input
    type: STRING
    defaults: World

tasks:
  - id: hello
    type: io.kestra.plugin.core.log.Log
    message: Hello {{ inputs.my_first_input }} 🚀
\`\`\`

Go to the UI and click on the \`Create\` button. Paste the above code and \`Save\` the flow.

Then, click the \`Execute\` button to launch the flow, and soon after you should see the output in the logs: \`Hello World 🚀\`.

![hello world from Kestra](https://modal-cdn.com/article-assets/kestra-hello-world.png)

Each workflow in Kestra consists of three required components:

- a unique \`id\`
- a \`namespace\` used for organization and governance
- a list of \`tasks\` that define the workflow logic.

Optionally, you can also define \`inputs\` to allow users to dynamically execute the flow with different parameter values. Try that yourself by changing the value “World” to your name.

![defining inputs in Kestra](https://modal-cdn.com/article-assets/kestra-define-inputs.png)

### "Hello World" in Modal triggered from Kestra

Now, let’s add a Hello-World Modal example that we’ll trigger from Kestra. You can get your Modal token ID and secret by following the [quickstart guide](/docs/guide).

\`\`\`yaml
id: modal_hello_world
namespace: company.team
tasks:
  - id: hello
    type: io.kestra.plugin.modal.cli.ModalCLI
    env:
      MODAL_TOKEN_ID: "your_modal_token_id"
      MODAL_TOKEN_SECRET: "your_modal_token_secret"
    commands:
      - modal run gpu.py
    inputFiles:
      gpu.py: |
        import modal

        app = modal.App(
            "example-gpu",
            image=modal.Image.debian_slim().pip_install(
                "torch", find_links="https://download.pytorch.org/whl/cu117"
            ),
        )

        @app.function(gpu="any")
        def print_gpu_info():
            import torch
            import subprocess

            subprocess.run(["nvidia-smi"])
            print("Torch version:", torch.__version__)
            print("CUDA available:", torch.cuda.is_available())
            print("CUDA device count:", torch.cuda.device_count())
            print("CUDA device name:", torch.cuda.get_device_name(0))
            print("CUDA device index:", torch.cuda.current_device())
\`\`\`

When you point the cursor anywhere in the Modal plugin configuration and switch to the documentation tab, you will see the explanation of all Modal plugin properties and examples how to use it.

![running modal in a flow on kestra](https://modal-cdn.com/article-assets/kestra-modal-flow.png)

## Interactive Workflows

Let’s extend the previous code example by adding an input allowing to choose the compute type needed for the Modal task. The \`dependsOn\` property in the \`inputs\` section ensures that the GPU option is only shown if the user chooses to use GPU acceleration in the Modal function. When the GPU option is selected, the dropdown shows the list of available GPUs, allowing only valid values to be selected:

\`\`\`yaml
id: modal_hello_world
namespace: company.team

inputs:
  - id: compute_type
    displayName: CPU or GPU
    description: Whether to use CPU or GPU compute type
    type: SELECT
    values:
      - CPU
      - GPU
    defaults: CPU

  - id: gpu
    type: SELECT
    displayName: GPU request
    description: The GPU resources to allocate to the job
    defaults: "any"
    values: ["any", "t4", "l4", "a100", "h100", "a10g"]
    dependsOn:
      inputs:
        - compute_type
      condition: "{{ inputs.compute_type == 'GPU' }}"

  - id: cpu
    type: SELECT
    displayName: CPU request
    description: The number of CPU cores to allocate to the job
    defaults: "0.25"
    values: ["0.25", "0.5", "0.75", "1.0", "1.5", "2.0", "4.0", "8.0", "16.0"]
    dependsOn:
      inputs:
        - compute_type
      condition: "{{ inputs.compute_type == 'CPU' }}"

tasks:
  - id: run_modal
    type: io.kestra.plugin.modal.cli.ModalCLI
    env:
      MODAL_TOKEN_ID: "{{ kv('MODAL_TOKEN_ID') }}"
      MODAL_TOKEN_SECRET: "{{ kv('MODAL_TOKEN_SECRET') }}"
      GPU: "{{ inputs.gpu }}"
      CPU: "{{ inputs.cpu }}"
    commands:
      - modal run cpu_or_gpu.py --compute-type "{{ inputs.compute_type }}"
    inputFiles:
      cpu_or_gpu.py: |
        import os

        import modal

        app = modal.App(
            "example-cpu-gpu",
            secrets=[modal.Secret.from_local_environ(env_keys=["GPU", "CPU"])],
        )

        cpu_image = modal.Image.debian_slim().pip_install("torch", "psutil")
        gpu_image = modal.Image.debian_slim().pip_install(
            "torch", find_links="https://download.pytorch.org/whl/cu117"
        )

        @app.function(image=cpu_image, cpu=float(os.getenv("CPU", 0.25)))
        def print_cpu_info():
            import torch
            import platform
            import psutil

            print("Torch version:", torch.__version__)
            print("CUDA available:", torch.cuda.is_available())  # Should return False for CPU
            print("CPU count:", psutil.cpu_count(logical=True))
            print("CPU frequency:", psutil.cpu_freq().current, "MHz")
            print("CPU architecture:", platform.architecture()[0])
            print("Platform:", platform.system(), platform.release())
            print("Total memory (RAM):", psutil.virtual_memory().total // (1024**2), "MB")

        @app.function(image=gpu_image, gpu=os.getenv("GPU", "any"))
        def print_gpu_info():
            import torch
            import subprocess

            subprocess.run(["nvidia-smi"])
            print("Torch version:", torch.__version__)
            print("CUDA available:", torch.cuda.is_available())
            print("CUDA device count:", torch.cuda.device_count())
            print("CUDA device name:", torch.cuda.get_device_name(0))
            print("CUDA device index:", torch.cuda.current_device())

        @app.local_entrypoint()
        def main(compute_type: str = "CPU"):
            if compute_type == "GPU":
                print_gpu_info.remote()
            else:
                print_cpu_info.remote()
\`\`\`

This example shows how to run Modal code as part of a Kestra workflow:

- Use the \`commands\` property in the \`ModalCLI\` plugin to run \`modal\` CLI commands (like \`modal run cpu_or_gpu.py\`)
- Use the \`env\` property to provide the necessary environment variables for authenticating with Modal and external services or to pass variables to Modal function decorators
- Set the \`namespaceFiles.enabled\` property to \`true\` if you want to store your Python code as a separate file in the built-in Code Editor rather than inline in YAML
- Override the \`containerImage\` property if you need to use a custom Modal version — the default is the \`latest\` version.

![pick Modal CPU or GPU compute on Kestra](https://modal-cdn.com/article-assets/kestra-pick-modal-gpu.png)

## Adding Secrets

Now that we have the basic structure in place, let’s build out our order forecasting workflow.

To securely manage sensitive data such as Modal tokens or AWS credentials in Kestra, you can use [Secrets](https://kestra.io/docs/concepts/secret). Adding secrets requires some additional setup, so to keep things simple for now, you can store them in the [KV Store](https://kestra.io/docs/concepts/kv-store). Replace the placeholders with your actual credentials and execute the \`curl\` commands shown below (_the double quotes are necessary_). Alternatively, you can also add your KV pairs directly from the UI by navigating to the namespace \`company.team\` and adding the key-value pairs from the \`KV Store\` tab.

\`\`\`bash
curl -X PUT -H "Content-Type: application/json" http://localhost:8080/api/v1/namespaces/company.team/kv/MODAL_TOKEN_ID -d '"your_credential"'
curl -X PUT -H "Content-Type: application/json" http://localhost:8080/api/v1/namespaces/company.team/kv/MODAL_TOKEN_SECRET -d '"your_credential"'
curl -X PUT -H "Content-Type: application/json" http://localhost:8080/api/v1/namespaces/company.team/kv/AWS_ACCESS_KEY_ID -d '"your_credential"'
curl -X PUT -H "Content-Type: application/json" http://localhost:8080/api/v1/namespaces/company.team/kv/AWS_SECRET_ACCESS_KEY -d '"your_credential"'
curl -X PUT -H "Content-Type: application/json" http://localhost:8080/api/v1/namespaces/company.team/kv/AWS_DEFAULT_REGION -d '"us-east-1"'
\`\`\`

Now you can reference those values in your flow using the \`{{ kv('KEY_NAME') }}\` syntax.

## Adding data and a model

At this point, we've got the entire skeleton in place. From here, every workflow built with Modal and Kestra together will look different: different data, different models, different actions.

[This GitHub Gist](https://gist.github.com/anna-geller/8c37a868939ea94a6c91f069dc4c215c) includes the full workflow definition for our time-series forecasting use case if you'd like to try it for yourself. Simply copy the Gist’s raw content and paste it in Kestra UI when creating a new flow.

We just want to call out one last feature. The \`dependsOn\` property in the \`inputs\` is what lets us create interactive workflows that adjust based on previous user inputs. When you click on the \`Execute\` button in the Kestra UI, you’ll see the available input options allowing you to adjust whether or not you want to customize the forecast, the amount of CPU, memory, and more. Depending on those choices, you will see other inputs appear or disappear.

![executing the data forecast flow on Kestra](https://modal-cdn.com/article-assets/kestra-forecast-execute.png)

Run the above flow and navigate to the \`Outputs\` tab of the Execution page. From here, you'll be able to [download and view](https://youtu.be/Wucyw4gRNiQ) the \`plotly\` report exported as an HTML file showing a forecasted order volume for each day of the forecast.

## Automate Workflows with Triggers

You can extend the workflow by adding a \`trigger\`. This way, you can automatically run the flow:

- on a schedule
- event-driven e.g. when a file is uploaded to an S3 bucket
- from an external application via a webhook.

Check Kestra's [triggers documentation](https://kestra.io/docs/workflow-components/triggers) to learn more.

## Next steps

Using Kestra and Modal together allows you to create interactive data workflows that adapt to user's inputs and to your compute needs.

Kestra is open-source, so if you enjoy the project, give us a [GitHub star](https://github.com/kestra-io/kestra) ⭐️ and join [our community](https://kestra.io/slack) to ask questions or share feedback.
`,meta:{description:`Learn how to create interactive workflows that dynamically adapt to user inputs with Kestra’s open-source orchestration platform and Modal’s serverless infrastructure.`}},{title:g,description:_,date:v,authors:y,length:b,category:x,subcategory:S,published:C,layout:w,toc:T,rawContent:E,meta:D}=h,O=t(`<p>If you’ve ever needed to process a large dataset, you know how important it is to have sufficient compute resources at your disposal. Sometimes, you need more CPUs or a bigger disk, and other times, a GPU makes all the difference. Modal makes it effortless to provision compute resources on demand by defining the infrastructure requirements directly in your Python code.</p> <p>With <!>, you can easily configure and launch Modal functions directly from the UI, even when dealing with complex, dependent configurations. This allows you to adjust input parameters or resource allocations like GPU, CPU or memory dynamically at runtime, without needing to touch the underlying code.</p> <p>In this post, we’ll create a forecasting workflow using Kestra and Modal:</p> <ul><li><!> for workflow orchestration, handling interactive inputs, conditional logic, managing output artifacts, and scheduling — all from an intuitive UI.</li> <li><!> for serverless compute and dependency management, allowing you to run your Python code without having to worry about building Docker images or managing cloud servers.</li></ul> <p>Our workflow will use data stored as Parquet files on Hugging Face to train a predictive model for customer orders. We’ll output the model’s predictions as a Plotly chart and optionally trigger an alert in Slack.</p> <p><!></p> <h2 id="what-are-kestra-and-modal">What are Kestra and Modal?</h2> <h3 id="kestra">Kestra</h3> <p>Kestra is an <!> orchestration platform that lets you create workflows from an easy-to-use UI while keeping <!> under the hood. You can automate scheduled and event-driven data pipelines, infrastructure builds, human-in-the-loop business processes, and internal applications written in any language. You can create those workflows from the UI using an embedded code editor that provides syntax validation, autocompletion, and built-in docs.</p> <p>What makes Kestra stand out:</p> <ul><li><strong>Powerful UI</strong>: manage workflows across teams with varying levels of engineering expertise — low-code UI forms for business users and a full code editor for developers.</li> <li><strong>Everything as Code</strong>: define any workflow in a simple YAML configuration and deploy it from anywhere using Terraform, CI/CD, CLI, API or the Kestra UI.</li> <li><strong>Git integration</strong>: version control integration and revision history make it easy to track changes and roll back if needed.</li> <li><strong>Highly customizable inputs</strong>: add strongly typed inputs that can conditionally depend on each other — Kestra shows or hides downstream inputs based on what the user has entered previously.</li> <li><strong>Outputs & Artifacts</strong>: store and track workflow artifacts and pass data across multiple tasks and flows.</li> <li><strong>Plugins</strong>: use one of over 500 integrations to avoid writing code from scratch for common tasks such as extracting data from popular source systems, executing SQL queries within a database, reacting to events from external message brokers or triggering external jobs or API calls.</li></ul> <h3 id="modal">Modal</h3> <p>Modal is a serverless platform that provides the compute resources needed for your Python apps without the pain of managing dependencies, containerization, or infrastructure. You can dynamically access GPUs or CPUs to run your code, and you only pay for what you use.</p> <p>What makes Modal stand out:</p> <ul><li><strong>Serverless compute</strong>: spin up cloud resources instantly when you need them.</li> <li><strong>Cost-effective</strong>: pay only for the time your resources are running, down to the second.</li> <li><strong>Pythonic</strong>: add a few Python decorators to your code to offload compute to Modal — no need to maintain CI/CD pipelines, Kubernetes manifests, or Docker images.</li> <li><strong>Dependency management</strong>: no need to worry about Dockerfiles or virtual environments — Modal handles all infrastructure-related processes as long as you define your dependencies directly in your Python code.</li></ul> <p>Now that you know a bit more about Kestra and Modal, let’s use them to build powerful interactive workflows.</p> <h2 id="building-a-forecasting-workflow-with-kestra-and-modal">Building a forecasting workflow with Kestra and Modal</h2> <p>In this example, we’ll build a <strong>time-series forecast</strong> to predict the order volume based on historical data. This is a timely use case just ahead of Black Friday and the holiday season! We’ll use a SARIMA model to forecast the number of orders expected over the next 180 days and visualize the results.</p> <p>This workflow will be <strong>interactive</strong>, allowing users to adjust parameters such as the dataset URL, S3 bucket path, the number of CPU cores, and memory. <!> will run on Modal.</p> <p>Here’s a <!> showing the final result:</p> <!> <h2 id="run-modal-from-kestra">Run Modal from Kestra</h2> <p>Before diving into the full example, we first need to launch Kestra. Follow the <!> to get Kestra up and running in 60 seconds and execute your first workflow.</p> <h3 id="hello-world-in-kestra">“Hello World” in Kestra</h3> <p>Here’s a basic code scaffold to launch a “hello-world” flow in Kestra:</p> <!> <p>Go to the UI and click on the <code>Create</code> button. Paste the above code and <code>Save</code> the flow.</p> <p>Then, click the <code>Execute</code> button to launch the flow, and soon after you should see the output in the logs: <code>Hello World 🚀</code>.</p> <p><!></p> <p>Each workflow in Kestra consists of three required components:</p> <ul><li>a unique <code>id</code></li> <li>a <code>namespace</code> used for organization and governance</li> <li>a list of <code>tasks</code> that define the workflow logic.</li></ul> <p>Optionally, you can also define <code>inputs</code> to allow users to dynamically execute the flow with different parameter values. Try that yourself by changing the value “World” to your name.</p> <p><!></p> <h3 id="hello-world-in-modal-triggered-from-kestra">“Hello World” in Modal triggered from Kestra</h3> <p>Now, let’s add a Hello-World Modal example that we’ll trigger from Kestra. You can get your Modal token ID and secret by following the <!>.</p> <!> <p>When you point the cursor anywhere in the Modal plugin configuration and switch to the documentation tab, you will see the explanation of all Modal plugin properties and examples how to use it.</p> <p><!></p> <h2 id="interactive-workflows">Interactive Workflows</h2> <p>Let’s extend the previous code example by adding an input allowing to choose the compute type needed for the Modal task. The <code>dependsOn</code> property in the <code>inputs</code> section ensures that the GPU option is only shown if the user chooses to use GPU acceleration in the Modal function. When the GPU option is selected, the dropdown shows the list of available GPUs, allowing only valid values to be selected:</p> <!> <p>This example shows how to run Modal code as part of a Kestra workflow:</p> <ul><li>Use the <code>commands</code> property in the <code>ModalCLI</code> plugin to run <code>modal</code> CLI commands (like <code>modal run cpu_or_gpu.py</code>)</li> <li>Use the <code>env</code> property to provide the necessary environment variables for authenticating with Modal and external services or to pass variables to Modal function decorators</li> <li>Set the <code>namespaceFiles.enabled</code> property to <code>true</code> if you want to store your Python code as a separate file in the built-in Code Editor rather than inline in YAML</li> <li>Override the <code>containerImage</code> property if you need to use a custom Modal version — the default is the <code>latest</code> version.</li></ul> <p><!></p> <h2 id="adding-secrets">Adding Secrets</h2> <p>Now that we have the basic structure in place, let’s build out our order forecasting workflow.</p> <p>To securely manage sensitive data such as Modal tokens or AWS credentials in Kestra, you can use <!>. Adding secrets requires some additional setup, so to keep things simple for now, you can store them in the <!>. Replace the placeholders with your actual credentials and execute the <code>curl</code> commands shown below (<em>the double quotes are necessary</em>). Alternatively, you can also add your KV pairs directly from the UI by navigating to the namespace <code>company.team</code> and adding the key-value pairs from the <code>KV Store</code> tab.</p> <!> <p>Now you can reference those values in your flow using the <code>&#123;&#123; kv('KEY_NAME') &#125;&#125;</code> syntax.</p> <h2 id="adding-data-and-a-model">Adding data and a model</h2> <p>At this point, we’ve got the entire skeleton in place. From here, every workflow built with Modal and Kestra together will look different: different data, different models, different actions.</p> <p><!> includes the full workflow definition for our time-series forecasting use case if you’d like to try it for yourself. Simply copy the Gist’s raw content and paste it in Kestra UI when creating a new flow.</p> <p>We just want to call out one last feature. The <code>dependsOn</code> property in the <code>inputs</code> is what lets us create interactive workflows that adjust based on previous user inputs. When you click on the <code>Execute</code> button in the Kestra UI, you’ll see the available input options allowing you to adjust whether or not you want to customize the forecast, the amount of CPU, memory, and more. Depending on those choices, you will see other inputs appear or disappear.</p> <p><!></p> <p>Run the above flow and navigate to the <code>Outputs</code> tab of the Execution page. From here, you’ll be able to <!> the <code>plotly</code> report exported as an HTML file showing a forecasted order volume for each day of the forecast.</p> <h2 id="automate-workflows-with-triggers">Automate Workflows with Triggers</h2> <p>You can extend the workflow by adding a <code>trigger</code>. This way, you can automatically run the flow:</p> <ul><li>on a schedule</li> <li>event-driven e.g. when a file is uploaded to an S3 bucket</li> <li>from an external application via a webhook.</li></ul> <p>Check Kestra’s <!> to learn more.</p> <h2 id="next-steps">Next steps</h2> <p>Using Kestra and Modal together allows you to create interactive data workflows that adapt to user’s inputs and to your compute needs.</p> <p>Kestra is open-source, so if you enjoy the project, give us a <!> ⭐️ and join <!> to ask questions or share feedback.</p>`,1);function k(t,g){let _=a(g,[`children`,`$$slots`,`$$events`,`$$legacy`]);m(t,o(()=>_,()=>h,{children:(t,a)=>{var o=O(),m=c(s(o),2);p(c(e(m)),{href:`https://github.com/kestra-io/kestra`,rel:`nofollow`,children:(e,t)=>{l(),i(e,r(`Kestra`))},$$slots:{default:!0}}),l(),n(m);var h=c(m,4),g=e(h);p(e(g),{href:`https://kestra.io/`,rel:`nofollow`,children:(e,t)=>{l(),i(e,r(`Kestra`))},$$slots:{default:!0}}),l(),n(g);var _=c(g,2);p(e(_),{href:`/`,children:(e,t)=>{l(),i(e,r(`Modal`))},$$slots:{default:!0}}),l(),n(_),n(h);var v=c(h,4);u(e(v),{src:`https://modal-cdn.com/article-assets/kestra-modal-forecast-app.png`,alt:`architecture diagram of forecasting app on Modal and Kestra`}),n(v);var y=c(v,6),b=c(e(y));p(b,{href:`https://github.com/kestra-io/kestra`,rel:`nofollow`,children:(e,t)=>{l(),i(e,r(`open-source`))},$$slots:{default:!0}}),p(c(b,2),{href:`https://youtu.be/dU3p6Jf5fMw?si=0lO1sh6JLzLRrH6L`,rel:`nofollow`,children:(e,t)=>{l(),i(e,r(`everything as code`))},$$slots:{default:!0}}),l(),n(y);var x=c(y,20);p(c(e(x),3),{href:`https://gist.github.com/anna-geller/8c37a868939ea94a6c91f069dc4c215c`,rel:`nofollow`,children:(e,t)=>{l(),i(e,r(`The code that generates the forecast`))},$$slots:{default:!0}}),l(),n(x);var S=c(x,2);p(c(e(S)),{href:`https://youtu.be/Wucyw4gRNiQ`,rel:`nofollow`,children:(e,t)=>{l(),i(e,r(`short video`))},$$slots:{default:!0}}),l(),n(S);var C=c(S,2);d(C,{videoId:`Wucyw4gRNiQ`});var w=c(C,4);p(c(e(w)),{href:`https://kestra.io/docs/getting-started/quickstart#start-kestra`,rel:`nofollow`,children:(e,t)=>{l(),i(e,r(`Quickstart Guide`))},$$slots:{default:!0}}),l(),n(w);var T=c(w,6);f(T,{code:`id%3A%20modal_hello_world%0Anamespace%3A%20company.team%0A%0Ainputs%3A%0A%20%20-%20id%3A%20my_first_input%0A%20%20%20%20type%3A%20STRING%0A%20%20%20%20defaults%3A%20World%0A%0Atasks%3A%0A%20%20-%20id%3A%20hello%0A%20%20%20%20type%3A%20io.kestra.plugin.core.log.Log%0A%20%20%20%20message%3A%20Hello%20%7B%7B%20inputs.my_first_input%20%7D%7D%20%F0%9F%9A%80`,lang:`yaml`});var E=c(T,6);u(e(E),{src:`https://modal-cdn.com/article-assets/kestra-hello-world.png`,alt:`hello world from Kestra`}),n(E);var D=c(E,8);u(e(D),{src:`https://modal-cdn.com/article-assets/kestra-define-inputs.png`,alt:`defining inputs in Kestra`}),n(D);var k=c(D,4);p(c(e(k)),{href:`/docs/guide`,children:(e,t)=>{l(),i(e,r(`quickstart guide`))},$$slots:{default:!0}}),l(),n(k);var A=c(k,2);f(A,{code:`id%3A%20modal_hello_world%0Anamespace%3A%20company.team%0Atasks%3A%0A%20%20-%20id%3A%20hello%0A%20%20%20%20type%3A%20io.kestra.plugin.modal.cli.ModalCLI%0A%20%20%20%20env%3A%0A%20%20%20%20%20%20MODAL_TOKEN_ID%3A%20%22your_modal_token_id%22%0A%20%20%20%20%20%20MODAL_TOKEN_SECRET%3A%20%22your_modal_token_secret%22%0A%20%20%20%20commands%3A%0A%20%20%20%20%20%20-%20modal%20run%20gpu.py%0A%20%20%20%20inputFiles%3A%0A%20%20%20%20%20%20gpu.py%3A%20%7C%0A%20%20%20%20%20%20%20%20import%20modal%0A%0A%20%20%20%20%20%20%20%20app%20%3D%20modal.App(%0A%20%20%20%20%20%20%20%20%20%20%20%20%22example-gpu%22%2C%0A%20%20%20%20%20%20%20%20%20%20%20%20image%3Dmodal.Image.debian_slim().pip_install(%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%22torch%22%2C%20find_links%3D%22https%3A%2F%2Fdownload.pytorch.org%2Fwhl%2Fcu117%22%0A%20%20%20%20%20%20%20%20%20%20%20%20)%2C%0A%20%20%20%20%20%20%20%20)%0A%0A%20%20%20%20%20%20%20%20%40app.function(gpu%3D%22any%22)%0A%20%20%20%20%20%20%20%20def%20print_gpu_info()%3A%0A%20%20%20%20%20%20%20%20%20%20%20%20import%20torch%0A%20%20%20%20%20%20%20%20%20%20%20%20import%20subprocess%0A%0A%20%20%20%20%20%20%20%20%20%20%20%20subprocess.run(%5B%22nvidia-smi%22%5D)%0A%20%20%20%20%20%20%20%20%20%20%20%20print(%22Torch%20version%3A%22%2C%20torch.__version__)%0A%20%20%20%20%20%20%20%20%20%20%20%20print(%22CUDA%20available%3A%22%2C%20torch.cuda.is_available())%0A%20%20%20%20%20%20%20%20%20%20%20%20print(%22CUDA%20device%20count%3A%22%2C%20torch.cuda.device_count())%0A%20%20%20%20%20%20%20%20%20%20%20%20print(%22CUDA%20device%20name%3A%22%2C%20torch.cuda.get_device_name(0))%0A%20%20%20%20%20%20%20%20%20%20%20%20print(%22CUDA%20device%20index%3A%22%2C%20torch.cuda.current_device())`,lang:`yaml`});var j=c(A,4);u(e(j),{src:`https://modal-cdn.com/article-assets/kestra-modal-flow.png`,alt:`running modal in a flow on kestra`}),n(j);var M=c(j,6);f(M,{code:`id%3A%20modal_hello_world%0Anamespace%3A%20company.team%0A%0Ainputs%3A%0A%20%20-%20id%3A%20compute_type%0A%20%20%20%20displayName%3A%20CPU%20or%20GPU%0A%20%20%20%20description%3A%20Whether%20to%20use%20CPU%20or%20GPU%20compute%20type%0A%20%20%20%20type%3A%20SELECT%0A%20%20%20%20values%3A%0A%20%20%20%20%20%20-%20CPU%0A%20%20%20%20%20%20-%20GPU%0A%20%20%20%20defaults%3A%20CPU%0A%0A%20%20-%20id%3A%20gpu%0A%20%20%20%20type%3A%20SELECT%0A%20%20%20%20displayName%3A%20GPU%20request%0A%20%20%20%20description%3A%20The%20GPU%20resources%20to%20allocate%20to%20the%20job%0A%20%20%20%20defaults%3A%20%22any%22%0A%20%20%20%20values%3A%20%5B%22any%22%2C%20%22t4%22%2C%20%22l4%22%2C%20%22a100%22%2C%20%22h100%22%2C%20%22a10g%22%5D%0A%20%20%20%20dependsOn%3A%0A%20%20%20%20%20%20inputs%3A%0A%20%20%20%20%20%20%20%20-%20compute_type%0A%20%20%20%20%20%20condition%3A%20%22%7B%7B%20inputs.compute_type%20%3D%3D%20'GPU'%20%7D%7D%22%0A%0A%20%20-%20id%3A%20cpu%0A%20%20%20%20type%3A%20SELECT%0A%20%20%20%20displayName%3A%20CPU%20request%0A%20%20%20%20description%3A%20The%20number%20of%20CPU%20cores%20to%20allocate%20to%20the%20job%0A%20%20%20%20defaults%3A%20%220.25%22%0A%20%20%20%20values%3A%20%5B%220.25%22%2C%20%220.5%22%2C%20%220.75%22%2C%20%221.0%22%2C%20%221.5%22%2C%20%222.0%22%2C%20%224.0%22%2C%20%228.0%22%2C%20%2216.0%22%5D%0A%20%20%20%20dependsOn%3A%0A%20%20%20%20%20%20inputs%3A%0A%20%20%20%20%20%20%20%20-%20compute_type%0A%20%20%20%20%20%20condition%3A%20%22%7B%7B%20inputs.compute_type%20%3D%3D%20'CPU'%20%7D%7D%22%0A%0Atasks%3A%0A%20%20-%20id%3A%20run_modal%0A%20%20%20%20type%3A%20io.kestra.plugin.modal.cli.ModalCLI%0A%20%20%20%20env%3A%0A%20%20%20%20%20%20MODAL_TOKEN_ID%3A%20%22%7B%7B%20kv('MODAL_TOKEN_ID')%20%7D%7D%22%0A%20%20%20%20%20%20MODAL_TOKEN_SECRET%3A%20%22%7B%7B%20kv('MODAL_TOKEN_SECRET')%20%7D%7D%22%0A%20%20%20%20%20%20GPU%3A%20%22%7B%7B%20inputs.gpu%20%7D%7D%22%0A%20%20%20%20%20%20CPU%3A%20%22%7B%7B%20inputs.cpu%20%7D%7D%22%0A%20%20%20%20commands%3A%0A%20%20%20%20%20%20-%20modal%20run%20cpu_or_gpu.py%20--compute-type%20%22%7B%7B%20inputs.compute_type%20%7D%7D%22%0A%20%20%20%20inputFiles%3A%0A%20%20%20%20%20%20cpu_or_gpu.py%3A%20%7C%0A%20%20%20%20%20%20%20%20import%20os%0A%0A%20%20%20%20%20%20%20%20import%20modal%0A%0A%20%20%20%20%20%20%20%20app%20%3D%20modal.App(%0A%20%20%20%20%20%20%20%20%20%20%20%20%22example-cpu-gpu%22%2C%0A%20%20%20%20%20%20%20%20%20%20%20%20secrets%3D%5Bmodal.Secret.from_local_environ(env_keys%3D%5B%22GPU%22%2C%20%22CPU%22%5D)%5D%2C%0A%20%20%20%20%20%20%20%20)%0A%0A%20%20%20%20%20%20%20%20cpu_image%20%3D%20modal.Image.debian_slim().pip_install(%22torch%22%2C%20%22psutil%22)%0A%20%20%20%20%20%20%20%20gpu_image%20%3D%20modal.Image.debian_slim().pip_install(%0A%20%20%20%20%20%20%20%20%20%20%20%20%22torch%22%2C%20find_links%3D%22https%3A%2F%2Fdownload.pytorch.org%2Fwhl%2Fcu117%22%0A%20%20%20%20%20%20%20%20)%0A%0A%20%20%20%20%20%20%20%20%40app.function(image%3Dcpu_image%2C%20cpu%3Dfloat(os.getenv(%22CPU%22%2C%200.25)))%0A%20%20%20%20%20%20%20%20def%20print_cpu_info()%3A%0A%20%20%20%20%20%20%20%20%20%20%20%20import%20torch%0A%20%20%20%20%20%20%20%20%20%20%20%20import%20platform%0A%20%20%20%20%20%20%20%20%20%20%20%20import%20psutil%0A%0A%20%20%20%20%20%20%20%20%20%20%20%20print(%22Torch%20version%3A%22%2C%20torch.__version__)%0A%20%20%20%20%20%20%20%20%20%20%20%20print(%22CUDA%20available%3A%22%2C%20torch.cuda.is_available())%20%20%23%20Should%20return%20False%20for%20CPU%0A%20%20%20%20%20%20%20%20%20%20%20%20print(%22CPU%20count%3A%22%2C%20psutil.cpu_count(logical%3DTrue))%0A%20%20%20%20%20%20%20%20%20%20%20%20print(%22CPU%20frequency%3A%22%2C%20psutil.cpu_freq().current%2C%20%22MHz%22)%0A%20%20%20%20%20%20%20%20%20%20%20%20print(%22CPU%20architecture%3A%22%2C%20platform.architecture()%5B0%5D)%0A%20%20%20%20%20%20%20%20%20%20%20%20print(%22Platform%3A%22%2C%20platform.system()%2C%20platform.release())%0A%20%20%20%20%20%20%20%20%20%20%20%20print(%22Total%20memory%20(RAM)%3A%22%2C%20psutil.virtual_memory().total%20%2F%2F%20(1024**2)%2C%20%22MB%22)%0A%0A%20%20%20%20%20%20%20%20%40app.function(image%3Dgpu_image%2C%20gpu%3Dos.getenv(%22GPU%22%2C%20%22any%22))%0A%20%20%20%20%20%20%20%20def%20print_gpu_info()%3A%0A%20%20%20%20%20%20%20%20%20%20%20%20import%20torch%0A%20%20%20%20%20%20%20%20%20%20%20%20import%20subprocess%0A%0A%20%20%20%20%20%20%20%20%20%20%20%20subprocess.run(%5B%22nvidia-smi%22%5D)%0A%20%20%20%20%20%20%20%20%20%20%20%20print(%22Torch%20version%3A%22%2C%20torch.__version__)%0A%20%20%20%20%20%20%20%20%20%20%20%20print(%22CUDA%20available%3A%22%2C%20torch.cuda.is_available())%0A%20%20%20%20%20%20%20%20%20%20%20%20print(%22CUDA%20device%20count%3A%22%2C%20torch.cuda.device_count())%0A%20%20%20%20%20%20%20%20%20%20%20%20print(%22CUDA%20device%20name%3A%22%2C%20torch.cuda.get_device_name(0))%0A%20%20%20%20%20%20%20%20%20%20%20%20print(%22CUDA%20device%20index%3A%22%2C%20torch.cuda.current_device())%0A%0A%20%20%20%20%20%20%20%20%40app.local_entrypoint()%0A%20%20%20%20%20%20%20%20def%20main(compute_type%3A%20str%20%3D%20%22CPU%22)%3A%0A%20%20%20%20%20%20%20%20%20%20%20%20if%20compute_type%20%3D%3D%20%22GPU%22%3A%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20print_gpu_info.remote()%0A%20%20%20%20%20%20%20%20%20%20%20%20else%3A%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20print_cpu_info.remote()`,lang:`yaml`});var N=c(M,6);u(e(N),{src:`https://modal-cdn.com/article-assets/kestra-pick-modal-gpu.png`,alt:`pick Modal CPU or GPU compute on Kestra`}),n(N);var P=c(N,6),F=c(e(P));p(F,{href:`https://kestra.io/docs/concepts/secret`,rel:`nofollow`,children:(e,t)=>{l(),i(e,r(`Secrets`))},$$slots:{default:!0}}),p(c(F,2),{href:`https://kestra.io/docs/concepts/kv-store`,rel:`nofollow`,children:(e,t)=>{l(),i(e,r(`KV Store`))},$$slots:{default:!0}}),l(9),n(P);var I=c(P,2);f(I,{code:`curl%20-X%20PUT%20-H%20%22Content-Type%3A%20application%2Fjson%22%20http%3A%2F%2Flocalhost%3A8080%2Fapi%2Fv1%2Fnamespaces%2Fcompany.team%2Fkv%2FMODAL_TOKEN_ID%20-d%20'%22your_credential%22'%0Acurl%20-X%20PUT%20-H%20%22Content-Type%3A%20application%2Fjson%22%20http%3A%2F%2Flocalhost%3A8080%2Fapi%2Fv1%2Fnamespaces%2Fcompany.team%2Fkv%2FMODAL_TOKEN_SECRET%20-d%20'%22your_credential%22'%0Acurl%20-X%20PUT%20-H%20%22Content-Type%3A%20application%2Fjson%22%20http%3A%2F%2Flocalhost%3A8080%2Fapi%2Fv1%2Fnamespaces%2Fcompany.team%2Fkv%2FAWS_ACCESS_KEY_ID%20-d%20'%22your_credential%22'%0Acurl%20-X%20PUT%20-H%20%22Content-Type%3A%20application%2Fjson%22%20http%3A%2F%2Flocalhost%3A8080%2Fapi%2Fv1%2Fnamespaces%2Fcompany.team%2Fkv%2FAWS_SECRET_ACCESS_KEY%20-d%20'%22your_credential%22'%0Acurl%20-X%20PUT%20-H%20%22Content-Type%3A%20application%2Fjson%22%20http%3A%2F%2Flocalhost%3A8080%2Fapi%2Fv1%2Fnamespaces%2Fcompany.team%2Fkv%2FAWS_DEFAULT_REGION%20-d%20'%22us-east-1%22'`,lang:`bash`});var L=c(I,8);p(e(L),{href:`https://gist.github.com/anna-geller/8c37a868939ea94a6c91f069dc4c215c`,rel:`nofollow`,children:(e,t)=>{l(),i(e,r(`This GitHub Gist`))},$$slots:{default:!0}}),l(),n(L);var R=c(L,4);u(e(R),{src:`https://modal-cdn.com/article-assets/kestra-forecast-execute.png`,alt:`executing the data forecast flow on Kestra`}),n(R);var z=c(R,2);p(c(e(z),3),{href:`https://youtu.be/Wucyw4gRNiQ`,rel:`nofollow`,children:(e,t)=>{l(),i(e,r(`download and view`))},$$slots:{default:!0}}),l(3),n(z);var B=c(z,8);p(c(e(B)),{href:`https://kestra.io/docs/workflow-components/triggers`,rel:`nofollow`,children:(e,t)=>{l(),i(e,r(`triggers documentation`))},$$slots:{default:!0}}),l(),n(B);var V=c(B,6),H=c(e(V));p(H,{href:`https://github.com/kestra-io/kestra`,rel:`nofollow`,children:(e,t)=>{l(),i(e,r(`GitHub star`))},$$slots:{default:!0}}),p(c(H,2),{href:`https://kestra.io/slack`,rel:`nofollow`,children:(e,t)=>{l(),i(e,r(`our community`))},$$slots:{default:!0}}),l(),n(V),i(t,o)},$$slots:{default:!0}}))}export{k as default,h as metadata};
//# sourceMappingURL=Ce6BYD7J.js.map
