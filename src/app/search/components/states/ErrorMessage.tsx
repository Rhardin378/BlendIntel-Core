interface ErrorMessageProps {
  message: string;
}

export function ErrorMessage({ message }: ErrorMessageProps) {
  return (
    <div className="flex gap-4">
      <div className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0">
        ⚠️
      </div>
      <div className="max-w-[80%] bg-red-50 border border-red-200 rounded-2xl rounded-tl-sm px-5 py-3">
        <p className="text-[15px] text-red-800">{message}</p>
      </div>
    </div>
  );
}
