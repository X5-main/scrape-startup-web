(function(){try{var e=typeof window<`u`?window:typeof global<`u`?global:typeof globalThis<`u`?globalThis:typeof self<`u`?self:{};e.SENTRY_RELEASE={id:`f99fcf9f0a844cc9bd13fdc8e5782b84`};var t=new e.Error().stack;t&&(e._sentryDebugIds=e._sentryDebugIds||{},e._sentryDebugIds[t]=`23f0759a-7895-4945-90f7-e60451e405ea`,e._sentryDebugIdIdentifier=`sentry-dbid-23f0759a-7895-4945-90f7-e60451e405ea`)}catch{}})();import{St as e,Tt as t,bt as n,c as r,d as i,en as a,tn as o,wn as s}from"./F_ixKBiO.js";import"./B1sc9Zdx.js";import"./Bb2deiU3.js";import{o as c}from"./CPby7b1n.js";import{t as l}from"./BILrvr3I.js";import{t as u}from"./B4L_if842.js";var d={toc:[{depth:1,value:`Example (cbx_load_test.py)`,id:`example-cbx_load_testpy`}],rawContent:`# Example (cbx_load_test.py)

This is the source code for **07_web.fasthtml-checkboxes.cbx_load_test**.
\`\`\`python
import os
from datetime import datetime
from pathlib import Path

import modal

if modal.is_local():
    workspace = modal.config._profile or ""
    environment = modal.config.config["environment"] or ""
else:
    workspace = os.environ["MODAL_WORKSPACE"] or ""
    environment = os.environ["MODAL_ENVIRONMENT"] or ""


image = (
    modal.Image.debian_slim(python_version="3.12")
    .uv_pip_install("locust~=2.29.1", "beautifulsoup4~=4.12.3", "lxml~=5.3.0")
    .env({"MODAL_WORKSPACE": workspace, "MODAL_ENVIRONMENT": environment})
    .add_local_file(
        Path(__file__).parent / "cbx_locustfile.py",
        remote_path="/root/locustfile.py",
    )
    .add_local_file(
        Path(__file__).parent / "constants.py",
        remote_path="/root/constants.py",
    )
)
volume = modal.Volume.from_name("example-cbx-load-test-results", create_if_missing=True)
remote_path = Path("/root") / "loadtests"
OUT_DIRECTORY = remote_path / datetime.utcnow().replace(microsecond=0).isoformat()

app = modal.App("example-cbx-load-test", image=image, volumes={remote_path: volume})

workers = 8
host = f"https://{workspace}{'-' + environment if environment else ''}--example-fasthtml-checkboxes-web.modal.run"
csv_file = OUT_DIRECTORY / "stats.csv"
default_args = [
    "-H",
    host,
    "--processes",
    str(workers),
    "--csv",
    csv_file,
]

MINUTES = 60  # seconds


@app.function(cpu=workers)
@modal.concurrent(max_inputs=100)
@modal.web_server(port=8089)
def serve():
    run_locust.local(default_args)


@app.function(cpu=workers, timeout=60 * MINUTES)
def run_locust(args: list, wait=False):
    import subprocess

    process = subprocess.Popen(["locust"] + args)
    if wait:
        process.wait()
        return process.returncode


@app.local_entrypoint()
def main(
    r: float = 1.0,
    u: int = 36,
    t: str = "1m",  # no more than the timeout of run_locust, one hour
):
    args = default_args + [
        "--spawn-rate",
        str(r),
        "--users",
        str(u),
        "--run-time",
        t,
    ]

    html_report_file = OUT_DIRECTORY / "report.html"
    args += [
        "--headless",  # run without browser UI
        "--autostart",  # start test immediately
        "--autoquit",  # stop once finished...
        "10",  # ...but wait ten seconds
        "--html",  # output an HTML-formatted report
        html_report_file,  # to this location
    ]

    if exit_code := run_locust.remote(args, wait=True):
        SystemExit(exit_code)
    else:
        print("finished successfully")

\`\`\`
`,meta:{title:`Example (cbx_load_test.py)`,description:`This is the source code for 07_web.fasthtml-checkboxes.cbx_load_test.`}},{toc:f,rawContent:p,meta:m}=d,h=e(`<!> <p>This is the source code for <strong>07_web.fasthtml-checkboxes.cbx_load_test</strong>.</p> <!>`,1);function g(e,f){let p=r(f,[`children`,`$$slots`,`$$events`,`$$legacy`]);u(e,i(()=>p,()=>d,{children:(e,r)=>{var i=h(),u=a(i);c(u,{id:`example-cbx_load_testpy`,children:(e,r)=>{s(),n(e,t(`Example (cbx_load_test.py)`))},$$slots:{default:!0}}),l(o(u,4),{code:`import%20os%0Afrom%20datetime%20import%20datetime%0Afrom%20pathlib%20import%20Path%0A%0Aimport%20modal%0A%0Aif%20modal.is_local()%3A%0A%20%20%20%20workspace%20%3D%20modal.config._profile%20or%20%22%22%0A%20%20%20%20environment%20%3D%20modal.config.config%5B%22environment%22%5D%20or%20%22%22%0Aelse%3A%0A%20%20%20%20workspace%20%3D%20os.environ%5B%22MODAL_WORKSPACE%22%5D%20or%20%22%22%0A%20%20%20%20environment%20%3D%20os.environ%5B%22MODAL_ENVIRONMENT%22%5D%20or%20%22%22%0A%0A%0Aimage%20%3D%20(%0A%20%20%20%20modal.Image.debian_slim(python_version%3D%223.12%22)%0A%20%20%20%20.uv_pip_install(%22locust~%3D2.29.1%22%2C%20%22beautifulsoup4~%3D4.12.3%22%2C%20%22lxml~%3D5.3.0%22)%0A%20%20%20%20.env(%7B%22MODAL_WORKSPACE%22%3A%20workspace%2C%20%22MODAL_ENVIRONMENT%22%3A%20environment%7D)%0A%20%20%20%20.add_local_file(%0A%20%20%20%20%20%20%20%20Path(__file__).parent%20%2F%20%22cbx_locustfile.py%22%2C%0A%20%20%20%20%20%20%20%20remote_path%3D%22%2Froot%2Flocustfile.py%22%2C%0A%20%20%20%20)%0A%20%20%20%20.add_local_file(%0A%20%20%20%20%20%20%20%20Path(__file__).parent%20%2F%20%22constants.py%22%2C%0A%20%20%20%20%20%20%20%20remote_path%3D%22%2Froot%2Fconstants.py%22%2C%0A%20%20%20%20)%0A)%0Avolume%20%3D%20modal.Volume.from_name(%22example-cbx-load-test-results%22%2C%20create_if_missing%3DTrue)%0Aremote_path%20%3D%20Path(%22%2Froot%22)%20%2F%20%22loadtests%22%0AOUT_DIRECTORY%20%3D%20remote_path%20%2F%20datetime.utcnow().replace(microsecond%3D0).isoformat()%0A%0Aapp%20%3D%20modal.App(%22example-cbx-load-test%22%2C%20image%3Dimage%2C%20volumes%3D%7Bremote_path%3A%20volume%7D)%0A%0Aworkers%20%3D%208%0Ahost%20%3D%20f%22https%3A%2F%2F%7Bworkspace%7D%7B'-'%20%2B%20environment%20if%20environment%20else%20''%7D--example-fasthtml-checkboxes-web.modal.run%22%0Acsv_file%20%3D%20OUT_DIRECTORY%20%2F%20%22stats.csv%22%0Adefault_args%20%3D%20%5B%0A%20%20%20%20%22-H%22%2C%0A%20%20%20%20host%2C%0A%20%20%20%20%22--processes%22%2C%0A%20%20%20%20str(workers)%2C%0A%20%20%20%20%22--csv%22%2C%0A%20%20%20%20csv_file%2C%0A%5D%0A%0AMINUTES%20%3D%2060%20%20%23%20seconds%0A%0A%0A%40app.function(cpu%3Dworkers)%0A%40modal.concurrent(max_inputs%3D100)%0A%40modal.web_server(port%3D8089)%0Adef%20serve()%3A%0A%20%20%20%20run_locust.local(default_args)%0A%0A%0A%40app.function(cpu%3Dworkers%2C%20timeout%3D60%20*%20MINUTES)%0Adef%20run_locust(args%3A%20list%2C%20wait%3DFalse)%3A%0A%20%20%20%20import%20subprocess%0A%0A%20%20%20%20process%20%3D%20subprocess.Popen(%5B%22locust%22%5D%20%2B%20args)%0A%20%20%20%20if%20wait%3A%0A%20%20%20%20%20%20%20%20process.wait()%0A%20%20%20%20%20%20%20%20return%20process.returncode%0A%0A%0A%40app.local_entrypoint()%0Adef%20main(%0A%20%20%20%20r%3A%20float%20%3D%201.0%2C%0A%20%20%20%20u%3A%20int%20%3D%2036%2C%0A%20%20%20%20t%3A%20str%20%3D%20%221m%22%2C%20%20%23%20no%20more%20than%20the%20timeout%20of%20run_locust%2C%20one%20hour%0A)%3A%0A%20%20%20%20args%20%3D%20default_args%20%2B%20%5B%0A%20%20%20%20%20%20%20%20%22--spawn-rate%22%2C%0A%20%20%20%20%20%20%20%20str(r)%2C%0A%20%20%20%20%20%20%20%20%22--users%22%2C%0A%20%20%20%20%20%20%20%20str(u)%2C%0A%20%20%20%20%20%20%20%20%22--run-time%22%2C%0A%20%20%20%20%20%20%20%20t%2C%0A%20%20%20%20%5D%0A%0A%20%20%20%20html_report_file%20%3D%20OUT_DIRECTORY%20%2F%20%22report.html%22%0A%20%20%20%20args%20%2B%3D%20%5B%0A%20%20%20%20%20%20%20%20%22--headless%22%2C%20%20%23%20run%20without%20browser%20UI%0A%20%20%20%20%20%20%20%20%22--autostart%22%2C%20%20%23%20start%20test%20immediately%0A%20%20%20%20%20%20%20%20%22--autoquit%22%2C%20%20%23%20stop%20once%20finished...%0A%20%20%20%20%20%20%20%20%2210%22%2C%20%20%23%20...but%20wait%20ten%20seconds%0A%20%20%20%20%20%20%20%20%22--html%22%2C%20%20%23%20output%20an%20HTML-formatted%20report%0A%20%20%20%20%20%20%20%20html_report_file%2C%20%20%23%20to%20this%20location%0A%20%20%20%20%5D%0A%0A%20%20%20%20if%20exit_code%20%3A%3D%20run_locust.remote(args%2C%20wait%3DTrue)%3A%0A%20%20%20%20%20%20%20%20SystemExit(exit_code)%0A%20%20%20%20else%3A%0A%20%20%20%20%20%20%20%20print(%22finished%20successfully%22)%0A`,lang:`python`}),n(e,i)},$$slots:{default:!0}}))}export{g as default,d as metadata};
//# sourceMappingURL=nhFTiBAF.js.map
