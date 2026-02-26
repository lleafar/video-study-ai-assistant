from langchain.agents import create_agent
from langchain_core.messages import SystemMessage, HumanMessage
from langchain_core.runnables.config import RunnableConfig
from app.domain.tools.question_answer_tool import answer_question
from app.domain.tools.summarize_tool import summarize_transcript
from app.domain.tools.get_full_transcript import get_full_transcript
from app.domain.tools.list_context_urls import list_context_urls
from langchain_community.vectorstores import FAISS
from app.datasources.content_loader import ContentLoader
from Config import Config

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
        self.text_splitter = Config.get_text_splitter()  # Initialize the text splitter for document processing    
        self.sessions = {} # Dictionary to manage multiple sessions keyed by chat_id
        system_prompt = SystemMessage("""
        # Identity
        You are a study assistant. You have access to data contexts through tools.

        # Tools Available
        1. 'summarize_transcript': Create a summary of the video.
        2. 'answer_question': Returns raw context snippets from the retriever based on a specific question.
        3. 'get_full_transcript': Return the complete transcript from any context URL.
        4. 'list_context_urls': Show all attached documents/URLs.
        
        # Instructions
        Choose the appropriate tool based on user intent:
        1. If user wants a summary → use summarize_transcript
        2. If user asks a specific question → use 'answer_question'
        3. If user wants to list attached documents → use list_context_urls
        4. If user wants the full/complete transcript → use get_full_transcript
          - Determine which URL they want (main video or specific context)
          - Use url_index=0 for main video (default)
          - Use url_index=1, 2, 3... for additional context documents
          - User may ask "transcript of the second document" → use url_index=1

        # Critical Instruction on Tool Outputs
        1. DO NOT simply repeat the tool output to the user.
        2. Formulate a small summarized response (using bullet points and bold text) based ONLY on the provided snippets. Transform the raw transcript text from 'answer_question' into a study note.
        3. YOUR JOB is to read those snippets, extract the relevant facts, and write a human-like, well-formatted response.
        4. Cite the source (URL or title) for each fact you mention.
        5. If the tool doesn't return enough info, tell the user what is missing.                                      
        """)        
        # 2. Formulate a small structured summarized response (using bullet points and bold text) based ONLY on the provided snippets. Transform the raw transcript text from 'answer_question' into a professional study note.
        # Agent to handle the study assistance tasks
        self.agent = create_agent(
            Config.MODEL,
            tools = [summarize_transcript, answer_question, get_full_transcript, list_context_urls],
            system_prompt=system_prompt,
            checkpointer=self.checkpointer,        
        )
    
    def get_or_create_session(self, chat_id: str) -> RunnableConfig:
        """Get existing session config or create a new one for the given chat_id."""
        if chat_id not in self.sessions:
            self.sessions[chat_id] = {
                "configurable": {
                    "thread_id": chat_id,
                    "api_key": Config.OPENAI_API_KEY,
                    "retriever": None,
                    "video_url": None,
                    "context_urls": []  # Store all context URLs
                }
            }            
        return self.sessions[chat_id]            

    def __get_loaded_urls_from_retriever(self, retriever) -> set:
        """Extract URLs that are already in the retriever by checking document metadata."""
        if retriever is None:
            print("Retriever is None, no URLs loaded yet.")
            return set()
        
        try:
            # Get all documents from the retriever's vectorstore
            vectorstore = retriever.vectorstore
            if hasattr(vectorstore, 'docstore') and hasattr(vectorstore.docstore, '_dict'):
                docs = vectorstore.docstore._dict.values()
                loaded_urls = {doc.metadata.get('source', '') for doc in docs if doc.metadata.get('source')}
                return loaded_urls
        except Exception as e:
            print(f"Could not extract URLs from retriever: {e}")
        
        return set()

    async def __add_context_urls(self, chat_id: str, video_url: str, context_urls: list[str]):
        """Add additional context URLs to the session configuration."""

        if not chat_id:            
            return     

        if not video_url and not context_urls:            
            return                   

        session_config = self.get_or_create_session(chat_id)

        # Ensure the video URL is included in the context
        context_urls = [video_url] + (context_urls if context_urls else [])
        
        # Check if context is already loaded by inspecting the retriever        
        retriever = session_config["configurable"]["retriever"]
        
        loaded_urls = self.__get_loaded_urls_from_retriever(retriever)
        new_urls = [url for url in context_urls if url not in loaded_urls]
        
        if not new_urls:
            # Still update the stored URLs list
            session_config["configurable"]["video_url"] = video_url
            session_config["configurable"]["context_urls"] = context_urls
            return
        
        # Store all URLs for transcript retrieval
        session_config["configurable"]["video_url"] = video_url
        session_config["configurable"]["context_urls"] = context_urls
        
        all_docs = []
        
        print(f"Sended urls: {context_urls}")
        print(f"Loaded URLs in retriever: {loaded_urls}")
        print(f"New URLs to load: {new_urls}")

        # Load documents only from new URLs
        for url in new_urls:
            print(f"Loading documents from: {url}")
            documents = await ContentLoader.load_data(url)

            if not documents:
                print(f"No documents found for URL: {url}")
                continue
            
            all_docs.extend(documents)
            
        if not all_docs:
            return
        
        splits = self.text_splitter.split_documents(all_docs)
        
        if not splits:
            print("Text splitter returned no chunks")
            return
        
        if session_config["configurable"]["retriever"] is None:
            k_value = min(max(len(splits) // 3, 2), 10)  # Dynamically set k based on number of splits
            session_config["configurable"]["retriever"] = FAISS.from_documents(splits, self.embeddings).as_retriever(
                search_type="similarity", 
                search_kwargs={"k": k_value}
            )
            print("FAISS retriever created successfully")
        else:
            print(f"Adding {len(splits)} splits to existing retriever")
            session_config["configurable"]["retriever"].add_documents(splits)
    
    def clear_session(self, chat_id: str):
        """Clear/reset a session to force context reload (useful for debugging or when context changes)."""
        if chat_id in self.sessions:
            del self.sessions[chat_id]
        else:
            print(f"No session found for chat_id: {chat_id}")
    
    def get_session_info(self, chat_id: str) -> dict:
        """Get information about a session including loaded URLs."""
        if chat_id not in self.sessions:
            return {"error": "Session not found"}
        
        session_config = self.sessions[chat_id]
        retriever = session_config["configurable"]["retriever"]
        
        loaded_urls = list(self.__get_loaded_urls_from_retriever(retriever))
        
        return {
            "chat_id": chat_id,
            "has_retriever": retriever is not None,
            "loaded_urls": loaded_urls,
            "configured_video_url": session_config["configurable"].get("video_url"),
            "configured_context_urls": session_config["configurable"].get("context_urls", [])
        }
        
    async def invoke_study_assistant(self, chat_id: str, message: str, video_url: str, context_urls: list[str]) -> str:            
            """Invoke the study assistant agent with the given message and context URLs."""
            await self.__add_context_urls(chat_id, video_url, context_urls)  # Add context URLs to the session configuration
            
            session_config = self.get_or_create_session(chat_id)
            initial_state = {"messages": [HumanMessage(message)]} # Initial state with the user's message
            
            return self.agent.astream(
                initial_state,
                config=session_config,
                stream_mode="messages"
            ) # Stream the response from the agent in "messages" mode for real-time interaction            