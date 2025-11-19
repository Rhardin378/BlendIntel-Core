import {
  parseBoldMarkdown,
  splitParagraphs,
  isNumberedList,
} from "@/lib/utils/textFormatting";

interface AIResponseTextProps {
  text: string;
}

export function AIResponseText({ text }: AIResponseTextProps) {
  const paragraphs = splitParagraphs(text);

  return (
    <div className="space-y-3 mb-4">
      {paragraphs.map((paragraph, idx) => {
        const parts = parseBoldMarkdown(paragraph);

        if (isNumberedList(paragraph)) {
          return (
            <div
              key={idx}
              className="bg-gray-50 rounded-lg p-3 border-l-4 border-blue-500"
            >
              <p className="text-gray-800 text-sm leading-relaxed whitespace-pre-line">
                {parts.map((part) =>
                  part.type === "bold" ? (
                    <strong
                      key={part.key}
                      className="font-semibold text-gray-900"
                    >
                      {part.content}
                    </strong>
                  ) : (
                    <span key={part.key}>{part.content}</span>
                  )
                )}
              </p>
            </div>
          );
        }

        return (
          <p key={idx} className="text-gray-700 text-sm leading-relaxed">
            {parts.map((part) =>
              part.type === "bold" ? (
                <strong key={part.key} className="font-semibold text-gray-900">
                  {part.content}
                </strong>
              ) : (
                <span key={part.key}>{part.content}</span>
              )
            )}
          </p>
        );
      })}
    </div>
  );
}
