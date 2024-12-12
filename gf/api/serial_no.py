import frappe

def update_gfa_bol_no():
    serial_nos = frappe.db.get_all(
        "Serial No",
        filters={
            "gfa_bol_no": "",
            "purchase_document_type": "Stock Entry",
            "purchase_document_no": ["!=", ""]
        },
        fields=["name", "purchase_document_no", "serial_no"],
        page_length=50
        )

    if len(serial_nos) == 0:
        return

    for serial in serial_nos:
        doc = frappe.get_doc("Serial No", serial.get('name'))

        if doc.purchase_document_type != 'Stock Entry':
            continue
            
        if not doc.purchase_document_no:
            continue

        gfa_bol_no = frappe.db.get_value("Stock Entry", doc.purchase_document_no, "gfa_bol_no", cache=True)
        if not gfa_bol_no:
            continue

        if doc.gfa_bol_no != gfa_bol_no:
            doc.gfa_bol_no = gfa_bol_no

        if str(doc.serial_no).startswith("BNG"):
            doc.gfa_item_type = "Chassis Number"
        else:
            doc.gfa_item_type = "Engine Number"
        
        doc.save(ignore_permissions=True)