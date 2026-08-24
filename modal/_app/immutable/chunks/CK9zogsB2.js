(function(){try{var e=typeof window<`u`?window:typeof global<`u`?global:typeof globalThis<`u`?globalThis:typeof self<`u`?self:{};e.SENTRY_RELEASE={id:`f99fcf9f0a844cc9bd13fdc8e5782b84`};var t=new e.Error().stack;t&&(e._sentryDebugIds=e._sentryDebugIds||{},e._sentryDebugIds[t]=`7451ef6f-0efe-4607-85b7-4c25bfdf4132`,e._sentryDebugIdIdentifier=`sentry-dbid-7451ef6f-0efe-4607-85b7-4c25bfdf4132`)}catch{}})();import{$t as e,St as t,Tn as n,Tt as r,bt as i,c as a,d as o,en as s,tn as c,wn as l}from"./F_ixKBiO.js";import"./B1sc9Zdx.js";import"./Bb2deiU3.js";import{a as u,i as d,o as f}from"./CPby7b1n.js";import{t as p}from"./BILrvr3I.js";import{t as m}from"./B4L_if842.js";import{t as h}from"./DeWGVqas2.js";var g={crossLinks:[{text:`Work interactively in Modal Notebooks`,href:`/docs/guide/notebooks`},{text:`Store datasets on Volumes`,href:`/docs/guide/volumes`}],toc:[{depth:1,value:`Large dataset ingestion`,id:`large-dataset-ingestion`,children:[{depth:2,value:`Configure your Function for heavy disk usage`,id:`configure-your-function-for-heavy-disk-usage`,children:[{depth:3,value:`Prefer sharded or archived outputs for tiny-file datasets`,id:`prefer-sharded-or-archived-outputs-for-tiny-file-datasets`}]},{depth:2,value:`Experimentation`,id:`experimentation`},{depth:2,value:`Downloading`,id:`downloading`},{depth:2,value:`Transforming`,id:`transforming`},{depth:2,value:`Examples`,id:`examples`}]}],rawContent:`# Large dataset ingestion

This guide provides best practices for downloading, transforming, and storing large datasets within
Modal. A dataset is considered large if it contains hundreds of thousands of files and/or is over
100 GiB in size.

These guidelines ensure that large datasets can be ingested fully and reliably.

## Configure your Function for heavy disk usage

Large datasets should be downloaded and transformed using a \`modal.Function\` and stored
into a [Volume](/docs/guide/volumes).

This \`modal.Function\` should specify a large \`timeout\` because large dataset processing can take hours,
and it should request a larger ephemeral disk in cases where the dataset being downloaded and processed
is hundreds of GiBs.

\`\`\`python
volume = modal.Volume.from_name("datasets", create_if_missing=True)


@app.function(
    volumes={"/mnt/datasets": volume},
    ephemeral_disk=1000 * 1000,  # 1 TiB
    timeout=60 * 60 * 12,  # 12 hours

)
def download_and_transform() -> None:
    ...
    volume.commit()
\`\`\`

### Prefer sharded or archived outputs for tiny-file datasets

Volumes can store large datasets, but datasets made up of millions of tiny files are
still usually easier to ingest and consume when they are first grouped into larger artifacts such as
tar shards, WebDataset archives, Parquet files, or other batched formats.

See the [transforming](#transforming) section below for more details.

## Experimentation

Downloading and transforming large datasets can be fiddly. While iterating on a reliable ingestion program
you may want an interactive environment so you can inspect downloaded files, validate credentials,
and benchmark transforms before automating the full ingestion job. [Modal Notebooks](/docs/guide/notebooks)
work well for this. Attach the same Volume that your ingestion Functions use, keep transient scratch
data in \`/tmp\`, and persist intermediate artifacts under \`/mnt/...\`.

## Downloading

The raw dataset data should be first downloaded into the container at \`/tmp/\` and not placed
directly into the mounted volume. This serves a couple purposes.

1. Download tools often create temporary files, partial files, or rename targets while writing, and local SSD handles that more efficiently.
2. The raw dataset data may need to be transformed before use, in which case it is wasteful to store it permanently.

This snippet shows the basic download-and-copy procedure:

\`\`\`python notest
import pathlib
import shutil
import subprocess

tmp_path = pathlib.Path("/tmp/imagenet/")
vol_path = pathlib.Path("/mnt/datasets/imagenet/")
filename = "imagenet-object-localization-challenge.zip"
# 1. Download into /tmp/
subprocess.run(
    f"kaggle competitions download -c imagenet-object-localization-challenge --path {tmp_path}",
    shell=True,
    check=True
)
vol_path.mkdir(parents=True, exist_ok=True)
# 2. Copy (without transform) into mounted volume.
shutil.copy2(tmp_path / filename, vol_path / filename)
volume.commit()
\`\`\`

## Transforming

When ingesting a large dataset it is sometimes necessary to transform it before storage, so that it is in
an optimal format for loading at runtime. A common kind of necessary transform is gzip decompression. Very large
datasets are often gzipped for storage and network transmission efficiency, but gzip decompression (80 MiB/s)
is hundreds of times slower than reading from a solid state drive (SSD)
and should be done once before storage to avoid decompressing on every read against the dataset.

Transformations should be performed after storing the raw dataset in \`/tmp/\`. Performing transformations almost always increases container disk usage and this is where the [\`ephemeral_disk\` parameter](/docs/sdk/py/latest/App#function) parameter becomes important. For example, a
100 GiB raw, compressed dataset may decompress to into 500 GiB, occupying 600 GiB of container disk space.

Transformations should also typically be performed against \`/tmp/\`. This is because

1. transforms can be IO intensive and IO latency is lower against local SSD.
2. transforms can create temporary data which is wasteful to store permanently.

Once the transform is complete, write the final dataset layout to the attached Volume and commit it so
subsequent Functions and Notebooks can reload and use the same data.

## Examples

The best practices offered in this guide are demonstrated in the [\`modal-examples\` repository](https://github.com/modal-labs/modal-examples/tree/main/12_datasets).

The examples include these popular large datasets:

- [ImageNet](https://www.image-net.org/), the image labeling dataset that kicked off the deep learning revolution
- [COCO](https://cocodataset.org/#download), the Common Objects in COntext dataset of densely-labeled images
- [LAION-400M](https://laion.ai/blog/laion-400-open-dataset/), the Stable Diffusion training dataset
- Data derived from the [Big "Fantastic" Database](https://bfd.mmseqs.com/),
  [Protein Data Bank](https://www.wwpdb.org/), and [UniProt Database](https://www.uniprot.org/)
  used in training the [RoseTTAFold](https://github.com/RosettaCommons/RoseTTAFold) protein structure model
`,meta:{title:`Large dataset ingestion`,description:`This guide provides best practices for downloading, transforming, and storing large datasets within Modal. A dataset is considered large if it contains hundreds of thousands of files and/or is over 100 GiB in size.`}},{crossLinks:_,toc:v,rawContent:y,meta:b}=g,x=t(`<code>ephemeral_disk</code> parameter`,1),S=t(`<code>modal-examples</code> repository`,1),C=t(`<!> <p>This guide provides best practices for downloading, transforming, and storing large datasets within
Modal. A dataset is considered large if it contains hundreds of thousands of files and/or is over
100 GiB in size.</p> <p>These guidelines ensure that large datasets can be ingested fully and reliably.</p> <!> <p>Large datasets should be downloaded and transformed using a <code>modal.Function</code> and stored
into a <!>.</p> <p>This <code>modal.Function</code> should specify a large <code>timeout</code> because large dataset processing can take hours,
and it should request a larger ephemeral disk in cases where the dataset being downloaded and processed
is hundreds of GiBs.</p> <!> <!> <p>Volumes can store large datasets, but datasets made up of millions of tiny files are
still usually easier to ingest and consume when they are first grouped into larger artifacts such as
tar shards, WebDataset archives, Parquet files, or other batched formats.</p> <p>See the <!> section below for more details.</p> <!> <p>Downloading and transforming large datasets can be fiddly. While iterating on a reliable ingestion program
you may want an interactive environment so you can inspect downloaded files, validate credentials,
and benchmark transforms before automating the full ingestion job. <!> work well for this. Attach the same Volume that your ingestion Functions use, keep transient scratch
data in <code>/tmp</code>, and persist intermediate artifacts under <code>/mnt/...</code>.</p> <!> <p>The raw dataset data should be first downloaded into the container at <code>/tmp/</code> and not placed
directly into the mounted volume. This serves a couple purposes.</p> <ol><li>Download tools often create temporary files, partial files, or rename targets while writing, and local SSD handles that more efficiently.</li> <li>The raw dataset data may need to be transformed before use, in which case it is wasteful to store it permanently.</li></ol> <p>This snippet shows the basic download-and-copy procedure:</p> <!> <!> <p>When ingesting a large dataset it is sometimes necessary to transform it before storage, so that it is in
an optimal format for loading at runtime. A common kind of necessary transform is gzip decompression. Very large
datasets are often gzipped for storage and network transmission efficiency, but gzip decompression (80 MiB/s)
is hundreds of times slower than reading from a solid state drive (SSD)
and should be done once before storage to avoid decompressing on every read against the dataset.</p> <p>Transformations should be performed after storing the raw dataset in <code>/tmp/</code>. Performing transformations almost always increases container disk usage and this is where the <!> parameter becomes important. For example, a
100 GiB raw, compressed dataset may decompress to into 500 GiB, occupying 600 GiB of container disk space.</p> <p>Transformations should also typically be performed against <code>/tmp/</code>. This is because</p> <ol><li>transforms can be IO intensive and IO latency is lower against local SSD.</li> <li>transforms can create temporary data which is wasteful to store permanently.</li></ol> <p>Once the transform is complete, write the final dataset layout to the attached Volume and commit it so
subsequent Functions and Notebooks can reload and use the same data.</p> <!> <p>The best practices offered in this guide are demonstrated in the <!>.</p> <p>The examples include these popular large datasets:</p> <ul><li><!>, the image labeling dataset that kicked off the deep learning revolution</li> <li><!>, the Common Objects in COntext dataset of densely-labeled images</li> <li><!>, the Stable Diffusion training dataset</li> <li>Data derived from the <!>, <!>, and <!> used in training the <!> protein structure model</li></ul>`,1);function w(t,_){let v=a(_,[`children`,`$$slots`,`$$events`,`$$legacy`]);m(t,o(()=>v,()=>g,{children:(t,a)=>{var o=C(),m=s(o);f(m,{id:`large-dataset-ingestion`,children:(e,t)=>{l(),i(e,r(`Large dataset ingestion`))},$$slots:{default:!0}});var g=c(m,6);u(g,{id:`configure-your-function-for-heavy-disk-usage`,children:(e,t)=>{l(),i(e,r(`Configure your Function for heavy disk usage`))},$$slots:{default:!0}});var _=c(g,2);h(c(e(_),3),{href:`/docs/guide/volumes`,children:(e,t)=>{l(),i(e,r(`Volume`))},$$slots:{default:!0}}),l(),n(_);var v=c(_,4);p(v,{code:`volume%20%3D%20modal.Volume.from_name(%22datasets%22%2C%20create_if_missing%3DTrue)%0A%0A%0A%40app.function(%0A%20%20%20%20volumes%3D%7B%22%2Fmnt%2Fdatasets%22%3A%20volume%7D%2C%0A%20%20%20%20ephemeral_disk%3D1000%20*%201000%2C%20%20%23%201%20TiB%0A%20%20%20%20timeout%3D60%20*%2060%20*%2012%2C%20%20%23%2012%20hours%0A%0A)%0Adef%20download_and_transform()%20-%3E%20None%3A%0A%20%20%20%20...%0A%20%20%20%20volume.commit()`,lang:`python`});var y=c(v,2);d(y,{id:`prefer-sharded-or-archived-outputs-for-tiny-file-datasets`,children:(e,t)=>{l(),i(e,r(`Prefer sharded or archived outputs for tiny-file datasets`))},$$slots:{default:!0}});var b=c(y,4);h(c(e(b)),{href:`#transforming`,children:(e,t)=>{l(),i(e,r(`transforming`))},$$slots:{default:!0}}),l(),n(b);var w=c(b,2);u(w,{id:`experimentation`,children:(e,t)=>{l(),i(e,r(`Experimentation`))},$$slots:{default:!0}});var T=c(w,2);h(c(e(T)),{href:`/docs/guide/notebooks`,children:(e,t)=>{l(),i(e,r(`Modal Notebooks`))},$$slots:{default:!0}}),l(5),n(T);var E=c(T,2);u(E,{id:`downloading`,children:(e,t)=>{l(),i(e,r(`Downloading`))},$$slots:{default:!0}});var D=c(E,8);p(D,{code:`import%20pathlib%0Aimport%20shutil%0Aimport%20subprocess%0A%0Atmp_path%20%3D%20pathlib.Path(%22%2Ftmp%2Fimagenet%2F%22)%0Avol_path%20%3D%20pathlib.Path(%22%2Fmnt%2Fdatasets%2Fimagenet%2F%22)%0Afilename%20%3D%20%22imagenet-object-localization-challenge.zip%22%0A%23%201.%20Download%20into%20%2Ftmp%2F%0Asubprocess.run(%0A%20%20%20%20f%22kaggle%20competitions%20download%20-c%20imagenet-object-localization-challenge%20--path%20%7Btmp_path%7D%22%2C%0A%20%20%20%20shell%3DTrue%2C%0A%20%20%20%20check%3DTrue%0A)%0Avol_path.mkdir(parents%3DTrue%2C%20exist_ok%3DTrue)%0A%23%202.%20Copy%20(without%20transform)%20into%20mounted%20volume.%0Ashutil.copy2(tmp_path%20%2F%20filename%2C%20vol_path%20%2F%20filename)%0Avolume.commit()`,lang:`python`});var O=c(D,2);u(O,{id:`transforming`,children:(e,t)=>{l(),i(e,r(`Transforming`))},$$slots:{default:!0}});var k=c(O,4);h(c(e(k),3),{href:`/docs/sdk/py/latest/App#function`,children:(e,t)=>{var n=x();l(),i(e,n)},$$slots:{default:!0}}),l(),n(k);var A=c(k,8);u(A,{id:`examples`,children:(e,t)=>{l(),i(e,r(`Examples`))},$$slots:{default:!0}});var j=c(A,2);h(c(e(j)),{href:`https://github.com/modal-labs/modal-examples/tree/main/12_datasets`,rel:`nofollow`,children:(e,t)=>{var n=S();l(),i(e,n)},$$slots:{default:!0}}),l(),n(j);var M=c(j,4),N=e(M);h(e(N),{href:`https://www.image-net.org/`,rel:`nofollow`,children:(e,t)=>{l(),i(e,r(`ImageNet`))},$$slots:{default:!0}}),l(),n(N);var P=c(N,2);h(e(P),{href:`https://cocodataset.org/#download`,rel:`nofollow`,children:(e,t)=>{l(),i(e,r(`COCO`))},$$slots:{default:!0}}),l(),n(P);var F=c(P,2);h(e(F),{href:`https://laion.ai/blog/laion-400-open-dataset/`,rel:`nofollow`,children:(e,t)=>{l(),i(e,r(`LAION-400M`))},$$slots:{default:!0}}),l(),n(F);var I=c(F,2),L=c(e(I));h(L,{href:`https://bfd.mmseqs.com/`,rel:`nofollow`,children:(e,t)=>{l(),i(e,r(`Big “Fantastic” Database`))},$$slots:{default:!0}});var R=c(L,2);h(R,{href:`https://www.wwpdb.org/`,rel:`nofollow`,children:(e,t)=>{l(),i(e,r(`Protein Data Bank`))},$$slots:{default:!0}});var z=c(R,2);h(z,{href:`https://www.uniprot.org/`,rel:`nofollow`,children:(e,t)=>{l(),i(e,r(`UniProt Database`))},$$slots:{default:!0}}),h(c(z,2),{href:`https://github.com/RosettaCommons/RoseTTAFold`,rel:`nofollow`,children:(e,t)=>{l(),i(e,r(`RoseTTAFold`))},$$slots:{default:!0}}),l(),n(I),n(M),i(t,o)},$$slots:{default:!0}}))}export{w as default,g as metadata};
//# sourceMappingURL=CK9zogsB2.js.map
