(function(){try{var e=typeof window<`u`?window:typeof global<`u`?global:typeof globalThis<`u`?globalThis:typeof self<`u`?self:{};e.SENTRY_RELEASE={id:`f99fcf9f0a844cc9bd13fdc8e5782b84`};var t=new e.Error().stack;t&&(e._sentryDebugIds=e._sentryDebugIds||{},e._sentryDebugIds[t]=`57df4f82-3169-4141-b6c9-ac2562691100`,e._sentryDebugIdIdentifier=`sentry-dbid-57df4f82-3169-4141-b6c9-ac2562691100`)}catch{}})();import{$t as e,St as t,Tn as n,Tt as r,bt as i,c as a,d as o,en as s,tn as c,wn as l}from"./F_ixKBiO.js";import"./B1sc9Zdx.js";import"./Bb2deiU3.js";import{a as u,o as d}from"./CPby7b1n.js";import{t as f}from"./BILrvr3I.js";import{t as p}from"./B4L_if842.js";import{t as m}from"./DeWGVqas2.js";var h={toc:[{depth:1,value:`Create a Chatterbox TTS API on Modal`,id:`create-a-chatterbox-tts-api-on-modal`,children:[{depth:2,value:`Setup`,id:`setup`},{depth:2,value:`Define a container image`,id:`define-a-container-image`},{depth:2,value:`The TTS model class`,id:`the-tts-model-class`}]}],rawContent:`# Create a Chatterbox TTS API on Modal

This example demonstrates how to deploy a text-to-speech (TTS) API using the open source model Chatterbox Turbo on Modal.

Chatterbox Turbo is a state-of-the-art TTS model that can generate natural, expressive speech that rivals proprietary models.
Prompts can include paralinguistic tags like \`[chuckle]\`, \`[sigh]\`, and \`[gasp]\`. Chatterbox also support voice cloning by passing
a short (about 10 seconds) audio prompt of the target voice.

Check out [Resemble AI's website](https://www.resemble.ai/) or
the [Chatterbox Github](https://github.com/resemble-ai/chatterbox) repo for more details.

## Setup

Import \`modal\`, the only required local dependency.

\`\`\`python
import modal

\`\`\`

## Define a container image

We start with Modal's baseline \`debian_slim\` image and install the required packages.
- \`chatterbox-tts\`: The TTS model library
- \`fastapi\`: Web framework for creating the API endpoint
- "peft": Required for properly loading the model

\`\`\`python
image = modal.Image.debian_slim(python_version="3.10").uv_pip_install(
    "chatterbox-tts==0.1.6",
    "fastapi[standard]==0.124.4",
    "peft==0.18.0",
)

\`\`\`

We'll also use Chatterbox's provided set of voice prompts which you can download [here](https://modal-cdn.com/blog/audio/chatterbox-tts-voices.zip).
Unzip the file and upload it to a \`modal.Volume\` called \`chatterbox-tts-voices\` with the following CLI commands:
\`\`\`shell
modal volume create chatterbox-tts-voices
modal volume put chatterbox-tts-voices <PATH-TO-UNZIPPED-VOICE-PROMPTS-DIRECTORY>
\`\`\`
Now we can instantiate the volume and use it with our app.

\`\`\`python
chatterbox_tts_voices_vol = modal.Volume.from_name("chatterbox-tts-voices")
VOICE_PROMPTS_DIR = "/chatterbox-tts/prompts"

app = modal.App("example-chatterbox-tts", image=image)

\`\`\`

Import the required libraries within the image context to ensure they're available
when the container runs. This includes audio processing modules and the Chatterbox TTS module itself.

\`\`\`python
with image.imports():
    import io

    import torchaudio as ta
    from chatterbox.tts_turbo import ChatterboxTurboTTS
    from fastapi.responses import StreamingResponse

\`\`\`

## The TTS model class

The TTS service is implemented using Modal's class syntax with GPU acceleration.
We configure the class to use an A10G GPU with additional parameters:

- \`scaledown_window=60 * 5\`: Keep containers alive for 5 minutes after last request
- \`@modal.concurrent(max_inputs=10)\`: Allow up to 10 concurrent requests per container

We'll also need to provide a Hugging Face token using a \`modal.Secret\` to access the model weights,
and attach the \`chatterbox-tts-voices\` volume to the container.

\`\`\`python
@app.cls(
    gpu="a10g",
    scaledown_window=60 * 5,
    secrets=[modal.Secret.from_name("hf-token")],
    volumes={VOICE_PROMPTS_DIR: chatterbox_tts_voices_vol},
)
@modal.concurrent(max_inputs=10)
class Chatterbox:
    @modal.enter()
    def load(self):
        self.model = ChatterboxTurboTTS.from_pretrained(device="cuda")

    @modal.fastapi_endpoint(docs=True, method="POST")
    def api_endpoint(self, prompt: str):
        # Get the audio bytes from the generate method
        audio_bytes = self.generate.local(prompt)

        # Return the audio as a streaming response with appropriate MIME type.
        # This allows for browsers to playback audio directly.
        return StreamingResponse(
            io.BytesIO(audio_bytes),
            media_type="audio/wav",
        )

    @modal.method()
    def generate(self, prompt: str) -> bytes:
        # Generate audio waveform from the input text
        wav = self.model.generate(
            prompt,
            audio_prompt_path=VOICE_PROMPTS_DIR
            + "/chatterbox-tts-voices"
            + "/prompts"
            + "/Lucy.wav",
        )

        # Convert the waveform to bytes
        buffer = io.BytesIO()
        ta.save(buffer, wav, self.model.sr, format="wav")
        buffer.seek(0)
        return buffer.read()


@app.local_entrypoint()
def test(
    prompt: str = "Chatterbox running on Modal [chuckle].",
    output_path: str = "/tmp/chatterbox-tts/output.wav",
):
    chatterbox = Chatterbox()
    audio_bytes = chatterbox.generate.remote(prompt=prompt)

    # Save the audio bytes to a file
    import pathlib

    output_path = pathlib.Path(output_path)
    output_path.parent.mkdir(parents=True, exist_ok=True)
    output_path.write_bytes(audio_bytes)
    print(f"Audio saved to {output_path}")


\`\`\`

Now deploy the Chatterbox API from this file's directory:

\`\`\`shell
modal deploy -m 06_gpu_and_ml.text-to-audio.chatterbox_tts
\`\`\`

And query the endpoint with:

\`\`\`shell
mkdir -p /tmp/chatterbox-tts  # create tmp directory

curl -X POST --get "<YOUR-ENDPOINT-URL>" \\
  --data-urlencode "prompt=Chatterbox running on Modal [chuckle]." \\
  --output /tmp/chatterbox-tts/output.wav
\`\`\`

You'll receive a WAV file named \`/tmp/chatterbox-tts/output.wav\` containing the generated audio.
`,meta:{title:`Create a Chatterbox TTS API on Modal`,description:`This example demonstrates how to deploy a text-to-speech (TTS) API using the open source model Chatterbox Turbo on Modal.`}},{toc:g,rawContent:_,meta:v}=h,y=t(`<!> <p>This example demonstrates how to deploy a text-to-speech (TTS) API using the open source model Chatterbox Turbo on Modal.</p> <p>Chatterbox Turbo is a state-of-the-art TTS model that can generate natural, expressive speech that rivals proprietary models.
Prompts can include paralinguistic tags like <code>[chuckle]</code>, <code>[sigh]</code>, and <code>[gasp]</code>. Chatterbox also support voice cloning by passing
a short (about 10 seconds) audio prompt of the target voice.</p> <p>Check out <!> or
the <!> repo for more details.</p> <!> <p>Import <code>modal</code>, the only required local dependency.</p> <!> <!> <p>We start with Modal’s baseline <code>debian_slim</code> image and install the required packages.</p> <ul><li><code>chatterbox-tts</code>: The TTS model library</li> <li><code>fastapi</code>: Web framework for creating the API endpoint</li> <li>“peft”: Required for properly loading the model</li></ul> <!> <p>We’ll also use Chatterbox’s provided set of voice prompts which you can download <!>.
Unzip the file and upload it to a <code>modal.Volume</code> called <code>chatterbox-tts-voices</code> with the following CLI commands:</p> <!> <p>Now we can instantiate the volume and use it with our app.</p> <!> <p>Import the required libraries within the image context to ensure they’re available
when the container runs. This includes audio processing modules and the Chatterbox TTS module itself.</p> <!> <!> <p>The TTS service is implemented using Modal’s class syntax with GPU acceleration.
We configure the class to use an A10G GPU with additional parameters:</p> <ul><li><code>scaledown_window=60 * 5</code>: Keep containers alive for 5 minutes after last request</li> <li><code>@modal.concurrent(max_inputs=10)</code>: Allow up to 10 concurrent requests per container</li></ul> <p>We’ll also need to provide a Hugging Face token using a <code>modal.Secret</code> to access the model weights,
and attach the <code>chatterbox-tts-voices</code> volume to the container.</p> <!> <p>Now deploy the Chatterbox API from this file’s directory:</p> <!> <p>And query the endpoint with:</p> <!> <p>You’ll receive a WAV file named <code>/tmp/chatterbox-tts/output.wav</code> containing the generated audio.</p>`,1);function b(t,g){let _=a(g,[`children`,`$$slots`,`$$events`,`$$legacy`]);p(t,o(()=>_,()=>h,{children:(t,a)=>{var o=y(),p=s(o);d(p,{id:`create-a-chatterbox-tts-api-on-modal`,children:(e,t)=>{l(),i(e,r(`Create a Chatterbox TTS API on Modal`))},$$slots:{default:!0}});var h=c(p,6),g=c(e(h));m(g,{href:`https://www.resemble.ai/`,rel:`nofollow`,children:(e,t)=>{l(),i(e,r(`Resemble AI’s website`))},$$slots:{default:!0}}),m(c(g,2),{href:`https://github.com/resemble-ai/chatterbox`,rel:`nofollow`,children:(e,t)=>{l(),i(e,r(`Chatterbox Github`))},$$slots:{default:!0}}),l(),n(h);var _=c(h,2);u(_,{id:`setup`,children:(e,t)=>{l(),i(e,r(`Setup`))},$$slots:{default:!0}});var v=c(_,4);f(v,{code:`import%20modal%0A`,lang:`python`});var b=c(v,2);u(b,{id:`define-a-container-image`,children:(e,t)=>{l(),i(e,r(`Define a container image`))},$$slots:{default:!0}});var x=c(b,6);f(x,{code:`image%20%3D%20modal.Image.debian_slim(python_version%3D%223.10%22).uv_pip_install(%0A%20%20%20%20%22chatterbox-tts%3D%3D0.1.6%22%2C%0A%20%20%20%20%22fastapi%5Bstandard%5D%3D%3D0.124.4%22%2C%0A%20%20%20%20%22peft%3D%3D0.18.0%22%2C%0A)%0A`,lang:`python`});var S=c(x,2);m(c(e(S)),{href:`https://modal-cdn.com/blog/audio/chatterbox-tts-voices.zip`,rel:`nofollow`,children:(e,t)=>{l(),i(e,r(`here`))},$$slots:{default:!0}}),l(5),n(S);var C=c(S,2);f(C,{code:`modal%20volume%20create%20chatterbox-tts-voices%0Amodal%20volume%20put%20chatterbox-tts-voices%20%3CPATH-TO-UNZIPPED-VOICE-PROMPTS-DIRECTORY%3E`,lang:`shell`});var w=c(C,4);f(w,{code:`chatterbox_tts_voices_vol%20%3D%20modal.Volume.from_name(%22chatterbox-tts-voices%22)%0AVOICE_PROMPTS_DIR%20%3D%20%22%2Fchatterbox-tts%2Fprompts%22%0A%0Aapp%20%3D%20modal.App(%22example-chatterbox-tts%22%2C%20image%3Dimage)%0A`,lang:`python`});var T=c(w,4);f(T,{code:`with%20image.imports()%3A%0A%20%20%20%20import%20io%0A%0A%20%20%20%20import%20torchaudio%20as%20ta%0A%20%20%20%20from%20chatterbox.tts_turbo%20import%20ChatterboxTurboTTS%0A%20%20%20%20from%20fastapi.responses%20import%20StreamingResponse%0A`,lang:`python`});var E=c(T,2);u(E,{id:`the-tts-model-class`,children:(e,t)=>{l(),i(e,r(`The TTS model class`))},$$slots:{default:!0}});var D=c(E,8);f(D,{code:`%40app.cls(%0A%20%20%20%20gpu%3D%22a10g%22%2C%0A%20%20%20%20scaledown_window%3D60%20*%205%2C%0A%20%20%20%20secrets%3D%5Bmodal.Secret.from_name(%22hf-token%22)%5D%2C%0A%20%20%20%20volumes%3D%7BVOICE_PROMPTS_DIR%3A%20chatterbox_tts_voices_vol%7D%2C%0A)%0A%40modal.concurrent(max_inputs%3D10)%0Aclass%20Chatterbox%3A%0A%20%20%20%20%40modal.enter()%0A%20%20%20%20def%20load(self)%3A%0A%20%20%20%20%20%20%20%20self.model%20%3D%20ChatterboxTurboTTS.from_pretrained(device%3D%22cuda%22)%0A%0A%20%20%20%20%40modal.fastapi_endpoint(docs%3DTrue%2C%20method%3D%22POST%22)%0A%20%20%20%20def%20api_endpoint(self%2C%20prompt%3A%20str)%3A%0A%20%20%20%20%20%20%20%20%23%20Get%20the%20audio%20bytes%20from%20the%20generate%20method%0A%20%20%20%20%20%20%20%20audio_bytes%20%3D%20self.generate.local(prompt)%0A%0A%20%20%20%20%20%20%20%20%23%20Return%20the%20audio%20as%20a%20streaming%20response%20with%20appropriate%20MIME%20type.%0A%20%20%20%20%20%20%20%20%23%20This%20allows%20for%20browsers%20to%20playback%20audio%20directly.%0A%20%20%20%20%20%20%20%20return%20StreamingResponse(%0A%20%20%20%20%20%20%20%20%20%20%20%20io.BytesIO(audio_bytes)%2C%0A%20%20%20%20%20%20%20%20%20%20%20%20media_type%3D%22audio%2Fwav%22%2C%0A%20%20%20%20%20%20%20%20)%0A%0A%20%20%20%20%40modal.method()%0A%20%20%20%20def%20generate(self%2C%20prompt%3A%20str)%20-%3E%20bytes%3A%0A%20%20%20%20%20%20%20%20%23%20Generate%20audio%20waveform%20from%20the%20input%20text%0A%20%20%20%20%20%20%20%20wav%20%3D%20self.model.generate(%0A%20%20%20%20%20%20%20%20%20%20%20%20prompt%2C%0A%20%20%20%20%20%20%20%20%20%20%20%20audio_prompt_path%3DVOICE_PROMPTS_DIR%0A%20%20%20%20%20%20%20%20%20%20%20%20%2B%20%22%2Fchatterbox-tts-voices%22%0A%20%20%20%20%20%20%20%20%20%20%20%20%2B%20%22%2Fprompts%22%0A%20%20%20%20%20%20%20%20%20%20%20%20%2B%20%22%2FLucy.wav%22%2C%0A%20%20%20%20%20%20%20%20)%0A%0A%20%20%20%20%20%20%20%20%23%20Convert%20the%20waveform%20to%20bytes%0A%20%20%20%20%20%20%20%20buffer%20%3D%20io.BytesIO()%0A%20%20%20%20%20%20%20%20ta.save(buffer%2C%20wav%2C%20self.model.sr%2C%20format%3D%22wav%22)%0A%20%20%20%20%20%20%20%20buffer.seek(0)%0A%20%20%20%20%20%20%20%20return%20buffer.read()%0A%0A%0A%40app.local_entrypoint()%0Adef%20test(%0A%20%20%20%20prompt%3A%20str%20%3D%20%22Chatterbox%20running%20on%20Modal%20%5Bchuckle%5D.%22%2C%0A%20%20%20%20output_path%3A%20str%20%3D%20%22%2Ftmp%2Fchatterbox-tts%2Foutput.wav%22%2C%0A)%3A%0A%20%20%20%20chatterbox%20%3D%20Chatterbox()%0A%20%20%20%20audio_bytes%20%3D%20chatterbox.generate.remote(prompt%3Dprompt)%0A%0A%20%20%20%20%23%20Save%20the%20audio%20bytes%20to%20a%20file%0A%20%20%20%20import%20pathlib%0A%0A%20%20%20%20output_path%20%3D%20pathlib.Path(output_path)%0A%20%20%20%20output_path.parent.mkdir(parents%3DTrue%2C%20exist_ok%3DTrue)%0A%20%20%20%20output_path.write_bytes(audio_bytes)%0A%20%20%20%20print(f%22Audio%20saved%20to%20%7Boutput_path%7D%22)%0A%0A`,lang:`python`});var O=c(D,4);f(O,{code:`modal%20deploy%20-m%2006_gpu_and_ml.text-to-audio.chatterbox_tts`,lang:`shell`}),f(c(O,4),{code:`mkdir%20-p%20%2Ftmp%2Fchatterbox-tts%20%20%23%20create%20tmp%20directory%0A%0Acurl%20-X%20POST%20--get%20%22%3CYOUR-ENDPOINT-URL%3E%22%20%5C%0A%20%20--data-urlencode%20%22prompt%3DChatterbox%20running%20on%20Modal%20%5Bchuckle%5D.%22%20%5C%0A%20%20--output%20%2Ftmp%2Fchatterbox-tts%2Foutput.wav`,lang:`shell`}),l(2),i(t,o)},$$slots:{default:!0}}))}export{b as default,h as metadata};
//# sourceMappingURL=B4b3mf6L.js.map
