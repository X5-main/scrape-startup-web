(function(){try{var e=typeof window<`u`?window:typeof global<`u`?global:typeof globalThis<`u`?globalThis:typeof self<`u`?self:{};e.SENTRY_RELEASE={id:`f99fcf9f0a844cc9bd13fdc8e5782b84`};var t=new e.Error().stack;t&&(e._sentryDebugIds=e._sentryDebugIds||{},e._sentryDebugIds[t]=`c156505f-5f12-4e23-8ad9-216f722cc5eb`,e._sentryDebugIdIdentifier=`sentry-dbid-c156505f-5f12-4e23-8ad9-216f722cc5eb`)}catch{}})();import{$t as e,Dt as t,Ft as n,H as r,Jt as i,Q as a,St as o,Tn as s,X as c,Z as l,_n as u,at as d,bt as f,cn as p,dt as m,en as h,fn as g,ft as _,gt as v,ht as y,kn as b,l as x,on as S,qt as C,st as ee,tn as w,ut as T,vn as E,vt as D,wn as O,xt as k}from"./F_ixKBiO.js";import"./B1sc9Zdx.js";import{t as A}from"./5byw80Za.js";import{t as j}from"./BiqFJer1.js";import{r as te}from"./DQggLE8A.js";import{t as ne}from"./Be7ovA5m.js";import{n as re,t as M}from"./Dpvl1BDr.js";import{t as N}from"./CaFHetqn.js";import{t as P}from"./BsGruqAi.js";import{r as ie,t as ae}from"./STCJZ27L.js";import{t as oe}from"./Cia9BXRG2.js";import{t as F}from"./BSG8yfww.js";function I(e){return`import modal

#### begin configuration ####
## software config
VLLM_VERSION = "${e.framework_version}"
base_image = f"vllm/vllm-openai:{VLLM_VERSION}"

ENV_VARS = ${e.env_vars?`{
	"`+e.env_vars.split(`=`).join(`": "`).split(`
`).join(`",
	"`)+`",
}`:`{}`}

CLI_ARGS = ${e.cli_args?`[
	"`+e.cli_args.split(/\s+/).join(`",
	"`)+`",
]`:`[]`}
${e.tokenizer?`CLI_ARGS += ["--tokenizer", "`+e.tokenizer+`"]`:``}

## replica config
MAX_THROUGHPUT = ${Math.max(Math.floor(e.queries_per_second),1)}
GPU = "${e.gpu_type}${e.gpu_count>1?`:`+e.gpu_count:``}"

## LLM config
MODEL_REPO = "${e.model_repo}"

#### end configuration ####

# setup

MODEL_CACHE_PATH = "/cache"
MINUTES = 60  # seconds
HOURS = 60 * MINUTES

image = (
	modal.Image.from_registry(base_image, add_python="3.13")
		.uv_pip_install("hf-transfer", "grpclib", "requests")
		.run_commands("echo -n /usr/bin/python3 > /home/vllm-python")
		.entrypoint([])
		.env({"HF_HUB_CACHE": MODEL_CACHE_PATH, "HF_HUB_ENABLE_HF_TRANSFER": "1"})
)

hf_secret = modal.Secret.from_name("huggingface-secret")

model_cache_volume = modal.Volume.from_name("model-cache", create_if_missing=True)
model_cache = {MODEL_CACHE_PATH: model_cache_volume}

# deployment

app = modal.App("llm-engine")

command = " ".join(
	["/usr/bin/python3", "-m", "vllm.entrypoints.openai.api_server",
	"--model", MODEL_REPO]
	+ CLI_ARGS
)

@app.server(
	gpu=GPU,
	image=image,
	secrets=[hf_secret],
	volumes=model_cache,
	port=8000,
	startup_timeout=1 * HOURS,
	routing_region="us-east",
	unauthenticated=True,
	target_concurrency=MAX_THROUGHPUT,
)
class VLLMServer:
	@modal.enter()
	def startup(self):
		import os
		import subprocess

		subprocess.Popen(command, env=os.environ | ENV_VARS, shell=True)\n\n${z(`VLLMServer`)}`}function L(e){return`import modal

#### begin configuration ####
## software config
SGLANG_VERSION = "${e.framework_version}"

ENV_VARS = ${e.env_vars?`{
	"`+e.env_vars.split(`=`).join(`": "`).split(`
`).join(`",
	"`)+`",
}`:`{}`}

CLI_ARGS = ${e.cli_args?`[
	"`+e.cli_args.split(/\s+/).join(`",
	"`)+`",
]`:`[]`}
${e.tokenizer?`CLI_ARGS += ["--tokenizer-path", "`+e.tokenizer+`"]`:``}

## replica config
MAX_THROUGHPUT = ${Math.max(Math.floor(e.queries_per_second),1)}
GPU = "${e.gpu_type}${e.gpu_count>1?`:`+e.gpu_count:``}"

#  LLM config
MODEL_REPO = "${e.model_repo}"

#### end configuration ####

# setup

MODEL_CACHE_PATH = "/cache"
MINUTES = 60  # seconds
HOURS = 60 * MINUTES

image = (
	modal.Image.from_registry(f"lmsysorg/sglang:{SGLANG_VERSION}")
	.uv_pip_install(
		"hf-transfer",
		"grpclib",
		"requests",
	)
	.env({"HF_HUB_CACHE": MODEL_CACHE_PATH, "HF_HUB_ENABLE_HF_TRANSFER": "1"})
	.entrypoint([])
)

hf_secret = modal.Secret.from_name("huggingface-secret")

model_cache_volume = modal.Volume.from_name("model-cache", create_if_missing=True)
model_cache = {MODEL_CACHE_PATH: model_cache_volume}

# deployment

app = modal.App("llm-engine")

command = " ".join(
	["python", "-m", "sglang.launch_server",
	"--model-path", MODEL_REPO, "--host", "0.0.0.0"]
	+ CLI_ARGS
)

@app.server(
	gpu=GPU,
	image=image,
	secrets=[hf_secret],
	volumes=model_cache,
	port=30000,
	startup_timeout=1 * HOURS,
	routing_region="us-east",
	unauthenticated=True,
	target_concurrency=MAX_THROUGHPUT,
)
class SGLangServer:
	@modal.enter()
	def startup(self):
		import os
		import subprocess

		subprocess.Popen(command, env=os.environ | ENV_VARS, shell=True)\n\n${z(`SGLangServer`)}`}function R(e){return`import modal

#### begin configuration ####
## software config
TENSORRT_LLM_VERSION = "${e.framework_version}"
CUDA_VERSION = "12.8.1"

ENV_VARS = ${e.env_vars?`{
	"`+e.env_vars.split(`=`).join(`": "`).split(`
`).join(`",
	"`)+`",
}`:`{}`}

CLI_ARGS = ${e.cli_args?`[
	"`+e.cli_args.split(/\s+/).join(`",
	"`)+`",
]`:`[]`}
${e.tokenizer?`CLI_ARGS += ["--tokenizer", "`+e.tokenizer+`"]`:``}

LLM_KWARGS = ${e.kwargs===`–`||e.kwargs==null?`{}`:se(e.kwargs)}

## replica config
MAX_THROUGHPUT = ${Math.max(Math.floor(e.queries_per_second),1)}
GPU = "${e.gpu_type}${e.gpu_count>1?`:`+e.gpu_count:``}"

## LLM config
MODEL_REPO = "${e.model_repo}"

#### end configuration ####

# setup

MODEL_CACHE_PATH = "/cache"
MINUTES = 60  # seconds
HOURS = 60 * MINUTES

image = (
	modal.Image.from_registry(
		f"nvidia/cuda:{CUDA_VERSION}-devel-ubuntu24.04",
		add_python="3.12",
	)
	.entrypoint([])
	.apt_install(
		"openmpi-bin",
		"libopenmpi-dev",
		"git",
		"git-lfs",
		"wget"
	)
	.uv_pip_install(
		f"tensorrt-llm=={TENSORRT_LLM_VERSION}",
		"cuda-python>=12,<13",
		"pynvml",
		extra_index_url="https://pypi.nvidia.com",
	)
	.uv_pip_install("hf-transfer", "huggingface_hub[hf_xet]", "requests")
	.env(
		{
			"HF_HUB_CACHE": MODEL_CACHE_PATH,
			"HF_HUB_ENABLE_HF_TRANSFER": "1",
			"PMIX_MCA_gds": "hash",
		}
	)
)

hf_secret = modal.Secret.from_name("huggingface-secret")

model_cache_volume = modal.Volume.from_name("model-cache", create_if_missing=True)
model_cache = {MODEL_CACHE_PATH: model_cache_volume}

LLM_KWARGS_PATH = "llm_kwargs.yaml"

# deployment

app = modal.App("llm-engine")

@app.server(
	gpu=GPU,
	image=image,
	secrets=[hf_secret],
	volumes=model_cache,
	port=8000,
	startup_timeout=1 * HOURS,
	routing_region="us-east",
	unauthenticated=True,
	target_concurrency=MAX_THROUGHPUT,
)
class TensorRTLLM:

	@modal.enter()
	def enter(self):
		import hashlib
		import json
		import os
		import subprocess

		from huggingface_hub import snapshot_download
		from tensorrt_llm._tensorrt_engine import LLM
		from tensorrt_llm.llmapi.llm_args import update_llm_args_with_extra_dict
		from tensorrt_llm.plugin import PluginConfig
		import tensorrt_llm
		import torch
		import yaml

		model_path = snapshot_download(MODEL_REPO)

		engine_fingerprint = hashlib.md5(
			json.dumps(LLM_KWARGS, sort_keys=True).encode()
		).hexdigest()
		print(f"Engine fingerprint: {engine_fingerprint}")

		self.engine_path = os.path.join(
			model_path,
			"tensorrt-llm-engines",
			f"{tensorrt_llm.__version__}-{MODEL_REPO}-{engine_fingerprint}",
		)
		print(f"Engine path: {self.engine_path}")

		if not os.path.exists(self.engine_path): # Build the engine
			llm_kwargs_simple = LLM_KWARGS.copy()

			# Build with plugins, but don't save them to the engine kwargs yaml
			# file, because trtllm-serve doesn't support loading them. This is
			# fine, since the plugins are incorporated at build time.
			if (
				"build_config" in LLM_KWARGS
				and "plugin_config" in LLM_KWARGS["build_config"]
			):
				LLM_KWARGS["build_config"]["plugin_config"] = (
					PluginConfig.from_dict(LLM_KWARGS["build_config"]["plugin_config"])
				)
				llm_kwargs_simple["build_config"].pop("plugin_config")

			# Prepare kwargs for LLM constructor
			final_kwargs = update_llm_args_with_extra_dict(
				{
					"model": MODEL_REPO,
					"tensor_parallel_size": torch.cuda.device_count(),
					"tokenizer": ${e.tokenizer?`"`+e.tokenizer+`"`:`MODEL_REPO`}
				},
				LLM_KWARGS,
			)

			print(f"Building new engine at {self.engine_path}")
			llm = LLM(**final_kwargs)
			llm.save(self.engine_path)
			del llm

			with open(os.path.join(self.engine_path, LLM_KWARGS_PATH), "w") as f:
				yaml.dump(llm_kwargs_simple, f)

		engine_path = self.engine_path if hasattr(self, "engine_path") else "none"

		command = " ".join(
			["trtllm-serve", engine_path, "--host", "0.0.0.0"]
			+ ["--extra_llm_api_options", os.path.join(engine_path, LLM_KWARGS_PATH)]
			+ CLI_ARGS
		)

		subprocess.Popen(command, env=os.environ | ENV_VARS, shell=True)

@app.local_entrypoint()
def test(test_timeout=30 * MINUTES):
	import json
	import time
	import urllib

	url = TensorRTLLM.get_url()
	print(f"Running health check for server at {url}")
	print("Note: startup takes a while on the first two iterations, but is much faster after that.")
	print("On the first iteration with a new model, weights are downloaded at ~100 MB/s.")
	print("On the second iteration, a file read profile is recorded and used for future runs.")
	up, start, delay = False, time.time(), 10
	while not up:
		try:
			with urllib.request.urlopen(url + "/health") as response:
				up = response.getcode() == 200
		except Exception:
			if time.time() - start > test_timeout:
				break
			time.sleep(delay)

	assert up, f"Failed health check for server at {url}"

	print(f"Successful health check for server at {url}")

	prompt = "Testing! Is this thing on?"
	print(f"Sending a sample prompt to {url}", prompt, sep="\\n")

	headers = {"Content-Type": "application/json"}
	payload = json.dumps({"prompt": prompt, "max_tokens": 10, "model": MODEL_REPO})
	req = urllib.request.Request(
		url + "/v1/completions",
		data=payload.encode("utf-8"),
		headers=headers,
		method="POST",
	)
	with urllib.request.urlopen(req) as response:
		print(json.loads(response.read().decode()))`}function z(e){return`# testing

@app.local_entrypoint()
def test(test_timeout=30 * MINUTES):
	import json
	import time
	import urllib

	url = ${e}.get_url()
	print(f"Running health check for server at {url}")
	print("Note: startup takes a while on the first two iterations, but is much faster after that.")
	print("On the first iteration with a new model, weights are downloaded at ~100 MB/s.")
	print("On the second iteration, a file read profile is recorded and used for future runs.")
	up, start, delay = False, time.time(), 10
	while not up:
		try:
			with urllib.request.urlopen(url + "/health") as response:
				up = response.getcode() == 200
		except Exception:
			if time.time() - start > test_timeout:
				break
			time.sleep(delay)

	assert up, f"Failed health check for server at {url}"

	print(f"Successful health check for server at {url}")

	messages = [{"role": "user", "content": "Testing! Is this thing on?"}]
	print(f"Sending a sample message to {url}", *messages, sep="\\n")

	headers = {"Content-Type": "application/json"}
	payload = json.dumps({"messages": messages, "model": MODEL_REPO, "max_tokens": 10})
	req = urllib.request.Request(
		url + "/v1/chat/completions",
		data=payload.encode("utf-8"),
		headers=headers,
		method="POST",
	)
	with urllib.request.urlopen(req) as response:
		print(json.loads(response.read().decode()))`}function se(e,t=4){let n=JSON.parse(e),r=JSON.stringify(n,null,t);return r=r.replace(/\bnull\b/g,`None`).replace(/\btrue\b/g,`True`).replace(/\bfalse\b/g,`False`).replace(/"([^"]+)":/g,`"$1":`),r}var ce=P({themes:[`one-light`],langs:[`python`],engine:N()}),B=o(`<!> <div>uvx modal run this.py</div>`,1),V=o(`<!> Copy`,1),le=o(`<div><div class="code-wrapper col-span-full p-4 svelte-5msiv5"><!></div></div> <button><!></button>`,1);function ue(t,r){E(r,!0);let o=g(()=>r.row.framework),c=g(()=>{switch(n(o)){case`vllm`:return I(r.row);case`tensorrt-llm`:return R(r.row);case`sglang`:return L(r.row);default:return null}}),d=p(!1);i(()=>{if(n(d)){let e=setTimeout(()=>{S(d,!1)},5e3);return()=>clearTimeout(e)}});var m=k();v(h(m),()=>ce,null,(t,i)=>{var o=le(),u=h(o),p=e(u);T(e(p),()=>n(i).codeToHtml(n(c)?.trimEnd()??``,{lang:`python`,theme:`one-light`})),s(p),s(u);var m=w(u,2);m.__click=()=>{n(c)&&(navigator.clipboard.writeText(n(c)),S(d,!0))};var g=e(m),_=e=>{var t=B();A(h(t),{class:`h-4 w-4`}),O(2),f(e,t)},v=e=>{var t=V();j(h(t),{class:`h-4 w-4`}),O(),f(e,t)};y(g,e=>{n(d)?e(_):e(v,!1)}),s(m),C(()=>{l(u,1,a([`container`,`grid max-w-full rounded-md bg-[#f1f2f0] text-sm`,`transition-[box-shadow,transform]`,r.class]),`svelte-5msiv5`),l(m,1,a([`border-almanac-dark-green/30 flex items-center gap-1 rounded-[3px] border bg-[#DBE0DD] px-2 py-1 transition-colors hover:bg-white`,r.mobile?void 0:`mt-6`,`pointer-events-auto absolute right-4 top-4 font-mono text-sm`]),`svelte-5msiv5`)}),f(t,o)}),f(t,m),u()}t([`click`]);var H=o(`<div><!></div>`);function U(t,n){var r=H();ee(e(r),()=>n.children??b),s(r),C(()=>l(r,1,a([`rounded-xs border-almanac-dark-green/30 inline w-full max-w-[1100px] items-baseline gap-3 self-center border bg-[#F4F4F4]/60 px-4 py-2 text-center leading-[40px] shadow-md`,n.active?`active-shadow`:`inactive-shadow`,`container`,n.class]),`svelte-9t36o6`)),f(t,r)}var W=o(`<span> </span> <!> <span>with</span> <!>`,1),G=o(`<span>I expect on average</span> <!>`,1),de=o(`<span>Clients should receive</span> <!> <span>in under</span> <!> <span>95% of the time</span>`,1),fe=o(`<div class="grid max-w-[900px] select-none grid-cols-1 items-stretch gap-6 self-center lg:grid-cols-[1fr_1fr]"><!> <!> <!> <!></div>`);function pe(t,r){E(r,!0);let i=g(()=>r.setFilterConditions===void 0);function a(e,t){let n=[...r.filterConditions];n.find(t=>t.column===e)?n=n.map(n=>n.column===e?t:n):n.push(t),r.setFilterConditions?.(n)}function o(e){let t=r.filterConditions.filter(t=>t.column!==e);r.setFilterConditions?.(t)}function c(e,t){n(i)||(!t||t===`any`?o(e):a(e,{type:`eq`,column:e,value:t}))}let l=g(()=>r.filterConditions.find(e=>e.column===`model`&&e.type===`eq`)?.value??`any`),d=g(()=>r.filterConditions.find(e=>e.column===`framework`&&e.type===`eq`)?.value??`any`),p=g(()=>r.filterConditions.find(e=>e.column===`tokens`&&e.type===`eq`)?.value??`any`),m=g(()=>r.filterConditions.find(e=>e.type===`range`)?.column??`ttft_p95`),_=g(()=>`${(r.filterConditions.find(e=>e.type===`range`)?.maxValue??1)*1e3}`);function v(){let e=[...r.filterConditions],t=e.findIndex(e=>e.type===`range`),i={type:`range`,column:n(m),maxValue:Number(n(_))/1e3};t===-1?e.push(i):e[t]=i,r.setFilterConditions?.(e)}var b=fe(),x=e(b);{let t=g(()=>!n(i)),r=g(()=>[`order-[-3]`,n(i)&&`col-span-2 max-w-fit self-center justify-self-center`]);U(x,{get active(){return n(t)},get class(){return n(r)},children:(t,r)=>{var a=W(),o=h(a),u=e(o,!0);s(o);var p=w(o,2);F(p,{class:`max-w-[240px]!`,onchange:()=>c(`model`,n(l)),options:[{label:`Qwen 2.5 7B (Zeta)`,value:`Qwen 2.5 7B`},{label:`Qwen 3 235B-A22B`,value:`Qwen 3 235B-A22B`},{label:`Qwen 3 235B-A22B fp8`,value:`Qwen 3 235B-A22B fp8`},{label:`DeepSeek-V3 671B-A37B fp8`,value:`DeepSeek-V3 671B-A37B fp8`},{label:`DeepSeek-V3 671B-A37B int4`,value:`DeepSeek-V3 671B-A37B int4`},{label:`Llama 3.1 8B`,value:`Llama 3.1 8B`},{label:`Llama 3.1 8B fp8`,value:`Llama 3.1 8B fp8`},{label:`Llama 3.1 8B int4`,value:`Llama 3.1 8B int4`},{label:`Llama 3.1 70B`,value:`Llama 3.1 70B`},{label:`Llama 3.1 70B fp8`,value:`Llama 3.1 70B fp8`},{label:`Llama 3.3 70B int4`,value:`Llama 3.3 70B int4`},{label:`Gemma 3 4B bf16`,value:`Gemma 3 4B bf16`},{label:`Gemma 3 12B bf16`,value:`Gemma 3 12B bf16`},{label:`Gemma 3 27B bf16`,value:`Gemma 3 27B bf16`},{label:`Ministral 8B`,value:`Ministral 8B`},{label:`Mistral Small 3.1 24B`,value:`Mistral Small 3.1 24B`}],get disabled(){return n(i)},get value(){return n(l)},set value(e){S(l,e)}}),F(w(p,4),{onchange:()=>c(`framework`,n(d)),options:[{label:`any engine`,value:`any`},{label:`SGLang`,value:`sglang`},{label:`vLLM`,value:`vllm`},{label:`TensorRT-LLM`,value:`tensorrt-llm`}],get disabled(){return n(i)},get value(){return n(d)},set value(e){S(d,e)}}),C(()=>D(u,n(i)?`We ran`:`I want to serve`)),f(t,a)},$$slots:{default:!0}})}var T=w(x,2),A=e=>{U(e,{active:!0,class:`self-stretch lg:order-[-1]`,children:(e,t)=>{var r=G();F(w(h(r),2),{onchange:()=>{c(`tokens`,n(p))},options:[{label:`128 tokens in / 1024 tokens out`,value:`128;1024`},{label:`256 tokens in / 2048 tokens out`,value:`256;2048`},{label:`512 tokens in / 512 tokens out`,value:`512;512`},{label:`512 tokens in / 4096 tokens out`,value:`512;4096`},{label:`1024 tokens in / 128 tokens out`,value:`1024;128`},{label:`1024 tokens in / 1024 tokens out`,value:`1024;1024`},{label:`2048 tokens in / 256 tokens out`,value:`2048;256`},{label:`2048 tokens in / 2048 tokens out`,value:`2048;2048`},{label:`4096 tokens in / 512 tokens out`,value:`4096;512`}],get disabled(){return n(i)},get value(){return n(p)},set value(e){S(p,e)}}),f(e,r)},$$slots:{default:!0}})};y(T,e=>{(!n(i)||n(p)!==`any`)&&e(A)});var j=w(T,2),te=e=>{U(e,{active:!0,class:`lg:order-[-2]`,children:(e,t)=>{var r=de(),i=w(h(r),2);F(i,{onchange:v,options:[{label:`the first token`,value:`ttft_p95`},{label:`the last token`,value:`ttlt_p95`},{label:`each token`,value:`itl_p95`}],get value(){return n(m)},set value(e){S(m,e)}}),F(w(i,4),{onchange:v,options:[{label:`10 ms`,value:`10`},{label:`30 ms`,value:`30`},{label:`100 ms`,value:`100`},{label:`300 ms`,value:`300`},{label:`1 second`,value:`1000`},{label:`3 seconds`,value:`3000`},{label:`10 seconds`,value:`10000`},{label:`30 seconds`,value:`30000`},{label:`1 minute`,value:`60000`}],get value(){return n(_)},set value(e){S(_,e)}}),O(2),f(e,r)},$$slots:{default:!0}})};y(j,e=>{n(i)||e(te)});var ne=w(j,2),re=e=>{var t=k();ee(h(t),()=>r.extraFilter),f(e,t)};y(ne,e=>{r.extraFilter&&e(re)}),s(b),f(t,b),u()}var me=[`model`,`framework`,`framework_version`,`model_family`,`model_size`,`quant`,`gpu_type`,`task`,`prompt_tokens`,`output_tokens`,`tokens`],he=`model.model_family.model_size.quant.prompt_tokens.output_tokens.generated_tokens.total_tokens.tokens.gpu_type.gpu_count.task.queries_per_second.ttft_mean.ttft_p50.ttft_p90.ttft_p95.itl_mean.itl_p50.itl_p90.itl_p95.ttlt_mean.ttlt_p50.ttlt_p90.ttlt_p95.framework.framework_version.cli_args.env_vars.kwargs`.split(`.`);function ge(e){return e?e.split(`,`).map(e=>{if(e.includes(`=`)){let[t,n]=e.split(`=`);if(me.includes(t))return{type:`eq`,column:t,value:n}}else if(e.includes(`<`)){let[t,n]=e.split(`<`);if(he.includes(t))return{type:`range`,column:t,maxValue:Number(n)}}}).filter(e=>e!==void 0):[]}function K(e){return e.map(e=>{switch(e.type){case`eq`:return`${e.column}=${e.value}`;case`range`:return`${e.column}<${e.maxValue}`}}).filter(Boolean).join(`,`)}function q(e,t){let n=e[t.column];switch(t.type){case`eq`:return`${n}`===t.value;case`range`:return typeof n==`number`?n<=t.maxValue:!0}}var _e=[{key:`ttft`,label:`Time To First Token`},{key:`itl`,label:`Inter Token Latency`},{key:`ttlt`,label:`Time To Last Token`}],ve=[{key:`p50`,label:`Median`},{key:`p90`,label:`p90`},{key:`p95`,label:`p95`}],ye={configuration:[`framework`,`model`,`gpu_type`,`gpu_count`,`task`,`prompt_tokens`,`generated_tokens`,`tokens`,`total_tokens`,`cli_args`,`env_vars`,`kwargs`],metrics:[`queries_per_second`,`ttft_mean`,`ttft_p50`,`ttft_p90`,`ttft_p95`,`itl_mean`,`itl_p50`,`itl_p90`,`itl_p95`,`ttlt_mean`,`ttlt_p50`,`ttlt_p90`,`ttlt_p95`]},J=[{keys:[`framework`],label:`Framework`,value:e=>e.framework},{keys:[`model`],label:`Model`,value:e=>`${e.model}`},{keys:[`gpu_type`,`gpu_count`],label:`GPU`,value:e=>`${e.gpu_count} × ${e.gpu_type}`},{keys:[`task`,`prompt_tokens`,`generated_tokens`,`total_tokens`],label:`Task`,value:e=>e.task},{keys:[`cli_args`],label:`CLI Args`,value:e=>e.cli_args??`–`,onlyTooltip:!0},{keys:[`env_vars`],label:`Env Vars`,value:e=>e.env_vars??`–`,onlyTooltip:!0},{keys:[`kwargs`],label:`kwargs`,value:e=>e.kwargs??`–`,onlyTooltip:!0}];function Y(e,t,n){let r=Math.min(e.endX,t.endX);if(r<=n||Math.abs(e.slope-t.slope)<1e-10)return null;let i=n+(t.y-e.y)/(e.slope-t.slope);return i>n&&i<=r?i:null}function X(e){let t=new Map;if(e.length===0)return t;e.forEach(e=>t.set(e.rows,0));let n=[];e.forEach((e,t)=>{e.xs.forEach(e=>{n.push({x:e,type:`start`,curveIndex:t}),n.push({x:e,type:`end`,curveIndex:t})})}),n.sort((e,t)=>e.x===t.x?e.type===`end`?-1:1:e.x-t.x);let r=[],i=n[0].x,a=null;for(let o=0;o<n.length;o++){let s=n[o],c=s.x,l=s.curveIndex>=0?e[s.curveIndex]:void 0;if(i!==void 0&&a!==null){let r=n[n.length-1].x-n[0].x,o=(c-i)/r;if(a>=0){let n=e[a],r=t.get(n.rows)||0;t.set(n.rows,r+o)}}for(let e of r)e.y+=e.slope*(c-i);if(s.type===`end`){let e=r.findIndex(e=>e.curveIndex===s.curveIndex);e!==-1&&r.splice(e,1)}if(s.type===`start`&&s.curveIndex>=0){if(!l)throw Error(`Expected curve for non-intersection start event`);let e=l.xs.findIndex((e,t)=>t<l.xs.length-1&&c>=e&&c<l.xs[t+1]);if(e>=0){let t=l.xs[e],n=l.xs[e+1],i=l.ys[e],a=(l.ys[e+1]-i)/(n-t),o={curveIndex:s.curveIndex,y:i+a*(c-t),slope:a,endX:n,curve:l,segmentIndex:e},u=r.findIndex(e=>e.y>o.y);u===-1?r.push(o):r.splice(u,0,o)}}a=r.length>0?r[0].curveIndex:null;let u=1/0;if(r.length>1)for(let e=0;e<r.length-1;e++){let t=Y(r[e],r[e+1],c);t!==null&&t<u&&(u=t)}u<1/0&&u<n[o+1]?.x&&n.splice(o+1,0,{x:u,type:`end`,curveIndex:-1},{x:u,type:`start`,curveIndex:-1}),i=c}return t}function be(e,t,n){let r=e.filter(e=>t.every(t=>q(e,t))).map(e=>({...e,interpoloated_metric:null,...Object.fromEntries(J.map(t=>[t.label,t.value(e)]))})),i=Object.groupBy(r,e=>JSON.stringify(J.map(t=>e[t.label])));if(n){let e=X(Object.values(i).filter(e=>e!==null).map(e=>{let t=[...e].sort((e,t)=>e.queries_per_second-t.queries_per_second);return{xs:t.map(e=>e.queries_per_second),ys:t.map(e=>e[n]),rows:e}}));for(let[t,n]of e)for(let e of t)e.interpoloated_metric=-n}let a=J.map(e=>({column:e,values:new Set(r.map(t=>t[e.label]))})).filter(e=>e.values.size>1).map(e=>e.column),o=r.map(e=>({...e,fullDescription:a.map(t=>e[t.label]).join(`, `)||`–`,legendString:J.filter(e=>[`Framework`,`GPU`].includes(e.label)).map(t=>e[t.label]).join(`, `)})),s=Array.from(new Set(o.map(e=>e.legendString)));function c(e){return e.toLowerCase().includes(`sglang`)?13:e.toLowerCase().includes(`vllm`)?10:e.toLowerCase().includes(`tensorrt-llm`)?1:0}return{filteredRows:o,discriminativeColumns:a,colorScale:{domain:s,range:s.map(e=>M[c(e)])}}}var xe=o(`<span>I want to see</span> <!> <span>configuration</span>`,1),Se=o(`<div> </div>`),Ce=o(`<img src="https://modal-cdn.com/llm-almanac/divider-3.png" alt="" class="absolute left-1/2 top-1/2 aspect-square h-full -translate-x-1/2 -translate-y-1/2 opacity-5"/> <div class="text-almanac-dark-green absolute inset-0 z-10 grid place-items-center text-3xl"><p>We've never done that.<br/> <span class="text-xl">Think you can? <a href="https://github.com/modal-labs/stopwatch" target="_blank" class="text-almanac-dark-green hover:text-almanac-dark-green underline decoration-1 underline-offset-[3px] transition-colors">Show us how!</a></span></p></div>`,1),we=o(`<div><!></div>`),Te=o(`<div class="bg-linear-to-t pointer-events-none absolute bottom-0 left-0 right-0 h-8 from-[#fcfcfc] to-transparent"></div>`),Ee=o(`<div role="button" tabindex="0"><!> <!></div>`),De=o(`<th><div class="flex items-center gap-2"><span> </span></div></th>`),Oe=o(`<td> </td>`),ke=o(`<tr></tr>`),Ae=o(`<div><table class="bg-[#F4F4F4]/60"><thead class="border-almanac-lime-green/10 border-b"><tr class="pb-2"></tr></thead><tbody></tbody></table></div>`),je=o(`<!> <!> <div><!> <div><!></div> <!></div> <div class="grid min-w-0 sm:grid-cols-[minmax(auto,88px)_1fr]"><div class="mb-4 mt-8 flex flex-col items-center justify-center gap-4 self-center sm:col-start-2 lg:flex-row lg:gap-8"><div><label for="metric-group" class="mr-1 font-semibold">Metric:</label> <!></div> <div><label for="aggregate" class="mr-1 font-semibold">Aggregate:</label> <!></div></div></div> <!> <div class="mt-8 hidden self-center"><button class="hover:bg-almanac-lime-green/5 flex items-center gap-1 rounded-[3px] px-2 py-1 text-sm transition-colors"> <!></button></div> <!>`,1);function Me(t,o){E(o,!0);let v=x(o,`hideFilters`,3,!1),T=x(o,`hideCodeSample`,3,!1),A=x(o,`skipBestCalculation`,3,!1),j=x(o,`hideLegend`,3,!1),M=x(o,`selectedYMetricGroupKey`,15),N=x(o,`selectedYMetricAggregateKey`,15),P=x(o,`selectedBestBy`,15,`all`),I=x(o,`useOpacity`,3,!1),L=g(()=>be(o.rows??[],o.filterConditions,A()?void 0:`${M()}_${N()}`)),R=g(()=>n(L).filteredRows),z=g(()=>({rows:n(R)})),se=g(()=>n(L).discriminativeColumns),ce=g(()=>n(L).colorScale),B=g(()=>!ae()),V=g(()=>n(B)||T()?o.clientWidth:Math.min(o.clientWidth,o.clientWidth/2+(ie.current??1e3)/2-350)),le=g(()=>Math.max(600,n(V)*.5)),H=g(()=>({$schema:`https://vega.github.io/schema/vega-lite/v6.json`,description:`A line chart of different LLM engine benchmark runs, in different configurations.`,height:n(le),width:n(V),autosize:{type:`fit`,resize:!0},data:{name:`rows`},params:[{name:`yField`,value:`ttft_p95`},{name:`yTitle`,value:[`← Lower is better`,`Median time to first token (s)`]},{name:`highlight`,select:{type:`point`,on:`pointerover`,fields:[`fullDescription`]}},{name:`clicked`,select:{type:`point`,on:`click`,fields:[`fullDescription`],toggle:!1}}],transform:[{calculate:`datum[yField] * (yField[0] === 'i' ? 1000 : 1)`,as:`selectedYMetric`},{joinaggregate:[{op:`argmax`,field:`queries_per_second`,as:`maxThroughput`}]},{calculate:`datum['maxThroughput']['fullDescription'] === datum['fullDescription']`,as:`isMaxThroughput`},...P()===`throughput`?[{filter:`datum['isMaxThroughput']`}]:[],{joinaggregate:[{op:`argmin`,field:`interpoloated_metric`,as:`minMetricDatum`}]},{calculate:`datum['minMetricDatum']['fullDescription'] === datum['fullDescription']`,as:`isMinMetricDatum`},...P()===`latency`?[{filter:`datum['isMinMetricDatum']`}]:[]],mark:{type:`line`,point:{size:I()?40:60},opacity:I()?.7:1,tooltip:{content:`data`},strokeWidth:I()?2:3,strokeCap:`round`},encoding:{x:{field:`queries_per_second`,type:`quantitative`,title:[`Throughput (requests/s per replica)`,`Higher is better →`],axis:{labelOverlap:`parity`,labelSeparation:25,titlePadding:20}},y:{field:`selectedYMetric`,type:`quantitative`,title:{signal:`yTitle`},scale:{type:`log`,base:10}},color:{field:`legendString`,type:`nominal`,title:null,scale:n(ce),...j()&&{legend:null}},detail:{field:`fullDescription`,type:`nominal`,...j()&&{legend:null}},...I()&&{opacity:{condition:[{param:`highlight`,value:1,empty:!1}],value:.4}},tooltip:[...n(se).map(e=>({field:e.label,type:`nominal`,title:e.label})),{field:`selectedYMetric`,type:`quantitative`,title:`Latency (s)`,format:`5.3f`},{field:`queries_per_second`,type:`quantitative`,title:`Throughput (req/s)`,format:`.2f`}]}})),W=p(void 0),G=[...ye.configuration],de=g(()=>Object.values(Object.fromEntries(n(R).map(e=>[JSON.stringify(G.map(t=>[t,e[t]])),e]))));function fe(e,t){return t===null?`–`:`${t}`}let me=g(()=>_e.find(e=>e.key===M())||_e[0]),he=g(()=>ve.find(e=>e.key===N())||ve[0]),ge=p(void 0),K=p(void 0),q=g(()=>n(K)?n(R).find(e=>e.fullDescription===n(K)):n(ge));i(()=>{if(n(W)){let e=`${M()}_${N()}`,t=[`Latency (${M()===`itl`?`ms`:`s`}, ${n(he).label} ${n(me).label})`,`← Lower is better`];n(W).signal(`yField`,e).signal(`yTitle`,t).run();let r=(e,t)=>{S(K,t.fullDescription?.[0],!0)};return n(W).addSignalListener(`clicked`,r),()=>{n(W)?.removeSignalListener(`clicked`,r)}}}),i(()=>{n(W)&&(n(H),S(ge,n(W).data(`data_1`).sort((e,t)=>t.queries_per_second-e.queries_per_second)[0],!0))});let Y=p(!1),X=p(!1);function Me(){if(!o.rows)return;let e=Object.groupBy(o.rows,e=>JSON.stringify(J.map(t=>t.value(e)))),t=Object.keys(e),n=e[t[Math.floor(Math.random()*t.length)]];if(!n)return;let r=n[0],i=[];i.push({type:`range`,column:`ttft_p95`,maxValue:1e3/1e3});for(let[e,t]of Object.entries(r))[`model`,`tokens`].includes(e)&&i.push({type:`eq`,column:e,value:`${t}`});o.setFilterConditions?.(i)}var Ne={setRandomFilterConditions:Me},Pe=je(),Fe=h(Pe),Ie=e=>{pe(e,{get filterConditions(){return o.filterConditions},get setFilterConditions(){return o.setFilterConditions},extraFilter:e=>{var t=k(),n=h(t),r=e=>{U(e,{active:!0,class:`self-stretch`,children:(e,t)=>{var n=xe();F(w(h(n),2),{options:[{label:`the highest throughput`,value:`throughput`},{label:`the lowest latency`,value:`latency`},{label:`every benchmarked`,value:`all`}],get value(){return P()},set value(e){P(e)}}),O(2),f(e,n)},$$slots:{default:!0}})};y(n,e=>{o.setFilterConditions&&!v()&&e(r)}),f(e,t)},$$slots:{extraFilter:!0}})};y(Fe,e=>{v()||e(Ie)});var Le=w(Fe,2);ee(Le,()=>o.curious??b);var Z=w(Le,2),Re=e(Z),ze=t=>{var n=Se(),r=e(n,!0);s(n),C(()=>{l(n,1,a([`border-almanac-lime-green/10 text-almanac-dark-green/50 absolute inset-0 z-10 grid place-items-center rounded-md border-4 text-3xl`,!o.rows&&!o.loadingError&&`animate-pulse`])),D(r,o.loadingError?`Error loading data`:`Loading...`)}),f(t,n)},Be=e=>{var t=k(),r=h(t),i=e=>{var t=Ce();O(2),f(e,t)};y(r,e=>{o.rows.length>0&&n(R).length===0&&e(i)},!0),f(e,t)};y(Re,e=>{!n(W)||!o.rows||o.loadingError?e(ze):e(Be,!1)});var Q=w(Re,2);re(e(Q),{get data(){return n(z)},get spec(){return n(H)},get isMobile(){return n(B)},bottomLegend:!0,get viewVL(){return n(W)},set viewVL(e){S(W,e,!0)}}),s(Q);var Ve=w(Q,2),He=t=>{var r=we();l(r,1,a([`group pointer-events-none overflow-hidden lg:absolute lg:bottom-0 lg:left-1/2 lg:top-0 lg:w-screen lg:translate-x-[-50%]`,`relative`])),ue(e(r),{get row(){return n(q)},class:[`pointer-events-auto absolute bottom-6 right-0 top-8 translate-x-[calc(100%-300px)] group-hover:translate-x-[-10px]`,`max-h-full w-[calc(min(800px,100%-100px))] select-text overflow-auto`]}),s(r),f(t,r)};y(Ve,e=>{n(q)&&!T()&&!n(B)&&e(He)}),s(Z);var $=w(Z,2);let Ue;var We=e($),Ge=e(We),Ke=w(e(Ge),2);{let e=g(()=>_e.map(e=>({label:e.label,value:e.key})));F(Ke,{variant:`transparent`,get options(){return n(e)},id:`metric-group`,get value(){return M()},set value(e){M(e)}})}s(Ge);var qe=w(Ge,2),Je=w(e(qe),2);{let e=g(()=>ve.map(e=>({label:e.label,value:e.key})));F(Je,{variant:`transparent`,get options(){return n(e)},id:`aggregate`,get value(){return N()},set value(e){N(e)}})}s(qe),s(We),s($);var Ye=w($,2),Xe=t=>{var i=Ee();i.__click=()=>S(X,!n(X)),i.__keydown=e=>{(e.key===`Enter`||e.key===` `)&&S(X,!n(X))};var o=e(i);ue(o,{mobile:!0,get row(){return n(q)}});var c=w(o,2),u=e=>{f(e,Te())};y(c,e=>{n(X)||e(u)}),s(i),C(()=>{l(i,1,a([`relative mb-8 overflow-hidden`,!n(X)&&`max-h-[150px]`])),r(i,`aria-label`,n(X)?`Hide code block`:`Show more code`)}),f(t,i)};y(Ye,e=>{n(q)&&!T()&&n(B)&&e(Xe)});var Ze=w(Ye,2),Qe=e(Ze);Qe.__click=()=>S(Y,!n(Y));var $e=e(Qe),et=w($e),tt=e=>{ne(e,{class:`h-4 w-4`})},nt=e=>{oe(e,{class:`h-4 w-4`})};y(et,e=>{n(Y)?e(tt):e(nt,!1)}),s(Qe),s(Ze);var rt=w(Ze,2),it=t=>{var r=Ae();l(r,1,a([`-ml-12 -mr-12 mt-2 max-w-[calc(100%+96px)] self-center text-sm lg:ml-12 lg:mr-12 lg:max-w-full`,`border-almanac-lime-green/20 overflow-x-scroll border-y bg-[#F4F4F4]/60 lg:rounded-md lg:border-x`]));var i=e(r),o=e(i),c=e(o);m(c,21,()=>G,_,(t,r,i)=>{var o=De();l(o,1,a([`whitespace-nowrap px-4 py-2 text-left font-bold`,i>0?`pl-6`:``]));var c=e(o),u=e(c),d=e(u,!0);s(u),s(c),s(o),C(()=>D(d,n(r))),f(t,o)}),s(c),s(o);var u=w(o);m(u,21,()=>n(de),_,(t,r)=>{var i=ke();m(i,21,()=>G,_,(t,i,o)=>{var c=Oe();l(c,1,a([`whitespace-nowrap px-4 pt-1 align-top`,o>0?`pl-6`:``]));var u=e(c,!0);s(c),C(e=>D(u,e),[()=>fe(n(i),n(r)[n(i)])]),f(t,c)}),s(i),f(t,i)}),s(u),s(i),s(r),d(3,r,()=>te,()=>({duration:200,axis:`y`})),f(t,r)};return y(rt,e=>{n(Y)&&e(it)}),C(()=>{l(Z,1,a([`vega-container aspect-2/1 relative min-h-[600px] max-w-full select-none self-center`,!v()&&`mt-8`])),l(Q,1,a([o.rows&&o.rows.length>0&&n(R).length===0&&`hidden`])),Ue=c($,``,Ue,{width:n(V)?`${n(V)}px`:void 0}),D($e,`${n(Y)?`Hide Data`:`Show Data`} `)}),f(t,Pe),u(Ne)}t([`click`,`keydown`]);export{K as a,ge as i,be as n,J as r,Me as t};
//# sourceMappingURL=C6JX7bmt.js.map
