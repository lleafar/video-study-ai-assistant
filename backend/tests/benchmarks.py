import sys
import os
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from content_loader_old import ContentLoader as OldContentLoader
from app.datasources.content_loader import ContentLoader as NewContentLoader
from dataclasses import dataclass, field
from typing import Optional
from aiohttp import web
import statistics
import asyncio
import time

PORT_TIMEOUT_SERVER = 19876
URL_TIMEOUT_SERVER = f"http://localhost:{PORT_TIMEOUT_SERVER}/very/slow/endpoint"  # Simulate a very slow endpoint with a 50-second delay

async def handler_timeout(request):
    """
    Handler for the aiohttp server that simulates a request that takes a very long time to respond, 
    effectively causing a timeout for the client.
    This is used to test the timeout and retry logic of the title fetching service.
    """
    await asyncio.sleep(40)  # Simulate a server that takes 40 seconds to respond, longer than the new loader's timeout of 30s
    return web.Response(text="This response simulates a timeout scenario.")

async def start_timeout_server():
    """Server that simulates a timeout."""


    app = web.Application()
    app.router.add_get("/very/slow/endpoint", handler_timeout)

    runner = web.AppRunner(app)
    await runner.setup()
    site = web.TCPSite(runner, "localhost", PORT_TIMEOUT_SERVER)
    await site.start()

    print(f"Starting timeout server at {URL_TIMEOUT_SERVER}")
    return runner


async def stop_timeout_server(runner):
    if runner:
        await runner.cleanup()
        print("  --  Servidor local encerrado")

@dataclass
class ResultadoURL:
    url: str
    success: bool
    load_time_seconds: float    
    error: Optional[str] = None


@dataclass
class LoadBenchmark:
    number: int
    name: str
    documents: list[ResultadoURL] = field(default_factory=list)
    total_time: float = 0.0

    def __init__(self, number: int, name: str):
        self.number = number
        self.name = name
    
    def average_load_time_seconds(self):
        loaded_urls = [r for r in self.documents if r.success]
        if not loaded_urls:
            return 0.0        
        
        return statistics.mean([r.load_time_seconds for r in loaded_urls])    


@dataclass
class Benchmark:
    name: str
    repeat: int = 1
    benchmarks: list[LoadBenchmark] = field(default_factory=list)    

    async def start_benchmark(self, repeat: int = 1, func_to_benchmark=None):        
            
        name = self.name
        
        print(f"\nStarting benchmark '{name}' with {repeat} iterations... ========================\n")
        for i in range(repeat):
            benchmark = LoadBenchmark(number=i+1, name=name)            
            if func_to_benchmark:
                start_time = time.time()
                try:
                    results = await func_to_benchmark()
                    benchmark.documents = results if isinstance(results, list) else []
                except Exception as e:
                    print(f"[{name}] Error during benchmark iteration {i+1}")
                
                benchmark.total_time = time.time() - start_time
                print(f"[{name}] Iteration {i+1} completed in {benchmark.total_time:.2f} seconds with {len([r for r in benchmark.documents if r.success])}/{len(benchmark.documents)} URLs loaded successfully.")                        
        
            self.benchmarks.append(benchmark)            

        print(f"\nCompleted benchmark '{name}' with {repeat} iterations. ========================\n")
        
    def average_load_time_seconds(self) -> float:
        if not self.benchmarks:
            return 0.0
        
        if self.repeat == 1:
            # If only one iteration, return the average load time of that iteration
            return self.benchmarks[0].total_time
        
        return statistics.mean([b.total_time for b in self.benchmarks])
    
    def report(self):
        print(f"Benchmark Report for '{self.name}':")
        print(f"Average Load Time: {self.average_load_time_seconds():.2f} seconds")
        for benchmark in self.benchmarks:
            print(f"""
                Iteration {benchmark.number}:
                Load Time = {benchmark.total_time:.2f} seconds
                Loaded URLs = {len([r for r in benchmark.documents if r.success])}/{len(benchmark.documents)}
                  """)
    
