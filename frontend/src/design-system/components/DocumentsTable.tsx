
import * as React from 'react';

type Doc = { id: string; name: string; type: string; updated: string };

type SortKey = 'name' | 'type' | 'updated';
type SortDir = 'asc' | 'desc';

export interface DocumentsTableProps {
  documents: Doc[];
  onSelectionChange?: (ids: string[]) => void;
}

export function DocumentsTable({ documents, onSelectionChange }: DocumentsTableProps) {
  const [sortKey, setSortKey] = React.useState<SortKey>('updated');
  const [sortDir, setSortDir] = React.useState<SortDir>('desc');
  const [selected, setSelected] = React.useState<string[]>([]);

  const toggleAll = (checked: boolean) => {
    const ids = checked ? documents.map(d => d.id) : [];
    setSelected(ids);
    onSelectionChange?.(ids);
  };

  const toggleOne = (id: string) => {
    const next = selected.includes(id) ? selected.filter(x => x !== id) : [...selected, id];
    setSelected(next);
    onSelectionChange?.(next);
  };

  const setSort = (key: SortKey) => {
    if (key === sortKey) {
      setSortDir(sortDir === 'asc' ? 'desc' : 'asc');
    } else {
      setSortKey(key);
      setSortDir('asc');
    }
  };

  const sorted = React.useMemo(() => {
    const arr = [...documents];
    arr.sort((a, b) => {
      const va = a[sortKey];
      const vb = b[sortKey];
      if (va < vb) return sortDir === 'asc' ? -1 : 1;
      if (va > vb) return sortDir === 'asc' ? 1 : -1;
      return 0;
    });
    return arr;
  }, [documents, sortKey, sortDir]);

  const allChecked = selected.length > 0 && selected.length === documents.length;
  const indeterminate = selected.length > 0 && selected.length < documents.length;

  return (
    <div className="overflow-x-auto border border-gray-200 rounded-2xl bg-gray-0 shadow-sm">
      <table className="min-w-full border-separate border-spacing-0">
        <thead>
          <tr>
            <th className="w-10 sticky top-0 z-10 bg-gray-50 border-b border-gray-200 px-3 py-3 rounded-tl-2xl">
              <input
                type="checkbox"
                aria-checked={indeterminate ? 'mixed' : allChecked}
                checked={allChecked}
                onChange={e => toggleAll(e.currentTarget.checked)}
              />
            </th>
            <Th label="Name" onClick={() => setSort('name')} active={sortKey==='name'} dir={sortDir} />
            <Th label="Type" onClick={() => setSort('type')} active={sortKey==='type'} dir={sortDir} />
            <Th label="Updated" onClick={() => setSort('updated')} active={sortKey==='updated'} dir={sortDir} roundedRight />
          </tr>
        </thead>
        <tbody>
          {sorted.map((d, i) => (
            <tr key={d.id} className={i % 2 ? "bg-gray-0" : "bg-gray-50/60"}>
              <td className="px-3 py-3 border-b border-gray-100">
                <input type="checkbox" checked={selected.includes(d.id)} onChange={() => toggleOne(d.id)} />
              </td>
              <td className="px-4 py-3 text-gray-800 border-b border-gray-100">{d.name}</td>
              <td className="px-4 py-3 text-gray-700 border-b border-gray-100">{d.type}</td>
              <td className="px-4 py-3 text-gray-700 border-b border-gray-100">{d.updated}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function Th({ label, onClick, active, dir, roundedRight }: { label: string; onClick: () => void; active?: boolean; dir?: 'asc' | 'desc'; roundedRight?: boolean }) {
  return (
    <th
      className={`text-left font-serif text-sm md:text-base text-gray-800 bg-gray-50 sticky top-0 z-10 px-4 py-3 border-b border-gray-200 ${roundedRight ? 'rounded-tr-2xl' : ''}`}
    >
      <button onClick={onClick} className="inline-flex items-center gap-2 hover:underline">
        <span>{label}</span>
        {active && <span className="text-xs text-gray-500">{dir === 'asc' ? '▲' : '▼'}</span>}
      </button>
    </th>
  );
}
