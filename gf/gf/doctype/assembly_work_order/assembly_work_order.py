# Copyright (c) 2024, Aakvatech and contributors
# For license information, please see license.txt

import frappe
from frappe.utils import flt
from frappe.model.document import Document
from frappe.utils.background_jobs import enqueue
from gf.api.api import create_stock_entry, create_assembly_job_card, get_stock_availability


class AssemblyWorkOrder(Document):
	def before_insert(self):
		if self.stock_entry:
			self.stock_entry = ''
	
	def before_save(self):
		self.get_chassis_and_engine_item()
	
	def validate(self):
		self.validate_bom()
	
	def before_submit(self):
		self.validate_bom_or_warehouse()
		self.validate_qty_vs_order_details()

	def on_submit(self):
		# self.create_stock_entry()
		self.create_job_cards()
	
	def before_cancel(self):
		self.check_for_job_cards()
		self.cancel_stock_entry()

	def validate_bom(self):
		def check_bom_status(bom_id, field):
			if frappe.db.get_value("BOM", bom_id, "is_active") == 0:
				label = frappe.unscrub(field)
				frappe.throw(
					f"Bom selected on <b>{label}</b> is inactive. Please select an active BOM."
				)
		
		if self.assembly_default_bom:
			check_bom_status(self.assembly_default_bom, "assembly_default_bom")

		if self.cab_default_bom:
			check_bom_status(self.cab_default_bom, "cab_default_bom")

	def validate_bom_or_warehouse(self):
		if not (self.assembly_default_bom or self.cab_default_bom):
			frappe.throw("Please select Assembly BOM or Cabinet BOM")

		elif not self.default_source_warehouse:
			frappe.throw("Please select Default Source Warehouse")
		
		if self.assembly_default_bom and not self.assembly_line_warehouse:
			frappe.throw("Please set Assembly Line Warehouse")
		
		if self.cab_default_bom and not self.cab_line_warehouse:
			frappe.throw("Please set Cabinet Line Warehouse")

	def validate_qty_vs_order_details(self):
		if not self.quantity:
			frappe.throw("Quantity is mandatory")
		
		if len(self.work_order_detail) == 0:
			frappe.throw("Please add work order details")
		
		if len(self.work_order_detail) != self.quantity:
			frappe.throw(
				f"Total work order details must be same to Quantity: <b>{self.quantity}</b>, Please add more work order details"
			)
	
	@frappe.whitelist()
	def create_stock_entry(self, purpose="Material Transfer", items=[]):
		if not self.gfa_bol_no:
			frappe.throw("GFA BOL No is mandatory")
		
		if len(items) == 0:
			items = self.get_stock_entry_items()
		
		data = {
			"purpose": purpose,
			"stock_entry_type": purpose,
			"company": self.company,
			"gfa_bol_no": self.gfa_bol_no,
			"gfa_batch_no": self.gfa_batch_no,
			"items": items,
		}
		stock_entry_id = create_stock_entry(data)
		if purpose == "Material Transfer":
			self.stock_entry = stock_entry_id
			self.save(ignore_permissions=True)

		return stock_entry_id

	def get_stock_entry_items(self):
		items = []

		if self.assembly_default_bom:
			assembly_bom_doc = frappe.get_doc("BOM", self.assembly_default_bom)
			for item in assembly_bom_doc.items:
				new_row = {
					"item_code": item.item_code,
					"qty": item.qty * self.quantity,
					"uom": item.uom,
					"s_warehouse": self.default_source_warehouse,
					"t_warehouse": self.assembly_line_warehouse,
				}

				if item.item_code == self.chassis_item:
					new_row["serial_no"] = "\n".join([row.chassis_number for row in self.work_order_detail])
				
				if item.item_code == self.engine_item:
					new_row["serial_no"] = "\n".join([row.engine_number for row in self.work_order_detail])
				
				items.append(new_row)
		
		if self.cab_default_bom:
			cab_bom_doc = frappe.get_doc("BOM", self.cab_default_bom)
			for item in cab_bom_doc.items:
				new_row = {
					"item_code": item.item_code,
					"qty": item.qty * self.quantity,
					"uom": item.uom,
					"s_warehouse": self.default_source_warehouse,
					"t_warehouse": self.cab_line_warehouse,
				}

				if item.item_code == self.chassis_item:
					new_row["serial_no"] = "\n".join([row.chassis_number for row in self.work_order_detail])
				
				if item.item_code == self.engine_item:
					new_row["serial_no"] = "\n".join([row.engine_number for row in self.work_order_detail])
				
				items.append(new_row)
		
		return items

	def create_job_cards(self):
		for row in self.work_order_detail:
			create_assembly_job_card(self, row)
	
	@frappe.whitelist()
	def get_chassis_and_engine_no(self, gfa_bol_no):
		if not gfa_bol_no:
			return
		
		chassis_numbers = frappe.db.get_all("Serial No", {"gfa_bol_no": gfa_bol_no, "gfa_item_type": "Chassis Number", "Status": "Active"})
		engine_numbers = frappe.db.get_all("Serial No", {"gfa_bol_no": gfa_bol_no, "gfa_item_type": "Engine Number", "Status": "Active"})

		items = []

		for i in range(min(len(chassis_numbers), len(engine_numbers))):
			chassis_number = chassis_numbers[i]['name']
			engine_number = engine_numbers[i]['name']
			items.append({"chassis_number": chassis_number, "engine_number": engine_number})
		
		return items
	
	def get_chassis_and_engine_item(self):
		if not self.gfa_bol_no:
			return
		
		if not self.chassis_item:
			self.chassis_item = frappe.db.get_value("Serial No", {"gfa_bol_no": self.gfa_bol_no, "gfa_item_type": "Chassis Number"}, "item_code", cache=True)
		
		if not self.engine_item:
			self.engine_item = frappe.db.get_value("Serial No", {"gfa_bol_no": self.gfa_bol_no, "gfa_item_type": "Engine Number"}, "item_code", cache=True)

	@frappe.whitelist()
	def validate_stock_for_bom_items(self):
		"""
		Validate stock for BOM items. Aim is to print all bom items with their qty needed to fullfill the material transfer from source warehouse to assembly line warehouse to target warehouse 
		"""

		less_stock_items = []
		items = self.get_bom_items()
		for row in items:
			sle_qty = get_stock_availability(row['item_code'], self.default_source_warehouse)
			if flt(sle_qty) < flt(row['qty']):
				less_stock_items.append({
					"type": row["type"],
					"item_code": row['item_code'],
					"uom": row['uom'],
					"available_qty": sle_qty,
					"qty_needed": row['qty'] - sle_qty,
				})
		
		sorted_items = sorted(less_stock_items, key=lambda i: (i["type"], i["item_code"]))
		return sorted_items
	
	def get_bom_items(self):
		def merge_repeated_items(items):
			seen = {}
			merged_items = []

			for item in items:
				if item['item_code'] in seen:
					seen[item['item_code']]['qty'] += item['qty']
				else:
					new_item = {
						'type': item['type'],
						'item_code': item['item_code'],
						'uom': item['uom'],
						'qty': item['qty']
					}
					seen[item['item_code']] = new_item
					merged_items.append(new_item)
			
			return merged_items
		
		items = []
		if self.assembly_default_bom:
			assembly_bom_doc = frappe.get_doc("BOM", self.assembly_default_bom)
			for item in assembly_bom_doc.items:
				if item.is_stock_item == 1:
					items.append({
						"type": "Assembly",
						"item_code": item.item_code,
						"uom": item.uom,
						"qty": item.qty * self.quantity,
					})
		
		if self.cab_default_bom:
			cab_bom_doc = frappe.get_doc("BOM", self.cab_default_bom)
			for item in cab_bom_doc.items:
				if item.is_stock_item == 1:
					items.append({
						"type": "Cab",
						"item_code": item.item_code,
						"uom": item.uom,
						"qty": item.qty * self.quantity,
					})
		
		items = merge_repeated_items(items)

		return items

	def check_for_job_cards(self):
		"""
        Check if any assembly job cards exist for this assembly job order
        """
		job_cards = frappe.get_all("Assembly Job Card", {"work_order": self.name})
		if len(job_cards) > 0:
			frappe.throw(str(f"There are <b>{len(job_cards)}</b> assembly job cards for this assembly job order, Please cancel them first"))
		
	def cancel_stock_entry(self):
		"""
        Cancel stock entry for the assembly job order
        """
		if not self.stock_entry:
			return
		
		stock_entry_doc = frappe.get_doc("Stock Entry", self.stock_entry)
		if stock_entry_doc.docstatus == 1:
			stock_entry_doc.queue_action("cancel")
		elif stock_entry_doc.docstatus == 0:
			stock_entry_doc.delete()
	
@frappe.whitelist()
def enqueue_material_transfer(doc_type, doc_name):
	"""Enqueue a method to create stock entry (material transfer)
	:param doc_type: Document type
	:param doc_name: Document name
	"""

	if not doc_type or not doc_name:
		return
	
	frappe.msgprint("Stock Entry (Material Transfer) is enqueued.", alert=True)

	enqueue(
		method=create_stock_entry_material_transfer,
		job_name="create_stock_entry_material_transfer",
		kwargs={"doc_type": doc_type, "doc_name": doc_name},
	)

def create_stock_entry_material_transfer(kwargs):
	"""Create stock entry (material transfer)
    :param doc_type: Document type
    :param doc_name: Document name
    """

	doc_type = str(kwargs.get("doc_type"))
	doc_name = str(kwargs.get("doc_name"))
	doc = frappe.get_doc(doc_type, doc_name)
	stock_entry_id = doc.create_stock_entry()
	if stock_entry_id:
		doc.queue_action("submit")
	
	return stock_entry_id