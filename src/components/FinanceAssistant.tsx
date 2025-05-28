"use client";

import { AssistantMessageProps, CopilotChat, useChatContext, useCopilotChatSuggestions } from "@copilotkit/react-ui";
import { ToolRenderer } from "./ToolRenderer";
import { DollarSign  } from "lucide-react";

import Markdown from "react-markdown";
import { getPromptV0 } from "./prompt";
import { CustomInput } from './customInput';
import { useCopilotChat } from "@copilotkit/react-core";

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
 
  const avatarStyles = "bg-black border-zinc-500 shadow-lg min-h-8 min-w-8 rounded-full text-white flex items-center justify-center";
  const messageStyles = "px-4 rounded-xl";
 
  const avatar = <div className={avatarStyles}><DollarSign className="h-6 w-6" /></div>
 
  return (
    <div className="py-2">
      <div className="flex items-start">
        {!subComponent && avatar}
        <div className={messageStyles}>
          {!subComponent && <div className="text-sm text-zinc-500">AI Hedge Fund Manager</div>}
          {message && <AnswerMarkdown markdown={message || ""} /> }
          {isLoading && icons.spinnerIcon}
        </div>
      </div>
      <div className="my-2">{subComponent}</div>
    </div>
  );
};
 


export function FinanceAssistant() {
  const { visibleMessages } = useCopilotChat();

  useCopilotChatSuggestions({
    available: visibleMessages.length < 1 ? 'enabled' : 'disabled',
    instructions: 'Suggest some investment ideas',
    maxSuggestions: 2
  }, [visibleMessages.length]);

  return (
    <div className="flex flex-col h-full w-full "> {/* Assuming you want a flex column layout */}
      <ToolRenderer />
      <CopilotChat
        Input={CustomInput}
        AssistantMessage={CustomAssistantMessage}
        instructions={getPromptV0()}
        labels={{
          title: "Reclusive Investment Master",
          initial: "Tell me about your investment ideas",
        }}
        className="flex-grow" // Make CopilotChat take remaining space
      />
    </div>
  );
}
