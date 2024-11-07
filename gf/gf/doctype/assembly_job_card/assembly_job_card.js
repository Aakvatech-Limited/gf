// Copyright (c) 2024, Aakvatech and contributors
// For license information, please see license.txt

frappe.ui.form.on('Assembly Job Card', {
	refresh: (frm) =>{
		// hide button to add rows
		frm.get_field("job_card_detail").grid.cannot_add_rows = true;

		// hide button to delete rows
		$("*[data-fieldname='job_card_detail']").find(".grid-remove-rows").hide();
		$("*[data-fieldname='job_card_detail']").find(".grid-remove-all-rows").hide();

		frm.trigger('validate_pending_tasks');
	},
	
	onload: (frm) => {
		// hide button to add rows
		frm.get_field("job_card_detail").grid.cannot_add_rows = true;

		// hide button to delete rows
		$("*[data-fieldname='job_card_detail']").find(".grid-remove-rows").hide();
		$("*[data-fieldname='job_card_detail']").find(".grid-remove-all-rows").hide();

		frm.trigger('validate_pending_tasks');
	},
	validate_pending_tasks: (frm) => {
		let pending_tasks = frm.doc.job_card_detail.filter(d => d.pause_datetime && !d.end_datetime);
		if (pending_tasks.length > 0) {
			frm.set_df_property('create_sickbed_job_card', 'hidden', 0);
		}
	},
	create_sickbed_job_card: (frm) => {
		frappe.call({
			method: 'gf.api.api.create_sickbed_job_card',
			args: {
				doc_type: frm.doc.doctype,
				doc_name: frm.doc.name,
			},
			freeze: true,
			callback: (r) => {
				if (r.message) {
					frappe.show_alert({
						message: __('Sickbed Job Card {0} created successfully', [r.message]),
						indicator: 'green'
					});
				}
			}
		});
	},
	create_body_shop_job_card: (frm) => {
		frappe.call({
			method: 'gf.api.api.create_body_shop_or_qc_card',
			args: {
				doc_type: frm.doc.doctype,
				doc_name: frm.doc.name,
				card_type: "Bodyshop Job Card"
			},
			freeze: true,
			callback: (r) => {
				if (r.message) {
					frappe.show_alert({
						message: __('Bodyshop Job Card {0} created successfully', [r.message]),
						indicator: 'green'
					});
				}
			}
		}); 
	},
	create_quality_check_job_card: (frm) => {
		frappe.call({
			method: 'gf.api.api.create_body_shop_or_qc_card',
			args: {
				doc_type: frm.doc.doctype,
				doc_name: frm.doc.name,
				card_type: "Quality Check Job Card"
			},
			freeze: true,
			callback: (r) => {
				if (r.message) {
					frappe.show_alert({
						message: __('Quality Check Job Card {0} created successfully', [r.message]),
						indicator: 'green'
					});
				}
			}
		});
	},
});


frappe.ui.form.on('Assembly Job Card Detail', {
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
		
		let row = frappe.get_doc(cdt, cdn);
		if (row.start_datetime && row.pause_datetime) {
			let time_elapsed = frappe.datetime.get_diff(row.pause_datetime, row.start_datetime);
			frappe.model.set_value(cdt, cdn, 'time_elapsed', time_elapsed);
		}
		frm.refresh_field('job_card_detail');
		frm.save();
	},
	end: (frm, cdt, cdn) => {
		frappe.model.set_value(cdt, cdn, 'end_datetime', frappe.datetime.now_datetime())

		let row = frappe.get_doc(cdt, cdn);
		console.log(row);
		if (row.start_datetime && row.end_datetime) {
			let time_elapsed = frappe.datetime.get_diff(row.end_datetime, row.start_datetime);
			console.log(time_elapsed);
			frappe.model.set_value(cdt, cdn, 'time_elapsed', time_elapsed)
		}
		frm.refresh_field('job_card_detail');
		frm.save();
	},
});

