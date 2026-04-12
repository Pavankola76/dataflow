import asyncio
import sys
import os

# Add API to path
sys.path.append(os.path.join(os.path.dirname(__file__), "..", "apps", "api"))

from database import engine, AsyncSessionLocal
from models.user import User, Organization, Workspace
from middleware.auth import hash_password
from sqlalchemy import select
from uuid import uuid4

async def main():
    async with AsyncSessionLocal() as session:
        # Check if exists
        result = await session.execute(select(User).where(User.email == "test@dataflow.ai"))
        if result.scalar_one_or_none():
            print("User test@dataflow.ai already exists.")
            return

        # Create Org
        org = Organization(name="Test Org", slug=f"test-org-{uuid4().hex[:6]}")
        session.add(org)
        await session.flush()

        # Create User
        user = User(
            email="test@dataflow.ai",
            name="Test User",
            hashed_password=hash_password("password123"),
            org_id=org.id,
            role="admin"
        )
        session.add(user)
        await session.flush()

        # Create Workspace
        ws = Workspace(org_id=org.id, name="Test WS", description="Test WS")
        session.add(ws)
        await session.flush()

        await session.commit()
        print("Successfully created test@dataflow.ai user with password password123")

if __name__ == "__main__":
    asyncio.run(main())
