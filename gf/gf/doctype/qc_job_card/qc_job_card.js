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
	},
	set_filters: (frm) => {
		frm.set_query("checklist", () => {
			return {
				filters: {
					"name": ["in", ["Dynamic Checklist", "Static Checklist"]]
				}
			}
		})
	},
	checklist: (frm) => {
		if (frm.doc.checklist) {
			frappe.call({
				method: 'get_checklist',
				doc: frm.doc,
				args: {
					checklist_id: frm.doc.checklist,
				},
				callback: (r) => {
					if (r.message) {
						frm.clear_table('job_card_detail');

						r.message.forEach((element) => {
							frm.add_child('job_card_detail', {
                                'task': element.task,
                            });
						});
						frm.refresh_field('job_card_detail');
					}
				}
			});
		} else {
			frm.clear_table('job_card_detail');
			frm.refresh_field('job_card_detail');
		}
	},
	hide_add_remove_btns: (frm) => {
		// hide button to add rows
		frm.get_field("qc_defect_items").grid.cannot_add_rows = true;

		// hide button to delete rows
		$("*[data-fieldname='qc_defect_items']").find(".grid-remove-rows").hide();
		$("*[data-fieldname='qc_defect_items']").find(".grid-remove-all-rows").hide();
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
