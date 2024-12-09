# Copyright (c) 2024, Aakvatech and contributors
# For license information, please see license.txt

import frappe
from frappe.model.document import Document
from gf.api.api import create_stock_entry

class QCJobCard(Document):
	def on_submit(self):
		self.create_stock_entry()
		self.create_serial_no()

	def create_stock_entry(self):
		work_order = frappe.get_doc("Assembly Work Order", self.work_order)
		items = work_order.get_stock_entry_items()
		
		data = {
			"purpose": "Material Issue",
			"stock_entry_type": "Material Issue",
			# "from_warehouse": self.default_source_warehouse,
			# "to_warehouse": self.assembly_line_warehouse,
			"company": self.company,
			"items": items,
		}
		stock_entry_id = create_stock_entry(data)
		self.stock_entry = stock_entry_id
		self.save()

		return stock_entry_id
	
	def create_serial_no(self):
		for field in ["engine_no", "chassis_no"]:
			if not self.get(field):
				frappe.throw(f"{field} is mandatory")

		serial_no = frappe.new_doc("Serial No")
		serial_no.serial_no = f"{self.engine_no} - {self.chassis_no}"
		serial_no.item_code = frappe.db.get_value("Assembly Work Order", self.work_order, "parent_item")
		serial_no.status = "Active"
		serial_no.company = self.company
		# serial_no.warehouse = 'Stock Yard - GVAL'
		serial_no.flags.ignore_mandatory = True
		serial_no.flags.ignore_permissions = True
		serial_no.save()

		self.serial_no = serial_no.name
		self.save()
	
