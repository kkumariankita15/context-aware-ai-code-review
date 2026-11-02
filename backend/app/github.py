import httpx
from .config import settings

async def fetch_pull_request_diff(owner: str, repo: str, number: int):
    if not settings.github_token:
        raise ValueError("Set GITHUB_TOKEN to analyze a GitHub pull request.")
    url = f"https://api.github.com/repos/{owner}/{repo}/pulls/{number}"
    headers = {"Authorization": f"Bearer {settings.github_token}",
               "Accept": "application/vnd.github.v3.diff", "X-GitHub-Api-Version": "2022-11-28"}
    async with httpx.AsyncClient(timeout=30) as client:
        response = await client.get(url, headers=headers)
        response.raise_for_status()
        return response.text

async def post_pr_comment(owner: str, repo: str, number: int, body: str):
    if not settings.github_token:
        return
    url = f"https://api.github.com/repos/{owner}/{repo}/issues/{number}/comments"
    async with httpx.AsyncClient(timeout=30) as client:
        response = await client.post(url, headers={"Authorization": f"Bearer {settings.github_token}",
            "Accept": "application/vnd.github+json"}, json={"body": body})
        response.raise_for_status()
