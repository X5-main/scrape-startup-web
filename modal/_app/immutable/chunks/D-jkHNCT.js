(function(){try{var e=typeof window<`u`?window:typeof global<`u`?global:typeof globalThis<`u`?globalThis:typeof self<`u`?self:{};e.SENTRY_RELEASE={id:`f99fcf9f0a844cc9bd13fdc8e5782b84`};var t=new e.Error().stack;t&&(e._sentryDebugIds=e._sentryDebugIds||{},e._sentryDebugIds[t]=`8eb6cf9c-b5b2-4971-ad56-dfa9315ae4b7`,e._sentryDebugIdIdentifier=`sentry-dbid-8eb6cf9c-b5b2-4971-ad56-dfa9315ae4b7`)}catch{}})();import{St as e,bt as t,c as n,d as r,en as i,tn as a,wn as o}from"./F_ixKBiO.js";import"./B1sc9Zdx.js";import"./Bb2deiU3.js";import{a as s,o as c}from"./CPby7b1n.js";import{t as l}from"./BILrvr3I.js";import{t as u}from"./B4L_if842.js";var d={toc:[{depth:1,value:`modal volume`,id:`modal-volume`,children:[{depth:2,value:`modal volume cp`,id:`modal-volume-cp`},{depth:2,value:`modal volume create`,id:`modal-volume-create`},{depth:2,value:`modal volume dashboard`,id:`modal-volume-dashboard`},{depth:2,value:`modal volume delete`,id:`modal-volume-delete`},{depth:2,value:`modal volume get`,id:`modal-volume-get`},{depth:2,value:`modal volume list`,id:`modal-volume-list`},{depth:2,value:`modal volume ls`,id:`modal-volume-ls`},{depth:2,value:`modal volume put`,id:`modal-volume-put`},{depth:2,value:`modal volume rename`,id:`modal-volume-rename`},{depth:2,value:`modal volume rm`,id:`modal-volume-rm`}]}],rawContent:`# \`modal volume\`

Read and edit \`modal.Volume\` volumes.

Note: users of \`modal.NetworkFileSystem\` should use the \`modal nfs\` command instead.

**Usage**:

\`\`\`shell
modal volume [OPTIONS] COMMAND [ARGS]...
\`\`\`

**Options**:

* \`--help\`: Show this message and exit.

**Commands**:

* \`cp\`: Copy within a modal.Volume.
* \`create\`: Create a named, persistent modal.Volume.
* \`dashboard\`: Open the Volume's dashboard page in your web browser.
* \`delete\`: Delete a named Volume and all of its data.
* \`get\`: Download files from a modal.Volume object.
* \`list\`: List the details of all modal.Volume volumes in an Environment.
* \`ls\`: List files and directories in a modal.Volume volume.
* \`put\`: Upload a file or directory to a modal.Volume.
* \`rename\`: Rename a modal.Volume.
* \`rm\`: Delete a file or directory from a modal.Volume.

## \`modal volume cp\`

Copy within a modal.Volume.

Copy source file to destination file or multiple source files to destination directory.

**Usage**:

\`\`\`shell
modal volume cp [OPTIONS] VOLUME_NAME PATHS...
\`\`\`

**Options**:

* \`-r, --recursive\`: Copy directories recursively
* \`-e, --env TEXT\`: Environment to interact with. If unspecified, defers to \`MODAL_ENVIRONMENT\`, your active local profile, or your workspace default, in that order.
* \`--help\`: Show this message and exit.

## \`modal volume create\`

Create a named, persistent modal.Volume.

**Usage**:

\`\`\`shell
modal volume create [OPTIONS] NAME
\`\`\`

**Options**:

* \`-e, --env TEXT\`: Environment to interact with. If unspecified, defers to \`MODAL_ENVIRONMENT\`, your active local profile, or your workspace default, in that order.
* \`--version INTEGER\`: VolumeFS version. (Experimental)
* \`--help\`: Show this message and exit.

## \`modal volume dashboard\`

Open the Volume's dashboard page in your web browser.

**Usage**:

\`\`\`shell
modal volume dashboard [OPTIONS] VOLUME_NAME
\`\`\`

**Options**:

* \`-e, --env TEXT\`: Environment to interact with. If unspecified, defers to \`MODAL_ENVIRONMENT\`, your active local profile, or your workspace default, in that order.
* \`--help\`: Show this message and exit.

## \`modal volume delete\`

Delete a named Volume and all of its data.

**Usage**:

\`\`\`shell
modal volume delete [OPTIONS] NAME
\`\`\`

**Options**:

* \`--allow-missing\`: Don't error if the Volume doesn't exist.
* \`-y, --yes\`: Run without pausing for confirmation.
* \`-e, --env TEXT\`: Environment to interact with. If unspecified, defers to \`MODAL_ENVIRONMENT\`, your active local profile, or your workspace default, in that order.
* \`--help\`: Show this message and exit.

## \`modal volume get\`

Download files from a modal.Volume object.

If a folder is passed for REMOTE_PATH, the contents of the folder will be downloaded
recursively, including all subdirectories.

Examples:

\`\`\`
modal volume get <volume_name> logs/april-12-1.txt
modal volume get <volume_name> / volume_data_dump
\`\`\`

Use "-" as LOCAL_DESTINATION to write file contents to standard output.

**Usage**:

\`\`\`shell
modal volume get [OPTIONS] VOLUME_NAME REMOTE_PATH [LOCAL_DESTINATION]
\`\`\`

**Options**:

* \`--force\`
* \`-e, --env TEXT\`: Environment to interact with. If unspecified, defers to \`MODAL_ENVIRONMENT\`, your active local profile, or your workspace default, in that order.
* \`--help\`: Show this message and exit.

## \`modal volume list\`

List the details of all modal.Volume volumes in an Environment.

**Usage**:

\`\`\`shell
modal volume list [OPTIONS]
\`\`\`

**Options**:

* \`-e, --env TEXT\`: Environment to interact with. If unspecified, defers to \`MODAL_ENVIRONMENT\`, your active local profile, or your workspace default, in that order.
* \`--json\`
* \`--help\`: Show this message and exit.

## \`modal volume ls\`

List files and directories in a modal.Volume volume.

**Usage**:

\`\`\`shell
modal volume ls [OPTIONS] VOLUME_NAME [PATH]
\`\`\`

**Options**:

* \`--json\`
* \`-e, --env TEXT\`: Environment to interact with. If unspecified, defers to \`MODAL_ENVIRONMENT\`, your active local profile, or your workspace default, in that order.
* \`--help\`: Show this message and exit.

## \`modal volume put\`

Upload a file or directory to a modal.Volume.

Remote parent directories will be created as needed.

Ending the REMOTE_PATH with a forward slash (/), it's assumed to be a directory
and the file will be uploaded with its current name under that directory.

**Usage**:

\`\`\`shell
modal volume put [OPTIONS] VOLUME_NAME LOCAL_PATH [REMOTE_PATH]
\`\`\`

**Options**:

* \`-f, --force\`: Overwrite existing files.
* \`-e, --env TEXT\`: Environment to interact with. If unspecified, defers to \`MODAL_ENVIRONMENT\`, your active local profile, or your workspace default, in that order.
* \`--help\`: Show this message and exit.

## \`modal volume rename\`

Rename a modal.Volume.

**Usage**:

\`\`\`shell
modal volume rename [OPTIONS] OLD_NAME NEW_NAME
\`\`\`

**Options**:

* \`-y, --yes\`: Run without pausing for confirmation.
* \`-e, --env TEXT\`: Environment to interact with. If unspecified, defers to \`MODAL_ENVIRONMENT\`, your active local profile, or your workspace default, in that order.
* \`--help\`: Show this message and exit.

## \`modal volume rm\`

Delete a file or directory from a modal.Volume.

**Usage**:

\`\`\`shell
modal volume rm [OPTIONS] VOLUME_NAME REMOTE_PATH
\`\`\`

**Options**:

* \`-r, --recursive\`: Delete directory recursively
* \`-e, --env TEXT\`: Environment to interact with. If unspecified, defers to \`MODAL_ENVIRONMENT\`, your active local profile, or your workspace default, in that order.
* \`--help\`: Show this message and exit.
`,meta:{title:`modal volume`,description:`Read and edit modal.Volume volumes.`}},{toc:f,rawContent:p,meta:m}=d,h=e(`<code>modal volume</code>`),g=e(`<code>modal volume cp</code>`),_=e(`<code>modal volume create</code>`),v=e(`<code>modal volume dashboard</code>`),y=e(`<code>modal volume delete</code>`),b=e(`<code>modal volume get</code>`),x=e(`<code>modal volume list</code>`),S=e(`<code>modal volume ls</code>`),C=e(`<code>modal volume put</code>`),w=e(`<code>modal volume rename</code>`),T=e(`<code>modal volume rm</code>`),E=e(`<!> <p>Read and edit <code>modal.Volume</code> volumes.</p> <p>Note: users of <code>modal.NetworkFileSystem</code> should use the <code>modal nfs</code> command instead.</p> <p><strong>Usage</strong>:</p> <!> <p><strong>Options</strong>:</p> <ul><li><code>--help</code>: Show this message and exit.</li></ul> <p><strong>Commands</strong>:</p> <ul><li><code>cp</code>: Copy within a modal.Volume.</li> <li><code>create</code>: Create a named, persistent modal.Volume.</li> <li><code>dashboard</code>: Open the Volume’s dashboard page in your web browser.</li> <li><code>delete</code>: Delete a named Volume and all of its data.</li> <li><code>get</code>: Download files from a modal.Volume object.</li> <li><code>list</code>: List the details of all modal.Volume volumes in an Environment.</li> <li><code>ls</code>: List files and directories in a modal.Volume volume.</li> <li><code>put</code>: Upload a file or directory to a modal.Volume.</li> <li><code>rename</code>: Rename a modal.Volume.</li> <li><code>rm</code>: Delete a file or directory from a modal.Volume.</li></ul> <!> <p>Copy within a modal.Volume.</p> <p>Copy source file to destination file or multiple source files to destination directory.</p> <p><strong>Usage</strong>:</p> <!> <p><strong>Options</strong>:</p> <ul><li><code>-r, --recursive</code>: Copy directories recursively</li> <li><code>-e, --env TEXT</code>: Environment to interact with. If unspecified, defers to <code>MODAL_ENVIRONMENT</code>, your active local profile, or your workspace default, in that order.</li> <li><code>--help</code>: Show this message and exit.</li></ul> <!> <p>Create a named, persistent modal.Volume.</p> <p><strong>Usage</strong>:</p> <!> <p><strong>Options</strong>:</p> <ul><li><code>-e, --env TEXT</code>: Environment to interact with. If unspecified, defers to <code>MODAL_ENVIRONMENT</code>, your active local profile, or your workspace default, in that order.</li> <li><code>--version INTEGER</code>: VolumeFS version. (Experimental)</li> <li><code>--help</code>: Show this message and exit.</li></ul> <!> <p>Open the Volume’s dashboard page in your web browser.</p> <p><strong>Usage</strong>:</p> <!> <p><strong>Options</strong>:</p> <ul><li><code>-e, --env TEXT</code>: Environment to interact with. If unspecified, defers to <code>MODAL_ENVIRONMENT</code>, your active local profile, or your workspace default, in that order.</li> <li><code>--help</code>: Show this message and exit.</li></ul> <!> <p>Delete a named Volume and all of its data.</p> <p><strong>Usage</strong>:</p> <!> <p><strong>Options</strong>:</p> <ul><li><code>--allow-missing</code>: Don’t error if the Volume doesn’t exist.</li> <li><code>-y, --yes</code>: Run without pausing for confirmation.</li> <li><code>-e, --env TEXT</code>: Environment to interact with. If unspecified, defers to <code>MODAL_ENVIRONMENT</code>, your active local profile, or your workspace default, in that order.</li> <li><code>--help</code>: Show this message and exit.</li></ul> <!> <p>Download files from a modal.Volume object.</p> <p>If a folder is passed for REMOTE_PATH, the contents of the folder will be downloaded
recursively, including all subdirectories.</p> <p>Examples:</p> <!> <p>Use ”-” as LOCAL_DESTINATION to write file contents to standard output.</p> <p><strong>Usage</strong>:</p> <!> <p><strong>Options</strong>:</p> <ul><li><code>--force</code></li> <li><code>-e, --env TEXT</code>: Environment to interact with. If unspecified, defers to <code>MODAL_ENVIRONMENT</code>, your active local profile, or your workspace default, in that order.</li> <li><code>--help</code>: Show this message and exit.</li></ul> <!> <p>List the details of all modal.Volume volumes in an Environment.</p> <p><strong>Usage</strong>:</p> <!> <p><strong>Options</strong>:</p> <ul><li><code>-e, --env TEXT</code>: Environment to interact with. If unspecified, defers to <code>MODAL_ENVIRONMENT</code>, your active local profile, or your workspace default, in that order.</li> <li><code>--json</code></li> <li><code>--help</code>: Show this message and exit.</li></ul> <!> <p>List files and directories in a modal.Volume volume.</p> <p><strong>Usage</strong>:</p> <!> <p><strong>Options</strong>:</p> <ul><li><code>--json</code></li> <li><code>-e, --env TEXT</code>: Environment to interact with. If unspecified, defers to <code>MODAL_ENVIRONMENT</code>, your active local profile, or your workspace default, in that order.</li> <li><code>--help</code>: Show this message and exit.</li></ul> <!> <p>Upload a file or directory to a modal.Volume.</p> <p>Remote parent directories will be created as needed.</p> <p>Ending the REMOTE_PATH with a forward slash (/), it’s assumed to be a directory
and the file will be uploaded with its current name under that directory.</p> <p><strong>Usage</strong>:</p> <!> <p><strong>Options</strong>:</p> <ul><li><code>-f, --force</code>: Overwrite existing files.</li> <li><code>-e, --env TEXT</code>: Environment to interact with. If unspecified, defers to <code>MODAL_ENVIRONMENT</code>, your active local profile, or your workspace default, in that order.</li> <li><code>--help</code>: Show this message and exit.</li></ul> <!> <p>Rename a modal.Volume.</p> <p><strong>Usage</strong>:</p> <!> <p><strong>Options</strong>:</p> <ul><li><code>-y, --yes</code>: Run without pausing for confirmation.</li> <li><code>-e, --env TEXT</code>: Environment to interact with. If unspecified, defers to <code>MODAL_ENVIRONMENT</code>, your active local profile, or your workspace default, in that order.</li> <li><code>--help</code>: Show this message and exit.</li></ul> <!> <p>Delete a file or directory from a modal.Volume.</p> <p><strong>Usage</strong>:</p> <!> <p><strong>Options</strong>:</p> <ul><li><code>-r, --recursive</code>: Delete directory recursively</li> <li><code>-e, --env TEXT</code>: Environment to interact with. If unspecified, defers to <code>MODAL_ENVIRONMENT</code>, your active local profile, or your workspace default, in that order.</li> <li><code>--help</code>: Show this message and exit.</li></ul>`,1);function D(e,f){let p=n(f,[`children`,`$$slots`,`$$events`,`$$legacy`]);u(e,r(()=>p,()=>d,{children:(e,n)=>{var r=E(),u=i(r);c(u,{id:`modal-volume`,children:(e,n)=>{t(e,h())},$$slots:{default:!0}});var d=a(u,8);l(d,{code:`modal%20volume%20%5BOPTIONS%5D%20COMMAND%20%5BARGS%5D...`,lang:`shell`});var f=a(d,10);s(f,{id:`modal-volume-cp`,children:(e,n)=>{t(e,g())},$$slots:{default:!0}});var p=a(f,8);l(p,{code:`modal%20volume%20cp%20%5BOPTIONS%5D%20VOLUME_NAME%20PATHS...`,lang:`shell`});var m=a(p,6);s(m,{id:`modal-volume-create`,children:(e,n)=>{t(e,_())},$$slots:{default:!0}});var D=a(m,6);l(D,{code:`modal%20volume%20create%20%5BOPTIONS%5D%20NAME`,lang:`shell`});var O=a(D,6);s(O,{id:`modal-volume-dashboard`,children:(e,n)=>{t(e,v())},$$slots:{default:!0}});var k=a(O,6);l(k,{code:`modal%20volume%20dashboard%20%5BOPTIONS%5D%20VOLUME_NAME`,lang:`shell`});var A=a(k,6);s(A,{id:`modal-volume-delete`,children:(e,n)=>{t(e,y())},$$slots:{default:!0}});var j=a(A,6);l(j,{code:`modal%20volume%20delete%20%5BOPTIONS%5D%20NAME`,lang:`shell`});var M=a(j,6);s(M,{id:`modal-volume-get`,children:(e,n)=>{t(e,b())},$$slots:{default:!0}});var N=a(M,8);l(N,{code:`modal%20volume%20get%20%3Cvolume_name%3E%20logs%2Fapril-12-1.txt%0Amodal%20volume%20get%20%3Cvolume_name%3E%20%2F%20volume_data_dump`,lang:`text`});var P=a(N,6);l(P,{code:`modal%20volume%20get%20%5BOPTIONS%5D%20VOLUME_NAME%20REMOTE_PATH%20%5BLOCAL_DESTINATION%5D`,lang:`shell`});var F=a(P,6);s(F,{id:`modal-volume-list`,children:(e,n)=>{t(e,x())},$$slots:{default:!0}});var I=a(F,6);l(I,{code:`modal%20volume%20list%20%5BOPTIONS%5D`,lang:`shell`});var L=a(I,6);s(L,{id:`modal-volume-ls`,children:(e,n)=>{t(e,S())},$$slots:{default:!0}});var R=a(L,6);l(R,{code:`modal%20volume%20ls%20%5BOPTIONS%5D%20VOLUME_NAME%20%5BPATH%5D`,lang:`shell`});var z=a(R,6);s(z,{id:`modal-volume-put`,children:(e,n)=>{t(e,C())},$$slots:{default:!0}});var B=a(z,10);l(B,{code:`modal%20volume%20put%20%5BOPTIONS%5D%20VOLUME_NAME%20LOCAL_PATH%20%5BREMOTE_PATH%5D`,lang:`shell`});var V=a(B,6);s(V,{id:`modal-volume-rename`,children:(e,n)=>{t(e,w())},$$slots:{default:!0}});var H=a(V,6);l(H,{code:`modal%20volume%20rename%20%5BOPTIONS%5D%20OLD_NAME%20NEW_NAME`,lang:`shell`});var U=a(H,6);s(U,{id:`modal-volume-rm`,children:(e,n)=>{t(e,T())},$$slots:{default:!0}}),l(a(U,6),{code:`modal%20volume%20rm%20%5BOPTIONS%5D%20VOLUME_NAME%20REMOTE_PATH`,lang:`shell`}),o(4),t(e,r)},$$slots:{default:!0}}))}export{D as default,d as metadata};
//# sourceMappingURL=D-jkHNCT.js.map
