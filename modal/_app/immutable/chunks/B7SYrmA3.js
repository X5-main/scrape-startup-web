(function(){try{var e=typeof window<`u`?window:typeof global<`u`?global:typeof globalThis<`u`?globalThis:typeof self<`u`?self:{};e.SENTRY_RELEASE={id:`f99fcf9f0a844cc9bd13fdc8e5782b84`};var t=new e.Error().stack;t&&(e._sentryDebugIds=e._sentryDebugIds||{},e._sentryDebugIds[t]=`0437dc2d-47f6-4d7e-9cca-7b764fb2f6fd`,e._sentryDebugIdIdentifier=`sentry-dbid-0437dc2d-47f6-4d7e-9cca-7b764fb2f6fd`)}catch{}})();import{$t as e,St as t,Tn as n,Tt as r,bt as i,c as a,d as o,en as s,tn as c,wn as l}from"./F_ixKBiO.js";import"./B1sc9Zdx.js";import"./Bb2deiU3.js";import{a as u,o as d}from"./CPby7b1n.js";import{t as f}from"./BILrvr3I.js";import{t as p}from"./B4L_if842.js";import{t as m}from"./DeWGVqas2.js";var h={toc:[{depth:1,value:`Build a coding agent with Modal Sandboxes and LangGraph`,id:`build-a-coding-agent-with-modal-sandboxes-and-langgraph`,children:[{depth:2,value:`Setup`,id:`setup`},{depth:2,value:`Creating a Sandbox`,id:`creating-a-sandbox`},{depth:2,value:`Constructing the agent’s graph`,id:`constructing-the-agents-graph`},{depth:2,value:`Running the Graph`,id:`running-the-graph`}]}],rawContent:`# Build a coding agent with Modal Sandboxes and LangGraph

This example demonstrates how to build an LLM coding "agent" that can generate and execute Python code, using
documentation from the web to inform its approach.

Naturally, we use the agent to generate code that runs language models.

The agent is built with [LangGraph](https://github.com/langchain-ai/langgraph), a library for building
directed graphs of computation popular with AI agent developers,
and uses models from the OpenAI API.

## Setup

\`\`\`python
import modal

from .src import edges, nodes, retrieval
from .src.common import COLOR, PYTHON_VERSION, image

\`\`\`

You will need two [Modal Secrets](https://modal.com/docs/guide/secrets) to run this example:
one to access the OpenAI API and another to access the LangSmith API for logging the agent's behavior.

To create them, head to the [Secrets dashboard](https://modal.com/secrets), select "Create new secret",
and use the provided templates for OpenAI and LangSmith.

\`\`\`python
app = modal.App(
    "example-agent",
    image=image,
    secrets=[
        modal.Secret.from_name("openai-secret", required_keys=["OPENAI_API_KEY"]),
        modal.Secret.from_name("langsmith-secret", required_keys=["LANGCHAIN_API_KEY"]),
    ],
)

\`\`\`

## Creating a Sandbox

We execute the agent's code in a Modal [Sandbox](https://modal.com/docs/guide/sandbox), which allows us to
run arbitrary code in a safe environment. In this example, we will use the [\`transformers\`](https://huggingface.co/docs/transformers/index)
library to generate text with a pre-trained model. Let's create a Sandbox with the necessary dependencies.

\`\`\`python
def create_sandbox(app) -> modal.Sandbox:
    # Change this image (and the retrieval logic in the retrieval module)
    # if you want the agent to give coding advice on other libraries!
    agent_image = modal.Image.debian_slim(python_version=PYTHON_VERSION).uv_pip_install(
        "torch==2.5.0",
        "transformers==4.46.0",
    )

    return modal.Sandbox.create(
        image=agent_image,
        timeout=60 * 10,  # 10 minutes
        app=app,
        # Modal sandboxes support GPUs!
        gpu="T4",
        # you can also pass secrets here -- note that the main app's secrets are not shared
    )


\`\`\`

We also need a way to run our code in the sandbox. For this, we'll write a simple wrapper
around the Modal Sandbox \`exec\` method. We use \`exec\` because it allows us to run code without spinning up a
new container. And we can reuse the same container for multiple runs, preserving state.

\`\`\`python
def run(code: str, sb: modal.Sandbox) -> tuple[str, str]:
    print(
        f"{COLOR['HEADER']}📦: Running in sandbox{COLOR['ENDC']}",
        f"{COLOR['GREEN']}{code}{COLOR['ENDC']}",
        sep="\\n",
    )

    exc = sb.exec("python", "-c", code)
    exc.wait()

    stdout = exc.stdout.read()
    stderr = exc.stderr.read()

    if exc.returncode != 0:
        print(
            f"{COLOR['HEADER']}📦: Failed with exitcode {sb.returncode}{COLOR['ENDC']}"
        )

    return stdout, stderr


\`\`\`

## Constructing the agent's graph

Now that we have the sandbox to execute code in, we can construct our agent's graph. Our graph is
defined in the \`edges\` and \`nodes\` modules
[associated with this example](https://github.com/modal-labs/modal-examples/tree/main/13_sandboxes/codelangchain).
Nodes are actions that change the state. Edges are transitions between nodes.

The idea is simple: we start at the node \`generate\`, which invokes the LLM to generate code based off documentation.
The generated code is executed (in the sandbox) as part of an edge called \`check_code_execution\`
and then the outputs are passed to the LLM for evaluation (the \`evaluate_execution\` node).
If the LLM determines that the code has executed correctly -- which might mean that the code raised an exception! --
we pass along the \`decide_to_finish\` edge and finish.

\`\`\`python
def construct_graph(sandbox: modal.Sandbox, debug: bool = False):
    from langgraph.graph import StateGraph

    from .src.common import GraphState

    # Crawl the transformers documentation to inform our code generation
    context = retrieval.retrieve_docs(debug=debug)

    graph = StateGraph(GraphState)

    # Attach our nodes to the graph
    graph_nodes = nodes.Nodes(context, sandbox, run, debug=debug)
    for key, value in graph_nodes.node_map.items():
        graph.add_node(key, value)

    # Construct the graph by adding edges
    graph = edges.enrich(graph)

    # Set the starting and ending nodes of the graph
    graph.set_entry_point(key="generate")
    graph.set_finish_point(key="finish")

    return graph


\`\`\`

We now set up the graph and compile it. See the \`src\` module for details
on the content of the graph and the nodes we've defined.

\`\`\`python
DEFAULT_QUESTION = "How do I generate Python code using a pre-trained model from the transformers library?"


@app.function()
def go(
    question: str = DEFAULT_QUESTION,
    debug: bool = False,
):
    """Compiles the Python code generation agent graph and runs it, returning the result."""
    sb = create_sandbox(app)

    graph = construct_graph(sb, debug=debug)
    runnable = graph.compile()
    result = runnable.invoke(
        {"keys": {"question": question, "iterations": 0}},
        config={"recursion_limit": 50},
    )

    sb.terminate()

    return result["keys"]["response"]


\`\`\`

## Running the Graph

Now let's call the agent from the command line!

We define a \`local_entrypoint\` that runs locally and triggers execution on Modal.

You can invoke it by executing following command from a folder that contains the \`codelangchain\` directory
[from our examples repo](https://github.com/modal-labs/modal-examples/tree/main/13_sandboxes/codelangchain):

\`\`\`bash
modal run -m codelangchain.agent --question "How do I run a pre-trained model from the transformers library?"
\`\`\`

\`\`\`python
@app.local_entrypoint()
def main(
    question: str = DEFAULT_QUESTION,
    debug: bool = False,
):
    """Sends a question to the Python code generation agent.

    Switch to debug mode for shorter context and smaller model."""
    if debug:
        if question == DEFAULT_QUESTION:
            question = "hi there, how are you?"

    print(go.remote(question, debug=debug))


\`\`\`

If things are working properly, you should see output like the following:

\`\`\`bash
$ modal run -m codelangchain.agent --question "generate some cool output with transformers"
---DECISION: FINISH---
---FINISHING---
To generate some cool output using transformers, we can use a pre-trained language model from the Hugging Face Transformers library. In this example, we'll use the GPT-2 model to generate text based on a given prompt. The GPT-2 model is a popular choice for text generation tasks due to its ability to produce coherent and contextually relevant text. We'll use the pipeline API from the Transformers library, which simplifies the process of using pre-trained models for various tasks, including text generation.

from transformers import pipeline
# Initialize the text generation pipeline with the GPT-2 model
generator = pipeline('text-generation', model='gpt2')

# Define a prompt for the model to generate text from
prompt = "Once upon a time in a land far, far away"

# Generate text using the model
output = generator(prompt, max_length=50, num_return_sequences=1)

# Print the generated text
print(output[0]['generated_text'])

Result of code execution:
Once upon a time in a land far, far away, and still inhabited even after all the human race, there would be one God: a perfect universal God who has always been and will ever be worshipped. All His acts and deeds are immutable,
\`\`\`
`,meta:{title:`Build a coding agent with Modal Sandboxes and LangGraph`,description:`This example demonstrates how to build an LLM coding “agent” that can generate and execute Python code, using documentation from the web to inform its approach.`}},{toc:g,rawContent:_,meta:v}=h,y=t(`<code>transformers</code>`),b=t(`<!> <p>This example demonstrates how to build an LLM coding “agent” that can generate and execute Python code, using
documentation from the web to inform its approach.</p> <p>Naturally, we use the agent to generate code that runs language models.</p> <p>The agent is built with <!>, a library for building
directed graphs of computation popular with AI agent developers,
and uses models from the OpenAI API.</p> <!> <!> <p>You will need two <!> to run this example:
one to access the OpenAI API and another to access the LangSmith API for logging the agent’s behavior.</p> <p>To create them, head to the <!>, select “Create new secret”,
and use the provided templates for OpenAI and LangSmith.</p> <!> <!> <p>We execute the agent’s code in a Modal <!>, which allows us to
run arbitrary code in a safe environment. In this example, we will use the <!> library to generate text with a pre-trained model. Let’s create a Sandbox with the necessary dependencies.</p> <!> <p>We also need a way to run our code in the sandbox. For this, we’ll write a simple wrapper
around the Modal Sandbox <code>exec</code> method. We use <code>exec</code> because it allows us to run code without spinning up a
new container. And we can reuse the same container for multiple runs, preserving state.</p> <!> <!> <p>Now that we have the sandbox to execute code in, we can construct our agent’s graph. Our graph is
defined in the <code>edges</code> and <code>nodes</code> modules <!>.
Nodes are actions that change the state. Edges are transitions between nodes.</p> <p>The idea is simple: we start at the node <code>generate</code>, which invokes the LLM to generate code based off documentation.
The generated code is executed (in the sandbox) as part of an edge called <code>check_code_execution</code> and then the outputs are passed to the LLM for evaluation (the <code>evaluate_execution</code> node).
If the LLM determines that the code has executed correctly — which might mean that the code raised an exception! —
we pass along the <code>decide_to_finish</code> edge and finish.</p> <!> <p>We now set up the graph and compile it. See the <code>src</code> module for details
on the content of the graph and the nodes we’ve defined.</p> <!> <!> <p>Now let’s call the agent from the command line!</p> <p>We define a <code>local_entrypoint</code> that runs locally and triggers execution on Modal.</p> <p>You can invoke it by executing following command from a folder that contains the <code>codelangchain</code> directory <!>:</p> <!> <!> <p>If things are working properly, you should see output like the following:</p> <!>`,1);function x(t,g){let _=a(g,[`children`,`$$slots`,`$$events`,`$$legacy`]);p(t,o(()=>_,()=>h,{children:(t,a)=>{var o=b(),p=s(o);d(p,{id:`build-a-coding-agent-with-modal-sandboxes-and-langgraph`,children:(e,t)=>{l(),i(e,r(`Build a coding agent with Modal Sandboxes and LangGraph`))},$$slots:{default:!0}});var h=c(p,6);m(c(e(h)),{href:`https://github.com/langchain-ai/langgraph`,rel:`nofollow`,children:(e,t)=>{l(),i(e,r(`LangGraph`))},$$slots:{default:!0}}),l(),n(h);var g=c(h,2);u(g,{id:`setup`,children:(e,t)=>{l(),i(e,r(`Setup`))},$$slots:{default:!0}});var _=c(g,2);f(_,{code:`import%20modal%0A%0Afrom%20.src%20import%20edges%2C%20nodes%2C%20retrieval%0Afrom%20.src.common%20import%20COLOR%2C%20PYTHON_VERSION%2C%20image%0A`,lang:`python`});var v=c(_,2);m(c(e(v)),{href:`https://modal.com/docs/guide/secrets`,rel:`nofollow`,children:(e,t)=>{l(),i(e,r(`Modal Secrets`))},$$slots:{default:!0}}),l(),n(v);var x=c(v,2);m(c(e(x)),{href:`https://modal.com/secrets`,rel:`nofollow`,children:(e,t)=>{l(),i(e,r(`Secrets dashboard`))},$$slots:{default:!0}}),l(),n(x);var S=c(x,2);f(S,{code:`app%20%3D%20modal.App(%0A%20%20%20%20%22example-agent%22%2C%0A%20%20%20%20image%3Dimage%2C%0A%20%20%20%20secrets%3D%5B%0A%20%20%20%20%20%20%20%20modal.Secret.from_name(%22openai-secret%22%2C%20required_keys%3D%5B%22OPENAI_API_KEY%22%5D)%2C%0A%20%20%20%20%20%20%20%20modal.Secret.from_name(%22langsmith-secret%22%2C%20required_keys%3D%5B%22LANGCHAIN_API_KEY%22%5D)%2C%0A%20%20%20%20%5D%2C%0A)%0A`,lang:`python`});var C=c(S,2);u(C,{id:`creating-a-sandbox`,children:(e,t)=>{l(),i(e,r(`Creating a Sandbox`))},$$slots:{default:!0}});var w=c(C,2),T=c(e(w));m(T,{href:`https://modal.com/docs/guide/sandbox`,rel:`nofollow`,children:(e,t)=>{l(),i(e,r(`Sandbox`))},$$slots:{default:!0}}),m(c(T,2),{href:`https://huggingface.co/docs/transformers/index`,rel:`nofollow`,children:(e,t)=>{i(e,y())},$$slots:{default:!0}}),l(),n(w);var E=c(w,2);f(E,{code:`def%20create_sandbox(app)%20-%3E%20modal.Sandbox%3A%0A%20%20%20%20%23%20Change%20this%20image%20(and%20the%20retrieval%20logic%20in%20the%20retrieval%20module)%0A%20%20%20%20%23%20if%20you%20want%20the%20agent%20to%20give%20coding%20advice%20on%20other%20libraries!%0A%20%20%20%20agent_image%20%3D%20modal.Image.debian_slim(python_version%3DPYTHON_VERSION).uv_pip_install(%0A%20%20%20%20%20%20%20%20%22torch%3D%3D2.5.0%22%2C%0A%20%20%20%20%20%20%20%20%22transformers%3D%3D4.46.0%22%2C%0A%20%20%20%20)%0A%0A%20%20%20%20return%20modal.Sandbox.create(%0A%20%20%20%20%20%20%20%20image%3Dagent_image%2C%0A%20%20%20%20%20%20%20%20timeout%3D60%20*%2010%2C%20%20%23%2010%20minutes%0A%20%20%20%20%20%20%20%20app%3Dapp%2C%0A%20%20%20%20%20%20%20%20%23%20Modal%20sandboxes%20support%20GPUs!%0A%20%20%20%20%20%20%20%20gpu%3D%22T4%22%2C%0A%20%20%20%20%20%20%20%20%23%20you%20can%20also%20pass%20secrets%20here%20--%20note%20that%20the%20main%20app's%20secrets%20are%20not%20shared%0A%20%20%20%20)%0A%0A`,lang:`python`});var D=c(E,4);f(D,{code:`def%20run(code%3A%20str%2C%20sb%3A%20modal.Sandbox)%20-%3E%20tuple%5Bstr%2C%20str%5D%3A%0A%20%20%20%20print(%0A%20%20%20%20%20%20%20%20f%22%7BCOLOR%5B'HEADER'%5D%7D%F0%9F%93%A6%3A%20Running%20in%20sandbox%7BCOLOR%5B'ENDC'%5D%7D%22%2C%0A%20%20%20%20%20%20%20%20f%22%7BCOLOR%5B'GREEN'%5D%7D%7Bcode%7D%7BCOLOR%5B'ENDC'%5D%7D%22%2C%0A%20%20%20%20%20%20%20%20sep%3D%22%5Cn%22%2C%0A%20%20%20%20)%0A%0A%20%20%20%20exc%20%3D%20sb.exec(%22python%22%2C%20%22-c%22%2C%20code)%0A%20%20%20%20exc.wait()%0A%0A%20%20%20%20stdout%20%3D%20exc.stdout.read()%0A%20%20%20%20stderr%20%3D%20exc.stderr.read()%0A%0A%20%20%20%20if%20exc.returncode%20!%3D%200%3A%0A%20%20%20%20%20%20%20%20print(%0A%20%20%20%20%20%20%20%20%20%20%20%20f%22%7BCOLOR%5B'HEADER'%5D%7D%F0%9F%93%A6%3A%20Failed%20with%20exitcode%20%7Bsb.returncode%7D%7BCOLOR%5B'ENDC'%5D%7D%22%0A%20%20%20%20%20%20%20%20)%0A%0A%20%20%20%20return%20stdout%2C%20stderr%0A%0A`,lang:`python`});var O=c(D,2);u(O,{id:`constructing-the-agents-graph`,children:(e,t)=>{l(),i(e,r(`Constructing the agent’s graph`))},$$slots:{default:!0}});var k=c(O,2);m(c(e(k),5),{href:`https://github.com/modal-labs/modal-examples/tree/main/13_sandboxes/codelangchain`,rel:`nofollow`,children:(e,t)=>{l(),i(e,r(`associated with this example`))},$$slots:{default:!0}}),l(),n(k);var A=c(k,4);f(A,{code:`def%20construct_graph(sandbox%3A%20modal.Sandbox%2C%20debug%3A%20bool%20%3D%20False)%3A%0A%20%20%20%20from%20langgraph.graph%20import%20StateGraph%0A%0A%20%20%20%20from%20.src.common%20import%20GraphState%0A%0A%20%20%20%20%23%20Crawl%20the%20transformers%20documentation%20to%20inform%20our%20code%20generation%0A%20%20%20%20context%20%3D%20retrieval.retrieve_docs(debug%3Ddebug)%0A%0A%20%20%20%20graph%20%3D%20StateGraph(GraphState)%0A%0A%20%20%20%20%23%20Attach%20our%20nodes%20to%20the%20graph%0A%20%20%20%20graph_nodes%20%3D%20nodes.Nodes(context%2C%20sandbox%2C%20run%2C%20debug%3Ddebug)%0A%20%20%20%20for%20key%2C%20value%20in%20graph_nodes.node_map.items()%3A%0A%20%20%20%20%20%20%20%20graph.add_node(key%2C%20value)%0A%0A%20%20%20%20%23%20Construct%20the%20graph%20by%20adding%20edges%0A%20%20%20%20graph%20%3D%20edges.enrich(graph)%0A%0A%20%20%20%20%23%20Set%20the%20starting%20and%20ending%20nodes%20of%20the%20graph%0A%20%20%20%20graph.set_entry_point(key%3D%22generate%22)%0A%20%20%20%20graph.set_finish_point(key%3D%22finish%22)%0A%0A%20%20%20%20return%20graph%0A%0A`,lang:`python`});var j=c(A,4);f(j,{code:`DEFAULT_QUESTION%20%3D%20%22How%20do%20I%20generate%20Python%20code%20using%20a%20pre-trained%20model%20from%20the%20transformers%20library%3F%22%0A%0A%0A%40app.function()%0Adef%20go(%0A%20%20%20%20question%3A%20str%20%3D%20DEFAULT_QUESTION%2C%0A%20%20%20%20debug%3A%20bool%20%3D%20False%2C%0A)%3A%0A%20%20%20%20%22%22%22Compiles%20the%20Python%20code%20generation%20agent%20graph%20and%20runs%20it%2C%20returning%20the%20result.%22%22%22%0A%20%20%20%20sb%20%3D%20create_sandbox(app)%0A%0A%20%20%20%20graph%20%3D%20construct_graph(sb%2C%20debug%3Ddebug)%0A%20%20%20%20runnable%20%3D%20graph.compile()%0A%20%20%20%20result%20%3D%20runnable.invoke(%0A%20%20%20%20%20%20%20%20%7B%22keys%22%3A%20%7B%22question%22%3A%20question%2C%20%22iterations%22%3A%200%7D%7D%2C%0A%20%20%20%20%20%20%20%20config%3D%7B%22recursion_limit%22%3A%2050%7D%2C%0A%20%20%20%20)%0A%0A%20%20%20%20sb.terminate()%0A%0A%20%20%20%20return%20result%5B%22keys%22%5D%5B%22response%22%5D%0A%0A`,lang:`python`});var M=c(j,2);u(M,{id:`running-the-graph`,children:(e,t)=>{l(),i(e,r(`Running the Graph`))},$$slots:{default:!0}});var N=c(M,6);m(c(e(N),3),{href:`https://github.com/modal-labs/modal-examples/tree/main/13_sandboxes/codelangchain`,rel:`nofollow`,children:(e,t)=>{l(),i(e,r(`from our examples repo`))},$$slots:{default:!0}}),l(),n(N);var P=c(N,2);f(P,{code:`modal%20run%20-m%20codelangchain.agent%20--question%20%22How%20do%20I%20run%20a%20pre-trained%20model%20from%20the%20transformers%20library%3F%22`,lang:`bash`});var F=c(P,2);f(F,{code:`%40app.local_entrypoint()%0Adef%20main(%0A%20%20%20%20question%3A%20str%20%3D%20DEFAULT_QUESTION%2C%0A%20%20%20%20debug%3A%20bool%20%3D%20False%2C%0A)%3A%0A%20%20%20%20%22%22%22Sends%20a%20question%20to%20the%20Python%20code%20generation%20agent.%0A%0A%20%20%20%20Switch%20to%20debug%20mode%20for%20shorter%20context%20and%20smaller%20model.%22%22%22%0A%20%20%20%20if%20debug%3A%0A%20%20%20%20%20%20%20%20if%20question%20%3D%3D%20DEFAULT_QUESTION%3A%0A%20%20%20%20%20%20%20%20%20%20%20%20question%20%3D%20%22hi%20there%2C%20how%20are%20you%3F%22%0A%0A%20%20%20%20print(go.remote(question%2C%20debug%3Ddebug))%0A%0A`,lang:`python`}),f(c(F,4),{code:`%24%20modal%20run%20-m%20codelangchain.agent%20--question%20%22generate%20some%20cool%20output%20with%20transformers%22%0A---DECISION%3A%20FINISH---%0A---FINISHING---%0ATo%20generate%20some%20cool%20output%20using%20transformers%2C%20we%20can%20use%20a%20pre-trained%20language%20model%20from%20the%20Hugging%20Face%20Transformers%20library.%20In%20this%20example%2C%20we'll%20use%20the%20GPT-2%20model%20to%20generate%20text%20based%20on%20a%20given%20prompt.%20The%20GPT-2%20model%20is%20a%20popular%20choice%20for%20text%20generation%20tasks%20due%20to%20its%20ability%20to%20produce%20coherent%20and%20contextually%20relevant%20text.%20We'll%20use%20the%20pipeline%20API%20from%20the%20Transformers%20library%2C%20which%20simplifies%20the%20process%20of%20using%20pre-trained%20models%20for%20various%20tasks%2C%20including%20text%20generation.%0A%0Afrom%20transformers%20import%20pipeline%0A%23%20Initialize%20the%20text%20generation%20pipeline%20with%20the%20GPT-2%20model%0Agenerator%20%3D%20pipeline('text-generation'%2C%20model%3D'gpt2')%0A%0A%23%20Define%20a%20prompt%20for%20the%20model%20to%20generate%20text%20from%0Aprompt%20%3D%20%22Once%20upon%20a%20time%20in%20a%20land%20far%2C%20far%20away%22%0A%0A%23%20Generate%20text%20using%20the%20model%0Aoutput%20%3D%20generator(prompt%2C%20max_length%3D50%2C%20num_return_sequences%3D1)%0A%0A%23%20Print%20the%20generated%20text%0Aprint(output%5B0%5D%5B'generated_text'%5D)%0A%0AResult%20of%20code%20execution%3A%0AOnce%20upon%20a%20time%20in%20a%20land%20far%2C%20far%20away%2C%20and%20still%20inhabited%20even%20after%20all%20the%20human%20race%2C%20there%20would%20be%20one%20God%3A%20a%20perfect%20universal%20God%20who%20has%20always%20been%20and%20will%20ever%20be%20worshipped.%20All%20His%20acts%20and%20deeds%20are%20immutable%2C`,lang:`bash`}),i(t,o)},$$slots:{default:!0}}))}export{x as default,h as metadata};
//# sourceMappingURL=B7SYrmA3.js.map
