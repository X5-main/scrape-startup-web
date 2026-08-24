(function(){try{var e=typeof window<`u`?window:typeof global<`u`?global:typeof globalThis<`u`?globalThis:typeof self<`u`?self:{};e.SENTRY_RELEASE={id:`f99fcf9f0a844cc9bd13fdc8e5782b84`};var t=new e.Error().stack;t&&(e._sentryDebugIds=e._sentryDebugIds||{},e._sentryDebugIds[t]=`211859f2-25b7-43e8-b0c8-b95f235a18aa`,e._sentryDebugIdIdentifier=`sentry-dbid-211859f2-25b7-43e8-b0c8-b95f235a18aa`)}catch{}})();import{c as e,d as t}from"./F_ixKBiO.js";import"./B1sc9Zdx.js";import"./Bb2deiU3.js";import{t as n}from"./BILrvr3I.js";import{t as r}from"./B4L_if842.js";var i={toc:[],rawContent:`\`\`\`python
import math
import os
import sys
import tempfile
import wave
from pathlib import Path
from typing import Callable, Sequence
from urllib.request import urlopen

import nemo.collections.asr as nemo_asr
import numpy as np
import torch
from omegaconf import DictConfig


def preprocess_audio(audio: bytes | str, target_sample_rate: int = 16000) -> bytes:
    import array
    import io
    import wave

    if isinstance(audio, str):
        audio = get_bytes_from_wav(audio)

    with wave.open(io.BytesIO(audio), "rb") as wav_in:
        n_channels = wav_in.getnchannels()
        sample_width = wav_in.getsampwidth()
        frame_rate = wav_in.getframerate()
        n_frames = wav_in.getnframes()
        frames = wav_in.readframes(n_frames)

    # Convert frames to array based on sample width
    if sample_width == 1:
        audio_data = array.array("B", frames)  # unsigned char
    elif sample_width == 2:
        audio_data = array.array("h", frames)  # signed short
    elif sample_width == 3:
        audio_data = array.array("b", frames)  # signed byte
    elif sample_width == 4:
        audio_data = array.array("i", frames)  # signed int
    else:
        raise ValueError(f"Unsupported sample width: {sample_width}")

    # Downmix to mono if needed
    if n_channels > 1:
        mono_data = array.array(audio_data.typecode)
        for i in range(0, len(audio_data), n_channels):
            chunk = audio_data[i : i + n_channels]
            mono_data.append(sum(chunk) // n_channels)
        audio_data = mono_data

    # Resample to 16kHz if needed
    if frame_rate != target_sample_rate:
        ratio = target_sample_rate / frame_rate
        new_length = int(len(audio_data) * ratio)
        resampled_data = array.array(audio_data.typecode)

        for i in range(new_length):
            # Linear interpolation
            pos = i / ratio
            pos_int = int(pos)
            pos_frac = pos - pos_int

            if pos_int >= len(audio_data) - 1:
                sample = audio_data[-1]
            else:
                sample1 = audio_data[pos_int]
                sample2 = audio_data[pos_int + 1]
                sample = int(sample1 + (sample2 - sample1) * pos_frac)

            resampled_data.append(sample)

        audio_data = resampled_data

    return audio_data.tobytes()


def get_bytes_from_wav(location: str) -> bytes:
    if location.startswith("http"):
        bytes = urlopen(location).read()
    else:
        bytes = Path(location).read_bytes()

    return bytes


def identity(data):
    return data


def batch_seq(
    data: Sequence, chunk_size: int, transform: Callable = None
) -> list[bytes]:
    if transform is None:
        transform = identity
    return [
        transform(data[i : i + chunk_size]) for i in range(0, len(data), chunk_size)
    ]


SHUTDOWN_SIGNAL = (
    b"END_OF_STREAM_8f13d09"  # byte sequence indicating a stream is finished
)


def int2float(audio_data):
    import numpy as np

    abs_max = np.abs(audio_data).max()
    audio_data = audio_data.astype("float32")
    if abs_max > 0:
        audio_data *= 1 / 32768
    audio_data = audio_data.squeeze()  # depends on the use case
    return audio_data


def bytes_to_torch(data, device="cuda"):
    import numpy as np
    import torch

    data = np.frombuffer(data, dtype=np.int16)
    data = torch.from_numpy(int2float(data)).to(device)
    return data


class NoStdStreams(object):
    def __init__(self):
        self.devnull = open(os.devnull, "w")

    def __enter__(self):
        self._stdout, self._stderr = sys.stdout, sys.stderr
        self._stdout.flush(), self._stderr.flush()
        sys.stdout, sys.stderr = self.devnull, self.devnull

    def __exit__(self, exc_type, exc_value, traceback):
        sys.stdout, sys.stderr = self._stdout, self._stderr
        self.devnull.close()


def write_wav_file(args):
    idx, data = args
    temp_file = tempfile.NamedTemporaryFile(delete=False, suffix=".wav")
    with wave.open(temp_file, "wb") as wav_out:
        wav_out.setnchannels(1)
        wav_out.setsampwidth(2)  # 16-bit
        wav_out.setframerate(16000)
        wav_out.writeframes(data)
    temp_file.close()
    return temp_file.name


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

\`\`\`
`,meta:{}},{toc:a,rawContent:o,meta:s}=i;function c(a,o){let s=e(o,[`children`,`$$slots`,`$$events`,`$$legacy`]);r(a,t(()=>s,()=>i,{children:(e,t)=>{n(e,{code:`import%20math%0Aimport%20os%0Aimport%20sys%0Aimport%20tempfile%0Aimport%20wave%0Afrom%20pathlib%20import%20Path%0Afrom%20typing%20import%20Callable%2C%20Sequence%0Afrom%20urllib.request%20import%20urlopen%0A%0Aimport%20nemo.collections.asr%20as%20nemo_asr%0Aimport%20numpy%20as%20np%0Aimport%20torch%0Afrom%20omegaconf%20import%20DictConfig%0A%0A%0Adef%20preprocess_audio(audio%3A%20bytes%20%7C%20str%2C%20target_sample_rate%3A%20int%20%3D%2016000)%20-%3E%20bytes%3A%0A%20%20%20%20import%20array%0A%20%20%20%20import%20io%0A%20%20%20%20import%20wave%0A%0A%20%20%20%20if%20isinstance(audio%2C%20str)%3A%0A%20%20%20%20%20%20%20%20audio%20%3D%20get_bytes_from_wav(audio)%0A%0A%20%20%20%20with%20wave.open(io.BytesIO(audio)%2C%20%22rb%22)%20as%20wav_in%3A%0A%20%20%20%20%20%20%20%20n_channels%20%3D%20wav_in.getnchannels()%0A%20%20%20%20%20%20%20%20sample_width%20%3D%20wav_in.getsampwidth()%0A%20%20%20%20%20%20%20%20frame_rate%20%3D%20wav_in.getframerate()%0A%20%20%20%20%20%20%20%20n_frames%20%3D%20wav_in.getnframes()%0A%20%20%20%20%20%20%20%20frames%20%3D%20wav_in.readframes(n_frames)%0A%0A%20%20%20%20%23%20Convert%20frames%20to%20array%20based%20on%20sample%20width%0A%20%20%20%20if%20sample_width%20%3D%3D%201%3A%0A%20%20%20%20%20%20%20%20audio_data%20%3D%20array.array(%22B%22%2C%20frames)%20%20%23%20unsigned%20char%0A%20%20%20%20elif%20sample_width%20%3D%3D%202%3A%0A%20%20%20%20%20%20%20%20audio_data%20%3D%20array.array(%22h%22%2C%20frames)%20%20%23%20signed%20short%0A%20%20%20%20elif%20sample_width%20%3D%3D%203%3A%0A%20%20%20%20%20%20%20%20audio_data%20%3D%20array.array(%22b%22%2C%20frames)%20%20%23%20signed%20byte%0A%20%20%20%20elif%20sample_width%20%3D%3D%204%3A%0A%20%20%20%20%20%20%20%20audio_data%20%3D%20array.array(%22i%22%2C%20frames)%20%20%23%20signed%20int%0A%20%20%20%20else%3A%0A%20%20%20%20%20%20%20%20raise%20ValueError(f%22Unsupported%20sample%20width%3A%20%7Bsample_width%7D%22)%0A%0A%20%20%20%20%23%20Downmix%20to%20mono%20if%20needed%0A%20%20%20%20if%20n_channels%20%3E%201%3A%0A%20%20%20%20%20%20%20%20mono_data%20%3D%20array.array(audio_data.typecode)%0A%20%20%20%20%20%20%20%20for%20i%20in%20range(0%2C%20len(audio_data)%2C%20n_channels)%3A%0A%20%20%20%20%20%20%20%20%20%20%20%20chunk%20%3D%20audio_data%5Bi%20%3A%20i%20%2B%20n_channels%5D%0A%20%20%20%20%20%20%20%20%20%20%20%20mono_data.append(sum(chunk)%20%2F%2F%20n_channels)%0A%20%20%20%20%20%20%20%20audio_data%20%3D%20mono_data%0A%0A%20%20%20%20%23%20Resample%20to%2016kHz%20if%20needed%0A%20%20%20%20if%20frame_rate%20!%3D%20target_sample_rate%3A%0A%20%20%20%20%20%20%20%20ratio%20%3D%20target_sample_rate%20%2F%20frame_rate%0A%20%20%20%20%20%20%20%20new_length%20%3D%20int(len(audio_data)%20*%20ratio)%0A%20%20%20%20%20%20%20%20resampled_data%20%3D%20array.array(audio_data.typecode)%0A%0A%20%20%20%20%20%20%20%20for%20i%20in%20range(new_length)%3A%0A%20%20%20%20%20%20%20%20%20%20%20%20%23%20Linear%20interpolation%0A%20%20%20%20%20%20%20%20%20%20%20%20pos%20%3D%20i%20%2F%20ratio%0A%20%20%20%20%20%20%20%20%20%20%20%20pos_int%20%3D%20int(pos)%0A%20%20%20%20%20%20%20%20%20%20%20%20pos_frac%20%3D%20pos%20-%20pos_int%0A%0A%20%20%20%20%20%20%20%20%20%20%20%20if%20pos_int%20%3E%3D%20len(audio_data)%20-%201%3A%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20sample%20%3D%20audio_data%5B-1%5D%0A%20%20%20%20%20%20%20%20%20%20%20%20else%3A%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20sample1%20%3D%20audio_data%5Bpos_int%5D%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20sample2%20%3D%20audio_data%5Bpos_int%20%2B%201%5D%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20sample%20%3D%20int(sample1%20%2B%20(sample2%20-%20sample1)%20*%20pos_frac)%0A%0A%20%20%20%20%20%20%20%20%20%20%20%20resampled_data.append(sample)%0A%0A%20%20%20%20%20%20%20%20audio_data%20%3D%20resampled_data%0A%0A%20%20%20%20return%20audio_data.tobytes()%0A%0A%0Adef%20get_bytes_from_wav(location%3A%20str)%20-%3E%20bytes%3A%0A%20%20%20%20if%20location.startswith(%22http%22)%3A%0A%20%20%20%20%20%20%20%20bytes%20%3D%20urlopen(location).read()%0A%20%20%20%20else%3A%0A%20%20%20%20%20%20%20%20bytes%20%3D%20Path(location).read_bytes()%0A%0A%20%20%20%20return%20bytes%0A%0A%0Adef%20identity(data)%3A%0A%20%20%20%20return%20data%0A%0A%0Adef%20batch_seq(%0A%20%20%20%20data%3A%20Sequence%2C%20chunk_size%3A%20int%2C%20transform%3A%20Callable%20%3D%20None%0A)%20-%3E%20list%5Bbytes%5D%3A%0A%20%20%20%20if%20transform%20is%20None%3A%0A%20%20%20%20%20%20%20%20transform%20%3D%20identity%0A%20%20%20%20return%20%5B%0A%20%20%20%20%20%20%20%20transform(data%5Bi%20%3A%20i%20%2B%20chunk_size%5D)%20for%20i%20in%20range(0%2C%20len(data)%2C%20chunk_size)%0A%20%20%20%20%5D%0A%0A%0ASHUTDOWN_SIGNAL%20%3D%20(%0A%20%20%20%20b%22END_OF_STREAM_8f13d09%22%20%20%23%20byte%20sequence%20indicating%20a%20stream%20is%20finished%0A)%0A%0A%0Adef%20int2float(audio_data)%3A%0A%20%20%20%20import%20numpy%20as%20np%0A%0A%20%20%20%20abs_max%20%3D%20np.abs(audio_data).max()%0A%20%20%20%20audio_data%20%3D%20audio_data.astype(%22float32%22)%0A%20%20%20%20if%20abs_max%20%3E%200%3A%0A%20%20%20%20%20%20%20%20audio_data%20*%3D%201%20%2F%2032768%0A%20%20%20%20audio_data%20%3D%20audio_data.squeeze()%20%20%23%20depends%20on%20the%20use%20case%0A%20%20%20%20return%20audio_data%0A%0A%0Adef%20bytes_to_torch(data%2C%20device%3D%22cuda%22)%3A%0A%20%20%20%20import%20numpy%20as%20np%0A%20%20%20%20import%20torch%0A%0A%20%20%20%20data%20%3D%20np.frombuffer(data%2C%20dtype%3Dnp.int16)%0A%20%20%20%20data%20%3D%20torch.from_numpy(int2float(data)).to(device)%0A%20%20%20%20return%20data%0A%0A%0Aclass%20NoStdStreams(object)%3A%0A%20%20%20%20def%20__init__(self)%3A%0A%20%20%20%20%20%20%20%20self.devnull%20%3D%20open(os.devnull%2C%20%22w%22)%0A%0A%20%20%20%20def%20__enter__(self)%3A%0A%20%20%20%20%20%20%20%20self._stdout%2C%20self._stderr%20%3D%20sys.stdout%2C%20sys.stderr%0A%20%20%20%20%20%20%20%20self._stdout.flush()%2C%20self._stderr.flush()%0A%20%20%20%20%20%20%20%20sys.stdout%2C%20sys.stderr%20%3D%20self.devnull%2C%20self.devnull%0A%0A%20%20%20%20def%20__exit__(self%2C%20exc_type%2C%20exc_value%2C%20traceback)%3A%0A%20%20%20%20%20%20%20%20sys.stdout%2C%20sys.stderr%20%3D%20self._stdout%2C%20self._stderr%0A%20%20%20%20%20%20%20%20self.devnull.close()%0A%0A%0Adef%20write_wav_file(args)%3A%0A%20%20%20%20idx%2C%20data%20%3D%20args%0A%20%20%20%20temp_file%20%3D%20tempfile.NamedTemporaryFile(delete%3DFalse%2C%20suffix%3D%22.wav%22)%0A%20%20%20%20with%20wave.open(temp_file%2C%20%22wb%22)%20as%20wav_out%3A%0A%20%20%20%20%20%20%20%20wav_out.setnchannels(1)%0A%20%20%20%20%20%20%20%20wav_out.setsampwidth(2)%20%20%23%2016-bit%0A%20%20%20%20%20%20%20%20wav_out.setframerate(16000)%0A%20%20%20%20%20%20%20%20wav_out.writeframes(data)%0A%20%20%20%20temp_file.close()%0A%20%20%20%20return%20temp_file.name%0A%0A%0ALOG_MEL_ZERO%20%3D%20-16.635%0A%0A%0Aclass%20AudioBufferer%3A%0A%20%20%20%20def%20__init__(self%2C%20sample_rate%3A%20int%2C%20buffer_size_in_secs%3A%20float)%3A%0A%20%20%20%20%20%20%20%20self.buffer_size%20%3D%20int(buffer_size_in_secs%20*%20sample_rate)%0A%20%20%20%20%20%20%20%20self.sample_buffer%20%3D%20torch.zeros(self.buffer_size%2C%20dtype%3Dtorch.float32)%0A%0A%20%20%20%20def%20reset(self)%20-%3E%20None%3A%0A%20%20%20%20%20%20%20%20%22%22%22%0A%20%20%20%20%20%20%20%20Reset%20the%20buffer%20to%20zero%0A%20%20%20%20%20%20%20%20%22%22%22%0A%20%20%20%20%20%20%20%20self.sample_buffer.zero_()%0A%0A%20%20%20%20def%20update(self%2C%20audio%3A%20np.ndarray)%20-%3E%20None%3A%0A%20%20%20%20%20%20%20%20%22%22%22%0A%20%20%20%20%20%20%20%20Update%20the%20buffer%20with%20the%20new%20frame%0A%20%20%20%20%20%20%20%20Args%3A%0A%20%20%20%20%20%20%20%20%20%20%20%20frame%20(Frame)%3A%20frame%20to%20update%20the%20buffer%20with%0A%20%20%20%20%20%20%20%20%22%22%22%0A%20%20%20%20%20%20%20%20if%20not%20isinstance(audio%2C%20torch.Tensor)%3A%0A%20%20%20%20%20%20%20%20%20%20%20%20audio%20%3D%20torch.from_numpy(audio)%0A%0A%20%20%20%20%20%20%20%20audio_size%20%3D%20audio.shape%5B0%5D%0A%20%20%20%20%20%20%20%20if%20audio_size%20%3E%20self.buffer_size%3A%0A%20%20%20%20%20%20%20%20%20%20%20%20raise%20ValueError(%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20f%22Frame%20size%20(%7Baudio_size%7D)%20exceeds%20buffer%20size%20(%7Bself.buffer_size%7D)%22%0A%20%20%20%20%20%20%20%20%20%20%20%20)%0A%0A%20%20%20%20%20%20%20%20shift%20%3D%20audio_size%0A%20%20%20%20%20%20%20%20self.sample_buffer%5B%3A-shift%5D%20%3D%20self.sample_buffer%5Bshift%3A%5D.clone()%0A%20%20%20%20%20%20%20%20self.sample_buffer%5B-shift%3A%5D%20%3D%20audio.clone()%0A%0A%20%20%20%20def%20get_buffer(self)%20-%3E%20torch.Tensor%3A%0A%20%20%20%20%20%20%20%20%22%22%22%0A%20%20%20%20%20%20%20%20Get%20the%20current%20buffer%0A%20%20%20%20%20%20%20%20Returns%3A%0A%20%20%20%20%20%20%20%20%20%20%20%20torch.Tensor%3A%20current%20state%20of%20the%20buffer%0A%20%20%20%20%20%20%20%20%22%22%22%0A%20%20%20%20%20%20%20%20return%20self.sample_buffer.clone()%0A%0A%20%20%20%20def%20is_buffer_empty(self)%20-%3E%20bool%3A%0A%20%20%20%20%20%20%20%20%22%22%22%0A%20%20%20%20%20%20%20%20Check%20if%20the%20buffer%20is%20empty%0A%20%20%20%20%20%20%20%20Returns%3A%0A%20%20%20%20%20%20%20%20%20%20%20%20bool%3A%20True%20if%20the%20buffer%20is%20empty%2C%20False%20otherwise%0A%20%20%20%20%20%20%20%20%22%22%22%0A%20%20%20%20%20%20%20%20return%20self.sample_buffer.sum()%20%3D%3D%200%0A%0A%0Aclass%20CacheFeatureBufferer%3A%0A%20%20%20%20def%20__init__(%0A%20%20%20%20%20%20%20%20self%2C%0A%20%20%20%20%20%20%20%20sample_rate%3A%20int%2C%0A%20%20%20%20%20%20%20%20buffer_size_in_secs%3A%20float%2C%0A%20%20%20%20%20%20%20%20chunk_size_in_secs%3A%20float%2C%0A%20%20%20%20%20%20%20%20preprocessor_cfg%3A%20DictConfig%2C%0A%20%20%20%20%20%20%20%20device%3A%20torch.device%2C%0A%20%20%20%20%20%20%20%20fill_value%3A%20float%20%3D%20LOG_MEL_ZERO%2C%0A%20%20%20%20)%3A%0A%20%20%20%20%20%20%20%20if%20buffer_size_in_secs%20%3C%20chunk_size_in_secs%3A%0A%20%20%20%20%20%20%20%20%20%20%20%20raise%20ValueError(%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20f%22Buffer%20size%20(%7Bbuffer_size_in_secs%7Ds)%20should%20be%20no%20less%20than%20chunk%20size%20(%7Bchunk_size_in_secs%7Ds)%22%0A%20%20%20%20%20%20%20%20%20%20%20%20)%0A%0A%20%20%20%20%20%20%20%20self.sample_rate%20%3D%20sample_rate%0A%20%20%20%20%20%20%20%20self.buffer_size_in_secs%20%3D%20buffer_size_in_secs%0A%20%20%20%20%20%20%20%20self.chunk_size_in_secs%20%3D%20chunk_size_in_secs%0A%20%20%20%20%20%20%20%20self.device%20%3D%20device%0A%0A%20%20%20%20%20%20%20%20if%20hasattr(preprocessor_cfg%2C%20%22log%22)%20and%20preprocessor_cfg.log%3A%0A%20%20%20%20%20%20%20%20%20%20%20%20self.ZERO_LEVEL_SPEC_DB_VAL%20%3D%20(%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20LOG_MEL_ZERO%20%20%23%20Log-Mel%20spectrogram%20value%20for%20zero%20signals%0A%20%20%20%20%20%20%20%20%20%20%20%20)%0A%20%20%20%20%20%20%20%20else%3A%0A%20%20%20%20%20%20%20%20%20%20%20%20self.ZERO_LEVEL_SPEC_DB_VAL%20%3D%20fill_value%0A%0A%20%20%20%20%20%20%20%20self.n_feat%20%3D%20preprocessor_cfg.features%0A%20%20%20%20%20%20%20%20self.timestep_duration%20%3D%20preprocessor_cfg.window_stride%0A%20%20%20%20%20%20%20%20self.n_chunk_look_back%20%3D%20int(self.timestep_duration%20*%20self.sample_rate)%0A%20%20%20%20%20%20%20%20self.chunk_size%20%3D%20int(self.chunk_size_in_secs%20*%20self.sample_rate)%0A%20%20%20%20%20%20%20%20self.sample_buffer%20%3D%20AudioBufferer(sample_rate%2C%20buffer_size_in_secs)%0A%0A%20%20%20%20%20%20%20%20self.feature_buffer_len%20%3D%20int(buffer_size_in_secs%20%2F%20self.timestep_duration)%0A%20%20%20%20%20%20%20%20self.feature_chunk_len%20%3D%20int(chunk_size_in_secs%20%2F%20self.timestep_duration)%0A%20%20%20%20%20%20%20%20self.feature_buffer%20%3D%20torch.full(%0A%20%20%20%20%20%20%20%20%20%20%20%20%5Bself.n_feat%2C%20self.feature_buffer_len%5D%2C%0A%20%20%20%20%20%20%20%20%20%20%20%20self.ZERO_LEVEL_SPEC_DB_VAL%2C%0A%20%20%20%20%20%20%20%20%20%20%20%20dtype%3Dtorch.float32%2C%0A%20%20%20%20%20%20%20%20%20%20%20%20device%3Dself.device%2C%0A%20%20%20%20%20%20%20%20)%0A%0A%20%20%20%20%20%20%20%20self.preprocessor%20%3D%20nemo_asr.models.ASRModel.from_config_dict(preprocessor_cfg)%0A%20%20%20%20%20%20%20%20self.preprocessor.to(self.device)%0A%0A%20%20%20%20def%20is_buffer_empty(self)%20-%3E%20bool%3A%0A%20%20%20%20%20%20%20%20%22%22%22%0A%20%20%20%20%20%20%20%20Check%20if%20the%20buffer%20is%20empty%0A%20%20%20%20%20%20%20%20Returns%3A%0A%20%20%20%20%20%20%20%20%20%20%20%20bool%3A%20True%20if%20the%20buffer%20is%20empty%2C%20False%20otherwise%0A%20%20%20%20%20%20%20%20%22%22%22%0A%20%20%20%20%20%20%20%20return%20self.sample_buffer.is_buffer_empty()%0A%0A%20%20%20%20def%20reset(self)%20-%3E%20None%3A%0A%20%20%20%20%20%20%20%20%22%22%22%0A%20%20%20%20%20%20%20%20Reset%20the%20buffer%20to%20zero%0A%20%20%20%20%20%20%20%20%22%22%22%0A%20%20%20%20%20%20%20%20self.sample_buffer.reset()%0A%20%20%20%20%20%20%20%20self.feature_buffer.fill_(self.ZERO_LEVEL_SPEC_DB_VAL)%0A%0A%20%20%20%20def%20_update_feature_buffer(self%2C%20feat_chunk%3A%20torch.Tensor)%20-%3E%20None%3A%0A%20%20%20%20%20%20%20%20%22%22%22%0A%20%20%20%20%20%20%20%20Add%20an%20extracted%20feature%20to%20%60feature_buffer%60%0A%20%20%20%20%20%20%20%20%22%22%22%0A%20%20%20%20%20%20%20%20self.feature_buffer%5B%3A%2C%20%3A%20-self.feature_chunk_len%5D%20%3D%20self.feature_buffer%5B%0A%20%20%20%20%20%20%20%20%20%20%20%20%3A%2C%20self.feature_chunk_len%20%3A%0A%20%20%20%20%20%20%20%20%5D.clone()%0A%20%20%20%20%20%20%20%20self.feature_buffer%5B%3A%2C%20-self.feature_chunk_len%20%3A%5D%20%3D%20feat_chunk.clone()%0A%0A%20%20%20%20def%20preprocess(self%2C%20audio_signal%3A%20torch.Tensor)%20-%3E%20torch.Tensor%3A%0A%20%20%20%20%20%20%20%20%22%22%22%0A%20%20%20%20%20%20%20%20Preprocess%20the%20audio%20signal%20using%20the%20preprocessor%0A%20%20%20%20%20%20%20%20Args%3A%0A%20%20%20%20%20%20%20%20%20%20%20%20audio_signal%20(torch.Tensor)%3A%20audio%20signal%0A%20%20%20%20%20%20%20%20Returns%3A%0A%20%20%20%20%20%20%20%20%20%20%20%20torch.Tensor%3A%20preprocessed%20features%0A%20%20%20%20%20%20%20%20%22%22%22%0A%20%20%20%20%20%20%20%20audio_signal%20%3D%20audio_signal.unsqueeze_(0).to(self.device)%0A%20%20%20%20%20%20%20%20audio_signal_len%20%3D%20torch.tensor(%5Baudio_signal.shape%5B1%5D%5D%2C%20device%3Dself.device)%0A%20%20%20%20%20%20%20%20features%2C%20_%20%3D%20self.preprocessor(%0A%20%20%20%20%20%20%20%20%20%20%20%20input_signal%3Daudio_signal%2C%0A%20%20%20%20%20%20%20%20%20%20%20%20length%3Daudio_signal_len%2C%0A%20%20%20%20%20%20%20%20)%0A%20%20%20%20%20%20%20%20features%20%3D%20features.squeeze()%0A%20%20%20%20%20%20%20%20return%20features%0A%0A%20%20%20%20def%20update(self%2C%20audio%3A%20np.ndarray)%20-%3E%20None%3A%0A%20%20%20%20%20%20%20%20%22%22%22%0A%20%20%20%20%20%20%20%20Update%20the%20sample%20anf%20feature%20buffers%20with%20the%20new%20frame%0A%20%20%20%20%20%20%20%20Args%3A%0A%20%20%20%20%20%20%20%20%20%20%20%20frame%20(Frame)%3A%20frame%20to%20update%20the%20buffer%20with%0A%20%20%20%20%20%20%20%20%22%22%22%0A%0A%20%20%20%20%20%20%20%20%23%20Update%20the%20sample%20buffer%20with%20the%20new%20frame%0A%20%20%20%20%20%20%20%20self.sample_buffer.update(audio)%0A%0A%20%20%20%20%20%20%20%20if%20math.isclose(self.buffer_size_in_secs%2C%20self.chunk_size_in_secs)%3A%0A%20%20%20%20%20%20%20%20%20%20%20%20%23%20If%20the%20buffer%20size%20is%20equal%20to%20the%20chunk%20size%2C%20just%20take%20the%20whole%20buffer%0A%20%20%20%20%20%20%20%20%20%20%20%20samples%20%3D%20self.sample_buffer.sample_buffer.clone()%0A%20%20%20%20%20%20%20%20else%3A%0A%20%20%20%20%20%20%20%20%20%20%20%20%23%20Add%20look_back%20to%20have%20context%20for%20the%20first%20feature%0A%20%20%20%20%20%20%20%20%20%20%20%20samples%20%3D%20self.sample_buffer.sample_buffer%5B%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20-(self.n_chunk_look_back%20%2B%20self.chunk_size)%20%3A%0A%20%20%20%20%20%20%20%20%20%20%20%20%5D%0A%0A%20%20%20%20%20%20%20%20%23%20Get%20the%20mel%20spectrogram%0A%20%20%20%20%20%20%20%20features%20%3D%20self.preprocess(samples)%0A%0A%20%20%20%20%20%20%20%20%23%20If%20the%20features%20are%20longer%20than%20supposed%20to%20be%2C%20drop%20the%20last%20frames%0A%20%20%20%20%20%20%20%20%23%20Drop%20the%20last%20diff%20frames%20because%20they%20might%20be%20incomplete%0A%20%20%20%20%20%20%20%20if%20(diff%20%3A%3D%20features.shape%5B1%5D%20-%20self.feature_chunk_len%20-%201)%20%3E%200%3A%0A%20%20%20%20%20%20%20%20%20%20%20%20features%20%3D%20features%5B%3A%2C%20%3A-diff%5D%0A%0A%20%20%20%20%20%20%20%20%23%20Update%20the%20feature%20buffer%20with%20the%20new%20features%0A%20%20%20%20%20%20%20%20self._update_feature_buffer(features%5B%3A%2C%20-self.feature_chunk_len%20%3A%5D)%0A%0A%20%20%20%20def%20get_buffer(self)%20-%3E%20torch.Tensor%3A%0A%20%20%20%20%20%20%20%20%22%22%22%0A%20%20%20%20%20%20%20%20Get%20the%20current%20sample%20buffer%0A%20%20%20%20%20%20%20%20Returns%3A%0A%20%20%20%20%20%20%20%20%20%20%20%20torch.Tensor%3A%20current%20state%20of%20the%20buffer%0A%20%20%20%20%20%20%20%20%22%22%22%0A%20%20%20%20%20%20%20%20return%20self.sample_buffer.get_buffer()%0A%0A%20%20%20%20def%20get_feature_buffer(self)%20-%3E%20torch.Tensor%3A%0A%20%20%20%20%20%20%20%20%22%22%22%0A%20%20%20%20%20%20%20%20Get%20the%20current%20feature%20buffer%0A%20%20%20%20%20%20%20%20Returns%3A%0A%20%20%20%20%20%20%20%20%20%20%20%20torch.Tensor%3A%20current%20state%20of%20the%20feature%20buffer%0A%20%20%20%20%20%20%20%20%22%22%22%0A%20%20%20%20%20%20%20%20return%20self.feature_buffer.clone()%0A`,lang:`python`})},$$slots:{default:!0}}))}export{c as default,i as metadata};
//# sourceMappingURL=BKiaSms7.js.map
