(function(){try{var e=typeof window<`u`?window:typeof global<`u`?global:typeof globalThis<`u`?globalThis:typeof self<`u`?self:{};e.SENTRY_RELEASE={id:`f99fcf9f0a844cc9bd13fdc8e5782b84`};var t=new e.Error().stack;t&&(e._sentryDebugIds=e._sentryDebugIds||{},e._sentryDebugIds[t]=`e13cccfa-907a-4d93-beed-520214c090fa`,e._sentryDebugIdIdentifier=`sentry-dbid-e13cccfa-907a-4d93-beed-520214c090fa`)}catch{}})();import{$t as e,St as t,Tn as n,Tt as r,bt as i,c as ee,d as a,en as te,tn as o,wn as s}from"./F_ixKBiO.js";import"./B1sc9Zdx.js";import"./Bb2deiU3.js";import{a as c,i as ne,o as re}from"./CPby7b1n.js";import{t as l}from"./BILrvr3I.js";import{t as u}from"./B4L_if842.js";import{t as d}from"./DeWGVqas2.js";import{t as f}from"./B6UiYoTw.js";var p={toc:[{depth:1,value:`Image`,id:`image`,children:[{depth:2,value:`add_local_file`,id:`add_local_file`},{depth:2,value:`add_local_dir`,id:`add_local_dir`},{depth:2,value:`add_local_python_source`,id:`add_local_python_source`},{depth:2,value:`from_id`,id:`from_id`},{depth:2,value:`build`,id:`build`},{depth:2,value:`pip_install`,id:`pip_install`},{depth:2,value:`pip_install_private_repos`,id:`pip_install_private_repos`},{depth:2,value:`pip_install_from_requirements`,id:`pip_install_from_requirements`},{depth:2,value:`pip_install_from_pyproject`,id:`pip_install_from_pyproject`},{depth:2,value:`uv_pip_install`,id:`uv_pip_install`},{depth:2,value:`poetry_install_from_file`,id:`poetry_install_from_file`},{depth:2,value:`uv_sync`,id:`uv_sync`},{depth:2,value:`dockerfile_commands`,id:`dockerfile_commands`},{depth:2,value:`entrypoint`,id:`entrypoint`},{depth:2,value:`shell`,id:`shell`},{depth:2,value:`run_commands`,id:`run_commands`},{depth:2,value:`micromamba`,id:`micromamba`},{depth:2,value:`micromamba_install`,id:`micromamba_install`},{depth:2,value:`from_registry`,id:`from_registry`},{depth:2,value:`from_gcp_artifact_registry`,id:`from_gcp_artifact_registry`},{depth:2,value:`from_aws_ecr`,id:`from_aws_ecr`},{depth:2,value:`from_dockerfile`,id:`from_dockerfile`},{depth:2,value:`from_scratch`,id:`from_scratch`},{depth:2,value:`debian_slim`,id:`debian_slim`},{depth:2,value:`apt_install`,id:`apt_install`},{depth:2,value:`run_function`,id:`run_function`},{depth:2,value:`env`,id:`env`},{depth:2,value:`workdir`,id:`workdir`},{depth:2,value:`cmd`,id:`cmd`},{depth:2,value:`pipe`,id:`pipe`},{depth:2,value:`imports`,id:`imports`},{depth:2,value:`from_name`,id:`from_name`},{depth:2,value:`publish`,id:`publish`},{depth:2,value:`logs`,id:`logs`,children:[{depth:3,value:`logs.fetch`,id:`logsfetch`},{depth:3,value:`logs.tail`,id:`logstail`}]}]}],rawContent:`# Image


\`\`\`python
class Image(modal.object.Object)
\`\`\`

Base class for container images to run functions in.

Do not construct this class directly; instead use one of its static factory methods,
such as \`modal.Image.debian_slim\`, \`modal.Image.from_registry\`, or \`modal.Image.micromamba\`.


## add_local_file

\`\`\`python
add_local_file(self, local_path, remote_path, *, copy=False)
\`\`\`
Adds a local file to the image at \`remote_path\` within the container.

By default (\`copy=False\`), the files are added to containers on startup and are not built into the actual Image,
which speeds up deployment.

Set \`copy=True\` to copy the files into an Image layer at build time instead, similar to how
[\`COPY\`](https://docs.docker.com/engine/reference/builder/#copy) works in a \`Dockerfile\`.

copy=True can slow down iteration since it requires a rebuild of the Image and any subsequent
build steps whenever the included files change, but it is required if you want to run additional
build steps after this one.

*Added in v0.66.40*: This method replaces the deprecated \`modal.Image.copy_local_file\` method.

**Parameters**

<Parameter name="local_path" type="str | Path" description="Path to the file on the local machine." />
<Parameter name="remote_path" type="str" description="Absolute path inside the container where the file should appear." />
<Parameter name="copy" type="bool" defaultValue="False" description="If True, bake the file into an image layer at build time; if False, mount at container startup." />

**Returns**

A new \`Image\` with the file layer or mount applied.

## add_local_dir

\`\`\`python
add_local_dir(self, local_path, remote_path, *, copy=False, ignore=[])
\`\`\`
Adds a local directory's content to the image at \`remote_path\` within the container.

By default (\`copy=False\`), the files are added to containers on startup and are not built into the actual Image,
which speeds up deployment.

Set \`copy=True\` to copy the files into an Image layer at build time instead, similar to how
[\`COPY\`](https://docs.docker.com/engine/reference/builder/#copy) works in a \`Dockerfile\`.

copy=True can slow down iteration since it requires a rebuild of the Image and any subsequent
build steps whenever the included files change, but it is required if you want to run additional
build steps after this one.

*Added in v0.66.40*: This method replaces the deprecated \`modal.Image.copy_local_dir\` method.

**Parameters**

<Parameter name="local_path" type="str | Path" description="Path to the directory on the local machine." />
<Parameter name="remote_path" type="str" description="Absolute path inside the container where the directory contents should appear." />
<Parameter name="copy" type="bool" defaultValue="False" description="If True, bake the tree into an image layer at build time; if False, mount at container startup." />
<Parameter name="ignore" type="Sequence[str] | Callable[[Path], bool]" defaultValue="[]" description="Predicate or pattern list for file exclusion (True means exclude). A sequence is converted to a dockerignore-style matcher." />

**Returns**

A new \`Image\` with the directory layer or mount applied.

**Usage**

\`\`\`python
from modal import FilePatternMatcher

image = modal.Image.debian_slim().add_local_dir(
    "~/assets",
    remote_path="/assets",
    ignore=["*.venv"],
)

image = modal.Image.debian_slim().add_local_dir(
    "~/assets",
    remote_path="/assets",
    ignore=lambda p: p.is_relative_to(".venv"),
)

image = modal.Image.debian_slim().add_local_dir(
    "~/assets",
    remote_path="/assets",
    ignore=FilePatternMatcher("**/*.txt"),
)

# When including files is simpler than excluding them, you can use the \`~\` operator to invert the matcher.
image = modal.Image.debian_slim().add_local_dir(
    "~/assets",
    remote_path="/assets",
    ignore=~FilePatternMatcher("**/*.py"),
)

# You can also read ignore patterns from a file.
image = modal.Image.debian_slim().add_local_dir(
    "~/assets",
    remote_path="/assets",
    ignore=FilePatternMatcher.from_file("/path/to/ignorefile"),
)
\`\`\`

## add_local_python_source

\`\`\`python
add_local_python_source(self, *modules, copy=False, ignore=NON_PYTHON_FILES)
\`\`\`
Adds locally available Python packages/modules to containers.

Adds all files from the specified Python package or module to containers running the Image.

Packages are added to the \`/root\` directory of containers, which is on the \`PYTHONPATH\`
of any executed Modal Functions, enabling import of the module by that name.

By default (\`copy=False\`), the files are added to containers on startup and are not built into the actual Image,
which speeds up deployment.

Set \`copy=True\` to copy the files into an Image layer at build time instead. This can slow down iteration since
it requires a rebuild of the Image and any subsequent build steps whenever the included files change, but it is
required if you want to run additional build steps after this one.

**Note:** This excludes all dot-prefixed subdirectories or files and all \`.pyc\`/\`__pycache__\` files.
To add full directories with finer control, use \`.add_local_dir()\` instead and specify \`/root\` as
the destination directory.

By default only includes \`.py\`-files in the source modules. Set the \`ignore\` argument to a list of patterns
or a callable to override this behavior.

*Added in v0.67.28*: This method replaces the deprecated \`modal.Mount.from_local_python_packages\` pattern.

**Parameters**

<Parameter name="*modules" type="str" description="Python package or module names to include from the local project." />
<Parameter name="copy" type="bool" defaultValue="False" description="If True, bake sources into an image layer; if False, mount at container startup." />
<Parameter name="ignore" type="Sequence[str] | Callable[[Path], bool]" defaultValue="NON_PYTHON_FILES" description="Patterns or callable controlling which files to exclude." />

**Returns**

A new \`Image\` with the Python source mount or layer applied.

**Usage**

\`\`\`py
# includes everything except data.json
modal.Image.debian_slim().add_local_python_source("mymodule", ignore=["data.json"])

# exclude large files
modal.Image.debian_slim().add_local_python_source(
    "mymodule",
    ignore=lambda p: p.stat().st_size > 1e9
)
\`\`\`

## from_id

\`\`\`python
from_id(cls, image_id, client=None)
\`\`\`
Construct an Image from an id and look up the Image result.

The ID of an Image object can be accessed using \`.object_id\`.

**Parameters**

<Parameter name="image_id" type="str" description="Image object ID to load." />
<Parameter name="client" type="&quot;modal.client.Client | None&quot;" defaultValue="None" description="Optional Modal client; uses the default synchronizer client when omitted." />

**Returns**

A hydrated \`Image\` handle for the given ID.

## build

\`\`\`python
build(self, app)
\`\`\`
Eagerly build an image.

If your image was previously built, then this method will not rebuild your image
and your cached image is returned.

For defining Modal functions, images are built automatically when deploying or running an App.
You do not need to build the image explicitly in that case.

**Parameters**

<Parameter name="app" type="modal.app._App" description="Initialized app used as the load context for the image build." />

**Returns**

This image after the build (and resolver load) completes.

**Usage**

\`\`\`python
image = modal.Image.debian_slim().uv_pip_install("scipy", "numpy")

app = modal.App.lookup("build-image", create_if_missing=True)
with modal.enable_output():  # To see logs in your local terminal
    image.build(app)

# Save the image id
my_image_id = image.object_id

# Reference the image with the id or uses it another context.
built_image = modal.Image.from_id(my_image_id)
\`\`\`

Alternatively, you can pre-build an image and use it in a sandbox:

\`\`\`python notest
app = modal.App.lookup("sandbox-example", create_if_missing=True)

with modal.enable_output():
    image = modal.Image.debian_slim().uv_pip_install("scipy")
    image.build(app)

sb = modal.Sandbox.create("python", "-c", "import scipy; print(scipy)", app=app, image=image)
print(sb.stdout.read())
sb.terminate()
\`\`\`

\`\`\`python notest
app = modal.App()
image = modal.Image.debian_slim()

# No need to explicitly build the image for defining a function.
@app.function(image=image)
def f():
    ...
\`\`\`

## pip_install

\`\`\`python
pip_install(self, *packages, find_links=None, index_url=None,
    extra_index_url=None, pre=False, extra_options="", force_build=False,
    env=None, secrets=None, gpu=None)
\`\`\`
Install a list of Python packages using pip.

**Parameters**

<Parameter name="*packages" type="str | list[str]" description="Python packages to install, e.g. \`\`numpy\`\` or \`\`matplotlib&gt;=3.5.0\`\`." />
<Parameter name="find_links" type="str | None" defaultValue="None" description="Passed as \`\`--find-links\`\` to pip." />
<Parameter name="index_url" type="str | None" defaultValue="None" description="Passed as \`\`--index-url\`\` to pip." />
<Parameter name="extra_index_url" type="str | None" defaultValue="None" description="Passed as \`\`--extra-index-url\`\` to pip." />
<Parameter name="pre" type="bool" defaultValue="False" description="If True, allow pre-release versions (\`\`--pre\`\`)." />
<Parameter name="extra_options" type="str" defaultValue="&quot;&quot;" description="Additional raw options for pip, e.g. \`\`--no-build-isolation\`\`." />
<Parameter name="force_build" type="bool" defaultValue="False" description="If True, skip cached image builds (similar to \`\`docker build --no-cache\`\`)." />
<Parameter name="env" type="dict[str, str | None] | None" defaultValue="None" description="Environment variables set in the build container." />
<Parameter name="secrets" type="Collection[_Secret] | None" defaultValue="None" description="Secrets injected as environment variables during the build." />
<Parameter name="gpu" type="str | None" defaultValue="None" description="GPU type to attach to the builder container." />

**Returns**

A new \`Image\` with the pip install layer applied.

**Usage**

Simple installation:

\`\`\`python
image = modal.Image.debian_slim().pip_install("click", "httpx~=0.23.3")
\`\`\`

More complex installation:

\`\`\`python
image = (
    modal.Image.from_registry(
        "nvidia/cuda:12.2.0-devel-ubuntu22.04", add_python="3.11"
    )
    .pip_install(
        "ninja",
        "packaging",
        "wheel",
        "transformers==4.40.2",
    )
    .pip_install(
        "flash-attn==2.5.8", extra_options="--no-build-isolation"
    )
)
\`\`\`

## pip_install_private_repos

\`\`\`python
pip_install_private_repos(self, *repositories, git_user, find_links=None,
    index_url=None, extra_index_url=None, pre=False, extra_options="", gpu=None,
    env=None, secrets=None, force_build=False)
\`\`\`
Install a list of Python packages from private git repositories using pip.

This method currently supports Github and Gitlab only.

- **Github:** Provide a \`modal.Secret\` that contains a \`GITHUB_TOKEN\` key-value pair
- **Gitlab:** Provide a \`modal.Secret\` that contains a \`GITLAB_TOKEN\` key-value pair

These API tokens should have permissions to read the list of private repositories provided as arguments.

We recommend using Github's ['fine-grained' access tokens](https://github.blog/2022-10-18-introducing-fine-grained-personal-access-tokens-for-github/).
These tokens are repo-scoped, and avoid granting read permission across all of a user's private repos.

**Parameters**

<Parameter name="*repositories" type="str" description="Git URLs without scheme, e.g. \`\`github.com/org/repo@ref\`\` or with \`\`#subdirectory=\`\`." />
<Parameter name="git_user" type="str" description="Username embedded in HTTPS git URLs for authentication." />
<Parameter name="find_links" type="str | None" defaultValue="None" description="Passed as \`\`--find-links\`\` to pip." />
<Parameter name="index_url" type="str | None" defaultValue="None" description="Passed as \`\`--index-url\`\` to pip." />
<Parameter name="extra_index_url" type="str | None" defaultValue="None" description="Passed as \`\`--extra-index-url\`\` to pip." />
<Parameter name="pre" type="bool" defaultValue="False" description="If True, allow pre-release versions." />
<Parameter name="extra_options" type="str" defaultValue="&quot;&quot;" description="Additional raw options for pip." />
<Parameter name="gpu" type="str | None" defaultValue="None" description="GPU type to attach to the builder container." />
<Parameter name="env" type="dict[str, str | None] | None" defaultValue="None" description="Environment variables set in the build container." />
<Parameter name="secrets" type="Collection[_Secret] | None" defaultValue="None" description="Secrets that supply \`\`GITHUB_TOKEN\`\` / \`\`GITLAB_TOKEN\`\` as required." />
<Parameter name="force_build" type="bool" defaultValue="False" description="If True, skip cached image builds." />

**Returns**

A new \`Image\` with private repositories installed.

**Usage**

\`\`\`python
image = (
    modal.Image
    .debian_slim()
    .pip_install_private_repos(
        "github.com/ecorp/private-one@1.0.0",
        "github.com/ecorp/private-two@main"
        "github.com/ecorp/private-three@d4776502"
        # install from 'inner' directory on default branch.
        "github.com/ecorp/private-four#subdirectory=inner",
        git_user="erikbern",
        secrets=[modal.Secret.from_name("github-read-private")],
    )
)
\`\`\`

## pip_install_from_requirements

\`\`\`python
pip_install_from_requirements(self, requirements_txt, find_links=None, *,
    index_url=None, extra_index_url=None, pre=False, extra_options="",
    force_build=False, env=None, secrets=None, gpu=None)
\`\`\`
Install a list of Python packages from a local \`requirements.txt\` file.

**Parameters**

<Parameter name="requirements_txt" type="str" description="Path to a \`\`requirements.txt\`\` file on the local machine." />
<Parameter name="find_links" type="str | None" defaultValue="None" description="Passed as \`\`--find-links\`\` to pip." />
<Parameter name="index_url" type="str | None" defaultValue="None" description="Passed as \`\`--index-url\`\` to pip." />
<Parameter name="extra_index_url" type="str | None" defaultValue="None" description="Passed as \`\`--extra-index-url\`\` to pip." />
<Parameter name="pre" type="bool" defaultValue="False" description="If True, allow pre-release versions." />
<Parameter name="extra_options" type="str" defaultValue="&quot;&quot;" description="Additional raw options for pip." />
<Parameter name="force_build" type="bool" defaultValue="False" description="If True, skip cached image builds." />
<Parameter name="env" type="dict[str, str | None] | None" defaultValue="None" description="Environment variables set in the build container." />
<Parameter name="secrets" type="Collection[_Secret] | None" defaultValue="None" description="Secrets injected as environment variables during the build." />
<Parameter name="gpu" type="str | None" defaultValue="None" description="GPU type to attach to the builder container." />

**Returns**

A new \`Image\` with requirements installed.

## pip_install_from_pyproject

\`\`\`python
pip_install_from_pyproject(self, pyproject_toml, optional_dependencies=[], *,
    find_links=None, index_url=None, extra_index_url=None, pre=False,
    extra_options="", force_build=False, env=None, secrets=None, gpu=None)
\`\`\`
Install dependencies specified by a local \`pyproject.toml\` file.

\`optional_dependencies\` is a list of the keys of the
optional-dependencies section(s) of the \`pyproject.toml\` file
(e.g. test, doc, experiment, etc). When provided,
all of the packages in each listed section are installed as well.

**Parameters**

<Parameter name="pyproject_toml" type="str" description="Path to a \`\`pyproject.toml\`\` using PEP 621 \`\`[project.dependencies]\`\`." />
<Parameter name="optional_dependencies" type="list[str]" defaultValue="[]" description="Keys under \`\`[project.optional-dependencies]\`\` to install additionally." />
<Parameter name="find_links" type="str | None" defaultValue="None" description="Passed as \`\`--find-links\`\` to pip." />
<Parameter name="index_url" type="str | None" defaultValue="None" description="Passed as \`\`--index-url\`\` to pip." />
<Parameter name="extra_index_url" type="str | None" defaultValue="None" description="Passed as \`\`--extra-index-url\`\` to pip." />
<Parameter name="pre" type="bool" defaultValue="False" description="If True, allow pre-release versions." />
<Parameter name="extra_options" type="str" defaultValue="&quot;&quot;" description="Additional raw options for pip." />
<Parameter name="force_build" type="bool" defaultValue="False" description="If True, skip cached image builds." />
<Parameter name="env" type="dict[str, str | None] | None" defaultValue="None" description="Environment variables set in the build container." />
<Parameter name="secrets" type="Collection[_Secret] | None" defaultValue="None" description="Secrets injected as environment variables during the build." />
<Parameter name="gpu" type="str | None" defaultValue="None" description="GPU type to attach to the builder container." />

**Returns**

A new \`Image\` with project dependencies installed.

## uv_pip_install

\`\`\`python
uv_pip_install(self, *packages, requirements=None, find_links=None,
    index_url=None, extra_index_url=None, pre=False, extra_options="",
    force_build=False, uv_version=None, env=None, secrets=None, gpu=None)
\`\`\`
Install a list of Python packages using uv pip install.

This method assumes that:
- Python is on the \`\`$PATH\`\` and dependencies are installed with the first Python on the \`\`$PATH\`\`.
- The shell supports \`\`$()\`\`-style substitution as used in the generated Dockerfile.
- The \`\`command\`\` builtin is available on the \`\`$PATH\`\`.

Added in v1.1.0.

**Parameters**

<Parameter name="*packages" type="str | list[str]" description="Python packages to pass to \`\`uv pip install\`\`." />
<Parameter name="requirements" type="list[str] | None" defaultValue="None" description="Optional list of requirement file paths (passed as \`\`--requirements\`\`)." />
<Parameter name="find_links" type="str | None" defaultValue="None" description="Passed as \`\`--find-links\`\` to \`\`uv pip\`\`." />
<Parameter name="index_url" type="str | None" defaultValue="None" description="Passed as \`\`--index-url\`\` to \`\`uv pip\`\`." />
<Parameter name="extra_index_url" type="str | None" defaultValue="None" description="Passed as \`\`--extra-index-url\`\` to \`\`uv pip\`\`." />
<Parameter name="pre" type="bool" defaultValue="False" description="If True, allow pre-releases (\`\`--prerelease allow\`\`)." />
<Parameter name="extra_options" type="str" defaultValue="&quot;&quot;" description="Additional raw options appended to the \`\`uv pip install\`\` invocation." />
<Parameter name="force_build" type="bool" defaultValue="False" description="If True, skip cached image builds." />
<Parameter name="uv_version" type="str | None" defaultValue="None" description="Pin the uv binary version copied from \`\`ghcr.io/astral-sh/uv\`\`." />
<Parameter name="env" type="dict[str, str | None] | None" defaultValue="None" description="Environment variables set in the build container." />
<Parameter name="secrets" type="Collection[_Secret] | None" defaultValue="None" description="Secrets injected as environment variables during the build." />
<Parameter name="gpu" type="str | None" defaultValue="None" description="GPU type to attach to the builder container." />

**Returns**

A new \`Image\` with packages installed via uv.

**Usage**

\`\`\`python
image = modal.Image.debian_slim().uv_pip_install("torch==2.7.1", "numpy")
\`\`\`

## poetry_install_from_file

\`\`\`python
poetry_install_from_file(self, poetry_pyproject_toml, poetry_lockfile=None, *,
    ignore_lockfile=False, force_build=False, with_=[], without=[], only=[],
    poetry_version="latest", old_installer=False, env=None, secrets=None,
    gpu=None)
\`\`\`
Install poetry *dependencies* specified by a local \`pyproject.toml\` file.

If not provided as argument the path to the lockfile is inferred. However, the
file has to exist, unless \`ignore_lockfile\` is set to \`True\`.

Note that the root project of the poetry project is not installed, only the dependencies.
For including local python source files see \`add_local_python_source\`

Poetry will be installed to the Image (using pip) unless \`poetry_version\` is set to None.
Note that the interpretation of \`poetry_version="latest"\` depends on the Modal Image Builder
version, with versions 2024.10 and earlier limiting poetry to 1.x.

**Parameters**

<Parameter name="poetry_pyproject_toml" type="str" description="Path to a Poetry \`\`pyproject.toml\`\` file." />
<Parameter name="poetry_lockfile" type="str | None" defaultValue="None" description="Path to \`\`poetry.lock\`\`; if omitted, inferred next to the pyproject." />
<Parameter name="ignore_lockfile" type="bool" defaultValue="False" description="If True, do not copy or use a lockfile even when present." />
<Parameter name="force_build" type="bool" defaultValue="False" description="If True, skip cached image builds." />
<Parameter name="with_" type="list[str]" defaultValue="[]" description="Optional dependency groups to include (\`\`poetry install --with\`\`)." />
<Parameter name="without" type="list[str]" defaultValue="[]" description="Optional dependency groups to exclude (\`\`poetry install --without\`\`)." />
<Parameter name="only" type="list[str]" defaultValue="[]" description="Only install dependency groups in this list (\`\`poetry install --only\`\`)." />
<Parameter name="poetry_version" type="str | None" defaultValue="&quot;latest&quot;" description="Poetry version specifier to \`\`pip install\`\`, or None to skip installing Poetry." />
<Parameter name="old_installer" type="bool" defaultValue="False" description="If True, use Poetry&#x27;s legacy installer." />
<Parameter name="env" type="dict[str, str | None] | None" defaultValue="None" description="Environment variables set in the build container." />
<Parameter name="secrets" type="Collection[_Secret] | None" defaultValue="None" description="Secrets injected as environment variables during the build." />
<Parameter name="gpu" type="str | None" defaultValue="None" description="GPU type to attach to the builder container." />

**Returns**

A new \`Image\` with Poetry dependencies installed.

## uv_sync

\`\`\`python
uv_sync(self, uv_project_dir="./", *, force_build=False, groups=None,
    extras=None, frozen=True, extra_options="", uv_version=None, env=None,
    secrets=None, gpu=None)
\`\`\`
Creates a virtual environment with the dependencies in a uv managed project with \`uv sync\`.

The \`pyproject.toml\` and \`uv.lock\` in \`uv_project_dir\` are automatically added to the build context. The
\`uv_project_dir\` is relative to the current working directory of where \`modal\` is called.

NOTE: This does *not* install the project itself into the environment (this is equivalent to the
\`--no-install-project\` flag in the \`uv sync\` command) and you would be expected to add any local python source
files using \`Image.add_local_python_source\` or similar methods after this call.

This ensures that updates to your project code wouldn't require reinstalling third-party dependencies
after every change.

uv workspaces are currently not supported.

Added in v1.1.0.

**Parameters**

<Parameter name="uv_project_dir" type="str" defaultValue="&quot;./&quot;" description="Path to the local uv project directory (contains \`\`pyproject.toml\`\`)." />
<Parameter name="force_build" type="bool" defaultValue="False" description="If True, skip cached image builds." />
<Parameter name="groups" type="list[str] | None" defaultValue="None" description="Dependency groups passed as \`\`uv sync --group\`\`." />
<Parameter name="extras" type="list[str] | None" defaultValue="None" description="Optional extras passed as \`\`uv sync --extra\`\`." />
<Parameter name="frozen" type="bool" defaultValue="True" description="If True and a \`\`uv.lock\`\` exists, run \`\`uv sync --frozen\`\` so the lock is not updated at build time." />
<Parameter name="extra_options" type="str" defaultValue="&quot;&quot;" description="Additional raw options appended to \`\`uv sync\`\`." />
<Parameter name="uv_version" type="str | None" defaultValue="None" description="Pin the uv binary version copied from \`\`ghcr.io/astral-sh/uv\`\`." />
<Parameter name="env" type="dict[str, str | None] | None" defaultValue="None" description="Environment variables set in the build container." />
<Parameter name="secrets" type="Collection[_Secret] | None" defaultValue="None" description="Secrets injected as environment variables during the build." />
<Parameter name="gpu" type="str | None" defaultValue="None" description="GPU type to attach to the builder container." />

**Returns**

A new \`Image\` with a uv-managed virtual environment.

**Usage**

\`\`\`python
image = modal.Image.debian_slim().uv_sync()
\`\`\`

## dockerfile_commands

\`\`\`python
dockerfile_commands(self, *dockerfile_commands, context_files={}, env=None,
    secrets=None, gpu=None, context_dir=None, force_build=False,
    ignore=AUTO_DOCKERIGNORE, build_args={})
\`\`\`
Extend an image with arbitrary Dockerfile-like commands.

**Parameters**

<Parameter name="*dockerfile_commands" type="str | list[str]" description="Dockerfile lines to append after \`\`FROM base\`\` (strings or nested lists)." />
<Parameter name="context_files" type="dict[str, str]" defaultValue="&#123;&#125;" description="Map of container paths to local files to include in the build context." />
<Parameter name="env" type="dict[str, str | None] | None" defaultValue="None" description="Environment variables set in the build container." />
<Parameter name="secrets" type="Collection[_Secret] | None" defaultValue="None" description="Secrets injected as environment variables during the build." />
<Parameter name="gpu" type="str | None" defaultValue="None" description="GPU type to attach to the builder container." />
<Parameter name="context_dir" type="Path | str | None" defaultValue="None" description="Root directory for resolving relative COPY paths in implicit context mounts." />
<Parameter name="force_build" type="bool" defaultValue="False" description="If True, skip cached image builds." />
<Parameter name="ignore" type="Sequence[str] | Callable[[Path], bool]" defaultValue="AUTO_DOCKERIGNORE" description="Ignore rules for the implicit context mount (defaults to auto \`\`.dockerignore\`\` behavior)." />
<Parameter name="build_args" type="dict[str, str]" defaultValue="&#123;&#125;" description="Dockerfile \`\`ARG\`\` values forwarded to the build." />

**Returns**

A new \`Image\` with the Dockerfile fragment applied.

**Usage**

\`\`\`python
from modal import FilePatternMatcher

# By default a .dockerignore file is used if present in the current working directory
image = modal.Image.debian_slim().dockerfile_commands(
    ["COPY data /data"],
)

image = modal.Image.debian_slim().dockerfile_commands(
    ["COPY data /data"],
    ignore=["*.venv"],
)

image = modal.Image.debian_slim().dockerfile_commands(
    ["COPY data /data"],
    ignore=lambda p: p.is_relative_to(".venv"),
)

image = modal.Image.debian_slim().dockerfile_commands(
    ["COPY data /data"],
    ignore=FilePatternMatcher("**/*.txt"),
)

# When including files is simpler than excluding them, you can use the \`~\` operator to invert the matcher.
image = modal.Image.debian_slim().dockerfile_commands(
    ["COPY data /data"],
    ignore=~FilePatternMatcher("**/*.py"),
)

# You can also read ignore patterns from a file.
image = modal.Image.debian_slim().dockerfile_commands(
    ["COPY data /data"],
    ignore=FilePatternMatcher.from_file("/path/to/dockerignore"),
)
\`\`\`

## entrypoint

\`\`\`python
entrypoint(self, entrypoint_commands)
\`\`\`
Set the ENTRYPOINT for the image.

**Parameters**

<Parameter name="entrypoint_commands" type="list[str]" description="argv tokens for the \`\`ENTRYPOINT\`\` JSON array form." />

**Returns**

A new \`Image\` with the entrypoint Dockerfile directive applied.

## shell

\`\`\`python
shell(self, shell_commands)
\`\`\`
Overwrite default shell for the image.

**Parameters**

<Parameter name="shell_commands" type="list[str]" description="argv tokens for the \`\`SHELL\`\` JSON array form." />

**Returns**

A new \`Image\` with the shell Dockerfile directive applied.

## run_commands

\`\`\`python
run_commands(self, *commands, env=None, secrets=None, volumes=None, gpu=None,
    force_build=False)
\`\`\`
Extend an image with a list of shell commands to run.

**Parameters**

<Parameter name="*commands" type="str | list[str]" description="Shell commands to run as separate \`\`RUN\`\` lines (strings or nested lists)." />
<Parameter name="env" type="dict[str, str | None] | None" defaultValue="None" description="Environment variables set in the build container." />
<Parameter name="secrets" type="Collection[_Secret] | None" defaultValue="None" description="Secrets injected as environment variables during the build." />
<Parameter name="volumes" type="dict[str | PurePosixPath, _Volume] | None" defaultValue="None" description="Modal volumes to attach during the build step." />
<Parameter name="gpu" type="str | None" defaultValue="None" description="GPU type to attach to the builder container." />
<Parameter name="force_build" type="bool" defaultValue="False" description="If True, skip cached image builds." />

**Returns**

A new \`Image\` with the commands executed as layers.

## micromamba

\`\`\`python
micromamba(python_version=None, force_build=False)
\`\`\`
A Micromamba base image. Micromamba allows for fast building of small Conda-based containers.

**Parameters**

<Parameter name="python_version" type="str | None" defaultValue="None" description="Python series or full version to install in the base conda environment." />
<Parameter name="force_build" type="bool" defaultValue="False" description="If True, skip cached image builds." />

**Returns**

A Micromamba-based \`Image\`.

## micromamba_install

\`\`\`python
micromamba_install(self, *packages, spec_file=None, channels=[],
    force_build=False, env=None, secrets=None, gpu=None)
\`\`\`
Install a list of additional packages using micromamba.

**Parameters**

<Parameter name="*packages" type="str | list[str]" description="Conda packages to install, e.g. \`\`numpy\`\` or version constraints." />
<Parameter name="spec_file" type="str | None" defaultValue="None" description="Optional local path to a conda spec file to pass with \`\`-f\`\`." />
<Parameter name="channels" type="list[str]" defaultValue="[]" description="Conda channels to pass with repeated \`\`-c\`\` flags." />
<Parameter name="force_build" type="bool" defaultValue="False" description="If True, skip cached image builds." />
<Parameter name="env" type="dict[str, str | None] | None" defaultValue="None" description="Environment variables set in the build container." />
<Parameter name="secrets" type="Collection[_Secret] | None" defaultValue="None" description="Secrets injected as environment variables during the build." />
<Parameter name="gpu" type="str | None" defaultValue="None" description="GPU type to attach to the builder container." />

**Returns**

A new \`Image\` with micromamba packages installed.

## from_registry

\`\`\`python
from_registry(tag, secret=None, *, setup_dockerfile_commands=[],
    force_build=False, add_python=None, **kwargs)
\`\`\`
Build a Modal Image from a public or private image registry, such as Docker Hub.

The image must be built for the \`linux/amd64\` platform.

If your image does not come with Python installed, you can use the \`add_python\` parameter
to specify a version of Python to add to the image. Otherwise, the image is expected to
have Python on PATH as \`python\`, along with \`pip\`.

You may also use \`setup_dockerfile_commands\` to run Dockerfile commands before the
remaining commands run. This might be useful if you want a custom Python installation or to
set a \`SHELL\`. Prefer \`run_commands()\` when possible though.

To authenticate against a private registry with static credentials, you must set the \`secret\` parameter to
a \`modal.Secret\` containing a username (\`REGISTRY_USERNAME\`) and
an access token or password (\`REGISTRY_PASSWORD\`).

To authenticate against private registries with credentials from a cloud provider,
use \`Image.from_gcp_artifact_registry()\` or \`Image.from_aws_ecr()\`.

**Parameters**

<Parameter name="tag" type="str" description="Registry image reference (e.g. \`\`python:3.11-slim\`\`)." />
<Parameter name="secret" type="_Secret | None" defaultValue="None" description="Optional secret for static registry credentials." />
<Parameter name="setup_dockerfile_commands" type="list[str]" defaultValue="[]" description="Extra Dockerfile lines run after \`\`FROM\`\` during base setup." />
<Parameter name="force_build" type="bool" defaultValue="False" description="If True, skip cached image builds." />
<Parameter name="add_python" type="str | None" defaultValue="None" description="Optional standalone Python series to inject when the base image lacks Python." />
<Parameter name="**kwargs" type="" description="Additional arguments forwarded to the internal image constructor (e.g. registry config)." />

**Returns**

An \`Image\` based on the registry tag.

**Usage**

\`\`\`python
modal.Image.from_registry("python:3.11-slim-bookworm")
modal.Image.from_registry("ubuntu:22.04", add_python="3.11")
modal.Image.from_registry("nvcr.io/nvidia/pytorch:22.12-py3")
\`\`\`

## from_gcp_artifact_registry

\`\`\`python
from_gcp_artifact_registry(tag, secret=None, *, setup_dockerfile_commands=[],
    force_build=False, add_python=None, **kwargs)
\`\`\`
Build a Modal image from a private image in Google Cloud Platform (GCP) Artifact Registry.

You will need to pass a \`modal.Secret\` containing [your GCP service account key data](https://cloud.google.com/iam/docs/keys-create-delete#creating)
as \`SERVICE_ACCOUNT_JSON\`. This can be done from the [Secrets](https://modal.com/secrets) page.
Your service account should be granted a specific role depending on the GCP registry used:

- For Artifact Registry images (\`pkg.dev\` domains) use
  the ["Artifact Registry Reader"](https://cloud.google.com/artifact-registry/docs/access-control#roles) role
- For Container Registry images (\`gcr.io\` domains) use
  the ["Storage Object Viewer"](https://cloud.google.com/artifact-registry/docs/transition/setup-gcr-repo) role

**Note:** This method does not use \`GOOGLE_APPLICATION_CREDENTIALS\` as that
variable accepts a path to a JSON file, not the actual JSON string.

See \`Image.from_registry()\` for information about the other parameters.

**Parameters**

<Parameter name="tag" type="str" description="Full GCP Artifact Registry image reference." />
<Parameter name="secret" type="_Secret | None" defaultValue="None" description="Secret containing \`\`SERVICE_ACCOUNT_JSON\`\` for registry authentication." />
<Parameter name="setup_dockerfile_commands" type="list[str]" defaultValue="[]" description="Extra Dockerfile lines run after \`\`FROM\`\` during base setup." />
<Parameter name="force_build" type="bool" defaultValue="False" description="If True, skip cached image builds." />
<Parameter name="add_python" type="str | None" defaultValue="None" description="Optional standalone Python series to inject when the base image lacks Python." />
<Parameter name="**kwargs" type="" description="Additional arguments forwarded to \`from_registry\`." />

**Returns**

An \`Image\` based on the private GCP artifact.

**Usage**

\`\`\`python
modal.Image.from_gcp_artifact_registry(
    "us-east1-docker.pkg.dev/my-project-1234/my-repo/my-image:my-version",
    secret=modal.Secret.from_name(
        "my-gcp-secret",
        required_keys=["SERVICE_ACCOUNT_JSON"],
    ),
    add_python="3.11",
)
\`\`\`

## from_aws_ecr

\`\`\`python
from_aws_ecr(tag, secret=None, *, setup_dockerfile_commands=[],
    force_build=False, add_python=None, **kwargs)
\`\`\`
Build a Modal image from a private image in AWS Elastic Container Registry (ECR).

You will need to pass a \`modal.Secret\` containing either IAM user credentials or OIDC
configuration to access the target ECR registry.

For IAM user authentication, set \`AWS_ACCESS_KEY_ID\`, \`AWS_SECRET_ACCESS_KEY\`, and \`AWS_REGION\`.

For OIDC authentication, set \`AWS_ROLE_ARN\` and \`AWS_REGION\`.

IAM configuration details can be found in the AWS documentation for
["Private repository policies"](https://docs.aws.amazon.com/AmazonECR/latest/userguide/repository-policies.html).

For more details on using an AWS role to access ECR, see the [OIDC integration guide](https://modal.com/docs/guide/oidc-integration).

See \`Image.from_registry()\` for information about the other parameters.

**Parameters**

<Parameter name="tag" type="str" description="Full ECR image URI." />
<Parameter name="secret" type="_Secret | None" defaultValue="None" description="Secret with IAM or OIDC credentials for ECR." />
<Parameter name="setup_dockerfile_commands" type="list[str]" defaultValue="[]" description="Extra Dockerfile lines run after \`\`FROM\`\` during base setup." />
<Parameter name="force_build" type="bool" defaultValue="False" description="If True, skip cached image builds." />
<Parameter name="add_python" type="str | None" defaultValue="None" description="Optional standalone Python series to inject when the base image lacks Python." />
<Parameter name="**kwargs" type="" description="Additional arguments forwarded to \`from_registry\`." />

**Returns**

An \`Image\` based on the private ECR image.

**Usage**

\`\`\`python
modal.Image.from_aws_ecr(
    "000000000000.dkr.ecr.us-east-1.amazonaws.com/my-private-registry:my-version",
    secret=modal.Secret.from_name(
        "aws",
        required_keys=["AWS_ACCESS_KEY_ID", "AWS_SECRET_ACCESS_KEY", "AWS_REGION"],
    ),
    add_python="3.11",
)
\`\`\`

## from_dockerfile

\`\`\`python
from_dockerfile(path, *, force_build=False, context_dir=None, env=None,
    secrets=None, gpu=None, add_python=None, build_args={},
    ignore=AUTO_DOCKERIGNORE)
\`\`\`
Build a Modal image from a local Dockerfile.

If your Dockerfile does not have Python installed, you can use the \`add_python\` parameter
to specify a version of Python to add to the image.

**Parameters**

<Parameter name="path" type="str | Path" description="Path to the Dockerfile on the local machine." />
<Parameter name="force_build" type="bool" defaultValue="False" description="If True, skip cached image builds." />
<Parameter name="context_dir" type="Path | str | None" defaultValue="None" description="Build context directory for resolving relative COPY paths." />
<Parameter name="env" type="dict[str, str | None] | None" defaultValue="None" description="Environment variables set in the build container." />
<Parameter name="secrets" type="Collection[_Secret] | None" defaultValue="None" description="Secrets injected as environment variables during the build." />
<Parameter name="gpu" type="str | None" defaultValue="None" description="GPU type to attach to the builder container." />
<Parameter name="add_python" type="str | None" defaultValue="None" description="Standalone Python version to add when the Dockerfile does not install Python." />
<Parameter name="build_args" type="dict[str, str]" defaultValue="&#123;&#125;" description="Dockerfile \`\`ARG\`\` values forwarded to the build." />
<Parameter name="ignore" type="Sequence[str] | Callable[[Path], bool]" defaultValue="AUTO_DOCKERIGNORE" description="Ignore rules for the implicit context mount (defaults to auto \`\`.dockerignore\`\` behavior)." />

**Returns**

An \`Image\` built from the Dockerfile plus Modal runtime dependencies.

**Usage**

\`\`\`python
from modal import FilePatternMatcher

# By default a .dockerignore file is used if present in the current working directory
image = modal.Image.from_dockerfile(
    "./Dockerfile",
    add_python="3.12",
)

image = modal.Image.from_dockerfile(
    "./Dockerfile",
    add_python="3.12",
    ignore=["*.venv"],
)

image = modal.Image.from_dockerfile(
    "./Dockerfile",
    add_python="3.12",
    ignore=lambda p: p.is_relative_to(".venv"),
)

image = modal.Image.from_dockerfile(
    "./Dockerfile",
    add_python="3.12",
    ignore=FilePatternMatcher("**/*.txt"),
)

# When including files is simpler than excluding them, you can use the \`~\` operator to invert the matcher.
image = modal.Image.from_dockerfile(
    "./Dockerfile",
    add_python="3.12",
    ignore=~FilePatternMatcher("**/*.py"),
)

# You can also read ignore patterns from a file.
image = modal.Image.from_dockerfile(
    "./Dockerfile",
    add_python="3.12",
    ignore=FilePatternMatcher.from_file("/path/to/dockerignore"),
)
\`\`\`

## from_scratch

\`\`\`python
from_scratch(force_build=False)
\`\`\`
Create an empty Image, equivalent to \`FROM scratch\` in Docker.

The resulting Image has no operating system, shell, or package manager. It is
primarily useful as a lightweight filesystem to mount into a Sandbox via
\`Sandbox.mount_image\`.

Note that since this Image doesn't contain Python or other standard OS utilities,
higher-level Image build steps like \`pip_install\` cannot be chained onto it. It also
cannot be used for \`modal.Function\` execution, which requires a Python interpreter.

**Parameters**

<Parameter name="force_build" type="bool" defaultValue="False" description="If True, skip cached image builds." />

**Returns**

An empty \`Image\` suitable for minimal filesystem mounts.

**Usage**

\`\`\`python notest
image = modal.Image.from_scratch().add_local_file(local_path, "/bin/my_binary", copy=True)
\`\`\`

## debian_slim

\`\`\`python
debian_slim(python_version=None, force_build=False)
\`\`\`
Default image, based on the official \`python\` Docker images.

**Parameters**

<Parameter name="python_version" type="str | None" defaultValue="None" description="Python series or full version to use from the Debian slim images." />
<Parameter name="force_build" type="bool" defaultValue="False" description="If True, skip cached image builds." />

**Returns**

The standard Debian slim Python \`Image\` used as Modal's default base.

## apt_install

\`\`\`python
apt_install(self, *packages, force_build=False, env=None, secrets=None,
    gpu=None)
\`\`\`
Install a list of Debian packages using \`apt\`.

**Parameters**

<Parameter name="*packages" type="str | list[str]" description="Apt package names to install, e.g. \`\`git\`\` or \`\`libpq-dev\`\`." />
<Parameter name="force_build" type="bool" defaultValue="False" description="If True, skip cached image builds." />
<Parameter name="env" type="dict[str, str | None] | None" defaultValue="None" description="Environment variables set in the build container." />
<Parameter name="secrets" type="Collection[_Secret] | None" defaultValue="None" description="Secrets injected as environment variables during the build." />
<Parameter name="gpu" type="str | None" defaultValue="None" description="GPU type to attach to the builder container." />

**Returns**

A new \`Image\` with \`\`apt-get install\`\` layers applied.

**Usage**

\`\`\`python
image = modal.Image.debian_slim().apt_install("git")
\`\`\`

## run_function

\`\`\`python
run_function(self, raw_f, *, env=None, secrets=None, volumes={},
    network_file_systems={}, gpu=None, cpu=None, memory=None, timeout=60 * 60,
    cloud=None, region=None, force_build=False, args=(), kwargs={},
    include_source=True)
\`\`\`
Run user-defined function \`raw_f\` as an image build step.

The function runs like an ordinary Modal Function, accepting a resource configuration and integrating
with Modal features like Secrets and Volumes. Unlike ordinary Modal Functions, any changes to the
filesystem state will be captured on container exit and saved as a new Image.

Only the source code of \`raw_f\`, the contents of \`**kwargs\`, and any referenced *global* variables
are used to determine whether the image has changed and needs to be rebuilt.
If this function references other functions or variables, the image will not be rebuilt if you
make changes to them. You can force a rebuild by changing the function's source code itself.

**Parameters**

<Parameter name="raw_f" type="Callable[..., Any]" description="Callable executed remotely during the image build." />
<Parameter name="env" type="dict[str, str | None] | None" defaultValue="None" description="Environment variables set in the builder container." />
<Parameter name="secrets" type="Collection[_Secret] | None" defaultValue="None" description="Secrets available to the builder function." />
<Parameter name="volumes" type="dict[str | PurePosixPath, _Volume | _CloudBucketMount]" defaultValue="&#123;&#125;" description="Volume and bucket mounts attached for the build." />
<Parameter name="network_file_systems" type="dict[str | PurePosixPath, _NetworkFileSystem]" defaultValue="&#123;&#125;" description="Network file systems attached for the build." />
<Parameter name="gpu" type="str | list[str] | None" defaultValue="None" description="GPU type or list of types for the builder container." />
<Parameter name="cpu" type="float | None" defaultValue="None" description="CPU cores to request (soft limit)." />
<Parameter name="memory" type="int | None" defaultValue="None" description="Memory to request in MiB (soft limit)." />
<Parameter name="timeout" type="int" defaultValue="60 * 60" description="Maximum build-step runtime in seconds." />
<Parameter name="cloud" type="str | None" defaultValue="None" description="Cloud provider for the builder function." />
<Parameter name="region" type="str | Sequence[str] | None" defaultValue="None" description="Region or regions for the builder function." />
<Parameter name="force_build" type="bool" defaultValue="False" description="If True, skip cached image builds." />
<Parameter name="args" type="Sequence[Any]" defaultValue="()" description="Positional arguments serialized to the builder function." />
<Parameter name="kwargs" type="dict[str, Any]" defaultValue="&#123;&#125;" description="Keyword arguments serialized to the builder function." />
<Parameter name="include_source" type="bool" defaultValue="True" description="Whether to include the function&#x27;s source in the builder image." />

**Returns**

A new \`Image\` capturing the filesystem after \`raw_f\` completes.

**Usage**

\`\`\`python notest

def my_build_function():
    open("model.pt", "w").write("parameters!")

image = (
    modal.Image
        .debian_slim()
        .pip_install("torch")
        .run_function(my_build_function, secrets=[...], volumes={...})
)
\`\`\`

## env

\`\`\`python
env(self, vars)
\`\`\`
Sets the environment variables in an Image.

**Parameters**

<Parameter name="vars" type="dict[str, str]" description="Map of environment variable names to string values." />

**Returns**

A new \`Image\` with \`\`ENV\`\` directives applied.

**Usage**

\`\`\`python
image = (
    modal.Image.debian_slim()
    .env({"HF_HUB_ENABLE_HF_TRANSFER": "1"})
)
\`\`\`

## workdir

\`\`\`python
workdir(self, path)
\`\`\`
Set the working directory for subsequent image build steps and function execution.

**Parameters**

<Parameter name="path" type="str | PurePosixPath" description="Working directory path inside the image." />

**Returns**

A new \`Image\` with \`\`WORKDIR\`\` applied.

**Usage**

\`\`\`python
image = (
    modal.Image.debian_slim()
    .run_commands("git clone https://xyz app")
    .workdir("/app")
    .run_commands("yarn install")
)
\`\`\`

## cmd

\`\`\`python
cmd(self, cmd)
\`\`\`
Set the default command (\`CMD\`) to run when a container is started.

Used with \`modal.Sandbox\`. Has no effect on \`modal.Function\`.

**Parameters**

<Parameter name="cmd" type="list[str]" description="argv tokens for the default container command." />

**Returns**

A new \`Image\` with \`\`CMD\`\` applied.

**Usage**

\`\`\`python
image = (
    modal.Image.debian_slim().cmd(["python", "app.py"])
)
\`\`\`

## pipe

\`\`\`python
pipe(self, func, *args, **kwargs)
\`\`\`
Apply a local function to expand the Image recipe.

This method can be useful for defining reusable Image build
recipes that compose well with the fluent Image builder interface.

**Example**

\`\`\`python
def workspace_setup(image: modal.Image, repo: str) -> modal.Image:
    return image.run_commands(f"git clone {repo}").uv_pip_install(".")

image = (
    modal.Image.debian_slim()
    .apt_install("git")
    .pipe(workspace_setup, "https://github.com/example/repo.git")
)
\`\`\`

## imports

\`\`\`python
imports(self)
\`\`\`
Used to import packages in global scope that are only available when running remotely.

By using this context manager you can avoid an \`ImportError\` due to not having certain
packages installed locally.

**Returns**

Context manager that records import failures until the image is hydrated in the remote environment.

**Usage**

\`\`\`python notest
with image.imports():
    import torch
\`\`\`

## from_name

\`\`\`python
from_name(name, *, environment_name=None, client=None)
\`\`\`
Reference a named Image that was previously published with \`.publish()\`.

Names can contain an optional \`:tag\` part. If no tag part is included, \`":latest"\` is used, matching
Docker conventions.

\`\`\`python notest
image = modal.Image.from_name("my-image")     # references my-image:latest
image_v1 = modal.Image.from_name("my-image:v1")

@app.function(image=image)
def run():
    ...
\`\`\`

## publish

\`\`\`python
publish(self, name, *, environment_name=None, experimental_options=None,
    client=None)
\`\`\`
Publish this image under the given name

The Image must already be created (typically by calling \`image.build()\` or \`sandbox.snapshot_filesystem()\`).

Image names can contain an explicit tag designation using \`name:tag\`. If no tag is included in the name,
\`":latest"\` is used, matching Docker conventions. To publish multiple tags, call \`.publish()\` once per tag.

\`\`\`python notest
image = modal.Image.debian_slim().pip_install("numpy")
image.build(app)
image.publish("my-image-with-numpy")     # my-image-with-numpy:latest
image.publish("my-image-with-numpy:v1")
\`\`\`

## logs


\`\`\`python
logs: ImageLogsManager
\`\`\`

Access logs for an \`Image\`.

Use [\`fetch()\`](#logsfetch)
to read logs for individual build layers and [\`tail()\`](#logstail)
to read the most recent logs.

**See Also**

- [\`modal app logs\`](https://modal.com/docs/cli/latest/app#modal-app-logs):
  CLI access to logs for an App.


### logs.fetch

\`\`\`python
fetch(self, layers=1)
\`\`\`
Fetch logs for the most recent Image build steps.

**Parameters**

<Parameter name="layers" type="int | None" defaultValue="1" description="The number of build layers to fetch, counting backward from the final Image. If None, logs are fetched for all build steps." />

### logs.tail

\`\`\`python
tail(self, entries=100)
\`\`\`
Fetch the most recent Image logs.

**Parameters**

<Parameter name="entries" type="int" defaultValue="100" description="The number of log entries to return." />
`,meta:{title:`Image`,description:`Base class for container images to run functions in.`}},{toc:m,rawContent:h,meta:g}=p,ie=t(`<code>COPY</code>`),ae=t(`<code>COPY</code>`),oe=t(`<code>fetch()</code>`),se=t(`<code>tail()</code>`),ce=t(`<code>modal app logs</code>`),le=t(`<!> <!> <p>Base class for container images to run functions in.</p> <p>Do not construct this class directly; instead use one of its static factory methods,
such as <code>modal.Image.debian_slim</code>, <code>modal.Image.from_registry</code>, or <code>modal.Image.micromamba</code>.</p> <!> <!> <p>Adds a local file to the image at <code>remote_path</code> within the container.</p> <p>By default (<code>copy=False</code>), the files are added to containers on startup and are not built into the actual Image,
which speeds up deployment.</p> <p>Set <code>copy=True</code> to copy the files into an Image layer at build time instead, similar to how <!> works in a <code>Dockerfile</code>.</p> <p>copy=True can slow down iteration since it requires a rebuild of the Image and any subsequent
build steps whenever the included files change, but it is required if you want to run additional
build steps after this one.</p> <p><em>Added in v0.66.40</em>: This method replaces the deprecated <code>modal.Image.copy_local_file</code> method.</p> <p><strong>Parameters</strong></p> <!> <!> <!> <p><strong>Returns</strong></p> <p>A new <code>Image</code> with the file layer or mount applied.</p> <!> <!> <p>Adds a local directory’s content to the image at <code>remote_path</code> within the container.</p> <p>By default (<code>copy=False</code>), the files are added to containers on startup and are not built into the actual Image,
which speeds up deployment.</p> <p>Set <code>copy=True</code> to copy the files into an Image layer at build time instead, similar to how <!> works in a <code>Dockerfile</code>.</p> <p>copy=True can slow down iteration since it requires a rebuild of the Image and any subsequent
build steps whenever the included files change, but it is required if you want to run additional
build steps after this one.</p> <p><em>Added in v0.66.40</em>: This method replaces the deprecated <code>modal.Image.copy_local_dir</code> method.</p> <p><strong>Parameters</strong></p> <!> <!> <!> <!> <p><strong>Returns</strong></p> <p>A new <code>Image</code> with the directory layer or mount applied.</p> <p><strong>Usage</strong></p> <!> <!> <!> <p>Adds locally available Python packages/modules to containers.</p> <p>Adds all files from the specified Python package or module to containers running the Image.</p> <p>Packages are added to the <code>/root</code> directory of containers, which is on the <code>PYTHONPATH</code> of any executed Modal Functions, enabling import of the module by that name.</p> <p>By default (<code>copy=False</code>), the files are added to containers on startup and are not built into the actual Image,
which speeds up deployment.</p> <p>Set <code>copy=True</code> to copy the files into an Image layer at build time instead. This can slow down iteration since
it requires a rebuild of the Image and any subsequent build steps whenever the included files change, but it is
required if you want to run additional build steps after this one.</p> <p><strong>Note:</strong> This excludes all dot-prefixed subdirectories or files and all <code>.pyc</code>/<code>__pycache__</code> files.
To add full directories with finer control, use <code>.add_local_dir()</code> instead and specify <code>/root</code> as
the destination directory.</p> <p>By default only includes <code>.py</code>-files in the source modules. Set the <code>ignore</code> argument to a list of patterns
or a callable to override this behavior.</p> <p><em>Added in v0.67.28</em>: This method replaces the deprecated <code>modal.Mount.from_local_python_packages</code> pattern.</p> <p><strong>Parameters</strong></p> <!> <!> <!> <p><strong>Returns</strong></p> <p>A new <code>Image</code> with the Python source mount or layer applied.</p> <p><strong>Usage</strong></p> <!> <!> <!> <p>Construct an Image from an id and look up the Image result.</p> <p>The ID of an Image object can be accessed using <code>.object_id</code>.</p> <p><strong>Parameters</strong></p> <!> <!> <p><strong>Returns</strong></p> <p>A hydrated <code>Image</code> handle for the given ID.</p> <!> <!> <p>Eagerly build an image.</p> <p>If your image was previously built, then this method will not rebuild your image
and your cached image is returned.</p> <p>For defining Modal functions, images are built automatically when deploying or running an App.
You do not need to build the image explicitly in that case.</p> <p><strong>Parameters</strong></p> <!> <p><strong>Returns</strong></p> <p>This image after the build (and resolver load) completes.</p> <p><strong>Usage</strong></p> <!> <p>Alternatively, you can pre-build an image and use it in a sandbox:</p> <!> <!> <!> <!> <p>Install a list of Python packages using pip.</p> <p><strong>Parameters</strong></p> <!> <!> <!> <!> <!> <!> <!> <!> <!> <!> <p><strong>Returns</strong></p> <p>A new <code>Image</code> with the pip install layer applied.</p> <p><strong>Usage</strong></p> <p>Simple installation:</p> <!> <p>More complex installation:</p> <!> <!> <!> <p>Install a list of Python packages from private git repositories using pip.</p> <p>This method currently supports Github and Gitlab only.</p> <ul><li><strong>Github:</strong> Provide a <code>modal.Secret</code> that contains a <code>GITHUB_TOKEN</code> key-value pair</li> <li><strong>Gitlab:</strong> Provide a <code>modal.Secret</code> that contains a <code>GITLAB_TOKEN</code> key-value pair</li></ul> <p>These API tokens should have permissions to read the list of private repositories provided as arguments.</p> <p>We recommend using Github’s <!>.
These tokens are repo-scoped, and avoid granting read permission across all of a user’s private repos.</p> <p><strong>Parameters</strong></p> <!> <!> <!> <!> <!> <!> <!> <!> <!> <!> <!> <p><strong>Returns</strong></p> <p>A new <code>Image</code> with private repositories installed.</p> <p><strong>Usage</strong></p> <!> <!> <!> <p>Install a list of Python packages from a local <code>requirements.txt</code> file.</p> <p><strong>Parameters</strong></p> <!> <!> <!> <!> <!> <!> <!> <!> <!> <!> <p><strong>Returns</strong></p> <p>A new <code>Image</code> with requirements installed.</p> <!> <!> <p>Install dependencies specified by a local <code>pyproject.toml</code> file.</p> <p><code>optional_dependencies</code> is a list of the keys of the
optional-dependencies section(s) of the <code>pyproject.toml</code> file
(e.g. test, doc, experiment, etc). When provided,
all of the packages in each listed section are installed as well.</p> <p><strong>Parameters</strong></p> <!> <!> <!> <!> <!> <!> <!> <!> <!> <!> <!> <p><strong>Returns</strong></p> <p>A new <code>Image</code> with project dependencies installed.</p> <!> <!> <p>Install a list of Python packages using uv pip install.</p> <p>This method assumes that:</p> <ul><li>Python is on the <code>$PATH</code> and dependencies are installed with the first Python on the <code>$PATH</code>.</li> <li>The shell supports <code>$()</code>-style substitution as used in the generated Dockerfile.</li> <li>The <code>command</code> builtin is available on the <code>$PATH</code>.</li></ul> <p>Added in v1.1.0.</p> <p><strong>Parameters</strong></p> <!> <!> <!> <!> <!> <!> <!> <!> <!> <!> <!> <!> <p><strong>Returns</strong></p> <p>A new <code>Image</code> with packages installed via uv.</p> <p><strong>Usage</strong></p> <!> <!> <!> <p>Install poetry <em>dependencies</em> specified by a local <code>pyproject.toml</code> file.</p> <p>If not provided as argument the path to the lockfile is inferred. However, the
file has to exist, unless <code>ignore_lockfile</code> is set to <code>True</code>.</p> <p>Note that the root project of the poetry project is not installed, only the dependencies.
For including local python source files see <code>add_local_python_source</code></p> <p>Poetry will be installed to the Image (using pip) unless <code>poetry_version</code> is set to None.
Note that the interpretation of <code>poetry_version="latest"</code> depends on the Modal Image Builder
version, with versions 2024.10 and earlier limiting poetry to 1.x.</p> <p><strong>Parameters</strong></p> <!> <!> <!> <!> <!> <!> <!> <!> <!> <!> <!> <!> <p><strong>Returns</strong></p> <p>A new <code>Image</code> with Poetry dependencies installed.</p> <!> <!> <p>Creates a virtual environment with the dependencies in a uv managed project with <code>uv sync</code>.</p> <p>The <code>pyproject.toml</code> and <code>uv.lock</code> in <code>uv_project_dir</code> are automatically added to the build context. The <code>uv_project_dir</code> is relative to the current working directory of where <code>modal</code> is called.</p> <p>NOTE: This does <em>not</em> install the project itself into the environment (this is equivalent to the <code>--no-install-project</code> flag in the <code>uv sync</code> command) and you would be expected to add any local python source
files using <code>Image.add_local_python_source</code> or similar methods after this call.</p> <p>This ensures that updates to your project code wouldn’t require reinstalling third-party dependencies
after every change.</p> <p>uv workspaces are currently not supported.</p> <p>Added in v1.1.0.</p> <p><strong>Parameters</strong></p> <!> <!> <!> <!> <!> <!> <!> <!> <!> <!> <p><strong>Returns</strong></p> <p>A new <code>Image</code> with a uv-managed virtual environment.</p> <p><strong>Usage</strong></p> <!> <!> <!> <p>Extend an image with arbitrary Dockerfile-like commands.</p> <p><strong>Parameters</strong></p> <!> <!> <!> <!> <!> <!> <!> <!> <!> <p><strong>Returns</strong></p> <p>A new <code>Image</code> with the Dockerfile fragment applied.</p> <p><strong>Usage</strong></p> <!> <!> <!> <p>Set the ENTRYPOINT for the image.</p> <p><strong>Parameters</strong></p> <!> <p><strong>Returns</strong></p> <p>A new <code>Image</code> with the entrypoint Dockerfile directive applied.</p> <!> <!> <p>Overwrite default shell for the image.</p> <p><strong>Parameters</strong></p> <!> <p><strong>Returns</strong></p> <p>A new <code>Image</code> with the shell Dockerfile directive applied.</p> <!> <!> <p>Extend an image with a list of shell commands to run.</p> <p><strong>Parameters</strong></p> <!> <!> <!> <!> <!> <!> <p><strong>Returns</strong></p> <p>A new <code>Image</code> with the commands executed as layers.</p> <!> <!> <p>A Micromamba base image. Micromamba allows for fast building of small Conda-based containers.</p> <p><strong>Parameters</strong></p> <!> <!> <p><strong>Returns</strong></p> <p>A Micromamba-based <code>Image</code>.</p> <!> <!> <p>Install a list of additional packages using micromamba.</p> <p><strong>Parameters</strong></p> <!> <!> <!> <!> <!> <!> <!> <p><strong>Returns</strong></p> <p>A new <code>Image</code> with micromamba packages installed.</p> <!> <!> <p>Build a Modal Image from a public or private image registry, such as Docker Hub.</p> <p>The image must be built for the <code>linux/amd64</code> platform.</p> <p>If your image does not come with Python installed, you can use the <code>add_python</code> parameter
to specify a version of Python to add to the image. Otherwise, the image is expected to
have Python on PATH as <code>python</code>, along with <code>pip</code>.</p> <p>You may also use <code>setup_dockerfile_commands</code> to run Dockerfile commands before the
remaining commands run. This might be useful if you want a custom Python installation or to
set a <code>SHELL</code>. Prefer <code>run_commands()</code> when possible though.</p> <p>To authenticate against a private registry with static credentials, you must set the <code>secret</code> parameter to
a <code>modal.Secret</code> containing a username (<code>REGISTRY_USERNAME</code>) and
an access token or password (<code>REGISTRY_PASSWORD</code>).</p> <p>To authenticate against private registries with credentials from a cloud provider,
use <code>Image.from_gcp_artifact_registry()</code> or <code>Image.from_aws_ecr()</code>.</p> <p><strong>Parameters</strong></p> <!> <!> <!> <!> <!> <!> <p><strong>Returns</strong></p> <p>An <code>Image</code> based on the registry tag.</p> <p><strong>Usage</strong></p> <!> <!> <!> <p>Build a Modal image from a private image in Google Cloud Platform (GCP) Artifact Registry.</p> <p>You will need to pass a <code>modal.Secret</code> containing <!> as <code>SERVICE_ACCOUNT_JSON</code>. This can be done from the <!> page.
Your service account should be granted a specific role depending on the GCP registry used:</p> <ul><li>For Artifact Registry images (<code>pkg.dev</code> domains) use
the <!> role</li> <li>For Container Registry images (<code>gcr.io</code> domains) use
the <!> role</li></ul> <p><strong>Note:</strong> This method does not use <code>GOOGLE_APPLICATION_CREDENTIALS</code> as that
variable accepts a path to a JSON file, not the actual JSON string.</p> <p>See <code>Image.from_registry()</code> for information about the other parameters.</p> <p><strong>Parameters</strong></p> <!> <!> <!> <!> <!> <!> <p><strong>Returns</strong></p> <p>An <code>Image</code> based on the private GCP artifact.</p> <p><strong>Usage</strong></p> <!> <!> <!> <p>Build a Modal image from a private image in AWS Elastic Container Registry (ECR).</p> <p>You will need to pass a <code>modal.Secret</code> containing either IAM user credentials or OIDC
configuration to access the target ECR registry.</p> <p>For IAM user authentication, set <code>AWS_ACCESS_KEY_ID</code>, <code>AWS_SECRET_ACCESS_KEY</code>, and <code>AWS_REGION</code>.</p> <p>For OIDC authentication, set <code>AWS_ROLE_ARN</code> and <code>AWS_REGION</code>.</p> <p>IAM configuration details can be found in the AWS documentation for <!>.</p> <p>For more details on using an AWS role to access ECR, see the <!>.</p> <p>See <code>Image.from_registry()</code> for information about the other parameters.</p> <p><strong>Parameters</strong></p> <!> <!> <!> <!> <!> <!> <p><strong>Returns</strong></p> <p>An <code>Image</code> based on the private ECR image.</p> <p><strong>Usage</strong></p> <!> <!> <!> <p>Build a Modal image from a local Dockerfile.</p> <p>If your Dockerfile does not have Python installed, you can use the <code>add_python</code> parameter
to specify a version of Python to add to the image.</p> <p><strong>Parameters</strong></p> <!> <!> <!> <!> <!> <!> <!> <!> <!> <p><strong>Returns</strong></p> <p>An <code>Image</code> built from the Dockerfile plus Modal runtime dependencies.</p> <p><strong>Usage</strong></p> <!> <!> <!> <p>Create an empty Image, equivalent to <code>FROM scratch</code> in Docker.</p> <p>The resulting Image has no operating system, shell, or package manager. It is
primarily useful as a lightweight filesystem to mount into a Sandbox via <code>Sandbox.mount_image</code>.</p> <p>Note that since this Image doesn’t contain Python or other standard OS utilities,
higher-level Image build steps like <code>pip_install</code> cannot be chained onto it. It also
cannot be used for <code>modal.Function</code> execution, which requires a Python interpreter.</p> <p><strong>Parameters</strong></p> <!> <p><strong>Returns</strong></p> <p>An empty <code>Image</code> suitable for minimal filesystem mounts.</p> <p><strong>Usage</strong></p> <!> <!> <!> <p>Default image, based on the official <code>python</code> Docker images.</p> <p><strong>Parameters</strong></p> <!> <!> <p><strong>Returns</strong></p> <p>The standard Debian slim Python <code>Image</code> used as Modal’s default base.</p> <!> <!> <p>Install a list of Debian packages using <code>apt</code>.</p> <p><strong>Parameters</strong></p> <!> <!> <!> <!> <!> <p><strong>Returns</strong></p> <p>A new <code>Image</code> with <code>apt-get install</code> layers applied.</p> <p><strong>Usage</strong></p> <!> <!> <!> <p>Run user-defined function <code>raw_f</code> as an image build step.</p> <p>The function runs like an ordinary Modal Function, accepting a resource configuration and integrating
with Modal features like Secrets and Volumes. Unlike ordinary Modal Functions, any changes to the
filesystem state will be captured on container exit and saved as a new Image.</p> <p>Only the source code of <code>raw_f</code>, the contents of <code>**kwargs</code>, and any referenced <em>global</em> variables
are used to determine whether the image has changed and needs to be rebuilt.
If this function references other functions or variables, the image will not be rebuilt if you
make changes to them. You can force a rebuild by changing the function’s source code itself.</p> <p><strong>Parameters</strong></p> <!> <!> <!> <!> <!> <!> <!> <!> <!> <!> <!> <!> <!> <!> <!> <p><strong>Returns</strong></p> <p>A new <code>Image</code> capturing the filesystem after <code>raw_f</code> completes.</p> <p><strong>Usage</strong></p> <!> <!> <!> <p>Sets the environment variables in an Image.</p> <p><strong>Parameters</strong></p> <!> <p><strong>Returns</strong></p> <p>A new <code>Image</code> with <code>ENV</code> directives applied.</p> <p><strong>Usage</strong></p> <!> <!> <!> <p>Set the working directory for subsequent image build steps and function execution.</p> <p><strong>Parameters</strong></p> <!> <p><strong>Returns</strong></p> <p>A new <code>Image</code> with <code>WORKDIR</code> applied.</p> <p><strong>Usage</strong></p> <!> <!> <!> <p>Set the default command (<code>CMD</code>) to run when a container is started.</p> <p>Used with <code>modal.Sandbox</code>. Has no effect on <code>modal.Function</code>.</p> <p><strong>Parameters</strong></p> <!> <p><strong>Returns</strong></p> <p>A new <code>Image</code> with <code>CMD</code> applied.</p> <p><strong>Usage</strong></p> <!> <!> <!> <p>Apply a local function to expand the Image recipe.</p> <p>This method can be useful for defining reusable Image build
recipes that compose well with the fluent Image builder interface.</p> <p><strong>Example</strong></p> <!> <!> <!> <p>Used to import packages in global scope that are only available when running remotely.</p> <p>By using this context manager you can avoid an <code>ImportError</code> due to not having certain
packages installed locally.</p> <p><strong>Returns</strong></p> <p>Context manager that records import failures until the image is hydrated in the remote environment.</p> <p><strong>Usage</strong></p> <!> <!> <!> <p>Reference a named Image that was previously published with <code>.publish()</code>.</p> <p>Names can contain an optional <code>:tag</code> part. If no tag part is included, <code>":latest"</code> is used, matching
Docker conventions.</p> <!> <!> <!> <p>Publish this image under the given name</p> <p>The Image must already be created (typically by calling <code>image.build()</code> or <code>sandbox.snapshot_filesystem()</code>).</p> <p>Image names can contain an explicit tag designation using <code>name:tag</code>. If no tag is included in the name, <code>":latest"</code> is used, matching Docker conventions. To publish multiple tags, call <code>.publish()</code> once per tag.</p> <!> <!> <!> <p>Access logs for an <code>Image</code>.</p> <p>Use <!> to read logs for individual build layers and <!> to read the most recent logs.</p> <p><strong>See Also</strong></p> <ul><li><!>:
CLI access to logs for an App.</li></ul> <!> <!> <p>Fetch logs for the most recent Image build steps.</p> <p><strong>Parameters</strong></p> <!> <!> <!> <p>Fetch the most recent Image logs.</p> <p><strong>Parameters</strong></p> <!>`,1);function _(t,m){let h=ee(m,[`children`,`$$slots`,`$$events`,`$$legacy`]);u(t,a(()=>h,()=>p,{children:(t,ee)=>{var a=le(),u=te(a);re(u,{id:`image`,children:(e,t)=>{s(),i(e,r(`Image`))},$$slots:{default:!0}});var p=o(u,2);l(p,{code:`class%20Image(modal.object.Object)`,lang:`python`});var m=o(p,6);c(m,{id:`add_local_file`,children:(e,t)=>{s(),i(e,r(`add_local_file`))},$$slots:{default:!0}});var h=o(m,2);l(h,{code:`add_local_file(self%2C%20local_path%2C%20remote_path%2C%20*%2C%20copy%3DFalse)`,lang:`python`});var g=o(h,6);d(o(e(g),3),{href:`https://docs.docker.com/engine/reference/builder/#copy`,rel:`nofollow`,children:(e,t)=>{i(e,ie())},$$slots:{default:!0}}),s(3),n(g);var _=o(g,8);f(_,{name:`local_path`,type:`str | Path`,description:`Path to the file on the local machine.`});var ue=o(_,2);f(ue,{name:`remote_path`,type:`str`,description:`Absolute path inside the container where the file should appear.`});var v=o(ue,2);f(v,{name:`copy`,type:`bool`,defaultValue:`False`,description:`If True, bake the file into an image layer at build time; if False, mount at container startup.`});var y=o(v,6);c(y,{id:`add_local_dir`,children:(e,t)=>{s(),i(e,r(`add_local_dir`))},$$slots:{default:!0}});var b=o(y,2);l(b,{code:`add_local_dir(self%2C%20local_path%2C%20remote_path%2C%20*%2C%20copy%3DFalse%2C%20ignore%3D%5B%5D)`,lang:`python`});var x=o(b,6);d(o(e(x),3),{href:`https://docs.docker.com/engine/reference/builder/#copy`,rel:`nofollow`,children:(e,t)=>{i(e,ae())},$$slots:{default:!0}}),s(3),n(x);var S=o(x,8);f(S,{name:`local_path`,type:`str | Path`,description:`Path to the directory on the local machine.`});var C=o(S,2);f(C,{name:`remote_path`,type:`str`,description:`Absolute path inside the container where the directory contents should appear.`});var w=o(C,2);f(w,{name:`copy`,type:`bool`,defaultValue:`False`,description:`If True, bake the tree into an image layer at build time; if False, mount at container startup.`});var T=o(w,2);f(T,{name:`ignore`,type:`Sequence[str] | Callable[[Path], bool]`,defaultValue:`[]`,description:`Predicate or pattern list for file exclusion (True means exclude). A sequence is converted to a dockerignore-style matcher.`});var E=o(T,8);l(E,{code:`from%20modal%20import%20FilePatternMatcher%0A%0Aimage%20%3D%20modal.Image.debian_slim().add_local_dir(%0A%20%20%20%20%22~%2Fassets%22%2C%0A%20%20%20%20remote_path%3D%22%2Fassets%22%2C%0A%20%20%20%20ignore%3D%5B%22*.venv%22%5D%2C%0A)%0A%0Aimage%20%3D%20modal.Image.debian_slim().add_local_dir(%0A%20%20%20%20%22~%2Fassets%22%2C%0A%20%20%20%20remote_path%3D%22%2Fassets%22%2C%0A%20%20%20%20ignore%3Dlambda%20p%3A%20p.is_relative_to(%22.venv%22)%2C%0A)%0A%0Aimage%20%3D%20modal.Image.debian_slim().add_local_dir(%0A%20%20%20%20%22~%2Fassets%22%2C%0A%20%20%20%20remote_path%3D%22%2Fassets%22%2C%0A%20%20%20%20ignore%3DFilePatternMatcher(%22**%2F*.txt%22)%2C%0A)%0A%0A%23%20When%20including%20files%20is%20simpler%20than%20excluding%20them%2C%20you%20can%20use%20the%20%60~%60%20operator%20to%20invert%20the%20matcher.%0Aimage%20%3D%20modal.Image.debian_slim().add_local_dir(%0A%20%20%20%20%22~%2Fassets%22%2C%0A%20%20%20%20remote_path%3D%22%2Fassets%22%2C%0A%20%20%20%20ignore%3D~FilePatternMatcher(%22**%2F*.py%22)%2C%0A)%0A%0A%23%20You%20can%20also%20read%20ignore%20patterns%20from%20a%20file.%0Aimage%20%3D%20modal.Image.debian_slim().add_local_dir(%0A%20%20%20%20%22~%2Fassets%22%2C%0A%20%20%20%20remote_path%3D%22%2Fassets%22%2C%0A%20%20%20%20ignore%3DFilePatternMatcher.from_file(%22%2Fpath%2Fto%2Fignorefile%22)%2C%0A)`,lang:`python`});var D=o(E,2);c(D,{id:`add_local_python_source`,children:(e,t)=>{s(),i(e,r(`add_local_python_source`))},$$slots:{default:!0}});var O=o(D,2);l(O,{code:`add_local_python_source(self%2C%20*modules%2C%20copy%3DFalse%2C%20ignore%3DNON_PYTHON_FILES)`,lang:`python`});var k=o(O,20);f(k,{name:`*modules`,type:`str`,description:`Python package or module names to include from the local project.`});var A=o(k,2);f(A,{name:`copy`,type:`bool`,defaultValue:`False`,description:`If True, bake sources into an image layer; if False, mount at container startup.`});var j=o(A,2);f(j,{name:`ignore`,type:`Sequence[str] | Callable[[Path], bool]`,defaultValue:`NON_PYTHON_FILES`,description:`Patterns or callable controlling which files to exclude.`});var M=o(j,8);l(M,{code:`%23%20includes%20everything%20except%20data.json%0Amodal.Image.debian_slim().add_local_python_source(%22mymodule%22%2C%20ignore%3D%5B%22data.json%22%5D)%0A%0A%23%20exclude%20large%20files%0Amodal.Image.debian_slim().add_local_python_source(%0A%20%20%20%20%22mymodule%22%2C%0A%20%20%20%20ignore%3Dlambda%20p%3A%20p.stat().st_size%20%3E%201e9%0A)`,lang:`py`});var N=o(M,2);c(N,{id:`from_id`,children:(e,t)=>{s(),i(e,r(`from_id`))},$$slots:{default:!0}});var P=o(N,2);l(P,{code:`from_id(cls%2C%20image_id%2C%20client%3DNone)`,lang:`python`});var F=o(P,8);f(F,{name:`image_id`,type:`str`,description:`Image object ID to load.`});var I=o(F,2);f(I,{name:`client`,type:`"modal.client.Client | None"`,defaultValue:`None`,description:`Optional Modal client; uses the default synchronizer client when omitted.`});var L=o(I,6);c(L,{id:`build`,children:(e,t)=>{s(),i(e,r(`build`))},$$slots:{default:!0}});var R=o(L,2);l(R,{code:`build(self%2C%20app)`,lang:`python`});var z=o(R,10);f(z,{name:`app`,type:`modal.app._App`,description:`Initialized app used as the load context for the image build.`});var B=o(z,8);l(B,{code:`image%20%3D%20modal.Image.debian_slim().uv_pip_install(%22scipy%22%2C%20%22numpy%22)%0A%0Aapp%20%3D%20modal.App.lookup(%22build-image%22%2C%20create_if_missing%3DTrue)%0Awith%20modal.enable_output()%3A%20%20%23%20To%20see%20logs%20in%20your%20local%20terminal%0A%20%20%20%20image.build(app)%0A%0A%23%20Save%20the%20image%20id%0Amy_image_id%20%3D%20image.object_id%0A%0A%23%20Reference%20the%20image%20with%20the%20id%20or%20uses%20it%20another%20context.%0Abuilt_image%20%3D%20modal.Image.from_id(my_image_id)`,lang:`python`});var V=o(B,4);l(V,{code:`app%20%3D%20modal.App.lookup(%22sandbox-example%22%2C%20create_if_missing%3DTrue)%0A%0Awith%20modal.enable_output()%3A%0A%20%20%20%20image%20%3D%20modal.Image.debian_slim().uv_pip_install(%22scipy%22)%0A%20%20%20%20image.build(app)%0A%0Asb%20%3D%20modal.Sandbox.create(%22python%22%2C%20%22-c%22%2C%20%22import%20scipy%3B%20print(scipy)%22%2C%20app%3Dapp%2C%20image%3Dimage)%0Aprint(sb.stdout.read())%0Asb.terminate()`,lang:`python`});var H=o(V,2);l(H,{code:`app%20%3D%20modal.App()%0Aimage%20%3D%20modal.Image.debian_slim()%0A%0A%23%20No%20need%20to%20explicitly%20build%20the%20image%20for%20defining%20a%20function.%0A%40app.function(image%3Dimage)%0Adef%20f()%3A%0A%20%20%20%20...`,lang:`python`});var U=o(H,2);c(U,{id:`pip_install`,children:(e,t)=>{s(),i(e,r(`pip_install`))},$$slots:{default:!0}});var W=o(U,2);l(W,{code:`pip_install(self%2C%20*packages%2C%20find_links%3DNone%2C%20index_url%3DNone%2C%0A%20%20%20%20extra_index_url%3DNone%2C%20pre%3DFalse%2C%20extra_options%3D%22%22%2C%20force_build%3DFalse%2C%0A%20%20%20%20env%3DNone%2C%20secrets%3DNone%2C%20gpu%3DNone)`,lang:`python`});var de=o(W,6);f(de,{name:`*packages`,type:`str | list[str]`,description:"Python packages to install, e.g. ``numpy`` or ``matplotlib>=3.5.0``."});var fe=o(de,2);f(fe,{name:`find_links`,type:`str | None`,defaultValue:`None`,description:"Passed as ``--find-links`` to pip."});var pe=o(fe,2);f(pe,{name:`index_url`,type:`str | None`,defaultValue:`None`,description:"Passed as ``--index-url`` to pip."});var me=o(pe,2);f(me,{name:`extra_index_url`,type:`str | None`,defaultValue:`None`,description:"Passed as ``--extra-index-url`` to pip."});var he=o(me,2);f(he,{name:`pre`,type:`bool`,defaultValue:`False`,description:"If True, allow pre-release versions (``--pre``)."});var ge=o(he,2);f(ge,{name:`extra_options`,type:`str`,defaultValue:`""`,description:"Additional raw options for pip, e.g. ``--no-build-isolation``."});var _e=o(ge,2);f(_e,{name:`force_build`,type:`bool`,defaultValue:`False`,description:"If True, skip cached image builds (similar to ``docker build --no-cache``)."});var ve=o(_e,2);f(ve,{name:`env`,type:`dict[str, str | None] | None`,defaultValue:`None`,description:`Environment variables set in the build container.`});var ye=o(ve,2);f(ye,{name:`secrets`,type:`Collection[_Secret] | None`,defaultValue:`None`,description:`Secrets injected as environment variables during the build.`});var be=o(ye,2);f(be,{name:`gpu`,type:`str | None`,defaultValue:`None`,description:`GPU type to attach to the builder container.`});var xe=o(be,10);l(xe,{code:`image%20%3D%20modal.Image.debian_slim().pip_install(%22click%22%2C%20%22httpx~%3D0.23.3%22)`,lang:`python`});var Se=o(xe,4);l(Se,{code:`image%20%3D%20(%0A%20%20%20%20modal.Image.from_registry(%0A%20%20%20%20%20%20%20%20%22nvidia%2Fcuda%3A12.2.0-devel-ubuntu22.04%22%2C%20add_python%3D%223.11%22%0A%20%20%20%20)%0A%20%20%20%20.pip_install(%0A%20%20%20%20%20%20%20%20%22ninja%22%2C%0A%20%20%20%20%20%20%20%20%22packaging%22%2C%0A%20%20%20%20%20%20%20%20%22wheel%22%2C%0A%20%20%20%20%20%20%20%20%22transformers%3D%3D4.40.2%22%2C%0A%20%20%20%20)%0A%20%20%20%20.pip_install(%0A%20%20%20%20%20%20%20%20%22flash-attn%3D%3D2.5.8%22%2C%20extra_options%3D%22--no-build-isolation%22%0A%20%20%20%20)%0A)`,lang:`python`});var Ce=o(Se,2);c(Ce,{id:`pip_install_private_repos`,children:(e,t)=>{s(),i(e,r(`pip_install_private_repos`))},$$slots:{default:!0}});var we=o(Ce,2);l(we,{code:`pip_install_private_repos(self%2C%20*repositories%2C%20git_user%2C%20find_links%3DNone%2C%0A%20%20%20%20index_url%3DNone%2C%20extra_index_url%3DNone%2C%20pre%3DFalse%2C%20extra_options%3D%22%22%2C%20gpu%3DNone%2C%0A%20%20%20%20env%3DNone%2C%20secrets%3DNone%2C%20force_build%3DFalse)`,lang:`python`});var G=o(we,10);d(o(e(G)),{href:`https://github.blog/2022-10-18-introducing-fine-grained-personal-access-tokens-for-github/`,rel:`nofollow`,children:(e,t)=>{s(),i(e,r(`‘fine-grained’ access tokens`))},$$slots:{default:!0}}),s(),n(G);var Te=o(G,4);f(Te,{name:`*repositories`,type:`str`,description:"Git URLs without scheme, e.g. ``github.com/org/repo@ref`` or with ``#subdirectory=``."});var Ee=o(Te,2);f(Ee,{name:`git_user`,type:`str`,description:`Username embedded in HTTPS git URLs for authentication.`});var De=o(Ee,2);f(De,{name:`find_links`,type:`str | None`,defaultValue:`None`,description:"Passed as ``--find-links`` to pip."});var Oe=o(De,2);f(Oe,{name:`index_url`,type:`str | None`,defaultValue:`None`,description:"Passed as ``--index-url`` to pip."});var ke=o(Oe,2);f(ke,{name:`extra_index_url`,type:`str | None`,defaultValue:`None`,description:"Passed as ``--extra-index-url`` to pip."});var Ae=o(ke,2);f(Ae,{name:`pre`,type:`bool`,defaultValue:`False`,description:`If True, allow pre-release versions.`});var je=o(Ae,2);f(je,{name:`extra_options`,type:`str`,defaultValue:`""`,description:`Additional raw options for pip.`});var Me=o(je,2);f(Me,{name:`gpu`,type:`str | None`,defaultValue:`None`,description:`GPU type to attach to the builder container.`});var Ne=o(Me,2);f(Ne,{name:`env`,type:`dict[str, str | None] | None`,defaultValue:`None`,description:`Environment variables set in the build container.`});var Pe=o(Ne,2);f(Pe,{name:`secrets`,type:`Collection[_Secret] | None`,defaultValue:`None`,description:"Secrets that supply ``GITHUB_TOKEN`` / ``GITLAB_TOKEN`` as required."});var Fe=o(Pe,2);f(Fe,{name:`force_build`,type:`bool`,defaultValue:`False`,description:`If True, skip cached image builds.`});var Ie=o(Fe,8);l(Ie,{code:`image%20%3D%20(%0A%20%20%20%20modal.Image%0A%20%20%20%20.debian_slim()%0A%20%20%20%20.pip_install_private_repos(%0A%20%20%20%20%20%20%20%20%22github.com%2Fecorp%2Fprivate-one%401.0.0%22%2C%0A%20%20%20%20%20%20%20%20%22github.com%2Fecorp%2Fprivate-two%40main%22%0A%20%20%20%20%20%20%20%20%22github.com%2Fecorp%2Fprivate-three%40d4776502%22%0A%20%20%20%20%20%20%20%20%23%20install%20from%20'inner'%20directory%20on%20default%20branch.%0A%20%20%20%20%20%20%20%20%22github.com%2Fecorp%2Fprivate-four%23subdirectory%3Dinner%22%2C%0A%20%20%20%20%20%20%20%20git_user%3D%22erikbern%22%2C%0A%20%20%20%20%20%20%20%20secrets%3D%5Bmodal.Secret.from_name(%22github-read-private%22)%5D%2C%0A%20%20%20%20)%0A)`,lang:`python`});var Le=o(Ie,2);c(Le,{id:`pip_install_from_requirements`,children:(e,t)=>{s(),i(e,r(`pip_install_from_requirements`))},$$slots:{default:!0}});var Re=o(Le,2);l(Re,{code:`pip_install_from_requirements(self%2C%20requirements_txt%2C%20find_links%3DNone%2C%20*%2C%0A%20%20%20%20index_url%3DNone%2C%20extra_index_url%3DNone%2C%20pre%3DFalse%2C%20extra_options%3D%22%22%2C%0A%20%20%20%20force_build%3DFalse%2C%20env%3DNone%2C%20secrets%3DNone%2C%20gpu%3DNone)`,lang:`python`});var ze=o(Re,6);f(ze,{name:`requirements_txt`,type:`str`,description:"Path to a ``requirements.txt`` file on the local machine."});var Be=o(ze,2);f(Be,{name:`find_links`,type:`str | None`,defaultValue:`None`,description:"Passed as ``--find-links`` to pip."});var Ve=o(Be,2);f(Ve,{name:`index_url`,type:`str | None`,defaultValue:`None`,description:"Passed as ``--index-url`` to pip."});var He=o(Ve,2);f(He,{name:`extra_index_url`,type:`str | None`,defaultValue:`None`,description:"Passed as ``--extra-index-url`` to pip."});var Ue=o(He,2);f(Ue,{name:`pre`,type:`bool`,defaultValue:`False`,description:`If True, allow pre-release versions.`});var We=o(Ue,2);f(We,{name:`extra_options`,type:`str`,defaultValue:`""`,description:`Additional raw options for pip.`});var Ge=o(We,2);f(Ge,{name:`force_build`,type:`bool`,defaultValue:`False`,description:`If True, skip cached image builds.`});var Ke=o(Ge,2);f(Ke,{name:`env`,type:`dict[str, str | None] | None`,defaultValue:`None`,description:`Environment variables set in the build container.`});var qe=o(Ke,2);f(qe,{name:`secrets`,type:`Collection[_Secret] | None`,defaultValue:`None`,description:`Secrets injected as environment variables during the build.`});var Je=o(qe,2);f(Je,{name:`gpu`,type:`str | None`,defaultValue:`None`,description:`GPU type to attach to the builder container.`});var Ye=o(Je,6);c(Ye,{id:`pip_install_from_pyproject`,children:(e,t)=>{s(),i(e,r(`pip_install_from_pyproject`))},$$slots:{default:!0}});var Xe=o(Ye,2);l(Xe,{code:`pip_install_from_pyproject(self%2C%20pyproject_toml%2C%20optional_dependencies%3D%5B%5D%2C%20*%2C%0A%20%20%20%20find_links%3DNone%2C%20index_url%3DNone%2C%20extra_index_url%3DNone%2C%20pre%3DFalse%2C%0A%20%20%20%20extra_options%3D%22%22%2C%20force_build%3DFalse%2C%20env%3DNone%2C%20secrets%3DNone%2C%20gpu%3DNone)`,lang:`python`});var Ze=o(Xe,8);f(Ze,{name:`pyproject_toml`,type:`str`,description:"Path to a ``pyproject.toml`` using PEP 621 ``[project.dependencies]``."});var Qe=o(Ze,2);f(Qe,{name:`optional_dependencies`,type:`list[str]`,defaultValue:`[]`,description:"Keys under ``[project.optional-dependencies]`` to install additionally."});var $e=o(Qe,2);f($e,{name:`find_links`,type:`str | None`,defaultValue:`None`,description:"Passed as ``--find-links`` to pip."});var et=o($e,2);f(et,{name:`index_url`,type:`str | None`,defaultValue:`None`,description:"Passed as ``--index-url`` to pip."});var tt=o(et,2);f(tt,{name:`extra_index_url`,type:`str | None`,defaultValue:`None`,description:"Passed as ``--extra-index-url`` to pip."});var nt=o(tt,2);f(nt,{name:`pre`,type:`bool`,defaultValue:`False`,description:`If True, allow pre-release versions.`});var rt=o(nt,2);f(rt,{name:`extra_options`,type:`str`,defaultValue:`""`,description:`Additional raw options for pip.`});var it=o(rt,2);f(it,{name:`force_build`,type:`bool`,defaultValue:`False`,description:`If True, skip cached image builds.`});var at=o(it,2);f(at,{name:`env`,type:`dict[str, str | None] | None`,defaultValue:`None`,description:`Environment variables set in the build container.`});var ot=o(at,2);f(ot,{name:`secrets`,type:`Collection[_Secret] | None`,defaultValue:`None`,description:`Secrets injected as environment variables during the build.`});var st=o(ot,2);f(st,{name:`gpu`,type:`str | None`,defaultValue:`None`,description:`GPU type to attach to the builder container.`});var ct=o(st,6);c(ct,{id:`uv_pip_install`,children:(e,t)=>{s(),i(e,r(`uv_pip_install`))},$$slots:{default:!0}});var lt=o(ct,2);l(lt,{code:`uv_pip_install(self%2C%20*packages%2C%20requirements%3DNone%2C%20find_links%3DNone%2C%0A%20%20%20%20index_url%3DNone%2C%20extra_index_url%3DNone%2C%20pre%3DFalse%2C%20extra_options%3D%22%22%2C%0A%20%20%20%20force_build%3DFalse%2C%20uv_version%3DNone%2C%20env%3DNone%2C%20secrets%3DNone%2C%20gpu%3DNone)`,lang:`python`});var ut=o(lt,12);f(ut,{name:`*packages`,type:`str | list[str]`,description:"Python packages to pass to ``uv pip install``."});var dt=o(ut,2);f(dt,{name:`requirements`,type:`list[str] | None`,defaultValue:`None`,description:"Optional list of requirement file paths (passed as ``--requirements``)."});var ft=o(dt,2);f(ft,{name:`find_links`,type:`str | None`,defaultValue:`None`,description:"Passed as ``--find-links`` to ``uv pip``."});var pt=o(ft,2);f(pt,{name:`index_url`,type:`str | None`,defaultValue:`None`,description:"Passed as ``--index-url`` to ``uv pip``."});var mt=o(pt,2);f(mt,{name:`extra_index_url`,type:`str | None`,defaultValue:`None`,description:"Passed as ``--extra-index-url`` to ``uv pip``."});var ht=o(mt,2);f(ht,{name:`pre`,type:`bool`,defaultValue:`False`,description:"If True, allow pre-releases (``--prerelease allow``)."});var gt=o(ht,2);f(gt,{name:`extra_options`,type:`str`,defaultValue:`""`,description:"Additional raw options appended to the ``uv pip install`` invocation."});var _t=o(gt,2);f(_t,{name:`force_build`,type:`bool`,defaultValue:`False`,description:`If True, skip cached image builds.`});var vt=o(_t,2);f(vt,{name:`uv_version`,type:`str | None`,defaultValue:`None`,description:"Pin the uv binary version copied from ``ghcr.io/astral-sh/uv``."});var yt=o(vt,2);f(yt,{name:`env`,type:`dict[str, str | None] | None`,defaultValue:`None`,description:`Environment variables set in the build container.`});var bt=o(yt,2);f(bt,{name:`secrets`,type:`Collection[_Secret] | None`,defaultValue:`None`,description:`Secrets injected as environment variables during the build.`});var xt=o(bt,2);f(xt,{name:`gpu`,type:`str | None`,defaultValue:`None`,description:`GPU type to attach to the builder container.`});var St=o(xt,8);l(St,{code:`image%20%3D%20modal.Image.debian_slim().uv_pip_install(%22torch%3D%3D2.7.1%22%2C%20%22numpy%22)`,lang:`python`});var Ct=o(St,2);c(Ct,{id:`poetry_install_from_file`,children:(e,t)=>{s(),i(e,r(`poetry_install_from_file`))},$$slots:{default:!0}});var wt=o(Ct,2);l(wt,{code:`poetry_install_from_file(self%2C%20poetry_pyproject_toml%2C%20poetry_lockfile%3DNone%2C%20*%2C%0A%20%20%20%20ignore_lockfile%3DFalse%2C%20force_build%3DFalse%2C%20with_%3D%5B%5D%2C%20without%3D%5B%5D%2C%20only%3D%5B%5D%2C%0A%20%20%20%20poetry_version%3D%22latest%22%2C%20old_installer%3DFalse%2C%20env%3DNone%2C%20secrets%3DNone%2C%0A%20%20%20%20gpu%3DNone)`,lang:`python`});var Tt=o(wt,12);f(Tt,{name:`poetry_pyproject_toml`,type:`str`,description:"Path to a Poetry ``pyproject.toml`` file."});var Et=o(Tt,2);f(Et,{name:`poetry_lockfile`,type:`str | None`,defaultValue:`None`,description:"Path to ``poetry.lock``; if omitted, inferred next to the pyproject."});var Dt=o(Et,2);f(Dt,{name:`ignore_lockfile`,type:`bool`,defaultValue:`False`,description:`If True, do not copy or use a lockfile even when present.`});var Ot=o(Dt,2);f(Ot,{name:`force_build`,type:`bool`,defaultValue:`False`,description:`If True, skip cached image builds.`});var kt=o(Ot,2);f(kt,{name:`with_`,type:`list[str]`,defaultValue:`[]`,description:"Optional dependency groups to include (``poetry install --with``)."});var At=o(kt,2);f(At,{name:`without`,type:`list[str]`,defaultValue:`[]`,description:"Optional dependency groups to exclude (``poetry install --without``)."});var jt=o(At,2);f(jt,{name:`only`,type:`list[str]`,defaultValue:`[]`,description:"Only install dependency groups in this list (``poetry install --only``)."});var Mt=o(jt,2);f(Mt,{name:`poetry_version`,type:`str | None`,defaultValue:`"latest"`,description:"Poetry version specifier to ``pip install``, or None to skip installing Poetry."});var Nt=o(Mt,2);f(Nt,{name:`old_installer`,type:`bool`,defaultValue:`False`,description:`If True, use Poetry's legacy installer.`});var Pt=o(Nt,2);f(Pt,{name:`env`,type:`dict[str, str | None] | None`,defaultValue:`None`,description:`Environment variables set in the build container.`});var Ft=o(Pt,2);f(Ft,{name:`secrets`,type:`Collection[_Secret] | None`,defaultValue:`None`,description:`Secrets injected as environment variables during the build.`});var It=o(Ft,2);f(It,{name:`gpu`,type:`str | None`,defaultValue:`None`,description:`GPU type to attach to the builder container.`});var Lt=o(It,6);c(Lt,{id:`uv_sync`,children:(e,t)=>{s(),i(e,r(`uv_sync`))},$$slots:{default:!0}});var Rt=o(Lt,2);l(Rt,{code:`uv_sync(self%2C%20uv_project_dir%3D%22.%2F%22%2C%20*%2C%20force_build%3DFalse%2C%20groups%3DNone%2C%0A%20%20%20%20extras%3DNone%2C%20frozen%3DTrue%2C%20extra_options%3D%22%22%2C%20uv_version%3DNone%2C%20env%3DNone%2C%0A%20%20%20%20secrets%3DNone%2C%20gpu%3DNone)`,lang:`python`});var zt=o(Rt,16);f(zt,{name:`uv_project_dir`,type:`str`,defaultValue:`"./"`,description:"Path to the local uv project directory (contains ``pyproject.toml``)."});var Bt=o(zt,2);f(Bt,{name:`force_build`,type:`bool`,defaultValue:`False`,description:`If True, skip cached image builds.`});var Vt=o(Bt,2);f(Vt,{name:`groups`,type:`list[str] | None`,defaultValue:`None`,description:"Dependency groups passed as ``uv sync --group``."});var Ht=o(Vt,2);f(Ht,{name:`extras`,type:`list[str] | None`,defaultValue:`None`,description:"Optional extras passed as ``uv sync --extra``."});var Ut=o(Ht,2);f(Ut,{name:`frozen`,type:`bool`,defaultValue:`True`,description:"If True and a ``uv.lock`` exists, run ``uv sync --frozen`` so the lock is not updated at build time."});var Wt=o(Ut,2);f(Wt,{name:`extra_options`,type:`str`,defaultValue:`""`,description:"Additional raw options appended to ``uv sync``."});var Gt=o(Wt,2);f(Gt,{name:`uv_version`,type:`str | None`,defaultValue:`None`,description:"Pin the uv binary version copied from ``ghcr.io/astral-sh/uv``."});var Kt=o(Gt,2);f(Kt,{name:`env`,type:`dict[str, str | None] | None`,defaultValue:`None`,description:`Environment variables set in the build container.`});var qt=o(Kt,2);f(qt,{name:`secrets`,type:`Collection[_Secret] | None`,defaultValue:`None`,description:`Secrets injected as environment variables during the build.`});var Jt=o(qt,2);f(Jt,{name:`gpu`,type:`str | None`,defaultValue:`None`,description:`GPU type to attach to the builder container.`});var Yt=o(Jt,8);l(Yt,{code:`image%20%3D%20modal.Image.debian_slim().uv_sync()`,lang:`python`});var Xt=o(Yt,2);c(Xt,{id:`dockerfile_commands`,children:(e,t)=>{s(),i(e,r(`dockerfile_commands`))},$$slots:{default:!0}});var Zt=o(Xt,2);l(Zt,{code:`dockerfile_commands(self%2C%20*dockerfile_commands%2C%20context_files%3D%7B%7D%2C%20env%3DNone%2C%0A%20%20%20%20secrets%3DNone%2C%20gpu%3DNone%2C%20context_dir%3DNone%2C%20force_build%3DFalse%2C%0A%20%20%20%20ignore%3DAUTO_DOCKERIGNORE%2C%20build_args%3D%7B%7D)`,lang:`python`});var Qt=o(Zt,6);f(Qt,{name:`*dockerfile_commands`,type:`str | list[str]`,description:"Dockerfile lines to append after ``FROM base`` (strings or nested lists)."});var $t=o(Qt,2);f($t,{name:`context_files`,type:`dict[str, str]`,defaultValue:`{}`,description:`Map of container paths to local files to include in the build context.`});var en=o($t,2);f(en,{name:`env`,type:`dict[str, str | None] | None`,defaultValue:`None`,description:`Environment variables set in the build container.`});var tn=o(en,2);f(tn,{name:`secrets`,type:`Collection[_Secret] | None`,defaultValue:`None`,description:`Secrets injected as environment variables during the build.`});var nn=o(tn,2);f(nn,{name:`gpu`,type:`str | None`,defaultValue:`None`,description:`GPU type to attach to the builder container.`});var rn=o(nn,2);f(rn,{name:`context_dir`,type:`Path | str | None`,defaultValue:`None`,description:`Root directory for resolving relative COPY paths in implicit context mounts.`});var an=o(rn,2);f(an,{name:`force_build`,type:`bool`,defaultValue:`False`,description:`If True, skip cached image builds.`});var on=o(an,2);f(on,{name:`ignore`,type:`Sequence[str] | Callable[[Path], bool]`,defaultValue:`AUTO_DOCKERIGNORE`,description:"Ignore rules for the implicit context mount (defaults to auto ``.dockerignore`` behavior)."});var sn=o(on,2);f(sn,{name:`build_args`,type:`dict[str, str]`,defaultValue:`{}`,description:"Dockerfile ``ARG`` values forwarded to the build."});var cn=o(sn,8);l(cn,{code:`from%20modal%20import%20FilePatternMatcher%0A%0A%23%20By%20default%20a%20.dockerignore%20file%20is%20used%20if%20present%20in%20the%20current%20working%20directory%0Aimage%20%3D%20modal.Image.debian_slim().dockerfile_commands(%0A%20%20%20%20%5B%22COPY%20data%20%2Fdata%22%5D%2C%0A)%0A%0Aimage%20%3D%20modal.Image.debian_slim().dockerfile_commands(%0A%20%20%20%20%5B%22COPY%20data%20%2Fdata%22%5D%2C%0A%20%20%20%20ignore%3D%5B%22*.venv%22%5D%2C%0A)%0A%0Aimage%20%3D%20modal.Image.debian_slim().dockerfile_commands(%0A%20%20%20%20%5B%22COPY%20data%20%2Fdata%22%5D%2C%0A%20%20%20%20ignore%3Dlambda%20p%3A%20p.is_relative_to(%22.venv%22)%2C%0A)%0A%0Aimage%20%3D%20modal.Image.debian_slim().dockerfile_commands(%0A%20%20%20%20%5B%22COPY%20data%20%2Fdata%22%5D%2C%0A%20%20%20%20ignore%3DFilePatternMatcher(%22**%2F*.txt%22)%2C%0A)%0A%0A%23%20When%20including%20files%20is%20simpler%20than%20excluding%20them%2C%20you%20can%20use%20the%20%60~%60%20operator%20to%20invert%20the%20matcher.%0Aimage%20%3D%20modal.Image.debian_slim().dockerfile_commands(%0A%20%20%20%20%5B%22COPY%20data%20%2Fdata%22%5D%2C%0A%20%20%20%20ignore%3D~FilePatternMatcher(%22**%2F*.py%22)%2C%0A)%0A%0A%23%20You%20can%20also%20read%20ignore%20patterns%20from%20a%20file.%0Aimage%20%3D%20modal.Image.debian_slim().dockerfile_commands(%0A%20%20%20%20%5B%22COPY%20data%20%2Fdata%22%5D%2C%0A%20%20%20%20ignore%3DFilePatternMatcher.from_file(%22%2Fpath%2Fto%2Fdockerignore%22)%2C%0A)`,lang:`python`});var ln=o(cn,2);c(ln,{id:`entrypoint`,children:(e,t)=>{s(),i(e,r(`entrypoint`))},$$slots:{default:!0}});var un=o(ln,2);l(un,{code:`entrypoint(self%2C%20entrypoint_commands)`,lang:`python`});var dn=o(un,6);f(dn,{name:`entrypoint_commands`,type:`list[str]`,description:"argv tokens for the ``ENTRYPOINT`` JSON array form."});var fn=o(dn,6);c(fn,{id:`shell`,children:(e,t)=>{s(),i(e,r(`shell`))},$$slots:{default:!0}});var pn=o(fn,2);l(pn,{code:`shell(self%2C%20shell_commands)`,lang:`python`});var mn=o(pn,6);f(mn,{name:`shell_commands`,type:`list[str]`,description:"argv tokens for the ``SHELL`` JSON array form."});var hn=o(mn,6);c(hn,{id:`run_commands`,children:(e,t)=>{s(),i(e,r(`run_commands`))},$$slots:{default:!0}});var gn=o(hn,2);l(gn,{code:`run_commands(self%2C%20*commands%2C%20env%3DNone%2C%20secrets%3DNone%2C%20volumes%3DNone%2C%20gpu%3DNone%2C%0A%20%20%20%20force_build%3DFalse)`,lang:`python`});var _n=o(gn,6);f(_n,{name:`*commands`,type:`str | list[str]`,description:"Shell commands to run as separate ``RUN`` lines (strings or nested lists)."});var vn=o(_n,2);f(vn,{name:`env`,type:`dict[str, str | None] | None`,defaultValue:`None`,description:`Environment variables set in the build container.`});var yn=o(vn,2);f(yn,{name:`secrets`,type:`Collection[_Secret] | None`,defaultValue:`None`,description:`Secrets injected as environment variables during the build.`});var bn=o(yn,2);f(bn,{name:`volumes`,type:`dict[str | PurePosixPath, _Volume] | None`,defaultValue:`None`,description:`Modal volumes to attach during the build step.`});var xn=o(bn,2);f(xn,{name:`gpu`,type:`str | None`,defaultValue:`None`,description:`GPU type to attach to the builder container.`});var Sn=o(xn,2);f(Sn,{name:`force_build`,type:`bool`,defaultValue:`False`,description:`If True, skip cached image builds.`});var Cn=o(Sn,6);c(Cn,{id:`micromamba`,children:(e,t)=>{s(),i(e,r(`micromamba`))},$$slots:{default:!0}});var wn=o(Cn,2);l(wn,{code:`micromamba(python_version%3DNone%2C%20force_build%3DFalse)`,lang:`python`});var Tn=o(wn,6);f(Tn,{name:`python_version`,type:`str | None`,defaultValue:`None`,description:`Python series or full version to install in the base conda environment.`});var En=o(Tn,2);f(En,{name:`force_build`,type:`bool`,defaultValue:`False`,description:`If True, skip cached image builds.`});var Dn=o(En,6);c(Dn,{id:`micromamba_install`,children:(e,t)=>{s(),i(e,r(`micromamba_install`))},$$slots:{default:!0}});var On=o(Dn,2);l(On,{code:`micromamba_install(self%2C%20*packages%2C%20spec_file%3DNone%2C%20channels%3D%5B%5D%2C%0A%20%20%20%20force_build%3DFalse%2C%20env%3DNone%2C%20secrets%3DNone%2C%20gpu%3DNone)`,lang:`python`});var kn=o(On,6);f(kn,{name:`*packages`,type:`str | list[str]`,description:"Conda packages to install, e.g. ``numpy`` or version constraints."});var An=o(kn,2);f(An,{name:`spec_file`,type:`str | None`,defaultValue:`None`,description:"Optional local path to a conda spec file to pass with ``-f``."});var jn=o(An,2);f(jn,{name:`channels`,type:`list[str]`,defaultValue:`[]`,description:"Conda channels to pass with repeated ``-c`` flags."});var Mn=o(jn,2);f(Mn,{name:`force_build`,type:`bool`,defaultValue:`False`,description:`If True, skip cached image builds.`});var Nn=o(Mn,2);f(Nn,{name:`env`,type:`dict[str, str | None] | None`,defaultValue:`None`,description:`Environment variables set in the build container.`});var Pn=o(Nn,2);f(Pn,{name:`secrets`,type:`Collection[_Secret] | None`,defaultValue:`None`,description:`Secrets injected as environment variables during the build.`});var Fn=o(Pn,2);f(Fn,{name:`gpu`,type:`str | None`,defaultValue:`None`,description:`GPU type to attach to the builder container.`});var In=o(Fn,6);c(In,{id:`from_registry`,children:(e,t)=>{s(),i(e,r(`from_registry`))},$$slots:{default:!0}});var Ln=o(In,2);l(Ln,{code:`from_registry(tag%2C%20secret%3DNone%2C%20*%2C%20setup_dockerfile_commands%3D%5B%5D%2C%0A%20%20%20%20force_build%3DFalse%2C%20add_python%3DNone%2C%20**kwargs)`,lang:`python`});var Rn=o(Ln,16);f(Rn,{name:`tag`,type:`str`,description:"Registry image reference (e.g. ``python:3.11-slim``)."});var zn=o(Rn,2);f(zn,{name:`secret`,type:`_Secret | None`,defaultValue:`None`,description:`Optional secret for static registry credentials.`});var Bn=o(zn,2);f(Bn,{name:`setup_dockerfile_commands`,type:`list[str]`,defaultValue:`[]`,description:"Extra Dockerfile lines run after ``FROM`` during base setup."});var Vn=o(Bn,2);f(Vn,{name:`force_build`,type:`bool`,defaultValue:`False`,description:`If True, skip cached image builds.`});var Hn=o(Vn,2);f(Hn,{name:`add_python`,type:`str | None`,defaultValue:`None`,description:`Optional standalone Python series to inject when the base image lacks Python.`});var Un=o(Hn,2);f(Un,{name:`**kwargs`,type:``,description:`Additional arguments forwarded to the internal image constructor (e.g. registry config).`});var Wn=o(Un,8);l(Wn,{code:`modal.Image.from_registry(%22python%3A3.11-slim-bookworm%22)%0Amodal.Image.from_registry(%22ubuntu%3A22.04%22%2C%20add_python%3D%223.11%22)%0Amodal.Image.from_registry(%22nvcr.io%2Fnvidia%2Fpytorch%3A22.12-py3%22)`,lang:`python`});var Gn=o(Wn,2);c(Gn,{id:`from_gcp_artifact_registry`,children:(e,t)=>{s(),i(e,r(`from_gcp_artifact_registry`))},$$slots:{default:!0}});var Kn=o(Gn,2);l(Kn,{code:`from_gcp_artifact_registry(tag%2C%20secret%3DNone%2C%20*%2C%20setup_dockerfile_commands%3D%5B%5D%2C%0A%20%20%20%20force_build%3DFalse%2C%20add_python%3DNone%2C%20**kwargs)`,lang:`python`});var K=o(Kn,4),qn=o(e(K),3);d(qn,{href:`https://cloud.google.com/iam/docs/keys-create-delete#creating`,rel:`nofollow`,children:(e,t)=>{s(),i(e,r(`your GCP service account key data`))},$$slots:{default:!0}}),d(o(qn,4),{href:`https://modal.com/secrets`,rel:`nofollow`,children:(e,t)=>{s(),i(e,r(`Secrets`))},$$slots:{default:!0}}),s(),n(K);var q=o(K,2),J=e(q);d(o(e(J),3),{href:`https://cloud.google.com/artifact-registry/docs/access-control#roles`,rel:`nofollow`,children:(e,t)=>{s(),i(e,r(`“Artifact Registry Reader”`))},$$slots:{default:!0}}),s(),n(J);var Jn=o(J,2);d(o(e(Jn),3),{href:`https://cloud.google.com/artifact-registry/docs/transition/setup-gcr-repo`,rel:`nofollow`,children:(e,t)=>{s(),i(e,r(`“Storage Object Viewer”`))},$$slots:{default:!0}}),s(),n(Jn),n(q);var Yn=o(q,8);f(Yn,{name:`tag`,type:`str`,description:`Full GCP Artifact Registry image reference.`});var Xn=o(Yn,2);f(Xn,{name:`secret`,type:`_Secret | None`,defaultValue:`None`,description:"Secret containing ``SERVICE_ACCOUNT_JSON`` for registry authentication."});var Zn=o(Xn,2);f(Zn,{name:`setup_dockerfile_commands`,type:`list[str]`,defaultValue:`[]`,description:"Extra Dockerfile lines run after ``FROM`` during base setup."});var Qn=o(Zn,2);f(Qn,{name:`force_build`,type:`bool`,defaultValue:`False`,description:`If True, skip cached image builds.`});var $n=o(Qn,2);f($n,{name:`add_python`,type:`str | None`,defaultValue:`None`,description:`Optional standalone Python series to inject when the base image lacks Python.`});var er=o($n,2);f(er,{name:`**kwargs`,type:``,description:"Additional arguments forwarded to `from_registry`."});var tr=o(er,8);l(tr,{code:`modal.Image.from_gcp_artifact_registry(%0A%20%20%20%20%22us-east1-docker.pkg.dev%2Fmy-project-1234%2Fmy-repo%2Fmy-image%3Amy-version%22%2C%0A%20%20%20%20secret%3Dmodal.Secret.from_name(%0A%20%20%20%20%20%20%20%20%22my-gcp-secret%22%2C%0A%20%20%20%20%20%20%20%20required_keys%3D%5B%22SERVICE_ACCOUNT_JSON%22%5D%2C%0A%20%20%20%20)%2C%0A%20%20%20%20add_python%3D%223.11%22%2C%0A)`,lang:`python`});var nr=o(tr,2);c(nr,{id:`from_aws_ecr`,children:(e,t)=>{s(),i(e,r(`from_aws_ecr`))},$$slots:{default:!0}});var rr=o(nr,2);l(rr,{code:`from_aws_ecr(tag%2C%20secret%3DNone%2C%20*%2C%20setup_dockerfile_commands%3D%5B%5D%2C%0A%20%20%20%20force_build%3DFalse%2C%20add_python%3DNone%2C%20**kwargs)`,lang:`python`});var Y=o(rr,10);d(o(e(Y)),{href:`https://docs.aws.amazon.com/AmazonECR/latest/userguide/repository-policies.html`,rel:`nofollow`,children:(e,t)=>{s(),i(e,r(`“Private repository policies”`))},$$slots:{default:!0}}),s(),n(Y);var X=o(Y,2);d(o(e(X)),{href:`https://modal.com/docs/guide/oidc-integration`,rel:`nofollow`,children:(e,t)=>{s(),i(e,r(`OIDC integration guide`))},$$slots:{default:!0}}),s(),n(X);var ir=o(X,6);f(ir,{name:`tag`,type:`str`,description:`Full ECR image URI.`});var ar=o(ir,2);f(ar,{name:`secret`,type:`_Secret | None`,defaultValue:`None`,description:`Secret with IAM or OIDC credentials for ECR.`});var or=o(ar,2);f(or,{name:`setup_dockerfile_commands`,type:`list[str]`,defaultValue:`[]`,description:"Extra Dockerfile lines run after ``FROM`` during base setup."});var sr=o(or,2);f(sr,{name:`force_build`,type:`bool`,defaultValue:`False`,description:`If True, skip cached image builds.`});var cr=o(sr,2);f(cr,{name:`add_python`,type:`str | None`,defaultValue:`None`,description:`Optional standalone Python series to inject when the base image lacks Python.`});var lr=o(cr,2);f(lr,{name:`**kwargs`,type:``,description:"Additional arguments forwarded to `from_registry`."});var ur=o(lr,8);l(ur,{code:`modal.Image.from_aws_ecr(%0A%20%20%20%20%22000000000000.dkr.ecr.us-east-1.amazonaws.com%2Fmy-private-registry%3Amy-version%22%2C%0A%20%20%20%20secret%3Dmodal.Secret.from_name(%0A%20%20%20%20%20%20%20%20%22aws%22%2C%0A%20%20%20%20%20%20%20%20required_keys%3D%5B%22AWS_ACCESS_KEY_ID%22%2C%20%22AWS_SECRET_ACCESS_KEY%22%2C%20%22AWS_REGION%22%5D%2C%0A%20%20%20%20)%2C%0A%20%20%20%20add_python%3D%223.11%22%2C%0A)`,lang:`python`});var dr=o(ur,2);c(dr,{id:`from_dockerfile`,children:(e,t)=>{s(),i(e,r(`from_dockerfile`))},$$slots:{default:!0}});var fr=o(dr,2);l(fr,{code:`from_dockerfile(path%2C%20*%2C%20force_build%3DFalse%2C%20context_dir%3DNone%2C%20env%3DNone%2C%0A%20%20%20%20secrets%3DNone%2C%20gpu%3DNone%2C%20add_python%3DNone%2C%20build_args%3D%7B%7D%2C%0A%20%20%20%20ignore%3DAUTO_DOCKERIGNORE)`,lang:`python`});var pr=o(fr,8);f(pr,{name:`path`,type:`str | Path`,description:`Path to the Dockerfile on the local machine.`});var mr=o(pr,2);f(mr,{name:`force_build`,type:`bool`,defaultValue:`False`,description:`If True, skip cached image builds.`});var hr=o(mr,2);f(hr,{name:`context_dir`,type:`Path | str | None`,defaultValue:`None`,description:`Build context directory for resolving relative COPY paths.`});var gr=o(hr,2);f(gr,{name:`env`,type:`dict[str, str | None] | None`,defaultValue:`None`,description:`Environment variables set in the build container.`});var _r=o(gr,2);f(_r,{name:`secrets`,type:`Collection[_Secret] | None`,defaultValue:`None`,description:`Secrets injected as environment variables during the build.`});var vr=o(_r,2);f(vr,{name:`gpu`,type:`str | None`,defaultValue:`None`,description:`GPU type to attach to the builder container.`});var yr=o(vr,2);f(yr,{name:`add_python`,type:`str | None`,defaultValue:`None`,description:`Standalone Python version to add when the Dockerfile does not install Python.`});var br=o(yr,2);f(br,{name:`build_args`,type:`dict[str, str]`,defaultValue:`{}`,description:"Dockerfile ``ARG`` values forwarded to the build."});var xr=o(br,2);f(xr,{name:`ignore`,type:`Sequence[str] | Callable[[Path], bool]`,defaultValue:`AUTO_DOCKERIGNORE`,description:"Ignore rules for the implicit context mount (defaults to auto ``.dockerignore`` behavior)."});var Sr=o(xr,8);l(Sr,{code:`from%20modal%20import%20FilePatternMatcher%0A%0A%23%20By%20default%20a%20.dockerignore%20file%20is%20used%20if%20present%20in%20the%20current%20working%20directory%0Aimage%20%3D%20modal.Image.from_dockerfile(%0A%20%20%20%20%22.%2FDockerfile%22%2C%0A%20%20%20%20add_python%3D%223.12%22%2C%0A)%0A%0Aimage%20%3D%20modal.Image.from_dockerfile(%0A%20%20%20%20%22.%2FDockerfile%22%2C%0A%20%20%20%20add_python%3D%223.12%22%2C%0A%20%20%20%20ignore%3D%5B%22*.venv%22%5D%2C%0A)%0A%0Aimage%20%3D%20modal.Image.from_dockerfile(%0A%20%20%20%20%22.%2FDockerfile%22%2C%0A%20%20%20%20add_python%3D%223.12%22%2C%0A%20%20%20%20ignore%3Dlambda%20p%3A%20p.is_relative_to(%22.venv%22)%2C%0A)%0A%0Aimage%20%3D%20modal.Image.from_dockerfile(%0A%20%20%20%20%22.%2FDockerfile%22%2C%0A%20%20%20%20add_python%3D%223.12%22%2C%0A%20%20%20%20ignore%3DFilePatternMatcher(%22**%2F*.txt%22)%2C%0A)%0A%0A%23%20When%20including%20files%20is%20simpler%20than%20excluding%20them%2C%20you%20can%20use%20the%20%60~%60%20operator%20to%20invert%20the%20matcher.%0Aimage%20%3D%20modal.Image.from_dockerfile(%0A%20%20%20%20%22.%2FDockerfile%22%2C%0A%20%20%20%20add_python%3D%223.12%22%2C%0A%20%20%20%20ignore%3D~FilePatternMatcher(%22**%2F*.py%22)%2C%0A)%0A%0A%23%20You%20can%20also%20read%20ignore%20patterns%20from%20a%20file.%0Aimage%20%3D%20modal.Image.from_dockerfile(%0A%20%20%20%20%22.%2FDockerfile%22%2C%0A%20%20%20%20add_python%3D%223.12%22%2C%0A%20%20%20%20ignore%3DFilePatternMatcher.from_file(%22%2Fpath%2Fto%2Fdockerignore%22)%2C%0A)`,lang:`python`});var Cr=o(Sr,2);c(Cr,{id:`from_scratch`,children:(e,t)=>{s(),i(e,r(`from_scratch`))},$$slots:{default:!0}});var wr=o(Cr,2);l(wr,{code:`from_scratch(force_build%3DFalse)`,lang:`python`});var Tr=o(wr,10);f(Tr,{name:`force_build`,type:`bool`,defaultValue:`False`,description:`If True, skip cached image builds.`});var Er=o(Tr,8);l(Er,{code:`image%20%3D%20modal.Image.from_scratch().add_local_file(local_path%2C%20%22%2Fbin%2Fmy_binary%22%2C%20copy%3DTrue)`,lang:`python`});var Dr=o(Er,2);c(Dr,{id:`debian_slim`,children:(e,t)=>{s(),i(e,r(`debian_slim`))},$$slots:{default:!0}});var Or=o(Dr,2);l(Or,{code:`debian_slim(python_version%3DNone%2C%20force_build%3DFalse)`,lang:`python`});var kr=o(Or,6);f(kr,{name:`python_version`,type:`str | None`,defaultValue:`None`,description:`Python series or full version to use from the Debian slim images.`});var Ar=o(kr,2);f(Ar,{name:`force_build`,type:`bool`,defaultValue:`False`,description:`If True, skip cached image builds.`});var jr=o(Ar,6);c(jr,{id:`apt_install`,children:(e,t)=>{s(),i(e,r(`apt_install`))},$$slots:{default:!0}});var Mr=o(jr,2);l(Mr,{code:`apt_install(self%2C%20*packages%2C%20force_build%3DFalse%2C%20env%3DNone%2C%20secrets%3DNone%2C%0A%20%20%20%20gpu%3DNone)`,lang:`python`});var Nr=o(Mr,6);f(Nr,{name:`*packages`,type:`str | list[str]`,description:"Apt package names to install, e.g. ``git`` or ``libpq-dev``."});var Pr=o(Nr,2);f(Pr,{name:`force_build`,type:`bool`,defaultValue:`False`,description:`If True, skip cached image builds.`});var Fr=o(Pr,2);f(Fr,{name:`env`,type:`dict[str, str | None] | None`,defaultValue:`None`,description:`Environment variables set in the build container.`});var Ir=o(Fr,2);f(Ir,{name:`secrets`,type:`Collection[_Secret] | None`,defaultValue:`None`,description:`Secrets injected as environment variables during the build.`});var Lr=o(Ir,2);f(Lr,{name:`gpu`,type:`str | None`,defaultValue:`None`,description:`GPU type to attach to the builder container.`});var Rr=o(Lr,8);l(Rr,{code:`image%20%3D%20modal.Image.debian_slim().apt_install(%22git%22)`,lang:`python`});var zr=o(Rr,2);c(zr,{id:`run_function`,children:(e,t)=>{s(),i(e,r(`run_function`))},$$slots:{default:!0}});var Br=o(zr,2);l(Br,{code:`run_function(self%2C%20raw_f%2C%20*%2C%20env%3DNone%2C%20secrets%3DNone%2C%20volumes%3D%7B%7D%2C%0A%20%20%20%20network_file_systems%3D%7B%7D%2C%20gpu%3DNone%2C%20cpu%3DNone%2C%20memory%3DNone%2C%20timeout%3D60%20*%2060%2C%0A%20%20%20%20cloud%3DNone%2C%20region%3DNone%2C%20force_build%3DFalse%2C%20args%3D()%2C%20kwargs%3D%7B%7D%2C%0A%20%20%20%20include_source%3DTrue)`,lang:`python`});var Vr=o(Br,10);f(Vr,{name:`raw_f`,type:`Callable[..., Any]`,description:`Callable executed remotely during the image build.`});var Hr=o(Vr,2);f(Hr,{name:`env`,type:`dict[str, str | None] | None`,defaultValue:`None`,description:`Environment variables set in the builder container.`});var Ur=o(Hr,2);f(Ur,{name:`secrets`,type:`Collection[_Secret] | None`,defaultValue:`None`,description:`Secrets available to the builder function.`});var Wr=o(Ur,2);f(Wr,{name:`volumes`,type:`dict[str | PurePosixPath, _Volume | _CloudBucketMount]`,defaultValue:`{}`,description:`Volume and bucket mounts attached for the build.`});var Gr=o(Wr,2);f(Gr,{name:`network_file_systems`,type:`dict[str | PurePosixPath, _NetworkFileSystem]`,defaultValue:`{}`,description:`Network file systems attached for the build.`});var Kr=o(Gr,2);f(Kr,{name:`gpu`,type:`str | list[str] | None`,defaultValue:`None`,description:`GPU type or list of types for the builder container.`});var qr=o(Kr,2);f(qr,{name:`cpu`,type:`float | None`,defaultValue:`None`,description:`CPU cores to request (soft limit).`});var Jr=o(qr,2);f(Jr,{name:`memory`,type:`int | None`,defaultValue:`None`,description:`Memory to request in MiB (soft limit).`});var Yr=o(Jr,2);f(Yr,{name:`timeout`,type:`int`,defaultValue:`60 * 60`,description:`Maximum build-step runtime in seconds.`});var Xr=o(Yr,2);f(Xr,{name:`cloud`,type:`str | None`,defaultValue:`None`,description:`Cloud provider for the builder function.`});var Zr=o(Xr,2);f(Zr,{name:`region`,type:`str | Sequence[str] | None`,defaultValue:`None`,description:`Region or regions for the builder function.`});var Qr=o(Zr,2);f(Qr,{name:`force_build`,type:`bool`,defaultValue:`False`,description:`If True, skip cached image builds.`});var $r=o(Qr,2);f($r,{name:`args`,type:`Sequence[Any]`,defaultValue:`()`,description:`Positional arguments serialized to the builder function.`});var ei=o($r,2);f(ei,{name:`kwargs`,type:`dict[str, Any]`,defaultValue:`{}`,description:`Keyword arguments serialized to the builder function.`});var ti=o(ei,2);f(ti,{name:`include_source`,type:`bool`,defaultValue:`True`,description:`Whether to include the function's source in the builder image.`});var ni=o(ti,8);l(ni,{code:`%0Adef%20my_build_function()%3A%0A%20%20%20%20open(%22model.pt%22%2C%20%22w%22).write(%22parameters!%22)%0A%0Aimage%20%3D%20(%0A%20%20%20%20modal.Image%0A%20%20%20%20%20%20%20%20.debian_slim()%0A%20%20%20%20%20%20%20%20.pip_install(%22torch%22)%0A%20%20%20%20%20%20%20%20.run_function(my_build_function%2C%20secrets%3D%5B...%5D%2C%20volumes%3D%7B...%7D)%0A)`,lang:`python`});var ri=o(ni,2);c(ri,{id:`env`,children:(e,t)=>{s(),i(e,r(`env`))},$$slots:{default:!0}});var ii=o(ri,2);l(ii,{code:`env(self%2C%20vars)`,lang:`python`});var ai=o(ii,6);f(ai,{name:`vars`,type:`dict[str, str]`,description:`Map of environment variable names to string values.`});var oi=o(ai,8);l(oi,{code:`image%20%3D%20(%0A%20%20%20%20modal.Image.debian_slim()%0A%20%20%20%20.env(%7B%22HF_HUB_ENABLE_HF_TRANSFER%22%3A%20%221%22%7D)%0A)`,lang:`python`});var si=o(oi,2);c(si,{id:`workdir`,children:(e,t)=>{s(),i(e,r(`workdir`))},$$slots:{default:!0}});var ci=o(si,2);l(ci,{code:`workdir(self%2C%20path)`,lang:`python`});var li=o(ci,6);f(li,{name:`path`,type:`str | PurePosixPath`,description:`Working directory path inside the image.`});var ui=o(li,8);l(ui,{code:`image%20%3D%20(%0A%20%20%20%20modal.Image.debian_slim()%0A%20%20%20%20.run_commands(%22git%20clone%20https%3A%2F%2Fxyz%20app%22)%0A%20%20%20%20.workdir(%22%2Fapp%22)%0A%20%20%20%20.run_commands(%22yarn%20install%22)%0A)`,lang:`python`});var di=o(ui,2);c(di,{id:`cmd`,children:(e,t)=>{s(),i(e,r(`cmd`))},$$slots:{default:!0}});var fi=o(di,2);l(fi,{code:`cmd(self%2C%20cmd)`,lang:`python`});var pi=o(fi,8);f(pi,{name:`cmd`,type:`list[str]`,description:`argv tokens for the default container command.`});var mi=o(pi,8);l(mi,{code:`image%20%3D%20(%0A%20%20%20%20modal.Image.debian_slim().cmd(%5B%22python%22%2C%20%22app.py%22%5D)%0A)`,lang:`python`});var hi=o(mi,2);c(hi,{id:`pipe`,children:(e,t)=>{s(),i(e,r(`pipe`))},$$slots:{default:!0}});var Z=o(hi,2);l(Z,{code:`pipe(self%2C%20func%2C%20*args%2C%20**kwargs)`,lang:`python`});var gi=o(Z,8);l(gi,{code:`def%20workspace_setup(image%3A%20modal.Image%2C%20repo%3A%20str)%20-%3E%20modal.Image%3A%0A%20%20%20%20return%20image.run_commands(f%22git%20clone%20%7Brepo%7D%22).uv_pip_install(%22.%22)%0A%0Aimage%20%3D%20(%0A%20%20%20%20modal.Image.debian_slim()%0A%20%20%20%20.apt_install(%22git%22)%0A%20%20%20%20.pipe(workspace_setup%2C%20%22https%3A%2F%2Fgithub.com%2Fexample%2Frepo.git%22)%0A)`,lang:`python`});var _i=o(gi,2);c(_i,{id:`imports`,children:(e,t)=>{s(),i(e,r(`imports`))},$$slots:{default:!0}});var vi=o(_i,2);l(vi,{code:`imports(self)`,lang:`python`});var yi=o(vi,12);l(yi,{code:`with%20image.imports()%3A%0A%20%20%20%20import%20torch`,lang:`python`});var bi=o(yi,2);c(bi,{id:`from_name`,children:(e,t)=>{s(),i(e,r(`from_name`))},$$slots:{default:!0}});var xi=o(bi,2);l(xi,{code:`from_name(name%2C%20*%2C%20environment_name%3DNone%2C%20client%3DNone)`,lang:`python`});var Si=o(xi,6);l(Si,{code:`image%20%3D%20modal.Image.from_name(%22my-image%22)%20%20%20%20%20%23%20references%20my-image%3Alatest%0Aimage_v1%20%3D%20modal.Image.from_name(%22my-image%3Av1%22)%0A%0A%40app.function(image%3Dimage)%0Adef%20run()%3A%0A%20%20%20%20...`,lang:`python`});var Ci=o(Si,2);c(Ci,{id:`publish`,children:(e,t)=>{s(),i(e,r(`publish`))},$$slots:{default:!0}});var wi=o(Ci,2);l(wi,{code:`publish(self%2C%20name%2C%20*%2C%20environment_name%3DNone%2C%20experimental_options%3DNone%2C%0A%20%20%20%20client%3DNone)`,lang:`python`});var Ti=o(wi,8);l(Ti,{code:`image%20%3D%20modal.Image.debian_slim().pip_install(%22numpy%22)%0Aimage.build(app)%0Aimage.publish(%22my-image-with-numpy%22)%20%20%20%20%20%23%20my-image-with-numpy%3Alatest%0Aimage.publish(%22my-image-with-numpy%3Av1%22)`,lang:`python`});var Ei=o(Ti,2);c(Ei,{id:`logs`,children:(e,t)=>{s(),i(e,r(`logs`))},$$slots:{default:!0}});var Di=o(Ei,2);l(Di,{code:`logs%3A%20ImageLogsManager`,lang:`python`});var Q=o(Di,4),Oi=o(e(Q));d(Oi,{href:`#logsfetch`,children:(e,t)=>{i(e,oe())},$$slots:{default:!0}}),d(o(Oi,2),{href:`#logstail`,children:(e,t)=>{i(e,se())},$$slots:{default:!0}}),s(),n(Q);var $=o(Q,4),ki=e($);d(e(ki),{href:`https://modal.com/docs/cli/latest/app#modal-app-logs`,rel:`nofollow`,children:(e,t)=>{i(e,ce())},$$slots:{default:!0}}),s(),n(ki),n($);var Ai=o($,2);ne(Ai,{id:`logsfetch`,children:(e,t)=>{s(),i(e,r(`logs.fetch`))},$$slots:{default:!0}});var ji=o(Ai,2);l(ji,{code:`fetch(self%2C%20layers%3D1)`,lang:`python`});var Mi=o(ji,6);f(Mi,{name:`layers`,type:`int | None`,defaultValue:`1`,description:`The number of build layers to fetch, counting backward from the final Image. If None, logs are fetched for all build steps.`});var Ni=o(Mi,2);ne(Ni,{id:`logstail`,children:(e,t)=>{s(),i(e,r(`logs.tail`))},$$slots:{default:!0}});var Pi=o(Ni,2);l(Pi,{code:`tail(self%2C%20entries%3D100)`,lang:`python`}),f(o(Pi,6),{name:`entries`,type:`int`,defaultValue:`100`,description:`The number of log entries to return.`}),i(t,a)},$$slots:{default:!0}}))}export{_ as default,p as metadata};
//# sourceMappingURL=DCqa_GTP.js.map
