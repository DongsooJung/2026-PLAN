"use client";

import type { Subscription } from "@/lib/types";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { SubscriptionForm } from "./subscription-form";

interface SubscriptionDialogProps {
  open: boolean;
  onClose: () => void;
  subscription?: Subscription | null;
}

export function SubscriptionDialog({
  open,
  onClose,
  subscription,
}: SubscriptionDialogProps) {
  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {subscription ? "구독 수정" : "새 구독 추가"}
          </DialogTitle>
          <DialogDescription>
            {subscription
              ? "구독 정보를 수정하세요"
              : "새로운 구독 서비스를 등록하세요"}
          </DialogDescription>
        </DialogHeader>
        <SubscriptionForm subscription={subscription} onSuccess={onClose} />
      </DialogContent>
    </Dialog>
  );
}
