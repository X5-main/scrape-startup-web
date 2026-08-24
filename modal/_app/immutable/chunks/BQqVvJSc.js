(function(){try{var e=typeof window<`u`?window:typeof global<`u`?global:typeof globalThis<`u`?globalThis:typeof self<`u`?self:{};e.SENTRY_RELEASE={id:`f99fcf9f0a844cc9bd13fdc8e5782b84`};var t=new e.Error().stack;t&&(e._sentryDebugIds=e._sentryDebugIds||{},e._sentryDebugIds[t]=`70ed5d3b-b5f4-44b8-a3fb-9c96059ca80f`,e._sentryDebugIdIdentifier=`sentry-dbid-70ed5d3b-b5f4-44b8-a3fb-9c96059ca80f`)}catch{}})();import{St as e,Tt as t,bt as n,c as r,d as i,en as a,tn as o,wn as s}from"./F_ixKBiO.js";import"./B1sc9Zdx.js";import"./Bb2deiU3.js";import{o as c}from"./CPby7b1n.js";import{t as l}from"./BILrvr3I.js";import{t as u}from"./B4L_if842.js";var d={toc:[{depth:1,value:`Run OpenCV face detection on an image`,id:`run-opencv-face-detection-on-an-image`}],rawContent:`# Run OpenCV face detection on an image

This example shows how you can use OpenCV on Modal to detect faces in an image. We use
the \`opencv-python\` package to load the image and the \`opencv\` library to
detect faces. The function \`count_faces\` takes an image as input and returns
the number of faces detected in the image.

The code below also shows how you can create wrap this function
in a simple FastAPI server to create a web interface.

\`\`\`python
import os

import modal

app = modal.App("example-count-faces")


open_cv_image = (
    modal.Image.debian_slim(python_version="3.11")
    .apt_install("python3-opencv")
    .uv_pip_install(
        "fastapi[standard]==0.115.4",
        "opencv-python~=4.10.0",
        "numpy<2",
    )
)


@app.function(image=open_cv_image)
def count_faces(image_bytes: bytes) -> int:
    import cv2
    import numpy as np

    # Example borrowed from https://towardsdatascience.com/face-detection-in-2-minutes-using-opencv-python-90f89d7c0f81
    # Load the cascade
    face_cascade = cv2.CascadeClassifier(
        os.path.join(cv2.data.haarcascades, "haarcascade_frontalface_default.xml")
    )
    # Read the input image
    np_bytes = np.frombuffer(image_bytes, dtype=np.uint8)
    img = cv2.imdecode(np_bytes, cv2.IMREAD_COLOR)
    # Convert into grayscale
    gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
    # Detect faces
    faces = face_cascade.detectMultiScale(gray, 1.1, 4)
    return len(faces)


@app.function(
    image=modal.Image.debian_slim(python_version="3.11").uv_pip_install("inflect")
)
@modal.asgi_app()
def web():
    import inflect
    from fastapi import FastAPI, File, HTTPException, UploadFile
    from fastapi.responses import HTMLResponse

    app = FastAPI()

    @app.get("/", response_class=HTMLResponse)
    async def index():
        """
        Render an HTML form for file upload.
        """
        return """
        <html>
            <head>
                <title>Face Counter</title>
            </head>
            <body>
                <h1>Upload an Image to Count Faces</h1>
                <form action="/process" method="post" enctype="multipart/form-data">
                    <input type="file" name="file" id="file" accept="image/*" required />
                    <button type="submit">Upload</button>
                </form>
            </body>
        </html>
        """

    @app.post("/process", response_class=HTMLResponse)
    async def process(file: UploadFile = File(...)):
        """
        Process the uploaded image and return the number of faces detected.
        """
        try:
            file_content = await file.read()
            num_faces = await count_faces.remote.aio(file_content)
            return f"""
            <html>
                <head>
                    <title>Face Counter Result</title>
                </head>
                <body>
                    <h1>{inflect.engine().number_to_words(num_faces).title()} {"Face" if num_faces == 1 else "Faces"} Detected</h1>
                    <h2>{"😀" * num_faces}</h2>
                    <a href="/">Go back</a>
                </body>
            </html>
            """
        except Exception as e:
            raise HTTPException(
                status_code=400, detail=f"Error processing image: {str(e)}"
            )

    return app

\`\`\`
`,meta:{title:`Run OpenCV face detection on an image`,description:`This example shows how you can use OpenCV on Modal to detect faces in an image. We use the opencv-python package to load the image and the opencv library to detect faces. The function count_faces takes an image as input and returns the number of faces detected in the image.`}},{toc:f,rawContent:p,meta:m}=d,h=e(`<!> <p>This example shows how you can use OpenCV on Modal to detect faces in an image. We use
the <code>opencv-python</code> package to load the image and the <code>opencv</code> library to
detect faces. The function <code>count_faces</code> takes an image as input and returns
the number of faces detected in the image.</p> <p>The code below also shows how you can create wrap this function
in a simple FastAPI server to create a web interface.</p> <!>`,1);function g(e,f){let p=r(f,[`children`,`$$slots`,`$$events`,`$$legacy`]);u(e,i(()=>p,()=>d,{children:(e,r)=>{var i=h(),u=a(i);c(u,{id:`run-opencv-face-detection-on-an-image`,children:(e,r)=>{s(),n(e,t(`Run OpenCV face detection on an image`))},$$slots:{default:!0}}),l(o(u,6),{code:`import%20os%0A%0Aimport%20modal%0A%0Aapp%20%3D%20modal.App(%22example-count-faces%22)%0A%0A%0Aopen_cv_image%20%3D%20(%0A%20%20%20%20modal.Image.debian_slim(python_version%3D%223.11%22)%0A%20%20%20%20.apt_install(%22python3-opencv%22)%0A%20%20%20%20.uv_pip_install(%0A%20%20%20%20%20%20%20%20%22fastapi%5Bstandard%5D%3D%3D0.115.4%22%2C%0A%20%20%20%20%20%20%20%20%22opencv-python~%3D4.10.0%22%2C%0A%20%20%20%20%20%20%20%20%22numpy%3C2%22%2C%0A%20%20%20%20)%0A)%0A%0A%0A%40app.function(image%3Dopen_cv_image)%0Adef%20count_faces(image_bytes%3A%20bytes)%20-%3E%20int%3A%0A%20%20%20%20import%20cv2%0A%20%20%20%20import%20numpy%20as%20np%0A%0A%20%20%20%20%23%20Example%20borrowed%20from%20https%3A%2F%2Ftowardsdatascience.com%2Fface-detection-in-2-minutes-using-opencv-python-90f89d7c0f81%0A%20%20%20%20%23%20Load%20the%20cascade%0A%20%20%20%20face_cascade%20%3D%20cv2.CascadeClassifier(%0A%20%20%20%20%20%20%20%20os.path.join(cv2.data.haarcascades%2C%20%22haarcascade_frontalface_default.xml%22)%0A%20%20%20%20)%0A%20%20%20%20%23%20Read%20the%20input%20image%0A%20%20%20%20np_bytes%20%3D%20np.frombuffer(image_bytes%2C%20dtype%3Dnp.uint8)%0A%20%20%20%20img%20%3D%20cv2.imdecode(np_bytes%2C%20cv2.IMREAD_COLOR)%0A%20%20%20%20%23%20Convert%20into%20grayscale%0A%20%20%20%20gray%20%3D%20cv2.cvtColor(img%2C%20cv2.COLOR_BGR2GRAY)%0A%20%20%20%20%23%20Detect%20faces%0A%20%20%20%20faces%20%3D%20face_cascade.detectMultiScale(gray%2C%201.1%2C%204)%0A%20%20%20%20return%20len(faces)%0A%0A%0A%40app.function(%0A%20%20%20%20image%3Dmodal.Image.debian_slim(python_version%3D%223.11%22).uv_pip_install(%22inflect%22)%0A)%0A%40modal.asgi_app()%0Adef%20web()%3A%0A%20%20%20%20import%20inflect%0A%20%20%20%20from%20fastapi%20import%20FastAPI%2C%20File%2C%20HTTPException%2C%20UploadFile%0A%20%20%20%20from%20fastapi.responses%20import%20HTMLResponse%0A%0A%20%20%20%20app%20%3D%20FastAPI()%0A%0A%20%20%20%20%40app.get(%22%2F%22%2C%20response_class%3DHTMLResponse)%0A%20%20%20%20async%20def%20index()%3A%0A%20%20%20%20%20%20%20%20%22%22%22%0A%20%20%20%20%20%20%20%20Render%20an%20HTML%20form%20for%20file%20upload.%0A%20%20%20%20%20%20%20%20%22%22%22%0A%20%20%20%20%20%20%20%20return%20%22%22%22%0A%20%20%20%20%20%20%20%20%3Chtml%3E%0A%20%20%20%20%20%20%20%20%20%20%20%20%3Chead%3E%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%3Ctitle%3EFace%20Counter%3C%2Ftitle%3E%0A%20%20%20%20%20%20%20%20%20%20%20%20%3C%2Fhead%3E%0A%20%20%20%20%20%20%20%20%20%20%20%20%3Cbody%3E%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%3Ch1%3EUpload%20an%20Image%20to%20Count%20Faces%3C%2Fh1%3E%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%3Cform%20action%3D%22%2Fprocess%22%20method%3D%22post%22%20enctype%3D%22multipart%2Fform-data%22%3E%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%3Cinput%20type%3D%22file%22%20name%3D%22file%22%20id%3D%22file%22%20accept%3D%22image%2F*%22%20required%20%2F%3E%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%3Cbutton%20type%3D%22submit%22%3EUpload%3C%2Fbutton%3E%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%3C%2Fform%3E%0A%20%20%20%20%20%20%20%20%20%20%20%20%3C%2Fbody%3E%0A%20%20%20%20%20%20%20%20%3C%2Fhtml%3E%0A%20%20%20%20%20%20%20%20%22%22%22%0A%0A%20%20%20%20%40app.post(%22%2Fprocess%22%2C%20response_class%3DHTMLResponse)%0A%20%20%20%20async%20def%20process(file%3A%20UploadFile%20%3D%20File(...))%3A%0A%20%20%20%20%20%20%20%20%22%22%22%0A%20%20%20%20%20%20%20%20Process%20the%20uploaded%20image%20and%20return%20the%20number%20of%20faces%20detected.%0A%20%20%20%20%20%20%20%20%22%22%22%0A%20%20%20%20%20%20%20%20try%3A%0A%20%20%20%20%20%20%20%20%20%20%20%20file_content%20%3D%20await%20file.read()%0A%20%20%20%20%20%20%20%20%20%20%20%20num_faces%20%3D%20await%20count_faces.remote.aio(file_content)%0A%20%20%20%20%20%20%20%20%20%20%20%20return%20f%22%22%22%0A%20%20%20%20%20%20%20%20%20%20%20%20%3Chtml%3E%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%3Chead%3E%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%3Ctitle%3EFace%20Counter%20Result%3C%2Ftitle%3E%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%3C%2Fhead%3E%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%3Cbody%3E%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%3Ch1%3E%7Binflect.engine().number_to_words(num_faces).title()%7D%20%7B%22Face%22%20if%20num_faces%20%3D%3D%201%20else%20%22Faces%22%7D%20Detected%3C%2Fh1%3E%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%3Ch2%3E%7B%22%F0%9F%98%80%22%20*%20num_faces%7D%3C%2Fh2%3E%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%3Ca%20href%3D%22%2F%22%3EGo%20back%3C%2Fa%3E%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%3C%2Fbody%3E%0A%20%20%20%20%20%20%20%20%20%20%20%20%3C%2Fhtml%3E%0A%20%20%20%20%20%20%20%20%20%20%20%20%22%22%22%0A%20%20%20%20%20%20%20%20except%20Exception%20as%20e%3A%0A%20%20%20%20%20%20%20%20%20%20%20%20raise%20HTTPException(%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20status_code%3D400%2C%20detail%3Df%22Error%20processing%20image%3A%20%7Bstr(e)%7D%22%0A%20%20%20%20%20%20%20%20%20%20%20%20)%0A%0A%20%20%20%20return%20app%0A`,lang:`python`}),n(e,i)},$$slots:{default:!0}}))}export{g as default,d as metadata};
//# sourceMappingURL=BQqVvJSc.js.map
