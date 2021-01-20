# Copyright (c) 2019, Aakvatech and contributors
# For license information, please see license.txt

from __future__ import unicode_literals
import frappe
import pandas as pd
import numpy as np
import datetime as dt
from frappe import _
from frappe.utils import cstr, cint, getdate
from frappe import msgprint, _
from calendar import monthrange

def execute(filters=None):
    columns = get_columns()
    lunch_checkin_list = get_lunch_checkin(filters)
    #frappe.msgprint("lunch_checkin_list are: " + str(lunch_checkin_list))

    if lunch_checkin_list:
        colnames = [key for key in lunch_checkin_list[0].keys()]
        #frappe.msgprint("colnames are: " + str(colnames))
        df = pd.DataFrame.from_records(lunch_checkin_list, columns=colnames)
        #frappe.msgprint("dataframe columns are is: " + str(df.columns.tolist()))
        pvt = pd.pivot_table(
            df,
            values='qty',
            index=['employee', 'employee_name'],
            columns='time',
            aggfunc = "count",
            margins=True,
            fill_value=''
        )
        #frappe.msgprint(str(pvt))
        
        data = pvt.reset_index().values.tolist()
        #frappe.msgprint("Data is: " + str(data))

        columns += pvt.columns.values.tolist()
        #frappe.msgprint("Columns is: " + str(columns))

    
    return columns, data


def get_columns():
	columns = [
		{
            "label": _("Employee"), 
            "fieldname": "employee", 
            "fieldtype": "Link",
            "options": "Employee", 
            "width": 100
        },
		{
            "label": _("Name"), 
            "fieldname": "Particulars", 
            "width": 200
        }
	]

	return columns

def get_lunch_checkin(filters):
    last_day_of_month = calendar.monthrange(filters.year,filters.month)[1]
    return frappe.db.sql("""
        SELECT employee, employee_name, DATE_FORMAT(time, '%d %a') as time, count(employee) as  qty
        FROM `tabEmployee Checkin`
        WHERE device_id = 'lunch'
        AND time between {start_date} and {end_date}
        GROUP BY employee, employee_name, DATE_FORMAT(time, '%d $a')
        ORDER BY DATE_FORMAT(time, '%d'), employee_name"""\
		.format(
            start_date = dt.date(filters.year, filters.month, 1)
            end_date = dt.date(filters.year, filters.month, last_day_of_month)
        ), filters, as_dict = 1)

@frappe.whitelist()
def get_lunch_years():
	year_list = frappe.db.sql_list("""SELECT distinct YEAR(time) FROM `tabEmployee Checkin` ORDER BY YEAR(time) DESC""")
	if not year_list:
		year_list = [getdate().year]
	return "\n".join(str(year) for year in year_list)
