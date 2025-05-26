"use client";

import { AssistantMessageProps, CopilotChat, useChatContext } from "@copilotkit/react-ui";
import { ToolRenderer } from "./ToolRenderer";
import { SparklesIcon } from "lucide-react";

import Markdown from "react-markdown";
import { getPrompt } from "./prompt";

export function AnswerMarkdown({ markdown }: { markdown: string }) {
  return (
    <div className="markdown-wrapper">
      <Markdown >{markdown}</Markdown>
    </div>
  );
}

const CustomAssistantMessage = (props: AssistantMessageProps) => {
  const { icons } = useChatContext();
  const { message, isLoading, subComponent } = props;
 
  const avatarStyles = "bg-zinc-400 border-zinc-500 shadow-lg min-h-10 min-w-10 rounded-full text-white flex items-center justify-center";
  const messageStyles = "px-4 rounded-xl pt-2";
 
  const avatar = <div className={avatarStyles}><SparklesIcon className="h-6 w-6" /></div>
 
  return (
    <div className="py-2">
      <div className="flex items-start">
        {!subComponent && avatar}
        <div className={messageStyles}>
          {message && <AnswerMarkdown markdown={message || ""} /> }
          {isLoading && icons.spinnerIcon}
        </div>
      </div>
      <div className="my-2">{subComponent}</div>
    </div>
  );
};
 


export function FinanceAssistant() {


  return (
    <div className="flex flex-col h-full w-full"> {/* Assuming you want a flex column layout */}
      <ToolRenderer />
      <CopilotChat
        
        AssistantMessage={CustomAssistantMessage}
        instructions={getPrompt()}
        labels={{
          title: "Reclusive Investment Master",
          initial: "Tell me about your investment ideas",
        }}
        className="flex-grow" // Make CopilotChat take remaining space
      />
    </div>
  );
}
