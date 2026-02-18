"use client";

import { useChatStore } from "@/store/useChatStore";
import { useEffect } from "react";

export default function ChatSync({ id }: { id: string }) {
    const setCurrentSessionId = useChatStore((s) => s.setCurrentSessionId);

    useEffect(() => {
        setCurrentSessionId(id);
    }, [id, setCurrentSessionId]);

    return null;
}