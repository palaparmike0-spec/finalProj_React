export default function Pagination({ meta, onPageChange }) {
  if (!meta || meta.last_page <= 1) return null;

  return (
    <div className="pagination">
      <button
        className="btn btn-secondary"
        disabled={meta.current_page === 1}
        onClick={() => onPageChange(meta.current_page - 1)}
      >
        Prev
      </button>
      <span>
        Page {meta.current_page} of {meta.last_page}
      </span>
      <button
        className="btn btn-secondary"
        disabled={meta.current_page === meta.last_page}
        onClick={() => onPageChange(meta.current_page + 1)}
      >
        Next
      </button>
    </div>
  );
}