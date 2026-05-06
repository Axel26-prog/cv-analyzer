import os
from dotenv import load_dotenv
from azure.storage.blob import BlobServiceClient

load_dotenv()

AZURE_STORAGE_CONNECTION_STRING = os.getenv("AZURE_STORAGE_CONNECTION_STRING")
AZURE_STORAGE_CONTAINER = os.getenv("AZURE_STORAGE_CONTAINER_NAME", "cv-files")
BLOB_URL_PREFIX = os.getenv("AZURE_STORAGE_BLOB_URL", "")

def _get_blob_service():
    if not AZURE_STORAGE_CONNECTION_STRING:
        return None
    return BlobServiceClient.from_connection_string(AZURE_STORAGE_CONNECTION_STRING)

def upload_cv_file(file_bytes: bytes, filename: str, user_id: int) -> str | None:
    blob_service = _get_blob_service()
    if not blob_service:
        return None

    container_client = blob_service.get_container_client(AZURE_STORAGE_CONTAINER)
    try:
        container_client.create_container if not container_client.exists else lambda: None
    except Exception:
        pass

    extension = filename.split('.')[-1].lower()
    blob_name = f"cvs/user_{user_id}/{filename}"

    blob_client = container_client.get_blob_client(blob_name)
    blob_client.upload_blob(file_bytes, overwrite=True)

    if BLOB_URL_PREFIX:
        return f"{BLOB_URL_PREFIX}/{AZURE_STORAGE_CONTAINER}/{blob_name}"

    return blob_client.url

def get_blob_url(filename: str, user_id: int) -> str | None:
    if not AZURE_STORAGE_CONNECTION_STRING:
        return None

    blob_name = f"cvs/user_{user_id}/{filename}"
    container_client = _get_blob_service().get_container_client(AZURE_STORAGE_CONTAINER)
    blob_client = container_client.get_blob_client(blob_name)

    if blob_client.exists():
        return blob_client.url
    return None

def delete_cv_file(filename: str, user_id: int) -> bool:
    blob_service = _get_blob_service()
    if not blob_service:
        return False

    blob_name = f"cvs/user_{user_id}/{filename}"
    container_client = blob_service.get_container_client(AZURE_STORAGE_CONTAINER)
    blob_client = container_client.get_blob_client(blob_name)

    try:
        blob_client.delete_blob()
        return True
    except Exception:
        return False