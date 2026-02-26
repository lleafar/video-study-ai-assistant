export interface Message {
    content: string;
    sender: "user" | "assistant";
    type?: "text" | "error" | "thinking"; // Optional type field to differentiate between normal and error messages
    state?: "loading"| "streaming" | "done"; // Optional loading state for streaming messages
}