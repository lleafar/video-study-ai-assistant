from xml.dom.minidom import Document
from langchain_community.vectorstores import FAISS
from langchain.messages import SystemMessage, HumanMessage
from langchain.agents import create_agent
from langchain.tools import tool
from langchain_core.runnables.config import RunnableConfig

from app.datasources.youtube_transcript import get_transcript
from config import model, checkpointer, embeddings, session_config, llm

import copy

# Function to get YouTube transcript
def get_youtube_transcript(video_url: str):
    """Get the transcript of a YouTube video given its URL."""
    return get_transcript(video_url)

# Function to save summary to a markdown file
def save_summary_to_file(summary: str, filename: str):
    """Save the summary to a markdown file."""
    with open(filename, "w", encoding="utf-8") as f:
        f.write(summary)

# Function for setting up FAISS RAG
def setup_faiss_rag(documents):
    vector_store = FAISS.from_documents(documents, embeddings).as_retriever(search_type="similarity", search_kwargs={"k": 2})
    return vector_store
    
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
    
    response = llm.invoke([system_prompt, user_prompt])
    
    save_summary_to_file(response.content, "video_summary.md")        
    
    return response
    
@tool    
def answer_question(query: str, config: RunnableConfig) -> str:
    """Answer a question recreating the retriever from documents in state.
    Parameters:
    - query: The question to be answered.
    - config: The RunnableConfig containing the retriever.
    """
    
    retriever = config["configurable"].get("retriever")              
    if not retriever:
        return "No relevant documents found to answer the question."
    
    docs = retriever.invoke(query)
    context = "\n".join([doc.page_content for doc in docs])

    system_prompt = SystemMessage("You are a knowledgeable and helpful assistant that provides accurate answers based on retrieved documents. Provide a concise and accurate answer based on the retrieved context.")
    
    user_message = HumanMessage(f"""
    Question:
    {query}
    
    
    Context:
    {context}
    """)
    
    response = llm.invoke([system_prompt, user_message])    
    return response


def study_assistant(prompt: str, video_url: str) -> str:
    """You're a study assistant that summarizes video transcripts and answers questions."""
        
    transcript = get_youtube_transcript(video_url)    
    retriever = setup_faiss_rag(transcript)
                
    local_config = copy.deepcopy(session_config)
    local_config["configurable"]["retriever"] = retriever
    local_config["configurable"]["thread_id"] = "study_assistant_thread_01"
    local_config["configurable"]["full_docs"] = transcript
                
    initial_state = {"messages": [HumanMessage(prompt)]}
                
                
    system_prompt = SystemMessage("""
    # Identity
    You are a helpful assistant that decides wheter the user wants to summarize a video or answer a question.    
    """)        
    
    # Agent to handle the study assistance tasks
    agent = create_agent(
        model,
        tools = [summarize_transcript, answer_question],
        system_prompt=system_prompt,
        checkpointer=checkpointer,        
    )    
    
    response = agent.invoke(initial_state, config=local_config)    
    return response