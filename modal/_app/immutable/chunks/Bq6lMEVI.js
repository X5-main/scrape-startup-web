(function(){try{var e=typeof window<`u`?window:typeof global<`u`?global:typeof globalThis<`u`?globalThis:typeof self<`u`?self:{};e.SENTRY_RELEASE={id:`f99fcf9f0a844cc9bd13fdc8e5782b84`};var t=new e.Error().stack;t&&(e._sentryDebugIds=e._sentryDebugIds||{},e._sentryDebugIds[t]=`c9a3daf8-a0bf-4702-8446-ebada63cce38`,e._sentryDebugIdIdentifier=`sentry-dbid-c9a3daf8-a0bf-4702-8446-ebada63cce38`)}catch{}})();import{$t as e,St as t,Tn as n,Tt as r,bt as i,c as ee,d as a,en as te,tn as o,wn as s}from"./F_ixKBiO.js";import"./B1sc9Zdx.js";import"./Bb2deiU3.js";import{t as c}from"./JPsrybyr.js";import{t as l}from"./BILrvr3I.js";import{t as u}from"./DeWGVqas2.js";import{t as d}from"./CdZDxCfO2.js";var f={title:`Fine-tuning a FLUX.1-dev style LoRA`,description:`How we fine-tuned FLUX.1-dev for style on the Heroicons library.`,authors:[{name:`Yiren Lu`,avatarUrl:`https://modal-cdn.com/ren-lu.jpg`,jobTitle:`Solutions Engineer`,twitterHandle:`YirenLu`}],date:`2024-12-20T12:00:00.000Z`,length:`15 minute read`,category:`Article`,subcategory:`Image and Video Models`,published:!0,layout:`blog`,toc:[{depth:2,value:`Table of contents`,id:`table-of-contents`},{depth:2,value:`Experiment quick facts:`,id:`experiment-quick-facts`},{depth:2,value:`Fine-tuning technique`,id:`fine-tuning-technique`},{depth:2,value:`Preparing the Dataset`,id:`preparing-the-dataset`},{depth:2,value:`Training on Modal`,id:`training-on-modal`,children:[{depth:3,value:`Setting up accounts`,id:`setting-up-accounts`}]},{depth:2,value:`Hyperparameter optimization`,id:`hyperparameter-optimization`,children:[{depth:3,value:`Performing hyperparameter search with Modal`,id:`performing-hyperparameter-search-with-modal`}]},{depth:2,value:`Results`,id:`results`,children:[{depth:4,value:`Learning rate 8e-5`,id:`learning-rate-8e-5`},{depth:4,value:`Learning rate 2e-4`,id:`learning-rate-2e-4`}]}],rawContent:`[FLUX.1-dev](https://huggingface.co/black-forest-labs/FLUX.1-dev), a 12B parameter model developed by [Black Forest Labs](https://blackforestlabs.ai/), is one of the hottest open-source text-to-image AI models on the market today.

But what if you want to use Flux to generate images that adhere to a specific artistic style or theme? Can you fine-tune Flux?

The answer is yes!

In [a previous blog post](/blog/fine-tuning-stable-diffusion), we fine-tuned Stable Diffusion 1.5 on [Heroicons](https://heroicons.com/), a set of freely-available icons from the makers of [Tailwind CSS](https://tailwindcss.com). Our results were decent, but a bit noisy and more detailed and complex than the very clean, abstract Heroicon style. The training also took on the order of hours, because we did a full fine-tune.

In this follow-up blog post, we switched to FLUX.1-dev and got better results. We fine-tuned it on Heroicons using the Dreambooth with LoRA technique. The Flux models are well-known for their superior performance in generating clean lines and text, which aligns with our results. We end up with a fine-tuned Flux style LoRA that allows us to generate an infinite icon library.

Here are some example output images:

![heroicon-fine-tuned](https://modal-public-assets.s3.us-east-1.amazonaws.com/article-assets/heroicons-fine-tuned-grid.jpg)

<modal-img-caption>
From top left: <code>Donald Trump</code>, <code>Beyonce</code>, <code>Barack Obama</code>,
<code>Hillary Clinton</code>, <code>cocktail</code>, <code>castle</code>, <code>phone</code>,
<code>tent</code>, <code>golden retriever</code>, <code>heart</code>, <code>Mt. Everest</code>, <code>dress</code>
</modal-img-caption>

You can play around with the LoRA yourself [here](https://modal-labs-ren-dev--example-dreambooth-flux-fastapi-app.modal.run).

We'll cover everything from curating the dataset to the GPU and fine-tuning technique used. Fine-tuning is run on [Modal](https://modal.com/docs), a scalable, serverless cloud computing platform that abstracts away the complexities of infrastructure management.

## Table of contents

- [Experiment quick facts](#experiment-quick-facts)
- [Fine-tuning technique](#fine-tuning-technique)
- [Preparing the dataset](#preparing-the-dataset)
- [Training on Modal](#training-on-modal)
- [Hyperparameter optimization](#hyperparameter-optimization)
- [Results](#results)

## Experiment quick facts:

- **Dataset:** [yirenlu/heroicons-subset-25-images](https://huggingface.co/datasets/yirenlu/heroicons-subset-25-images)
- **Number of training images:** 25
- **Training images format:** PNG
- **Resolution of training images:** 512x512
- **Fine-tuning technique:** Dreambooth LoRA
- **Fine-tuning script:** [Diffusers \`train_dreambooth_lora_flux.py\`](https://github.com/huggingface/diffusers/blob/abd922bd0c43a504e47eca2ed354c3634bd00834/examples/text_to_image/train_text_to_image.py)
  script
- **GPU:** 1 A100
- **Cost:** ~$2 for rank 16 LoRA for 4000 training steps
- **Hyperparameters:** See section on [hyperparameter optimization](#hyperparameter-optimization)
- **Replicating this experiment on Modal:**: [Example](/docs/examples/diffusers_lora_finetune)

## Fine-tuning technique

For our experiment, we use a fine-tuning technique called [Dreambooth](https://dreambooth.github.io/) that teaches Flux a new concept (i.e. a style or a character) by associating a special word with the example images. In particular, we use a LoRA implementation of Dreambooth that allows you to achieve full fine-tuning-like performance but with much less memory.

In LoRA fine-tuning, instead of updating all the parameters of a model during training, you introduce low-rank matrices that capture the essential changes needed for adaptation. During the fine-tuning process, only these low-rank "adapters" are updated. Then on inference, you load the base model, which remains unchanged, followed by the LoRA adapters. Compared to full fine-tuning, this approach offers faster training times and lower memory usage.

At this point, you might be wondering, how do you choose between full fine-tuning and LoRA fine-tuning?

**Generally speaking, the best practice is to start with LoRA fine-tuning, and then, if the results are not adequate, move on to full fine-tuning.**

You might have also heard of other optimization techniques like [qLoRA](/blog/lora-qlora), where the base model and the LoRA adapters are further quantized to cut down on memory usage.

Should you use qLoRA to fine-tune Flux?

The answer is that it's probably not necessary. You can run a LoRA fine-tune on a single A100 40GB GPU without needing to quantize down to 8-bits.

## Preparing the Dataset

![heroicon-training-data](https://modal-public-assets.s3.us-east-1.amazonaws.com/article-assets/heroicons-training-data.jpg)

<modal-img-caption>
Some examples of our training data
</modal-img-caption>

In our previous attempt at fine-tuning Heroicons, we used the entire 300+ Heroicons icons that are publically available as our training set.

With LoRA, we can fine-tune with fewer images. Instead of the hundreds we would need for full fine-tuning, we only need around 20-25 images, so we curate 25 images. Some things to note about the training data:

- **Variety of images:** For LoRA, more important than the number of images is the variety and representativeness of the images. For example, we deliberately choose icons that represent both tangible objects and more abstract concepts, as well as icons that contain both primarily straight lines/angles as well as curves.
- **Captioning:** To train a style LoRA, it's very helpful to provide individual captions for the images. The nice things about Heroicons is that each Heroicon image file is already named, so it's easy to convert those names into appropriate captions. Our captions take the form \`"an HCON, a black and white minimalist icon of a <object>."\` Note that this means that at inference time, we will need to prompt with something similar to the caption, i.e. \`"an HCON, a black and white minimalist icon of Barack Obama"\` in order to trigger the style.

3. **Dreambooth keyword:** As previously mentioned, Dreambooth is a technique that teaches Flux a new concept (i.e. a style or a character) by associating a special word with the example images. In our case, that special word is \`HCON\`. At inference time, \`HCON\` must be present in the prompt.

The final dataset used for our LoRA fine-tuning is [here](https://huggingface.co/datasets/yirenlu/heroicons-subset-25-images).

## Training on Modal

To fine-tune on Modal, we can adapt [this Dreambooth example](/docs/examples/diffusers_lora_finetune), which shows you how to run a [Diffusers](https://github.com/huggingface/diffusers) fine-tuning script on Modal.

Diffusers is a HuggingFace-produced library that provides a set of easy-to-use scripts for fine-tuning Diffusion models on custom datasets. You can see an up-to-date list of all their scripts in their
[\`examples\` subdirectory](https://github.com/huggingface/diffusers/tree/main/examples).

For this fine-tuning task, we will be using the
[\`train_dreambooth_lora_flux.py\`](https://github.com/huggingface/diffusers/blob/abd922bd0c43a504e47eca2ed354c3634bd00834/examples/text_to_image/train_text_to_image.py)
script. This script does a Dreambooth fine-tune with LoRA.

### Setting up accounts

If you're following along or using this blog post as a template for your own fine-tuning experiments,
make sure you have the following set up before you use the scripts above:

- A HuggingFace account (sign up [here](https://huggingface.co/join) if you don't have one).
- A Modal account (sign up [here](https://modal.com/signup) if you don't have one).

## Hyperparameter optimization

Fine-tuning a model is highly sensitive to the selection of hyperparameters. These parameters significantly influence the training process and the final performance of the model. Key hyperparameters to consider include the number of training steps, the learning rate, and, specifically for LoRA fine-tuning, the rank. In our experiments, we explored a range of values around commonly used configurations, varying the following parameters:

- **Rank**: The higher the rank chosen, the closer it approximates full fine-tuning. On the other hand, the higher the rank chosen, the more memory and time it takes to train. In general, the LoRA rank chosen should correspond to the complexity of the style. For simpler styles, you can probably get away with ranks like \`4\`, \`8,\` or \`16\`. For more complex styles, you will probably need rank \`32\` or \`64\`. In general, training a style LoRA requires a higher rank than training a character LoRA. This makes intuitive sense - style LoRAs need to capture more nuanced details.

- **Learning Rate**: The standard learning rate for full fine-tuning of Diffusion models is typically set at \`1e-6\`. LoRA fine-tuning, however, generally allows for higher learning rates, because it only updates a small subset of parameters compared to full fine-tuning, making it less prone to overfitting.

- **Max training steps**: This parameter defines the total number of training iterations the model will undergo. A full fine-tune of a diffusion model will often require 10,000 steps, but you can generally get pretty good LoRA results in less than 5000 steps.

In addition to these primary hyperparameters, we also utilized the following hyperparameters:

\`\`\`python
resolution: int = 512
train_batch_size: int = 1
gradient_accumulation_steps: int = 1
lr_scheduler: str = "constant"
lr_warmup_steps: int = 0
seed: int = 0
\`\`\`

### Performing hyperparameter search with Modal

Modal makes it easy to scale up our training
-- running tens or hundreds, etc, of copies of the training script at once,
each with different hyperparameters.

To do this, we first set up a Python class with the different hyperparameter values we want to search through.

\`\`\`python
@dataclass
class SweepConfig(TrainConfig):
"""Configuration for hyperparameter sweep"""

# Sweep parameters
learning_rates = [8e-5, 2e-4]
train_steps = [1000, 1500, 3000, 4000]
ranks = [4, 8, 16]
\`\`\`

Next, we write a function that generates all possible combinations of the hyperparameters:

\`\`\`python
def generate_sweep_configs(sweep_config: SweepConfig):
"""Generate all combinations of hyperparameters"""
param_combinations = itertools.product(
    sweep_config.learning_rates,
    sweep_config.train_steps,
    sweep_config.ranks,
)

return [
    {
        "learning_rate": lr,
        "max_train_steps": steps,
        "rank": rank,
        "output_dir": Path(MODEL_DIR)
        / f"lr_{lr}_steps_{steps}_rank_{rank}", # store the different LoRAs in different directories within the same volume
    }
    for lr, steps, rank in param_combinations
]
\`\`\`

Finally, we use the local entrypoint to orchestrate the hyperparameter sweep using [\`.map()\`](/docs/guide/scale#parallel-execution-of-inputs):

\`\`\`python
@app.local_entrypoint()
def run()
import wandb

sweep_config = SweepConfig()
app_config = AppConfig()
configs = generate_sweep_configs(sweep_config)

results_by_rank = {}  # Dictionary to store results for each rank

# Log results to wandb
with wandb.init(
    project="flux-lora-sweep-heroicons",
    name="hyperparameter_sweep",
) as run:
    for config in train.map(configs):

        learning_rate = config['learning_rate']
        rank = config['rank']
        max_train_steps = config['max_train_steps']

        for image, prompt in Model(
            learning_rate, rank, max_train_steps
        ).inference.starmap(
            [(x, app_config) for x in sweep_config.heroicon_test_prompts]
        ):
            results_by_rank[rank][prompt][steps] = wandb.Image(image)

    # log results to wandb
    run.log()
\`\`\`

## Results

#### Learning rate \`8e-5\`

Below, we see the results across rank 4, 8, and 16 for a progressive number of training steps.

![lr_8e-5_rank_4](https://modal-public-assets.s3.us-east-1.amazonaws.com/article-assets/lr_8e-5_rank_4.jpg)

![lr_8e-5_rank_8](https://modal-public-assets.s3.us-east-1.amazonaws.com/article-assets/lr_8e-5_rank_8.jpg)

![lr_8e-5_rank_16](https://modal-public-assets.s3.us-east-1.amazonaws.com/article-assets/lr_8e-5_rank_16.jpg)

#### Learning rate \`2e-4\`

Below, we see the results across rank 4, 8, and 16 for a progressive number of training steps.

![lr_2e-4_rank_4](https://modal-public-assets.s3.us-east-1.amazonaws.com/article-assets/lr_2e-4_rank_4.jpg)

![lr_2e-4_rank_8](https://modal-public-assets.s3.us-east-1.amazonaws.com/article-assets/lr_2e-4_rank_8.jpg)

![lr_2e-4_rank_16](https://modal-public-assets.s3.us-east-1.amazonaws.com/article-assets/lr_2e-4_rank_16.jpg)

There's obviously a lot of subjectivity when it comes to deciding which hyperparameter combination gives the best results, but to our eyes, at least, it appears that the LoRA with rank \`16\`, trained for \`4000\` steps at a learning rate of \`2e-4\` (the last image), gives the best results in terms of being clean, well-structured, and appropriately representing the prompt concept.

Some further observations:

- There's some overfitting and graininess with the lower learning rates, particularly when trained for an extended number of steps.
- Although the general guideline suggests that simpler styles require lower ranks, our findings indicate that the lower ranks produced results that were unexpectedly more complex and noisy. It seems that a higher rank was necessary to effectively capture the true "style" of Heroicons, which are inherently abstract and conceptual icons.
- The base \`FLUX.1-dev\` model was initially trained on \`1024x1024\` images, while our dataset consisted of lower-resolution \`512x512\` images. As a potential improvement, we could consider resizing our fine-tuning dataset to \`1024x1024\` to evaluate whether the outputs improve.
`,meta:{description:`How we fine-tuned FLUX.1-dev for style on the Heroicons library.`}},{title:p,description:m,authors:h,date:g,length:_,category:v,subcategory:y,published:b,layout:x,toc:S,rawContent:C,meta:w}=f,T=t(`Diffusers <code>train_dreambooth_lora_flux.py</code>`,1),ne=t(`<code>examples</code> subdirectory`,1),re=t(`<code>train_dreambooth_lora_flux.py</code>`),ie=t(`<code>.map()</code>`),ae=t(`<p><!>, a 12B parameter model developed by <!>, is one of the hottest open-source text-to-image AI models on the market today.</p> <p>But what if you want to use Flux to generate images that adhere to a specific artistic style or theme? Can you fine-tune Flux?</p> <p>The answer is yes!</p> <p>In <!>, we fine-tuned Stable Diffusion 1.5 on <!>, a set of freely-available icons from the makers of <!>. Our results were decent, but a bit noisy and more detailed and complex than the very clean, abstract Heroicon style. The training also took on the order of hours, because we did a full fine-tune.</p> <p>In this follow-up blog post, we switched to FLUX.1-dev and got better results. We fine-tuned it on Heroicons using the Dreambooth with LoRA technique. The Flux models are well-known for their superior performance in generating clean lines and text, which aligns with our results. We end up with a fine-tuned Flux style LoRA that allows us to generate an infinite icon library.</p> <p>Here are some example output images:</p> <p><!></p> <modal-img-caption>From top left: <code>Donald Trump</code>, <code>Beyonce</code>, <code>Barack Obama</code>, <code>Hillary Clinton</code>, <code>cocktail</code>, <code>castle</code>, <code>phone</code>, <code>tent</code>, <code>golden retriever</code>, <code>heart</code>, <code>Mt. Everest</code>, <code>dress</code></modal-img-caption> <p>You can play around with the LoRA yourself <!>.</p> <p>We’ll cover everything from curating the dataset to the GPU and fine-tuning technique used. Fine-tuning is run on <!>, a scalable, serverless cloud computing platform that abstracts away the complexities of infrastructure management.</p> <h2 id="table-of-contents">Table of contents</h2> <ul><li><!></li> <li><!></li> <li><!></li> <li><!></li> <li><!></li> <li><!></li></ul> <h2 id="experiment-quick-facts">Experiment quick facts:</h2> <ul><li><strong>Dataset:</strong> <!></li> <li><strong>Number of training images:</strong> 25</li> <li><strong>Training images format:</strong> PNG</li> <li><strong>Resolution of training images:</strong> 512x512</li> <li><strong>Fine-tuning technique:</strong> Dreambooth LoRA</li> <li><strong>Fine-tuning script:</strong> <!> script</li> <li><strong>GPU:</strong> 1 A100</li> <li><strong>Cost:</strong> ~$2 for rank 16 LoRA for 4000 training steps</li> <li><strong>Hyperparameters:</strong> See section on <!></li> <li><strong>Replicating this experiment on Modal:</strong>: <!></li></ul> <h2 id="fine-tuning-technique">Fine-tuning technique</h2> <p>For our experiment, we use a fine-tuning technique called <!> that teaches Flux a new concept (i.e. a style or a character) by associating a special word with the example images. In particular, we use a LoRA implementation of Dreambooth that allows you to achieve full fine-tuning-like performance but with much less memory.</p> <p>In LoRA fine-tuning, instead of updating all the parameters of a model during training, you introduce low-rank matrices that capture the essential changes needed for adaptation. During the fine-tuning process, only these low-rank “adapters” are updated. Then on inference, you load the base model, which remains unchanged, followed by the LoRA adapters. Compared to full fine-tuning, this approach offers faster training times and lower memory usage.</p> <p>At this point, you might be wondering, how do you choose between full fine-tuning and LoRA fine-tuning?</p> <p><strong>Generally speaking, the best practice is to start with LoRA fine-tuning, and then, if the results are not adequate, move on to full fine-tuning.</strong></p> <p>You might have also heard of other optimization techniques like <!>, where the base model and the LoRA adapters are further quantized to cut down on memory usage.</p> <p>Should you use qLoRA to fine-tune Flux?</p> <p>The answer is that it’s probably not necessary. You can run a LoRA fine-tune on a single A100 40GB GPU without needing to quantize down to 8-bits.</p> <h2 id="preparing-the-dataset">Preparing the Dataset</h2> <p><!></p> <modal-img-caption>Some examples of our training data</modal-img-caption> <p>In our previous attempt at fine-tuning Heroicons, we used the entire 300+ Heroicons icons that are publically available as our training set.</p> <p>With LoRA, we can fine-tune with fewer images. Instead of the hundreds we would need for full fine-tuning, we only need around 20-25 images, so we curate 25 images. Some things to note about the training data:</p> <ul><li><strong>Variety of images:</strong> For LoRA, more important than the number of images is the variety and representativeness of the images. For example, we deliberately choose icons that represent both tangible objects and more abstract concepts, as well as icons that contain both primarily straight lines/angles as well as curves.</li> <li><strong>Captioning:</strong> To train a style LoRA, it’s very helpful to provide individual captions for the images. The nice things about Heroicons is that each Heroicon image file is already named, so it’s easy to convert those names into appropriate captions. Our captions take the form <code>"an HCON, a black and white minimalist icon of a &lt;object&gt;."</code> Note that this means that at inference time, we will need to prompt with something similar to the caption, i.e. <code>"an HCON, a black and white minimalist icon of Barack Obama"</code> in order to trigger the style.</li></ul> <ol start="3"><li><strong>Dreambooth keyword:</strong> As previously mentioned, Dreambooth is a technique that teaches Flux a new concept (i.e. a style or a character) by associating a special word with the example images. In our case, that special word is <code>HCON</code>. At inference time, <code>HCON</code> must be present in the prompt.</li></ol> <p>The final dataset used for our LoRA fine-tuning is <!>.</p> <h2 id="training-on-modal">Training on Modal</h2> <p>To fine-tune on Modal, we can adapt <!>, which shows you how to run a <!> fine-tuning script on Modal.</p> <p>Diffusers is a HuggingFace-produced library that provides a set of easy-to-use scripts for fine-tuning Diffusion models on custom datasets. You can see an up-to-date list of all their scripts in their <!>.</p> <p>For this fine-tuning task, we will be using the <!> script. This script does a Dreambooth fine-tune with LoRA.</p> <h3 id="setting-up-accounts">Setting up accounts</h3> <p>If you’re following along or using this blog post as a template for your own fine-tuning experiments,
make sure you have the following set up before you use the scripts above:</p> <ul><li>A HuggingFace account (sign up <!> if you don’t have one).</li> <li>A Modal account (sign up <!> if you don’t have one).</li></ul> <h2 id="hyperparameter-optimization">Hyperparameter optimization</h2> <p>Fine-tuning a model is highly sensitive to the selection of hyperparameters. These parameters significantly influence the training process and the final performance of the model. Key hyperparameters to consider include the number of training steps, the learning rate, and, specifically for LoRA fine-tuning, the rank. In our experiments, we explored a range of values around commonly used configurations, varying the following parameters:</p> <ul><li><p><strong>Rank</strong>: The higher the rank chosen, the closer it approximates full fine-tuning. On the other hand, the higher the rank chosen, the more memory and time it takes to train. In general, the LoRA rank chosen should correspond to the complexity of the style. For simpler styles, you can probably get away with ranks like <code>4</code>, <code>8,</code> or <code>16</code>. For more complex styles, you will probably need rank <code>32</code> or <code>64</code>. In general, training a style LoRA requires a higher rank than training a character LoRA. This makes intuitive sense - style LoRAs need to capture more nuanced details.</p></li> <li><p><strong>Learning Rate</strong>: The standard learning rate for full fine-tuning of Diffusion models is typically set at <code>1e-6</code>. LoRA fine-tuning, however, generally allows for higher learning rates, because it only updates a small subset of parameters compared to full fine-tuning, making it less prone to overfitting.</p></li> <li><p><strong>Max training steps</strong>: This parameter defines the total number of training iterations the model will undergo. A full fine-tune of a diffusion model will often require 10,000 steps, but you can generally get pretty good LoRA results in less than 5000 steps.</p></li></ul> <p>In addition to these primary hyperparameters, we also utilized the following hyperparameters:</p> <!> <h3 id="performing-hyperparameter-search-with-modal">Performing hyperparameter search with Modal</h3> <p>Modal makes it easy to scale up our training
— running tens or hundreds, etc, of copies of the training script at once,
each with different hyperparameters.</p> <p>To do this, we first set up a Python class with the different hyperparameter values we want to search through.</p> <!> <p>Next, we write a function that generates all possible combinations of the hyperparameters:</p> <!> <p>Finally, we use the local entrypoint to orchestrate the hyperparameter sweep using <!>:</p> <!> <h2 id="results">Results</h2> <h4 id="learning-rate-8e-5">Learning rate <code>8e-5</code></h4> <p>Below, we see the results across rank 4, 8, and 16 for a progressive number of training steps.</p> <p><!></p> <p><!></p> <p><!></p> <h4 id="learning-rate-2e-4">Learning rate <code>2e-4</code></h4> <p>Below, we see the results across rank 4, 8, and 16 for a progressive number of training steps.</p> <p><!></p> <p><!></p> <p><!></p> <p>There’s obviously a lot of subjectivity when it comes to deciding which hyperparameter combination gives the best results, but to our eyes, at least, it appears that the LoRA with rank <code>16</code>, trained for <code>4000</code> steps at a learning rate of <code>2e-4</code> (the last image), gives the best results in terms of being clean, well-structured, and appropriately representing the prompt concept.</p> <p>Some further observations:</p> <ul><li>There’s some overfitting and graininess with the lower learning rates, particularly when trained for an extended number of steps.</li> <li>Although the general guideline suggests that simpler styles require lower ranks, our findings indicate that the lower ranks produced results that were unexpectedly more complex and noisy. It seems that a higher rank was necessary to effectively capture the true “style” of Heroicons, which are inherently abstract and conceptual icons.</li> <li>The base <code>FLUX.1-dev</code> model was initially trained on <code>1024x1024</code> images, while our dataset consisted of lower-resolution <code>512x512</code> images. As a potential improvement, we could consider resizing our fine-tuning dataset to <code>1024x1024</code> to evaluate whether the outputs improve.</li></ul>`,3);function E(t,p){let m=ee(p,[`children`,`$$slots`,`$$events`,`$$legacy`]);d(t,a(()=>m,()=>f,{children:(t,ee)=>{var a=ae(),d=te(a),f=e(d);u(f,{href:`https://huggingface.co/black-forest-labs/FLUX.1-dev`,rel:`nofollow`,children:(e,t)=>{s(),i(e,r(`FLUX.1-dev`))},$$slots:{default:!0}}),u(o(f,2),{href:`https://blackforestlabs.ai/`,rel:`nofollow`,children:(e,t)=>{s(),i(e,r(`Black Forest Labs`))},$$slots:{default:!0}}),s(),n(d);var p=o(d,6),m=o(e(p));u(m,{href:`/blog/fine-tuning-stable-diffusion`,children:(e,t)=>{s(),i(e,r(`a previous blog post`))},$$slots:{default:!0}});var h=o(m,2);u(h,{href:`https://heroicons.com/`,rel:`nofollow`,children:(e,t)=>{s(),i(e,r(`Heroicons`))},$$slots:{default:!0}}),u(o(h,2),{href:`https://tailwindcss.com`,rel:`nofollow`,children:(e,t)=>{s(),i(e,r(`Tailwind CSS`))},$$slots:{default:!0}}),s(),n(p);var g=o(p,6);c(e(g),{src:`https://modal-public-assets.s3.us-east-1.amazonaws.com/article-assets/heroicons-fine-tuned-grid.jpg`,alt:`heroicon-fine-tuned`}),n(g);var _=o(o(g,2),2);u(o(e(_)),{href:`https://modal-labs-ren-dev--example-dreambooth-flux-fastapi-app.modal.run`,rel:`nofollow`,children:(e,t)=>{s(),i(e,r(`here`))},$$slots:{default:!0}}),s(),n(_);var v=o(_,2);u(o(e(v)),{href:`https://modal.com/docs`,rel:`nofollow`,children:(e,t)=>{s(),i(e,r(`Modal`))},$$slots:{default:!0}}),s(),n(v);var y=o(v,4),b=e(y);u(e(b),{href:`#experiment-quick-facts`,children:(e,t)=>{s(),i(e,r(`Experiment quick facts`))},$$slots:{default:!0}}),n(b);var x=o(b,2);u(e(x),{href:`#fine-tuning-technique`,children:(e,t)=>{s(),i(e,r(`Fine-tuning technique`))},$$slots:{default:!0}}),n(x);var S=o(x,2);u(e(S),{href:`#preparing-the-dataset`,children:(e,t)=>{s(),i(e,r(`Preparing the dataset`))},$$slots:{default:!0}}),n(S);var C=o(S,2);u(e(C),{href:`#training-on-modal`,children:(e,t)=>{s(),i(e,r(`Training on Modal`))},$$slots:{default:!0}}),n(C);var w=o(C,2);u(e(w),{href:`#hyperparameter-optimization`,children:(e,t)=>{s(),i(e,r(`Hyperparameter optimization`))},$$slots:{default:!0}}),n(w);var E=o(w,2);u(e(E),{href:`#results`,children:(e,t)=>{s(),i(e,r(`Results`))},$$slots:{default:!0}}),n(E),n(y);var D=o(y,4),O=e(D);u(o(e(O),2),{href:`https://huggingface.co/datasets/yirenlu/heroicons-subset-25-images`,rel:`nofollow`,children:(e,t)=>{s(),i(e,r(`yirenlu/heroicons-subset-25-images`))},$$slots:{default:!0}}),n(O);var k=o(O,10);u(o(e(k),2),{href:`https://github.com/huggingface/diffusers/blob/abd922bd0c43a504e47eca2ed354c3634bd00834/examples/text_to_image/train_text_to_image.py`,rel:`nofollow`,children:(e,t)=>{s();var n=T();s(),i(e,n)},$$slots:{default:!0}}),s(),n(k);var A=o(k,6);u(o(e(A),2),{href:`#hyperparameter-optimization`,children:(e,t)=>{s(),i(e,r(`hyperparameter optimization`))},$$slots:{default:!0}}),n(A);var j=o(A,2);u(o(e(j),2),{href:`/docs/examples/diffusers_lora_finetune`,children:(e,t)=>{s(),i(e,r(`Example`))},$$slots:{default:!0}}),n(j),n(D);var M=o(D,4);u(o(e(M)),{href:`https://dreambooth.github.io/`,rel:`nofollow`,children:(e,t)=>{s(),i(e,r(`Dreambooth`))},$$slots:{default:!0}}),s(),n(M);var N=o(M,8);u(o(e(N)),{href:`/blog/lora-qlora`,children:(e,t)=>{s(),i(e,r(`qLoRA`))},$$slots:{default:!0}}),s(),n(N);var P=o(N,8);c(e(P),{src:`https://modal-public-assets.s3.us-east-1.amazonaws.com/article-assets/heroicons-training-data.jpg`,alt:`heroicon-training-data`}),n(P);var F=o(o(P,2),10);u(o(e(F)),{href:`https://huggingface.co/datasets/yirenlu/heroicons-subset-25-images`,rel:`nofollow`,children:(e,t)=>{s(),i(e,r(`here`))},$$slots:{default:!0}}),s(),n(F);var I=o(F,4),L=o(e(I));u(L,{href:`/docs/examples/diffusers_lora_finetune`,children:(e,t)=>{s(),i(e,r(`this Dreambooth example`))},$$slots:{default:!0}}),u(o(L,2),{href:`https://github.com/huggingface/diffusers`,rel:`nofollow`,children:(e,t)=>{s(),i(e,r(`Diffusers`))},$$slots:{default:!0}}),s(),n(I);var R=o(I,2);u(o(e(R)),{href:`https://github.com/huggingface/diffusers/tree/main/examples`,rel:`nofollow`,children:(e,t)=>{var n=ne();s(),i(e,n)},$$slots:{default:!0}}),s(),n(R);var z=o(R,2);u(o(e(z)),{href:`https://github.com/huggingface/diffusers/blob/abd922bd0c43a504e47eca2ed354c3634bd00834/examples/text_to_image/train_text_to_image.py`,rel:`nofollow`,children:(e,t)=>{i(e,re())},$$slots:{default:!0}}),s(),n(z);var B=o(z,6),V=e(B);u(o(e(V)),{href:`https://huggingface.co/join`,rel:`nofollow`,children:(e,t)=>{s(),i(e,r(`here`))},$$slots:{default:!0}}),s(),n(V);var H=o(V,2);u(o(e(H)),{href:`https://modal.com/signup`,rel:`nofollow`,children:(e,t)=>{s(),i(e,r(`here`))},$$slots:{default:!0}}),s(),n(H),n(B);var U=o(B,10);l(U,{code:`resolution%3A%20int%20%3D%20512%0Atrain_batch_size%3A%20int%20%3D%201%0Agradient_accumulation_steps%3A%20int%20%3D%201%0Alr_scheduler%3A%20str%20%3D%20%22constant%22%0Alr_warmup_steps%3A%20int%20%3D%200%0Aseed%3A%20int%20%3D%200`,lang:`python`});var W=o(U,8);l(W,{code:`%40dataclass%0Aclass%20SweepConfig(TrainConfig)%3A%0A%22%22%22Configuration%20for%20hyperparameter%20sweep%22%22%22%0A%0A%23%20Sweep%20parameters%0Alearning_rates%20%3D%20%5B8e-5%2C%202e-4%5D%0Atrain_steps%20%3D%20%5B1000%2C%201500%2C%203000%2C%204000%5D%0Aranks%20%3D%20%5B4%2C%208%2C%2016%5D`,lang:`python`});var G=o(W,4);l(G,{code:`def%20generate_sweep_configs(sweep_config%3A%20SweepConfig)%3A%0A%22%22%22Generate%20all%20combinations%20of%20hyperparameters%22%22%22%0Aparam_combinations%20%3D%20itertools.product(%0A%20%20%20%20sweep_config.learning_rates%2C%0A%20%20%20%20sweep_config.train_steps%2C%0A%20%20%20%20sweep_config.ranks%2C%0A)%0A%0Areturn%20%5B%0A%20%20%20%20%7B%0A%20%20%20%20%20%20%20%20%22learning_rate%22%3A%20lr%2C%0A%20%20%20%20%20%20%20%20%22max_train_steps%22%3A%20steps%2C%0A%20%20%20%20%20%20%20%20%22rank%22%3A%20rank%2C%0A%20%20%20%20%20%20%20%20%22output_dir%22%3A%20Path(MODEL_DIR)%0A%20%20%20%20%20%20%20%20%2F%20f%22lr_%7Blr%7D_steps_%7Bsteps%7D_rank_%7Brank%7D%22%2C%20%23%20store%20the%20different%20LoRAs%20in%20different%20directories%20within%20the%20same%20volume%0A%20%20%20%20%7D%0A%20%20%20%20for%20lr%2C%20steps%2C%20rank%20in%20param_combinations%0A%5D`,lang:`python`});var K=o(G,2);u(o(e(K)),{href:`/docs/guide/scale#parallel-execution-of-inputs`,children:(e,t)=>{i(e,ie())},$$slots:{default:!0}}),s(),n(K);var q=o(K,2);l(q,{code:`%40app.local_entrypoint()%0Adef%20run()%0Aimport%20wandb%0A%0Asweep_config%20%3D%20SweepConfig()%0Aapp_config%20%3D%20AppConfig()%0Aconfigs%20%3D%20generate_sweep_configs(sweep_config)%0A%0Aresults_by_rank%20%3D%20%7B%7D%20%20%23%20Dictionary%20to%20store%20results%20for%20each%20rank%0A%0A%23%20Log%20results%20to%20wandb%0Awith%20wandb.init(%0A%20%20%20%20project%3D%22flux-lora-sweep-heroicons%22%2C%0A%20%20%20%20name%3D%22hyperparameter_sweep%22%2C%0A)%20as%20run%3A%0A%20%20%20%20for%20config%20in%20train.map(configs)%3A%0A%0A%20%20%20%20%20%20%20%20learning_rate%20%3D%20config%5B'learning_rate'%5D%0A%20%20%20%20%20%20%20%20rank%20%3D%20config%5B'rank'%5D%0A%20%20%20%20%20%20%20%20max_train_steps%20%3D%20config%5B'max_train_steps'%5D%0A%0A%20%20%20%20%20%20%20%20for%20image%2C%20prompt%20in%20Model(%0A%20%20%20%20%20%20%20%20%20%20%20%20learning_rate%2C%20rank%2C%20max_train_steps%0A%20%20%20%20%20%20%20%20).inference.starmap(%0A%20%20%20%20%20%20%20%20%20%20%20%20%5B(x%2C%20app_config)%20for%20x%20in%20sweep_config.heroicon_test_prompts%5D%0A%20%20%20%20%20%20%20%20)%3A%0A%20%20%20%20%20%20%20%20%20%20%20%20results_by_rank%5Brank%5D%5Bprompt%5D%5Bsteps%5D%20%3D%20wandb.Image(image)%0A%0A%20%20%20%20%23%20log%20results%20to%20wandb%0A%20%20%20%20run.log()`,lang:`python`});var J=o(q,8);c(e(J),{src:`https://modal-public-assets.s3.us-east-1.amazonaws.com/article-assets/lr_8e-5_rank_4.jpg`,alt:`lr_8e-5_rank_4`}),n(J);var Y=o(J,2);c(e(Y),{src:`https://modal-public-assets.s3.us-east-1.amazonaws.com/article-assets/lr_8e-5_rank_8.jpg`,alt:`lr_8e-5_rank_8`}),n(Y);var X=o(Y,2);c(e(X),{src:`https://modal-public-assets.s3.us-east-1.amazonaws.com/article-assets/lr_8e-5_rank_16.jpg`,alt:`lr_8e-5_rank_16`}),n(X);var Z=o(X,6);c(e(Z),{src:`https://modal-public-assets.s3.us-east-1.amazonaws.com/article-assets/lr_2e-4_rank_4.jpg`,alt:`lr_2e-4_rank_4`}),n(Z);var Q=o(Z,2);c(e(Q),{src:`https://modal-public-assets.s3.us-east-1.amazonaws.com/article-assets/lr_2e-4_rank_8.jpg`,alt:`lr_2e-4_rank_8`}),n(Q);var $=o(Q,2);c(e($),{src:`https://modal-public-assets.s3.us-east-1.amazonaws.com/article-assets/lr_2e-4_rank_16.jpg`,alt:`lr_2e-4_rank_16`}),n($),s(6),i(t,a)},$$slots:{default:!0}}))}export{E as default,f as metadata};
//# sourceMappingURL=Bq6lMEVI.js.map
