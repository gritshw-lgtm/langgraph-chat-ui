# LLM Agent Docker Compose Setup

LangGraph React Agent와 Agent Chat UI를 Docker Compose로 통합한 프로젝트입니다.

## 프로젝트 구조

```
llm-agent/
├── docker-compose.yml           # Docker Compose 설정
├── .env                          # 환경 변수
├── react-agent/                  # LangGraph 백엔드
│   ├── Dockerfile
│   ├── pyproject.toml
│   └── src/
└── agent-chat-ui/                # Next.js 프론트엔드
    ├── Dockerfile
    ├── package.json
    └── src/
```

## 서비스 구성

1. **ollama** (포트 11434)
   - Ollama LLM 서비스
   - OpenAI 호환 API 제공
   - GPU 지원

2. **react-agent** (포트 2024)
   - LangGraph ReAct Agent 백엔드
   - LangGraph Dev Server
   - Python 3.11 기반
   - Ollama와 연동

3. **agent-chat-ui** (포트 3000)
   - Next.js 기반 챗봇 UI
   - LangGraph API와 통신

## 사용 방법

### 1. 환경 변수 설정

`.env` 파일을 확인하고 필요한 환경 변수를 설정하세요:

```bash
# Ollama API 설정
OPENAI_API_KEY=ollama
OPENAI_BASE_URL=http://ollama:11434/v1

# LangSmith API (선택사항)
LANGSMITH_API_KEY=your_key_here
```

### 2. 서비스 실행

```bash
# 전체 서비스 빌드 및 실행
docker-compose up -d

# 로그 확인
docker-compose logs -f

# 특정 서비스 로그만 확인
docker-compose logs -f react-agent
docker-compose logs -f agent-chat-ui
```

### 3. Ollama 모델 다운로드

첫 실행 시 Ollama 모델을 다운로드해야 합니다:

```bash
# Llama 3.2 3B 모델 다운로드 (권장)
docker exec llm-ollama ollama pull llama3.2:3b

# 또는 다른 모델
docker exec llm-ollama ollama pull llama3.2:1b
docker exec llm-ollama ollama pull gemma2:2b

# 사용 가능한 모델 확인
docker exec llm-ollama ollama list
```

### 4. 서비스 접속

- **프론트엔드 UI**: http://10.40.217.195:3000 (또는 http://localhost:3000)
- **LangGraph API**: http://10.40.217.195:2024
- **API 문서**: http://10.40.217.195:2024/docs
- **Ollama API**: http://10.40.217.195:11434
- **LangSmith Studio**: https://smith.langchain.com/studio/?baseUrl=http://10.40.217.195:2024

### 5. 서비스 중지

```bash
# 서비스 중지 (컨테이너 유지)
docker-compose stop

# 서비스 중지 및 컨테이너 삭제
docker-compose down

# 볼륨까지 모두 삭제
docker-compose down -v
```

### 6. 재빌드

코드 변경 후 재빌드가 필요한 경우:

```bash
# 특정 서비스만 재빌드
docker-compose build react-agent
docker-compose build agent-chat-ui

# 전체 재빌드 및 재실행
docker-compose up -d --build
```

## 개발 모드

볼륨 마운트가 설정되어 있어 코드 변경 시 자동으로 반영됩니다:

- **react-agent**: 파일 변경 시 LangGraph Dev Server가 자동 재로드
- **agent-chat-ui**: Next.js 프로덕션 모드로 실행 (재빌드 필요)

## 트러블슈팅

### 포트 충돌

이미 사용 중인 포트가 있다면 `docker-compose.yml`에서 포트를 변경하세요:

```yaml
ports:
  - "새로운포트:2024"  # react-agent
  - "새로운포트:3000"  # agent-chat-ui
```

### 컨테이너 상태 확인

```bash
# 컨테이너 상태 확인
docker-compose ps

# 컨테이너 헬스체크 확인
docker inspect llm-react-agent | grep -A 10 Health
```

### 로그 확인

```bash
# 전체 로그
docker-compose logs

# 실시간 로그
docker-compose logs -f --tail=100

# 특정 서비스 로그
docker-compose logs react-agent
```

## 환경

- Docker Engine 20.10+
- Docker Compose V2+
- 8GB RAM 이상 권장
