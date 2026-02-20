from langchain.agents import create_agent
from langchain_openai import OpenAIEmbeddings, ChatOpenAI
from langchain_core.messages import SystemMessage, HumanMessage
from langchain_core.runnables.config import RunnableConfig
from langgraph.checkpoint.memory import InMemorySaver
from dotenv import load_dotenv
from app.domain.tools.question_answer_tool import answer_question
from app.domain.tools.summarize_tool import summarize_transcript
from langchain_community.vectorstores import FAISS
from app.datasources.youtube_transcript import get_transcript
from config import Config

class StudyAssistantManager:
    _instance = None # Singleton instance
    
    def __new__(cls):
        """Implement singleton pattern to ensure only one instance exists."""
        if cls._instance is None:
            cls._instance = super().__new__(cls)
            cls._instance._initialize()
        return cls._instance
    
    def _initialize(self):
        """Initialize the StudyAssistantManager with necessary configurations."""
        self.checkpointer = Config.get_checkpointer()  # Checkpointer configuration for state storage
        self.embeddings = Config.get_embeddings()  # Initialize the embedding function    

        self.session_config: RunnableConfig = {
            "configurable": {
                "thread_id": "1",
                "api_key": Config.OPENAI_API_KEY,
                "retriever": None,
                "full_docs": None
            }
        } # Session configuration for runnable components        
        
        system_prompt = SystemMessage("""
        # Identity
        You are a helpful assistant that decides wheter the user wants to summarize a video or answer a question.    
        """)        
        
        # Agent to handle the study assistance tasks
        self.agent = create_agent(
            Config.MODEL,
            tools = [summarize_transcript, answer_question],
            system_prompt=system_prompt,
            checkpointer=self.checkpointer,        
        )            
        
    def invoke_study_assistant(self, prompt: str, video_url: str) -> str:
        """Invoke the study assistant agent with the given prompt and video URL."""
        if not self.session_config["configurable"]["retriever"]:
            transcript = get_transcript(video_url)
            retriever = FAISS.from_documents(transcript, self.embeddings).as_retriever(search_type="similarity", search_kwargs={"k": 2})
            
            self.session_config["configurable"]["retriever"] = retriever
            self.session_config["configurable"]["full_docs"] = transcript
            
        initial_state = {"messages": [HumanMessage(prompt)]}
        # response = self.agent.invoke(initial_state, config=self.session_config)
        response = self.agent.stream(initial_state, config=self.session_config, stream_mode="messages")
        return response
        
        