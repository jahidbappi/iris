const MOCK_IMAGES = [
  "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&q=80",
  "https://images.unsplash.com/photo-1579546929518-9e396f3cc809?w=800&q=80",
  "https://images.unsplash.com/photo-1557672172-298d0903790c?w=800&q=80",
];

export function pickMockImage(seed: string): string {
  const index = seed.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0);
  return MOCK_IMAGES[index % MOCK_IMAGES.length];
}
