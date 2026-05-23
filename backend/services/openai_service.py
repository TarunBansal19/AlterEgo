import base64
from openai import AsyncOpenAI
from config import OPENAI_API_KEY

client = AsyncOpenAI(api_key=OPENAI_API_KEY, base_url="https://api.aicredits.in/v1")

async def generate_Avatar(prompt: str, style_prompt: str, headshot_url: str) -> bytes:
    full_prompt = (
        f"{style_prompt}\n\n"
        f"User request: {prompt}\n\n"
        "IMPORTANT: Generate an avatar image that incorporates the user's headshot and reflects the requested style."
    )

    response = await client.responses.create(
        model="gpt-image-2",
        input=[
            {
                "role": "user",
                "content": [
                    {"type": "input_text", "text": full_prompt},
                    {"type": "input_image", "image_url": headshot_url, "detail": "auto"}
                ]
            }
        ],
        tools=[
            {
                "type": "image_generation",
                "model": "gpt-image-2",
                "size": "1536x1024",
                "quality": "medium",
                "output_format": "png",
            }
        ]
    )

    for item in response.output:
        if item.type == "image_generation_call" and item.result:
            return base64.b64decode(item.result)

    raise RuntimeError("Failed to generate avatar image")