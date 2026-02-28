import React from "react";
import { executeJSAction } from "../../../utils/js-executor";

const ButtonField = ({
  elementId,
  fieldKey,
  field,
  value,
  jsActions,
  formData,
  allFields,
  onSubmit,
}) => {
  return (
    <button
      id={`btn-${elementId}`}
      type="button"
      onClick={() => {
        const aScripts = Array.isArray(jsActions.A)
          ? jsActions.A.filter(Boolean)
          : jsActions.A
            ? [jsActions.A]
            : [];
        if (aScripts.length > 0) {
          const result = executeJSAction(
            aScripts,
            value,
            formData || {},
            allFields,
          );
          if (result.value !== null) {
            console.log("Button action result:", result.value);
          }
        }
        console.log("Button clicked:", field.name);
        if (onSubmit) onSubmit();
      }}
      style={{
        width: "100%",
        height: "100%",
        background: "transparent",
        border: "none",
        cursor: "pointer",
        padding: "0",
        margin: "0",
        transition: "background 0.2s",
      }}
      onMouseEnter={(e) => {
        e.target.style.background = "rgba(74, 144, 226, 0.15)";
        e.target.style.borderRadius = "3px";
      }}
      onMouseLeave={(e) => {
        e.target.style.background = "transparent";
      }}
      onMouseDown={(e) => {
        e.target.style.background = "rgba(74, 144, 226, 0.3)";
      }}
      onMouseUp={(e) => {
        e.target.style.background = "rgba(74, 144, 226, 0.15)";
      }}
    />
  );
};

export default ButtonField;
