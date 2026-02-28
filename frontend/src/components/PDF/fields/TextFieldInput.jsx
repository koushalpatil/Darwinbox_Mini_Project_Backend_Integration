const TextFieldInput = ({
  elementId,
  fieldKey,
  subType,
  value,
  isCalculated,
  onChange,
  onBlur,
  readOnly = false,
  required = false,
  maxLength,
}) => {
  const isFieldReadOnly = readOnly || isCalculated;

  return (
    <input
      id={`input-${subType}-${elementId}`}
      type={subType === "number" ? "text" : "text"}
      inputMode={subType === "number" ? "decimal" : "text"}
      value={value || ""}
      onChange={onChange}
      readOnly={isFieldReadOnly}
      required={required}
      maxLength={maxLength || undefined}
      step={subType === "number" ? "any" : undefined}
      title={
        isFieldReadOnly
          ? "This field is read-only"
          : required
            ? "This field is required"
            : undefined
      }
      style={{
        width: "100%",
        height: "100%",
        border: "none",
        background: isFieldReadOnly
          ? "rgba(240, 240, 240, 0.6)"
          : "transparent",
        outline: "none",
        padding: "0 2px",
        margin: "0",
        fontSize: "14px",
        fontFamily: "inherit",
        color: isFieldReadOnly ? "#666" : "#000",
        cursor: isFieldReadOnly ? "not-allowed" : "text",
        boxSizing: "border-box",
      }}
      onFocus={(e) => {
        if (!isFieldReadOnly) {
          e.target.style.background = "rgba(173, 216, 230, 0.2)";
          e.target.style.border = required
            ? "1px solid #e74c3c"
            : "1px solid #4A90E2";
          e.target.style.borderRadius = "3px";
        }
      }}
      onBlur={onBlur}
    />
  );
};

export default TextFieldInput;
