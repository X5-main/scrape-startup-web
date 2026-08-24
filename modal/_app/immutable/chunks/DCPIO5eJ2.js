(function(){try{var e=typeof window<`u`?window:typeof global<`u`?global:typeof globalThis<`u`?globalThis:typeof self<`u`?self:{};e.SENTRY_RELEASE={id:`f99fcf9f0a844cc9bd13fdc8e5782b84`};var t=new e.Error().stack;t&&(e._sentryDebugIds=e._sentryDebugIds||{},e._sentryDebugIds[t]=`0db67c97-5a53-441c-85ff-d4c233c721fb`,e._sentryDebugIdIdentifier=`sentry-dbid-0db67c97-5a53-441c-85ff-d4c233c721fb`)}catch{}})();import{St as e,Tt as t,bt as n,c as r,d as i,en as a,tn as o,wn as s}from"./F_ixKBiO.js";import"./B1sc9Zdx.js";import"./Bb2deiU3.js";import{o as c}from"./CPby7b1n.js";import{t as l}from"./BILrvr3I.js";import{t as u}from"./B4L_if842.js";var d={toc:[{depth:1,value:`Example (restricted_volumes.py)`,id:`example-restricted_volumespy`}],rawContent:`# Example (restricted_volumes.py)

This is the source code for **08_advanced.restricted_volumes**.

\`\`\`python
import modal

app = modal.App.lookup(name="example-restricted-volumes", create_if_missing=True)
volume = modal.Volume.from_name(
    "example-restricted-volumes-data", create_if_missing=True, version=2
)

image = (
    modal.Image.debian_slim(python_version="3.12")
    .apt_install("sudo")
    .run_commands(
        "sudo adduser --disabled-password --gecos '' user1",
        "sudo adduser --disabled-password --gecos '' user2",
    )
)

sandbox = modal.Sandbox.create(
    app=app, image=image, volumes={"/data": volume}, timeout=300
)
sandbox_id = sandbox.object_id
print("Sandbox ID: ", sandbox_id)

print("⌛Setting up sandbox...")
sandbox.exec("sh", "-c", "mkdir -p /data/user1").wait()
sandbox.exec("sh", "-c", "mkdir -p /data/user2").wait()
sandbox.exec(
    "sh", "-c", "chown -R user1:user1 /data/user1 && chmod 700 /data/user1"
).wait()
sandbox.exec(
    "sh", "-c", "chown -R user2:user2 /data/user2 && chmod 700 /data/user2"
).wait()
print("Sandbox setup complete.")

print("\\n🟢 Baseline exec (unrestricted, should succeed):")
p = sandbox.exec("sh", "-c", "ls -la /data/user1")
for line in p.stdout:
    print(line, end="")
for line in p.stderr:
    print(line, end="")
p.wait()
assert p.returncode == 0, "Unrestricted exec should succeed"

print("\\n🟢 Restricted user1 exec (should succeed):")
p = sandbox.exec("su", "-", "user1", "-c", "ls -la /data/user1")
for line in p.stdout:
    print(line, end="")
for line in p.stderr:
    print(line, end="")
p.wait()
assert p.returncode == 0, "user1 should access own directory"

print("\\n🔴 Restricted user1 exec (should fail):")
p = sandbox.exec("su", "-", "user1", "-c", "ls -la /data/user2")
for line in p.stdout:
    print(line, end="")
for line in p.stderr:
    print(line, end="")
p.wait()
assert p.returncode != 0, "user1 should not access user2's directory"

url = f"https://modal.com/id/{sandbox_id}"
print(
    f"\\n☀️ Sandbox live! See: {url}\\nYou can use modal.Sandbox.from_id('{sandbox_id}') to run additional commands."
)

\`\`\`
`,meta:{title:`Example (restricted_volumes.py)`,description:`This is the source code for 08_advanced.restricted_volumes.`}},{toc:f,rawContent:p,meta:m}=d,h=e(`<!> <p>This is the source code for <strong>08_advanced.restricted_volumes</strong>.</p> <!>`,1);function g(e,f){let p=r(f,[`children`,`$$slots`,`$$events`,`$$legacy`]);u(e,i(()=>p,()=>d,{children:(e,r)=>{var i=h(),u=a(i);c(u,{id:`example-restricted_volumespy`,children:(e,r)=>{s(),n(e,t(`Example (restricted_volumes.py)`))},$$slots:{default:!0}}),l(o(u,4),{code:`import%20modal%0A%0Aapp%20%3D%20modal.App.lookup(name%3D%22example-restricted-volumes%22%2C%20create_if_missing%3DTrue)%0Avolume%20%3D%20modal.Volume.from_name(%0A%20%20%20%20%22example-restricted-volumes-data%22%2C%20create_if_missing%3DTrue%2C%20version%3D2%0A)%0A%0Aimage%20%3D%20(%0A%20%20%20%20modal.Image.debian_slim(python_version%3D%223.12%22)%0A%20%20%20%20.apt_install(%22sudo%22)%0A%20%20%20%20.run_commands(%0A%20%20%20%20%20%20%20%20%22sudo%20adduser%20--disabled-password%20--gecos%20''%20user1%22%2C%0A%20%20%20%20%20%20%20%20%22sudo%20adduser%20--disabled-password%20--gecos%20''%20user2%22%2C%0A%20%20%20%20)%0A)%0A%0Asandbox%20%3D%20modal.Sandbox.create(%0A%20%20%20%20app%3Dapp%2C%20image%3Dimage%2C%20volumes%3D%7B%22%2Fdata%22%3A%20volume%7D%2C%20timeout%3D300%0A)%0Asandbox_id%20%3D%20sandbox.object_id%0Aprint(%22Sandbox%20ID%3A%20%22%2C%20sandbox_id)%0A%0Aprint(%22%E2%8C%9BSetting%20up%20sandbox...%22)%0Asandbox.exec(%22sh%22%2C%20%22-c%22%2C%20%22mkdir%20-p%20%2Fdata%2Fuser1%22).wait()%0Asandbox.exec(%22sh%22%2C%20%22-c%22%2C%20%22mkdir%20-p%20%2Fdata%2Fuser2%22).wait()%0Asandbox.exec(%0A%20%20%20%20%22sh%22%2C%20%22-c%22%2C%20%22chown%20-R%20user1%3Auser1%20%2Fdata%2Fuser1%20%26%26%20chmod%20700%20%2Fdata%2Fuser1%22%0A).wait()%0Asandbox.exec(%0A%20%20%20%20%22sh%22%2C%20%22-c%22%2C%20%22chown%20-R%20user2%3Auser2%20%2Fdata%2Fuser2%20%26%26%20chmod%20700%20%2Fdata%2Fuser2%22%0A).wait()%0Aprint(%22Sandbox%20setup%20complete.%22)%0A%0Aprint(%22%5Cn%F0%9F%9F%A2%20Baseline%20exec%20(unrestricted%2C%20should%20succeed)%3A%22)%0Ap%20%3D%20sandbox.exec(%22sh%22%2C%20%22-c%22%2C%20%22ls%20-la%20%2Fdata%2Fuser1%22)%0Afor%20line%20in%20p.stdout%3A%0A%20%20%20%20print(line%2C%20end%3D%22%22)%0Afor%20line%20in%20p.stderr%3A%0A%20%20%20%20print(line%2C%20end%3D%22%22)%0Ap.wait()%0Aassert%20p.returncode%20%3D%3D%200%2C%20%22Unrestricted%20exec%20should%20succeed%22%0A%0Aprint(%22%5Cn%F0%9F%9F%A2%20Restricted%20user1%20exec%20(should%20succeed)%3A%22)%0Ap%20%3D%20sandbox.exec(%22su%22%2C%20%22-%22%2C%20%22user1%22%2C%20%22-c%22%2C%20%22ls%20-la%20%2Fdata%2Fuser1%22)%0Afor%20line%20in%20p.stdout%3A%0A%20%20%20%20print(line%2C%20end%3D%22%22)%0Afor%20line%20in%20p.stderr%3A%0A%20%20%20%20print(line%2C%20end%3D%22%22)%0Ap.wait()%0Aassert%20p.returncode%20%3D%3D%200%2C%20%22user1%20should%20access%20own%20directory%22%0A%0Aprint(%22%5Cn%F0%9F%94%B4%20Restricted%20user1%20exec%20(should%20fail)%3A%22)%0Ap%20%3D%20sandbox.exec(%22su%22%2C%20%22-%22%2C%20%22user1%22%2C%20%22-c%22%2C%20%22ls%20-la%20%2Fdata%2Fuser2%22)%0Afor%20line%20in%20p.stdout%3A%0A%20%20%20%20print(line%2C%20end%3D%22%22)%0Afor%20line%20in%20p.stderr%3A%0A%20%20%20%20print(line%2C%20end%3D%22%22)%0Ap.wait()%0Aassert%20p.returncode%20!%3D%200%2C%20%22user1%20should%20not%20access%20user2's%20directory%22%0A%0Aurl%20%3D%20f%22https%3A%2F%2Fmodal.com%2Fid%2F%7Bsandbox_id%7D%22%0Aprint(%0A%20%20%20%20f%22%5Cn%E2%98%80%EF%B8%8F%20Sandbox%20live!%20See%3A%20%7Burl%7D%5CnYou%20can%20use%20modal.Sandbox.from_id('%7Bsandbox_id%7D')%20to%20run%20additional%20commands.%22%0A)%0A`,lang:`python`}),n(e,i)},$$slots:{default:!0}}))}export{g as default,d as metadata};
//# sourceMappingURL=DCPIO5eJ2.js.map
