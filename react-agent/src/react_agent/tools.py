"""This module provides tools for the agent.

현재 제공되는 도구:
- get_current_weather: 특정 도시의 현재 날씨 정보를 조회합니다.
"""

from typing import Any, Callable, List, Optional
import httpx
import os


async def get_current_weather(city: str) -> dict[str, Any]:
    """특정 도시의 현재 날씨를 조회합니다.

    Args:
        city: 날씨를 조회할 도시 이름 (예: "Seoul", "서울", "Busan")

    Returns:
        날씨 정보를 담은 딕셔너리 (온도, 습도, 날씨 상태 등)
    """
    # 한글 도시명을 영어로 매핑
    city_mapping = {
        "서울": "Seoul",
        "부산": "Busan",
        "인천": "Incheon",
        "대구": "Daegu",
        "대전": "Daejeon",
        "광주": "Gwangju",
        "울산": "Ulsan",
        "제주": "Jeju",
    }

    # 한글 도시명이면 영어로 변환
    city_en = city_mapping.get(city, city)

    try:
        # OpenWeatherMap API 사용 (API 키가 없으면 모의 데이터 반환)
        api_key = os.getenv("OPENWEATHER_API_KEY", "")

        if not api_key:
            # API 키가 없을 때 모의 데이터 반환
            return {
                "city": city,
                "temperature": "15°C",
                "humidity": "60%",
                "condition": "맑음",
                "description": f"{city}의 현재 날씨는 맑고 온도는 15도입니다. (모의 데이터)",
                "note": "실제 날씨 데이터를 받으려면 OPENWEATHER_API_KEY 환경변수를 설정하세요."
            }

        # 실제 API 호출
        async with httpx.AsyncClient() as client:
            url = f"https://api.openweathermap.org/data/2.5/weather?q={city_en}&appid={api_key}&units=metric&lang=kr"
            response = await client.get(url)
            response.raise_for_status()
            data = response.json()

            return {
                "city": city,
                "temperature": f"{data['main']['temp']}°C",
                "humidity": f"{data['main']['humidity']}%",
                "condition": data['weather'][0]['main'],
                "description": data['weather'][0]['description'],
                "feels_like": f"{data['main']['feels_like']}°C",
            }
    except Exception as e:
        return {
            "city": city,
            "error": f"날씨 정보를 가져오는 데 실패했습니다: {str(e)}",
            "note": "도시 이름을 확인하거나 API 키 설정을 확인해주세요."
        }


TOOLS: List[Callable[..., Any]] = [get_current_weather]
