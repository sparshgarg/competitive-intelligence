export function Avatar({ name, size = 32 }: { name: string; size?: number }) {
  // Use DiceBear API to generate a unique, pleasant illustration based on the name
  const seed = encodeURIComponent(name);
  const url = `https://api.dicebear.com/7.x/notionists/svg?seed=${seed}&backgroundColor=f5f3ff`;

  return (
    <img
      src={url}
      alt={name}
      width={size}
      height={size}
      className="rounded-full bg-ai-bg object-cover ring-1 ring-border"
      title={name}
    />
  );
}
