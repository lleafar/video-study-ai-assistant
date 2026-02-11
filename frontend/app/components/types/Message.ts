export interface Message {
    content: string;
    sender: "user" | "assistant";
    type?: "text" | "error"; // Optional type field to differentiate between normal and error messages
}