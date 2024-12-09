// Copyright (c) 2024, Aakvatech and contributors
// For license information, please see license.txt

frappe.ui.form.on('Assembly Job Card', {
	refresh: (frm) =>{
		frm.trigger("set_filters");
		frm.trigger("hide_add_remoe_btns");
	},
	onload: (frm) => {
		frm.trigger("set_filters");
		frm.trigger("hide_add_remoe_btns");
	},
	set_filters: (frm) => {
		frm.set_query('eol_check_list', () => {
			return {
				filters: {
					'type': 'EOL'
				}
			}
		});

		frm.set_query('bs_checklist', () => {
			return {
				filters: {
					'type': 'Body'
				}
			}
		});
	},
	hide_add_remoe_btns: (frm) => {
		// hide button to add rows
		frm.get_field("assembly_job_detail").grid.cannot_add_rows = true;
		frm.get_field("cabinet_job_detail").grid.cannot_add_rows = true;
		frm.get_field("sickbay_job_detail").grid.cannot_add_rows = true;
		frm.get_field("qc_defect_detail").grid.cannot_add_rows = true;

		// hide button to delete rows
		$("*[data-fieldname='assembly_job_detail']").find(".grid-remove-rows").hide();
		$("*[data-fieldname='assembly_job_detail']").find(".grid-remove-all-rows").hide();

		$("*[data-fieldname='cabinet_job_detail']").find(".grid-remove-rows").hide();
		$("*[data-fieldname='cabinet_job_detail']").find(".grid-remove-all-rows").hide();

		$("*[data-fieldname='sickbay_job_detail']").find(".grid-remove-rows").hide();
		$("*[data-fieldname='sickbay_job_detail']").find(".grid-remove-all-rows").hide();
		
		$("*[data-fieldname='qc_defect_detail']").find(".grid-remove-rows").hide();
		$("*[data-fieldname='qc_defect_detail']").find(".grid-remove-all-rows").hide();
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
	eol_check_list: (frm) => {
		if (frm.doc.eol_check_list) {
			frappe.call({
				method: 'get_checklist',
				doc: frm.doc,
				args: {
					checklist_id: frm.doc.eol_check_list,
				},
				callback: (r) => {
					if (r.message) {
						frm.clear_table('quality_check_detail');

						r.message.forEach((element) => {
							frm.add_child('quality_check_detail', {
                                'task': element.task,
                            });
						});
						frm.refresh_field('quality_check_detail');
					}
				}
			});
		} else {
			frm.clear_table('quality_check_detail');
			frm.refresh_field('quality_check_detail');
		}
	},
	bs_checklist: (frm) => {
		if (frm.doc.bs_checklist) {
			frappe.call({
				method: 'get_checklist',
				doc: frm.doc,
				args: {
					checklist_id: frm.doc.bs_checklist,
				},
				callback: (r) => {
					if (r.message) {
						frm.clear_table('bodyshop_qc_detail');

						r.message.forEach((element) => {
							frm.add_child('bodyshop_qc_detail', {
                                'task': element.task,
                            });
						});
						frm.refresh_field('bodyshop_qc_detail');
					}
				}
			});
		} else {
			frm.clear_table('bodyshop_qc_detail');
			frm.refresh_field('bodyshop_qc_detail');
		}
	},
});


frappe.ui.form.on('Assembly Job Card Detail', {
	form_render: (frm, cdt, cdn) => {
		frm.fields_dict.assembly_job_detail.grid.wrapper.find('.grid-delete-row').hide();
		frm.fields_dict.assembly_job_detail.grid.wrapper.find('.grid-insert-row-below').hide();
		frm.fields_dict.assembly_job_detail.grid.wrapper.find('.grid-insert-row').hide();
		frm.fields_dict.assembly_job_detail.grid.wrapper.find('.grid-duplicate-row').hide();
		frm.fields_dict.assembly_job_detail.grid.wrapper.find('.grid-move-row').hide();
	},
	start: (frm, cdt, cdn) => {
		frappe.model.set_value(cdt, cdn, 'start_datetime', frappe.datetime.now_datetime())
		frm.refresh_field('assembly_job_detail');
		frm.set_value('status', 'Assembly');
		frm.save();
	},
	pending: (frm, cdt, cdn) => {
		frappe.model.set_value(cdt, cdn, 'pending_datetime', frappe.datetime.now_datetime())
		
		let row = frappe.get_doc(cdt, cdn);
		if (row.start_datetime && row.pending_datetime) {
			let assembly_p_total_time_elapsed = frappe.datetime.get_diff(row.pending_datetime, row.start_datetime);
			frappe.model.set_value(cdt, cdn, 'total_time_elapsed', assembly_p_total_time_elapsed);
		}
		frm.refresh_field('assembly_job_detail');
		frm.set_value('status', 'Assembly');
		if (row.pending_tasks) {
			frm.save();
		}
	},
	end: (frm, cdt, cdn) => {
		frappe.model.set_value(cdt, cdn, 'end_datetime', frappe.datetime.now_datetime())

		let row = frappe.get_doc(cdt, cdn);
		if (row.start_datetime && row.end_datetime) {
			let assmbly_end_total_time_elapsed = frappe.datetime.get_diff(row.end_datetime, row.start_datetime);
			frappe.model.set_value(cdt, cdn, 'total_time_elapsed', assmbly_end_total_time_elapsed)
		}
		frm.refresh_field('assembly_job_detail');
		frm.set_value('status', 'Assembly');
		frm.save();
	},
});


frappe.ui.form.on('Cabinet Job Card Detail', {
	form_render: (frm, cdt, cdn) => {
        frm.fields_dict.cabinet_job_detail.grid.wrapper.find('.grid-delete-row').hide();
        frm.fields_dict.cabinet_job_detail.grid.wrapper.find('.grid-insert-row-below').hide();
        frm.fields_dict.cabinet_job_detail.grid.wrapper.find('.grid-insert-row').hide();
        frm.fields_dict.cabinet_job_detail.grid.wrapper.find('.grid-duplicate-row').hide();
        frm.fields_dict.cabinet_job_detail.grid.wrapper.find('.grid-move-row').hide();
    },
	start: (frm, cdt, cdn) => {
		frappe.model.set_value(cdt, cdn, 'start_datetime', frappe.datetime.now_datetime());
		frm.refresh_field('cabinet_job_detail');
		frm.set_value('status', 'Cabinet');
		frm.save();
	},	
	pending: (frm, cdt, cdn) => {
		frappe.model.set_value(cdt, cdn, 'pending_datetime', frappe.datetime.now_datetime());

        let row = frappe.get_doc(cdt, cdn);
		if (row.start_datetime && row.pending_datetime) {
			let cab_p_time_elapsed = frappe.datetime.get_diff(row.pending_datetime, row.start_datetime);
			frappe.model.set_value(cdt, cdn, 'total_time_elapsed', cab_p_time_elapsed);
		}

        frm.refresh_field('cabinet_job_detail');
		frm.set_value('status', 'Cabinet');
		if (row.pending_tasks) {
			frm.save();
		}
    },
	end: (frm, cdt, cdn) => {
		frappe.model.set_value(cdt, cdn, 'end_datetime', frappe.datetime.now_datetime());

		let row = frappe.get_doc(cdt, cdn);
		if (row.start_datetime && row.end_datetime) {
			let cab_end_total_time_elapsed = frappe.datetime.get_diff(row.end_datetime, row.start_datetime);
			frappe.model.set_value(cdt, cdn, 'total_time_elapsed', cab_end_total_time_elapsed);
		}

        frm.refresh_field('cabinet_job_detail');
		frm.set_value('status', 'Cabinet');
        frm.save();
	},
});


frappe.ui.form.on('Bodyshop Job Card Detail', {
	form_render: (frm, cdt, cdn) => {
		frm.fields_dict.bodyshop_job_detail.grid.wrapper.find('.grid-delete-row').hide();
		frm.fields_dict.bodyshop_job_detail.grid.wrapper.find('.grid-insert-row-below').hide();
		frm.fields_dict.bodyshop_job_detail.grid.wrapper.find('.grid-insert-row').hide();
		frm.fields_dict.bodyshop_job_detail.grid.wrapper.find('.grid-duplicate-row').hide();
		frm.fields_dict.bodyshop_job_detail.grid.wrapper.find('.grid-move-row').hide();
	},
	start: (frm, cdt, cdn) => {
		frappe.model.set_value(cdt, cdn, 'start_datetime', frappe.datetime.now_datetime())
		frm.refresh_field('bodyshop_job_detail');
		frm.set_value('status', 'Bodyshop');
		frm.save();
	},
	pending: (frm, cdt, cdn) => {
		frappe.model.set_value(cdt, cdn, 'pending_datetime', frappe.datetime.now_datetime())
		
		let row = frappe.get_doc(cdt, cdn);
		if (row.start_datetime && row.pending_datetime) {
			let body_p_total_time_elapsed = frappe.datetime.get_diff(row.pending_datetime, row.start_datetime);
			frappe.model.set_value(cdt, cdn, 'total_time_elapsed', body_p_total_time_elapsed);
		}
		frm.refresh_field('bodyshop_job_detail');
		frm.set_value('status', 'Bodyshop');
		frm.save();
	},
	end: (frm, cdt, cdn) => {
		frappe.model.set_value(cdt, cdn, 'end_datetime', frappe.datetime.now_datetime())

		let row = frappe.get_doc(cdt, cdn);
		if (row.start_datetime && row.end_datetime) {
			let body_end_total_time_elapsed = frappe.datetime.get_diff(row.end_datetime, row.start_datetime);
			frappe.model.set_value(cdt, cdn, 'total_time_elapsed', body_end_total_time_elapsed)
		}
		frm.refresh_field('bodyshop_job_detail');
		frm.set_value('status', 'Bodyshop');
		frm.save();
	},
});


frappe.ui.form.on('Sickbay Job Card Detail', {
	form_render: (frm, cdt, cdn) => {
        frm.fields_dict.sickbay_job_detail.grid.wrapper.find('.grid-delete-row').hide();
        frm.fields_dict.sickbay_job_detail.grid.wrapper.find('.grid-insert-row-below').hide();
        frm.fields_dict.sickbay_job_detail.grid.wrapper.find('.grid-insert-row').hide();
        frm.fields_dict.sickbay_job_detail.grid.wrapper.find('.grid-duplicate-row').hide();
        frm.fields_dict.sickbay_job_detail.grid.wrapper.find('.grid-move-row').hide();
    },
	start: (frm, cdt, cdn) => {
		frappe.model.set_value(cdt, cdn, 'start_datetime', frappe.datetime.now_datetime());
		frm.refresh_field('sickbay_job_detail');
		frm.set_value('status', 'Sickbay');
		frm.save();
	},
	end: (frm, cdt, cdn) => {
		let row = frappe.get_doc(cdt, cdn);
		let now_datetime = frappe.datetime.now_datetime();

		frappe.model.set_value(row.doctype, row.name, 'end_datetime', now_datetime);
		if (row.ref_doctype && row.ref_docname) {
			frappe.model.set_value(row.ref_doctype, row.ref_docname, 'end_datetime', now_datetime);
		}
		frm.refresh_field('sickbay_job_detail');
		frm.set_value('status', 'Sickbay');
		frm.save();
	},
})


frappe.ui.form.on('Job Card QC Detail', {
	status: (frm, cdt, cdn) => {
		frm.set_value('status', 'QC');
		let row = frappe.get_doc(cdt, cdn);
		row.worked_by = frappe.session.user_fullname
		frm.refresh_field('worked_by');
	},
})


frappe.ui.form.on('Bodyshop QC Detail', {
	status: (frm, cdt, cdn) => {
		frm.set_value('status', 'QC');
		let row = frappe.get_doc(cdt, cdn);
		row.worked_by = frappe.session.user_fullname
		frm.refresh_field('worked_by');
	},
})


frappe.ui.form.on('QC Defect Detail', {
	form_render: (frm, cdt, cdn) => {
        frm.fields_dict.sickbay_job_detail.grid.wrapper.find('.grid-delete-row').hide();
        frm.fields_dict.sickbay_job_detail.grid.wrapper.find('.grid-insert-row-below').hide();
        frm.fields_dict.sickbay_job_detail.grid.wrapper.find('.grid-insert-row').hide();
        frm.fields_dict.sickbay_job_detail.grid.wrapper.find('.grid-duplicate-row').hide();
        frm.fields_dict.sickbay_job_detail.grid.wrapper.find('.grid-move-row').hide();
    },
	status: (frm, cdt, cdn) => {
		frm.set_value('status', 'QC');
		let row = frappe.get_doc(cdt, cdn);
		row.worked_by = frappe.session.user_fullname
		frm.refresh_field('worked_by');
	},
})