import httpx
from bs4 import BeautifulSoup

async def get_url_title_service(url: str) -> str:
    try:
        async with httpx.AsyncClient(timeout=5, follow_redirects=True) as client:
            response = await client.get(url)
            response.raise_for_status()

        soup = BeautifulSoup(response.text, "html.parser")
        title = soup.find("title")
        if title and title.string:
            return title.string.strip()

        return url
    except Exception:
        return url