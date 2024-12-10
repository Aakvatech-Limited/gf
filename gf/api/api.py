import frappe
from frappe.utils import nowdate, nowtime, get_url_to_form

def create_stock_entry(data):
    """
    Create stock entry

    params:
        data: dict: stock entry data
        data = {
            "purpose": str,
            "stock_entry_type": str,
            "from_warehouse": str, (otional)
            "to_warehouse": str, (optional)
            "company": str,
            "items": list
        }
    """
    stock_entry = frappe.new_doc("Stock Entry")
    stock_entry.purpose = data.get("purpose")
    stock_entry.stock_entry_type = data.get("stock_entry_type")
    # stock_entry.from_warehouse = data.get("from_warehouse")
    # stock_entry.to_warehouse = data.get("to_warehouse")
    stock_entry.company = data.get("company")
    stock_entry.posting_date = nowdate()
    stock_entry.posting_time = nowtime()    
    stock_entry.set_posting_time = 1

    for item in data.get("items"):
        stock_entry.append("items", item)
    
    stock_entry.insert(ignore_permissions=True)
    frappe.flags.ignore_account_permissions = True
    stock_entry.set_missing_values()
    stock_entry.save()
    # stock_entry.submit()

    url = get_url_to_form(stock_entry.doctype, stock_entry.name)
    frappe.msgprint(
        f"Stock Entry Created <a href='{url}'>{stock_entry.name}</a>"
    )
    return stock_entry.name


def create_assembly_job_card(doc, row):
    doc_dict = doc.as_dict()
    row_dict = row.as_dict()
    for field in get_fields_to_clear():
        if field in doc_dict:
            del doc_dict[field]
        
        if field in row_dict:
            del row_dict[field]
    
    card_doc = frappe.new_doc("Assembly Job Card")
    card_doc.update(doc_dict)
    card_doc.posting_date = nowdate()
    card_doc.posting_time = nowtime()
    card_doc.work_order = doc.name
    card_doc.model = doc.parent_item
    card_doc.engine_no = row_dict.get("engine_number")
    card_doc.chassis_no = row_dict.get("chassis_number")
    card_doc.status = "Pending"

    
    for i in range(8):
        card_doc.append("assembly_job_detail", {"station": f"S {i+1}" })

    card_doc.append("assembly_job_detail", {"station": f"EOL"})
    
    for i in range(6):
        card_doc.append("cabinet_job_detail", {"station": f"C {i+1}" })

    for i in range(1):
        card_doc.append("bodyshop_job_detail", {"station": f"B {i+1}" })

    card_doc.__newname = f"{card_doc.engine_no}/{card_doc.chassis_no}/{card_doc.model}"

    card_doc.insert(ignore_permissions=True)
    card_doc.reload()

@frappe.whitelist()
def create_sickbed_job_card(doc_type, doc_name):
    doc = frappe.get_doc(doc_type, doc_name)
    doc_dict = doc.as_dict()
    for field in get_fields_to_clear():
        if field in doc_dict:
            del doc_dict[field]
    
    card_doc = frappe.new_doc("Sickbay Job Card")
    card_doc.update(doc_dict)
    card_doc.posting_date = nowdate()
    card_doc.posting_time = nowtime()
    card_doc.parent_job_card = doc.name

    card_details = [d for d in doc.get("job_card_detail") if d.pause_datetime and not d.end_datetime]
    if len(card_details) == 0:
        frappe.msgprint("No Pending Tasks to create a Sickbay Job Card.")
        return
    
    card_doc.job_card_detail = []
    for row in card_details:
        card_doc.append("job_card_detail", {
            "station": row.station,
            "pending_tasks": row.pending_tasks
        })

    card_doc.__newname = f"SB-{card_doc.engine_no}/{card_doc.chassis_no}/{card_doc.model}"
    card_doc.insert(ignore_permissions=True)
    card_doc.reload()

    if card_doc.get("name"):
        doc.has_sickbed_job_card = 1
        doc.db_update()
        return card_doc.name

@frappe.whitelist()
def create_body_shop_or_qc_card(doc_type, doc_name, card_type):
    doc = frappe.get_doc(doc_type, doc_name)
    doc_dict = doc.as_dict()
    for field in get_fields_to_clear():
        if field in doc_dict:
            del doc_dict[field]
    
    card_doc = frappe.new_doc(card_type)
    card_doc.update(doc_dict)
    card_doc.posting_date = nowdate()
    card_doc.posting_time = nowtime()

    card_doc.job_card_detail = []
    for n in range(3):
        card_doc.append("job_card_detail", {
            "station": f"Task {n+1}"
        })

    card_doc.__newname = f"BS-{card_doc.engine_no}/{card_doc.chassis_no}/{card_doc.model}"
    card_doc.insert(ignore_permissions=True)
    card_doc.reload()

    if card_doc.get("name"):
        doc.has_quality_check = 1
        doc.db_update()
        return card_doc.name

def get_fields_to_clear():
    return [ "doctype", "owner", "creation", "modified", "modified_by", "docstatus", "name", "parent", "parentfield", "parenttype", "idx", "amended_from"]