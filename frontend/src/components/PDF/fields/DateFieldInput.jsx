const DateFieldInput = ({
  elementId,
  fieldKey,
  value,
  dateFormat,
  onChange,
  onBlur,
  readOnly = false,
  required = false,
}) => {
  const sep = dateFormat.match(/[/\-.]/)?.[0] || "/";
  const fmt = dateFormat.toUpperCase();

  const handleDateInput = (e) => {
    if (readOnly) return;
    let raw = e.target.value.replace(/[^\d]/g, "");
    let formatted = "";
    if (raw.length > 0) formatted = raw.substring(0, 2);
    if (raw.length > 2) formatted += sep + raw.substring(2, 4);
    if (raw.length > 4) formatted += sep + raw.substring(4, 8);
    onChange(fieldKey, formatted);
  };

  const fromPickerValue = (htmlValue) => {
    if (!htmlValue) return "";
    const [year, month, day] = htmlValue.split("-");
    if (fmt.startsWith("DD")) return `${day}${sep}${month}${sep}${year}`;
    if (fmt.startsWith("MM")) return `${month}${sep}${day}${sep}${year}`;
    if (fmt.startsWith("YYYY")) return `${year}${sep}${month}${sep}${day}`;
    return `${day}${sep}${month}${sep}${year}`;
  };

  return (
    <div
      style={{ position: "relative", width: "100%", height: "100%" }}
      title={
        readOnly
          ? "This field is read-only"
          : required
            ? "This field is required"
            : undefined
      }
    >
      <input
        id={`input-date-${elementId}`}
        type="text"
        value={value || ""}
        placeholder={dateFormat}
        onChange={handleDateInput}
        readOnly={readOnly}
        required={required}
        maxLength={10}
        style={{
          width: "100%",
          height: "100%",
          border: "none",
          background: readOnly ? "rgba(240, 240, 240, 0.6)" : "transparent",
          outline: "none",
          padding: "0 20px 0 2px",
          margin: "0",
          fontSize: "14px",
          fontFamily: "inherit",
          color: readOnly ? "#666" : "#000",
          cursor: readOnly ? "not-allowed" : "text",
          boxSizing: "border-box",
        }}
        onFocus={(e) => {
          if (!readOnly) {
            e.target.style.background = "rgba(173, 216, 230, 0.2)";
            e.target.style.border = required
              ? "1px solid #e74c3c"
              : "1px solid #4A90E2";
            e.target.style.borderRadius = "3px";
          }
        }}
        onBlur={onBlur}
      />
      {!readOnly && (
        <input
          type="date"
          onChange={(e) => onChange(fieldKey, fromPickerValue(e.target.value))}
          style={{
            position: "absolute",
            right: 0,
            top: 0,
            width: "24px",
            height: "100%",
            border: "none",
            background: "transparent",
            cursor: "pointer",
            zIndex: 2,
            color: "transparent",
          }}
        />
      )}
    </div>
  );
};

export default DateFieldInput;
