import { Message } from "@/app/components/types/Message";
import { create } from "zustand";
import { Attachment } from "@/app/components/types/Attachment";
type Session = {
  id: string;
  title: string;
  videoUrl: string;
  contextUrls: Attachment[];
  messages: Message[];
};

type ChatState = {
  currentSessionId: string;
  sessions: Array<Session>;
  getCurrentSession: () => Session;
  setCurrentSessionId: (id: string) => void;
  addSession: (session: Session) => void;
  updateSessionMessages: (
    sessionId: string,
    messages: Message[] | ((prev: Message[]) => Message[]),
  ) => void;
  updateSessionVideoUrl: (videoUrl: string, sessionId?: string) => void;
  updateSessionContextUrls: (contextUrls: Attachment[], sessionId?: string ) => void;
};

const EMPTY_SESSION: Session = {
  id: "",
  title: "",
  videoUrl: "",
  contextUrls: [],
  messages: [],
};

export const useChatStore = create<ChatState>((set, get) => ({
  currentSessionId: "",
  sessions: [
    {
      id: "1",
      title: "The Roadmap for Programmers in the AI Era (2026 and Beyond)",
      videoUrl: "https://www.youtube.com/watch?v=I7UgIy4JIpQ",
      contextUrls: [],
      messages: [
        {
          content: "Olá, gostaria de um resumo do vídeo que estou assistindo",
          sender: "user",
        },
        {
          content:
            "Claro, posso ajudar com isso! Por favor, me forneça o link do vídeo que você está assistindo para que eu possa gerar um resumo para você.",
          sender: "assistant",
        },
        {
          content: `# Video Summary: The Roadmap for Programmers in the AI Era (2026 and Beyond)

## Key Points

### 1. Essential Skills for Future Programmers
- **Strong Software Engineering Foundation**: 
  - Understanding of functional and non-functional requirements, business rules, and software diagrams.
  - Ability to write clear technical specifications and development documentation.
- **Testing Proficiency**:
  - Automated testing is crucial (unit, load, stress, regression, quality, and security tests).
  - In the AI era, deploying untested code is unacceptable.
- **Deep Knowledge of Software Architecture**:
  - Focus on architectural concepts over learning new frameworks.
  - AI cannot replace human judgment in designing scalable and maintainable systems.
- **Refactoring and Code Review**:
  - Skills in code review, integration, and continuous deployment are highly valued.

### 2. Non-Technical Competencies
- **Problem Decomposition**:
  - Ability to break down real-world problems into technical and implementation specifications.
- **Product-Technology Collaboration**:
  - Bridging the gap between product needs and technical solutions.
  - Entrepreneurial mindset is more valuable than just being a fast coder.
- **Effective Use of AI**:
  - Not just using AI for help, but integrating AI as a feature in products (e.g., function calling, automation tools).
- **Communication and Decision-Making**:
  - Strong communication skills and the ability to make informed decisions are increasingly important.
  - Taking ownership of projects from start to finish.

### 3. Market Trends and Opportunities
- **AI-Native Companies Dominate**:
  - Most new startups, especially those in accelerators like Y Combinator, are AI-focused.
  - Ignoring AI trends may limit career opportunities.
- **Quality Over Speed**:
  - With AI handling code generation, developers should focus on quality, security, cost optimization, and observability.

### 4. Desirable Developer Profiles
- **T-Shaped/Full-Stack Developers**:
  - Broad knowledge with some areas of deeper expertise is preferred.
  - Specialization is only valuable if it is highly niche and in-demand.
- **Generalists vs. Specialists**:
  - Generalists with a wide skill set are more employable, especially for entry-level positions.
  - True specialists must be deeply knowledgeable in a very specific area.

### 5. Profiles at Risk in 2026
- **Prompt-Only Developers**:
  - Those who only create proofs of concept with little technical depth.
- **AI-Resistant Purists**:
  - Developers who refuse to use AI tools or adapt to new workflows.
- **Code-Only Contributors**:
  - Programmers who focus solely on writing code without concern for the final product, security, or maintainability.

### 6. The Role of QA and Testing
- **QA Remains Important**:
  - Despite AI automating some QA tasks, the need for quality assurance persists due to the prevalence of poorly built software.
  - Developers should not blindly trust AI-generated code.

---

## Conclusion

To thrive as a programmer in the AI-driven future, especially by 2026, focus on:
- Building a solid foundation in software engineering and testing.
- Developing strong communication, problem-solving, and decision-making skills.
- Embracing AI as both a tool and a product feature.
- Adopting a generalist mindset with the ability to specialize when necessary.
- Taking ownership of the entire software delivery process.

---

*File saved as* **video_summary.md**`,
          sender: "assistant",
        },
      ],
    },
  ],

  setCurrentSessionId: (id: string) => set({ currentSessionId: id }),
  addSession: (session: Session) =>
    set((state) => ({
      currentSessionId: session.id,
      sessions: [...state.sessions, session],
    })),
  getCurrentSession: () => {
    const { sessions, currentSessionId } = get();
    return (
      sessions.find((session) => session.id === currentSessionId) ||
      EMPTY_SESSION
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

        return { ...session, messages: nextMessages };
      }),
    })),
  updateSessionVideoUrl: (videoUrl: string, sessionId?: string) =>
    set((state) => ({
      sessions: state.sessions.map((session) =>
        session.id === (sessionId ?? state.currentSessionId)
          ? { ...session, videoUrl }
          : session,
      ),
    })),
  updateSessionContextUrls: (contextUrls: Attachment[], sessionId?: string) => {
    set((state) => ({
      sessions: state.sessions.map((session) =>
        session.id === (sessionId ?? state.currentSessionId)
          ? { ...session, contextUrls }
          : session,
      ),
    }));
  },
}));
