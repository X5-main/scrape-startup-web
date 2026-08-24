(function(){try{var e=typeof window<`u`?window:typeof global<`u`?global:typeof globalThis<`u`?globalThis:typeof self<`u`?self:{};e.SENTRY_RELEASE={id:`f99fcf9f0a844cc9bd13fdc8e5782b84`};var t=new e.Error().stack;t&&(e._sentryDebugIds=e._sentryDebugIds||{},e._sentryDebugIds[t]=`4e2f5acc-fe71-490b-ae0b-68de5d9fad43`,e._sentryDebugIdIdentifier=`sentry-dbid-4e2f5acc-fe71-490b-ae0b-68de5d9fad43`)}catch{}})();import{$t as e,St as t,Tn as n,Tt as r,bt as i,c as a,d as o,en as s,tn as c,wn as l}from"./F_ixKBiO.js";import"./B1sc9Zdx.js";import"./Bb2deiU3.js";import{a as u}from"./CPby7b1n.js";import{t as d}from"./BILrvr3I.js";import{t as f}from"./B4L_if842.js";import{t as p}from"./DeWGVqas2.js";var m={toc:[{depth:2,value:`Overview`,id:`overview`}],rawContent:`## Overview

Quick snippet showing how to connect to a Jupyter notebook server running inside a Modal container,
especially useful for exploring the contents of Modal Volumes.
This uses [Modal Tunnels](https://modal.com/docs/guide/tunnels#tunnels-beta)
to create a tunnel between the running Jupyter instance and the internet.

If you want to your Jupyter notebook to run _locally_ and execute remote Modal Functions in certain cells, see the \`basic.ipynb\` example :)

\`\`\`python
import os
import subprocess
import time

import modal

app = modal.App(
    "example-jupyter-inside-modal",
    image=modal.Image.debian_slim(python_version="3.12").uv_pip_install(
        "jupyter", "bing-image-downloader~=1.1.2"
    ),
)
volume = modal.Volume.from_name(
    "modal-examples-jupyter-inside-modal-data", create_if_missing=True
)

CACHE_DIR = "/root/cache"
JUPYTER_TOKEN = "1234"  # Change me to something non-guessable!


@app.function(volumes={CACHE_DIR: volume})
def seed_volume():
    # Bing it!
    from bing_image_downloader import downloader

    # This will save into the Modal volume and allow you view the images
    # from within Jupyter at a path like \`/root/cache/modal labs/Image_1.png\`.
    downloader.download(
        query="modal labs",
        limit=10,
        output_dir=CACHE_DIR,
        force_replace=False,
        timeout=60,
        verbose=True,
    )
    volume.commit()


\`\`\`

This is all that's needed to create a long-lived Jupyter server process in Modal
that you can access in your Browser through a secure network tunnel.
This can be useful when you want to interactively engage with Volume contents
without having to download it to your host computer.

\`\`\`python
@app.function(max_containers=1, volumes={CACHE_DIR: volume}, timeout=1_500)
def run_jupyter(timeout: int):
    jupyter_port = 8888
    with modal.forward(jupyter_port) as tunnel:
        jupyter_process = subprocess.Popen(
            [
                "jupyter",
                "notebook",
                "--no-browser",
                "--allow-root",
                "--ip=0.0.0.0",
                f"--port={jupyter_port}",
                "--NotebookApp.allow_origin='*'",
                "--NotebookApp.allow_remote_access=1",
            ],
            env={**os.environ, "JUPYTER_TOKEN": JUPYTER_TOKEN},
        )

        print(f"Jupyter available at => {tunnel.url}")

        try:
            end_time = time.time() + timeout
            while time.time() < end_time:
                time.sleep(5)
            print(f"Reached end of {timeout} second timeout period. Exiting...")
        except KeyboardInterrupt:
            print("Exiting...")
        finally:
            jupyter_process.kill()


@app.local_entrypoint()
def main(timeout: int = 10_000):
    # Write some images to a volume, for demonstration purposes.
    seed_volume.remote()
    # Run the Jupyter Notebook server
    run_jupyter.remote(timeout=timeout)


\`\`\`

Doing \`modal run jupyter_inside_modal.py\` will run a Modal app which starts
the Juypter server at an address like https://u35iiiyqp5klbs.r3.modal.host.
Visit this address in your browser, and enter the security token
you set for \`JUPYTER_TOKEN\`.
`,meta:{description:`Quick snippet showing how to connect to a Jupyter notebook server running inside a Modal container, especially useful for exploring the contents of Modal Volumes. This uses Modal Tunnels to create a tunnel between the running Jupyter instance and the internet.`}},{toc:h,rawContent:g,meta:_}=m,v=t(`<!> <p>Quick snippet showing how to connect to a Jupyter notebook server running inside a Modal container,
especially useful for exploring the contents of Modal Volumes.
This uses <!> to create a tunnel between the running Jupyter instance and the internet.</p> <p>If you want to your Jupyter notebook to run <em>locally</em> and execute remote Modal Functions in certain cells, see the <code>basic.ipynb</code> example :)</p> <!> <p>This is all that’s needed to create a long-lived Jupyter server process in Modal
that you can access in your Browser through a secure network tunnel.
This can be useful when you want to interactively engage with Volume contents
without having to download it to your host computer.</p> <!> <p>Doing <code>modal run jupyter_inside_modal.py</code> will run a Modal app which starts
the Juypter server at an address like <!> Visit this address in your browser, and enter the security token
you set for <code>JUPYTER_TOKEN</code>.</p>`,1);function y(t,h){let g=a(h,[`children`,`$$slots`,`$$events`,`$$legacy`]);f(t,o(()=>g,()=>m,{children:(t,a)=>{var o=v(),f=s(o);u(f,{id:`overview`,children:(e,t)=>{l(),i(e,r(`Overview`))},$$slots:{default:!0}});var m=c(f,2);p(c(e(m)),{href:`https://modal.com/docs/guide/tunnels#tunnels-beta`,rel:`nofollow`,children:(e,t)=>{l(),i(e,r(`Modal Tunnels`))},$$slots:{default:!0}}),l(),n(m);var h=c(m,4);d(h,{code:`import%20os%0Aimport%20subprocess%0Aimport%20time%0A%0Aimport%20modal%0A%0Aapp%20%3D%20modal.App(%0A%20%20%20%20%22example-jupyter-inside-modal%22%2C%0A%20%20%20%20image%3Dmodal.Image.debian_slim(python_version%3D%223.12%22).uv_pip_install(%0A%20%20%20%20%20%20%20%20%22jupyter%22%2C%20%22bing-image-downloader~%3D1.1.2%22%0A%20%20%20%20)%2C%0A)%0Avolume%20%3D%20modal.Volume.from_name(%0A%20%20%20%20%22modal-examples-jupyter-inside-modal-data%22%2C%20create_if_missing%3DTrue%0A)%0A%0ACACHE_DIR%20%3D%20%22%2Froot%2Fcache%22%0AJUPYTER_TOKEN%20%3D%20%221234%22%20%20%23%20Change%20me%20to%20something%20non-guessable!%0A%0A%0A%40app.function(volumes%3D%7BCACHE_DIR%3A%20volume%7D)%0Adef%20seed_volume()%3A%0A%20%20%20%20%23%20Bing%20it!%0A%20%20%20%20from%20bing_image_downloader%20import%20downloader%0A%0A%20%20%20%20%23%20This%20will%20save%20into%20the%20Modal%20volume%20and%20allow%20you%20view%20the%20images%0A%20%20%20%20%23%20from%20within%20Jupyter%20at%20a%20path%20like%20%60%2Froot%2Fcache%2Fmodal%20labs%2FImage_1.png%60.%0A%20%20%20%20downloader.download(%0A%20%20%20%20%20%20%20%20query%3D%22modal%20labs%22%2C%0A%20%20%20%20%20%20%20%20limit%3D10%2C%0A%20%20%20%20%20%20%20%20output_dir%3DCACHE_DIR%2C%0A%20%20%20%20%20%20%20%20force_replace%3DFalse%2C%0A%20%20%20%20%20%20%20%20timeout%3D60%2C%0A%20%20%20%20%20%20%20%20verbose%3DTrue%2C%0A%20%20%20%20)%0A%20%20%20%20volume.commit()%0A%0A`,lang:`python`});var g=c(h,4);d(g,{code:`%40app.function(max_containers%3D1%2C%20volumes%3D%7BCACHE_DIR%3A%20volume%7D%2C%20timeout%3D1_500)%0Adef%20run_jupyter(timeout%3A%20int)%3A%0A%20%20%20%20jupyter_port%20%3D%208888%0A%20%20%20%20with%20modal.forward(jupyter_port)%20as%20tunnel%3A%0A%20%20%20%20%20%20%20%20jupyter_process%20%3D%20subprocess.Popen(%0A%20%20%20%20%20%20%20%20%20%20%20%20%5B%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%22jupyter%22%2C%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%22notebook%22%2C%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%22--no-browser%22%2C%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%22--allow-root%22%2C%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%22--ip%3D0.0.0.0%22%2C%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20f%22--port%3D%7Bjupyter_port%7D%22%2C%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%22--NotebookApp.allow_origin%3D'*'%22%2C%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%22--NotebookApp.allow_remote_access%3D1%22%2C%0A%20%20%20%20%20%20%20%20%20%20%20%20%5D%2C%0A%20%20%20%20%20%20%20%20%20%20%20%20env%3D%7B**os.environ%2C%20%22JUPYTER_TOKEN%22%3A%20JUPYTER_TOKEN%7D%2C%0A%20%20%20%20%20%20%20%20)%0A%0A%20%20%20%20%20%20%20%20print(f%22Jupyter%20available%20at%20%3D%3E%20%7Btunnel.url%7D%22)%0A%0A%20%20%20%20%20%20%20%20try%3A%0A%20%20%20%20%20%20%20%20%20%20%20%20end_time%20%3D%20time.time()%20%2B%20timeout%0A%20%20%20%20%20%20%20%20%20%20%20%20while%20time.time()%20%3C%20end_time%3A%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20time.sleep(5)%0A%20%20%20%20%20%20%20%20%20%20%20%20print(f%22Reached%20end%20of%20%7Btimeout%7D%20second%20timeout%20period.%20Exiting...%22)%0A%20%20%20%20%20%20%20%20except%20KeyboardInterrupt%3A%0A%20%20%20%20%20%20%20%20%20%20%20%20print(%22Exiting...%22)%0A%20%20%20%20%20%20%20%20finally%3A%0A%20%20%20%20%20%20%20%20%20%20%20%20jupyter_process.kill()%0A%0A%0A%40app.local_entrypoint()%0Adef%20main(timeout%3A%20int%20%3D%2010_000)%3A%0A%20%20%20%20%23%20Write%20some%20images%20to%20a%20volume%2C%20for%20demonstration%20purposes.%0A%20%20%20%20seed_volume.remote()%0A%20%20%20%20%23%20Run%20the%20Jupyter%20Notebook%20server%0A%20%20%20%20run_jupyter.remote(timeout%3Dtimeout)%0A%0A`,lang:`python`});var _=c(g,2);p(c(e(_),3),{href:`https://u35iiiyqp5klbs.r3.modal.host.`,rel:`nofollow`,children:(e,t)=>{l(),i(e,r(`https://u35iiiyqp5klbs.r3.modal.host.`))},$$slots:{default:!0}}),l(3),n(_),i(t,o)},$$slots:{default:!0}}))}export{y as default,m as metadata};
//# sourceMappingURL=DYkD3uWG.js.map
