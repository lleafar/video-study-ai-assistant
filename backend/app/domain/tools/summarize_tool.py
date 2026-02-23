from langchain.messages import SystemMessage, HumanMessage
from langchain_core.runnables.config import RunnableConfig
from langchain.tools import tool
from Config import Config

@tool
def summarize_transcript(query: str, config: RunnableConfig) -> str:
    """Summarize the transcript of a YouTube video from the retriever."""
    
    system_prompt = SystemMessage("""
    # Identify
    You are an expert assistant specialized in extracting and summarizing information from YouTube video transcripts.
    Your task is to retrieve the transcript of a given YouTube video and provide a concise summary highlighting the key points discussed in the video.
    
    # Task
    * Summarize the transcript in a clear and concise manner, focusing on the main ideas and important details.
    * Format the summary using markdown with appropriate headings and bullet points.
    
    # Input
    You will be provided with a retriever.
    
    # Output
    Provide a well-structured summary of the video's transcript in markdown format.
    
    """)
    
    docs = config["configurable"].get("full_docs", [])
    if not docs:
        return "No documents found in the configuration."
    
    transcript = "\n".join([doc.page_content for doc in docs])
    
    user_prompt = HumanMessage(f"""
    Please summarize the YouTube video from the following transcript: {transcript}
    And save the summary to a file named "video_summary.md".
    """)
    
    response = Config.get_llm().invoke([system_prompt, user_prompt])
    
    save_summary_to_file(response.content, "video_summary.md")        
    
    return response

# Function to save summary to a markdown file
def save_summary_to_file(summary: str, filename: str):
    """Save the summary to a markdown file."""
    with open(filename, "w", encoding="utf-8") as f:
        f.write(summary)