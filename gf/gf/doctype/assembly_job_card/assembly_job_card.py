# Copyright (c) 2024, Aakvatech and contributors
# For license information, please see license.txt

import frappe
from frappe.utils import time_diff_in_hours
from frappe.model.document import Document

class AssemblyJobCard(Document):
	def before_save(self):
		self.set_working_hours()
		self.add_sickbay_task()
		self.add_remove_defects_task()	
	
	def before_submit(self):
		self.validate_submit_status()

		self.status = "Completed"

	def set_working_hours(self):
		self.assembly_total_hours = 0
		self.cabinet_total_hours = 0
		self.bodyshop_total_hours = 0
		self.sickbay_total_hours = 0
		
		for row in self.assembly_job_detail:
			if row.start_datetime and row.pending_datetime and not row.end_datetime:
				row.total_time_elapsed = time_diff_in_hours(row.pending_datetime, row.start_datetime)
				self.assembly_total_hours += row.total_time_elapsed
			
			if row.start_datetime and row.end_datetime:
				row.total_time_elapsed = time_diff_in_hours(row.end_datetime, row.start_datetime)
				self.assembly_total_hours += row.total_time_elapsed
		
		for row in self.cabinet_job_detail:
			if row.start_datetime and row.pending_datetime and not row.end_datetime:
				row.total_time_elapsed = time_diff_in_hours(row.pending_datetime, row.start_datetime)
				self.cabinet_total_hours += row.total_time_elapsed
			
			if row.start_datetime and row.end_datetime:
				row.total_time_elapsed = time_diff_in_hours(row.end_datetime, row.start_datetime)
				self.cabinet_total_hours += row.total_time_elapsed
		
		for row in self.bodyshop_job_detail:
			if row.start_datetime and row.pending_datetime and not row.end_datetime:
				row.total_time_elapsed = time_diff_in_hours(row.pending_datetime, row.start_datetime)
				self.bodyshop_total_hours += row.total_time_elapsed
			
			if row.start_datetime and row.end_datetime:
				row.total_time_elapsed = time_diff_in_hours(row.end_datetime, row.start_datetime)
				self.bodyshop_total_hours += row.total_time_elapsed
		
		for row in self.sickbay_job_detail:
			if row.start_datetime and row.end_datetime:
				row.total_time_elapsed = time_diff_in_hours(row.end_datetime, row.start_datetime)
				self.sickbay_total_hours += row.total_time_elapsed

	def add_sickbay_task(self):
		if self.has_sickbay == 0:
			return
		
		self.status = "Sickbay"
		sickbay_tasks = [i.station for i in self.sickbay_job_detail]

		for row in self.assembly_job_detail:
			if row.station not in sickbay_tasks and row.pending_datetime and not row.end_datetime:
				self.append("sickbay_job_detail", {
					"station": row.station,
					"pending_tasks": row.pending_tasks,
					"ref_doctype": row.doctype,
					"ref_docname": row.name
				})
		
		for d in self.cabinet_job_detail:
			if d.station not in sickbay_tasks and d.pending_datetime and not d.end_datetime:
				self.append("sickbay_job_detail", {
                    "station": d.station,
                    "pending_tasks": d.pending_tasks,
                    "ref_doctype": d.doctype,
                    "ref_docname": d.name
                })
		
		for d in self.bodyshop_job_detail:
			if d.station not in sickbay_tasks and d.pending_datetime and not d.end_datetime:
				self.append("sickbay_job_detail", {
                    "station": d.station,
                    "pending_tasks": d.pending_tasks,
                    "ref_doctype": d.doctype,
                    "ref_docname": d.name
                })

	def validate_submit_status(self):
		if self.status not in ["QC", "Bodyshop"]:
			frappe.throw("Only Job Card with QC/Bodyshop status can be submitted, Please inform the QC/Bodyshop team to check the truck")

	@frappe.whitelist()
	def get_checklist(self, checklist_id):
		checklist = []
		checklist_doc = frappe.get_cached_doc('QC Checklist', checklist_id)
		for row in checklist_doc.checklist:
			checklist.append({
				"task": row.get("task")
			})
		return checklist

	def add_remove_defects(self):
		defects_qc = []
		defects_ref_docnames = [row.ref_docname for row in self.qc_defect_detail]

		for row in self.quality_check_detail:
			if row.name not in defects_qc:
				defects_qc.append(row.name)
			
			if row.name not in defects_ref_docnames:
				self.append("qc_defect_detail", {
					"ref_doctype": row.doctype,
					"ref_docname": row.name,
					"task": row.task
				})

		for row in self.bodyshop_qc_detail:
			if row.name not in defects_qc:
				defects_qc.append(row.name)
			
			if row.name not in defects_ref_docnames:
				self.append("qc_defect_detail", {
					"ref_doctype": row.doctype,
					"ref_docname": row.name,
					"task": row.task
				})
		
		row_to_remove = []
		for row in self.qc_defect_detail:
			if row.ref_docname not in defects_qc:
				row_to_remove.append(row)
		
		for row in row_to_remove:
			row.delete(ignore_permissions=True, force=True)
		

