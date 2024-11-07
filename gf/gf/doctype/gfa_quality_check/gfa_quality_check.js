// Copyright (c) 2024, Aakvatech and contributors
// For license information, please see license.txt

frappe.ui.form.on('GFA Quality Check', {
	// refresh: function(frm) {

	// }
});


frappe.ui.form.on('GFA Quality Check Detail', {
	form_render: (frm, cdt, cdn) => {
		let row = locals[cdt][cdn];
		control_form_render_action(frm, row);
	},
	start: (frm, cdt, cdn) => {
		let row = locals[cdt][cdn];
		row.start_datetime = frappe.datetime.now_datetime();
		if (row.start_datetime) {
			control_start_action(frm, row, caller=true);
		}
	},
	end: (frm, cdt, cdn) => {
		let row = locals[cdt][cdn];
		row.end_datetime = frappe.datetime.now_datetime();
		if (row.end_datetime) {
			control_end_action(frm, row, caller=true);
		}
	},
});

var control_start_action = (frm, row, caller=false) => {
	frm.fields_dict['job_card_detail'].grid.toggle_enable('start', false);
	frm.fields_dict['job_card_detail'].grid.toggle_display(['start'], false);
	
	frm.fields_dict['job_card_detail'].grid.toggle_enable('end', true);
	frm.fields_dict['job_card_detail'].grid.toggle_display(['end'], true);

	frm.refresh_field('job_card_detail');
	if (frm.is_dirty() && caller) {
		frm.save();
	}
	
}

var control_end_action = (frm, row, caller=false) => {
	frm.fields_dict['job_card_detail'].grid.toggle_enable('start', false);
	frm.fields_dict['job_card_detail'].grid.toggle_display(['start'], false);

	frm.fields_dict['job_card_detail'].grid.toggle_enable('end', false);
	frm.fields_dict['job_card_detail'].grid.toggle_display(['end'], false);

	if (row.start_datetime && row.end_datetime) {
		let time_elapsed = frappe.datetime.get_diff(row.end_datetime, row.start_datetime);
		row.time_elapsed = time_elapsed;
	}

	frm.refresh_field('job_card_detail');
	if (frm.is_dirty() && caller) {
		frm.save();
	}
}

var control_form_render_action = (frm, row) => {
	if (row.start_datetime) {
		control_start_action(frm, row);
	}
	if (row.end_datetime) {
		control_end_action(frm, row);
	}
}