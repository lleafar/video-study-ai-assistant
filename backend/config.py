from langchain_openai import OpenAIEmbeddings, ChatOpenAI
from langgraph.checkpoint.memory import InMemorySaver
from langchain_text_splitters import RecursiveCharacterTextSplitter

from dotenv import load_dotenv
import os

load_dotenv()  # Load environment variables from .env file

class Config:
    """Configuration class to hold global variables and settings."""
    MODEL = "gpt-4.1"  # Model name for the LLM
    OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")  # OpenAI API Key
    TEMPERATURE = 0  # Temperature setting for the LLM
    
    @staticmethod
    def get_embeddings() -> OpenAIEmbeddings:
        """Get an instance of OpenAIEmbeddings."""
        return OpenAIEmbeddings(model='text-embedding-3-small', openai_api_key=Config.OPENAI_API_KEY)
    
    @staticmethod
    def get_checkpointer() -> InMemorySaver:
        """Get an instance of InMemorySaver for checkpointing."""
        return InMemorySaver()
    
    @staticmethod
    def get_llm() -> ChatOpenAI:
        """Get an instance of ChatOpenAI LLM."""
        return ChatOpenAI(
            model_name=Config.MODEL,
            temperature=Config.TEMPERATURE,
            openai_api_key=Config.OPENAI_API_KEY
        )
        
    @staticmethod
    def get_text_splitter() -> RecursiveCharacterTextSplitter:
        """Get an instance of RecursiveCharacterTextSplitter for text splitting."""
        return RecursiveCharacterTextSplitter(chunk_size=1000, chunk_overlap=200, add_start_index=True)
        
    