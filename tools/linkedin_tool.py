"""
LinkedIn posting tool — official LinkedIn API ("Share on LinkedIn" product) only.

Human-in-the-loop by design: by default this tool RETURNS the formatted draft and
does NOT publish. It only calls the network when approve=True AND a token is present.

Auth: set LINKEDIN_ACCESS_TOKEN and LINKEDIN_AUTHOR_URN in .env.
How to obtain (free, official):
  1. Create an app: https://www.linkedin.com/developers/apps
  2. Request the "Share on LinkedIn" + "Sign In with LinkedIn using OpenID Connect" products.
  3. OAuth scopes: w_member_social (post) + openid profile.
  4. Run the 3-legged OAuth flow to get a member access token.
  5. Your author URN looks like "urn:li:person:XXXXXXXX" (from the /userinfo endpoint).

Loaded by agents that reference  "custom:linkedin_tool".
"""
import os
import requests
from typing import Type
from pydantic import BaseModel, Field
from crewai.tools import BaseTool

POSTS_API = "https://api.linkedin.com/v2/ugcPosts"


class LinkedInPostInput(BaseModel):
    text: str = Field(..., description="The post body to publish.")
    approve: bool = Field(
        False,
        description="Must be explicitly True to actually publish. "
        "Default False = returns the draft for human review only.",
    )


class LinkedInPostTool(BaseTool):
    name: str = "linkedin_publish_post"
    description: str = (
        "Format and (only with approve=True) publish a text post to LinkedIn via the "
        "official API. Without approval it returns the draft for human sign-off."
    )
    args_schema: Type[BaseModel] = LinkedInPostInput

    def _run(self, text: str, approve: bool = False) -> str:
        if not approve:
            return (
                "DRAFT (not published — awaiting human approval).\n"
                "Re-invoke with approve=True once the user confirms.\n\n"
                f"--- DRAFT ---\n{text}"
            )

        token = os.getenv("LINKEDIN_ACCESS_TOKEN", "")
        author = os.getenv("LINKEDIN_AUTHOR_URN", "")
        if not token or not author:
            return (
                "Cannot publish: LINKEDIN_ACCESS_TOKEN and/or LINKEDIN_AUTHOR_URN missing in .env. "
                "See tools/linkedin_tool.py header for the setup steps."
            )

        payload = {
            "author": author,
            "lifecycleState": "PUBLISHED",
            "specificContent": {
                "com.linkedin.ugc.ShareContent": {
                    "shareCommentary": {"text": text},
                    "shareMediaCategory": "NONE",
                }
            },
            "visibility": {"com.linkedin.ugc.MemberNetworkVisibility": "PUBLIC"},
        }
        resp = requests.post(
            POSTS_API,
            headers={
                "Authorization": f"Bearer {token}",
                "X-Restli-Protocol-Version": "2.0.0",
                "Content-Type": "application/json",
            },
            json=payload,
            timeout=30,
        )
        if resp.status_code >= 300:
            return f"LinkedIn API error {resp.status_code}: {resp.text}"
        return f"Published to LinkedIn. Post id: {resp.headers.get('x-restli-id', 'unknown')}"


linkedin_tool = LinkedInPostTool()
