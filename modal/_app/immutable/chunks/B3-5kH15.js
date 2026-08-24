(function(){try{var e=typeof window<`u`?window:typeof global<`u`?global:typeof globalThis<`u`?globalThis:typeof self<`u`?self:{};e.SENTRY_RELEASE={id:`f99fcf9f0a844cc9bd13fdc8e5782b84`};var t=new e.Error().stack;t&&(e._sentryDebugIds=e._sentryDebugIds||{},e._sentryDebugIds[t]=`38e678f3-6979-46d9-8568-cdf6b5786de3`,e._sentryDebugIdIdentifier=`sentry-dbid-38e678f3-6979-46d9-8568-cdf6b5786de3`)}catch{}})();import{$t as e,St as t,Tn as n,Tt as r,bt as i,c as ee,d as a,en as o,tn as s,wn as c}from"./F_ixKBiO.js";import"./B1sc9Zdx.js";import"./Bb2deiU3.js";import{n as l,t as u}from"./JPsrybyr.js";import{t as d}from"./BILrvr3I.js";import{t as f}from"./DeWGVqas2.js";import{t as p}from"./CdZDxCfO2.js";var m=`/_app/immutable/assets/openai-finetuning-ui.C61H0FCd.jpg`,h=`/_app/immutable/assets/predibase-finetuning-ui.DiTWsWoN.jpg`,g={title:`What is LLM fine-tuning?`,description:`An intro to fine-tuning large language models in 2025`,date:`2024-12-10T12:00:00.000Z`,length:`12 minute read`,category:`Tutorials`,subcategory:`LLMs`,published:!0,layout:`blog`,toc:[{depth:2,value:`Table of Contents`,id:`table-of-contents`,children:[{depth:4,value:`A. Create the prompt`,id:`a-create-the-prompt`},{depth:4,value:`B. Add special tokens (optional)`,id:`b-add-special-tokens-optional`},{depth:4,value:`C. Tokenize the prompt`,id:`c-tokenize-the-prompt`},{depth:4,value:`Parameter-Efficient Fine-Tuning (PEFT)`,id:`parameter-efficient-fine-tuning-peft`},{depth:4,value:`Quantization`,id:`quantization`},{depth:4,value:`Distributed Training`,id:`distributed-training`}]},{depth:2,value:`Conclusion`,id:`conclusion`}],rawContent:`Fine-tuning helps us get more out of pretrained large language models (LLMs) by
adjusting the model weights to better fit a specific task or domain. This means
you can get higher quality results than plain prompt engineering at a fraction
of the cost and latency. In this post, we'll provide a brief overview of LLM
fine-tuning and how to get started with state-of-the-art techniques using Modal.

## Table of Contents

- [Why should you fine-tune an LLM?](#why-should-you-fine-tune-an-llm)
- [Where to fine-tune LLMs in 2025?](#where-to-fine-tune-llms-in-2025)
- [Top LLM fine-tuning frameworks in 2025](#top-llm-fine-tuning-frameworks-in-2025)
- [LLM fine-tuning on Modal](#llm-fine-tuning-on-modal)
- [Steps for LLM fine-tuning](#steps-for-llm-fine-tuning)
  - [Choose a base model](#choose-a-base-model)
  - [Prepare the dataset](#prepare-the-dataset)
  - [Train](#train)
  - [Use advanced fine-tuning strategies](#use-advanced-fine-tuning-strategies)
- [Conclusion](#conclusion)

<h2 id="why-should-you-fine-tune-an-llm">Why should you fine-tune an LLM?</h2>

<h3 id="cost-benefits">Cost benefits</h3>

Compared to prompting, fine-tuning is often far more effective and efficient for
steering an LLM's behavior. By training the model on a set of examples, you're
able to shorten your well-crafted prompt and save precious input tokens without
sacrificing quality. You can also often use a much smaller model. That, in turn,
translates to reduced latency and inference costs.

For example, a fine-tuned Llama 7B model can be astronomically more
cost-effective (around 50 times) on a per-token basis compared to an
off-the-shelf model like GPT-3.5, with comparable performance.

<h3 id="common-use-cases">Common use cases</h3>

LLM fine-tuning is especially great for emphasizing knowledge inherent in the
base model, customizing the structure or tone of its responses, or teaching a
model domain-specific instructions. Example use cases include:

- **Structured Output**: Generate structured data such as JSON or HTML.
- **Style Adherence**: Produce text in a distinct style, like that of The New
  Yorker or [your CEO](https://github.com/modal-labs/doppel-bot).
- **Domain-specific Instruction**: Classifying corporate documents.

For tasks that require embedding additional knowledge into the base model, like
referencing corporate documents,
[Retrieval Augmented Generation (RAG)](https://gpt-index.readthedocs.io/en/latest/getting_started/concepts.html)
might be a more suitable technique. You may also want to combine LLM fine-tuning
with a RAG system, since fine-tuning helps save prompt tokens, opening up room
for adding input context with RAG.

<h2 id="where-to-fine-tune-llms-in-2025">Where to fine-tune LLMs in 2025?</h2>

There are a few different options for where you can fine-tune an LLM in 2025,
ranging from relatively low-code, verticalized solutions, to running open-source
fine-tuning code on cloud infrastructure:

<h3 id="low-code">Low-code</h3>

- [OpenAI](https://platform.openai.com/docs/guides/fine-tuning)

  This is OpenAI's built-in fine-tuning tool, which allows you to fine-tune its
  proprietary models on custom data.
  - pros: easy UI, existing libraries for data format validation
  - cons: limited base models, expensive, don't have control over model and
    weights

![openai-finetuning-ui](./openai-finetuning-ui.jpg)

- [Predibase](https://predibase.com/)

  Predibase is a low-code platform for building AI models with first class
  support for fine-tuning.
  - pros: low-code UI, supports range of open-source models, supports private
    deployments
  - cons: not very customizable

![predibase-finetuning-ui](./predibase-finetuning-ui.jpg)

<h3 id="configurable">Configurable</h3>

The second option is to use one of the many open-source fine-tuning libraries
and frameworks (see below). This gives much more control, but requires that you
have somewhere to run the fine-tuning code. Some options here include:

- [Modal Labs](https://modal.com/)

  Modal is a serverless cloud computing platform that makes it dead-simple for
  you to run your code in the cloud. Often one of the biggest headaches of
  fine-tuning is the infrastructure overhead, such as setting up the GPUs needed
  for training can be time-consuming and expensive. Modal lets you attach
  on-demand, pay-as-you-go GPUs with just a couple lines of code.

  Modal provides a simple, yet comprehensive
  [template](https://github.com/modal-labs/llm-finetuning/tree/main) for
  fine-tuning open-source LLMs on your own dataset, featuring many of the
  training techniques outlined below.

- [Google Colab](https://colab.research.google.com/github/huggingface/notebooks/blob/master/examples/language_modeling.ipynb)

  Google Colab now has a Pro tier that allows you to access more powerful GPUs
  for longer periods of time. This can be a good option for smaller fine-tuning
  tasks or for experimenting with different techniques before scaling up.

- [AWS SageMaker](https://docs.aws.amazon.com/sagemaker/latest/dg/jumpstart-foundation-models-fine-tuning.html)

  AWS SageMaker is a fully managed machine learning platform that provides the
  ability to build, train, deploy, and fine-tune models at scale.

<h2 id="top-llm-fine-tuning-frameworks-in-2025">Top LLM fine-tuning frameworks in 2025</h2>

- [HuggingFace transformers](https://huggingface.co/docs/transformers/training)

  HuggingFace transformers is a popular open-source library for working with
  transformer-based models.

  It offers a high-level API for fine-tuning models on various tasks. It also
  provides a range of training techniques, such as distributed training,
  mixed-precision training, and gradient accumulation, to help optimize the
  fine-tuning process.

- [HuggingFace trl](https://huggingface.co/docs/trl/index)

  TRL allows users to implement a reinforcement learning loop where a model is
  rewarded for generating certain outputs.

  For example, to fine-tune a model to generate polite responses, one could set
  up a reward function that scores responses based on politeness and use \`trl\`
  to train the model.

- [axoltl](https://github.com/OpenAccess-AI-Collective/axolotl)

  Axolotl is an open-source library that provides a user-friendly interface for
  customizing fine-tuning configurations using a simple YAML file or
  command-line interface (CLI) overrides. It can load different dataset formats,
  use custom formats, or work with pre-tokenized datasets.

  It supports fine-tuning techniques such as full fine-tuning, LoRA (Low-Rank
  Adaptation), QLoRA (Quantized LoRA), ReLoRA (Residual LoRA), and GPTQ (GPT
  Quantization).

<h2 id="llm-fine-tuning-on-modal">Run LLM fine-tuning on Modal</h2>

For step-by-step instructions on fine-tuning LLMs on Modal, you can follow the
tutorial [here](/docs/examples/llm-finetuning).

<h2 id="steps-for-llm-fine-tuning">Steps for LLM fine-tuning</h2>

<h3 id="choose-a-base-model">1. Choose a base model</h3>

There are myriad open-source LLMs available, each with its own strengths and
weaknesses. Many of them claim to be the "best open-source LLM on the market"
according to various benchmarks, but the reality is that you probably have to
try multiple to determine which one is actually best for your use case. Each of
these families of open-source models will typically also offer models in
different sizes, for example Llama 2 7B vs. Llama 2 70B.

| Model                                                                         | Description                                       |
| ----------------------------------------------------------------------------- | ------------------------------------------------- |
| [Llama 2 ](https://huggingface.co/blog/llama2)                                | Open-source model from Meta                       |
| [Pythia](https://huggingface.co/EleutherAI/pythia-12b)                        | Open-source model from EleutherAI                 |
| [Mistral](https://huggingface.co/docs/transformers/main/en/model_doc/mistral) | Open-source model from Mistral                    |
| [Falcon](https://huggingface.co/tiiuae/falcon-40b)                            | Open-source model from [TII](https://www.tii.ae/) |
| [T5](https://huggingface.co/docs/transformers/model_doc/t5)                   | Open-source model from Google                     |

In addition to these base models, there are models that have been further
fine-tuned on specific datasets. For example:

| Fine-tuned Model                                                      | Base model | Description                                                                                                              |
| --------------------------------------------------------------------- | ---------- | ------------------------------------------------------------------------------------------------------------------------ |
| [Vicuna](https://lmsys.org/blog/2023-03-30-vicuna/)                   | Llama      | Fine-tuned on Llama on user-shared conversations collected from ShareGPT                                                 |
| [Code Llama](https://github.com/facebookresearch/codellama)           | Llama 2    | Fine-tuned on Llama 2 using a higher sampling of code                                                                    |
| [Alpaca](https://github.com/tatsu-lab/stanford_alpaca)                | Llama      | Fine-tuned on LLaMA 7B on 52K instruction-following demonstrations                                                       |
| [Dolly](https://huggingface.co/databricks/dolly-v2-12b)               | Pythia 12b | Fine-tuned on a new, high-quality human generated instruction following dataset, crowdsourced among Databricks employees |
| [Flan-T5](https://huggingface.co/docs/transformers/model_doc/flan-t5) | T5         | Fine-tuned on T5 with additional instruction tasks                                                                       |

It might make sense to start your LLM fine-tuning journey with one of these
models that have already been fine-tuned. For example, if you're trying to
generate structured output, Code Llama may be a better base model than vanilla
Llama 2 since it has already been fine-tuned to output structured output (albeit
maybe not the format you want).

<h3 id="prepare-the-dataset">2. Prepare the dataset</h3>

The quality and relevance of the dataset to the task you want the LLM to perform
is crucial for successful fine-tuning. Depending on the fine-tuning strategy and
base model chosen above, you will follow different instructions to format this
dataset. A common structure is a JSONL or CSV file where you can easily get a
piece of data by its object key. For example:

| Input                                                                                                                                                                                                                                                                                                                                                                                                 | Output                                                                                                                                                                                                                                                                                              |
| ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| News Brief - Atlanta Airport Flight Statistics for June 2003 <br />In June 2003, Hartsfield-Jackson Atlanta International Airport (Code: ATL) experienced a total of 30,060 flights. <br /> Out of these, 23,974 flights were on time, accounting for about 79.7% of the total flights. <br /> However, there were 5,843 flights that faced delays, with 2,160 being cancelled and 27 being diverted. | \`{Airport": {"Name": "Hartsfield-Jackson Atlanta International Airport","Code": "ATL"},"Time": {"Month": "June","Year": 2003},"Statistics": {"Total Flights": 30060,"On Time Flights": 23974,"Delayed Flights": 5843,"Cancelled Flights": 2160,"Diverted Flights": 27,"On Time Percentage": 79.7}}\` |

You should also create training and validation splits for your dataset to
evaluate your training runs.

#### A. Create the prompt

In most cases, each sample in the dataset will have to be converted into a
string prompt with instructions before we pass it into the model. Prepending an
instruction in the prompt helps guide the model to generate the best output
given the input. Each training example ends up looking something like this:

\`\`\`
### Instruction:
You are an advanced assistant that will transform this natural language text into a tripleset.
### Input:
News Brief - Atlanta Airport Flight Statistics for June 2003
In June 2003, Hartsfield-Jackson Atlanta International Airport (Code: ATL) experienced a total of 30,060 flights. Out of these, 23,974 flights were on time, accounting for about 79.7% of the total flights. However, there were 5,843 flights that faced delays, with 2,160 being cancelled and 27 being diverted.
### Response:
{
  "Airport": {
    "Name": "Hartsfield-Jackson Atlanta International Airport",
    "Code": "ATL"
  },
  "Time": {
    "Month": "June",
    "Year": 2003
  },
  "Statistics": {
    "Total Flights": 30060,
    "On Time Flights": 23974,
    "Delayed Flights": 5843,
    "Cancelled Flights": 2160,
    "Diverted Flights": 27,
    "On Time Percentage": 79.7
  }
}
\`\`\`

Note that the prompt template when running inference on a finetuned model must
be the same as the one used during training for optimal results.

#### B. Add special tokens (optional)

When creating the prompt, you may potentially want to incorporate special
tokens, which are symbols that have a particular meaning for the model and the
task.

In the context of fine-tuning, they can be particularly useful to:

- Mark the start and end of a response.
- Separate multiple items in a list.
- Highlight specific parts of the input or output.

There are two types of special tokens:

1. **Predefined Special Tokens**: Most transformer-based models come with a set
   of predefined special tokens. For example, Llama-2 has \`<<SYS>>\` as a special
   token to indicate the start and end of a system prompt, and BERT uses
   \`[CLS]\`, \`[SEP]\`, etc. These tokens have special meanings and are used in
   specific ways during both pre-training and fine-tuning.

2. **Custom Special Tokens**: If you have a specific use case that requires
   additional special tokens, you can define your own. For instance, in the
   example above, \`### Instruction:\` and \`### Input:\` are custom special tokens
   that tell the model what follows is an instruction or an input, respectively.

To use custom special tokens, you need to implement a couple additional steps:

- **Token Addition**: You'd first add these tokens to the tokenizer's
  vocabulary.

\`\`\`python
from transformers import AutoTokenizer

tokenizer = AutoTokenizer.from_pretrained("meta-llama/Llama-2-7b-hf")
tokenizer.add_special_tokens(["### Instruction:", "### Input:"])
\`\`\`

- **Model Resizing**: After adding the tokens to the tokenizer, you must resize
  the model's token embeddings to account for the new tokens.

\`\`\`python
 model.resize_token_embeddings(len(tokenizer))
\`\`\`

3. **Usage**: Once added, you can use these tokens in your dataset and the model
   will recognize them during fine-tuning.

It's important to note that introducing too many new tokens can dilute the
embeddings space, potentially affecting the model's performance. It's a good
idea to use custom tokens judiciously and ensure they provide meaningful
information to the model.

#### C. Tokenize the prompt

Now that you have the whole string prompt for each example, you have to tokenize
it. Tokenization is the process of converting a sequence of characters (like a
sentence or paragraph) into a sequence of smaller units called tokens. These
tokens can be as short as one character or as long as one word. One of the
reasons why we had to make the model aware of the special tokens above is
because we need to ensure that the tokenizer doesn't split them into smaller
sub-tokens.

For most LLM models, a specialized tokenizer is used, which often tokenizes text
into subwords or characters. This makes the tokenizer language-agnostic and
allows it to handle out-of-vocabulary words. These tokenizers also help us
include a padding and truncation strategy to handle any variation in sequence
length for our dataset. Note that part of the reason you need to specify the
tokenizer when loading a model is because each model uses a different tokenizer.
You can get around this by using \`AutoTokenizer\`, which automatically selects
the appropriate tokenizer for a given model.

With HuggingFace's
[transformers library](https://github.com/huggingface/transformers), using the
tokenizer will look something like:

\`\`\`python
from transformers import AutoTokenizer

tokenizer = AutoTokenizer.from_pretrained("meta-llama/Llama-2-7b-hf")
tokens = tokenizer.encode("ChatGPT is great!")
\`\`\`

<h3 id="train">3. Train</h3>

After choosing a base model and preparing the dataset, it's time to kick off the
training run. Training usually involves the following steps:

1. Loading the pretrained base model
2. Feeding it your tokenized, instruction-based training data
3. Adjusting training configuation hyperparameters like learning rate, batch
   size, and number of epochs
4. Launching the training job and monitoring performance on your validation
   dataset

The length of the training run depends on a variety of factors, including the
training hyperparameters as well as:

- **Size of dataset**: Larger datasets requires more time for fine-tuning.
- **Type of GPU**: More powerful GPUs can train a model faster.
- **Type of base model**: Larger models with more parameters and more complex
  architectures take longer to train.

Modal makes running training sweeps easy and repeatable by enabling you to
[define and package your environment in code](https://modal.com/docs/guide/images),
[cache your model weights](https://modal.com/docs/guide/volumes#volume-basics)
for faster cold-starts, and
[spawn up to 8 GPUs of any type](https://modal.com/docs/guide/gpu) for
distirbuted training (which we talk about further in the following section),
among other features.

<h3 id="use-advanced-fine-tuning-strategies">4. Use advanced fine-tuning strategies</h3>

Given all of its benefits, fine-tuning an LLM can be quite time-consuming and
compute-intensive upfront. There are a number of strategies for making training
faster and more efficient. Here are some of the popular ones:

#### Parameter-Efficient Fine-Tuning (PEFT)

An LLM is a matrix, a table filled with numbers (weights) that determine its
behavior. Traditional fine-tuning usually involves tweaking all of these weights
slightly based on the new data. [PEFT](https://github.com/huggingface/peft)
implements a number of techniques that help aims to reduce the memory
requirements while speeding up fine-tuning by freezing most of the parameters
and only training a subset of the parameters. The most popular PEFT technique is
[Low-Rank Adaption (LoRA)](https://github.com/microsoft/LoRA). Instead of
tweaking the original weight matrix directly, LoRA simply updates a smaller
matrix on top, the "low-rank" adapter. This small adapter captures the essential
changes needed for the new task, while keeping the original matrix frozen. To
produce the final results, you combine the original and trained adapter weights.

Since only a small subset of the weights are updated when fine-tuning with LoRA,
it is significantly faster than traditional fine-tuning. Additionally, instead
of outputting a whole new model, the additional "adapter" model can be saved
separately, significantly reducing the memory footprint.

#### Quantization

Quantization involves converting the floating-point numbers that represent the
model's weights and activations into integers.

For example, in 8-bit quantization, the continuous range of floating-point
values is mapped to 256 discrete integer values. This can reduce the model size
significantly compared to the original 32-bit floating-point representation.

[QLoRA](https://arxiv.org/abs/2305.14314) is a recently developed finetuning
approach that uses quantization to make LoRA even more memory-efficient,
enabling you to fine-tune very large models on modest hardware.

#### Distributed Training

Distributed training helps when training a model on a single GPU is too slow or
the model's weights don't fit into a single GPU. Having multiple GPUs deal with
their own fraction of the training state and data helps maximize throughput, the
amount of samples we can process per time unit. There are a couple frameworks
readily available to help parallelize computation across multiple GPUs:

**A. DeepSpeed**

[DeepSpeed](https://github.com/microsoft/DeepSpeed) is an open-source library
that implements [ZeRO](https://arxiv.org/abs/1910.02054), a new method to
optimize memory usage during training. ZeRO significantly improves training
speed and allows for larger models to be trained efficiently by partitioning
input data across processes while getting rid of memory redundancies that are
present in traditional data- and model-parallel training methods.

In their tests, ZeRO was able to train models with over 100 billion parameters
using 400 GPUs, achieving a throughput of 15 Petaflops (a measure of computing
speed).

The benefits of ZeRO/DeepSpeed are that it simplifies the training process. For
instance, it can train models with up to 13 billion parameters without the need
for model parallelism. This is beneficial because model parallelism can be
complex and harder for researchers to implement.

**B. Fully Sharded Data Parallelism (FSDP)**

[FSDP](https://pytorch.org/blog/introducing-pytorch-fully-sharded-data-parallel-api/)
helps speed up training with fewer GPUs by partitioning a model's parameters
into shards across multiple GPUs.

For example, if a model has 1 billion parameters and you have 4 GPUs, each GPU
could hold 250 million parameters. With FSDP, these parameters could be updated
in parallel, and only the necessary parameters for a given forward or backward
pass need to be loaded onto each GPU, reducing the overall memory footprint.

FSDP is a relatively simple and easy way to get started with distributed
training. It is recommended to use FSDP if you are new to distributed parallel
training, and only to use DeepSpeed if you know you will need cutting edge
features that are not available with FSDP.

[Modal's llm-finetuning guide](https://github.com/modal-labs/llm-finetuning/tree/main)
implements
[training with LoRA and Deepspeed](https://github.com/modal-labs/llm-finetuning/blob/main/src/train.py#L94),
and is configurable with many other SOTA techniques.

**C. [accelerate](https://github.com/huggingface/accelerate)**

\`accelerate\` simplifies the process of running models on multiple GPUs or CPUs,
without requiring a deep understanding of distributed computing principles.

## Conclusion

Fine-tuning an LLM allows you to customize existing general-purpose models for
your specific use case.

To make your LLM fine-tuning job more efficient, consider leveraging techniques
like LoRA or model sharding (using frameworks like Deepspeed). Modal's
[fine-tuning template](https://github.com/modal-labs/llm-finetuning/tree/main)
implements many of these techniques out of the box, allowing you to quickly spin
up distributed training jobs in the cloud.

By fine-tuning an open-source model like Llama 2 or Mistral on Modal, you can
obtain a customized model that excels at your particular use case, at a fraction
of the cost and latency of off-the-shelf API services.
`,meta:{description:`An intro to fine-tuning large language models in 2025`}},{title:_,description:v,date:y,length:b,category:x,subcategory:S,published:C,layout:w,toc:T,rawContent:te,meta:ne}=g,re=t(`<thead><tr><th>Model</th><th>Description</th></tr></thead> <tbody><tr><td><!></td><td>Open-source model from Meta</td></tr><tr><td><!></td><td>Open-source model from EleutherAI</td></tr><tr><td><!></td><td>Open-source model from Mistral</td></tr><tr><td><!></td><td>Open-source model from <!></td></tr><tr><td><!></td><td>Open-source model from Google</td></tr></tbody>`,1),ie=t(`<thead><tr><th>Fine-tuned Model</th><th>Base model</th><th>Description</th></tr></thead> <tbody><tr><td><!></td><td>Llama</td><td>Fine-tuned on Llama on user-shared conversations collected from ShareGPT</td></tr><tr><td><!></td><td>Llama 2</td><td>Fine-tuned on Llama 2 using a higher sampling of code</td></tr><tr><td><!></td><td>Llama</td><td>Fine-tuned on LLaMA 7B on 52K instruction-following demonstrations</td></tr><tr><td><!></td><td>Pythia 12b</td><td>Fine-tuned on a new, high-quality human generated instruction following dataset, crowdsourced among Databricks employees</td></tr><tr><td><!></td><td>T5</td><td>Fine-tuned on T5 with additional instruction tasks</td></tr></tbody>`,1),ae=t(`<thead><tr><th>Input</th><th>Output</th></tr></thead> <tbody><tr><td>News Brief - Atlanta Airport Flight Statistics for June 2003 <br/>In June 2003, Hartsfield-Jackson Atlanta International Airport (Code: ATL) experienced a total of 30,060 flights. <br/> Out of these, 23,974 flights were on time, accounting for about 79.7% of the total flights. <br/> However, there were 5,843 flights that faced delays, with 2,160 being cancelled and 27 being diverted.</td><td><code>&#123;Airport": &#123;"Name": "Hartsfield-Jackson Atlanta International Airport","Code": "ATL"&#125;,"Time": &#123;"Month": "June","Year": 2003&#125;,"Statistics": &#123;"Total Flights": 30060,"On Time Flights": 23974,"Delayed Flights": 5843,"Cancelled Flights": 2160,"Diverted Flights": 27,"On Time Percentage": 79.7&#125;&#125;</code></td></tr></tbody>`,1),oe=t(`<p>Fine-tuning helps us get more out of pretrained large language models (LLMs) by
adjusting the model weights to better fit a specific task or domain. This means
you can get higher quality results than plain prompt engineering at a fraction
of the cost and latency. In this post, we’ll provide a brief overview of LLM
fine-tuning and how to get started with state-of-the-art techniques using Modal.</p> <h2 id="table-of-contents">Table of Contents</h2> <ul><li><!></li> <li><!></li> <li><!></li> <li><!></li> <li><!> <ul><li><!></li> <li><!></li> <li><!></li> <li><!></li></ul></li> <li><!></li></ul> <h2 id="why-should-you-fine-tune-an-llm">Why should you fine-tune an LLM?</h2> <h3 id="cost-benefits">Cost benefits</h3> <p>Compared to prompting, fine-tuning is often far more effective and efficient for
steering an LLM’s behavior. By training the model on a set of examples, you’re
able to shorten your well-crafted prompt and save precious input tokens without
sacrificing quality. You can also often use a much smaller model. That, in turn,
translates to reduced latency and inference costs.</p> <p>For example, a fine-tuned Llama 7B model can be astronomically more
cost-effective (around 50 times) on a per-token basis compared to an
off-the-shelf model like GPT-3.5, with comparable performance.</p> <h3 id="common-use-cases">Common use cases</h3> <p>LLM fine-tuning is especially great for emphasizing knowledge inherent in the
base model, customizing the structure or tone of its responses, or teaching a
model domain-specific instructions. Example use cases include:</p> <ul><li><strong>Structured Output</strong>: Generate structured data such as JSON or HTML.</li> <li><strong>Style Adherence</strong>: Produce text in a distinct style, like that of The New
Yorker or <!>.</li> <li><strong>Domain-specific Instruction</strong>: Classifying corporate documents.</li></ul> <p>For tasks that require embedding additional knowledge into the base model, like
referencing corporate documents, <!> might be a more suitable technique. You may also want to combine LLM fine-tuning
with a RAG system, since fine-tuning helps save prompt tokens, opening up room
for adding input context with RAG.</p> <h2 id="where-to-fine-tune-llms-in-2025">Where to fine-tune LLMs in 2025?</h2> <p>There are a few different options for where you can fine-tune an LLM in 2025,
ranging from relatively low-code, verticalized solutions, to running open-source
fine-tuning code on cloud infrastructure:</p> <h3 id="low-code">Low-code</h3> <ul><li><p><!></p> <p>This is OpenAI’s built-in fine-tuning tool, which allows you to fine-tune its
proprietary models on custom data.</p> <ul><li>pros: easy UI, existing libraries for data format validation</li> <li>cons: limited base models, expensive, don’t have control over model and
weights</li></ul></li></ul> <p><!></p> <ul><li><p><!></p> <p>Predibase is a low-code platform for building AI models with first class
support for fine-tuning.</p> <ul><li>pros: low-code UI, supports range of open-source models, supports private
deployments</li> <li>cons: not very customizable</li></ul></li></ul> <p><!></p> <h3 id="configurable">Configurable</h3> <p>The second option is to use one of the many open-source fine-tuning libraries
and frameworks (see below). This gives much more control, but requires that you
have somewhere to run the fine-tuning code. Some options here include:</p> <ul><li><p><!></p> <p>Modal is a serverless cloud computing platform that makes it dead-simple for
you to run your code in the cloud. Often one of the biggest headaches of
fine-tuning is the infrastructure overhead, such as setting up the GPUs needed
for training can be time-consuming and expensive. Modal lets you attach
on-demand, pay-as-you-go GPUs with just a couple lines of code.</p> <p>Modal provides a simple, yet comprehensive <!> for
fine-tuning open-source LLMs on your own dataset, featuring many of the
training techniques outlined below.</p></li> <li><p><!></p> <p>Google Colab now has a Pro tier that allows you to access more powerful GPUs
for longer periods of time. This can be a good option for smaller fine-tuning
tasks or for experimenting with different techniques before scaling up.</p></li> <li><p><!></p> <p>AWS SageMaker is a fully managed machine learning platform that provides the
ability to build, train, deploy, and fine-tune models at scale.</p></li></ul> <h2 id="top-llm-fine-tuning-frameworks-in-2025">Top LLM fine-tuning frameworks in 2025</h2> <ul><li><p><!></p> <p>HuggingFace transformers is a popular open-source library for working with
transformer-based models.</p> <p>It offers a high-level API for fine-tuning models on various tasks. It also
provides a range of training techniques, such as distributed training,
mixed-precision training, and gradient accumulation, to help optimize the
fine-tuning process.</p></li> <li><p><!></p> <p>TRL allows users to implement a reinforcement learning loop where a model is
rewarded for generating certain outputs.</p> <p>For example, to fine-tune a model to generate polite responses, one could set
up a reward function that scores responses based on politeness and use <code>trl</code> to train the model.</p></li> <li><p><!></p> <p>Axolotl is an open-source library that provides a user-friendly interface for
customizing fine-tuning configurations using a simple YAML file or
command-line interface (CLI) overrides. It can load different dataset formats,
use custom formats, or work with pre-tokenized datasets.</p> <p>It supports fine-tuning techniques such as full fine-tuning, LoRA (Low-Rank
Adaptation), QLoRA (Quantized LoRA), ReLoRA (Residual LoRA), and GPTQ (GPT
Quantization).</p></li></ul> <h2 id="llm-fine-tuning-on-modal">Run LLM fine-tuning on Modal</h2> <p>For step-by-step instructions on fine-tuning LLMs on Modal, you can follow the
tutorial <!>.</p> <h2 id="steps-for-llm-fine-tuning">Steps for LLM fine-tuning</h2> <h3 id="choose-a-base-model">1. Choose a base model</h3> <p>There are myriad open-source LLMs available, each with its own strengths and
weaknesses. Many of them claim to be the “best open-source LLM on the market”
according to various benchmarks, but the reality is that you probably have to
try multiple to determine which one is actually best for your use case. Each of
these families of open-source models will typically also offer models in
different sizes, for example Llama 2 7B vs. Llama 2 70B.</p> <!> <p>In addition to these base models, there are models that have been further
fine-tuned on specific datasets. For example:</p> <!> <p>It might make sense to start your LLM fine-tuning journey with one of these
models that have already been fine-tuned. For example, if you’re trying to
generate structured output, Code Llama may be a better base model than vanilla
Llama 2 since it has already been fine-tuned to output structured output (albeit
maybe not the format you want).</p> <h3 id="prepare-the-dataset">2. Prepare the dataset</h3> <p>The quality and relevance of the dataset to the task you want the LLM to perform
is crucial for successful fine-tuning. Depending on the fine-tuning strategy and
base model chosen above, you will follow different instructions to format this
dataset. A common structure is a JSONL or CSV file where you can easily get a
piece of data by its object key. For example:</p> <!> <p>You should also create training and validation splits for your dataset to
evaluate your training runs.</p> <h4 id="a-create-the-prompt">A. Create the prompt</h4> <p>In most cases, each sample in the dataset will have to be converted into a
string prompt with instructions before we pass it into the model. Prepending an
instruction in the prompt helps guide the model to generate the best output
given the input. Each training example ends up looking something like this:</p> <!> <p>Note that the prompt template when running inference on a finetuned model must
be the same as the one used during training for optimal results.</p> <h4 id="b-add-special-tokens-optional">B. Add special tokens (optional)</h4> <p>When creating the prompt, you may potentially want to incorporate special
tokens, which are symbols that have a particular meaning for the model and the
task.</p> <p>In the context of fine-tuning, they can be particularly useful to:</p> <ul><li>Mark the start and end of a response.</li> <li>Separate multiple items in a list.</li> <li>Highlight specific parts of the input or output.</li></ul> <p>There are two types of special tokens:</p> <ol><li><p><strong>Predefined Special Tokens</strong>: Most transformer-based models come with a set
of predefined special tokens. For example, Llama-2 has <code>&lt;&lt;SYS&gt;&gt;</code> as a special
token to indicate the start and end of a system prompt, and BERT uses <code>[CLS]</code>, <code>[SEP]</code>, etc. These tokens have special meanings and are used in
specific ways during both pre-training and fine-tuning.</p></li> <li><p><strong>Custom Special Tokens</strong>: If you have a specific use case that requires
additional special tokens, you can define your own. For instance, in the
example above, <code>### Instruction:</code> and <code>### Input:</code> are custom special tokens
that tell the model what follows is an instruction or an input, respectively.</p></li></ol> <p>To use custom special tokens, you need to implement a couple additional steps:</p> <ul><li><strong>Token Addition</strong>: You’d first add these tokens to the tokenizer’s
vocabulary.</li></ul> <!> <ul><li><strong>Model Resizing</strong>: After adding the tokens to the tokenizer, you must resize
the model’s token embeddings to account for the new tokens.</li></ul> <!> <ol start="3"><li><strong>Usage</strong>: Once added, you can use these tokens in your dataset and the model
will recognize them during fine-tuning.</li></ol> <p>It’s important to note that introducing too many new tokens can dilute the
embeddings space, potentially affecting the model’s performance. It’s a good
idea to use custom tokens judiciously and ensure they provide meaningful
information to the model.</p> <h4 id="c-tokenize-the-prompt">C. Tokenize the prompt</h4> <p>Now that you have the whole string prompt for each example, you have to tokenize
it. Tokenization is the process of converting a sequence of characters (like a
sentence or paragraph) into a sequence of smaller units called tokens. These
tokens can be as short as one character or as long as one word. One of the
reasons why we had to make the model aware of the special tokens above is
because we need to ensure that the tokenizer doesn’t split them into smaller
sub-tokens.</p> <p>For most LLM models, a specialized tokenizer is used, which often tokenizes text
into subwords or characters. This makes the tokenizer language-agnostic and
allows it to handle out-of-vocabulary words. These tokenizers also help us
include a padding and truncation strategy to handle any variation in sequence
length for our dataset. Note that part of the reason you need to specify the
tokenizer when loading a model is because each model uses a different tokenizer.
You can get around this by using <code>AutoTokenizer</code>, which automatically selects
the appropriate tokenizer for a given model.</p> <p>With HuggingFace’s <!>, using the
tokenizer will look something like:</p> <!> <h3 id="train">3. Train</h3> <p>After choosing a base model and preparing the dataset, it’s time to kick off the
training run. Training usually involves the following steps:</p> <ol><li>Loading the pretrained base model</li> <li>Feeding it your tokenized, instruction-based training data</li> <li>Adjusting training configuation hyperparameters like learning rate, batch
size, and number of epochs</li> <li>Launching the training job and monitoring performance on your validation
dataset</li></ol> <p>The length of the training run depends on a variety of factors, including the
training hyperparameters as well as:</p> <ul><li><strong>Size of dataset</strong>: Larger datasets requires more time for fine-tuning.</li> <li><strong>Type of GPU</strong>: More powerful GPUs can train a model faster.</li> <li><strong>Type of base model</strong>: Larger models with more parameters and more complex
architectures take longer to train.</li></ul> <p>Modal makes running training sweeps easy and repeatable by enabling you to <!>, <!> for faster cold-starts, and <!> for
distirbuted training (which we talk about further in the following section),
among other features.</p> <h3 id="use-advanced-fine-tuning-strategies">4. Use advanced fine-tuning strategies</h3> <p>Given all of its benefits, fine-tuning an LLM can be quite time-consuming and
compute-intensive upfront. There are a number of strategies for making training
faster and more efficient. Here are some of the popular ones:</p> <h4 id="parameter-efficient-fine-tuning-peft">Parameter-Efficient Fine-Tuning (PEFT)</h4> <p>An LLM is a matrix, a table filled with numbers (weights) that determine its
behavior. Traditional fine-tuning usually involves tweaking all of these weights
slightly based on the new data. <!> implements a number of techniques that help aims to reduce the memory
requirements while speeding up fine-tuning by freezing most of the parameters
and only training a subset of the parameters. The most popular PEFT technique is <!>. Instead of
tweaking the original weight matrix directly, LoRA simply updates a smaller
matrix on top, the “low-rank” adapter. This small adapter captures the essential
changes needed for the new task, while keeping the original matrix frozen. To
produce the final results, you combine the original and trained adapter weights.</p> <p>Since only a small subset of the weights are updated when fine-tuning with LoRA,
it is significantly faster than traditional fine-tuning. Additionally, instead
of outputting a whole new model, the additional “adapter” model can be saved
separately, significantly reducing the memory footprint.</p> <h4 id="quantization">Quantization</h4> <p>Quantization involves converting the floating-point numbers that represent the
model’s weights and activations into integers.</p> <p>For example, in 8-bit quantization, the continuous range of floating-point
values is mapped to 256 discrete integer values. This can reduce the model size
significantly compared to the original 32-bit floating-point representation.</p> <p><!> is a recently developed finetuning
approach that uses quantization to make LoRA even more memory-efficient,
enabling you to fine-tune very large models on modest hardware.</p> <h4 id="distributed-training">Distributed Training</h4> <p>Distributed training helps when training a model on a single GPU is too slow or
the model’s weights don’t fit into a single GPU. Having multiple GPUs deal with
their own fraction of the training state and data helps maximize throughput, the
amount of samples we can process per time unit. There are a couple frameworks
readily available to help parallelize computation across multiple GPUs:</p> <p><strong>A. DeepSpeed</strong></p> <p><!> is an open-source library
that implements <!>, a new method to
optimize memory usage during training. ZeRO significantly improves training
speed and allows for larger models to be trained efficiently by partitioning
input data across processes while getting rid of memory redundancies that are
present in traditional data- and model-parallel training methods.</p> <p>In their tests, ZeRO was able to train models with over 100 billion parameters
using 400 GPUs, achieving a throughput of 15 Petaflops (a measure of computing
speed).</p> <p>The benefits of ZeRO/DeepSpeed are that it simplifies the training process. For
instance, it can train models with up to 13 billion parameters without the need
for model parallelism. This is beneficial because model parallelism can be
complex and harder for researchers to implement.</p> <p><strong>B. Fully Sharded Data Parallelism (FSDP)</strong></p> <p><!> helps speed up training with fewer GPUs by partitioning a model’s parameters
into shards across multiple GPUs.</p> <p>For example, if a model has 1 billion parameters and you have 4 GPUs, each GPU
could hold 250 million parameters. With FSDP, these parameters could be updated
in parallel, and only the necessary parameters for a given forward or backward
pass need to be loaded onto each GPU, reducing the overall memory footprint.</p> <p>FSDP is a relatively simple and easy way to get started with distributed
training. It is recommended to use FSDP if you are new to distributed parallel
training, and only to use DeepSpeed if you know you will need cutting edge
features that are not available with FSDP.</p> <p><!> implements <!>,
and is configurable with many other SOTA techniques.</p> <p><strong>C. <!></strong></p> <p><code>accelerate</code> simplifies the process of running models on multiple GPUs or CPUs,
without requiring a deep understanding of distributed computing principles.</p> <h2 id="conclusion">Conclusion</h2> <p>Fine-tuning an LLM allows you to customize existing general-purpose models for
your specific use case.</p> <p>To make your LLM fine-tuning job more efficient, consider leveraging techniques
like LoRA or model sharding (using frameworks like Deepspeed). Modal’s <!> implements many of these techniques out of the box, allowing you to quickly spin
up distributed training jobs in the cloud.</p> <p>By fine-tuning an open-source model like Llama 2 or Mistral on Modal, you can
obtain a customized model that excels at your particular use case, at a fraction
of the cost and latency of off-the-shelf API services.</p>`,1);function E(t,_){let v=ee(_,[`children`,`$$slots`,`$$events`,`$$legacy`]);p(t,a(()=>v,()=>g,{children:(t,ee)=>{var a=oe(),p=s(o(a),4),g=e(p);f(e(g),{href:`#why-should-you-fine-tune-an-llm`,children:(e,t)=>{c(),i(e,r(`Why should you fine-tune an LLM?`))},$$slots:{default:!0}}),n(g);var _=s(g,2);f(e(_),{href:`#where-to-fine-tune-llms-in-2025`,children:(e,t)=>{c(),i(e,r(`Where to fine-tune LLMs in 2025?`))},$$slots:{default:!0}}),n(_);var v=s(_,2);f(e(v),{href:`#top-llm-fine-tuning-frameworks-in-2025`,children:(e,t)=>{c(),i(e,r(`Top LLM fine-tuning frameworks in 2025`))},$$slots:{default:!0}}),n(v);var y=s(v,2);f(e(y),{href:`#llm-fine-tuning-on-modal`,children:(e,t)=>{c(),i(e,r(`LLM fine-tuning on Modal`))},$$slots:{default:!0}}),n(y);var b=s(y,2),x=e(b);f(x,{href:`#steps-for-llm-fine-tuning`,children:(e,t)=>{c(),i(e,r(`Steps for LLM fine-tuning`))},$$slots:{default:!0}});var S=s(x,2),C=e(S);f(e(C),{href:`#choose-a-base-model`,children:(e,t)=>{c(),i(e,r(`Choose a base model`))},$$slots:{default:!0}}),n(C);var w=s(C,2);f(e(w),{href:`#prepare-the-dataset`,children:(e,t)=>{c(),i(e,r(`Prepare the dataset`))},$$slots:{default:!0}}),n(w);var T=s(w,2);f(e(T),{href:`#train`,children:(e,t)=>{c(),i(e,r(`Train`))},$$slots:{default:!0}}),n(T);var te=s(T,2);f(e(te),{href:`#use-advanced-fine-tuning-strategies`,children:(e,t)=>{c(),i(e,r(`Use advanced fine-tuning strategies`))},$$slots:{default:!0}}),n(te),n(S),n(b);var ne=s(b,2);f(e(ne),{href:`#conclusion`,children:(e,t)=>{c(),i(e,r(`Conclusion`))},$$slots:{default:!0}}),n(ne),n(p);var E=s(p,14),se=s(e(E),2);f(s(e(se),2),{href:`https://github.com/modal-labs/doppel-bot`,rel:`nofollow`,children:(e,t)=>{c(),i(e,r(`your CEO`))},$$slots:{default:!0}}),c(),n(se),c(2),n(E);var D=s(E,2);f(s(e(D)),{href:`https://gpt-index.readthedocs.io/en/latest/getting_started/concepts.html`,rel:`nofollow`,children:(e,t)=>{c(),i(e,r(`Retrieval Augmented Generation (RAG)`))},$$slots:{default:!0}}),c(),n(D);var O=s(D,8),k=e(O),A=e(k);f(e(A),{href:`https://platform.openai.com/docs/guides/fine-tuning`,rel:`nofollow`,children:(e,t)=>{c(),i(e,r(`OpenAI`))},$$slots:{default:!0}}),n(A),c(4),n(k),n(O);var j=s(O,2);u(e(j),{get src(){return m},alt:`openai-finetuning-ui`}),n(j);var M=s(j,2),ce=e(M),le=e(ce);f(e(le),{href:`https://predibase.com/`,rel:`nofollow`,children:(e,t)=>{c(),i(e,r(`Predibase`))},$$slots:{default:!0}}),n(le),c(4),n(ce),n(M);var N=s(M,2);u(e(N),{get src(){return h},alt:`predibase-finetuning-ui`}),n(N);var P=s(N,6),F=e(P),I=e(F);f(e(I),{href:`https://modal.com/`,rel:`nofollow`,children:(e,t)=>{c(),i(e,r(`Modal Labs`))},$$slots:{default:!0}}),n(I);var ue=s(I,4);f(s(e(ue)),{href:`https://github.com/modal-labs/llm-finetuning/tree/main`,rel:`nofollow`,children:(e,t)=>{c(),i(e,r(`template`))},$$slots:{default:!0}}),c(),n(ue),n(F);var L=s(F,2),R=e(L);f(e(R),{href:`https://colab.research.google.com/github/huggingface/notebooks/blob/master/examples/language_modeling.ipynb`,rel:`nofollow`,children:(e,t)=>{c(),i(e,r(`Google Colab`))},$$slots:{default:!0}}),n(R),c(2),n(L);var z=s(L,2),B=e(z);f(e(B),{href:`https://docs.aws.amazon.com/sagemaker/latest/dg/jumpstart-foundation-models-fine-tuning.html`,rel:`nofollow`,children:(e,t)=>{c(),i(e,r(`AWS SageMaker`))},$$slots:{default:!0}}),n(B),c(2),n(z),n(P);var V=s(P,4),H=e(V),U=e(H);f(e(U),{href:`https://huggingface.co/docs/transformers/training`,rel:`nofollow`,children:(e,t)=>{c(),i(e,r(`HuggingFace transformers`))},$$slots:{default:!0}}),n(U),c(4),n(H);var W=s(H,2),de=e(W);f(e(de),{href:`https://huggingface.co/docs/trl/index`,rel:`nofollow`,children:(e,t)=>{c(),i(e,r(`HuggingFace trl`))},$$slots:{default:!0}}),n(de),c(4),n(W);var fe=s(W,2),pe=e(fe);f(e(pe),{href:`https://github.com/OpenAccess-AI-Collective/axolotl`,rel:`nofollow`,children:(e,t)=>{c(),i(e,r(`axoltl`))},$$slots:{default:!0}}),n(pe),c(4),n(fe),n(V);var G=s(V,4);f(s(e(G)),{href:`/docs/examples/llm-finetuning`,children:(e,t)=>{c(),i(e,r(`here`))},$$slots:{default:!0}}),c(),n(G);var me=s(G,8);l(me,{children:(t,ee)=>{var a=re(),l=s(o(a),2),u=e(l),d=e(u);f(e(d),{href:`https://huggingface.co/blog/llama2`,rel:`nofollow`,children:(e,t)=>{c(),i(e,r(`Llama 2`))},$$slots:{default:!0}}),n(d),c(),n(u);var p=s(u),m=e(p);f(e(m),{href:`https://huggingface.co/EleutherAI/pythia-12b`,rel:`nofollow`,children:(e,t)=>{c(),i(e,r(`Pythia`))},$$slots:{default:!0}}),n(m),c(),n(p);var h=s(p),g=e(h);f(e(g),{href:`https://huggingface.co/docs/transformers/main/en/model_doc/mistral`,rel:`nofollow`,children:(e,t)=>{c(),i(e,r(`Mistral`))},$$slots:{default:!0}}),n(g),c(),n(h);var _=s(h),v=e(_);f(e(v),{href:`https://huggingface.co/tiiuae/falcon-40b`,rel:`nofollow`,children:(e,t)=>{c(),i(e,r(`Falcon`))},$$slots:{default:!0}}),n(v);var y=s(v);f(s(e(y)),{href:`https://www.tii.ae/`,rel:`nofollow`,children:(e,t)=>{c(),i(e,r(`TII`))},$$slots:{default:!0}}),n(y),n(_);var b=s(_),x=e(b);f(e(x),{href:`https://huggingface.co/docs/transformers/model_doc/t5`,rel:`nofollow`,children:(e,t)=>{c(),i(e,r(`T5`))},$$slots:{default:!0}}),n(x),c(),n(b),n(l),i(t,a)},$$slots:{default:!0}});var he=s(me,4);l(he,{children:(t,ee)=>{var a=ie(),l=s(o(a),2),u=e(l),d=e(u);f(e(d),{href:`https://lmsys.org/blog/2023-03-30-vicuna/`,rel:`nofollow`,children:(e,t)=>{c(),i(e,r(`Vicuna`))},$$slots:{default:!0}}),n(d),c(2),n(u);var p=s(u),m=e(p);f(e(m),{href:`https://github.com/facebookresearch/codellama`,rel:`nofollow`,children:(e,t)=>{c(),i(e,r(`Code Llama`))},$$slots:{default:!0}}),n(m),c(2),n(p);var h=s(p),g=e(h);f(e(g),{href:`https://github.com/tatsu-lab/stanford_alpaca`,rel:`nofollow`,children:(e,t)=>{c(),i(e,r(`Alpaca`))},$$slots:{default:!0}}),n(g),c(2),n(h);var _=s(h),v=e(_);f(e(v),{href:`https://huggingface.co/databricks/dolly-v2-12b`,rel:`nofollow`,children:(e,t)=>{c(),i(e,r(`Dolly`))},$$slots:{default:!0}}),n(v),c(2),n(_);var y=s(_),b=e(y);f(e(b),{href:`https://huggingface.co/docs/transformers/model_doc/flan-t5`,rel:`nofollow`,children:(e,t)=>{c(),i(e,r(`Flan-T5`))},$$slots:{default:!0}}),n(b),c(2),n(y),n(l),i(t,a)},$$slots:{default:!0}});var ge=s(he,8);l(ge,{children:(e,t)=>{var n=ae();c(2),i(e,n)},$$slots:{default:!0}});var _e=s(ge,8);d(_e,{code:`%23%23%23%20Instruction%3A%0AYou%20are%20an%20advanced%20assistant%20that%20will%20transform%20this%20natural%20language%20text%20into%20a%20tripleset.%0A%23%23%23%20Input%3A%0ANews%20Brief%20-%20Atlanta%20Airport%20Flight%20Statistics%20for%20June%202003%0AIn%20June%202003%2C%20Hartsfield-Jackson%20Atlanta%20International%20Airport%20(Code%3A%20ATL)%20experienced%20a%20total%20of%2030%2C060%20flights.%20Out%20of%20these%2C%2023%2C974%20flights%20were%20on%20time%2C%20accounting%20for%20about%2079.7%25%20of%20the%20total%20flights.%20However%2C%20there%20were%205%2C843%20flights%20that%20faced%20delays%2C%20with%202%2C160%20being%20cancelled%20and%2027%20being%20diverted.%0A%23%23%23%20Response%3A%0A%7B%0A%20%20%22Airport%22%3A%20%7B%0A%20%20%20%20%22Name%22%3A%20%22Hartsfield-Jackson%20Atlanta%20International%20Airport%22%2C%0A%20%20%20%20%22Code%22%3A%20%22ATL%22%0A%20%20%7D%2C%0A%20%20%22Time%22%3A%20%7B%0A%20%20%20%20%22Month%22%3A%20%22June%22%2C%0A%20%20%20%20%22Year%22%3A%202003%0A%20%20%7D%2C%0A%20%20%22Statistics%22%3A%20%7B%0A%20%20%20%20%22Total%20Flights%22%3A%2030060%2C%0A%20%20%20%20%22On%20Time%20Flights%22%3A%2023974%2C%0A%20%20%20%20%22Delayed%20Flights%22%3A%205843%2C%0A%20%20%20%20%22Cancelled%20Flights%22%3A%202160%2C%0A%20%20%20%20%22Diverted%20Flights%22%3A%2027%2C%0A%20%20%20%20%22On%20Time%20Percentage%22%3A%2079.7%0A%20%20%7D%0A%7D`,lang:`text`});var ve=s(_e,20);d(ve,{code:`from%20transformers%20import%20AutoTokenizer%0A%0Atokenizer%20%3D%20AutoTokenizer.from_pretrained(%22meta-llama%2FLlama-2-7b-hf%22)%0Atokenizer.add_special_tokens(%5B%22%23%23%23%20Instruction%3A%22%2C%20%22%23%23%23%20Input%3A%22%5D)`,lang:`python`});var ye=s(ve,4);d(ye,{code:`%20model.resize_token_embeddings(len(tokenizer))`,lang:`python`});var K=s(ye,12);f(s(e(K)),{href:`https://github.com/huggingface/transformers`,rel:`nofollow`,children:(e,t)=>{c(),i(e,r(`transformers library`))},$$slots:{default:!0}}),c(),n(K);var be=s(K,2);d(be,{code:`from%20transformers%20import%20AutoTokenizer%0A%0Atokenizer%20%3D%20AutoTokenizer.from_pretrained(%22meta-llama%2FLlama-2-7b-hf%22)%0Atokens%20%3D%20tokenizer.encode(%22ChatGPT%20is%20great!%22)`,lang:`python`});var q=s(be,12),xe=s(e(q));f(xe,{href:`https://modal.com/docs/guide/images`,rel:`nofollow`,children:(e,t)=>{c(),i(e,r(`define and package your environment in code`))},$$slots:{default:!0}});var Se=s(xe,2);f(Se,{href:`https://modal.com/docs/guide/volumes#volume-basics`,rel:`nofollow`,children:(e,t)=>{c(),i(e,r(`cache your model weights`))},$$slots:{default:!0}}),f(s(Se,2),{href:`https://modal.com/docs/guide/gpu`,rel:`nofollow`,children:(e,t)=>{c(),i(e,r(`spawn up to 8 GPUs of any type`))},$$slots:{default:!0}}),c(),n(q);var J=s(q,8),Ce=s(e(J));f(Ce,{href:`https://github.com/huggingface/peft`,rel:`nofollow`,children:(e,t)=>{c(),i(e,r(`PEFT`))},$$slots:{default:!0}}),f(s(Ce,2),{href:`https://github.com/microsoft/LoRA`,rel:`nofollow`,children:(e,t)=>{c(),i(e,r(`Low-Rank Adaption (LoRA)`))},$$slots:{default:!0}}),c(),n(J);var Y=s(J,10);f(e(Y),{href:`https://arxiv.org/abs/2305.14314`,rel:`nofollow`,children:(e,t)=>{c(),i(e,r(`QLoRA`))},$$slots:{default:!0}}),c(),n(Y);var X=s(Y,8),we=e(X);f(we,{href:`https://github.com/microsoft/DeepSpeed`,rel:`nofollow`,children:(e,t)=>{c(),i(e,r(`DeepSpeed`))},$$slots:{default:!0}}),f(s(we,2),{href:`https://arxiv.org/abs/1910.02054`,rel:`nofollow`,children:(e,t)=>{c(),i(e,r(`ZeRO`))},$$slots:{default:!0}}),c(),n(X);var Z=s(X,8);f(e(Z),{href:`https://pytorch.org/blog/introducing-pytorch-fully-sharded-data-parallel-api/`,rel:`nofollow`,children:(e,t)=>{c(),i(e,r(`FSDP`))},$$slots:{default:!0}}),c(),n(Z);var Q=s(Z,6),Te=e(Q);f(Te,{href:`https://github.com/modal-labs/llm-finetuning/tree/main`,rel:`nofollow`,children:(e,t)=>{c(),i(e,r(`Modal’s llm-finetuning guide`))},$$slots:{default:!0}}),f(s(Te,2),{href:`https://github.com/modal-labs/llm-finetuning/blob/main/src/train.py#L94`,rel:`nofollow`,children:(e,t)=>{c(),i(e,r(`training with LoRA and Deepspeed`))},$$slots:{default:!0}}),c(),n(Q);var $=s(Q,2),Ee=e($);f(s(e(Ee)),{href:`https://github.com/huggingface/accelerate`,rel:`nofollow`,children:(e,t)=>{c(),i(e,r(`accelerate`))},$$slots:{default:!0}}),n(Ee),n($);var De=s($,8);f(s(e(De)),{href:`https://github.com/modal-labs/llm-finetuning/tree/main`,rel:`nofollow`,children:(e,t)=>{c(),i(e,r(`fine-tuning template`))},$$slots:{default:!0}}),c(),n(De),c(2),i(t,a)},$$slots:{default:!0}}))}export{E as default,g as metadata};
//# sourceMappingURL=B3-5kH15.js.map
