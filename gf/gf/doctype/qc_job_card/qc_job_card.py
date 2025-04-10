# Copyright (c) 2024, Aakvatech and contributors
# For license information, please see license.txt

import frappe
from frappe.model.document import Document
from frappe.utils import nowdate, nowtime, get_url_to_form, now_datetime
from gf.api.api import create_stock_entry as _create_stock_entry

class QCJobCard(Document):
	def autoname(self):
		if self.engine_no and self.chassis_no:
			self.name = f"{self.chassis_no}-{self.engine_no}"
		
	def before_save(self):
		self.add_remove_defects()
	
	def before_submit(self):
		self.validate_defects()
		self.validate_consignee_warehouse()
	
	def on_submit(self):
		self.create_stock_entry()
		self.create_serial_no()
	
	def create_serial_no(self):
		for field in ["engine_no", "chassis_no"]:
			if not self.get(field):
				frappe.throw(f"{field} is mandatory")

		serial_no = frappe.new_doc("Serial No")
		serial_no.serial_no = f"{self.chassis_no}-{self.engine_no}"
		serial_no.item_code = frappe.get_cached_value("Assembly Work Order", self.work_order, "parent_item")
		serial_no.gfa_item_type = "Chs/Eng"
		serial_no.warehouse = frappe.get_cached_value("Customer", self.consignee, "warehouse")
		serial_no.status = "Active"
		serial_no.company = self.company
		serial_no.flags.ignore_mandatory = True
		serial_no.flags.ignore_permissions = True
		serial_no.save()

		self.serial_no = serial_no.name
		self.finished_truck_date = now_datetime()
		self.save()

	@frappe.whitelist()
	def get_checklist(self, checklist_id):
		checklist = []
		checklist_doc = frappe.get_cached_doc('QC Checklist', checklist_id)
		for row in checklist_doc.checklist:
			checklist.append({
				"category": row.get("category"),
				"task": row.get("task")
			})
		return checklist
	
	def add_remove_defects(self):
		defects_qc = []
		defects_ref_docnames = [row.ref_docname for row in self.qc_defect_items]

		for row in self.dynamic_checklist:
			if row.name not in defects_qc:
				defects_qc.append(row.name)
			
			if row.name not in defects_ref_docnames and row.status == "Not Ok":
				self.append("qc_defect_items", {
					"ref_doctype": row.doctype,
					"ref_docname": row.name,
					"category": row.category,
					"task": row.task
				})
		
		for row in self.static_checklist:
			if row.name not in defects_qc:
				defects_qc.append(row.name)
			
			if row.name not in defects_ref_docnames and row.status == "Not Ok":
				self.append("qc_defect_items", {
					"ref_doctype": row.doctype,
					"ref_docname": row.name,
					"category": row.category,
					"task": row.task
				})
		
		row_to_remove = []
		for row in self.qc_defect_items:
			if row.ref_docname not in defects_qc:
				row_to_remove.append(row)
		
		for row in row_to_remove:
			row.delete(ignore_permissions=True, force=True)

	def validate_defects(self):
		for row in self.qc_defect_items:
			if row.status != "Ok":
				frappe.throw("Please check the defects section and work on the defects found by QC team")
	
	def validate_consignee_warehouse(self):
		if self.consignee:
			if not frappe.get_cached_value("Customer", self.consignee, "warehouse"):
				url = get_url_to_form("Customer", self.consignee)
				frappe.throw(
					f"Warehouse is missing for Consignee: <a href='{url}'><b>{self.consignee}</b>, Please it to proceed</a>"
				)

	@frappe.whitelist()
	def create_stock_entry(self):
		if not self.gfa_bol_no:
			frappe.throw("GFA BOL No is mandatory")
		
		items = self.get_stock_entry_items()
		
		data = {
			"purpose": "Material Issue",
			"stock_entry_type": "Material Issue",
			"company": self.company,
			"gfa_bol_no": self.gfa_bol_no,
			"gfa_batch_no": self.gfa_batch_no,
			"items": items,
		}
		stock_entry_id = _create_stock_entry(data)
		self.stock_entry = stock_entry_id
		self.save(ignore_permissions=True)

		return stock_entry_id

	def get_stock_entry_items(self):
		items = []

		work_order = frappe.get_cached_doc("Assembly Work Order", self.work_order)
		if work_order.assembly_default_bom:
			assembly_bom_doc = frappe.get_cached_doc("BOM", work_order.assembly_default_bom)
			for item in assembly_bom_doc.items:
				new_row = {
					"item_code": item.item_code,
					"qty": item.qty,
					"uom": item.uom,
					"s_warehouse": self.assembly_line_warehouse,
				}

				if item.item_code == work_order.chassis_item:
					new_row["serial_no"] = self.chassis_no
				
				if item.item_code == work_order.engine_item:
					new_row["serial_no"] = self.engine_no
				
				items.append(new_row)
		
		if work_order.cab_default_bom:
			cab_bom_doc = frappe.get_cached_doc("BOM", work_order.cab_default_bom)
			for item in cab_bom_doc.items:
				new_row = {
					"item_code": item.item_code,
					"qty": item.qty,
					"uom": item.uom,
					"s_warehouse": self.cab_line_warehouse,
				}

				if item.item_code == work_order.chassis_item:
					new_row["serial_no"] = self.chassis_no
				
				if item.item_code == work_order.engine_item:
					new_row["serial_no"] = self.engine_no
				
				items.append(new_row)
		
		return items
