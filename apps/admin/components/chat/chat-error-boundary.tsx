"use client";

import { Component, type ErrorInfo, type ReactNode } from "react";
import { Button } from "@workspace/ui/components/button";
import { Alert, AlertDescription, AlertIcon } from "@workspace/ui/components/alert";
import { AlertCircle } from "lucide-react";

interface ChatErrorBoundaryProps {
  children: ReactNode;
  onRetry?: () => void;
}

interface ChatErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

export class ChatErrorBoundary extends Component<
  ChatErrorBoundaryProps,
  ChatErrorBoundaryState
> {
  constructor(props: ChatErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ChatErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Chat Error:", error, errorInfo);
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: null });
    this.props.onRetry?.();
  };

  render() {
    if (this.state.hasError && this.state.error) {
      const isFetchError =
        this.state.error.message?.includes("Failed to fetch") ||
        this.state.error.name === "TypeError";

      return (
        <div className="flex flex-1 flex-col items-center justify-center gap-4 p-8">
          <Alert variant="destructive" appearance="light" className="max-w-md">
            <AlertIcon>
              <AlertCircle className="size-4" />
            </AlertIcon>
            <AlertDescription>
              {isFetchError ? (
                <>
                  <p className="font-medium">ไม่สามารถเชื่อมต่อ Agent ได้</p>
                  <p className="mt-1 text-sm">
                    อาจเกิดจาก CORS, URL ไม่ถูกต้อง หรือ Agent ไม่พร้อมใช้งาน
                    ลองเปลี่ยน Agent อื่นหรือตรวจสอบการตั้งค่า
                  </p>
                </>
              ) : (
                <>
                  <p className="font-medium">เกิดข้อผิดพลาด</p>
                  <p className="mt-1 text-sm">{this.state.error.message}</p>
                </>
              )}
            </AlertDescription>
          </Alert>
          <Button variant="outline" onClick={this.handleRetry}>
            ลองใหม่
          </Button>
        </div>
      );
    }

    return this.props.children;
  }
}
