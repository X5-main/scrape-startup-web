(function(){try{var e=typeof window<`u`?window:typeof global<`u`?global:typeof globalThis<`u`?globalThis:typeof self<`u`?self:{};e.SENTRY_RELEASE={id:`f99fcf9f0a844cc9bd13fdc8e5782b84`};var t=new e.Error().stack;t&&(e._sentryDebugIds=e._sentryDebugIds||{},e._sentryDebugIds[t]=`a3a78a37-6d0f-4ceb-8272-a9a478620552`,e._sentryDebugIdIdentifier=`sentry-dbid-a3a78a37-6d0f-4ceb-8272-a9a478620552`)}catch{}})();import{$t as e,St as t,Tn as n,Tt as r,bt as i,c as a,d as o,en as s,tn as c,wn as l}from"./F_ixKBiO.js";import"./B1sc9Zdx.js";import"./Bb2deiU3.js";import{t as u}from"./BILrvr3I.js";import{t as d}from"./B4L_if842.js";import{t as f}from"./DeWGVqas2.js";var p={toc:[],rawContent:`This script demonstrates ingestion of the [COCO](https://cocodataset.org/#download) (Common Objects in Context)
dataset.

It is recommended to iterate on this code from a modal.Function running Jupyter server.
This better supports experimentation and maintains state in the face of errors:
11_notebooks/jupyter_inside_modal.py

\`\`\`python
import os
import pathlib
import shutil
import subprocess
import sys
import threading
import time
import zipfile

import modal

bucket_creds = modal.Secret.from_name(
    "aws-s3-modal-examples-datasets", environment_name="main"
)
bucket_name = "modal-examples-datasets"
volume = modal.CloudBucketMount(
    bucket_name,
    secret=bucket_creds,
)
image = modal.Image.debian_slim().apt_install("wget").uv_pip_install("tqdm")
app = modal.App(
    "example-coco",
    image=image,
    secrets=[],
)


def start_monitoring_disk_space(interval: int = 120) -> None:
    """Start monitoring the disk space in a separate thread."""
    task_id = os.environ["MODAL_TASK_ID"]

    def log_disk_space(interval: int) -> None:
        while True:
            statvfs = os.statvfs("/")
            free_space = statvfs.f_frsize * statvfs.f_bavail
            print(
                f"{task_id} free disk space: {free_space / (1024**3):.2f} GB",
                file=sys.stderr,
            )
            time.sleep(interval)

    monitoring_thread = threading.Thread(target=log_disk_space, args=(interval,))
    monitoring_thread.daemon = True
    monitoring_thread.start()


def extractall(fzip, dest, desc="Extracting"):
    from tqdm.auto import tqdm
    from tqdm.utils import CallbackIOWrapper

    dest = pathlib.Path(dest).expanduser()
    with (
        zipfile.ZipFile(fzip) as zipf,
        tqdm(
            desc=desc,
            unit="B",
            unit_scale=True,
            unit_divisor=1024,
            total=sum(getattr(i, "file_size", 0) for i in zipf.infolist()),
        ) as pbar,
    ):
        for i in zipf.infolist():
            if not getattr(i, "file_size", 0):  # directory
                zipf.extract(i, os.fspath(dest))
            else:
                full_path = dest / i.filename
                full_path.parent.mkdir(exist_ok=True, parents=True)
                with zipf.open(i) as fi, open(full_path, "wb") as fo:
                    shutil.copyfileobj(CallbackIOWrapper(pbar.update, fi), fo)


def copy_concurrent(src: pathlib.Path, dest: pathlib.Path) -> None:
    from multiprocessing.pool import ThreadPool

    class MultithreadedCopier:
        def __init__(self, max_threads):
            self.pool = ThreadPool(max_threads)

        def copy(self, source, dest):
            self.pool.apply_async(shutil.copy2, args=(source, dest))

        def __enter__(self):
            return self

        def __exit__(self, exc_type, exc_val, exc_tb):
            self.pool.close()
            self.pool.join()

    with MultithreadedCopier(max_threads=48) as copier:
        shutil.copytree(src, dest, copy_function=copier.copy, dirs_exist_ok=True)


\`\`\`

This script uses wget to download ZIP files over HTTP because while the official
website recommends using gsutil to download from a bucket (https://cocodataset.org/#download)
that bucket no longer exists.

\`\`\`python
@app.function(
    volumes={"/vol/": volume},
    timeout=60 * 60 * 5,  # 5 hours
    ephemeral_disk=600 * 1024,  # 600 GiB,
)
def _do_part(url: str) -> None:
    start_monitoring_disk_space()
    part = url.replace("http://images.cocodataset.org/", "")
    name = pathlib.Path(part).name.replace(".zip", "")
    zip_path = pathlib.Path("/tmp/") / pathlib.Path(part).name
    extract_tmp_path = pathlib.Path("/tmp", name)
    dest_path = pathlib.Path("/vol/coco/", name)

    print(f"Downloading {name} from {url}")
    command = f"wget {url} -O {zip_path}"
    subprocess.run(command, shell=True, check=True)
    print(f"Download of {name} completed successfully.")
    extract_tmp_path.mkdir()
    extractall(
        zip_path, extract_tmp_path, desc=f"Extracting {name}"
    )  # extract into /tmp/
    zip_path.unlink()  # free up disk space by deleting the zip
    print(f"Copying extract {name} data to volume.")
    copy_concurrent(extract_tmp_path, dest_path)  # copy from /tmp/ into mounted volume


\`\`\`

We can process each part of the dataset in parallel, using a 'parent' Function just to execute
the map and wait on completion of all children.

\`\`\`python
@app.function(
    timeout=60 * 60 * 5,  # 5 hours
)
def import_transform_load() -> None:
    print("Starting import, transform, and load of COCO dataset")
    list(
        _do_part.map(
            [
                "http://images.cocodataset.org/zips/train2017.zip",
                "http://images.cocodataset.org/zips/val2017.zip",
                "http://images.cocodataset.org/zips/test2017.zip",
                "http://images.cocodataset.org/zips/unlabeled2017.zip",
                "http://images.cocodataset.org/annotations/annotations_trainval2017.zip",
                "http://images.cocodataset.org/annotations/stuff_annotations_trainval2017.zip",
                "http://images.cocodataset.org/annotations/image_info_test2017.zip",
                "http://images.cocodataset.org/annotations/image_info_unlabeled2017.zip",
            ]
        )
    )
    print("✅ Done")

\`\`\`
`,meta:{description:`This script demonstrates ingestion of the COCO (Common Objects in Context) dataset.`}},{toc:m,rawContent:h,meta:g}=p,_=t(`<p>This script demonstrates ingestion of the <!> (Common Objects in Context)
dataset.</p> <p>It is recommended to iterate on this code from a modal.Function running Jupyter server.
This better supports experimentation and maintains state in the face of errors:
11_notebooks/jupyter_inside_modal.py</p> <!> <p>This script uses wget to download ZIP files over HTTP because while the official
website recommends using gsutil to download from a bucket (<!>)
that bucket no longer exists.</p> <!> <p>We can process each part of the dataset in parallel, using a ‘parent’ Function just to execute
the map and wait on completion of all children.</p> <!>`,1);function v(t,m){let h=a(m,[`children`,`$$slots`,`$$events`,`$$legacy`]);d(t,o(()=>h,()=>p,{children:(t,a)=>{var o=_(),d=s(o);f(c(e(d)),{href:`https://cocodataset.org/#download`,rel:`nofollow`,children:(e,t)=>{l(),i(e,r(`COCO`))},$$slots:{default:!0}}),l(),n(d);var p=c(d,4);u(p,{code:`import%20os%0Aimport%20pathlib%0Aimport%20shutil%0Aimport%20subprocess%0Aimport%20sys%0Aimport%20threading%0Aimport%20time%0Aimport%20zipfile%0A%0Aimport%20modal%0A%0Abucket_creds%20%3D%20modal.Secret.from_name(%0A%20%20%20%20%22aws-s3-modal-examples-datasets%22%2C%20environment_name%3D%22main%22%0A)%0Abucket_name%20%3D%20%22modal-examples-datasets%22%0Avolume%20%3D%20modal.CloudBucketMount(%0A%20%20%20%20bucket_name%2C%0A%20%20%20%20secret%3Dbucket_creds%2C%0A)%0Aimage%20%3D%20modal.Image.debian_slim().apt_install(%22wget%22).uv_pip_install(%22tqdm%22)%0Aapp%20%3D%20modal.App(%0A%20%20%20%20%22example-coco%22%2C%0A%20%20%20%20image%3Dimage%2C%0A%20%20%20%20secrets%3D%5B%5D%2C%0A)%0A%0A%0Adef%20start_monitoring_disk_space(interval%3A%20int%20%3D%20120)%20-%3E%20None%3A%0A%20%20%20%20%22%22%22Start%20monitoring%20the%20disk%20space%20in%20a%20separate%20thread.%22%22%22%0A%20%20%20%20task_id%20%3D%20os.environ%5B%22MODAL_TASK_ID%22%5D%0A%0A%20%20%20%20def%20log_disk_space(interval%3A%20int)%20-%3E%20None%3A%0A%20%20%20%20%20%20%20%20while%20True%3A%0A%20%20%20%20%20%20%20%20%20%20%20%20statvfs%20%3D%20os.statvfs(%22%2F%22)%0A%20%20%20%20%20%20%20%20%20%20%20%20free_space%20%3D%20statvfs.f_frsize%20*%20statvfs.f_bavail%0A%20%20%20%20%20%20%20%20%20%20%20%20print(%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20f%22%7Btask_id%7D%20free%20disk%20space%3A%20%7Bfree_space%20%2F%20(1024**3)%3A.2f%7D%20GB%22%2C%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20file%3Dsys.stderr%2C%0A%20%20%20%20%20%20%20%20%20%20%20%20)%0A%20%20%20%20%20%20%20%20%20%20%20%20time.sleep(interval)%0A%0A%20%20%20%20monitoring_thread%20%3D%20threading.Thread(target%3Dlog_disk_space%2C%20args%3D(interval%2C))%0A%20%20%20%20monitoring_thread.daemon%20%3D%20True%0A%20%20%20%20monitoring_thread.start()%0A%0A%0Adef%20extractall(fzip%2C%20dest%2C%20desc%3D%22Extracting%22)%3A%0A%20%20%20%20from%20tqdm.auto%20import%20tqdm%0A%20%20%20%20from%20tqdm.utils%20import%20CallbackIOWrapper%0A%0A%20%20%20%20dest%20%3D%20pathlib.Path(dest).expanduser()%0A%20%20%20%20with%20(%0A%20%20%20%20%20%20%20%20zipfile.ZipFile(fzip)%20as%20zipf%2C%0A%20%20%20%20%20%20%20%20tqdm(%0A%20%20%20%20%20%20%20%20%20%20%20%20desc%3Ddesc%2C%0A%20%20%20%20%20%20%20%20%20%20%20%20unit%3D%22B%22%2C%0A%20%20%20%20%20%20%20%20%20%20%20%20unit_scale%3DTrue%2C%0A%20%20%20%20%20%20%20%20%20%20%20%20unit_divisor%3D1024%2C%0A%20%20%20%20%20%20%20%20%20%20%20%20total%3Dsum(getattr(i%2C%20%22file_size%22%2C%200)%20for%20i%20in%20zipf.infolist())%2C%0A%20%20%20%20%20%20%20%20)%20as%20pbar%2C%0A%20%20%20%20)%3A%0A%20%20%20%20%20%20%20%20for%20i%20in%20zipf.infolist()%3A%0A%20%20%20%20%20%20%20%20%20%20%20%20if%20not%20getattr(i%2C%20%22file_size%22%2C%200)%3A%20%20%23%20directory%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20zipf.extract(i%2C%20os.fspath(dest))%0A%20%20%20%20%20%20%20%20%20%20%20%20else%3A%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20full_path%20%3D%20dest%20%2F%20i.filename%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20full_path.parent.mkdir(exist_ok%3DTrue%2C%20parents%3DTrue)%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20with%20zipf.open(i)%20as%20fi%2C%20open(full_path%2C%20%22wb%22)%20as%20fo%3A%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20shutil.copyfileobj(CallbackIOWrapper(pbar.update%2C%20fi)%2C%20fo)%0A%0A%0Adef%20copy_concurrent(src%3A%20pathlib.Path%2C%20dest%3A%20pathlib.Path)%20-%3E%20None%3A%0A%20%20%20%20from%20multiprocessing.pool%20import%20ThreadPool%0A%0A%20%20%20%20class%20MultithreadedCopier%3A%0A%20%20%20%20%20%20%20%20def%20__init__(self%2C%20max_threads)%3A%0A%20%20%20%20%20%20%20%20%20%20%20%20self.pool%20%3D%20ThreadPool(max_threads)%0A%0A%20%20%20%20%20%20%20%20def%20copy(self%2C%20source%2C%20dest)%3A%0A%20%20%20%20%20%20%20%20%20%20%20%20self.pool.apply_async(shutil.copy2%2C%20args%3D(source%2C%20dest))%0A%0A%20%20%20%20%20%20%20%20def%20__enter__(self)%3A%0A%20%20%20%20%20%20%20%20%20%20%20%20return%20self%0A%0A%20%20%20%20%20%20%20%20def%20__exit__(self%2C%20exc_type%2C%20exc_val%2C%20exc_tb)%3A%0A%20%20%20%20%20%20%20%20%20%20%20%20self.pool.close()%0A%20%20%20%20%20%20%20%20%20%20%20%20self.pool.join()%0A%0A%20%20%20%20with%20MultithreadedCopier(max_threads%3D48)%20as%20copier%3A%0A%20%20%20%20%20%20%20%20shutil.copytree(src%2C%20dest%2C%20copy_function%3Dcopier.copy%2C%20dirs_exist_ok%3DTrue)%0A%0A`,lang:`python`});var m=c(p,2);f(c(e(m)),{href:`https://cocodataset.org/#download`,rel:`nofollow`,children:(e,t)=>{l(),i(e,r(`https://cocodataset.org/#download`))},$$slots:{default:!0}}),l(),n(m);var h=c(m,2);u(h,{code:`%40app.function(%0A%20%20%20%20volumes%3D%7B%22%2Fvol%2F%22%3A%20volume%7D%2C%0A%20%20%20%20timeout%3D60%20*%2060%20*%205%2C%20%20%23%205%20hours%0A%20%20%20%20ephemeral_disk%3D600%20*%201024%2C%20%20%23%20600%20GiB%2C%0A)%0Adef%20_do_part(url%3A%20str)%20-%3E%20None%3A%0A%20%20%20%20start_monitoring_disk_space()%0A%20%20%20%20part%20%3D%20url.replace(%22http%3A%2F%2Fimages.cocodataset.org%2F%22%2C%20%22%22)%0A%20%20%20%20name%20%3D%20pathlib.Path(part).name.replace(%22.zip%22%2C%20%22%22)%0A%20%20%20%20zip_path%20%3D%20pathlib.Path(%22%2Ftmp%2F%22)%20%2F%20pathlib.Path(part).name%0A%20%20%20%20extract_tmp_path%20%3D%20pathlib.Path(%22%2Ftmp%22%2C%20name)%0A%20%20%20%20dest_path%20%3D%20pathlib.Path(%22%2Fvol%2Fcoco%2F%22%2C%20name)%0A%0A%20%20%20%20print(f%22Downloading%20%7Bname%7D%20from%20%7Burl%7D%22)%0A%20%20%20%20command%20%3D%20f%22wget%20%7Burl%7D%20-O%20%7Bzip_path%7D%22%0A%20%20%20%20subprocess.run(command%2C%20shell%3DTrue%2C%20check%3DTrue)%0A%20%20%20%20print(f%22Download%20of%20%7Bname%7D%20completed%20successfully.%22)%0A%20%20%20%20extract_tmp_path.mkdir()%0A%20%20%20%20extractall(%0A%20%20%20%20%20%20%20%20zip_path%2C%20extract_tmp_path%2C%20desc%3Df%22Extracting%20%7Bname%7D%22%0A%20%20%20%20)%20%20%23%20extract%20into%20%2Ftmp%2F%0A%20%20%20%20zip_path.unlink()%20%20%23%20free%20up%20disk%20space%20by%20deleting%20the%20zip%0A%20%20%20%20print(f%22Copying%20extract%20%7Bname%7D%20data%20to%20volume.%22)%0A%20%20%20%20copy_concurrent(extract_tmp_path%2C%20dest_path)%20%20%23%20copy%20from%20%2Ftmp%2F%20into%20mounted%20volume%0A%0A`,lang:`python`}),u(c(h,4),{code:`%40app.function(%0A%20%20%20%20timeout%3D60%20*%2060%20*%205%2C%20%20%23%205%20hours%0A)%0Adef%20import_transform_load()%20-%3E%20None%3A%0A%20%20%20%20print(%22Starting%20import%2C%20transform%2C%20and%20load%20of%20COCO%20dataset%22)%0A%20%20%20%20list(%0A%20%20%20%20%20%20%20%20_do_part.map(%0A%20%20%20%20%20%20%20%20%20%20%20%20%5B%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%22http%3A%2F%2Fimages.cocodataset.org%2Fzips%2Ftrain2017.zip%22%2C%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%22http%3A%2F%2Fimages.cocodataset.org%2Fzips%2Fval2017.zip%22%2C%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%22http%3A%2F%2Fimages.cocodataset.org%2Fzips%2Ftest2017.zip%22%2C%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%22http%3A%2F%2Fimages.cocodataset.org%2Fzips%2Funlabeled2017.zip%22%2C%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%22http%3A%2F%2Fimages.cocodataset.org%2Fannotations%2Fannotations_trainval2017.zip%22%2C%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%22http%3A%2F%2Fimages.cocodataset.org%2Fannotations%2Fstuff_annotations_trainval2017.zip%22%2C%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%22http%3A%2F%2Fimages.cocodataset.org%2Fannotations%2Fimage_info_test2017.zip%22%2C%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%22http%3A%2F%2Fimages.cocodataset.org%2Fannotations%2Fimage_info_unlabeled2017.zip%22%2C%0A%20%20%20%20%20%20%20%20%20%20%20%20%5D%0A%20%20%20%20%20%20%20%20)%0A%20%20%20%20)%0A%20%20%20%20print(%22%E2%9C%85%20Done%22)%0A`,lang:`python`}),i(t,o)},$$slots:{default:!0}}))}export{v as default,p as metadata};
//# sourceMappingURL=CEP__6bu.js.map
