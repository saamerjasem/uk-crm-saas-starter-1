{/* Responsive, full-width table with borders */}
{loading ? (
  <p>Loading…</p>
) : filtered.length === 0 ? (
  <p className="text-gray-400">No contacts found.</p>
) : (
  <div className="overflow-x-auto rounded-md">
    <table className="w-full table-auto border-collapse">
      <thead className="bg-gray-900">
        <tr>
          <th className="text-left px-3 py-2 border border-gray-700">First Name</th>
          <th className="text-left px-3 py-2 border border-gray-700">Last Name</th>
          <th className="text-left px-3 py-2 border border-gray-700">Email</th>
          <th className="text-left px-3 py-2 border border-gray-700">Phone</th>
          <th className="text-left px-3 py-2 border border-gray-700">Actions</th>
        </tr>
      </thead>

      <tbody>
        {filtered.map((c) => (
          <tr
            key={c.id}
            className="hover:bg-gray-900 cursor-pointer"
            onClick={() => router.push(`/app/contacts/${c.id}`)}
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                router.push(`/app/contacts/${c.id}`);
              }
            }}
            role="button"
            aria-label={`Open ${c.first_name} ${c.last_name}`}
          >
            <td className="px-3 py-2 border border-gray-700 whitespace-nowrap truncate" title={c.first_name}>
              {c.first_name}
            </td>
            <td className="px-3 py-2 border border-gray-700 whitespace-nowrap truncate" title={c.last_name}>
              {c.last_name}
            </td>
            <td className="px-3 py-2 border border-gray-700">
              <span className="block truncate" title={c.email || ''}>
                {c.email || '-'}
              </span>
            </td>
            <td className="px-3 py-2 border border-gray-700 whitespace-nowrap truncate" title={c.phone || ''}>
              {c.phone || '-'}
            </td>
            <td
              className="px-3 py-2 border border-gray-700 whitespace-nowrap"
              onClick={(e) => e.stopPropagation()} // allow clicking the link without triggering row click
            >
              <Link
                href={`/app/contacts/${c.id}`}
                className="text-blue-400 hover:underline"
                aria-label={`Edit ${c.first_name} ${c.last_name}`}
              >
                Edit
              </Link>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
)}
