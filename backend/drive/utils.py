"""
Utility functions for the Drive module.
"""


def is_text_file(file_name, file_type):
    """
    Determine if a file is a text file based on its MIME type and extension.

    Args:
        file_name (str): The name of the file
        file_type (str): The MIME type of the file

    Returns:
        bool: True if the file is a text file, False otherwise
    """
    # List of MIME types for text files
    text_mime_types = [
        "text/plain",
        "text/html",
        "text/css",
        "text/javascript",
        "application/json",
        "text/markdown",
        "text/csv",
        "text/xml",
        "application/xml",
        "text/x-python",
        "text/x-typescript",
        "text/x-javascript",
        "application/x-yaml",
        "text/yaml",
        "application/yaml",
        "text/x-properties",
        "application/x-properties",
        "text/x-ini",
        "text/x-config",
        "application/x-toml",
        "text/x-toml",
        "application/x-shellscript",
        "text/x-sh",
    ]

    # Check MIME type first
    if file_type in text_mime_types:
        return True

    # List of extensions for text files
    text_extensions = [
        "txt",
        "md",
        "json",
        "yaml",
        "yml",
        "xml",
        "html",
        "css",
        "js",
        "ts",
        "py",
        "sh",
        "conf",
        "cfg",
        "ini",
        "properties",
        "env",
        "toml",
        "csv",
    ]

    # Check file extension
    extension = file_name.split(".")[-1].lower() if "." in file_name else ""
    return extension in text_extensions


def is_image_file(file_name, file_type):
    """
    Determine if a file is an image file based on its MIME type and extension.

    Args:
        file_name (str): The name of the file
        file_type (str): The MIME type of the file

    Returns:
        bool: True if the file is an image file, False otherwise
    """
    # List of MIME types for image files
    image_mime_types = [
        "image/jpeg",
        "image/png",
        "image/gif",
        "image/webp",
        "image/svg+xml",
        "image/bmp",
        "image/tiff",
        "image/x-icon",
    ]

    # Check MIME type first
    if file_type in image_mime_types:
        return True

    # List of extensions for image files
    image_extensions = ["jpg", "jpeg", "png", "gif", "webp", "svg", "bmp", "tiff", "tif", "ico"]

    # Check file extension
    extension = file_name.split(".")[-1].lower() if "." in file_name else ""
    return extension in image_extensions


def is_video_file(file_name, file_type):
    """
    Determine if a file is a video file based on its MIME type and extension.

    Args:
        file_name (str): The name of the file
        file_type (str): The MIME type of the file

    Returns:
        bool: True if the file is a video file, False otherwise
    """
    # List of MIME types for video files
    video_mime_types = [
        "video/mp4",
        "video/webm",
        "video/ogg",
        "video/quicktime",
        "video/x-msvideo",
        "video/x-matroska",
        "video/3gpp",
        "video/x-flv",
        "video/mpeg",
    ]

    # Check MIME type first
    if file_type in video_mime_types:
        return True

    # List of extensions for video files
    video_extensions = ["mp4", "webm", "ogg", "mov", "avi", "mkv", "3gp", "flv", "mpeg", "mpg", "m4v"]

    # Check file extension
    extension = file_name.split(".")[-1].lower() if "." in file_name else ""
    return extension in video_extensions


def is_pdf_file(file_name, file_type):
    """
    Determine if a file is a PDF file based on its MIME type and extension.

    Args:
        file_name (str): The name of the file
        file_type (str): The MIME type of the file

    Returns:
        bool: True if the file is a PDF file, False otherwise
    """
    # List of MIME types for PDF files
    pdf_mime_types = ["application/pdf"]

    # Check MIME type first
    if file_type in pdf_mime_types:
        return True

    # List of extensions for PDF files
    pdf_extensions = ["pdf"]

    # Check file extension
    extension = file_name.split(".")[-1].lower() if "." in file_name else ""
    return extension in pdf_extensions
