// Copyright (c) 2024, Aakvatech and contributors
// For license information, please see license.txt

frappe.ui.form.on('Assembly Job Card', {
	refresh: (frm) =>{
		frm.trigger("set_filters");
		frm.trigger("hide_add_remove_btns");
	},
	onload: (frm) => {
		frm.trigger("set_filters");
		frm.trigger("hide_add_remove_btns");
	},
	set_filters: (frm) => {
	},
	hide_add_remove_btns: (frm) => {
		// hide button to add rows
		frm.get_field("assembly_stations").grid.cannot_add_rows = true;
		frm.get_field("cab_stations").grid.cannot_add_rows = true;
		frm.get_field("sickbay_stations").grid.cannot_add_rows = true;
		frm.get_field("qc_defects").grid.cannot_add_rows = true;

		// hide button to delete rows
		$("*[data-fieldname='assembly_stations']").find(".grid-remove-rows").hide();
		$("*[data-fieldname='assembly_stations']").find(".grid-remove-all-rows").hide();

		$("*[data-fieldname='cab_stations']").find(".grid-remove-rows").hide();
		$("*[data-fieldname='cab_stations']").find(".grid-remove-all-rows").hide();

		$("*[data-fieldname='sickbay_stations']").find(".grid-remove-rows").hide();
		$("*[data-fieldname='sickbay_stations']").find(".grid-remove-all-rows").hide();
		
		$("*[data-fieldname='qc_defects']").find(".grid-remove-rows").hide();
		$("*[data-fieldname='qc_defects']").find(".grid-remove-all-rows").hide();
	},
	eol_qc_template: (frm) => {
		if (frm.doc.eol_qc_template) {
			frappe.call({
				method: 'get_checklist',
				doc: frm.doc,
				args: {
					checklist_id: frm.doc.eol_qc_template,
				},
				freeze: true,
				callback: (r) => {
					if (r.message) {
						frm.clear_table('eol_qc_checklist');
						r.message.forEach((element) => {
							frm.add_child('eol_qc_checklist', {
								'category': element.category,
                                'task': element.task,
                            });
						});
						frm.refresh_field('eol_qc_checklist');
					}
				}
			});
		} else {
			frm.clear_table('eol_qc_checklist');
			frm.refresh_field('eol_qc_checklist');
		}
	},
	assembly_qc_template: (frm) => {
		if (frm.doc.assembly_qc_template) {
			frappe.call({
				method: 'get_checklist',
				doc: frm.doc,
				args: {
					checklist_id: frm.doc.assembly_qc_template,
				},
				freeze: true,
				callback: (r) => {
					if (r.message) {
						frm.clear_table('assembly_qc_checklist');
						r.message.forEach((element) => {
							frm.add_child('assembly_qc_checklist', {
								'category': element.category,
                                'task': element.task,
                            });
						});
						frm.refresh_field('assembly_qc_checklist');
					}
				}
			});
		} else {
			frm.clear_table('assembly_qc_checklist');
			frm.refresh_field('assembly_qc_checklist');
		}
	},
	cab_qc_template: (frm) => {
		if (frm.doc.cab_qc_template) {
			frappe.call({
				method: 'get_checklist',
				doc: frm.doc,
				args: {
					checklist_id: frm.doc.cab_qc_template,
				},
				freeze: true,
				callback: (r) => {
					if (r.message) {
						frm.clear_table('cab_qc_checklist');
						r.message.forEach((element) => {
							frm.add_child('cab_qc_checklist', {
								'category': element.category,
                                'task': element.task,
                            });
						});
						frm.refresh_field('cab_qc_checklist');
					}
				}
			});
		} else {
			frm.clear_table('cab_qc_checklist');
			frm.refresh_field('cab_qc_checklist');
		}
	},
	engine_qc_template: (frm) => {
		if (frm.doc.engine_qc_template) {
			frappe.call({
				method: 'get_checklist',
				doc: frm.doc,
				args: {
					checklist_id: frm.doc.engine_qc_template,
				},
				freeze: true,
				callback: (r) => {
					if (r.message) {
						frm.clear_table('engine_qc_checklist');
						r.message.forEach((element) => {
							frm.add_child('engine_qc_checklist', {
								'category': element.category,
                                'task': element.task,
                            });
						});
						frm.refresh_field('engine_qc_checklist');
					}
				}
			});
		} else {
			frm.clear_table('engine_qc_checklist');
			frm.refresh_field('engine_qc_checklist');
		}
	},
	bs_ps_qc_template: (frm) => {
		if (frm.doc.bs_ps_qc_template) {
			frappe.call({
				method: 'get_checklist',
				doc: frm.doc,
				args: {
					checklist_id: frm.doc.bs_ps_qc_template,
				},
				freeze: true,
				callback: (r) => {
					if (r.message) {
						frm.clear_table('bs_ps_qc_checklist');
						r.message.forEach((element) => {
							frm.add_child('bs_ps_qc_checklist', {
								'category': element.category,
                                'task': element.task,
                            });
						});
						frm.refresh_field('bs_ps_qc_checklist');
					}
				}
			});
		} else {
			frm.clear_table('bs_ps_qc_checklist');
			frm.refresh_field('bs_ps_qc_checklist');
		}
	},
	sickbay_qc_template: (frm) => {
		if (frm.doc.sickbay_qc_template) {
			frappe.call({
				method: 'get_checklist',
				doc: frm.doc,
				args: {
					checklist_id: frm.doc.sickbay_qc_template,
				},
				freeze: true,
				callback: (r) => {
					if (r.message) {
						frm.clear_table('sickbay_qc_checklist');
						r.message.forEach((element) => {
							frm.add_child('sickbay_qc_checklist', {
								'category': element.category,
                                'task': element.task,
                            });
						});
						frm.refresh_field('sickbay_qc_checklist');
					}
				}
			});
		} else {
			frm.clear_table('sickbay_qc_checklist');
			frm.refresh_field('sickbay_qc_checklist');
		}
	},
});


