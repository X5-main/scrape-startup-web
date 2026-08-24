(function(){try{var e=typeof window<`u`?window:typeof global<`u`?global:typeof globalThis<`u`?globalThis:typeof self<`u`?self:{};e.SENTRY_RELEASE={id:`f99fcf9f0a844cc9bd13fdc8e5782b84`};var t=new e.Error().stack;t&&(e._sentryDebugIds=e._sentryDebugIds||{},e._sentryDebugIds[t]=`fed23fdb-1d8b-49b6-aa2b-f0974ff98b4b`,e._sentryDebugIdIdentifier=`sentry-dbid-fed23fdb-1d8b-49b6-aa2b-f0974ff98b4b`)}catch{}})();import{$t as e,St as t,Tn as n,Tt as r,bt as i,c as ee,d as a,en as o,tn as s,wn as c}from"./F_ixKBiO.js";import"./B1sc9Zdx.js";import"./Bb2deiU3.js";import{a as l,i as u,o as te}from"./CPby7b1n.js";import{n as d}from"./JPsrybyr.js";import{t as f}from"./BILrvr3I.js";import{t as p}from"./B4L_if842.js";import{t as m}from"./DeWGVqas2.js";var h={toc:[{depth:1,value:`Fine-tune Whisper to Improve Transcription on Domain-Specific Vocab`,id:`fine-tune-whisper-to-improve-transcription-on-domain-specific-vocab`,children:[{depth:2,value:`Setup`,id:`setup`,children:[{depth:3,value:`Set up the container image`,id:`set-up-the-container-image`},{depth:3,value:`Storing data on Modal`,id:`storing-data-on-modal`}]},{depth:2,value:`Training`,id:`training`,children:[{depth:3,value:`Defining our training Function`,id:`defining-our-training-function`}]},{depth:2,value:`Calling a Modal function from the command line`,id:`calling-a-modal-function-from-the-command-line`},{depth:2,value:`Deploying our fine-tuned model for inference`,id:`deploying-our-fine-tuned-model-for-inference`},{depth:2,value:`Support code`,id:`support-code`}]}],rawContent:`# Fine-tune Whisper to Improve Transcription on Domain-Specific Vocab

This example demonstrates how to fine-tune an ASR model
([whisper-tiny.en](https://huggingface.co/openai/whisper-tiny.en))
and deploy it for inference using Modal.

Speech recognition models work well out-of-the-box for general speech transcription,
but can struggle with examples that are not well represented in the training data -
like proper nouns, technical jargon, and industry-specific terms. Fine-tuning with
examples of domain-specific vocabulary can improve transcription of these terms.

For example, here is a sample transcription from the baseline model with no
fine-tuning:

|                  | Transcription                                                 |
|------------------|---------------------------------------------------------------|
| **Ground Truth** | "deuterium you put into one element you make a new element"   |
| **Prediction**   | "the theorem you put into one element you make a new element" |

After just 1.5 hours of training on a small dataset (~7k samples), the model has
already improved:

|                  | Transcription                                               |
|------------------|-------------------------------------------------------------|
| **Ground Truth** | "deuterium you put into one element you make a new element" |
| **Prediction**   | "deuterium you put into one element you make a new element" |

We'll use the "small" subset of "Science and Technology" from the
[GigaSpeech](https://huggingface.co/datasets/speechcolab/gigaspeech)
dataset, which is enough data to see the model improve on scientific terms in just a
few epochs.

Note: GigaSpeech is a
[gated model](https://huggingface.co/docs/hub/en/models-gated),
so you'll need to accept the terms on the
[dataset card](https://huggingface.co/datasets/speechcolab/gigaspeech)
and create a
[Hugging Face Secret](https://modal.com/secrets/)
to download it.

## Setup

We start by importing our standard library dependencies, \`fastapi\`, and \`modal\`.

We also need an [\`App\`](https://modal.com/docs/guide/apps) object, which we'll use to
define how our training application will run on Modal's cloud infrastructure.

\`\`\`python
import functools
import io
import os
from dataclasses import dataclass
from pathlib import Path
from typing import Annotated, Any, Union

import fastapi
import modal

MINUTES = 60
HOURS = 60 * MINUTES

app = modal.App(name="example-whisper-fine-tune")

\`\`\`

### Set up the container image

We define the environment where our functions will run by building up a base
[container \`Image\`](https://modal.com/docs/guide/images)
with our dependencies using \`Image.uv_pip_install\`. We also set environment variables
here using \`Image.env\`, like the Hugging Face cache directory.

\`\`\`python
CACHE_DIR = "/cache"
image = (
    modal.Image.debian_slim(python_version="3.12")
    .uv_pip_install(
        "accelerate==1.8.1",
        "datasets==3.6.0",
        "evaluate==0.4.5",
        "fastapi[standard]==0.116.1",
        "huggingface-hub==0.36.0",
        "jiwer==4.0.0",
        "librosa==0.11.0",
        "torch==2.7.1",
        "torchaudio==2.7.1",
        "transformers==4.53.2",
        "whisper_normalizer==0.1.12",
    )
    .env(
        {
            "HF_XET_HIGH_PERFORMANCE": "1",  # Faster downloads from Hugging Face
            "HF_HOME": CACHE_DIR,
        }
    )
)

\`\`\`

Next we'll import the dependencies we need for the code that will run on Modal.

The \`image.imports()\` context manager ensures these imports are available when our
Functions run in the cloud, without the need to install the dependencies locally.

\`\`\`python
with image.imports():
    import datasets
    import evaluate
    import librosa
    import torch
    import transformers
    from whisper_normalizer.english import EnglishTextNormalizer

\`\`\`

### Storing data on Modal

We use
[Modal Volumes](https://modal.com/docs/guide/volumes)
for data we want to persist across function calls. In this case, we'll create a cache
Volume for storing Hugging Face downloads for faster subsequent loads, and an output
Volume for saving our model and metrics after training.

\`\`\`python
cache_volume = modal.Volume.from_name("hf-hub-cache", create_if_missing=True)
output_volume = modal.Volume.from_name(
    "fine-tune-asr-example-volume",
    create_if_missing=True,
)
OUTPUT_DIR = "/outputs"
volumes = {CACHE_DIR: cache_volume, OUTPUT_DIR: output_volume}

\`\`\`

## Training

We use a \`dataclass\` to collect some of the training parameters in one place. Here we
set \`model_output_name\` which is the directory on the Volume where our model will be
saved, and where we'll load it from when deploying the model for inference.

\`\`\`python
@dataclass
class Config:
    """Training configuration."""

    model_output_name: str = "whisper-fine-tune"  # Name used for saving and loading

    # Model config
    model_name: str = "openai/whisper-tiny.en"

    # Dataset config
    dataset_name: str = "speechcolab/gigaspeech"
    dataset_subset: str = "s"  # "xs" for testing, "m", "l", "xl" for more data
    dataset_split: str = "train"  # The test and val splits don't have category labels
    dataset_category: int = 15  # "Science and Technology"
    max_duration_in_seconds: float = 20.0
    min_duration_in_seconds: float = 0.0

    # Training config
    num_train_epochs: int = 5
    warmup_steps: int = 400
    max_steps: int = -1
    batch_size: int = 64
    learning_rate: float = 1e-5
    eval_strategy: str = "epoch"


\`\`\`

### Defining our training Function

The training Function does the following:
1. Load the pre-trained model, along with the feature extractor and tokenizer
2. Load the dataset -> select our training category -> extract features for training
3. Run baseline evals
4. 🚂 Train!
5. Save the fine-tuned model to the Volume
6. Run final evals

We run evals before and after training to establish a baseline and see how much the
model improved. The most common way to measure the performance of speech recognition
models is "word error rate" (WER):

\`WER = (substitutions + deletions + insertions) / total words\`.

The \`@app.function\` decorator is where we attach infrastructure and define how our
Function runs on Modal. Here we tell the Function to use our \`Image\`, specify the GPU,
attach the Volumes we created earlier, add our access token, and set a timeout.

\`\`\`python
@app.function(
    image=image,
    gpu="H100",
    volumes=volumes,
    secrets=[modal.Secret.from_name("huggingface-secret", required_keys=["HF_TOKEN"])],
    timeout=3 * HOURS,
)
def train(
    config: Config,
):
    """Loads data and trains the model."""

    # Setting args for the Hugging Face trainer
    training_args = transformers.Seq2SeqTrainingArguments(
        output_dir=Path(OUTPUT_DIR) / config.model_output_name,
        num_train_epochs=config.num_train_epochs,
        per_device_train_batch_size=config.batch_size,
        per_device_eval_batch_size=config.batch_size,
        learning_rate=config.learning_rate,
        warmup_steps=config.warmup_steps,
        max_steps=config.max_steps,
        eval_strategy=config.eval_strategy,
        fp16=True,
        group_by_length=True,
        length_column_name="input_length",
        predict_with_generate=True,
        generation_max_length=40,
        generation_num_beams=1,
    )

    print(f"Loading model: {config.model_name}")
    feature_extractor = transformers.WhisperFeatureExtractor.from_pretrained(
        pretrained_model_name_or_path=config.model_name,
    )
    tokenizer = transformers.WhisperTokenizer.from_pretrained(
        pretrained_model_name_or_path=config.model_name,
    )
    model = transformers.WhisperForConditionalGeneration.from_pretrained(
        pretrained_model_name_or_path=config.model_name,
    )

    print(f"Loading dataset: {config.dataset_name} {config.dataset_subset}")
    dataset = (
        datasets.load_dataset(
            config.dataset_name,
            config.dataset_subset,
            split=config.dataset_split,
            num_proc=os.cpu_count(),
            trust_remote_code=True,
        )
        if config.dataset_name is not None
        else get_test_dataset(config)
    )

    print("Preparing data")
    max_input_length = config.max_duration_in_seconds * feature_extractor.sampling_rate
    min_input_length = config.min_duration_in_seconds * feature_extractor.sampling_rate

    # Remove samples that are not from our target category (Science and Technology)
    # Remove audio clips that are too short or too long
    dataset = dataset.filter(
        functools.partial(
            filter_dataset,
            dataset_category=config.dataset_category,
            max_input_length=max_input_length,
            min_input_length=min_input_length,
        ),
        input_columns=["category", "audio"],
        num_proc=os.cpu_count(),
    )

    # Extract audio features and tokenize labels
    dataset = dataset.map(
        functools.partial(
            prepare_dataset,
            feature_extractor=feature_extractor,
            tokenizer=tokenizer,
            model_input_name=feature_extractor.model_input_names[0],
        ),
        batched=True,
        remove_columns=dataset.column_names,
        num_proc=os.cpu_count(),
        desc="Feature extract + tokenize",
    )

    # Split the filtered dataset into train/validation sets
    dataset = dataset.train_test_split(test_size=0.1, shuffle=True, seed=42)

    # Create a processor that combines the feature extractor and tokenizer
    processor = transformers.WhisperProcessor(
        feature_extractor=feature_extractor,
        tokenizer=tokenizer,
    )

    # Custom data collator handles batching of variable-length audio sequences
    data_collator = DataCollatorSpeechSeq2SeqWithPadding(
        processor=processor,
        decoder_start_token_id=model.config.decoder_start_token_id,
    )

    # Set up the Hugging Face trainer with all of our components
    normalizer = EnglishTextNormalizer()
    metric = evaluate.load("wer")

    trainer = transformers.Seq2SeqTrainer(
        model=model,
        args=training_args,
        train_dataset=dataset["train"],
        eval_dataset=dataset["test"],
        processing_class=feature_extractor,
        data_collator=data_collator,
        compute_metrics=functools.partial(
            compute_metrics,
            tokenizer=tokenizer,
            normalizer=normalizer,
            metric=metric,
        ),
    )

    print("Running evals before training to establish a baseline")
    metrics = trainer.evaluate(
        metric_key_prefix="baseline",
        max_length=training_args.generation_max_length,
        num_beams=training_args.generation_num_beams,
    )
    trainer.log_metrics("baseline", metrics)
    trainer.save_metrics("baseline", metrics)

    print(f"Starting training! Weights will be saved to '{training_args.output_dir}'")
    train_result = trainer.train()

    # Save the model weights, tokenizer, and feature extractor
    trainer.save_model()
    tokenizer.save_pretrained(training_args.output_dir)
    feature_extractor.save_pretrained(training_args.output_dir)

    # Log training metrics
    metrics = train_result.metrics
    metrics["train_samples"] = len(dataset["train"])
    trainer.log_metrics("train", metrics)
    trainer.save_metrics("train", metrics)
    trainer.save_state()

    # Final evaluation to see how much we improved
    print("Running final evals")
    metrics = trainer.evaluate(
        metric_key_prefix="test",
        max_length=training_args.generation_max_length,
        num_beams=training_args.generation_num_beams,
    )
    metrics["eval_samples"] = len(dataset["test"])

    trainer.log_metrics("test", metrics)
    trainer.save_metrics("test", metrics)
    output_volume.commit()  # Ensure everything is saved to the Volume

    print(f"\\nTraining complete! Model saved to '{training_args.output_dir}'")


\`\`\`

## Calling a Modal function from the command line

The easiest way to invoke our training Function is by creating a \`local_entrypoint\` --
our \`main\` function that runs locally and provides a command-line interface to trigger
training on Modal's cloud infrastructure.

\`\`\`python
@app.local_entrypoint()
def main(test: bool = False):
    """Run Whisper fine-tuning on Modal."""
    if test:  # for quick e2e test
        config = Config(
            dataset_name=None,
            num_train_epochs=1.0,
            warmup_steps=0,
            max_steps=1,
        )
    else:
        config = Config()

    train.remote(config)


\`\`\`

This will allow us to run this example with:

\`\`\`bash
modal run fine_tune_asr.py
\`\`\`

Arguments passed to this function are turned in to CLI arguments automagically. For
example, adding \`--test\` will run a single step of training for end-to-end testing.

\`\`\`bash
modal run fine_tune_asr.py --test
\`\`\`

Training will take ~1.5 hours, and will log WER and other metrics throughout the
run.

Here are a few more examples of terms the model predicted correctly after fine-tuning:

| **Base Model** | **Fine-tuned**  |
|----------------|-----------------|
| and pm package | npm package     |
| teach them     | tritium         |
| chromebox      | chromevox       |
| purposes       | porpoises       |
| difsoup        | div soup        |
| would you      | widget          |

## Deploying our fine-tuned model for inference

Once fine-tuning is complete, Modal makes it incredibly easy to deploy our new model.
We can define both our inference function and an endpoint using a Modal
[Cls](https://modal.com/docs/reference/modal.Cls).
This will allow us to take advantage of
[lifecycle hooks](https://modal.com/docs/guide/lifecycle-functions)
to load the model just once on container startup using the \`@modal.enter\` decorator.
We can use
[modal.fastapi_endpoint](https://modal.com/docs/reference/modal.fastapi_endpoint)
to expose our inference function as a Web Function.

\`\`\`python
@app.cls(
    image=image,
    gpu="H100",
    timeout=10 * MINUTES,
    # scaledown_window=10 * MINUTES,
    volumes=volumes,
)
class Inference:
    model_name: str = modal.parameter(default=Config().model_output_name)

    @modal.enter()
    def load_model(self):
        """Load the model and processor on container startup."""

        model = f"{OUTPUT_DIR}/{self.model_name}"
        print(f"Loading model from {model}")
        self.processor = transformers.WhisperProcessor.from_pretrained(model)
        self.model = transformers.WhisperForConditionalGeneration.from_pretrained(model)
        self.model.config.forced_decoder_ids = None

    @modal.method()
    def transcribe(
        self,
        audio_bytes: bytes,
    ) -> str:
        # Resample audio to match the model's sample rate
        model_sample_rate = self.processor.feature_extractor.sampling_rate
        audio_data, sample_rate = librosa.load(io.BytesIO(audio_bytes), sr=None)

        audio_dataset = datasets.Dataset.from_dict(
            {"audio": [{"array": audio_data, "sampling_rate": sample_rate}]}
        ).cast_column("audio", datasets.Audio(sampling_rate=model_sample_rate))

        # Audio -> features (log-mel spectrogram)
        row = next(iter(audio_dataset))
        input_features = self.processor(
            row["audio"]["array"],
            sampling_rate=row["audio"]["sampling_rate"],
            return_tensors="pt",
        ).input_features

        # generate tokens -> decode to text
        predicted_ids = self.model.generate(input_features)
        transcription = self.processor.batch_decode(
            predicted_ids, skip_special_tokens=True
        )[0]

        return transcription

    @modal.fastapi_endpoint(method="POST", docs=True)
    def web(
        self,
        audio_file: Annotated[bytes, fastapi.File()],
    ) -> dict[str, str]:
        """Defines an endpoint for calling inference."""

        transcription = self.transcribe.local(  # run in the same container
            audio_bytes=audio_file,
        )
        return {"transcription": transcription}


\`\`\`

Deploy it with:

\`\`\`bash
modal deploy fine_tune_asr.py
\`\`\`

Note: you can specify which model to load by passing the \`model_name\` as a
query parameter when calling the endpoint. This defaults to \`model_output_name\`, which
we set in our \`Config\` above, and is the name of the directory where our model
was saved.

Here's an example of how to use this endpoint to transcribe an audio file:

\`\`\`bash
curl -X 'POST' \\
'https://your-workspace-name--example-whisper-fine-tune-inference-web.modal.run/?model_name=whisper-fine-tune' \\
-H 'accept: application/json' \\
-H 'Content-Type: multipart/form-data' \\
-F 'audio_file=@your-audio-file.wav;type=audio/wav'
\`\`\`

## Support code

\`\`\`python
def get_test_dataset(config, length=5):
    return datasets.Dataset.from_dict(
        {
            "text": ["Modal"] * length,
            "audio": [{"array": [1.0] * 16000, "sampling_rate": 16000}] * length,
            "category": [config.dataset_category] * length,
        }
    )


def filter_dataset(
    category, audio, dataset_category, max_input_length, min_input_length
):
    return (
        category == dataset_category
        and len(audio["array"]) > min_input_length
        and len(audio["array"]) < max_input_length
    )


def prepare_dataset(batch, feature_extractor, tokenizer, model_input_name):
    """Batched: convert audio to features and text to token IDs."""
    audio_arrays = [s["array"] for s in batch["audio"]]
    inputs = feature_extractor(
        audio_arrays,
        sampling_rate=feature_extractor.sampling_rate,
    )
    batch[model_input_name] = inputs.get(model_input_name)
    batch["input_length"] = [len(s["array"]) for s in batch["audio"]]

    normalized = [
        t.replace(" <COMMA>", ",")
        .replace(" <PERIOD>", ".")
        .replace(" <QUESTIONMARK>", "?")
        .replace(" <EXCLAMATIONPOINT>", "!")
        .lower()
        .strip()
        for t in batch["text"]
    ]
    batch["labels"] = tokenizer(normalized).input_ids

    return batch


def compute_metrics(pred, tokenizer, normalizer, metric):
    """Compute Word Error Rate between predictions and ground truth."""
    pred_ids = pred.predictions

    # Replace padding tokens with proper pad token ID
    pred.label_ids[pred.label_ids == -100] = tokenizer.pad_token_id

    # Decode predictions and labels back to text
    pred_str = tokenizer.batch_decode(pred_ids, skip_special_tokens=True)
    norm_pred_str = [normalizer(s).strip() for s in pred_str]

    label_str = tokenizer.batch_decode(pred.label_ids, skip_special_tokens=True)
    norm_label_str = [normalizer(s).strip() for s in label_str]

    # Calculate Word Error Rate
    wer = metric.compute(predictions=norm_pred_str, references=norm_label_str)
    return {"wer": wer}


@dataclass
class DataCollatorSpeechSeq2SeqWithPadding:
    """
    Data collator that pads audio features and text labels for batch training.

    Args:
        processor: WhisperProcessor combining feature extractor and tokenizer
        decoder_start_token_id: The BOS token ID for the decoder
    """

    processor: Any
    decoder_start_token_id: int

    def __call__(
        self, features: list[dict[str, Union[list[int], "torch.Tensor"]]]
    ) -> dict[str, "torch.Tensor"]:
        # Separate audio features and text labels since they need different padding
        model_input_name = self.processor.model_input_names[0]
        input_features = [
            {model_input_name: feature[model_input_name]} for feature in features
        ]
        label_features = [{"input_ids": feature["labels"]} for feature in features]

        batch = self.processor.feature_extractor.pad(
            input_features,
            return_tensors="pt",
            return_attention_mask=True,
            padding=True,
        )

        labels_batch = self.processor.tokenizer.pad(label_features, return_tensors="pt")

        # Replace padding tokens with -100 so they're ignored in loss calculation
        labels = labels_batch["input_ids"].masked_fill(
            labels_batch.attention_mask.ne(1), -100
        )

        # Remove start token if tokenizer added it - model will add it during training
        if (labels[:, 0] == self.decoder_start_token_id).all().cpu().item():
            labels = labels[:, 1:]

        batch["labels"] = labels

        return batch

\`\`\`
`,meta:{title:`Fine-tune Whisper to Improve Transcription on Domain-Specific Vocab`,description:`This example demonstrates how to fine-tune an ASR model (whisper-tiny.en) and deploy it for inference using Modal.`}},{toc:g,rawContent:_,meta:v}=h,y=t(`<thead><tr><th></th><th>Transcription</th></tr></thead> <tbody><tr><td><strong>Ground Truth</strong></td><td>“deuterium you put into one element you make a new element”</td></tr><tr><td><strong>Prediction</strong></td><td>“the theorem you put into one element you make a new element”</td></tr></tbody>`,1),b=t(`<thead><tr><th></th><th>Transcription</th></tr></thead> <tbody><tr><td><strong>Ground Truth</strong></td><td>“deuterium you put into one element you make a new element”</td></tr><tr><td><strong>Prediction</strong></td><td>“deuterium you put into one element you make a new element”</td></tr></tbody>`,1),x=t(`<code>App</code>`),ne=t(`container <code>Image</code>`,1),S=t(`<thead><tr><th><strong>Base Model</strong></th><th><strong>Fine-tuned</strong></th></tr></thead> <tbody><tr><td>and pm package</td><td>npm package</td></tr><tr><td>teach them</td><td>tritium</td></tr><tr><td>chromebox</td><td>chromevox</td></tr><tr><td>purposes</td><td>porpoises</td></tr><tr><td>difsoup</td><td>div soup</td></tr><tr><td>would you</td><td>widget</td></tr></tbody>`,1),C=t(`<!> <p>This example demonstrates how to fine-tune an ASR model
(<!>)
and deploy it for inference using Modal.</p> <p>Speech recognition models work well out-of-the-box for general speech transcription,
but can struggle with examples that are not well represented in the training data -
like proper nouns, technical jargon, and industry-specific terms. Fine-tuning with
examples of domain-specific vocabulary can improve transcription of these terms.</p> <p>For example, here is a sample transcription from the baseline model with no
fine-tuning:</p> <!> <p>After just 1.5 hours of training on a small dataset (~7k samples), the model has
already improved:</p> <!> <p>We’ll use the “small” subset of “Science and Technology” from the <!> dataset, which is enough data to see the model improve on scientific terms in just a
few epochs.</p> <p>Note: GigaSpeech is a <!>,
so you’ll need to accept the terms on the <!> and create a <!> to download it.</p> <!> <p>We start by importing our standard library dependencies, <code>fastapi</code>, and <code>modal</code>.</p> <p>We also need an <!> object, which we’ll use to
define how our training application will run on Modal’s cloud infrastructure.</p> <!> <!> <p>We define the environment where our functions will run by building up a base <!> with our dependencies using <code>Image.uv_pip_install</code>. We also set environment variables
here using <code>Image.env</code>, like the Hugging Face cache directory.</p> <!> <p>Next we’ll import the dependencies we need for the code that will run on Modal.</p> <p>The <code>image.imports()</code> context manager ensures these imports are available when our
Functions run in the cloud, without the need to install the dependencies locally.</p> <!> <!> <p>We use <!> for data we want to persist across function calls. In this case, we’ll create a cache
Volume for storing Hugging Face downloads for faster subsequent loads, and an output
Volume for saving our model and metrics after training.</p> <!> <!> <p>We use a <code>dataclass</code> to collect some of the training parameters in one place. Here we
set <code>model_output_name</code> which is the directory on the Volume where our model will be
saved, and where we’ll load it from when deploying the model for inference.</p> <!> <!> <p>The training Function does the following:</p> <ol><li>Load the pre-trained model, along with the feature extractor and tokenizer</li> <li>Load the dataset -> select our training category -> extract features for training</li> <li>Run baseline evals</li> <li>🚂 Train!</li> <li>Save the fine-tuned model to the Volume</li> <li>Run final evals</li></ol> <p>We run evals before and after training to establish a baseline and see how much the
model improved. The most common way to measure the performance of speech recognition
models is “word error rate” (WER):</p> <p><code>WER = (substitutions + deletions + insertions) / total words</code>.</p> <p>The <code>@app.function</code> decorator is where we attach infrastructure and define how our
Function runs on Modal. Here we tell the Function to use our <code>Image</code>, specify the GPU,
attach the Volumes we created earlier, add our access token, and set a timeout.</p> <!> <!> <p>The easiest way to invoke our training Function is by creating a <code>local_entrypoint</code> —
our <code>main</code> function that runs locally and provides a command-line interface to trigger
training on Modal’s cloud infrastructure.</p> <!> <p>This will allow us to run this example with:</p> <!> <p>Arguments passed to this function are turned in to CLI arguments automagically. For
example, adding <code>--test</code> will run a single step of training for end-to-end testing.</p> <!> <p>Training will take ~1.5 hours, and will log WER and other metrics throughout the
run.</p> <p>Here are a few more examples of terms the model predicted correctly after fine-tuning:</p> <!> <!> <p>Once fine-tuning is complete, Modal makes it incredibly easy to deploy our new model.
We can define both our inference function and an endpoint using a Modal <!>.
This will allow us to take advantage of <!> to load the model just once on container startup using the <code>@modal.enter</code> decorator.
We can use <!> to expose our inference function as a Web Function.</p> <!> <p>Deploy it with:</p> <!> <p>Note: you can specify which model to load by passing the <code>model_name</code> as a
query parameter when calling the endpoint. This defaults to <code>model_output_name</code>, which
we set in our <code>Config</code> above, and is the name of the directory where our model
was saved.</p> <p>Here’s an example of how to use this endpoint to transcribe an audio file:</p> <!> <!> <!>`,1);function w(t,g){let _=ee(g,[`children`,`$$slots`,`$$events`,`$$legacy`]);p(t,a(()=>_,()=>h,{children:(t,ee)=>{var a=C(),p=o(a);te(p,{id:`fine-tune-whisper-to-improve-transcription-on-domain-specific-vocab`,children:(e,t)=>{c(),i(e,r(`Fine-tune Whisper to Improve Transcription on Domain-Specific Vocab`))},$$slots:{default:!0}});var h=s(p,2);m(s(e(h)),{href:`https://huggingface.co/openai/whisper-tiny.en`,rel:`nofollow`,children:(e,t)=>{c(),i(e,r(`whisper-tiny.en`))},$$slots:{default:!0}}),c(),n(h);var g=s(h,6);d(g,{children:(e,t)=>{var n=y();c(2),i(e,n)},$$slots:{default:!0}});var _=s(g,4);d(_,{children:(e,t)=>{var n=b();c(2),i(e,n)},$$slots:{default:!0}});var v=s(_,2);m(s(e(v)),{href:`https://huggingface.co/datasets/speechcolab/gigaspeech`,rel:`nofollow`,children:(e,t)=>{c(),i(e,r(`GigaSpeech`))},$$slots:{default:!0}}),c(),n(v);var w=s(v,2),T=s(e(w));m(T,{href:`https://huggingface.co/docs/hub/en/models-gated`,rel:`nofollow`,children:(e,t)=>{c(),i(e,r(`gated model`))},$$slots:{default:!0}});var E=s(T,2);m(E,{href:`https://huggingface.co/datasets/speechcolab/gigaspeech`,rel:`nofollow`,children:(e,t)=>{c(),i(e,r(`dataset card`))},$$slots:{default:!0}}),m(s(E,2),{href:`https://modal.com/secrets/`,rel:`nofollow`,children:(e,t)=>{c(),i(e,r(`Hugging Face Secret`))},$$slots:{default:!0}}),c(),n(w);var D=s(w,2);l(D,{id:`setup`,children:(e,t)=>{c(),i(e,r(`Setup`))},$$slots:{default:!0}});var O=s(D,4);m(s(e(O)),{href:`https://modal.com/docs/guide/apps`,rel:`nofollow`,children:(e,t)=>{i(e,x())},$$slots:{default:!0}}),c(),n(O);var k=s(O,2);f(k,{code:`import%20functools%0Aimport%20io%0Aimport%20os%0Afrom%20dataclasses%20import%20dataclass%0Afrom%20pathlib%20import%20Path%0Afrom%20typing%20import%20Annotated%2C%20Any%2C%20Union%0A%0Aimport%20fastapi%0Aimport%20modal%0A%0AMINUTES%20%3D%2060%0AHOURS%20%3D%2060%20*%20MINUTES%0A%0Aapp%20%3D%20modal.App(name%3D%22example-whisper-fine-tune%22)%0A`,lang:`python`});var A=s(k,2);u(A,{id:`set-up-the-container-image`,children:(e,t)=>{c(),i(e,r(`Set up the container image`))},$$slots:{default:!0}});var j=s(A,2);m(s(e(j)),{href:`https://modal.com/docs/guide/images`,rel:`nofollow`,children:(e,t)=>{c();var n=ne();c(),i(e,n)},$$slots:{default:!0}}),c(5),n(j);var M=s(j,2);f(M,{code:`CACHE_DIR%20%3D%20%22%2Fcache%22%0Aimage%20%3D%20(%0A%20%20%20%20modal.Image.debian_slim(python_version%3D%223.12%22)%0A%20%20%20%20.uv_pip_install(%0A%20%20%20%20%20%20%20%20%22accelerate%3D%3D1.8.1%22%2C%0A%20%20%20%20%20%20%20%20%22datasets%3D%3D3.6.0%22%2C%0A%20%20%20%20%20%20%20%20%22evaluate%3D%3D0.4.5%22%2C%0A%20%20%20%20%20%20%20%20%22fastapi%5Bstandard%5D%3D%3D0.116.1%22%2C%0A%20%20%20%20%20%20%20%20%22huggingface-hub%3D%3D0.36.0%22%2C%0A%20%20%20%20%20%20%20%20%22jiwer%3D%3D4.0.0%22%2C%0A%20%20%20%20%20%20%20%20%22librosa%3D%3D0.11.0%22%2C%0A%20%20%20%20%20%20%20%20%22torch%3D%3D2.7.1%22%2C%0A%20%20%20%20%20%20%20%20%22torchaudio%3D%3D2.7.1%22%2C%0A%20%20%20%20%20%20%20%20%22transformers%3D%3D4.53.2%22%2C%0A%20%20%20%20%20%20%20%20%22whisper_normalizer%3D%3D0.1.12%22%2C%0A%20%20%20%20)%0A%20%20%20%20.env(%0A%20%20%20%20%20%20%20%20%7B%0A%20%20%20%20%20%20%20%20%20%20%20%20%22HF_XET_HIGH_PERFORMANCE%22%3A%20%221%22%2C%20%20%23%20Faster%20downloads%20from%20Hugging%20Face%0A%20%20%20%20%20%20%20%20%20%20%20%20%22HF_HOME%22%3A%20CACHE_DIR%2C%0A%20%20%20%20%20%20%20%20%7D%0A%20%20%20%20)%0A)%0A`,lang:`python`});var N=s(M,6);f(N,{code:`with%20image.imports()%3A%0A%20%20%20%20import%20datasets%0A%20%20%20%20import%20evaluate%0A%20%20%20%20import%20librosa%0A%20%20%20%20import%20torch%0A%20%20%20%20import%20transformers%0A%20%20%20%20from%20whisper_normalizer.english%20import%20EnglishTextNormalizer%0A`,lang:`python`});var P=s(N,2);u(P,{id:`storing-data-on-modal`,children:(e,t)=>{c(),i(e,r(`Storing data on Modal`))},$$slots:{default:!0}});var F=s(P,2);m(s(e(F)),{href:`https://modal.com/docs/guide/volumes`,rel:`nofollow`,children:(e,t)=>{c(),i(e,r(`Modal Volumes`))},$$slots:{default:!0}}),c(),n(F);var I=s(F,2);f(I,{code:`cache_volume%20%3D%20modal.Volume.from_name(%22hf-hub-cache%22%2C%20create_if_missing%3DTrue)%0Aoutput_volume%20%3D%20modal.Volume.from_name(%0A%20%20%20%20%22fine-tune-asr-example-volume%22%2C%0A%20%20%20%20create_if_missing%3DTrue%2C%0A)%0AOUTPUT_DIR%20%3D%20%22%2Foutputs%22%0Avolumes%20%3D%20%7BCACHE_DIR%3A%20cache_volume%2C%20OUTPUT_DIR%3A%20output_volume%7D%0A`,lang:`python`});var L=s(I,2);l(L,{id:`training`,children:(e,t)=>{c(),i(e,r(`Training`))},$$slots:{default:!0}});var R=s(L,4);f(R,{code:`%40dataclass%0Aclass%20Config%3A%0A%20%20%20%20%22%22%22Training%20configuration.%22%22%22%0A%0A%20%20%20%20model_output_name%3A%20str%20%3D%20%22whisper-fine-tune%22%20%20%23%20Name%20used%20for%20saving%20and%20loading%0A%0A%20%20%20%20%23%20Model%20config%0A%20%20%20%20model_name%3A%20str%20%3D%20%22openai%2Fwhisper-tiny.en%22%0A%0A%20%20%20%20%23%20Dataset%20config%0A%20%20%20%20dataset_name%3A%20str%20%3D%20%22speechcolab%2Fgigaspeech%22%0A%20%20%20%20dataset_subset%3A%20str%20%3D%20%22s%22%20%20%23%20%22xs%22%20for%20testing%2C%20%22m%22%2C%20%22l%22%2C%20%22xl%22%20for%20more%20data%0A%20%20%20%20dataset_split%3A%20str%20%3D%20%22train%22%20%20%23%20The%20test%20and%20val%20splits%20don't%20have%20category%20labels%0A%20%20%20%20dataset_category%3A%20int%20%3D%2015%20%20%23%20%22Science%20and%20Technology%22%0A%20%20%20%20max_duration_in_seconds%3A%20float%20%3D%2020.0%0A%20%20%20%20min_duration_in_seconds%3A%20float%20%3D%200.0%0A%0A%20%20%20%20%23%20Training%20config%0A%20%20%20%20num_train_epochs%3A%20int%20%3D%205%0A%20%20%20%20warmup_steps%3A%20int%20%3D%20400%0A%20%20%20%20max_steps%3A%20int%20%3D%20-1%0A%20%20%20%20batch_size%3A%20int%20%3D%2064%0A%20%20%20%20learning_rate%3A%20float%20%3D%201e-5%0A%20%20%20%20eval_strategy%3A%20str%20%3D%20%22epoch%22%0A%0A`,lang:`python`});var z=s(R,2);u(z,{id:`defining-our-training-function`,children:(e,t)=>{c(),i(e,r(`Defining our training Function`))},$$slots:{default:!0}});var B=s(z,12);f(B,{code:`%40app.function(%0A%20%20%20%20image%3Dimage%2C%0A%20%20%20%20gpu%3D%22H100%22%2C%0A%20%20%20%20volumes%3Dvolumes%2C%0A%20%20%20%20secrets%3D%5Bmodal.Secret.from_name(%22huggingface-secret%22%2C%20required_keys%3D%5B%22HF_TOKEN%22%5D)%5D%2C%0A%20%20%20%20timeout%3D3%20*%20HOURS%2C%0A)%0Adef%20train(%0A%20%20%20%20config%3A%20Config%2C%0A)%3A%0A%20%20%20%20%22%22%22Loads%20data%20and%20trains%20the%20model.%22%22%22%0A%0A%20%20%20%20%23%20Setting%20args%20for%20the%20Hugging%20Face%20trainer%0A%20%20%20%20training_args%20%3D%20transformers.Seq2SeqTrainingArguments(%0A%20%20%20%20%20%20%20%20output_dir%3DPath(OUTPUT_DIR)%20%2F%20config.model_output_name%2C%0A%20%20%20%20%20%20%20%20num_train_epochs%3Dconfig.num_train_epochs%2C%0A%20%20%20%20%20%20%20%20per_device_train_batch_size%3Dconfig.batch_size%2C%0A%20%20%20%20%20%20%20%20per_device_eval_batch_size%3Dconfig.batch_size%2C%0A%20%20%20%20%20%20%20%20learning_rate%3Dconfig.learning_rate%2C%0A%20%20%20%20%20%20%20%20warmup_steps%3Dconfig.warmup_steps%2C%0A%20%20%20%20%20%20%20%20max_steps%3Dconfig.max_steps%2C%0A%20%20%20%20%20%20%20%20eval_strategy%3Dconfig.eval_strategy%2C%0A%20%20%20%20%20%20%20%20fp16%3DTrue%2C%0A%20%20%20%20%20%20%20%20group_by_length%3DTrue%2C%0A%20%20%20%20%20%20%20%20length_column_name%3D%22input_length%22%2C%0A%20%20%20%20%20%20%20%20predict_with_generate%3DTrue%2C%0A%20%20%20%20%20%20%20%20generation_max_length%3D40%2C%0A%20%20%20%20%20%20%20%20generation_num_beams%3D1%2C%0A%20%20%20%20)%0A%0A%20%20%20%20print(f%22Loading%20model%3A%20%7Bconfig.model_name%7D%22)%0A%20%20%20%20feature_extractor%20%3D%20transformers.WhisperFeatureExtractor.from_pretrained(%0A%20%20%20%20%20%20%20%20pretrained_model_name_or_path%3Dconfig.model_name%2C%0A%20%20%20%20)%0A%20%20%20%20tokenizer%20%3D%20transformers.WhisperTokenizer.from_pretrained(%0A%20%20%20%20%20%20%20%20pretrained_model_name_or_path%3Dconfig.model_name%2C%0A%20%20%20%20)%0A%20%20%20%20model%20%3D%20transformers.WhisperForConditionalGeneration.from_pretrained(%0A%20%20%20%20%20%20%20%20pretrained_model_name_or_path%3Dconfig.model_name%2C%0A%20%20%20%20)%0A%0A%20%20%20%20print(f%22Loading%20dataset%3A%20%7Bconfig.dataset_name%7D%20%7Bconfig.dataset_subset%7D%22)%0A%20%20%20%20dataset%20%3D%20(%0A%20%20%20%20%20%20%20%20datasets.load_dataset(%0A%20%20%20%20%20%20%20%20%20%20%20%20config.dataset_name%2C%0A%20%20%20%20%20%20%20%20%20%20%20%20config.dataset_subset%2C%0A%20%20%20%20%20%20%20%20%20%20%20%20split%3Dconfig.dataset_split%2C%0A%20%20%20%20%20%20%20%20%20%20%20%20num_proc%3Dos.cpu_count()%2C%0A%20%20%20%20%20%20%20%20%20%20%20%20trust_remote_code%3DTrue%2C%0A%20%20%20%20%20%20%20%20)%0A%20%20%20%20%20%20%20%20if%20config.dataset_name%20is%20not%20None%0A%20%20%20%20%20%20%20%20else%20get_test_dataset(config)%0A%20%20%20%20)%0A%0A%20%20%20%20print(%22Preparing%20data%22)%0A%20%20%20%20max_input_length%20%3D%20config.max_duration_in_seconds%20*%20feature_extractor.sampling_rate%0A%20%20%20%20min_input_length%20%3D%20config.min_duration_in_seconds%20*%20feature_extractor.sampling_rate%0A%0A%20%20%20%20%23%20Remove%20samples%20that%20are%20not%20from%20our%20target%20category%20(Science%20and%20Technology)%0A%20%20%20%20%23%20Remove%20audio%20clips%20that%20are%20too%20short%20or%20too%20long%0A%20%20%20%20dataset%20%3D%20dataset.filter(%0A%20%20%20%20%20%20%20%20functools.partial(%0A%20%20%20%20%20%20%20%20%20%20%20%20filter_dataset%2C%0A%20%20%20%20%20%20%20%20%20%20%20%20dataset_category%3Dconfig.dataset_category%2C%0A%20%20%20%20%20%20%20%20%20%20%20%20max_input_length%3Dmax_input_length%2C%0A%20%20%20%20%20%20%20%20%20%20%20%20min_input_length%3Dmin_input_length%2C%0A%20%20%20%20%20%20%20%20)%2C%0A%20%20%20%20%20%20%20%20input_columns%3D%5B%22category%22%2C%20%22audio%22%5D%2C%0A%20%20%20%20%20%20%20%20num_proc%3Dos.cpu_count()%2C%0A%20%20%20%20)%0A%0A%20%20%20%20%23%20Extract%20audio%20features%20and%20tokenize%20labels%0A%20%20%20%20dataset%20%3D%20dataset.map(%0A%20%20%20%20%20%20%20%20functools.partial(%0A%20%20%20%20%20%20%20%20%20%20%20%20prepare_dataset%2C%0A%20%20%20%20%20%20%20%20%20%20%20%20feature_extractor%3Dfeature_extractor%2C%0A%20%20%20%20%20%20%20%20%20%20%20%20tokenizer%3Dtokenizer%2C%0A%20%20%20%20%20%20%20%20%20%20%20%20model_input_name%3Dfeature_extractor.model_input_names%5B0%5D%2C%0A%20%20%20%20%20%20%20%20)%2C%0A%20%20%20%20%20%20%20%20batched%3DTrue%2C%0A%20%20%20%20%20%20%20%20remove_columns%3Ddataset.column_names%2C%0A%20%20%20%20%20%20%20%20num_proc%3Dos.cpu_count()%2C%0A%20%20%20%20%20%20%20%20desc%3D%22Feature%20extract%20%2B%20tokenize%22%2C%0A%20%20%20%20)%0A%0A%20%20%20%20%23%20Split%20the%20filtered%20dataset%20into%20train%2Fvalidation%20sets%0A%20%20%20%20dataset%20%3D%20dataset.train_test_split(test_size%3D0.1%2C%20shuffle%3DTrue%2C%20seed%3D42)%0A%0A%20%20%20%20%23%20Create%20a%20processor%20that%20combines%20the%20feature%20extractor%20and%20tokenizer%0A%20%20%20%20processor%20%3D%20transformers.WhisperProcessor(%0A%20%20%20%20%20%20%20%20feature_extractor%3Dfeature_extractor%2C%0A%20%20%20%20%20%20%20%20tokenizer%3Dtokenizer%2C%0A%20%20%20%20)%0A%0A%20%20%20%20%23%20Custom%20data%20collator%20handles%20batching%20of%20variable-length%20audio%20sequences%0A%20%20%20%20data_collator%20%3D%20DataCollatorSpeechSeq2SeqWithPadding(%0A%20%20%20%20%20%20%20%20processor%3Dprocessor%2C%0A%20%20%20%20%20%20%20%20decoder_start_token_id%3Dmodel.config.decoder_start_token_id%2C%0A%20%20%20%20)%0A%0A%20%20%20%20%23%20Set%20up%20the%20Hugging%20Face%20trainer%20with%20all%20of%20our%20components%0A%20%20%20%20normalizer%20%3D%20EnglishTextNormalizer()%0A%20%20%20%20metric%20%3D%20evaluate.load(%22wer%22)%0A%0A%20%20%20%20trainer%20%3D%20transformers.Seq2SeqTrainer(%0A%20%20%20%20%20%20%20%20model%3Dmodel%2C%0A%20%20%20%20%20%20%20%20args%3Dtraining_args%2C%0A%20%20%20%20%20%20%20%20train_dataset%3Ddataset%5B%22train%22%5D%2C%0A%20%20%20%20%20%20%20%20eval_dataset%3Ddataset%5B%22test%22%5D%2C%0A%20%20%20%20%20%20%20%20processing_class%3Dfeature_extractor%2C%0A%20%20%20%20%20%20%20%20data_collator%3Ddata_collator%2C%0A%20%20%20%20%20%20%20%20compute_metrics%3Dfunctools.partial(%0A%20%20%20%20%20%20%20%20%20%20%20%20compute_metrics%2C%0A%20%20%20%20%20%20%20%20%20%20%20%20tokenizer%3Dtokenizer%2C%0A%20%20%20%20%20%20%20%20%20%20%20%20normalizer%3Dnormalizer%2C%0A%20%20%20%20%20%20%20%20%20%20%20%20metric%3Dmetric%2C%0A%20%20%20%20%20%20%20%20)%2C%0A%20%20%20%20)%0A%0A%20%20%20%20print(%22Running%20evals%20before%20training%20to%20establish%20a%20baseline%22)%0A%20%20%20%20metrics%20%3D%20trainer.evaluate(%0A%20%20%20%20%20%20%20%20metric_key_prefix%3D%22baseline%22%2C%0A%20%20%20%20%20%20%20%20max_length%3Dtraining_args.generation_max_length%2C%0A%20%20%20%20%20%20%20%20num_beams%3Dtraining_args.generation_num_beams%2C%0A%20%20%20%20)%0A%20%20%20%20trainer.log_metrics(%22baseline%22%2C%20metrics)%0A%20%20%20%20trainer.save_metrics(%22baseline%22%2C%20metrics)%0A%0A%20%20%20%20print(f%22Starting%20training!%20Weights%20will%20be%20saved%20to%20'%7Btraining_args.output_dir%7D'%22)%0A%20%20%20%20train_result%20%3D%20trainer.train()%0A%0A%20%20%20%20%23%20Save%20the%20model%20weights%2C%20tokenizer%2C%20and%20feature%20extractor%0A%20%20%20%20trainer.save_model()%0A%20%20%20%20tokenizer.save_pretrained(training_args.output_dir)%0A%20%20%20%20feature_extractor.save_pretrained(training_args.output_dir)%0A%0A%20%20%20%20%23%20Log%20training%20metrics%0A%20%20%20%20metrics%20%3D%20train_result.metrics%0A%20%20%20%20metrics%5B%22train_samples%22%5D%20%3D%20len(dataset%5B%22train%22%5D)%0A%20%20%20%20trainer.log_metrics(%22train%22%2C%20metrics)%0A%20%20%20%20trainer.save_metrics(%22train%22%2C%20metrics)%0A%20%20%20%20trainer.save_state()%0A%0A%20%20%20%20%23%20Final%20evaluation%20to%20see%20how%20much%20we%20improved%0A%20%20%20%20print(%22Running%20final%20evals%22)%0A%20%20%20%20metrics%20%3D%20trainer.evaluate(%0A%20%20%20%20%20%20%20%20metric_key_prefix%3D%22test%22%2C%0A%20%20%20%20%20%20%20%20max_length%3Dtraining_args.generation_max_length%2C%0A%20%20%20%20%20%20%20%20num_beams%3Dtraining_args.generation_num_beams%2C%0A%20%20%20%20)%0A%20%20%20%20metrics%5B%22eval_samples%22%5D%20%3D%20len(dataset%5B%22test%22%5D)%0A%0A%20%20%20%20trainer.log_metrics(%22test%22%2C%20metrics)%0A%20%20%20%20trainer.save_metrics(%22test%22%2C%20metrics)%0A%20%20%20%20output_volume.commit()%20%20%23%20Ensure%20everything%20is%20saved%20to%20the%20Volume%0A%0A%20%20%20%20print(f%22%5CnTraining%20complete!%20Model%20saved%20to%20'%7Btraining_args.output_dir%7D'%22)%0A%0A`,lang:`python`});var V=s(B,2);l(V,{id:`calling-a-modal-function-from-the-command-line`,children:(e,t)=>{c(),i(e,r(`Calling a Modal function from the command line`))},$$slots:{default:!0}});var H=s(V,4);f(H,{code:`%40app.local_entrypoint()%0Adef%20main(test%3A%20bool%20%3D%20False)%3A%0A%20%20%20%20%22%22%22Run%20Whisper%20fine-tuning%20on%20Modal.%22%22%22%0A%20%20%20%20if%20test%3A%20%20%23%20for%20quick%20e2e%20test%0A%20%20%20%20%20%20%20%20config%20%3D%20Config(%0A%20%20%20%20%20%20%20%20%20%20%20%20dataset_name%3DNone%2C%0A%20%20%20%20%20%20%20%20%20%20%20%20num_train_epochs%3D1.0%2C%0A%20%20%20%20%20%20%20%20%20%20%20%20warmup_steps%3D0%2C%0A%20%20%20%20%20%20%20%20%20%20%20%20max_steps%3D1%2C%0A%20%20%20%20%20%20%20%20)%0A%20%20%20%20else%3A%0A%20%20%20%20%20%20%20%20config%20%3D%20Config()%0A%0A%20%20%20%20train.remote(config)%0A%0A`,lang:`python`});var U=s(H,4);f(U,{code:`modal%20run%20fine_tune_asr.py`,lang:`bash`});var W=s(U,4);f(W,{code:`modal%20run%20fine_tune_asr.py%20--test`,lang:`bash`});var G=s(W,6);d(G,{children:(e,t)=>{var n=S();c(2),i(e,n)},$$slots:{default:!0}});var K=s(G,2);l(K,{id:`deploying-our-fine-tuned-model-for-inference`,children:(e,t)=>{c(),i(e,r(`Deploying our fine-tuned model for inference`))},$$slots:{default:!0}});var q=s(K,2),J=s(e(q));m(J,{href:`https://modal.com/docs/reference/modal.Cls`,rel:`nofollow`,children:(e,t)=>{c(),i(e,r(`Cls`))},$$slots:{default:!0}});var Y=s(J,2);m(Y,{href:`https://modal.com/docs/guide/lifecycle-functions`,rel:`nofollow`,children:(e,t)=>{c(),i(e,r(`lifecycle hooks`))},$$slots:{default:!0}}),m(s(Y,4),{href:`https://modal.com/docs/reference/modal.fastapi_endpoint`,rel:`nofollow`,children:(e,t)=>{c(),i(e,r(`modal.fastapi_endpoint`))},$$slots:{default:!0}}),c(),n(q);var X=s(q,2);f(X,{code:`%40app.cls(%0A%20%20%20%20image%3Dimage%2C%0A%20%20%20%20gpu%3D%22H100%22%2C%0A%20%20%20%20timeout%3D10%20*%20MINUTES%2C%0A%20%20%20%20%23%20scaledown_window%3D10%20*%20MINUTES%2C%0A%20%20%20%20volumes%3Dvolumes%2C%0A)%0Aclass%20Inference%3A%0A%20%20%20%20model_name%3A%20str%20%3D%20modal.parameter(default%3DConfig().model_output_name)%0A%0A%20%20%20%20%40modal.enter()%0A%20%20%20%20def%20load_model(self)%3A%0A%20%20%20%20%20%20%20%20%22%22%22Load%20the%20model%20and%20processor%20on%20container%20startup.%22%22%22%0A%0A%20%20%20%20%20%20%20%20model%20%3D%20f%22%7BOUTPUT_DIR%7D%2F%7Bself.model_name%7D%22%0A%20%20%20%20%20%20%20%20print(f%22Loading%20model%20from%20%7Bmodel%7D%22)%0A%20%20%20%20%20%20%20%20self.processor%20%3D%20transformers.WhisperProcessor.from_pretrained(model)%0A%20%20%20%20%20%20%20%20self.model%20%3D%20transformers.WhisperForConditionalGeneration.from_pretrained(model)%0A%20%20%20%20%20%20%20%20self.model.config.forced_decoder_ids%20%3D%20None%0A%0A%20%20%20%20%40modal.method()%0A%20%20%20%20def%20transcribe(%0A%20%20%20%20%20%20%20%20self%2C%0A%20%20%20%20%20%20%20%20audio_bytes%3A%20bytes%2C%0A%20%20%20%20)%20-%3E%20str%3A%0A%20%20%20%20%20%20%20%20%23%20Resample%20audio%20to%20match%20the%20model's%20sample%20rate%0A%20%20%20%20%20%20%20%20model_sample_rate%20%3D%20self.processor.feature_extractor.sampling_rate%0A%20%20%20%20%20%20%20%20audio_data%2C%20sample_rate%20%3D%20librosa.load(io.BytesIO(audio_bytes)%2C%20sr%3DNone)%0A%0A%20%20%20%20%20%20%20%20audio_dataset%20%3D%20datasets.Dataset.from_dict(%0A%20%20%20%20%20%20%20%20%20%20%20%20%7B%22audio%22%3A%20%5B%7B%22array%22%3A%20audio_data%2C%20%22sampling_rate%22%3A%20sample_rate%7D%5D%7D%0A%20%20%20%20%20%20%20%20).cast_column(%22audio%22%2C%20datasets.Audio(sampling_rate%3Dmodel_sample_rate))%0A%0A%20%20%20%20%20%20%20%20%23%20Audio%20-%3E%20features%20(log-mel%20spectrogram)%0A%20%20%20%20%20%20%20%20row%20%3D%20next(iter(audio_dataset))%0A%20%20%20%20%20%20%20%20input_features%20%3D%20self.processor(%0A%20%20%20%20%20%20%20%20%20%20%20%20row%5B%22audio%22%5D%5B%22array%22%5D%2C%0A%20%20%20%20%20%20%20%20%20%20%20%20sampling_rate%3Drow%5B%22audio%22%5D%5B%22sampling_rate%22%5D%2C%0A%20%20%20%20%20%20%20%20%20%20%20%20return_tensors%3D%22pt%22%2C%0A%20%20%20%20%20%20%20%20).input_features%0A%0A%20%20%20%20%20%20%20%20%23%20generate%20tokens%20-%3E%20decode%20to%20text%0A%20%20%20%20%20%20%20%20predicted_ids%20%3D%20self.model.generate(input_features)%0A%20%20%20%20%20%20%20%20transcription%20%3D%20self.processor.batch_decode(%0A%20%20%20%20%20%20%20%20%20%20%20%20predicted_ids%2C%20skip_special_tokens%3DTrue%0A%20%20%20%20%20%20%20%20)%5B0%5D%0A%0A%20%20%20%20%20%20%20%20return%20transcription%0A%0A%20%20%20%20%40modal.fastapi_endpoint(method%3D%22POST%22%2C%20docs%3DTrue)%0A%20%20%20%20def%20web(%0A%20%20%20%20%20%20%20%20self%2C%0A%20%20%20%20%20%20%20%20audio_file%3A%20Annotated%5Bbytes%2C%20fastapi.File()%5D%2C%0A%20%20%20%20)%20-%3E%20dict%5Bstr%2C%20str%5D%3A%0A%20%20%20%20%20%20%20%20%22%22%22Defines%20an%20endpoint%20for%20calling%20inference.%22%22%22%0A%0A%20%20%20%20%20%20%20%20transcription%20%3D%20self.transcribe.local(%20%20%23%20run%20in%20the%20same%20container%0A%20%20%20%20%20%20%20%20%20%20%20%20audio_bytes%3Daudio_file%2C%0A%20%20%20%20%20%20%20%20)%0A%20%20%20%20%20%20%20%20return%20%7B%22transcription%22%3A%20transcription%7D%0A%0A`,lang:`python`});var Z=s(X,4);f(Z,{code:`modal%20deploy%20fine_tune_asr.py`,lang:`bash`});var Q=s(Z,6);f(Q,{code:`curl%20-X%20'POST'%20%5C%0A'https%3A%2F%2Fyour-workspace-name--example-whisper-fine-tune-inference-web.modal.run%2F%3Fmodel_name%3Dwhisper-fine-tune'%20%5C%0A-H%20'accept%3A%20application%2Fjson'%20%5C%0A-H%20'Content-Type%3A%20multipart%2Fform-data'%20%5C%0A-F%20'audio_file%3D%40your-audio-file.wav%3Btype%3Daudio%2Fwav'`,lang:`bash`});var $=s(Q,2);l($,{id:`support-code`,children:(e,t)=>{c(),i(e,r(`Support code`))},$$slots:{default:!0}}),f(s($,2),{code:`def%20get_test_dataset(config%2C%20length%3D5)%3A%0A%20%20%20%20return%20datasets.Dataset.from_dict(%0A%20%20%20%20%20%20%20%20%7B%0A%20%20%20%20%20%20%20%20%20%20%20%20%22text%22%3A%20%5B%22Modal%22%5D%20*%20length%2C%0A%20%20%20%20%20%20%20%20%20%20%20%20%22audio%22%3A%20%5B%7B%22array%22%3A%20%5B1.0%5D%20*%2016000%2C%20%22sampling_rate%22%3A%2016000%7D%5D%20*%20length%2C%0A%20%20%20%20%20%20%20%20%20%20%20%20%22category%22%3A%20%5Bconfig.dataset_category%5D%20*%20length%2C%0A%20%20%20%20%20%20%20%20%7D%0A%20%20%20%20)%0A%0A%0Adef%20filter_dataset(%0A%20%20%20%20category%2C%20audio%2C%20dataset_category%2C%20max_input_length%2C%20min_input_length%0A)%3A%0A%20%20%20%20return%20(%0A%20%20%20%20%20%20%20%20category%20%3D%3D%20dataset_category%0A%20%20%20%20%20%20%20%20and%20len(audio%5B%22array%22%5D)%20%3E%20min_input_length%0A%20%20%20%20%20%20%20%20and%20len(audio%5B%22array%22%5D)%20%3C%20max_input_length%0A%20%20%20%20)%0A%0A%0Adef%20prepare_dataset(batch%2C%20feature_extractor%2C%20tokenizer%2C%20model_input_name)%3A%0A%20%20%20%20%22%22%22Batched%3A%20convert%20audio%20to%20features%20and%20text%20to%20token%20IDs.%22%22%22%0A%20%20%20%20audio_arrays%20%3D%20%5Bs%5B%22array%22%5D%20for%20s%20in%20batch%5B%22audio%22%5D%5D%0A%20%20%20%20inputs%20%3D%20feature_extractor(%0A%20%20%20%20%20%20%20%20audio_arrays%2C%0A%20%20%20%20%20%20%20%20sampling_rate%3Dfeature_extractor.sampling_rate%2C%0A%20%20%20%20)%0A%20%20%20%20batch%5Bmodel_input_name%5D%20%3D%20inputs.get(model_input_name)%0A%20%20%20%20batch%5B%22input_length%22%5D%20%3D%20%5Blen(s%5B%22array%22%5D)%20for%20s%20in%20batch%5B%22audio%22%5D%5D%0A%0A%20%20%20%20normalized%20%3D%20%5B%0A%20%20%20%20%20%20%20%20t.replace(%22%20%3CCOMMA%3E%22%2C%20%22%2C%22)%0A%20%20%20%20%20%20%20%20.replace(%22%20%3CPERIOD%3E%22%2C%20%22.%22)%0A%20%20%20%20%20%20%20%20.replace(%22%20%3CQUESTIONMARK%3E%22%2C%20%22%3F%22)%0A%20%20%20%20%20%20%20%20.replace(%22%20%3CEXCLAMATIONPOINT%3E%22%2C%20%22!%22)%0A%20%20%20%20%20%20%20%20.lower()%0A%20%20%20%20%20%20%20%20.strip()%0A%20%20%20%20%20%20%20%20for%20t%20in%20batch%5B%22text%22%5D%0A%20%20%20%20%5D%0A%20%20%20%20batch%5B%22labels%22%5D%20%3D%20tokenizer(normalized).input_ids%0A%0A%20%20%20%20return%20batch%0A%0A%0Adef%20compute_metrics(pred%2C%20tokenizer%2C%20normalizer%2C%20metric)%3A%0A%20%20%20%20%22%22%22Compute%20Word%20Error%20Rate%20between%20predictions%20and%20ground%20truth.%22%22%22%0A%20%20%20%20pred_ids%20%3D%20pred.predictions%0A%0A%20%20%20%20%23%20Replace%20padding%20tokens%20with%20proper%20pad%20token%20ID%0A%20%20%20%20pred.label_ids%5Bpred.label_ids%20%3D%3D%20-100%5D%20%3D%20tokenizer.pad_token_id%0A%0A%20%20%20%20%23%20Decode%20predictions%20and%20labels%20back%20to%20text%0A%20%20%20%20pred_str%20%3D%20tokenizer.batch_decode(pred_ids%2C%20skip_special_tokens%3DTrue)%0A%20%20%20%20norm_pred_str%20%3D%20%5Bnormalizer(s).strip()%20for%20s%20in%20pred_str%5D%0A%0A%20%20%20%20label_str%20%3D%20tokenizer.batch_decode(pred.label_ids%2C%20skip_special_tokens%3DTrue)%0A%20%20%20%20norm_label_str%20%3D%20%5Bnormalizer(s).strip()%20for%20s%20in%20label_str%5D%0A%0A%20%20%20%20%23%20Calculate%20Word%20Error%20Rate%0A%20%20%20%20wer%20%3D%20metric.compute(predictions%3Dnorm_pred_str%2C%20references%3Dnorm_label_str)%0A%20%20%20%20return%20%7B%22wer%22%3A%20wer%7D%0A%0A%0A%40dataclass%0Aclass%20DataCollatorSpeechSeq2SeqWithPadding%3A%0A%20%20%20%20%22%22%22%0A%20%20%20%20Data%20collator%20that%20pads%20audio%20features%20and%20text%20labels%20for%20batch%20training.%0A%0A%20%20%20%20Args%3A%0A%20%20%20%20%20%20%20%20processor%3A%20WhisperProcessor%20combining%20feature%20extractor%20and%20tokenizer%0A%20%20%20%20%20%20%20%20decoder_start_token_id%3A%20The%20BOS%20token%20ID%20for%20the%20decoder%0A%20%20%20%20%22%22%22%0A%0A%20%20%20%20processor%3A%20Any%0A%20%20%20%20decoder_start_token_id%3A%20int%0A%0A%20%20%20%20def%20__call__(%0A%20%20%20%20%20%20%20%20self%2C%20features%3A%20list%5Bdict%5Bstr%2C%20Union%5Blist%5Bint%5D%2C%20%22torch.Tensor%22%5D%5D%5D%0A%20%20%20%20)%20-%3E%20dict%5Bstr%2C%20%22torch.Tensor%22%5D%3A%0A%20%20%20%20%20%20%20%20%23%20Separate%20audio%20features%20and%20text%20labels%20since%20they%20need%20different%20padding%0A%20%20%20%20%20%20%20%20model_input_name%20%3D%20self.processor.model_input_names%5B0%5D%0A%20%20%20%20%20%20%20%20input_features%20%3D%20%5B%0A%20%20%20%20%20%20%20%20%20%20%20%20%7Bmodel_input_name%3A%20feature%5Bmodel_input_name%5D%7D%20for%20feature%20in%20features%0A%20%20%20%20%20%20%20%20%5D%0A%20%20%20%20%20%20%20%20label_features%20%3D%20%5B%7B%22input_ids%22%3A%20feature%5B%22labels%22%5D%7D%20for%20feature%20in%20features%5D%0A%0A%20%20%20%20%20%20%20%20batch%20%3D%20self.processor.feature_extractor.pad(%0A%20%20%20%20%20%20%20%20%20%20%20%20input_features%2C%0A%20%20%20%20%20%20%20%20%20%20%20%20return_tensors%3D%22pt%22%2C%0A%20%20%20%20%20%20%20%20%20%20%20%20return_attention_mask%3DTrue%2C%0A%20%20%20%20%20%20%20%20%20%20%20%20padding%3DTrue%2C%0A%20%20%20%20%20%20%20%20)%0A%0A%20%20%20%20%20%20%20%20labels_batch%20%3D%20self.processor.tokenizer.pad(label_features%2C%20return_tensors%3D%22pt%22)%0A%0A%20%20%20%20%20%20%20%20%23%20Replace%20padding%20tokens%20with%20-100%20so%20they're%20ignored%20in%20loss%20calculation%0A%20%20%20%20%20%20%20%20labels%20%3D%20labels_batch%5B%22input_ids%22%5D.masked_fill(%0A%20%20%20%20%20%20%20%20%20%20%20%20labels_batch.attention_mask.ne(1)%2C%20-100%0A%20%20%20%20%20%20%20%20)%0A%0A%20%20%20%20%20%20%20%20%23%20Remove%20start%20token%20if%20tokenizer%20added%20it%20-%20model%20will%20add%20it%20during%20training%0A%20%20%20%20%20%20%20%20if%20(labels%5B%3A%2C%200%5D%20%3D%3D%20self.decoder_start_token_id).all().cpu().item()%3A%0A%20%20%20%20%20%20%20%20%20%20%20%20labels%20%3D%20labels%5B%3A%2C%201%3A%5D%0A%0A%20%20%20%20%20%20%20%20batch%5B%22labels%22%5D%20%3D%20labels%0A%0A%20%20%20%20%20%20%20%20return%20batch%0A`,lang:`python`}),i(t,a)},$$slots:{default:!0}}))}export{w as default,h as metadata};
//# sourceMappingURL=Dd97x9jM2.js.map
