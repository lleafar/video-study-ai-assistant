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
    for doc in docs:
        source = doc.metadata.get("source", "Unknown source")
        context_list.append(f"SOURCE: {source}\nRAW CONTEXT: {doc.page_content}\n")
        
    context = "\n".join(context_list)
    return context
    
    # system_prompt = (
    #     "You are a knowledgeable and helpful assistant that provides accurate answers based on retrieved documents."
    #     "Provide a concise and accurate answer based on the retrieved context."
    #     "If the context does not contain enough information to answer the question, say that you don't know the answer instead of making assumptions."
    #     "Always refer to the sources in the context when providing your answer."
    # )
    
    # user_message = f"Question: {query}\n\nContext:\n{context}"
    
    # response = Config.get_llm().invoke([
    #     SystemMessage(content=system_prompt), 
    #     HumanMessage(content=user_message)
    # ])    
    
    # return response