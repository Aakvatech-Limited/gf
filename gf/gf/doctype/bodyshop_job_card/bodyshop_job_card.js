// Copyright (c) 2024, Aakvatech and contributors
// For license information, please see license.txt

frappe.ui.form.on('Bodyshop Job Card', {
	refresh: function(frm) {

	},
	create_quality_check: (frm) => {
		frappe.call({
			method: 'gf.api.api.create_body_shop_or_qc_card',
			args: {
				doc_type: frm.doc.doctype,
				doc_name: frm.doc.name,
				card_type: "GFA Quality Check"
			},
			freeze: true,
			callback: (r) => {
				if (r.message) {
					frappe.show_alert({
						message: __('GFA Quality Check {0} created successfully', [r.message]),
						indicator: 'green'
					});
				}
			}
		});
	},
});


frappe.ui.form.on('Bodyshop Job Card Detail', {
	form_render: (frm, cdt, cdn) => {
		frm.fields_dict.job_card_detail.grid.wrapper.find('.grid-delete-row').hide();
		frm.fields_dict.job_card_detail.grid.wrapper.find('.grid-insert-row-below').hide();
		frm.fields_dict.job_card_detail.grid.wrapper.find('.grid-insert-row').hide();
		frm.fields_dict.job_card_detail.grid.wrapper.find('.grid-duplicate-row').hide();
		frm.fields_dict.job_card_detail.grid.wrapper.find('.grid-move-row').hide();
	},
	start: (frm, cdt, cdn) => {
		frappe.model.set_value(cdt, cdn, 'start_datetime', frappe.datetime.now_datetime())
		frm.refresh_field('job_card_detail');
		frm.save();
	},
	pause: (frm, cdt, cdn) => {
		frappe.model.set_value(cdt, cdn, 'pause_datetime', frappe.datetime.now_datetime())
		frm.refresh_field('job_card_detail');
	},
	end: (frm, cdt, cdn) => {
		frappe.model.set_value(cdt, cdn, 'end_datetime', frappe.datetime.now_datetime())
		frm.refresh_field('job_card_detail');
		frm.save();
	},
});