frappe.ui.form.on('Assembly Job Card Detail', {
	form_render: (frm, cdt, cdn) => {
		frm.fields_dict.assembly_stations.grid.wrapper.find('.grid-delete-row').hide();
		frm.fields_dict.assembly_stations.grid.wrapper.find('.grid-insert-row-below').hide();
		frm.fields_dict.assembly_stations.grid.wrapper.find('.grid-insert-row').hide();
		frm.fields_dict.assembly_stations.grid.wrapper.find('.grid-duplicate-row').hide();
		frm.fields_dict.assembly_stations.grid.wrapper.find('.grid-move-row').hide();
	},
	start: (frm, cdt, cdn) => {
		frappe.model.set_value(cdt, cdn, 'start_datetime', frappe.datetime.now_datetime())
		let row = frappe.get_doc(cdt, cdn);
		if (row.station == 'EOL') {
			frm.set_value('enable_eol_qc', 1);
		}
		frm.refresh_field('assembly_stations');
		frm.set_value('status', 'Assembly');
		frm.save();
	},
	pause: (frm, cdt, cdn) => {
		frappe.model.set_value(cdt, cdn, 'pause_datetime', frappe.datetime.now_datetime())
		frm.refresh_field('assembly_stations');
		frm.set_value('status', 'Assembly');
		frm.save();
	},
	pause_reason: (frm, cdt, cdn) => {
		let row = frappe.get_doc(cdt, cdn);
		if (row.pause_datetime && row.pause_reason) {
			frm.save();
		}
	},
	resume: (frm, cdt, cdn) => {
		frappe.model.set_value(cdt, cdn, 'resume_datetime', frappe.datetime.now_datetime())
		let row = frappe.get_doc(cdt, cdn);
		if (row.pause_datetime && row.resume_datetime) {
			let resting_time = frappe.datetime.get_diff(row.resume_datetime, row.pause_datetime);
			frappe.model.set_value(cdt, cdn, 'resting_time', resting_time);
		}
		frm.refresh_field('assembly_stations');
		frm.set_value('status', 'Assembly');
		frm.save();
	},
	pending: (frm, cdt, cdn) => {
		frappe.model.set_value(cdt, cdn, 'pending_datetime', frappe.datetime.now_datetime())
		
		let row = frappe.get_doc(cdt, cdn);
		if (row.start_datetime && row.pending_datetime) {
			let assembly_p_total_time_elapsed = frappe.datetime.get_diff(row.pending_datetime, row.start_datetime);
			let resting_time = row.resting_time ? row.resting_time : 0;
			assembly_p_total_time_elapsed = assembly_p_total_time_elapsed - resting_time;
			frappe.model.set_value(cdt, cdn, 'total_time_elapsed', assembly_p_total_time_elapsed);
		}
		frm.refresh_field('assembly_stations');
		frm.set_value('status', 'Assembly');
		if (row.pending_tasks) {
			frm.save();
		}
	},
	pending_tasks: (frm, cdt, cdn) => {
		let row = frappe.get_doc(cdt, cdn);
		// row.
	},
	end: (frm, cdt, cdn) => {
		frappe.model.set_value(cdt, cdn, 'end_datetime', frappe.datetime.now_datetime())

		let row = frappe.get_doc(cdt, cdn);
		if (row.start_datetime && row.end_datetime) {
			let assmbly_end_total_time_elapsed = frappe.datetime.get_diff(row.end_datetime, row.start_datetime);
			let resting_time = row.resting_time ? row.resting_time : 0;
			assmbly_end_total_time_elapsed = assmbly_end_total_time_elapsed - resting_time;
			frappe.model.set_value(cdt, cdn, 'total_time_elapsed', assmbly_end_total_time_elapsed)
		}
		frm.refresh_field('assembly_stations');
		frm.set_value('status', 'Assembly');
		frm.save();
	},
});


