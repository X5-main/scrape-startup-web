(function(){try{var e=typeof window<`u`?window:typeof global<`u`?global:typeof globalThis<`u`?globalThis:typeof self<`u`?self:{};e.SENTRY_RELEASE={id:`f99fcf9f0a844cc9bd13fdc8e5782b84`};var t=new e.Error().stack;t&&(e._sentryDebugIds=e._sentryDebugIds||{},e._sentryDebugIds[t]=`bc4177b3-091e-4458-823f-707b6f6e06d5`,e._sentryDebugIdIdentifier=`sentry-dbid-bc4177b3-091e-4458-823f-707b6f6e06d5`)}catch{}})();import{$t as e,St as t,Tn as n,Tt as r,bt as i,c as a,d as o,en as s,tn as c,wn as l}from"./F_ixKBiO.js";import"./B1sc9Zdx.js";import"./Bb2deiU3.js";import{t as u}from"./DYSGKh1I.js";import{a as d,i as f,o as p}from"./CPby7b1n.js";import{t as m}from"./BILrvr3I.js";import{t as h}from"./B4L_if842.js";import{t as g}from"./DeWGVqas2.js";var _={description:`Interact with Modal Sandboxes and call deployed Modal Functions from JS and Go codebases`,toc:[{depth:1,value:`Modal SDKs for JavaScript and Go`,id:`modal-sdks-for-javascript-and-go`,children:[{depth:2,value:`Installation`,id:`installation`},{depth:2,value:`JavaScript/TypeScript`,id:`javascripttypescript`,children:[{depth:3,value:`Simple JavaScript Example`,id:`simple-javascript-example`}]},{depth:2,value:`Go`,id:`go`,children:[{depth:3,value:`Simple Go Example`,id:`simple-go-example`}]},{depth:2,value:`Support`,id:`support`}]}],rawContent:`# Modal SDKs for JavaScript and Go

<Callout variant="beta" />

Modal also provides SDKs that enable using Modal Functions and Sandboxes from JavaScript/TypeScript and Go projects.

While Python is the primary language for building Modal applications and implementing Modal Functions, these SDKs enable use cases like:

- Using Sandboxes in JS/Go projects, to safely execute arbitrary commands, run untrusted user code, or as a safe environment for AI agents.
- Directly calling Modal Functions without having to define it as a public Web Function and address it via HTTP requests
- Interacting with Modal resources like Volumes, Secrets, Queues, etc. directly from JS/Go.

We're working towards feature parity with the main Modal Python SDK, although defining Modal Functions will likely remain exclusive to Python.

## Installation

For installation instructions, see the READMEs for [JavaScript](https://github.com/modal-labs/modal-client/tree/main/js) and [Go](https://github.com/modal-labs/modal-client/tree/main/go) on GitHub.

## JavaScript/TypeScript

The \`modal\` package is [distributed via npm](https://www.npmjs.org/package/modal). See the [JS API reference documentation](https://modal-labs.github.io/libmodal/) for details.

### Simple JavaScript Example

\`\`\`ts
import { ModalClient } from "modal";

const modal = new ModalClient();

const app = await modal.apps.fromName("libmodal-example", {
  createIfMissing: true,
});

// Create a Sandbox with the specified Image, and mount a Volume
const volume = await modal.volumes.fromName("libmodal-example-volume", {
  createIfMissing: true,
});
const image = modal.images.fromRegistry("alpine:3.21");
const sb = await modal.sandboxes.create(app, image, {
  volumes: { "/mnt/volume": volume },
});
const p = await sb.exec(["cat", "/mnt/volume/message.txt"]);
console.log(\`Message: \${await p.stdout.readText()}\`);
await sb.terminate();

// Call a previously deployed Modal Function
const echo = await modal.functions.fromName("libmodal-example", "echo");
console.log(await echo.remote(["Hello world!"]));
\`\`\`

There are [many more examples available on GitHub](https://github.com/modal-labs/modal-client/blob/main/js/README.md#documentation).

## Go

The \`modal-go\` package is [installed via go get](https://pkg.go.dev/github.com/modal-labs/modal-client/go). See the [Go API reference documentation](https://pkg.go.dev/github.com/modal-labs/modal-client/go#section-documentation) for details.

### Simple Go Example

\`\`\`go
package main

import (
	"context"
	"fmt"
	"io"

	modal "github.com/modal-labs/modal-client/go"
)

func main() {
	// Skipping err handling throughout for brevity
	ctx := context.Background()

	mc, _ := modal.NewClient()

	app, _ := mc.Apps.FromName(ctx, "libmodal-example", &modal.AppFromNameParams{CreateIfMissing: true})

	// Create a Sandbox with the specified Image, and mount a Volume
	volume, _ := mc.Volumes.FromName(ctx, "libmodal-example-volume", &modal.VolumeFromNameParams{CreateIfMissing: true})
	image := mc.Images.FromRegistry("alpine:3.21", nil)
	sb, _ := mc.Sandboxes.Create(ctx, app, image, &modal.SandboxCreateParams{
		Volumes: map[string]*modal.Volume{"/mnt/volume": volume},
	})
	defer sb.Terminate(context.Background(), nil)
	p, _ := sb.Exec(ctx, []string{"cat", "/mnt/volume/message.txt"}, nil)
	stdout, _ := io.ReadAll(p.Stdout)
	fmt.Printf("Message: %s\\n", stdout)

	// Call a previously deployed Modal Function
	echo, _ := mc.Functions.FromName(ctx, "libmodal-example", "echo", nil)
	result, _ := echo.Remote(ctx, []any{"Hello world!"}, nil)
	fmt.Println(result)
}
\`\`\`

There are [many more examples available on GitHub](https://github.com/modal-labs/modal-client/blob/main/go/README.md#documentation).

## Support

The JS and Go Modal SDKs are in active development, and we love to hear your feedback. If you have questions or suggestions, please reach out on the [Modal Community Slack](https://modal.com/slack).
`,meta:{title:`Modal SDKs for JavaScript and Go`,description:`Interact with Modal Sandboxes and call deployed Modal Functions from JS and Go codebases`}},{description:v,toc:y,rawContent:b,meta:x}=_,S=t(`<!> <!> <p>Modal also provides SDKs that enable using Modal Functions and Sandboxes from JavaScript/TypeScript and Go projects.</p> <p>While Python is the primary language for building Modal applications and implementing Modal Functions, these SDKs enable use cases like:</p> <ul><li>Using Sandboxes in JS/Go projects, to safely execute arbitrary commands, run untrusted user code, or as a safe environment for AI agents.</li> <li>Directly calling Modal Functions without having to define it as a public Web Function and address it via HTTP requests</li> <li>Interacting with Modal resources like Volumes, Secrets, Queues, etc. directly from JS/Go.</li></ul> <p>We’re working towards feature parity with the main Modal Python SDK, although defining Modal Functions will likely remain exclusive to Python.</p> <!> <p>For installation instructions, see the READMEs for <!> and <!> on GitHub.</p> <!> <p>The <code>modal</code> package is <!>. See the <!> for details.</p> <!> <!> <p>There are <!>.</p> <!> <p>The <code>modal-go</code> package is <!>. See the <!> for details.</p> <!> <!> <p>There are <!>.</p> <!> <p>The JS and Go Modal SDKs are in active development, and we love to hear your feedback. If you have questions or suggestions, please reach out on the <!>.</p>`,1);function C(t,v){let y=a(v,[`children`,`$$slots`,`$$events`,`$$legacy`]);h(t,o(()=>y,()=>_,{children:(t,a)=>{var o=S(),h=s(o);p(h,{id:`modal-sdks-for-javascript-and-go`,children:(e,t)=>{l(),i(e,r(`Modal SDKs for JavaScript and Go`))},$$slots:{default:!0}});var _=c(h,2);u(_,{variant:`beta`});var v=c(_,10);d(v,{id:`installation`,children:(e,t)=>{l(),i(e,r(`Installation`))},$$slots:{default:!0}});var y=c(v,2),b=c(e(y));g(b,{href:`https://github.com/modal-labs/modal-client/tree/main/js`,rel:`nofollow`,children:(e,t)=>{l(),i(e,r(`JavaScript`))},$$slots:{default:!0}}),g(c(b,2),{href:`https://github.com/modal-labs/modal-client/tree/main/go`,rel:`nofollow`,children:(e,t)=>{l(),i(e,r(`Go`))},$$slots:{default:!0}}),l(),n(y);var x=c(y,2);d(x,{id:`javascripttypescript`,children:(e,t)=>{l(),i(e,r(`JavaScript/TypeScript`))},$$slots:{default:!0}});var C=c(x,2),w=c(e(C),3);g(w,{href:`https://www.npmjs.org/package/modal`,rel:`nofollow`,children:(e,t)=>{l(),i(e,r(`distributed via npm`))},$$slots:{default:!0}}),g(c(w,2),{href:`https://modal-labs.github.io/libmodal/`,rel:`nofollow`,children:(e,t)=>{l(),i(e,r(`JS API reference documentation`))},$$slots:{default:!0}}),l(),n(C);var T=c(C,2);f(T,{id:`simple-javascript-example`,children:(e,t)=>{l(),i(e,r(`Simple JavaScript Example`))},$$slots:{default:!0}});var E=c(T,2);m(E,{code:`import%20%7B%20ModalClient%20%7D%20from%20%22modal%22%3B%0A%0Aconst%20modal%20%3D%20new%20ModalClient()%3B%0A%0Aconst%20app%20%3D%20await%20modal.apps.fromName(%22libmodal-example%22%2C%20%7B%0A%20%20createIfMissing%3A%20true%2C%0A%7D)%3B%0A%0A%2F%2F%20Create%20a%20Sandbox%20with%20the%20specified%20Image%2C%20and%20mount%20a%20Volume%0Aconst%20volume%20%3D%20await%20modal.volumes.fromName(%22libmodal-example-volume%22%2C%20%7B%0A%20%20createIfMissing%3A%20true%2C%0A%7D)%3B%0Aconst%20image%20%3D%20modal.images.fromRegistry(%22alpine%3A3.21%22)%3B%0Aconst%20sb%20%3D%20await%20modal.sandboxes.create(app%2C%20image%2C%20%7B%0A%20%20volumes%3A%20%7B%20%22%2Fmnt%2Fvolume%22%3A%20volume%20%7D%2C%0A%7D)%3B%0Aconst%20p%20%3D%20await%20sb.exec(%5B%22cat%22%2C%20%22%2Fmnt%2Fvolume%2Fmessage.txt%22%5D)%3B%0Aconsole.log(%60Message%3A%20%24%7Bawait%20p.stdout.readText()%7D%60)%3B%0Aawait%20sb.terminate()%3B%0A%0A%2F%2F%20Call%20a%20previously%20deployed%20Modal%20Function%0Aconst%20echo%20%3D%20await%20modal.functions.fromName(%22libmodal-example%22%2C%20%22echo%22)%3B%0Aconsole.log(await%20echo.remote(%5B%22Hello%20world!%22%5D))%3B`,lang:`ts`});var D=c(E,2);g(c(e(D)),{href:`https://github.com/modal-labs/modal-client/blob/main/js/README.md#documentation`,rel:`nofollow`,children:(e,t)=>{l(),i(e,r(`many more examples available on GitHub`))},$$slots:{default:!0}}),l(),n(D);var O=c(D,2);d(O,{id:`go`,children:(e,t)=>{l(),i(e,r(`Go`))},$$slots:{default:!0}});var k=c(O,2),A=c(e(k),3);g(A,{href:`https://pkg.go.dev/github.com/modal-labs/modal-client/go`,rel:`nofollow`,children:(e,t)=>{l(),i(e,r(`installed via go get`))},$$slots:{default:!0}}),g(c(A,2),{href:`https://pkg.go.dev/github.com/modal-labs/modal-client/go#section-documentation`,rel:`nofollow`,children:(e,t)=>{l(),i(e,r(`Go API reference documentation`))},$$slots:{default:!0}}),l(),n(k);var j=c(k,2);f(j,{id:`simple-go-example`,children:(e,t)=>{l(),i(e,r(`Simple Go Example`))},$$slots:{default:!0}});var M=c(j,2);m(M,{code:`package%20main%0A%0Aimport%20(%0A%09%22context%22%0A%09%22fmt%22%0A%09%22io%22%0A%0A%09modal%20%22github.com%2Fmodal-labs%2Fmodal-client%2Fgo%22%0A)%0A%0Afunc%20main()%20%7B%0A%09%2F%2F%20Skipping%20err%20handling%20throughout%20for%20brevity%0A%09ctx%20%3A%3D%20context.Background()%0A%0A%09mc%2C%20_%20%3A%3D%20modal.NewClient()%0A%0A%09app%2C%20_%20%3A%3D%20mc.Apps.FromName(ctx%2C%20%22libmodal-example%22%2C%20%26modal.AppFromNameParams%7BCreateIfMissing%3A%20true%7D)%0A%0A%09%2F%2F%20Create%20a%20Sandbox%20with%20the%20specified%20Image%2C%20and%20mount%20a%20Volume%0A%09volume%2C%20_%20%3A%3D%20mc.Volumes.FromName(ctx%2C%20%22libmodal-example-volume%22%2C%20%26modal.VolumeFromNameParams%7BCreateIfMissing%3A%20true%7D)%0A%09image%20%3A%3D%20mc.Images.FromRegistry(%22alpine%3A3.21%22%2C%20nil)%0A%09sb%2C%20_%20%3A%3D%20mc.Sandboxes.Create(ctx%2C%20app%2C%20image%2C%20%26modal.SandboxCreateParams%7B%0A%09%09Volumes%3A%20map%5Bstring%5D*modal.Volume%7B%22%2Fmnt%2Fvolume%22%3A%20volume%7D%2C%0A%09%7D)%0A%09defer%20sb.Terminate(context.Background()%2C%20nil)%0A%09p%2C%20_%20%3A%3D%20sb.Exec(ctx%2C%20%5B%5Dstring%7B%22cat%22%2C%20%22%2Fmnt%2Fvolume%2Fmessage.txt%22%7D%2C%20nil)%0A%09stdout%2C%20_%20%3A%3D%20io.ReadAll(p.Stdout)%0A%09fmt.Printf(%22Message%3A%20%25s%5Cn%22%2C%20stdout)%0A%0A%09%2F%2F%20Call%20a%20previously%20deployed%20Modal%20Function%0A%09echo%2C%20_%20%3A%3D%20mc.Functions.FromName(ctx%2C%20%22libmodal-example%22%2C%20%22echo%22%2C%20nil)%0A%09result%2C%20_%20%3A%3D%20echo.Remote(ctx%2C%20%5B%5Dany%7B%22Hello%20world!%22%7D%2C%20nil)%0A%09fmt.Println(result)%0A%7D`,lang:`go`});var N=c(M,2);g(c(e(N)),{href:`https://github.com/modal-labs/modal-client/blob/main/go/README.md#documentation`,rel:`nofollow`,children:(e,t)=>{l(),i(e,r(`many more examples available on GitHub`))},$$slots:{default:!0}}),l(),n(N);var P=c(N,2);d(P,{id:`support`,children:(e,t)=>{l(),i(e,r(`Support`))},$$slots:{default:!0}});var F=c(P,2);g(c(e(F)),{href:`https://modal.com/slack`,rel:`nofollow`,children:(e,t)=>{l(),i(e,r(`Modal Community Slack`))},$$slots:{default:!0}}),l(),n(F),i(t,o)},$$slots:{default:!0}}))}export{C as default,_ as metadata};
//# sourceMappingURL=D14evuaT2.js.map
