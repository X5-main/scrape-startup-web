(function(){try{var e=typeof window<`u`?window:typeof global<`u`?global:typeof globalThis<`u`?globalThis:typeof self<`u`?self:{};e.SENTRY_RELEASE={id:`f99fcf9f0a844cc9bd13fdc8e5782b84`};var t=new e.Error().stack;t&&(e._sentryDebugIds=e._sentryDebugIds||{},e._sentryDebugIds[t]=`2cbf3a8f-bbd7-4338-ace6-6b3ddf922f4a`,e._sentryDebugIdIdentifier=`sentry-dbid-2cbf3a8f-bbd7-4338-ace6-6b3ddf922f4a`)}catch{}})();import{$t as e,St as t,Tn as n,Tt as r,bt as i,c as ee,d as a,en as te,tn as o,wn as s}from"./F_ixKBiO.js";import"./B1sc9Zdx.js";import"./Bb2deiU3.js";import{t as ne}from"./DYSGKh1I.js";import{a as c,i as l,o as re}from"./CPby7b1n.js";import{n as ie,t as ae}from"./JPsrybyr.js";import{t as u}from"./BILrvr3I.js";import{t as d}from"./B4L_if842.js";import{t as f}from"./DeWGVqas2.js";var p={toc:[{depth:1,value:`Modal Notebooks`,id:`modal-notebooks`,children:[{depth:2,value:`Getting started`,id:`getting-started`},{depth:2,value:`Kernel resources`,id:`kernel-resources`,children:[{depth:3,value:`Notebook pricing`,id:`notebook-pricing`}]},{depth:2,value:`Custom images, volumes, secrets, and cloud storage`,id:`custom-images-volumes-secrets-and-cloud-storage`,children:[{depth:3,value:`Creating a Custom Image`,id:`creating-a-custom-image`},{depth:3,value:`Creating a Secret`,id:`creating-a-secret`},{depth:3,value:`Creating a Volume`,id:`creating-a-volume`},{depth:3,value:`Mounting Cloud Buckets`,id:`mounting-cloud-buckets`}]},{depth:2,value:`Access and sharing`,id:`access-and-sharing`},{depth:2,value:`Interactive file viewer`,id:`interactive-file-viewer`},{depth:2,value:`Editor features`,id:`editor-features`},{depth:2,value:`Widgets`,id:`widgets`},{depth:2,value:`Cell magic`,id:`cell-magic`},{depth:2,value:`Roadmap`,id:`roadmap`}]}],rawContent:`# Modal Notebooks

Notebooks allow you to write and execute Python code in Modal's cloud, within your browser. It's a hosted Jupyter notebook with:

- Serverless pricing and automatic idle shutdown
- Access to Modal GPUs and compute
- Real-time collaborative editing
- Python Intellisense/LSP support and AI autocomplete
- Support for rich and interactive outputs like images, widgets, and plots

<center>
<video controls autoplay muted playsinline>
<source src="https://modal-cdn.com/Modal-Notebooks-Beta.mp4" type="video/mp4">
</video>
</center>

## Getting started

Open [modal.com/notebooks](/notebooks) in your browser and create a new notebook. You can also upload an \`.ipynb\` file from your computer.

Once you create a notebook, you can start running cells. Try a simple statement like

\`\`\`python
print("Hello, Modal!")
\`\`\`

Or, import a library and create a plot:

\`\`\`python notest
import matplotlib.pyplot as plt
import numpy as np

x = np.linspace(-20, 20, 500)
plt.plot(np.cos(x / 3.7 + 0.3), x * np.sin(x))
\`\`\`

The default notebook image comes with a number of Python packages pre-installed, so you can get started right away. Popular ones include PyTorch, NumPy, Pandas, JAX, Transformers, and Matplotlib. You can find the full image definition [here](https://github.com/modal-labs/modal-client/blob/v1.1.3/modal/experimental/__init__.py#L234-L342). If you need another package, just install it:

\`\`\`shell
%uv pip install [my-package]
\`\`\`

All output types work out-of-the-box, including rich HTML, images, [Jupyter Widgets](https://ipywidgets.readthedocs.io/en/latest/), and interactive plots.

## Kernel resources

Just like with Modal Functions, notebooks run in serverless containers. This means you pay only for the CPU cores and memory you use.

If you need more resources, you can change kernel settings in the sidebar. This lets you set the number of CPU cores, memory, and GPU type for your notebook. You can also set a timeout for idle shutdown, which defaults to 10 minutes.

Use any GPU type available in Modal, including up to 8 Nvidia A100s or H100s. You can switch the kernel configuration in seconds!

![Compute profile tab in notebook sidebar](https://modal-cdn.com/cdnbot/compute-profilev9rvmmvw_365a1197.webp)

Note that the CPU and memory requests configure the _minimum_ amount of resources allocated, but you can usually burst above the request. For example, if you've set the Notebook to have 0.5 CPU cores, you'll be billed for that continuously, but you can use up to any available cores on the machine (e.g., 32 CPUs) and will be billed for only the time you use them.

### Notebook pricing

Modal Notebooks are priced simply, by compute usage while the kernel is running. See the [pricing page](https://modal.com/pricing) for rates. Currently the CPU and Memory costs are priced according to Sandboxes. They appear in your [usage dashboard](/settings/usage) under “Notebooks”.

Inactive notebooks do not incur any cost. You are only billed for time the notebook is actively running.

## Custom images, volumes, secrets, and cloud storage

Modal Notebooks supports custom images, volumes, and secrets, just like Modal Functions. You can use these to install additional packages, mount persistent storage, or access secrets.

- To use a custom image, you need to have a [deployed Modal Function](/docs/guide/managing-deployments) using that image. Then, search for that function in the sidebar.
- To use a Secret, simply create a [Modal Secret](/secrets) using our wizard and attach it to the notebook, so it can be injected as an environment variable automatically.
- To use a Volume, create a [Modal Volume](/docs/guide/volumes) and attach it to the notebook. This lets you mount high-performance, persistent storage that can be shared across multiple notebooks or functions. They will appear as folders in the \`/mnt\` directory by default.

### Creating a Custom Image

If you don't have a suitable deployed Modal App already, you can set up your environment to deploy custom images in under a minute using the Modal CLI. First, run \`pip install modal\`, and define your image in a file like:

\`\`\`python
import modal


# Image definition here:
image = (
    modal.Image.from_registry("python:3.13-slim")
    .pip_install("requests", "numpy")
    .apt_install("curl", "wget")
    .run_commands(
        "echo 'foo' > /root/hello.txt",
        # ... other commands
    )
)

app = modal.App("notebook-images")

@app.function(image=image)  # You need a Function object to reference the image.
def notebook_image():
    pass
\`\`\`

Then, make sure you have the Modal CLI (\`pip install modal\`) and run this command to build and deploy the image:

\`\`\`bash
modal deploy notebook_images.py
\`\`\`

For more information on custom images in Modal, see our [guide on defining images](/docs/guide/images).

(Advanced) Note that if you use the [\`add_local_file()\` or \`add_local_dir()\` functions](/docs/guide/images#add-local-files-with-add_local_dir-and-add_local_file), you'll need to pass \`copy=True\` for them to work in Modal Notebooks. This is because they skip creating a custom image and instead mount the files into the function at startup, which won't work in notebooks.

### Creating a Secret

Secrets can be created from the dashboard at [modal.com/secrets](/secrets). We have templates for common credential types, and they are saved as encrypted objects until container startup.

Attached secrets become available as environment variables in your notebook.

### Creating a Volume

[Volumes](/docs/guide/volumes) can be created via the files panel on the filesystem tab. This panel can also be used to attach existing Volumes from your Apps or Functions, including those created via the Modal CLI.

Any volumes are attached in the \`/mnt\` folder in your notebook, and files saved there will be persisted across kernel startups and elsewhere on Modal.

### Mounting Cloud Buckets

Modal Notebooks now support mounting cloud storage buckets, initially S3 buckets, directly to your notebook filesystem. This allows you to access large datasets stored in cloud storage easily on your notebooks.

To mount an S3 bucket:

1. Create a [Modal Secret](/secrets) containing your AWS credentials (AWS Access Key ID and Secret Access Key)
2. In the notebook sidebar's Files panel, use the Cloud Buckets section to attach your bucket
3. Specify:
   - The S3 bucket name
   - Mount path (e.g., \`/mnt/s3/my-data\`)
   - The AWS credentials secret stored in that environment
   - Optional: A key prefix to mount only a subset of objects (e.g., \`datasets/\`)
   - Optional: Set the mount as read-only

Once attached, your S3 bucket will be mounted at the specified path and accessible just like any other directory in your notebook.

For more information on using cloud bucket mounts with Modal, see the [CloudBucket mounts guide](/docs/guide/cloud-bucket-mounts).

## Access and sharing

Need a colleague—or the whole internet—to see your work? Just click **Share** in the top‑right corner of the notebook editor.

Notebooks are editable by you and teammates in your workspace. To make the notebook view-only to collaborators, the creator of the notebook can change access settings in the "Share" menu. Workspace managers are also allowed to change this setting.

You can also turn on sharing by public, unlisted link. If you toggle this, it allows _anyone with the link_ to open the notebook, even if they are not logged in. Pick **Can view** (default) or **Can view and run** based on your preference. Viewers don’t need a Modal account, so this is perfect for collaborating with stakeholders outside your workspace.

No matter how the notebook is shared, anyone with access can fork and run their own version of it.

## Interactive file viewer

The panel on the left-hand side of the notebook shows a **live view of the container’s filesystem**:

| Feature                 | Details                                                                                                                                                                    |
| ----------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Browse & preview**    | Click through folders to inspect any file that your code has created or downloaded.                                                                                        |
| **Upload & download**   | Drag-and-drop files from your desktop, or click the **⬆** / **⬇** icons to add new data sets, notebooks, or models—or to save results back to your machine.              |
| **One-click refresh**   | Changes made by your code (for example, writing a CSV) appear instantly; hit the refresh icon if you want to force an update.                                              |
| **Context-aware paths** | The viewer always reflects _exactly_ what your code sees (e.g. \`/root\`, \`/mnt/…\`), so you can double-check that that file you just wrote really landed where you expected. |

**Important:** the underlying container is **ephemeral**. Anything stored outside an attached [Volume](/docs/guide/volumes) disappears when the kernel shuts down (after your idle-timeout or when you hit **Stop kernel**). Mount a Volume for data you want to keep across sessions.

The viewer itself is only active while the kernel is running—if the notebook is stopped you’ll see an “empty” state until you start it again.

## Editor features

Modal Notebooks bundle the same productivity tooling you’d expect from a modern IDE.

With Pyright, you get autocomplete, signature help, and on-hover documentation for every installed library.

We also implemented AI-powered code completion using Anthropic's **Claude Sonnet 4.6** model. This keeps you in the flow for everything from small snippets to multi-line functions. Just press \`Tab\` to accept suggestions or \`Esc\` to dismiss them.

Familiar Jupyter shortcuts (\`A\`, \`B\`, \`X\`, \`Y\`, \`M\`, etc.) all work within the notebook, so you can quickly add new cells, delete existing ones, or change cell types.

Finally, we have real-time collaborative editing, so you can work with your team in the same notebook. You can see other users' cursors and edits in real-time, and you can see when others are running cells with you. This makes it easy to pair program or review code together.

## Widgets

Modal Notebooks support [Jupyter Widgets](https://ipywidgets.readthedocs.io/en/latest/), which can be used to create interactive components living in the browser. Currently, Notebooks support all the widgets in the base \`ipywidgets\` package, except the following:

- Media Widgets (\`Audio\`, \`Video\`), try using \`IPython.display\` outputs instead.
- \`Play\`
- Controllers (\`ControllerAxis\`, \`ControllerButton\`, \`Controller\`)

Modal Notebooks do not support custom widget packages.

## Cell magic

Modal Notebooks have built-in support for the \`%modal\` cell magic. This lets you run code in any [deployed Modal Function or Cls](/docs/guide/trigger-deployed-functions), right from your notebook.

For example, if you have previously run \`modal deploy\` for an app like:

\`\`\`python notest
import modal

app = modal.App("my-app")


@app.function()
def my_function(s: str):
    return len(s)
\`\`\`

Then you could access this function from your notebook:

\`\`\`python notest
%modal from my-app import my_function

my_function.remote("hello, world!")  # returns 13
\`\`\`

Run \`%modal\` to see all options. This works for Cls as well, and you can import from different environments or alias them with the \`as\` keyword.

## Roadmap

<Callout variant="beta" />

Some bigger features on mind:

- **Modal cloud integrations**
  - Expose ports with [Tunnels](/docs/guide/tunnels)
  - Memory snapshots to restore from past notebook sessions
  - Create notebooks from the \`modal\` CLI
  - Custom image registry
- **Notebook editor**
  - Interactive outline, collapsing sections by headings
  - Reactive cell execution
  - Edit history
  - Integrated debugger (pdb and \`%debug\`)
- **Documents and sharing**
  - Restore recently deleted notebooks
  - Folders and tags for grouping notebooks
  - Sync with Git repositories

Let us know via [Slack](/slack) if you have any feedback.
`,meta:{title:`Modal Notebooks`,description:`Notebooks allow you to write and execute Python code in Modal’s cloud, within your browser. It’s a hosted Jupyter notebook with:`}},{toc:oe,rawContent:m,meta:h}=p,se=t(`<code>add_local_file()</code> or <code>add_local_dir()</code> functions`,1),ce=t(`<thead><tr><th>Feature</th><th>Details</th></tr></thead> <tbody><tr><td><strong>Browse & preview</strong></td><td>Click through folders to inspect any file that your code has created or downloaded.</td></tr><tr><td><strong>Upload & download</strong></td><td>Drag-and-drop files from your desktop, or click the <strong>⬆</strong> / <strong>⬇</strong> icons to add new data sets, notebooks, or models—or to save results back to your machine.</td></tr><tr><td><strong>One-click refresh</strong></td><td>Changes made by your code (for example, writing a CSV) appear instantly; hit the refresh icon if you want to force an update.</td></tr><tr><td><strong>Context-aware paths</strong></td><td>The viewer always reflects <em>exactly</em> what your code sees (e.g. <code>/root</code>, <code>/mnt/…</code>), so you can double-check that that file you just wrote really landed where you expected.</td></tr></tbody>`,1),le=t(`<!> <p>Notebooks allow you to write and execute Python code in Modal’s cloud, within your browser. It’s a hosted Jupyter notebook with:</p> <ul><li>Serverless pricing and automatic idle shutdown</li> <li>Access to Modal GPUs and compute</li> <li>Real-time collaborative editing</li> <li>Python Intellisense/LSP support and AI autocomplete</li> <li>Support for rich and interactive outputs like images, widgets, and plots</li></ul> <center><video controls autoplay playsinline=""><source src="https://modal-cdn.com/Modal-Notebooks-Beta.mp4" type="video/mp4"/></video></center> <!> <p>Open <!> in your browser and create a new notebook. You can also upload an <code>.ipynb</code> file from your computer.</p> <p>Once you create a notebook, you can start running cells. Try a simple statement like</p> <!> <p>Or, import a library and create a plot:</p> <!> <p>The default notebook image comes with a number of Python packages pre-installed, so you can get started right away. Popular ones include PyTorch, NumPy, Pandas, JAX, Transformers, and Matplotlib. You can find the full image definition <!>. If you need another package, just install it:</p> <!> <p>All output types work out-of-the-box, including rich HTML, images, <!>, and interactive plots.</p> <!> <p>Just like with Modal Functions, notebooks run in serverless containers. This means you pay only for the CPU cores and memory you use.</p> <p>If you need more resources, you can change kernel settings in the sidebar. This lets you set the number of CPU cores, memory, and GPU type for your notebook. You can also set a timeout for idle shutdown, which defaults to 10 minutes.</p> <p>Use any GPU type available in Modal, including up to 8 Nvidia A100s or H100s. You can switch the kernel configuration in seconds!</p> <p><!></p> <p>Note that the CPU and memory requests configure the <em>minimum</em> amount of resources allocated, but you can usually burst above the request. For example, if you’ve set the Notebook to have 0.5 CPU cores, you’ll be billed for that continuously, but you can use up to any available cores on the machine (e.g., 32 CPUs) and will be billed for only the time you use them.</p> <!> <p>Modal Notebooks are priced simply, by compute usage while the kernel is running. See the <!> for rates. Currently the CPU and Memory costs are priced according to Sandboxes. They appear in your <!> under “Notebooks”.</p> <p>Inactive notebooks do not incur any cost. You are only billed for time the notebook is actively running.</p> <!> <p>Modal Notebooks supports custom images, volumes, and secrets, just like Modal Functions. You can use these to install additional packages, mount persistent storage, or access secrets.</p> <ul><li>To use a custom image, you need to have a <!> using that image. Then, search for that function in the sidebar.</li> <li>To use a Secret, simply create a <!> using our wizard and attach it to the notebook, so it can be injected as an environment variable automatically.</li> <li>To use a Volume, create a <!> and attach it to the notebook. This lets you mount high-performance, persistent storage that can be shared across multiple notebooks or functions. They will appear as folders in the <code>/mnt</code> directory by default.</li></ul> <!> <p>If you don’t have a suitable deployed Modal App already, you can set up your environment to deploy custom images in under a minute using the Modal CLI. First, run <code>pip install modal</code>, and define your image in a file like:</p> <!> <p>Then, make sure you have the Modal CLI (<code>pip install modal</code>) and run this command to build and deploy the image:</p> <!> <p>For more information on custom images in Modal, see our <!>.</p> <p>(Advanced) Note that if you use the <!>, you’ll need to pass <code>copy=True</code> for them to work in Modal Notebooks. This is because they skip creating a custom image and instead mount the files into the function at startup, which won’t work in notebooks.</p> <!> <p>Secrets can be created from the dashboard at <!>. We have templates for common credential types, and they are saved as encrypted objects until container startup.</p> <p>Attached secrets become available as environment variables in your notebook.</p> <!> <p><!> can be created via the files panel on the filesystem tab. This panel can also be used to attach existing Volumes from your Apps or Functions, including those created via the Modal CLI.</p> <p>Any volumes are attached in the <code>/mnt</code> folder in your notebook, and files saved there will be persisted across kernel startups and elsewhere on Modal.</p> <!> <p>Modal Notebooks now support mounting cloud storage buckets, initially S3 buckets, directly to your notebook filesystem. This allows you to access large datasets stored in cloud storage easily on your notebooks.</p> <p>To mount an S3 bucket:</p> <ol><li>Create a <!> containing your AWS credentials (AWS Access Key ID and Secret Access Key)</li> <li>In the notebook sidebar’s Files panel, use the Cloud Buckets section to attach your bucket</li> <li>Specify: <ul><li>The S3 bucket name</li> <li>Mount path (e.g., <code>/mnt/s3/my-data</code>)</li> <li>The AWS credentials secret stored in that environment</li> <li>Optional: A key prefix to mount only a subset of objects (e.g., <code>datasets/</code>)</li> <li>Optional: Set the mount as read-only</li></ul></li></ol> <p>Once attached, your S3 bucket will be mounted at the specified path and accessible just like any other directory in your notebook.</p> <p>For more information on using cloud bucket mounts with Modal, see the <!>.</p> <!> <p>Need a colleague—or the whole internet—to see your work? Just click <strong>Share</strong> in the top‑right corner of the notebook editor.</p> <p>Notebooks are editable by you and teammates in your workspace. To make the notebook view-only to collaborators, the creator of the notebook can change access settings in the “Share” menu. Workspace managers are also allowed to change this setting.</p> <p>You can also turn on sharing by public, unlisted link. If you toggle this, it allows <em>anyone with the link</em> to open the notebook, even if they are not logged in. Pick <strong>Can view</strong> (default) or <strong>Can view and run</strong> based on your preference. Viewers don’t need a Modal account, so this is perfect for collaborating with stakeholders outside your workspace.</p> <p>No matter how the notebook is shared, anyone with access can fork and run their own version of it.</p> <!> <p>The panel on the left-hand side of the notebook shows a <strong>live view of the container’s filesystem</strong>:</p> <!> <p><strong>Important:</strong> the underlying container is <strong>ephemeral</strong>. Anything stored outside an attached <!> disappears when the kernel shuts down (after your idle-timeout or when you hit <strong>Stop kernel</strong>). Mount a Volume for data you want to keep across sessions.</p> <p>The viewer itself is only active while the kernel is running—if the notebook is stopped you’ll see an “empty” state until you start it again.</p> <!> <p>Modal Notebooks bundle the same productivity tooling you’d expect from a modern IDE.</p> <p>With Pyright, you get autocomplete, signature help, and on-hover documentation for every installed library.</p> <p>We also implemented AI-powered code completion using Anthropic’s <strong>Claude Sonnet 4.6</strong> model. This keeps you in the flow for everything from small snippets to multi-line functions. Just press <code>Tab</code> to accept suggestions or <code>Esc</code> to dismiss them.</p> <p>Familiar Jupyter shortcuts (<code>A</code>, <code>B</code>, <code>X</code>, <code>Y</code>, <code>M</code>, etc.) all work within the notebook, so you can quickly add new cells, delete existing ones, or change cell types.</p> <p>Finally, we have real-time collaborative editing, so you can work with your team in the same notebook. You can see other users’ cursors and edits in real-time, and you can see when others are running cells with you. This makes it easy to pair program or review code together.</p> <!> <p>Modal Notebooks support <!>, which can be used to create interactive components living in the browser. Currently, Notebooks support all the widgets in the base <code>ipywidgets</code> package, except the following:</p> <ul><li>Media Widgets (<code>Audio</code>, <code>Video</code>), try using <code>IPython.display</code> outputs instead.</li> <li><code>Play</code></li> <li>Controllers (<code>ControllerAxis</code>, <code>ControllerButton</code>, <code>Controller</code>)</li></ul> <p>Modal Notebooks do not support custom widget packages.</p> <!> <p>Modal Notebooks have built-in support for the <code>%modal</code> cell magic. This lets you run code in any <!>, right from your notebook.</p> <p>For example, if you have previously run <code>modal deploy</code> for an app like:</p> <!> <p>Then you could access this function from your notebook:</p> <!> <p>Run <code>%modal</code> to see all options. This works for Cls as well, and you can import from different environments or alias them with the <code>as</code> keyword.</p> <!> <!> <p>Some bigger features on mind:</p> <ul><li><strong>Modal cloud integrations</strong> <ul><li>Expose ports with <!></li> <li>Memory snapshots to restore from past notebook sessions</li> <li>Create notebooks from the <code>modal</code> CLI</li> <li>Custom image registry</li></ul></li> <li><strong>Notebook editor</strong> <ul><li>Interactive outline, collapsing sections by headings</li> <li>Reactive cell execution</li> <li>Edit history</li> <li>Integrated debugger (pdb and <code>%debug</code>)</li></ul></li> <li><strong>Documents and sharing</strong> <ul><li>Restore recently deleted notebooks</li> <li>Folders and tags for grouping notebooks</li> <li>Sync with Git repositories</li></ul></li></ul> <p>Let us know via <!> if you have any feedback.</p>`,3);function g(t,oe){let m=ee(oe,[`children`,`$$slots`,`$$events`,`$$legacy`]);d(t,a(()=>m,()=>p,{children:(t,ee)=>{var a=le(),d=te(a);re(d,{id:`modal-notebooks`,children:(e,t)=>{s(),i(e,r(`Modal Notebooks`))},$$slots:{default:!0}});var p=o(d,6),oe=e(p);oe.muted=!0,n(p);var m=o(p,2);c(m,{id:`getting-started`,children:(e,t)=>{s(),i(e,r(`Getting started`))},$$slots:{default:!0}});var h=o(m,2);f(o(e(h)),{href:`/notebooks`,children:(e,t)=>{s(),i(e,r(`modal.com/notebooks`))},$$slots:{default:!0}}),s(3),n(h);var g=o(h,4);u(g,{code:`print(%22Hello%2C%20Modal!%22)`,lang:`python`});var _=o(g,4);u(_,{code:`import%20matplotlib.pyplot%20as%20plt%0Aimport%20numpy%20as%20np%0A%0Ax%20%3D%20np.linspace(-20%2C%2020%2C%20500)%0Aplt.plot(np.cos(x%20%2F%203.7%20%2B%200.3)%2C%20x%20*%20np.sin(x))`,lang:`python`});var v=o(_,2);f(o(e(v)),{href:`https://github.com/modal-labs/modal-client/blob/v1.1.3/modal/experimental/__init__.py#L234-L342`,rel:`nofollow`,children:(e,t)=>{s(),i(e,r(`here`))},$$slots:{default:!0}}),s(),n(v);var y=o(v,2);u(y,{code:`%25uv%20pip%20install%20%5Bmy-package%5D`,lang:`shell`});var b=o(y,2);f(o(e(b)),{href:`https://ipywidgets.readthedocs.io/en/latest/`,rel:`nofollow`,children:(e,t)=>{s(),i(e,r(`Jupyter Widgets`))},$$slots:{default:!0}}),s(),n(b);var x=o(b,2);c(x,{id:`kernel-resources`,children:(e,t)=>{s(),i(e,r(`Kernel resources`))},$$slots:{default:!0}});var S=o(x,8);ae(e(S),{src:`https://modal-cdn.com/cdnbot/compute-profilev9rvmmvw_365a1197.webp`,alt:`Compute profile tab in notebook sidebar`}),n(S);var ue=o(S,4);l(ue,{id:`notebook-pricing`,children:(e,t)=>{s(),i(e,r(`Notebook pricing`))},$$slots:{default:!0}});var C=o(ue,2),de=o(e(C));f(de,{href:`https://modal.com/pricing`,rel:`nofollow`,children:(e,t)=>{s(),i(e,r(`pricing page`))},$$slots:{default:!0}}),f(o(de,2),{href:`/settings/usage`,children:(e,t)=>{s(),i(e,r(`usage dashboard`))},$$slots:{default:!0}}),s(),n(C);var w=o(C,4);c(w,{id:`custom-images-volumes-secrets-and-cloud-storage`,children:(e,t)=>{s(),i(e,r(`Custom images, volumes, secrets, and cloud storage`))},$$slots:{default:!0}});var T=o(w,4),E=e(T);f(o(e(E)),{href:`/docs/guide/managing-deployments`,children:(e,t)=>{s(),i(e,r(`deployed Modal Function`))},$$slots:{default:!0}}),s(),n(E);var D=o(E,2);f(o(e(D)),{href:`/secrets`,children:(e,t)=>{s(),i(e,r(`Modal Secret`))},$$slots:{default:!0}}),s(),n(D);var O=o(D,2);f(o(e(O)),{href:`/docs/guide/volumes`,children:(e,t)=>{s(),i(e,r(`Modal Volume`))},$$slots:{default:!0}}),s(3),n(O),n(T);var k=o(T,2);l(k,{id:`creating-a-custom-image`,children:(e,t)=>{s(),i(e,r(`Creating a Custom Image`))},$$slots:{default:!0}});var A=o(k,4);u(A,{code:`import%20modal%0A%0A%0A%23%20Image%20definition%20here%3A%0Aimage%20%3D%20(%0A%20%20%20%20modal.Image.from_registry(%22python%3A3.13-slim%22)%0A%20%20%20%20.pip_install(%22requests%22%2C%20%22numpy%22)%0A%20%20%20%20.apt_install(%22curl%22%2C%20%22wget%22)%0A%20%20%20%20.run_commands(%0A%20%20%20%20%20%20%20%20%22echo%20'foo'%20%3E%20%2Froot%2Fhello.txt%22%2C%0A%20%20%20%20%20%20%20%20%23%20...%20other%20commands%0A%20%20%20%20)%0A)%0A%0Aapp%20%3D%20modal.App(%22notebook-images%22)%0A%0A%40app.function(image%3Dimage)%20%20%23%20You%20need%20a%20Function%20object%20to%20reference%20the%20image.%0Adef%20notebook_image()%3A%0A%20%20%20%20pass`,lang:`python`});var j=o(A,4);u(j,{code:`modal%20deploy%20notebook_images.py`,lang:`bash`});var M=o(j,2);f(o(e(M)),{href:`/docs/guide/images`,children:(e,t)=>{s(),i(e,r(`guide on defining images`))},$$slots:{default:!0}}),s(),n(M);var N=o(M,2);f(o(e(N)),{href:`/docs/guide/images#add-local-files-with-add_local_dir-and-add_local_file`,children:(e,t)=>{var n=se();s(3),i(e,n)},$$slots:{default:!0}}),s(3),n(N);var P=o(N,2);l(P,{id:`creating-a-secret`,children:(e,t)=>{s(),i(e,r(`Creating a Secret`))},$$slots:{default:!0}});var F=o(P,2);f(o(e(F)),{href:`/secrets`,children:(e,t)=>{s(),i(e,r(`modal.com/secrets`))},$$slots:{default:!0}}),s(),n(F);var I=o(F,4);l(I,{id:`creating-a-volume`,children:(e,t)=>{s(),i(e,r(`Creating a Volume`))},$$slots:{default:!0}});var L=o(I,2);f(e(L),{href:`/docs/guide/volumes`,children:(e,t)=>{s(),i(e,r(`Volumes`))},$$slots:{default:!0}}),s(),n(L);var R=o(L,4);l(R,{id:`mounting-cloud-buckets`,children:(e,t)=>{s(),i(e,r(`Mounting Cloud Buckets`))},$$slots:{default:!0}});var z=o(R,6),B=e(z);f(o(e(B)),{href:`/secrets`,children:(e,t)=>{s(),i(e,r(`Modal Secret`))},$$slots:{default:!0}}),s(),n(B),s(4),n(z);var V=o(z,4);f(o(e(V)),{href:`/docs/guide/cloud-bucket-mounts`,children:(e,t)=>{s(),i(e,r(`CloudBucket mounts guide`))},$$slots:{default:!0}}),s(),n(V);var H=o(V,2);c(H,{id:`access-and-sharing`,children:(e,t)=>{s(),i(e,r(`Access and sharing`))},$$slots:{default:!0}});var U=o(H,10);c(U,{id:`interactive-file-viewer`,children:(e,t)=>{s(),i(e,r(`Interactive file viewer`))},$$slots:{default:!0}});var W=o(U,4);ie(W,{children:(e,t)=>{var n=ce();s(2),i(e,n)},$$slots:{default:!0}});var G=o(W,2);f(o(e(G),4),{href:`/docs/guide/volumes`,children:(e,t)=>{s(),i(e,r(`Volume`))},$$slots:{default:!0}}),s(3),n(G);var K=o(G,4);c(K,{id:`editor-features`,children:(e,t)=>{s(),i(e,r(`Editor features`))},$$slots:{default:!0}});var q=o(K,12);c(q,{id:`widgets`,children:(e,t)=>{s(),i(e,r(`Widgets`))},$$slots:{default:!0}});var J=o(q,2);f(o(e(J)),{href:`https://ipywidgets.readthedocs.io/en/latest/`,rel:`nofollow`,children:(e,t)=>{s(),i(e,r(`Jupyter Widgets`))},$$slots:{default:!0}}),s(3),n(J);var Y=o(J,6);c(Y,{id:`cell-magic`,children:(e,t)=>{s(),i(e,r(`Cell magic`))},$$slots:{default:!0}});var X=o(Y,2);f(o(e(X),3),{href:`/docs/guide/trigger-deployed-functions`,children:(e,t)=>{s(),i(e,r(`deployed Modal Function or Cls`))},$$slots:{default:!0}}),s(),n(X);var Z=o(X,4);u(Z,{code:`import%20modal%0A%0Aapp%20%3D%20modal.App(%22my-app%22)%0A%0A%0A%40app.function()%0Adef%20my_function(s%3A%20str)%3A%0A%20%20%20%20return%20len(s)`,lang:`python`});var fe=o(Z,4);u(fe,{code:`%25modal%20from%20my-app%20import%20my_function%0A%0Amy_function.remote(%22hello%2C%20world!%22)%20%20%23%20returns%2013`,lang:`python`});var pe=o(fe,4);c(pe,{id:`roadmap`,children:(e,t)=>{s(),i(e,r(`Roadmap`))},$$slots:{default:!0}});var me=o(pe,2);ne(me,{variant:`beta`});var Q=o(me,4),he=e(Q),ge=o(e(he),2),$=e(ge);f(o(e($)),{href:`/docs/guide/tunnels`,children:(e,t)=>{s(),i(e,r(`Tunnels`))},$$slots:{default:!0}}),n($),s(6),n(ge),n(he),s(4),n(Q);var _e=o(Q,2);f(o(e(_e)),{href:`/slack`,children:(e,t)=>{s(),i(e,r(`Slack`))},$$slots:{default:!0}}),s(),n(_e),i(t,a)},$$slots:{default:!0}}))}export{g as default,p as metadata};
//# sourceMappingURL=NSlCQjio.js.map
