'use client';

import { useState } from 'react';
import { X, AlertTriangle, CheckCircle2, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface ConfirmDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description?: string;
  content?: React.ReactNode;
  confirmText?: string;
  cancelText?: string;
  variant?: 'default' | 'danger';
  loading?: boolean;
  onConfirm?: () => void;
}

export function ConfirmDialog({
  open,
  onOpenChange,
  title,
  description,
  content,
  confirmText = '确认',
  cancelText = '取消',
  variant = 'default',
  loading = false,
  onConfirm,
}: ConfirmDialogProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* 遮罩 */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200"
        onClick={() => onOpenChange(false)}
      />

      {/* 对话框 */}
      <div className="relative bg-card rounded-xl border shadow-xl w-full max-w-md mx-4 animate-in zoom-in-95 fade-in duration-200">
        {/* 头部 */}
        <div className="flex items-center justify-between p-4 border-b border-border">
          <div className="flex items-center gap-3">
            {variant === 'danger' && (
              <div className="h-10 w-10 rounded-full bg-[#EF4444]/10 flex items-center justify-center">
                <AlertTriangle className="h-5 w-5 text-[#EF4444]" />
              </div>
            )}
            <h3 className="font-semibold text-lg">{title}</h3>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={() => onOpenChange(false)}
            disabled={loading}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* 内容 */}
        <div className="p-4">
          {description && (
            <p className="text-sm text-muted-foreground">{description}</p>
          )}
          {content}
        </div>

        {/* 操作 */}
        <div className="flex items-center justify-end gap-3 p-4 border-t border-border">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={loading}
          >
            {cancelText}
          </Button>
          <Button
            variant={variant === 'danger' ? 'destructive' : 'default'}
            onClick={onConfirm}
            disabled={loading}
          >
            {loading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
            {confirmText}
          </Button>
        </div>
      </div>
    </div>
  );
}

// 确认操作 Hook
export function useConfirm() {
  const [config, setConfig] = useState<Omit<ConfirmDialogProps, 'open' | 'onOpenChange'> | null>(null);
  const [resolveRef, setResolveRef] = useState<((value: boolean) => void) | null>(null);

  const confirm = (options: Omit<ConfirmDialogProps, 'open' | 'onOpenChange'>) => {
    return new Promise<boolean>((resolve) => {
      setConfig(options);
      setResolveRef(() => resolve);
    });
  };

  const handleConfirm = () => {
    resolveRef?.(true);
    setConfig(null);
    setResolveRef(null);
  };

  const handleCancel = () => {
    resolveRef?.(false);
    setConfig(null);
    setResolveRef(null);
  };

  return {
    confirm,
    ConfirmDialog: config ? (
      <ConfirmDialog
        open={true}
        onOpenChange={(open) => !open && handleCancel()}
        {...config}
        onConfirm={handleConfirm}
      />
    ) : null,
  };
}
