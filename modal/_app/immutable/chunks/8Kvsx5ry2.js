(function(){try{var e=typeof window<`u`?window:typeof global<`u`?global:typeof globalThis<`u`?globalThis:typeof self<`u`?self:{};e.SENTRY_RELEASE={id:`f99fcf9f0a844cc9bd13fdc8e5782b84`};var t=new e.Error().stack;t&&(e._sentryDebugIds=e._sentryDebugIds||{},e._sentryDebugIds[t]=`ceb489ff-b047-418c-8c38-282dff66ef0b`,e._sentryDebugIdIdentifier=`sentry-dbid-ceb489ff-b047-418c-8c38-282dff66ef0b`)}catch{}})();import{$t as e,St as t,Tn as n,Tt as r,bt as i,c as a,d as o,en as s,tn as c,wn as l}from"./F_ixKBiO.js";import"./B1sc9Zdx.js";import"./Bb2deiU3.js";import{t as u}from"./BILrvr3I.js";import{t as d}from"./DeWGVqas2.js";import{t as f}from"./CdZDxCfO2.js";var p={title:`How to run XTTS`,description:`Learn how to run XTTS text-to-speech with this step-by-step guide.`,authors:[{name:`Yiren Lu`,avatarUrl:`https://modal-cdn.com/ren-lu.jpg`,jobTitle:`Solutions Engineer`,twitterHandle:`YirenLu`}],date:`2024-09-15T12:00:00.000Z`,length:`5 minute read`,category:`Article`,subcategory:`Audio Models`,published:!0,layout:`blog`,toc:[{depth:1,value:`How to Run XTTS: A Step-by-Step Guide`,id:`how-to-run-xtts-a-step-by-step-guide`,children:[{depth:2,value:`Prerequisites`,id:`prerequisites`},{depth:2,value:`Setting Up the XTTS Environment`,id:`setting-up-the-xtts-environment`},{depth:2,value:`Implementing the XTTS Class`,id:`implementing-the-xtts-class`},{depth:2,value:`Running XTTS`,id:`running-xtts`},{depth:2,value:`How to Use the XTTS Script`,id:`how-to-use-the-xtts-script`},{depth:2,value:`Conclusion`,id:`conclusion`}]}],rawContent:`# How to Run XTTS: A Step-by-Step Guide

[XTTS](https://huggingface.co/coqui/XTTS-v2) is one of the [best open-source text-to-speech](/blog/open-source-tts) models available today. It offers high-quality, multilingual speech synthesis capabilities. In this guide, we'll walk you through the process of running XTTS using Modal, a serverless cloud computing platform.

## Prerequisites

Before we begin, make sure you have the following:

1. Create an account at [modal.com](https://modal.com)
2. Install the Modal Python package:
   \`\`\`
   pip install modal
   \`\`\`
3. Authenticate your Modal account:
   \`\`\`
   modal setup
   \`\`\`
   (If this doesn't work, try \`python -m modal setup\`)

## Setting Up the XTTS Environment

We'll be using a single Python file to set up and run XTTS. Let's break down the code and explain each part:

First, we import the necessary libraries and set up the Modal app:

\`\`\`python
import io
import modal

app = modal.App(name="xtts")
\`\`\`

Next, we define the image that will be used to run our XTTS model:

\`\`\`python
tts_image = (
    modal.Image.debian_slim(python_version="3.11.9")
    .apt_install("git")
    .run_commands("pip install git+https://github.com/coqui-ai/TTS@8c20a599d8d4eac32db2f7b8cd9f9b3d1190b73a")
    .env({"COQUI_TOS_AGREED": "1", "TTS_HOME": "/tts"})
)
\`\`\`

This image is based on Debian Slim, installs Git, and sets up the TTS package from the Coqui repository. Note that we're agreeing to Coqui's terms of service by setting the \`COQUI_TOS_AGREED\` environment variable.

## Implementing the XTTS Class

Now, let's create the \`XTTS\` class that will handle the text-to-speech conversion:

\`\`\`python
with tts_image.imports():
    from TTS.api import TTS
    import torch

@app.cls(
    image=tts_image,
    volumes={"/tts": modal.Volume.from_name("tts-cache", create_if_missing=True)},
    gpu="A10G",
    scaledown_window=300,
    timeout=180,
)
class XTTS:
    def __init__(self):
        pass

    @modal.enter()
    def load_model(self):
        self.device = "cuda" if torch.cuda.is_available() else "cpu"
        self.model = TTS("tts_models/multilingual/multi-dataset/xtts_v2").to(self.device)
        print("Model Loaded")
        speakers = self.model.synthesizer.tts_model.speaker_manager.speakers.keys()
        print(f"Supported speakers: {speakers}")

    @modal.method()
    def speak(self, text, speaker="Kazuhiko Atallah", language="en"):
        wav_file = io.BytesIO()
        self.model.tts_to_file(
                text=text,
                file_path=wav_file,
                speaker=speaker,
                language=language,
        )
        return wav_file
\`\`\`

This class does the following:

1. Loads the XTTS-v2 model when the container starts.
2. Provides a \`speak\` method that converts text to speech.

## Running XTTS

Finally, we define an entrypoint to run our XTTS model:

\`\`\`python
@app.local_entrypoint()
def tts_entrypoint(text: str):
    tts = XTTS()
    wav = tts.speak.remote(text)
    with open(f"output.wav", "wb") as f:
        f.write(wav.getvalue())
\`\`\`

This entrypoint function takes a text input, runs the XTTS model, and saves the output as a WAV file.

## How to Use the XTTS Script

To use this script:

1. Save the entire code into a file, for example, \`xtts_modal.py\`.
2. Run the script using Modal:
   \`\`\`
   modal run xtts_modal.py --text "Your text to be converted to speech"
   \`\`\`

This will generate an \`output.wav\` file in your current directory containing the synthesized speech.

## Conclusion

By following this guide, you've learned how to run XTTS using Modal. This setup allows you to leverage powerful GPU resources in the cloud for high-quality text-to-speech conversion. You can easily modify the script to support different languages or speakers.

For the full code and more details, you can check out the complete gist [here](https://gist.github.com/erik-dunteman/a560198d1c57766bb536fb0e41b134ce).
`,meta:{title:`How to Run XTTS: A Step-by-Step Guide`,description:`Learn how to run XTTS text-to-speech with this step-by-step guide.`}},{title:m,description:h,authors:g,date:_,length:v,category:y,subcategory:b,published:x,layout:S,toc:C,rawContent:w,meta:T}=p,E=t(`<h1 id="how-to-run-xtts-a-step-by-step-guide">How to Run XTTS: A Step-by-Step Guide</h1> <p><!> is one of the <!> models available today. It offers high-quality, multilingual speech synthesis capabilities. In this guide, we’ll walk you through the process of running XTTS using Modal, a serverless cloud computing platform.</p> <h2 id="prerequisites">Prerequisites</h2> <p>Before we begin, make sure you have the following:</p> <ol><li>Create an account at <!></li> <li>Install the Modal Python package: <!></li> <li>Authenticate your Modal account: <!> (If this doesn’t work, try <code>python -m modal setup</code>)</li></ol> <h2 id="setting-up-the-xtts-environment">Setting Up the XTTS Environment</h2> <p>We’ll be using a single Python file to set up and run XTTS. Let’s break down the code and explain each part:</p> <p>First, we import the necessary libraries and set up the Modal app:</p> <!> <p>Next, we define the image that will be used to run our XTTS model:</p> <!> <p>This image is based on Debian Slim, installs Git, and sets up the TTS package from the Coqui repository. Note that we’re agreeing to Coqui’s terms of service by setting the <code>COQUI_TOS_AGREED</code> environment variable.</p> <h2 id="implementing-the-xtts-class">Implementing the XTTS Class</h2> <p>Now, let’s create the <code>XTTS</code> class that will handle the text-to-speech conversion:</p> <!> <p>This class does the following:</p> <ol><li>Loads the XTTS-v2 model when the container starts.</li> <li>Provides a <code>speak</code> method that converts text to speech.</li></ol> <h2 id="running-xtts">Running XTTS</h2> <p>Finally, we define an entrypoint to run our XTTS model:</p> <!> <p>This entrypoint function takes a text input, runs the XTTS model, and saves the output as a WAV file.</p> <h2 id="how-to-use-the-xtts-script">How to Use the XTTS Script</h2> <p>To use this script:</p> <ol><li>Save the entire code into a file, for example, <code>xtts_modal.py</code>.</li> <li>Run the script using Modal: <!></li></ol> <p>This will generate an <code>output.wav</code> file in your current directory containing the synthesized speech.</p> <h2 id="conclusion">Conclusion</h2> <p>By following this guide, you’ve learned how to run XTTS using Modal. This setup allows you to leverage powerful GPU resources in the cloud for high-quality text-to-speech conversion. You can easily modify the script to support different languages or speakers.</p> <p>For the full code and more details, you can check out the complete gist <!>.</p>`,1);function D(t,m){let h=a(m,[`children`,`$$slots`,`$$events`,`$$legacy`]);f(t,o(()=>h,()=>p,{children:(t,a)=>{var o=E(),f=c(s(o),2),p=e(f);d(p,{href:`https://huggingface.co/coqui/XTTS-v2`,rel:`nofollow`,children:(e,t)=>{l(),i(e,r(`XTTS`))},$$slots:{default:!0}}),d(c(p,2),{href:`/blog/open-source-tts`,children:(e,t)=>{l(),i(e,r(`best open-source text-to-speech`))},$$slots:{default:!0}}),l(),n(f);var m=c(f,6),h=e(m);d(c(e(h)),{href:`https://modal.com`,rel:`nofollow`,children:(e,t)=>{l(),i(e,r(`modal.com`))},$$slots:{default:!0}}),n(h);var g=c(h,2);u(c(e(g)),{code:`pip%20install%20modal`,lang:`text`}),n(g);var _=c(g,2);u(c(e(_)),{code:`modal%20setup`,lang:`text`}),l(3),n(_),n(m);var v=c(m,8);u(v,{code:`import%20io%0Aimport%20modal%0A%0Aapp%20%3D%20modal.App(name%3D%22xtts%22)`,lang:`python`});var y=c(v,4);u(y,{code:`tts_image%20%3D%20(%0A%20%20%20%20modal.Image.debian_slim(python_version%3D%223.11.9%22)%0A%20%20%20%20.apt_install(%22git%22)%0A%20%20%20%20.run_commands(%22pip%20install%20git%2Bhttps%3A%2F%2Fgithub.com%2Fcoqui-ai%2FTTS%408c20a599d8d4eac32db2f7b8cd9f9b3d1190b73a%22)%0A%20%20%20%20.env(%7B%22COQUI_TOS_AGREED%22%3A%20%221%22%2C%20%22TTS_HOME%22%3A%20%22%2Ftts%22%7D)%0A)`,lang:`python`});var b=c(y,8);u(b,{code:`with%20tts_image.imports()%3A%0A%20%20%20%20from%20TTS.api%20import%20TTS%0A%20%20%20%20import%20torch%0A%0A%40app.cls(%0A%20%20%20%20image%3Dtts_image%2C%0A%20%20%20%20volumes%3D%7B%22%2Ftts%22%3A%20modal.Volume.from_name(%22tts-cache%22%2C%20create_if_missing%3DTrue)%7D%2C%0A%20%20%20%20gpu%3D%22A10G%22%2C%0A%20%20%20%20scaledown_window%3D300%2C%0A%20%20%20%20timeout%3D180%2C%0A)%0Aclass%20XTTS%3A%0A%20%20%20%20def%20__init__(self)%3A%0A%20%20%20%20%20%20%20%20pass%0A%0A%20%20%20%20%40modal.enter()%0A%20%20%20%20def%20load_model(self)%3A%0A%20%20%20%20%20%20%20%20self.device%20%3D%20%22cuda%22%20if%20torch.cuda.is_available()%20else%20%22cpu%22%0A%20%20%20%20%20%20%20%20self.model%20%3D%20TTS(%22tts_models%2Fmultilingual%2Fmulti-dataset%2Fxtts_v2%22).to(self.device)%0A%20%20%20%20%20%20%20%20print(%22Model%20Loaded%22)%0A%20%20%20%20%20%20%20%20speakers%20%3D%20self.model.synthesizer.tts_model.speaker_manager.speakers.keys()%0A%20%20%20%20%20%20%20%20print(f%22Supported%20speakers%3A%20%7Bspeakers%7D%22)%0A%0A%20%20%20%20%40modal.method()%0A%20%20%20%20def%20speak(self%2C%20text%2C%20speaker%3D%22Kazuhiko%20Atallah%22%2C%20language%3D%22en%22)%3A%0A%20%20%20%20%20%20%20%20wav_file%20%3D%20io.BytesIO()%0A%20%20%20%20%20%20%20%20self.model.tts_to_file(%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20text%3Dtext%2C%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20file_path%3Dwav_file%2C%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20speaker%3Dspeaker%2C%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20language%3Dlanguage%2C%0A%20%20%20%20%20%20%20%20)%0A%20%20%20%20%20%20%20%20return%20wav_file`,lang:`python`});var x=c(b,10);u(x,{code:`%40app.local_entrypoint()%0Adef%20tts_entrypoint(text%3A%20str)%3A%0A%20%20%20%20tts%20%3D%20XTTS()%0A%20%20%20%20wav%20%3D%20tts.speak.remote(text)%0A%20%20%20%20with%20open(f%22output.wav%22%2C%20%22wb%22)%20as%20f%3A%0A%20%20%20%20%20%20%20%20f.write(wav.getvalue())`,lang:`python`});var S=c(x,8),C=c(e(S),2);u(c(e(C)),{code:`modal%20run%20xtts_modal.py%20--text%20%22Your%20text%20to%20be%20converted%20to%20speech%22`,lang:`text`}),n(C),n(S);var w=c(S,8);d(c(e(w)),{href:`https://gist.github.com/erik-dunteman/a560198d1c57766bb536fb0e41b134ce`,rel:`nofollow`,children:(e,t)=>{l(),i(e,r(`here`))},$$slots:{default:!0}}),l(),n(w),i(t,o)},$$slots:{default:!0}}))}export{D as default,p as metadata};
//# sourceMappingURL=8Kvsx5ry2.js.map
