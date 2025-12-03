# Git 업데이트 가이드

## 코드 수정 후 GitHub 업데이트 방법

### 1단계: 변경사항 확인
```bash
cd /home/gpu5/llm-agent
git status
```

### 2단계: 변경사항 추가
```bash
# 모든 파일
git add .

# 또는 특정 파일만
git add 파일명
```

### 3단계: 커밋
```bash
git commit -m "변경 내용 요약"
```

### 4단계: 푸시
```bash
git push
```

## 자주 쓰는 Git 명령어

- `git status` - 현재 상태 확인
- `git log --oneline -5` - 최근 5개 커밋 확인
- `git diff` - 변경사항 상세 확인
- `git pull` - 원격 저장소에서 최신 코드 받기

## 커밋 메시지 작성 팁

좋은 예:
- "Add weather tool for Korean cities"
- "Fix: 한글 응답 오류 수정"
- "Update: Docker Compose 설정 개선"

나쁜 예:
- "update"
- "fix"
- "변경"
