from langchain.messages import SystemMessage, HumanMessage
from langchain_core.runnables.config import RunnableConfig
from langchain.tools import tool
from Config import Config

@tool(return_direct=False)
def answer_question(query: str, config: RunnableConfig) -> str:
    """
    Retrieve relevant text from the attached documents using the retriever and answer the user's question based on that context.
    Use this tool to get the relevant information needed to answer a specific question about the video content or attached documents.
    
    Args:
    - query: The question to be answered.
    - config: The RunnableConfig containing the retriever.    
    """
    
    retriever = config["configurable"].get("retriever")              
    if not retriever:
        return "No relevant documents found to answer the question."
    
    docs = retriever.invoke(query)
    if not docs:
        return "No relevant documents found to answer the question."
    
    context_list = []
    for i, doc in enumerate(docs):
        url = doc.metadata.get("source", "")
        title = doc.metadata.get("title", "")    

        context_list.append(
            (    
                f"[CONTEXT_SNIPPET_{i}]\n"
                f"TITLE: {title}\n"
                f"URL: {url}\n"
                f"RAW_CONTEXT: {doc.page_content}\n"
                f"[/CONTEXT_SNIPPET_{i}]\n"
            )
        )
        
    context = "\n".join(context_list)
    return context