(function(){try{var e=typeof window<`u`?window:typeof global<`u`?global:typeof globalThis<`u`?globalThis:typeof self<`u`?self:{};e.SENTRY_RELEASE={id:`f99fcf9f0a844cc9bd13fdc8e5782b84`};var t=new e.Error().stack;t&&(e._sentryDebugIds=e._sentryDebugIds||{},e._sentryDebugIds[t]=`604b0130-6cac-4feb-b87c-2d80e7454e6f`,e._sentryDebugIdIdentifier=`sentry-dbid-604b0130-6cac-4feb-b87c-2d80e7454e6f`)}catch{}})();import{$t as e,St as t,Tn as n,Tt as r,bt as i,c as ee,d as a,en as te,tn as o,wn as s}from"./F_ixKBiO.js";import"./B1sc9Zdx.js";import"./Bb2deiU3.js";import{a as c,i as l,o as ne}from"./CPby7b1n.js";import{t as u}from"./JPsrybyr.js";import{t as d}from"./BILrvr3I.js";import{t as f}from"./B4L_if842.js";import{t as p}from"./DeWGVqas2.js";import{t as re}from"./CYNta9DH.js";var ie=`/_app/immutable/assets/shakespeare.Cu7OiGC9.jpg`,ae=`/_app/immutable/assets/gradio.1X4m84IP.png`,m={toc:[{depth:1,value:`Train an SLM from scratch with early-stopping grid search over hyperparameters`,id:`train-an-slm-from-scratch-with-early-stopping-grid-search-over-hyperparameters`,children:[{depth:2,value:`Basic Setup`,id:`basic-setup`,children:[{depth:3,value:`Create a Volume to store data, weights, and logs`,id:`create-a-volume-to-store-data-weights-and-logs`},{depth:3,value:`Define dependencies in container images`,id:`define-dependencies-in-container-images`}]},{depth:2,value:`Running SLM training on Modal`,id:`running-slm-training-on-modal`},{depth:2,value:`Launch a hyperparameter sweep from a local_entrypoint`,id:`launch-a-hyperparameter-sweep-from-a-local_entrypoint`,children:[{depth:3,value:`Monitor experiments with TensorBoard`,id:`monitor-experiments-with-tensorboard`}]},{depth:2,value:`Serving SLMs on Modal during and after training`,id:`serving-slms-on-modal-during-and-after-training`,children:[{depth:3,value:`Remote inference with Modal Clses`,id:`remote-inference-with-modal-clses`},{depth:3,value:`Adding a simple Web Function`,id:`adding-a-simple-web-function`},{depth:3,value:`Serving a Gradio UI with asgi_app`,id:`serving-a-gradio-ui-with-asgi_app`}]},{depth:2,value:`Addenda`,id:`addenda`,children:[{depth:3,value:`Training Loop`,id:`training-loop`},{depth:3,value:`Miscellaneous`,id:`miscellaneous`}]}]}],rawContent:`# Train an SLM from scratch with early-stopping grid search over hyperparameters

![Split-Panel Image. Left: AI generated picture of Shakespeare. Right: SLM generated text](./shakespeare.jpg)

When you want a language model that performs well on your task, there are three options,
ordered by the degree of customization:

- [**Prompt Engineering**](https://en.wikipedia.org/wiki/Prompt_engineering):
large and capable language models understand tasks in natural language, so you can
carefully design a natural language "prompt" to elicit the desired behavior.

- [**Fine-Tuning**](https://modal.com/docs/examples/llm-finetuning):
those same language models were trained by gradient descent on data sets representing tasks,
and they can be further trained by gradient descent on data sets representative of your task.

- **Training from Scratch**:
if you have enough data for your task, you can throw the pretrained model away and make your own.

Each step adds additional engineering complexity, but also leads to a superior cost-performance Pareto frontier
for your tasks. Fine-tuned models at one-tenth the size regularly outperform more generic models,
and models trained from scratch outperform them.

Because these models are so much smaller than the Large Language Models that power generic
assistant chatbots like ChatGPT and Claude, they are often called _Small Language Models_ (SLMs).

In this example, we will explore training an SLM from scratch on Modal.

In fact, we'll train 8 SLMs in parallel with different hyperparameters
and then select the best one for additional training.

We'll monitor this training live and serve our training and trained models
as Web Functions and simple browser UIs.

Along the way we'll use many features of the Modal platform:
[distributed Volumes](https://modal.com/docs/guide/volumes),
multiple [Web Functions](https://modal.com/docs/guide/webhooks),
and [parallel container execution](https://modal.com/docs/guide/scale#parallel-execution-of-inputs).

Together, these features give every machine learning and AI team
the same infrastructural capabilities that the most sophisticated companies
have in their internal platforms.

## Basic Setup

\`\`\`python
import logging as L
import urllib.request
from dataclasses import dataclass
from pathlib import Path, PosixPath
from typing import Optional

import modal
from pydantic import BaseModel

MINUTES = 60  # seconds
HOURS = 60 * MINUTES

app_name = "example-hp-sweep-gpt"
app = modal.App(app_name)

\`\`\`

We'll use A10G GPUs for training, which are able to train the model to recognizably improved performance
in ~15 minutes while keeping costs under ~$1.

\`\`\`python
gpu = "A10G"

\`\`\`

### Create a Volume to store data, weights, and logs

Since we'll be coordinating training across multiple machines we'll use a
distributed [Volume](https://modal.com/docs/guide/volumes)
to store the data, checkpointed models, and TensorBoard logs.

\`\`\`python
volume = modal.Volume.from_name("example-hp-sweep-gpt-volume", create_if_missing=True)
volume_path = PosixPath("/vol/data")
model_filename = "nano_gpt_model.pt"
best_model_filename = "best_nano_gpt_model.pt"
tb_log_path = volume_path / "tb_logs"
model_save_path = volume_path / "models"

\`\`\`

### Define dependencies in container images

The container image for training  is based on Modal's default slim Debian Linux image with \`torch\`
for defining and running our neural network and \`tensorboard\` for monitoring training.

\`\`\`python
base_image = modal.Image.debian_slim(python_version="3.11").uv_pip_install(
    "pydantic==2.9.1"
)

torch_image = base_image.uv_pip_install(
    "torch==2.1.2",
    "tensorboard==2.17.1",
    "numpy<2",
)

\`\`\`

We also have some local dependencies that we'll need to import into the remote environment.
We add them into the remote container.

\`\`\`python
torch_image = torch_image.add_local_dir(
    Path(__file__).parent / "src", remote_path="/root/src"
)

\`\`\`

We'll serve a simple Web Function:

\`\`\`python
web_image = base_image.uv_pip_install("fastapi[standard]==0.115.4", "starlette==0.41.2")

\`\`\`

And we'll deploy a web UI for interacting with our trained models using Gradio.

\`\`\`python
assets_path = Path(__file__).parent / "assets"
ui_image = web_image.uv_pip_install("gradio~=4.44.0").add_local_dir(
    assets_path, remote_path="/assets"
)


\`\`\`

We can also "pre-import" libraries that will be used by the functions we run on Modal in a given image
using the \`with image.imports\` context manager.

\`\`\`python
with torch_image.imports():
    import glob
    import os
    from timeit import default_timer as timer

    import tensorboard
    import torch
    from src.dataset import Dataset
    from src.logs_manager import LogsManager
    from src.model import AttentionModel
    from src.tokenizer import Tokenizer

\`\`\`

## Running SLM training on Modal

Here we define the training function, wrapping it in a decorator
that specifies the infrastructural parameters, like the container \`image\` we want to use,
which \`volume\` to mount where, the \`gpu\` we're using, and so on.

Training consists of specifying optimization parameters, loading the
\`dataset\`, building the \`model\`, setting up TensorBoard logging &
checkpointing, and then finally executing the \`training_loop\` itself.

\`\`\`python
@app.function(
    image=torch_image,
    volumes={volume_path: volume},
    gpu=gpu,
    timeout=1 * HOURS,
)
def train_model(
    node_rank,
    n_nodes,
    hparams,
    experiment_name,
    run_to_first_save=False,
    n_steps=3000,
    n_steps_before_eval=None,
    n_steps_before_checkpoint=None,
):
    # optimizer, data, and model prep
    batch_size = 64
    learning_rate = 3e-4

    n_eval_steps = 100
    if n_steps_before_eval is None:
        n_steps_before_eval = int(n_steps / 8)  # eval eight times per run
    if n_steps_before_checkpoint is None:
        n_steps_before_checkpoint = int(n_steps / 4)  # save four times per run

    train_percent = 0.9

    L.basicConfig(
        level=L.INFO,
        format=f"\\033[0;32m%(asctime)s %(levelname)s [%(filename)s.%(funcName)s:%(lineno)d] [Node {node_rank + 1}] %(message)s\\033[0m",
        datefmt="%b %d %H:%M:%S",
    )

    # use GPU if available
    device = "cuda" if torch.cuda.is_available() else "cpu"
    L.info("Remote Device: %s // GPU: %s", device, gpu)

    input_file_path = volume_path / "shakespeare_char.txt"
    text = prepare_data(input_file_path, volume)

    # construct tokenizer & dataset
    tokenizer = Tokenizer(text)
    dataset = Dataset(
        tokenizer.encode(text),
        train_percent,
        batch_size,
        hparams.context_size,
        device,
    )

    # build the model
    model = build_model(hparams, tokenizer.vocab_size, device)
    num_parameters = sum(p.numel() for p in model.parameters())
    L.info(f"Num parameters: {num_parameters}")

    optimizer = setup_optimizer(model, learning_rate)

    # TensorBoard logging & checkpointing prep
    logs_manager = LogsManager(experiment_name, hparams, num_parameters, tb_log_path)
    L.info(f"Model name: {logs_manager.model_name}")

    model_save_dir = model_save_path / experiment_name / logs_manager.model_name
    if model_save_dir.exists():
        L.info("Loading model from checkpoint...")
        checkpoint = torch.load(str(model_save_dir / model_filename))
        is_best_model = not run_to_first_save
        if is_best_model:
            make_best_symbolic_link(model_save_dir, model_filename, experiment_name)
        model.load_state_dict(checkpoint["model"])
        start_step = checkpoint["steps"] + 1
    else:
        model_save_dir.mkdir(parents=True, exist_ok=True)
        start_step = 0
        checkpoint = init_checkpoint(model, tokenizer, optimizer, start_step, hparams)

    checkpoint_path = model_save_dir / model_filename

    out = training_loop(
        start_step,
        n_steps,
        n_steps_before_eval,
        n_steps_before_checkpoint,
        n_eval_steps,
        dataset,
        tokenizer,
        model,
        optimizer,
        logs_manager,
        checkpoint,
        checkpoint_path,
        run_to_first_save,
    )

    return node_rank, float(out["val"]), hparams


\`\`\`

## Launch a hyperparameter sweep from a \`local_entrypoint\`

The main entry point coordinates the hyperparameter optimization.
First we specify the default hyperparameters for the model, taken from
[Andrej Karpathy's walkthrough](https://www.youtube.com/watch?v=kCc8FmEb1nY&t=5976s).
For better performance, you can increase the \`context_size\` and scale up the GPU accordingly.

\`\`\`python
@dataclass
class ModelHyperparameters:
    n_heads: int = 6
    n_embed: int = 384
    n_blocks: int = 6
    context_size: int = 256
    dropout: float = 0.2


\`\`\`

Next we define the local entrypoint: the code we run locally to coordinate training.

It will train 8 models in parallel across 8 containers, each
with different hyperparameters, varying the number of heads (\`n_heads\`), the
\`context_size\` (called the "block size" by Karpathy), and the dropout rate (\`dropout\`). To run in
parallel we need to use the [\`starmap\` method](https://modal.com/docs/guide/scale#parallel-execution-of-inputs).

We train all of the models until the first checkpoint and then stop early so we
can compare the validation losses.

Then we restart training for the best model and train it to completion.

You can kick off training with the following command:

\`\`\`bash
modal run 06_gpu_and_ml/hyperparameter-sweep/hp_sweep_gpt.py
\`\`\`

The output will look something like this:

\`\`\`
Sep 16 21:20:39 INFO [hp_sweep_gpt.py.train_model:127] [Node 1]  Remote Device: cuda // GPU: A10G
Sep 16 21:20:40 INFO [hp_sweep_gpt.py.train_model:149] [Node 1]  Num parameters: 10693697
Sep 16 21:20:40 INFO [hp_sweep_gpt.py.train_model:156] [Node 1]  Model Name: E2024-0916-142031.618259_context_size=8_n_heads=1_dropout=0.1
Sep 16 21:20:41 INFO [hp_sweep_gpt.py.train_model:225] [Node 1]      0) //  1.03s // Train Loss: 3.58 // Val Loss: 3.60
Sep 16 21:20:41 INFO [hp_sweep_gpt.py.train_model:127] [Node 2]  Remote Device: cuda // GPU: A10G
...
\`\`\`

The \`local_entrypoint\` code is below. Note that the arguments to it can also be passed via the command line.
Use \`--help\` for details.

\`\`\`python
@app.local_entrypoint()
def main(
    n_steps: int = 3000,
    n_steps_before_checkpoint: Optional[int] = None,
    n_steps_before_eval: Optional[int] = None,
):
    from datetime import datetime
    from itertools import product

    experiment_name = f"E{datetime.now().strftime('%Y-%m-%d-%H%M%S.%f')}"
    default_hparams = ModelHyperparameters()

    # build list of hyperparameters to train & validate
    nheads_options = (1, default_hparams.n_heads)
    context_size_options = (8, default_hparams.context_size)
    dropout_options = (0.1, default_hparams.dropout)

    hparams_list = [
        ModelHyperparameters(n_heads=h, context_size=c, dropout=d)
        for h, c, d in product(nheads_options, context_size_options, dropout_options)
    ]

    # run training for each hyperparameter setting
    results = []
    stop_early = True  # stop early so we can compare val losses
    print(f"Testing {len(hparams_list)} hyperparameter settings")
    n_nodes = len(hparams_list)
    static_params = (
        experiment_name,
        stop_early,
        n_steps,
        n_steps_before_eval,
        n_steps_before_checkpoint,
    )
    for result in train_model.starmap(
        [(i, n_nodes, h, *static_params) for i, h in enumerate(hparams_list)],
        order_outputs=False,
    ):
        # result = (node_rank, val_loss, hparams)
        node_rank = result[0]
        results.append(result)
        print(
            f"[Node {node_rank + 1}/{n_nodes}] Finished. Early stop val loss result: {result[1:]}"
        )

    # find the model and hparams with the lowest validation loss
    best_result = min(results, key=lambda x: x[1])
    print(f"Best early stop val loss result: {best_result}")
    best_hparams = best_result[-1]

    # finish training with best hparams
    node_rank = 0
    n_nodes = 1  # only one node for final training run
    train_model.remote(
        node_rank,
        n_nodes,
        best_hparams,
        experiment_name,
        not stop_early,
        n_steps,
        n_steps_before_eval,
        n_steps_before_checkpoint,
    )


\`\`\`

### Monitor experiments with TensorBoard

To monitor our training we will create a TensorBoard WSGI web app, which will
display the progress of our training across all 8 models. We'll use the latest
logs for the most recent experiment written to the Volume.

To ensure we have the latest data we add some
[WSGI Middleware](https://peps.python.org/pep-3333/)
that checks the Modal Volume for updates when the page is reloaded.

\`\`\`python
class VolumeMiddleware:
    def __init__(self, app):
        self.app = app

    def __call__(self, environ, start_response):
        if (route := environ.get("PATH_INFO")) in ["/", "/modal-volume-reload"]:
            try:
                volume.reload()
            except Exception as e:
                print("Exception while re-loading traces: ", e)
            if route == "/modal-volume-reload":
                environ["PATH_INFO"] = "/"  # redirect
        return self.app(environ, start_response)


\`\`\`

To ensure a unique color per experiment you can click the palette (🎨) icon
under TensorBoard > Time Series > Run and use the Regex:
\`E(\\d{4})-(\\d{2})-(\\d{2})-(\\d{6})\\.(\\d{6})\`

You can deploy this TensorBoard service by running

\`\`\`
modal deploy 06_gpu_and_ml/hyperparameter-sweep/hp_sweep_gpt.py
\`\`\`

and visit it at the URL that ends with \`-monitor-training.modal.run\`.

After training finishes, your TensorBoard UI will look something like this:

![8 lines on a graph, validation loss on y-axis, time step on x-axis. All lines go down over the first 1000 time steps, and one goes to 5000 time steps with a final loss of 1.52](./tensorboard.png)

You can also find some sample text generated by the model in the "Text" tab.

\`\`\`python
@app.function(
    image=torch_image,
    volumes={volume_path: volume},
)
@modal.concurrent(max_inputs=100)
@modal.wsgi_app()
def monitor_training():
    board = tensorboard.program.TensorBoard()
    board.configure(logdir=str(tb_log_path))
    (data_provider, deprecated_multiplexer) = board._make_data_provider()
    wsgi_app = tensorboard.backend.application.TensorBoardWSGIApp(
        board.flags,
        board.plugin_loaders,
        data_provider,
        board.assets_zip_provider,
        deprecated_multiplexer,
        experimental_middlewares=[VolumeMiddleware],
    )
    return wsgi_app


\`\`\`

Notice that there are 8 models training, and the one with the lowest
validation loss at step 600 continues training to 3000 steps.

## Serving SLMs on Modal during and after training

Because our weights are stored in a distributed Volume,
we can deploy an inference Function based off of them without any extra work --
and we can even check in on models while we're still training them! # For more on storing model weights on Modal, see
[this guide](https://modal.com/docs/guide/model-weights).

### Remote inference with Modal \`Cls\`es

We wrap our inference in a Modal \`Cls\` called \`ModelInference\`.
The user of \`ModelInference\` can control which model is used by providing the
\`experiment_name\`.  Each unique choice creates a separate
[auto-scaling deployment](https://modal.com/docs/guide/parameterized-functions).
If the user does not specify an \`experiment_name\`, the latest experiment
is used.

\`\`\`python
@app.cls(image=torch_image, volumes={volume_path: volume}, gpu=gpu)
class ModelInference:
    experiment_name: str = modal.parameter(default="")

    def get_latest_available_model_dirs(self, n_last):
        """Find the latest models that have a best model checkpoint saved."""
        save_model_dirs = glob.glob(f"{model_save_path}/*")
        sorted_model_dirs = sorted(save_model_dirs, key=os.path.getctime, reverse=True)

        valid_model_dirs = []
        for latest_model_dir in sorted_model_dirs:
            if Path(f"{latest_model_dir}/{best_model_filename}").exists():
                valid_model_dirs.append(Path(latest_model_dir))
            if len(valid_model_dirs) >= n_last:
                return valid_model_dirs
        return valid_model_dirs

    @modal.method()
    def get_latest_available_experiment_names(self, n_last):
        return [d.name for d in self.get_latest_available_model_dirs(n_last)]

    def load_model_impl(self):
        from .src.model import AttentionModel
        from .src.tokenizer import Tokenizer

        if self.experiment_name != "":  # user selected model
            use_model_dir = f"{model_save_path}/{self.experiment_name}"
        else:  # otherwise, pick latest
            try:
                use_model_dir = self.get_latest_available_model_dirs(1)[0]
            except IndexError:
                raise ValueError("No models available to load.")

        if self.use_model_dir == use_model_dir and self.is_fully_trained:
            return  # already loaded fully trained model.

        print(f"Loading experiment: {Path(use_model_dir).name}...")
        checkpoint = torch.load(f"{use_model_dir}/{best_model_filename}")

        self.use_model_dir = use_model_dir
        hparams = checkpoint["hparams"]
        key = (  # for backwards compatibility
            "unique_chars" if "unique_chars" in checkpoint else "chars"
        )
        unique_chars = checkpoint[key]
        steps = checkpoint["steps"]
        val_loss = checkpoint["val_loss"]
        self.is_fully_trained = checkpoint["finished_training"]

        print(
            f"Loaded model with {steps} train steps"
            f" and val loss of {val_loss:.2f}"
            f" (fully_trained={self.is_fully_trained})"
        )

        self.tokenizer = Tokenizer(unique_chars)
        self.device = "cuda" if torch.cuda.is_available() else "cpu"

        self.model = AttentionModel(self.tokenizer.vocab_size, hparams, self.device)
        self.model.load_state_dict(checkpoint["model"])
        self.model.to(self.device)

    @modal.enter()
    def load_model(self):
        self.use_model_dir = None
        self.is_fully_trained = False
        self.load_model_impl()

    @modal.method()
    def generate(self, prompt):
        self.load_model_impl()  # load updated model if available

        n_new_tokens = 1000
        return self.model.generate_from_text(self.tokenizer, prompt, n_new_tokens)


\`\`\`

### Adding a simple Web Function

The \`ModelInference\` class above is available for use
from any other Python environment with the right Modal credentials
and the \`modal\` package installed -- just use [\`lookup\`](https://modal.com/docs/reference/modal.Cls#lookup).

But we can also expose it as a Web Function for easy access
from anywhere, including other programming languages or the command line.

\`\`\`python
class GenerationRequest(BaseModel):
    prompt: str


@app.function(image=web_image)
@modal.fastapi_endpoint(method="POST", docs=True)
def web_generate(request: GenerationRequest):
    output = ModelInference().generate.remote(request.prompt)
    return {"output": output}


\`\`\`

This Function can be deployed on Modal with \`modal deploy\`.
That will allow us to generate text via a simple \`curl\` command like this:

\`\`\`bash
curl -X POST -H 'Content-Type: application/json' --data-binary '{"prompt": "\\n"}' https://your-workspace-name--modal-nano-gpt-web-generate.modal.run
\`\`\`

which will return something like:

\`\`\`json
{
"output":
   "BRUTUS:
    The broy trefore anny pleasory to
    wip me state of villoor so:
    Fortols listhey for brother beat the else
    Be all, ill of lo-love in igham;
    Ah, here all that queen and hould you father offer"
}
\`\`\`

It's not exactly Shakespeare, but at least it shows our model learned something!

You can choose which model to use by specifying the \`experiment_name\` in the query parameters of the request URL.

### Serving a Gradio UI with \`asgi_app\`

Second, we create a Gradio web app for generating text via a graphical user interface in the browser.
That way our fellow team members and stakeholders can easily interact with the model and give feedback,
even when we're still training the model.

You should see the URL for this UI in the output of \`modal deploy\`
or on your [Modal app dashboard](https://modal.com/apps) for this app.

The Gradio UI will look something like this:

![Image of Gradio Web App. Top shows model selection dropdown. Left side shows input prompt textbox. Right side shows SLM generated output. Bottom has button for starting generation process](./gradio.png)

\`\`\`python
@app.function(
    image=ui_image,
    max_containers=1,
    volumes={volume_path: volume},
)
@modal.concurrent(max_inputs=100)
@modal.asgi_app()
def ui():
    import gradio as gr
    from fastapi import FastAPI
    from fastapi.responses import FileResponse
    from gradio.routes import mount_gradio_app

    # call out to the inference in a separate Modal environment with a GPU
    def generate(text="", experiment_name=""):
        if not text:
            text = "\\n"
        generated = ModelInference(experiment_name=experiment_name).generate.remote(
            text
        )
        return text + generated

    example_prompts = [
        "DUKE OF YORK:\\nWhere art thou Lucas?",
        "ROMEO:\\nWhat is a man?",
        "CLARENCE:\\nFair is foul and foul is fair, but who are you?",
        "Brevity is the soul of wit, so what is the soul of foolishness?",
    ]

    web_app = FastAPI()

    # custom styles: an icon, a background, and a theme
    @web_app.get("/favicon.ico", include_in_schema=False)
    async def favicon():
        return FileResponse("/assets/favicon.svg")

    @web_app.get("/assets/background.svg", include_in_schema=False)
    async def background():
        return FileResponse("/assets/background.svg")

    with open("/assets/index.css") as f:
        css = f.read()

    n_last = 20
    experiment_names = ModelInference().get_latest_available_experiment_names.remote(
        n_last
    )
    theme = gr.themes.Default(
        primary_hue="green", secondary_hue="emerald", neutral_hue="neutral"
    )

    # add a Gradio UI around inference
    with gr.Blocks(theme=theme, css=css, title="SLM") as interface:
        # title
        gr.Markdown("# GPT-style Shakespeare text generation.")

        # Model Selection
        with gr.Row():
            gr.Markdown("## Model Version")
        with gr.Row():
            experiment_dropdown = gr.Dropdown(
                experiment_names, label="Select Model Version"
            )

        # input and output
        with gr.Row():
            with gr.Column():
                gr.Markdown("## Input:")
                input_box = gr.Textbox(  # input text component
                    label="",
                    placeholder="Write some Shakespeare like text or keep it empty!",
                    lines=10,
                )
            with gr.Column():
                gr.Markdown("## Output:")
                output_box = gr.Textbox(  # output text component
                    label="",
                    lines=10,
                )

        # button to trigger inference and a link to Modal
        with gr.Row():
            generate_button = gr.Button("Generate", variant="primary", scale=2)
            generate_button.click(
                fn=generate,
                inputs=[input_box, experiment_dropdown],
                outputs=output_box,
            )  # connect inputs and outputs with inference function

            gr.Button(  # shameless plug
                " Powered by Modal",
                variant="secondary",
                link="https://modal.com",
            )

        # example prompts
        with gr.Column(variant="compact"):
            # add in a few examples to inspire users
            for ii, prompt in enumerate(example_prompts):
                btn = gr.Button(prompt, variant="secondary")
                btn.click(fn=lambda idx=ii: example_prompts[idx], outputs=input_box)

    # mount for execution on Modal
    return mount_gradio_app(
        app=web_app,
        blocks=interface,
        path="/",
    )


\`\`\`

## Addenda

The remainder of this code is boilerplate.

### Training Loop

There's quite a lot of code for just the training loop! If you'd rather not write this stuff yourself,
consider a training framework like [PyTorch Lightning](https://lightning.ai/docs/pytorch/stable)
or [Hugging Face](https://huggingface.co/transformers/main_classes/trainer.html).

\`\`\`python
def training_loop(
    start_step,
    n_steps,
    n_steps_before_eval,
    n_steps_before_checkpoint,
    n_eval_steps,
    dataset,
    tokenizer,
    model,
    optimizer,
    logs_manager,
    checkpoint,
    checkpoint_path,
    run_to_first_save,
):
    @torch.no_grad()
    def eval_model(model, dataset, tokenizer, n_eval_steps):
        """Evaluate model on train and validation data."""
        out = {}
        model.eval()  # Turn off gradients
        for split in ("train", "val"):
            losses = torch.zeros(n_eval_steps)
            for k in range(n_eval_steps):
                xb, yb = dataset.get_batch(split)
                logits, loss = model.forward(xb, yb)
                losses[k] = loss
            out[split] = losses.mean()

        # Generate some output samples
        out["sample"] = model.generate_from_text(tokenizer, "\\n", 1000)

        model.train()  # Turn on gradients
        return out

    t_last = timer()
    for step in range(start_step, n_steps + 1):
        # sample a batch of data
        xb, yb = dataset.get_batch("train")

        # evaluate the loss, calculate & apply gradients
        logits, loss = model.forward(xb, yb)
        optimizer.zero_grad(set_to_none=True)
        loss.backward()
        optimizer.step()

        # log training loss
        logs_manager.add_train_scalar("Cross Entropy Loss", loss.item(), step)

        # evaluate model on validation set
        if step % n_steps_before_eval == 0:
            out = eval_model(model, dataset, tokenizer, n_eval_steps)
            log_evals(out, step, t_last, logs_manager)
            t_last = timer()

        # save model with checkpoint information
        if step > 0 and step % n_steps_before_checkpoint == 0:
            checkpoint["steps"] = step
            checkpoint["val_loss"] = out["val"]

            # mark as finished if we hit n steps.
            checkpoint["finished_training"] = step >= n_steps

            L.info(
                f"Saving checkpoint to {checkpoint_path}\\t {checkpoint['finished_training']})"
            )
            save_checkpoint(checkpoint, checkpoint_path)

            if run_to_first_save:
                L.info("Stopping early...")
                break
    return out


def save_checkpoint(checkpoint, checkpoint_path):
    torch.save(checkpoint, checkpoint_path)
    volume.commit()


def build_model(hparams, vocab_size, device):
    """Initialize the model and move it to the device."""
    model = AttentionModel(vocab_size, hparams, device)
    model.to(device)
    return model


def setup_optimizer(model, learning_rate):
    """Set up the optimizer for the model."""
    return torch.optim.AdamW(model.parameters(), lr=learning_rate)


\`\`\`

### Miscellaneous
The remaining code includes small helper functions for training the model.

\`\`\`python
def prepare_data(input_file_path: Path, volume: modal.Volume) -> str:
    """Download and read the dataset."""
    volume.reload()
    if not input_file_path.exists():
        L.info("Downloading Shakespeare dataset...")
        data_url = "https://raw.githubusercontent.com/karpathy/char-rnn/master/data/tinyshakespeare/input.txt"
        urllib.request.urlretrieve(data_url, input_file_path)
        volume.commit()
    return input_file_path.read_text()


def make_best_symbolic_link(model_save_dir, model_filename, experiment_name):
    # create symlink to the best model so it's easy to find for web serving
    os.symlink(
        str(model_save_dir / model_filename),
        str(model_save_path / experiment_name / best_model_filename),
    )
    volume.commit()  # commit the symlink


def init_checkpoint(model, tokenizer, optimizer, start_step, hparams):
    return {
        "model": model.state_dict(),
        "unique_chars": tokenizer.unique_chars,
        "optimizer": optimizer.state_dict(),
        "val_loss": float("inf"),
        "steps": start_step,
        "hparams": hparams,
        "finished_training": False,
    }


def log_evals(result, step, t_last, logs_manager):
    runtime_s = timer() - t_last
    L.info(
        f"{step:5d}) // {runtime_s:>5.2f}s // Train Loss: {result['train']:.2f} // Val Loss: {result['val']:.2f}"
    )
    logs_manager.add_val_scalar("Cross Entropy Loss", result["val"], step)
    logs_manager.add_val_text("Sample Output", result["sample"], step)
    logs_manager.flush()
    volume.commit()  # Make sure TensorBoard container will see it.

    return result

\`\`\`
`,meta:{title:`Train an SLM from scratch with early-stopping grid search over hyperparameters`,description:`When you want a language model that performs well on your task, there are three options, ordered by the degree of customization:`}},{toc:h,rawContent:g,meta:oe}=m,se=t(`<strong>Prompt Engineering</strong>`),ce=t(`<strong>Fine-Tuning</strong>`),le=t(`Launch a hyperparameter sweep from a <code>local_entrypoint</code>`,1),ue=t(`<code>starmap</code> method`,1),de=t(`Remote inference with Modal <code>Cls</code>es`,1),fe=t(`<code>lookup</code>`),pe=t(`Serving a Gradio UI with <code>asgi_app</code>`,1),me=t(`<!> <p><!></p> <p>When you want a language model that performs well on your task, there are three options,
ordered by the degree of customization:</p> <ul><li><p><!>:
large and capable language models understand tasks in natural language, so you can
carefully design a natural language “prompt” to elicit the desired behavior.</p></li> <li><p><!>:
those same language models were trained by gradient descent on data sets representing tasks,
and they can be further trained by gradient descent on data sets representative of your task.</p></li> <li><p><strong>Training from Scratch</strong>:
if you have enough data for your task, you can throw the pretrained model away and make your own.</p></li></ul> <p>Each step adds additional engineering complexity, but also leads to a superior cost-performance Pareto frontier
for your tasks. Fine-tuned models at one-tenth the size regularly outperform more generic models,
and models trained from scratch outperform them.</p> <p>Because these models are so much smaller than the Large Language Models that power generic
assistant chatbots like ChatGPT and Claude, they are often called <em>Small Language Models</em> (SLMs).</p> <p>In this example, we will explore training an SLM from scratch on Modal.</p> <p>In fact, we’ll train 8 SLMs in parallel with different hyperparameters
and then select the best one for additional training.</p> <p>We’ll monitor this training live and serve our training and trained models
as Web Functions and simple browser UIs.</p> <p>Along the way we’ll use many features of the Modal platform: <!>,
multiple <!>,
and <!>.</p> <p>Together, these features give every machine learning and AI team
the same infrastructural capabilities that the most sophisticated companies
have in their internal platforms.</p> <!> <!> <p>We’ll use A10G GPUs for training, which are able to train the model to recognizably improved performance
in ~15 minutes while keeping costs under ~$1.</p> <!> <!> <p>Since we’ll be coordinating training across multiple machines we’ll use a
distributed <!> to store the data, checkpointed models, and TensorBoard logs.</p> <!> <!> <p>The container image for training  is based on Modal’s default slim Debian Linux image with <code>torch</code> for defining and running our neural network and <code>tensorboard</code> for monitoring training.</p> <!> <p>We also have some local dependencies that we’ll need to import into the remote environment.
We add them into the remote container.</p> <!> <p>We’ll serve a simple Web Function:</p> <!> <p>And we’ll deploy a web UI for interacting with our trained models using Gradio.</p> <!> <p>We can also “pre-import” libraries that will be used by the functions we run on Modal in a given image
using the <code>with image.imports</code> context manager.</p> <!> <!> <p>Here we define the training function, wrapping it in a decorator
that specifies the infrastructural parameters, like the container <code>image</code> we want to use,
which <code>volume</code> to mount where, the <code>gpu</code> we’re using, and so on.</p> <p>Training consists of specifying optimization parameters, loading the <code>dataset</code>, building the <code>model</code>, setting up TensorBoard logging &
checkpointing, and then finally executing the <code>training_loop</code> itself.</p> <!> <!> <p>The main entry point coordinates the hyperparameter optimization.
First we specify the default hyperparameters for the model, taken from <!>.
For better performance, you can increase the <code>context_size</code> and scale up the GPU accordingly.</p> <!> <p>Next we define the local entrypoint: the code we run locally to coordinate training.</p> <p>It will train 8 models in parallel across 8 containers, each
with different hyperparameters, varying the number of heads (<code>n_heads</code>), the <code>context_size</code> (called the “block size” by Karpathy), and the dropout rate (<code>dropout</code>). To run in
parallel we need to use the <!>.</p> <p>We train all of the models until the first checkpoint and then stop early so we
can compare the validation losses.</p> <p>Then we restart training for the best model and train it to completion.</p> <p>You can kick off training with the following command:</p> <!> <p>The output will look something like this:</p> <!> <p>The <code>local_entrypoint</code> code is below. Note that the arguments to it can also be passed via the command line.
Use <code>--help</code> for details.</p> <!> <!> <p>To monitor our training we will create a TensorBoard WSGI web app, which will
display the progress of our training across all 8 models. We’ll use the latest
logs for the most recent experiment written to the Volume.</p> <p>To ensure we have the latest data we add some <!> that checks the Modal Volume for updates when the page is reloaded.</p> <!> <p>To ensure a unique color per experiment you can click the palette (🎨) icon
under TensorBoard > Time Series > Run and use the Regex: <code>E(\\d&#123;4&#125;)-(\\d&#123;2&#125;)-(\\d&#123;2&#125;)-(\\d&#123;6&#125;)\\.(\\d&#123;6&#125;)</code></p> <p>You can deploy this TensorBoard service by running</p> <!> <p>and visit it at the URL that ends with <code>-monitor-training.modal.run</code>.</p> <p>After training finishes, your TensorBoard UI will look something like this:</p> <p><!></p> <p>You can also find some sample text generated by the model in the “Text” tab.</p> <!> <p>Notice that there are 8 models training, and the one with the lowest
validation loss at step 600 continues training to 3000 steps.</p> <!> <p>Because our weights are stored in a distributed Volume,
we can deploy an inference Function based off of them without any extra work —
and we can even check in on models while we’re still training them! # For more on storing model weights on Modal, see <!>.</p> <!> <p>We wrap our inference in a Modal <code>Cls</code> called <code>ModelInference</code>.
The user of <code>ModelInference</code> can control which model is used by providing the <code>experiment_name</code>.  Each unique choice creates a separate <!>.
If the user does not specify an <code>experiment_name</code>, the latest experiment
is used.</p> <!> <!> <p>The <code>ModelInference</code> class above is available for use
from any other Python environment with the right Modal credentials
and the <code>modal</code> package installed — just use <!>.</p> <p>But we can also expose it as a Web Function for easy access
from anywhere, including other programming languages or the command line.</p> <!> <p>This Function can be deployed on Modal with <code>modal deploy</code>.
That will allow us to generate text via a simple <code>curl</code> command like this:</p> <!> <p>which will return something like:</p> <!> <p>It’s not exactly Shakespeare, but at least it shows our model learned something!</p> <p>You can choose which model to use by specifying the <code>experiment_name</code> in the query parameters of the request URL.</p> <!> <p>Second, we create a Gradio web app for generating text via a graphical user interface in the browser.
That way our fellow team members and stakeholders can easily interact with the model and give feedback,
even when we’re still training the model.</p> <p>You should see the URL for this UI in the output of <code>modal deploy</code> or on your <!> for this app.</p> <p>The Gradio UI will look something like this:</p> <p><!></p> <!> <!> <p>The remainder of this code is boilerplate.</p> <!> <p>There’s quite a lot of code for just the training loop! If you’d rather not write this stuff yourself,
consider a training framework like <!> or <!>.</p> <!> <!> <p>The remaining code includes small helper functions for training the model.</p> <!>`,1);function _(t,h){let g=ee(h,[`children`,`$$slots`,`$$events`,`$$legacy`]);f(t,a(()=>g,()=>m,{children:(t,ee)=>{var a=me(),f=te(a);ne(f,{id:`train-an-slm-from-scratch-with-early-stopping-grid-search-over-hyperparameters`,children:(e,t)=>{s(),i(e,r(`Train an SLM from scratch with early-stopping grid search over hyperparameters`))},$$slots:{default:!0}});var m=o(f,2);u(e(m),{get src(){return ie},alt:`Split-Panel Image. Left: AI generated picture of Shakespeare. Right: SLM generated text`}),n(m);var h=o(m,4),g=e(h),oe=e(g);p(e(oe),{href:`https://en.wikipedia.org/wiki/Prompt_engineering`,rel:`nofollow`,children:(e,t)=>{i(e,se())},$$slots:{default:!0}}),s(),n(oe),n(g);var _=o(g,2),v=e(_);p(e(v),{href:`https://modal.com/docs/examples/llm-finetuning`,rel:`nofollow`,children:(e,t)=>{i(e,ce())},$$slots:{default:!0}}),s(),n(v),n(_),s(2),n(h);var y=o(h,12),b=o(e(y));p(b,{href:`https://modal.com/docs/guide/volumes`,rel:`nofollow`,children:(e,t)=>{s(),i(e,r(`distributed Volumes`))},$$slots:{default:!0}});var x=o(b,2);p(x,{href:`https://modal.com/docs/guide/webhooks`,rel:`nofollow`,children:(e,t)=>{s(),i(e,r(`Web Functions`))},$$slots:{default:!0}}),p(o(x,2),{href:`https://modal.com/docs/guide/scale#parallel-execution-of-inputs`,rel:`nofollow`,children:(e,t)=>{s(),i(e,r(`parallel container execution`))},$$slots:{default:!0}}),s(),n(y);var S=o(y,4);c(S,{id:`basic-setup`,children:(e,t)=>{s(),i(e,r(`Basic Setup`))},$$slots:{default:!0}});var C=o(S,2);d(C,{code:`import%20logging%20as%20L%0Aimport%20urllib.request%0Afrom%20dataclasses%20import%20dataclass%0Afrom%20pathlib%20import%20Path%2C%20PosixPath%0Afrom%20typing%20import%20Optional%0A%0Aimport%20modal%0Afrom%20pydantic%20import%20BaseModel%0A%0AMINUTES%20%3D%2060%20%20%23%20seconds%0AHOURS%20%3D%2060%20*%20MINUTES%0A%0Aapp_name%20%3D%20%22example-hp-sweep-gpt%22%0Aapp%20%3D%20modal.App(app_name)%0A`,lang:`python`});var w=o(C,4);d(w,{code:`gpu%20%3D%20%22A10G%22%0A`,lang:`python`});var T=o(w,2);l(T,{id:`create-a-volume-to-store-data-weights-and-logs`,children:(e,t)=>{s(),i(e,r(`Create a Volume to store data, weights, and logs`))},$$slots:{default:!0}});var E=o(T,2);p(o(e(E)),{href:`https://modal.com/docs/guide/volumes`,rel:`nofollow`,children:(e,t)=>{s(),i(e,r(`Volume`))},$$slots:{default:!0}}),s(),n(E);var D=o(E,2);d(D,{code:`volume%20%3D%20modal.Volume.from_name(%22example-hp-sweep-gpt-volume%22%2C%20create_if_missing%3DTrue)%0Avolume_path%20%3D%20PosixPath(%22%2Fvol%2Fdata%22)%0Amodel_filename%20%3D%20%22nano_gpt_model.pt%22%0Abest_model_filename%20%3D%20%22best_nano_gpt_model.pt%22%0Atb_log_path%20%3D%20volume_path%20%2F%20%22tb_logs%22%0Amodel_save_path%20%3D%20volume_path%20%2F%20%22models%22%0A`,lang:`python`});var O=o(D,2);l(O,{id:`define-dependencies-in-container-images`,children:(e,t)=>{s(),i(e,r(`Define dependencies in container images`))},$$slots:{default:!0}});var k=o(O,4);d(k,{code:`base_image%20%3D%20modal.Image.debian_slim(python_version%3D%223.11%22).uv_pip_install(%0A%20%20%20%20%22pydantic%3D%3D2.9.1%22%0A)%0A%0Atorch_image%20%3D%20base_image.uv_pip_install(%0A%20%20%20%20%22torch%3D%3D2.1.2%22%2C%0A%20%20%20%20%22tensorboard%3D%3D2.17.1%22%2C%0A%20%20%20%20%22numpy%3C2%22%2C%0A)%0A`,lang:`python`});var A=o(k,4);d(A,{code:`torch_image%20%3D%20torch_image.add_local_dir(%0A%20%20%20%20Path(__file__).parent%20%2F%20%22src%22%2C%20remote_path%3D%22%2Froot%2Fsrc%22%0A)%0A`,lang:`python`});var j=o(A,4);d(j,{code:`web_image%20%3D%20base_image.uv_pip_install(%22fastapi%5Bstandard%5D%3D%3D0.115.4%22%2C%20%22starlette%3D%3D0.41.2%22)%0A`,lang:`python`});var M=o(j,4);d(M,{code:`assets_path%20%3D%20Path(__file__).parent%20%2F%20%22assets%22%0Aui_image%20%3D%20web_image.uv_pip_install(%22gradio~%3D4.44.0%22).add_local_dir(%0A%20%20%20%20assets_path%2C%20remote_path%3D%22%2Fassets%22%0A)%0A%0A`,lang:`python`});var N=o(M,4);d(N,{code:`with%20torch_image.imports()%3A%0A%20%20%20%20import%20glob%0A%20%20%20%20import%20os%0A%20%20%20%20from%20timeit%20import%20default_timer%20as%20timer%0A%0A%20%20%20%20import%20tensorboard%0A%20%20%20%20import%20torch%0A%20%20%20%20from%20src.dataset%20import%20Dataset%0A%20%20%20%20from%20src.logs_manager%20import%20LogsManager%0A%20%20%20%20from%20src.model%20import%20AttentionModel%0A%20%20%20%20from%20src.tokenizer%20import%20Tokenizer%0A`,lang:`python`});var P=o(N,2);c(P,{id:`running-slm-training-on-modal`,children:(e,t)=>{s(),i(e,r(`Running SLM training on Modal`))},$$slots:{default:!0}});var F=o(P,6);d(F,{code:`%40app.function(%0A%20%20%20%20image%3Dtorch_image%2C%0A%20%20%20%20volumes%3D%7Bvolume_path%3A%20volume%7D%2C%0A%20%20%20%20gpu%3Dgpu%2C%0A%20%20%20%20timeout%3D1%20*%20HOURS%2C%0A)%0Adef%20train_model(%0A%20%20%20%20node_rank%2C%0A%20%20%20%20n_nodes%2C%0A%20%20%20%20hparams%2C%0A%20%20%20%20experiment_name%2C%0A%20%20%20%20run_to_first_save%3DFalse%2C%0A%20%20%20%20n_steps%3D3000%2C%0A%20%20%20%20n_steps_before_eval%3DNone%2C%0A%20%20%20%20n_steps_before_checkpoint%3DNone%2C%0A)%3A%0A%20%20%20%20%23%20optimizer%2C%20data%2C%20and%20model%20prep%0A%20%20%20%20batch_size%20%3D%2064%0A%20%20%20%20learning_rate%20%3D%203e-4%0A%0A%20%20%20%20n_eval_steps%20%3D%20100%0A%20%20%20%20if%20n_steps_before_eval%20is%20None%3A%0A%20%20%20%20%20%20%20%20n_steps_before_eval%20%3D%20int(n_steps%20%2F%208)%20%20%23%20eval%20eight%20times%20per%20run%0A%20%20%20%20if%20n_steps_before_checkpoint%20is%20None%3A%0A%20%20%20%20%20%20%20%20n_steps_before_checkpoint%20%3D%20int(n_steps%20%2F%204)%20%20%23%20save%20four%20times%20per%20run%0A%0A%20%20%20%20train_percent%20%3D%200.9%0A%0A%20%20%20%20L.basicConfig(%0A%20%20%20%20%20%20%20%20level%3DL.INFO%2C%0A%20%20%20%20%20%20%20%20format%3Df%22%5C033%5B0%3B32m%25(asctime)s%20%25(levelname)s%20%5B%25(filename)s.%25(funcName)s%3A%25(lineno)d%5D%20%5BNode%20%7Bnode_rank%20%2B%201%7D%5D%20%25(message)s%5C033%5B0m%22%2C%0A%20%20%20%20%20%20%20%20datefmt%3D%22%25b%20%25d%20%25H%3A%25M%3A%25S%22%2C%0A%20%20%20%20)%0A%0A%20%20%20%20%23%20use%20GPU%20if%20available%0A%20%20%20%20device%20%3D%20%22cuda%22%20if%20torch.cuda.is_available()%20else%20%22cpu%22%0A%20%20%20%20L.info(%22Remote%20Device%3A%20%25s%20%2F%2F%20GPU%3A%20%25s%22%2C%20device%2C%20gpu)%0A%0A%20%20%20%20input_file_path%20%3D%20volume_path%20%2F%20%22shakespeare_char.txt%22%0A%20%20%20%20text%20%3D%20prepare_data(input_file_path%2C%20volume)%0A%0A%20%20%20%20%23%20construct%20tokenizer%20%26%20dataset%0A%20%20%20%20tokenizer%20%3D%20Tokenizer(text)%0A%20%20%20%20dataset%20%3D%20Dataset(%0A%20%20%20%20%20%20%20%20tokenizer.encode(text)%2C%0A%20%20%20%20%20%20%20%20train_percent%2C%0A%20%20%20%20%20%20%20%20batch_size%2C%0A%20%20%20%20%20%20%20%20hparams.context_size%2C%0A%20%20%20%20%20%20%20%20device%2C%0A%20%20%20%20)%0A%0A%20%20%20%20%23%20build%20the%20model%0A%20%20%20%20model%20%3D%20build_model(hparams%2C%20tokenizer.vocab_size%2C%20device)%0A%20%20%20%20num_parameters%20%3D%20sum(p.numel()%20for%20p%20in%20model.parameters())%0A%20%20%20%20L.info(f%22Num%20parameters%3A%20%7Bnum_parameters%7D%22)%0A%0A%20%20%20%20optimizer%20%3D%20setup_optimizer(model%2C%20learning_rate)%0A%0A%20%20%20%20%23%20TensorBoard%20logging%20%26%20checkpointing%20prep%0A%20%20%20%20logs_manager%20%3D%20LogsManager(experiment_name%2C%20hparams%2C%20num_parameters%2C%20tb_log_path)%0A%20%20%20%20L.info(f%22Model%20name%3A%20%7Blogs_manager.model_name%7D%22)%0A%0A%20%20%20%20model_save_dir%20%3D%20model_save_path%20%2F%20experiment_name%20%2F%20logs_manager.model_name%0A%20%20%20%20if%20model_save_dir.exists()%3A%0A%20%20%20%20%20%20%20%20L.info(%22Loading%20model%20from%20checkpoint...%22)%0A%20%20%20%20%20%20%20%20checkpoint%20%3D%20torch.load(str(model_save_dir%20%2F%20model_filename))%0A%20%20%20%20%20%20%20%20is_best_model%20%3D%20not%20run_to_first_save%0A%20%20%20%20%20%20%20%20if%20is_best_model%3A%0A%20%20%20%20%20%20%20%20%20%20%20%20make_best_symbolic_link(model_save_dir%2C%20model_filename%2C%20experiment_name)%0A%20%20%20%20%20%20%20%20model.load_state_dict(checkpoint%5B%22model%22%5D)%0A%20%20%20%20%20%20%20%20start_step%20%3D%20checkpoint%5B%22steps%22%5D%20%2B%201%0A%20%20%20%20else%3A%0A%20%20%20%20%20%20%20%20model_save_dir.mkdir(parents%3DTrue%2C%20exist_ok%3DTrue)%0A%20%20%20%20%20%20%20%20start_step%20%3D%200%0A%20%20%20%20%20%20%20%20checkpoint%20%3D%20init_checkpoint(model%2C%20tokenizer%2C%20optimizer%2C%20start_step%2C%20hparams)%0A%0A%20%20%20%20checkpoint_path%20%3D%20model_save_dir%20%2F%20model_filename%0A%0A%20%20%20%20out%20%3D%20training_loop(%0A%20%20%20%20%20%20%20%20start_step%2C%0A%20%20%20%20%20%20%20%20n_steps%2C%0A%20%20%20%20%20%20%20%20n_steps_before_eval%2C%0A%20%20%20%20%20%20%20%20n_steps_before_checkpoint%2C%0A%20%20%20%20%20%20%20%20n_eval_steps%2C%0A%20%20%20%20%20%20%20%20dataset%2C%0A%20%20%20%20%20%20%20%20tokenizer%2C%0A%20%20%20%20%20%20%20%20model%2C%0A%20%20%20%20%20%20%20%20optimizer%2C%0A%20%20%20%20%20%20%20%20logs_manager%2C%0A%20%20%20%20%20%20%20%20checkpoint%2C%0A%20%20%20%20%20%20%20%20checkpoint_path%2C%0A%20%20%20%20%20%20%20%20run_to_first_save%2C%0A%20%20%20%20)%0A%0A%20%20%20%20return%20node_rank%2C%20float(out%5B%22val%22%5D)%2C%20hparams%0A%0A`,lang:`python`});var I=o(F,2);c(I,{id:`launch-a-hyperparameter-sweep-from-a-local_entrypoint`,children:(e,t)=>{s();var n=le();s(),i(e,n)},$$slots:{default:!0}});var L=o(I,2);p(o(e(L)),{href:`https://www.youtube.com/watch?v=kCc8FmEb1nY&t=5976s`,rel:`nofollow`,children:(e,t)=>{s(),i(e,r(`Andrej Karpathy’s walkthrough`))},$$slots:{default:!0}}),s(3),n(L);var R=o(L,2);d(R,{code:`%40dataclass%0Aclass%20ModelHyperparameters%3A%0A%20%20%20%20n_heads%3A%20int%20%3D%206%0A%20%20%20%20n_embed%3A%20int%20%3D%20384%0A%20%20%20%20n_blocks%3A%20int%20%3D%206%0A%20%20%20%20context_size%3A%20int%20%3D%20256%0A%20%20%20%20dropout%3A%20float%20%3D%200.2%0A%0A`,lang:`python`});var z=o(R,4);p(o(e(z),7),{href:`https://modal.com/docs/guide/scale#parallel-execution-of-inputs`,rel:`nofollow`,children:(e,t)=>{var n=ue();s(),i(e,n)},$$slots:{default:!0}}),s(),n(z);var he=o(z,8);d(he,{code:`modal%20run%2006_gpu_and_ml%2Fhyperparameter-sweep%2Fhp_sweep_gpt.py`,lang:`bash`});var B=o(he,4);d(B,{code:`Sep%2016%2021%3A20%3A39%20INFO%20%5Bhp_sweep_gpt.py.train_model%3A127%5D%20%5BNode%201%5D%20%20Remote%20Device%3A%20cuda%20%2F%2F%20GPU%3A%20A10G%0ASep%2016%2021%3A20%3A40%20INFO%20%5Bhp_sweep_gpt.py.train_model%3A149%5D%20%5BNode%201%5D%20%20Num%20parameters%3A%2010693697%0ASep%2016%2021%3A20%3A40%20INFO%20%5Bhp_sweep_gpt.py.train_model%3A156%5D%20%5BNode%201%5D%20%20Model%20Name%3A%20E2024-0916-142031.618259_context_size%3D8_n_heads%3D1_dropout%3D0.1%0ASep%2016%2021%3A20%3A41%20INFO%20%5Bhp_sweep_gpt.py.train_model%3A225%5D%20%5BNode%201%5D%20%20%20%20%20%200)%20%2F%2F%20%201.03s%20%2F%2F%20Train%20Loss%3A%203.58%20%2F%2F%20Val%20Loss%3A%203.60%0ASep%2016%2021%3A20%3A41%20INFO%20%5Bhp_sweep_gpt.py.train_model%3A127%5D%20%5BNode%202%5D%20%20Remote%20Device%3A%20cuda%20%2F%2F%20GPU%3A%20A10G%0A...`,lang:`text`});var V=o(B,4);d(V,{code:`%40app.local_entrypoint()%0Adef%20main(%0A%20%20%20%20n_steps%3A%20int%20%3D%203000%2C%0A%20%20%20%20n_steps_before_checkpoint%3A%20Optional%5Bint%5D%20%3D%20None%2C%0A%20%20%20%20n_steps_before_eval%3A%20Optional%5Bint%5D%20%3D%20None%2C%0A)%3A%0A%20%20%20%20from%20datetime%20import%20datetime%0A%20%20%20%20from%20itertools%20import%20product%0A%0A%20%20%20%20experiment_name%20%3D%20f%22E%7Bdatetime.now().strftime('%25Y-%25m-%25d-%25H%25M%25S.%25f')%7D%22%0A%20%20%20%20default_hparams%20%3D%20ModelHyperparameters()%0A%0A%20%20%20%20%23%20build%20list%20of%20hyperparameters%20to%20train%20%26%20validate%0A%20%20%20%20nheads_options%20%3D%20(1%2C%20default_hparams.n_heads)%0A%20%20%20%20context_size_options%20%3D%20(8%2C%20default_hparams.context_size)%0A%20%20%20%20dropout_options%20%3D%20(0.1%2C%20default_hparams.dropout)%0A%0A%20%20%20%20hparams_list%20%3D%20%5B%0A%20%20%20%20%20%20%20%20ModelHyperparameters(n_heads%3Dh%2C%20context_size%3Dc%2C%20dropout%3Dd)%0A%20%20%20%20%20%20%20%20for%20h%2C%20c%2C%20d%20in%20product(nheads_options%2C%20context_size_options%2C%20dropout_options)%0A%20%20%20%20%5D%0A%0A%20%20%20%20%23%20run%20training%20for%20each%20hyperparameter%20setting%0A%20%20%20%20results%20%3D%20%5B%5D%0A%20%20%20%20stop_early%20%3D%20True%20%20%23%20stop%20early%20so%20we%20can%20compare%20val%20losses%0A%20%20%20%20print(f%22Testing%20%7Blen(hparams_list)%7D%20hyperparameter%20settings%22)%0A%20%20%20%20n_nodes%20%3D%20len(hparams_list)%0A%20%20%20%20static_params%20%3D%20(%0A%20%20%20%20%20%20%20%20experiment_name%2C%0A%20%20%20%20%20%20%20%20stop_early%2C%0A%20%20%20%20%20%20%20%20n_steps%2C%0A%20%20%20%20%20%20%20%20n_steps_before_eval%2C%0A%20%20%20%20%20%20%20%20n_steps_before_checkpoint%2C%0A%20%20%20%20)%0A%20%20%20%20for%20result%20in%20train_model.starmap(%0A%20%20%20%20%20%20%20%20%5B(i%2C%20n_nodes%2C%20h%2C%20*static_params)%20for%20i%2C%20h%20in%20enumerate(hparams_list)%5D%2C%0A%20%20%20%20%20%20%20%20order_outputs%3DFalse%2C%0A%20%20%20%20)%3A%0A%20%20%20%20%20%20%20%20%23%20result%20%3D%20(node_rank%2C%20val_loss%2C%20hparams)%0A%20%20%20%20%20%20%20%20node_rank%20%3D%20result%5B0%5D%0A%20%20%20%20%20%20%20%20results.append(result)%0A%20%20%20%20%20%20%20%20print(%0A%20%20%20%20%20%20%20%20%20%20%20%20f%22%5BNode%20%7Bnode_rank%20%2B%201%7D%2F%7Bn_nodes%7D%5D%20Finished.%20Early%20stop%20val%20loss%20result%3A%20%7Bresult%5B1%3A%5D%7D%22%0A%20%20%20%20%20%20%20%20)%0A%0A%20%20%20%20%23%20find%20the%20model%20and%20hparams%20with%20the%20lowest%20validation%20loss%0A%20%20%20%20best_result%20%3D%20min(results%2C%20key%3Dlambda%20x%3A%20x%5B1%5D)%0A%20%20%20%20print(f%22Best%20early%20stop%20val%20loss%20result%3A%20%7Bbest_result%7D%22)%0A%20%20%20%20best_hparams%20%3D%20best_result%5B-1%5D%0A%0A%20%20%20%20%23%20finish%20training%20with%20best%20hparams%0A%20%20%20%20node_rank%20%3D%200%0A%20%20%20%20n_nodes%20%3D%201%20%20%23%20only%20one%20node%20for%20final%20training%20run%0A%20%20%20%20train_model.remote(%0A%20%20%20%20%20%20%20%20node_rank%2C%0A%20%20%20%20%20%20%20%20n_nodes%2C%0A%20%20%20%20%20%20%20%20best_hparams%2C%0A%20%20%20%20%20%20%20%20experiment_name%2C%0A%20%20%20%20%20%20%20%20not%20stop_early%2C%0A%20%20%20%20%20%20%20%20n_steps%2C%0A%20%20%20%20%20%20%20%20n_steps_before_eval%2C%0A%20%20%20%20%20%20%20%20n_steps_before_checkpoint%2C%0A%20%20%20%20)%0A%0A`,lang:`python`});var H=o(V,2);l(H,{id:`monitor-experiments-with-tensorboard`,children:(e,t)=>{s(),i(e,r(`Monitor experiments with TensorBoard`))},$$slots:{default:!0}});var U=o(H,4);p(o(e(U)),{href:`https://peps.python.org/pep-3333/`,rel:`nofollow`,children:(e,t)=>{s(),i(e,r(`WSGI Middleware`))},$$slots:{default:!0}}),s(),n(U);var W=o(U,2);d(W,{code:`class%20VolumeMiddleware%3A%0A%20%20%20%20def%20__init__(self%2C%20app)%3A%0A%20%20%20%20%20%20%20%20self.app%20%3D%20app%0A%0A%20%20%20%20def%20__call__(self%2C%20environ%2C%20start_response)%3A%0A%20%20%20%20%20%20%20%20if%20(route%20%3A%3D%20environ.get(%22PATH_INFO%22))%20in%20%5B%22%2F%22%2C%20%22%2Fmodal-volume-reload%22%5D%3A%0A%20%20%20%20%20%20%20%20%20%20%20%20try%3A%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20volume.reload()%0A%20%20%20%20%20%20%20%20%20%20%20%20except%20Exception%20as%20e%3A%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20print(%22Exception%20while%20re-loading%20traces%3A%20%22%2C%20e)%0A%20%20%20%20%20%20%20%20%20%20%20%20if%20route%20%3D%3D%20%22%2Fmodal-volume-reload%22%3A%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20environ%5B%22PATH_INFO%22%5D%20%3D%20%22%2F%22%20%20%23%20redirect%0A%20%20%20%20%20%20%20%20return%20self.app(environ%2C%20start_response)%0A%0A`,lang:`python`});var ge=o(W,6);d(ge,{code:`modal%20deploy%2006_gpu_and_ml%2Fhyperparameter-sweep%2Fhp_sweep_gpt.py`,lang:`text`});var G=o(ge,6);u(e(G),{get src(){return re},alt:`8 lines on a graph, validation loss on y-axis, time step on x-axis. All lines go down over the first 1000 time steps, and one goes to 5000 time steps with a final loss of 1.52`}),n(G);var _e=o(G,4);d(_e,{code:`%40app.function(%0A%20%20%20%20image%3Dtorch_image%2C%0A%20%20%20%20volumes%3D%7Bvolume_path%3A%20volume%7D%2C%0A)%0A%40modal.concurrent(max_inputs%3D100)%0A%40modal.wsgi_app()%0Adef%20monitor_training()%3A%0A%20%20%20%20board%20%3D%20tensorboard.program.TensorBoard()%0A%20%20%20%20board.configure(logdir%3Dstr(tb_log_path))%0A%20%20%20%20(data_provider%2C%20deprecated_multiplexer)%20%3D%20board._make_data_provider()%0A%20%20%20%20wsgi_app%20%3D%20tensorboard.backend.application.TensorBoardWSGIApp(%0A%20%20%20%20%20%20%20%20board.flags%2C%0A%20%20%20%20%20%20%20%20board.plugin_loaders%2C%0A%20%20%20%20%20%20%20%20data_provider%2C%0A%20%20%20%20%20%20%20%20board.assets_zip_provider%2C%0A%20%20%20%20%20%20%20%20deprecated_multiplexer%2C%0A%20%20%20%20%20%20%20%20experimental_middlewares%3D%5BVolumeMiddleware%5D%2C%0A%20%20%20%20)%0A%20%20%20%20return%20wsgi_app%0A%0A`,lang:`python`});var ve=o(_e,4);c(ve,{id:`serving-slms-on-modal-during-and-after-training`,children:(e,t)=>{s(),i(e,r(`Serving SLMs on Modal during and after training`))},$$slots:{default:!0}});var K=o(ve,2);p(o(e(K)),{href:`https://modal.com/docs/guide/model-weights`,rel:`nofollow`,children:(e,t)=>{s(),i(e,r(`this guide`))},$$slots:{default:!0}}),s(),n(K);var ye=o(K,2);l(ye,{id:`remote-inference-with-modal-clses`,children:(e,t)=>{s();var n=de();s(2),i(e,n)},$$slots:{default:!0}});var q=o(ye,2);p(o(e(q),9),{href:`https://modal.com/docs/guide/parameterized-functions`,rel:`nofollow`,children:(e,t)=>{s(),i(e,r(`auto-scaling deployment`))},$$slots:{default:!0}}),s(3),n(q);var be=o(q,2);d(be,{code:`%40app.cls(image%3Dtorch_image%2C%20volumes%3D%7Bvolume_path%3A%20volume%7D%2C%20gpu%3Dgpu)%0Aclass%20ModelInference%3A%0A%20%20%20%20experiment_name%3A%20str%20%3D%20modal.parameter(default%3D%22%22)%0A%0A%20%20%20%20def%20get_latest_available_model_dirs(self%2C%20n_last)%3A%0A%20%20%20%20%20%20%20%20%22%22%22Find%20the%20latest%20models%20that%20have%20a%20best%20model%20checkpoint%20saved.%22%22%22%0A%20%20%20%20%20%20%20%20save_model_dirs%20%3D%20glob.glob(f%22%7Bmodel_save_path%7D%2F*%22)%0A%20%20%20%20%20%20%20%20sorted_model_dirs%20%3D%20sorted(save_model_dirs%2C%20key%3Dos.path.getctime%2C%20reverse%3DTrue)%0A%0A%20%20%20%20%20%20%20%20valid_model_dirs%20%3D%20%5B%5D%0A%20%20%20%20%20%20%20%20for%20latest_model_dir%20in%20sorted_model_dirs%3A%0A%20%20%20%20%20%20%20%20%20%20%20%20if%20Path(f%22%7Blatest_model_dir%7D%2F%7Bbest_model_filename%7D%22).exists()%3A%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20valid_model_dirs.append(Path(latest_model_dir))%0A%20%20%20%20%20%20%20%20%20%20%20%20if%20len(valid_model_dirs)%20%3E%3D%20n_last%3A%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20return%20valid_model_dirs%0A%20%20%20%20%20%20%20%20return%20valid_model_dirs%0A%0A%20%20%20%20%40modal.method()%0A%20%20%20%20def%20get_latest_available_experiment_names(self%2C%20n_last)%3A%0A%20%20%20%20%20%20%20%20return%20%5Bd.name%20for%20d%20in%20self.get_latest_available_model_dirs(n_last)%5D%0A%0A%20%20%20%20def%20load_model_impl(self)%3A%0A%20%20%20%20%20%20%20%20from%20.src.model%20import%20AttentionModel%0A%20%20%20%20%20%20%20%20from%20.src.tokenizer%20import%20Tokenizer%0A%0A%20%20%20%20%20%20%20%20if%20self.experiment_name%20!%3D%20%22%22%3A%20%20%23%20user%20selected%20model%0A%20%20%20%20%20%20%20%20%20%20%20%20use_model_dir%20%3D%20f%22%7Bmodel_save_path%7D%2F%7Bself.experiment_name%7D%22%0A%20%20%20%20%20%20%20%20else%3A%20%20%23%20otherwise%2C%20pick%20latest%0A%20%20%20%20%20%20%20%20%20%20%20%20try%3A%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20use_model_dir%20%3D%20self.get_latest_available_model_dirs(1)%5B0%5D%0A%20%20%20%20%20%20%20%20%20%20%20%20except%20IndexError%3A%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20raise%20ValueError(%22No%20models%20available%20to%20load.%22)%0A%0A%20%20%20%20%20%20%20%20if%20self.use_model_dir%20%3D%3D%20use_model_dir%20and%20self.is_fully_trained%3A%0A%20%20%20%20%20%20%20%20%20%20%20%20return%20%20%23%20already%20loaded%20fully%20trained%20model.%0A%0A%20%20%20%20%20%20%20%20print(f%22Loading%20experiment%3A%20%7BPath(use_model_dir).name%7D...%22)%0A%20%20%20%20%20%20%20%20checkpoint%20%3D%20torch.load(f%22%7Buse_model_dir%7D%2F%7Bbest_model_filename%7D%22)%0A%0A%20%20%20%20%20%20%20%20self.use_model_dir%20%3D%20use_model_dir%0A%20%20%20%20%20%20%20%20hparams%20%3D%20checkpoint%5B%22hparams%22%5D%0A%20%20%20%20%20%20%20%20key%20%3D%20(%20%20%23%20for%20backwards%20compatibility%0A%20%20%20%20%20%20%20%20%20%20%20%20%22unique_chars%22%20if%20%22unique_chars%22%20in%20checkpoint%20else%20%22chars%22%0A%20%20%20%20%20%20%20%20)%0A%20%20%20%20%20%20%20%20unique_chars%20%3D%20checkpoint%5Bkey%5D%0A%20%20%20%20%20%20%20%20steps%20%3D%20checkpoint%5B%22steps%22%5D%0A%20%20%20%20%20%20%20%20val_loss%20%3D%20checkpoint%5B%22val_loss%22%5D%0A%20%20%20%20%20%20%20%20self.is_fully_trained%20%3D%20checkpoint%5B%22finished_training%22%5D%0A%0A%20%20%20%20%20%20%20%20print(%0A%20%20%20%20%20%20%20%20%20%20%20%20f%22Loaded%20model%20with%20%7Bsteps%7D%20train%20steps%22%0A%20%20%20%20%20%20%20%20%20%20%20%20f%22%20and%20val%20loss%20of%20%7Bval_loss%3A.2f%7D%22%0A%20%20%20%20%20%20%20%20%20%20%20%20f%22%20(fully_trained%3D%7Bself.is_fully_trained%7D)%22%0A%20%20%20%20%20%20%20%20)%0A%0A%20%20%20%20%20%20%20%20self.tokenizer%20%3D%20Tokenizer(unique_chars)%0A%20%20%20%20%20%20%20%20self.device%20%3D%20%22cuda%22%20if%20torch.cuda.is_available()%20else%20%22cpu%22%0A%0A%20%20%20%20%20%20%20%20self.model%20%3D%20AttentionModel(self.tokenizer.vocab_size%2C%20hparams%2C%20self.device)%0A%20%20%20%20%20%20%20%20self.model.load_state_dict(checkpoint%5B%22model%22%5D)%0A%20%20%20%20%20%20%20%20self.model.to(self.device)%0A%0A%20%20%20%20%40modal.enter()%0A%20%20%20%20def%20load_model(self)%3A%0A%20%20%20%20%20%20%20%20self.use_model_dir%20%3D%20None%0A%20%20%20%20%20%20%20%20self.is_fully_trained%20%3D%20False%0A%20%20%20%20%20%20%20%20self.load_model_impl()%0A%0A%20%20%20%20%40modal.method()%0A%20%20%20%20def%20generate(self%2C%20prompt)%3A%0A%20%20%20%20%20%20%20%20self.load_model_impl()%20%20%23%20load%20updated%20model%20if%20available%0A%0A%20%20%20%20%20%20%20%20n_new_tokens%20%3D%201000%0A%20%20%20%20%20%20%20%20return%20self.model.generate_from_text(self.tokenizer%2C%20prompt%2C%20n_new_tokens)%0A%0A`,lang:`python`});var xe=o(be,2);l(xe,{id:`adding-a-simple-web-function`,children:(e,t)=>{s(),i(e,r(`Adding a simple Web Function`))},$$slots:{default:!0}});var J=o(xe,2);p(o(e(J),5),{href:`https://modal.com/docs/reference/modal.Cls#lookup`,rel:`nofollow`,children:(e,t)=>{i(e,fe())},$$slots:{default:!0}}),s(),n(J);var Se=o(J,4);d(Se,{code:`class%20GenerationRequest(BaseModel)%3A%0A%20%20%20%20prompt%3A%20str%0A%0A%0A%40app.function(image%3Dweb_image)%0A%40modal.fastapi_endpoint(method%3D%22POST%22%2C%20docs%3DTrue)%0Adef%20web_generate(request%3A%20GenerationRequest)%3A%0A%20%20%20%20output%20%3D%20ModelInference().generate.remote(request.prompt)%0A%20%20%20%20return%20%7B%22output%22%3A%20output%7D%0A%0A`,lang:`python`});var Ce=o(Se,4);d(Ce,{code:`curl%20-X%20POST%20-H%20'Content-Type%3A%20application%2Fjson'%20--data-binary%20'%7B%22prompt%22%3A%20%22%5Cn%22%7D'%20https%3A%2F%2Fyour-workspace-name--modal-nano-gpt-web-generate.modal.run`,lang:`bash`});var we=o(Ce,4);d(we,{code:`%7B%0A%22output%22%3A%0A%20%20%20%22BRUTUS%3A%0A%20%20%20%20The%20broy%20trefore%20anny%20pleasory%20to%0A%20%20%20%20wip%20me%20state%20of%20villoor%20so%3A%0A%20%20%20%20Fortols%20listhey%20for%20brother%20beat%20the%20else%0A%20%20%20%20Be%20all%2C%20ill%20of%20lo-love%20in%20igham%3B%0A%20%20%20%20Ah%2C%20here%20all%20that%20queen%20and%20hould%20you%20father%20offer%22%0A%7D`,lang:`json`});var Te=o(we,6);l(Te,{id:`serving-a-gradio-ui-with-asgi_app`,children:(e,t)=>{s();var n=pe();s(),i(e,n)},$$slots:{default:!0}});var Y=o(Te,4);p(o(e(Y),3),{href:`https://modal.com/apps`,rel:`nofollow`,children:(e,t)=>{s(),i(e,r(`Modal app dashboard`))},$$slots:{default:!0}}),s(),n(Y);var X=o(Y,4);u(e(X),{get src(){return ae},alt:`Image of Gradio Web App. Top shows model selection dropdown. Left side shows input prompt textbox. Right side shows SLM generated output. Bottom has button for starting generation process`}),n(X);var Z=o(X,2);d(Z,{code:`%40app.function(%0A%20%20%20%20image%3Dui_image%2C%0A%20%20%20%20max_containers%3D1%2C%0A%20%20%20%20volumes%3D%7Bvolume_path%3A%20volume%7D%2C%0A)%0A%40modal.concurrent(max_inputs%3D100)%0A%40modal.asgi_app()%0Adef%20ui()%3A%0A%20%20%20%20import%20gradio%20as%20gr%0A%20%20%20%20from%20fastapi%20import%20FastAPI%0A%20%20%20%20from%20fastapi.responses%20import%20FileResponse%0A%20%20%20%20from%20gradio.routes%20import%20mount_gradio_app%0A%0A%20%20%20%20%23%20call%20out%20to%20the%20inference%20in%20a%20separate%20Modal%20environment%20with%20a%20GPU%0A%20%20%20%20def%20generate(text%3D%22%22%2C%20experiment_name%3D%22%22)%3A%0A%20%20%20%20%20%20%20%20if%20not%20text%3A%0A%20%20%20%20%20%20%20%20%20%20%20%20text%20%3D%20%22%5Cn%22%0A%20%20%20%20%20%20%20%20generated%20%3D%20ModelInference(experiment_name%3Dexperiment_name).generate.remote(%0A%20%20%20%20%20%20%20%20%20%20%20%20text%0A%20%20%20%20%20%20%20%20)%0A%20%20%20%20%20%20%20%20return%20text%20%2B%20generated%0A%0A%20%20%20%20example_prompts%20%3D%20%5B%0A%20%20%20%20%20%20%20%20%22DUKE%20OF%20YORK%3A%5CnWhere%20art%20thou%20Lucas%3F%22%2C%0A%20%20%20%20%20%20%20%20%22ROMEO%3A%5CnWhat%20is%20a%20man%3F%22%2C%0A%20%20%20%20%20%20%20%20%22CLARENCE%3A%5CnFair%20is%20foul%20and%20foul%20is%20fair%2C%20but%20who%20are%20you%3F%22%2C%0A%20%20%20%20%20%20%20%20%22Brevity%20is%20the%20soul%20of%20wit%2C%20so%20what%20is%20the%20soul%20of%20foolishness%3F%22%2C%0A%20%20%20%20%5D%0A%0A%20%20%20%20web_app%20%3D%20FastAPI()%0A%0A%20%20%20%20%23%20custom%20styles%3A%20an%20icon%2C%20a%20background%2C%20and%20a%20theme%0A%20%20%20%20%40web_app.get(%22%2Ffavicon.ico%22%2C%20include_in_schema%3DFalse)%0A%20%20%20%20async%20def%20favicon()%3A%0A%20%20%20%20%20%20%20%20return%20FileResponse(%22%2Fassets%2Ffavicon.svg%22)%0A%0A%20%20%20%20%40web_app.get(%22%2Fassets%2Fbackground.svg%22%2C%20include_in_schema%3DFalse)%0A%20%20%20%20async%20def%20background()%3A%0A%20%20%20%20%20%20%20%20return%20FileResponse(%22%2Fassets%2Fbackground.svg%22)%0A%0A%20%20%20%20with%20open(%22%2Fassets%2Findex.css%22)%20as%20f%3A%0A%20%20%20%20%20%20%20%20css%20%3D%20f.read()%0A%0A%20%20%20%20n_last%20%3D%2020%0A%20%20%20%20experiment_names%20%3D%20ModelInference().get_latest_available_experiment_names.remote(%0A%20%20%20%20%20%20%20%20n_last%0A%20%20%20%20)%0A%20%20%20%20theme%20%3D%20gr.themes.Default(%0A%20%20%20%20%20%20%20%20primary_hue%3D%22green%22%2C%20secondary_hue%3D%22emerald%22%2C%20neutral_hue%3D%22neutral%22%0A%20%20%20%20)%0A%0A%20%20%20%20%23%20add%20a%20Gradio%20UI%20around%20inference%0A%20%20%20%20with%20gr.Blocks(theme%3Dtheme%2C%20css%3Dcss%2C%20title%3D%22SLM%22)%20as%20interface%3A%0A%20%20%20%20%20%20%20%20%23%20title%0A%20%20%20%20%20%20%20%20gr.Markdown(%22%23%20GPT-style%20Shakespeare%20text%20generation.%22)%0A%0A%20%20%20%20%20%20%20%20%23%20Model%20Selection%0A%20%20%20%20%20%20%20%20with%20gr.Row()%3A%0A%20%20%20%20%20%20%20%20%20%20%20%20gr.Markdown(%22%23%23%20Model%20Version%22)%0A%20%20%20%20%20%20%20%20with%20gr.Row()%3A%0A%20%20%20%20%20%20%20%20%20%20%20%20experiment_dropdown%20%3D%20gr.Dropdown(%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20experiment_names%2C%20label%3D%22Select%20Model%20Version%22%0A%20%20%20%20%20%20%20%20%20%20%20%20)%0A%0A%20%20%20%20%20%20%20%20%23%20input%20and%20output%0A%20%20%20%20%20%20%20%20with%20gr.Row()%3A%0A%20%20%20%20%20%20%20%20%20%20%20%20with%20gr.Column()%3A%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20gr.Markdown(%22%23%23%20Input%3A%22)%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20input_box%20%3D%20gr.Textbox(%20%20%23%20input%20text%20component%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20label%3D%22%22%2C%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20placeholder%3D%22Write%20some%20Shakespeare%20like%20text%20or%20keep%20it%20empty!%22%2C%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20lines%3D10%2C%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20)%0A%20%20%20%20%20%20%20%20%20%20%20%20with%20gr.Column()%3A%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20gr.Markdown(%22%23%23%20Output%3A%22)%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20output_box%20%3D%20gr.Textbox(%20%20%23%20output%20text%20component%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20label%3D%22%22%2C%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20lines%3D10%2C%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20)%0A%0A%20%20%20%20%20%20%20%20%23%20button%20to%20trigger%20inference%20and%20a%20link%20to%20Modal%0A%20%20%20%20%20%20%20%20with%20gr.Row()%3A%0A%20%20%20%20%20%20%20%20%20%20%20%20generate_button%20%3D%20gr.Button(%22Generate%22%2C%20variant%3D%22primary%22%2C%20scale%3D2)%0A%20%20%20%20%20%20%20%20%20%20%20%20generate_button.click(%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20fn%3Dgenerate%2C%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20inputs%3D%5Binput_box%2C%20experiment_dropdown%5D%2C%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20outputs%3Doutput_box%2C%0A%20%20%20%20%20%20%20%20%20%20%20%20)%20%20%23%20connect%20inputs%20and%20outputs%20with%20inference%20function%0A%0A%20%20%20%20%20%20%20%20%20%20%20%20gr.Button(%20%20%23%20shameless%20plug%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%22%20Powered%20by%20Modal%22%2C%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20variant%3D%22secondary%22%2C%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20link%3D%22https%3A%2F%2Fmodal.com%22%2C%0A%20%20%20%20%20%20%20%20%20%20%20%20)%0A%0A%20%20%20%20%20%20%20%20%23%20example%20prompts%0A%20%20%20%20%20%20%20%20with%20gr.Column(variant%3D%22compact%22)%3A%0A%20%20%20%20%20%20%20%20%20%20%20%20%23%20add%20in%20a%20few%20examples%20to%20inspire%20users%0A%20%20%20%20%20%20%20%20%20%20%20%20for%20ii%2C%20prompt%20in%20enumerate(example_prompts)%3A%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20btn%20%3D%20gr.Button(prompt%2C%20variant%3D%22secondary%22)%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20btn.click(fn%3Dlambda%20idx%3Dii%3A%20example_prompts%5Bidx%5D%2C%20outputs%3Dinput_box)%0A%0A%20%20%20%20%23%20mount%20for%20execution%20on%20Modal%0A%20%20%20%20return%20mount_gradio_app(%0A%20%20%20%20%20%20%20%20app%3Dweb_app%2C%0A%20%20%20%20%20%20%20%20blocks%3Dinterface%2C%0A%20%20%20%20%20%20%20%20path%3D%22%2F%22%2C%0A%20%20%20%20)%0A%0A`,lang:`python`});var Ee=o(Z,2);c(Ee,{id:`addenda`,children:(e,t)=>{s(),i(e,r(`Addenda`))},$$slots:{default:!0}});var De=o(Ee,4);l(De,{id:`training-loop`,children:(e,t)=>{s(),i(e,r(`Training Loop`))},$$slots:{default:!0}});var Q=o(De,2),Oe=o(e(Q));p(Oe,{href:`https://lightning.ai/docs/pytorch/stable`,rel:`nofollow`,children:(e,t)=>{s(),i(e,r(`PyTorch Lightning`))},$$slots:{default:!0}}),p(o(Oe,2),{href:`https://huggingface.co/transformers/main_classes/trainer.html`,rel:`nofollow`,children:(e,t)=>{s(),i(e,r(`Hugging Face`))},$$slots:{default:!0}}),s(),n(Q);var ke=o(Q,2);d(ke,{code:`def%20training_loop(%0A%20%20%20%20start_step%2C%0A%20%20%20%20n_steps%2C%0A%20%20%20%20n_steps_before_eval%2C%0A%20%20%20%20n_steps_before_checkpoint%2C%0A%20%20%20%20n_eval_steps%2C%0A%20%20%20%20dataset%2C%0A%20%20%20%20tokenizer%2C%0A%20%20%20%20model%2C%0A%20%20%20%20optimizer%2C%0A%20%20%20%20logs_manager%2C%0A%20%20%20%20checkpoint%2C%0A%20%20%20%20checkpoint_path%2C%0A%20%20%20%20run_to_first_save%2C%0A)%3A%0A%20%20%20%20%40torch.no_grad()%0A%20%20%20%20def%20eval_model(model%2C%20dataset%2C%20tokenizer%2C%20n_eval_steps)%3A%0A%20%20%20%20%20%20%20%20%22%22%22Evaluate%20model%20on%20train%20and%20validation%20data.%22%22%22%0A%20%20%20%20%20%20%20%20out%20%3D%20%7B%7D%0A%20%20%20%20%20%20%20%20model.eval()%20%20%23%20Turn%20off%20gradients%0A%20%20%20%20%20%20%20%20for%20split%20in%20(%22train%22%2C%20%22val%22)%3A%0A%20%20%20%20%20%20%20%20%20%20%20%20losses%20%3D%20torch.zeros(n_eval_steps)%0A%20%20%20%20%20%20%20%20%20%20%20%20for%20k%20in%20range(n_eval_steps)%3A%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20xb%2C%20yb%20%3D%20dataset.get_batch(split)%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20logits%2C%20loss%20%3D%20model.forward(xb%2C%20yb)%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20losses%5Bk%5D%20%3D%20loss%0A%20%20%20%20%20%20%20%20%20%20%20%20out%5Bsplit%5D%20%3D%20losses.mean()%0A%0A%20%20%20%20%20%20%20%20%23%20Generate%20some%20output%20samples%0A%20%20%20%20%20%20%20%20out%5B%22sample%22%5D%20%3D%20model.generate_from_text(tokenizer%2C%20%22%5Cn%22%2C%201000)%0A%0A%20%20%20%20%20%20%20%20model.train()%20%20%23%20Turn%20on%20gradients%0A%20%20%20%20%20%20%20%20return%20out%0A%0A%20%20%20%20t_last%20%3D%20timer()%0A%20%20%20%20for%20step%20in%20range(start_step%2C%20n_steps%20%2B%201)%3A%0A%20%20%20%20%20%20%20%20%23%20sample%20a%20batch%20of%20data%0A%20%20%20%20%20%20%20%20xb%2C%20yb%20%3D%20dataset.get_batch(%22train%22)%0A%0A%20%20%20%20%20%20%20%20%23%20evaluate%20the%20loss%2C%20calculate%20%26%20apply%20gradients%0A%20%20%20%20%20%20%20%20logits%2C%20loss%20%3D%20model.forward(xb%2C%20yb)%0A%20%20%20%20%20%20%20%20optimizer.zero_grad(set_to_none%3DTrue)%0A%20%20%20%20%20%20%20%20loss.backward()%0A%20%20%20%20%20%20%20%20optimizer.step()%0A%0A%20%20%20%20%20%20%20%20%23%20log%20training%20loss%0A%20%20%20%20%20%20%20%20logs_manager.add_train_scalar(%22Cross%20Entropy%20Loss%22%2C%20loss.item()%2C%20step)%0A%0A%20%20%20%20%20%20%20%20%23%20evaluate%20model%20on%20validation%20set%0A%20%20%20%20%20%20%20%20if%20step%20%25%20n_steps_before_eval%20%3D%3D%200%3A%0A%20%20%20%20%20%20%20%20%20%20%20%20out%20%3D%20eval_model(model%2C%20dataset%2C%20tokenizer%2C%20n_eval_steps)%0A%20%20%20%20%20%20%20%20%20%20%20%20log_evals(out%2C%20step%2C%20t_last%2C%20logs_manager)%0A%20%20%20%20%20%20%20%20%20%20%20%20t_last%20%3D%20timer()%0A%0A%20%20%20%20%20%20%20%20%23%20save%20model%20with%20checkpoint%20information%0A%20%20%20%20%20%20%20%20if%20step%20%3E%200%20and%20step%20%25%20n_steps_before_checkpoint%20%3D%3D%200%3A%0A%20%20%20%20%20%20%20%20%20%20%20%20checkpoint%5B%22steps%22%5D%20%3D%20step%0A%20%20%20%20%20%20%20%20%20%20%20%20checkpoint%5B%22val_loss%22%5D%20%3D%20out%5B%22val%22%5D%0A%0A%20%20%20%20%20%20%20%20%20%20%20%20%23%20mark%20as%20finished%20if%20we%20hit%20n%20steps.%0A%20%20%20%20%20%20%20%20%20%20%20%20checkpoint%5B%22finished_training%22%5D%20%3D%20step%20%3E%3D%20n_steps%0A%0A%20%20%20%20%20%20%20%20%20%20%20%20L.info(%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20f%22Saving%20checkpoint%20to%20%7Bcheckpoint_path%7D%5Ct%20%7Bcheckpoint%5B'finished_training'%5D%7D)%22%0A%20%20%20%20%20%20%20%20%20%20%20%20)%0A%20%20%20%20%20%20%20%20%20%20%20%20save_checkpoint(checkpoint%2C%20checkpoint_path)%0A%0A%20%20%20%20%20%20%20%20%20%20%20%20if%20run_to_first_save%3A%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20L.info(%22Stopping%20early...%22)%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20break%0A%20%20%20%20return%20out%0A%0A%0Adef%20save_checkpoint(checkpoint%2C%20checkpoint_path)%3A%0A%20%20%20%20torch.save(checkpoint%2C%20checkpoint_path)%0A%20%20%20%20volume.commit()%0A%0A%0Adef%20build_model(hparams%2C%20vocab_size%2C%20device)%3A%0A%20%20%20%20%22%22%22Initialize%20the%20model%20and%20move%20it%20to%20the%20device.%22%22%22%0A%20%20%20%20model%20%3D%20AttentionModel(vocab_size%2C%20hparams%2C%20device)%0A%20%20%20%20model.to(device)%0A%20%20%20%20return%20model%0A%0A%0Adef%20setup_optimizer(model%2C%20learning_rate)%3A%0A%20%20%20%20%22%22%22Set%20up%20the%20optimizer%20for%20the%20model.%22%22%22%0A%20%20%20%20return%20torch.optim.AdamW(model.parameters()%2C%20lr%3Dlearning_rate)%0A%0A`,lang:`python`});var $=o(ke,2);l($,{id:`miscellaneous`,children:(e,t)=>{s(),i(e,r(`Miscellaneous`))},$$slots:{default:!0}}),d(o($,4),{code:`def%20prepare_data(input_file_path%3A%20Path%2C%20volume%3A%20modal.Volume)%20-%3E%20str%3A%0A%20%20%20%20%22%22%22Download%20and%20read%20the%20dataset.%22%22%22%0A%20%20%20%20volume.reload()%0A%20%20%20%20if%20not%20input_file_path.exists()%3A%0A%20%20%20%20%20%20%20%20L.info(%22Downloading%20Shakespeare%20dataset...%22)%0A%20%20%20%20%20%20%20%20data_url%20%3D%20%22https%3A%2F%2Fraw.githubusercontent.com%2Fkarpathy%2Fchar-rnn%2Fmaster%2Fdata%2Ftinyshakespeare%2Finput.txt%22%0A%20%20%20%20%20%20%20%20urllib.request.urlretrieve(data_url%2C%20input_file_path)%0A%20%20%20%20%20%20%20%20volume.commit()%0A%20%20%20%20return%20input_file_path.read_text()%0A%0A%0Adef%20make_best_symbolic_link(model_save_dir%2C%20model_filename%2C%20experiment_name)%3A%0A%20%20%20%20%23%20create%20symlink%20to%20the%20best%20model%20so%20it's%20easy%20to%20find%20for%20web%20serving%0A%20%20%20%20os.symlink(%0A%20%20%20%20%20%20%20%20str(model_save_dir%20%2F%20model_filename)%2C%0A%20%20%20%20%20%20%20%20str(model_save_path%20%2F%20experiment_name%20%2F%20best_model_filename)%2C%0A%20%20%20%20)%0A%20%20%20%20volume.commit()%20%20%23%20commit%20the%20symlink%0A%0A%0Adef%20init_checkpoint(model%2C%20tokenizer%2C%20optimizer%2C%20start_step%2C%20hparams)%3A%0A%20%20%20%20return%20%7B%0A%20%20%20%20%20%20%20%20%22model%22%3A%20model.state_dict()%2C%0A%20%20%20%20%20%20%20%20%22unique_chars%22%3A%20tokenizer.unique_chars%2C%0A%20%20%20%20%20%20%20%20%22optimizer%22%3A%20optimizer.state_dict()%2C%0A%20%20%20%20%20%20%20%20%22val_loss%22%3A%20float(%22inf%22)%2C%0A%20%20%20%20%20%20%20%20%22steps%22%3A%20start_step%2C%0A%20%20%20%20%20%20%20%20%22hparams%22%3A%20hparams%2C%0A%20%20%20%20%20%20%20%20%22finished_training%22%3A%20False%2C%0A%20%20%20%20%7D%0A%0A%0Adef%20log_evals(result%2C%20step%2C%20t_last%2C%20logs_manager)%3A%0A%20%20%20%20runtime_s%20%3D%20timer()%20-%20t_last%0A%20%20%20%20L.info(%0A%20%20%20%20%20%20%20%20f%22%7Bstep%3A5d%7D)%20%2F%2F%20%7Bruntime_s%3A%3E5.2f%7Ds%20%2F%2F%20Train%20Loss%3A%20%7Bresult%5B'train'%5D%3A.2f%7D%20%2F%2F%20Val%20Loss%3A%20%7Bresult%5B'val'%5D%3A.2f%7D%22%0A%20%20%20%20)%0A%20%20%20%20logs_manager.add_val_scalar(%22Cross%20Entropy%20Loss%22%2C%20result%5B%22val%22%5D%2C%20step)%0A%20%20%20%20logs_manager.add_val_text(%22Sample%20Output%22%2C%20result%5B%22sample%22%5D%2C%20step)%0A%20%20%20%20logs_manager.flush()%0A%20%20%20%20volume.commit()%20%20%23%20Make%20sure%20TensorBoard%20container%20will%20see%20it.%0A%0A%20%20%20%20return%20result%0A`,lang:`python`}),i(t,a)},$$slots:{default:!0}}))}export{_ as default,m as metadata};
//# sourceMappingURL=CrsfSWQw.js.map
