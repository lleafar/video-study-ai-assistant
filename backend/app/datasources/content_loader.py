from langchain_community.document_loaders import YoutubeLoader, WebBaseLoader
from langchain_core.documents import Document
from bs4 import SoupStrainer, Tag
from markdownify import markdownify as md
from app.services.title_service import get_url_title_service
import re
import asyncio
from tenacity import retry, stop_after_attempt, wait_exponential, RetryError, retry_if_exception_type, retry_if_exception
from httpx import ConnectTimeout, ReadTimeout, ConnectError, WriteError, TimeoutException, HTTPStatusError
from youtube_transcript_api import RequestBlocked, IpBlocked
import requests

# Define the exceptions that should trigger a retry (CircuitBreak strategy can be implemented in the future if needed)
RETRYABLE_EXCEPTIONS = (
    ConnectTimeout, # Timeout while trying to connect to the server (e.g., server is down, network issues)
    ReadTimeout, # Timeout while waiting for a response from the server (e.g., server is slow, network issues)
    ConnectError, # Error while trying to establish a new connection (e.g., server is unreachable, network issues)
    WriteError, # Error while trying to send data to the server (e.g., server is overloaded, network issues)
    TimeoutException # General timeout exception (e.g., operation took too long)
)

RETRYABLE_STATUS_CODES = [408, 429, 500, 502, 503, 504] # HTTP status codes that indicate transient errors (e.g., request timeout, too many requests, server errors)

