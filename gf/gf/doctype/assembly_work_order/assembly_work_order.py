# Copyright (c) 2024, Aakvatech and contributors
# For license information, please see license.txt

import frappe
from frappe.utils import flt
from frappe.model.document import Document
from gf.api.api import create_stock_entry, create_assembly_job_card, get_stock_availability


class AssemblyWorkOrder(Document):
	def before_save(self):
		self.get_chassis_and_engine_item()
	
	def validate(self):
		self.validate_bom()
	
	def before_submit(self):
		self.validate_bom_or_warehouse()
		self.validate_qty_vs_order_details()

	def on_submit(self):
		self.create_stock_entry()
		self.create_job_cards()

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
	
	def create_stock_entry(self):
		items = self.get_stock_entry_items()
		
		data = {
			"purpose": "Material Transfer",
			"stock_entry_type": "Material Transfer",
			# "from_warehouse": self.default_source_warehouse,
			# "to_warehouse": self.assembly_line_warehouse,
			"company": self.company,
			"items": items,
		}
		stock_entry_id = create_stock_entry(data)
		self.stock_entry = stock_entry_id
		self.save()

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
