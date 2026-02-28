const FIELD_FOCUS_STYLE = {
  background: "rgba(173, 216, 230, 0.2)",
  border: "1px solid #4A90E2",
  borderRadius: "3px",
};

const FIELD_BLUR_STYLE = {
  background: "transparent",
  border: "none",
};

const SignatureField = ({
  elementId,
  fieldKey,
  value,
  onChange,
  readOnly = false,
  required = false,
}) => {
  return (
    <>
      {value && (
        <img
          src={value}
          alt="Signature"
          style={{
            width: "100%",
            height: "100%",
            objectFit: "contain",
            pointerEvents: "none",
          }}
        />
      )}

      {readOnly ? (
        <div
          title="This field is read-only"
          style={{
            position: "absolute",
            inset: 0,
            background: "rgba(240, 240, 240, 0.4)",
            cursor: "not-allowed",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "11px",
            color: "#999",
          }}
        >
          {!value && "🔒"}
        </div>
      ) : (
        <input
          id={`signature-${elementId}`}
          type="file"
          accept="image/*"
          required={required && !value}
          onChange={(e) => {
            const file = e.target.files[0];
            if (!file) return;

            const reader = new FileReader();
            reader.onload = () => {
              onChange(fieldKey, reader.result);
            };
            reader.readAsDataURL(file);
          }}
          title={required ? "This field is required" : undefined}
          style={{
            position: "absolute",
            inset: 0,
            opacity: 0,
            cursor: "pointer",
          }}
        />
      )}
    </>
  );
};

export default SignatureField;
export { FIELD_FOCUS_STYLE, FIELD_BLUR_STYLE };
