(function(){try{var e=typeof window<`u`?window:typeof global<`u`?global:typeof globalThis<`u`?globalThis:typeof self<`u`?self:{};e.SENTRY_RELEASE={id:`f99fcf9f0a844cc9bd13fdc8e5782b84`};var t=new e.Error().stack;t&&(e._sentryDebugIds=e._sentryDebugIds||{},e._sentryDebugIds[t]=`169bd284-56f7-4495-a4ad-2fb0c462fa0e`,e._sentryDebugIdIdentifier=`sentry-dbid-169bd284-56f7-4495-a4ad-2fb0c462fa0e`)}catch{}})();import{$t as e,St as t,Tn as n,Tt as r,bt as i,c as a,d as o,en as s,tn as c,wn as l}from"./F_ixKBiO.js";import"./B1sc9Zdx.js";import"./Bb2deiU3.js";import{a as u,o as d}from"./CPby7b1n.js";import{t as f}from"./BILrvr3I.js";import{t as p}from"./B4L_if842.js";import{t as m}from"./DeWGVqas2.js";var h={toc:[{depth:1,value:`Run long, resumable training jobs on Modal`,id:`run-long-resumable-training-jobs-on-modal`,children:[{depth:2,value:`Resuming from checkpoints in a training loop`,id:`resuming-from-checkpoints-in-a-training-loop`},{depth:2,value:`Modal Volumes are distributed file systems`,id:`modal-volumes-are-distributed-file-systems`},{depth:2,value:`Porting training to Modal`,id:`porting-training-to-modal`},{depth:2,value:`Kicking off interruptible training`,id:`kicking-off-interruptible-training`},{depth:2,value:`Details of PyTorch Lightning implementation`,id:`details-of-pytorch-lightning-implementation`}]}],rawContent:`# Run long, resumable training jobs on Modal

Individual Modal Function calls have a [maximum timeout of 24 hours](https://modal.com/docs/guide/timeouts).
You can still run long training jobs on Modal by making them interruptible and resumable
(aka [_reentrant_](https://en.wikipedia.org/wiki/Reentrancy_%28computing%29)).

This is usually done via checkpointing: saving the model state to disk at regular intervals.
We recommend implementing checkpointing logic regardless of the duration of your training jobs.
This prevents loss of progress in case of interruptions or [preemptions](https://modal.com/docs/guide/preemption).

In this example, we'll walk through how to implement this pattern in
[PyTorch Lightning](https://lightning.ai/docs/pytorch/2.4.0/).

But the fundamental pattern is simple and can be applied to any training framework:

1. Periodically save checkpoints to a Modal [Volume](https://modal.com/docs/guide/volumes)
2. When your training function starts, check the Volume for the latest checkpoint
3. Add [retries](https://modal.com/docs/guide/retries) to your training function

## Resuming from checkpoints in a training loop

The \`train\` function below shows some very simple training logic
using the built-in checkpointing features of PyTorch Lightning.

Lightning uses a special filename, \`last.ckpt\`,
to indicate which checkpoint is the most recent.
We check for this file and resume training from it if it exists.

\`\`\`python
from pathlib import Path
from typing import Optional

import modal


def train(experiment):
    experiment_dir = CHECKPOINTS_PATH / experiment
    last_checkpoint = experiment_dir / "last.ckpt"

    if last_checkpoint.exists():
        print(f"⚡️ resuming training from the latest checkpoint: {last_checkpoint}")
        train_model(
            DATA_PATH,
            experiment_dir,
            resume_from_checkpoint=last_checkpoint,
        )
        print("⚡️ training finished successfully")
    else:
        print("⚡️ starting training from scratch")
        train_model(DATA_PATH, experiment_dir)


\`\`\`

This implementation works fine in a local environment.
Running it serverlessly and durably on Modal -- with access to auto-scaling cloud GPU infrastructure
-- does not require any adjustments to the code.
We just need to ensure that data and checkpoints are saved in Modal _Volumes_.

## Modal Volumes are distributed file systems

Modal [Volumes](https://modal.com/docs/guide/volumes) are distributed file systems --
you can read and write files from them just like local disks,
but they are accessible to all of your Modal Functions.
Their performance is tuned for [Write-Once, Read-Many](https://en.wikipedia.org/wiki/Write_once_read_many) workloads
with small numbers of large files.

You can attach them to any Modal Function that needs access.

But first, you need to create them:

\`\`\`python
volume = modal.Volume.from_name("example-long-training", create_if_missing=True)

\`\`\`

## Porting training to Modal

To attach a Modal Volume to our training function, we need to port it over to run on Modal.

That means we need to define our training function's dependencies
(as a [container image](https://modal.com/docs/guide/custom-container))
and attach it to an application (a [\`modal.App\`](https://modal.com/docs/guide/apps)).

Modal Functions that run on GPUs [already have CUDA drivers installed](https://modal.com/docs/guide/cuda),
so dependency specification is straightforward.
We just \`uv_pip_install\` PyTorch and PyTorch Lightning.

\`\`\`python
image = modal.Image.debian_slim(python_version="3.12").uv_pip_install(
    "lightning~=2.4.0", "torch~=2.4.0", "torchvision==0.19.0"
)

app = modal.App("example-long-training", image=image)

\`\`\`

Next, we attach our training function to this app with \`app.function\`.

We define all of the serverless infrastructure-specific details of our training at this point.
For resumable training, there are three key pieces: attaching volumes, adding retries, and setting the timeout.

We want to attach the Volume to our Function so that the data and checkpoints are saved into it.
In this sample code, we set these paths via global variables, but in another setting,
these might be set via environment variables or other configuration mechanisms.

\`\`\`python
volume_path = Path("/experiments")
DATA_PATH = volume_path / "data"
CHECKPOINTS_PATH = volume_path / "checkpoints"

volumes = {volume_path: volume}

\`\`\`

Then, we define how we want to restart our training in case of interruption.
We can use \`modal.Retries\` to add automatic retries to our Function.
We set the delay time to \`0.0\` seconds, because on pre-emption or timeout we want to restart immediately.
We set \`max_retries\` to the current maximum, which is \`10\`.

\`\`\`python
retries = modal.Retries(initial_delay=0.0, max_retries=10)

\`\`\`

Timeouts on Modal are set in seconds, with a minimum of 10 seconds and a maximum of 24 hours.
When running training jobs that last up to week, we'd set that timeout to 24 hours,
which would give our training job a maximum of 10 days to complete before we'd need to manually restart.

For this example, we'll set it to 30 seconds. When running the example, you should observe a few interruptions.

\`\`\`python
timeout = 30  # seconds

\`\`\`

Now, we put all of this together by wrapping \`train\` and decorating it
with \`app.function\` to add all the infrastructure. We add the \`single_use_containers\` flag to ensure that our retries
will always kickoff in a fresh container.

\`\`\`python
@app.function(
    volumes=volumes,
    gpu="a10g",
    timeout=timeout,
    retries=retries,
    single_use_containers=True,
)
def train_interruptible(*args, **kwargs):
    train(*args, **kwargs)


\`\`\`

## Kicking off interruptible training

We define a [\`local_entrypoint\`](https://modal.com/docs/guide/apps#entrypoints-for-ephemeral-apps)
to kick off the training job from the local Python environment.

\`\`\`python
@app.local_entrypoint()
def main(experiment: Optional[str] = None):
    if experiment is None:
        from uuid import uuid4

        experiment = uuid4().hex[:8]
    print(f"⚡️ starting interruptible training experiment {experiment}")
    train_interruptible.spawn(experiment).get()


\`\`\`

It's important to use \`.spawn(...).get()\` because \`.remote\` created Function Calls
expire after 24 hours.

You can run this with
\`\`\`bash
modal run --detach 06_gpu_and_ml/long-training.py
\`\`\`

You should see the training job start and then be interrupted,
producing a large stack trace in the terminal in red font.
The job will restart within a few seconds.

The \`--detach\` flag ensures training will continue even if you close your terminal or turn off your computer.
Try detaching and then watch the logs in the [Modal dashboard](https://modal.com/apps).

## Details of PyTorch Lightning implementation

This basic pattern works for any training framework or for custom training jobs --
or for any reentrant work that can save state to disk.

But to make the example complete, we include all the details of the PyTorch Lightning implementation below.

PyTorch Lightning offers [built-in checkpointing](https://pytorch-lightning.readthedocs.io/en/1.2.10/common/weights_loading.html).
You can specify the checkpoint file path that you want to resume from using the \`ckpt_path\` parameter of
[\`trainer.fit\`](https://lightning.ai/docs/pytorch/stable/api/lightning.pytorch.trainer.trainer.Trainer.html)
Additionally, you can specify the checkpointing interval with the \`every_n_epochs\` parameter of
[\`ModelCheckpoint\`](https://lightning.ai/docs/pytorch/stable/api/lightning.pytorch.callbacks.ModelCheckpoint.html).

\`\`\`python
def get_checkpoint(checkpoint_dir):
    from lightning.pytorch.callbacks import ModelCheckpoint

    return ModelCheckpoint(
        dirpath=checkpoint_dir,
        save_last=True,
        every_n_epochs=10,
        filename="{epoch:02d}",
    )


def train_model(data_dir, checkpoint_dir, resume_from_checkpoint=None):
    import lightning as L

    autoencoder = get_autoencoder()
    train_loader = get_train_loader(data_dir=data_dir)
    checkpoint_callback = get_checkpoint(checkpoint_dir)

    trainer = L.Trainer(
        limit_train_batches=100, max_epochs=100, callbacks=[checkpoint_callback]
    )
    if resume_from_checkpoint is not None:
        trainer.fit(
            model=autoencoder,
            train_dataloaders=train_loader,
            ckpt_path=resume_from_checkpoint,
        )
    else:
        trainer.fit(autoencoder, train_loader)


def get_autoencoder(checkpoint_path=None):
    import lightning as L
    from torch import nn, optim

    class LitAutoEncoder(L.LightningModule):
        def __init__(self):
            super().__init__()
            self.encoder = nn.Sequential(
                nn.Linear(28 * 28, 64), nn.ReLU(), nn.Linear(64, 3)
            )
            self.decoder = nn.Sequential(
                nn.Linear(3, 64), nn.ReLU(), nn.Linear(64, 28 * 28)
            )

        def training_step(self, batch, batch_idx):
            x, _ = batch
            x = x.view(x.size(0), -1)
            z = self.encoder(x)
            x_hat = self.decoder(z)
            loss = nn.functional.mse_loss(x_hat, x)
            self.log("train_loss", loss)
            return loss

        def configure_optimizers(self):
            optimizer = optim.Adam(self.parameters(), lr=1e-3)
            return optimizer

    return LitAutoEncoder()


def get_train_loader(data_dir):
    from torch import utils
    from torchvision.datasets import MNIST
    from torchvision.transforms import ToTensor

    print("⚡ setting up data")
    dataset = MNIST(data_dir, download=True, transform=ToTensor())
    train_loader = utils.data.DataLoader(dataset, num_workers=4)
    return train_loader

\`\`\`
`,meta:{title:`Run long, resumable training jobs on Modal`,description:`Individual Modal Function calls have a maximum timeout of 24 hours. You can still run long training jobs on Modal by making them interruptible and resumable (aka reentrant).`}},{toc:g,rawContent:_,meta:v}=h,y=t(`<em>reentrant</em>`),b=t(`<code>modal.App</code>`),x=t(`<code>local_entrypoint</code>`),S=t(`<code>trainer.fit</code>`),C=t(`<code>ModelCheckpoint</code>`),w=t(`<!> <p>Individual Modal Function calls have a <!>.
You can still run long training jobs on Modal by making them interruptible and resumable
(aka <!>).</p> <p>This is usually done via checkpointing: saving the model state to disk at regular intervals.
We recommend implementing checkpointing logic regardless of the duration of your training jobs.
This prevents loss of progress in case of interruptions or <!>.</p> <p>In this example, we’ll walk through how to implement this pattern in <!>.</p> <p>But the fundamental pattern is simple and can be applied to any training framework:</p> <ol><li>Periodically save checkpoints to a Modal <!></li> <li>When your training function starts, check the Volume for the latest checkpoint</li> <li>Add <!> to your training function</li></ol> <!> <p>The <code>train</code> function below shows some very simple training logic
using the built-in checkpointing features of PyTorch Lightning.</p> <p>Lightning uses a special filename, <code>last.ckpt</code>,
to indicate which checkpoint is the most recent.
We check for this file and resume training from it if it exists.</p> <!> <p>This implementation works fine in a local environment.
Running it serverlessly and durably on Modal — with access to auto-scaling cloud GPU infrastructure
— does not require any adjustments to the code.
We just need to ensure that data and checkpoints are saved in Modal <em>Volumes</em>.</p> <!> <p>Modal <!> are distributed file systems —
you can read and write files from them just like local disks,
but they are accessible to all of your Modal Functions.
Their performance is tuned for <!> workloads
with small numbers of large files.</p> <p>You can attach them to any Modal Function that needs access.</p> <p>But first, you need to create them:</p> <!> <!> <p>To attach a Modal Volume to our training function, we need to port it over to run on Modal.</p> <p>That means we need to define our training function’s dependencies
(as a <!>)
and attach it to an application (a <!>).</p> <p>Modal Functions that run on GPUs <!>,
so dependency specification is straightforward.
We just <code>uv_pip_install</code> PyTorch and PyTorch Lightning.</p> <!> <p>Next, we attach our training function to this app with <code>app.function</code>.</p> <p>We define all of the serverless infrastructure-specific details of our training at this point.
For resumable training, there are three key pieces: attaching volumes, adding retries, and setting the timeout.</p> <p>We want to attach the Volume to our Function so that the data and checkpoints are saved into it.
In this sample code, we set these paths via global variables, but in another setting,
these might be set via environment variables or other configuration mechanisms.</p> <!> <p>Then, we define how we want to restart our training in case of interruption.
We can use <code>modal.Retries</code> to add automatic retries to our Function.
We set the delay time to <code>0.0</code> seconds, because on pre-emption or timeout we want to restart immediately.
We set <code>max_retries</code> to the current maximum, which is <code>10</code>.</p> <!> <p>Timeouts on Modal are set in seconds, with a minimum of 10 seconds and a maximum of 24 hours.
When running training jobs that last up to week, we’d set that timeout to 24 hours,
which would give our training job a maximum of 10 days to complete before we’d need to manually restart.</p> <p>For this example, we’ll set it to 30 seconds. When running the example, you should observe a few interruptions.</p> <!> <p>Now, we put all of this together by wrapping <code>train</code> and decorating it
with <code>app.function</code> to add all the infrastructure. We add the <code>single_use_containers</code> flag to ensure that our retries
will always kickoff in a fresh container.</p> <!> <!> <p>We define a <!> to kick off the training job from the local Python environment.</p> <!> <p>It’s important to use <code>.spawn(...).get()</code> because <code>.remote</code> created Function Calls
expire after 24 hours.</p> <p>You can run this with</p> <!> <p>You should see the training job start and then be interrupted,
producing a large stack trace in the terminal in red font.
The job will restart within a few seconds.</p> <p>The <code>--detach</code> flag ensures training will continue even if you close your terminal or turn off your computer.
Try detaching and then watch the logs in the <!>.</p> <!> <p>This basic pattern works for any training framework or for custom training jobs —
or for any reentrant work that can save state to disk.</p> <p>But to make the example complete, we include all the details of the PyTorch Lightning implementation below.</p> <p>PyTorch Lightning offers <!>.
You can specify the checkpoint file path that you want to resume from using the <code>ckpt_path</code> parameter of <!> Additionally, you can specify the checkpointing interval with the <code>every_n_epochs</code> parameter of <!>.</p> <!>`,1);function T(t,g){let _=a(g,[`children`,`$$slots`,`$$events`,`$$legacy`]);p(t,o(()=>_,()=>h,{children:(t,a)=>{var o=w(),p=s(o);d(p,{id:`run-long-resumable-training-jobs-on-modal`,children:(e,t)=>{l(),i(e,r(`Run long, resumable training jobs on Modal`))},$$slots:{default:!0}});var h=c(p,2),g=c(e(h));m(g,{href:`https://modal.com/docs/guide/timeouts`,rel:`nofollow`,children:(e,t)=>{l(),i(e,r(`maximum timeout of 24 hours`))},$$slots:{default:!0}}),m(c(g,2),{href:`https://en.wikipedia.org/wiki/Reentrancy_%28computing%29`,rel:`nofollow`,children:(e,t)=>{i(e,y())},$$slots:{default:!0}}),l(),n(h);var _=c(h,2);m(c(e(_)),{href:`https://modal.com/docs/guide/preemption`,rel:`nofollow`,children:(e,t)=>{l(),i(e,r(`preemptions`))},$$slots:{default:!0}}),l(),n(_);var v=c(_,2);m(c(e(v)),{href:`https://lightning.ai/docs/pytorch/2.4.0/`,rel:`nofollow`,children:(e,t)=>{l(),i(e,r(`PyTorch Lightning`))},$$slots:{default:!0}}),l(),n(v);var T=c(v,4),E=e(T);m(c(e(E)),{href:`https://modal.com/docs/guide/volumes`,rel:`nofollow`,children:(e,t)=>{l(),i(e,r(`Volume`))},$$slots:{default:!0}}),n(E);var D=c(E,4);m(c(e(D)),{href:`https://modal.com/docs/guide/retries`,rel:`nofollow`,children:(e,t)=>{l(),i(e,r(`retries`))},$$slots:{default:!0}}),l(),n(D),n(T);var O=c(T,2);u(O,{id:`resuming-from-checkpoints-in-a-training-loop`,children:(e,t)=>{l(),i(e,r(`Resuming from checkpoints in a training loop`))},$$slots:{default:!0}});var k=c(O,6);f(k,{code:`from%20pathlib%20import%20Path%0Afrom%20typing%20import%20Optional%0A%0Aimport%20modal%0A%0A%0Adef%20train(experiment)%3A%0A%20%20%20%20experiment_dir%20%3D%20CHECKPOINTS_PATH%20%2F%20experiment%0A%20%20%20%20last_checkpoint%20%3D%20experiment_dir%20%2F%20%22last.ckpt%22%0A%0A%20%20%20%20if%20last_checkpoint.exists()%3A%0A%20%20%20%20%20%20%20%20print(f%22%E2%9A%A1%EF%B8%8F%20resuming%20training%20from%20the%20latest%20checkpoint%3A%20%7Blast_checkpoint%7D%22)%0A%20%20%20%20%20%20%20%20train_model(%0A%20%20%20%20%20%20%20%20%20%20%20%20DATA_PATH%2C%0A%20%20%20%20%20%20%20%20%20%20%20%20experiment_dir%2C%0A%20%20%20%20%20%20%20%20%20%20%20%20resume_from_checkpoint%3Dlast_checkpoint%2C%0A%20%20%20%20%20%20%20%20)%0A%20%20%20%20%20%20%20%20print(%22%E2%9A%A1%EF%B8%8F%20training%20finished%20successfully%22)%0A%20%20%20%20else%3A%0A%20%20%20%20%20%20%20%20print(%22%E2%9A%A1%EF%B8%8F%20starting%20training%20from%20scratch%22)%0A%20%20%20%20%20%20%20%20train_model(DATA_PATH%2C%20experiment_dir)%0A%0A`,lang:`python`});var A=c(k,4);u(A,{id:`modal-volumes-are-distributed-file-systems`,children:(e,t)=>{l(),i(e,r(`Modal Volumes are distributed file systems`))},$$slots:{default:!0}});var j=c(A,2),M=c(e(j));m(M,{href:`https://modal.com/docs/guide/volumes`,rel:`nofollow`,children:(e,t)=>{l(),i(e,r(`Volumes`))},$$slots:{default:!0}}),m(c(M,2),{href:`https://en.wikipedia.org/wiki/Write_once_read_many`,rel:`nofollow`,children:(e,t)=>{l(),i(e,r(`Write-Once, Read-Many`))},$$slots:{default:!0}}),l(),n(j);var N=c(j,6);f(N,{code:`volume%20%3D%20modal.Volume.from_name(%22example-long-training%22%2C%20create_if_missing%3DTrue)%0A`,lang:`python`});var P=c(N,2);u(P,{id:`porting-training-to-modal`,children:(e,t)=>{l(),i(e,r(`Porting training to Modal`))},$$slots:{default:!0}});var F=c(P,4),I=c(e(F));m(I,{href:`https://modal.com/docs/guide/custom-container`,rel:`nofollow`,children:(e,t)=>{l(),i(e,r(`container image`))},$$slots:{default:!0}}),m(c(I,2),{href:`https://modal.com/docs/guide/apps`,rel:`nofollow`,children:(e,t)=>{i(e,b())},$$slots:{default:!0}}),l(),n(F);var L=c(F,2);m(c(e(L)),{href:`https://modal.com/docs/guide/cuda`,rel:`nofollow`,children:(e,t)=>{l(),i(e,r(`already have CUDA drivers installed`))},$$slots:{default:!0}}),l(3),n(L);var R=c(L,2);f(R,{code:`image%20%3D%20modal.Image.debian_slim(python_version%3D%223.12%22).uv_pip_install(%0A%20%20%20%20%22lightning~%3D2.4.0%22%2C%20%22torch~%3D2.4.0%22%2C%20%22torchvision%3D%3D0.19.0%22%0A)%0A%0Aapp%20%3D%20modal.App(%22example-long-training%22%2C%20image%3Dimage)%0A`,lang:`python`});var z=c(R,8);f(z,{code:`volume_path%20%3D%20Path(%22%2Fexperiments%22)%0ADATA_PATH%20%3D%20volume_path%20%2F%20%22data%22%0ACHECKPOINTS_PATH%20%3D%20volume_path%20%2F%20%22checkpoints%22%0A%0Avolumes%20%3D%20%7Bvolume_path%3A%20volume%7D%0A`,lang:`python`});var B=c(z,4);f(B,{code:`retries%20%3D%20modal.Retries(initial_delay%3D0.0%2C%20max_retries%3D10)%0A`,lang:`python`});var V=c(B,6);f(V,{code:`timeout%20%3D%2030%20%20%23%20seconds%0A`,lang:`python`});var H=c(V,4);f(H,{code:`%40app.function(%0A%20%20%20%20volumes%3Dvolumes%2C%0A%20%20%20%20gpu%3D%22a10g%22%2C%0A%20%20%20%20timeout%3Dtimeout%2C%0A%20%20%20%20retries%3Dretries%2C%0A%20%20%20%20single_use_containers%3DTrue%2C%0A)%0Adef%20train_interruptible(*args%2C%20**kwargs)%3A%0A%20%20%20%20train(*args%2C%20**kwargs)%0A%0A`,lang:`python`});var U=c(H,2);u(U,{id:`kicking-off-interruptible-training`,children:(e,t)=>{l(),i(e,r(`Kicking off interruptible training`))},$$slots:{default:!0}});var W=c(U,2);m(c(e(W)),{href:`https://modal.com/docs/guide/apps#entrypoints-for-ephemeral-apps`,rel:`nofollow`,children:(e,t)=>{i(e,x())},$$slots:{default:!0}}),l(),n(W);var G=c(W,2);f(G,{code:`%40app.local_entrypoint()%0Adef%20main(experiment%3A%20Optional%5Bstr%5D%20%3D%20None)%3A%0A%20%20%20%20if%20experiment%20is%20None%3A%0A%20%20%20%20%20%20%20%20from%20uuid%20import%20uuid4%0A%0A%20%20%20%20%20%20%20%20experiment%20%3D%20uuid4().hex%5B%3A8%5D%0A%20%20%20%20print(f%22%E2%9A%A1%EF%B8%8F%20starting%20interruptible%20training%20experiment%20%7Bexperiment%7D%22)%0A%20%20%20%20train_interruptible.spawn(experiment).get()%0A%0A`,lang:`python`});var K=c(G,6);f(K,{code:`modal%20run%20--detach%2006_gpu_and_ml%2Flong-training.py`,lang:`bash`});var q=c(K,4);m(c(e(q),3),{href:`https://modal.com/apps`,rel:`nofollow`,children:(e,t)=>{l(),i(e,r(`Modal dashboard`))},$$slots:{default:!0}}),l(),n(q);var J=c(q,2);u(J,{id:`details-of-pytorch-lightning-implementation`,children:(e,t)=>{l(),i(e,r(`Details of PyTorch Lightning implementation`))},$$slots:{default:!0}});var Y=c(J,6),X=c(e(Y));m(X,{href:`https://pytorch-lightning.readthedocs.io/en/1.2.10/common/weights_loading.html`,rel:`nofollow`,children:(e,t)=>{l(),i(e,r(`built-in checkpointing`))},$$slots:{default:!0}});var Z=c(X,4);m(Z,{href:`https://lightning.ai/docs/pytorch/stable/api/lightning.pytorch.trainer.trainer.Trainer.html`,rel:`nofollow`,children:(e,t)=>{i(e,S())},$$slots:{default:!0}}),m(c(Z,4),{href:`https://lightning.ai/docs/pytorch/stable/api/lightning.pytorch.callbacks.ModelCheckpoint.html`,rel:`nofollow`,children:(e,t)=>{i(e,C())},$$slots:{default:!0}}),l(),n(Y),f(c(Y,2),{code:`def%20get_checkpoint(checkpoint_dir)%3A%0A%20%20%20%20from%20lightning.pytorch.callbacks%20import%20ModelCheckpoint%0A%0A%20%20%20%20return%20ModelCheckpoint(%0A%20%20%20%20%20%20%20%20dirpath%3Dcheckpoint_dir%2C%0A%20%20%20%20%20%20%20%20save_last%3DTrue%2C%0A%20%20%20%20%20%20%20%20every_n_epochs%3D10%2C%0A%20%20%20%20%20%20%20%20filename%3D%22%7Bepoch%3A02d%7D%22%2C%0A%20%20%20%20)%0A%0A%0Adef%20train_model(data_dir%2C%20checkpoint_dir%2C%20resume_from_checkpoint%3DNone)%3A%0A%20%20%20%20import%20lightning%20as%20L%0A%0A%20%20%20%20autoencoder%20%3D%20get_autoencoder()%0A%20%20%20%20train_loader%20%3D%20get_train_loader(data_dir%3Ddata_dir)%0A%20%20%20%20checkpoint_callback%20%3D%20get_checkpoint(checkpoint_dir)%0A%0A%20%20%20%20trainer%20%3D%20L.Trainer(%0A%20%20%20%20%20%20%20%20limit_train_batches%3D100%2C%20max_epochs%3D100%2C%20callbacks%3D%5Bcheckpoint_callback%5D%0A%20%20%20%20)%0A%20%20%20%20if%20resume_from_checkpoint%20is%20not%20None%3A%0A%20%20%20%20%20%20%20%20trainer.fit(%0A%20%20%20%20%20%20%20%20%20%20%20%20model%3Dautoencoder%2C%0A%20%20%20%20%20%20%20%20%20%20%20%20train_dataloaders%3Dtrain_loader%2C%0A%20%20%20%20%20%20%20%20%20%20%20%20ckpt_path%3Dresume_from_checkpoint%2C%0A%20%20%20%20%20%20%20%20)%0A%20%20%20%20else%3A%0A%20%20%20%20%20%20%20%20trainer.fit(autoencoder%2C%20train_loader)%0A%0A%0Adef%20get_autoencoder(checkpoint_path%3DNone)%3A%0A%20%20%20%20import%20lightning%20as%20L%0A%20%20%20%20from%20torch%20import%20nn%2C%20optim%0A%0A%20%20%20%20class%20LitAutoEncoder(L.LightningModule)%3A%0A%20%20%20%20%20%20%20%20def%20__init__(self)%3A%0A%20%20%20%20%20%20%20%20%20%20%20%20super().__init__()%0A%20%20%20%20%20%20%20%20%20%20%20%20self.encoder%20%3D%20nn.Sequential(%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20nn.Linear(28%20*%2028%2C%2064)%2C%20nn.ReLU()%2C%20nn.Linear(64%2C%203)%0A%20%20%20%20%20%20%20%20%20%20%20%20)%0A%20%20%20%20%20%20%20%20%20%20%20%20self.decoder%20%3D%20nn.Sequential(%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20nn.Linear(3%2C%2064)%2C%20nn.ReLU()%2C%20nn.Linear(64%2C%2028%20*%2028)%0A%20%20%20%20%20%20%20%20%20%20%20%20)%0A%0A%20%20%20%20%20%20%20%20def%20training_step(self%2C%20batch%2C%20batch_idx)%3A%0A%20%20%20%20%20%20%20%20%20%20%20%20x%2C%20_%20%3D%20batch%0A%20%20%20%20%20%20%20%20%20%20%20%20x%20%3D%20x.view(x.size(0)%2C%20-1)%0A%20%20%20%20%20%20%20%20%20%20%20%20z%20%3D%20self.encoder(x)%0A%20%20%20%20%20%20%20%20%20%20%20%20x_hat%20%3D%20self.decoder(z)%0A%20%20%20%20%20%20%20%20%20%20%20%20loss%20%3D%20nn.functional.mse_loss(x_hat%2C%20x)%0A%20%20%20%20%20%20%20%20%20%20%20%20self.log(%22train_loss%22%2C%20loss)%0A%20%20%20%20%20%20%20%20%20%20%20%20return%20loss%0A%0A%20%20%20%20%20%20%20%20def%20configure_optimizers(self)%3A%0A%20%20%20%20%20%20%20%20%20%20%20%20optimizer%20%3D%20optim.Adam(self.parameters()%2C%20lr%3D1e-3)%0A%20%20%20%20%20%20%20%20%20%20%20%20return%20optimizer%0A%0A%20%20%20%20return%20LitAutoEncoder()%0A%0A%0Adef%20get_train_loader(data_dir)%3A%0A%20%20%20%20from%20torch%20import%20utils%0A%20%20%20%20from%20torchvision.datasets%20import%20MNIST%0A%20%20%20%20from%20torchvision.transforms%20import%20ToTensor%0A%0A%20%20%20%20print(%22%E2%9A%A1%20setting%20up%20data%22)%0A%20%20%20%20dataset%20%3D%20MNIST(data_dir%2C%20download%3DTrue%2C%20transform%3DToTensor())%0A%20%20%20%20train_loader%20%3D%20utils.data.DataLoader(dataset%2C%20num_workers%3D4)%0A%20%20%20%20return%20train_loader%0A`,lang:`python`}),i(t,o)},$$slots:{default:!0}}))}export{T as default,h as metadata};
//# sourceMappingURL=D-PGcqVO.js.map
