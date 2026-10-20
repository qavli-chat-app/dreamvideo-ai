import os
import tempfile
import gradio as gr
import spaces
import torch
from diffusers import DiffusionPipeline
from diffusers.utils import export_to_video

MODEL_ID = "damo-vilab/text-to-video-ms-1.7b"
pipe = None

def get_pipeline():
    global pipe
    if pipe is None:
        pipe = DiffusionPipeline.from_pretrained(
            MODEL_ID,
            torch_dtype=torch.float16,
            variant="fp16",
        )
        pipe.enable_model_cpu_offload()
    return pipe

@spaces.GPU(duration=180)
def generate_video(prompt, frames, steps):
    prompt = (prompt or "").strip()
    if len(prompt) < 5:
        raise gr.Error("Please enter a more detailed prompt (at least 5 characters).")
    if len(prompt) > 500:
        raise gr.Error("Please keep prompts under 500 characters.")
    generator = get_pipeline()
    result = generator(
        prompt,
        num_frames=int(frames),
        num_inference_steps=int(steps),
        generator=torch.Generator(device="cpu").manual_seed(42),
    )
    with tempfile.NamedTemporaryFile(suffix=".mp4", delete=False) as tmp:
        output_path = tmp.name
    export_to_video(result.frames[0], output_path, fps=8)
    return output_path

with gr.Blocks(title="DreamVideo AI — Free Demo") as demo:
    gr.Markdown("# ✦ DreamVideo AI\nA limited community demo using an open-source text-to-video model. Generation can be slow, queued, or unavailable when free GPU quota is exhausted.")
    prompt = gr.Textbox(label="Video prompt", placeholder="A cinematic rainy street in a futuristic city at blue hour", lines=3, max_lines=5)
    with gr.Row():
        frames = gr.Dropdown(choices=[8, 12, 16], value=8, label="Frames (short clip)")
        steps = gr.Dropdown(choices=[10, 15, 20], value=10, label="Inference steps")
    button = gr.Button("Generate video", variant="primary")
    output = gr.Video(label="Generated clip")
    button.click(generate_video, inputs=[prompt, frames, steps], outputs=output, api_name="generate_video")
    gr.Markdown("**Limits:** this is an experimental model demo, not unlimited generation. Do not enter private or sensitive information.")

demo.queue(default_concurrency_limit=1).launch()
