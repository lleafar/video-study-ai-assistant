from langchain_core.runnables.config import RunnableConfig
from langchain.tools import tool

@tool
def list_context_urls(config: RunnableConfig) -> str:
    """List all available context URLs and documents.
    
    Use this when the user asks what documents are attached,
    what URLs are available, or which sources they can get transcripts from.
    """
    
    context_urls = config["configurable"].get("context_urls", [])
    
    if not context_urls:
        return "No URLs attached. Please provide a video URL or context URLs first."
    
    result = "# Available Documents\n\n"
    
    for i, url in enumerate(context_urls):
        source_type = "Main Video" if i == 0 else f"Context Document #{i}"
        result += f"{i}. **{source_type}**: {url}\n"
    
    result += f"\n**Total:** {len(context_urls)} document(s)"
    
    return result
