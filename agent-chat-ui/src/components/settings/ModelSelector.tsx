"use client";

import { useState, useEffect } from "react";
import { Download, Trash2, RefreshCw, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

interface OllamaModel {
  name: string;
  size: number;
  modified_at: string;
}

interface ModelSelectorProps {
  currentModel: string;
  onModelChange: (model: string) => void;
  ollamaUrl?: string;
}

export function ModelSelector({ currentModel, onModelChange, ollamaUrl }: ModelSelectorProps) {
  const [models, setModels] = useState<OllamaModel[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isPulling, setIsPulling] = useState(false);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);
  const [modelToPull, setModelToPull] = useState("");
  const [pullProgress, setPullProgress] = useState<number>(0);
  const [pullStatus, setPullStatus] = useState<string>("");

  // Ollama API URL (기본값: docker-compose의 ollama 서비스)
  const apiUrl = ollamaUrl || "http://10.40.217.195:11434";

  const fetchModels = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`${apiUrl}/api/tags`);
      if (!response.ok) throw new Error("Failed to fetch models");

      const data = await response.json();
      setModels(data.models || []);
    } catch (error) {
      console.error("Error fetching models:", error);
      toast.error("모델 목록을 불러올 수 없습니다");
    } finally {
      setIsLoading(false);
    }
  };

  const pullModel = async () => {
    if (!modelToPull.trim()) {
      toast.error("모델 이름을 입력하세요");
      return;
    }

    setIsPulling(true);
    setPullProgress(0);
    setPullStatus("다운로드 준비 중...");
    toast.info(`${modelToPull} 다운로드를 시작합니다...`);

    try {
      const response = await fetch(`${apiUrl}/api/pull`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: modelToPull, stream: true }),
      });

      if (!response.ok) throw new Error("Failed to pull model");

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();

      if (reader) {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const chunk = decoder.decode(value);
          const lines = chunk.split("\n").filter((line) => line.trim());

          for (const line of lines) {
            try {
              const data = JSON.parse(line);

              // 진행률 계산
              if (data.total && data.completed) {
                const progress = Math.round((data.completed / data.total) * 100);
                setPullProgress(progress);
                setPullStatus(data.status || "다운로드 중...");
              } else if (data.status) {
                setPullStatus(data.status);
              }
            } catch (e) {
              // JSON 파싱 오류 무시
            }
          }
        }
      }

      toast.success(`${modelToPull} 다운로드 완료!`);
      setModelToPull("");
      setPullProgress(0);
      setPullStatus("");
      await fetchModels();
    } catch (error) {
      console.error("Error pulling model:", error);
      toast.error("모델 다운로드 실패");
      setPullProgress(0);
      setPullStatus("");
    } finally {
      setIsPulling(false);
    }
  };

  const deleteModel = async (modelName: string) => {
    if (!confirm(`${modelName} 모델을 삭제하시겠습니까?`)) {
      return;
    }

    setIsDeleting(modelName);
    try {
      const response = await fetch(`${apiUrl}/api/delete`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: modelName }),
      });

      if (!response.ok) throw new Error("Failed to delete model");

      toast.success(`${modelName} 삭제 완료`);
      await fetchModels();

      // 삭제된 모델이 현재 선택된 모델이면 초기화
      if (currentModel === modelName && models.length > 0) {
        onModelChange(models[0].name);
      }
    } catch (error) {
      console.error("Error deleting model:", error);
      toast.error("모델 삭제 실패");
    } finally {
      setIsDeleting(null);
    }
  };

  const formatSize = (bytes: number): string => {
    if (bytes === 0) return "0 B";
    const k = 1024;
    const sizes = ["B", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + " " + sizes[i];
  };

  useEffect(() => {
    fetchModels();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Label className="text-base">Ollama 모델 관리</Label>
        <Button
          variant="ghost"
          size="sm"
          onClick={fetchModels}
          disabled={isLoading}
        >
          <RefreshCw className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
        </Button>
      </div>

      {/* 현재 선택된 모델 */}
      <div className="rounded-lg border p-3 bg-muted/50">
        <p className="text-xs text-muted-foreground mb-1">현재 사용 중인 모델</p>
        <p className="font-medium">{currentModel}</p>
      </div>

      {/* 모델 다운로드 */}
      <div className="space-y-2">
        <Label className="text-sm">새 모델 다운로드</Label>
        <div className="flex gap-2">
          <Input
            placeholder="예: llama3.2:3b"
            value={modelToPull}
            onChange={(e) => setModelToPull(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !isPulling) {
                pullModel();
              }
            }}
            disabled={isPulling}
          />
          <Button
            onClick={pullModel}
            disabled={isPulling || !modelToPull.trim()}
            size="sm"
          >
            <Download className="h-4 w-4 mr-1" />
            {isPulling ? "다운로드 중..." : "다운로드"}
          </Button>
        </div>

        {/* 다운로드 진행률 표시 */}
        {isPulling && (
          <div className="space-y-1">
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground">{pullStatus}</span>
              <span className="font-medium">{pullProgress}%</span>
            </div>
            <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
              <div
                className="bg-primary h-full transition-all duration-300 ease-out"
                style={{ width: `${pullProgress}%` }}
              />
            </div>
          </div>
        )}

        <p className="text-xs text-muted-foreground">
          추천: llama3.2:3b, llama3.2:1b, gemma2:2b
        </p>
      </div>

      {/* 설치된 모델 목록 */}
      <div className="space-y-2">
        <Label className="text-sm">설치된 모델</Label>
        <div className="space-y-2 max-h-[300px] overflow-y-auto rounded-lg border p-2">
          {isLoading ? (
            <p className="text-sm text-muted-foreground text-center py-4">
              로딩 중...
            </p>
          ) : models.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">
              설치된 모델이 없습니다
            </p>
          ) : (
            models.map((model) => (
              <div
                key={model.name}
                className={`flex items-center justify-between p-2 rounded-md transition-colors ${
                  currentModel === model.name
                    ? "bg-primary/10 border border-primary/20"
                    : "hover:bg-muted/50"
                }`}
              >
                <button
                  onClick={() => onModelChange(model.name)}
                  className="flex-1 text-left"
                >
                  <div className="flex items-center gap-2">
                    {currentModel === model.name && (
                      <Check className="h-4 w-4 text-primary" />
                    )}
                    <div>
                      <p className="text-sm font-medium">{model.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {formatSize(model.size)}
                      </p>
                    </div>
                  </div>
                </button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => deleteModel(model.name)}
                  disabled={isDeleting === model.name}
                  className="text-destructive hover:text-destructive"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))
          )}
        </div>
      </div>

      <div className="rounded-lg bg-blue-50 dark:bg-blue-950/20 p-3 border border-blue-200 dark:border-blue-800">
        <p className="text-xs text-blue-900 dark:text-blue-100">
          💡 <strong>팁:</strong> 모델을 선택하고 &quot;Save Configuration&quot; 버튼을 눌러 적용하세요.
          더 많은 모델은{" "}
          <a
            href="https://ollama.com/library"
            target="_blank"
            rel="noopener noreferrer"
            className="underline"
          >
            Ollama 라이브러리
          </a>
          에서 확인할 수 있습니다.
        </p>
      </div>
    </div>
  );
}