async def content_loader_before(urls: list[str]):
    results = []
    
    for url in urls:
        start_time = time.time()
        try:
            # print(f"[Old ContentLoader] Loading documents from: {url}")
            document = await OldContentLoader.load_data(url)  # No timeout - should hang on slow endpoints
            results.append(ResultadoURL(
                url=url,
                success=bool(document),
                load_time_seconds=time.time() - start_time,                
            ))
        except Exception as e:
            # print(f"[Old ContentLoader] No documents found for URL: {url}")
            results.append(ResultadoURL(
                url=url,
                success=False,
                load_time_seconds=time.time() - start_time,                
                error=str(e)
            ))

    return results
    
    

async def content_loader_now(urls: list[str]):
        limit_concurrency = asyncio.Semaphore(3)  # Limit to 3 concurrent loads
        # Load documents only from new URLs
        async def _load_one(url: str):
            async with limit_concurrency:
                start_time = time.time()
                try: 
                    # print(f"[New ContentLoader] Loading documents from: {url}")
                    document = await NewContentLoader.load_data(url)
                    return ResultadoURL(
                        url=url,
                        success=bool(document),
                        load_time_seconds=time.time() - start_time
                    )
                except Exception as e:
                    # print(f"[New ContentLoader] No documents found for URL: {url}")
                    return ResultadoURL(
                        url=url,
                        success=False,
                        load_time_seconds=time.time() - start_time,
                        error=str(e)
                    )
            
        results = await asyncio.gather(*[_load_one(url) for url in urls])
        
        return results


async def benchmark_content_loader(urls: list[str] = None, repeat: int = 1):
    
    REPEAT = repeat
    before = Benchmark("BEFORE ContentLoader", repeat=REPEAT)
    await before.start_benchmark(repeat=REPEAT, func_to_benchmark=lambda: content_loader_before(urls))
    
    now = Benchmark("NOW ContentLoader", repeat=REPEAT)
    await now.start_benchmark(repeat=REPEAT, func_to_benchmark=lambda: content_loader_now(urls))
    
    print("\n=== Benchmark Results ===\n")    
    
    before.report()
    now.report()
    
    print(f"Average Load Time Before: {before.average_load_time_seconds():.2f} seconds")
    print(f"Average Load Time Now: {now.average_load_time_seconds():.2f} seconds")
    print(f"\nAverage Load Time Improvement: {before.average_load_time_seconds() - now.average_load_time_seconds():.2f} seconds")

async def benchmarks_of_content_loader():
    
    urls_with_delay = [
         "https://postman-echo.com/delay/6",
         "https://postman-echo.com/delay/2",
         "https://postman-echo.com/delay/4",
         "https://postman-echo.com/delay/9",
         
    ]
    
    urls_with_error = [
         "https://postman-echo.com/delay/6",
         "https://postman-echo.com/status/408",
         "https://postman-echo.com/delay/4",
         "https://postman-echo.com/delay/9",
         
    ]
    
    REPEAT = 3
    
    # await benchmark_content_loader(urls=urls_with_delay, repeat=REPEAT)
    await benchmark_content_loader(urls=urls_with_error, repeat=REPEAT)


async def benchmark_resilience():
    url = [URL_TIMEOUT_SERVER] # 50 seconds delay to simulate a very slow endpoint that would cause a timeout in the new loader (which has a 30s timeout)
    
    REPEAT = 3
    
    # before = Benchmark("BEFORE Title Fetching Service Resilience", repeat=REPEAT)    
    # await before.start_benchmark(repeat=REPEAT, func_to_benchmark=lambda: content_loader_before(url))
    
    now = Benchmark("NOW Title Fetching Service Resilience", repeat=REPEAT)
    await now.start_benchmark(repeat=REPEAT, func_to_benchmark=lambda: content_loader_now(url))
    
    print("\n=== Resilience Benchmark Results ===\n")
    
    # print(f"Average Load Time Before: {before.average_load_time_seconds():.2f} seconds")
    print(f"Average Load Time Before: Would have hung indefinitely due to no timeout")
    print(f"Average Load Time Now: {now.average_load_time_seconds():.2f} seconds")
    
        
async def main():
    runner = await start_timeout_server()
    try:
        await benchmarks_of_content_loader()
        # await benchmark_resilience()
    finally:
        await stop_timeout_server(runner)

if __name__ == "__main__":
    asyncio.run(main())