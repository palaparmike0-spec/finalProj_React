export default function FormInput({ label, name, type = 'text', value, onChange, error, ...rest }) {
  return (
    <div className="form-group">
      <label htmlFor={name}>{label}</label>
      <input
        id={name}
        name={name}
        type={type}
        value={value}
        onChange={onChange}
        className={error ? 'input input-error' : 'input'}
        {...rest}
      />
      {error && <p className="error-text">{error}</p>}
    </div>
  );
}