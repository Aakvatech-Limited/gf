# Copyright (c) 2024, Aakvatech and contributors
# For license information, please see license.txt

import frappe
from frappe.model.document import Document
from frappe.utils import time_diff_in_hours, nowdate, nowtime, get_url_to_form

class AssemblyJobCard(Document):
	def after_insert(self):
		self.get_checklist_from_templates()

		self.save(ignore_permissions=True)

	def before_save(self):
		self.set_working_hours()
		self.add_sickbay_task()
		self.add_remove_defects()

		if len(self.sickbay_stations) == 0:
			self.has_sickbay = 0
			self.sickbay_start_date = ""
	
	def before_submit(self):
		self.validate_defects()
		self.validate_submit_status()

		self.status = "Completed"
	
	def on_submit(self):
		self.create_qc_job_card()

	def set_working_hours(self):
		self.assembly_total_hours = 0
		self.cab_total_hours = 0
		self.engine_total_hours = 0
		self.bs_ps_total_hours = 0
		self.sickbay_total_hours = 0
		
		for row in self.assembly_stations:
			if row.pause_datetime and row.resume_datetime:
				row.resting_time = time_diff_in_hours(row.resume_datetime, row.pause_datetime)

			if row.start_datetime and row.pending_datetime and not row.end_datetime:
				row.total_time_elapsed = time_diff_in_hours(row.pending_datetime, row.start_datetime) - row.resting_time
				self.assembly_total_hours += row.total_time_elapsed
			
			if row.start_datetime and row.end_datetime:
				row.total_time_elapsed = time_diff_in_hours(row.end_datetime, row.start_datetime) - row.resting_time
				self.assembly_total_hours += row.total_time_elapsed
		
		for row in self.cab_stations:
			if row.pause_datetime and row.resume_datetime:
				row.resting_time = time_diff_in_hours(row.resume_datetime, row.pause_datetime)
				
			if row.start_datetime and row.pending_datetime and not row.end_datetime:
				row.total_time_elapsed = time_diff_in_hours(row.pending_datetime, row.start_datetime) - row.resting_time
				self.cab_total_hours += row.total_time_elapsed
			
			if row.start_datetime and row.end_datetime:
				row.total_time_elapsed = time_diff_in_hours(row.end_datetime, row.start_datetime) - row.resting_time
				self.cab_total_hours += row.total_time_elapsed
		
		for row in self.engine_stations:
			if row.pause_datetime and row.resume_datetime:
				row.resting_time = time_diff_in_hours(row.resume_datetime, row.pause_datetime)
				
			if row.start_datetime and row.pending_datetime and not row.end_datetime:
				row.total_time_elapsed = time_diff_in_hours(row.pending_datetime, row.start_datetime) - row.resting_time
				self.engine_total_hours += row.total_time_elapsed
			
			if row.start_datetime and row.end_datetime:
				row.total_time_elapsed = time_diff_in_hours(row.end_datetime, row.start_datetime) - row.resting_time
				self.engine_total_hours += row.total_time_elapsed
		
		for row in self.bs_ps_stations:
			if row.pause_datetime and row.resume_datetime:
				row.resting_time = time_diff_in_hours(row.resume_datetime, row.pause_datetime)
				
			if row.start_datetime and row.pending_datetime and not row.end_datetime:
				row.total_time_elapsed = time_diff_in_hours(row.pending_datetime, row.start_datetime) - row.resting_time
				self.bs_ps_total_hours += row.total_time_elapsed
			
			if row.start_datetime and row.end_datetime:
				row.total_time_elapsed = time_diff_in_hours(row.end_datetime, row.start_datetime) - row.resting_time
				self.bs_ps_total_hours += row.total_time_elapsed
		
		for row in self.sickbay_stations:
			if row.pause_datetime and row.resume_datetime:
				row.resting_time = time_diff_in_hours(row.resume_datetime, row.pause_datetime)
				
			if row.start_datetime and row.end_datetime:
				row.total_time_elapsed = time_diff_in_hours(row.end_datetime, row.start_datetime) - row.resting_time
				self.sickbay_total_hours += row.total_time_elapsed

	def add_sickbay_task(self):
		sickbays = []
		sickbay_ref_tasks = [i.ref_docname for i in self.sickbay_stations]

		for d in self.assembly_stations:
			if d.name not in sickbays:
				sickbays.append(d.name)
			
			if d.name not in sickbay_ref_tasks and d.pending_datetime and not d.end_datetime:
				self.append("sickbay_stations", {
					"station": d.station,
					"pending_tasks": d.pending_tasks,
					"ref_doctype": d.doctype,
					"ref_docname": d.name
				})

				if not self.has_sickbay:
					self.has_sickbay = 1
				if not self.sickbay_start_date:
					self.sickbay_start_date = nowdate()
		
		for d in self.cab_stations:
			if d.name not in sickbays:
				sickbays.append(d.name)
			
			if d.name not in sickbay_ref_tasks and d.pending_datetime and not d.end_datetime:
				self.append("sickbay_stations", {
                    "station": d.station,
                    "pending_tasks": d.pending_tasks,
                    "ref_doctype": d.doctype,
                    "ref_docname": d.name
                })

				if not self.has_sickbay:
					self.has_sickbay = 1
				if not self.sickbay_start_date:
					self.sickbay_start_date = nowdate()
		
		for d in self.engine_stations:
			if d.name not in sickbays:
				sickbays.append(d.name)
			
			if d.name not in sickbay_ref_tasks and d.pending_datetime and not d.end_datetime:
				self.append("sickbay_stations", {
                    "station": d.station,
                    "pending_tasks": d.pending_tasks,
                    "ref_doctype": d.doctype,
                    "ref_docname": d.name
                })

				if not self.has_sickbay:
					self.has_sickbay = 1
				if not self.sickbay_start_date:
					self.sickbay_start_date = nowdate()
		
		for d in self.bs_ps_stations:
			if d.name not in sickbays:
				sickbays.append(d.name)
			
			if d.name not in sickbay_ref_tasks and d.pending_datetime and not d.end_datetime:
				self.append("sickbay_stations", {
                    "station": d.station,
                    "pending_tasks": d.pending_tasks,
                    "ref_doctype": d.doctype,
                    "ref_docname": d.name
                })

				if not self.has_sickbay:
					self.has_sickbay = 1
				if not self.sickbay_start_date:
					self.sickbay_start_date = nowdate()
		
		row_to_remove = []
		for row in self.sickbay_stations:
			if row.ref_docname not in sickbays:
				row_to_remove.append(row)
		
		for row in row_to_remove:
			row.delete(ignore_permissions=True, force=True)

	def validate_submit_status(self):
		if self.status not in ["QC", "Bodyshop"]:
			frappe.throw("Only Job Card with QC/Bodyshop status can be submitted, Please inform the QC/Bodyshop team to check the truck")

	def get_checklist_from_templates(self):
		if self.eol_qc_template:
			for row in self.get_checklist(self.eol_qc_template):
				self.append("eol_qc_checklist", {
					"category": row.get("category"),
					"task": row.get("task")
				})
		
		if self.assembly_qc_template:
			for row in self.get_checklist(self.assembly_qc_template):
				self.append("assembly_qc_checklist", {
					"category": row.get("category"),
					"task": row.get("task")
				})
		
		if self.cab_qc_template:
			for row in self.get_checklist(self.cab_qc_template):
				self.append("cab_qc_checklist", {
					"category": row.get("category"),
                    "task": row.get("task")
                })
		
		if self.engine_qc_template:
			for row in self.get_checklist(self.engine_qc_template):
				self.append("engine_qc_checklist", {
					"category": row.get("category"),
                    "task": row.get("task")
                })
		
		if self.bs_ps_qc_template:
			for row in self.get_checklist(self.bs_ps_qc_template):
				self.append("bs_ps_qc_checklist", {
					"category": row.get("category"),
                    "task": row.get("task")
                })
		
		if self.sickbay_qc_template:
			for row in self.get_checklist(self.sickbay_qc_template):
				self.append("sickbay_qc_checklist", {
					"category": row.get("category"),
                    "task": row.get("task")
                })

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
		defects_ref_docnames = [row.ref_docname for row in self.qc_defects]

		for row in self.eol_qc_checklist:
			if row.name not in defects_qc:
				defects_qc.append(row.name)
			
			if row.name not in defects_ref_docnames and row.status == "Not Ok":
				self.append("qc_defects", {
					"ref_doctype": row.doctype,
					"ref_docname": row.name,
					"category": row.category,
					"task": row.task
				})

		for row in self.assembly_qc_checklist:
			if row.name not in defects_qc:
				defects_qc.append(row.name)
			
			if row.name not in defects_ref_docnames and row.status == "Not Ok":
				self.append("qc_defects", {
					"ref_doctype": row.doctype,
					"ref_docname": row.name,
					"category": row.category,
					"task": row.task
				})

		for row in self.cab_qc_checklist:
			if row.name not in defects_qc:
				defects_qc.append(row.name)
			
			if row.name not in defects_ref_docnames and row.status == "Not Ok":
				self.append("qc_defects", {
					"ref_doctype": row.doctype,
					"ref_docname": row.name,
					"category": row.category,
					"task": row.task
				})
			
		for row in self.engine_qc_checklist:
			if row.name not in defects_qc:
				defects_qc.append(row.name)
			
			if row.name not in defects_ref_docnames and row.status == "Not Ok":
				self.append("qc_defects", {
					"ref_doctype": row.doctype,
					"ref_docname": row.name,
					"category": row.category,
					"task": row.task
				})
		
		for row in self.bs_ps_qc_checklist:
			if row.name not in defects_qc:
				defects_qc.append(row.name)
			
			if row.name not in defects_ref_docnames and row.status == "Not Ok":
				self.append("qc_defects", {
					"ref_doctype": row.doctype,
					"ref_docname": row.name,
					"category": row.category,
					"task": row.task
				})
		
		for row in self.sickbay_qc_checklist:
			if row.name not in defects_qc:
				defects_qc.append(row.name)
			
			if row.name not in defects_ref_docnames and row.status == "Not Ok":
				self.append("qc_defects", {
					"ref_doctype": row.doctype,
					"ref_docname": row.name,
					"category": row.category,
					"task": row.task
				})
		
		row_to_remove = []
		for row in self.qc_defects:
			if row.ref_docname not in defects_qc:
				row_to_remove.append(row)
		
		for row in row_to_remove:
			row.delete(ignore_permissions=True, force=True)
		
	def validate_defects(self):
		for row in self.qc_defects:
			if row.status != "Ok":
				frappe.throw("Please check the defects section and work on the defects found by QC team")
	
	def create_qc_job_card(self):
		qc_job_card = frappe.new_doc("QC Job Card")
		qc_job_card.assembly_job_card = self.name
		qc_job_card.work_order = self.work_order
		qc_job_card.consignee = self.consignee
		qc_job_card.gfa_bol_no = self.gfa_bol_no
		qc_job_card.gfa_batch_no = self.gfa_batch_no
		qc_job_card.engine_no = self.engine_no
		qc_job_card.chassis_no = self.chassis_no
		qc_job_card.model = self.model
		qc_job_card.company = self.company
		qc_job_card.posting_date = nowdate()
		qc_job_card.posting_time = nowtime()
		# qc_job_card.__newname = f"{self.engine_no}/{self.chassis_no}/{self.model}"
		qc_job_card.save(ignore_permissions=True)

		if qc_job_card.get("name"):
			url = get_url_to_form(qc_job_card.get("doctype"), qc_job_card.get("name"))
			frappe.msgprint(f"QC Job Card: <a href='{url}'><b>{qc_job_card.get('name')}</b></a> has been created successfully.")
