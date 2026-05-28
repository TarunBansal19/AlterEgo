import replicate
import httpx
from config import REPLICATE_API_TOKEN

client = replicate.Client(api_token=REPLICATE_API_TOKEN)

async def generate_Avatar(
    prompt: str,
    style_prompt: str,
    headshot_url: str
) -> bytes:

    full_prompt = f"""
    {style_prompt}

    User request: {prompt}

    Generate a high-quality avatar using the uploaded headshot.
    Preserve the person's facial identity, hairstyle, and facial structure.
    Use the reference image as the primary identity source.
    """


    output = await client.async_run(
        "black-forest-labs/flux-kontext-pro",
        input={
            "prompt": full_prompt,
            "input_image": headshot_url,
            "aspect_ratio": "match_input_image",
            "output_format": "png",
            "safety_tolerance": 2,
            "prompt_upsampling": False
        }
    )
    if not output:
        raise RuntimeError(f"Replicate returned empty output: {repr(output)}")
    
    if isinstance(output, list):
        output = output[0]

    if hasattr(output, "read"):
        result = output.read()
        if isinstance(result, str):
            async with httpx.AsyncClient(timeout=120) as http:
                response = await http.get(result)
                response.raise_for_status()
                return response.content
        return result

    if isinstance(output, str):
        async with httpx.AsyncClient(timeout=120) as http:
            response = await http.get(output)
            response.raise_for_status()
            return response.content

    raise RuntimeError("Replicate did not return an image")
