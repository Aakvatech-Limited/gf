// Copyright (c) 2024, Aakvatech and contributors
// For license information, please see license.txt

frappe.ui.form.on('QC Job Card', {
	// refresh: function(frm) {

	// }
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
});
