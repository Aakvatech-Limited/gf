# Copyright (c) 2024, Aakvatech and contributors
# For license information, please see license.txt

import frappe
from frappe.utils import time_diff_in_hours
from frappe.model.document import Document

class AssemblyJobCard(Document):
	def before_save(self):
		self.set_working_hours()

	def set_working_hours(self):
		for row in self.job_card_detail:
			if row.start_datetime and row.pause_datetime:
				row.time_elapsed = time_diff_in_hours(row.start_datetime, row.pause_datetime)
			
			if row.start_datetime and row.end_datetime:
				row.time_elapsed = time_diff_in_hours(row.start_datetime, row.end_datetime)
