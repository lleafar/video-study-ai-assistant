from bs4 import BeautifulSoup
from tenacity import retry, stop_after_attempt, wait_exponential, RetryError, retry_if_exception_type
from ipaddress import ip_address as parse_ip
from urllib.parse import urlparse
from httpx import AsyncClient, ConnectTimeout, ReadTimeout, ConnectError, HTTPError, TimeoutException

async def get_url_title_service(url: str) -> str:
    
    async with AsyncClient(
        follow_redirects=True, # Follow redirects to handle cases where the URL might redirect to another page (e.g., URL shorteners, moved content)
        max_redirects=5,  # Limit the number of redirects to prevent infinite loops
        timeout=10.0  # Set a timeout for the request to avoid hanging indefinitely
    ) as client:
       try:

            # If the URL is not valid or does not start with http/https, return it as is (could be a plain text input)            
            if not url.startswith(("http://", "https://")):
                raise ValueError("Invalid URL format.")                
            
            if is_private_ip(url):
                raise ValueError("Private IP adresses not allowed")
            
            response = await _safely_get_data(url, client)

            soup = BeautifulSoup(response, "html.parser")
            title = soup.find("title")
            if title and title.string:
                return title.string.strip()
        
            return url
        
       except TimeoutException as e:
            print(f"Timeout while fetching title for URL {url}: {e}")
            return url
       except HTTPError as e:
            print(f"HTTP Error: {e} while fetching title for URL {url}")
            return url
       except RetryError as e:
           print(f"Failed to fetch title for URL {url} after multiple attempts: {e}")
           return url        
       except Exception as e:
            print(f"Unexpected error while fetching title for URL {url}: {e}")
            return url


RETRYABLE_EXCEPTIONS = (
    ConnectTimeout, # Timeout while trying to connect to the server (e.g., server is down, network issues)
    ReadTimeout, # Timeout while waiting for a response from the server (e.g., server is slow, network issues)
    ConnectError, # Error while trying to establish a new connection (e.g., server is unreachable, network issues)
    TimeoutException # General timeout exception (e.g., operation took too long)
) 

@retry(
    stop=stop_after_attempt(3), 
    wait=wait_exponential(multiplier=1, min=2, max=5),
    retry=retry_if_exception_type(RETRYABLE_EXCEPTIONS),
    reraise=True  # Reraise the exception after max attempts
)
async def _safely_get_data(url: str, client: AsyncClient) -> str:    
    # This gets the raw HTML content of the page, which is then parsed to extract the title.
    # Will retry up to 3 times with exponential backoff (2s, 4s, 5s) between attempts in case of failures
    response = await client.get(url)
    if len(response.content) > 5_000_000:  # Limit response size to 5MB to avoid processing excessively large pages
        raise ValueError(f"Response content too large for URL {url}")
    return response.text

# follow_redirects=True may open up security risks if the URL is not properly validated,
# as it could lead to SSRF (Server-Side Request Forgery) attacks.
def is_private_ip(url: str) -> bool:
    try:
        hostname = urlparse(url).hostname
        ip = parse_ip(hostname)
        return ip.is_private or ip.is_loopback
    except:
        return False