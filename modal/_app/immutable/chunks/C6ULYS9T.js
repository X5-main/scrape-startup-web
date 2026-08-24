(function(){try{var e=typeof window<`u`?window:typeof global<`u`?global:typeof globalThis<`u`?globalThis:typeof self<`u`?self:{};e.SENTRY_RELEASE={id:`f99fcf9f0a844cc9bd13fdc8e5782b84`};var t=new e.Error().stack;t&&(e._sentryDebugIds=e._sentryDebugIds||{},e._sentryDebugIds[t]=`d92472ce-f2d6-4bf0-9ce4-cb1c0a3f6ce9`,e._sentryDebugIdIdentifier=`sentry-dbid-d92472ce-f2d6-4bf0-9ce4-cb1c0a3f6ce9`)}catch{}})();import{$t as e,St as t,Tn as n,Tt as r,bt as i,c as a,d as o,en as s,tn as c,wn as l}from"./F_ixKBiO.js";import"./B1sc9Zdx.js";import"./Bb2deiU3.js";import{t as u}from"./BILrvr3I.js";import{t as d}from"./B4L_if842.js";import{t as f}from"./DeWGVqas2.js";var p={toc:[],rawContent:`This scripts demonstrates how to ingest the famous ImageNet (https://www.image-net.org/)
dataset into a mounted volume.

It requires a Kaggle account's API token stored as a modal.Secret in order to download part
of the dataset from Kaggle's servers using the \`kaggle\` CLI.

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
image = modal.Image.debian_slim().apt_install("tree").uv_pip_install("kaggle", "tqdm")
app = modal.App(
    "example-imagenet",
    image=image,
    secrets=[modal.Secret.from_name("kaggle-api-token")],
)


def start_monitoring_disk_space(interval: int = 30) -> None:
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


def copy_concurrent(src: pathlib.Path, dest: pathlib.Path) -> None:
    """
    A modified shutil.copytree which copies in parallel to increase bandwidth
    and compensate for the increased IO latency of volume mounts.
    """
    from multiprocessing.pool import ThreadPool

    class MultithreadedCopier:
        def __init__(self, max_threads):
            self.pool = ThreadPool(max_threads)
            self.copy_jobs = []

        def copy(self, source, dest):
            res = self.pool.apply_async(
                shutil.copy2,
                args=(source, dest),
                callback=lambda r: print(f"{source} copied to {dest}"),
                # NOTE: this should \`raise\` an exception for proper reliability.
                error_callback=lambda exc: print(
                    f"{source} failed: {exc}", file=sys.stderr
                ),
            )
            self.copy_jobs.append(res)

        def __enter__(self):
            return self

        def __exit__(self, exc_type, exc_val, exc_tb):
            self.pool.close()
            self.pool.join()

    with MultithreadedCopier(max_threads=24) as copier:
        shutil.copytree(src, dest, copy_function=copier.copy, dirs_exist_ok=True)


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


@app.function(
    volumes={"/mnt/": volume},
    timeout=60 * 60 * 8,  # 8 hours,
    ephemeral_disk=1000 * 1024,  # 1TB
)
def import_transform_load() -> None:
    start_monitoring_disk_space()
    kaggle_api_token_data = os.environ["KAGGLE_API_TOKEN"]
    kaggle_token_filepath = pathlib.Path.home() / ".kaggle" / "kaggle.json"
    kaggle_token_filepath.parent.mkdir(exist_ok=True)
    kaggle_token_filepath.write_text(kaggle_api_token_data)

    tmp_path = pathlib.Path("/tmp/imagenet/")
    vol_path = pathlib.Path("/mnt/imagenet/")
    filename = "imagenet-object-localization-challenge.zip"
    dataset_path = vol_path / filename
    if dataset_path.exists():
        dataset_size = dataset_path.stat().st_size
        if dataset_size < (150 * 1024 * 1024 * 1024):
            dataset_size_gib = dataset_size / (1024 * 1024 * 1024)
            raise RuntimeError(
                f"Partial download of dataset .zip. It is {dataset_size_gib}GiB but should be > 150GiB"
            )
    else:
        subprocess.run(
            f"kaggle competitions download -c imagenet-object-localization-challenge --path {tmp_path}",
            shell=True,
            check=True,
        )
        vol_path.mkdir(exist_ok=True)
        shutil.copy(tmp_path / filename, dataset_path)

    # Extract dataset
    extracted_dataset_path = tmp_path / "extracted"
    extracted_dataset_path.mkdir(parents=True, exist_ok=True)
    print(f"Extracting .zip into {extracted_dataset_path}...")
    extractall(dataset_path, extracted_dataset_path)
    print(f"Extracted {dataset_path} to {extracted_dataset_path}")
    subprocess.run(f"tree -L 3 {extracted_dataset_path}", shell=True, check=True)

    final_dataset_path = vol_path / "extracted"
    final_dataset_path.mkdir(exist_ok=True)
    copy_concurrent(extracted_dataset_path, final_dataset_path)
    subprocess.run(f"tree -L 3 {final_dataset_path}", shell=True, check=True)
    print("Dataset is loaded ✅")

\`\`\`
`,meta:{description:`This scripts demonstrates how to ingest the famous ImageNet (https://www.image-net.org/) dataset into a mounted volume.`}},{toc:m,rawContent:h,meta:g}=p,_=t(`<p>This scripts demonstrates how to ingest the famous ImageNet (<!>)
dataset into a mounted volume.</p> <p>It requires a Kaggle account’s API token stored as a modal.Secret in order to download part
of the dataset from Kaggle’s servers using the <code>kaggle</code> CLI.</p> <p>It is recommended to iterate on this code from a modal.Function running Jupyter server.
This better supports experimentation and maintains state in the face of errors:
11_notebooks/jupyter_inside_modal.py</p> <!>`,1);function v(t,m){let h=a(m,[`children`,`$$slots`,`$$events`,`$$legacy`]);d(t,o(()=>h,()=>p,{children:(t,a)=>{var o=_(),d=s(o);f(c(e(d)),{href:`https://www.image-net.org/`,rel:`nofollow`,children:(e,t)=>{l(),i(e,r(`https://www.image-net.org/`))},$$slots:{default:!0}}),l(),n(d),u(c(d,6),{code:`import%20os%0Aimport%20pathlib%0Aimport%20shutil%0Aimport%20subprocess%0Aimport%20sys%0Aimport%20threading%0Aimport%20time%0Aimport%20zipfile%0A%0Aimport%20modal%0A%0Abucket_creds%20%3D%20modal.Secret.from_name(%0A%20%20%20%20%22aws-s3-modal-examples-datasets%22%2C%20environment_name%3D%22main%22%0A)%0Abucket_name%20%3D%20%22modal-examples-datasets%22%0Avolume%20%3D%20modal.CloudBucketMount(%0A%20%20%20%20bucket_name%2C%0A%20%20%20%20secret%3Dbucket_creds%2C%0A)%0Aimage%20%3D%20modal.Image.debian_slim().apt_install(%22tree%22).uv_pip_install(%22kaggle%22%2C%20%22tqdm%22)%0Aapp%20%3D%20modal.App(%0A%20%20%20%20%22example-imagenet%22%2C%0A%20%20%20%20image%3Dimage%2C%0A%20%20%20%20secrets%3D%5Bmodal.Secret.from_name(%22kaggle-api-token%22)%5D%2C%0A)%0A%0A%0Adef%20start_monitoring_disk_space(interval%3A%20int%20%3D%2030)%20-%3E%20None%3A%0A%20%20%20%20%22%22%22Start%20monitoring%20the%20disk%20space%20in%20a%20separate%20thread.%22%22%22%0A%20%20%20%20task_id%20%3D%20os.environ%5B%22MODAL_TASK_ID%22%5D%0A%0A%20%20%20%20def%20log_disk_space(interval%3A%20int)%20-%3E%20None%3A%0A%20%20%20%20%20%20%20%20while%20True%3A%0A%20%20%20%20%20%20%20%20%20%20%20%20statvfs%20%3D%20os.statvfs(%22%2F%22)%0A%20%20%20%20%20%20%20%20%20%20%20%20free_space%20%3D%20statvfs.f_frsize%20*%20statvfs.f_bavail%0A%20%20%20%20%20%20%20%20%20%20%20%20print(%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20f%22%7Btask_id%7D%20free%20disk%20space%3A%20%7Bfree_space%20%2F%20(1024**3)%3A.2f%7D%20GB%22%2C%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20file%3Dsys.stderr%2C%0A%20%20%20%20%20%20%20%20%20%20%20%20)%0A%20%20%20%20%20%20%20%20%20%20%20%20time.sleep(interval)%0A%0A%20%20%20%20monitoring_thread%20%3D%20threading.Thread(target%3Dlog_disk_space%2C%20args%3D(interval%2C))%0A%20%20%20%20monitoring_thread.daemon%20%3D%20True%0A%20%20%20%20monitoring_thread.start()%0A%0A%0Adef%20copy_concurrent(src%3A%20pathlib.Path%2C%20dest%3A%20pathlib.Path)%20-%3E%20None%3A%0A%20%20%20%20%22%22%22%0A%20%20%20%20A%20modified%20shutil.copytree%20which%20copies%20in%20parallel%20to%20increase%20bandwidth%0A%20%20%20%20and%20compensate%20for%20the%20increased%20IO%20latency%20of%20volume%20mounts.%0A%20%20%20%20%22%22%22%0A%20%20%20%20from%20multiprocessing.pool%20import%20ThreadPool%0A%0A%20%20%20%20class%20MultithreadedCopier%3A%0A%20%20%20%20%20%20%20%20def%20__init__(self%2C%20max_threads)%3A%0A%20%20%20%20%20%20%20%20%20%20%20%20self.pool%20%3D%20ThreadPool(max_threads)%0A%20%20%20%20%20%20%20%20%20%20%20%20self.copy_jobs%20%3D%20%5B%5D%0A%0A%20%20%20%20%20%20%20%20def%20copy(self%2C%20source%2C%20dest)%3A%0A%20%20%20%20%20%20%20%20%20%20%20%20res%20%3D%20self.pool.apply_async(%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20shutil.copy2%2C%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20args%3D(source%2C%20dest)%2C%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20callback%3Dlambda%20r%3A%20print(f%22%7Bsource%7D%20copied%20to%20%7Bdest%7D%22)%2C%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%23%20NOTE%3A%20this%20should%20%60raise%60%20an%20exception%20for%20proper%20reliability.%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20error_callback%3Dlambda%20exc%3A%20print(%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20f%22%7Bsource%7D%20failed%3A%20%7Bexc%7D%22%2C%20file%3Dsys.stderr%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20)%2C%0A%20%20%20%20%20%20%20%20%20%20%20%20)%0A%20%20%20%20%20%20%20%20%20%20%20%20self.copy_jobs.append(res)%0A%0A%20%20%20%20%20%20%20%20def%20__enter__(self)%3A%0A%20%20%20%20%20%20%20%20%20%20%20%20return%20self%0A%0A%20%20%20%20%20%20%20%20def%20__exit__(self%2C%20exc_type%2C%20exc_val%2C%20exc_tb)%3A%0A%20%20%20%20%20%20%20%20%20%20%20%20self.pool.close()%0A%20%20%20%20%20%20%20%20%20%20%20%20self.pool.join()%0A%0A%20%20%20%20with%20MultithreadedCopier(max_threads%3D24)%20as%20copier%3A%0A%20%20%20%20%20%20%20%20shutil.copytree(src%2C%20dest%2C%20copy_function%3Dcopier.copy%2C%20dirs_exist_ok%3DTrue)%0A%0A%0Adef%20extractall(fzip%2C%20dest%2C%20desc%3D%22Extracting%22)%3A%0A%20%20%20%20from%20tqdm.auto%20import%20tqdm%0A%20%20%20%20from%20tqdm.utils%20import%20CallbackIOWrapper%0A%0A%20%20%20%20dest%20%3D%20pathlib.Path(dest).expanduser()%0A%20%20%20%20with%20(%0A%20%20%20%20%20%20%20%20zipfile.ZipFile(fzip)%20as%20zipf%2C%0A%20%20%20%20%20%20%20%20tqdm(%0A%20%20%20%20%20%20%20%20%20%20%20%20desc%3Ddesc%2C%0A%20%20%20%20%20%20%20%20%20%20%20%20unit%3D%22B%22%2C%0A%20%20%20%20%20%20%20%20%20%20%20%20unit_scale%3DTrue%2C%0A%20%20%20%20%20%20%20%20%20%20%20%20unit_divisor%3D1024%2C%0A%20%20%20%20%20%20%20%20%20%20%20%20total%3Dsum(getattr(i%2C%20%22file_size%22%2C%200)%20for%20i%20in%20zipf.infolist())%2C%0A%20%20%20%20%20%20%20%20)%20as%20pbar%2C%0A%20%20%20%20)%3A%0A%20%20%20%20%20%20%20%20for%20i%20in%20zipf.infolist()%3A%0A%20%20%20%20%20%20%20%20%20%20%20%20if%20not%20getattr(i%2C%20%22file_size%22%2C%200)%3A%20%20%23%20directory%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20zipf.extract(i%2C%20os.fspath(dest))%0A%20%20%20%20%20%20%20%20%20%20%20%20else%3A%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20full_path%20%3D%20dest%20%2F%20i.filename%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20full_path.parent.mkdir(exist_ok%3DTrue%2C%20parents%3DTrue)%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20with%20zipf.open(i)%20as%20fi%2C%20open(full_path%2C%20%22wb%22)%20as%20fo%3A%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20shutil.copyfileobj(CallbackIOWrapper(pbar.update%2C%20fi)%2C%20fo)%0A%0A%0A%40app.function(%0A%20%20%20%20volumes%3D%7B%22%2Fmnt%2F%22%3A%20volume%7D%2C%0A%20%20%20%20timeout%3D60%20*%2060%20*%208%2C%20%20%23%208%20hours%2C%0A%20%20%20%20ephemeral_disk%3D1000%20*%201024%2C%20%20%23%201TB%0A)%0Adef%20import_transform_load()%20-%3E%20None%3A%0A%20%20%20%20start_monitoring_disk_space()%0A%20%20%20%20kaggle_api_token_data%20%3D%20os.environ%5B%22KAGGLE_API_TOKEN%22%5D%0A%20%20%20%20kaggle_token_filepath%20%3D%20pathlib.Path.home()%20%2F%20%22.kaggle%22%20%2F%20%22kaggle.json%22%0A%20%20%20%20kaggle_token_filepath.parent.mkdir(exist_ok%3DTrue)%0A%20%20%20%20kaggle_token_filepath.write_text(kaggle_api_token_data)%0A%0A%20%20%20%20tmp_path%20%3D%20pathlib.Path(%22%2Ftmp%2Fimagenet%2F%22)%0A%20%20%20%20vol_path%20%3D%20pathlib.Path(%22%2Fmnt%2Fimagenet%2F%22)%0A%20%20%20%20filename%20%3D%20%22imagenet-object-localization-challenge.zip%22%0A%20%20%20%20dataset_path%20%3D%20vol_path%20%2F%20filename%0A%20%20%20%20if%20dataset_path.exists()%3A%0A%20%20%20%20%20%20%20%20dataset_size%20%3D%20dataset_path.stat().st_size%0A%20%20%20%20%20%20%20%20if%20dataset_size%20%3C%20(150%20*%201024%20*%201024%20*%201024)%3A%0A%20%20%20%20%20%20%20%20%20%20%20%20dataset_size_gib%20%3D%20dataset_size%20%2F%20(1024%20*%201024%20*%201024)%0A%20%20%20%20%20%20%20%20%20%20%20%20raise%20RuntimeError(%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20f%22Partial%20download%20of%20dataset%20.zip.%20It%20is%20%7Bdataset_size_gib%7DGiB%20but%20should%20be%20%3E%20150GiB%22%0A%20%20%20%20%20%20%20%20%20%20%20%20)%0A%20%20%20%20else%3A%0A%20%20%20%20%20%20%20%20subprocess.run(%0A%20%20%20%20%20%20%20%20%20%20%20%20f%22kaggle%20competitions%20download%20-c%20imagenet-object-localization-challenge%20--path%20%7Btmp_path%7D%22%2C%0A%20%20%20%20%20%20%20%20%20%20%20%20shell%3DTrue%2C%0A%20%20%20%20%20%20%20%20%20%20%20%20check%3DTrue%2C%0A%20%20%20%20%20%20%20%20)%0A%20%20%20%20%20%20%20%20vol_path.mkdir(exist_ok%3DTrue)%0A%20%20%20%20%20%20%20%20shutil.copy(tmp_path%20%2F%20filename%2C%20dataset_path)%0A%0A%20%20%20%20%23%20Extract%20dataset%0A%20%20%20%20extracted_dataset_path%20%3D%20tmp_path%20%2F%20%22extracted%22%0A%20%20%20%20extracted_dataset_path.mkdir(parents%3DTrue%2C%20exist_ok%3DTrue)%0A%20%20%20%20print(f%22Extracting%20.zip%20into%20%7Bextracted_dataset_path%7D...%22)%0A%20%20%20%20extractall(dataset_path%2C%20extracted_dataset_path)%0A%20%20%20%20print(f%22Extracted%20%7Bdataset_path%7D%20to%20%7Bextracted_dataset_path%7D%22)%0A%20%20%20%20subprocess.run(f%22tree%20-L%203%20%7Bextracted_dataset_path%7D%22%2C%20shell%3DTrue%2C%20check%3DTrue)%0A%0A%20%20%20%20final_dataset_path%20%3D%20vol_path%20%2F%20%22extracted%22%0A%20%20%20%20final_dataset_path.mkdir(exist_ok%3DTrue)%0A%20%20%20%20copy_concurrent(extracted_dataset_path%2C%20final_dataset_path)%0A%20%20%20%20subprocess.run(f%22tree%20-L%203%20%7Bfinal_dataset_path%7D%22%2C%20shell%3DTrue%2C%20check%3DTrue)%0A%20%20%20%20print(%22Dataset%20is%20loaded%20%E2%9C%85%22)%0A`,lang:`python`}),i(t,o)},$$slots:{default:!0}}))}export{v as default,p as metadata};
//# sourceMappingURL=C6ULYS9T.js.map
