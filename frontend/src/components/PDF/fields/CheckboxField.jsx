import React from "react";

const CheckboxField = ({
  elementId,
  fieldKey,
  value,
  onChange,
  readOnly = false,
  required = false,
}) => {
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
        id={`checkbox-${elementId}`}
        type="checkbox"
        checked={value === "Yes" || value === true}
        onChange={(e) => {
          if (!readOnly) {
            onChange(fieldKey, e.target.checked ? "Yes" : "Off");
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

export default CheckboxField;
