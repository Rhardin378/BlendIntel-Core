interface ChatMessageProps {
  text: string;
}

export function ChatMessage({ text }: ChatMessageProps) {
  return (
    <div className="flex gap-4 justify-end">
      <div className="max-w-[80%] bg-blue-600 text-white rounded-2xl rounded-tr-sm px-5 py-3">
        <p className="text-[15px]">{text}</p>
      </div>
      <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center flex-shrink-0">
        👤
      </div>
    </div>
  );
}
