import { extractAllJSActions } from "./extractors";
import {
  extractDocumentLevelJS,
  extractPageLevelJS,
  extractOpenActionJS,
  extractCalculationOrderJS,
} from "./documentExtractors";

export function extractAllDocumentJS(pdfDoc) {
  console.group("[JS Extracting from full document");

  const documentLevel = extractDocumentLevelJS(pdfDoc);
  const pageLevel = extractPageLevelJS(pdfDoc);
  const openAction = extractOpenActionJS(pdfDoc);
  const calculationOrder = extractCalculationOrderJS(pdfDoc);

  const fieldLevel = [];
  const widgetLevel = [];
  try {
    const form = pdfDoc.getForm();
    const context = pdfDoc.context;

    form.getFields().forEach((field) => {
      const fieldName = field.getName();
      const rawDict = field.acroField.dict;

      const fieldActions = extractAllJSActions(rawDict, context);
      const hasFieldJS = Object.values(fieldActions).some((v) =>
        Array.isArray(v) ? v.length > 0 : !!v,
      );
      if (hasFieldJS) {
        fieldLevel.push({
          location: "FieldLevel",
          fieldName,
          actions: fieldActions,
        });
      }

      const widgets = field.acroField.getWidgets();
      widgets.forEach((widget, wIdx) => {
        const widgetActions = extractAllJSActions(widget.dict, context);
        const hasWidgetJS = Object.values(widgetActions).some((v) =>
          Array.isArray(v) ? v.length > 0 : !!v,
        );
        if (hasWidgetJS) {
          widgetLevel.push({
            location: "WidgetLevel",
            fieldName,
            widgetIndex: wIdx,
            actions: widgetActions,
          });
        }
      });
    });
  } catch (e) {
    console.debug("Field/Widget level scan failed:", e);
  }

  const summary = {
    documentLevel,
    pageLevel,
    openAction,
    calculationOrder,
    fieldLevel,
    widgetLevel,
  };

  console.log("\n[JS Extract] ── Summary ──");
  console.log(
    `  Document Level (/Names → JavaScript) : ${documentLevel.length} scripts`,
  );
  console.log(
    `  Page Level (/AA in pages)             : ${pageLevel.length} actions`,
  );
  console.log(
    `  Document Open (/OpenAction)           : ${openAction.length} actions`,
  );
  console.log(
    `  Calculation Order (/AcroForm → CO)    : ${calculationOrder.length} fields`,
  );
  console.log(
    `  Field Level (/AA in field dicts)       : ${fieldLevel.length} fields`,
  );
  console.log(
    `  Widget Level (/AA in widget dicts)     : ${widgetLevel.length} widgets`,
  );
  console.groupEnd();

  return summary;
}
