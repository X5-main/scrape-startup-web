(function(){try{var e=typeof window<`u`?window:typeof global<`u`?global:typeof globalThis<`u`?globalThis:typeof self<`u`?self:{};e.SENTRY_RELEASE={id:`f99fcf9f0a844cc9bd13fdc8e5782b84`};var t=new e.Error().stack;t&&(e._sentryDebugIds=e._sentryDebugIds||{},e._sentryDebugIds[t]=`4a9f7825-b427-47a2-86c5-1d582a43234d`,e._sentryDebugIdIdentifier=`sentry-dbid-4a9f7825-b427-47a2-86c5-1d582a43234d`)}catch{}})();import{$t as e,St as t,Tn as n,Tt as r,bt as i,c as ee,d as a,en as te,tn as o,wn as s}from"./F_ixKBiO.js";import"./B1sc9Zdx.js";import"./Bb2deiU3.js";import{t as c}from"./JPsrybyr.js";import{t as l}from"./BILrvr3I.js";import{t as u}from"./DeWGVqas2.js";import{t as d}from"./CdZDxCfO2.js";var f={title:`Run GPU jobs from Airflow with Modal`,description:`Isolate your tasks with Modal containers while using Airflow for orchestration.`,date:`2024-06-20T12:00:00.000Z`,length:`8 minute read`,authors:[{name:`Kenny Ning`,avatarUrl:`https://modal-cdn.com/kenny-ning.jpg`,jobTitle:`Data Engineer`,twitterHandle:`kenny_ning`}],category:`Tutorials`,published:!0,layout:`blog`,toc:[{depth:2,value:`Install Modal in your Airflow environment`,id:`install-modal-in-your-airflow-environment`},{depth:2,value:`Set your Modal token`,id:`set-your-modal-token`},{depth:2,value:`Option 1: Deploy Modal Functions and call via lookup`,id:`option-1-deploy-modal-functions-and-call-via-lookup`},{depth:2,value:`Option 2: Create a custom Operator that uses Modal Sandboxes`,id:`option-2-create-a-custom-operator-that-uses-modal-sandboxes`},{depth:2,value:`Conclusion: Airflow + Modal help each other`,id:`conclusion-airflow--modal-help-each-other`},{depth:2,value:`Are you an Astronomer and Modal customer?`,id:`are-you-an-astronomer-and-modal-customer`}],rawContent:`Many teams use [Airflow](https://airflow.apache.org) to manage multi-stage workflows. However, when scaling workflows from local to production, Airflow relies on Celery or Kubernetes, which are difficult and time-consuming to set up, especially if you need to provision GPUs for AI / ML workflows.

Modal is a much simpler way to manage GPUs [](https://modal.com/docs/guide/gpu)and [containerized environments](https://modal.com/docs/guide/images), making it ideal for AI / ML workflows. Modal can be triggered directly from an Airflow DAG and can serve as a replacement for your Celery or Kubernetes executor. You’d get the same scalability features from those backends with the ease of installation of the Local executor.

In this blog post, we’ll show you **how to run Modal jobs from Airflow**:

- Install Modal in your Airflow environment
- Set your [Modal token](https://modal.com/docs/reference/modal.config#modalconfig) ID and secret in your Airflow environment
- Option 1: [Deploy](https://modal.com/docs/guide/managing-deployments) your Modal Functions and call [\`lookup\`](https://modal.com/docs/guide/trigger-deployed-functions#invoking-deployed-functions)
- Option 2: Create a custom operator that uses [Modal Sandboxes](https://modal.com/docs/guide/sandboxes)

We’ll go through each of these steps for a simple example: a two-step data pipeline pulling [ELI5 questions](https://www.reddit.com/r/explainlikeimfive/) from Reddit and answering them using an LLM.

## Install Modal in your Airflow environment

We recommend you use [Astro CLI](https://www.astronomer.io/docs/astro/cli/local-airflow-overview) to develop Airflow locally. Astro CLI is provided by the good folks at [Astronomer](https://www.astronomer.io), a fully managed Airflow platform.

To install Modal into this Airflow environment, add \`modal\` to the \`requirements.txt\` file of your [Astro project](https://www.astronomer.io/docs/astro/cli/develop-project#add-python-os-level-packages-and-airflow-providers). If you don’t have an Astro project, [download the Astro CLI](https://www.astronomer.io/docs/astro/cli/install-cli) and run \`astro dev init\`.

If you’re using [Astro Hosted](https://www.astronomer.io/docs/astro/astro-architecture), these dependencies will be included in your deployment when you run \`astro deploy\`.

## Set your Modal token

Set the following environment variables in your Airflow environment:

- \`MODAL_TOKEN_ID\`
- \`MODAL_TOKEN_SECRET\`

If you already have Modal set up locally, you can find your token id and secret values by running \`cat ~/.modal.toml\`. You can also create new token credentials from your [Modal Settings](https://modal.com/docs/guide/workspaces#create-a-token-for-a-workspace).

For local development, you can set these environment variables in \`.env\` in your Astro project. When you’re ready to deploy to production, you can sync these to your production deployment with [these steps](https://www.astronomer.io/docs/astro/manage-env-vars#manage-environment-variables-locally).

## Option 1: Deploy Modal Functions and call via \`lookup\`

> **Good for**: Existing Modal users with deployed Functions, teams wanting separation of concerns between Airflow and Modal deploy process

Let’s assume we already have a Modal App called \`example-modal-airflow\` with two Functions:

- \`fetch_reddit\` : scrapes ELI5 questions from Reddit
- \`answer_questions\`: answers lists of questions using an LLM (requires GPU, see [this example](https://modal.com/docs/examples/trtllm_llama))

If we deploy this App to our workspace with \`modal deploy\`, we can call it directly from Airflow with \`lookup\` and \`remote\`.

\`\`\`python
"""
Airflow DAG using Modal lookup
"""

from airflow.decorators import dag, task
from datetime import datetime
from modal import Dict, Function

@dag(
    start_date=datetime(2024, 1, 1),
    schedule="@daily",
    catchup=False,
    doc_md=__doc__,
    tags=["example"],
)
def example_modal_airflow():
    # create dict for storing results
    d = Dict.from_name("reddit-question-answers", create_if_missing=True)

    @task()
    def fetch_reddit(**context) -> None:
        """
        This task gets the 100 newest ELI5 questions from Reddit
        """
        # look up function in our deployment
        f = Function.from_name("example-modal-airflow", "fetch_reddit")
        questions = f.remote()
        for q in questions:
            d[q] = None  # store questions first

    @task()
    def answer_questions(**context) -> None:
        """
        Uses LLM example to answer the questions
        """
        # look up inference function
        f = Function.from_name("example-modal-airflow", "answer_questions")
        questions = list(d.keys())
        answers = f.remote(questions)

        # update dict with answers
        for i in range(len(questions)):
            d[questions[i]] = answers[i]

    # define dependencies
    fetch_reddit() >> answer_questions()

# instantiate DAG
example_modal_airflow()

\`\`\`

You can run \`astro run example_modal_airflow()\` from the terminal or go to the Airflow UI to trigger the workflow manually:

![airflow_ui](https://modal-cdn.com/cdnbot/airflow-ui.png)

If we go to our Modal dashboard, we can see the run logs for each of these invocations, including GPU utilization for the LLM task:

![gpu_modal_dashboard](https://modal-cdn.com/cdnbot/gpu_modal_dashboard.png)

We’re using a [Modal Dict](https://modal.com/docs/reference/modal.Dict) here as intermediate storage between tasks, which is also easy to inspect for debugging purposes. We can use it to look at an example output of our pipeline directly from any Python environment:

\`\`\`python
>>> import modal
>>> d = modal.Dict.from_name('reddit-question-answers')
>>> for item in d.items():
...   print(item[0])
...   print(item[1])
...   break
...
ELI5 Indian metro system

The Delhi Metro, also known as the DMRC (Delhi Metro Rail Corporation), is a rapid transit system serving the city of New Delhi and its surrounding areas in India. Here's an ELI5 explanation:

**What is it?**
The Delhi Metro is a train-based public transportation system that connects various parts of the city. It's like a big, underground highway for trains that takes people from one place to another.

**How does it work?**

1. **Trains:** The Delhi Metro has 8 lines with over 225 stations, which are connected by trains that run on tracks.
2. **Lines:** There are two types of lines: Phase I (Phase 1) and Phase II (Phase 2). Phase I has 6 lines, while Phase II has 3 more lines.
3. **Stations:** Each station has platforms where passengers can board or exit the train. Some stations have multiple platforms, so you might need to check the signs to find your platform number.
4. **Fares:** You can buy tickets at ticket counters or use your smart cards (like a special kind of debit card).
5. **Frequency:** Trains run frequently, usually every few minutes during peak hours and less often during off-peak hours
\`\`\`

Here are some other options for passing data between tasks:

- [Pass the data](https://www.astronomer.io/docs/learn/airflow-passing-data-between-tasks) directly: this uses Airflow XComs, which in turn uses the metadata database in your Airflow deployment for storage. This approach is more limited in size of data you can transmit; if you’re using Postgres, that [limit is 1GB](https://www.astronomer.io/docs/learn/airflow-passing-data-between-tasks#when-to-use-xcoms). Meanwhile, Modal Dicts have [a limit of 10GB](https://modal.com/docs/guide/dicts).
- Mount a [Volume](https://modal.com/docs/guide/volumes) in your Modal function and store the data there: a lot of raw data is expressed in files (e.g. [NYC taxi trips](https://www.nyc.gov/site/tlc/about/tlc-trip-record-data.page)), and Volumes are a more natural way to store files and directories.

## Option 2: Create a custom Operator that uses Modal Sandboxes

> **Good for**: Existing Airflow users who are looking for an easy way to access GPUs for a task directly in their DAG code

Alternatively, you can write a [custom Operator](https://www.astronomer.io/docs/learn/airflow-importing-custom-hooks-operators) that uses [Modal Sandboxes](https://modal.com/docs/guide/sandboxes) to run Python code in a container defined at runtime.

Your directory structure will look something like this:

\`\`\`
├── dags/
│   └── example_modal_operator.py # DAG that calls ModalOperator and passes in the function from scripts.py
│   └── utils/
│       └── scripts.py  # Python scripts we want to run inside a Modal Sandbox
├── include/
│   └── modal_operator.py # custom operator that defines how Python functions get run in Modal Sandboxes
\`\`\`

Let’s start with \`modal_operator.py\`. In Airflow, an Operator is a Python class that gets instantiated as a task when you call it in a DAG. You may already be familiar with [\`BashOperator\`](https://airflow.apache.org/docs/apache-airflow/stable/howto/operator/bash.html) or [\`KubernetesPodOperator\`](https://airflow.apache.org/docs/apache-airflow-providers-cncf-kubernetes/stable/operators.html). Custom Operators allow you to re-use code across tasks that call the same service:

Our Operator has three initialization parameters:

- \`client\`: a [modal.Client](https://modal.com/docs/reference/modal.Client) object that reads in our token environment variables
- \`fn\`: the Python function that we want to run in a sandbox
- \`sandbox_config\`: dictionary of Sandbox parameters (e.g. image, gpus)

\`\`\`python
# include/modal_operator.py

from airflow.models.baseoperator import BaseOperator
import inspect
import modal

class ModalOperator(BaseOperator):
    """
    Custom Airflow Operator for executing tasks on Modal.
    """

    def __init__(self, client, fn, sandbox_config, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.client = client
        self.fn = fn
        self.sandbox_config=sandbox_config

    def execute(self, context):
        # converts the Python function object into an executable string
        fn_lines = inspect.getsourcelines(self.fn)[0]
        fn_lines.append(f"{self.fn.__name__}()")
        fn_as_string = "".join(fn_lines)

        # runs the function in a Modal Sandbox with the provided config
        sb = modal.Sandbox.create(
            "python",
            "-c",
            fn_as_string,
            client=self.client,
            app=self.app,
            **self.sandbox_config
        )
        sb.wait()
        return sb.stdout.read()

\`\`\`

Next, let’s define \`fetch_reddit\` within \`scripts.py\`:

\`\`\`python
# dags/utils/scripts.py

def fetch_reddit():
    # import task dependencies inside of functions, not global scope
    import os
    import praw

    # Reddit client secrets that are saved as Modal Secrets
    reddit = praw.Reddit(
        client_id=os.environ["CLIENT_ID"],
        client_secret=os.environ["CLIENT_SECRET"],
        user_agent="reddit-eli5-scraper",
    )
    subreddit = reddit.subreddit("explainlikeimfive")
    questions = [topic.title for topic in subreddit.new()]
    file_path = "/data/topics.txt"
    print(f"Writing data to {file_path}")
    with open(file_path, "w") as file:
        file.write("\\n".join(questions))

\`\`\`

Finally, let’s put this script and our new custom Operator together in a DAG:

\`\`\`python
# dags/example_modal_operator.py

"""
## ModalOperator + Sandboxes example

"""

from airflow.decorators import dag
from include.modal_operator import ModalOperator
from dags.utils.scripts import fetch_reddit
from datetime import datetime
import modal
import os

@dag(
    start_date=datetime(2024, 1, 1),
    schedule="@daily",
    catchup=False,
    doc_md=__doc__,
    tags=["example"],
)
def example_modal_operator():
    reddit = ModalOperator(
        task_id="fetch_reddit",

        # pass in your Modal token credentials from environment variables
        client=modal.Client.from_credentials(
            token_id=os.environ["MODAL_TOKEN_ID"],
            token_secret=os.environ["MODAL_TOKEN_SECRET"],
        ),

        # function we import from \`scripts.py\`
        fn=get_reddit_questions,
        sandbox_config={
            # define Python dependencies
            "image": modal.Image.debian_slim().pip_install(
                "praw"
            ),
            # attach Modal secret containing our Reddit API credentials
            "secrets": [
                modal.Secret.from_name("reddit-secret")
            ],
            # attach Volume, where the output of the script will be stored
            "volumes": {
                "/data": modal.Volume.from_name("airflow-sandbox-vol")
            },
        },
    )

    reddit

# instantiate the DAG
example_modal_operator()

\`\`\`

This DAG imports the function in our script, instantiates a Modal Client, and launches the script in a Sandbox via our custom ModalOperator.

**Note**: We are currently working on a Modal [Airflow provider package](https://github.com/astronomer/airflow-provider-sample) that would allow you to install the above \`ModalOperator\` and associated Modal Connection object directly into your Airflow project.

## Conclusion: Airflow + Modal help each other

The biggest benefit of using Modal with Airflow is that it easily allows you to **isolate your task environment** from your Airflow environment. The current solution for this today is to stand up a complicated deploy process building Docker images, publishing to a registry, and using the KubernetesPodOperator.

For Modal users, defining custom images or attaching GPUs is as simple as a [function decorator](https://modal.com/docs/guide/gpu), while Airflow adds a single control pane to oversee the lifecycle of a multi-stage pipeline. Together you get the best of both worlds: full-featured data pipeline observability and easy GPU container lifecycle management.

## Are you an Astronomer and Modal customer?

We highly encourage you to try out Modal in your Astronomer workflows as we roll out a tighter integration. Please reach out to [support@modal.com](mailto:support@modal.com) or [Astronomer support](https://www.astronomer.io/contact/) if you have any feedback and/or are interested in being a design partner with us.
`,meta:{description:`Isolate your tasks with Modal containers while using Airflow for orchestration.`}},{title:p,description:m,date:h,length:g,authors:_,category:v,published:y,layout:b,toc:x,rawContent:S,meta:C}=f,ne=t(`<code>lookup</code>`),re=t(`<code>BashOperator</code>`),ie=t(`<code>KubernetesPodOperator</code>`),ae=t(`<p>Many teams use <!> to manage multi-stage workflows. However, when scaling workflows from local to production, Airflow relies on Celery or Kubernetes, which are difficult and time-consuming to set up, especially if you need to provision GPUs for AI / ML workflows.</p> <p>Modal is a much simpler way to manage GPUs <!>and <!>, making it ideal for AI / ML workflows. Modal can be triggered directly from an Airflow DAG and can serve as a replacement for your Celery or Kubernetes executor. You’d get the same scalability features from those backends with the ease of installation of the Local executor.</p> <p>In this blog post, we’ll show you <strong>how to run Modal jobs from Airflow</strong>:</p> <ul><li>Install Modal in your Airflow environment</li> <li>Set your <!> ID and secret in your Airflow environment</li> <li>Option 1: <!> your Modal Functions and call <!></li> <li>Option 2: Create a custom operator that uses <!></li></ul> <p>We’ll go through each of these steps for a simple example: a two-step data pipeline pulling <!> from Reddit and answering them using an LLM.</p> <h2 id="install-modal-in-your-airflow-environment">Install Modal in your Airflow environment</h2> <p>We recommend you use <!> to develop Airflow locally. Astro CLI is provided by the good folks at <!>, a fully managed Airflow platform.</p> <p>To install Modal into this Airflow environment, add <code>modal</code> to the <code>requirements.txt</code> file of your <!>. If you don’t have an Astro project, <!> and run <code>astro dev init</code>.</p> <p>If you’re using <!>, these dependencies will be included in your deployment when you run <code>astro deploy</code>.</p> <h2 id="set-your-modal-token">Set your Modal token</h2> <p>Set the following environment variables in your Airflow environment:</p> <ul><li><code>MODAL_TOKEN_ID</code></li> <li><code>MODAL_TOKEN_SECRET</code></li></ul> <p>If you already have Modal set up locally, you can find your token id and secret values by running <code>cat ~/.modal.toml</code>. You can also create new token credentials from your <!>.</p> <p>For local development, you can set these environment variables in <code>.env</code> in your Astro project. When you’re ready to deploy to production, you can sync these to your production deployment with <!>.</p> <h2 id="option-1-deploy-modal-functions-and-call-via-lookup">Option 1: Deploy Modal Functions and call via <code>lookup</code></h2> <blockquote><p><strong>Good for</strong>: Existing Modal users with deployed Functions, teams wanting separation of concerns between Airflow and Modal deploy process</p></blockquote> <p>Let’s assume we already have a Modal App called <code>example-modal-airflow</code> with two Functions:</p> <ul><li><code>fetch_reddit</code> : scrapes ELI5 questions from Reddit</li> <li><code>answer_questions</code>: answers lists of questions using an LLM (requires GPU, see <!>)</li></ul> <p>If we deploy this App to our workspace with <code>modal deploy</code>, we can call it directly from Airflow with <code>lookup</code> and <code>remote</code>.</p> <!> <p>You can run <code>astro run example_modal_airflow()</code> from the terminal or go to the Airflow UI to trigger the workflow manually:</p> <p><!></p> <p>If we go to our Modal dashboard, we can see the run logs for each of these invocations, including GPU utilization for the LLM task:</p> <p><!></p> <p>We’re using a <!> here as intermediate storage between tasks, which is also easy to inspect for debugging purposes. We can use it to look at an example output of our pipeline directly from any Python environment:</p> <!> <p>Here are some other options for passing data between tasks:</p> <ul><li><!> directly: this uses Airflow XComs, which in turn uses the metadata database in your Airflow deployment for storage. This approach is more limited in size of data you can transmit; if you’re using Postgres, that <!>. Meanwhile, Modal Dicts have <!>.</li> <li>Mount a <!> in your Modal function and store the data there: a lot of raw data is expressed in files (e.g. <!>), and Volumes are a more natural way to store files and directories.</li></ul> <h2 id="option-2-create-a-custom-operator-that-uses-modal-sandboxes">Option 2: Create a custom Operator that uses Modal Sandboxes</h2> <blockquote><p><strong>Good for</strong>: Existing Airflow users who are looking for an easy way to access GPUs for a task directly in their DAG code</p></blockquote> <p>Alternatively, you can write a <!> that uses <!> to run Python code in a container defined at runtime.</p> <p>Your directory structure will look something like this:</p> <!> <p>Let’s start with <code>modal_operator.py</code>. In Airflow, an Operator is a Python class that gets instantiated as a task when you call it in a DAG. You may already be familiar with <!> or <!>. Custom Operators allow you to re-use code across tasks that call the same service:</p> <p>Our Operator has three initialization parameters:</p> <ul><li><code>client</code>: a <!> object that reads in our token environment variables</li> <li><code>fn</code>: the Python function that we want to run in a sandbox</li> <li><code>sandbox_config</code>: dictionary of Sandbox parameters (e.g. image, gpus)</li></ul> <!> <p>Next, let’s define <code>fetch_reddit</code> within <code>scripts.py</code>:</p> <!> <p>Finally, let’s put this script and our new custom Operator together in a DAG:</p> <!> <p>This DAG imports the function in our script, instantiates a Modal Client, and launches the script in a Sandbox via our custom ModalOperator.</p> <p><strong>Note</strong>: We are currently working on a Modal <!> that would allow you to install the above <code>ModalOperator</code> and associated Modal Connection object directly into your Airflow project.</p> <h2 id="conclusion-airflow--modal-help-each-other">Conclusion: Airflow + Modal help each other</h2> <p>The biggest benefit of using Modal with Airflow is that it easily allows you to <strong>isolate your task environment</strong> from your Airflow environment. The current solution for this today is to stand up a complicated deploy process building Docker images, publishing to a registry, and using the KubernetesPodOperator.</p> <p>For Modal users, defining custom images or attaching GPUs is as simple as a <!>, while Airflow adds a single control pane to oversee the lifecycle of a multi-stage pipeline. Together you get the best of both worlds: full-featured data pipeline observability and easy GPU container lifecycle management.</p> <h2 id="are-you-an-astronomer-and-modal-customer">Are you an Astronomer and Modal customer?</h2> <p>We highly encourage you to try out Modal in your Astronomer workflows as we roll out a tighter integration. Please reach out to <!> or <!> if you have any feedback and/or are interested in being a design partner with us.</p>`,1);function w(t,p){let m=ee(p,[`children`,`$$slots`,`$$events`,`$$legacy`]);d(t,a(()=>m,()=>f,{children:(t,ee)=>{var a=ae(),d=te(a);u(o(e(d)),{href:`https://airflow.apache.org`,rel:`nofollow`,children:(e,t)=>{s(),i(e,r(`Airflow`))},$$slots:{default:!0}}),s(),n(d);var f=o(d,2),p=o(e(f));u(p,{href:`https://modal.com/docs/guide/gpu`,rel:`nofollow`}),u(o(p,2),{href:`https://modal.com/docs/guide/images`,rel:`nofollow`,children:(e,t)=>{s(),i(e,r(`containerized environments`))},$$slots:{default:!0}}),s(),n(f);var m=o(f,4),h=o(e(m),2);u(o(e(h)),{href:`https://modal.com/docs/reference/modal.config#modalconfig`,rel:`nofollow`,children:(e,t)=>{s(),i(e,r(`Modal token`))},$$slots:{default:!0}}),s(),n(h);var g=o(h,2),_=o(e(g));u(_,{href:`https://modal.com/docs/guide/managing-deployments`,rel:`nofollow`,children:(e,t)=>{s(),i(e,r(`Deploy`))},$$slots:{default:!0}}),u(o(_,2),{href:`https://modal.com/docs/guide/trigger-deployed-functions#invoking-deployed-functions`,rel:`nofollow`,children:(e,t)=>{i(e,ne())},$$slots:{default:!0}}),n(g);var v=o(g,2);u(o(e(v)),{href:`https://modal.com/docs/guide/sandboxes`,rel:`nofollow`,children:(e,t)=>{s(),i(e,r(`Modal Sandboxes`))},$$slots:{default:!0}}),n(v),n(m);var y=o(m,2);u(o(e(y)),{href:`https://www.reddit.com/r/explainlikeimfive/`,rel:`nofollow`,children:(e,t)=>{s(),i(e,r(`ELI5 questions`))},$$slots:{default:!0}}),s(),n(y);var b=o(y,4),x=o(e(b));u(x,{href:`https://www.astronomer.io/docs/astro/cli/local-airflow-overview`,rel:`nofollow`,children:(e,t)=>{s(),i(e,r(`Astro CLI`))},$$slots:{default:!0}}),u(o(x,2),{href:`https://www.astronomer.io`,rel:`nofollow`,children:(e,t)=>{s(),i(e,r(`Astronomer`))},$$slots:{default:!0}}),s(),n(b);var S=o(b,2),C=o(e(S),5);u(C,{href:`https://www.astronomer.io/docs/astro/cli/develop-project#add-python-os-level-packages-and-airflow-providers`,rel:`nofollow`,children:(e,t)=>{s(),i(e,r(`Astro project`))},$$slots:{default:!0}}),u(o(C,2),{href:`https://www.astronomer.io/docs/astro/cli/install-cli`,rel:`nofollow`,children:(e,t)=>{s(),i(e,r(`download the Astro CLI`))},$$slots:{default:!0}}),s(3),n(S);var w=o(S,2);u(o(e(w)),{href:`https://www.astronomer.io/docs/astro/astro-architecture`,rel:`nofollow`,children:(e,t)=>{s(),i(e,r(`Astro Hosted`))},$$slots:{default:!0}}),s(3),n(w);var T=o(w,8);u(o(e(T),3),{href:`https://modal.com/docs/guide/workspaces#create-a-token-for-a-workspace`,rel:`nofollow`,children:(e,t)=>{s(),i(e,r(`Modal Settings`))},$$slots:{default:!0}}),s(),n(T);var E=o(T,2);u(o(e(E),3),{href:`https://www.astronomer.io/docs/astro/manage-env-vars#manage-environment-variables-locally`,rel:`nofollow`,children:(e,t)=>{s(),i(e,r(`these steps`))},$$slots:{default:!0}}),s(),n(E);var D=o(E,8),O=o(e(D),2);u(o(e(O),2),{href:`https://modal.com/docs/examples/trtllm_llama`,rel:`nofollow`,children:(e,t)=>{s(),i(e,r(`this example`))},$$slots:{default:!0}}),s(),n(O),n(D);var k=o(D,4);l(k,{code:`%22%22%22%0AAirflow%20DAG%20using%20Modal%20lookup%0A%22%22%22%0A%0Afrom%20airflow.decorators%20import%20dag%2C%20task%0Afrom%20datetime%20import%20datetime%0Afrom%20modal%20import%20Dict%2C%20Function%0A%0A%40dag(%0A%20%20%20%20start_date%3Ddatetime(2024%2C%201%2C%201)%2C%0A%20%20%20%20schedule%3D%22%40daily%22%2C%0A%20%20%20%20catchup%3DFalse%2C%0A%20%20%20%20doc_md%3D__doc__%2C%0A%20%20%20%20tags%3D%5B%22example%22%5D%2C%0A)%0Adef%20example_modal_airflow()%3A%0A%20%20%20%20%23%20create%20dict%20for%20storing%20results%0A%20%20%20%20d%20%3D%20Dict.from_name(%22reddit-question-answers%22%2C%20create_if_missing%3DTrue)%0A%0A%20%20%20%20%40task()%0A%20%20%20%20def%20fetch_reddit(**context)%20-%3E%20None%3A%0A%20%20%20%20%20%20%20%20%22%22%22%0A%20%20%20%20%20%20%20%20This%20task%20gets%20the%20100%20newest%20ELI5%20questions%20from%20Reddit%0A%20%20%20%20%20%20%20%20%22%22%22%0A%20%20%20%20%20%20%20%20%23%20look%20up%20function%20in%20our%20deployment%0A%20%20%20%20%20%20%20%20f%20%3D%20Function.from_name(%22example-modal-airflow%22%2C%20%22fetch_reddit%22)%0A%20%20%20%20%20%20%20%20questions%20%3D%20f.remote()%0A%20%20%20%20%20%20%20%20for%20q%20in%20questions%3A%0A%20%20%20%20%20%20%20%20%20%20%20%20d%5Bq%5D%20%3D%20None%20%20%23%20store%20questions%20first%0A%0A%20%20%20%20%40task()%0A%20%20%20%20def%20answer_questions(**context)%20-%3E%20None%3A%0A%20%20%20%20%20%20%20%20%22%22%22%0A%20%20%20%20%20%20%20%20Uses%20LLM%20example%20to%20answer%20the%20questions%0A%20%20%20%20%20%20%20%20%22%22%22%0A%20%20%20%20%20%20%20%20%23%20look%20up%20inference%20function%0A%20%20%20%20%20%20%20%20f%20%3D%20Function.from_name(%22example-modal-airflow%22%2C%20%22answer_questions%22)%0A%20%20%20%20%20%20%20%20questions%20%3D%20list(d.keys())%0A%20%20%20%20%20%20%20%20answers%20%3D%20f.remote(questions)%0A%0A%20%20%20%20%20%20%20%20%23%20update%20dict%20with%20answers%0A%20%20%20%20%20%20%20%20for%20i%20in%20range(len(questions))%3A%0A%20%20%20%20%20%20%20%20%20%20%20%20d%5Bquestions%5Bi%5D%5D%20%3D%20answers%5Bi%5D%0A%0A%20%20%20%20%23%20define%20dependencies%0A%20%20%20%20fetch_reddit()%20%3E%3E%20answer_questions()%0A%0A%23%20instantiate%20DAG%0Aexample_modal_airflow()%0A`,lang:`python`});var A=o(k,4);c(e(A),{src:`https://modal-cdn.com/cdnbot/airflow-ui.png`,alt:`airflow_ui`}),n(A);var j=o(A,4);c(e(j),{src:`https://modal-cdn.com/cdnbot/gpu_modal_dashboard.png`,alt:`gpu_modal_dashboard`}),n(j);var M=o(j,2);u(o(e(M)),{href:`https://modal.com/docs/reference/modal.Dict`,rel:`nofollow`,children:(e,t)=>{s(),i(e,r(`Modal Dict`))},$$slots:{default:!0}}),s(),n(M);var N=o(M,2);l(N,{code:`%3E%3E%3E%20import%20modal%0A%3E%3E%3E%20d%20%3D%20modal.Dict.from_name('reddit-question-answers')%0A%3E%3E%3E%20for%20item%20in%20d.items()%3A%0A...%20%20%20print(item%5B0%5D)%0A...%20%20%20print(item%5B1%5D)%0A...%20%20%20break%0A...%0AELI5%20Indian%20metro%20system%0A%0AThe%20Delhi%20Metro%2C%20also%20known%20as%20the%20DMRC%20(Delhi%20Metro%20Rail%20Corporation)%2C%20is%20a%20rapid%20transit%20system%20serving%20the%20city%20of%20New%20Delhi%20and%20its%20surrounding%20areas%20in%20India.%20Here's%20an%20ELI5%20explanation%3A%0A%0A**What%20is%20it%3F**%0AThe%20Delhi%20Metro%20is%20a%20train-based%20public%20transportation%20system%20that%20connects%20various%20parts%20of%20the%20city.%20It's%20like%20a%20big%2C%20underground%20highway%20for%20trains%20that%20takes%20people%20from%20one%20place%20to%20another.%0A%0A**How%20does%20it%20work%3F**%0A%0A1.%20**Trains%3A**%20The%20Delhi%20Metro%20has%208%20lines%20with%20over%20225%20stations%2C%20which%20are%20connected%20by%20trains%20that%20run%20on%20tracks.%0A2.%20**Lines%3A**%20There%20are%20two%20types%20of%20lines%3A%20Phase%20I%20(Phase%201)%20and%20Phase%20II%20(Phase%202).%20Phase%20I%20has%206%20lines%2C%20while%20Phase%20II%20has%203%20more%20lines.%0A3.%20**Stations%3A**%20Each%20station%20has%20platforms%20where%20passengers%20can%20board%20or%20exit%20the%20train.%20Some%20stations%20have%20multiple%20platforms%2C%20so%20you%20might%20need%20to%20check%20the%20signs%20to%20find%20your%20platform%20number.%0A4.%20**Fares%3A**%20You%20can%20buy%20tickets%20at%20ticket%20counters%20or%20use%20your%20smart%20cards%20(like%20a%20special%20kind%20of%20debit%20card).%0A5.%20**Frequency%3A**%20Trains%20run%20frequently%2C%20usually%20every%20few%20minutes%20during%20peak%20hours%20and%20less%20often%20during%20off-peak%20hours`,lang:`python`});var P=o(N,4),F=e(P),I=e(F);u(I,{href:`https://www.astronomer.io/docs/learn/airflow-passing-data-between-tasks`,rel:`nofollow`,children:(e,t)=>{s(),i(e,r(`Pass the data`))},$$slots:{default:!0}});var L=o(I,2);u(L,{href:`https://www.astronomer.io/docs/learn/airflow-passing-data-between-tasks#when-to-use-xcoms`,rel:`nofollow`,children:(e,t)=>{s(),i(e,r(`limit is 1GB`))},$$slots:{default:!0}}),u(o(L,2),{href:`https://modal.com/docs/guide/dicts`,rel:`nofollow`,children:(e,t)=>{s(),i(e,r(`a limit of 10GB`))},$$slots:{default:!0}}),s(),n(F);var R=o(F,2),z=o(e(R));u(z,{href:`https://modal.com/docs/guide/volumes`,rel:`nofollow`,children:(e,t)=>{s(),i(e,r(`Volume`))},$$slots:{default:!0}}),u(o(z,2),{href:`https://www.nyc.gov/site/tlc/about/tlc-trip-record-data.page`,rel:`nofollow`,children:(e,t)=>{s(),i(e,r(`NYC taxi trips`))},$$slots:{default:!0}}),s(),n(R),n(P);var B=o(P,6),V=o(e(B));u(V,{href:`https://www.astronomer.io/docs/learn/airflow-importing-custom-hooks-operators`,rel:`nofollow`,children:(e,t)=>{s(),i(e,r(`custom Operator`))},$$slots:{default:!0}}),u(o(V,2),{href:`https://modal.com/docs/guide/sandboxes`,rel:`nofollow`,children:(e,t)=>{s(),i(e,r(`Modal Sandboxes`))},$$slots:{default:!0}}),s(),n(B);var H=o(B,4);l(H,{code:`%E2%94%9C%E2%94%80%E2%94%80%20dags%2F%0A%E2%94%82%20%20%20%E2%94%94%E2%94%80%E2%94%80%20example_modal_operator.py%20%23%20DAG%20that%20calls%20ModalOperator%20and%20passes%20in%20the%20function%20from%20scripts.py%0A%E2%94%82%20%20%20%E2%94%94%E2%94%80%E2%94%80%20utils%2F%0A%E2%94%82%20%20%20%20%20%20%20%E2%94%94%E2%94%80%E2%94%80%20scripts.py%20%20%23%20Python%20scripts%20we%20want%20to%20run%20inside%20a%20Modal%20Sandbox%0A%E2%94%9C%E2%94%80%E2%94%80%20include%2F%0A%E2%94%82%20%20%20%E2%94%94%E2%94%80%E2%94%80%20modal_operator.py%20%23%20custom%20operator%20that%20defines%20how%20Python%20functions%20get%20run%20in%20Modal%20Sandboxes`,lang:`text`});var U=o(H,2),W=o(e(U),3);u(W,{href:`https://airflow.apache.org/docs/apache-airflow/stable/howto/operator/bash.html`,rel:`nofollow`,children:(e,t)=>{i(e,re())},$$slots:{default:!0}}),u(o(W,2),{href:`https://airflow.apache.org/docs/apache-airflow-providers-cncf-kubernetes/stable/operators.html`,rel:`nofollow`,children:(e,t)=>{i(e,ie())},$$slots:{default:!0}}),s(),n(U);var G=o(U,4),K=e(G);u(o(e(K),2),{href:`https://modal.com/docs/reference/modal.Client`,rel:`nofollow`,children:(e,t)=>{s(),i(e,r(`modal.Client`))},$$slots:{default:!0}}),s(),n(K),s(4),n(G);var q=o(G,2);l(q,{code:`%23%20include%2Fmodal_operator.py%0A%0Afrom%20airflow.models.baseoperator%20import%20BaseOperator%0Aimport%20inspect%0Aimport%20modal%0A%0Aclass%20ModalOperator(BaseOperator)%3A%0A%20%20%20%20%22%22%22%0A%20%20%20%20Custom%20Airflow%20Operator%20for%20executing%20tasks%20on%20Modal.%0A%20%20%20%20%22%22%22%0A%0A%20%20%20%20def%20__init__(self%2C%20client%2C%20fn%2C%20sandbox_config%2C%20*args%2C%20**kwargs)%3A%0A%20%20%20%20%20%20%20%20super().__init__(*args%2C%20**kwargs)%0A%20%20%20%20%20%20%20%20self.client%20%3D%20client%0A%20%20%20%20%20%20%20%20self.fn%20%3D%20fn%0A%20%20%20%20%20%20%20%20self.sandbox_config%3Dsandbox_config%0A%0A%20%20%20%20def%20execute(self%2C%20context)%3A%0A%20%20%20%20%20%20%20%20%23%20converts%20the%20Python%20function%20object%20into%20an%20executable%20string%0A%20%20%20%20%20%20%20%20fn_lines%20%3D%20inspect.getsourcelines(self.fn)%5B0%5D%0A%20%20%20%20%20%20%20%20fn_lines.append(f%22%7Bself.fn.__name__%7D()%22)%0A%20%20%20%20%20%20%20%20fn_as_string%20%3D%20%22%22.join(fn_lines)%0A%0A%20%20%20%20%20%20%20%20%23%20runs%20the%20function%20in%20a%20Modal%20Sandbox%20with%20the%20provided%20config%0A%20%20%20%20%20%20%20%20sb%20%3D%20modal.Sandbox.create(%0A%20%20%20%20%20%20%20%20%20%20%20%20%22python%22%2C%0A%20%20%20%20%20%20%20%20%20%20%20%20%22-c%22%2C%0A%20%20%20%20%20%20%20%20%20%20%20%20fn_as_string%2C%0A%20%20%20%20%20%20%20%20%20%20%20%20client%3Dself.client%2C%0A%20%20%20%20%20%20%20%20%20%20%20%20app%3Dself.app%2C%0A%20%20%20%20%20%20%20%20%20%20%20%20**self.sandbox_config%0A%20%20%20%20%20%20%20%20)%0A%20%20%20%20%20%20%20%20sb.wait()%0A%20%20%20%20%20%20%20%20return%20sb.stdout.read()%0A`,lang:`python`});var J=o(q,4);l(J,{code:`%23%20dags%2Futils%2Fscripts.py%0A%0Adef%20fetch_reddit()%3A%0A%20%20%20%20%23%20import%20task%20dependencies%20inside%20of%20functions%2C%20not%20global%20scope%0A%20%20%20%20import%20os%0A%20%20%20%20import%20praw%0A%0A%20%20%20%20%23%20Reddit%20client%20secrets%20that%20are%20saved%20as%20Modal%20Secrets%0A%20%20%20%20reddit%20%3D%20praw.Reddit(%0A%20%20%20%20%20%20%20%20client_id%3Dos.environ%5B%22CLIENT_ID%22%5D%2C%0A%20%20%20%20%20%20%20%20client_secret%3Dos.environ%5B%22CLIENT_SECRET%22%5D%2C%0A%20%20%20%20%20%20%20%20user_agent%3D%22reddit-eli5-scraper%22%2C%0A%20%20%20%20)%0A%20%20%20%20subreddit%20%3D%20reddit.subreddit(%22explainlikeimfive%22)%0A%20%20%20%20questions%20%3D%20%5Btopic.title%20for%20topic%20in%20subreddit.new()%5D%0A%20%20%20%20file_path%20%3D%20%22%2Fdata%2Ftopics.txt%22%0A%20%20%20%20print(f%22Writing%20data%20to%20%7Bfile_path%7D%22)%0A%20%20%20%20with%20open(file_path%2C%20%22w%22)%20as%20file%3A%0A%20%20%20%20%20%20%20%20file.write(%22%5Cn%22.join(questions))%0A`,lang:`python`});var Y=o(J,4);l(Y,{code:`%23%20dags%2Fexample_modal_operator.py%0A%0A%22%22%22%0A%23%23%20ModalOperator%20%2B%20Sandboxes%20example%0A%0A%22%22%22%0A%0Afrom%20airflow.decorators%20import%20dag%0Afrom%20include.modal_operator%20import%20ModalOperator%0Afrom%20dags.utils.scripts%20import%20fetch_reddit%0Afrom%20datetime%20import%20datetime%0Aimport%20modal%0Aimport%20os%0A%0A%40dag(%0A%20%20%20%20start_date%3Ddatetime(2024%2C%201%2C%201)%2C%0A%20%20%20%20schedule%3D%22%40daily%22%2C%0A%20%20%20%20catchup%3DFalse%2C%0A%20%20%20%20doc_md%3D__doc__%2C%0A%20%20%20%20tags%3D%5B%22example%22%5D%2C%0A)%0Adef%20example_modal_operator()%3A%0A%20%20%20%20reddit%20%3D%20ModalOperator(%0A%20%20%20%20%20%20%20%20task_id%3D%22fetch_reddit%22%2C%0A%0A%20%20%20%20%20%20%20%20%23%20pass%20in%20your%20Modal%20token%20credentials%20from%20environment%20variables%0A%20%20%20%20%20%20%20%20client%3Dmodal.Client.from_credentials(%0A%20%20%20%20%20%20%20%20%20%20%20%20token_id%3Dos.environ%5B%22MODAL_TOKEN_ID%22%5D%2C%0A%20%20%20%20%20%20%20%20%20%20%20%20token_secret%3Dos.environ%5B%22MODAL_TOKEN_SECRET%22%5D%2C%0A%20%20%20%20%20%20%20%20)%2C%0A%0A%20%20%20%20%20%20%20%20%23%20function%20we%20import%20from%20%60scripts.py%60%0A%20%20%20%20%20%20%20%20fn%3Dget_reddit_questions%2C%0A%20%20%20%20%20%20%20%20sandbox_config%3D%7B%0A%20%20%20%20%20%20%20%20%20%20%20%20%23%20define%20Python%20dependencies%0A%20%20%20%20%20%20%20%20%20%20%20%20%22image%22%3A%20modal.Image.debian_slim().pip_install(%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%22praw%22%0A%20%20%20%20%20%20%20%20%20%20%20%20)%2C%0A%20%20%20%20%20%20%20%20%20%20%20%20%23%20attach%20Modal%20secret%20containing%20our%20Reddit%20API%20credentials%0A%20%20%20%20%20%20%20%20%20%20%20%20%22secrets%22%3A%20%5B%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20modal.Secret.from_name(%22reddit-secret%22)%0A%20%20%20%20%20%20%20%20%20%20%20%20%5D%2C%0A%20%20%20%20%20%20%20%20%20%20%20%20%23%20attach%20Volume%2C%20where%20the%20output%20of%20the%20script%20will%20be%20stored%0A%20%20%20%20%20%20%20%20%20%20%20%20%22volumes%22%3A%20%7B%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%22%2Fdata%22%3A%20modal.Volume.from_name(%22airflow-sandbox-vol%22)%0A%20%20%20%20%20%20%20%20%20%20%20%20%7D%2C%0A%20%20%20%20%20%20%20%20%7D%2C%0A%20%20%20%20)%0A%0A%20%20%20%20reddit%0A%0A%23%20instantiate%20the%20DAG%0Aexample_modal_operator()%0A`,lang:`python`});var X=o(Y,4);u(o(e(X),2),{href:`https://github.com/astronomer/airflow-provider-sample`,rel:`nofollow`,children:(e,t)=>{s(),i(e,r(`Airflow provider package`))},$$slots:{default:!0}}),s(3),n(X);var Z=o(X,6);u(o(e(Z)),{href:`https://modal.com/docs/guide/gpu`,rel:`nofollow`,children:(e,t)=>{s(),i(e,r(`function decorator`))},$$slots:{default:!0}}),s(),n(Z);var Q=o(Z,4),$=o(e(Q));u($,{href:`mailto:support@modal.com`,children:(e,t)=>{s(),i(e,r(`support@modal.com`))},$$slots:{default:!0}}),u(o($,2),{href:`https://www.astronomer.io/contact/`,rel:`nofollow`,children:(e,t)=>{s(),i(e,r(`Astronomer support`))},$$slots:{default:!0}}),s(),n(Q),i(t,a)},$$slots:{default:!0}}))}export{w as default,f as metadata};
//# sourceMappingURL=4QruLhVF.js.map