frappe.ui.form.on('Cab Job Card Detail', {
	form_render: (frm, cdt, cdn) => {
        frm.fields_dict.cab_stations.grid.wrapper.find('.grid-delete-row').hide();
        frm.fields_dict.cab_stations.grid.wrapper.find('.grid-insert-row-below').hide();
        frm.fields_dict.cab_stations.grid.wrapper.find('.grid-insert-row').hide();
        frm.fields_dict.cab_stations.grid.wrapper.find('.grid-duplicate-row').hide();
        frm.fields_dict.cab_stations.grid.wrapper.find('.grid-move-row').hide();
    },
	start: (frm, cdt, cdn) => {
		frappe.model.set_value(cdt, cdn, 'start_datetime', frappe.datetime.now_datetime());
		frm.refresh_field('cab_stations');
		frm.set_value('status', 'Cab');
		frm.save();
	},
	pause: (frm, cdt, cdn) => {
		frappe.model.set_value(cdt, cdn, 'pause_datetime', frappe.datetime.now_datetime())
		frm.refresh_field('cab_stations');
		frm.set_value('status', 'Cab');
		frm.save();
	},
	pause_reason: (frm, cdt, cdn) => {
		let row = frappe.get_doc(cdt, cdn);
		if (row.pause_datetime && row.pause_reason) {
			frm.save();
		}
	},
	resume: (frm, cdt, cdn) => {
		frappe.model.set_value(cdt, cdn, 'resume_datetime', frappe.datetime.now_datetime())
		let row = frappe.get_doc(cdt, cdn);
		if (row.pause_datetime && row.resume_datetime) {
			let resting_time = frappe.datetime.get_diff(row.resume_datetime, row.pause_datetime);
			frappe.model.set_value(cdt, cdn, 'resting_time', resting_time);
		}
		frm.refresh_field('cab_stations');
		frm.set_value('status', 'Cab');
		frm.save();
	},
	pending: (frm, cdt, cdn) => {
		frappe.model.set_value(cdt, cdn, 'pending_datetime', frappe.datetime.now_datetime());

        let row = frappe.get_doc(cdt, cdn);
		if (row.start_datetime && row.pending_datetime) {
			let cab_p_time_elapsed = frappe.datetime.get_diff(row.pending_datetime, row.start_datetime);
			let resting_time = row.resting_time ? row.resting_time : 0;
			cab_p_time_elapsed = cab_p_time_elapsed - resting_time;
			frappe.model.set_value(cdt, cdn, 'total_time_elapsed', cab_p_time_elapsed);
		}

        frm.refresh_field('cab_stations');
		frm.set_value('status', 'Cab');
		if (row.pending_tasks) {
			frm.save();
		}
    },
	end: (frm, cdt, cdn) => {
		frappe.model.set_value(cdt, cdn, 'end_datetime', frappe.datetime.now_datetime());

		let row = frappe.get_doc(cdt, cdn);
		if (row.start_datetime && row.end_datetime) {
			let cab_end_total_time_elapsed = frappe.datetime.get_diff(row.end_datetime, row.start_datetime);
			let resting_time = row.resting_time ? row.resting_time : 0;
			cab_end_total_time_elapsed = cab_end_total_time_elapsed - resting_time;
			frappe.model.set_value(cdt, cdn, 'total_time_elapsed', cab_end_total_time_elapsed);
		}

        frm.refresh_field('cab_stations');
		frm.set_value('status', 'Cab');
        frm.save();
	},
});