class ContentLoader:

    @staticmethod
    async def load_data(url:str):        
                
        try:
            return await asyncio.wait_for(ContentLoader._load_safe(url), timeout=30)  # Set an overall timeout for the loading operation
        except asyncio.TimeoutError as e:
            print(f"Timeout while loading content from {url}: {e}")
            return []
        except RetryError as e:
            print(f"Failed to load content from {url} after multiple attempts: {e}")
            return []
        except IpBlocked as e:
            print(f"Youtube IP blocked while loading content from {url}")
            return []
        except RequestBlocked as e:
            print(f"Youtube request blocked while loading content from {url}")
            return []
        except requests.exceptions.HTTPError as e:
            print(f"HTTP error {e.response.status_code} while loading content from {url}")
            return []
        except Exception as e:
            print(f"Unexpected error while loading content from {url}: {e}")
            return []
    
    @staticmethod    
    def _is_retriable(e: Exception) -> bool:
        is_valid_exception = isinstance(e, RETRYABLE_EXCEPTIONS)        
        is_valid_http_status = (isinstance(e, HTTPStatusError) or isinstance(e, requests.exceptions.HTTPError)) and e.response.status_code in RETRYABLE_STATUS_CODES
        
        if is_valid_exception or is_valid_http_status:                        
            print(f"Retrying after error: {str(e)[:40]}...")  # Log the error message for debugging purposes
                            
        return is_valid_exception or is_valid_http_status

    @retry(
        stop=stop_after_attempt(3), 
        wait=wait_exponential(multiplier=1, min=2, max=5),
        retry=retry_if_exception(_is_retriable),
        reraise=True  # Reraise for non-retryable exceptions and after max attempts
    )
    async def _load_safe(url:str):
        # Implement logic to load data from different sources (YouTube, Websites, etc.)
        # Executes asynchronously to avoid blocking the event loop, especially for potentially long-running operations like web scraping or API calls
        # Retry Backoff: Will retry up to 3 times with exponential backoff (2s, 4s, 5s) between attempts in case of failures
        if "youtube.com" in url or "youtu.be" in url:            
            # Load YouTube transcript in chunks
            loader = YoutubeLoader.from_youtube_url(
                url,                                                 
                add_video_info=False,
                language=["pt", "en", "es"],
            )                               
            
            # Load transcript in a separate thread to avoid blocking
            # Apparently the YoutubeLoader method aload() doesn't work properly, 
            # so we use asyncio.to_thread to run the synchronous load() method without blocking the event loop
            transcript = await asyncio.to_thread(loader.load)  
                        
            title = await get_url_title_service(url)  # Fetch the title of the YouTube video                            
                        
            #Change metadata to include source URL and title (if available)
            for doc in transcript:                
                doc.metadata["source"] = url
                doc.metadata["title"] = title if title else url
            
            return transcript        
        else:                       
            return await asyncio.to_thread(ContentLoader.__extract_web_text, url)        
            
    @staticmethod
    def __extract_web_text(url: str) -> list[Document]:
        # Tags to extract during scraping
        tags_to_extract = ['div', 'h1', 'h2', 'h3', 'h4', 'h5', 'p', 'span', 'pre', 'code', 'a', 'ul', 'li']

        # Keywords to identify irrelevant content in class or id attributes
        irrelevant_stuff = ['callout', 'feedback', 'pagination', 'sidebar', 'navbar', 'header', 'footer', 'ads', 'advertisement', 'cookie', 'consent', 'subscribe', 'newsletter', 'social', 'share', 'comment', 'suggested', 'side-layout', 'sr-only']

        # Headers
        header_tags = ['h1', 'h2', 'h3', 'h4', 'h5']

        # Container tags that often hold main content but need to be checked for relevant class/id keywords
        container_tags = ['body', 'section', 'article', 'main']

        # Relevant class/id keywords for content containers
        container_keywords = ["content", "main", "article", "post", "entry"]

        loader = WebBaseLoader(
            url,
            bs_kwargs={
                'parse_only': SoupStrainer(tags_to_extract)
            },
            raise_for_status=True
        )

        soup = loader.scrape() # Get the BeautifulSoup object from the loader

        # Extract text content while filtering out irrelevant elements
        for tag in soup.find_all(True):

            if not isinstance(tag, Tag):
                continue

            attrs = getattr(tag, 'attrs', None)
            if not isinstance(attrs, dict):
                continue

            # --- CLEANING PASS ---
            ## 1. Remove hidden elements and common layout/structural tags that are not relevant for content extraction    
            if (tag.get('aria-hidden') == 'true' or
                tag.name in ['svg', 'script', 'style', 'footer', 'header', 'nav', 'aside'] or 
                ContentLoader.__attr_contains(tag.get('class'), irrelevant_stuff) or
                ContentLoader.__attr_contains(tag.get('id'), irrelevant_stuff)):

                tag.decompose()
                continue
            
            ## 2. Handle images by replacing them with their alt text if available, or removing them if not
            if tag.name == 'img':
                alt = tag.get('alt', '').strip()
                if alt:
                    tag.replace_with(f" [Image Alt: {alt}] ")
                else:
                    tag.decompose()
                    continue

            # --- STRUCTURE REFINEMENT PASS ---
            ## 3. For container tags, if they don't have relevant class/id keywords and are empty, decompose them to reduce noise
            if tag.name in container_tags:
                if (not ContentLoader.__attr_contains(tag.get('class'), container_keywords) or
                    not ContentLoader.__attr_contains(tag.get('id'), container_keywords)):
                    tag.decompose()
                    continue

            ## 4. Unwrap empty links (especially in headers) to preserve their text while removing the link structure
            if tag.name in header_tags:
                for a in tag.find_all('a'):
                    if not a.get_text(strip=True) or a.get_text(strip=True) == '#':
                        a.decompose()
                        continue

            ## 5. Unwrap all remaining links to preserve their text while removing the link structure
            if tag.name == 'a':
                if tag.parent:
                    tag.insert_after(' ')  # Add a space after the link to separate it from following content
                    tag.unwrap()

        html_string = str(soup)
        markdown_content = md(
            html_string, 
            heading_style="ATX", 
            strip=['div', 'span', 'footer'] # 'strip' remove tags vazias que sobraram e poluem o MD
        ) 

        cleaned_content = ContentLoader.__normalize_markdown(markdown_content)

        return [Document(page_content=cleaned_content, metadata={"source": url, "title": soup.title.string if soup.title else url})]

    @staticmethod
    def __normalize_markdown(markdown_content: str) -> str:
        code_blocks = []
        
        def save_code(match):
            code_blocks.append(match.group(0))
            return f"<<<CODE_BLOCK_{len(code_blocks)-1}>>>"

        ## 1 - Temporarily replace code blocks with placeholders to protect them during cleaning
        temp_content = re.sub(r'```[\s\S]*?```', save_code, markdown_content)

        ## 2 - Normalize Line Breaks (reduce 3+ newlines to two)
        temp_content = re.sub(r'\n{3,}', '\n\n', temp_content)

        # 3 - Normalize Spaces (reduce 2+ spaces/tabs to a single space)
        temp_content = re.sub(r'[ \t]{2,}', ' ', temp_content)

        ## 4 - Reduce multiple newlines with optional whitespace in between to just two newlines to preserve paragraph breaks without excessive spacing
        temp_content = re.sub(r'\n\s*\n', '\n\n', temp_content)

        ## 5 - Restore code blocks from placeholders
        for i, code in enumerate(code_blocks):
            temp_content = temp_content.replace(f"<<<CODE_BLOCK_{i}>>>", code)
         
        return temp_content.strip()        

    @staticmethod
    def __attr_contains(value, keywords: list[str]) -> bool:
        # Helper function to check if a class/id attribute contains any of the specified keywords
        if not value:
            return False
        if isinstance(value, list):
            return any(
                isinstance(item, str) and any(keyword in item.lower() for keyword in keywords)
                for item in value
            )
        if isinstance(value, str):
            return any(keyword in value.lower() for keyword in keywords)
        return False
                