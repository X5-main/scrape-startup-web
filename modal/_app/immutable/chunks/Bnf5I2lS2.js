(function(){try{var e=typeof window<`u`?window:typeof global<`u`?global:typeof globalThis<`u`?globalThis:typeof self<`u`?self:{};e.SENTRY_RELEASE={id:`f99fcf9f0a844cc9bd13fdc8e5782b84`};var t=new e.Error().stack;t&&(e._sentryDebugIds=e._sentryDebugIds||{},e._sentryDebugIds[t]=`717ebe3d-eb45-435f-a9da-d6da7cf7a314`,e._sentryDebugIdIdentifier=`sentry-dbid-717ebe3d-eb45-435f-a9da-d6da7cf7a314`)}catch{}})();import{$t as e,St as t,Tn as n,Tt as r,bt as i,c as a,d as o,en as s,tn as c,wn as l}from"./F_ixKBiO.js";import"./B1sc9Zdx.js";import"./Bb2deiU3.js";import{t as u}from"./BILrvr3I.js";import{t as d}from"./B4L_if842.js";import{t as f}from"./DeWGVqas2.js";var p={toc:[],rawContent:`This script demonstrated how to ingest the https://github.com/RosettaCommons/RoseTTAFold protein-folding
model's dataset into a mounted volume.

The dataset is over 2 TiB when decompressed to the runtime of this script is quite long.
ref: https://github.com/RosettaCommons/RoseTTAFold/issues/132.

It is recommended to iterate on this code from a modal.Function running Jupyter server.
This better supports experimentation and maintains state in the face of errors:
11_notebooks/jupyter_inside_modal.py

\`\`\`python
import os
import pathlib
import shutil
import subprocess
import sys
import tarfile
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
image = modal.Image.debian_slim().apt_install("wget")
app = modal.App("example-rosettafold", image=image)


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


def decompress_tar_gz(file_path: pathlib.Path, extract_dir: pathlib.Path) -> None:
    print(f"Decompressing {file_path} into {extract_dir}...")
    with tarfile.open(file_path, "r:gz") as tar:
        tar.extractall(path=extract_dir)
        print(f"Decompressed {file_path} to {extract_dir}")


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
    volumes={"/mnt/": volume},
    timeout=60 * 60 * 24,
    ephemeral_disk=2560 * 1024,
)
def _do_part(url: str) -> None:
    name = url.split("/")[-1].replace(".tar.gz", "")
    print(f"Downloading {name}")
    compressed = pathlib.Path("/tmp", name)
    cmd = f"wget {url} -O {compressed}"
    p = subprocess.Popen(cmd, shell=True)
    returncode = p.wait()
    if returncode != 0:
        raise RuntimeError(f"Error in downloading. {p.args!r} failed {returncode=}")
    decompressed = pathlib.Path("/tmp/rosettafold/", name)

    # Decompression is much faster against the container's local SSD disk
    # compared with against the mounted volume. So we first compress into /tmp/.
    print(f"Decompressing {compressed} into {decompressed}.")
    decompress_tar_gz(compressed, decompressed)
    print(
        f"✅ Decompressed {compressed} into {decompressed}. Now deleting it to free up disk.."
    )
    compressed.unlink()  # delete compressed file to free up disk

    # Finally, we move the decompressed data from /tmp/ into the mounted volume.
    # There are a large mount of files to copy so this step takes a while.
    dest = pathlib.Path("/mnt/rosettafold/")
    copy_concurrent(decompressed, dest)
    shutil.rmtree(decompressed, ignore_errors=True)  # free up disk
    print(f"Dataset part {url} is loaded ✅")


@app.function(
    volumes={"/mnt/": volume},
    # Timeout for this Function is set at the maximum, 24 hours,
    # because downloading, decompressing and storing almost 2 TiB of
    # files takes a long time.
    timeout=60 * 60 * 24,
)
def import_transform_load() -> None:
    # NOTE:
    # The mmseq.com server upload speed is quite slow so this download takes a while.
    # The download speed is also quite variable, sometimes taking over 5 hours.
    list(
        _do_part.map(
            [
                "http://wwwuser.gwdg.de/~compbiol/uniclust/2020_06/UniRef30_2020_06_hhsuite.tar.gz",
                "https://bfd.mmseqs.com/bfd_metaclust_clu_complete_id30_c90_final_seq.sorted_opt.tar.gz",
                "https://files.ipd.uw.edu/pub/RoseTTAFold/pdb100_2021Mar03.tar.gz",
            ]
        )
    )
    print("Dataset is loaded ✅")

\`\`\`
`,meta:{description:`This script demonstrated how to ingest the https://github.com/RosettaCommons/RoseTTAFold protein-folding model’s dataset into a mounted volume.`}},{toc:m,rawContent:h,meta:g}=p,_=t(`<p>This script demonstrated how to ingest the <!> protein-folding
model’s dataset into a mounted volume.</p> <p>The dataset is over 2 TiB when decompressed to the runtime of this script is quite long.
ref: <!>.</p> <p>It is recommended to iterate on this code from a modal.Function running Jupyter server.
This better supports experimentation and maintains state in the face of errors:
11_notebooks/jupyter_inside_modal.py</p> <!>`,1);function v(t,m){let h=a(m,[`children`,`$$slots`,`$$events`,`$$legacy`]);d(t,o(()=>h,()=>p,{children:(t,a)=>{var o=_(),d=s(o);f(c(e(d)),{href:`https://github.com/RosettaCommons/RoseTTAFold`,rel:`nofollow`,children:(e,t)=>{l(),i(e,r(`https://github.com/RosettaCommons/RoseTTAFold`))},$$slots:{default:!0}}),l(),n(d);var p=c(d,2);f(c(e(p)),{href:`https://github.com/RosettaCommons/RoseTTAFold/issues/132`,rel:`nofollow`,children:(e,t)=>{l(),i(e,r(`https://github.com/RosettaCommons/RoseTTAFold/issues/132`))},$$slots:{default:!0}}),l(),n(p),u(c(p,4),{code:`import%20os%0Aimport%20pathlib%0Aimport%20shutil%0Aimport%20subprocess%0Aimport%20sys%0Aimport%20tarfile%0Aimport%20threading%0Aimport%20time%0A%0Aimport%20modal%0A%0Abucket_creds%20%3D%20modal.Secret.from_name(%0A%20%20%20%20%22aws-s3-modal-examples-datasets%22%2C%20environment_name%3D%22main%22%0A)%0Abucket_name%20%3D%20%22modal-examples-datasets%22%0Avolume%20%3D%20modal.CloudBucketMount(%0A%20%20%20%20bucket_name%2C%0A%20%20%20%20secret%3Dbucket_creds%2C%0A)%0Aimage%20%3D%20modal.Image.debian_slim().apt_install(%22wget%22)%0Aapp%20%3D%20modal.App(%22example-rosettafold%22%2C%20image%3Dimage)%0A%0A%0Adef%20start_monitoring_disk_space(interval%3A%20int%20%3D%2030)%20-%3E%20None%3A%0A%20%20%20%20%22%22%22Start%20monitoring%20the%20disk%20space%20in%20a%20separate%20thread.%22%22%22%0A%20%20%20%20task_id%20%3D%20os.environ%5B%22MODAL_TASK_ID%22%5D%0A%0A%20%20%20%20def%20log_disk_space(interval%3A%20int)%20-%3E%20None%3A%0A%20%20%20%20%20%20%20%20while%20True%3A%0A%20%20%20%20%20%20%20%20%20%20%20%20statvfs%20%3D%20os.statvfs(%22%2F%22)%0A%20%20%20%20%20%20%20%20%20%20%20%20free_space%20%3D%20statvfs.f_frsize%20*%20statvfs.f_bavail%0A%20%20%20%20%20%20%20%20%20%20%20%20print(%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20f%22%7Btask_id%7D%20free%20disk%20space%3A%20%7Bfree_space%20%2F%20(1024**3)%3A.2f%7D%20GB%22%2C%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20file%3Dsys.stderr%2C%0A%20%20%20%20%20%20%20%20%20%20%20%20)%0A%20%20%20%20%20%20%20%20%20%20%20%20time.sleep(interval)%0A%0A%20%20%20%20monitoring_thread%20%3D%20threading.Thread(target%3Dlog_disk_space%2C%20args%3D(interval%2C))%0A%20%20%20%20monitoring_thread.daemon%20%3D%20True%0A%20%20%20%20monitoring_thread.start()%0A%0A%0Adef%20decompress_tar_gz(file_path%3A%20pathlib.Path%2C%20extract_dir%3A%20pathlib.Path)%20-%3E%20None%3A%0A%20%20%20%20print(f%22Decompressing%20%7Bfile_path%7D%20into%20%7Bextract_dir%7D...%22)%0A%20%20%20%20with%20tarfile.open(file_path%2C%20%22r%3Agz%22)%20as%20tar%3A%0A%20%20%20%20%20%20%20%20tar.extractall(path%3Dextract_dir)%0A%20%20%20%20%20%20%20%20print(f%22Decompressed%20%7Bfile_path%7D%20to%20%7Bextract_dir%7D%22)%0A%0A%0Adef%20copy_concurrent(src%3A%20pathlib.Path%2C%20dest%3A%20pathlib.Path)%20-%3E%20None%3A%0A%20%20%20%20%22%22%22%0A%20%20%20%20A%20modified%20shutil.copytree%20which%20copies%20in%20parallel%20to%20increase%20bandwidth%0A%20%20%20%20and%20compensate%20for%20the%20increased%20IO%20latency%20of%20volume%20mounts.%0A%20%20%20%20%22%22%22%0A%20%20%20%20from%20multiprocessing.pool%20import%20ThreadPool%0A%0A%20%20%20%20class%20MultithreadedCopier%3A%0A%20%20%20%20%20%20%20%20def%20__init__(self%2C%20max_threads)%3A%0A%20%20%20%20%20%20%20%20%20%20%20%20self.pool%20%3D%20ThreadPool(max_threads)%0A%20%20%20%20%20%20%20%20%20%20%20%20self.copy_jobs%20%3D%20%5B%5D%0A%0A%20%20%20%20%20%20%20%20def%20copy(self%2C%20source%2C%20dest)%3A%0A%20%20%20%20%20%20%20%20%20%20%20%20res%20%3D%20self.pool.apply_async(%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20shutil.copy2%2C%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20args%3D(source%2C%20dest)%2C%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20callback%3Dlambda%20r%3A%20print(f%22%7Bsource%7D%20copied%20to%20%7Bdest%7D%22)%2C%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%23%20NOTE%3A%20this%20should%20%60raise%60%20an%20exception%20for%20proper%20reliability.%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20error_callback%3Dlambda%20exc%3A%20print(%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20f%22%7Bsource%7D%20failed%3A%20%7Bexc%7D%22%2C%20file%3Dsys.stderr%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20)%2C%0A%20%20%20%20%20%20%20%20%20%20%20%20)%0A%20%20%20%20%20%20%20%20%20%20%20%20self.copy_jobs.append(res)%0A%0A%20%20%20%20%20%20%20%20def%20__enter__(self)%3A%0A%20%20%20%20%20%20%20%20%20%20%20%20return%20self%0A%0A%20%20%20%20%20%20%20%20def%20__exit__(self%2C%20exc_type%2C%20exc_val%2C%20exc_tb)%3A%0A%20%20%20%20%20%20%20%20%20%20%20%20self.pool.close()%0A%20%20%20%20%20%20%20%20%20%20%20%20self.pool.join()%0A%0A%20%20%20%20with%20MultithreadedCopier(max_threads%3D24)%20as%20copier%3A%0A%20%20%20%20%20%20%20%20shutil.copytree(src%2C%20dest%2C%20copy_function%3Dcopier.copy%2C%20dirs_exist_ok%3DTrue)%0A%0A%0A%40app.function(%0A%20%20%20%20volumes%3D%7B%22%2Fmnt%2F%22%3A%20volume%7D%2C%0A%20%20%20%20timeout%3D60%20*%2060%20*%2024%2C%0A%20%20%20%20ephemeral_disk%3D2560%20*%201024%2C%0A)%0Adef%20_do_part(url%3A%20str)%20-%3E%20None%3A%0A%20%20%20%20name%20%3D%20url.split(%22%2F%22)%5B-1%5D.replace(%22.tar.gz%22%2C%20%22%22)%0A%20%20%20%20print(f%22Downloading%20%7Bname%7D%22)%0A%20%20%20%20compressed%20%3D%20pathlib.Path(%22%2Ftmp%22%2C%20name)%0A%20%20%20%20cmd%20%3D%20f%22wget%20%7Burl%7D%20-O%20%7Bcompressed%7D%22%0A%20%20%20%20p%20%3D%20subprocess.Popen(cmd%2C%20shell%3DTrue)%0A%20%20%20%20returncode%20%3D%20p.wait()%0A%20%20%20%20if%20returncode%20!%3D%200%3A%0A%20%20%20%20%20%20%20%20raise%20RuntimeError(f%22Error%20in%20downloading.%20%7Bp.args!r%7D%20failed%20%7Breturncode%3D%7D%22)%0A%20%20%20%20decompressed%20%3D%20pathlib.Path(%22%2Ftmp%2Frosettafold%2F%22%2C%20name)%0A%0A%20%20%20%20%23%20Decompression%20is%20much%20faster%20against%20the%20container's%20local%20SSD%20disk%0A%20%20%20%20%23%20compared%20with%20against%20the%20mounted%20volume.%20So%20we%20first%20compress%20into%20%2Ftmp%2F.%0A%20%20%20%20print(f%22Decompressing%20%7Bcompressed%7D%20into%20%7Bdecompressed%7D.%22)%0A%20%20%20%20decompress_tar_gz(compressed%2C%20decompressed)%0A%20%20%20%20print(%0A%20%20%20%20%20%20%20%20f%22%E2%9C%85%20Decompressed%20%7Bcompressed%7D%20into%20%7Bdecompressed%7D.%20Now%20deleting%20it%20to%20free%20up%20disk..%22%0A%20%20%20%20)%0A%20%20%20%20compressed.unlink()%20%20%23%20delete%20compressed%20file%20to%20free%20up%20disk%0A%0A%20%20%20%20%23%20Finally%2C%20we%20move%20the%20decompressed%20data%20from%20%2Ftmp%2F%20into%20the%20mounted%20volume.%0A%20%20%20%20%23%20There%20are%20a%20large%20mount%20of%20files%20to%20copy%20so%20this%20step%20takes%20a%20while.%0A%20%20%20%20dest%20%3D%20pathlib.Path(%22%2Fmnt%2Frosettafold%2F%22)%0A%20%20%20%20copy_concurrent(decompressed%2C%20dest)%0A%20%20%20%20shutil.rmtree(decompressed%2C%20ignore_errors%3DTrue)%20%20%23%20free%20up%20disk%0A%20%20%20%20print(f%22Dataset%20part%20%7Burl%7D%20is%20loaded%20%E2%9C%85%22)%0A%0A%0A%40app.function(%0A%20%20%20%20volumes%3D%7B%22%2Fmnt%2F%22%3A%20volume%7D%2C%0A%20%20%20%20%23%20Timeout%20for%20this%20Function%20is%20set%20at%20the%20maximum%2C%2024%20hours%2C%0A%20%20%20%20%23%20because%20downloading%2C%20decompressing%20and%20storing%20almost%202%20TiB%20of%0A%20%20%20%20%23%20files%20takes%20a%20long%20time.%0A%20%20%20%20timeout%3D60%20*%2060%20*%2024%2C%0A)%0Adef%20import_transform_load()%20-%3E%20None%3A%0A%20%20%20%20%23%20NOTE%3A%0A%20%20%20%20%23%20The%20mmseq.com%20server%20upload%20speed%20is%20quite%20slow%20so%20this%20download%20takes%20a%20while.%0A%20%20%20%20%23%20The%20download%20speed%20is%20also%20quite%20variable%2C%20sometimes%20taking%20over%205%20hours.%0A%20%20%20%20list(%0A%20%20%20%20%20%20%20%20_do_part.map(%0A%20%20%20%20%20%20%20%20%20%20%20%20%5B%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%22http%3A%2F%2Fwwwuser.gwdg.de%2F~compbiol%2Funiclust%2F2020_06%2FUniRef30_2020_06_hhsuite.tar.gz%22%2C%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%22https%3A%2F%2Fbfd.mmseqs.com%2Fbfd_metaclust_clu_complete_id30_c90_final_seq.sorted_opt.tar.gz%22%2C%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%22https%3A%2F%2Ffiles.ipd.uw.edu%2Fpub%2FRoseTTAFold%2Fpdb100_2021Mar03.tar.gz%22%2C%0A%20%20%20%20%20%20%20%20%20%20%20%20%5D%0A%20%20%20%20%20%20%20%20)%0A%20%20%20%20)%0A%20%20%20%20print(%22Dataset%20is%20loaded%20%E2%9C%85%22)%0A`,lang:`python`}),i(t,o)},$$slots:{default:!0}}))}export{v as default,p as metadata};
//# sourceMappingURL=Bnf5I2lS2.js.map
