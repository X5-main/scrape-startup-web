(function(){try{var e=typeof window<`u`?window:typeof global<`u`?global:typeof globalThis<`u`?globalThis:typeof self<`u`?self:{};e.SENTRY_RELEASE={id:`f99fcf9f0a844cc9bd13fdc8e5782b84`};var t=new e.Error().stack;t&&(e._sentryDebugIds=e._sentryDebugIds||{},e._sentryDebugIds[t]=`b564a730-2835-4d23-9436-02679c110523`,e._sentryDebugIdIdentifier=`sentry-dbid-b564a730-2835-4d23-9436-02679c110523`)}catch{}})();import{$t as e,St as t,Tn as n,Tt as r,bt as i,c as a,d as o,en as s,tn as c,wn as l}from"./F_ixKBiO.js";import"./B1sc9Zdx.js";import"./Bb2deiU3.js";import{a as u,o as d}from"./CPby7b1n.js";import{t as f}from"./JPsrybyr.js";import{t as p}from"./BILrvr3I.js";import{t as m}from"./B4L_if842.js";import{t as h}from"./DeWGVqas2.js";import{t as g}from"./CYNta9DH.js";var _={toc:[{depth:1,value:`TensorFlow tutorial`,id:`tensorflow-tutorial`,children:[{depth:2,value:`Setting up the dependencies`,id:`setting-up-the-dependencies`},{depth:2,value:`Logging data to TensorBoard`,id:`logging-data-to-tensorboard`},{depth:2,value:`Training function`,id:`training-function`},{depth:2,value:`Running TensorBoard`,id:`running-tensorboard`},{depth:2,value:`Local entrypoint code`,id:`local-entrypoint-code`}]}],rawContent:`# TensorFlow tutorial

This is essentially a version of the
[image classification example in the TensorFlow documentation](https://www.tensorflow.org/tutorials/images/classification)
running inside Modal on a GPU.
If you run this script, it will also create an TensorBoard URL you can go to to watch the model train and review the results:

![tensorboard](./tensorboard.png)

## Setting up the dependencies

Configuring a system to properly run GPU-accelerated TensorFlow can be challenging.
Luckily, Modal makes it easy to stand on the shoulders of giants and
[use a pre-built Docker container image](https://modal.com/docs/guide/custom-container#use-an-existing-container-image-with-from_registry) from a registry like Docker Hub.
We recommend TensorFlow's [official base Docker container images](https://hub.docker.com/r/tensorflow/tensorflow), which come with \`tensorflow\` and its matching CUDA libraries already installed.

If you want to install TensorFlow some other way, check out [their docs](https://www.tensorflow.org/install) for options and instructions.
GPU-enabled containers on Modal will always have NVIDIA drivers available, but you will need to add higher-level tools like CUDA and cuDNN yourself.
See the [Modal guide on customizing environments](https://modal.com/docs/guide/custom-container) for options we support.

\`\`\`python
import time

import modal

dockerhub_image = modal.Image.from_registry(
    "tensorflow/tensorflow:2.15.0-gpu",
)

app = modal.App("example-tensorflow-tutorial", image=dockerhub_image)

\`\`\`

## Logging data to TensorBoard

Training ML models takes time. Just as we need to monitor long-running systems like databases or web servers for issues,
we also need to monitor the training process of our ML models. TensorBoard is a tool that comes with TensorFlow that helps you visualize
the state of your ML model training. It is packaged as a web server.

We want to run the web server for TensorBoard at the same time as we are training the
TensorFlow model. The easiest way to share data between the training function and the
web server is by creating a
[Modal Volume](https://modal.com/docs/guide/volumes)
that we can attach to both
[Functions](https://modal.com/docs/reference/modal.Function).

\`\`\`python
volume = modal.Volume.from_name("tensorflow-tutorial", create_if_missing=True)
LOGDIR = "/tensorboard"

\`\`\`

## Training function

This is basically the same code as [the official example](https://www.tensorflow.org/tutorials/images/classification) from the TensorFlow docs.
A few Modal-specific things are worth pointing out:

* We attach the Volume for sharing data with TensorBoard in the \`app.function\`
  decorator.

* We also annotate this function with \`gpu="T4"\` to make sure it runs on a GPU.

* We put all the TensorFlow imports inside the function body.
  This makes it possible to run this example even if you don't have TensorFlow installed on your local computer -- a key benefit of Modal!

You may notice some warnings in the logs about certain CPU performance optimizations (NUMA awareness and AVX/SSE instruction set support) not being available.
While these optimizations can be important for some workloads, especially if you are running ML models on a CPU, they are not critical for most cases.

\`\`\`python
@app.function(volumes={LOGDIR: volume}, gpu="T4", timeout=600)
def train():
    import pathlib

    import tensorflow as tf
    from tensorflow.keras import layers
    from tensorflow.keras.models import Sequential

    # load raw data from storage
    dataset_url = "https://storage.googleapis.com/download.tensorflow.org/example_images/flower_photos.tgz"
    data_dir = tf.keras.utils.get_file(
        "flower_photos.tar", origin=dataset_url, extract=True
    )
    data_dir = pathlib.Path(data_dir).with_suffix("")

    # construct Keras datasets from raw data
    batch_size = 32
    img_height = img_width = 180

    train_ds = tf.keras.utils.image_dataset_from_directory(
        data_dir,
        validation_split=0.2,
        subset="training",
        seed=123,
        image_size=(img_height, img_width),
        batch_size=batch_size,
    )

    val_ds = tf.keras.utils.image_dataset_from_directory(
        data_dir,
        validation_split=0.2,
        subset="validation",
        seed=123,
        image_size=(img_height, img_width),
        batch_size=batch_size,
    )

    class_names = train_ds.class_names
    train_ds = (
        train_ds.cache().shuffle(1000).prefetch(buffer_size=tf.data.AUTOTUNE)  # type: ignore
    )
    val_ds = val_ds.cache().prefetch(buffer_size=tf.data.AUTOTUNE)  # type: ignore
    num_classes = len(class_names)

    model = Sequential(
        [
            layers.Rescaling(1.0 / 255, input_shape=(img_height, img_width, 3)),
            layers.Conv2D(16, 3, padding="same", activation="relu"),
            layers.MaxPooling2D(),
            layers.Conv2D(32, 3, padding="same", activation="relu"),
            layers.MaxPooling2D(),
            layers.Conv2D(64, 3, padding="same", activation="relu"),
            layers.MaxPooling2D(),
            layers.Flatten(),
            layers.Dense(128, activation="relu"),
            layers.Dense(num_classes),
        ]
    )

    model.compile(
        optimizer="adam",
        loss=tf.keras.losses.SparseCategoricalCrossentropy(from_logits=True),
        metrics=["accuracy"],
    )

    model.summary()

    tensorboard_callback = tf.keras.callbacks.TensorBoard(
        log_dir=LOGDIR,
        histogram_freq=1,
    )

    model.fit(
        train_ds,
        validation_data=val_ds,
        epochs=20,
        callbacks=[tensorboard_callback],
    )


\`\`\`

## Running TensorBoard

TensorBoard is compatible with a Python web server standard called [WSGI](https://www.fullstackpython.com/wsgi-servers.html),
the same standard used by [Flask](https://flask.palletsprojects.com/).
Modal [speaks WSGI too](https://modal.com/docs/guide/webhooks#wsgi), so it's straightforward to run TensorBoard in a Modal app.

We will attach the same Volume that we attached to our training function so that
TensorBoard can read the logs. For this to work with Modal, we will first
create some
[WSGI Middleware](https://peps.python.org/pep-3333/)
to check the Modal Volume for updates any time the page is reloaded.

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

The WSGI app isn't exposed directly through the TensorBoard library, but we can build it
the same way it's built internally --
[see the TensorBoard source code for details](https://github.com/tensorflow/tensorboard/blob/0c5523f4b27046e1ca7064dd75347a5ee6cc7f79/tensorboard/program.py#L466-L476).

Note that the TensorBoard server runs in a different container.
The server does not need GPU support.
Note that this server will be exposed to the public internet!

\`\`\`python
@app.function(
    volumes={LOGDIR: volume},
    max_containers=1,  # single replica
    scaledown_window=5 * 60,  # five minute idle time
)
@modal.concurrent(max_inputs=100)  # 100 concurrent request threads
@modal.wsgi_app()
def tensorboard_app():
    import tensorboard

    board = tensorboard.program.TensorBoard()
    board.configure(logdir=LOGDIR)
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

## Local entrypoint code

Let's kick everything off.
Everything runs in an ephemeral "app" that gets destroyed once it's done.
In order to keep the TensorBoard web server running, we sleep in an infinite loop
until the user hits ctrl-c.

The script will take a few minutes to run, although each epoch is quite fast since it runs on a GPU.
The first time you run it, it might have to build the image, which can take an additional few minutes.

\`\`\`python
@app.local_entrypoint()
def main(just_run: bool = False):
    train.remote()
    if not just_run:
        print(
            "Training is done, but the app is still running TensorBoard until you hit ctrl-c."
        )
        try:
            while True:
                time.sleep(1)
        except KeyboardInterrupt:
            print("Terminating app")

\`\`\`
`,meta:{title:`TensorFlow tutorial`,description:`This is essentially a version of the image classification example in the TensorFlow documentation running inside Modal on a GPU. If you run this script, it will also create an TensorBoard URL you can go to to watch the model train and review the results:`}},{toc:v,rawContent:y,meta:b}=_,x=t(`<!> <p>This is essentially a version of the <!> running inside Modal on a GPU.
If you run this script, it will also create an TensorBoard URL you can go to to watch the model train and review the results:</p> <p><!></p> <!> <p>Configuring a system to properly run GPU-accelerated TensorFlow can be challenging.
Luckily, Modal makes it easy to stand on the shoulders of giants and <!> from a registry like Docker Hub.
We recommend TensorFlow’s <!>, which come with <code>tensorflow</code> and its matching CUDA libraries already installed.</p> <p>If you want to install TensorFlow some other way, check out <!> for options and instructions.
GPU-enabled containers on Modal will always have NVIDIA drivers available, but you will need to add higher-level tools like CUDA and cuDNN yourself.
See the <!> for options we support.</p> <!> <!> <p>Training ML models takes time. Just as we need to monitor long-running systems like databases or web servers for issues,
we also need to monitor the training process of our ML models. TensorBoard is a tool that comes with TensorFlow that helps you visualize
the state of your ML model training. It is packaged as a web server.</p> <p>We want to run the web server for TensorBoard at the same time as we are training the
TensorFlow model. The easiest way to share data between the training function and the
web server is by creating a <!> that we can attach to both <!>.</p> <!> <!> <p>This is basically the same code as <!> from the TensorFlow docs.
A few Modal-specific things are worth pointing out:</p> <ul><li><p>We attach the Volume for sharing data with TensorBoard in the <code>app.function</code> decorator.</p></li> <li><p>We also annotate this function with <code>gpu="T4"</code> to make sure it runs on a GPU.</p></li> <li><p>We put all the TensorFlow imports inside the function body.
This makes it possible to run this example even if you don’t have TensorFlow installed on your local computer — a key benefit of Modal!</p></li></ul> <p>You may notice some warnings in the logs about certain CPU performance optimizations (NUMA awareness and AVX/SSE instruction set support) not being available.
While these optimizations can be important for some workloads, especially if you are running ML models on a CPU, they are not critical for most cases.</p> <!> <!> <p>TensorBoard is compatible with a Python web server standard called <!>,
the same standard used by <!>.
Modal <!>, so it’s straightforward to run TensorBoard in a Modal app.</p> <p>We will attach the same Volume that we attached to our training function so that
TensorBoard can read the logs. For this to work with Modal, we will first
create some <!> to check the Modal Volume for updates any time the page is reloaded.</p> <!> <p>The WSGI app isn’t exposed directly through the TensorBoard library, but we can build it
the same way it’s built internally — <!>.</p> <p>Note that the TensorBoard server runs in a different container.
The server does not need GPU support.
Note that this server will be exposed to the public internet!</p> <!> <!> <p>Let’s kick everything off.
Everything runs in an ephemeral “app” that gets destroyed once it’s done.
In order to keep the TensorBoard web server running, we sleep in an infinite loop
until the user hits ctrl-c.</p> <p>The script will take a few minutes to run, although each epoch is quite fast since it runs on a GPU.
The first time you run it, it might have to build the image, which can take an additional few minutes.</p> <!>`,1);function S(t,v){let y=a(v,[`children`,`$$slots`,`$$events`,`$$legacy`]);m(t,o(()=>y,()=>_,{children:(t,a)=>{var o=x(),m=s(o);d(m,{id:`tensorflow-tutorial`,children:(e,t)=>{l(),i(e,r(`TensorFlow tutorial`))},$$slots:{default:!0}});var _=c(m,2);h(c(e(_)),{href:`https://www.tensorflow.org/tutorials/images/classification`,rel:`nofollow`,children:(e,t)=>{l(),i(e,r(`image classification example in the TensorFlow documentation`))},$$slots:{default:!0}}),l(),n(_);var v=c(_,2);f(e(v),{get src(){return g},alt:`tensorboard`}),n(v);var y=c(v,2);u(y,{id:`setting-up-the-dependencies`,children:(e,t)=>{l(),i(e,r(`Setting up the dependencies`))},$$slots:{default:!0}});var b=c(y,2),S=c(e(b));h(S,{href:`https://modal.com/docs/guide/custom-container#use-an-existing-container-image-with-from_registry`,rel:`nofollow`,children:(e,t)=>{l(),i(e,r(`use a pre-built Docker container image`))},$$slots:{default:!0}}),h(c(S,2),{href:`https://hub.docker.com/r/tensorflow/tensorflow`,rel:`nofollow`,children:(e,t)=>{l(),i(e,r(`official base Docker container images`))},$$slots:{default:!0}}),l(3),n(b);var C=c(b,2),w=c(e(C));h(w,{href:`https://www.tensorflow.org/install`,rel:`nofollow`,children:(e,t)=>{l(),i(e,r(`their docs`))},$$slots:{default:!0}}),h(c(w,2),{href:`https://modal.com/docs/guide/custom-container`,rel:`nofollow`,children:(e,t)=>{l(),i(e,r(`Modal guide on customizing environments`))},$$slots:{default:!0}}),l(),n(C);var T=c(C,2);p(T,{code:`import%20time%0A%0Aimport%20modal%0A%0Adockerhub_image%20%3D%20modal.Image.from_registry(%0A%20%20%20%20%22tensorflow%2Ftensorflow%3A2.15.0-gpu%22%2C%0A)%0A%0Aapp%20%3D%20modal.App(%22example-tensorflow-tutorial%22%2C%20image%3Ddockerhub_image)%0A`,lang:`python`});var E=c(T,2);u(E,{id:`logging-data-to-tensorboard`,children:(e,t)=>{l(),i(e,r(`Logging data to TensorBoard`))},$$slots:{default:!0}});var D=c(E,4),O=c(e(D));h(O,{href:`https://modal.com/docs/guide/volumes`,rel:`nofollow`,children:(e,t)=>{l(),i(e,r(`Modal Volume`))},$$slots:{default:!0}}),h(c(O,2),{href:`https://modal.com/docs/reference/modal.Function`,rel:`nofollow`,children:(e,t)=>{l(),i(e,r(`Functions`))},$$slots:{default:!0}}),l(),n(D);var k=c(D,2);p(k,{code:`volume%20%3D%20modal.Volume.from_name(%22tensorflow-tutorial%22%2C%20create_if_missing%3DTrue)%0ALOGDIR%20%3D%20%22%2Ftensorboard%22%0A`,lang:`python`});var A=c(k,2);u(A,{id:`training-function`,children:(e,t)=>{l(),i(e,r(`Training function`))},$$slots:{default:!0}});var j=c(A,2);h(c(e(j)),{href:`https://www.tensorflow.org/tutorials/images/classification`,rel:`nofollow`,children:(e,t)=>{l(),i(e,r(`the official example`))},$$slots:{default:!0}}),l(),n(j);var M=c(j,6);p(M,{code:`%40app.function(volumes%3D%7BLOGDIR%3A%20volume%7D%2C%20gpu%3D%22T4%22%2C%20timeout%3D600)%0Adef%20train()%3A%0A%20%20%20%20import%20pathlib%0A%0A%20%20%20%20import%20tensorflow%20as%20tf%0A%20%20%20%20from%20tensorflow.keras%20import%20layers%0A%20%20%20%20from%20tensorflow.keras.models%20import%20Sequential%0A%0A%20%20%20%20%23%20load%20raw%20data%20from%20storage%0A%20%20%20%20dataset_url%20%3D%20%22https%3A%2F%2Fstorage.googleapis.com%2Fdownload.tensorflow.org%2Fexample_images%2Fflower_photos.tgz%22%0A%20%20%20%20data_dir%20%3D%20tf.keras.utils.get_file(%0A%20%20%20%20%20%20%20%20%22flower_photos.tar%22%2C%20origin%3Ddataset_url%2C%20extract%3DTrue%0A%20%20%20%20)%0A%20%20%20%20data_dir%20%3D%20pathlib.Path(data_dir).with_suffix(%22%22)%0A%0A%20%20%20%20%23%20construct%20Keras%20datasets%20from%20raw%20data%0A%20%20%20%20batch_size%20%3D%2032%0A%20%20%20%20img_height%20%3D%20img_width%20%3D%20180%0A%0A%20%20%20%20train_ds%20%3D%20tf.keras.utils.image_dataset_from_directory(%0A%20%20%20%20%20%20%20%20data_dir%2C%0A%20%20%20%20%20%20%20%20validation_split%3D0.2%2C%0A%20%20%20%20%20%20%20%20subset%3D%22training%22%2C%0A%20%20%20%20%20%20%20%20seed%3D123%2C%0A%20%20%20%20%20%20%20%20image_size%3D(img_height%2C%20img_width)%2C%0A%20%20%20%20%20%20%20%20batch_size%3Dbatch_size%2C%0A%20%20%20%20)%0A%0A%20%20%20%20val_ds%20%3D%20tf.keras.utils.image_dataset_from_directory(%0A%20%20%20%20%20%20%20%20data_dir%2C%0A%20%20%20%20%20%20%20%20validation_split%3D0.2%2C%0A%20%20%20%20%20%20%20%20subset%3D%22validation%22%2C%0A%20%20%20%20%20%20%20%20seed%3D123%2C%0A%20%20%20%20%20%20%20%20image_size%3D(img_height%2C%20img_width)%2C%0A%20%20%20%20%20%20%20%20batch_size%3Dbatch_size%2C%0A%20%20%20%20)%0A%0A%20%20%20%20class_names%20%3D%20train_ds.class_names%0A%20%20%20%20train_ds%20%3D%20(%0A%20%20%20%20%20%20%20%20train_ds.cache().shuffle(1000).prefetch(buffer_size%3Dtf.data.AUTOTUNE)%20%20%23%20type%3A%20ignore%0A%20%20%20%20)%0A%20%20%20%20val_ds%20%3D%20val_ds.cache().prefetch(buffer_size%3Dtf.data.AUTOTUNE)%20%20%23%20type%3A%20ignore%0A%20%20%20%20num_classes%20%3D%20len(class_names)%0A%0A%20%20%20%20model%20%3D%20Sequential(%0A%20%20%20%20%20%20%20%20%5B%0A%20%20%20%20%20%20%20%20%20%20%20%20layers.Rescaling(1.0%20%2F%20255%2C%20input_shape%3D(img_height%2C%20img_width%2C%203))%2C%0A%20%20%20%20%20%20%20%20%20%20%20%20layers.Conv2D(16%2C%203%2C%20padding%3D%22same%22%2C%20activation%3D%22relu%22)%2C%0A%20%20%20%20%20%20%20%20%20%20%20%20layers.MaxPooling2D()%2C%0A%20%20%20%20%20%20%20%20%20%20%20%20layers.Conv2D(32%2C%203%2C%20padding%3D%22same%22%2C%20activation%3D%22relu%22)%2C%0A%20%20%20%20%20%20%20%20%20%20%20%20layers.MaxPooling2D()%2C%0A%20%20%20%20%20%20%20%20%20%20%20%20layers.Conv2D(64%2C%203%2C%20padding%3D%22same%22%2C%20activation%3D%22relu%22)%2C%0A%20%20%20%20%20%20%20%20%20%20%20%20layers.MaxPooling2D()%2C%0A%20%20%20%20%20%20%20%20%20%20%20%20layers.Flatten()%2C%0A%20%20%20%20%20%20%20%20%20%20%20%20layers.Dense(128%2C%20activation%3D%22relu%22)%2C%0A%20%20%20%20%20%20%20%20%20%20%20%20layers.Dense(num_classes)%2C%0A%20%20%20%20%20%20%20%20%5D%0A%20%20%20%20)%0A%0A%20%20%20%20model.compile(%0A%20%20%20%20%20%20%20%20optimizer%3D%22adam%22%2C%0A%20%20%20%20%20%20%20%20loss%3Dtf.keras.losses.SparseCategoricalCrossentropy(from_logits%3DTrue)%2C%0A%20%20%20%20%20%20%20%20metrics%3D%5B%22accuracy%22%5D%2C%0A%20%20%20%20)%0A%0A%20%20%20%20model.summary()%0A%0A%20%20%20%20tensorboard_callback%20%3D%20tf.keras.callbacks.TensorBoard(%0A%20%20%20%20%20%20%20%20log_dir%3DLOGDIR%2C%0A%20%20%20%20%20%20%20%20histogram_freq%3D1%2C%0A%20%20%20%20)%0A%0A%20%20%20%20model.fit(%0A%20%20%20%20%20%20%20%20train_ds%2C%0A%20%20%20%20%20%20%20%20validation_data%3Dval_ds%2C%0A%20%20%20%20%20%20%20%20epochs%3D20%2C%0A%20%20%20%20%20%20%20%20callbacks%3D%5Btensorboard_callback%5D%2C%0A%20%20%20%20)%0A%0A`,lang:`python`});var N=c(M,2);u(N,{id:`running-tensorboard`,children:(e,t)=>{l(),i(e,r(`Running TensorBoard`))},$$slots:{default:!0}});var P=c(N,2),F=c(e(P));h(F,{href:`https://www.fullstackpython.com/wsgi-servers.html`,rel:`nofollow`,children:(e,t)=>{l(),i(e,r(`WSGI`))},$$slots:{default:!0}});var I=c(F,2);h(I,{href:`https://flask.palletsprojects.com/`,rel:`nofollow`,children:(e,t)=>{l(),i(e,r(`Flask`))},$$slots:{default:!0}}),h(c(I,2),{href:`https://modal.com/docs/guide/webhooks#wsgi`,rel:`nofollow`,children:(e,t)=>{l(),i(e,r(`speaks WSGI too`))},$$slots:{default:!0}}),l(),n(P);var L=c(P,2);h(c(e(L)),{href:`https://peps.python.org/pep-3333/`,rel:`nofollow`,children:(e,t)=>{l(),i(e,r(`WSGI Middleware`))},$$slots:{default:!0}}),l(),n(L);var R=c(L,2);p(R,{code:`class%20VolumeMiddleware%3A%0A%20%20%20%20def%20__init__(self%2C%20app)%3A%0A%20%20%20%20%20%20%20%20self.app%20%3D%20app%0A%0A%20%20%20%20def%20__call__(self%2C%20environ%2C%20start_response)%3A%0A%20%20%20%20%20%20%20%20if%20(route%20%3A%3D%20environ.get(%22PATH_INFO%22))%20in%20%5B%22%2F%22%2C%20%22%2Fmodal-volume-reload%22%5D%3A%0A%20%20%20%20%20%20%20%20%20%20%20%20try%3A%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20volume.reload()%0A%20%20%20%20%20%20%20%20%20%20%20%20except%20Exception%20as%20e%3A%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20print(%22Exception%20while%20re-loading%20traces%3A%20%22%2C%20e)%0A%20%20%20%20%20%20%20%20%20%20%20%20if%20route%20%3D%3D%20%22%2Fmodal-volume-reload%22%3A%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20environ%5B%22PATH_INFO%22%5D%20%3D%20%22%2F%22%20%20%23%20redirect%0A%20%20%20%20%20%20%20%20return%20self.app(environ%2C%20start_response)%0A%0A`,lang:`python`});var z=c(R,2);h(c(e(z)),{href:`https://github.com/tensorflow/tensorboard/blob/0c5523f4b27046e1ca7064dd75347a5ee6cc7f79/tensorboard/program.py#L466-L476`,rel:`nofollow`,children:(e,t)=>{l(),i(e,r(`see the TensorBoard source code for details`))},$$slots:{default:!0}}),l(),n(z);var B=c(z,4);p(B,{code:`%40app.function(%0A%20%20%20%20volumes%3D%7BLOGDIR%3A%20volume%7D%2C%0A%20%20%20%20max_containers%3D1%2C%20%20%23%20single%20replica%0A%20%20%20%20scaledown_window%3D5%20*%2060%2C%20%20%23%20five%20minute%20idle%20time%0A)%0A%40modal.concurrent(max_inputs%3D100)%20%20%23%20100%20concurrent%20request%20threads%0A%40modal.wsgi_app()%0Adef%20tensorboard_app()%3A%0A%20%20%20%20import%20tensorboard%0A%0A%20%20%20%20board%20%3D%20tensorboard.program.TensorBoard()%0A%20%20%20%20board.configure(logdir%3DLOGDIR)%0A%20%20%20%20(data_provider%2C%20deprecated_multiplexer)%20%3D%20board._make_data_provider()%0A%20%20%20%20wsgi_app%20%3D%20tensorboard.backend.application.TensorBoardWSGIApp(%0A%20%20%20%20%20%20%20%20board.flags%2C%0A%20%20%20%20%20%20%20%20board.plugin_loaders%2C%0A%20%20%20%20%20%20%20%20data_provider%2C%0A%20%20%20%20%20%20%20%20board.assets_zip_provider%2C%0A%20%20%20%20%20%20%20%20deprecated_multiplexer%2C%0A%20%20%20%20%20%20%20%20experimental_middlewares%3D%5BVolumeMiddleware%5D%2C%0A%20%20%20%20)%0A%20%20%20%20return%20wsgi_app%0A%0A`,lang:`python`});var V=c(B,2);u(V,{id:`local-entrypoint-code`,children:(e,t)=>{l(),i(e,r(`Local entrypoint code`))},$$slots:{default:!0}}),p(c(V,6),{code:`%40app.local_entrypoint()%0Adef%20main(just_run%3A%20bool%20%3D%20False)%3A%0A%20%20%20%20train.remote()%0A%20%20%20%20if%20not%20just_run%3A%0A%20%20%20%20%20%20%20%20print(%0A%20%20%20%20%20%20%20%20%20%20%20%20%22Training%20is%20done%2C%20but%20the%20app%20is%20still%20running%20TensorBoard%20until%20you%20hit%20ctrl-c.%22%0A%20%20%20%20%20%20%20%20)%0A%20%20%20%20%20%20%20%20try%3A%0A%20%20%20%20%20%20%20%20%20%20%20%20while%20True%3A%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20time.sleep(1)%0A%20%20%20%20%20%20%20%20except%20KeyboardInterrupt%3A%0A%20%20%20%20%20%20%20%20%20%20%20%20print(%22Terminating%20app%22)%0A`,lang:`python`}),i(t,o)},$$slots:{default:!0}}))}export{S as default,_ as metadata};
//# sourceMappingURL=Dyut70WK.js.map
