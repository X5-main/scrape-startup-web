(function(){try{var e=typeof window<`u`?window:typeof global<`u`?global:typeof globalThis<`u`?globalThis:typeof self<`u`?self:{};e.SENTRY_RELEASE={id:`f99fcf9f0a844cc9bd13fdc8e5782b84`};var t=new e.Error().stack;t&&(e._sentryDebugIds=e._sentryDebugIds||{},e._sentryDebugIds[t]=`8e872368-455a-4c21-88f8-ed5e4f719147`,e._sentryDebugIdIdentifier=`sentry-dbid-8e872368-455a-4c21-88f8-ed5e4f719147`)}catch{}})();import{$t as e,St as t,Tn as n,Tt as r,bt as i,c as a,d as o,en as s,tn as c,wn as l}from"./F_ixKBiO.js";import"./B1sc9Zdx.js";import"./Bb2deiU3.js";import{t as u}from"./BILrvr3I.js";import{t as d}from"./B4L_if842.js";import{t as f}from"./DeWGVqas2.js";var p={toc:[],rawContent:`https://laion.ai/blog/laion-400-open-dataset/

LAION-400 is a large dataset of 400M English (image, text) pairs.

As described on the dataset's homepage, it consists of 32 .parquet files
containing dataset metadata *but not* the image data itself.

After downloading the .parquet files, this script fans out 32 worker jobs
to process a single .parquet file. Processing involves fetch and transform
of image data into 256 * 256 square JPEGs.

This script is loosely based off the following instructions:
https://github.com/rom1504/img2dataset/blob/main/dataset_examples/laion400m.md

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

import modal

bucket_creds = modal.Secret.from_name(
    "aws-s3-modal-examples-datasets", environment_name="main"
)

bucket_name = "modal-examples-datasets"

volume = modal.CloudBucketMount(
    bucket_name,
    secret=bucket_creds,
)

image = (
    modal.Image.debian_slim().apt_install("wget").uv_pip_install("img2dataset~=1.45.0")
)

app = modal.App("example-laion400", image=image)


def start_monitoring_disk_space(interval: int = 30) -> None:
    """Start monitoring the disk space in a separate thread, printing info to stdout"""
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


@app.function(
    volumes={"/mnt": volume},
    # 20 hours — img2dataset is extremely slow to work through all images.
    timeout=60 * 60 * 20,
    ephemeral_disk=512 * 1024,
)
def run_img2dataset_on_part(
    i: int,
    partfile: str,
) -> None:
    start_monitoring_disk_space(interval=60)
    while not pathlib.Path(partfile).exists():
        print(f"{partfile} not yet visible...", file=sys.stderr)
        time.sleep(1)
    # Each part works in its own subdirectory because img2dataset creates a working
    # tmpdir at <output_folder>/_tmp and we don't want consistency issues caused by
    # all concurrently processing parts read/writing from the same temp directory.
    tmp_laion400m_data_path = pathlib.Path(f"/tmp/laion400/laion400m-data/{i}/")
    tmp_laion400m_data_path.mkdir(exist_ok=True, parents=True)
    # Increasing retries comes at a *large* performance cost.
    retries = 0
    # TODO: Support --incremental mode. https://github.com/rom1504/img2dataset?tab=readme-ov-file#incremental-mode
    command = (
        f'img2dataset --url_list {partfile} --input_format "parquet" '
        '--url_col "URL" --caption_col "TEXT" --output_format webdataset '
        f"--output_folder {tmp_laion400m_data_path} --processes_count 16 --thread_count 128 --image_size 256 "
        f'--retries={retries} --save_additional_columns \\'["NSFW","similarity","LICENSE"]\\' --enable_wandb False'
    )
    print(f"Running img2dataset command: \\n\\n{command}")
    subprocess.run(command, shell=True, check=True)
    print("Completed img2dataset, copying into mounted volume...")
    laion400m_data_path = pathlib.Path("/mnt/laion400/laion400m-data/")
    copy_concurrent(tmp_laion400m_data_path, laion400m_data_path)


@app.function(
    volumes={"/mnt": volume},
    timeout=60 * 60 * 16,  # 16 hours
)
def import_transform_load() -> None:
    start_monitoring_disk_space()
    # We initially download into a tmp directory outside of the volume to avoid
    # any filesystem incompatibilities between the \`wget\` application and the bucket
    # filesystem mount.
    tmp_laion400m_meta_path = pathlib.Path("/tmp/laion400/laion400m-meta")
    laion400m_meta_path = pathlib.Path("/mnt/laion400/laion400m-meta")
    if not laion400m_meta_path.exists():
        laion400m_meta_path.mkdir(parents=True, exist_ok=True)
        # WARNING: We skip the certificate check for the-eye.eu because its TLS certificate expired as of mid-May 2024.
        subprocess.run(
            f"wget -l1 -r --no-check-certificate --no-parent https://the-eye.eu/public/AI/cah/laion400m-met-release/laion400m-meta/ -P {tmp_laion400m_meta_path}",
            shell=True,
            check=True,
        )

        parquet_files = list(tmp_laion400m_meta_path.glob("**/*.parquet"))
        print(
            f"Downloaded {len(parquet_files)} parquet files into {tmp_laion400m_meta_path}."
        )
        # Perform a simple copy operation to move the data into the bucket.
        copy_concurrent(tmp_laion400m_meta_path, laion400m_meta_path)

    parquet_files = list(laion400m_meta_path.glob("**/*.parquet"))
    print(f"Stored {len(parquet_files)} parquet files into {laion400m_meta_path}.")
    print(f"Spawning {len(parquet_files)} to enrich dataset...")
    list(run_img2dataset_on_part.starmap((i, f) for i, f in enumerate(parquet_files)))

\`\`\`
`,meta:{description:`https://laion.ai/blog/laion-400-open-dataset/`}},{toc:m,rawContent:h,meta:g}=p,_=t(`<p><!></p> <p>LAION-400 is a large dataset of 400M English (image, text) pairs.</p> <p>As described on the dataset’s homepage, it consists of 32 .parquet files
containing dataset metadata <em>but not</em> the image data itself.</p> <p>After downloading the .parquet files, this script fans out 32 worker jobs
to process a single .parquet file. Processing involves fetch and transform
of image data into 256 * 256 square JPEGs.</p> <p>This script is loosely based off the following instructions: <!></p> <p>It is recommended to iterate on this code from a modal.Function running Jupyter server.
This better supports experimentation and maintains state in the face of errors:
11_notebooks/jupyter_inside_modal.py</p> <!>`,1);function v(t,m){let h=a(m,[`children`,`$$slots`,`$$events`,`$$legacy`]);d(t,o(()=>h,()=>p,{children:(t,a)=>{var o=_(),d=s(o);f(e(d),{href:`https://laion.ai/blog/laion-400-open-dataset/`,rel:`nofollow`,children:(e,t)=>{l(),i(e,r(`https://laion.ai/blog/laion-400-open-dataset/`))},$$slots:{default:!0}}),n(d);var p=c(d,8);f(c(e(p)),{href:`https://github.com/rom1504/img2dataset/blob/main/dataset_examples/laion400m.md`,rel:`nofollow`,children:(e,t)=>{l(),i(e,r(`https://github.com/rom1504/img2dataset/blob/main/dataset_examples/laion400m.md`))},$$slots:{default:!0}}),n(p),u(c(p,4),{code:`import%20os%0Aimport%20pathlib%0Aimport%20shutil%0Aimport%20subprocess%0Aimport%20sys%0Aimport%20threading%0Aimport%20time%0A%0Aimport%20modal%0A%0Abucket_creds%20%3D%20modal.Secret.from_name(%0A%20%20%20%20%22aws-s3-modal-examples-datasets%22%2C%20environment_name%3D%22main%22%0A)%0A%0Abucket_name%20%3D%20%22modal-examples-datasets%22%0A%0Avolume%20%3D%20modal.CloudBucketMount(%0A%20%20%20%20bucket_name%2C%0A%20%20%20%20secret%3Dbucket_creds%2C%0A)%0A%0Aimage%20%3D%20(%0A%20%20%20%20modal.Image.debian_slim().apt_install(%22wget%22).uv_pip_install(%22img2dataset~%3D1.45.0%22)%0A)%0A%0Aapp%20%3D%20modal.App(%22example-laion400%22%2C%20image%3Dimage)%0A%0A%0Adef%20start_monitoring_disk_space(interval%3A%20int%20%3D%2030)%20-%3E%20None%3A%0A%20%20%20%20%22%22%22Start%20monitoring%20the%20disk%20space%20in%20a%20separate%20thread%2C%20printing%20info%20to%20stdout%22%22%22%0A%20%20%20%20task_id%20%3D%20os.environ%5B%22MODAL_TASK_ID%22%5D%0A%0A%20%20%20%20def%20log_disk_space(interval%3A%20int)%20-%3E%20None%3A%0A%20%20%20%20%20%20%20%20while%20True%3A%0A%20%20%20%20%20%20%20%20%20%20%20%20statvfs%20%3D%20os.statvfs(%22%2F%22)%0A%20%20%20%20%20%20%20%20%20%20%20%20free_space%20%3D%20statvfs.f_frsize%20*%20statvfs.f_bavail%0A%20%20%20%20%20%20%20%20%20%20%20%20print(%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20f%22%7Btask_id%7D%20free%20disk%20space%3A%20%7Bfree_space%20%2F%20(1024**3)%3A.2f%7D%20GB%22%2C%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20file%3Dsys.stderr%2C%0A%20%20%20%20%20%20%20%20%20%20%20%20)%0A%20%20%20%20%20%20%20%20%20%20%20%20time.sleep(interval)%0A%0A%20%20%20%20monitoring_thread%20%3D%20threading.Thread(target%3Dlog_disk_space%2C%20args%3D(interval%2C))%0A%20%20%20%20monitoring_thread.daemon%20%3D%20True%0A%20%20%20%20monitoring_thread.start()%0A%0A%0Adef%20copy_concurrent(src%3A%20pathlib.Path%2C%20dest%3A%20pathlib.Path)%20-%3E%20None%3A%0A%20%20%20%20%22%22%22%0A%20%20%20%20A%20modified%20shutil.copytree%20which%20copies%20in%20parallel%20to%20increase%20bandwidth%0A%20%20%20%20and%20compensate%20for%20the%20increased%20IO%20latency%20of%20volume%20mounts.%0A%20%20%20%20%22%22%22%0A%20%20%20%20from%20multiprocessing.pool%20import%20ThreadPool%0A%0A%20%20%20%20class%20MultithreadedCopier%3A%0A%20%20%20%20%20%20%20%20def%20__init__(self%2C%20max_threads)%3A%0A%20%20%20%20%20%20%20%20%20%20%20%20self.pool%20%3D%20ThreadPool(max_threads)%0A%20%20%20%20%20%20%20%20%20%20%20%20self.copy_jobs%20%3D%20%5B%5D%0A%0A%20%20%20%20%20%20%20%20def%20copy(self%2C%20source%2C%20dest)%3A%0A%20%20%20%20%20%20%20%20%20%20%20%20res%20%3D%20self.pool.apply_async(%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20shutil.copy2%2C%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20args%3D(source%2C%20dest)%2C%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20callback%3Dlambda%20r%3A%20print(f%22%7Bsource%7D%20copied%20to%20%7Bdest%7D%22)%2C%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%23%20NOTE%3A%20this%20should%20%60raise%60%20an%20exception%20for%20proper%20reliability.%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20error_callback%3Dlambda%20exc%3A%20print(%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20f%22%7Bsource%7D%20failed%3A%20%7Bexc%7D%22%2C%20file%3Dsys.stderr%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20)%2C%0A%20%20%20%20%20%20%20%20%20%20%20%20)%0A%20%20%20%20%20%20%20%20%20%20%20%20self.copy_jobs.append(res)%0A%0A%20%20%20%20%20%20%20%20def%20__enter__(self)%3A%0A%20%20%20%20%20%20%20%20%20%20%20%20return%20self%0A%0A%20%20%20%20%20%20%20%20def%20__exit__(self%2C%20exc_type%2C%20exc_val%2C%20exc_tb)%3A%0A%20%20%20%20%20%20%20%20%20%20%20%20self.pool.close()%0A%20%20%20%20%20%20%20%20%20%20%20%20self.pool.join()%0A%0A%20%20%20%20with%20MultithreadedCopier(max_threads%3D24)%20as%20copier%3A%0A%20%20%20%20%20%20%20%20shutil.copytree(src%2C%20dest%2C%20copy_function%3Dcopier.copy%2C%20dirs_exist_ok%3DTrue)%0A%0A%0A%40app.function(%0A%20%20%20%20volumes%3D%7B%22%2Fmnt%22%3A%20volume%7D%2C%0A%20%20%20%20%23%2020%20hours%20%E2%80%94%20img2dataset%20is%20extremely%20slow%20to%20work%20through%20all%20images.%0A%20%20%20%20timeout%3D60%20*%2060%20*%2020%2C%0A%20%20%20%20ephemeral_disk%3D512%20*%201024%2C%0A)%0Adef%20run_img2dataset_on_part(%0A%20%20%20%20i%3A%20int%2C%0A%20%20%20%20partfile%3A%20str%2C%0A)%20-%3E%20None%3A%0A%20%20%20%20start_monitoring_disk_space(interval%3D60)%0A%20%20%20%20while%20not%20pathlib.Path(partfile).exists()%3A%0A%20%20%20%20%20%20%20%20print(f%22%7Bpartfile%7D%20not%20yet%20visible...%22%2C%20file%3Dsys.stderr)%0A%20%20%20%20%20%20%20%20time.sleep(1)%0A%20%20%20%20%23%20Each%20part%20works%20in%20its%20own%20subdirectory%20because%20img2dataset%20creates%20a%20working%0A%20%20%20%20%23%20tmpdir%20at%20%3Coutput_folder%3E%2F_tmp%20and%20we%20don't%20want%20consistency%20issues%20caused%20by%0A%20%20%20%20%23%20all%20concurrently%20processing%20parts%20read%2Fwriting%20from%20the%20same%20temp%20directory.%0A%20%20%20%20tmp_laion400m_data_path%20%3D%20pathlib.Path(f%22%2Ftmp%2Flaion400%2Flaion400m-data%2F%7Bi%7D%2F%22)%0A%20%20%20%20tmp_laion400m_data_path.mkdir(exist_ok%3DTrue%2C%20parents%3DTrue)%0A%20%20%20%20%23%20Increasing%20retries%20comes%20at%20a%20*large*%20performance%20cost.%0A%20%20%20%20retries%20%3D%200%0A%20%20%20%20%23%20TODO%3A%20Support%20--incremental%20mode.%20https%3A%2F%2Fgithub.com%2From1504%2Fimg2dataset%3Ftab%3Dreadme-ov-file%23incremental-mode%0A%20%20%20%20command%20%3D%20(%0A%20%20%20%20%20%20%20%20f'img2dataset%20--url_list%20%7Bpartfile%7D%20--input_format%20%22parquet%22%20'%0A%20%20%20%20%20%20%20%20'--url_col%20%22URL%22%20--caption_col%20%22TEXT%22%20--output_format%20webdataset%20'%0A%20%20%20%20%20%20%20%20f%22--output_folder%20%7Btmp_laion400m_data_path%7D%20--processes_count%2016%20--thread_count%20128%20--image_size%20256%20%22%0A%20%20%20%20%20%20%20%20f'--retries%3D%7Bretries%7D%20--save_additional_columns%20%5C'%5B%22NSFW%22%2C%22similarity%22%2C%22LICENSE%22%5D%5C'%20--enable_wandb%20False'%0A%20%20%20%20)%0A%20%20%20%20print(f%22Running%20img2dataset%20command%3A%20%5Cn%5Cn%7Bcommand%7D%22)%0A%20%20%20%20subprocess.run(command%2C%20shell%3DTrue%2C%20check%3DTrue)%0A%20%20%20%20print(%22Completed%20img2dataset%2C%20copying%20into%20mounted%20volume...%22)%0A%20%20%20%20laion400m_data_path%20%3D%20pathlib.Path(%22%2Fmnt%2Flaion400%2Flaion400m-data%2F%22)%0A%20%20%20%20copy_concurrent(tmp_laion400m_data_path%2C%20laion400m_data_path)%0A%0A%0A%40app.function(%0A%20%20%20%20volumes%3D%7B%22%2Fmnt%22%3A%20volume%7D%2C%0A%20%20%20%20timeout%3D60%20*%2060%20*%2016%2C%20%20%23%2016%20hours%0A)%0Adef%20import_transform_load()%20-%3E%20None%3A%0A%20%20%20%20start_monitoring_disk_space()%0A%20%20%20%20%23%20We%20initially%20download%20into%20a%20tmp%20directory%20outside%20of%20the%20volume%20to%20avoid%0A%20%20%20%20%23%20any%20filesystem%20incompatibilities%20between%20the%20%60wget%60%20application%20and%20the%20bucket%0A%20%20%20%20%23%20filesystem%20mount.%0A%20%20%20%20tmp_laion400m_meta_path%20%3D%20pathlib.Path(%22%2Ftmp%2Flaion400%2Flaion400m-meta%22)%0A%20%20%20%20laion400m_meta_path%20%3D%20pathlib.Path(%22%2Fmnt%2Flaion400%2Flaion400m-meta%22)%0A%20%20%20%20if%20not%20laion400m_meta_path.exists()%3A%0A%20%20%20%20%20%20%20%20laion400m_meta_path.mkdir(parents%3DTrue%2C%20exist_ok%3DTrue)%0A%20%20%20%20%20%20%20%20%23%20WARNING%3A%20We%20skip%20the%20certificate%20check%20for%20the-eye.eu%20because%20its%20TLS%20certificate%20expired%20as%20of%20mid-May%202024.%0A%20%20%20%20%20%20%20%20subprocess.run(%0A%20%20%20%20%20%20%20%20%20%20%20%20f%22wget%20-l1%20-r%20--no-check-certificate%20--no-parent%20https%3A%2F%2Fthe-eye.eu%2Fpublic%2FAI%2Fcah%2Flaion400m-met-release%2Flaion400m-meta%2F%20-P%20%7Btmp_laion400m_meta_path%7D%22%2C%0A%20%20%20%20%20%20%20%20%20%20%20%20shell%3DTrue%2C%0A%20%20%20%20%20%20%20%20%20%20%20%20check%3DTrue%2C%0A%20%20%20%20%20%20%20%20)%0A%0A%20%20%20%20%20%20%20%20parquet_files%20%3D%20list(tmp_laion400m_meta_path.glob(%22**%2F*.parquet%22))%0A%20%20%20%20%20%20%20%20print(%0A%20%20%20%20%20%20%20%20%20%20%20%20f%22Downloaded%20%7Blen(parquet_files)%7D%20parquet%20files%20into%20%7Btmp_laion400m_meta_path%7D.%22%0A%20%20%20%20%20%20%20%20)%0A%20%20%20%20%20%20%20%20%23%20Perform%20a%20simple%20copy%20operation%20to%20move%20the%20data%20into%20the%20bucket.%0A%20%20%20%20%20%20%20%20copy_concurrent(tmp_laion400m_meta_path%2C%20laion400m_meta_path)%0A%0A%20%20%20%20parquet_files%20%3D%20list(laion400m_meta_path.glob(%22**%2F*.parquet%22))%0A%20%20%20%20print(f%22Stored%20%7Blen(parquet_files)%7D%20parquet%20files%20into%20%7Blaion400m_meta_path%7D.%22)%0A%20%20%20%20print(f%22Spawning%20%7Blen(parquet_files)%7D%20to%20enrich%20dataset...%22)%0A%20%20%20%20list(run_img2dataset_on_part.starmap((i%2C%20f)%20for%20i%2C%20f%20in%20enumerate(parquet_files)))%0A`,lang:`python`}),i(t,o)},$$slots:{default:!0}}))}export{v as default,p as metadata};
//# sourceMappingURL=DRsVUFut.js.map
