from langchain.messages import SystemMessage, HumanMessage
from langchain_core.runnables.config import RunnableConfig
from langchain.tools import tool
from Config import Config
from app.domain.tools.get_full_transcript import get_full_transcript

@tool(return_direct=True)
def summarize_transcript(config: RunnableConfig,  url_index: int = 0) -> str:
    """
    Summarize the transcript of a YouTube video from the retriever.
    Args:
    url_index: Index of the URL to get transcript from. 
                0 = main video (default), 
                1+ = context URLs in order they were added.
    
    Use this tool when the user explicitly asks for:
    - A summary of the video content, key points, or main ideas    
    - A concise overview of the video's transcript
    """
    
    system_prompt = SystemMessage("""                                  
    # Identify
    You are an expert assistant specialized in extracting and summarizing information from YouTube video transcripts.
    Your task is to retrieve the transcript of a given YouTube video and provide a concise summary highlighting the key points discussed in the video.
    
    # Task
    * Summarize the transcript in a clear and concise manner, focusing on the main ideas and important details.
    * Format the summary using markdown with appropriate headings and bullet points.
    
    # Input
    You will be provided with a transcript.
    
    # Output
    Provide a well-structured summary of the video's transcript in markdown format.                                      
    Write in the user's language.                                  
    """)        

    transcript = get_full_transcript.invoke({
        "config": config,
        "url_index": url_index
    })

    user_prompt = HumanMessage(f"""
    Please summarize the YouTube video from the following transcript: {transcript}
    And save the summary to a file named "video_summary.md".
    """)
    
    response = Config.get_llm().invoke([system_prompt, user_prompt])
    
    save_summary_to_file(response.content, "video_summary.md")        
    
    return response.content

# Function to save summary to a markdown file
def save_summary_to_file(summary: str, filename: str):
    """Save the summary to a markdown file."""
    with open(filename, "w", encoding="utf-8") as f:
        f.write(summary)