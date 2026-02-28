const DropdownField = ({
  elementId,
  fieldKey,
  field,
  value,
  onChange,
  readOnly = false,
  required = false,
}) => {
  return (
    <select
      id={`select-${elementId}`}
      value={value || ""}
      onChange={(e) => {
        if (!readOnly) {
          onChange(fieldKey, e.target.value);
        }
      }}
      disabled={readOnly}
      required={required}
      title={
        readOnly
          ? "This field is read-only"
          : required
            ? "This field is required"
            : undefined
      }
      style={{
        width: "100%",
        height: "100%",
        border: "1px solid #ccc",
        background: readOnly ? "rgba(240, 240, 240, 0.6)" : "white",
        outline: "none",
        padding: "2px",
        margin: "0",
        cursor: readOnly ? "not-allowed" : "pointer",
        fontSize: "12px",
        boxSizing: "border-box",
        borderRadius: "3px",
        color: readOnly ? "#666" : "#000",
        opacity: readOnly ? 0.8 : 1,
      }}
      onFocus={(e) => {
        if (!readOnly) {
          e.target.style.border = required
            ? "1px solid #e74c3c"
            : "1px solid #4A90E2";
          e.target.style.boxShadow = required
            ? "0 0 0 2px rgba(231, 76, 60, 0.2)"
            : "0 0 0 2px rgba(74, 144, 226, 0.2)";
        }
      }}
      onBlur={(e) => {
        e.target.style.border = "1px solid #ccc";
        e.target.style.boxShadow = "none";
      }}
    >
      <option value="">Select...</option>
      {field.options &&
        field.options.map((opt, idx) => (
          <option key={idx} value={opt.exportValue || opt.displayValue}>
            {opt.displayValue}
          </option>
        ))}
    </select>
  );
};

export default DropdownField;
