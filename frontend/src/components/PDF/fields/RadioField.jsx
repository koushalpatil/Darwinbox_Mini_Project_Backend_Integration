const RadioField = ({
  elementId,
  fieldKey,
  field,
  value,
  onChange,
  readOnly = false,
  required = false,
}) => {
  const radioValue = field.buttonValue || fieldKey;
  const isChecked = value === radioValue;

  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
      title={
        readOnly
          ? "This field is read-only"
          : required
            ? "This field is required"
            : undefined
      }
    >
      <input
        id={`radio-${elementId}-${field.buttonValue || "default"}`}
        type="radio"
        name={field.name}
        value={radioValue}
        checked={isChecked}
        onChange={() => {
          if (!readOnly) {
            onChange(fieldKey, radioValue);
          }
        }}
        disabled={readOnly}
        required={required}
        style={{
          width: "16px",
          height: "16px",
          cursor: readOnly ? "not-allowed" : "pointer",
          margin: "0",
          accentColor: required ? "#e74c3c" : "#4A90E2",
          opacity: readOnly ? 0.6 : 1,
        }}
      />
    </div>
  );
};

export default RadioField;
