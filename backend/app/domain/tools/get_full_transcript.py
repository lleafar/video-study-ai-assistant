from langchain_core.runnables.config import RunnableConfig
from langchain.tools import tool
from app.datasources.content_loader import ContentLoader
import asyncio

# Simple in-memory cache for transcripts
_transcript_cache = {}

@tool(return_direct=True)
def get_full_transcript(config: RunnableConfig, url_index: int = 0) -> str:
    """
    Get the complete transcript of a video or document from the main video or the context urls.
    
    Args:
        url_index: Index of the URL to get transcript from. 
                   0 = main video (default), 
                   1+ = context URLs in order they were added.
    
    Use this tool when the user explicitly asks for:
    - The full transcript, complete text, or entire content
    - Transcript of a specific attached document/URL
    """
    
    main_video_url = config["configurable"].get("video_url")
    context_urls = config["configurable"].get("context_urls", [])

    if not context_urls and not main_video_url:
        return "No URLs found. Please provide a video URL or context URLs first."
        
    if url_index == 0 and main_video_url:
            target_url = main_video_url
    else:
        if url_index < 0 or url_index >= len(context_urls):
            return f"Invalid URL index {url_index}. Available URLs: {len(context_urls)}"
        else:
            target_url = context_urls[url_index]
    
    # Check cache first
    if target_url in _transcript_cache:
        return _transcript_cache[target_url]
    
    # Fetch transcript on-demand (using asyncio.run for sync wrapper)
    try:
        documents = asyncio.run(ContentLoader.load_data(target_url))
        
        if not documents:
            return f"Could not fetch content from: {target_url}"
        
        full_transcript = "\n\n".join([doc.page_content for doc in documents])        
        
        # Cache the result
        _transcript_cache[target_url] = full_transcript
        
        return full_transcript
        
    except Exception as e:
        return f"Error fetching transcript from {target_url}: {str(e)}"