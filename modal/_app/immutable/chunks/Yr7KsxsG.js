(function(){try{var e=typeof window<`u`?window:typeof global<`u`?global:typeof globalThis<`u`?globalThis:typeof self<`u`?self:{};e.SENTRY_RELEASE={id:`f99fcf9f0a844cc9bd13fdc8e5782b84`};var t=new e.Error().stack;t&&(e._sentryDebugIds=e._sentryDebugIds||{},e._sentryDebugIds[t]=`eed3ec04-ccb0-427a-a750-69366bf1f06c`,e._sentryDebugIdIdentifier=`sentry-dbid-eed3ec04-ccb0-427a-a750-69366bf1f06c`)}catch{}})();import{$t as e,St as t,Tn as n,Tt as r,bt as i,c as a,d as o,en as s,tn as c,wn as l}from"./F_ixKBiO.js";import"./B1sc9Zdx.js";import"./Bb2deiU3.js";import{o as u}from"./CPby7b1n.js";import{t as d}from"./BILrvr3I.js";import{t as f}from"./B4L_if842.js";import{t as p}from"./DeWGVqas2.js";var m={toc:[{depth:1,value:`Training script for training a reasoning model using the verifiers library with sandboxed code execution`,id:`training-script-for-training-a-reasoning-model-using-the-verifiers-library-with-sandboxed-code-execution`}],rawContent:`# Training script for training a reasoning model using the verifiers library with sandboxed code execution

This script is used to train a model using GRPO. This is adapted from the [verifiers library](https://github.com/willccbb/verifiers/blob/main/verifiers/examples/math_python.py) example.
Here, we use a Modal Sandbox to execute python code during training. Modal Sandboxes offer an easy way to execute untrusted code in a completely isolated environment.
This is a more secure way to execute python code during training.

\`\`\`python
import sys

import modal
import verifiers as vf
from verifiers.utils import load_example_dataset

\`\`\`

We create a Modal app and a Modal sandbox.

\`\`\`python
app = modal.App.lookup("example-trainer-script-grpo", create_if_missing=True)
sb = modal.Sandbox.create(app=app)


\`\`\`

We create a function that will execute the python code in a Modal Sandbox.

\`\`\`python
def sandbox_exec(code):
    try:
        process = sb.exec("python", "-c", code, timeout=10)
        process.wait()

        stdout = process.stdout.read()
        stderr = process.stderr.read()
        if stderr:
            return f"Error: {stderr.strip()}"

        output = stdout.strip() if stdout else ""
        if len(output) > 1000:
            output = output[:1000] + "... (truncated to 1000 chars)"

        return output
    except Exception as e:
        return f"Error: {str(e)}"


\`\`\`

We define the tool prompt for prompting the model. Then, we pass in our \`sandbox_exec\` function as a tool to the \`ToolEnv\` definition.

\`\`\`python
TOOL_PROMPT = """
Think step-by-step inside <think>...</think> tags in each message, then either call a tool inside <tool>...</tool> tags, or give your final answer inside <answer>...</answer> tags.

You have access to the following tools to help solve problems:

{tool_descriptions}

Tools can be called by writing a JSON command inside <tool> tags with:
- "name": the name of the tool to use
- "args": the arguments for the tool

Example usage:
<tool>
{{"name": "python", "args": {{"code": "import sympy\\\\nx = sympy.symbols('x')\\\\nprint(sympy.solve(x**2 - 4, x))"}}}}
</tool>

After concluding your message with a tool call,
you will then see the tool's output inside <result> tags as a new message. \\
You may call tools multiple times if needed. \\
Tool state does not persist between calls. \\
Always use tools to solve problems whenever possible, rather than using your own knowledge.

The <answer>...</answer> tags should contain only your final answer as a numeric expression.
"""

dataset = load_example_dataset("math", split="train").select(range(128))

vf_env = vf.ToolEnv(
    dataset=dataset,
    system_prompt=TOOL_PROMPT,
    few_shot=[],
    tools=[sandbox_exec],
    max_steps=3,
)

run_id = sys.argv[2]
model_name = "willcb/Qwen3-0.6B"
model, tokenizer = vf.get_model_and_tokenizer(model_name)
run_name = "math-grpo_" + model_name.split("/")[-1].lower()

\`\`\`

These parameters are adapted to test the training script via an overfitting test. We will use 128 examples from the training set and overfit the model to them.
To learn more about the parameters, please refer to the [verifiers library](https://github.com/willccbb/verifiers/blob/main/verifiers/examples/math_python.py) example.

\`\`\`python
training_args = vf.grpo_defaults(run_name=run_name)
training_args.num_iterations = 50
training_args.max_steps = 50
training_args.per_device_train_batch_size = 4
training_args.gradient_accumulation_steps = 4
training_args.num_generations = 12
training_args.learning_rate = 1e-3
training_args.logging_steps = 1
training_args.report_to = "wandb"

trainer = vf.GRPOTrainer(
    model=model,
    processing_class=tokenizer,
    env=vf_env,
    args=training_args,
)
trainer.train()

sb.terminate()
save_path = f"/root/math_weights/{run_id}"
trainer.save_model(save_path)
tokenizer.save_pretrained(save_path)
print(f"Model and tokenizer saved to {save_path}")

\`\`\`
`,meta:{title:`Training script for training a reasoning model using the verifiers library with sandboxed code execution`,description:`This script is used to train a model using GRPO. This is adapted from the verifiers library example. Here, we use a Modal Sandbox to execute python code during training. Modal Sandboxes offer an easy way to execute untrusted code in a completely isolated environment. This is a more secure way to execute python code during training.`}},{toc:h,rawContent:g,meta:_}=m,v=t(`<!> <p>This script is used to train a model using GRPO. This is adapted from the <!> example.
Here, we use a Modal Sandbox to execute python code during training. Modal Sandboxes offer an easy way to execute untrusted code in a completely isolated environment.
This is a more secure way to execute python code during training.</p> <!> <p>We create a Modal app and a Modal sandbox.</p> <!> <p>We create a function that will execute the python code in a Modal Sandbox.</p> <!> <p>We define the tool prompt for prompting the model. Then, we pass in our <code>sandbox_exec</code> function as a tool to the <code>ToolEnv</code> definition.</p> <!> <p>These parameters are adapted to test the training script via an overfitting test. We will use 128 examples from the training set and overfit the model to them.
To learn more about the parameters, please refer to the <!> example.</p> <!>`,1);function y(t,h){let g=a(h,[`children`,`$$slots`,`$$events`,`$$legacy`]);f(t,o(()=>g,()=>m,{children:(t,a)=>{var o=v(),f=s(o);u(f,{id:`training-script-for-training-a-reasoning-model-using-the-verifiers-library-with-sandboxed-code-execution`,children:(e,t)=>{l(),i(e,r(`Training script for training a reasoning model using the verifiers library with sandboxed code execution`))},$$slots:{default:!0}});var m=c(f,2);p(c(e(m)),{href:`https://github.com/willccbb/verifiers/blob/main/verifiers/examples/math_python.py`,rel:`nofollow`,children:(e,t)=>{l(),i(e,r(`verifiers library`))},$$slots:{default:!0}}),l(),n(m);var h=c(m,2);d(h,{code:`import%20sys%0A%0Aimport%20modal%0Aimport%20verifiers%20as%20vf%0Afrom%20verifiers.utils%20import%20load_example_dataset%0A`,lang:`python`});var g=c(h,4);d(g,{code:`app%20%3D%20modal.App.lookup(%22example-trainer-script-grpo%22%2C%20create_if_missing%3DTrue)%0Asb%20%3D%20modal.Sandbox.create(app%3Dapp)%0A%0A`,lang:`python`});var _=c(g,4);d(_,{code:`def%20sandbox_exec(code)%3A%0A%20%20%20%20try%3A%0A%20%20%20%20%20%20%20%20process%20%3D%20sb.exec(%22python%22%2C%20%22-c%22%2C%20code%2C%20timeout%3D10)%0A%20%20%20%20%20%20%20%20process.wait()%0A%0A%20%20%20%20%20%20%20%20stdout%20%3D%20process.stdout.read()%0A%20%20%20%20%20%20%20%20stderr%20%3D%20process.stderr.read()%0A%20%20%20%20%20%20%20%20if%20stderr%3A%0A%20%20%20%20%20%20%20%20%20%20%20%20return%20f%22Error%3A%20%7Bstderr.strip()%7D%22%0A%0A%20%20%20%20%20%20%20%20output%20%3D%20stdout.strip()%20if%20stdout%20else%20%22%22%0A%20%20%20%20%20%20%20%20if%20len(output)%20%3E%201000%3A%0A%20%20%20%20%20%20%20%20%20%20%20%20output%20%3D%20output%5B%3A1000%5D%20%2B%20%22...%20(truncated%20to%201000%20chars)%22%0A%0A%20%20%20%20%20%20%20%20return%20output%0A%20%20%20%20except%20Exception%20as%20e%3A%0A%20%20%20%20%20%20%20%20return%20f%22Error%3A%20%7Bstr(e)%7D%22%0A%0A`,lang:`python`});var y=c(_,4);d(y,{code:`TOOL_PROMPT%20%3D%20%22%22%22%0AThink%20step-by-step%20inside%20%3Cthink%3E...%3C%2Fthink%3E%20tags%20in%20each%20message%2C%20then%20either%20call%20a%20tool%20inside%20%3Ctool%3E...%3C%2Ftool%3E%20tags%2C%20or%20give%20your%20final%20answer%20inside%20%3Canswer%3E...%3C%2Fanswer%3E%20tags.%0A%0AYou%20have%20access%20to%20the%20following%20tools%20to%20help%20solve%20problems%3A%0A%0A%7Btool_descriptions%7D%0A%0ATools%20can%20be%20called%20by%20writing%20a%20JSON%20command%20inside%20%3Ctool%3E%20tags%20with%3A%0A-%20%22name%22%3A%20the%20name%20of%20the%20tool%20to%20use%0A-%20%22args%22%3A%20the%20arguments%20for%20the%20tool%0A%0AExample%20usage%3A%0A%3Ctool%3E%0A%7B%7B%22name%22%3A%20%22python%22%2C%20%22args%22%3A%20%7B%7B%22code%22%3A%20%22import%20sympy%5C%5Cnx%20%3D%20sympy.symbols('x')%5C%5Cnprint(sympy.solve(x**2%20-%204%2C%20x))%22%7D%7D%7D%7D%0A%3C%2Ftool%3E%0A%0AAfter%20concluding%20your%20message%20with%20a%20tool%20call%2C%0Ayou%20will%20then%20see%20the%20tool's%20output%20inside%20%3Cresult%3E%20tags%20as%20a%20new%20message.%20%5C%0AYou%20may%20call%20tools%20multiple%20times%20if%20needed.%20%5C%0ATool%20state%20does%20not%20persist%20between%20calls.%20%5C%0AAlways%20use%20tools%20to%20solve%20problems%20whenever%20possible%2C%20rather%20than%20using%20your%20own%20knowledge.%0A%0AThe%20%3Canswer%3E...%3C%2Fanswer%3E%20tags%20should%20contain%20only%20your%20final%20answer%20as%20a%20numeric%20expression.%0A%22%22%22%0A%0Adataset%20%3D%20load_example_dataset(%22math%22%2C%20split%3D%22train%22).select(range(128))%0A%0Avf_env%20%3D%20vf.ToolEnv(%0A%20%20%20%20dataset%3Ddataset%2C%0A%20%20%20%20system_prompt%3DTOOL_PROMPT%2C%0A%20%20%20%20few_shot%3D%5B%5D%2C%0A%20%20%20%20tools%3D%5Bsandbox_exec%5D%2C%0A%20%20%20%20max_steps%3D3%2C%0A)%0A%0Arun_id%20%3D%20sys.argv%5B2%5D%0Amodel_name%20%3D%20%22willcb%2FQwen3-0.6B%22%0Amodel%2C%20tokenizer%20%3D%20vf.get_model_and_tokenizer(model_name)%0Arun_name%20%3D%20%22math-grpo_%22%20%2B%20model_name.split(%22%2F%22)%5B-1%5D.lower()%0A`,lang:`python`});var b=c(y,2);p(c(e(b)),{href:`https://github.com/willccbb/verifiers/blob/main/verifiers/examples/math_python.py`,rel:`nofollow`,children:(e,t)=>{l(),i(e,r(`verifiers library`))},$$slots:{default:!0}}),l(),n(b),d(c(b,2),{code:`training_args%20%3D%20vf.grpo_defaults(run_name%3Drun_name)%0Atraining_args.num_iterations%20%3D%2050%0Atraining_args.max_steps%20%3D%2050%0Atraining_args.per_device_train_batch_size%20%3D%204%0Atraining_args.gradient_accumulation_steps%20%3D%204%0Atraining_args.num_generations%20%3D%2012%0Atraining_args.learning_rate%20%3D%201e-3%0Atraining_args.logging_steps%20%3D%201%0Atraining_args.report_to%20%3D%20%22wandb%22%0A%0Atrainer%20%3D%20vf.GRPOTrainer(%0A%20%20%20%20model%3Dmodel%2C%0A%20%20%20%20processing_class%3Dtokenizer%2C%0A%20%20%20%20env%3Dvf_env%2C%0A%20%20%20%20args%3Dtraining_args%2C%0A)%0Atrainer.train()%0A%0Asb.terminate()%0Asave_path%20%3D%20f%22%2Froot%2Fmath_weights%2F%7Brun_id%7D%22%0Atrainer.save_model(save_path)%0Atokenizer.save_pretrained(save_path)%0Aprint(f%22Model%20and%20tokenizer%20saved%20to%20%7Bsave_path%7D%22)%0A`,lang:`python`}),i(t,o)},$$slots:{default:!0}}))}export{y as default,m as metadata};
//# sourceMappingURL=Yr7KsxsG.js.map
