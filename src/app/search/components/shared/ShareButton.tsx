interface ShareButtonProps {
  itemName: string;
  category: string;
}

export function ShareButton({ itemName, category }: ShareButtonProps) {
  const handleShare = async () => {
    const url = window.location.href;
    try {
      if (navigator.share) {
        await navigator.share({
          title: `BlendIntel - ${itemName}`,
          text: `Check out this ${category}: ${itemName}`,
          url: url,
        });
      } else {
        await navigator.clipboard.writeText(url);
        alert("Link copied to clipboard!");
      }
    } catch (err) {
      console.error("Share failed:", err);
    }
  };

  return (
    <div className="flex items-center justify-between pt-3 border-t border-gray-200 mt-3">
      <button
        onClick={handleShare}
        className="text-sm text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1.5 transition-colors"
      >
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <circle cx="18" cy="5" r="3"></circle>
          <circle cx="6" cy="12" r="3"></circle>
          <circle cx="18" cy="19" r="3"></circle>
          <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"></line>
          <line x1="15.41" y1="6.51" x2="8.59" y2="10.49"></line>
        </svg>
        Share results
      </button>
      <span className="text-xs text-gray-500">Demo • Limited searches</span>
    </div>
  );
}
