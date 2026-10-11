export default function Button({ children, loading = false, variant = 'primary', ...rest }) {
  return (
    <button className={`btn btn-${variant}`} disabled={loading || rest.disabled} {...rest}>
      {loading ? 'Please wait...' : children}
    </button>
  );
}