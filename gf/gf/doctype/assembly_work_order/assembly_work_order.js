// Copyright (c) 2024, Aakvatech and contributors
// For license information, please see license.txt

frappe.ui.form.on('Assembly Work Order', {
	refresh: function(frm) {
		frm.trigger("set_filters");
	},
	onload: (frm) => {
		frm.trigger("set_filters");

		if (!frm.doc.company) {
			frm.set_value("company", frappe.defaults.get_user_default("Company"));
		}
	},
	set_filters: (frm) => {
		frm.set_query("parent_item", () => {
			return {
				filters: {
					"disabled": 0
				}
			}
		});
		frm.set_query("customer", () => {
			return {
				filters: {
					"disabled": 0
				}
			}
		});
		frm.set_query("assembly_default_bom", () => {
			return {
				filters: {
					"is_active": 1
				}
			}
		});
		frm.set_query("default_source_warehouse", () => {
			return {
				filters: {
					"is_group": 0
				}
			}
		});
		frm.set_query("assembly_line_warehouse", () => {
			return {
				filters: {
					"is_group": 0
				}
			}
		});
		frm.set_query("cabinet_line_warehouse", () => {
			return {
				filters: {
					"is_group": 0
				}
			}
		});
	},
});
