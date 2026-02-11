import { Message } from "@/app/components/types/Message";
import { create } from "zustand";

type Session = {
  id: string;
  videoUrl: string;
  messages: Message[];
};

type ChatState = {
  videoUrl: string;
  messagesList: Message[];
  setVideoUrl: (url: string) => void;
  setMessagesList: (messages: Message[]) => void;
  currentSessionId: string;
  sessions: Array<Session>;
  getCurrentSession: () => Session;
  setCurrentSessionId: (id: string) => void;
  addSession: (session: Session) => void;
  updateSessionMessages: (
    sessionId: string,
    messages: Message[] | ((prev: Message[]) => Message[]),
  ) => void;
  updateSessionVideoUrl: (sessionId: string, videoUrl: string) => void;
};

export const useChatStore = create<ChatState>((set, get) => ({
  videoUrl: "",
  messagesList: [],
  setVideoUrl: (url: string) => set({ videoUrl: url }),
  setMessagesList: (messages: Message[]) => set({ messagesList: messages }),

  currentSessionId: "1",
  sessions: [
    {
      id: "1",
      videoUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
      messages: [
        {
          content: "Olá, em que posso ajudar?",
          sender: "assistant",
        },
        {
          content: "Olá, gostaria de um resumo do vídeo que estou assistindo",
          sender: "user",
        },
        {
          content:
            "Claro, posso ajudar com isso! Por favor, me forneça o link do vídeo que você está assistindo para que eu possa gerar um resumo para você.",
          sender: "assistant",
        },
      ],
    },
  ],

  setCurrentSessionId: (id: string) => set({ currentSessionId: id }),
  addSession: (session: Session) =>
    set((state) => ({
      sessions: [...state.sessions, session],
    })),
  getCurrentSession: () => {
    const { sessions, currentSessionId } = get();
    return (
      sessions.find((session) => session.id === currentSessionId) || {
        id: currentSessionId,
        videoUrl: "",
        messages: [],
      }
    );
  },
  updateSessionMessages: (
    sessionId: string,
    messages: Message[] | ((prev: Message[]) => Message[]),
  ) =>
    set((state) => ({
      sessions: state.sessions.map((session) => {
        if (session.id !== (sessionId ?? state.currentSessionId)) {
          return session;
        }

        const nextMessages =
          typeof messages === "function"
            ? messages(session.messages)
            : messages;

        console.log(
          "Updating session messages for session",
          session.id,
          "with messages:",
          nextMessages,
        );

        return { ...session, messages: nextMessages };
      }),
    })),
  updateSessionVideoUrl: (sessionId: string, videoUrl: string) =>
    set((state) => ({
      sessions: state.sessions.map((session) =>
        session.id === (sessionId ?? state.currentSessionId)
          ? { ...session, videoUrl }
          : session,
      ),
    })),
}));
