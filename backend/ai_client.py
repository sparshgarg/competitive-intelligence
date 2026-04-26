"""Provider-neutral AI helpers for optional extraction and synthesis."""
from __future__ import annotations

import os
from typing import Any, Optional

import httpx
from dotenv import load_dotenv

OPENAI_COMPATIBLE_PROVIDERS: dict[str, dict[str, str]] = {
    "groq": {
        "api_key_env": "GROQ_API_KEY",
        "model_env": "GROQ_MODEL",
        "default_model": "llama-3.3-70b-versatile",
        "base_url": "https://api.groq.com/openai/v1/chat/completions",
    },
    "gemini": {
        "api_key_env": "GEMINI_API_KEY",
        "model_env": "GEMINI_MODEL",
        "default_model": "gemini-2.0-flash",
        "base_url": "https://generativelanguage.googleapis.com/v1beta/openai/chat/completions",
    },
    "xai": {
        "api_key_env": "XAI_API_KEY",
        "model_env": "XAI_MODEL",
        "default_model": "",
        "base_url": "https://api.x.ai/v1/chat/completions",
    },
    "openai_compatible": {
        "api_key_env": "OPENAI_COMPATIBLE_API_KEY",
        "model_env": "OPENAI_COMPATIBLE_MODEL",
        "default_model": "",
        "base_url_env": "OPENAI_COMPATIBLE_BASE_URL",
    },
}


def _load_env() -> None:
    load_dotenv(override=True)


def _provider_has_credentials(provider: str) -> bool:
    if provider in OPENAI_COMPATIBLE_PROVIDERS:
        config = OPENAI_COMPATIBLE_PROVIDERS[provider]
        if not os.environ.get(config["api_key_env"]):
            return False
        if provider == "openai_compatible" and not os.environ.get(config.get("base_url_env", "")):
            return False
        return True
    if provider == "claude":
        return bool(os.environ.get("ANTHROPIC_API_KEY"))
    return False


def _selected_provider() -> Optional[str]:
    _load_env()
    configured = os.environ.get("AI_PROVIDER", "auto").strip().lower()
    if configured == "grok":
        configured = "xai"
    if configured and configured != "auto":
        return configured if _provider_has_credentials(configured) else None

    for provider, config in OPENAI_COMPATIBLE_PROVIDERS.items():
        if os.environ.get(config["api_key_env"]):
            return provider
    if os.environ.get("ANTHROPIC_API_KEY"):
        return "claude"
    return None


def _openai_compatible_config(provider: str) -> tuple[str, str, str]:
    config = OPENAI_COMPATIBLE_PROVIDERS[provider]
    api_key = os.environ.get(config["api_key_env"], "")
    model = os.environ.get(config["model_env"], "") or config["default_model"]
    base_url = config.get("base_url") or os.environ.get(config.get("base_url_env", ""), "")
    if not api_key:
        raise RuntimeError(f"{config['api_key_env']} is required for AI_PROVIDER={provider}")
    if not model:
        raise RuntimeError(f"{config['model_env']} is required for AI_PROVIDER={provider}")
    if not base_url and provider == "openai_compatible":
        raise RuntimeError("OPENAI_COMPATIBLE_BASE_URL is required for AI_PROVIDER=openai_compatible")
    return api_key, model, base_url


def ai_provider_name() -> str:
    return _selected_provider() or "fallback"


def ai_cache_namespace() -> str:
    _load_env()
    provider = ai_provider_name()
    if provider in OPENAI_COMPATIBLE_PROVIDERS:
        config = OPENAI_COMPATIBLE_PROVIDERS[provider]
        model = os.environ.get(config["model_env"], "") or config["default_model"]
        return f"{provider}:{model or 'unset'}"
    if provider == "claude":
        return f"claude:{os.environ.get('ANTHROPIC_MODEL', 'claude-3-5-sonnet-latest')}"
    return "fallback"


def ai_enabled() -> bool:
    return ai_provider_name() != "fallback"


def _openai_compatible_chat(
    provider: str,
    prompt: str,
    *,
    max_tokens: int,
    temperature: float,
    json_mode: bool,
) -> str:
    api_key, model, base_url = _openai_compatible_config(provider)
    payload: dict[str, Any] = {
        "model": model,
        "messages": [{"role": "user", "content": prompt}],
        "max_tokens": max_tokens,
        "temperature": temperature,
    }
    if json_mode:
        payload["response_format"] = {"type": "json_object"}
    response = httpx.post(
        base_url,
        headers={"Authorization": f"Bearer {api_key}", "Content-Type": "application/json"},
        json=payload,
        timeout=60,
    )
    response.raise_for_status()
    return response.json()["choices"][0]["message"].get("content") or ""


def _claude_chat(prompt: str, *, max_tokens: int, temperature: float, json_mode: bool) -> str:
    api_key = os.environ.get("ANTHROPIC_API_KEY", "")
    if not api_key:
        raise RuntimeError("ANTHROPIC_API_KEY is required for AI_PROVIDER=claude")
    if json_mode:
        prompt = f"{prompt}\n\nReturn only valid JSON. Do not include markdown fences."
    response = httpx.post(
        "https://api.anthropic.com/v1/messages",
        headers={
            "x-api-key": api_key,
            "anthropic-version": "2023-06-01",
            "Content-Type": "application/json",
        },
        json={
            "model": os.environ.get("ANTHROPIC_MODEL", "claude-3-5-sonnet-latest"),
            "messages": [{"role": "user", "content": prompt}],
            "max_tokens": max_tokens,
            "temperature": temperature,
        },
        timeout=60,
    )
    response.raise_for_status()
    blocks = response.json().get("content", [])
    return "".join(block.get("text", "") for block in blocks if block.get("type") == "text")


def ai_chat(prompt: str, *, max_tokens: int, temperature: float = 0.0, json_mode: bool = False) -> str:
    _load_env()
    provider = _selected_provider()
    if provider is None:
        raise RuntimeError("No AI provider configured")
    if provider in OPENAI_COMPATIBLE_PROVIDERS:
        return _openai_compatible_chat(
            provider,
            prompt,
            max_tokens=max_tokens,
            temperature=temperature,
            json_mode=json_mode,
        )
    if provider == "claude":
        return _claude_chat(prompt, max_tokens=max_tokens, temperature=temperature, json_mode=json_mode)
    raise RuntimeError(f"Unsupported AI_PROVIDER={provider}")

