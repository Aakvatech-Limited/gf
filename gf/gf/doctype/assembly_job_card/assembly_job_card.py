# Copyright (c) 2024, Aakvatech and contributors
# For license information, please see license.txt

import frappe
from frappe.utils import time_diff_in_hours
from frappe.model.document import Document

class AssemblyJobCard(Document):
	def before_save(self):
		self.set_working_hours()
		self.add_sickbay_task()
	
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

	