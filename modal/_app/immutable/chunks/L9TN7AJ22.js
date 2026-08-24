(function(){try{var e=typeof window<`u`?window:typeof global<`u`?global:typeof globalThis<`u`?globalThis:typeof self<`u`?self:{};e.SENTRY_RELEASE={id:`f99fcf9f0a844cc9bd13fdc8e5782b84`};var t=new e.Error().stack;t&&(e._sentryDebugIds=e._sentryDebugIds||{},e._sentryDebugIds[t]=`0665a757-f182-42ac-800f-c604ba3b53dc`,e._sentryDebugIdIdentifier=`sentry-dbid-0665a757-f182-42ac-800f-c604ba3b53dc`)}catch{}})();import{$t as e,St as t,Tn as n,Tt as r,bt as i,c as a,d as o,en as s,tn as c,wn as l}from"./F_ixKBiO.js";import"./B1sc9Zdx.js";import"./Bb2deiU3.js";import{a as u,o as d}from"./CPby7b1n.js";import{t as f}from"./BILrvr3I.js";import{t as p}from"./B4L_if842.js";import{t as m}from"./DeWGVqas2.js";var h={toc:[{depth:1,value:`Run arbitrary code in a sandboxed environment`,id:`run-arbitrary-code-in-a-sandboxed-environment`,children:[{depth:2,value:`Setting up a multi-language environment`,id:`setting-up-a-multi-language-environment`},{depth:2,value:`Running bash, Python, Node.js, Ruby, and PHP in a Sandbox`,id:`running-bash-python-nodejs-ruby-and-php-in-a-sandbox`}]}],rawContent:`# Run arbitrary code in a sandboxed environment

This example demonstrates how to run arbitrary code
in multiple languages in a Modal [Sandbox](https://modal.com/docs/guide/sandbox).

## Setting up a multi-language environment

Sandboxes allow us to run any kind of code in a safe environment.
We'll use an image with a few different language runtimes to demonstrate this.

\`\`\`python
import modal

image = modal.Image.debian_slim(python_version="3.11").apt_install(
    "nodejs", "ruby", "php"
)
app = modal.App.lookup("example-safe-code-execution", create_if_missing=True)

\`\`\`

We'll now create a Sandbox with this image. We'll also enable output so we can see the image build
logs. Note that we don't pass any commands to the Sandbox, so it will stay alive, waiting for us
to send it commands.

\`\`\`python
with modal.enable_output():
    sandbox = modal.Sandbox.create(app=app, image=image)

print(f"Sandbox ID: {sandbox.object_id}")

\`\`\`

## Running bash, Python, Node.js, Ruby, and PHP in a Sandbox

We can now use [\`Sandbox.exec\`](https://modal.com/docs/reference/modal.Sandbox#exec) to run a few different
commands in the Sandbox.

\`\`\`python
bash_ps = sandbox.exec("echo", "hello from bash")
python_ps = sandbox.exec("python", "-c", "print('hello from python')")
nodejs_ps = sandbox.exec("node", "-e", 'console.log("hello from nodejs")')
ruby_ps = sandbox.exec("ruby", "-e", "puts 'hello from ruby'")
php_ps = sandbox.exec("php", "-r", "echo 'hello from php';")

print(bash_ps.stdout.read(), end="")
print(python_ps.stdout.read(), end="")
print(nodejs_ps.stdout.read(), end="")
print(ruby_ps.stdout.read(), end="")
print(php_ps.stdout.read(), end="")
print()

\`\`\`

The output should look something like

\`\`\`
hello from bash
hello from python
hello from nodejs
hello from ruby
hello from php
\`\`\`

We can use multiple languages in tandem to build complex applications.
Let's demonstrate this by piping data between Python and Node.js using bash. Here
we generate some random numbers with Python and sum them with Node.js.

\`\`\`python
combined_process = sandbox.exec(
    "bash",
    "-c",
    """python -c 'import random; print(\\" \\".join(str(random.randint(1, 100)) for _ in range(10)))' |
    node -e 'const readline = require(\\"readline\\");
    const rl = readline.createInterface({input: process.stdin});
    rl.on(\\"line\\", (line) => {
      const sum = line.split(\\" \\").map(Number).reduce((a, b) => a + b, 0);
      console.log(\`The sum of the random numbers is: \${sum}\`);
      rl.close();
    });'""",
)

result = combined_process.stdout.read().strip()
print(result)

\`\`\`

For long-running processes, you can use stdout as an iterator to stream the output.

\`\`\`python
slow_printer = sandbox.exec(
    "ruby",
    "-e",
    """
    10.times do |i|
      puts "Line #{i + 1}: #{Time.now}"
      STDOUT.flush
      sleep(0.5)
    end
    """,
)

for line in slow_printer.stdout:
    print(line, end="")

\`\`\`

This should print something like

\`\`\`
Line 1: 2024-10-21 15:30:53 +0000
Line 2: 2024-10-21 15:30:54 +0000
...
Line 10: 2024-10-21 15:30:58 +0000
\`\`\`

Since Sandboxes are safely separated from the rest of our system,
we can run very dangerous code in them!

\`\`\`python
sandbox.exec("rm", "-rfv", "/", "--no-preserve-root")

\`\`\`

This command has deleted the entire filesystem, so we can't run any more commands.
Let's terminate the Sandbox to clean up after ourselves.

\`\`\`python
sandbox.terminate()

\`\`\`
`,meta:{title:`Run arbitrary code in a sandboxed environment`,description:`This example demonstrates how to run arbitrary code in multiple languages in a Modal Sandbox.`}},{toc:g,rawContent:_,meta:v}=h,y=t(`<code>Sandbox.exec</code>`),b=t(`<!> <p>This example demonstrates how to run arbitrary code
in multiple languages in a Modal <!>.</p> <!> <p>Sandboxes allow us to run any kind of code in a safe environment.
We’ll use an image with a few different language runtimes to demonstrate this.</p> <!> <p>We’ll now create a Sandbox with this image. We’ll also enable output so we can see the image build
logs. Note that we don’t pass any commands to the Sandbox, so it will stay alive, waiting for us
to send it commands.</p> <!> <!> <p>We can now use <!> to run a few different
commands in the Sandbox.</p> <!> <p>The output should look something like</p> <!> <p>We can use multiple languages in tandem to build complex applications.
Let’s demonstrate this by piping data between Python and Node.js using bash. Here
we generate some random numbers with Python and sum them with Node.js.</p> <!> <p>For long-running processes, you can use stdout as an iterator to stream the output.</p> <!> <p>This should print something like</p> <!> <p>Since Sandboxes are safely separated from the rest of our system,
we can run very dangerous code in them!</p> <!> <p>This command has deleted the entire filesystem, so we can’t run any more commands.
Let’s terminate the Sandbox to clean up after ourselves.</p> <!>`,1);function x(t,g){let _=a(g,[`children`,`$$slots`,`$$events`,`$$legacy`]);p(t,o(()=>_,()=>h,{children:(t,a)=>{var o=b(),p=s(o);d(p,{id:`run-arbitrary-code-in-a-sandboxed-environment`,children:(e,t)=>{l(),i(e,r(`Run arbitrary code in a sandboxed environment`))},$$slots:{default:!0}});var h=c(p,2);m(c(e(h)),{href:`https://modal.com/docs/guide/sandbox`,rel:`nofollow`,children:(e,t)=>{l(),i(e,r(`Sandbox`))},$$slots:{default:!0}}),l(),n(h);var g=c(h,2);u(g,{id:`setting-up-a-multi-language-environment`,children:(e,t)=>{l(),i(e,r(`Setting up a multi-language environment`))},$$slots:{default:!0}});var _=c(g,4);f(_,{code:`import%20modal%0A%0Aimage%20%3D%20modal.Image.debian_slim(python_version%3D%223.11%22).apt_install(%0A%20%20%20%20%22nodejs%22%2C%20%22ruby%22%2C%20%22php%22%0A)%0Aapp%20%3D%20modal.App.lookup(%22example-safe-code-execution%22%2C%20create_if_missing%3DTrue)%0A`,lang:`python`});var v=c(_,4);f(v,{code:`with%20modal.enable_output()%3A%0A%20%20%20%20sandbox%20%3D%20modal.Sandbox.create(app%3Dapp%2C%20image%3Dimage)%0A%0Aprint(f%22Sandbox%20ID%3A%20%7Bsandbox.object_id%7D%22)%0A`,lang:`python`});var x=c(v,2);u(x,{id:`running-bash-python-nodejs-ruby-and-php-in-a-sandbox`,children:(e,t)=>{l(),i(e,r(`Running bash, Python, Node.js, Ruby, and PHP in a Sandbox`))},$$slots:{default:!0}});var S=c(x,2);m(c(e(S)),{href:`https://modal.com/docs/reference/modal.Sandbox#exec`,rel:`nofollow`,children:(e,t)=>{i(e,y())},$$slots:{default:!0}}),l(),n(S);var C=c(S,2);f(C,{code:`bash_ps%20%3D%20sandbox.exec(%22echo%22%2C%20%22hello%20from%20bash%22)%0Apython_ps%20%3D%20sandbox.exec(%22python%22%2C%20%22-c%22%2C%20%22print('hello%20from%20python')%22)%0Anodejs_ps%20%3D%20sandbox.exec(%22node%22%2C%20%22-e%22%2C%20'console.log(%22hello%20from%20nodejs%22)')%0Aruby_ps%20%3D%20sandbox.exec(%22ruby%22%2C%20%22-e%22%2C%20%22puts%20'hello%20from%20ruby'%22)%0Aphp_ps%20%3D%20sandbox.exec(%22php%22%2C%20%22-r%22%2C%20%22echo%20'hello%20from%20php'%3B%22)%0A%0Aprint(bash_ps.stdout.read()%2C%20end%3D%22%22)%0Aprint(python_ps.stdout.read()%2C%20end%3D%22%22)%0Aprint(nodejs_ps.stdout.read()%2C%20end%3D%22%22)%0Aprint(ruby_ps.stdout.read()%2C%20end%3D%22%22)%0Aprint(php_ps.stdout.read()%2C%20end%3D%22%22)%0Aprint()%0A`,lang:`python`});var w=c(C,4);f(w,{code:`hello%20from%20bash%0Ahello%20from%20python%0Ahello%20from%20nodejs%0Ahello%20from%20ruby%0Ahello%20from%20php`,lang:`text`});var T=c(w,4);f(T,{code:`combined_process%20%3D%20sandbox.exec(%0A%20%20%20%20%22bash%22%2C%0A%20%20%20%20%22-c%22%2C%0A%20%20%20%20%22%22%22python%20-c%20'import%20random%3B%20print(%5C%22%20%5C%22.join(str(random.randint(1%2C%20100))%20for%20_%20in%20range(10)))'%20%7C%0A%20%20%20%20node%20-e%20'const%20readline%20%3D%20require(%5C%22readline%5C%22)%3B%0A%20%20%20%20const%20rl%20%3D%20readline.createInterface(%7Binput%3A%20process.stdin%7D)%3B%0A%20%20%20%20rl.on(%5C%22line%5C%22%2C%20(line)%20%3D%3E%20%7B%0A%20%20%20%20%20%20const%20sum%20%3D%20line.split(%5C%22%20%5C%22).map(Number).reduce((a%2C%20b)%20%3D%3E%20a%20%2B%20b%2C%200)%3B%0A%20%20%20%20%20%20console.log(%60The%20sum%20of%20the%20random%20numbers%20is%3A%20%24%7Bsum%7D%60)%3B%0A%20%20%20%20%20%20rl.close()%3B%0A%20%20%20%20%7D)%3B'%22%22%22%2C%0A)%0A%0Aresult%20%3D%20combined_process.stdout.read().strip()%0Aprint(result)%0A`,lang:`python`});var E=c(T,4);f(E,{code:`slow_printer%20%3D%20sandbox.exec(%0A%20%20%20%20%22ruby%22%2C%0A%20%20%20%20%22-e%22%2C%0A%20%20%20%20%22%22%22%0A%20%20%20%2010.times%20do%20%7Ci%7C%0A%20%20%20%20%20%20puts%20%22Line%20%23%7Bi%20%2B%201%7D%3A%20%23%7BTime.now%7D%22%0A%20%20%20%20%20%20STDOUT.flush%0A%20%20%20%20%20%20sleep(0.5)%0A%20%20%20%20end%0A%20%20%20%20%22%22%22%2C%0A)%0A%0Afor%20line%20in%20slow_printer.stdout%3A%0A%20%20%20%20print(line%2C%20end%3D%22%22)%0A`,lang:`python`});var D=c(E,4);f(D,{code:`Line%201%3A%202024-10-21%2015%3A30%3A53%20%2B0000%0ALine%202%3A%202024-10-21%2015%3A30%3A54%20%2B0000%0A...%0ALine%2010%3A%202024-10-21%2015%3A30%3A58%20%2B0000`,lang:`text`});var O=c(D,4);f(O,{code:`sandbox.exec(%22rm%22%2C%20%22-rfv%22%2C%20%22%2F%22%2C%20%22--no-preserve-root%22)%0A`,lang:`python`}),f(c(O,4),{code:`sandbox.terminate()%0A`,lang:`python`}),i(t,o)},$$slots:{default:!0}}))}export{x as default,h as metadata};
//# sourceMappingURL=L9TN7AJ22.js.map
