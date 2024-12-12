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
		frm.set_query("chassis_number", "work_order_detail", () => {
			return {
				filters: {
					"gfa_bol_no": frm.doc.gfa_bol_no,
					"gfa_item_type": "Chassis Number",
				}
			}
		});
		frm.set_query("engine_number", "work_order_detail", () => {
			return {
				filters: {
					"gfa_bol_no": frm.doc.gfa_bol_no,
					"gfa_item_type": "Engine Number",
				}
			}
		});
	},
	gfa_bol_no: (frm) => {
		if (frm.doc.gfa_bol_no) {
			frappe.call({
                method: "get_chassis_and_engine_no",
				doc: frm.doc,
                args: {
                    gfa_bol_no: frm.doc.gfa_bol_no
                },
				freeze: true,
                callback: (r) => {
                    if (r.message) {
						frm.clear_table("work_order_detail");

						r.message.forEach((d) => {
							frm.add_child("work_order_detail", {
								"chassis_number": d.chassis_number,
								"engine_number": d.engine_number,
							});
						});
						frm.refresh_field("work_order_detail");
                    } else {
                        frm.clear_table("work_order_detail");
						frm.refresh_field("work_order_detail");
                    }
                }
            });
		} else {
			frm.clear_table("work_order_detail");
			frm.refresh_field("work_order_detail");
		}
	}
});
