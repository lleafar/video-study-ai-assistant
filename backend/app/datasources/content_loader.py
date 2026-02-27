from langchain_community.document_loaders import YoutubeLoader, WebBaseLoader
from langchain_core.documents import Document
from bs4 import SoupStrainer, Tag
from markdownify import markdownify as md
from app.services.title_service import get_url_title_service
import re
import asyncio

class ContentLoader:

    @staticmethod
    async def load_data(url:str):        
        # Implement logic to load data from different sources (YouTube, Websites, etc.)
        if "youtube.com" in url or "youtu.be" in url:            
            # Load YouTube transcript in chunks
            loader = YoutubeLoader.from_youtube_url(
                url,                                                 
                add_video_info=False,
                language=["pt", "en", "es"],
            )
            transcript = loader.load()
            #Change metadata to include source URL and title (if available)
            for doc in transcript:                
                doc.metadata["source"] = url
                doc.metadata["title"] = await get_url_title_service(url)
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
            }
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
                