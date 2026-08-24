(function(){try{var e=typeof window<`u`?window:typeof global<`u`?global:typeof globalThis<`u`?globalThis:typeof self<`u`?self:{};e.SENTRY_RELEASE={id:`f99fcf9f0a844cc9bd13fdc8e5782b84`};var t=new e.Error().stack;t&&(e._sentryDebugIds=e._sentryDebugIds||{},e._sentryDebugIds[t]=`73a48c20-fc3f-4a69-91af-669f3c15db53`,e._sentryDebugIdIdentifier=`sentry-dbid-73a48c20-fc3f-4a69-91af-669f3c15db53`)}catch{}})();import{St as e,Tt as t,bt as n,c as r,d as i,en as a,tn as o,wn as s}from"./F_ixKBiO.js";import"./B1sc9Zdx.js";import"./Bb2deiU3.js";import{a as c}from"./CPby7b1n.js";import{t as l}from"./BILrvr3I.js";import{t as u}from"./B4L_if842.js";var d={toc:[{depth:2,value:`Testing WebRTC and Modal`,id:`testing-webrtc-and-modal`}],rawContent:`\`\`\`python
import asyncio
import os
import time

import modal

from .webrtc_yolo import (
    CACHE_PATH,
    WebcamObjDet,
    app,
    cache,
    lookup_turn_ice_servers,
)

\`\`\`

## Testing WebRTC and Modal

First we define a \`local_entrypoint\` to run and evaluate the test.
Our test will stream an .mp4 file to the cloud peer and record the annotated video to a new file.
The test itself ensures that the new video is no more than five frames shorter than the source file.
The difference is due to dropped frames while the connection is starting up.

\`\`\`python
@app.local_entrypoint()
def test():
    input_frames, output_frames = run_video_processing_test.remote()
    # allow a few dropped frames from the connection starting up
    assert input_frames - output_frames < 5, (
        f"Streaming failed. Frame difference: {input_frames} - {output_frames} = {input_frames - output_frames}"
    )


\`\`\`

Because our test will require Python dependencies outside the standard library,
we'll run the test itself in a container on Modal.
There are some details in here regarding the use of \`aiortc\`'s \`MediaPlayer\` and \`MediaRecorder\` classes that we won't cover here.
Just know that these are \`aiortc\` specific classes - not a WebRTC thing.

That said, using these classes does require us to manually \`start\` and \`stop\` streams.
We wait until the peer is \`connected\`, then start the recorder. We stop via the
track \`on_ended\` callback and again explicitly after \`pc.close()\` so the mp4 is finalized.

\`\`\`python
test_image = (
    modal.Image.debian_slim(python_version="3.12")
    .apt_install("python3-opencv", "ffmpeg")
    .uv_pip_install(
        "aiortc==1.14.0",
        "aiohttp==3.11.18",
        "opencv-python==4.11.0.86",
    )
)

TEST_VIDEO_SOURCE_URL = "https://modal-cdn.com/cliff_jumping.mp4"
TEST_VIDEO_RECORD_FILE = CACHE_PATH / "test_video.mp4"
\`\`\`

extra time to run streams beyond input video duration

\`\`\`python
VIDEO_DURATION_BUFFER_SECS = 5.0
\`\`\`

allow time for container / YOLO cold start

\`\`\`python
TEST_TIMEOUT = 300
ICE_GATHERING_TIMEOUT_SECS = 10.0
\`\`\`

ICE/DTLS after setRemoteDescription

\`\`\`python
CONNECTION_TIMEOUT_SECS = 30.0


@app.function(
    image=test_image,
    volumes=cache,
    timeout=TEST_TIMEOUT,
)
async def run_video_processing_test() -> tuple[float, int]:
    import urllib.request

    import cv2
    from aiohttp import ClientSession
    from aiortc import (
        RTCConfiguration,
        RTCIceServer,
        RTCPeerConnection,
        RTCSessionDescription,
    )
    from aiortc.contrib.media import MediaBlackhole, MediaPlayer, MediaRecorder

    # cache the source locally so MediaPlayer isn't held open on HTTP across the
    # GPU cold-start wait before ICE connects
    local_source = CACHE_PATH / "cliff_jumping_src.mp4"
    if not local_source.exists():
        urllib.request.urlretrieve(TEST_VIDEO_SOURCE_URL, local_source)

    # get input video duration in frames / seconds
    input_video = cv2.VideoCapture(str(local_source))
    input_frames = input_video.get(cv2.CAP_PROP_FRAME_COUNT)
    input_fps = input_video.get(cv2.CAP_PROP_FPS) or 30.0
    input_duration = input_frames / input_fps
    input_video.release()

    if TEST_VIDEO_RECORD_FILE.exists():
        os.remove(TEST_VIDEO_RECORD_FILE)

    try:
        turn_servers = await lookup_turn_ice_servers.remote.aio()
    except Exception as e:
        print(f"Skipping TURN credential check (unavailable): {e}")
    else:
        turn_urls = [entry["urls"] for entry in turn_servers]
        if not any(str(url).startswith("turn") for url in turn_urls):
            raise RuntimeError(f"TURN ICE list missing turn: URLs: {turn_urls}")
        if not any(
            entry.get("username") and entry.get("credential") for entry in turn_servers
        ):
            raise RuntimeError("TURN ICE list missing username/credential")

    base_url = await WebcamObjDet().web.get_web_url.aio()
    offer_url = base_url.rstrip("/") + "/offer"
    stun_ice_url = base_url.rstrip("/") + "/ice-servers?mode=stun"

    async def _json_or_raise(resp, what: str):
        # aiohttp ClientResponseError is not cloudpickle-safe; raise a plain error.
        if resp.status >= 400:
            body = (await resp.text())[:500]
            raise RuntimeError(f"{what} failed: HTTP {resp.status}: {body}")
        return await resp.json()

    def _retriable_http(err: RuntimeError) -> bool:
        # CI can steal the shared ephemeral webhook label mid-request (5xx), or
        # leave the URL pointing at a stopped app (404).
        msg = str(err)
        return "HTTP 5" in msg or "HTTP 404" in msg

    async def _get_json(session, url, what, attempts=3):
        last_err = None
        for attempt in range(attempts):
            try:
                async with session.get(url) as resp:
                    return await _json_or_raise(resp, what)
            except RuntimeError as e:
                last_err = e
                if attempt + 1 == attempts or not _retriable_http(e):
                    raise
                await asyncio.sleep(0.5 * (attempt + 1))
        raise last_err

    async with ClientSession() as session:
        # fetch STUN ICE servers from the signaling server (same list the GPU peer uses)
        ice_payload = await _get_json(
            session, stun_ice_url, "GET /ice-servers?mode=stun"
        )
        ice_servers = [
            RTCIceServer(
                urls=entry["urls"],
                username=entry.get("username"),
                credential=entry.get("credential"),
            )
            for entry in ice_payload["ice_servers"]
        ]

        pc = RTCPeerConnection(configuration=RTCConfiguration(iceServers=ice_servers))
        player = MediaPlayer(str(local_source))
        recorder = MediaRecorder(str(TEST_VIDEO_RECORD_FILE))
        blackhole = MediaBlackhole()
        try:
            # src file has audio; MediaPlayer demux stalls if that track isn't read.
            # drain it without sending; browser clients use video-only getUserMedia.
            if player.audio:
                blackhole.addTrack(player.audio)

            # audio before video keeps media m-lines in the order Pipecat expects
            pc.addTransceiver("audio")
            # client-created datachannel required by Pipecat's SmallWebRTCConnection
            pc.createDataChannel("modal-webrtc")
            # setup video player and add track to peer connection
            if player.video:
                pc.addTrack(player.video)

            # when we receive a track back from the video processing peer we record it
            @pc.on("track")
            def on_track(track):
                if track.kind != "video":
                    return
                # record track to file
                recorder.addTrack(track)

                @track.on("ended")
                async def on_ended():
                    # stop recording when incoming track ends to finish writing video
                    await recorder.stop()

            # set local description and send as offer to peer
            offer = await pc.createOffer()
            await pc.setLocalDescription(offer)

            # wait for ICE gathering; proceed with partial SDP if it times out
            deadline = time.monotonic() + ICE_GATHERING_TIMEOUT_SECS
            while pc.iceGatheringState != "complete":
                if time.monotonic() >= deadline:
                    print(
                        f"ICE gathering timed out after {ICE_GATHERING_TIMEOUT_SECS}s; "
                        "continuing with available candidates"
                    )
                    break
                await asyncio.sleep(0.05)

            last_err = None
            answer = None
            for attempt in range(3):
                try:
                    async with session.post(
                        offer_url,
                        json={
                            "sdp": pc.localDescription.sdp,
                            "type": pc.localDescription.type,
                            "ice_server_type": "stun",
                        },
                    ) as resp:
                        answer = await _json_or_raise(resp, "POST /offer")
                    break
                except RuntimeError as e:
                    last_err = e
                    if attempt + 1 == 3 or not _retriable_http(e):
                        raise
                    await asyncio.sleep(0.5 * (attempt + 1))
            else:
                raise last_err

            await blackhole.start()
            await pc.setRemoteDescription(
                RTCSessionDescription(sdp=answer["sdp"], type=answer["type"])
            )
            deadline = time.monotonic() + CONNECTION_TIMEOUT_SECS
            while pc.connectionState not in ("connected", "failed", "closed"):
                if time.monotonic() >= deadline:
                    raise RuntimeError(
                        f"timed out waiting for WebRTC connected; state={pc.connectionState}"
                    )
                await asyncio.sleep(0.05)
            if pc.connectionState != "connected":
                raise RuntimeError(f"peer connection {pc.connectionState}")

            # mediaRecorders need to be started manually
            await recorder.start()

            # run until sufficient time has passed
            await asyncio.sleep(input_duration + VIDEO_DURATION_BUFFER_SECS)
        finally:
            await pc.close()
            await blackhole.stop()
            # finalize the mp4 even if track "ended" never fires after close.
            await recorder.stop()
            if player.audio:
                player.audio.stop()
            if player.video:
                player.video.stop()

        # wait for peer to finish processing video
        await asyncio.sleep(5.0)

    # compare output video length to input video length
    output_video = cv2.VideoCapture(str(TEST_VIDEO_RECORD_FILE))
    output_frames = int(output_video.get(cv2.CAP_PROP_FRAME_COUNT))
    output_video.release()
    return input_frames, output_frames

\`\`\`
`,meta:{description:`First we define a local_entrypoint to run and evaluate the test. Our test will stream an .mp4 file to the cloud peer and record the annotated video to a new file. The test itself ensures that the new video is no more than five frames shorter than the source file. The difference is due to dropped frames while the connection is starting up.`}},{toc:f,rawContent:p,meta:m}=d,h=e(`<!> <!> <p>First we define a <code>local_entrypoint</code> to run and evaluate the test.
Our test will stream an .mp4 file to the cloud peer and record the annotated video to a new file.
The test itself ensures that the new video is no more than five frames shorter than the source file.
The difference is due to dropped frames while the connection is starting up.</p> <!> <p>Because our test will require Python dependencies outside the standard library,
we’ll run the test itself in a container on Modal.
There are some details in here regarding the use of <code>aiortc</code>’s <code>MediaPlayer</code> and <code>MediaRecorder</code> classes that we won’t cover here.
Just know that these are <code>aiortc</code> specific classes - not a WebRTC thing.</p> <p>That said, using these classes does require us to manually <code>start</code> and <code>stop</code> streams.
We wait until the peer is <code>connected</code>, then start the recorder. We stop via the
track <code>on_ended</code> callback and again explicitly after <code>pc.close()</code> so the mp4 is finalized.</p> <!> <p>extra time to run streams beyond input video duration</p> <!> <p>allow time for container / YOLO cold start</p> <!> <p>ICE/DTLS after setRemoteDescription</p> <!>`,1);function g(e,f){let p=r(f,[`children`,`$$slots`,`$$events`,`$$legacy`]);u(e,i(()=>p,()=>d,{children:(e,r)=>{var i=h(),u=a(i);l(u,{code:`import%20asyncio%0Aimport%20os%0Aimport%20time%0A%0Aimport%20modal%0A%0Afrom%20.webrtc_yolo%20import%20(%0A%20%20%20%20CACHE_PATH%2C%0A%20%20%20%20WebcamObjDet%2C%0A%20%20%20%20app%2C%0A%20%20%20%20cache%2C%0A%20%20%20%20lookup_turn_ice_servers%2C%0A)%0A`,lang:`python`});var d=o(u,2);c(d,{id:`testing-webrtc-and-modal`,children:(e,r)=>{s(),n(e,t(`Testing WebRTC and Modal`))},$$slots:{default:!0}});var f=o(d,4);l(f,{code:`%40app.local_entrypoint()%0Adef%20test()%3A%0A%20%20%20%20input_frames%2C%20output_frames%20%3D%20run_video_processing_test.remote()%0A%20%20%20%20%23%20allow%20a%20few%20dropped%20frames%20from%20the%20connection%20starting%20up%0A%20%20%20%20assert%20input_frames%20-%20output_frames%20%3C%205%2C%20(%0A%20%20%20%20%20%20%20%20f%22Streaming%20failed.%20Frame%20difference%3A%20%7Binput_frames%7D%20-%20%7Boutput_frames%7D%20%3D%20%7Binput_frames%20-%20output_frames%7D%22%0A%20%20%20%20)%0A%0A`,lang:`python`});var p=o(f,6);l(p,{code:`test_image%20%3D%20(%0A%20%20%20%20modal.Image.debian_slim(python_version%3D%223.12%22)%0A%20%20%20%20.apt_install(%22python3-opencv%22%2C%20%22ffmpeg%22)%0A%20%20%20%20.uv_pip_install(%0A%20%20%20%20%20%20%20%20%22aiortc%3D%3D1.14.0%22%2C%0A%20%20%20%20%20%20%20%20%22aiohttp%3D%3D3.11.18%22%2C%0A%20%20%20%20%20%20%20%20%22opencv-python%3D%3D4.11.0.86%22%2C%0A%20%20%20%20)%0A)%0A%0ATEST_VIDEO_SOURCE_URL%20%3D%20%22https%3A%2F%2Fmodal-cdn.com%2Fcliff_jumping.mp4%22%0ATEST_VIDEO_RECORD_FILE%20%3D%20CACHE_PATH%20%2F%20%22test_video.mp4%22`,lang:`python`});var m=o(p,4);l(m,{code:`VIDEO_DURATION_BUFFER_SECS%20%3D%205.0`,lang:`python`});var g=o(m,4);l(g,{code:`TEST_TIMEOUT%20%3D%20300%0AICE_GATHERING_TIMEOUT_SECS%20%3D%2010.0`,lang:`python`}),l(o(g,4),{code:`CONNECTION_TIMEOUT_SECS%20%3D%2030.0%0A%0A%0A%40app.function(%0A%20%20%20%20image%3Dtest_image%2C%0A%20%20%20%20volumes%3Dcache%2C%0A%20%20%20%20timeout%3DTEST_TIMEOUT%2C%0A)%0Aasync%20def%20run_video_processing_test()%20-%3E%20tuple%5Bfloat%2C%20int%5D%3A%0A%20%20%20%20import%20urllib.request%0A%0A%20%20%20%20import%20cv2%0A%20%20%20%20from%20aiohttp%20import%20ClientSession%0A%20%20%20%20from%20aiortc%20import%20(%0A%20%20%20%20%20%20%20%20RTCConfiguration%2C%0A%20%20%20%20%20%20%20%20RTCIceServer%2C%0A%20%20%20%20%20%20%20%20RTCPeerConnection%2C%0A%20%20%20%20%20%20%20%20RTCSessionDescription%2C%0A%20%20%20%20)%0A%20%20%20%20from%20aiortc.contrib.media%20import%20MediaBlackhole%2C%20MediaPlayer%2C%20MediaRecorder%0A%0A%20%20%20%20%23%20cache%20the%20source%20locally%20so%20MediaPlayer%20isn't%20held%20open%20on%20HTTP%20across%20the%0A%20%20%20%20%23%20GPU%20cold-start%20wait%20before%20ICE%20connects%0A%20%20%20%20local_source%20%3D%20CACHE_PATH%20%2F%20%22cliff_jumping_src.mp4%22%0A%20%20%20%20if%20not%20local_source.exists()%3A%0A%20%20%20%20%20%20%20%20urllib.request.urlretrieve(TEST_VIDEO_SOURCE_URL%2C%20local_source)%0A%0A%20%20%20%20%23%20get%20input%20video%20duration%20in%20frames%20%2F%20seconds%0A%20%20%20%20input_video%20%3D%20cv2.VideoCapture(str(local_source))%0A%20%20%20%20input_frames%20%3D%20input_video.get(cv2.CAP_PROP_FRAME_COUNT)%0A%20%20%20%20input_fps%20%3D%20input_video.get(cv2.CAP_PROP_FPS)%20or%2030.0%0A%20%20%20%20input_duration%20%3D%20input_frames%20%2F%20input_fps%0A%20%20%20%20input_video.release()%0A%0A%20%20%20%20if%20TEST_VIDEO_RECORD_FILE.exists()%3A%0A%20%20%20%20%20%20%20%20os.remove(TEST_VIDEO_RECORD_FILE)%0A%0A%20%20%20%20try%3A%0A%20%20%20%20%20%20%20%20turn_servers%20%3D%20await%20lookup_turn_ice_servers.remote.aio()%0A%20%20%20%20except%20Exception%20as%20e%3A%0A%20%20%20%20%20%20%20%20print(f%22Skipping%20TURN%20credential%20check%20(unavailable)%3A%20%7Be%7D%22)%0A%20%20%20%20else%3A%0A%20%20%20%20%20%20%20%20turn_urls%20%3D%20%5Bentry%5B%22urls%22%5D%20for%20entry%20in%20turn_servers%5D%0A%20%20%20%20%20%20%20%20if%20not%20any(str(url).startswith(%22turn%22)%20for%20url%20in%20turn_urls)%3A%0A%20%20%20%20%20%20%20%20%20%20%20%20raise%20RuntimeError(f%22TURN%20ICE%20list%20missing%20turn%3A%20URLs%3A%20%7Bturn_urls%7D%22)%0A%20%20%20%20%20%20%20%20if%20not%20any(%0A%20%20%20%20%20%20%20%20%20%20%20%20entry.get(%22username%22)%20and%20entry.get(%22credential%22)%20for%20entry%20in%20turn_servers%0A%20%20%20%20%20%20%20%20)%3A%0A%20%20%20%20%20%20%20%20%20%20%20%20raise%20RuntimeError(%22TURN%20ICE%20list%20missing%20username%2Fcredential%22)%0A%0A%20%20%20%20base_url%20%3D%20await%20WebcamObjDet().web.get_web_url.aio()%0A%20%20%20%20offer_url%20%3D%20base_url.rstrip(%22%2F%22)%20%2B%20%22%2Foffer%22%0A%20%20%20%20stun_ice_url%20%3D%20base_url.rstrip(%22%2F%22)%20%2B%20%22%2Fice-servers%3Fmode%3Dstun%22%0A%0A%20%20%20%20async%20def%20_json_or_raise(resp%2C%20what%3A%20str)%3A%0A%20%20%20%20%20%20%20%20%23%20aiohttp%20ClientResponseError%20is%20not%20cloudpickle-safe%3B%20raise%20a%20plain%20error.%0A%20%20%20%20%20%20%20%20if%20resp.status%20%3E%3D%20400%3A%0A%20%20%20%20%20%20%20%20%20%20%20%20body%20%3D%20(await%20resp.text())%5B%3A500%5D%0A%20%20%20%20%20%20%20%20%20%20%20%20raise%20RuntimeError(f%22%7Bwhat%7D%20failed%3A%20HTTP%20%7Bresp.status%7D%3A%20%7Bbody%7D%22)%0A%20%20%20%20%20%20%20%20return%20await%20resp.json()%0A%0A%20%20%20%20def%20_retriable_http(err%3A%20RuntimeError)%20-%3E%20bool%3A%0A%20%20%20%20%20%20%20%20%23%20CI%20can%20steal%20the%20shared%20ephemeral%20webhook%20label%20mid-request%20(5xx)%2C%20or%0A%20%20%20%20%20%20%20%20%23%20leave%20the%20URL%20pointing%20at%20a%20stopped%20app%20(404).%0A%20%20%20%20%20%20%20%20msg%20%3D%20str(err)%0A%20%20%20%20%20%20%20%20return%20%22HTTP%205%22%20in%20msg%20or%20%22HTTP%20404%22%20in%20msg%0A%0A%20%20%20%20async%20def%20_get_json(session%2C%20url%2C%20what%2C%20attempts%3D3)%3A%0A%20%20%20%20%20%20%20%20last_err%20%3D%20None%0A%20%20%20%20%20%20%20%20for%20attempt%20in%20range(attempts)%3A%0A%20%20%20%20%20%20%20%20%20%20%20%20try%3A%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20async%20with%20session.get(url)%20as%20resp%3A%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20return%20await%20_json_or_raise(resp%2C%20what)%0A%20%20%20%20%20%20%20%20%20%20%20%20except%20RuntimeError%20as%20e%3A%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20last_err%20%3D%20e%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20if%20attempt%20%2B%201%20%3D%3D%20attempts%20or%20not%20_retriable_http(e)%3A%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20raise%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20await%20asyncio.sleep(0.5%20*%20(attempt%20%2B%201))%0A%20%20%20%20%20%20%20%20raise%20last_err%0A%0A%20%20%20%20async%20with%20ClientSession()%20as%20session%3A%0A%20%20%20%20%20%20%20%20%23%20fetch%20STUN%20ICE%20servers%20from%20the%20signaling%20server%20(same%20list%20the%20GPU%20peer%20uses)%0A%20%20%20%20%20%20%20%20ice_payload%20%3D%20await%20_get_json(%0A%20%20%20%20%20%20%20%20%20%20%20%20session%2C%20stun_ice_url%2C%20%22GET%20%2Fice-servers%3Fmode%3Dstun%22%0A%20%20%20%20%20%20%20%20)%0A%20%20%20%20%20%20%20%20ice_servers%20%3D%20%5B%0A%20%20%20%20%20%20%20%20%20%20%20%20RTCIceServer(%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20urls%3Dentry%5B%22urls%22%5D%2C%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20username%3Dentry.get(%22username%22)%2C%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20credential%3Dentry.get(%22credential%22)%2C%0A%20%20%20%20%20%20%20%20%20%20%20%20)%0A%20%20%20%20%20%20%20%20%20%20%20%20for%20entry%20in%20ice_payload%5B%22ice_servers%22%5D%0A%20%20%20%20%20%20%20%20%5D%0A%0A%20%20%20%20%20%20%20%20pc%20%3D%20RTCPeerConnection(configuration%3DRTCConfiguration(iceServers%3Dice_servers))%0A%20%20%20%20%20%20%20%20player%20%3D%20MediaPlayer(str(local_source))%0A%20%20%20%20%20%20%20%20recorder%20%3D%20MediaRecorder(str(TEST_VIDEO_RECORD_FILE))%0A%20%20%20%20%20%20%20%20blackhole%20%3D%20MediaBlackhole()%0A%20%20%20%20%20%20%20%20try%3A%0A%20%20%20%20%20%20%20%20%20%20%20%20%23%20src%20file%20has%20audio%3B%20MediaPlayer%20demux%20stalls%20if%20that%20track%20isn't%20read.%0A%20%20%20%20%20%20%20%20%20%20%20%20%23%20drain%20it%20without%20sending%3B%20browser%20clients%20use%20video-only%20getUserMedia.%0A%20%20%20%20%20%20%20%20%20%20%20%20if%20player.audio%3A%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20blackhole.addTrack(player.audio)%0A%0A%20%20%20%20%20%20%20%20%20%20%20%20%23%20audio%20before%20video%20keeps%20media%20m-lines%20in%20the%20order%20Pipecat%20expects%0A%20%20%20%20%20%20%20%20%20%20%20%20pc.addTransceiver(%22audio%22)%0A%20%20%20%20%20%20%20%20%20%20%20%20%23%20client-created%20datachannel%20required%20by%20Pipecat's%20SmallWebRTCConnection%0A%20%20%20%20%20%20%20%20%20%20%20%20pc.createDataChannel(%22modal-webrtc%22)%0A%20%20%20%20%20%20%20%20%20%20%20%20%23%20setup%20video%20player%20and%20add%20track%20to%20peer%20connection%0A%20%20%20%20%20%20%20%20%20%20%20%20if%20player.video%3A%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20pc.addTrack(player.video)%0A%0A%20%20%20%20%20%20%20%20%20%20%20%20%23%20when%20we%20receive%20a%20track%20back%20from%20the%20video%20processing%20peer%20we%20record%20it%0A%20%20%20%20%20%20%20%20%20%20%20%20%40pc.on(%22track%22)%0A%20%20%20%20%20%20%20%20%20%20%20%20def%20on_track(track)%3A%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20if%20track.kind%20!%3D%20%22video%22%3A%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20return%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%23%20record%20track%20to%20file%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20recorder.addTrack(track)%0A%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%40track.on(%22ended%22)%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20async%20def%20on_ended()%3A%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%23%20stop%20recording%20when%20incoming%20track%20ends%20to%20finish%20writing%20video%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20await%20recorder.stop()%0A%0A%20%20%20%20%20%20%20%20%20%20%20%20%23%20set%20local%20description%20and%20send%20as%20offer%20to%20peer%0A%20%20%20%20%20%20%20%20%20%20%20%20offer%20%3D%20await%20pc.createOffer()%0A%20%20%20%20%20%20%20%20%20%20%20%20await%20pc.setLocalDescription(offer)%0A%0A%20%20%20%20%20%20%20%20%20%20%20%20%23%20wait%20for%20ICE%20gathering%3B%20proceed%20with%20partial%20SDP%20if%20it%20times%20out%0A%20%20%20%20%20%20%20%20%20%20%20%20deadline%20%3D%20time.monotonic()%20%2B%20ICE_GATHERING_TIMEOUT_SECS%0A%20%20%20%20%20%20%20%20%20%20%20%20while%20pc.iceGatheringState%20!%3D%20%22complete%22%3A%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20if%20time.monotonic()%20%3E%3D%20deadline%3A%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20print(%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20f%22ICE%20gathering%20timed%20out%20after%20%7BICE_GATHERING_TIMEOUT_SECS%7Ds%3B%20%22%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%22continuing%20with%20available%20candidates%22%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20)%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20break%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20await%20asyncio.sleep(0.05)%0A%0A%20%20%20%20%20%20%20%20%20%20%20%20last_err%20%3D%20None%0A%20%20%20%20%20%20%20%20%20%20%20%20answer%20%3D%20None%0A%20%20%20%20%20%20%20%20%20%20%20%20for%20attempt%20in%20range(3)%3A%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20try%3A%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20async%20with%20session.post(%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20offer_url%2C%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20json%3D%7B%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%22sdp%22%3A%20pc.localDescription.sdp%2C%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%22type%22%3A%20pc.localDescription.type%2C%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%22ice_server_type%22%3A%20%22stun%22%2C%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%7D%2C%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20)%20as%20resp%3A%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20answer%20%3D%20await%20_json_or_raise(resp%2C%20%22POST%20%2Foffer%22)%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20break%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20except%20RuntimeError%20as%20e%3A%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20last_err%20%3D%20e%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20if%20attempt%20%2B%201%20%3D%3D%203%20or%20not%20_retriable_http(e)%3A%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20raise%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20await%20asyncio.sleep(0.5%20*%20(attempt%20%2B%201))%0A%20%20%20%20%20%20%20%20%20%20%20%20else%3A%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20raise%20last_err%0A%0A%20%20%20%20%20%20%20%20%20%20%20%20await%20blackhole.start()%0A%20%20%20%20%20%20%20%20%20%20%20%20await%20pc.setRemoteDescription(%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20RTCSessionDescription(sdp%3Danswer%5B%22sdp%22%5D%2C%20type%3Danswer%5B%22type%22%5D)%0A%20%20%20%20%20%20%20%20%20%20%20%20)%0A%20%20%20%20%20%20%20%20%20%20%20%20deadline%20%3D%20time.monotonic()%20%2B%20CONNECTION_TIMEOUT_SECS%0A%20%20%20%20%20%20%20%20%20%20%20%20while%20pc.connectionState%20not%20in%20(%22connected%22%2C%20%22failed%22%2C%20%22closed%22)%3A%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20if%20time.monotonic()%20%3E%3D%20deadline%3A%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20raise%20RuntimeError(%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20f%22timed%20out%20waiting%20for%20WebRTC%20connected%3B%20state%3D%7Bpc.connectionState%7D%22%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20)%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20await%20asyncio.sleep(0.05)%0A%20%20%20%20%20%20%20%20%20%20%20%20if%20pc.connectionState%20!%3D%20%22connected%22%3A%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20raise%20RuntimeError(f%22peer%20connection%20%7Bpc.connectionState%7D%22)%0A%0A%20%20%20%20%20%20%20%20%20%20%20%20%23%20mediaRecorders%20need%20to%20be%20started%20manually%0A%20%20%20%20%20%20%20%20%20%20%20%20await%20recorder.start()%0A%0A%20%20%20%20%20%20%20%20%20%20%20%20%23%20run%20until%20sufficient%20time%20has%20passed%0A%20%20%20%20%20%20%20%20%20%20%20%20await%20asyncio.sleep(input_duration%20%2B%20VIDEO_DURATION_BUFFER_SECS)%0A%20%20%20%20%20%20%20%20finally%3A%0A%20%20%20%20%20%20%20%20%20%20%20%20await%20pc.close()%0A%20%20%20%20%20%20%20%20%20%20%20%20await%20blackhole.stop()%0A%20%20%20%20%20%20%20%20%20%20%20%20%23%20finalize%20the%20mp4%20even%20if%20track%20%22ended%22%20never%20fires%20after%20close.%0A%20%20%20%20%20%20%20%20%20%20%20%20await%20recorder.stop()%0A%20%20%20%20%20%20%20%20%20%20%20%20if%20player.audio%3A%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20player.audio.stop()%0A%20%20%20%20%20%20%20%20%20%20%20%20if%20player.video%3A%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20player.video.stop()%0A%0A%20%20%20%20%20%20%20%20%23%20wait%20for%20peer%20to%20finish%20processing%20video%0A%20%20%20%20%20%20%20%20await%20asyncio.sleep(5.0)%0A%0A%20%20%20%20%23%20compare%20output%20video%20length%20to%20input%20video%20length%0A%20%20%20%20output_video%20%3D%20cv2.VideoCapture(str(TEST_VIDEO_RECORD_FILE))%0A%20%20%20%20output_frames%20%3D%20int(output_video.get(cv2.CAP_PROP_FRAME_COUNT))%0A%20%20%20%20output_video.release()%0A%20%20%20%20return%20input_frames%2C%20output_frames%0A`,lang:`python`}),n(e,i)},$$slots:{default:!0}}))}export{g as default,d as metadata};
//# sourceMappingURL=B7N8XszU.js.map
