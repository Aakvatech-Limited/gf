// Copyright (c) 2024, Aakvatech and contributors
// For license information, please see license.txt

frappe.ui.form.on('QC Job Card', {
	refresh: (frm) => {
		frm.trigger('set_filters');
		frm.trigger('hide_add_remove_btns');
	},
	onload: (frm) => {
		frm.trigger('set_filters');
		frm.trigger('hide_add_remove_btns');
		frm.trigger("issue_stock");
	},
	on_submit: (frm) => {
		if (!frm.doc.stock_entry && frm.doc.issue_stock == 0) {
			frappe.call({
				method: "gf.gf.doctype.qc_job_card.qc_job_card.enqueue_material_issue",
				args: {
					doc_type: frm.doc.doctype,
					doc_name: frm.doc.name
				},
				callback: (r) => {
				}
			});
        }
	},
	set_filters: (frm) => {
		frm.set_query("dynamic_qc_template", () => {
			return {
				filters: {
					"name": ["like", "Dynamic%"]
				}
			}
		})
		frm.set_query("static_qc_template", () => {
			return {
				filters: {
					"name": ["like", "Static%"]
				}
			}
		})
	},
	dynamic_qc_template: (frm) => {
		if (frm.doc.dynamic_qc_template) {
			frappe.call({
				method: 'get_checklist',
				doc: frm.doc,
				args: {
					checklist_id: frm.doc.dynamic_qc_template,
				},
				callback: (r) => {
					if (r.message) {
						frm.clear_table('dynamic_checklist');

						r.message.forEach((element) => {
							frm.add_child('dynamic_checklist', {
								'category': element.category,
                                'task': element.task,
                            });
						});
						frm.refresh_field('dynamic_checklist');
					}
				}
			});
		} else {
			frm.clear_table('dynamic_checklist');
			frm.refresh_field('dynamic_checklist');
		}
	},
	static_qc_template: (frm) => {
		if (frm.doc.static_qc_template) {
			frappe.call({
				method: 'get_checklist',
				doc: frm.doc,
				args: {
					checklist_id: frm.doc.static_qc_template,
				},
				callback: (r) => {
					if (r.message) {
						frm.clear_table('static_checklist');

						r.message.forEach((element) => {
							frm.add_child('static_checklist', {
								'category': element.category,
                                'task': element.task,
                            });
						});
						frm.refresh_field('static_checklist');
					}
				}
			});
		} else {
			frm.clear_table('static_checklist');
			frm.refresh_field('static_checklist');
		}
	},
	hide_add_remove_btns: (frm) => {
		// hide button to add rows
		frm.get_field("qc_defect_items").grid.cannot_add_rows = true;

		// hide button to delete rows
		$("*[data-fieldname='qc_defect_items']").find(".grid-remove-rows").hide();
		$("*[data-fieldname='qc_defect_items']").find(".grid-remove-all-rows").hide();
	},
	issue_stock: (frm) => {
		frm.refresh();
		
		if (!frm.doc.stock_entry && frm.doc.issue_stock == 0) {
			frm.add_custom_button(__("Transfer Stock"), () => {
				frappe.call({
					method: "gf.gf.doctype.qc_job_card.qc_job_card.enqueue_material_issue",
					args: {
						doc_type: frm.doc.doctype,
						doc_name: frm.doc.name
					},
					callback: (r) => {
					}
				});
			})
        }
	},
});


frappe.ui.form.on('QC Defect Item', {
	form_render: (frm, cdt, cdn) => {
        frm.fields_dict.job_card_detail.grid.wrapper.find('.grid-delete-row').hide();
        frm.fields_dict.job_card_detail.grid.wrapper.find('.grid-insert-row-below').hide();
        frm.fields_dict.job_card_detail.grid.wrapper.find('.grid-insert-row').hide();
        frm.fields_dict.job_card_detail.grid.wrapper.find('.grid-duplicate-row').hide();
        frm.fields_dict.job_card_detail.grid.wrapper.find('.grid-move-row').hide();
    },
	status: (frm, cdt, cdn) => {
		let row = frappe.get_doc(cdt, cdn);
		row.worked_by = frappe.session.user_fullname;
		frm.refresh_field('worked_by');
	},
})
