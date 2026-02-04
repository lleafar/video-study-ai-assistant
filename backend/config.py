from langchain_openai import OpenAIEmbeddings, ChatOpenAI
from langgraph.checkpoint.memory import InMemorySaver
from langchain_core.runnables.config import RunnableConfig

from dotenv import load_dotenv
import os

load_dotenv()

# Global configuration variables
model = "gpt-4.1"  # Model name for the LLM

llm = ChatOpenAI(model_name=model, temperature=0, openai_api_key=os.getenv("OPENAI_API_KEY"))  # Initialize the LLM with the specified model

checkpointer = InMemorySaver()  # Checkpointer configuration for state storage

embeddings = OpenAIEmbeddings()  # Initialize the embedding function

session_config: RunnableConfig = {
    "configurable": {
        "thread_id": "1",
        "api_key": os.getenv("OPENAI_API_KEY")
    }
} # Session configuration for runnable components