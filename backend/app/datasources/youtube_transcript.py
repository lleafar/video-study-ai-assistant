from langchain_community.document_loaders import YoutubeLoader
from langchain_community.document_loaders.youtube import TranscriptFormat

# Function to get YouTube transcript in chunks
def get_transcript(video_id: str):
    loader = YoutubeLoader.from_youtube_url(
        video_id,
        add_video_info=False,
        language=["pt", "en"],
        transcript_format=TranscriptFormat.CHUNKS,
        chunk_size_seconds=600
    )        
    transcript = loader.load()
    return transcript
    