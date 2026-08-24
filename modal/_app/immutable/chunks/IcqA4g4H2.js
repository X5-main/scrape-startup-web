(function(){try{var e=typeof window<`u`?window:typeof global<`u`?global:typeof globalThis<`u`?globalThis:typeof self<`u`?self:{};e.SENTRY_RELEASE={id:`f99fcf9f0a844cc9bd13fdc8e5782b84`};var t=new e.Error().stack;t&&(e._sentryDebugIds=e._sentryDebugIds||{},e._sentryDebugIds[t]=`c0172365-a4da-4391-b0a5-399624793347`,e._sentryDebugIdIdentifier=`sentry-dbid-c0172365-a4da-4391-b0a5-399624793347`)}catch{}})();import{$t as e,St as t,Tn as n,Tt as r,bt as i,c as a,d as o,en as s,tn as c,wn as l}from"./F_ixKBiO.js";import"./B1sc9Zdx.js";import"./Bb2deiU3.js";import{t as u}from"./BILrvr3I.js";import{t as d}from"./B4L_if842.js";import{t as f}from"./DeWGVqas2.js";var p={toc:[],rawContent:`modified from:
https://github.com/NVIDIA-NeMo/NeMo/blob/main/nemo/agents/voice_agent/pipecat/services/nemo/streaming_diar.py

\`\`\`python
import math
from dataclasses import dataclass
from typing import Tuple

import nemo.collections.asr as nemo_asr
import numpy as np
import torch
from nemo.collections.asr.models import SortformerEncLabelModel
from nemo.collections.asr.modules.sortformer_modules import StreamingSortformerState
from omegaconf import DictConfig
from torch import Tensor

LOG_MEL_ZERO = -16.635


class AudioBufferer:
    def __init__(self, sample_rate: int, buffer_size_in_secs: float):
        self.buffer_size = int(buffer_size_in_secs * sample_rate)
        self.sample_buffer = torch.zeros(self.buffer_size, dtype=torch.float32)

    def reset(self) -> None:
        """
        Reset the buffer to zero
        """
        self.sample_buffer.zero_()

    def update(self, audio: np.ndarray) -> None:
        """
        Update the buffer with the new frame
        Args:
            frame (Frame): frame to update the buffer with
        """
        if not isinstance(audio, torch.Tensor):
            audio = torch.from_numpy(audio)

        audio_size = audio.shape[0]
        if audio_size > self.buffer_size:
            raise ValueError(
                f"Frame size ({audio_size}) exceeds buffer size ({self.buffer_size})"
            )

        shift = audio_size
        self.sample_buffer[:-shift] = self.sample_buffer[shift:].clone()
        self.sample_buffer[-shift:] = audio.clone()

    def get_buffer(self) -> torch.Tensor:
        """
        Get the current buffer
        Returns:
            torch.Tensor: current state of the buffer
        """
        return self.sample_buffer.clone()

    def is_buffer_empty(self) -> bool:
        """
        Check if the buffer is empty
        Returns:
            bool: True if the buffer is empty, False otherwise
        """
        return self.sample_buffer.sum() == 0


class CacheFeatureBufferer:
    def __init__(
        self,
        sample_rate: int,
        buffer_size_in_secs: float,
        chunk_size_in_secs: float,
        preprocessor_cfg: DictConfig,
        device: torch.device,
        fill_value: float = LOG_MEL_ZERO,
    ):
        if buffer_size_in_secs < chunk_size_in_secs:
            raise ValueError(
                f"Buffer size ({buffer_size_in_secs}s) should be no less than chunk size ({chunk_size_in_secs}s)"
            )

        self.sample_rate = sample_rate
        self.buffer_size_in_secs = buffer_size_in_secs
        self.chunk_size_in_secs = chunk_size_in_secs
        self.device = device

        if hasattr(preprocessor_cfg, "log") and preprocessor_cfg.log:
            self.ZERO_LEVEL_SPEC_DB_VAL = (
                LOG_MEL_ZERO  # Log-Mel spectrogram value for zero signals
            )
        else:
            self.ZERO_LEVEL_SPEC_DB_VAL = fill_value

        self.n_feat = preprocessor_cfg.features
        self.timestep_duration = preprocessor_cfg.window_stride
        self.n_chunk_look_back = int(self.timestep_duration * self.sample_rate)
        self.chunk_size = int(self.chunk_size_in_secs * self.sample_rate)
        self.sample_buffer = AudioBufferer(sample_rate, buffer_size_in_secs)

        self.feature_buffer_len = int(buffer_size_in_secs / self.timestep_duration)
        self.feature_chunk_len = int(chunk_size_in_secs / self.timestep_duration)
        self.feature_buffer = torch.full(
            [self.n_feat, self.feature_buffer_len],
            self.ZERO_LEVEL_SPEC_DB_VAL,
            dtype=torch.float32,
            device=self.device,
        )

        self.preprocessor = nemo_asr.models.ASRModel.from_config_dict(preprocessor_cfg)
        self.preprocessor.to(self.device)

    def is_buffer_empty(self) -> bool:
        """
        Check if the buffer is empty
        Returns:
            bool: True if the buffer is empty, False otherwise
        """
        return self.sample_buffer.is_buffer_empty()

    def reset(self) -> None:
        """
        Reset the buffer to zero
        """
        self.sample_buffer.reset()
        self.feature_buffer.fill_(self.ZERO_LEVEL_SPEC_DB_VAL)

    def _update_feature_buffer(self, feat_chunk: torch.Tensor) -> None:
        """
        Add an extracted feature to \`feature_buffer\`
        """
        self.feature_buffer[:, : -self.feature_chunk_len] = self.feature_buffer[
            :, self.feature_chunk_len :
        ].clone()
        self.feature_buffer[:, -self.feature_chunk_len :] = feat_chunk.clone()

    def preprocess(self, audio_signal: torch.Tensor) -> torch.Tensor:
        """
        Preprocess the audio signal using the preprocessor
        Args:
            audio_signal (torch.Tensor): audio signal
        Returns:
            torch.Tensor: preprocessed features
        """
        audio_signal = audio_signal.unsqueeze_(0).to(self.device)
        audio_signal_len = torch.tensor([audio_signal.shape[1]], device=self.device)
        features, _ = self.preprocessor(
            input_signal=audio_signal,
            length=audio_signal_len,
        )
        features = features.squeeze()
        return features

    def update(self, audio: np.ndarray) -> None:
        """
        Update the sample anf feature buffers with the new frame
        Args:
            frame (Frame): frame to update the buffer with
        """

        # Update the sample buffer with the new frame
        self.sample_buffer.update(audio)

        if math.isclose(self.buffer_size_in_secs, self.chunk_size_in_secs):
            # If the buffer size is equal to the chunk size, just take the whole buffer
            samples = self.sample_buffer.sample_buffer.clone()
        else:
            # Add look_back to have context for the first feature
            samples = self.sample_buffer.sample_buffer[
                -(self.n_chunk_look_back + self.chunk_size) :
            ]

        # Get the mel spectrogram
        features = self.preprocess(samples)

        # If the features are longer than supposed to be, drop the last frames
        # Drop the last diff frames because they might be incomplete
        if (diff := features.shape[1] - self.feature_chunk_len - 1) > 0:
            features = features[:, :-diff]

        # Update the feature buffer with the new features
        self._update_feature_buffer(features[:, -self.feature_chunk_len :])

    def get_buffer(self) -> torch.Tensor:
        """
        Get the current sample buffer
        Returns:
            torch.Tensor: current state of the buffer
        """
        return self.sample_buffer.get_buffer()

    def get_feature_buffer(self) -> torch.Tensor:
        """
        Get the current feature buffer
        Returns:
            torch.Tensor: current state of the feature buffer
        """
        return self.feature_buffer.clone()


@dataclass
class DiarizationConfig:
    """Diarization configuration parameters for inference."""

    model_path: str = "nvidia/diar_streaming_sortformer_4spk-v2"
    device: str = "cuda"

    log: bool = False  # If True, log will be printed
    max_num_speakers: int = 4
    spkcache_len: int = 188
    spkcache_refresh_rate: int = 144
    fifo_len: int = 188
    chunk_len: int = 6
    chunk_left_context: int = 1
    chunk_right_context: int = 7


class NeMoStreamingDiarizer:
    def __init__(
        self,
        cfg: DiarizationConfig,
        model: str,
        frame_len_in_secs: float = 0.08,
        sample_rate: int = 16000,
        left_offset: int = 8,
        right_offset: int = 8,
        use_amp: bool = False,
        compute_dtype: torch.dtype = torch.float32,
    ):
        self.model = model
        self.cfg = cfg
        self.cfg.model_path = model
        self.diarizer = self.build_diarizer()
        self.device = cfg.device
        self.use_amp = use_amp
        self.compute_dtype = compute_dtype
        self.frame_len_in_secs = frame_len_in_secs
        self.left_offset = left_offset
        self.right_offset = right_offset
        self.chunk_size = self.cfg.chunk_len
        self.buffer_size_in_secs = (
            self.cfg.chunk_len * self.frame_len_in_secs
            + (self.left_offset + self.right_offset) * 0.01
        )
        self.max_num_speakers = self.cfg.max_num_speakers

        self.feature_bufferer = CacheFeatureBufferer(
            sample_rate=sample_rate,
            buffer_size_in_secs=self.buffer_size_in_secs,
            chunk_size_in_secs=self.cfg.chunk_len * self.frame_len_in_secs,
            preprocessor_cfg=self.diarizer.cfg.preprocessor,
            device=self.device,
        )
        self.streaming_state = self.init_streaming_state(batch_size=1)
        self.total_preds = torch.zeros(
            (1, 0, self.max_num_speakers), device=self.diarizer.device
        )

        print(
            f"NeMoStreamingDiarService initialized with model \`{model}\` on device \`{self.device}\`"
        )

    def build_diarizer(self):
        if self.cfg.model_path.endswith(".nemo"):
            diar_model = SortformerEncLabelModel.restore_from(
                self.cfg.model_path, map_location=self.cfg.device
            )
        else:
            diar_model = SortformerEncLabelModel.from_pretrained(
                self.cfg.model_path, map_location=self.cfg.device
            )

        # Steaming mode setup
        diar_model.sortformer_modules.chunk_len = self.cfg.chunk_len
        diar_model.sortformer_modules.spkcache_len = self.cfg.spkcache_len
        diar_model.sortformer_modules.chunk_left_context = self.cfg.chunk_left_context
        diar_model.sortformer_modules.chunk_right_context = self.cfg.chunk_right_context
        diar_model.sortformer_modules.fifo_len = self.cfg.fifo_len
        diar_model.sortformer_modules.log = self.cfg.log
        diar_model.sortformer_modules.spkcache_refresh_rate = (
            self.cfg.spkcache_refresh_rate
        )
        diar_model.eval()

        return diar_model

    def print_diar_result(self, diar_result: np.ndarray):
        full_result = []
        for t in range(diar_result.shape[0]):
            spk_probs = ""
            for s in range(diar_result.shape[1]):
                spk_probs += f"{diar_result[t, s]:.2f} "
            full_result.append(f"Time {t}: {spk_probs}")
        print(full_result)
        return full_result

    def diarize(self, audio: bytes, stream_id: str = "default"):
        audio_array = np.frombuffer(audio, dtype=np.int16).astype(np.float32) / 32768.0

        self.feature_bufferer.update(audio_array)

        features = self.feature_bufferer.get_feature_buffer()
        feature_buffers = features.unsqueeze(0)  # add batch dimension
        feature_buffers = feature_buffers.transpose(
            1, 2
        )  # [batch, feature, time] -> [batch, time, feature]
        feature_buffer_lens = torch.tensor(
            [feature_buffers.shape[1]], device=self.device
        )
        self.streaming_state, chunk_preds = self.stream_step(
            processed_signal=feature_buffers,
            processed_signal_length=feature_buffer_lens,
            streaming_state=self.streaming_state,
            total_preds=self.total_preds,
            left_offset=self.left_offset,
            right_offset=self.right_offset,
        )
        self.total_preds = chunk_preds
        diar_result = chunk_preds[:, -self.chunk_size :, :].clone().cpu().numpy()
        return diar_result[0]  # tensor of shape [6, 4]

    def reset_state(self, stream_id: str = "default"):
        self.feature_bufferer.reset()
        self.streaming_state = self.init_streaming_state(batch_size=1)
        self.total_preds = torch.zeros(
            (1, 0, self.max_num_speakers), device=self.diarizer.device
        )

    def init_streaming_state(self, batch_size: int = 1) -> StreamingSortformerState:
        """
        Initialize the streaming state for the diarization model.

        Args:
            batch_size: The batch size to use.

        Returns:
            SortformerStreamingState: The initialized streaming state.
        """
        # Use the model's init_streaming_state method but convert to SortformerStreamingState format
        nemo_state = self.diarizer.sortformer_modules.init_streaming_state(
            batch_size=batch_size,
            async_streaming=self.diarizer.async_streaming,
            device=self.device,
        )

        return nemo_state

    def stream_step(
        self,
        processed_signal: Tensor,
        processed_signal_length: Tensor,
        streaming_state: StreamingSortformerState,
        total_preds: Tensor,
        left_offset: int = 0,
        right_offset: int = 0,
    ) -> Tuple[StreamingSortformerState, Tensor]:
        """
        Execute a single streaming step for diarization.

        Args:
            processed_signal: The processed audio signal.
            processed_signal_length: The length of the processed signal.
            streaming_state: The current streaming state.
            total_preds: The total predictions so far.
            left_offset: The left offset for the current chunk.
            right_offset: The right offset for the current chunk.

        Returns:
            Tuple[SortformerStreamingState, Tensor]: The updated streaming state and predictions.
        """
        # Move tensors to correct device
        if processed_signal.device != self.device:
            processed_signal = processed_signal.to(self.device)

        if processed_signal_length.device != self.device:
            processed_signal_length = processed_signal_length.to(self.device)

        if total_preds is not None and total_preds.device != self.device:
            total_preds = total_preds.to(self.device)

        with (
            torch.amp.autocast(
                device_type=self.device, dtype=self.compute_dtype, enabled=self.use_amp
            ),
            torch.inference_mode(),
            torch.no_grad(),
        ):
            try:
                # Call the model's forward_streaming_step method
                streaming_state, diar_pred_out_stream = (
                    self.diarizer.forward_streaming_step(
                        processed_signal=processed_signal,
                        processed_signal_length=processed_signal_length,
                        streaming_state=streaming_state,
                        total_preds=total_preds,
                        left_offset=left_offset,
                        right_offset=right_offset,
                    )
                )
            except Exception as e:
                print(f"Error in diarizer streaming step: {e}")
                # print the stack trace
                import traceback

                traceback.print_exc()
                # Return the existing state and preds if there's an error
                return streaming_state, total_preds

        return streaming_state, diar_pred_out_stream

\`\`\`
`,meta:{description:`modified from: https://github.com/NVIDIA-NeMo/NeMo/blob/main/nemo/agents/voice_agent/pipecat/services/nemo/streaming_diar.py`}},{toc:m,rawContent:h,meta:g}=p,_=t(`<p>modified from: <!></p> <!>`,1);function v(t,m){let h=a(m,[`children`,`$$slots`,`$$events`,`$$legacy`]);d(t,o(()=>h,()=>p,{children:(t,a)=>{var o=_(),d=s(o);f(c(e(d)),{href:`https://github.com/NVIDIA-NeMo/NeMo/blob/main/nemo/agents/voice_agent/pipecat/services/nemo/streaming_diar.py`,rel:`nofollow`,children:(e,t)=>{l(),i(e,r(`https://github.com/NVIDIA-NeMo/NeMo/blob/main/nemo/agents/voice_agent/pipecat/services/nemo/streaming_diar.py`))},$$slots:{default:!0}}),n(d),u(c(d,2),{code:`import%20math%0Afrom%20dataclasses%20import%20dataclass%0Afrom%20typing%20import%20Tuple%0A%0Aimport%20nemo.collections.asr%20as%20nemo_asr%0Aimport%20numpy%20as%20np%0Aimport%20torch%0Afrom%20nemo.collections.asr.models%20import%20SortformerEncLabelModel%0Afrom%20nemo.collections.asr.modules.sortformer_modules%20import%20StreamingSortformerState%0Afrom%20omegaconf%20import%20DictConfig%0Afrom%20torch%20import%20Tensor%0A%0ALOG_MEL_ZERO%20%3D%20-16.635%0A%0A%0Aclass%20AudioBufferer%3A%0A%20%20%20%20def%20__init__(self%2C%20sample_rate%3A%20int%2C%20buffer_size_in_secs%3A%20float)%3A%0A%20%20%20%20%20%20%20%20self.buffer_size%20%3D%20int(buffer_size_in_secs%20*%20sample_rate)%0A%20%20%20%20%20%20%20%20self.sample_buffer%20%3D%20torch.zeros(self.buffer_size%2C%20dtype%3Dtorch.float32)%0A%0A%20%20%20%20def%20reset(self)%20-%3E%20None%3A%0A%20%20%20%20%20%20%20%20%22%22%22%0A%20%20%20%20%20%20%20%20Reset%20the%20buffer%20to%20zero%0A%20%20%20%20%20%20%20%20%22%22%22%0A%20%20%20%20%20%20%20%20self.sample_buffer.zero_()%0A%0A%20%20%20%20def%20update(self%2C%20audio%3A%20np.ndarray)%20-%3E%20None%3A%0A%20%20%20%20%20%20%20%20%22%22%22%0A%20%20%20%20%20%20%20%20Update%20the%20buffer%20with%20the%20new%20frame%0A%20%20%20%20%20%20%20%20Args%3A%0A%20%20%20%20%20%20%20%20%20%20%20%20frame%20(Frame)%3A%20frame%20to%20update%20the%20buffer%20with%0A%20%20%20%20%20%20%20%20%22%22%22%0A%20%20%20%20%20%20%20%20if%20not%20isinstance(audio%2C%20torch.Tensor)%3A%0A%20%20%20%20%20%20%20%20%20%20%20%20audio%20%3D%20torch.from_numpy(audio)%0A%0A%20%20%20%20%20%20%20%20audio_size%20%3D%20audio.shape%5B0%5D%0A%20%20%20%20%20%20%20%20if%20audio_size%20%3E%20self.buffer_size%3A%0A%20%20%20%20%20%20%20%20%20%20%20%20raise%20ValueError(%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20f%22Frame%20size%20(%7Baudio_size%7D)%20exceeds%20buffer%20size%20(%7Bself.buffer_size%7D)%22%0A%20%20%20%20%20%20%20%20%20%20%20%20)%0A%0A%20%20%20%20%20%20%20%20shift%20%3D%20audio_size%0A%20%20%20%20%20%20%20%20self.sample_buffer%5B%3A-shift%5D%20%3D%20self.sample_buffer%5Bshift%3A%5D.clone()%0A%20%20%20%20%20%20%20%20self.sample_buffer%5B-shift%3A%5D%20%3D%20audio.clone()%0A%0A%20%20%20%20def%20get_buffer(self)%20-%3E%20torch.Tensor%3A%0A%20%20%20%20%20%20%20%20%22%22%22%0A%20%20%20%20%20%20%20%20Get%20the%20current%20buffer%0A%20%20%20%20%20%20%20%20Returns%3A%0A%20%20%20%20%20%20%20%20%20%20%20%20torch.Tensor%3A%20current%20state%20of%20the%20buffer%0A%20%20%20%20%20%20%20%20%22%22%22%0A%20%20%20%20%20%20%20%20return%20self.sample_buffer.clone()%0A%0A%20%20%20%20def%20is_buffer_empty(self)%20-%3E%20bool%3A%0A%20%20%20%20%20%20%20%20%22%22%22%0A%20%20%20%20%20%20%20%20Check%20if%20the%20buffer%20is%20empty%0A%20%20%20%20%20%20%20%20Returns%3A%0A%20%20%20%20%20%20%20%20%20%20%20%20bool%3A%20True%20if%20the%20buffer%20is%20empty%2C%20False%20otherwise%0A%20%20%20%20%20%20%20%20%22%22%22%0A%20%20%20%20%20%20%20%20return%20self.sample_buffer.sum()%20%3D%3D%200%0A%0A%0Aclass%20CacheFeatureBufferer%3A%0A%20%20%20%20def%20__init__(%0A%20%20%20%20%20%20%20%20self%2C%0A%20%20%20%20%20%20%20%20sample_rate%3A%20int%2C%0A%20%20%20%20%20%20%20%20buffer_size_in_secs%3A%20float%2C%0A%20%20%20%20%20%20%20%20chunk_size_in_secs%3A%20float%2C%0A%20%20%20%20%20%20%20%20preprocessor_cfg%3A%20DictConfig%2C%0A%20%20%20%20%20%20%20%20device%3A%20torch.device%2C%0A%20%20%20%20%20%20%20%20fill_value%3A%20float%20%3D%20LOG_MEL_ZERO%2C%0A%20%20%20%20)%3A%0A%20%20%20%20%20%20%20%20if%20buffer_size_in_secs%20%3C%20chunk_size_in_secs%3A%0A%20%20%20%20%20%20%20%20%20%20%20%20raise%20ValueError(%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20f%22Buffer%20size%20(%7Bbuffer_size_in_secs%7Ds)%20should%20be%20no%20less%20than%20chunk%20size%20(%7Bchunk_size_in_secs%7Ds)%22%0A%20%20%20%20%20%20%20%20%20%20%20%20)%0A%0A%20%20%20%20%20%20%20%20self.sample_rate%20%3D%20sample_rate%0A%20%20%20%20%20%20%20%20self.buffer_size_in_secs%20%3D%20buffer_size_in_secs%0A%20%20%20%20%20%20%20%20self.chunk_size_in_secs%20%3D%20chunk_size_in_secs%0A%20%20%20%20%20%20%20%20self.device%20%3D%20device%0A%0A%20%20%20%20%20%20%20%20if%20hasattr(preprocessor_cfg%2C%20%22log%22)%20and%20preprocessor_cfg.log%3A%0A%20%20%20%20%20%20%20%20%20%20%20%20self.ZERO_LEVEL_SPEC_DB_VAL%20%3D%20(%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20LOG_MEL_ZERO%20%20%23%20Log-Mel%20spectrogram%20value%20for%20zero%20signals%0A%20%20%20%20%20%20%20%20%20%20%20%20)%0A%20%20%20%20%20%20%20%20else%3A%0A%20%20%20%20%20%20%20%20%20%20%20%20self.ZERO_LEVEL_SPEC_DB_VAL%20%3D%20fill_value%0A%0A%20%20%20%20%20%20%20%20self.n_feat%20%3D%20preprocessor_cfg.features%0A%20%20%20%20%20%20%20%20self.timestep_duration%20%3D%20preprocessor_cfg.window_stride%0A%20%20%20%20%20%20%20%20self.n_chunk_look_back%20%3D%20int(self.timestep_duration%20*%20self.sample_rate)%0A%20%20%20%20%20%20%20%20self.chunk_size%20%3D%20int(self.chunk_size_in_secs%20*%20self.sample_rate)%0A%20%20%20%20%20%20%20%20self.sample_buffer%20%3D%20AudioBufferer(sample_rate%2C%20buffer_size_in_secs)%0A%0A%20%20%20%20%20%20%20%20self.feature_buffer_len%20%3D%20int(buffer_size_in_secs%20%2F%20self.timestep_duration)%0A%20%20%20%20%20%20%20%20self.feature_chunk_len%20%3D%20int(chunk_size_in_secs%20%2F%20self.timestep_duration)%0A%20%20%20%20%20%20%20%20self.feature_buffer%20%3D%20torch.full(%0A%20%20%20%20%20%20%20%20%20%20%20%20%5Bself.n_feat%2C%20self.feature_buffer_len%5D%2C%0A%20%20%20%20%20%20%20%20%20%20%20%20self.ZERO_LEVEL_SPEC_DB_VAL%2C%0A%20%20%20%20%20%20%20%20%20%20%20%20dtype%3Dtorch.float32%2C%0A%20%20%20%20%20%20%20%20%20%20%20%20device%3Dself.device%2C%0A%20%20%20%20%20%20%20%20)%0A%0A%20%20%20%20%20%20%20%20self.preprocessor%20%3D%20nemo_asr.models.ASRModel.from_config_dict(preprocessor_cfg)%0A%20%20%20%20%20%20%20%20self.preprocessor.to(self.device)%0A%0A%20%20%20%20def%20is_buffer_empty(self)%20-%3E%20bool%3A%0A%20%20%20%20%20%20%20%20%22%22%22%0A%20%20%20%20%20%20%20%20Check%20if%20the%20buffer%20is%20empty%0A%20%20%20%20%20%20%20%20Returns%3A%0A%20%20%20%20%20%20%20%20%20%20%20%20bool%3A%20True%20if%20the%20buffer%20is%20empty%2C%20False%20otherwise%0A%20%20%20%20%20%20%20%20%22%22%22%0A%20%20%20%20%20%20%20%20return%20self.sample_buffer.is_buffer_empty()%0A%0A%20%20%20%20def%20reset(self)%20-%3E%20None%3A%0A%20%20%20%20%20%20%20%20%22%22%22%0A%20%20%20%20%20%20%20%20Reset%20the%20buffer%20to%20zero%0A%20%20%20%20%20%20%20%20%22%22%22%0A%20%20%20%20%20%20%20%20self.sample_buffer.reset()%0A%20%20%20%20%20%20%20%20self.feature_buffer.fill_(self.ZERO_LEVEL_SPEC_DB_VAL)%0A%0A%20%20%20%20def%20_update_feature_buffer(self%2C%20feat_chunk%3A%20torch.Tensor)%20-%3E%20None%3A%0A%20%20%20%20%20%20%20%20%22%22%22%0A%20%20%20%20%20%20%20%20Add%20an%20extracted%20feature%20to%20%60feature_buffer%60%0A%20%20%20%20%20%20%20%20%22%22%22%0A%20%20%20%20%20%20%20%20self.feature_buffer%5B%3A%2C%20%3A%20-self.feature_chunk_len%5D%20%3D%20self.feature_buffer%5B%0A%20%20%20%20%20%20%20%20%20%20%20%20%3A%2C%20self.feature_chunk_len%20%3A%0A%20%20%20%20%20%20%20%20%5D.clone()%0A%20%20%20%20%20%20%20%20self.feature_buffer%5B%3A%2C%20-self.feature_chunk_len%20%3A%5D%20%3D%20feat_chunk.clone()%0A%0A%20%20%20%20def%20preprocess(self%2C%20audio_signal%3A%20torch.Tensor)%20-%3E%20torch.Tensor%3A%0A%20%20%20%20%20%20%20%20%22%22%22%0A%20%20%20%20%20%20%20%20Preprocess%20the%20audio%20signal%20using%20the%20preprocessor%0A%20%20%20%20%20%20%20%20Args%3A%0A%20%20%20%20%20%20%20%20%20%20%20%20audio_signal%20(torch.Tensor)%3A%20audio%20signal%0A%20%20%20%20%20%20%20%20Returns%3A%0A%20%20%20%20%20%20%20%20%20%20%20%20torch.Tensor%3A%20preprocessed%20features%0A%20%20%20%20%20%20%20%20%22%22%22%0A%20%20%20%20%20%20%20%20audio_signal%20%3D%20audio_signal.unsqueeze_(0).to(self.device)%0A%20%20%20%20%20%20%20%20audio_signal_len%20%3D%20torch.tensor(%5Baudio_signal.shape%5B1%5D%5D%2C%20device%3Dself.device)%0A%20%20%20%20%20%20%20%20features%2C%20_%20%3D%20self.preprocessor(%0A%20%20%20%20%20%20%20%20%20%20%20%20input_signal%3Daudio_signal%2C%0A%20%20%20%20%20%20%20%20%20%20%20%20length%3Daudio_signal_len%2C%0A%20%20%20%20%20%20%20%20)%0A%20%20%20%20%20%20%20%20features%20%3D%20features.squeeze()%0A%20%20%20%20%20%20%20%20return%20features%0A%0A%20%20%20%20def%20update(self%2C%20audio%3A%20np.ndarray)%20-%3E%20None%3A%0A%20%20%20%20%20%20%20%20%22%22%22%0A%20%20%20%20%20%20%20%20Update%20the%20sample%20anf%20feature%20buffers%20with%20the%20new%20frame%0A%20%20%20%20%20%20%20%20Args%3A%0A%20%20%20%20%20%20%20%20%20%20%20%20frame%20(Frame)%3A%20frame%20to%20update%20the%20buffer%20with%0A%20%20%20%20%20%20%20%20%22%22%22%0A%0A%20%20%20%20%20%20%20%20%23%20Update%20the%20sample%20buffer%20with%20the%20new%20frame%0A%20%20%20%20%20%20%20%20self.sample_buffer.update(audio)%0A%0A%20%20%20%20%20%20%20%20if%20math.isclose(self.buffer_size_in_secs%2C%20self.chunk_size_in_secs)%3A%0A%20%20%20%20%20%20%20%20%20%20%20%20%23%20If%20the%20buffer%20size%20is%20equal%20to%20the%20chunk%20size%2C%20just%20take%20the%20whole%20buffer%0A%20%20%20%20%20%20%20%20%20%20%20%20samples%20%3D%20self.sample_buffer.sample_buffer.clone()%0A%20%20%20%20%20%20%20%20else%3A%0A%20%20%20%20%20%20%20%20%20%20%20%20%23%20Add%20look_back%20to%20have%20context%20for%20the%20first%20feature%0A%20%20%20%20%20%20%20%20%20%20%20%20samples%20%3D%20self.sample_buffer.sample_buffer%5B%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20-(self.n_chunk_look_back%20%2B%20self.chunk_size)%20%3A%0A%20%20%20%20%20%20%20%20%20%20%20%20%5D%0A%0A%20%20%20%20%20%20%20%20%23%20Get%20the%20mel%20spectrogram%0A%20%20%20%20%20%20%20%20features%20%3D%20self.preprocess(samples)%0A%0A%20%20%20%20%20%20%20%20%23%20If%20the%20features%20are%20longer%20than%20supposed%20to%20be%2C%20drop%20the%20last%20frames%0A%20%20%20%20%20%20%20%20%23%20Drop%20the%20last%20diff%20frames%20because%20they%20might%20be%20incomplete%0A%20%20%20%20%20%20%20%20if%20(diff%20%3A%3D%20features.shape%5B1%5D%20-%20self.feature_chunk_len%20-%201)%20%3E%200%3A%0A%20%20%20%20%20%20%20%20%20%20%20%20features%20%3D%20features%5B%3A%2C%20%3A-diff%5D%0A%0A%20%20%20%20%20%20%20%20%23%20Update%20the%20feature%20buffer%20with%20the%20new%20features%0A%20%20%20%20%20%20%20%20self._update_feature_buffer(features%5B%3A%2C%20-self.feature_chunk_len%20%3A%5D)%0A%0A%20%20%20%20def%20get_buffer(self)%20-%3E%20torch.Tensor%3A%0A%20%20%20%20%20%20%20%20%22%22%22%0A%20%20%20%20%20%20%20%20Get%20the%20current%20sample%20buffer%0A%20%20%20%20%20%20%20%20Returns%3A%0A%20%20%20%20%20%20%20%20%20%20%20%20torch.Tensor%3A%20current%20state%20of%20the%20buffer%0A%20%20%20%20%20%20%20%20%22%22%22%0A%20%20%20%20%20%20%20%20return%20self.sample_buffer.get_buffer()%0A%0A%20%20%20%20def%20get_feature_buffer(self)%20-%3E%20torch.Tensor%3A%0A%20%20%20%20%20%20%20%20%22%22%22%0A%20%20%20%20%20%20%20%20Get%20the%20current%20feature%20buffer%0A%20%20%20%20%20%20%20%20Returns%3A%0A%20%20%20%20%20%20%20%20%20%20%20%20torch.Tensor%3A%20current%20state%20of%20the%20feature%20buffer%0A%20%20%20%20%20%20%20%20%22%22%22%0A%20%20%20%20%20%20%20%20return%20self.feature_buffer.clone()%0A%0A%0A%40dataclass%0Aclass%20DiarizationConfig%3A%0A%20%20%20%20%22%22%22Diarization%20configuration%20parameters%20for%20inference.%22%22%22%0A%0A%20%20%20%20model_path%3A%20str%20%3D%20%22nvidia%2Fdiar_streaming_sortformer_4spk-v2%22%0A%20%20%20%20device%3A%20str%20%3D%20%22cuda%22%0A%0A%20%20%20%20log%3A%20bool%20%3D%20False%20%20%23%20If%20True%2C%20log%20will%20be%20printed%0A%20%20%20%20max_num_speakers%3A%20int%20%3D%204%0A%20%20%20%20spkcache_len%3A%20int%20%3D%20188%0A%20%20%20%20spkcache_refresh_rate%3A%20int%20%3D%20144%0A%20%20%20%20fifo_len%3A%20int%20%3D%20188%0A%20%20%20%20chunk_len%3A%20int%20%3D%206%0A%20%20%20%20chunk_left_context%3A%20int%20%3D%201%0A%20%20%20%20chunk_right_context%3A%20int%20%3D%207%0A%0A%0Aclass%20NeMoStreamingDiarizer%3A%0A%20%20%20%20def%20__init__(%0A%20%20%20%20%20%20%20%20self%2C%0A%20%20%20%20%20%20%20%20cfg%3A%20DiarizationConfig%2C%0A%20%20%20%20%20%20%20%20model%3A%20str%2C%0A%20%20%20%20%20%20%20%20frame_len_in_secs%3A%20float%20%3D%200.08%2C%0A%20%20%20%20%20%20%20%20sample_rate%3A%20int%20%3D%2016000%2C%0A%20%20%20%20%20%20%20%20left_offset%3A%20int%20%3D%208%2C%0A%20%20%20%20%20%20%20%20right_offset%3A%20int%20%3D%208%2C%0A%20%20%20%20%20%20%20%20use_amp%3A%20bool%20%3D%20False%2C%0A%20%20%20%20%20%20%20%20compute_dtype%3A%20torch.dtype%20%3D%20torch.float32%2C%0A%20%20%20%20)%3A%0A%20%20%20%20%20%20%20%20self.model%20%3D%20model%0A%20%20%20%20%20%20%20%20self.cfg%20%3D%20cfg%0A%20%20%20%20%20%20%20%20self.cfg.model_path%20%3D%20model%0A%20%20%20%20%20%20%20%20self.diarizer%20%3D%20self.build_diarizer()%0A%20%20%20%20%20%20%20%20self.device%20%3D%20cfg.device%0A%20%20%20%20%20%20%20%20self.use_amp%20%3D%20use_amp%0A%20%20%20%20%20%20%20%20self.compute_dtype%20%3D%20compute_dtype%0A%20%20%20%20%20%20%20%20self.frame_len_in_secs%20%3D%20frame_len_in_secs%0A%20%20%20%20%20%20%20%20self.left_offset%20%3D%20left_offset%0A%20%20%20%20%20%20%20%20self.right_offset%20%3D%20right_offset%0A%20%20%20%20%20%20%20%20self.chunk_size%20%3D%20self.cfg.chunk_len%0A%20%20%20%20%20%20%20%20self.buffer_size_in_secs%20%3D%20(%0A%20%20%20%20%20%20%20%20%20%20%20%20self.cfg.chunk_len%20*%20self.frame_len_in_secs%0A%20%20%20%20%20%20%20%20%20%20%20%20%2B%20(self.left_offset%20%2B%20self.right_offset)%20*%200.01%0A%20%20%20%20%20%20%20%20)%0A%20%20%20%20%20%20%20%20self.max_num_speakers%20%3D%20self.cfg.max_num_speakers%0A%0A%20%20%20%20%20%20%20%20self.feature_bufferer%20%3D%20CacheFeatureBufferer(%0A%20%20%20%20%20%20%20%20%20%20%20%20sample_rate%3Dsample_rate%2C%0A%20%20%20%20%20%20%20%20%20%20%20%20buffer_size_in_secs%3Dself.buffer_size_in_secs%2C%0A%20%20%20%20%20%20%20%20%20%20%20%20chunk_size_in_secs%3Dself.cfg.chunk_len%20*%20self.frame_len_in_secs%2C%0A%20%20%20%20%20%20%20%20%20%20%20%20preprocessor_cfg%3Dself.diarizer.cfg.preprocessor%2C%0A%20%20%20%20%20%20%20%20%20%20%20%20device%3Dself.device%2C%0A%20%20%20%20%20%20%20%20)%0A%20%20%20%20%20%20%20%20self.streaming_state%20%3D%20self.init_streaming_state(batch_size%3D1)%0A%20%20%20%20%20%20%20%20self.total_preds%20%3D%20torch.zeros(%0A%20%20%20%20%20%20%20%20%20%20%20%20(1%2C%200%2C%20self.max_num_speakers)%2C%20device%3Dself.diarizer.device%0A%20%20%20%20%20%20%20%20)%0A%0A%20%20%20%20%20%20%20%20print(%0A%20%20%20%20%20%20%20%20%20%20%20%20f%22NeMoStreamingDiarService%20initialized%20with%20model%20%60%7Bmodel%7D%60%20on%20device%20%60%7Bself.device%7D%60%22%0A%20%20%20%20%20%20%20%20)%0A%0A%20%20%20%20def%20build_diarizer(self)%3A%0A%20%20%20%20%20%20%20%20if%20self.cfg.model_path.endswith(%22.nemo%22)%3A%0A%20%20%20%20%20%20%20%20%20%20%20%20diar_model%20%3D%20SortformerEncLabelModel.restore_from(%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20self.cfg.model_path%2C%20map_location%3Dself.cfg.device%0A%20%20%20%20%20%20%20%20%20%20%20%20)%0A%20%20%20%20%20%20%20%20else%3A%0A%20%20%20%20%20%20%20%20%20%20%20%20diar_model%20%3D%20SortformerEncLabelModel.from_pretrained(%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20self.cfg.model_path%2C%20map_location%3Dself.cfg.device%0A%20%20%20%20%20%20%20%20%20%20%20%20)%0A%0A%20%20%20%20%20%20%20%20%23%20Steaming%20mode%20setup%0A%20%20%20%20%20%20%20%20diar_model.sortformer_modules.chunk_len%20%3D%20self.cfg.chunk_len%0A%20%20%20%20%20%20%20%20diar_model.sortformer_modules.spkcache_len%20%3D%20self.cfg.spkcache_len%0A%20%20%20%20%20%20%20%20diar_model.sortformer_modules.chunk_left_context%20%3D%20self.cfg.chunk_left_context%0A%20%20%20%20%20%20%20%20diar_model.sortformer_modules.chunk_right_context%20%3D%20self.cfg.chunk_right_context%0A%20%20%20%20%20%20%20%20diar_model.sortformer_modules.fifo_len%20%3D%20self.cfg.fifo_len%0A%20%20%20%20%20%20%20%20diar_model.sortformer_modules.log%20%3D%20self.cfg.log%0A%20%20%20%20%20%20%20%20diar_model.sortformer_modules.spkcache_refresh_rate%20%3D%20(%0A%20%20%20%20%20%20%20%20%20%20%20%20self.cfg.spkcache_refresh_rate%0A%20%20%20%20%20%20%20%20)%0A%20%20%20%20%20%20%20%20diar_model.eval()%0A%0A%20%20%20%20%20%20%20%20return%20diar_model%0A%0A%20%20%20%20def%20print_diar_result(self%2C%20diar_result%3A%20np.ndarray)%3A%0A%20%20%20%20%20%20%20%20full_result%20%3D%20%5B%5D%0A%20%20%20%20%20%20%20%20for%20t%20in%20range(diar_result.shape%5B0%5D)%3A%0A%20%20%20%20%20%20%20%20%20%20%20%20spk_probs%20%3D%20%22%22%0A%20%20%20%20%20%20%20%20%20%20%20%20for%20s%20in%20range(diar_result.shape%5B1%5D)%3A%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20spk_probs%20%2B%3D%20f%22%7Bdiar_result%5Bt%2C%20s%5D%3A.2f%7D%20%22%0A%20%20%20%20%20%20%20%20%20%20%20%20full_result.append(f%22Time%20%7Bt%7D%3A%20%7Bspk_probs%7D%22)%0A%20%20%20%20%20%20%20%20print(full_result)%0A%20%20%20%20%20%20%20%20return%20full_result%0A%0A%20%20%20%20def%20diarize(self%2C%20audio%3A%20bytes%2C%20stream_id%3A%20str%20%3D%20%22default%22)%3A%0A%20%20%20%20%20%20%20%20audio_array%20%3D%20np.frombuffer(audio%2C%20dtype%3Dnp.int16).astype(np.float32)%20%2F%2032768.0%0A%0A%20%20%20%20%20%20%20%20self.feature_bufferer.update(audio_array)%0A%0A%20%20%20%20%20%20%20%20features%20%3D%20self.feature_bufferer.get_feature_buffer()%0A%20%20%20%20%20%20%20%20feature_buffers%20%3D%20features.unsqueeze(0)%20%20%23%20add%20batch%20dimension%0A%20%20%20%20%20%20%20%20feature_buffers%20%3D%20feature_buffers.transpose(%0A%20%20%20%20%20%20%20%20%20%20%20%201%2C%202%0A%20%20%20%20%20%20%20%20)%20%20%23%20%5Bbatch%2C%20feature%2C%20time%5D%20-%3E%20%5Bbatch%2C%20time%2C%20feature%5D%0A%20%20%20%20%20%20%20%20feature_buffer_lens%20%3D%20torch.tensor(%0A%20%20%20%20%20%20%20%20%20%20%20%20%5Bfeature_buffers.shape%5B1%5D%5D%2C%20device%3Dself.device%0A%20%20%20%20%20%20%20%20)%0A%20%20%20%20%20%20%20%20self.streaming_state%2C%20chunk_preds%20%3D%20self.stream_step(%0A%20%20%20%20%20%20%20%20%20%20%20%20processed_signal%3Dfeature_buffers%2C%0A%20%20%20%20%20%20%20%20%20%20%20%20processed_signal_length%3Dfeature_buffer_lens%2C%0A%20%20%20%20%20%20%20%20%20%20%20%20streaming_state%3Dself.streaming_state%2C%0A%20%20%20%20%20%20%20%20%20%20%20%20total_preds%3Dself.total_preds%2C%0A%20%20%20%20%20%20%20%20%20%20%20%20left_offset%3Dself.left_offset%2C%0A%20%20%20%20%20%20%20%20%20%20%20%20right_offset%3Dself.right_offset%2C%0A%20%20%20%20%20%20%20%20)%0A%20%20%20%20%20%20%20%20self.total_preds%20%3D%20chunk_preds%0A%20%20%20%20%20%20%20%20diar_result%20%3D%20chunk_preds%5B%3A%2C%20-self.chunk_size%20%3A%2C%20%3A%5D.clone().cpu().numpy()%0A%20%20%20%20%20%20%20%20return%20diar_result%5B0%5D%20%20%23%20tensor%20of%20shape%20%5B6%2C%204%5D%0A%0A%20%20%20%20def%20reset_state(self%2C%20stream_id%3A%20str%20%3D%20%22default%22)%3A%0A%20%20%20%20%20%20%20%20self.feature_bufferer.reset()%0A%20%20%20%20%20%20%20%20self.streaming_state%20%3D%20self.init_streaming_state(batch_size%3D1)%0A%20%20%20%20%20%20%20%20self.total_preds%20%3D%20torch.zeros(%0A%20%20%20%20%20%20%20%20%20%20%20%20(1%2C%200%2C%20self.max_num_speakers)%2C%20device%3Dself.diarizer.device%0A%20%20%20%20%20%20%20%20)%0A%0A%20%20%20%20def%20init_streaming_state(self%2C%20batch_size%3A%20int%20%3D%201)%20-%3E%20StreamingSortformerState%3A%0A%20%20%20%20%20%20%20%20%22%22%22%0A%20%20%20%20%20%20%20%20Initialize%20the%20streaming%20state%20for%20the%20diarization%20model.%0A%0A%20%20%20%20%20%20%20%20Args%3A%0A%20%20%20%20%20%20%20%20%20%20%20%20batch_size%3A%20The%20batch%20size%20to%20use.%0A%0A%20%20%20%20%20%20%20%20Returns%3A%0A%20%20%20%20%20%20%20%20%20%20%20%20SortformerStreamingState%3A%20The%20initialized%20streaming%20state.%0A%20%20%20%20%20%20%20%20%22%22%22%0A%20%20%20%20%20%20%20%20%23%20Use%20the%20model's%20init_streaming_state%20method%20but%20convert%20to%20SortformerStreamingState%20format%0A%20%20%20%20%20%20%20%20nemo_state%20%3D%20self.diarizer.sortformer_modules.init_streaming_state(%0A%20%20%20%20%20%20%20%20%20%20%20%20batch_size%3Dbatch_size%2C%0A%20%20%20%20%20%20%20%20%20%20%20%20async_streaming%3Dself.diarizer.async_streaming%2C%0A%20%20%20%20%20%20%20%20%20%20%20%20device%3Dself.device%2C%0A%20%20%20%20%20%20%20%20)%0A%0A%20%20%20%20%20%20%20%20return%20nemo_state%0A%0A%20%20%20%20def%20stream_step(%0A%20%20%20%20%20%20%20%20self%2C%0A%20%20%20%20%20%20%20%20processed_signal%3A%20Tensor%2C%0A%20%20%20%20%20%20%20%20processed_signal_length%3A%20Tensor%2C%0A%20%20%20%20%20%20%20%20streaming_state%3A%20StreamingSortformerState%2C%0A%20%20%20%20%20%20%20%20total_preds%3A%20Tensor%2C%0A%20%20%20%20%20%20%20%20left_offset%3A%20int%20%3D%200%2C%0A%20%20%20%20%20%20%20%20right_offset%3A%20int%20%3D%200%2C%0A%20%20%20%20)%20-%3E%20Tuple%5BStreamingSortformerState%2C%20Tensor%5D%3A%0A%20%20%20%20%20%20%20%20%22%22%22%0A%20%20%20%20%20%20%20%20Execute%20a%20single%20streaming%20step%20for%20diarization.%0A%0A%20%20%20%20%20%20%20%20Args%3A%0A%20%20%20%20%20%20%20%20%20%20%20%20processed_signal%3A%20The%20processed%20audio%20signal.%0A%20%20%20%20%20%20%20%20%20%20%20%20processed_signal_length%3A%20The%20length%20of%20the%20processed%20signal.%0A%20%20%20%20%20%20%20%20%20%20%20%20streaming_state%3A%20The%20current%20streaming%20state.%0A%20%20%20%20%20%20%20%20%20%20%20%20total_preds%3A%20The%20total%20predictions%20so%20far.%0A%20%20%20%20%20%20%20%20%20%20%20%20left_offset%3A%20The%20left%20offset%20for%20the%20current%20chunk.%0A%20%20%20%20%20%20%20%20%20%20%20%20right_offset%3A%20The%20right%20offset%20for%20the%20current%20chunk.%0A%0A%20%20%20%20%20%20%20%20Returns%3A%0A%20%20%20%20%20%20%20%20%20%20%20%20Tuple%5BSortformerStreamingState%2C%20Tensor%5D%3A%20The%20updated%20streaming%20state%20and%20predictions.%0A%20%20%20%20%20%20%20%20%22%22%22%0A%20%20%20%20%20%20%20%20%23%20Move%20tensors%20to%20correct%20device%0A%20%20%20%20%20%20%20%20if%20processed_signal.device%20!%3D%20self.device%3A%0A%20%20%20%20%20%20%20%20%20%20%20%20processed_signal%20%3D%20processed_signal.to(self.device)%0A%0A%20%20%20%20%20%20%20%20if%20processed_signal_length.device%20!%3D%20self.device%3A%0A%20%20%20%20%20%20%20%20%20%20%20%20processed_signal_length%20%3D%20processed_signal_length.to(self.device)%0A%0A%20%20%20%20%20%20%20%20if%20total_preds%20is%20not%20None%20and%20total_preds.device%20!%3D%20self.device%3A%0A%20%20%20%20%20%20%20%20%20%20%20%20total_preds%20%3D%20total_preds.to(self.device)%0A%0A%20%20%20%20%20%20%20%20with%20(%0A%20%20%20%20%20%20%20%20%20%20%20%20torch.amp.autocast(%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20device_type%3Dself.device%2C%20dtype%3Dself.compute_dtype%2C%20enabled%3Dself.use_amp%0A%20%20%20%20%20%20%20%20%20%20%20%20)%2C%0A%20%20%20%20%20%20%20%20%20%20%20%20torch.inference_mode()%2C%0A%20%20%20%20%20%20%20%20%20%20%20%20torch.no_grad()%2C%0A%20%20%20%20%20%20%20%20)%3A%0A%20%20%20%20%20%20%20%20%20%20%20%20try%3A%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%23%20Call%20the%20model's%20forward_streaming_step%20method%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20streaming_state%2C%20diar_pred_out_stream%20%3D%20(%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20self.diarizer.forward_streaming_step(%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20processed_signal%3Dprocessed_signal%2C%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20processed_signal_length%3Dprocessed_signal_length%2C%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20streaming_state%3Dstreaming_state%2C%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20total_preds%3Dtotal_preds%2C%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20left_offset%3Dleft_offset%2C%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20right_offset%3Dright_offset%2C%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20)%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20)%0A%20%20%20%20%20%20%20%20%20%20%20%20except%20Exception%20as%20e%3A%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20print(f%22Error%20in%20diarizer%20streaming%20step%3A%20%7Be%7D%22)%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%23%20print%20the%20stack%20trace%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20import%20traceback%0A%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20traceback.print_exc()%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%23%20Return%20the%20existing%20state%20and%20preds%20if%20there's%20an%20error%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20return%20streaming_state%2C%20total_preds%0A%0A%20%20%20%20%20%20%20%20return%20streaming_state%2C%20diar_pred_out_stream%0A`,lang:`python`}),i(t,o)},$$slots:{default:!0}}))}export{v as default,p as metadata};
//# sourceMappingURL=IcqA4g4H2.js.map
