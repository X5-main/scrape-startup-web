(function(){try{var e=typeof window<`u`?window:typeof global<`u`?global:typeof globalThis<`u`?globalThis:typeof self<`u`?self:{};e.SENTRY_RELEASE={id:`f99fcf9f0a844cc9bd13fdc8e5782b84`};var t=new e.Error().stack;t&&(e._sentryDebugIds=e._sentryDebugIds||{},e._sentryDebugIds[t]=`94593e86-dd6c-431f-bfce-4acd545972b3`,e._sentryDebugIdIdentifier=`sentry-dbid-94593e86-dd6c-431f-bfce-4acd545972b3`)}catch{}})();import{$t as e,St as t,Tn as n,Tt as r,bt as i,c as a,d as o,en as s,tn as c,wn as l}from"./F_ixKBiO.js";import"./B1sc9Zdx.js";import"./Bb2deiU3.js";import{a as u,o as d}from"./CPby7b1n.js";import{t as f}from"./BILrvr3I.js";import{t as p}from"./B4L_if842.js";import{t as m}from"./DeWGVqas2.js";import{t as h}from"./D0Ft4u302.js";var g={toc:[{depth:1,value:`Named images`,id:`named-images`,children:[{depth:2,value:`Publishing an Image from a script`,id:`publishing-an-image-from-a-script`},{depth:2,value:`Starting Sandboxes using named Images`,id:`starting-sandboxes-using-named-images`},{depth:2,value:`Running Functions using named Images`,id:`running-functions-using-named-images`},{depth:2,value:`Tags`,id:`tags`}]}],rawContent:`# Named images

Named Images let you publish a Modal Image under a name that you can reference
later to use the Image, akin to a container registry.

This can be useful for stricter Image change management and for avoiding
unintended Image invalidation and rebuilds on latency-sensitive code paths.

Unlike inline Image definitions, referencing an image by name will never
implicitly rebuild an Image. The Image reference for a name is mutable,
and because the reference is typically updated only after a successful
publish, callers keep using the previous working Image while the new build is running.

A typical workflow using named images would be:

1. Define, build, and publish the Image in an independently run Image build script
2. Reference the published Image by name in Sandbox or Function code, getting the latest build of that image at the time

## Publishing an Image from a script

Use [\`Image.build\`](/docs/sdk/py/latest/Image#build) to build the
Image, then call \`.publish()\` on the resulting Image:

<CodeTabs>
  {#snippet python()}

\`\`\`python notest
# build_image.py
app = modal.App.lookup("image-builds", create_if_missing=True)

image = (
    modal.Image.debian_slim(python_version="3.12")
    .apt_install("git")
    .uv_pip_install("numpy", "pandas", "scikit-learn")
    .run_commands("python -c 'import sklearn; print(sklearn.__version__)'")
)

with modal.enable_output():
    image.build(app).publish("analytics-runtime")
\`\`\`

{/snippet}

{#snippet javascript()}

\`\`\`javascript
// build_image.ts
const app = await modal.apps.fromName("image-builds", {
  createIfMissing: true,
});

const image = modal.images
  .fromRegistry("python:3.12-slim")
  .dockerfileCommands([
    "RUN apt-get update && apt-get install -y git",
    "RUN pip install numpy pandas scikit-learn",
    "RUN python -c 'import sklearn; print(sklearn.__version__)'",
  ]);

const builtImage = await image.build(app);
await builtImage.publish("analytics-runtime");
\`\`\`

{/snippet}

{#snippet go()}

\`\`\`go
// build_image.go
app, err := mc.Apps.FromName(ctx, "image-builds", &modal.AppFromNameParams{
	CreateIfMissing: true,
})

image := mc.Images.FromRegistry("python:3.12-slim", nil).
	DockerfileCommands([]string{
		"RUN apt-get update && apt-get install -y git",
		"RUN pip install numpy pandas scikit-learn",
		"RUN python -c 'import sklearn; print(sklearn.__version__)'",
	}, nil)

builtImage, err := image.Build(ctx, app, nil)
err = builtImage.Publish(ctx, "analytics-runtime", nil)
\`\`\`

{/snippet}
</CodeTabs>

## Starting Sandboxes using named Images

Named Images are especially useful for Sandboxes because Sandbox creation often happens
on a latency-sensitive path and you typically never want to block Sandbox creation on
rebuilding an Image.

Use [\`Image.from_name\`](/docs/sdk/py/latest/Image#from_name) when referencing
a named Image that you have previously built, and start the Sandbox using that:

<CodeTabs>
  {#snippet python()}

\`\`\`python notest
# sandbox_launcher.py
sb = modal.Sandbox.create(
    "python",
    "-c",
    "import pandas, sklearn; print('ready')",
    image=modal.Image.from_name("analytics-runtime"),
    app=app,
)
print(sb.stdout.read())
\`\`\`

{/snippet}

{#snippet javascript()}

\`\`\`javascript
// sandbox_launcher.ts
const image = await modal.images.fromName("analytics-runtime");
const sb = await modal.sandboxes.create(app, image);

const p = await sb.exec([
  "python",
  "-c",
  "import pandas, sklearn; print('ready')",
]);
console.log(await p.stdout.readText());
sb.detach();
\`\`\`

{/snippet}

{#snippet go()}

\`\`\`go
// sandbox_launcher.go
image, err := mc.Images.FromName(ctx, "analytics-runtime", nil)
sb, err := mc.Sandboxes.Create(ctx, app, image, nil)
defer sb.Detach()

p, err := sb.Exec(ctx, []string{
	"python",
	"-c",
	"import pandas, sklearn; print('ready')",
}, nil)
stdout, err := io.ReadAll(p.Stdout)
fmt.Println(string(stdout))
\`\`\`

{/snippet}
</CodeTabs>

## Running Functions using named Images

Named Images can also be used when defining Modal Functions when you want more control over when
a Function starts using a new Image. To use a named Image, point the Function image attribute
to a [\`Image.from_name\`](/docs/sdk/py/latest/Image#from_name) reference:

\`\`\`python notest
# app.py
@app.function(image=modal.Image.from_name("analytics-runtime"))
def train():
    import pandas as pd
    from sklearn.linear_model import LinearRegression
    ...
\`\`\`

Note that publishing a new version of this named Image would not automatically
update your deployed Functions to use the updated Image. You still need to redeploy
the App that references that name for the change to propagate.

## Tags

Every named Image is represented using a \`{name}:{tag}\` name - if you do not specify the tag part, the \`:latest\` tag is automatically used.
You can publish the same Image using multiple names or tag which can be useful to do things like versioning of images.
`,meta:{title:`Named images`,description:`Named Images let you publish a Modal Image under a name that you can reference later to use the Image, akin to a container registry.`}},{toc:_,rawContent:v,meta:y}=g,b=t(`<code>Image.build</code>`),x=t(`<code>Image.from_name</code>`),S=t(`<code>Image.from_name</code>`),C=t(`<!> <p>Named Images let you publish a Modal Image under a name that you can reference
later to use the Image, akin to a container registry.</p> <p>This can be useful for stricter Image change management and for avoiding
unintended Image invalidation and rebuilds on latency-sensitive code paths.</p> <p>Unlike inline Image definitions, referencing an image by name will never
implicitly rebuild an Image. The Image reference for a name is mutable,
and because the reference is typically updated only after a successful
publish, callers keep using the previous working Image while the new build is running.</p> <p>A typical workflow using named images would be:</p> <ol><li>Define, build, and publish the Image in an independently run Image build script</li> <li>Reference the published Image by name in Sandbox or Function code, getting the latest build of that image at the time</li></ol> <!> <p>Use <!> to build the
Image, then call <code>.publish()</code> on the resulting Image:</p> <!> <!> <p>Named Images are especially useful for Sandboxes because Sandbox creation often happens
on a latency-sensitive path and you typically never want to block Sandbox creation on
rebuilding an Image.</p> <p>Use <!> when referencing
a named Image that you have previously built, and start the Sandbox using that:</p> <!> <!> <p>Named Images can also be used when defining Modal Functions when you want more control over when
a Function starts using a new Image. To use a named Image, point the Function image attribute
to a <!> reference:</p> <!> <p>Note that publishing a new version of this named Image would not automatically
update your deployed Functions to use the updated Image. You still need to redeploy
the App that references that name for the change to propagate.</p> <!> <p>Every named Image is represented using a <code>&#123;name&#125;:&#123;tag&#125;</code> name - if you do not specify the tag part, the <code>:latest</code> tag is automatically used.
You can publish the same Image using multiple names or tag which can be useful to do things like versioning of images.</p>`,1);function w(t,_){let v=a(_,[`children`,`$$slots`,`$$events`,`$$legacy`]);p(t,o(()=>v,()=>g,{children:(t,a)=>{var o=C(),p=s(o);d(p,{id:`named-images`,children:(e,t)=>{l(),i(e,r(`Named images`))},$$slots:{default:!0}});var g=c(p,12);u(g,{id:`publishing-an-image-from-a-script`,children:(e,t)=>{l(),i(e,r(`Publishing an Image from a script`))},$$slots:{default:!0}});var _=c(g,2);m(c(e(_)),{href:`/docs/sdk/py/latest/Image#build`,children:(e,t)=>{i(e,b())},$$slots:{default:!0}}),l(3),n(_);var v=c(_,2);h(v,{python:e=>{f(e,{code:`%23%20build_image.py%0Aapp%20%3D%20modal.App.lookup(%22image-builds%22%2C%20create_if_missing%3DTrue)%0A%0Aimage%20%3D%20(%0A%20%20%20%20modal.Image.debian_slim(python_version%3D%223.12%22)%0A%20%20%20%20.apt_install(%22git%22)%0A%20%20%20%20.uv_pip_install(%22numpy%22%2C%20%22pandas%22%2C%20%22scikit-learn%22)%0A%20%20%20%20.run_commands(%22python%20-c%20'import%20sklearn%3B%20print(sklearn.__version__)'%22)%0A)%0A%0Awith%20modal.enable_output()%3A%0A%20%20%20%20image.build(app).publish(%22analytics-runtime%22)`,lang:`python`})},javascript:e=>{f(e,{code:`%2F%2F%20build_image.ts%0Aconst%20app%20%3D%20await%20modal.apps.fromName(%22image-builds%22%2C%20%7B%0A%20%20createIfMissing%3A%20true%2C%0A%7D)%3B%0A%0Aconst%20image%20%3D%20modal.images%0A%20%20.fromRegistry(%22python%3A3.12-slim%22)%0A%20%20.dockerfileCommands(%5B%0A%20%20%20%20%22RUN%20apt-get%20update%20%26%26%20apt-get%20install%20-y%20git%22%2C%0A%20%20%20%20%22RUN%20pip%20install%20numpy%20pandas%20scikit-learn%22%2C%0A%20%20%20%20%22RUN%20python%20-c%20'import%20sklearn%3B%20print(sklearn.__version__)'%22%2C%0A%20%20%5D)%3B%0A%0Aconst%20builtImage%20%3D%20await%20image.build(app)%3B%0Aawait%20builtImage.publish(%22analytics-runtime%22)%3B`,lang:`javascript`})},go:e=>{f(e,{code:`%2F%2F%20build_image.go%0Aapp%2C%20err%20%3A%3D%20mc.Apps.FromName(ctx%2C%20%22image-builds%22%2C%20%26modal.AppFromNameParams%7B%0A%09CreateIfMissing%3A%20true%2C%0A%7D)%0A%0Aimage%20%3A%3D%20mc.Images.FromRegistry(%22python%3A3.12-slim%22%2C%20nil).%0A%09DockerfileCommands(%5B%5Dstring%7B%0A%09%09%22RUN%20apt-get%20update%20%26%26%20apt-get%20install%20-y%20git%22%2C%0A%09%09%22RUN%20pip%20install%20numpy%20pandas%20scikit-learn%22%2C%0A%09%09%22RUN%20python%20-c%20'import%20sklearn%3B%20print(sklearn.__version__)'%22%2C%0A%09%7D%2C%20nil)%0A%0AbuiltImage%2C%20err%20%3A%3D%20image.Build(ctx%2C%20app%2C%20nil)%0Aerr%20%3D%20builtImage.Publish(ctx%2C%20%22analytics-runtime%22%2C%20nil)`,lang:`go`})},$$slots:{python:!0,javascript:!0,go:!0}});var y=c(v,2);u(y,{id:`starting-sandboxes-using-named-images`,children:(e,t)=>{l(),i(e,r(`Starting Sandboxes using named Images`))},$$slots:{default:!0}});var w=c(y,4);m(c(e(w)),{href:`/docs/sdk/py/latest/Image#from_name`,children:(e,t)=>{i(e,x())},$$slots:{default:!0}}),l(),n(w);var T=c(w,2);h(T,{python:e=>{f(e,{code:`%23%20sandbox_launcher.py%0Asb%20%3D%20modal.Sandbox.create(%0A%20%20%20%20%22python%22%2C%0A%20%20%20%20%22-c%22%2C%0A%20%20%20%20%22import%20pandas%2C%20sklearn%3B%20print('ready')%22%2C%0A%20%20%20%20image%3Dmodal.Image.from_name(%22analytics-runtime%22)%2C%0A%20%20%20%20app%3Dapp%2C%0A)%0Aprint(sb.stdout.read())`,lang:`python`})},javascript:e=>{f(e,{code:`%2F%2F%20sandbox_launcher.ts%0Aconst%20image%20%3D%20await%20modal.images.fromName(%22analytics-runtime%22)%3B%0Aconst%20sb%20%3D%20await%20modal.sandboxes.create(app%2C%20image)%3B%0A%0Aconst%20p%20%3D%20await%20sb.exec(%5B%0A%20%20%22python%22%2C%0A%20%20%22-c%22%2C%0A%20%20%22import%20pandas%2C%20sklearn%3B%20print('ready')%22%2C%0A%5D)%3B%0Aconsole.log(await%20p.stdout.readText())%3B%0Asb.detach()%3B`,lang:`javascript`})},go:e=>{f(e,{code:`%2F%2F%20sandbox_launcher.go%0Aimage%2C%20err%20%3A%3D%20mc.Images.FromName(ctx%2C%20%22analytics-runtime%22%2C%20nil)%0Asb%2C%20err%20%3A%3D%20mc.Sandboxes.Create(ctx%2C%20app%2C%20image%2C%20nil)%0Adefer%20sb.Detach()%0A%0Ap%2C%20err%20%3A%3D%20sb.Exec(ctx%2C%20%5B%5Dstring%7B%0A%09%22python%22%2C%0A%09%22-c%22%2C%0A%09%22import%20pandas%2C%20sklearn%3B%20print('ready')%22%2C%0A%7D%2C%20nil)%0Astdout%2C%20err%20%3A%3D%20io.ReadAll(p.Stdout)%0Afmt.Println(string(stdout))`,lang:`go`})},$$slots:{python:!0,javascript:!0,go:!0}});var E=c(T,2);u(E,{id:`running-functions-using-named-images`,children:(e,t)=>{l(),i(e,r(`Running Functions using named Images`))},$$slots:{default:!0}});var D=c(E,2);m(c(e(D)),{href:`/docs/sdk/py/latest/Image#from_name`,children:(e,t)=>{i(e,S())},$$slots:{default:!0}}),l(),n(D);var O=c(D,2);f(O,{code:`%23%20app.py%0A%40app.function(image%3Dmodal.Image.from_name(%22analytics-runtime%22))%0Adef%20train()%3A%0A%20%20%20%20import%20pandas%20as%20pd%0A%20%20%20%20from%20sklearn.linear_model%20import%20LinearRegression%0A%20%20%20%20...`,lang:`python`}),u(c(O,4),{id:`tags`,children:(e,t)=>{l(),i(e,r(`Tags`))},$$slots:{default:!0}}),l(2),i(t,o)},$$slots:{default:!0}}))}export{w as default,g as metadata};
//# sourceMappingURL=CM0pCbkc.js.map