frappe.ui.form.on('Engine Job Card Detail', {
	form_render: (frm, cdt, cdn) => {
        frm.fields_dict.engine_stations.grid.wrapper.find('.grid-delete-row').hide();
        frm.fields_dict.engine_stations.grid.wrapper.find('.grid-insert-row-below').hide();
        frm.fields_dict.engine_stations.grid.wrapper.find('.grid-insert-row').hide();
        frm.fields_dict.engine_stations.grid.wrapper.find('.grid-duplicate-row').hide();
        frm.fields_dict.engine_stations.grid.wrapper.find('.grid-move-row').hide();
    },
	start: (frm, cdt, cdn) => {
		frappe.model.set_value(cdt, cdn, 'start_datetime', frappe.datetime.now_datetime());
		frm.refresh_field('engine_stations');
		frm.set_value('status', 'Engine');
		frm.save();
	},
	pause: (frm, cdt, cdn) => {
		frappe.model.set_value(cdt, cdn, 'pause_datetime', frappe.datetime.now_datetime())
		frm.refresh_field('engine_stations');
		frm.set_value('status', 'Engine');
		frm.save();
	},
	pause_reason: (frm, cdt, cdn) => {
		let row = frappe.get_doc(cdt, cdn);
		if (row.pause_datetime && row.pause_reason) {
			frm.save();
		}
	},
	resume: (frm, cdt, cdn) => {
		frappe.model.set_value(cdt, cdn, 'resume_datetime', frappe.datetime.now_datetime())
		let row = frappe.get_doc(cdt, cdn);
		if (row.pause_datetime && row.resume_datetime) {
			let resting_time = frappe.datetime.get_diff(row.resume_datetime, row.pause_datetime);
			frappe.model.set_value(cdt, cdn, 'resting_time', resting_time);
		}
		frm.refresh_field('engine_stations');
		frm.set_value('status', 'Engine');
		frm.save();
	},
	pending: (frm, cdt, cdn) => {
		frappe.model.set_value(cdt, cdn, 'pending_datetime', frappe.datetime.now_datetime());

        let row = frappe.get_doc(cdt, cdn);
		if (row.start_datetime && row.pending_datetime) {
			let engine_p_time_elapsed = frappe.datetime.get_diff(row.pending_datetime, row.start_datetime);
			let resting_time = row.resting_time ? row.resting_time : 0;
			engine_p_time_elapsed = engine_p_time_elapsed - resting_time;
			frappe.model.set_value(cdt, cdn, 'total_time_elapsed', engine_p_time_elapsed);
		}

        frm.refresh_field('engine_stations');
		frm.set_value('status', 'Engine');
		if (row.pending_tasks) {
			frm.save();
		}
    },
	end: (frm, cdt, cdn) => {
		frappe.model.set_value(cdt, cdn, 'end_datetime', frappe.datetime.now_datetime());

		let row = frappe.get_doc(cdt, cdn);
		if (row.start_datetime && row.end_datetime) {
			let engine_end_total_time_elapsed = frappe.datetime.get_diff(row.end_datetime, row.start_datetime);
			let resting_time = row.resting_time ? row.resting_time : 0;
			engine_end_total_time_elapsed = engine_end_total_time_elapsed - resting_time;
			frappe.model.set_value(cdt, cdn, 'total_time_elapsed', engine_end_total_time_elapsed);
		}

        frm.refresh_field('engine_stations');
		frm.set_value('status', 'Engine');
        frm.save();
	},
});


