import { useEffect, useCallback, useRef } from "react";
import { executeJSAction } from "../../utils/js-executor";

import {
  SignatureField,
  DateFieldInput,
  TextFieldInput,
  CheckboxField,
  RadioField,
  DropdownField,
  ButtonField,
} from "./fields";

function getScripts(jsActions, key) {
  const val = jsActions[key];
  if (!val) return [];
  if (Array.isArray(val)) return val.filter(Boolean);
  if (typeof val === "string" && val.trim()) return [val];
  return [];
}

function hasScripts(jsActions, key) {
  return getScripts(jsActions, key).length > 0;
}

function useFieldJSActions({
  fieldKey,
  jsActions,
  value,
  formData,
  allFields,
  onChange,
}) {
  const prevCalcValue = useRef(undefined);
  const calculateScripts = getScripts(jsActions, "C");

  useEffect(() => {
    if (calculateScripts.length === 0) return;
    const result = executeJSAction(
      calculateScripts,
      value,
      formData || {},
      allFields,
    );
    if (result.value !== null && result.value !== prevCalcValue.current) {
      prevCalcValue.current = result.value;
      onChange(fieldKey, result.value);
    }
  }, [calculateScripts.join("||"), formData]);

  const handleFormat = useCallback(
    (e) => {
      const formatScripts = getScripts(jsActions, "F");
      if (formatScripts.length > 0) {
        const result = executeJSAction(
          formatScripts,
          value,
          formData || {},
          allFields,
        );
        if (result.value !== null && result.value !== value) {
          onChange(fieldKey, result.value);
        }
      }
      e.target.style.background = "transparent";
      e.target.style.border = "none";
    },
    [jsActions, value, formData, allFields, onChange, fieldKey],
  );

  const handleKeystroke = useCallback(
    (newValue) => {
      const keystrokeScripts = getScripts(jsActions, "K");
      if (keystrokeScripts.length > 0) {
        const result = executeJSAction(
          keystrokeScripts,
          newValue,
          formData || {},
          allFields,
        );

        if (!result.rc) {
          return null;
        }

        if (result.value !== null) {
          return result.value;
        }
      }
      return newValue;
    },
    [jsActions, formData, allFields],
  );

  const handleValidate = useCallback(
    (_e) => {
      const validateScripts = getScripts(jsActions, "V");
      if (validateScripts.length === 0) return true;

      const result = executeJSAction(
        validateScripts,
        value,
        formData || {},
        allFields,
      );

      if (!result.rc) {
        console.warn(`Validation failed for field "${fieldKey}"`);
        return false;
      }

      if (result.value !== null && result.value !== value) {
        onChange(fieldKey, result.value);
      }

      return true;
    },
    [jsActions, value, formData, allFields, fieldKey, onChange],
  );

  const handleChange = useCallback(
    (e) => {
      const newValue = e.target.value;
      const accepted = handleKeystroke(newValue);
      if (accepted !== null) {
        onChange(fieldKey, accepted);
      }
    },
    [handleKeystroke, onChange, fieldKey],
  );

  const handleBlur = useCallback(
    (e) => {
      handleValidate(e);
      handleFormat(e);
      const blurScripts = getScripts(jsActions, "Bl");
      if (blurScripts.length > 0) {
        executeJSAction(blurScripts, value, formData || {}, allFields);
      }
    },
    [handleValidate, handleFormat, jsActions, value, formData, allFields],
  );

  const handleFocus = useCallback(() => {
    const focusScripts = getScripts(jsActions, "Fo");
    if (focusScripts.length > 0) {
      executeJSAction(focusScripts, value, formData || {}, allFields);
    }
  }, [jsActions, value, formData, allFields]);

  const handleMouseEnter = useCallback(() => {
    const enterScripts = getScripts(jsActions, "E");
    if (enterScripts.length > 0) {
      executeJSAction(enterScripts, value, formData || {}, allFields);
    }
  }, [jsActions, value, formData, allFields]);

  const handleMouseLeave = useCallback(() => {
    const exitScripts = getScripts(jsActions, "X");
    if (exitScripts.length > 0) {
      executeJSAction(exitScripts, value, formData || {}, allFields);
    }
  }, [jsActions, value, formData, allFields]);

  const handleMouseDown = useCallback(() => {
    const downScripts = getScripts(jsActions, "D");
    if (downScripts.length > 0) {
      executeJSAction(downScripts, value, formData || {}, allFields);
    }
  }, [jsActions, value, formData, allFields]);

  const handleMouseUp = useCallback(() => {
    const upScripts = getScripts(jsActions, "U");
    if (upScripts.length > 0) {
      executeJSAction(upScripts, value, formData || {}, allFields);
    }
  }, [jsActions, value, formData, allFields]);

  return {
    handleChange,
    handleBlur,
    handleFocus,
    handleMouseEnter,
    handleMouseLeave,
    handleMouseDown,
    handleMouseUp,
  };
}

