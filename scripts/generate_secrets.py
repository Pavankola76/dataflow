"""
DataFlow AI — Production Secret Generator
Run this once before deploying to generate secure JWT_SECRET and ENCRYPTION_KEY values.
Usage: python3 scripts/generate_secrets.py
"""
import secrets

print("=" * 60)
print("  DataFlow AI — Production Secrets Generator")
print("=" * 60)
print()
print("Copy these values into your production environment variables:")
print()
print(f"JWT_SECRET={secrets.token_hex(32)}")
print(f"ENCRYPTION_KEY={secrets.token_hex(16)}")
print()
print("WARNING: Never commit these values to Git!")
print("=" * 60)
