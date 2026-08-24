(function(){try{var e=typeof window<`u`?window:typeof global<`u`?global:typeof globalThis<`u`?globalThis:typeof self<`u`?self:{};e.SENTRY_RELEASE={id:`f99fcf9f0a844cc9bd13fdc8e5782b84`};var t=new e.Error().stack;t&&(e._sentryDebugIds=e._sentryDebugIds||{},e._sentryDebugIds[t]=`6b9e2cc9-089a-4d48-ba33-c99fb5a5d9a8`,e._sentryDebugIdIdentifier=`sentry-dbid-6b9e2cc9-089a-4d48-ba33-c99fb5a5d9a8`)}catch{}})();import{$t as e,St as t,Tn as n,Tt as r,bt as i,c as a,d as o,en as s,tn as c,wn as l}from"./F_ixKBiO.js";import"./B1sc9Zdx.js";import"./Bb2deiU3.js";import{t as u}from"./BILrvr3I.js";import{t as d}from"./DeWGVqas2.js";import{t as f}from"./CdZDxCfO2.js";var p={title:`ChatTTS: Running an open source text-to-speech model`,description:`Learn how to run ChatTTS text-to-speech on Modal with this step-by-step guide.`,authors:[{name:`Yiren Lu`,avatarUrl:`https://modal-cdn.com/ren-lu.jpg`,jobTitle:`Solutions Engineer`,twitterHandle:`YirenLu`}],date:`2024-09-15T12:00:00.000Z`,length:`5 minute read`,category:`Article`,subcategory:`Audio Models`,published:!0,layout:`blog`,toc:[{depth:2,value:`Prerequisites`,id:`prerequisites`},{depth:2,value:`Setting Up the Environment`,id:`setting-up-the-environment`},{depth:2,value:`Configuring the Image`,id:`configuring-the-image`},{depth:2,value:`Creating the TTS Class`,id:`creating-the-tts-class`},{depth:2,value:`Running the Text-to-Speech Conversion`,id:`running-the-text-to-speech-conversion`},{depth:2,value:`Running the Script`,id:`running-the-script`},{depth:2,value:`Conclusion`,id:`conclusion`}],rawContent:`[ChatTTS](https://github.com/2noise/ChatTTS) is one of the [best open-source text-to-speech libraries](/blog/open-source-tts) available today. It offers high-quality voice synthesis and is particularly useful for developers looking to integrate advanced AI voice capabilities into their applications. In this guide, we'll walk you through the process of running ChatTTS using Modal, a serverless cloud computing platform.

## Prerequisites

Before we begin, make sure you have the following:

1. Create an account at [modal.com](https://modal.com)
2. Install the Modal Python package by running:
   \`\`\`
   pip install modal
   \`\`\`
3. Authenticate your Modal account by running:
   \`\`\`
   modal setup
   \`\`\`
   If this doesn't work, try:
   \`\`\`
   python -m modal setup
   \`\`\`

## Setting Up the Environment

We'll be using a single Python file to run ChatTTS. Let's call it \`chattts_modal.py\`. This file will contain all the necessary code to set up and run the text-to-speech service.

First, let's import the required libraries and set up the Modal app:

\`\`\`python
import io
import modal

app = modal.App(name="tts")
\`\`\`

## Configuring the Image

Next, we'll configure an image with all the necessary dependencies:

\`\`\`python
tts_image = (
    modal.Image.debian_slim()
    .apt_install("git")
    .workdir("/app")
    .pip_install("git+https://github.com/2noise/ChatTTS.git@51ec0c784c2795b257d7a6b64274e7a36186b731")
    .pip_install("soundfile")
    .env({"TTS_HOME": "/tts"})
)

with tts_image.imports():
    import torch
    import torchaudio
    import ChatTTS
\`\`\`

This image is based on Debian Slim and includes Git, the ChatTTS library, and the SoundFile library.

## Creating the TTS Class

Now, let's create a \`TTS\` class that will handle the text-to-speech conversion:

\`\`\`python
@app.cls(
    image=tts_image,
    volumes={"/tts": modal.Volume.from_name("tts-cache", create_if_missing=True)},
    gpu="A10G",
    scaledown_window=300,
    timeout=180,
)
class TTS:
    def __init__(self, voice = "male"):
        voice_seeds = {
            "female": 28,
            "male": 34,
            "male_alt_1": 43,
        }
        print(f"Using voice {voice} with seed {voice_seeds[voice]}")
        self.voice_seed = voice_seeds[voice]

    @modal.enter()
    def load_model(self):
        import ChatTTS

        self.chat = ChatTTS.Chat()
        self.chat.load(compile=False)

        torch.manual_seed(self.voice_seed)
        self.rand_spk = self.chat.sample_random_speaker()

    @modal.method()
    def speak(self, text, temperature=0.18, top_p=0.9, top_k=20):
        text = text.strip()
        if not text:
            return

        params_infer_code = ChatTTS.Chat.InferCodeParams(
            spk_emb = self.rand_spk,
            temperature = temperature,
            top_P = top_p,
            top_K = top_k,
        )

        params_refine_text = ChatTTS.Chat.RefineTextParams(
            prompt='[oral_8][laugh_2][break_2]',
        )

        wavs = self.chat.infer(text, skip_refine_text=True, params_infer_code=params_infer_code, params_refine_text=params_refine_text)

        wav_file = io.BytesIO()
        torchaudio.save(wav_file, torch.from_numpy(wavs[0]).unsqueeze(0), 24000, format="wav", backend="soundfile")

        return wav_file
\`\`\`

This class initializes the ChatTTS model, loads it into memory, and provides a \`speak\` method to convert text to speech.

## Running the Text-to-Speech Conversion

Finally, let's add a local entrypoint to run the text-to-speech conversion:

\`\`\`python
@app.local_entrypoint()
def tts_entrypoint(text: str):
    tts = TTS()
    wav = tts.speak.remote(text)
    with open(f"output.wav", "wb") as f:
        f.write(wav.getvalue())
\`\`\`

This entrypoint creates a TTS instance, calls the \`speak\` method remotely, and saves the resulting audio as a WAV file.

## Running the Script

To run the script, save all the code above in a file named \`chattts_modal.py\`. Then, you can run it using Modal:

\`\`\`
modal run chattts_modal.py --text "Hello, this is a test of ChatTTS running on Modal."
\`\`\`

This command will generate an \`output.wav\` file in your current directory with the synthesized speech.

## Conclusion

You've now learned how to run ChatTTS using Modal. This setup allows you to leverage the power of serverless computing for your text-to-speech needs, making it easy to scale and integrate into various applications.

For the full code and more details, you can check out the complete gist [here](https://gist.github.com/erik-dunteman/24cc2619fb9d1caef3a2633f34c13a1e).
`,meta:{description:`Learn how to run ChatTTS text-to-speech on Modal with this step-by-step guide.`}},{title:m,description:h,authors:g,date:_,length:v,category:y,subcategory:b,published:x,layout:S,toc:C,rawContent:w,meta:T}=p,E=t(`<p><!> is one of the <!> available today. It offers high-quality voice synthesis and is particularly useful for developers looking to integrate advanced AI voice capabilities into their applications. In this guide, we’ll walk you through the process of running ChatTTS using Modal, a serverless cloud computing platform.</p> <h2 id="prerequisites">Prerequisites</h2> <p>Before we begin, make sure you have the following:</p> <ol><li>Create an account at <!></li> <li>Install the Modal Python package by running: <!></li> <li>Authenticate your Modal account by running: <!> If this doesn’t work, try: <!></li></ol> <h2 id="setting-up-the-environment">Setting Up the Environment</h2> <p>We’ll be using a single Python file to run ChatTTS. Let’s call it <code>chattts_modal.py</code>. This file will contain all the necessary code to set up and run the text-to-speech service.</p> <p>First, let’s import the required libraries and set up the Modal app:</p> <!> <h2 id="configuring-the-image">Configuring the Image</h2> <p>Next, we’ll configure an image with all the necessary dependencies:</p> <!> <p>This image is based on Debian Slim and includes Git, the ChatTTS library, and the SoundFile library.</p> <h2 id="creating-the-tts-class">Creating the TTS Class</h2> <p>Now, let’s create a <code>TTS</code> class that will handle the text-to-speech conversion:</p> <!> <p>This class initializes the ChatTTS model, loads it into memory, and provides a <code>speak</code> method to convert text to speech.</p> <h2 id="running-the-text-to-speech-conversion">Running the Text-to-Speech Conversion</h2> <p>Finally, let’s add a local entrypoint to run the text-to-speech conversion:</p> <!> <p>This entrypoint creates a TTS instance, calls the <code>speak</code> method remotely, and saves the resulting audio as a WAV file.</p> <h2 id="running-the-script">Running the Script</h2> <p>To run the script, save all the code above in a file named <code>chattts_modal.py</code>. Then, you can run it using Modal:</p> <!> <p>This command will generate an <code>output.wav</code> file in your current directory with the synthesized speech.</p> <h2 id="conclusion">Conclusion</h2> <p>You’ve now learned how to run ChatTTS using Modal. This setup allows you to leverage the power of serverless computing for your text-to-speech needs, making it easy to scale and integrate into various applications.</p> <p>For the full code and more details, you can check out the complete gist <!>.</p>`,1);function D(t,m){let h=a(m,[`children`,`$$slots`,`$$events`,`$$legacy`]);f(t,o(()=>h,()=>p,{children:(t,a)=>{var o=E(),f=s(o),p=e(f);d(p,{href:`https://github.com/2noise/ChatTTS`,rel:`nofollow`,children:(e,t)=>{l(),i(e,r(`ChatTTS`))},$$slots:{default:!0}}),d(c(p,2),{href:`/blog/open-source-tts`,children:(e,t)=>{l(),i(e,r(`best open-source text-to-speech libraries`))},$$slots:{default:!0}}),l(),n(f);var m=c(f,6),h=e(m);d(c(e(h)),{href:`https://modal.com`,rel:`nofollow`,children:(e,t)=>{l(),i(e,r(`modal.com`))},$$slots:{default:!0}}),n(h);var g=c(h,2);u(c(e(g)),{code:`pip%20install%20modal`,lang:`text`}),n(g);var _=c(g,2),v=c(e(_));u(v,{code:`modal%20setup`,lang:`text`}),u(c(v,2),{code:`python%20-m%20modal%20setup`,lang:`text`}),n(_),n(m);var y=c(m,8);u(y,{code:`import%20io%0Aimport%20modal%0A%0Aapp%20%3D%20modal.App(name%3D%22tts%22)`,lang:`python`});var b=c(y,6);u(b,{code:`tts_image%20%3D%20(%0A%20%20%20%20modal.Image.debian_slim()%0A%20%20%20%20.apt_install(%22git%22)%0A%20%20%20%20.workdir(%22%2Fapp%22)%0A%20%20%20%20.pip_install(%22git%2Bhttps%3A%2F%2Fgithub.com%2F2noise%2FChatTTS.git%4051ec0c784c2795b257d7a6b64274e7a36186b731%22)%0A%20%20%20%20.pip_install(%22soundfile%22)%0A%20%20%20%20.env(%7B%22TTS_HOME%22%3A%20%22%2Ftts%22%7D)%0A)%0A%0Awith%20tts_image.imports()%3A%0A%20%20%20%20import%20torch%0A%20%20%20%20import%20torchaudio%0A%20%20%20%20import%20ChatTTS`,lang:`python`});var x=c(b,8);u(x,{code:`%40app.cls(%0A%20%20%20%20image%3Dtts_image%2C%0A%20%20%20%20volumes%3D%7B%22%2Ftts%22%3A%20modal.Volume.from_name(%22tts-cache%22%2C%20create_if_missing%3DTrue)%7D%2C%0A%20%20%20%20gpu%3D%22A10G%22%2C%0A%20%20%20%20scaledown_window%3D300%2C%0A%20%20%20%20timeout%3D180%2C%0A)%0Aclass%20TTS%3A%0A%20%20%20%20def%20__init__(self%2C%20voice%20%3D%20%22male%22)%3A%0A%20%20%20%20%20%20%20%20voice_seeds%20%3D%20%7B%0A%20%20%20%20%20%20%20%20%20%20%20%20%22female%22%3A%2028%2C%0A%20%20%20%20%20%20%20%20%20%20%20%20%22male%22%3A%2034%2C%0A%20%20%20%20%20%20%20%20%20%20%20%20%22male_alt_1%22%3A%2043%2C%0A%20%20%20%20%20%20%20%20%7D%0A%20%20%20%20%20%20%20%20print(f%22Using%20voice%20%7Bvoice%7D%20with%20seed%20%7Bvoice_seeds%5Bvoice%5D%7D%22)%0A%20%20%20%20%20%20%20%20self.voice_seed%20%3D%20voice_seeds%5Bvoice%5D%0A%0A%20%20%20%20%40modal.enter()%0A%20%20%20%20def%20load_model(self)%3A%0A%20%20%20%20%20%20%20%20import%20ChatTTS%0A%0A%20%20%20%20%20%20%20%20self.chat%20%3D%20ChatTTS.Chat()%0A%20%20%20%20%20%20%20%20self.chat.load(compile%3DFalse)%0A%0A%20%20%20%20%20%20%20%20torch.manual_seed(self.voice_seed)%0A%20%20%20%20%20%20%20%20self.rand_spk%20%3D%20self.chat.sample_random_speaker()%0A%0A%20%20%20%20%40modal.method()%0A%20%20%20%20def%20speak(self%2C%20text%2C%20temperature%3D0.18%2C%20top_p%3D0.9%2C%20top_k%3D20)%3A%0A%20%20%20%20%20%20%20%20text%20%3D%20text.strip()%0A%20%20%20%20%20%20%20%20if%20not%20text%3A%0A%20%20%20%20%20%20%20%20%20%20%20%20return%0A%0A%20%20%20%20%20%20%20%20params_infer_code%20%3D%20ChatTTS.Chat.InferCodeParams(%0A%20%20%20%20%20%20%20%20%20%20%20%20spk_emb%20%3D%20self.rand_spk%2C%0A%20%20%20%20%20%20%20%20%20%20%20%20temperature%20%3D%20temperature%2C%0A%20%20%20%20%20%20%20%20%20%20%20%20top_P%20%3D%20top_p%2C%0A%20%20%20%20%20%20%20%20%20%20%20%20top_K%20%3D%20top_k%2C%0A%20%20%20%20%20%20%20%20)%0A%0A%20%20%20%20%20%20%20%20params_refine_text%20%3D%20ChatTTS.Chat.RefineTextParams(%0A%20%20%20%20%20%20%20%20%20%20%20%20prompt%3D'%5Boral_8%5D%5Blaugh_2%5D%5Bbreak_2%5D'%2C%0A%20%20%20%20%20%20%20%20)%0A%0A%20%20%20%20%20%20%20%20wavs%20%3D%20self.chat.infer(text%2C%20skip_refine_text%3DTrue%2C%20params_infer_code%3Dparams_infer_code%2C%20params_refine_text%3Dparams_refine_text)%0A%0A%20%20%20%20%20%20%20%20wav_file%20%3D%20io.BytesIO()%0A%20%20%20%20%20%20%20%20torchaudio.save(wav_file%2C%20torch.from_numpy(wavs%5B0%5D).unsqueeze(0)%2C%2024000%2C%20format%3D%22wav%22%2C%20backend%3D%22soundfile%22)%0A%0A%20%20%20%20%20%20%20%20return%20wav_file`,lang:`python`});var S=c(x,8);u(S,{code:`%40app.local_entrypoint()%0Adef%20tts_entrypoint(text%3A%20str)%3A%0A%20%20%20%20tts%20%3D%20TTS()%0A%20%20%20%20wav%20%3D%20tts.speak.remote(text)%0A%20%20%20%20with%20open(f%22output.wav%22%2C%20%22wb%22)%20as%20f%3A%0A%20%20%20%20%20%20%20%20f.write(wav.getvalue())`,lang:`python`});var C=c(S,8);u(C,{code:`modal%20run%20chattts_modal.py%20--text%20%22Hello%2C%20this%20is%20a%20test%20of%20ChatTTS%20running%20on%20Modal.%22`,lang:`text`});var w=c(C,8);d(c(e(w)),{href:`https://gist.github.com/erik-dunteman/24cc2619fb9d1caef3a2633f34c13a1e`,rel:`nofollow`,children:(e,t)=>{l(),i(e,r(`here`))},$$slots:{default:!0}}),l(),n(w),i(t,o)},$$slots:{default:!0}}))}export{D as default,p as metadata};
//# sourceMappingURL=C34Re5uD2.js.map
