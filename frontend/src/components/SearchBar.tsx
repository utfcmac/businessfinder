interface Props {
  onSearch: (query: string) => void;
  onNavigateImport: () => void;
}

export default function SearchBar({ onSearch, onNavigateImport }: Props) {
  return (
    <div className="bg-white rounded-lg shadow p-6 mb-6">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold text-gray-800">BusinessFinder</h1>
        <button
          onClick={onNavigateImport}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium"
        >
          + Daten importieren
        </button>
      </div>

      <input
        type="text"
        onChange={e => onSearch(e.target.value)}
        placeholder="Datenbank durchsuchen (Name, Adresse, Typ...)"
        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-400 text-sm"
      />
    </div>
  );
}