const FormField = ({
  field,
  widgetIndex = 0,
  value,
  onChange,
  onSubmit,
  formData,
  allFields,
  fieldOverrides,
}) => {
  const fieldKey =
    field.type === "PDFRadioGroup"
      ? `${field.name}-page-${field.page}`
      : `${field.name}-page-${field.page}-w${widgetIndex}`;
  const elementId = `${field.name}-page-${field.page}-w${widgetIndex}`;
  const jsActions = field.jsActions || {};

  const {
    handleChange,
    handleBlur,
    handleFocus,
    handleMouseEnter,
    handleMouseLeave,
    handleMouseDown,
    handleMouseUp,
  } = useFieldJSActions({
    fieldKey,
    jsActions,
    value,
    formData,
    allFields,
    onChange,
  });

  const overrides = (fieldOverrides || {})[field.name] || {};
  const isReadOnly =
    overrides.readOnly !== undefined
      ? overrides.readOnly
      : field.readOnly || false;
  const isRequired =
    overrides.required !== undefined
      ? overrides.required
      : field.required || false;

  return (
    <div
      id={`field-${elementId}`}
      style={{
        position: "absolute",
        left: `${field.x}px`,
        top: `${field.y}px`,
        width: `${field.width}px`,
        height: `${field.height}px`,
        pointerEvents: "auto",
        ...(isRequired && !isReadOnly
          ? { borderLeft: "2px solid #e74c3c", boxSizing: "border-box" }
          : {}),
      }}
      title={
        isReadOnly
          ? "This field is read-only"
          : isRequired
            ? "This field is required"
            : undefined
      }
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onMouseDown={handleMouseDown}
      onMouseUp={handleMouseUp}
      onFocus={handleFocus}
      onBlur={handleBlur}
    >
      {field.type === "PDFSignature" && (
        <SignatureField
          elementId={elementId}
          fieldKey={fieldKey}
          value={value}
          onChange={onChange}
          readOnly={isReadOnly}
          required={isRequired}
        />
      )}

      {field.type === "PDFTextField" &&
        (() => {
          const subType = field.subType || "text";
          const dateFormat = field.dateFormat || "DD/MM/YYYY";

          if (subType === "date") {
            return (
              <DateFieldInput
                elementId={elementId}
                fieldKey={fieldKey}
                value={value}
                dateFormat={dateFormat}
                onChange={onChange}
                onBlur={handleBlur}
                readOnly={isReadOnly}
                required={isRequired}
              />
            );
          }

          return (
            <TextFieldInput
              elementId={elementId}
              fieldKey={fieldKey}
              subType={subType}
              value={value}
              isCalculated={hasScripts(jsActions, "C")}
              onChange={handleChange}
              onBlur={handleBlur}
              readOnly={isReadOnly}
              required={isRequired}
              maxLength={field.maxLen || undefined}
            />
          );
        })()}

      {field.type === "PDFCheckBox" && (
        <CheckboxField
          elementId={elementId}
          fieldKey={fieldKey}
          value={value}
          onChange={onChange}
          readOnly={isReadOnly}
          required={isRequired}
        />
      )}

      {field.type === "PDFRadioGroup" && (
        <RadioField
          elementId={elementId}
          fieldKey={fieldKey}
          field={field}
          value={value}
          onChange={onChange}
          readOnly={isReadOnly}
          required={isRequired}
        />
      )}

      {(field.type === "PDFOptionList" || field.type === "PDFDropdown") &&
        field.options && (
          <DropdownField
            elementId={elementId}
            fieldKey={fieldKey}
            field={field}
            value={value}
            onChange={onChange}
            readOnly={isReadOnly}
            required={isRequired}
          />
        )}

      {field.type === "PDFButton" && (
        <ButtonField
          elementId={elementId}
          fieldKey={fieldKey}
          field={field}
          value={value}
          jsActions={jsActions}
          formData={formData}
          allFields={allFields}
          onSubmit={onSubmit}
        />
      )}
    </div>
  );
};

export default FormField;
