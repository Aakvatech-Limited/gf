// Copyright (c) 2024, Aakvatech and contributors
// For license information, please see license.txt

frappe.ui.form.on('Assembly Work Order', {
	refresh: function(frm) {
		frm.trigger("disable_submit");
		frm.trigger("set_filters");
		frm.trigger("validate_stock");
		frm.trigger("transfer_stock");
	},
	onload: (frm) => {
		frm.trigger("disable_submit");
		frm.trigger("set_filters");
		frm.trigger("validate_stock");
		frm.trigger("transfer_stock");

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
		frm.set_query("cab_line_warehouse", () => {
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
	},
	disable_submit: (frm) => {
		if (!frm.doc.stock_entry) {
			frm.page.clear_primary_action()
		}
	},
	validate_stock: (frm) => {
		if (frm.doc.docstatus == 0) {
			frm.add_custom_button(__("Validate Stock"), () => {
				show_dialog(frm);
			});
		}
	},
	transfer_stock: (frm) => {
		if (frm.doc.docstatus == 0 && !frm.doc.stock_entry) {
			frm.add_custom_button(__("Transfer Stock"), () => {
				frappe.call({
					method: "gf.gf.doctype.assembly_work_order.assembly_work_order.enqueue_material_transfer",
					args: {
						doc_type: frm.doc.doctype,
						doc_name: frm.doc.name
					},
					callback: (r) => {
					}
				});
			});
        }
	},
});

var show_dialog = (frm) => {
	let d = new frappe.ui.Dialog({
		title: "Select Parts",
		fields: [
			{
				fieldname: "result_area",
				fieldtype: "HTML"
			}
		]
	});
	var $wrapper;
	var $results;
	var $placeholder;

	let columns = (["type", "item_code", "uom", "available_qty", "qty_needed"])
	frappe.call({
		method: "validate_stock_for_bom_items",
		doc: frm.doc,
		args: {},
		freeze: true,
		freeze_message: __("Checking Stock..."),
		callback: (r) => {
			if (r.message.length > 0) {
				let data = r.message;
				$results.append(make_list_row(columns, true));
				for (let i = 0; i < data.length; i++) {
					$results.append(make_list_row(columns, true, data[i]));
				}
			} else {
				$results.append($placeholder);
			}
		}
	});
	$wrapper = d.fields_dict.result_area.$wrapper.append(`<div class="results" 
		style="border: 1px solid #d1d8dd; border-radius: 3px; height: 500px; overflow: auto;"></div>`);
	$results = $wrapper.find('.results');
	$placeholder = $(`<div class="multiselect-empty-state">
				<span class="text-center" style="margin-top: -40px;">
					<i class="fa fa-2x fa-heartbeat text-extra-muted"></i>
					<p class="text-extra-muted">No Missing Stock</p>
				</span>
			</div>`);
	$results.on('click', '.list-item--head :checkbox', (e) => {
		$results.find('.list-item-container .list-row-check')
			.prop("checked", ($(e.target).is(':checked')));
	});
	set_primary_action(frm, d, $results, true);
	d.$wrapper.find('.modal-content').css('width', '650px');
	d.show();
};

var make_list_row = function (columns, item, result = {}) {
	var me = this;
	// Make a head row by default (if result not passed)
	let head = Object.keys(result).length === 0;
	let contents = ``;
	columns.forEach(function (column) {
		contents += `<div class="list-item__content ellipsis">
			${head ? `<span class="ellipsis"><b>${__(frappe.model.unscrub(column))}</b></span>`

				: (column !== "name" ? `<span class="ellipsis">${__(result[column])}</span>`
					: `<a class="list-id ellipsis">${__(result[column])}</a>`)
			}
		</div>`;
	});

	let $row = $(`<div class="list-item">
		<div class="list-item__content" style="flex: 0 0 10px;">
			<input type="checkbox" class="list-row-check" ${result.checked ? 'checked' : ''}>
		</div>
		${contents}
	</div>`);

	$row = list_row_items(head, $row, result, item);
	return $row;
};


var list_row_items = function (head, $row, result, item) {
	if (item) {
		head ? $row.addClass('list-item--head')
			: $row = $(`<div class="list-item-container"
				data-type = "${result.type}"
				data-item_code = "${result.item_code}"
				data-uom = "${result.uom}"
				data-available_qty = "${result.available_qty}"
				data-qty_needed = "${result.qty_needed}"
			</div>`).append($row);
	}
	return $row;
};


var set_primary_action = function (frm, d, $results, item) {
	var me = this;
	d.set_primary_action(__('Create Stock Entry'), function () {
		let checked_items = get_checked_items($results, frm);
		if (checked_items.length > 0) {
			add_to_line(frm, checked_items, item);
			d.hide();
		} else {
			frappe.show_alert("Select atleast one item");
		}
	});
};


var get_checked_items = function ($results, frm) {
	return $results.find('.list-item-container').map(function () {
		let checked_items = {};
		if ($(this).find(".list-row-check:checkbox:checked").length > 0) {
			checked_items["type"] = $(this).attr("data-type");
			checked_items["item_code"] = $(this).attr("data-item_code");
			checked_items["uom"] = $(this).attr("data-uom");
			checked_items["qty"] = $(this).attr("data-qty_needed");
			checked_items["t_warehouse"] = frm.doc.default_source_warehouse;
			return checked_items;
		}
	}).get();
};


var add_to_line = function (frm, checked_items, item) {
	if (item) {
		frappe.call({
			method: "create_stock_entry",
			doc: frm.doc,
			args: {
				purpose: "Material Receipt",
				items: checked_items
			},
			freeze: true,
			freeze_message: __("Creating stock entry..."),
			callback: function (r) {
			}
		});
	}
};