frappe.ui.form.on('Bodyshop Job Card Detail', {
	form_render: (frm, cdt, cdn) => {
		frm.fields_dict.bs_ps_stations.grid.wrapper.find('.grid-delete-row').hide();
		frm.fields_dict.bs_ps_stations.grid.wrapper.find('.grid-insert-row-below').hide();
		frm.fields_dict.bs_ps_stations.grid.wrapper.find('.grid-insert-row').hide();
		frm.fields_dict.bs_ps_stations.grid.wrapper.find('.grid-duplicate-row').hide();
		frm.fields_dict.bs_ps_stations.grid.wrapper.find('.grid-move-row').hide();
	},
	start: (frm, cdt, cdn) => {
		frappe.model.set_value(cdt, cdn, 'start_datetime', frappe.datetime.now_datetime())
		frm.refresh_field('bs_ps_stations');
		frm.set_value('status', 'Bodyshop');
		frm.save();
	},
	pause: (frm, cdt, cdn) => {
		frappe.model.set_value(cdt, cdn, 'pause_datetime', frappe.datetime.now_datetime())
		frm.refresh_field('bs_ps_stations');
		frm.set_value('status', 'Bodyshop');
		frm.save();
	},
	pause_reason: (frm, cdt, cdn) => {
		let row = frappe.get_doc(cdt, cdn);
		if (row.pause_datetime && row.pause_reason) {
			frm.save();
		}
	},
	resume: (frm, cdt, cdn) => {
		frappe.model.set_value(cdt, cdn, 'resume_datetime', frappe.datetime.now_datetime())
		let row = frappe.get_doc(cdt, cdn);
		if (row.pause_datetime && row.resume_datetime) {
			let resting_time = frappe.datetime.get_diff(row.resume_datetime, row.pause_datetime);
			frappe.model.set_value(cdt, cdn, 'resting_time', resting_time);
		}
		frm.refresh_field('bs_ps_stations');
		frm.set_value('status', 'Bodyshop');
		frm.save();
	},
	pending: (frm, cdt, cdn) => {
		frappe.model.set_value(cdt, cdn, 'pending_datetime', frappe.datetime.now_datetime())
		
		let row = frappe.get_doc(cdt, cdn);
		if (row.start_datetime && row.pending_datetime) {
			let body_p_total_time_elapsed = frappe.datetime.get_diff(row.pending_datetime, row.start_datetime);
			let resting_time = row.resting_time ? row.resting_time : 0;
			body_p_total_time_elapsed = body_p_total_time_elapsed - resting_time;
			frappe.model.set_value(cdt, cdn, 'total_time_elapsed', body_p_total_time_elapsed);
		}
		frm.refresh_field('bs_ps_stations');
		frm.set_value('status', 'Bodyshop');
		frm.save();
	},
	end: (frm, cdt, cdn) => {
		frappe.model.set_value(cdt, cdn, 'end_datetime', frappe.datetime.now_datetime())

		let row = frappe.get_doc(cdt, cdn);
		if (row.start_datetime && row.end_datetime) {
			let body_end_total_time_elapsed = frappe.datetime.get_diff(row.end_datetime, row.start_datetime);
			let resting_time = row.resting_time ? row.resting_time : 0;
			body_end_total_time_elapsed = body_end_total_time_elapsed - resting_time;
			frappe.model.set_value(cdt, cdn, 'total_time_elapsed', body_end_total_time_elapsed)
		}
		frm.refresh_field('bs_ps_stations');
		frm.set_value('status', 'Bodyshop');
		frm.save();
	},
});


