(function(){try{var e=typeof window<`u`?window:typeof global<`u`?global:typeof globalThis<`u`?globalThis:typeof self<`u`?self:{};e.SENTRY_RELEASE={id:`f99fcf9f0a844cc9bd13fdc8e5782b84`};var t=new e.Error().stack;t&&(e._sentryDebugIds=e._sentryDebugIds||{},e._sentryDebugIds[t]=`132ffbb4-302b-47b2-ab0b-96fda91dfc58`,e._sentryDebugIdIdentifier=`sentry-dbid-132ffbb4-302b-47b2-ab0b-96fda91dfc58`)}catch{}})();import{c as e,d as t}from"./F_ixKBiO.js";import"./B1sc9Zdx.js";import"./Bb2deiU3.js";import{t as n}from"./BILrvr3I.js";import{t as r}from"./B4L_if842.js";var i={toc:[],rawContent:`\`\`\`python
import asyncio
import json
import queue
from abc import ABC, abstractmethod
from typing import Optional

import modal
from fastapi import FastAPI, WebSocket
from fastapi.websockets import WebSocketState


class ModalWebRtcPeer(ABC):
    """
    Base class for implementing WebRTC peer connections in Modal using aiortc.
    Implement using the \`app.cls\` decorator.

    This class provides a complete WebRTC peer implementation that handles:
    - Peer connection lifecycle management (creation, negotiation, cleanup)
    - Signaling via Modal Queue for SDP offer/answer exchange and ICE candidate handling
    - Automatic STUN server configuration (defaults to Google's STUN server)
    - Stream setup and management

    Required methods to override:
    - setup_streams(): Implementation for setting up media tracks and streams

    Optional methods to override:
    - initialize(): Custom initialization logic when peer is created
    - run_streams(): Implementation for stream runtime logic
    - get_turn_servers(): Implementation to provide custom TURN server configuration
    - exit(): Custom cleanup logic when peer is shutting down

    The peer connection is established through a ModalWebRtcSignalingServer that manages
    the signaling process between this peer and client peers.
    """

    @modal.enter()
    async def _initialize(self):
        import shortuuid

        self.id = shortuuid.uuid()
        self.pcs = {}
        self.pending_candidates = {}

        # call custom init logic
        await self.initialize()

    async def initialize(self):
        """Override to add custom logic when creating a peer"""

    @abstractmethod
    async def setup_streams(self, peer_id):
        """Override to add custom logic when creating a connection and setting up streams"""
        raise NotImplementedError

    async def run_streams(self, peer_id):
        """Override to add custom logic when running streams"""

    async def get_turn_servers(self, peer_id=None, msg=None) -> Optional[list]:
        """Override to customize TURN servers"""

    async def _setup_peer_connection(self, peer_id):
        """Creates an RTC peer connection via an ICE server"""
        from aiortc import RTCConfiguration, RTCIceServer, RTCPeerConnection

        # aiortc automatically uses google's STUN server,
        # but we can also specify our own
        config = RTCConfiguration(
            iceServers=[RTCIceServer(urls="stun:stun.l.google.com:19302")]
        )
        self.pcs[peer_id] = RTCPeerConnection(configuration=config)
        self.pending_candidates[peer_id] = []
        await self.setup_streams(peer_id)

        print(
            f"{self.id}: Created peer connection and setup streams from {self.id} to {peer_id}"
        )

    @modal.method()
    async def run(self, q: modal.Queue, peer_id: str):
        """Run the RTC peer after establishing a connection by passing WebSocket messages over a Queue."""
        print(f"{self.id}: Running modal peer instance for client peer: {peer_id}...")

        await self._connect_over_queue(q, peer_id)
        await self._run_streams(peer_id)

    async def _connect_over_queue(self, q, peer_id):
        """Connect this peer to another by passing messages along a Modal Queue."""

        msg_handlers = {  # message types we need to handle
            "offer": self.handle_offer,  # SDP offer
            "ice_candidate": self.handle_ice_candidate,  # trickled ICE candidate
            "identify": self.get_identity,  # identify challenge
            "get_turn_servers": self.get_turn_servers,  # TURN server request
        }

        while True:
            try:
                if self.pcs.get(peer_id) and (
                    self.pcs[peer_id].connectionState
                    in ["connected", "closed", "failed"]
                ):
                    print(f"{self.id}: Closing connection to {peer_id} over queue...")
                    await q.put.aio("close", partition="server")
                    break

                # read and parse websocket message passed over queue
                msg = json.loads(await q.get.aio(partition=peer_id, timeout=0.5))
                # dispatch the message to its handler
                if handler := msg_handlers.get(msg.get("type")):
                    response = await handler(peer_id, msg)
                else:
                    print(f"{self.id}: Unknown message type: {msg.get('type')}")
                    response = None

                # pass the message back over the queue to the server
                if response is not None:
                    await q.put.aio(json.dumps(response), partition="server")
            except queue.Empty:
                print(f"{self.id}: Queue empty, waiting for message...")
                pass
            except Exception as e:
                print(
                    f"{self.id}: Error handling message from {peer_id}: {type(e)}: {e}"
                )
                continue

    async def _run_streams(self, peer_id):
        """Run WebRTC streaming with a peer."""
        print(f"{self.id}:  running streams to {peer_id}...")

        await self.run_streams(peer_id)

        # run until connection is closed or broken
        while self.pcs[peer_id].connectionState == "connected":
            await asyncio.sleep(0.1)

        print(f"{self.id}:  ending streaming to {peer_id}")

    async def handle_offer(self, peer_id, msg):
        """Handles a peers SDP offer message by producing an SDP answer."""
        from aiortc import RTCSessionDescription

        print(f"{self.id}:  handling SDP offer from {peer_id}...")

        await self._setup_peer_connection(peer_id)
        await self.pcs[peer_id].setRemoteDescription(
            RTCSessionDescription(msg["sdp"], msg["type"])
        )
        answer = await self.pcs[peer_id].createAnswer()
        await self.pcs[peer_id].setLocalDescription(answer)
        sdp = self.pcs[peer_id].localDescription.sdp

        return {"sdp": sdp, "type": answer.type, "peer_id": self.id}

    async def handle_ice_candidate(self, peer_id, msg):
        """Add an ICE candidate sent by a peer."""
        from aiortc import RTCIceCandidate
        from aiortc.sdp import candidate_from_sdp

        candidate = msg.get("candidate")

        if not candidate:
            raise ValueError

        print(
            f"{self.id}:  received ice candidate from {peer_id}: {candidate['candidate_sdp']}..."
        )

        # parse ice candidate
        ice_candidate: RTCIceCandidate = candidate_from_sdp(candidate["candidate_sdp"])
        ice_candidate.sdpMid = candidate["sdpMid"]
        ice_candidate.sdpMLineIndex = candidate["sdpMLineIndex"]

        if not self.pcs.get(peer_id):
            self.pending_candidates[peer_id].append(ice_candidate)
        else:
            if len(self.pending_candidates[peer_id]) > 0:
                [
                    await self.pcs[peer_id].addIceCandidate(c)
                    for c in self.pending_candidates[peer_id]
                ]
                self.pending_candidates[peer_id] = []
            await self.pcs[peer_id].addIceCandidate(ice_candidate)

    async def get_identity(self, peer_id=None, msg=None):
        """Reply to an identify message with own id."""
        return {"type": "identify", "peer_id": self.id}

    async def generate_offer(self, peer_id):
        print(f"{self.id}:  generating offer for {peer_id}...")

        await self._setup_peer_connection(peer_id)
        offer = await self.pcs[peer_id].createOffer()
        await self.pcs[peer_id].setLocalDescription(offer)
        sdp = self.pcs[peer_id].localDescription.sdp

        return {"sdp": sdp, "type": offer.type, "peer_id": self.id}

    async def handle_answer(self, peer_id, answer):
        from aiortc import RTCSessionDescription

        print(f"{self.id}:  handling answer from {peer_id}...")
        # set remote peer description
        await self.pcs[peer_id].setRemoteDescription(
            RTCSessionDescription(sdp=answer["sdp"], type=answer["type"])
        )

    @modal.exit()
    async def _exit(self):
        print(f"{self.id}: Shutting down...")
        await self.exit()

        if self.pcs:
            print(f"{self.id}: Closing peer connections...")
            await asyncio.gather(*[pc.close() for pc in self.pcs.values()])
            self.pcs = {}

    async def exit(self):
        """Override with any custom logic when shutting down container."""


class ModalWebRtcSignalingServer:
    """
    WebRTC signaling server implementation that mediates connections between client peers
    and Modal-based WebRTC peers. Implement using the \`app.cls\` decorator.

    This server:
    - Provides a WebSocket endpoint (/ws/{peer_id}) for client connections
    - Spawns Modal-based peer instances for each client connection
    - Handles the WebRTC signaling process by relaying messages between clients and Modal peers
    - Manages the lifecycle of Modal peer instances

    To use this class:
    1. Create a subclass implementing get_modal_peer_class() to return your ModalWebRtcPeer implementation
    2. Optionally override initialize() for custom server setup
    3. Optionally add a frontend route to the \`web_app\` attribute
    """

    @modal.enter()
    def _initialize(self):
        self.web_app = FastAPI()

        # handle signaling through websocket endpoint
        @self.web_app.websocket("/ws/{peer_id}")
        async def ws(client_websocket: WebSocket, peer_id: str):
            try:
                await client_websocket.accept()
                print(f"Server: Accepted websocket connection from {peer_id}...")
                await self._mediate_negotiation(client_websocket, peer_id)
            except Exception as e:
                print(
                    f"Server: Error accepting websocket connection from {peer_id}: {type(e)}: {e}"
                )
                await client_websocket.close()

        self.initialize()

    def initialize(self):
        pass

    @abstractmethod
    def get_modal_peer_class(self) -> type[ModalWebRtcPeer]:
        """
        Abstract method to return the \`ModalWebRtcPeer\` implementation to use.
        """
        raise NotImplementedError(
            "Implement \`get_modal_peer\` to use \`ModalWebRtcSignalingServer\`"
        )

    @modal.asgi_app()
    def web(self):
        return self.web_app

    async def _mediate_negotiation(self, websocket: WebSocket, peer_id: str):
        modal_peer_class = self.get_modal_peer_class()
        if not any(
            base.__name__ == "ModalWebRtcPeer" for base in modal_peer_class.__bases__
        ):
            raise ValueError(
                "Modal peer class must be an implementation of \`ModalWebRtcPeer\`"
            )

        async with modal.Queue.ephemeral() as q:
            print(f"Server: Spawning modal peer instance for client peer {peer_id}...")
            modal_peer = modal_peer_class()
            await modal_peer.run.spawn.aio(q, peer_id)

            await asyncio.gather(
                relay_websocket_to_queue(websocket, q, peer_id),
                relay_queue_to_websocket(websocket, q, peer_id),
            )


async def relay_websocket_to_queue(websocket: WebSocket, q: modal.Queue, peer_id: str):
    while True:
        try:
            # get websocket message off queue and parse as json
            msg = await asyncio.wait_for(websocket.receive_text(), timeout=0.5)
            await q.put.aio(msg, partition=peer_id)
        except asyncio.TimeoutError:
            pass
        except Exception as e:
            if WebSocketState.DISCONNECTED in [
                websocket.application_state,
                websocket.client_state,
            ]:
                print("Server: Websocket connection closed")
                return
            else:
                print(f"Server: Error relaying from websocket to queue: {type(e)}: {e}")


async def relay_queue_to_websocket(websocket: WebSocket, q: modal.Queue, peer_id: str):
    while True:
        try:
            # get websocket message off queue and parse from json
            modal_peer_msg = await q.get.aio(partition="server", timeout=0.5)
            if modal_peer_msg.startswith("close"):
                print(
                    "Server: Close received on queue, closing websocket connection..."
                )
                await websocket.close()
                return

            await websocket.send_text(modal_peer_msg)
        except queue.Empty:
            pass
        except Exception as e:
            if WebSocketState.DISCONNECTED in [
                websocket.application_state,
                websocket.client_state,
            ]:
                print("Server: Websocket connection closed")
                return
            else:
                print(f"Server: Error relaying from queue to websocket: {type(e)}: {e}")

\`\`\`
`,meta:{}},{toc:a,rawContent:o,meta:s}=i;function c(a,o){let s=e(o,[`children`,`$$slots`,`$$events`,`$$legacy`]);r(a,t(()=>s,()=>i,{children:(e,t)=>{n(e,{code:`import%20asyncio%0Aimport%20json%0Aimport%20queue%0Afrom%20abc%20import%20ABC%2C%20abstractmethod%0Afrom%20typing%20import%20Optional%0A%0Aimport%20modal%0Afrom%20fastapi%20import%20FastAPI%2C%20WebSocket%0Afrom%20fastapi.websockets%20import%20WebSocketState%0A%0A%0Aclass%20ModalWebRtcPeer(ABC)%3A%0A%20%20%20%20%22%22%22%0A%20%20%20%20Base%20class%20for%20implementing%20WebRTC%20peer%20connections%20in%20Modal%20using%20aiortc.%0A%20%20%20%20Implement%20using%20the%20%60app.cls%60%20decorator.%0A%0A%20%20%20%20This%20class%20provides%20a%20complete%20WebRTC%20peer%20implementation%20that%20handles%3A%0A%20%20%20%20-%20Peer%20connection%20lifecycle%20management%20(creation%2C%20negotiation%2C%20cleanup)%0A%20%20%20%20-%20Signaling%20via%20Modal%20Queue%20for%20SDP%20offer%2Fanswer%20exchange%20and%20ICE%20candidate%20handling%0A%20%20%20%20-%20Automatic%20STUN%20server%20configuration%20(defaults%20to%20Google's%20STUN%20server)%0A%20%20%20%20-%20Stream%20setup%20and%20management%0A%0A%20%20%20%20Required%20methods%20to%20override%3A%0A%20%20%20%20-%20setup_streams()%3A%20Implementation%20for%20setting%20up%20media%20tracks%20and%20streams%0A%0A%20%20%20%20Optional%20methods%20to%20override%3A%0A%20%20%20%20-%20initialize()%3A%20Custom%20initialization%20logic%20when%20peer%20is%20created%0A%20%20%20%20-%20run_streams()%3A%20Implementation%20for%20stream%20runtime%20logic%0A%20%20%20%20-%20get_turn_servers()%3A%20Implementation%20to%20provide%20custom%20TURN%20server%20configuration%0A%20%20%20%20-%20exit()%3A%20Custom%20cleanup%20logic%20when%20peer%20is%20shutting%20down%0A%0A%20%20%20%20The%20peer%20connection%20is%20established%20through%20a%20ModalWebRtcSignalingServer%20that%20manages%0A%20%20%20%20the%20signaling%20process%20between%20this%20peer%20and%20client%20peers.%0A%20%20%20%20%22%22%22%0A%0A%20%20%20%20%40modal.enter()%0A%20%20%20%20async%20def%20_initialize(self)%3A%0A%20%20%20%20%20%20%20%20import%20shortuuid%0A%0A%20%20%20%20%20%20%20%20self.id%20%3D%20shortuuid.uuid()%0A%20%20%20%20%20%20%20%20self.pcs%20%3D%20%7B%7D%0A%20%20%20%20%20%20%20%20self.pending_candidates%20%3D%20%7B%7D%0A%0A%20%20%20%20%20%20%20%20%23%20call%20custom%20init%20logic%0A%20%20%20%20%20%20%20%20await%20self.initialize()%0A%0A%20%20%20%20async%20def%20initialize(self)%3A%0A%20%20%20%20%20%20%20%20%22%22%22Override%20to%20add%20custom%20logic%20when%20creating%20a%20peer%22%22%22%0A%0A%20%20%20%20%40abstractmethod%0A%20%20%20%20async%20def%20setup_streams(self%2C%20peer_id)%3A%0A%20%20%20%20%20%20%20%20%22%22%22Override%20to%20add%20custom%20logic%20when%20creating%20a%20connection%20and%20setting%20up%20streams%22%22%22%0A%20%20%20%20%20%20%20%20raise%20NotImplementedError%0A%0A%20%20%20%20async%20def%20run_streams(self%2C%20peer_id)%3A%0A%20%20%20%20%20%20%20%20%22%22%22Override%20to%20add%20custom%20logic%20when%20running%20streams%22%22%22%0A%0A%20%20%20%20async%20def%20get_turn_servers(self%2C%20peer_id%3DNone%2C%20msg%3DNone)%20-%3E%20Optional%5Blist%5D%3A%0A%20%20%20%20%20%20%20%20%22%22%22Override%20to%20customize%20TURN%20servers%22%22%22%0A%0A%20%20%20%20async%20def%20_setup_peer_connection(self%2C%20peer_id)%3A%0A%20%20%20%20%20%20%20%20%22%22%22Creates%20an%20RTC%20peer%20connection%20via%20an%20ICE%20server%22%22%22%0A%20%20%20%20%20%20%20%20from%20aiortc%20import%20RTCConfiguration%2C%20RTCIceServer%2C%20RTCPeerConnection%0A%0A%20%20%20%20%20%20%20%20%23%20aiortc%20automatically%20uses%20google's%20STUN%20server%2C%0A%20%20%20%20%20%20%20%20%23%20but%20we%20can%20also%20specify%20our%20own%0A%20%20%20%20%20%20%20%20config%20%3D%20RTCConfiguration(%0A%20%20%20%20%20%20%20%20%20%20%20%20iceServers%3D%5BRTCIceServer(urls%3D%22stun%3Astun.l.google.com%3A19302%22)%5D%0A%20%20%20%20%20%20%20%20)%0A%20%20%20%20%20%20%20%20self.pcs%5Bpeer_id%5D%20%3D%20RTCPeerConnection(configuration%3Dconfig)%0A%20%20%20%20%20%20%20%20self.pending_candidates%5Bpeer_id%5D%20%3D%20%5B%5D%0A%20%20%20%20%20%20%20%20await%20self.setup_streams(peer_id)%0A%0A%20%20%20%20%20%20%20%20print(%0A%20%20%20%20%20%20%20%20%20%20%20%20f%22%7Bself.id%7D%3A%20Created%20peer%20connection%20and%20setup%20streams%20from%20%7Bself.id%7D%20to%20%7Bpeer_id%7D%22%0A%20%20%20%20%20%20%20%20)%0A%0A%20%20%20%20%40modal.method()%0A%20%20%20%20async%20def%20run(self%2C%20q%3A%20modal.Queue%2C%20peer_id%3A%20str)%3A%0A%20%20%20%20%20%20%20%20%22%22%22Run%20the%20RTC%20peer%20after%20establishing%20a%20connection%20by%20passing%20WebSocket%20messages%20over%20a%20Queue.%22%22%22%0A%20%20%20%20%20%20%20%20print(f%22%7Bself.id%7D%3A%20Running%20modal%20peer%20instance%20for%20client%20peer%3A%20%7Bpeer_id%7D...%22)%0A%0A%20%20%20%20%20%20%20%20await%20self._connect_over_queue(q%2C%20peer_id)%0A%20%20%20%20%20%20%20%20await%20self._run_streams(peer_id)%0A%0A%20%20%20%20async%20def%20_connect_over_queue(self%2C%20q%2C%20peer_id)%3A%0A%20%20%20%20%20%20%20%20%22%22%22Connect%20this%20peer%20to%20another%20by%20passing%20messages%20along%20a%20Modal%20Queue.%22%22%22%0A%0A%20%20%20%20%20%20%20%20msg_handlers%20%3D%20%7B%20%20%23%20message%20types%20we%20need%20to%20handle%0A%20%20%20%20%20%20%20%20%20%20%20%20%22offer%22%3A%20self.handle_offer%2C%20%20%23%20SDP%20offer%0A%20%20%20%20%20%20%20%20%20%20%20%20%22ice_candidate%22%3A%20self.handle_ice_candidate%2C%20%20%23%20trickled%20ICE%20candidate%0A%20%20%20%20%20%20%20%20%20%20%20%20%22identify%22%3A%20self.get_identity%2C%20%20%23%20identify%20challenge%0A%20%20%20%20%20%20%20%20%20%20%20%20%22get_turn_servers%22%3A%20self.get_turn_servers%2C%20%20%23%20TURN%20server%20request%0A%20%20%20%20%20%20%20%20%7D%0A%0A%20%20%20%20%20%20%20%20while%20True%3A%0A%20%20%20%20%20%20%20%20%20%20%20%20try%3A%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20if%20self.pcs.get(peer_id)%20and%20(%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20self.pcs%5Bpeer_id%5D.connectionState%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20in%20%5B%22connected%22%2C%20%22closed%22%2C%20%22failed%22%5D%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20)%3A%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20print(f%22%7Bself.id%7D%3A%20Closing%20connection%20to%20%7Bpeer_id%7D%20over%20queue...%22)%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20await%20q.put.aio(%22close%22%2C%20partition%3D%22server%22)%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20break%0A%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%23%20read%20and%20parse%20websocket%20message%20passed%20over%20queue%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20msg%20%3D%20json.loads(await%20q.get.aio(partition%3Dpeer_id%2C%20timeout%3D0.5))%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%23%20dispatch%20the%20message%20to%20its%20handler%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20if%20handler%20%3A%3D%20msg_handlers.get(msg.get(%22type%22))%3A%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20response%20%3D%20await%20handler(peer_id%2C%20msg)%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20else%3A%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20print(f%22%7Bself.id%7D%3A%20Unknown%20message%20type%3A%20%7Bmsg.get('type')%7D%22)%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20response%20%3D%20None%0A%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%23%20pass%20the%20message%20back%20over%20the%20queue%20to%20the%20server%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20if%20response%20is%20not%20None%3A%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20await%20q.put.aio(json.dumps(response)%2C%20partition%3D%22server%22)%0A%20%20%20%20%20%20%20%20%20%20%20%20except%20queue.Empty%3A%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20print(f%22%7Bself.id%7D%3A%20Queue%20empty%2C%20waiting%20for%20message...%22)%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20pass%0A%20%20%20%20%20%20%20%20%20%20%20%20except%20Exception%20as%20e%3A%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20print(%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20f%22%7Bself.id%7D%3A%20Error%20handling%20message%20from%20%7Bpeer_id%7D%3A%20%7Btype(e)%7D%3A%20%7Be%7D%22%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20)%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20continue%0A%0A%20%20%20%20async%20def%20_run_streams(self%2C%20peer_id)%3A%0A%20%20%20%20%20%20%20%20%22%22%22Run%20WebRTC%20streaming%20with%20a%20peer.%22%22%22%0A%20%20%20%20%20%20%20%20print(f%22%7Bself.id%7D%3A%20%20running%20streams%20to%20%7Bpeer_id%7D...%22)%0A%0A%20%20%20%20%20%20%20%20await%20self.run_streams(peer_id)%0A%0A%20%20%20%20%20%20%20%20%23%20run%20until%20connection%20is%20closed%20or%20broken%0A%20%20%20%20%20%20%20%20while%20self.pcs%5Bpeer_id%5D.connectionState%20%3D%3D%20%22connected%22%3A%0A%20%20%20%20%20%20%20%20%20%20%20%20await%20asyncio.sleep(0.1)%0A%0A%20%20%20%20%20%20%20%20print(f%22%7Bself.id%7D%3A%20%20ending%20streaming%20to%20%7Bpeer_id%7D%22)%0A%0A%20%20%20%20async%20def%20handle_offer(self%2C%20peer_id%2C%20msg)%3A%0A%20%20%20%20%20%20%20%20%22%22%22Handles%20a%20peers%20SDP%20offer%20message%20by%20producing%20an%20SDP%20answer.%22%22%22%0A%20%20%20%20%20%20%20%20from%20aiortc%20import%20RTCSessionDescription%0A%0A%20%20%20%20%20%20%20%20print(f%22%7Bself.id%7D%3A%20%20handling%20SDP%20offer%20from%20%7Bpeer_id%7D...%22)%0A%0A%20%20%20%20%20%20%20%20await%20self._setup_peer_connection(peer_id)%0A%20%20%20%20%20%20%20%20await%20self.pcs%5Bpeer_id%5D.setRemoteDescription(%0A%20%20%20%20%20%20%20%20%20%20%20%20RTCSessionDescription(msg%5B%22sdp%22%5D%2C%20msg%5B%22type%22%5D)%0A%20%20%20%20%20%20%20%20)%0A%20%20%20%20%20%20%20%20answer%20%3D%20await%20self.pcs%5Bpeer_id%5D.createAnswer()%0A%20%20%20%20%20%20%20%20await%20self.pcs%5Bpeer_id%5D.setLocalDescription(answer)%0A%20%20%20%20%20%20%20%20sdp%20%3D%20self.pcs%5Bpeer_id%5D.localDescription.sdp%0A%0A%20%20%20%20%20%20%20%20return%20%7B%22sdp%22%3A%20sdp%2C%20%22type%22%3A%20answer.type%2C%20%22peer_id%22%3A%20self.id%7D%0A%0A%20%20%20%20async%20def%20handle_ice_candidate(self%2C%20peer_id%2C%20msg)%3A%0A%20%20%20%20%20%20%20%20%22%22%22Add%20an%20ICE%20candidate%20sent%20by%20a%20peer.%22%22%22%0A%20%20%20%20%20%20%20%20from%20aiortc%20import%20RTCIceCandidate%0A%20%20%20%20%20%20%20%20from%20aiortc.sdp%20import%20candidate_from_sdp%0A%0A%20%20%20%20%20%20%20%20candidate%20%3D%20msg.get(%22candidate%22)%0A%0A%20%20%20%20%20%20%20%20if%20not%20candidate%3A%0A%20%20%20%20%20%20%20%20%20%20%20%20raise%20ValueError%0A%0A%20%20%20%20%20%20%20%20print(%0A%20%20%20%20%20%20%20%20%20%20%20%20f%22%7Bself.id%7D%3A%20%20received%20ice%20candidate%20from%20%7Bpeer_id%7D%3A%20%7Bcandidate%5B'candidate_sdp'%5D%7D...%22%0A%20%20%20%20%20%20%20%20)%0A%0A%20%20%20%20%20%20%20%20%23%20parse%20ice%20candidate%0A%20%20%20%20%20%20%20%20ice_candidate%3A%20RTCIceCandidate%20%3D%20candidate_from_sdp(candidate%5B%22candidate_sdp%22%5D)%0A%20%20%20%20%20%20%20%20ice_candidate.sdpMid%20%3D%20candidate%5B%22sdpMid%22%5D%0A%20%20%20%20%20%20%20%20ice_candidate.sdpMLineIndex%20%3D%20candidate%5B%22sdpMLineIndex%22%5D%0A%0A%20%20%20%20%20%20%20%20if%20not%20self.pcs.get(peer_id)%3A%0A%20%20%20%20%20%20%20%20%20%20%20%20self.pending_candidates%5Bpeer_id%5D.append(ice_candidate)%0A%20%20%20%20%20%20%20%20else%3A%0A%20%20%20%20%20%20%20%20%20%20%20%20if%20len(self.pending_candidates%5Bpeer_id%5D)%20%3E%200%3A%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%5B%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20await%20self.pcs%5Bpeer_id%5D.addIceCandidate(c)%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20for%20c%20in%20self.pending_candidates%5Bpeer_id%5D%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%5D%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20self.pending_candidates%5Bpeer_id%5D%20%3D%20%5B%5D%0A%20%20%20%20%20%20%20%20%20%20%20%20await%20self.pcs%5Bpeer_id%5D.addIceCandidate(ice_candidate)%0A%0A%20%20%20%20async%20def%20get_identity(self%2C%20peer_id%3DNone%2C%20msg%3DNone)%3A%0A%20%20%20%20%20%20%20%20%22%22%22Reply%20to%20an%20identify%20message%20with%20own%20id.%22%22%22%0A%20%20%20%20%20%20%20%20return%20%7B%22type%22%3A%20%22identify%22%2C%20%22peer_id%22%3A%20self.id%7D%0A%0A%20%20%20%20async%20def%20generate_offer(self%2C%20peer_id)%3A%0A%20%20%20%20%20%20%20%20print(f%22%7Bself.id%7D%3A%20%20generating%20offer%20for%20%7Bpeer_id%7D...%22)%0A%0A%20%20%20%20%20%20%20%20await%20self._setup_peer_connection(peer_id)%0A%20%20%20%20%20%20%20%20offer%20%3D%20await%20self.pcs%5Bpeer_id%5D.createOffer()%0A%20%20%20%20%20%20%20%20await%20self.pcs%5Bpeer_id%5D.setLocalDescription(offer)%0A%20%20%20%20%20%20%20%20sdp%20%3D%20self.pcs%5Bpeer_id%5D.localDescription.sdp%0A%0A%20%20%20%20%20%20%20%20return%20%7B%22sdp%22%3A%20sdp%2C%20%22type%22%3A%20offer.type%2C%20%22peer_id%22%3A%20self.id%7D%0A%0A%20%20%20%20async%20def%20handle_answer(self%2C%20peer_id%2C%20answer)%3A%0A%20%20%20%20%20%20%20%20from%20aiortc%20import%20RTCSessionDescription%0A%0A%20%20%20%20%20%20%20%20print(f%22%7Bself.id%7D%3A%20%20handling%20answer%20from%20%7Bpeer_id%7D...%22)%0A%20%20%20%20%20%20%20%20%23%20set%20remote%20peer%20description%0A%20%20%20%20%20%20%20%20await%20self.pcs%5Bpeer_id%5D.setRemoteDescription(%0A%20%20%20%20%20%20%20%20%20%20%20%20RTCSessionDescription(sdp%3Danswer%5B%22sdp%22%5D%2C%20type%3Danswer%5B%22type%22%5D)%0A%20%20%20%20%20%20%20%20)%0A%0A%20%20%20%20%40modal.exit()%0A%20%20%20%20async%20def%20_exit(self)%3A%0A%20%20%20%20%20%20%20%20print(f%22%7Bself.id%7D%3A%20Shutting%20down...%22)%0A%20%20%20%20%20%20%20%20await%20self.exit()%0A%0A%20%20%20%20%20%20%20%20if%20self.pcs%3A%0A%20%20%20%20%20%20%20%20%20%20%20%20print(f%22%7Bself.id%7D%3A%20Closing%20peer%20connections...%22)%0A%20%20%20%20%20%20%20%20%20%20%20%20await%20asyncio.gather(*%5Bpc.close()%20for%20pc%20in%20self.pcs.values()%5D)%0A%20%20%20%20%20%20%20%20%20%20%20%20self.pcs%20%3D%20%7B%7D%0A%0A%20%20%20%20async%20def%20exit(self)%3A%0A%20%20%20%20%20%20%20%20%22%22%22Override%20with%20any%20custom%20logic%20when%20shutting%20down%20container.%22%22%22%0A%0A%0Aclass%20ModalWebRtcSignalingServer%3A%0A%20%20%20%20%22%22%22%0A%20%20%20%20WebRTC%20signaling%20server%20implementation%20that%20mediates%20connections%20between%20client%20peers%0A%20%20%20%20and%20Modal-based%20WebRTC%20peers.%20Implement%20using%20the%20%60app.cls%60%20decorator.%0A%0A%20%20%20%20This%20server%3A%0A%20%20%20%20-%20Provides%20a%20WebSocket%20endpoint%20(%2Fws%2F%7Bpeer_id%7D)%20for%20client%20connections%0A%20%20%20%20-%20Spawns%20Modal-based%20peer%20instances%20for%20each%20client%20connection%0A%20%20%20%20-%20Handles%20the%20WebRTC%20signaling%20process%20by%20relaying%20messages%20between%20clients%20and%20Modal%20peers%0A%20%20%20%20-%20Manages%20the%20lifecycle%20of%20Modal%20peer%20instances%0A%0A%20%20%20%20To%20use%20this%20class%3A%0A%20%20%20%201.%20Create%20a%20subclass%20implementing%20get_modal_peer_class()%20to%20return%20your%20ModalWebRtcPeer%20implementation%0A%20%20%20%202.%20Optionally%20override%20initialize()%20for%20custom%20server%20setup%0A%20%20%20%203.%20Optionally%20add%20a%20frontend%20route%20to%20the%20%60web_app%60%20attribute%0A%20%20%20%20%22%22%22%0A%0A%20%20%20%20%40modal.enter()%0A%20%20%20%20def%20_initialize(self)%3A%0A%20%20%20%20%20%20%20%20self.web_app%20%3D%20FastAPI()%0A%0A%20%20%20%20%20%20%20%20%23%20handle%20signaling%20through%20websocket%20endpoint%0A%20%20%20%20%20%20%20%20%40self.web_app.websocket(%22%2Fws%2F%7Bpeer_id%7D%22)%0A%20%20%20%20%20%20%20%20async%20def%20ws(client_websocket%3A%20WebSocket%2C%20peer_id%3A%20str)%3A%0A%20%20%20%20%20%20%20%20%20%20%20%20try%3A%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20await%20client_websocket.accept()%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20print(f%22Server%3A%20Accepted%20websocket%20connection%20from%20%7Bpeer_id%7D...%22)%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20await%20self._mediate_negotiation(client_websocket%2C%20peer_id)%0A%20%20%20%20%20%20%20%20%20%20%20%20except%20Exception%20as%20e%3A%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20print(%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20f%22Server%3A%20Error%20accepting%20websocket%20connection%20from%20%7Bpeer_id%7D%3A%20%7Btype(e)%7D%3A%20%7Be%7D%22%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20)%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20await%20client_websocket.close()%0A%0A%20%20%20%20%20%20%20%20self.initialize()%0A%0A%20%20%20%20def%20initialize(self)%3A%0A%20%20%20%20%20%20%20%20pass%0A%0A%20%20%20%20%40abstractmethod%0A%20%20%20%20def%20get_modal_peer_class(self)%20-%3E%20type%5BModalWebRtcPeer%5D%3A%0A%20%20%20%20%20%20%20%20%22%22%22%0A%20%20%20%20%20%20%20%20Abstract%20method%20to%20return%20the%20%60ModalWebRtcPeer%60%20implementation%20to%20use.%0A%20%20%20%20%20%20%20%20%22%22%22%0A%20%20%20%20%20%20%20%20raise%20NotImplementedError(%0A%20%20%20%20%20%20%20%20%20%20%20%20%22Implement%20%60get_modal_peer%60%20to%20use%20%60ModalWebRtcSignalingServer%60%22%0A%20%20%20%20%20%20%20%20)%0A%0A%20%20%20%20%40modal.asgi_app()%0A%20%20%20%20def%20web(self)%3A%0A%20%20%20%20%20%20%20%20return%20self.web_app%0A%0A%20%20%20%20async%20def%20_mediate_negotiation(self%2C%20websocket%3A%20WebSocket%2C%20peer_id%3A%20str)%3A%0A%20%20%20%20%20%20%20%20modal_peer_class%20%3D%20self.get_modal_peer_class()%0A%20%20%20%20%20%20%20%20if%20not%20any(%0A%20%20%20%20%20%20%20%20%20%20%20%20base.__name__%20%3D%3D%20%22ModalWebRtcPeer%22%20for%20base%20in%20modal_peer_class.__bases__%0A%20%20%20%20%20%20%20%20)%3A%0A%20%20%20%20%20%20%20%20%20%20%20%20raise%20ValueError(%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%22Modal%20peer%20class%20must%20be%20an%20implementation%20of%20%60ModalWebRtcPeer%60%22%0A%20%20%20%20%20%20%20%20%20%20%20%20)%0A%0A%20%20%20%20%20%20%20%20async%20with%20modal.Queue.ephemeral()%20as%20q%3A%0A%20%20%20%20%20%20%20%20%20%20%20%20print(f%22Server%3A%20Spawning%20modal%20peer%20instance%20for%20client%20peer%20%7Bpeer_id%7D...%22)%0A%20%20%20%20%20%20%20%20%20%20%20%20modal_peer%20%3D%20modal_peer_class()%0A%20%20%20%20%20%20%20%20%20%20%20%20await%20modal_peer.run.spawn.aio(q%2C%20peer_id)%0A%0A%20%20%20%20%20%20%20%20%20%20%20%20await%20asyncio.gather(%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20relay_websocket_to_queue(websocket%2C%20q%2C%20peer_id)%2C%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20relay_queue_to_websocket(websocket%2C%20q%2C%20peer_id)%2C%0A%20%20%20%20%20%20%20%20%20%20%20%20)%0A%0A%0Aasync%20def%20relay_websocket_to_queue(websocket%3A%20WebSocket%2C%20q%3A%20modal.Queue%2C%20peer_id%3A%20str)%3A%0A%20%20%20%20while%20True%3A%0A%20%20%20%20%20%20%20%20try%3A%0A%20%20%20%20%20%20%20%20%20%20%20%20%23%20get%20websocket%20message%20off%20queue%20and%20parse%20as%20json%0A%20%20%20%20%20%20%20%20%20%20%20%20msg%20%3D%20await%20asyncio.wait_for(websocket.receive_text()%2C%20timeout%3D0.5)%0A%20%20%20%20%20%20%20%20%20%20%20%20await%20q.put.aio(msg%2C%20partition%3Dpeer_id)%0A%20%20%20%20%20%20%20%20except%20asyncio.TimeoutError%3A%0A%20%20%20%20%20%20%20%20%20%20%20%20pass%0A%20%20%20%20%20%20%20%20except%20Exception%20as%20e%3A%0A%20%20%20%20%20%20%20%20%20%20%20%20if%20WebSocketState.DISCONNECTED%20in%20%5B%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20websocket.application_state%2C%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20websocket.client_state%2C%0A%20%20%20%20%20%20%20%20%20%20%20%20%5D%3A%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20print(%22Server%3A%20Websocket%20connection%20closed%22)%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20return%0A%20%20%20%20%20%20%20%20%20%20%20%20else%3A%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20print(f%22Server%3A%20Error%20relaying%20from%20websocket%20to%20queue%3A%20%7Btype(e)%7D%3A%20%7Be%7D%22)%0A%0A%0Aasync%20def%20relay_queue_to_websocket(websocket%3A%20WebSocket%2C%20q%3A%20modal.Queue%2C%20peer_id%3A%20str)%3A%0A%20%20%20%20while%20True%3A%0A%20%20%20%20%20%20%20%20try%3A%0A%20%20%20%20%20%20%20%20%20%20%20%20%23%20get%20websocket%20message%20off%20queue%20and%20parse%20from%20json%0A%20%20%20%20%20%20%20%20%20%20%20%20modal_peer_msg%20%3D%20await%20q.get.aio(partition%3D%22server%22%2C%20timeout%3D0.5)%0A%20%20%20%20%20%20%20%20%20%20%20%20if%20modal_peer_msg.startswith(%22close%22)%3A%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20print(%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%22Server%3A%20Close%20received%20on%20queue%2C%20closing%20websocket%20connection...%22%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20)%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20await%20websocket.close()%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20return%0A%0A%20%20%20%20%20%20%20%20%20%20%20%20await%20websocket.send_text(modal_peer_msg)%0A%20%20%20%20%20%20%20%20except%20queue.Empty%3A%0A%20%20%20%20%20%20%20%20%20%20%20%20pass%0A%20%20%20%20%20%20%20%20except%20Exception%20as%20e%3A%0A%20%20%20%20%20%20%20%20%20%20%20%20if%20WebSocketState.DISCONNECTED%20in%20%5B%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20websocket.application_state%2C%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20websocket.client_state%2C%0A%20%20%20%20%20%20%20%20%20%20%20%20%5D%3A%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20print(%22Server%3A%20Websocket%20connection%20closed%22)%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20return%0A%20%20%20%20%20%20%20%20%20%20%20%20else%3A%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20print(f%22Server%3A%20Error%20relaying%20from%20queue%20to%20websocket%3A%20%7Btype(e)%7D%3A%20%7Be%7D%22)%0A`,lang:`python`})},$$slots:{default:!0}}))}export{c as default,i as metadata};
//# sourceMappingURL=CO9FqV-3.js.map
