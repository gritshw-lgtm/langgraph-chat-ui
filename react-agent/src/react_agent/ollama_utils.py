"""Ollama API utilities for model management."""

import os
from typing import Any, Optional
import httpx


async def get_ollama_models() -> list[dict[str, Any]]:
    """Ollama에서 사용 가능한 모델 목록을 조회합니다.

    Returns:
        모델 목록 (이름, 크기, 수정일 등)
    """
    ollama_base_url = os.getenv("OPENAI_BASE_URL", "http://ollama:11434/v1")
    # OpenAI 호환 URL을 Ollama API URL로 변환
    ollama_api_url = ollama_base_url.replace("/v1", "")

    try:
        async with httpx.AsyncClient(timeout=10.0) as client:
            response = await client.get(f"{ollama_api_url}/api/tags")
            response.raise_for_status()
            data = response.json()

            models = []
            for model in data.get("models", []):
                models.append({
                    "name": model.get("name", ""),
                    "model": model.get("model", ""),
                    "size": model.get("size", 0),
                    "modified_at": model.get("modified_at", ""),
                    "digest": model.get("digest", ""),
                })

            return models
    except Exception as e:
        print(f"Ollama 모델 목록 조회 실패: {e}")
        return []


async def pull_ollama_model(model_name: str) -> dict[str, Any]:
    """Ollama 모델을 다운로드합니다.

    Args:
        model_name: 다운로드할 모델 이름 (예: "llama3.2:3b")

    Returns:
        다운로드 상태 정보
    """
    ollama_base_url = os.getenv("OPENAI_BASE_URL", "http://ollama:11434/v1")
    ollama_api_url = ollama_base_url.replace("/v1", "")

    try:
        async with httpx.AsyncClient(timeout=600.0) as client:
            response = await client.post(
                f"{ollama_api_url}/api/pull",
                json={"name": model_name, "stream": False}
            )
            response.raise_for_status()
            return {"success": True, "model": model_name}
    except Exception as e:
        return {"success": False, "error": str(e)}


async def delete_ollama_model(model_name: str) -> dict[str, Any]:
    """Ollama 모델을 삭제합니다.

    Args:
        model_name: 삭제할 모델 이름

    Returns:
        삭제 상태 정보
    """
    ollama_base_url = os.getenv("OPENAI_BASE_URL", "http://ollama:11434/v1")
    ollama_api_url = ollama_base_url.replace("/v1", "")

    try:
        async with httpx.AsyncClient(timeout=30.0) as client:
            response = await client.delete(
                f"{ollama_api_url}/api/delete",
                json={"name": model_name}
            )
            response.raise_for_status()
            return {"success": True, "model": model_name}
    except Exception as e:
        return {"success": False, "error": str(e)}


async def get_ollama_model_info(model_name: str) -> Optional[dict[str, Any]]:
    """특정 Ollama 모델의 상세 정보를 조회합니다.

    Args:
        model_name: 조회할 모델 이름

    Returns:
        모델 정보 또는 None
    """
    ollama_base_url = os.getenv("OPENAI_BASE_URL", "http://ollama:11434/v1")
    ollama_api_url = ollama_base_url.replace("/v1", "")

    try:
        async with httpx.AsyncClient(timeout=10.0) as client:
            response = await client.post(
                f"{ollama_api_url}/api/show",
                json={"name": model_name}
            )
            response.raise_for_status()
            return response.json()
    except Exception as e:
        print(f"모델 정보 조회 실패: {e}")
        return None
