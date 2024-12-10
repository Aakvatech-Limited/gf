# Copyright (c) 2024, Aakvatech and contributors
# For license information, please see license.txt

import frappe
from frappe.model.document import Document
from gf.api.api import create_stock_entry, create_assembly_job_card


class AssemblyWorkOrder(Document):
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

		if self.cabinet_default_bom:
			check_bom_status(self.cabinet_default_bom, "cabinet_default_bom")

	def validate_bom_or_warehouse(self):
		if not (self.assembly_default_bom or self.cabinet_default_bom):
			frappe.throw("Please select Assembly BOM or Cabinet BOM")

		elif not self.default_source_warehouse:
			frappe.throw("Please select Default Source Warehouse")
		
		if self.assembly_default_bom and not self.assembly_line_warehouse:
			frappe.throw("Please set Assembly Line Warehouse")
		
		if self.cabinet_default_bom and not self.cabinet_line_warehouse:
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
				items.append(
					{
						"item_code": item.item_code,
						"qty": item.qty * self.quantity,
						"uom": item.uom,
						"s_warehouse": self.default_source_warehouse,
						"t_warehouse": self.assembly_line_warehouse,
					}
				)
		
		if self.cabinet_default_bom:
			cabinet_bom_doc = frappe.get_doc("BOM", self.cabinet_default_bom)
			for item in cabinet_bom_doc.items:
				items.append(
					{
						"item_code": item.item_code,
						"qty": item.qty * self.quantity,
						"uom": item.uom,
						"s_warehouse": self.default_source_warehouse,
						"t_warehouse": self.cabinet_line_warehouse,
					}
				)
		
		return items

	def create_job_cards(self):
		for row in self.work_order_detail:
			# if self.assembly_default_bom:
			create_assembly_job_card(self, row)
			# if self.cabinet_default_bom:
			# 	create_assembly_job_card(self, row, "CAB")
