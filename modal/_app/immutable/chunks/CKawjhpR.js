(function(){try{var e=typeof window<`u`?window:typeof global<`u`?global:typeof globalThis<`u`?globalThis:typeof self<`u`?self:{};e.SENTRY_RELEASE={id:`f99fcf9f0a844cc9bd13fdc8e5782b84`};var t=new e.Error().stack;t&&(e._sentryDebugIds=e._sentryDebugIds||{},e._sentryDebugIds[t]=`179b39c6-d7f6-4651-a3b4-54a1ac392aa8`,e._sentryDebugIdIdentifier=`sentry-dbid-179b39c6-d7f6-4651-a3b4-54a1ac392aa8`)}catch{}})();import{St as e,Tt as t,bt as n,c as r,d as i,en as a,tn as o,wn as s}from"./F_ixKBiO.js";import"./B1sc9Zdx.js";import"./Bb2deiU3.js";import{o as c}from"./CPby7b1n.js";import{t as l}from"./BILrvr3I.js";import{t as u}from"./B4L_if842.js";var d={toc:[{depth:1,value:`Example (cache_aware_buffer.py)`,id:`example-cache_aware_bufferpy`}],rawContent:`# Example (cache_aware_buffer.py)

This is the source code for **06_gpu_and_ml.speech-to-text.cache_aware_buffer**.

\`\`\`python
import copy

import torch
from nemo.collections.asr.parts.mixins.streaming import StreamingEncoder
from nemo.collections.asr.parts.preprocessing.features import normalize_batch
from nemo.collections.asr.parts.preprocessing.segment import get_samples
from omegaconf import OmegaConf


class CacheAwareStreamingAudioBuffer:
    """
    A buffer to be used for cache-aware streaming. It can load a single or multiple audio
    files/processed signals, split them in chunks and return one on one. It can be used to
    simulate streaming audio or audios.
    """

    def __init__(self, model, online_normalization=None, pad_and_drop_preencoded=False):
        """
        Args:
            model: An ASR model.
            online_normalization (bool): whether to perform online normalization per chunk or
            normalize the whole audio before chunking
            pad_and_drop_preencoded (bool): if true pad first audio chunk and always drop preencoded
        """
        self.model = model
        self.buffer = None
        self.buffer_idx = 0
        self.streams_length = None
        self.step = 0
        self.pad_and_drop_preencoded = pad_and_drop_preencoded

        self.online_normalization = online_normalization
        if not isinstance(model.encoder, StreamingEncoder):
            raise ValueError(
                "The model's encoder is not inherited from StreamingEncoder, and likely not to support streaming!"
            )
        if model.encoder.streaming_cfg is None:
            model.encoder.setup_streaming_params()
        self.streaming_cfg = model.encoder.streaming_cfg

        self.input_features = model.encoder._feat_in

        self.preprocessor = self.extract_preprocessor()

        if hasattr(model.encoder, "pre_encode") and hasattr(
            model.encoder.pre_encode, "get_sampling_frames"
        ):
            self.sampling_frames = model.encoder.pre_encode.get_sampling_frames()
        else:
            self.sampling_frames = None

    def get_next_chunk(self):
        """
        Get the next audio chunk for streaming processing.

        This method can be called repeatedly after appending audio via append_audio()
        to process the audio in a streaming fashion.

        Returns:
            tuple: (audio_chunk, chunk_lengths) if there's data to process, None if buffer is exhausted
                - audio_chunk: tensor containing the audio chunk with pre-encode cache prepended
                - chunk_lengths: tensor containing the valid lengths for each stream in the batch
        """
        if self.buffer is None or self.buffer_idx >= self.buffer.size(-1):
            return None

        # Determine chunk size based on position (first chunk may be different)
        if self.buffer_idx == 0 and isinstance(self.streaming_cfg.chunk_size, list):
            if self.pad_and_drop_preencoded:
                chunk_size = self.streaming_cfg.chunk_size[1]
            else:
                chunk_size = self.streaming_cfg.chunk_size[0]
        else:
            chunk_size = (
                self.streaming_cfg.chunk_size[1]
                if isinstance(self.streaming_cfg.chunk_size, list)
                else self.streaming_cfg.chunk_size
            )

        # Determine shift size based on position (first chunk may be different)
        if self.buffer_idx == 0 and isinstance(self.streaming_cfg.shift_size, list):
            if self.pad_and_drop_preencoded:
                shift_size = self.streaming_cfg.shift_size[1]
            else:
                shift_size = self.streaming_cfg.shift_size[0]
        else:
            shift_size = (
                self.streaming_cfg.shift_size[1]
                if isinstance(self.streaming_cfg.shift_size, list)
                else self.streaming_cfg.shift_size
            )

        # Check if we have enough valid data available for a full chunk
        # We need at least chunk_size frames of valid data from buffer_idx onwards
        available_valid_frames = self.streams_length - self.buffer_idx
        if available_valid_frames.min() < chunk_size:
            # Not enough data accumulated yet, wait for more audio
            return None

        # Extract the current audio chunk
        audio_chunk = self.buffer[:, :, self.buffer_idx : self.buffer_idx + chunk_size]

        # Check if we have enough frames for downsampling (if applicable)
        if self.sampling_frames is not None:
            if self.buffer_idx == 0 and isinstance(self.sampling_frames, list):
                cur_sampling_frames = self.sampling_frames[0]
            else:
                cur_sampling_frames = (
                    self.sampling_frames[1]
                    if isinstance(self.sampling_frames, list)
                    else self.sampling_frames
                )
            if audio_chunk.size(-1) < cur_sampling_frames:
                return None

        # Add the pre-encode cache to the chunk
        zeros_pads = None
        if self.buffer_idx == 0 and isinstance(
            self.streaming_cfg.pre_encode_cache_size, list
        ):
            if self.pad_and_drop_preencoded:
                cache_pre_encode_num_frames = self.streaming_cfg.pre_encode_cache_size[
                    1
                ]
            else:
                cache_pre_encode_num_frames = self.streaming_cfg.pre_encode_cache_size[
                    0
                ]
            cache_pre_encode = torch.zeros(
                (audio_chunk.size(0), self.input_features, cache_pre_encode_num_frames),
                device=audio_chunk.device,
                dtype=audio_chunk.dtype,
            )
        else:
            if isinstance(self.streaming_cfg.pre_encode_cache_size, list):
                pre_encode_cache_size = self.streaming_cfg.pre_encode_cache_size[1]
            else:
                pre_encode_cache_size = self.streaming_cfg.pre_encode_cache_size

            start_pre_encode_cache = self.buffer_idx - pre_encode_cache_size
            if start_pre_encode_cache < 0:
                start_pre_encode_cache = 0
            cache_pre_encode = self.buffer[
                :, :, start_pre_encode_cache : self.buffer_idx
            ]
            if cache_pre_encode.size(-1) < pre_encode_cache_size:
                zeros_pads = torch.zeros(
                    (
                        audio_chunk.size(0),
                        audio_chunk.size(-2),
                        pre_encode_cache_size - cache_pre_encode.size(-1),
                    ),
                    device=audio_chunk.device,
                    dtype=audio_chunk.dtype,
                )

        added_len = cache_pre_encode.size(-1)
        audio_chunk = torch.cat((cache_pre_encode, audio_chunk), dim=-1)

        # Apply online normalization if enabled
        if self.online_normalization:
            audio_chunk, x_mean, x_std = normalize_batch(
                x=audio_chunk,
                seq_len=torch.tensor([audio_chunk.size(-1)] * audio_chunk.size(0)),
                normalize_type=self.model_normalize_type,
            )

        # Add zero padding if needed
        if zeros_pads is not None:
            audio_chunk = torch.cat((zeros_pads, audio_chunk), dim=-1)
            added_len += zeros_pads.size(-1)

        # Calculate valid chunk lengths for each stream
        max_chunk_lengths = self.streams_length - self.buffer_idx
        max_chunk_lengths = max_chunk_lengths + added_len
        chunk_lengths = torch.clamp(max_chunk_lengths, min=0, max=audio_chunk.size(-1))

        # Update buffer position and step counter
        print(
            f"[get_next_chunk] BEFORE: buffer_idx={self.buffer_idx}, shift_size={shift_size}, streams_length={self.streams_length}, chunk_lengths={chunk_lengths}"
        )
        self.buffer_idx += shift_size
        self.step += 1
        print(
            f"[get_next_chunk] AFTER: buffer_idx={self.buffer_idx}, buffer.size(-1)={self.buffer.size(-1)}"
        )

        return audio_chunk, chunk_lengths

    def __iter__(self):
        """
        Iterator interface for batch processing.
        Yields chunks by repeatedly calling get_next_chunk().
        """
        while True:
            result = self.get_next_chunk()
            if result is None:
                return
            yield result

    def is_buffer_empty(self):
        if self.buffer_idx >= self.buffer.size(-1):
            return True
        else:
            return False

    def has_next_chunk(self):
        """
        Check if there are more chunks available to process.

        Returns:
            bool: True if get_next_chunk() will return data, False otherwise
        """
        if self.buffer is None or self.streams_length is None:
            return False

        # Determine the required chunk size for the next chunk
        if self.buffer_idx == 0 and isinstance(self.streaming_cfg.chunk_size, list):
            if self.pad_and_drop_preencoded:
                chunk_size = self.streaming_cfg.chunk_size[1]
            else:
                chunk_size = self.streaming_cfg.chunk_size[0]
        else:
            chunk_size = (
                self.streaming_cfg.chunk_size[1]
                if isinstance(self.streaming_cfg.chunk_size, list)
                else self.streaming_cfg.chunk_size
            )

        # Check if we have enough valid data available
        available_valid_frames = self.streams_length - self.buffer_idx
        return available_valid_frames.min() >= chunk_size

    def __len__(self):
        return len(self.buffer)

    def reset_buffer(self):
        self.buffer = None
        self.buffer_idx = 0
        self.streams_length = None
        self.step = 0

    def reset_buffer_pointer(self):
        self.buffer_idx = 0
        self.step = 0

    def extract_preprocessor(self):
        cfg = copy.deepcopy(self.model._cfg)
        self.model_normalize_type = cfg.preprocessor.normalize
        OmegaConf.set_struct(cfg.preprocessor, False)
        cfg.preprocessor.dither = 0.0
        cfg.preprocessor.pad_to = 0
        if self.online_normalization:
            cfg.preprocessor.normalize = "None"

        preprocessor = self.model.from_config_dict(cfg.preprocessor)
        return preprocessor.to(self.get_model_device())

    def append_audio_file(self, audio_filepath, stream_id=-1):
        audio = get_samples(audio_filepath)
        processed_signal, processed_signal_length, stream_id = self.append_audio(
            audio, stream_id
        )
        return processed_signal, processed_signal_length, stream_id

    def append_audio(self, audio, stream_id=-1):
        processed_signal, processed_signal_length = self.preprocess_audio(audio)
        print(
            f"[append_audio] Audio samples: {len(audio)}, Preprocessed to {processed_signal_length} frames"
        )
        processed_signal, processed_signal_length, stream_id = (
            self.append_processed_signal(processed_signal, stream_id)
        )
        print(
            f"[append_audio] After append: stream_id={stream_id}, streams_length={self.streams_length}, buffer_idx={self.buffer_idx}"
        )
        return processed_signal, processed_signal_length, stream_id

    def append_processed_signal(self, processed_signal, stream_id=-1):
        processed_signal_length = torch.tensor(
            processed_signal.size(-1), device=processed_signal.device
        )
        if stream_id >= 0 and (
            self.streams_length is not None and stream_id >= len(self.streams_length)
        ):
            raise ValueError("Not valid stream_id!")
        if self.buffer is None:
            if stream_id >= 0:
                raise ValueError(
                    "stream_id can not be specified when there is no stream."
                )
            self.buffer = processed_signal
            self.streams_length = torch.tensor(
                [processed_signal_length], device=processed_signal.device
            )
        else:
            if self.buffer.size(1) != processed_signal.size(1):
                raise ValueError(
                    "Buffer and the processed signal have different dimensions!"
                )
            if stream_id < 0:
                self.buffer = torch.nn.functional.pad(
                    self.buffer, pad=(0, 0, 0, 0, 0, 1)
                )
                self.streams_length = torch.cat(
                    (
                        self.streams_length,
                        torch.tensor([0], device=self.streams_length.device),
                    ),
                    dim=-1,
                )
                stream_id = len(self.streams_length) - 1
            needed_len = self.streams_length[stream_id] + processed_signal_length
            if needed_len > self.buffer.size(-1):
                self.buffer = torch.nn.functional.pad(
                    self.buffer, pad=(0, needed_len - self.buffer.size(-1))
                )

            self.buffer[
                stream_id,
                :,
                self.streams_length[stream_id] : self.streams_length[stream_id]
                + processed_signal_length,
            ] = processed_signal
            self.streams_length[stream_id] = self.streams_length[
                stream_id
            ] + processed_signal.size(-1)

        if self.online_normalization:
            processed_signal, x_mean, x_std = normalize_batch(
                x=processed_signal,
                seq_len=torch.tensor([processed_signal_length]),
                normalize_type=self.model_normalize_type,
            )
        return processed_signal, processed_signal_length, stream_id

    def get_model_device(self):
        return self.model.device

    def preprocess_audio(self, audio, device=None):
        if device is None:
            device = self.get_model_device()
        audio_signal = torch.from_numpy(audio).unsqueeze_(0).to(device)
        audio_signal_len = torch.Tensor([audio.shape[0]]).to(device)
        processed_signal, processed_signal_length = self.preprocessor(
            input_signal=audio_signal, length=audio_signal_len
        )
        return processed_signal, processed_signal_length

    def get_all_audios(self):
        processed_signal = self.buffer
        if self.online_normalization:
            processed_signal, x_mean, x_std = normalize_batch(
                x=processed_signal,
                seq_len=torch.tensor(self.streams_length),
                normalize_type=self.model_normalize_type,
            )
        return processed_signal, self.streams_length

\`\`\`
`,meta:{title:`Example (cache_aware_buffer.py)`,description:`This is the source code for 06_gpu_and_ml.speech-to-text.cache_aware_buffer.`}},{toc:f,rawContent:p,meta:m}=d,h=e(`<!> <p>This is the source code for <strong>06_gpu_and_ml.speech-to-text.cache_aware_buffer</strong>.</p> <!>`,1);function g(e,f){let p=r(f,[`children`,`$$slots`,`$$events`,`$$legacy`]);u(e,i(()=>p,()=>d,{children:(e,r)=>{var i=h(),u=a(i);c(u,{id:`example-cache_aware_bufferpy`,children:(e,r)=>{s(),n(e,t(`Example (cache_aware_buffer.py)`))},$$slots:{default:!0}}),l(o(u,4),{code:`import%20copy%0A%0Aimport%20torch%0Afrom%20nemo.collections.asr.parts.mixins.streaming%20import%20StreamingEncoder%0Afrom%20nemo.collections.asr.parts.preprocessing.features%20import%20normalize_batch%0Afrom%20nemo.collections.asr.parts.preprocessing.segment%20import%20get_samples%0Afrom%20omegaconf%20import%20OmegaConf%0A%0A%0Aclass%20CacheAwareStreamingAudioBuffer%3A%0A%20%20%20%20%22%22%22%0A%20%20%20%20A%20buffer%20to%20be%20used%20for%20cache-aware%20streaming.%20It%20can%20load%20a%20single%20or%20multiple%20audio%0A%20%20%20%20files%2Fprocessed%20signals%2C%20split%20them%20in%20chunks%20and%20return%20one%20on%20one.%20It%20can%20be%20used%20to%0A%20%20%20%20simulate%20streaming%20audio%20or%20audios.%0A%20%20%20%20%22%22%22%0A%0A%20%20%20%20def%20__init__(self%2C%20model%2C%20online_normalization%3DNone%2C%20pad_and_drop_preencoded%3DFalse)%3A%0A%20%20%20%20%20%20%20%20%22%22%22%0A%20%20%20%20%20%20%20%20Args%3A%0A%20%20%20%20%20%20%20%20%20%20%20%20model%3A%20An%20ASR%20model.%0A%20%20%20%20%20%20%20%20%20%20%20%20online_normalization%20(bool)%3A%20whether%20to%20perform%20online%20normalization%20per%20chunk%20or%0A%20%20%20%20%20%20%20%20%20%20%20%20normalize%20the%20whole%20audio%20before%20chunking%0A%20%20%20%20%20%20%20%20%20%20%20%20pad_and_drop_preencoded%20(bool)%3A%20if%20true%20pad%20first%20audio%20chunk%20and%20always%20drop%20preencoded%0A%20%20%20%20%20%20%20%20%22%22%22%0A%20%20%20%20%20%20%20%20self.model%20%3D%20model%0A%20%20%20%20%20%20%20%20self.buffer%20%3D%20None%0A%20%20%20%20%20%20%20%20self.buffer_idx%20%3D%200%0A%20%20%20%20%20%20%20%20self.streams_length%20%3D%20None%0A%20%20%20%20%20%20%20%20self.step%20%3D%200%0A%20%20%20%20%20%20%20%20self.pad_and_drop_preencoded%20%3D%20pad_and_drop_preencoded%0A%0A%20%20%20%20%20%20%20%20self.online_normalization%20%3D%20online_normalization%0A%20%20%20%20%20%20%20%20if%20not%20isinstance(model.encoder%2C%20StreamingEncoder)%3A%0A%20%20%20%20%20%20%20%20%20%20%20%20raise%20ValueError(%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%22The%20model's%20encoder%20is%20not%20inherited%20from%20StreamingEncoder%2C%20and%20likely%20not%20to%20support%20streaming!%22%0A%20%20%20%20%20%20%20%20%20%20%20%20)%0A%20%20%20%20%20%20%20%20if%20model.encoder.streaming_cfg%20is%20None%3A%0A%20%20%20%20%20%20%20%20%20%20%20%20model.encoder.setup_streaming_params()%0A%20%20%20%20%20%20%20%20self.streaming_cfg%20%3D%20model.encoder.streaming_cfg%0A%0A%20%20%20%20%20%20%20%20self.input_features%20%3D%20model.encoder._feat_in%0A%0A%20%20%20%20%20%20%20%20self.preprocessor%20%3D%20self.extract_preprocessor()%0A%0A%20%20%20%20%20%20%20%20if%20hasattr(model.encoder%2C%20%22pre_encode%22)%20and%20hasattr(%0A%20%20%20%20%20%20%20%20%20%20%20%20model.encoder.pre_encode%2C%20%22get_sampling_frames%22%0A%20%20%20%20%20%20%20%20)%3A%0A%20%20%20%20%20%20%20%20%20%20%20%20self.sampling_frames%20%3D%20model.encoder.pre_encode.get_sampling_frames()%0A%20%20%20%20%20%20%20%20else%3A%0A%20%20%20%20%20%20%20%20%20%20%20%20self.sampling_frames%20%3D%20None%0A%0A%20%20%20%20def%20get_next_chunk(self)%3A%0A%20%20%20%20%20%20%20%20%22%22%22%0A%20%20%20%20%20%20%20%20Get%20the%20next%20audio%20chunk%20for%20streaming%20processing.%0A%0A%20%20%20%20%20%20%20%20This%20method%20can%20be%20called%20repeatedly%20after%20appending%20audio%20via%20append_audio()%0A%20%20%20%20%20%20%20%20to%20process%20the%20audio%20in%20a%20streaming%20fashion.%0A%0A%20%20%20%20%20%20%20%20Returns%3A%0A%20%20%20%20%20%20%20%20%20%20%20%20tuple%3A%20(audio_chunk%2C%20chunk_lengths)%20if%20there's%20data%20to%20process%2C%20None%20if%20buffer%20is%20exhausted%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20-%20audio_chunk%3A%20tensor%20containing%20the%20audio%20chunk%20with%20pre-encode%20cache%20prepended%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20-%20chunk_lengths%3A%20tensor%20containing%20the%20valid%20lengths%20for%20each%20stream%20in%20the%20batch%0A%20%20%20%20%20%20%20%20%22%22%22%0A%20%20%20%20%20%20%20%20if%20self.buffer%20is%20None%20or%20self.buffer_idx%20%3E%3D%20self.buffer.size(-1)%3A%0A%20%20%20%20%20%20%20%20%20%20%20%20return%20None%0A%0A%20%20%20%20%20%20%20%20%23%20Determine%20chunk%20size%20based%20on%20position%20(first%20chunk%20may%20be%20different)%0A%20%20%20%20%20%20%20%20if%20self.buffer_idx%20%3D%3D%200%20and%20isinstance(self.streaming_cfg.chunk_size%2C%20list)%3A%0A%20%20%20%20%20%20%20%20%20%20%20%20if%20self.pad_and_drop_preencoded%3A%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20chunk_size%20%3D%20self.streaming_cfg.chunk_size%5B1%5D%0A%20%20%20%20%20%20%20%20%20%20%20%20else%3A%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20chunk_size%20%3D%20self.streaming_cfg.chunk_size%5B0%5D%0A%20%20%20%20%20%20%20%20else%3A%0A%20%20%20%20%20%20%20%20%20%20%20%20chunk_size%20%3D%20(%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20self.streaming_cfg.chunk_size%5B1%5D%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20if%20isinstance(self.streaming_cfg.chunk_size%2C%20list)%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20else%20self.streaming_cfg.chunk_size%0A%20%20%20%20%20%20%20%20%20%20%20%20)%0A%0A%20%20%20%20%20%20%20%20%23%20Determine%20shift%20size%20based%20on%20position%20(first%20chunk%20may%20be%20different)%0A%20%20%20%20%20%20%20%20if%20self.buffer_idx%20%3D%3D%200%20and%20isinstance(self.streaming_cfg.shift_size%2C%20list)%3A%0A%20%20%20%20%20%20%20%20%20%20%20%20if%20self.pad_and_drop_preencoded%3A%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20shift_size%20%3D%20self.streaming_cfg.shift_size%5B1%5D%0A%20%20%20%20%20%20%20%20%20%20%20%20else%3A%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20shift_size%20%3D%20self.streaming_cfg.shift_size%5B0%5D%0A%20%20%20%20%20%20%20%20else%3A%0A%20%20%20%20%20%20%20%20%20%20%20%20shift_size%20%3D%20(%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20self.streaming_cfg.shift_size%5B1%5D%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20if%20isinstance(self.streaming_cfg.shift_size%2C%20list)%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20else%20self.streaming_cfg.shift_size%0A%20%20%20%20%20%20%20%20%20%20%20%20)%0A%0A%20%20%20%20%20%20%20%20%23%20Check%20if%20we%20have%20enough%20valid%20data%20available%20for%20a%20full%20chunk%0A%20%20%20%20%20%20%20%20%23%20We%20need%20at%20least%20chunk_size%20frames%20of%20valid%20data%20from%20buffer_idx%20onwards%0A%20%20%20%20%20%20%20%20available_valid_frames%20%3D%20self.streams_length%20-%20self.buffer_idx%0A%20%20%20%20%20%20%20%20if%20available_valid_frames.min()%20%3C%20chunk_size%3A%0A%20%20%20%20%20%20%20%20%20%20%20%20%23%20Not%20enough%20data%20accumulated%20yet%2C%20wait%20for%20more%20audio%0A%20%20%20%20%20%20%20%20%20%20%20%20return%20None%0A%0A%20%20%20%20%20%20%20%20%23%20Extract%20the%20current%20audio%20chunk%0A%20%20%20%20%20%20%20%20audio_chunk%20%3D%20self.buffer%5B%3A%2C%20%3A%2C%20self.buffer_idx%20%3A%20self.buffer_idx%20%2B%20chunk_size%5D%0A%0A%20%20%20%20%20%20%20%20%23%20Check%20if%20we%20have%20enough%20frames%20for%20downsampling%20(if%20applicable)%0A%20%20%20%20%20%20%20%20if%20self.sampling_frames%20is%20not%20None%3A%0A%20%20%20%20%20%20%20%20%20%20%20%20if%20self.buffer_idx%20%3D%3D%200%20and%20isinstance(self.sampling_frames%2C%20list)%3A%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20cur_sampling_frames%20%3D%20self.sampling_frames%5B0%5D%0A%20%20%20%20%20%20%20%20%20%20%20%20else%3A%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20cur_sampling_frames%20%3D%20(%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20self.sampling_frames%5B1%5D%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20if%20isinstance(self.sampling_frames%2C%20list)%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20else%20self.sampling_frames%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20)%0A%20%20%20%20%20%20%20%20%20%20%20%20if%20audio_chunk.size(-1)%20%3C%20cur_sampling_frames%3A%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20return%20None%0A%0A%20%20%20%20%20%20%20%20%23%20Add%20the%20pre-encode%20cache%20to%20the%20chunk%0A%20%20%20%20%20%20%20%20zeros_pads%20%3D%20None%0A%20%20%20%20%20%20%20%20if%20self.buffer_idx%20%3D%3D%200%20and%20isinstance(%0A%20%20%20%20%20%20%20%20%20%20%20%20self.streaming_cfg.pre_encode_cache_size%2C%20list%0A%20%20%20%20%20%20%20%20)%3A%0A%20%20%20%20%20%20%20%20%20%20%20%20if%20self.pad_and_drop_preencoded%3A%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20cache_pre_encode_num_frames%20%3D%20self.streaming_cfg.pre_encode_cache_size%5B%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%201%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%5D%0A%20%20%20%20%20%20%20%20%20%20%20%20else%3A%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20cache_pre_encode_num_frames%20%3D%20self.streaming_cfg.pre_encode_cache_size%5B%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%200%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%5D%0A%20%20%20%20%20%20%20%20%20%20%20%20cache_pre_encode%20%3D%20torch.zeros(%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20(audio_chunk.size(0)%2C%20self.input_features%2C%20cache_pre_encode_num_frames)%2C%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20device%3Daudio_chunk.device%2C%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20dtype%3Daudio_chunk.dtype%2C%0A%20%20%20%20%20%20%20%20%20%20%20%20)%0A%20%20%20%20%20%20%20%20else%3A%0A%20%20%20%20%20%20%20%20%20%20%20%20if%20isinstance(self.streaming_cfg.pre_encode_cache_size%2C%20list)%3A%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20pre_encode_cache_size%20%3D%20self.streaming_cfg.pre_encode_cache_size%5B1%5D%0A%20%20%20%20%20%20%20%20%20%20%20%20else%3A%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20pre_encode_cache_size%20%3D%20self.streaming_cfg.pre_encode_cache_size%0A%0A%20%20%20%20%20%20%20%20%20%20%20%20start_pre_encode_cache%20%3D%20self.buffer_idx%20-%20pre_encode_cache_size%0A%20%20%20%20%20%20%20%20%20%20%20%20if%20start_pre_encode_cache%20%3C%200%3A%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20start_pre_encode_cache%20%3D%200%0A%20%20%20%20%20%20%20%20%20%20%20%20cache_pre_encode%20%3D%20self.buffer%5B%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%3A%2C%20%3A%2C%20start_pre_encode_cache%20%3A%20self.buffer_idx%0A%20%20%20%20%20%20%20%20%20%20%20%20%5D%0A%20%20%20%20%20%20%20%20%20%20%20%20if%20cache_pre_encode.size(-1)%20%3C%20pre_encode_cache_size%3A%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20zeros_pads%20%3D%20torch.zeros(%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20(%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20audio_chunk.size(0)%2C%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20audio_chunk.size(-2)%2C%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20pre_encode_cache_size%20-%20cache_pre_encode.size(-1)%2C%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20)%2C%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20device%3Daudio_chunk.device%2C%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20dtype%3Daudio_chunk.dtype%2C%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20)%0A%0A%20%20%20%20%20%20%20%20added_len%20%3D%20cache_pre_encode.size(-1)%0A%20%20%20%20%20%20%20%20audio_chunk%20%3D%20torch.cat((cache_pre_encode%2C%20audio_chunk)%2C%20dim%3D-1)%0A%0A%20%20%20%20%20%20%20%20%23%20Apply%20online%20normalization%20if%20enabled%0A%20%20%20%20%20%20%20%20if%20self.online_normalization%3A%0A%20%20%20%20%20%20%20%20%20%20%20%20audio_chunk%2C%20x_mean%2C%20x_std%20%3D%20normalize_batch(%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20x%3Daudio_chunk%2C%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20seq_len%3Dtorch.tensor(%5Baudio_chunk.size(-1)%5D%20*%20audio_chunk.size(0))%2C%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20normalize_type%3Dself.model_normalize_type%2C%0A%20%20%20%20%20%20%20%20%20%20%20%20)%0A%0A%20%20%20%20%20%20%20%20%23%20Add%20zero%20padding%20if%20needed%0A%20%20%20%20%20%20%20%20if%20zeros_pads%20is%20not%20None%3A%0A%20%20%20%20%20%20%20%20%20%20%20%20audio_chunk%20%3D%20torch.cat((zeros_pads%2C%20audio_chunk)%2C%20dim%3D-1)%0A%20%20%20%20%20%20%20%20%20%20%20%20added_len%20%2B%3D%20zeros_pads.size(-1)%0A%0A%20%20%20%20%20%20%20%20%23%20Calculate%20valid%20chunk%20lengths%20for%20each%20stream%0A%20%20%20%20%20%20%20%20max_chunk_lengths%20%3D%20self.streams_length%20-%20self.buffer_idx%0A%20%20%20%20%20%20%20%20max_chunk_lengths%20%3D%20max_chunk_lengths%20%2B%20added_len%0A%20%20%20%20%20%20%20%20chunk_lengths%20%3D%20torch.clamp(max_chunk_lengths%2C%20min%3D0%2C%20max%3Daudio_chunk.size(-1))%0A%0A%20%20%20%20%20%20%20%20%23%20Update%20buffer%20position%20and%20step%20counter%0A%20%20%20%20%20%20%20%20print(%0A%20%20%20%20%20%20%20%20%20%20%20%20f%22%5Bget_next_chunk%5D%20BEFORE%3A%20buffer_idx%3D%7Bself.buffer_idx%7D%2C%20shift_size%3D%7Bshift_size%7D%2C%20streams_length%3D%7Bself.streams_length%7D%2C%20chunk_lengths%3D%7Bchunk_lengths%7D%22%0A%20%20%20%20%20%20%20%20)%0A%20%20%20%20%20%20%20%20self.buffer_idx%20%2B%3D%20shift_size%0A%20%20%20%20%20%20%20%20self.step%20%2B%3D%201%0A%20%20%20%20%20%20%20%20print(%0A%20%20%20%20%20%20%20%20%20%20%20%20f%22%5Bget_next_chunk%5D%20AFTER%3A%20buffer_idx%3D%7Bself.buffer_idx%7D%2C%20buffer.size(-1)%3D%7Bself.buffer.size(-1)%7D%22%0A%20%20%20%20%20%20%20%20)%0A%0A%20%20%20%20%20%20%20%20return%20audio_chunk%2C%20chunk_lengths%0A%0A%20%20%20%20def%20__iter__(self)%3A%0A%20%20%20%20%20%20%20%20%22%22%22%0A%20%20%20%20%20%20%20%20Iterator%20interface%20for%20batch%20processing.%0A%20%20%20%20%20%20%20%20Yields%20chunks%20by%20repeatedly%20calling%20get_next_chunk().%0A%20%20%20%20%20%20%20%20%22%22%22%0A%20%20%20%20%20%20%20%20while%20True%3A%0A%20%20%20%20%20%20%20%20%20%20%20%20result%20%3D%20self.get_next_chunk()%0A%20%20%20%20%20%20%20%20%20%20%20%20if%20result%20is%20None%3A%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20return%0A%20%20%20%20%20%20%20%20%20%20%20%20yield%20result%0A%0A%20%20%20%20def%20is_buffer_empty(self)%3A%0A%20%20%20%20%20%20%20%20if%20self.buffer_idx%20%3E%3D%20self.buffer.size(-1)%3A%0A%20%20%20%20%20%20%20%20%20%20%20%20return%20True%0A%20%20%20%20%20%20%20%20else%3A%0A%20%20%20%20%20%20%20%20%20%20%20%20return%20False%0A%0A%20%20%20%20def%20has_next_chunk(self)%3A%0A%20%20%20%20%20%20%20%20%22%22%22%0A%20%20%20%20%20%20%20%20Check%20if%20there%20are%20more%20chunks%20available%20to%20process.%0A%0A%20%20%20%20%20%20%20%20Returns%3A%0A%20%20%20%20%20%20%20%20%20%20%20%20bool%3A%20True%20if%20get_next_chunk()%20will%20return%20data%2C%20False%20otherwise%0A%20%20%20%20%20%20%20%20%22%22%22%0A%20%20%20%20%20%20%20%20if%20self.buffer%20is%20None%20or%20self.streams_length%20is%20None%3A%0A%20%20%20%20%20%20%20%20%20%20%20%20return%20False%0A%0A%20%20%20%20%20%20%20%20%23%20Determine%20the%20required%20chunk%20size%20for%20the%20next%20chunk%0A%20%20%20%20%20%20%20%20if%20self.buffer_idx%20%3D%3D%200%20and%20isinstance(self.streaming_cfg.chunk_size%2C%20list)%3A%0A%20%20%20%20%20%20%20%20%20%20%20%20if%20self.pad_and_drop_preencoded%3A%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20chunk_size%20%3D%20self.streaming_cfg.chunk_size%5B1%5D%0A%20%20%20%20%20%20%20%20%20%20%20%20else%3A%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20chunk_size%20%3D%20self.streaming_cfg.chunk_size%5B0%5D%0A%20%20%20%20%20%20%20%20else%3A%0A%20%20%20%20%20%20%20%20%20%20%20%20chunk_size%20%3D%20(%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20self.streaming_cfg.chunk_size%5B1%5D%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20if%20isinstance(self.streaming_cfg.chunk_size%2C%20list)%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20else%20self.streaming_cfg.chunk_size%0A%20%20%20%20%20%20%20%20%20%20%20%20)%0A%0A%20%20%20%20%20%20%20%20%23%20Check%20if%20we%20have%20enough%20valid%20data%20available%0A%20%20%20%20%20%20%20%20available_valid_frames%20%3D%20self.streams_length%20-%20self.buffer_idx%0A%20%20%20%20%20%20%20%20return%20available_valid_frames.min()%20%3E%3D%20chunk_size%0A%0A%20%20%20%20def%20__len__(self)%3A%0A%20%20%20%20%20%20%20%20return%20len(self.buffer)%0A%0A%20%20%20%20def%20reset_buffer(self)%3A%0A%20%20%20%20%20%20%20%20self.buffer%20%3D%20None%0A%20%20%20%20%20%20%20%20self.buffer_idx%20%3D%200%0A%20%20%20%20%20%20%20%20self.streams_length%20%3D%20None%0A%20%20%20%20%20%20%20%20self.step%20%3D%200%0A%0A%20%20%20%20def%20reset_buffer_pointer(self)%3A%0A%20%20%20%20%20%20%20%20self.buffer_idx%20%3D%200%0A%20%20%20%20%20%20%20%20self.step%20%3D%200%0A%0A%20%20%20%20def%20extract_preprocessor(self)%3A%0A%20%20%20%20%20%20%20%20cfg%20%3D%20copy.deepcopy(self.model._cfg)%0A%20%20%20%20%20%20%20%20self.model_normalize_type%20%3D%20cfg.preprocessor.normalize%0A%20%20%20%20%20%20%20%20OmegaConf.set_struct(cfg.preprocessor%2C%20False)%0A%20%20%20%20%20%20%20%20cfg.preprocessor.dither%20%3D%200.0%0A%20%20%20%20%20%20%20%20cfg.preprocessor.pad_to%20%3D%200%0A%20%20%20%20%20%20%20%20if%20self.online_normalization%3A%0A%20%20%20%20%20%20%20%20%20%20%20%20cfg.preprocessor.normalize%20%3D%20%22None%22%0A%0A%20%20%20%20%20%20%20%20preprocessor%20%3D%20self.model.from_config_dict(cfg.preprocessor)%0A%20%20%20%20%20%20%20%20return%20preprocessor.to(self.get_model_device())%0A%0A%20%20%20%20def%20append_audio_file(self%2C%20audio_filepath%2C%20stream_id%3D-1)%3A%0A%20%20%20%20%20%20%20%20audio%20%3D%20get_samples(audio_filepath)%0A%20%20%20%20%20%20%20%20processed_signal%2C%20processed_signal_length%2C%20stream_id%20%3D%20self.append_audio(%0A%20%20%20%20%20%20%20%20%20%20%20%20audio%2C%20stream_id%0A%20%20%20%20%20%20%20%20)%0A%20%20%20%20%20%20%20%20return%20processed_signal%2C%20processed_signal_length%2C%20stream_id%0A%0A%20%20%20%20def%20append_audio(self%2C%20audio%2C%20stream_id%3D-1)%3A%0A%20%20%20%20%20%20%20%20processed_signal%2C%20processed_signal_length%20%3D%20self.preprocess_audio(audio)%0A%20%20%20%20%20%20%20%20print(%0A%20%20%20%20%20%20%20%20%20%20%20%20f%22%5Bappend_audio%5D%20Audio%20samples%3A%20%7Blen(audio)%7D%2C%20Preprocessed%20to%20%7Bprocessed_signal_length%7D%20frames%22%0A%20%20%20%20%20%20%20%20)%0A%20%20%20%20%20%20%20%20processed_signal%2C%20processed_signal_length%2C%20stream_id%20%3D%20(%0A%20%20%20%20%20%20%20%20%20%20%20%20self.append_processed_signal(processed_signal%2C%20stream_id)%0A%20%20%20%20%20%20%20%20)%0A%20%20%20%20%20%20%20%20print(%0A%20%20%20%20%20%20%20%20%20%20%20%20f%22%5Bappend_audio%5D%20After%20append%3A%20stream_id%3D%7Bstream_id%7D%2C%20streams_length%3D%7Bself.streams_length%7D%2C%20buffer_idx%3D%7Bself.buffer_idx%7D%22%0A%20%20%20%20%20%20%20%20)%0A%20%20%20%20%20%20%20%20return%20processed_signal%2C%20processed_signal_length%2C%20stream_id%0A%0A%20%20%20%20def%20append_processed_signal(self%2C%20processed_signal%2C%20stream_id%3D-1)%3A%0A%20%20%20%20%20%20%20%20processed_signal_length%20%3D%20torch.tensor(%0A%20%20%20%20%20%20%20%20%20%20%20%20processed_signal.size(-1)%2C%20device%3Dprocessed_signal.device%0A%20%20%20%20%20%20%20%20)%0A%20%20%20%20%20%20%20%20if%20stream_id%20%3E%3D%200%20and%20(%0A%20%20%20%20%20%20%20%20%20%20%20%20self.streams_length%20is%20not%20None%20and%20stream_id%20%3E%3D%20len(self.streams_length)%0A%20%20%20%20%20%20%20%20)%3A%0A%20%20%20%20%20%20%20%20%20%20%20%20raise%20ValueError(%22Not%20valid%20stream_id!%22)%0A%20%20%20%20%20%20%20%20if%20self.buffer%20is%20None%3A%0A%20%20%20%20%20%20%20%20%20%20%20%20if%20stream_id%20%3E%3D%200%3A%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20raise%20ValueError(%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%22stream_id%20can%20not%20be%20specified%20when%20there%20is%20no%20stream.%22%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20)%0A%20%20%20%20%20%20%20%20%20%20%20%20self.buffer%20%3D%20processed_signal%0A%20%20%20%20%20%20%20%20%20%20%20%20self.streams_length%20%3D%20torch.tensor(%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%5Bprocessed_signal_length%5D%2C%20device%3Dprocessed_signal.device%0A%20%20%20%20%20%20%20%20%20%20%20%20)%0A%20%20%20%20%20%20%20%20else%3A%0A%20%20%20%20%20%20%20%20%20%20%20%20if%20self.buffer.size(1)%20!%3D%20processed_signal.size(1)%3A%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20raise%20ValueError(%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%22Buffer%20and%20the%20processed%20signal%20have%20different%20dimensions!%22%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20)%0A%20%20%20%20%20%20%20%20%20%20%20%20if%20stream_id%20%3C%200%3A%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20self.buffer%20%3D%20torch.nn.functional.pad(%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20self.buffer%2C%20pad%3D(0%2C%200%2C%200%2C%200%2C%200%2C%201)%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20)%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20self.streams_length%20%3D%20torch.cat(%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20(%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20self.streams_length%2C%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20torch.tensor(%5B0%5D%2C%20device%3Dself.streams_length.device)%2C%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20)%2C%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20dim%3D-1%2C%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20)%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20stream_id%20%3D%20len(self.streams_length)%20-%201%0A%20%20%20%20%20%20%20%20%20%20%20%20needed_len%20%3D%20self.streams_length%5Bstream_id%5D%20%2B%20processed_signal_length%0A%20%20%20%20%20%20%20%20%20%20%20%20if%20needed_len%20%3E%20self.buffer.size(-1)%3A%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20self.buffer%20%3D%20torch.nn.functional.pad(%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20self.buffer%2C%20pad%3D(0%2C%20needed_len%20-%20self.buffer.size(-1))%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20)%0A%0A%20%20%20%20%20%20%20%20%20%20%20%20self.buffer%5B%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20stream_id%2C%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%3A%2C%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20self.streams_length%5Bstream_id%5D%20%3A%20self.streams_length%5Bstream_id%5D%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%2B%20processed_signal_length%2C%0A%20%20%20%20%20%20%20%20%20%20%20%20%5D%20%3D%20processed_signal%0A%20%20%20%20%20%20%20%20%20%20%20%20self.streams_length%5Bstream_id%5D%20%3D%20self.streams_length%5B%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20stream_id%0A%20%20%20%20%20%20%20%20%20%20%20%20%5D%20%2B%20processed_signal.size(-1)%0A%0A%20%20%20%20%20%20%20%20if%20self.online_normalization%3A%0A%20%20%20%20%20%20%20%20%20%20%20%20processed_signal%2C%20x_mean%2C%20x_std%20%3D%20normalize_batch(%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20x%3Dprocessed_signal%2C%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20seq_len%3Dtorch.tensor(%5Bprocessed_signal_length%5D)%2C%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20normalize_type%3Dself.model_normalize_type%2C%0A%20%20%20%20%20%20%20%20%20%20%20%20)%0A%20%20%20%20%20%20%20%20return%20processed_signal%2C%20processed_signal_length%2C%20stream_id%0A%0A%20%20%20%20def%20get_model_device(self)%3A%0A%20%20%20%20%20%20%20%20return%20self.model.device%0A%0A%20%20%20%20def%20preprocess_audio(self%2C%20audio%2C%20device%3DNone)%3A%0A%20%20%20%20%20%20%20%20if%20device%20is%20None%3A%0A%20%20%20%20%20%20%20%20%20%20%20%20device%20%3D%20self.get_model_device()%0A%20%20%20%20%20%20%20%20audio_signal%20%3D%20torch.from_numpy(audio).unsqueeze_(0).to(device)%0A%20%20%20%20%20%20%20%20audio_signal_len%20%3D%20torch.Tensor(%5Baudio.shape%5B0%5D%5D).to(device)%0A%20%20%20%20%20%20%20%20processed_signal%2C%20processed_signal_length%20%3D%20self.preprocessor(%0A%20%20%20%20%20%20%20%20%20%20%20%20input_signal%3Daudio_signal%2C%20length%3Daudio_signal_len%0A%20%20%20%20%20%20%20%20)%0A%20%20%20%20%20%20%20%20return%20processed_signal%2C%20processed_signal_length%0A%0A%20%20%20%20def%20get_all_audios(self)%3A%0A%20%20%20%20%20%20%20%20processed_signal%20%3D%20self.buffer%0A%20%20%20%20%20%20%20%20if%20self.online_normalization%3A%0A%20%20%20%20%20%20%20%20%20%20%20%20processed_signal%2C%20x_mean%2C%20x_std%20%3D%20normalize_batch(%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20x%3Dprocessed_signal%2C%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20seq_len%3Dtorch.tensor(self.streams_length)%2C%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20normalize_type%3Dself.model_normalize_type%2C%0A%20%20%20%20%20%20%20%20%20%20%20%20)%0A%20%20%20%20%20%20%20%20return%20processed_signal%2C%20self.streams_length%0A`,lang:`python`}),n(e,i)},$$slots:{default:!0}}))}export{g as default,d as metadata};
//# sourceMappingURL=CKawjhpR.js.map