frappe.ui.form.on('Sickbay Job Card Detail', {
	form_render: (frm, cdt, cdn) => {
        frm.fields_dict.sickbay_stations.grid.wrapper.find('.grid-delete-row').hide();
        frm.fields_dict.sickbay_stations.grid.wrapper.find('.grid-insert-row-below').hide();
        frm.fields_dict.sickbay_stations.grid.wrapper.find('.grid-insert-row').hide();
        frm.fields_dict.sickbay_stations.grid.wrapper.find('.grid-duplicate-row').hide();
        frm.fields_dict.sickbay_stations.grid.wrapper.find('.grid-move-row').hide();
    },
	start: (frm, cdt, cdn) => {
		frappe.model.set_value(cdt, cdn, 'start_datetime', frappe.datetime.now_datetime());
		frm.refresh_field('sickbay_stations');
		frm.set_value('status', 'Sickbay');
		frm.save();
	},
	pause: (frm, cdt, cdn) => {
		frappe.model.set_value(cdt, cdn, 'pause_datetime', frappe.datetime.now_datetime())
		frm.refresh_field('sickbay_stations');
		frm.set_value('status', 'Sickbay');
		frm.save();
	},
	pause_reason: (frm, cdt, cdn) => {
		let row = frappe.get_doc(cdt, cdn);
		if (row.pause_datetime && row.pause_reason) {
			frm.save();
		}
	},
	resume: (frm, cdt, cdn) => {
		frappe.model.set_value(cdt, cdn, 'resume_datetime', frappe.datetime.now_datetime())
		let row = frappe.get_doc(cdt, cdn);
		if (row.pause_datetime && row.resume_datetime) {
			let resting_time = frappe.datetime.get_diff(row.resume_datetime, row.pause_datetime);
			frappe.model.set_value(cdt, cdn, 'resting_time', resting_time);
		}
		frm.refresh_field('sickbay_stations');
		frm.set_value('status', 'Sickbay');
		frm.save();
	},
	end: (frm, cdt, cdn) => {
		let now_datetime = frappe.datetime.now_datetime();
		frappe.model.set_value(cdt, cdn, 'end_datetime', now_datetime)

		let row = frappe.get_doc(cdt, cdn);
		if (row.start_datetime && row.end_datetime) {
			let sickbay_end_total_time_elapsed = frappe.datetime.get_diff(row.end_datetime, row.start_datetime);
			let resting_time = row.resting_time ? row.resting_time : 0;
			sickbay_end_total_time_elapsed = sickbay_end_total_time_elapsed - resting_time;
			frappe.model.set_value(cdt, cdn, 'total_time_elapsed', sickbay_end_total_time_elapsed)
		}

		if (row.ref_doctype && row.ref_docname) {
			frappe.model.set_value(row.ref_doctype, row.ref_docname, 'end_datetime', now_datetime);
		}
		frm.refresh_field('sickbay_stations');
		frm.set_value('status', 'Sickbay');
		frm.save();
	},
})

frappe.ui.form.on('EOL QC Detail', {
	status: (frm, cdt, cdn) => {
		frm.set_value('status', 'QC');
		let row = frappe.get_doc(cdt, cdn);
		row.worked_by = frappe.session.user_fullname
		frm.refresh_field('worked_by');
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

frappe.ui.form.on('Cab QC Detail', {
	status: (frm, cdt, cdn) => {
		frm.set_value('status', 'QC');
		let row = frappe.get_doc(cdt, cdn);
		row.worked_by = frappe.session.user_fullname
		frm.refresh_field('worked_by');
	},
})

frappe.ui.form.on('Engine QC Detail', {
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
        frm.fields_dict.qc_defects.grid.wrapper.find('.grid-delete-row').hide();
        frm.fields_dict.qc_defects.grid.wrapper.find('.grid-insert-row-below').hide();
        frm.fields_dict.qc_defects.grid.wrapper.find('.grid-insert-row').hide();
        frm.fields_dict.qc_defects.grid.wrapper.find('.grid-duplicate-row').hide();
        frm.fields_dict.qc_defects.grid.wrapper.find('.grid-move-row').hide();
    },
	status: (frm, cdt, cdn) => {
		frm.set_value('status', 'QC');
		let row = frappe.get_doc(cdt, cdn);
		row.worked_by = frappe.session.user_fullname
		frm.refresh_field('worked_by');
	},
})