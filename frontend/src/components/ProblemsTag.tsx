interface Problem {
  code: string;
  label: string;
  points: number;
}

const colorMap: Record<string, string> = {
  NO_WEBSITE: 'bg-red-100 text-red-800',
  NO_PHONE: 'bg-orange-100 text-orange-800',
  NO_HOURS: 'bg-yellow-100 text-yellow-800',
  FEW_PHOTOS: 'bg-purple-100 text-purple-800',
  NO_REVIEWS: 'bg-red-100 text-red-700',
  FEW_REVIEWS: 'bg-amber-100 text-amber-800',
  LOW_RATING: 'bg-pink-100 text-pink-800',
};

interface Props {
  problemsJson: string | null;
}

export default function ProblemsTag({ problemsJson }: Props) {
  if (!problemsJson) return <span className="text-gray-400 text-sm">-</span>;

  let problems: Problem[];
  try {
    problems = JSON.parse(problemsJson);
  } catch {
    return null;
  }

  return (
    <div className="flex flex-wrap gap-1">
      {problems.map(p => (
        <span
          key={p.code}
          className={`text-xs px-2 py-0.5 rounded-full font-medium ${colorMap[p.code] || 'bg-gray-100 text-gray-700'}`}
        >
          {p.label}
        </span>
      ))}
    </div>
  );
}
