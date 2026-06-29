"""
GitHub automation tool — official GitHub REST API only (no scraping).

Auth: set GITHUB_TOKEN in .env (a fine-grained Personal Access Token).
Docs to create one: https://github.com/settings/tokens?type=beta
Scopes needed: "Contents: Read and write", "Pull requests: Read and write".

Loaded by agents that reference  "custom:github_tool".
"""
import os
import requests
from typing import Type
from pydantic import BaseModel, Field
from crewai.tools import BaseTool

API = "https://api.github.com"


def _headers() -> dict:
    token = os.getenv("GITHUB_TOKEN", "")
    if not token:
        raise RuntimeError(
            "GITHUB_TOKEN is not set. Add it to .env. "
            "Create one at https://github.com/settings/tokens?type=beta"
        )
    return {
        "Authorization": f"Bearer {token}",
        "Accept": "application/vnd.github+json",
        "X-GitHub-Api-Version": "2022-11-28",
    }


class GitHubReleaseInput(BaseModel):
    repo: str = Field(..., description="owner/repo, e.g. 'khatib/my-app'")
    tag: str = Field(..., description="Semver tag, e.g. 'v1.2.0'")
    title: str = Field(..., description="Release title")
    notes: str = Field(..., description="Markdown changelog / release notes")
    draft: bool = Field(True, description="Create as draft (safe default = human reviews before publish)")


class GitHubReleaseTool(BaseTool):
    name: str = "github_create_release"
    description: str = (
        "Create a GitHub Release (draft by default) via the official REST API. "
        "Requires GITHUB_TOKEN. Returns the release URL."
    )
    args_schema: Type[BaseModel] = GitHubReleaseInput

    def _run(self, repo: str, tag: str, title: str, notes: str, draft: bool = True) -> str:
        resp = requests.post(
            f"{API}/repos/{repo}/releases",
            headers=_headers(),
            json={"tag_name": tag, "name": title, "body": notes, "draft": draft},
            timeout=30,
        )
        if resp.status_code >= 300:
            return f"GitHub API error {resp.status_code}: {resp.text}"
        data = resp.json()
        state = "DRAFT (publish manually in the GitHub UI)" if draft else "PUBLISHED"
        return f"Release {tag} created [{state}]: {data.get('html_url')}"


# CrewAI's custom-tool loader instantiates the first BaseTool subclass it finds.
github_tool = GitHubReleaseTool()
