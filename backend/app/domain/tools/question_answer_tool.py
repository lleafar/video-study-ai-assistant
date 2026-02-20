from langchain.messages import SystemMessage, HumanMessage
from langchain_core.runnables.config import RunnableConfig
from langchain.tools import tool
from config import Config

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
    
    response = Config.get_llm().invoke([system_prompt, user_message])    
    return response