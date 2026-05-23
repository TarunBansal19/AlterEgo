from imagekitio import ImageKit

from config import IMAGEKIT_PUBLIC_KEY , IMAGEKIT_PRIVATE_KEY , IMAGEKIT_URL_ENDPOINT

imagekit = ImageKit(private_key=IMAGEKIT_PRIVATE_KEY)

def upload_file(file_bytes: bytes, file_name: str, folder: str , content_type: str = "image/png") -> tuple[str, str]: 
    result = imagekit.files.upload(
        file = (file_name, file_bytes, content_type),
        file_name=file_name,
        folder = folder,
        is_private_file= False,
        use_unique_file_name=True
    )
    return result.url, result.file_id

def delete_file(file_id: str) -> bool:
    imagekit.files.delete(file_id=file_id)
    return True

def get_variants(base_url: str) -> dict:
    variants = {
        "profile": f"{base_url}?tr=w-500,h-500,fo-face",
        "banner": f"{base_url}?tr=w-1500,h-500,fo-face",
        "story": f"{base_url}?tr=w-1080,h-1920,fo-face" 
    }
    return variants